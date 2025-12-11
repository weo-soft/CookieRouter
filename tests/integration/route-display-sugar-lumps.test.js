/**
 * Integration tests for route display with Sugar Lump events
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { calculateRoute } from '../../src/js/simulation.js';
import { RouteDisplay } from '../../src/js/ui/route-display.js';

describe('Route Display - Sugar Lump Events', () => {
  let container;

  beforeEach(() => {
    // Create a test container for route display
    container = document.createElement('div');
    container.id = 'test-route-display';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Sugar Lump harvest event display', () => {
    it('should display harvest events in route', async () => {
      const category = {
        id: 'test-harvest-display',
        name: 'Test Harvest Display',
        isPredefined: false,
        targetCookies: 2000000000, // 2B
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');
      
      // Find harvest steps
      const harvestSteps = route.buildings.filter(step => 
        step.type === 'sugarLumpHarvest'
      );

      expect(harvestSteps.length).toBeGreaterThan(0);

      // Verify harvest step structure for display
      harvestSteps.forEach(step => {
        expect(step.type).toBe('sugarLumpHarvest');
        expect(step.availableSugarLumps).toBeDefined();
        expect(step.harvestNumber).toBeDefined();
        expect(step.timeElapsed).toBeDefined();
      });
    });

    it('should show harvest events at correct time intervals', async () => {
      const category = {
        id: 'test-harvest-intervals',
        name: 'Test Harvest Intervals',
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
        // Verify harvests are approximately 24 hours apart (86400 seconds)
        for (let i = 1; i < harvestSteps.length; i++) {
          const timeDiff = harvestSteps[i].timeElapsed - harvestSteps[i - 1].timeElapsed;
          // Allow some tolerance (harvests may not be exactly 24h apart due to route timing)
          expect(timeDiff).toBeGreaterThan(80000); // At least ~23 hours
          expect(timeDiff).toBeLessThan(100000); // Less than ~28 hours
        }
      }
    });
  });

  describe('Building level upgrade event display', () => {
    it('should display upgrade events in route', async () => {
      const category = {
        id: 'test-upgrade-display',
        name: 'Test Upgrade Display',
        isPredefined: false,
        targetCookies: 2000000000, // 2B
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');
      
      // Find upgrade steps
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
        expect(step.cost).toBe(step.level);
        expect(step.availableSugarLumps).toBeDefined();
      });
    });

    it('should show multiple level upgrades for same building as separate steps', async () => {
      const category = {
        id: 'test-multiple-upgrades',
        name: 'Test Multiple Upgrades',
        isPredefined: false,
        targetCookies: 5000000000, // 5B
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');
      
      // Group upgrades by building
      const upgradesByBuilding = {};
      route.buildings
        .filter(step => step.type === 'buildingLevelUpgrade')
        .forEach(step => {
          if (!upgradesByBuilding[step.buildingName]) {
            upgradesByBuilding[step.buildingName] = [];
          }
          upgradesByBuilding[step.buildingName].push(step);
        });

      // If a building has multiple upgrades, verify they're sequential
      Object.keys(upgradesByBuilding).forEach(buildingName => {
        const upgrades = upgradesByBuilding[buildingName].sort((a, b) => a.order - b.order);
        if (upgrades.length > 1) {
          for (let i = 1; i < upgrades.length; i++) {
            expect(upgrades[i].level).toBe(upgrades[i - 1].level + 1);
            expect(upgrades[i].previousLevel).toBe(upgrades[i - 1].level);
          }
        }
      });
    });
  });

  describe('Sugar Lump state display in steps', () => {
    it('should show Sugar Lump state in steps after unlock', async () => {
      const category = {
        id: 'test-state-display',
        name: 'Test State Display',
        isPredefined: false,
        targetCookies: 1500000000, // 1.5B
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {}, 'v2052');
      
      const stepsWithSugarLumps = route.buildings.filter(step => 
        step.sugarLumps && step.sugarLumps.unlocked === true
      );

      expect(stepsWithSugarLumps.length).toBeGreaterThan(0);

      // Verify state is displayed correctly
      stepsWithSugarLumps.forEach(step => {
        expect(step.sugarLumps.available).toBeGreaterThanOrEqual(0);
        expect(step.sugarLumps.spent).toBeGreaterThanOrEqual(0);
        expect(step.sugarLumps.buildingLevels).toBeDefined();
      });
    });

    it('should not show Sugar Lump state before unlock', async () => {
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
});

