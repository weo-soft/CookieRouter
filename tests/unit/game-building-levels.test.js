/**
 * Unit tests for building level upgrade mechanics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../../src/js/game.js';
import { loadVersionById } from '../../src/js/utils/version-loader.js';

describe('Game - Building Levels', () => {
  let game;
  let version;

  beforeEach(async () => {
    version = await loadVersionById('v2031');
    game = new Game(version);
    game.sugarLumpsUnlocked = true;
    game.sugarLumpsUnlockTime = 0;
    game.numBuildings['Cursor'] = 10;
    game.numBuildings['Grandma'] = 5;
  });

  describe('Building level upgrade costs', () => {
    it('should cost 1 Sugar Lump to upgrade to level 1', () => {
      game.timeElapsed = 86400; // 1 Sugar Lump available
      const beforeSpent = game.spentSugarLumps;
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.spentSugarLumps - beforeSpent).toBe(1);
    });

    it('should cost 2 Sugar Lumps to upgrade to level 2', () => {
      game.buildingLevels['Cursor'] = 1;
      // Need 3 Sugar Lumps harvested: 3 - 1 = 2 available (enough for level 2)
      game.timeElapsed = 259200; // 3 Sugar Lumps harvested
      game.spentSugarLumps = 1; // Already spent 1 for level 1
      const beforeSpent = game.spentSugarLumps;
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.spentSugarLumps - beforeSpent).toBe(2);
    });

    it('should cost 3 Sugar Lumps to upgrade to level 3', () => {
      game.buildingLevels['Cursor'] = 2;
      // Need 6 Sugar Lumps harvested total: 6 - 3 = 3 available (enough for level 3)
      game.timeElapsed = 518400; // 6 Sugar Lumps harvested
      game.spentSugarLumps = 3; // Already spent 1+2=3 for levels 1-2
      const beforeSpent = game.spentSugarLumps;
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.spentSugarLumps - beforeSpent).toBe(3);
    });

    it('should have cumulative total cost', () => {
      // Level 1: 1 Sugar Lump
      game.timeElapsed = 86400; // 1 Sugar Lump harvested
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.spentSugarLumps).toBe(1);
      expect(game.buildingLevels['Cursor']).toBe(1);

      // Level 2: 1 + 2 = 3 total
      // Need 3 Sugar Lumps harvested: 3 - 1 = 2 available (enough for level 2)
      game.timeElapsed = 259200; // 3 Sugar Lumps harvested
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.spentSugarLumps).toBe(3);
      expect(game.buildingLevels['Cursor']).toBe(2);

      // Level 3: 1 + 2 + 3 = 6 total
      // Need 6 Sugar Lumps harvested: 6 - 3 = 3 available (enough for level 3)
      game.timeElapsed = 518400; // 6 Sugar Lumps harvested
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.spentSugarLumps).toBe(6);
      expect(game.buildingLevels['Cursor']).toBe(3);
    });
  });

  describe('Building level CpS bonus calculation', () => {
    it('should calculate CpS with level 0 (no bonus)', () => {
      game.buildingLevels['Cursor'] = 0;
      const baseRate = game.baseRates['Cursor'];
      const rate = game.buildingRate('Cursor');
      expect(rate).toBe(baseRate);
    });

    it('should calculate CpS with level 1 (+1%)', () => {
      game.buildingLevels['Cursor'] = 1;
      const baseRate = game.baseRates['Cursor'];
      const rate = game.buildingRate('Cursor');
      const expected = baseRate * 1.01;
      expect(rate).toBeCloseTo(expected, 10);
    });

    it('should calculate CpS with level 5 (+5%)', () => {
      game.buildingLevels['Cursor'] = 5;
      const baseRate = game.baseRates['Cursor'];
      const rate = game.buildingRate('Cursor');
      const expected = baseRate * 1.05;
      expect(rate).toBeCloseTo(expected, 10);
    });

    it('should calculate CpS with level 10 (+10%)', () => {
      game.buildingLevels['Cursor'] = 10;
      const baseRate = game.baseRates['Cursor'];
      const rate = game.buildingRate('Cursor');
      const expected = baseRate * 1.10;
      expect(rate).toBeCloseTo(expected, 10);
    });

    it('should apply bonus multiplicatively', () => {
      // Test with a specific base rate
      const baseRate = 0.1;
      game.baseRates['Cursor'] = baseRate;
      game.buildingLevels['Cursor'] = 3;
      const rate = game.buildingRate('Cursor');
      expect(rate).toBeCloseTo(0.1 * 1.03, 10); // 0.103
    });

    it('should work with different buildings independently', () => {
      const cursorBaseRate = game.baseRates['Cursor'];
      const grandmaBaseRate = game.baseRates['Grandma'];

      game.buildingLevels['Cursor'] = 2;
      game.buildingLevels['Grandma'] = 5;

      const cursorRate = game.buildingRate('Cursor');
      const grandmaRate = game.buildingRate('Grandma');

      expect(cursorRate).toBeCloseTo(cursorBaseRate * 1.02, 10);
      expect(grandmaRate).toBeCloseTo(grandmaBaseRate * 1.05, 10);
    });
  });

  describe('Multiple building upgrades', () => {
    it('should allow upgrading multiple different buildings', () => {
      game.timeElapsed = 86400; // 1 Sugar Lump available
      
      // Upgrade Cursor to level 1 (cost: 1)
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.buildingLevels['Cursor']).toBe(1);
      expect(game.spentSugarLumps).toBe(1);

      // Upgrade Grandma to level 1 (cost: 1)
      // Need 2 total Sugar Lumps (1 for Cursor + 1 for Grandma)
      game.timeElapsed = 172800; // 2 Sugar Lumps harvested
      // Available = 2 harvested - 1 spent = 1 available (enough for Grandma)
      game.upgradeBuildingWithSugarLump('Grandma');
      expect(game.buildingLevels['Grandma']).toBe(1);
      expect(game.spentSugarLumps).toBe(2);
    });

    it('should track levels independently per building', () => {
      // Need 6 Sugar Lumps total: 1 (Cursor L1) + 2 (Cursor L2) + 1 (Grandma L1) = 4 minimum
      // But we need 6 harvested to have 6 available after spending
      game.timeElapsed = 518400; // 6 Sugar Lumps harvested (144 hours)
      
      // Cursor level 0 -> 1 (cost: 1)
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.buildingLevels['Cursor']).toBe(1);
      expect(game.spentSugarLumps).toBe(1);
      
      // Cursor level 1 -> 2 (cost: 2, total spent: 3)
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.buildingLevels['Cursor']).toBe(2);
      expect(game.spentSugarLumps).toBe(3);
      
      // Grandma level 0 -> 1 (cost: 1, total spent: 4)
      game.upgradeBuildingWithSugarLump('Grandma');
      expect(game.buildingLevels['Grandma']).toBe(1);
      expect(game.spentSugarLumps).toBe(4);

      expect(game.buildingLevels['Cursor']).toBe(2);
      expect(game.buildingLevels['Grandma']).toBe(1);
      expect(game.buildingLevels['Farm']).toBe(0); // Not upgraded
    });
  });
});

