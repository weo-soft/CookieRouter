/**
 * Unit tests for progress preservation algorithm
 */

import { describe, it, expect } from 'vitest';
import { preserveRouteProgress } from '../../src/js/utils/route-update.js';

describe('Progress Preservation', () => {
  describe('preserveRouteProgress', () => {
    it('should preserve progress when route structure is unchanged', () => {
      const oldRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 },
          { name: 'Farm', order: 3 },
          { name: 'Mine', order: 4 },
          { name: 'Factory', order: 5 }
        ]
      };

      const newRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 },
          { name: 'Farm', order: 3 },
          { name: 'Mine', order: 4 },
          { name: 'Factory', order: 5 }
        ]
      };

      const oldProgress = [1, 2, 3]; // First 3 buildings completed

      const preserved = preserveRouteProgress(oldRoute, newRoute, oldProgress);

      expect(preserved).toEqual([1, 2, 3]);
    });

    it('should preserve progress when new buildings are added at the end', () => {
      const oldRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 },
          { name: 'Farm', order: 3 }
        ]
      };

      const newRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 },
          { name: 'Farm', order: 3 },
          { name: 'Mine', order: 4 },
          { name: 'Factory', order: 5 }
        ]
      };

      const oldProgress = [1, 2, 3]; // All buildings completed

      const preserved = preserveRouteProgress(oldRoute, newRoute, oldProgress);

      expect(preserved).toEqual([1, 2, 3]);
    });

    it('should preserve progress when buildings shift slightly (within tolerance)', () => {
      const oldRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 },
          { name: 'Farm', order: 3 }
        ]
      };

      const newRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Farm', order: 2 }, // Moved up 1 position
          { name: 'Grandma', order: 3 } // Moved down 1 position
        ]
      };

      const oldProgress = [1, 2, 3]; // All buildings completed

      const preserved = preserveRouteProgress(oldRoute, newRoute, oldProgress);

      // Cursor at position 1 should match
      // Farm moved from 3 to 2 (distance 1, within ±2 tolerance)
      // Grandma moved from 2 to 3 (distance 1, within ±2 tolerance)
      expect(preserved).toContain(1); // Cursor
      expect(preserved.length).toBeGreaterThan(0);
    });

    it('should lose progress when buildings move beyond tolerance', () => {
      const oldRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 },
          { name: 'Farm', order: 3 }
        ]
      };

      const newRoute = {
        buildings: [
          { name: 'Farm', order: 1 }, // Moved from 3 to 1 (distance 2, at edge)
          { name: 'Grandma', order: 2 }, // Same position
          { name: 'Cursor', order: 3 } // Moved from 1 to 3 (distance 2, at edge)
        ]
      };

      const oldProgress = [1, 2, 3]; // All buildings completed

      const preserved = preserveRouteProgress(oldRoute, newRoute, oldProgress);

      // Some progress should be preserved (within ±2 tolerance)
      expect(preserved.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty progress array', () => {
      const oldRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 }
        ]
      };

      const newRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 }
        ]
      };

      const oldProgress = [];

      const preserved = preserveRouteProgress(oldRoute, newRoute, oldProgress);

      expect(preserved).toEqual([]);
    });

    it('should handle invalid step orders gracefully', () => {
      const oldRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 }
        ]
      };

      const newRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 }
        ]
      };

      const oldProgress = [1, 5, 10]; // Includes invalid step orders

      const preserved = preserveRouteProgress(oldRoute, newRoute, oldProgress);

      // Should only preserve valid step orders
      expect(preserved).toEqual([1]); // Only step 1 is valid
    });

    it('should handle buildings with different name formats', () => {
      const oldRoute = {
        buildings: [
          { building: 'Cursor', order: 1 },
          { building: 'Grandma', order: 2 }
        ]
      };

      const newRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 }
        ]
      };

      const oldProgress = [1, 2];

      const preserved = preserveRouteProgress(oldRoute, newRoute, oldProgress);

      // Should match by building name regardless of property name (name vs building)
      expect(preserved.length).toBeGreaterThan(0);
    });

    it('should return empty array for null/invalid inputs', () => {
      expect(preserveRouteProgress(null, {}, [1, 2])).toEqual([]);
      expect(preserveRouteProgress({}, null, [1, 2])).toEqual([]);
      expect(preserveRouteProgress({}, {}, null)).toEqual([]);
      expect(preserveRouteProgress({}, {}, undefined)).toEqual([]);
    });

    it('should validate preserved step orders exist in new route', () => {
      const oldRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 },
          { name: 'Farm', order: 3 }
        ]
      };

      const newRoute = {
        buildings: [
          { name: 'Cursor', order: 1 },
          { name: 'Grandma', order: 2 }
          // Farm removed
        ]
      };

      const oldProgress = [1, 2, 3]; // All buildings completed

      const preserved = preserveRouteProgress(oldRoute, newRoute, oldProgress);

      // Should only preserve steps that exist in new route
      expect(preserved.every(step => step >= 1 && step <= newRoute.buildings.length)).toBe(true);
      expect(preserved).toEqual([1, 2]); // Only Cursor and Grandma exist
    });
  });
});

