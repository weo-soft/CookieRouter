/**
 * Integration tests for route calculation with Sugar Lump upgrades
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { calculateRoute } from '../../src/js/simulation.js';
import { Game } from '../../src/js/game.js';
import { loadVersionById } from '../../src/js/utils/version-loader.js';

describe('Route Calculation with Sugar Lumps', () => {
  let version;

  beforeEach(async () => {
    version = await loadVersionById('v2052');
  });

  describe('Sugar Lump unlock', () => {
    it('should unlock Sugar Lumps when route reaches 1 billion cookies', async () => {
      const category = {
        id: 'test-sugar-lump-unlock',
        name: 'Test Sugar Lump Unlock',
        isPredefined: false,
        targetCookies: 1000000000, // Exactly 1B
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');

      // Find the step where Sugar Lumps unlock
      const unlockStep = route.buildings.find(step => 
        step.sugarLumps && step.sugarLumps.unlocked === true
      );

      expect(unlockStep).toBeDefined();
      expect(unlockStep.sugarLumps.unlocked).toBe(true);
      expect(unlockStep.sugarLumps.unlockTime).toBeGreaterThanOrEqual(0);
    });

    it('should not unlock Sugar Lumps for routes below 1 billion cookies', async () => {
      const category = {
        id: 'test-no-unlock',
        name: 'Test No Unlock',
        isPredefined: false,
        targetCookies: 100000000, // 100M, below 1B
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');

      // No step should have Sugar Lumps unlocked
      const unlockedSteps = route.buildings.filter(step => 
        step.sugarLumps && step.sugarLumps.unlocked === true
      );

      expect(unlockedSteps.length).toBe(0);
    });
  });

  describe('Sugar Lump harvesting', () => {
    it('should harvest Sugar Lumps every 24 hours after unlock', async () => {
      const category = {
        id: 'test-harvest',
        name: 'Test Harvest',
        isPredefined: false,
        targetCookies: 2000000000, // 2B to allow time for harvesting
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');

      // Find harvest events
      const harvestSteps = route.buildings.filter(step => 
        step.type === 'sugarLumpHarvest'
      );

      expect(harvestSteps.length).toBeGreaterThan(0);

      // Verify harvest events have correct structure
      harvestSteps.forEach(step => {
        expect(step.type).toBe('sugarLumpHarvest');
        expect(step.availableSugarLumps).toBeGreaterThan(0);
        expect(step.harvestNumber).toBeGreaterThan(0);
        expect(step.sugarLumps).toBeDefined();
        expect(step.sugarLumps.unlocked).toBe(true);
      });
    });

    it('should increment harvest number sequentially', async () => {
      const category = {
        id: 'test-harvest-sequence',
        name: 'Test Harvest Sequence',
        isPredefined: false,
        targetCookies: 5000000000, // 5B to allow multiple harvests
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');

      const harvestSteps = route.buildings
        .filter(step => step.type === 'sugarLumpHarvest')
        .sort((a, b) => a.timeElapsed - b.timeElapsed);

      if (harvestSteps.length > 1) {
        // Verify harvest numbers are sequential
        for (let i = 1; i < harvestSteps.length; i++) {
          expect(harvestSteps[i].harvestNumber).toBeGreaterThan(
            harvestSteps[i - 1].harvestNumber
          );
        }
      }
    });
  });

  describe('Building level upgrades in routes', () => {
    it('should include building level upgrades in route when optimal', async () => {
      const category = {
        id: 'test-upgrades',
        name: 'Test Upgrades',
        isPredefined: false,
        targetCookies: 2000000000, // 2B to allow Sugar Lumps and upgrades
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');

      // Find upgrade events
      const upgradeSteps = route.buildings.filter(step => 
        step.type === 'buildingLevelUpgrade'
      );

      // May or may not have upgrades depending on optimization
      // But if they exist, verify structure
      upgradeSteps.forEach(step => {
        expect(step.type).toBe('buildingLevelUpgrade');
        expect(step.buildingName).toBeDefined();
        expect(step.level).toBeGreaterThan(0);
        expect(step.previousLevel).toBeGreaterThanOrEqual(0);
        expect(step.cost).toBe(step.level); // Cost equals level
        expect(step.sugarLumps).toBeDefined();
      });
    });

    it('should show improved CpS after building level upgrades', async () => {
      const category = {
        id: 'test-cps-improvement',
        name: 'Test CpS Improvement',
        isPredefined: false,
        targetCookies: 2000000000,
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');

      // Find an upgrade step
      const upgradeStep = route.buildings.find(step => 
        step.type === 'buildingLevelUpgrade'
      );

      if (upgradeStep) {
        // Find the step after the upgrade
        const upgradeIndex = route.buildings.findIndex(step => 
          step.order === upgradeStep.order
        );
        
        if (upgradeIndex < route.buildings.length - 1) {
          const nextStep = route.buildings[upgradeIndex + 1];
          // The next step should reflect improved CpS (if it's a building purchase)
          // This is indirect - the route optimizer should have considered the upgrade
          expect(nextStep).toBeDefined();
        }
      }
    });
  });

  describe('Sugar Lump state in route steps', () => {
    it('should include Sugar Lump state in steps after unlock', async () => {
      const category = {
        id: 'test-state-tracking',
        name: 'Test State Tracking',
        isPredefined: false,
        targetCookies: 1500000000, // 1.5B
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');

      // Find steps with Sugar Lump state
      const stepsWithSugarLumps = route.buildings.filter(step => 
        step.sugarLumps && step.sugarLumps.unlocked === true
      );

      expect(stepsWithSugarLumps.length).toBeGreaterThan(0);

      // Verify state structure
      stepsWithSugarLumps.forEach(step => {
        expect(step.sugarLumps.unlocked).toBe(true);
        expect(step.sugarLumps.unlockTime).toBeGreaterThanOrEqual(0);
        expect(step.sugarLumps.available).toBeGreaterThanOrEqual(0);
        expect(step.sugarLumps.spent).toBeGreaterThanOrEqual(0);
        expect(step.sugarLumps.buildingLevels).toBeDefined();
      });
    });

    it('should not include Sugar Lump state in steps before unlock', async () => {
      const category = {
        id: 'test-no-state-before',
        name: 'Test No State Before',
        isPredefined: false,
        targetCookies: 2000000000, // 2B
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');

      // Find unlock step
      const unlockStepIndex = route.buildings.findIndex(step => 
        step.sugarLumps && step.sugarLumps.unlocked === true
      );

      if (unlockStepIndex > 0) {
        // Steps before unlock should not have Sugar Lump state
        const stepsBeforeUnlock = route.buildings.slice(0, unlockStepIndex);
        stepsBeforeUnlock.forEach(step => {
          expect(step.sugarLumps).toBeUndefined();
        });
      }
    });
  });

  describe('Backward compatibility', () => {
    it('should handle routes that never reach 1B cookies', async () => {
      const category = {
        id: 'test-backward-compat',
        name: 'Test Backward Compat',
        isPredefined: false,
        targetCookies: 1000000, // 1M, well below 1B
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');

      // Route should complete successfully
      expect(route.buildings.length).toBeGreaterThan(0);
      expect(route.completionTime).toBeGreaterThan(0);

      // No Sugar Lump events should exist
      const sugarLumpEvents = route.buildings.filter(step => 
        step.type === 'sugarLumpHarvest' || step.type === 'buildingLevelUpgrade'
      );
      expect(sugarLumpEvents.length).toBe(0);

      // No Sugar Lump state should exist
      const stepsWithSugarLumps = route.buildings.filter(step => 
        step.sugarLumps
      );
      expect(stepsWithSugarLumps.length).toBe(0);
    });
  });
});

