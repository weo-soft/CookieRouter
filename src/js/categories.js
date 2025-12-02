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
import { loadVersionById } from './utils/version-loader.js';

// Automatically import all category JSON files
// This uses Vite's import.meta.glob to discover all JSON files in the categories directory
const categoryModules = import.meta.glob('../data/categories/*.json', { eager: true });

// Version mapping - eagerly load all versions at module initialization
// This maintains backward compatibility with synchronous category functions
const versionMap = {};
const versionMapPromise = (async () => {
  const supportedVersions = ['v2031', 'v2048', 'v10466', 'v10466_xmas', 'v2052'];
  for (const versionId of supportedVersions) {
    try {
      versionMap[versionId] = await loadVersionById(versionId);
    } catch (error) {
      console.error(`Failed to load version ${versionId}:`, error);
    }
  }
  return versionMap;
})();

// Ensure versions are loaded before category functions are created
// This is a best-effort approach - if versions aren't loaded yet when a category
// function is called, it will try to load on-demand
async function getVersion(versionId) {
  // Wait for initial loading to complete
  await versionMapPromise;
  
  // If version is in map, return it
  if (versionMap[versionId]) {
    return versionMap[versionId];
  }
  
  // Otherwise, load on-demand
  try {
    const version = await loadVersionById(versionId);
    versionMap[versionId] = version;
    return version;
  } catch (error) {
    throw new Error(`Failed to load version ${versionId}: ${error.message}`);
  }
}

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
  return async function(version = null, playerCps = null, playerDelay = null) {
    // Use provided version or load from config
    let gameVersion;
    if (version) {
      gameVersion = version;
    } else {
      // Wait for version map to be populated, then get version
      await versionMapPromise;
      gameVersion = versionMap[config.version];
      
      if (!gameVersion) {
        // Try loading on-demand
        try {
          gameVersion = await getVersion(config.version);
        } catch (error) {
          throw new Error(`Unknown version: ${config.version}. ${error.message}`);
        }
      }
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
  
  // Create category function from config
  categoryExports[fileName] = createCategoryFunction(config);
}

// Export all category functions
export default categoryExports;

// Export categories as a named export for backward compatibility
export const categories = categoryExports;

// Also export individual category functions for convenience
export const {
  short,
  fledgling,
  neverclick,
  hardcore,
  nevercore,
  speedbaking,
  speedbaking2,
  speedbaking3,
  longhaul,
  forty,
  fortyHoliday,
  longhaul2
} = categoryExports;
