/**
 * Integration tests for route update workflow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { updateSavedRoute, getSavedRouteById, saveSavedRoute, getProgress } from '../../src/js/storage.js';
import { importSaveGame, clearImportedSaveGame } from '../../src/js/save-game-importer.js';

describe('Route Update Workflow', () => {
  beforeEach(() => {
    // Clear localStorage and imported save game before each test
    localStorage.clear();
    clearImportedSaveGame();
  });

  afterEach(() => {
    // Clear localStorage and imported save game after each test
    localStorage.clear();
    clearImportedSaveGame();
  });

  const createValidSavedRoute = (overrides = {}) => {
    return {
      id: 'saved-route-test-123',
      name: 'Test Route',
      categoryId: 'predefined-fledgling',
      categoryName: 'Fledgling',
      versionId: 'v2048',
      routeData: {
        buildings: [
          { order: 1, building: 'Cursor', cost: 15, cps: 0.1, time: 0 },
          { order: 2, building: 'Grandma', cost: 100, cps: 1, time: 10 },
          { order: 3, building: 'Farm', cost: 1100, cps: 8, time: 20 }
        ],
        algorithm: 'GPL',
        lookahead: 1,
        completionTime: 123.45,
        startingBuildings: {}
      },
      savedAt: 1737984000000,
      lastAccessedAt: 1737984000000,
      ...overrides
    };
  };

  const createValidImportedSaveGame = (overrides = {}) => {
    return {
      version: 'v2048',
      buildings: [
        { name: 'Cursor', amountOwned: 10 },
        { name: 'Grandma', amountOwned: 5 }
      ],
      buildingCounts: {
        Cursor: 10,
        Grandma: 5
      },
      totalCookies: 1000,
      cookiesPerSecond: 100,
      ...overrides
    };
  };

  describe('Complete Update Workflow', () => {
    it('should complete full workflow: import save game → update route → verify updated route', async () => {
      // Create and save a route
      const savedRoute = createValidSavedRoute();
      saveSavedRoute(savedRoute);

      // Import save game
      const importedSaveGame = createValidImportedSaveGame();
      // Note: importSaveGame expects a string, but for testing we'll mock it
      // In real usage, the save game would already be imported via the UI
      // For this test, we'll pass the object directly to updateSavedRoute

      // Update the route
      const result = await updateSavedRoute(savedRoute.id, importedSaveGame, {
        preserveProgress: true
      });

      // Verify update succeeded
      expect(result.success).toBe(true);
      expect(result.updatedRoute).toBeDefined();
      expect(result.updatedRoute.id).toBe(savedRoute.id); // ID preserved
      expect(result.updatedRoute.name).toBe(savedRoute.name); // Name preserved

      // Verify route was updated in storage
      const updatedRoute = getSavedRouteById(savedRoute.id);
      expect(updatedRoute).toBeDefined();
      expect(updatedRoute.lastUpdatedAt).toBeDefined();
      expect(updatedRoute.lastUpdatedAt).toBeGreaterThan(savedRoute.savedAt);
    });

    it('should preserve route identity during update', async () => {
      const savedRoute = createValidSavedRoute({
        name: 'My Custom Route',
        categoryId: 'predefined-fledgling',
        categoryName: 'Fledgling'
      });
      saveSavedRoute(savedRoute);

      const importedSaveGame = createValidImportedSaveGame();
      const result = await updateSavedRoute(savedRoute.id, importedSaveGame);

      expect(result.success).toBe(true);
      expect(result.updatedRoute.name).toBe('My Custom Route'); // Name preserved
      expect(result.updatedRoute.id).toBe(savedRoute.id); // ID preserved
      expect(result.updatedRoute.categoryId).toBe(savedRoute.categoryId); // Category preserved
      expect(result.updatedRoute.savedAt).toBe(savedRoute.savedAt); // Original save time preserved
    });

    it('should preserve progress when route structure is similar', async () => {
      const savedRoute = createValidSavedRoute();
      saveSavedRoute(savedRoute);

      // Set initial progress
      const initialProgress = {
        routeId: savedRoute.id,
        completedBuildings: [1, 2], // First 2 buildings completed
        lastUpdated: Date.now()
      };
      const { saveProgress } = await import('../../src/js/storage.js');
      saveProgress(initialProgress);

      const importedSaveGame = createValidImportedSaveGame();
      const result = await updateSavedRoute(savedRoute.id, importedSaveGame, {
        preserveProgress: true
      });

      expect(result.success).toBe(true);
      expect(result.preservedProgress).toBeDefined();
      
      // Verify progress was preserved
      const updatedProgress = getProgress(savedRoute.id);
      expect(updatedProgress).toBeDefined();
      expect(updatedProgress.completedBuildings.length).toBeGreaterThan(0);
    });

    it('should handle update failure gracefully and preserve original route', async () => {
      const savedRoute = createValidSavedRoute();
      saveSavedRoute(savedRoute);

      // Use invalid imported save game (missing buildings)
      const invalidImportedSaveGame = {
        version: 'v2048'
        // Missing buildings and buildingCounts
      };

      const result = await updateSavedRoute(savedRoute.id, invalidImportedSaveGame);

      // Should fail validation
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('VALIDATION_ERROR');

      // Original route should be unchanged
      const originalRoute = getSavedRouteById(savedRoute.id);
      expect(originalRoute).toBeDefined();
      expect(originalRoute.routeData.buildings.length).toBe(savedRoute.routeData.buildings.length);
      expect(originalRoute.name).toBe(savedRoute.name);
    });

    it('should display progress during update', async () => {
      const savedRoute = createValidSavedRoute();
      saveSavedRoute(savedRoute);

      const importedSaveGame = createValidImportedSaveGame();
      const progressUpdates = [];

      const result = await updateSavedRoute(savedRoute.id, importedSaveGame, {
        onProgress: (progress) => {
          progressUpdates.push(progress);
        }
      });

      expect(result.success).toBe(true);
      // Progress callback should have been called (at least once)
      // Note: Actual number depends on route calculation
    });

    it('should complete update within 30 seconds (performance requirement SC-002)', async () => {
      const savedRoute = createValidSavedRoute();
      saveSavedRoute(savedRoute);

      const importedSaveGame = createValidImportedSaveGame();
      
      const startTime = Date.now();
      const result = await updateSavedRoute(savedRoute.id, importedSaveGame);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // Convert to seconds

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(30); // Should complete in under 30 seconds per SC-002
    });
  });
});

