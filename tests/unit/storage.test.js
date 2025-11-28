/**
 * Unit tests for Storage utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getCategories,
  saveCategory,
  deleteCategory,
  getCategoryById,
  getRoutes,
  saveRoute,
  getRouteById,
  getRoutesByCategory,
  deleteRoute,
  getProgress,
  saveProgress,
  updateProgress,
  clearProgress
} from '../../src/js/storage.js';

describe('Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clear localStorage after each test
    localStorage.clear();
  });

  describe('Categories', () => {
    it('should return empty array when no categories exist', () => {
      const categories = getCategories();
      expect(categories).toEqual([]);
    });

    it('should save and retrieve a category', () => {
      const category = {
        id: 'test-1',
        name: 'Test Category',
        isPredefined: false,
        version: 'v2031',
        targetCookies: 1000000
      };

      saveCategory(category);
      const categories = getCategories();
      expect(categories).toHaveLength(1);
      expect(categories[0]).toEqual(category);
    });

    it('should update existing category', () => {
      const category1 = {
        id: 'test-1',
        name: 'Test Category',
        isPredefined: false,
        version: 'v2031',
        targetCookies: 1000000
      };

      saveCategory(category1);
      const category2 = { ...category1, name: 'Updated Category' };
      saveCategory(category2);

      const categories = getCategories();
      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('Updated Category');
    });

    it('should delete a category', () => {
      const category = {
        id: 'test-1',
        name: 'Test Category',
        isPredefined: false,
        version: 'v2031',
        targetCookies: 1000000
      };

      saveCategory(category);
      deleteCategory('test-1');
      const categories = getCategories();
      expect(categories).toHaveLength(0);
    });

    it('should get category by ID', () => {
      const category = {
        id: 'test-1',
        name: 'Test Category',
        isPredefined: false,
        version: 'v2031',
        targetCookies: 1000000
      };

      saveCategory(category);
      const found = getCategoryById('test-1');
      expect(found).toEqual(category);
    });

    it('should return null for non-existent category', () => {
      const found = getCategoryById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('Routes', () => {
    it('should return empty array when no routes exist', () => {
      const routes = getRoutes();
      expect(routes).toEqual([]);
    });

    it('should save and retrieve a route', () => {
      const route = {
        id: 'route-1',
        categoryId: 'cat-1',
        buildings: [
          {
            order: 1,
            buildingName: 'Cursor',
            cookiesRequired: 15,
            cookiesPerSecond: 0.1,
            timeElapsed: 0,
            totalCookies: 0
          }
        ],
        calculatedAt: Date.now(),
        algorithm: 'GPL',
        lookahead: 1,
        completionTime: 100
      };

      saveRoute(route);
      const routes = getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual(route);
    });

    it('should get route by ID', () => {
      const route = {
        id: 'route-1',
        categoryId: 'cat-1',
        buildings: [],
        calculatedAt: Date.now(),
        algorithm: 'GPL',
        completionTime: 100
      };

      saveRoute(route);
      const found = getRouteById('route-1');
      expect(found).toEqual(route);
    });

    it('should get routes by category ID', () => {
      const route1 = {
        id: 'route-1',
        categoryId: 'cat-1',
        buildings: [],
        calculatedAt: Date.now(),
        algorithm: 'GPL',
        completionTime: 100
      };
      const route2 = {
        id: 'route-2',
        categoryId: 'cat-2',
        buildings: [],
        calculatedAt: Date.now(),
        algorithm: 'GPL',
        completionTime: 200
      };

      saveRoute(route1);
      saveRoute(route2);
      const routes = getRoutesByCategory('cat-1');
      expect(routes).toHaveLength(1);
      expect(routes[0].id).toBe('route-1');
    });

    it('should delete a route', () => {
      const route = {
        id: 'route-1',
        categoryId: 'cat-1',
        buildings: [],
        calculatedAt: Date.now(),
        algorithm: 'GPL',
        completionTime: 100
      };

      saveRoute(route);
      deleteRoute('route-1');
      const routes = getRoutes();
      expect(routes).toHaveLength(0);
    });
  });

  describe('Progress', () => {
    it('should return null when no progress exists', () => {
      const progress = getProgress('route-1');
      expect(progress).toBeNull();
    });

    it('should save and retrieve progress', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [1, 2, 3],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      const found = getProgress('route-1');
      expect(found).toEqual(progress);
    });

    it('should update progress', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [1, 2],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      updateProgress('route-1', [1, 2, 3, 4]);
      const updated = getProgress('route-1');
      expect(updated.completedBuildings).toEqual([1, 2, 3, 4]);
    });

    it('should clear progress', () => {
      const progress = {
        routeId: 'route-1',
        completedBuildings: [1, 2, 3],
        lastUpdated: Date.now()
      };

      saveProgress(progress);
      clearProgress('route-1');
      const found = getProgress('route-1');
      expect(found).toBeNull();
    });

    it('should throw error when updating non-existent progress', () => {
      expect(() => {
        updateProgress('non-existent', [1, 2]);
      }).toThrow();
    });
  });

  describe('Error handling', () => {
    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('cookieRouter:categories', 'invalid json');
      const categories = getCategories();
      expect(categories).toEqual([]);
    });

    it('should handle missing keys gracefully', () => {
      const categories = getCategories();
      expect(categories).toEqual([]);
    });
  });
});

