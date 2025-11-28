/**
 * Integration test for category selection and route calculation
 * Tests the complete flow from category selection to route display
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CategorySelector } from '../../src/js/ui/category-selector.js';
import { RouteDisplay } from '../../src/js/ui/route-display.js';
import { calculateRoute } from '../../src/js/simulation.js';

describe('Category Selection and Route Calculation Integration', () => {
  let categorySelector;
  let routeDisplay;

  beforeEach(() => {
    // Create mock DOM elements
    document.body.innerHTML = `
      <div id="category-section"></div>
      <div id="route-section"></div>
    `;
    
    categorySelector = new CategorySelector('category-section', () => {});
    routeDisplay = new RouteDisplay('route-section');
  });

  it('should initialize category selector with predefined categories', async () => {
    await categorySelector.init();
    const selected = categorySelector.getSelectedCategory();
    expect(selected).toBeNull(); // No category selected initially
    
    // Verify categories are loaded
    const categories = categorySelector.categories;
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some(c => c.name === 'Short (Test)')).toBe(true);
  });

  it('should calculate route for short category', async () => {
    const category = {
      id: 'test-short',
      name: 'Short Test',
      isPredefined: true,
      version: 'v2031',
      targetCookies: 1000,
      playerCps: 8,
      playerDelay: 1,
      hardcoreMode: false
    };

    const route = await calculateRoute(category);
    
    expect(route).toBeDefined();
    expect(route.categoryId).toBe(category.id);
    expect(route.buildings).toBeDefined();
    expect(Array.isArray(route.buildings)).toBe(true);
    expect(route.buildings.length).toBeGreaterThan(0);
    expect(route.completionTime).toBeGreaterThan(0);
    expect(route.algorithm).toBe('GPL');
  });

  it('should display route with building steps', async () => {
    const category = {
      id: 'test-short',
      name: 'Short Test',
      isPredefined: true,
      version: 'v2031',
      targetCookies: 1000,
      playerCps: 8,
      playerDelay: 1,
      hardcoreMode: false
    };

    const route = await calculateRoute(category);
    routeDisplay.displayRoute(route);

    const container = document.getElementById('route-section');
    expect(container.innerHTML).toContain('Building Purchase Route');
    expect(container.innerHTML).toContain(route.buildings[0].buildingName);
  });

  it('should handle route calculation with starting buildings', async () => {
    const category = {
      id: 'test-short',
      name: 'Short Test',
      isPredefined: true,
      version: 'v2031',
      targetCookies: 1000,
      playerCps: 8,
      playerDelay: 1,
      hardcoreMode: false
    };

    const startingBuildings = { 'Cursor': 5 };
    const route = await calculateRoute(category, startingBuildings);
    
    expect(route.startingBuildings).toEqual(startingBuildings);
    expect(route.buildings.length).toBeGreaterThan(0);
  });

  it('should show loading state during calculation', () => {
    routeDisplay.showLoading();
    const container = document.getElementById('route-section');
    expect(container.innerHTML).toContain('Calculating optimal route');
    expect(container.innerHTML).toContain('spinner');
  });

  it('should show error state on calculation failure', () => {
    routeDisplay.showError('Test error message');
    const container = document.getElementById('route-section');
    expect(container.innerHTML).toContain('Test error message');
    expect(container.innerHTML).toContain('Retry');
  });
});

