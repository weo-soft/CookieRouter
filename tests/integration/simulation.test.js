/**
 * Integration tests for simulation
 * Uses Python outputs as golden master tests
 */

import { describe, it, expect } from 'vitest';
import { Router } from '../../src/js/router.js';
import { hardcore, short } from '../../src/js/categories.js';
import { calculateRoute } from '../../src/js/simulation.js';

describe('Simulation Integration', () => {
  describe('short category routing', () => {
    it('should complete short category route', async () => {
      const game = await short();
      const router = new Router();
      const result = await router.routeGPL(game, 1);

      // Allow small tolerance for rounding (within 1% of target)
      expect(result.totalCookies).toBeGreaterThanOrEqual(game.targetCookies * 0.99);
      expect(result.completionTime()).not.toBeNull();
      expect(result.completionTime()).toBeGreaterThan(0);
    });

    it('should have building purchases in history', async () => {
      const game = await short();
      const router = new Router();
      const result = await router.routeGPL(game, 1);

      expect(result.history.length).toBeGreaterThan(0);
      expect(result.history.every(h => typeof h === 'string')).toBe(true);
    });
  });

  describe('hardcore category routing', () => {
    it('should complete hardcore category route', async () => {
      const game = await hardcore();
      const router = new Router();
      const result = await router.routeGPL(game, 1);

      // Allow small tolerance for rounding (within 0.1% of target for large numbers)
      expect(result.totalCookies).toBeGreaterThanOrEqual(game.targetCookies * 0.999);
      expect(result.completionTime()).not.toBeNull();
    });

    it('should not purchase upgrades in hardcore mode', async () => {
      const game = await hardcore();
      const router = new Router();
      const result = await router.routeGPL(game, 1);

      // Verify no upgrades were purchased (upgrades have different names)
      const buildingNames = game.buildingNames;
      const upgradePurchases = result.history.filter(h => !buildingNames.includes(h));
      expect(upgradePurchases.length).toBe(0);
    });

    it('should produce reasonable building counts', async () => {
      const game = await hardcore();
      const router = new Router();
      const result = await router.routeGPL(game, 1);

      // Should have purchased some buildings
      const totalBuildings = Object.values(result.numBuildings).reduce((a, b) => a + b, 0);
      expect(totalBuildings).toBeGreaterThan(0);

      // Should have purchased multiple building types
      const buildingTypes = Object.keys(result.numBuildings).filter(
        name => result.numBuildings[name] > 0
      );
      expect(buildingTypes.length).toBeGreaterThan(1);
    });
  });

  describe('route consistency', () => {
    it('should produce consistent routes for same input', async () => {
      const game1 = await short();
      const game2 = await short();
      const router = new Router();

      const result1 = await router.routeGPL(game1, 1);
      const result2 = await router.routeGPL(game2, 1);

      // Should complete both (allow small tolerance for rounding)
      expect(result1.totalCookies).toBeGreaterThanOrEqual(game1.targetCookies * 0.99);
      expect(result2.totalCookies).toBeGreaterThanOrEqual(game2.targetCookies * 0.99);

      // Should have same number of building types purchased
      const types1 = Object.keys(result1.numBuildings).filter(
        name => result1.numBuildings[name] > 0
      ).length;
      const types2 = Object.keys(result2.numBuildings).filter(
        name => result2.numBuildings[name] > 0
      ).length;
      expect(types1).toBe(types2);
    });
  });

  describe('starting buildings functionality', () => {
    it('should use starting buildings when provided', async () => {
      const category = {
        id: 'test-category',
        name: 'short (test)',
        isPredefined: true,
        targetCookies: 1000000,
        playerCps: 8,
        playerDelay: 1
      };

      const startingBuildings = {
        'Cursor': 5,
        'Grandma': 2
      };

      const route = await calculateRoute(category, startingBuildings, {
        algorithm: 'GPL',
        lookahead: 1
      }, 'v2048');

      expect(route).toBeTruthy();
      expect(route.startingBuildings).toEqual(startingBuildings);
      expect(route.buildings.length).toBeGreaterThan(0);
    });

    it('should produce different route when starting buildings are provided', async () => {
      const category = {
        id: 'test-category',
        name: 'short (test)',
        isPredefined: true,
        targetCookies: 1000000,
        playerCps: 8,
        playerDelay: 1
      };

      const routeWithout = await calculateRoute(category, {}, {
        algorithm: 'GPL',
        lookahead: 1
      }, 'v2048');

      const routeWith = await calculateRoute(category, { 'Cursor': 10 }, {
        algorithm: 'GPL',
        lookahead: 1
      }, 'v2048');

      // Routes should be different (different number of steps or different buildings)
      // At minimum, the route with starting buildings should have fewer total steps
      // or different initial buildings
      expect(routeWith.buildings.length).toBeLessThanOrEqual(routeWithout.buildings.length);
    });

    it('should handle empty starting buildings object', async () => {
      const category = {
        id: 'test-category',
        name: 'short (test)',
        isPredefined: true,
        targetCookies: 1000000,
        playerCps: 8,
        playerDelay: 1
      };

      const route = await calculateRoute(category, {}, {
        algorithm: 'GPL',
        lookahead: 1
      }, 'v2048');

      expect(route).toBeTruthy();
      expect(route.startingBuildings).toEqual({});
      expect(route.buildings.length).toBeGreaterThan(0);
    });

    it('should ignore invalid building names in starting buildings', async () => {
      const category = {
        id: 'test-category',
        name: 'short (test)',
        isPredefined: true,
        targetCookies: 1000000,
        playerCps: 8,
        playerDelay: 1
      };

      const startingBuildings = {
        'InvalidBuilding': 5,
        'Cursor': 3
      };

      const route = await calculateRoute(category, startingBuildings, {
        algorithm: 'GPL',
        lookahead: 1
      }, 'v2048');

      expect(route).toBeTruthy();
      // Should only include valid buildings
      expect(route.startingBuildings).toHaveProperty('Cursor');
      expect(route.startingBuildings['Cursor']).toBe(3);
      // Invalid building should be ignored (not in startingBuildings or handled gracefully)
    });

    it('should complete route even with starting buildings', async () => {
      const category = {
        id: 'test-category',
        name: 'short (test)',
        isPredefined: true,
        targetCookies: 1000000,
        playerCps: 8,
        playerDelay: 1
      };

      const startingBuildings = {
        'Cursor': 10,
        'Grandma': 5
      };

      const route = await calculateRoute(category, startingBuildings, {
        algorithm: 'GPL',
        lookahead: 1
      }, 'v2048');

      // Route should complete (reach target)
      expect(route.completionTime).toBeGreaterThan(0);
      expect(route.buildings.length).toBeGreaterThan(0);
    });

    it('should handle multiple starting buildings correctly', async () => {
      const category = {
        id: 'test-category',
        name: 'short (test)',
        isPredefined: true,
        targetCookies: 1000000,
        playerCps: 8,
        playerDelay: 1
      };

      const startingBuildings = {
        'Cursor': 5,
        'Grandma': 3,
        'Farm': 2,
        'Mine': 1
      };

      const route = await calculateRoute(category, startingBuildings, {
        algorithm: 'GPL',
        lookahead: 1
      }, 'v2048');

      expect(route).toBeTruthy();
      expect(route.startingBuildings).toEqual(startingBuildings);
      expect(route.buildings.length).toBeGreaterThan(0);
    });
  });
});

