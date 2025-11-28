/**
 * Unit tests for Progress Tracking functionality
 * Tests progress persistence, loading, and UI integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getProgress,
  saveProgress,
  updateProgress,
  clearProgress
} from '../../src/js/storage.js';

describe('Progress Tracking', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clear localStorage after each test
    localStorage.clear();
  });

  describe('Progress Persistence', () => {
    it('should create new progress when none exists', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      const retrieved = getProgress('route-1');
      expect(retrieved).toBeTruthy();
      expect(retrieved.routeId).toBe('route-1');
      expect(retrieved.completedBuildings).toEqual([]);
    });

    it('should persist progress across multiple saves', () => {
      const progress1 = {
        routeId: 'route-1',
        completedBuildings: [1, 2],
        lastUpdated: Date.now()
      };

      saveProgress(progress1);
      const retrieved1 = getProgress('route-1');
      expect(retrieved1.completedBuildings).toEqual([1, 2]);

      const progress2 = {
        routeId: 'route-1',
        completedBuildings: [1, 2, 3, 4],
        lastUpdated: Date.now()
      };

      saveProgress(progress2);
      const retrieved2 = getProgress('route-1');
      expect(retrieved2.completedBuildings).toEqual([1, 2, 3, 4]);
    });

    it('should maintain separate progress for different routes', () => {
      const progress1 = {
        routeId: 'route-1',
        completedBuildings: [1, 2],
        lastUpdated: Date.now()
      };

      const progress2 = {
        routeId: 'route-2',
        completedBuildings: [1, 2, 3],
        lastUpdated: Date.now()
      };

      saveProgress(progress1);
      saveProgress(progress2);

      const retrieved1 = getProgress('route-1');
      const retrieved2 = getProgress('route-2');

      expect(retrieved1.completedBuildings).toEqual([1, 2]);
      expect(retrieved2.completedBuildings).toEqual([1, 2, 3]);
    });
  });

  describe('Progress Updates', () => {
    it('should update completed buildings list', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [1, 2],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      updateProgress('route-1', [1, 2, 3, 4, 5]);

      const updated = getProgress('route-1');
      expect(updated.completedBuildings).toEqual([1, 2, 3, 4, 5]);
      // lastUpdated should be greater than or equal (may be same millisecond)
      expect(updated.lastUpdated).toBeGreaterThanOrEqual(progress.lastUpdated);
    });

    it('should handle removing completed buildings', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [1, 2, 3, 4, 5],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      updateProgress('route-1', [1, 3, 5]);

      const updated = getProgress('route-1');
      expect(updated.completedBuildings).toEqual([1, 3, 5]);
    });

    it('should handle empty completed buildings list', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [1, 2, 3],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      updateProgress('route-1', []);

      const updated = getProgress('route-1');
      expect(updated.completedBuildings).toEqual([]);
    });

    it('should throw error when updating non-existent progress', () => {
      expect(() => {
        updateProgress('non-existent-route', [1, 2]);
      }).toThrow('Progress for route non-existent-route not found');
    });
  });

  describe('Progress Loading', () => {
    it('should return null for non-existent route progress', () => {
      const progress = getProgress('non-existent-route');
      expect(progress).toBeNull();
    });

    it('should load progress with correct structure', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [1, 2, 3],
        lastUpdated: 1234567890
      };

      saveProgress(progress);
      const loaded = getProgress('route-1');

      expect(loaded).toHaveProperty('routeId');
      expect(loaded).toHaveProperty('completedBuildings');
      expect(loaded).toHaveProperty('lastUpdated');
      expect(loaded.routeId).toBe('route-1');
      expect(Array.isArray(loaded.completedBuildings)).toBe(true);
      expect(typeof loaded.lastUpdated).toBe('number');
    });
  });

  describe('Progress Clearing', () => {
    it('should clear progress for a specific route', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [1, 2, 3],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      clearProgress('route-1');

      const retrieved = getProgress('route-1');
      expect(retrieved).toBeNull();
    });

    it('should not affect other routes when clearing one', () => {
      const progress1 = {
        routeId: 'route-1',
        completedBuildings: [1, 2],
        lastUpdated: Date.now()
      };

      const progress2 = {
        routeId: 'route-2',
        completedBuildings: [1, 2, 3],
        lastUpdated: Date.now()
      };

      saveProgress(progress1);
      saveProgress(progress2);
      clearProgress('route-1');

      expect(getProgress('route-1')).toBeNull();
      expect(getProgress('route-2')).toBeTruthy();
      expect(getProgress('route-2').completedBuildings).toEqual([1, 2, 3]);
    });

    it('should handle clearing non-existent progress gracefully', () => {
      expect(() => {
        clearProgress('non-existent-route');
      }).not.toThrow();
    });
  });

  describe('Progress Data Validation', () => {
    it('should store and retrieve array of step orders', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [1, 5, 10, 15, 20],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      const loaded = getProgress('route-1');

      expect(loaded.completedBuildings).toEqual([1, 5, 10, 15, 20]);
      expect(loaded.completedBuildings.every(order => typeof order === 'number')).toBe(true);
    });

    it('should preserve order of completed buildings', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [3, 1, 5, 2, 4],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      const loaded = getProgress('route-1');

      // Order should be preserved as stored
      expect(loaded.completedBuildings).toEqual([3, 1, 5, 2, 4]);
    });

    it('should update lastUpdated timestamp on each update', async () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [1],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      const firstLoad = getProgress('route-1');
      const firstTimestamp = firstLoad.lastUpdated;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      updateProgress('route-1', [1, 2]);
      const secondLoad = getProgress('route-1');
      const secondTimestamp = secondLoad.lastUpdated;

      expect(secondTimestamp).toBeGreaterThan(firstTimestamp);
    });
  });
});

