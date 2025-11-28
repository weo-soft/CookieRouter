/**
 * Integration tests for saved routes workflow
 * Tests the complete flow: save route → access route → track progress
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  saveSavedRoute, 
  getSavedRoutes, 
  getSavedRouteById, 
  updateLastAccessed,
  updateSavedRouteName,
  deleteSavedRoute
} from '../../src/js/storage.js';
import { getProgress, saveProgress } from '../../src/js/storage.js';

describe('Saved Routes Workflow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const createValidSavedRoute = (overrides = {}) => {
    const baseRoute = {
      id: 'saved-route-123',
      name: 'Test Route',
      categoryId: 'predefined-fledgling',
      categoryName: 'Fledgling',
      versionId: 'v2048',
      routeData: {
        buildings: [
          { order: 1, building: 'Cursor', cost: 15, cps: 0.1, time: 0 },
          { order: 2, building: 'Grandma', cost: 100, cps: 1, time: 10 }
        ],
        algorithm: 'GPL',
        lookahead: 1,
        completionTime: 123.45,
        startingBuildings: {}
      },
      savedAt: 1737984000000,
      lastAccessedAt: 1737984000000
    };
    return { ...baseRoute, ...overrides };
  };

  describe('Save and Access Workflow', () => {
    it('should save a route and then access it', () => {
      const route = createValidSavedRoute({ id: 'test-route', name: 'My Route' });
      saveSavedRoute(route);

      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toHaveLength(1);
      expect(savedRoutes[0].name).toBe('My Route');

      const accessed = getSavedRouteById('test-route');
      expect(accessed).not.toBeNull();
      expect(accessed.name).toBe('My Route');
      expect(accessed.routeData.buildings).toHaveLength(2);
    });

    it('should update lastAccessedAt when route is accessed', () => {
      const route = createValidSavedRoute({ 
        id: 'test-route', 
        lastAccessedAt: 1737984000000 
      });
      saveSavedRoute(route);

      const beforeAccess = Date.now();
      updateLastAccessed('test-route');
      const afterAccess = Date.now();

      const updated = getSavedRouteById('test-route');
      expect(updated.lastAccessedAt).toBeGreaterThanOrEqual(beforeAccess);
      expect(updated.lastAccessedAt).toBeLessThanOrEqual(afterAccess);
    });

    it('should preserve route data when accessing saved route', () => {
      const route = createValidSavedRoute({
        id: 'test-route',
        routeData: {
          buildings: [
            { order: 1, building: 'Cursor', cost: 15, cps: 0.1, time: 0 },
            { order: 2, building: 'Grandma', cost: 100, cps: 1, time: 10 },
            { order: 3, building: 'Farm', cost: 1100, cps: 8, time: 20 }
          ],
          algorithm: 'GPL',
          lookahead: 1,
          completionTime: 200.5,
          startingBuildings: { Cursor: 1 }
        }
      });
      saveSavedRoute(route);

      const accessed = getSavedRouteById('test-route');
      expect(accessed.routeData.buildings).toHaveLength(3);
      expect(accessed.routeData.algorithm).toBe('GPL');
      expect(accessed.routeData.completionTime).toBe(200.5);
      expect(accessed.routeData.startingBuildings).toEqual({ Cursor: 1 });
    });
  });

  describe('Progress Independence', () => {
    it('should maintain separate progress for different saved routes', () => {
      const route1 = createValidSavedRoute({ id: 'route-1', name: 'Route 1' });
      const route2 = createValidSavedRoute({ id: 'route-2', name: 'Route 2' });
      saveSavedRoute(route1);
      saveSavedRoute(route2);

      // Create progress for route1
      const progress1 = {
        routeId: 'route-1',
        completedBuildings: [1, 2],
        lastUpdated: Date.now()
      };
      saveProgress(progress1);

      // Create progress for route2
      const progress2 = {
        routeId: 'route-2',
        completedBuildings: [1],
        lastUpdated: Date.now()
      };
      saveProgress(progress2);

      // Verify progress is separate
      const loadedProgress1 = getProgress('route-1');
      const loadedProgress2 = getProgress('route-2');

      expect(loadedProgress1.completedBuildings).toEqual([1, 2]);
      expect(loadedProgress2.completedBuildings).toEqual([1]);
    });

    it('should preserve progress when switching between saved routes', () => {
      const route1 = createValidSavedRoute({ id: 'route-1' });
      const route2 = createValidSavedRoute({ id: 'route-2' });
      saveSavedRoute(route1);
      saveSavedRoute(route2);

      // Set progress for route1
      const progress1 = {
        routeId: 'route-1',
        completedBuildings: [1, 2, 3],
        lastUpdated: Date.now()
      };
      saveProgress(progress1);

      // Access route2 (simulate switching)
      updateLastAccessed('route-2');

      // Verify route1 progress is still intact
      const loadedProgress1 = getProgress('route-1');
      expect(loadedProgress1.completedBuildings).toEqual([1, 2, 3]);

      // Set progress for route2
      const progress2 = {
        routeId: 'route-2',
        completedBuildings: [1],
        lastUpdated: Date.now()
      };
      saveProgress(progress2);

      // Switch back to route1 - progress should still be [1, 2, 3]
      const reloadedProgress1 = getProgress('route-1');
      expect(reloadedProgress1.completedBuildings).toEqual([1, 2, 3]);
    });
  });

  describe('Multiple Saved Routes', () => {
    it('should handle multiple saved routes independently', () => {
      const routes = [
        createValidSavedRoute({ id: 'route-1', name: 'Route 1', categoryName: 'Fledgling' }),
        createValidSavedRoute({ id: 'route-2', name: 'Route 2', categoryName: 'Neverclick' }),
        createValidSavedRoute({ id: 'route-3', name: 'Route 3', categoryName: 'Hardcore' })
      ];

      routes.forEach(route => saveSavedRoute(route));

      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toHaveLength(3);

      // Verify each route can be accessed independently
      routes.forEach(route => {
        const accessed = getSavedRouteById(route.id);
        expect(accessed).not.toBeNull();
        expect(accessed.name).toBe(route.name);
        expect(accessed.categoryName).toBe(route.categoryName);
      });
    });
  });

  describe('Complete User Journey', () => {
    it('should complete full workflow: save → access → progress → rename → delete', () => {
      // 1. Save a route
      const route = createValidSavedRoute({
        id: 'journey-route',
        name: 'Journey Route',
        routeData: {
          buildings: [
            { order: 1, building: 'Cursor', cost: 15, cps: 0.1, time: 0 },
            { order: 2, building: 'Grandma', cost: 100, cps: 1, time: 10 }
          ],
          algorithm: 'GPL',
          lookahead: 1,
          completionTime: 50.5,
          startingBuildings: {}
        }
      });
      saveSavedRoute(route);
      expect(getSavedRoutes()).toHaveLength(1);

      // 2. Access the route
      const accessed = getSavedRouteById('journey-route');
      expect(accessed).not.toBeNull();
      expect(accessed.name).toBe('Journey Route');

      // 3. Update progress
      const progress = {
        routeId: 'journey-route',
        completedBuildings: [1],
        lastUpdated: Date.now()
      };
      saveProgress(progress);
      expect(getProgress('journey-route').completedBuildings).toEqual([1]);

      // 4. Rename the route
      updateSavedRouteName('journey-route', 'Renamed Journey Route');
      const renamed = getSavedRouteById('journey-route');
      expect(renamed.name).toBe('Renamed Journey Route');
      expect(renamed.routeData).toEqual(route.routeData); // Route data unchanged

      // 5. Verify progress still exists after rename
      expect(getProgress('journey-route').completedBuildings).toEqual([1]);

      // 6. Delete the route
      deleteSavedRoute('journey-route');
      expect(getSavedRoutes()).toHaveLength(0);
      expect(getSavedRouteById('journey-route')).toBeNull();

      // 7. Verify progress is also deleted
      expect(getProgress('journey-route')).toBeNull();
    });

    it('should handle multiple routes with independent operations', () => {
      // Create multiple routes
      const route1 = createValidSavedRoute({ id: 'multi-1', name: 'Route 1' });
      const route2 = createValidSavedRoute({ id: 'multi-2', name: 'Route 2' });
      saveSavedRoute(route1);
      saveSavedRoute(route2);

      // Set different progress for each
      saveProgress({ routeId: 'multi-1', completedBuildings: [1, 2], lastUpdated: Date.now() });
      saveProgress({ routeId: 'multi-2', completedBuildings: [1], lastUpdated: Date.now() });

      // Rename one
      updateSavedRouteName('multi-1', 'Renamed Route 1');

      // Delete the other
      deleteSavedRoute('multi-2');

      // Verify remaining route
      const remaining = getSavedRoutes();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe('Renamed Route 1');
      expect(getProgress('multi-1').completedBuildings).toEqual([1, 2]);
      expect(getProgress('multi-2')).toBeNull();
    });
  });
});

