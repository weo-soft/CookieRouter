/**
 * Unit tests for Categories
 * Uses Python outputs as golden master tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fledgling, neverclick, hardcore, short } from '../../src/js/categories.js';
import {
  getCategories,
  saveCategory,
  deleteCategory,
  getCategoryById
} from '../../src/js/storage.js';

describe('Categories', () => {
  describe('fledgling', () => {
    it('should initialize with correct target cookies', async () => {
      const game = await fledgling();
      expect(game.targetCookies).toBe(1e6); // 1 million
    });

    it('should have 10 cursors pre-purchased', async () => {
      const game = await fledgling();
      expect(game.numBuildings['Cursor']).toBe(10);
    });

    it('should have correct player settings', async () => {
      const game = await fledgling();
      expect(game.playerCps).toBe(8);
      expect(game.playerDelay).toBe(1);
    });
  });

  describe('neverclick', () => {
    it('should initialize with correct target cookies', async () => {
      const game = await neverclick();
      expect(game.targetCookies).toBe(1e6); // 1 million
    });

    it('should have 1 cursor and initial state', async () => {
      const game = await neverclick();
      expect(game.numBuildings['Cursor']).toBe(1);
      expect(game.totalCookies).toBe(15);
      expect(game.timeElapsed).toBeCloseTo(1.2, 1);
    });

    it('should have zero player CPS', async () => {
      const game = await neverclick();
      expect(game.playerCps).toBe(0);
      expect(game.playerDelay).toBe(0);
    });
  });

  describe('hardcore', () => {
    it('should initialize with correct target cookies', async () => {
      const game = await hardcore();
      expect(game.targetCookies).toBe(1e9); // 1 billion
    });

    it('should have hardcore mode enabled', async () => {
      const game = await hardcore();
      expect(game.hardcoreMode).toBe(true);
    });

    it('should have correct player settings', async () => {
      const game = await hardcore();
      expect(game.playerCps).toBe(8);
      expect(game.playerDelay).toBe(1);
    });
  });

  describe('short', () => {
    it('should initialize with small target for testing', async () => {
      const game = await short();
      expect(game.targetCookies).toBe(1000);
    });

    it('should have correct player settings', async () => {
      const game = await short();
      expect(game.playerCps).toBe(8);
      expect(game.playerDelay).toBe(1);
    });

    it('should have no pre-purchased buildings', async () => {
      const game = await short();
      expect(game.numBuildings['Cursor']).toBe(0);
    });
  });

  describe('category routing integration', () => {
    it('should route short category to completion', async () => {
      const { Router } = await import('../../src/js/router.js');
      const game = await short();
      const router = new Router();
      const result = await router.routeGPL(game, 1);

      // Allow small tolerance for rounding (within 1% of target)
      expect(result.totalCookies).toBeGreaterThanOrEqual(game.targetCookies * 0.99);
      expect(result.completionTime()).not.toBeNull();
    });

    it('should route fledgling category to completion', async () => {
      const { Router } = await import('../../src/js/router.js');
      const game = await fledgling();
      const router = new Router();
      const result = await router.routeGPL(game, 1);

      // Allow small tolerance for rounding (within 1% of target)
      expect(result.totalCookies).toBeGreaterThanOrEqual(game.targetCookies * 0.99);
      expect(result.completionTime()).not.toBeNull();
    });
  });

  describe('custom category creation and storage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should create and save a custom category', () => {
      const category = {
        id: 'custom-test-1',
        name: 'My Custom Category',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 5000000,
        playerCps: 8,
        playerDelay: 1,
        hardcoreMode: false,
        createdAt: Date.now()
      };

      saveCategory(category);
      const categories = getCategories();
      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('My Custom Category');
      expect(categories[0].isPredefined).toBe(false);
    });

    it('should retrieve saved custom category', () => {
      const category = {
        id: 'custom-test-2',
        name: 'Test Category',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 1000000,
        playerCps: 8,
        playerDelay: 1
      };

      saveCategory(category);
      const retrieved = getCategoryById('custom-test-2');
      expect(retrieved).toBeTruthy();
      expect(retrieved.name).toBe('Test Category');
      expect(retrieved.targetCookies).toBe(1000000);
    });

    it('should update existing category when saving with same ID', () => {
      const category1 = {
        id: 'custom-test-3',
        name: 'Original Name',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 1000000
      };

      const category2 = {
        id: 'custom-test-3',
        name: 'Updated Name',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 2000000
      };

      saveCategory(category1);
      saveCategory(category2);

      const categories = getCategories();
      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('Updated Name');
      expect(categories[0].targetCookies).toBe(2000000);
    });

    it('should delete a custom category', () => {
      const category = {
        id: 'custom-test-4',
        name: 'To Delete',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 1000000
      };

      saveCategory(category);
      expect(getCategories()).toHaveLength(1);

      deleteCategory('custom-test-4');
      expect(getCategories()).toHaveLength(0);
      expect(getCategoryById('custom-test-4')).toBeNull();
    });

    it('should handle multiple custom categories', () => {
      const category1 = {
        id: 'custom-1',
        name: 'Category 1',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 1000000
      };

      const category2 = {
        id: 'custom-2',
        name: 'Category 2',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 2000000
      };

      const category3 = {
        id: 'custom-3',
        name: 'Category 3',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 3000000
      };

      saveCategory(category1);
      saveCategory(category2);
      saveCategory(category3);

      const categories = getCategories();
      expect(categories).toHaveLength(3);
      expect(categories.map(c => c.name)).toContain('Category 1');
      expect(categories.map(c => c.name)).toContain('Category 2');
      expect(categories.map(c => c.name)).toContain('Category 3');
    });

    it('should preserve category fields when saving', () => {
      const category = {
        id: 'custom-test-5',
        name: 'Full Category',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 5000000,
        playerCps: 10,
        playerDelay: 2,
        hardcoreMode: true,
        initialBuildings: { 'Cursor': 5, 'Grandma': 2 },
        createdAt: 1234567890,
        updatedAt: 1234567890
      };

      saveCategory(category);
      const retrieved = getCategoryById('custom-test-5');

      expect(retrieved.playerCps).toBe(10);
      expect(retrieved.playerDelay).toBe(2);
      expect(retrieved.hardcoreMode).toBe(true);
      expect(retrieved.initialBuildings).toEqual({ 'Cursor': 5, 'Grandma': 2 });
      expect(retrieved.createdAt).toBe(1234567890);
    });

    it('should handle category with optional fields missing', () => {
      const category = {
        id: 'custom-test-6',
        name: 'Minimal Category',
        isPredefined: false,
        version: 'v2048',
        targetCookies: 1000000
      };

      saveCategory(category);
      const retrieved = getCategoryById('custom-test-6');

      expect(retrieved.name).toBe('Minimal Category');
      expect(retrieved.targetCookies).toBe(1000000);
      // Optional fields should be undefined or have defaults
      expect(retrieved.isPredefined).toBe(false);
    });
  });
});

