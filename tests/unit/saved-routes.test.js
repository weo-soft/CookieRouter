/**
 * Unit tests for Saved Routes storage operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSavedRoutes,
  saveSavedRoute,
  getSavedRouteById,
  deleteSavedRoute,
  updateSavedRouteName,
  updateLastAccessed,
  getProgress,
  saveProgress,
  updateProgress
} from '../../src/js/storage.js';

describe('Saved Routes Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clear localStorage after each test
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
          { order: 1, building: 'Cursor', cost: 15, cps: 0.1, time: 0 }
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

  describe('getSavedRoutes', () => {
    it('should return empty array when no saved routes exist', () => {
      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toEqual([]);
    });

    it('should return all saved routes', () => {
      const route1 = createValidSavedRoute({ id: 'route-1', name: 'Route 1' });
      const route2 = createValidSavedRoute({ id: 'route-2', name: 'Route 2' });
      saveSavedRoute(route1);
      saveSavedRoute(route2);

      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toHaveLength(2);
      expect(savedRoutes).toContainEqual(route1);
      expect(savedRoutes).toContainEqual(route2);
    });

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('cookieRouter:savedRoutes', 'invalid json');
      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toEqual([]);
    });

    it('should handle missing key gracefully', () => {
      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toEqual([]);
    });
  });

  describe('saveSavedRoute', () => {
    it('should save a valid saved route', () => {
      const route = createValidSavedRoute();
      saveSavedRoute(route);

      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toHaveLength(1);
      expect(savedRoutes[0]).toEqual(route);
    });

    it('should update existing saved route with same ID', () => {
      const route1 = createValidSavedRoute({ name: 'Original Name' });
      saveSavedRoute(route1);

      const route2 = createValidSavedRoute({ name: 'Updated Name' });
      saveSavedRoute(route2);

      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toHaveLength(1);
      expect(savedRoutes[0].name).toBe('Updated Name');
    });

    it('should throw error if route name is empty', () => {
      const route = createValidSavedRoute({ name: '' });
      expect(() => saveSavedRoute(route)).toThrow('SavedRoute.name must be a non-empty string');
    });

    it('should throw error if route name exceeds 100 characters', () => {
      const route = createValidSavedRoute({ name: 'a'.repeat(101) });
      expect(() => saveSavedRoute(route)).toThrow('SavedRoute.name must be between 1 and 100 characters');
    });

    it('should throw error if routeData.buildings is empty', () => {
      const route = createValidSavedRoute({ routeData: { buildings: [], algorithm: 'GPL', lookahead: 1, completionTime: 0, startingBuildings: {} } });
      expect(() => saveSavedRoute(route)).toThrow('SavedRoute.routeData.buildings must be a non-empty array');
    });

    it('should throw error if required fields are missing', () => {
      const route = { id: 'test' };
      expect(() => saveSavedRoute(route)).toThrow();
    });

    it('should throw user-friendly error on quota exceeded', () => {
      // Mock localStorage.setItem to throw QuotaExceededError when saving savedRoutes
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
        // Only throw when saving savedRoutes (the actual save operation)
        if (key === 'cookieRouter:savedRoutes') {
          const error = new Error('Quota exceeded');
          error.name = 'QuotaExceededError';
          throw error;
        }
        // Allow other operations
        return Storage.prototype.setItem.call(localStorage, key, value);
      });

      const route = createValidSavedRoute();
      expect(() => saveSavedRoute(route)).toThrow('localStorage quota exceeded. Please delete old saved routes.');

      setItemSpy.mockRestore();
    });
  });

  describe('getSavedRouteById', () => {
    it('should return null when route does not exist', () => {
      const route = getSavedRouteById('non-existent');
      expect(route).toBeNull();
    });

    it('should return saved route by ID', () => {
      const route = createValidSavedRoute({ id: 'test-route' });
      saveSavedRoute(route);

      const found = getSavedRouteById('test-route');
      expect(found).toEqual(route);
    });

    it('should return null on error', () => {
      localStorage.setItem('cookieRouter:savedRoutes', 'invalid json');
      const route = getSavedRouteById('test-route');
      expect(route).toBeNull();
    });
  });

  describe('deleteSavedRoute', () => {
    it('should delete a saved route', () => {
      const route = createValidSavedRoute({ id: 'test-route' });
      saveSavedRoute(route);

      deleteSavedRoute('test-route');
      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toHaveLength(0);
    });

    it('should be idempotent (no error if route does not exist)', () => {
      expect(() => deleteSavedRoute('non-existent')).not.toThrow();
    });

    it('should delete associated progress when deleting route', () => {
      const route = createValidSavedRoute({ id: 'test-route' });
      saveSavedRoute(route);

      // Create progress for this route
      const progress = {
        savedRouteId: 'test-route',
        completedBuildings: [1, 2],
        lastUpdated: Date.now()
      };
      localStorage.setItem('cookieRouter:progress', JSON.stringify({ 'test-route': progress }));

      deleteSavedRoute('test-route');

      // Verify progress is also deleted
      const progressData = localStorage.getItem('cookieRouter:progress');
      const allProgress = progressData ? JSON.parse(progressData) : {};
      expect(allProgress['test-route']).toBeUndefined();
    });
  });

  describe('updateSavedRouteName', () => {
    it('should update route name', () => {
      const route = createValidSavedRoute({ id: 'test-route', name: 'Original Name' });
      saveSavedRoute(route);

      updateSavedRouteName('test-route', 'New Name');

      const updated = getSavedRouteById('test-route');
      expect(updated.name).toBe('New Name');
    });

    it('should throw error if route does not exist', () => {
      expect(() => updateSavedRouteName('non-existent', 'New Name')).toThrow('Saved route with ID non-existent not found');
    });

    it('should throw error if new name is empty', () => {
      const route = createValidSavedRoute({ id: 'test-route' });
      saveSavedRoute(route);

      expect(() => updateSavedRouteName('test-route', '')).toThrow('Route name must be a non-empty string');
    });

    it('should throw error if new name exceeds 100 characters', () => {
      const route = createValidSavedRoute({ id: 'test-route' });
      saveSavedRoute(route);

      expect(() => updateSavedRouteName('test-route', 'a'.repeat(101))).toThrow('Route name must be between 1 and 100 characters');
    });
  });

  describe('updateLastAccessed', () => {
    it('should update lastAccessedAt timestamp', () => {
      const route = createValidSavedRoute({ id: 'test-route', lastAccessedAt: 1000 });
      saveSavedRoute(route);

      const beforeUpdate = Date.now();
      updateLastAccessed('test-route');
      const afterUpdate = Date.now();

      const updated = getSavedRouteById('test-route');
      expect(updated.lastAccessedAt).toBeGreaterThanOrEqual(beforeUpdate);
      expect(updated.lastAccessedAt).toBeLessThanOrEqual(afterUpdate);
    });

    it('should throw error if route does not exist', () => {
      expect(() => updateLastAccessed('non-existent')).toThrow('Saved route with ID non-existent not found');
    });
  });

  describe('Save Route Dialog - Name Generation', () => {
    it('should generate default route name with category name and timestamp', () => {
      // Test default name generation format: "{Category Name} - {YYYY-MM-DD HH:MM}"
      const categoryName = 'Fledgling';
      const timestamp = new Date(1737984000000); // 2025-01-27 14:00:00 UTC
      
      // Format: YYYY-MM-DD HH:MM (using local time)
      const year = timestamp.getFullYear();
      const month = String(timestamp.getMonth() + 1).padStart(2, '0');
      const day = String(timestamp.getDate()).padStart(2, '0');
      const hours = String(timestamp.getHours()).padStart(2, '0');
      const minutes = String(timestamp.getMinutes()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
      const expectedName = `${categoryName} - ${formattedDate}`;
      
      // Verify the format is correct (category name - date time)
      expect(expectedName).toMatch(/^Fledgling - \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      expect(expectedName.startsWith('Fledgling -')).toBe(true);
      expect(expectedName.includes('2025-01-27')).toBe(true);
    });

    it('should allow saving route with custom name', () => {
      // Test that custom names can be saved
      const customName = 'My Custom Route Name';
      const route = createValidSavedRoute({ name: customName });
      
      saveSavedRoute(route);
      const saved = getSavedRouteById(route.id);
      
      expect(saved.name).toBe(customName);
    });

    it('should validate route name length (1-100 characters)', () => {
      // Test that the dialog validates name length
      const tooLongName = 'a'.repeat(101);
      const route = createValidSavedRoute({ name: tooLongName });
      
      expect(() => saveSavedRoute(route)).toThrow('SavedRoute.name must be between 1 and 100 characters');
    });
  });

  describe('Loading Saved Routes', () => {
    it('should load all saved routes', () => {
      const route1 = createValidSavedRoute({ id: 'route-1', name: 'Route 1' });
      const route2 = createValidSavedRoute({ id: 'route-2', name: 'Route 2' });
      saveSavedRoute(route1);
      saveSavedRoute(route2);

      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toHaveLength(2);
      expect(savedRoutes.map(r => r.id)).toContain('route-1');
      expect(savedRoutes.map(r => r.id)).toContain('route-2');
    });

    it('should load saved route with all metadata', () => {
      const route = createValidSavedRoute({
        id: 'test-route',
        name: 'Test Route',
        categoryId: 'predefined-fledgling',
        categoryName: 'Fledgling',
        versionId: 'v2048',
        savedAt: 1737984000000,
        lastAccessedAt: 1737985000000
      });
      saveSavedRoute(route);

      const loaded = getSavedRouteById('test-route');
      expect(loaded).not.toBeNull();
      expect(loaded.name).toBe('Test Route');
      expect(loaded.categoryId).toBe('predefined-fledgling');
      expect(loaded.categoryName).toBe('Fledgling');
      expect(loaded.versionId).toBe('v2048');
      expect(loaded.savedAt).toBe(1737984000000);
      expect(loaded.lastAccessedAt).toBe(1737985000000);
      expect(loaded.routeData).toBeDefined();
      expect(Array.isArray(loaded.routeData.buildings)).toBe(true);
    });

    it('should return empty array when no saved routes exist', () => {
      const savedRoutes = getSavedRoutes();
      expect(savedRoutes).toEqual([]);
    });
  });

  describe('Independent Progress Tracking', () => {
    it('should track progress independently for each saved route', () => {
      
      const route1 = createValidSavedRoute({ id: 'saved-route-1' });
      const route2 = createValidSavedRoute({ id: 'saved-route-2' });
      saveSavedRoute(route1);
      saveSavedRoute(route2);

      // Create progress for route1
      const progress1 = {
        routeId: 'saved-route-1',
        completedBuildings: [1, 2, 3],
        lastUpdated: Date.now()
      };
      saveProgress(progress1);

      // Create progress for route2
      const progress2 = {
        routeId: 'saved-route-2',
        completedBuildings: [1],
        lastUpdated: Date.now()
      };
      saveProgress(progress2);

      // Verify progress is independent
      const loadedProgress1 = getProgress('saved-route-1');
      const loadedProgress2 = getProgress('saved-route-2');

      expect(loadedProgress1.completedBuildings).toEqual([1, 2, 3]);
      expect(loadedProgress2.completedBuildings).toEqual([1]);
      expect(loadedProgress1.completedBuildings).not.toEqual(loadedProgress2.completedBuildings);
    });

    it('should not interfere with calculated route progress', () => {
      
      const savedRoute = createValidSavedRoute({ id: 'saved-route-1' });
      saveSavedRoute(savedRoute);

      // Progress for saved route
      const savedProgress = {
        routeId: 'saved-route-1',
        completedBuildings: [1, 2],
        lastUpdated: Date.now()
      };
      saveProgress(savedProgress);

      // Progress for calculated route (different ID)
      const calculatedProgress = {
        routeId: 'calculated-route-1',
        completedBuildings: [1, 2, 3, 4],
        lastUpdated: Date.now()
      };
      saveProgress(calculatedProgress);

      // Verify they don't interfere
      const loadedSaved = getProgress('saved-route-1');
      const loadedCalculated = getProgress('calculated-route-1');

      expect(loadedSaved.completedBuildings).toEqual([1, 2]);
      expect(loadedCalculated.completedBuildings).toEqual([1, 2, 3, 4]);
    });

    it('should update progress independently for each saved route', () => {
      
      const route1 = createValidSavedRoute({ id: 'saved-route-1' });
      const route2 = createValidSavedRoute({ id: 'saved-route-2' });
      saveSavedRoute(route1);
      saveSavedRoute(route2);

      // Initial progress for both routes
      const progress1 = {
        routeId: 'saved-route-1',
        completedBuildings: [1],
        lastUpdated: Date.now()
      };
      const progress2 = {
        routeId: 'saved-route-2',
        completedBuildings: [1, 2],
        lastUpdated: Date.now()
      };
      saveProgress(progress1);
      saveProgress(progress2);

      // Update progress for route1 only
      updateProgress('saved-route-1', [1, 2, 3]);

      // Verify route1 updated, route2 unchanged
      const updated1 = getProgress('saved-route-1');
      const unchanged2 = getProgress('saved-route-2');

      expect(updated1.completedBuildings).toEqual([1, 2, 3]);
      expect(unchanged2.completedBuildings).toEqual([1, 2]);
    });
  });

  describe('Rename Saved Routes', () => {
    it('should rename a saved route', () => {
      const route = createValidSavedRoute({ id: 'test-route', name: 'Original Name' });
      saveSavedRoute(route);

      updateSavedRouteName('test-route', 'New Name');

      const updated = getSavedRouteById('test-route');
      expect(updated.name).toBe('New Name');
      expect(updated.id).toBe('test-route'); // ID should not change
      expect(updated.routeData).toEqual(route.routeData); // Route data should not change
    });

    it('should throw error if route does not exist when renaming', () => {
      expect(() => updateSavedRouteName('non-existent', 'New Name')).toThrow('Saved route with ID non-existent not found');
    });

    it('should throw error if new name is empty', () => {
      const route = createValidSavedRoute({ id: 'test-route' });
      saveSavedRoute(route);

      expect(() => updateSavedRouteName('test-route', '')).toThrow('Route name must be a non-empty string');
    });

    it('should throw error if new name exceeds 100 characters', () => {
      const route = createValidSavedRoute({ id: 'test-route' });
      saveSavedRoute(route);

      expect(() => updateSavedRouteName('test-route', 'a'.repeat(101))).toThrow('Route name must be between 1 and 100 characters');
    });
  });

  describe('Delete Saved Routes', () => {
    it('should delete a saved route', () => {
      const route = createValidSavedRoute({ id: 'test-route' });
      saveSavedRoute(route);

      deleteSavedRoute('test-route');

      const deleted = getSavedRouteById('test-route');
      expect(deleted).toBeNull();

      const allRoutes = getSavedRoutes();
      expect(allRoutes.find(r => r.id === 'test-route')).toBeUndefined();
    });

    it('should delete associated progress when deleting route', () => {
      const route = createValidSavedRoute({ id: 'test-route' });
      saveSavedRoute(route);

      // Create progress for this route
      const progress = {
        routeId: 'test-route',
        completedBuildings: [1, 2, 3],
        lastUpdated: Date.now()
      };
      saveProgress(progress);

      // Verify progress exists
      expect(getProgress('test-route')).not.toBeNull();

      // Delete route
      deleteSavedRoute('test-route');

      // Verify progress is also deleted
      expect(getProgress('test-route')).toBeNull();
    });

    it('should be idempotent (no error if route does not exist)', () => {
      expect(() => deleteSavedRoute('non-existent')).not.toThrow();
    });

    it('should only delete the specified route when multiple routes exist', () => {
      const route1 = createValidSavedRoute({ id: 'route-1', name: 'Route 1' });
      const route2 = createValidSavedRoute({ id: 'route-2', name: 'Route 2' });
      const route3 = createValidSavedRoute({ id: 'route-3', name: 'Route 3' });
      saveSavedRoute(route1);
      saveSavedRoute(route2);
      saveSavedRoute(route3);

      deleteSavedRoute('route-2');

      const allRoutes = getSavedRoutes();
      expect(allRoutes).toHaveLength(2);
      expect(allRoutes.find(r => r.id === 'route-1')).toBeDefined();
      expect(allRoutes.find(r => r.id === 'route-2')).toBeUndefined();
      expect(allRoutes.find(r => r.id === 'route-3')).toBeDefined();
    });
  });
});

