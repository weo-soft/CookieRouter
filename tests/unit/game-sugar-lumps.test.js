/**
 * Unit tests for Sugar Lump mechanics in Game class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../../src/js/game.js';
import { loadVersionById } from '../../src/js/utils/version-loader.js';

describe('Game - Sugar Lumps', () => {
  let game;
  let version;

  beforeEach(async () => {
    version = await loadVersionById('v2031');
    game = new Game(version);
  });

  describe('Sugar Lump state initialization', () => {
    it('should initialize Sugar Lump state as locked', () => {
      expect(game.sugarLumpsUnlocked).toBe(false);
      expect(game.sugarLumpsUnlockTime).toBe(null);
      expect(game.spentSugarLumps).toBe(0);
      expect(game.buildingLevels).toBeDefined();
    });

    it('should initialize all building levels to 0', () => {
      for (const buildingName of game.buildingNames) {
        expect(game.buildingLevels[buildingName]).toBe(0);
      }
    });

    it('should copy Sugar Lump state when cloning from parent', async () => {
      const parentVersion = await loadVersionById('v2031');
      const parent = new Game(parentVersion);
      parent.sugarLumpsUnlocked = true;
      parent.sugarLumpsUnlockTime = 1000;
      parent.spentSugarLumps = 5;
      parent.buildingLevels['Cursor'] = 3;
      parent.buildingLevels['Grandma'] = 1;

      const child = new Game(null, parent);
      expect(child.sugarLumpsUnlocked).toBe(true);
      expect(child.sugarLumpsUnlockTime).toBe(1000);
      expect(child.spentSugarLumps).toBe(5);
      expect(child.buildingLevels['Cursor']).toBe(3);
      expect(child.buildingLevels['Grandma']).toBe(1);
      // Building levels should be independent objects
      expect(child.buildingLevels).not.toBe(parent.buildingLevels);
    });
  });

  describe('checkSugarLumpUnlock', () => {
    it('should not unlock when totalCookies is below 1 billion', () => {
      game.totalCookies = 999999999;
      game.checkSugarLumpUnlock();
      expect(game.sugarLumpsUnlocked).toBe(false);
      expect(game.sugarLumpsUnlockTime).toBe(null);
    });

    it('should unlock when totalCookies reaches exactly 1 billion', () => {
      game.totalCookies = 1000000000;
      game.timeElapsed = 5000;
      game.checkSugarLumpUnlock();
      expect(game.sugarLumpsUnlocked).toBe(true);
      expect(game.sugarLumpsUnlockTime).toBe(5000);
    });

    it('should unlock when totalCookies exceeds 1 billion', () => {
      game.totalCookies = 2000000000;
      game.timeElapsed = 10000;
      game.checkSugarLumpUnlock();
      expect(game.sugarLumpsUnlocked).toBe(true);
      expect(game.sugarLumpsUnlockTime).toBe(10000);
    });

    it('should not unlock again if already unlocked', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 1000;
      game.totalCookies = 1000000000;
      game.timeElapsed = 5000;
      game.checkSugarLumpUnlock();
      expect(game.sugarLumpsUnlockTime).toBe(1000); // Should not change
    });
  });

  describe('getAvailableSugarLumps', () => {
    it('should return 0 when Sugar Lumps are not unlocked', () => {
      expect(game.getAvailableSugarLumps()).toBe(0);
    });

    it('should return 0 immediately after unlock (no time elapsed)', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 1000;
      game.timeElapsed = 1000;
      expect(game.getAvailableSugarLumps()).toBe(0);
    });

    it('should return 1 after 24 hours (86400 seconds)', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 86400; // Exactly 24 hours
      expect(game.getAvailableSugarLumps()).toBe(1);
    });

    it('should return 2 after 48 hours', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 172800; // 48 hours
      expect(game.getAvailableSugarLumps()).toBe(2);
    });

    it('should subtract spent Sugar Lumps from available', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 172800; // 48 hours = 2 Sugar Lumps
      game.spentSugarLumps = 1;
      expect(game.getAvailableSugarLumps()).toBe(1); // 2 - 1 = 1
    });

    it('should return 0 if spent exceeds harvested (clamped)', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 86400; // 24 hours = 1 Sugar Lump
      game.spentSugarLumps = 5; // Spent more than harvested
      expect(game.getAvailableSugarLumps()).toBe(0); // Clamped to 0
    });

    it('should handle partial days correctly', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 43200; // 12 hours (half a day)
      expect(game.getAvailableSugarLumps()).toBe(0); // Less than 24 hours
    });

    it('should handle 2.5 days correctly', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 216000; // 2.5 days = 216000 seconds
      expect(game.getAvailableSugarLumps()).toBe(2); // Math.floor(2.5) = 2
    });
  });

  describe('upgradeBuildingWithSugarLump', () => {
    beforeEach(() => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 86400; // 24 hours = 1 Sugar Lump available
      game.numBuildings['Cursor'] = 10; // Own some Cursors
    });

    it('should return false if Sugar Lumps are not unlocked', () => {
      game.sugarLumpsUnlocked = false;
      const result = game.upgradeBuildingWithSugarLump('Cursor');
      expect(result).toBe(false);
      expect(game.buildingLevels['Cursor']).toBe(0);
    });

    it('should return false if building does not exist', () => {
      const result = game.upgradeBuildingWithSugarLump('NonExistentBuilding');
      expect(result).toBe(false);
    });

    it('should return false if building count is 0', () => {
      game.numBuildings['Cursor'] = 0;
      const result = game.upgradeBuildingWithSugarLump('Cursor');
      expect(result).toBe(false);
    });

    it('should return false if not enough Sugar Lumps available', () => {
      game.timeElapsed = 86400; // 1 Sugar Lump available
      game.spentSugarLumps = 1; // Already spent it
      const result = game.upgradeBuildingWithSugarLump('Cursor');
      expect(result).toBe(false);
      expect(game.buildingLevels['Cursor']).toBe(0);
    });

    it('should upgrade building from level 0 to level 1', () => {
      game.timeElapsed = 86400; // 1 Sugar Lump available
      const result = game.upgradeBuildingWithSugarLump('Cursor');
      expect(result).toBe(true);
      expect(game.buildingLevels['Cursor']).toBe(1);
      expect(game.spentSugarLumps).toBe(1); // Cost = 1 for level 1
    });

    it('should upgrade building from level 1 to level 2', () => {
      game.buildingLevels['Cursor'] = 1;
      game.timeElapsed = 259200; // 3 Sugar Lumps harvested (72 hours)
      game.spentSugarLumps = 1; // Already spent 1 for level 1
      // Available = 3 harvested - 1 spent = 2 available (enough for level 2, cost = 2)
      const result = game.upgradeBuildingWithSugarLump('Cursor');
      expect(result).toBe(true);
      expect(game.buildingLevels['Cursor']).toBe(2);
      expect(game.spentSugarLumps).toBe(3); // 1 + 2 = 3 total spent
    });

    it('should upgrade building from level 2 to level 3', () => {
      game.buildingLevels['Cursor'] = 2;
      game.timeElapsed = 345600; // 4 Sugar Lumps harvested (96 hours)
      game.spentSugarLumps = 3; // Already spent 1+2=3 for levels 1-2
      // Available = 4 harvested - 3 spent = 1 available, but we need 3 for level 3
      // So we need more time
      game.timeElapsed = 518400; // 6 Sugar Lumps harvested (144 hours)
      // Available = 6 harvested - 3 spent = 3 available (enough for level 3)
      const result = game.upgradeBuildingWithSugarLump('Cursor');
      expect(result).toBe(true);
      expect(game.buildingLevels['Cursor']).toBe(3);
      expect(game.spentSugarLumps).toBe(6); // 3 + 3 = 6 total spent
    });

    it('should add upgrade to history', () => {
      game.timeElapsed = 86400;
      const historyLength = game.history.length;
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.history.length).toBe(historyLength + 1);
      expect(game.history[game.history.length - 1]).toBe('SUGAR_LUMP:Cursor');
    });
  });

  describe('buildingRate with Sugar Lump levels', () => {
    beforeEach(() => {
      game.numBuildings['Cursor'] = 1; // Own at least one building
    });

    it('should return base rate when building level is 0', () => {
      game.buildingLevels['Cursor'] = 0;
      const baseRate = game.baseRates['Cursor'];
      const rate = game.buildingRate('Cursor');
      expect(rate).toBe(baseRate);
    });

    it('should apply +1% bonus for level 1', () => {
      game.buildingLevels['Cursor'] = 1;
      const baseRate = game.baseRates['Cursor'];
      const rate = game.buildingRate('Cursor');
      expect(rate).toBeCloseTo(baseRate * 1.01, 10);
    });

    it('should apply +2% bonus for level 2', () => {
      game.buildingLevels['Cursor'] = 2;
      const baseRate = game.baseRates['Cursor'];
      const rate = game.buildingRate('Cursor');
      expect(rate).toBeCloseTo(baseRate * 1.02, 10);
    });

    it('should apply +3% bonus for level 3', () => {
      game.buildingLevels['Cursor'] = 3;
      const baseRate = game.baseRates['Cursor'];
      const rate = game.buildingRate('Cursor');
      expect(rate).toBeCloseTo(baseRate * 1.03, 10);
    });

    it('should apply +10% bonus for level 10', () => {
      game.buildingLevels['Cursor'] = 10;
      const baseRate = game.baseRates['Cursor'];
      const rate = game.buildingRate('Cursor');
      expect(rate).toBeCloseTo(baseRate * 1.10, 10);
    });
  });
});

