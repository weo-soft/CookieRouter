/**
 * Unit tests for Sugar Lump event detection in simulation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../../src/js/game.js';
import { loadVersionById } from '../../src/js/utils/version-loader.js';

describe('Simulation - Sugar Lump Events', () => {
  let game;
  let version;

  beforeEach(async () => {
    version = await loadVersionById('v2031');
    game = new Game(version);
  });

  describe('Sugar Lump harvest event detection', () => {
    it('should detect harvest when available Sugar Lumps increase', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 0;
      game.spentSugarLumps = 0;

      const beforeAvailable = game.getAvailableSugarLumps();
      expect(beforeAvailable).toBe(0);

      // Advance time by 24 hours
      game.timeElapsed = 86400;
      const afterAvailable = game.getAvailableSugarLumps();
      expect(afterAvailable).toBe(1);
      expect(afterAvailable).toBeGreaterThan(beforeAvailable);
    });

    it('should not detect harvest when Sugar Lumps are locked', () => {
      game.sugarLumpsUnlocked = false;
      game.timeElapsed = 86400;
      const available = game.getAvailableSugarLumps();
      expect(available).toBe(0);
    });

    it('should detect multiple harvests over time', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.spentSugarLumps = 0;

      // After 24 hours: 1 harvest
      game.timeElapsed = 86400;
      expect(game.getAvailableSugarLumps()).toBe(1);

      // After 48 hours: 2 harvests
      game.timeElapsed = 172800;
      expect(game.getAvailableSugarLumps()).toBe(2);

      // After 72 hours: 3 harvests
      game.timeElapsed = 259200;
      expect(game.getAvailableSugarLumps()).toBe(3);
    });
  });

  describe('Building level upgrade event detection', () => {
    it('should detect upgrade when building level increases', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 86400; // 1 Sugar Lump available
      game.numBuildings['Cursor'] = 10;
      game.buildingLevels['Cursor'] = 0;

      const beforeLevel = game.buildingLevels['Cursor'];
      expect(beforeLevel).toBe(0);

      game.upgradeBuildingWithSugarLump('Cursor');
      const afterLevel = game.buildingLevels['Cursor'];
      expect(afterLevel).toBe(1);
      expect(afterLevel).toBeGreaterThan(beforeLevel);
    });

    it('should detect multiple level upgrades for same building', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.numBuildings['Cursor'] = 10;

      // Level 0 -> 1 (cost: 1)
      game.timeElapsed = 86400; // 1 Sugar Lump harvested
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.buildingLevels['Cursor']).toBe(1);
      expect(game.spentSugarLumps).toBe(1);

      // Level 1 -> 2 (cost: 2, need 3 total harvested: 3 - 1 = 2 available)
      game.timeElapsed = 259200; // 3 Sugar Lumps harvested
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.buildingLevels['Cursor']).toBe(2);
      expect(game.spentSugarLumps).toBe(3);

      // Level 2 -> 3 (cost: 3, need 6 total harvested: 6 - 3 = 3 available)
      game.timeElapsed = 518400; // 6 Sugar Lumps harvested
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.buildingLevels['Cursor']).toBe(3);
      expect(game.spentSugarLumps).toBe(6);
    });

    it('should detect upgrades for different buildings independently', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.numBuildings['Cursor'] = 10;
      game.numBuildings['Grandma'] = 5;

      // Upgrade Cursor
      game.timeElapsed = 86400;
      game.upgradeBuildingWithSugarLump('Cursor');
      expect(game.buildingLevels['Cursor']).toBe(1);
      expect(game.buildingLevels['Grandma']).toBe(0);

      // Upgrade Grandma
      game.timeElapsed = 172800;
      game.upgradeBuildingWithSugarLump('Grandma');
      expect(game.buildingLevels['Cursor']).toBe(1);
      expect(game.buildingLevels['Grandma']).toBe(1);
    });
  });

  describe('Sugar Lump harvest step creation', () => {
    it('should create harvest step with correct structure', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 86400; // 24 hours
      game.spentSugarLumps = 0;

      const available = game.getAvailableSugarLumps();
      const secondsSinceUnlock = game.timeElapsed - game.sugarLumpsUnlockTime;
      const harvestNumber = Math.floor(secondsSinceUnlock / 86400);

      // Simulate creating a harvest step (as done in simulation.js)
      const harvestStep = {
        type: 'sugarLumpHarvest',
        order: 1,
        timeElapsed: game.timeElapsed,
        availableSugarLumps: available,
        harvestNumber: harvestNumber,
        sugarLumps: {
          unlocked: true,
          unlockTime: game.sugarLumpsUnlockTime,
          available: available,
          spent: game.spentSugarLumps,
          buildingLevels: { ...game.buildingLevels }
        }
      };

      expect(harvestStep.type).toBe('sugarLumpHarvest');
      expect(harvestStep.availableSugarLumps).toBe(1);
      expect(harvestStep.harvestNumber).toBe(1);
      expect(harvestStep.sugarLumps.unlocked).toBe(true);
    });
  });

  describe('Building level upgrade step creation', () => {
    it('should create upgrade step with correct structure', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 86400;
      game.numBuildings['Cursor'] = 10;
      game.buildingLevels['Cursor'] = 0;

      const previousLevel = game.buildingLevels['Cursor'];
      game.upgradeBuildingWithSugarLump('Cursor');
      const newLevel = game.buildingLevels['Cursor'];

      // Simulate creating an upgrade step (as done in simulation.js)
      const upgradeStep = {
        type: 'buildingLevelUpgrade',
        order: 1,
        buildingName: 'Cursor',
        level: newLevel,
        previousLevel: previousLevel,
        cost: newLevel,
        timeElapsed: game.timeElapsed,
        availableSugarLumps: game.getAvailableSugarLumps(),
        sugarLumps: {
          unlocked: true,
          unlockTime: game.sugarLumpsUnlockTime,
          available: game.getAvailableSugarLumps(),
          spent: game.spentSugarLumps,
          buildingLevels: { ...game.buildingLevels }
        }
      };

      expect(upgradeStep.type).toBe('buildingLevelUpgrade');
      expect(upgradeStep.buildingName).toBe('Cursor');
      expect(upgradeStep.level).toBe(1);
      expect(upgradeStep.previousLevel).toBe(0);
      expect(upgradeStep.cost).toBe(1);
    });
  });
});

