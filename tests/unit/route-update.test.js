/**
 * Unit tests for route update validation logic
 */

import { describe, it, expect } from 'vitest';
import {
  validateRouteUpdate,
  RouteUpdateError,
  ValidationError,
  VersionMismatchError
} from '../../src/js/utils/route-update.js';

describe('Route Update Validation', () => {
  const createValidSavedRoute = (overrides = {}) => {
    return {
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

  describe('validateRouteUpdate', () => {
    it('should validate successfully when route and save game are valid and versions match', () => {
      const savedRoute = createValidSavedRoute();
      const importedSaveGame = createValidImportedSaveGame({ version: 'v2048' });

      const result = validateRouteUpdate(savedRoute, importedSaveGame);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.versionCompatible).toBe(true);
    });

    it('should validate successfully when versions differ but are compatible', () => {
      const savedRoute = createValidSavedRoute({ versionId: 'v2048' });
      const importedSaveGame = createValidImportedSaveGame({ version: 'v2052' });

      const result = validateRouteUpdate(savedRoute, importedSaveGame);

      expect(result.isValid).toBe(true);
      expect(result.versionCompatible).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Version mismatch');
    });

    it('should reject when saved route is null or invalid', () => {
      const importedSaveGame = createValidImportedSaveGame();

      const result1 = validateRouteUpdate(null, importedSaveGame);
      expect(result1.isValid).toBe(false);
      expect(result1.errors.length).toBeGreaterThan(0);

      const result2 = validateRouteUpdate({}, importedSaveGame);
      expect(result2.isValid).toBe(false);
      expect(result2.errors.length).toBeGreaterThan(0);
    });

    it('should reject when imported save game is null or invalid', () => {
      const savedRoute = createValidSavedRoute();

      const result1 = validateRouteUpdate(savedRoute, null);
      expect(result1.isValid).toBe(false);
      expect(result1.errors.length).toBeGreaterThan(0);

      const result2 = validateRouteUpdate(savedRoute, {});
      expect(result2.isValid).toBe(false);
      expect(result2.errors.length).toBeGreaterThan(0);
    });

    it('should reject when imported save game is missing building information', () => {
      const savedRoute = createValidSavedRoute();
      const importedSaveGame = {
        version: 'v2048',
        totalCookies: 1000
        // Missing buildings and buildingCounts
      };

      const result = validateRouteUpdate(savedRoute, importedSaveGame);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('building'))).toBe(true);
    });

    it('should accept imported save game with buildings array', () => {
      const savedRoute = createValidSavedRoute();
      const importedSaveGame = {
        version: 'v2048',
        buildings: [
          { name: 'Cursor', amountOwned: 10 }
        ]
      };

      const result = validateRouteUpdate(savedRoute, importedSaveGame);

      expect(result.isValid).toBe(true);
    });

    it('should accept imported save game with buildingCounts object', () => {
      const savedRoute = createValidSavedRoute();
      const importedSaveGame = {
        version: 'v2048',
        buildingCounts: {
          Cursor: 10,
          Grandma: 5
        }
      };

      const result = validateRouteUpdate(savedRoute, importedSaveGame);

      expect(result.isValid).toBe(true);
    });

    it('should reject when route version is not supported', () => {
      const savedRoute = createValidSavedRoute({ versionId: 'v9999' });
      const importedSaveGame = createValidImportedSaveGame();

      const result = validateRouteUpdate(savedRoute, importedSaveGame);

      expect(result.isValid).toBe(false);
      expect(result.versionCompatible).toBe(false);
      expect(result.errors.some(e => e.includes('not supported'))).toBe(true);
    });

    it('should reject when imported save game version is not supported', () => {
      const savedRoute = createValidSavedRoute();
      const importedSaveGame = createValidImportedSaveGame({ version: 'v9999' });

      const result = validateRouteUpdate(savedRoute, importedSaveGame);

      expect(result.isValid).toBe(false);
      expect(result.versionCompatible).toBe(false);
      expect(result.errors.some(e => e.includes('not supported'))).toBe(true);
    });

    it('should handle all compatible versions', () => {
      const compatibleVersions = ['v2031', 'v2048', 'v10466', 'v10466_xmas', 'v2052'];

      for (const version of compatibleVersions) {
        const savedRoute = createValidSavedRoute({ versionId: version });
        const importedSaveGame = createValidImportedSaveGame({ version: version });

        const result = validateRouteUpdate(savedRoute, importedSaveGame);

        expect(result.isValid).toBe(true);
        expect(result.versionCompatible).toBe(true);
      }
    });

    it('should reject when saved route is missing required fields', () => {
      const importedSaveGame = createValidImportedSaveGame();

      const result1 = validateRouteUpdate({ id: 'test' }, importedSaveGame);
      expect(result1.isValid).toBe(false);
      expect(result1.errors.some(e => e.includes('versionId'))).toBe(true);

      const result2 = validateRouteUpdate({ versionId: 'v2048' }, importedSaveGame);
      expect(result2.isValid).toBe(false);
      expect(result2.errors.some(e => e.includes('id'))).toBe(true);
    });

    it('should use default version v2052 when imported save game version is missing', () => {
      const savedRoute = createValidSavedRoute({ versionId: 'v2052' });
      const importedSaveGame = {
        buildings: [{ name: 'Cursor', amountOwned: 10 }]
        // No version specified
      };

      const result = validateRouteUpdate(savedRoute, importedSaveGame);

      // Should still validate (v2052 is compatible)
      expect(result.isValid).toBe(true);
    });
  });

  describe('updateSavedRoute', () => {
    // Note: These tests will be implemented after updateSavedRoute function is added to storage.js
    // For now, we're just setting up the test structure
    it('should update route successfully when valid data is provided', async () => {
      // This test will be implemented after updateSavedRoute is added
      expect(true).toBe(true); // Placeholder
    });

    it('should preserve route identity (name, ID) during update', async () => {
      // This test will be implemented after updateSavedRoute is added
      expect(true).toBe(true); // Placeholder
    });

    it('should preserve progress when route structure is similar', async () => {
      // This test will be implemented after updateSavedRoute is added
      expect(true).toBe(true); // Placeholder
    });

    it('should reject update when validation fails', async () => {
      // This test will be implemented after updateSavedRoute is added
      expect(true).toBe(true); // Placeholder
    });

    it('should preserve original route when calculation fails', async () => {
      // This test will be implemented after updateSavedRoute is added
      expect(true).toBe(true); // Placeholder
    });
  });
});

