/**
 * Unit tests for Route Serializer
 * Tests serialization, deserialization, and base64 encoding/decoding
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  serializeRouteForExport,
  deserializeRouteFromImport
} from '../../src/js/utils/route-serializer.js';

describe('Route Serializer', () => {
  beforeEach(() => {
    // Clear any localStorage state if needed
    localStorage.clear();
  });

  describe('serializeRouteForExport', () => {
    it('should serialize a savedRoute to base64-encoded JSON', () => {
      const routeData = {
        id: 'test-route-1',
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
          completionTime: 123.45
        },
        savedAt: 1737984000000,
        lastAccessedAt: 1737984000000
      };

      const result = serializeRouteForExport(routeData, 'savedRoute');
      
      // Should be a base64 string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      
      // Should be valid base64 (can be decoded)
      expect(() => atob(result)).not.toThrow();
      
      // Decode and verify structure
      const decoded = JSON.parse(atob(result));
      expect(decoded).toHaveProperty('version');
      expect(decoded).toHaveProperty('routeType', 'savedRoute');
      expect(decoded).toHaveProperty('exportedAt');
      expect(decoded).toHaveProperty('routeData');
      expect(decoded.routeData).toEqual(routeData);
    });

    it('should serialize a routeChain to base64-encoded JSON', () => {
      const routeData = {
        id: 'test-chain-1',
        name: 'Test Chain',
        routes: [
          {
            routeIndex: 0,
            routeConfig: {
              type: 'category',
              categoryId: 'predefined-fledgling'
            },
            calculatedRoute: {
              buildings: [{ order: 1, building: 'Cursor', cost: 15 }]
            }
          }
        ],
        createdAt: 1737984000000,
        savedAt: 1737984000000,
        lastAccessedAt: 1737984000000
      };

      const result = serializeRouteForExport(routeData, 'routeChain');
      
      expect(typeof result).toBe('string');
      const decoded = JSON.parse(atob(result));
      expect(decoded.routeType).toBe('routeChain');
      expect(decoded.routeData).toEqual(routeData);
    });

    it('should serialize a calculatedRoute to base64-encoded JSON', () => {
      const routeData = {
        categoryId: 'predefined-fledgling',
        categoryName: 'Fledgling',
        versionId: 'v2048',
        buildings: [
          { order: 1, building: 'Cursor', cost: 15, cps: 0.1, time: 0 }
        ],
        algorithm: 'GPL',
        lookahead: 1,
        completionTime: 123.45
      };

      const result = serializeRouteForExport(routeData, 'calculatedRoute');
      
      expect(typeof result).toBe('string');
      const decoded = JSON.parse(atob(result));
      expect(decoded.routeType).toBe('calculatedRoute');
      expect(decoded.routeData).toEqual(routeData);
    });

    it('should serialize an achievementRoute to base64-encoded JSON', () => {
      const routeData = {
        achievementIds: ['achievement-1', 'achievement-2'],
        versionId: 'v2048',
        buildings: [
          { order: 1, building: 'Cursor', cost: 15 }
        ],
        algorithm: 'DFS',
        completionTime: 234.56
      };

      const result = serializeRouteForExport(routeData, 'achievementRoute');
      
      expect(typeof result).toBe('string');
      const decoded = JSON.parse(atob(result));
      expect(decoded.routeType).toBe('achievementRoute');
      expect(decoded.routeData).toEqual(routeData);
    });

    it('should include exportedAt timestamp', () => {
      const routeData = {
        id: 'test-route-1',
        name: 'Test Route',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: { buildings: [] }
      };

      const beforeTime = Date.now();
      const result = serializeRouteForExport(routeData, 'savedRoute');
      const afterTime = Date.now();
      
      const decoded = JSON.parse(atob(result));
      expect(decoded.exportedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(decoded.exportedAt).toBeLessThanOrEqual(afterTime);
    });

    it('should include version field', () => {
      const routeData = {
        id: 'test-route-1',
        name: 'Test Route',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: { buildings: [] }
      };

      const result = serializeRouteForExport(routeData, 'savedRoute');
      const decoded = JSON.parse(atob(result));
      
      expect(decoded.version).toBe('1.0');
    });
  });

  describe('deserializeRouteFromImport', () => {
    it('should deserialize a base64-encoded savedRoute', () => {
      const originalRoute = {
        id: 'test-route-1',
        name: 'Test Route',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: { buildings: [] }
      };

      const base64Content = serializeRouteForExport(originalRoute, 'savedRoute');
      const result = deserializeRouteFromImport(base64Content);
      
      expect(result.routeType).toBe('savedRoute');
      expect(result.routeData).toEqual(originalRoute);
      expect(result.exportedAt).toBeDefined();
      expect(result.version).toBe('1.0');
    });

    it('should deserialize a base64-encoded routeChain', () => {
      const originalRoute = {
        id: 'test-chain-1',
        name: 'Test Chain',
        routes: [
          {
            routeIndex: 0,
            routeConfig: { type: 'category', categoryId: 'predefined-fledgling' },
            calculatedRoute: { buildings: [] }
          }
        ]
      };

      const base64Content = serializeRouteForExport(originalRoute, 'routeChain');
      const result = deserializeRouteFromImport(base64Content);
      
      expect(result.routeType).toBe('routeChain');
      expect(result.routeData).toEqual(originalRoute);
    });

    it('should throw error for invalid base64', () => {
      expect(() => {
        deserializeRouteFromImport('invalid-base64!!!');
      }).toThrow();
    });

    it('should throw error for non-JSON base64 content', () => {
      const invalidBase64 = btoa('not json content');
      expect(() => {
        deserializeRouteFromImport(invalidBase64);
      }).toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidData = { someField: 'value' };
      const invalidBase64 = btoa(JSON.stringify(invalidData));
      
      expect(() => {
        deserializeRouteFromImport(invalidBase64);
      }).toThrow();
    });

    it('should preserve complex nested structures', () => {
      const complexRoute = {
        id: 'complex-route',
        name: 'Complex Route',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: {
          buildings: [
            { order: 1, building: 'Cursor', cost: 15, cps: 0.1, time: 0 },
            { order: 2, building: 'Grandma', cost: 100, cps: 1, time: 10.5 }
          ],
          algorithm: 'GPL',
          lookahead: 2,
          completionTime: 123.45,
          startingBuildings: { Cursor: 5, Grandma: 2 },
          metadata: {
            calculatedAt: 1737984000000,
            version: 'v2048'
          }
        }
      };

      const base64Content = serializeRouteForExport(complexRoute, 'savedRoute');
      const result = deserializeRouteFromImport(base64Content);
      
      expect(result.routeData).toEqual(complexRoute);
      expect(result.routeData.routeData.buildings).toHaveLength(2);
      expect(result.routeData.routeData.metadata).toBeDefined();
    });
  });

  describe('Base64 encoding/decoding', () => {
    it('should correctly encode and decode special characters', () => {
      const routeData = {
        id: 'test-route',
        name: 'Route with "quotes" & special chars: <>&',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: { buildings: [] }
      };

      const encoded = serializeRouteForExport(routeData, 'savedRoute');
      const decoded = deserializeRouteFromImport(encoded);
      
      expect(decoded.routeData.name).toBe('Route with "quotes" & special chars: <>&');
    });

    it('should handle empty route data', () => {
      const routeData = {
        id: 'empty-route',
        name: 'Empty Route',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: { buildings: [] }
      };

      const encoded = serializeRouteForExport(routeData, 'savedRoute');
      const decoded = deserializeRouteFromImport(encoded);
      
      expect(decoded.routeData.routeData.buildings).toEqual([]);
    });

    it('should handle large route data', () => {
      const largeBuildings = Array.from({ length: 1000 }, (_, i) => ({
        order: i + 1,
        building: `Building${i}`,
        cost: i * 10,
        cps: i * 0.1,
        time: i * 0.5
      }));

      const routeData = {
        id: 'large-route',
        name: 'Large Route',
        categoryId: 'predefined-fledgling',
        versionId: 'v2048',
        routeData: {
          buildings: largeBuildings,
          algorithm: 'GPL',
          completionTime: 5000
        }
      };

      const encoded = serializeRouteForExport(routeData, 'savedRoute');
      const decoded = deserializeRouteFromImport(encoded);
      
      expect(decoded.routeData.routeData.buildings).toHaveLength(1000);
      expect(decoded.routeData.routeData.buildings[999].building).toBe('Building999');
    });
  });
});

