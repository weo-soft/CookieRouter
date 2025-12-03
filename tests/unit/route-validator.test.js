/**
 * Unit tests for Route Validator
 * Tests validation functions, error handling, and duplicate detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isValidBase64,
  validateRouteSchema,
  validateRouteData,
  checkMissingCategoryReferences,
  checkDuplicateRouteId,
  validateImportFile,
  handleDuplicateRouteId,
  generateNewRouteId,
  RouteImportError,
  RouteExportError
} from '../../src/js/utils/route-validator.js';
import {
  saveSavedRoute,
  saveRouteChain,
  saveCategory,
  getSavedRoutes,
  getRouteChains,
  getCategoryById
} from '../../src/js/storage.js';

describe('Route Validator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('isValidBase64', () => {
    it('should return true for valid base64 strings', () => {
      expect(isValidBase64('SGVsbG8gV29ybGQ=')).toBe(true);
      expect(isValidBase64('YWJjZGVmZ2g=')).toBe(true);
      expect(isValidBase64('dGVzdA==')).toBe(true);
    });

    it('should return false for invalid base64 strings', () => {
      expect(isValidBase64('invalid!!!')).toBe(false);
      expect(isValidBase64('not base64@#$')).toBe(false);
      expect(isValidBase64('')).toBe(false);
    });

    it('should handle base64 with padding', () => {
      expect(isValidBase64('dGVzdA==')).toBe(true);
      expect(isValidBase64('dGVzdDE=')).toBe(true);
      expect(isValidBase64('dGVzdDEy')).toBe(true);
    });
  });

  describe('validateRouteSchema', () => {
    it('should validate a correct savedRoute schema', () => {
      const validData = {
        version: '1.0.0',
        routeType: 'savedRoute',
        exportedAt: Date.now(),
        routeData: {
          id: 'test-route',
          name: 'Test Route',
          categoryId: 'predefined-fledgling',
          versionId: 'v2048',
          routeData: { buildings: [] }
        }
      };

      const result = validateRouteSchema(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing version field', () => {
      const invalidData = {
        routeType: 'savedRoute',
        exportedAt: Date.now(),
        routeData: {}
      };

      const result = validateRouteSchema(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('version'))).toBe(true);
    });

    it('should reject invalid routeType', () => {
      const invalidData = {
        version: '1.0.0',
        routeType: 'invalidType',
        exportedAt: Date.now(),
        routeData: {}
      };

      const result = validateRouteSchema(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('routeType'))).toBe(true);
    });

    it('should reject missing exportedAt', () => {
      const invalidData = {
        version: '1.0.0',
        routeType: 'savedRoute',
        routeData: {}
      };

      const result = validateRouteSchema(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('exportedAt'))).toBe(true);
    });

    it('should reject missing routeData', () => {
      const invalidData = {
        version: '1.0.0',
        routeType: 'savedRoute',
        exportedAt: Date.now()
      };

      const result = validateRouteSchema(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('routeData'))).toBe(true);
    });

    it('should reject non-object data', () => {
      const result = validateRouteSchema('not an object');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('object'))).toBe(true);
    });
  });

  describe('validateRouteData', () => {
    it('should validate a correct savedRoute', () => {
      const routeData = {
        id: 'test-route',
        name: 'Test Route',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: {
          buildings: [
            { order: 1, building: 'Cursor', cost: 15 }
          ],
          algorithm: 'GPL'
        }
      };

      const result = validateRouteData(routeData, 'savedRoute');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a correct routeChain', () => {
      const routeData = {
        id: 'test-chain',
        name: 'Test Chain',
        routes: [
          {
            routeIndex: 0,
            routeConfig: { type: 'category', categoryId: 'predefined-fledgling' }
          }
        ]
      };

      const result = validateRouteData(routeData, 'routeChain');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a correct calculatedRoute', () => {
      const routeData = {
        categoryId: 'predefined-fledgling',
        buildings: [
          { order: 1, building: 'Cursor', cost: 15 }
        ],
        algorithm: 'GPL'
      };

      const result = validateRouteData(routeData, 'calculatedRoute');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a correct achievementRoute', () => {
      const routeData = {
        achievementIds: ['achievement-1', 'achievement-2'],
        buildings: [
          { order: 1, building: 'Cursor', cost: 15 }
        ],
        algorithm: 'DFS'
      };

      const result = validateRouteData(routeData, 'achievementRoute');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject savedRoute without id', () => {
      const routeData = {
        name: 'Test Route',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: { buildings: [] }
      };

      const result = validateRouteData(routeData, 'savedRoute');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('id'))).toBe(true);
    });

    it('should reject savedRoute with invalid name length', () => {
      const routeData = {
        id: 'test-route',
        name: 'a'.repeat(101), // Too long
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: { buildings: [] }
      };

      const result = validateRouteData(routeData, 'savedRoute');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('name'))).toBe(true);
    });

    it('should reject routeChain without routes array', () => {
      const routeData = {
        id: 'test-chain',
        name: 'Test Chain'
      };

      const result = validateRouteData(routeData, 'routeChain');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('routes'))).toBe(true);
    });

    it('should reject calculatedRoute without buildings', () => {
      const routeData = {
        categoryId: 'predefined-fledgling'
      };

      const result = validateRouteData(routeData, 'calculatedRoute');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('buildings'))).toBe(true);
    });

    it('should reject invalid algorithm', () => {
      const routeData = {
        id: 'test-route',
        name: 'Test Route',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: {
          buildings: [],
          algorithm: 'INVALID'
        }
      };

      const result = validateRouteData(routeData, 'savedRoute');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('algorithm'))).toBe(true);
    });

    it('should reject routeChain with incorrect routeIndex', () => {
      const routeData = {
        id: 'test-chain',
        name: 'Test Chain',
        routes: [
          {
            routeIndex: 1, // Should be 0
            routeConfig: { type: 'category', categoryId: 'predefined-fledgling' }
          }
        ]
      };

      const result = validateRouteData(routeData, 'routeChain');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('routeIndex'))).toBe(true);
    });
  });

  describe('checkMissingCategoryReferences', () => {
    it('should return empty warnings when category exists', () => {
      const category = {
        id: 'test-category',
        name: 'Test Category',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 1000000
      };
      saveCategory(category);

      const routeData = {
        id: 'test-route',
        name: 'Test Route',
        categoryId: 'test-category',
        versionId: 'v2048',
        routeData: { buildings: [] }
      };

      const warnings = checkMissingCategoryReferences(routeData, 'savedRoute', getCategoryById);
      expect(warnings).toHaveLength(0);
    });

    it('should return warning when category does not exist', () => {
      const routeData = {
        id: 'test-route',
        name: 'Test Route',
        categoryId: 'missing-category',
        versionId: 'v2048',
        routeData: { buildings: [] }
      };

      const warnings = checkMissingCategoryReferences(routeData, 'savedRoute', getCategoryById);
      expect(warnings).toHaveLength(1);
      expect(warnings[0].type).toBe('missingCategory');
      expect(warnings[0].message).toContain('missing-category');
    });

    it('should check categories in routeChain routes', () => {
      const routeData = {
        id: 'test-chain',
        name: 'Test Chain',
        routes: [
          {
            routeIndex: 0,
            routeConfig: {
              type: 'category',
              categoryId: 'missing-category'
            }
          }
        ]
      };

      const warnings = checkMissingCategoryReferences(routeData, 'routeChain', getCategoryById);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].message).toContain('missing-category');
    });

    it('should return empty warnings when getCategoryById is not provided', () => {
      const routeData = {
        id: 'test-route',
        categoryId: 'test-category',
        routeData: { buildings: [] }
      };

      const warnings = checkMissingCategoryReferences(routeData, 'savedRoute', null);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('checkDuplicateRouteId', () => {
    it('should return false when route ID does not exist', () => {
      const isDuplicate = checkDuplicateRouteId('new-route-id', 'savedRoute', getSavedRoutes, getRouteChains);
      expect(isDuplicate).toBe(false);
    });

    it('should return true when savedRoute ID exists', () => {
      const route = {
        id: 'existing-route',
        name: 'Existing Route',
        categoryId: 'predefined-fledgling',
        categoryName: 'Fledgling',
        versionId: 'v2048',
        routeData: { buildings: [] },
        savedAt: Date.now(),
        lastAccessedAt: Date.now()
      };
      saveSavedRoute(route);

      const isDuplicate = checkDuplicateRouteId('existing-route', 'savedRoute', getSavedRoutes, getRouteChains);
      expect(isDuplicate).toBe(true);
    });

    it('should return true when routeChain ID exists', () => {
      const chain = {
        id: 'existing-chain',
        name: 'Existing Chain',
        routes: [
          {
            routeIndex: 0,
            routeConfig: { type: 'category', categoryId: 'predefined-fledgling' }
          }
        ],
        createdAt: Date.now(),
        savedAt: Date.now(),
        lastAccessedAt: Date.now()
      };
      saveRouteChain(chain);

      const isDuplicate = checkDuplicateRouteId('existing-chain', 'routeChain', getSavedRoutes, getRouteChains);
      expect(isDuplicate).toBe(true);
    });

    it('should return false when ID exists but for different route type', () => {
      const route = {
        id: 'shared-id',
        name: 'Saved Route',
        categoryId: 'predefined-fledgling',
        categoryName: 'Fledgling',
        versionId: 'v2048',
        routeData: { buildings: [] },
        savedAt: Date.now(),
        lastAccessedAt: Date.now()
      };
      saveSavedRoute(route);

      // Check for routeChain with same ID - should return false (different type)
      const isDuplicate = checkDuplicateRouteId('shared-id', 'routeChain', getSavedRoutes, getRouteChains);
      expect(isDuplicate).toBe(false);
    });
  });

  describe('validateImportFile', () => {
    it('should validate a correct import file', () => {
      const routeData = {
        id: 'test-route',
        name: 'Test Route',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: { buildings: [] }
      };

      const exportData = {
        version: '1.0.0',
        routeType: 'savedRoute',
        exportedAt: Date.now(),
        routeData: routeData
      };

      const base64Content = btoa(JSON.stringify(exportData));
      const result = validateImportFile(base64Content);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.routeType).toBe('savedRoute');
      expect(result.parsedData).toBeDefined();
    });

    it('should reject invalid base64', () => {
      const result = validateImportFile('invalid-base64!!!');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.stage === 'base64')).toBe(true);
    });

    it('should reject invalid JSON', () => {
      const invalidBase64 = btoa('not json');
      const result = validateImportFile(invalidBase64);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.stage === 'json')).toBe(true);
    });

    it('should reject invalid schema', () => {
      const invalidData = { someField: 'value' };
      const invalidBase64 = btoa(JSON.stringify(invalidData));
      const result = validateImportFile(invalidBase64);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.stage === 'schema')).toBe(true);
    });

    it('should reject invalid route data', () => {
      const invalidData = {
        version: '1.0.0',
        routeType: 'savedRoute',
        exportedAt: Date.now(),
        routeData: {
          // Missing required fields
          name: 'Test'
        }
      };

      const invalidBase64 = btoa(JSON.stringify(invalidData));
      const result = validateImportFile(invalidBase64);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.stage === 'route')).toBe(true);
    });
  });

  describe('handleDuplicateRouteId', () => {
    it('should return original ID for overwrite choice', async () => {
      const result = await handleDuplicateRouteId('test-id', 'savedRoute', 'overwrite');
      expect(result).toBe('test-id');
    });

    it('should return new ID for rename choice', async () => {
      const result = await handleDuplicateRouteId('test-id', 'savedRoute', 'rename');
      expect(result).not.toBe('test-id');
      expect(result).toContain('saved-route-');
    });

    it('should return empty string for cancel choice', async () => {
      const result = await handleDuplicateRouteId('test-id', 'savedRoute', 'cancel');
      expect(result).toBe('');
    });

    it('should throw error for invalid choice', async () => {
      await expect(
        handleDuplicateRouteId('test-id', 'savedRoute', 'invalid')
      ).rejects.toThrow();
    });
  });

  describe('generateNewRouteId', () => {
    it('should generate unique IDs for savedRoute', () => {
      const id1 = generateNewRouteId('savedRoute');
      const id2 = generateNewRouteId('savedRoute');
      
      expect(id1).not.toBe(id2);
      expect(id1).toContain('saved-route-');
      expect(id2).toContain('saved-route-');
    });

    it('should generate unique IDs for routeChain', () => {
      const id1 = generateNewRouteId('routeChain');
      const id2 = generateNewRouteId('routeChain');
      
      expect(id1).not.toBe(id2);
      expect(id1).toContain('route-chain-');
      expect(id2).toContain('route-chain-');
    });

    it('should include timestamp in generated ID', () => {
      const id = generateNewRouteId('savedRoute');
      const timestamp = Date.now();
      // ID should contain timestamp (within reasonable range)
      expect(id).toMatch(/\d{13}/); // 13 digits for timestamp
    });
  });

  describe('Error Classes', () => {
    it('should create RouteImportError with correct properties', () => {
      const error = new RouteImportError('Test error', 'validation', new Error('original'));
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.validationStage).toBe('validation');
      expect(error.originalError).toBeInstanceOf(Error);
    });

    it('should create RouteExportError with correct properties', () => {
      const error = new RouteExportError('Test error', 'savedRoute', new Error('original'));
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.routeType).toBe('savedRoute');
      expect(error.originalError).toBeInstanceOf(Error);
    });
  });
});


