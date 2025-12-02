/**
 * Predefined speedrun categories
 * Ported from Python categories.py
 * Categories are now loaded from JSON files in src/data/categories/
 * 
 * To add a new category, simply create a JSON file in src/data/categories/
 * with the same structure as the existing files. It will be automatically
 * discovered and exported as a function with the same name (without .json extension).
 */

import { Game } from './game.js';
import v2031 from '../data/versions/v2031.js';
import v2048 from '../data/versions/v2048.js';
import v2052 from '../data/versions/v2052.js';
import v10466 from '../data/versions/v10466.js';
import v10466_xmas from '../data/versions/v10466_xmas.js';

// Automatically import all category JSON files
// This uses Vite's import.meta.glob to discover all JSON files in the categories directory
const categoryModules = import.meta.glob('../data/categories/*.json', { eager: true });

// Version mapping
const versionMap = {
  'v2031': v2031,
  'v2048': v2048,
  'v2052': v2052,
  'v10466': v10466,
  'v10466_xmas': v10466_xmas
};

/**
 * Evaluate a targetCookies expression (supports both numbers and string expressions)
 * Uses Function constructor for safer evaluation than eval
 */
function evaluateTargetCookies(value) {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    // Safe evaluation of mathematical expressions
    // Only allow numbers, operators, and parentheses
    if (/^[\d\s*+\-/().\s]+$/.test(value)) {
      try {
        // Use Function constructor instead of eval for safer evaluation
        return new Function('return ' + value)();
      } catch (e) {
        console.error(`Error evaluating targetCookies expression: ${value}`, e);
        return 0;
      }
    }
  }
  return 0;
}

/**
 * Create a category function from a JSON configuration
 */
function createCategoryFunction(config) {
  return function(version = null, playerCps = null, playerDelay = null) {
    // Use provided version or default from config
    const gameVersion = version || versionMap[config.version];
    if (!gameVersion) {
      throw new Error(`Unknown version: ${config.version}`);
    }

    const game = new Game(gameVersion);
    
    // Set target cookies
    game.targetCookies = evaluateTargetCookies(config.targetCookies);
    
    // Set player settings (use provided values or defaults from config)
    game.playerCps = playerCps !== null ? playerCps : config.defaultPlayerCps;
    game.playerDelay = playerDelay !== null ? playerDelay : config.defaultPlayerDelay;
    
    // Set hardcore mode
    game.hardcoreMode = config.hardcoreMode || false;
    
    // Set initial buildings
    if (config.initialBuildings) {
      for (const [buildingName, count] of Object.entries(config.initialBuildings)) {
        game.numBuildings[buildingName] = count;
      }
    }
    
    // Set initial cookies and time
    if (config.initialCookies !== null && config.initialCookies !== undefined) {
      game.totalCookies = config.initialCookies;
    }
    if (config.initialTime !== null && config.initialTime !== undefined) {
      game.timeElapsed = config.initialTime;
    }
    
    // Make initial purchases
    if (config.initialPurchases && Array.isArray(config.initialPurchases)) {
      for (const buildingName of config.initialPurchases) {
        game.purchaseBuilding(buildingName);
      }
    }
    
    return game;
  };
}

// Dynamically create and export category functions from all discovered JSON files
const categoryExports = {};

for (const [path, module] of Object.entries(categoryModules)) {
  // Extract category name from file path (e.g., '../data/categories/fledgling.json' -> 'fledgling')
  const fileName = path.split('/').pop().replace('.json', '');
  const config = module.default || module;
  
  // Validate that the config has a name field
  if (!config.name) {
    console.warn(`Category file ${path} is missing a 'name' field, skipping.`);
    continue;
  }
  
  // Use the name from config, or fall back to filename
  const categoryName = config.name || fileName;
  
  // Create and export the category function
  categoryExports[categoryName] = createCategoryFunction(config);
}

// Export all category functions individually for backward compatibility
// Known categories are explicitly exported for type safety and IDE support
export const fledgling = categoryExports.fledgling;
export const neverclick = categoryExports.neverclick;
export const hardcore = categoryExports.hardcore;
export const short = categoryExports.short;
export const forty = categoryExports.forty;
export const fortyHoliday = categoryExports.fortyHoliday;
export const longhaul = categoryExports.longhaul;
export const nevercore = categoryExports.nevercore;

// Export all categories as an object for dynamic access
// New categories can be accessed via: import { categories } from './categories.js'; categories.newCategory()
// Or through dynamic imports: const cats = await import('./categories.js'); cats.newCategory()
export const categories = categoryExports;

