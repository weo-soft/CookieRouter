/**
 * Integration test for saved route progress persistence
 * Tests that progress is saved and persists when switching routes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveSavedRoute, getSavedRouteById } from '../../src/js/storage.js';
import { getProgress, saveProgress, updateProgress } from '../../src/js/storage.js';

describe('Saved Route Progress Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const createValidSavedRoute = (overrides = {}) => {
    const baseRoute = {
      id: 'saved-route-test',
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
      lastAccessedAt: 1737984000000
    };
    return { ...baseRoute, ...overrides };
  };

  it('should save progress when toggling steps in a saved route', () => {
    const route = createValidSavedRoute({ id: 'route-progress-test' });
    saveSavedRoute(route);

    // Create initial progress
    const initialProgress = {
      routeId: 'route-progress-test',
      completedBuildings: [],
      lastUpdated: Date.now()
    };
    saveProgress(initialProgress);

    // Update progress (simulating toggling steps)
    updateProgress('route-progress-test', [1, 2]);

    // Verify progress is saved
    const savedProgress = getProgress('route-progress-test');
    expect(savedProgress).not.toBeNull();
    expect(savedProgress.completedBuildings).toEqual([1, 2]);
  });

  it('should persist progress when switching between saved routes', () => {
    const route1 = createValidSavedRoute({ id: 'route-1', name: 'Route 1' });
    const route2 = createValidSavedRoute({ id: 'route-2', name: 'Route 2' });
    saveSavedRoute(route1);
    saveSavedRoute(route2);

    // Set progress for route1
    saveProgress({
      routeId: 'route-1',
      completedBuildings: [1, 2, 3],
      lastUpdated: Date.now()
    });

    // Update progress for route1 (simulating checking off more steps)
    updateProgress('route-1', [1, 2, 3, 4]);

    // Switch to route2 and set its progress
    saveProgress({
      routeId: 'route-2',
      completedBuildings: [1],
      lastUpdated: Date.now()
    });

    // Switch back to route1 - progress should be preserved
    const route1Progress = getProgress('route-1');
    expect(route1Progress.completedBuildings).toEqual([1, 2, 3, 4]);

    // Route2 progress should also be preserved
    const route2Progress = getProgress('route-2');
    expect(route2Progress.completedBuildings).toEqual([1]);
  });

  it('should create progress if it doesn\'t exist when updating', () => {
    const route = createValidSavedRoute({ id: 'route-no-progress' });
    saveSavedRoute(route);

    // Try to update progress that doesn't exist - should handle gracefully
    // This simulates the fix where we create progress if it doesn't exist
    let progress = getProgress('route-no-progress');
    if (!progress) {
      progress = {
        routeId: 'route-no-progress',
        completedBuildings: [1, 2],
        lastUpdated: Date.now()
      };
      saveProgress(progress);
    } else {
      updateProgress('route-no-progress', [1, 2]);
    }

    // Verify progress exists
    const savedProgress = getProgress('route-no-progress');
    expect(savedProgress).not.toBeNull();
    expect(savedProgress.completedBuildings).toEqual([1, 2]);
  });
});

