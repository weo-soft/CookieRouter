/**
 * Simulation functions for calculating routes
 * Implements the simulation contract from contracts/simulation.md
 */

import { Router } from './router.js';
import { saveRoute } from './storage.js';
import { getImportedSaveGame } from './save-game-importer.js';

/**
 * Calculates the optimal building purchase route for a given category
 * @param {Object} category - Category configuration
 * @param {Object} startingBuildings - Optional map of building names to counts already owned (manual override)
 * @param {Object} options - Optional simulation options
 *   - algorithm: 'GPL' or 'DFS' (default: 'GPL')
 *   - lookahead: number (default: 1)
 *   - onProgress: function
 *   - manualUpgrades: Array of upgrade names already purchased
 * @param {string} versionId - Game version ID (default: 'v2052', can be overridden by imported save)
 * @returns {Promise<Object>} Route object with metadata about imported data usage
 */
export async function calculateRoute(category, startingBuildings = {}, options = {}, versionId = 'v2052') {
  // Check for imported save game data
  const importedSaveGame = getImportedSaveGame();
  let usedImportedData = false;
  let effectiveVersionId = versionId;
  let effectiveStartingBuildings = { ...startingBuildings };
  let effectiveHardcoreMode = category.hardcoreMode || false;

  // Use imported save game data if available
  if (importedSaveGame) {
    usedImportedData = true;
    
    // Use imported version if available and not manually overridden
    if (importedSaveGame.version && versionId === 'v2052') {
      effectiveVersionId = importedSaveGame.version;
    }
    
    // Merge imported building counts with manual starting buildings
    // Manual starting buildings take precedence (override imported data)
    if (importedSaveGame.buildingCounts) {
      effectiveStartingBuildings = { ...importedSaveGame.buildingCounts, ...startingBuildings };
    }
    
    // Use imported hardcore mode if category doesn't specify it
    if (importedSaveGame.hardcoreMode !== undefined && category.hardcoreMode === undefined) {
      effectiveHardcoreMode = importedSaveGame.hardcoreMode;
    }
  }

  const {
    algorithm = 'GPL',
    lookahead = 1,
    onProgress = null
  } = options;

  // Import game and categories dynamically to avoid circular dependencies
  const { Game } = await import('./game.js');
  const categoryFunctions = await import('./categories.js');
  
  // Load the selected version (use effective version from imported data if available)
  let version;
  try {
    const versionModules = await import(`../data/versions/${effectiveVersionId}.js`);
    version = versionModules.default;
  } catch (error) {
    console.warn(`Failed to load version ${effectiveVersionId}, falling back to v2052`, error);
    const versionModules = await import('../data/versions/v2052.js');
    version = versionModules.default;
    effectiveVersionId = 'v2052';
  }

  // Create game instance from category
  let game;
  if (category.isPredefined) {
    // Map category names to functions
    const categoryMap = {
      'short (test)': 'short',
      'fledgling': 'fledgling',
      'neverclick': 'neverclick',
      'hardcore': 'hardcore',
      'forty': 'forty',
      'forty holiday': 'fortyHoliday',
      'longhaul': 'longhaul',
      'nevercore': 'nevercore'
    };
    
    const categoryName = category.name.toLowerCase();
    const functionName = categoryMap[categoryName];
    
    if (functionName && categoryFunctions[functionName]) {
      game = categoryFunctions[functionName](version, category.playerCps || 8, category.playerDelay || 1);
    } else {
      // Fallback: create game manually
      game = new Game(version);
      game.targetCookies = category.targetCookies;
      game.playerCps = category.playerCps || 8;
      game.playerDelay = category.playerDelay || 1;
      game.hardcoreMode = category.hardcoreMode || false;
    }
  } else {
    // Create game from custom category
    game = new Game(version);
    game.targetCookies = category.targetCookies;
    game.playerCps = category.playerCps || 8;
    game.playerDelay = category.playerDelay || 1;
    game.hardcoreMode = effectiveHardcoreMode;
    
    // Apply initial buildings from category
    if (category.initialBuildings) {
      for (const [buildingName, count] of Object.entries(category.initialBuildings)) {
        game.numBuildings[buildingName] = count;
      }
    }
  }

  // Apply purchased upgrades from imported save and manual setup
  let purchasedUpgrades = [];
  if (importedSaveGame && importedSaveGame.upgrades) {
    purchasedUpgrades = [...importedSaveGame.upgrades];
  }
  // Manual upgrades take precedence (override imported)
  if (options.manualUpgrades && Array.isArray(options.manualUpgrades)) {
    purchasedUpgrades = [...options.manualUpgrades];
  }
  
  // Apply purchased upgrades to the game
  if (purchasedUpgrades.length > 0) {
    const upgradeMap = new Map();
    for (const upgrade of version.menu) {
      upgradeMap.set(upgrade.name, upgrade);
    }
    
    for (const upgradeName of purchasedUpgrades) {
      const upgrade = upgradeMap.get(upgradeName);
      if (upgrade && game.hasSatisfied(upgrade.req)) {
        // Remove from menu
        game.menu.delete(upgrade);
        // Apply effects
        for (const buildingName in upgrade.effects) {
          game.effects[buildingName].push(upgrade.effects[buildingName]);
        }
        // Add to history
        game.history.push(upgrade.name);
      }
    }
  }

  // Apply starting buildings (merged from imported data and manual override)
  for (const [buildingName, count] of Object.entries(effectiveStartingBuildings)) {
    if (game.buildingNames.includes(buildingName)) {
      game.numBuildings[buildingName] = (game.numBuildings[buildingName] || 0) + count;
    }
  }

  // Route the game
  const calculationStartTime = performance.now();
  const router = new Router();
  let result;
  
  if (algorithm === 'GPL') {
    result = await router.routeGPL(game, lookahead, onProgress);
  } else if (algorithm === 'DFS') {
    result = router.routeDFS(game);
  } else {
    throw new Error(`Unknown algorithm: ${algorithm}`);
  }
  
  const calculationTime = performance.now() - calculationStartTime;
  console.log(`[Simulation] ${category.name}: ${result.history.length} moves in ${(calculationTime / 1000).toFixed(2)}s`);

  // Convert game state to route format
  // Replay the game to capture state at each step
  
  const routeBuildings = [];
  const stepGame = new Game(null, game);
  
  // Reset to initial state
  stepGame.totalCookies = game.totalCookies;
  stepGame.timeElapsed = game.timeElapsed;
  stepGame.history = [];
  
  let previousTimeElapsed = 0; // Track previous step's time for calculating time since last step
  
  for (let i = 0; i < result.history.length; i++) {
    const item = result.history[i];
    
    const rate = stepGame.rate();
    const timeBefore = stepGame.timeElapsed;
    const cookiesBefore = stepGame.totalCookies;
    let price;
    
    // Check if it's a building or upgrade
    let buildingCount = null; // Will be set if it's a building
    if (stepGame.buildingNames.includes(item)) {
      // It's a building
      price = stepGame.buildingPrice(item);
      stepGame.purchaseBuilding(item);
      // Get the count after purchase (includes the one just purchased)
      buildingCount = stepGame.numBuildings[item];
    } else {
      // It's an upgrade - find it in the menu before purchase
      let upgrade = null;
      for (const upg of stepGame.menu) {
        if (upg.name === item) {
          upgrade = upg;
          break;
        }
      }
      
      if (upgrade) {
        price = upgrade.price;
        stepGame.purchaseUpgrade(upgrade);
      } else {
        console.warn('[Simulation] Could not find upgrade in menu:', item);
        continue; // Skip this item if we can't find it
      }
    }
    
    // Calculate time since last step
    const timeSinceLastStep = timeBefore - previousTimeElapsed;
    
    routeBuildings.push({
      order: i + 1,
      buildingName: item, // Building or upgrade name
      cookiesRequired: price,
      cookiesPerSecond: rate,
      timeElapsed: timeBefore,
      timeSinceLastStep: timeSinceLastStep,
      totalCookies: cookiesBefore,
      buildingCount: buildingCount // null for upgrades, number for buildings
    });
    
    // Update previousTimeElapsed for next iteration
    previousTimeElapsed = timeBefore;
  }
  

  const route = {
    id: `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    categoryId: category.id,
    buildings: routeBuildings,
    calculatedAt: Date.now(),
    startingBuildings: effectiveStartingBuildings,
    algorithm: algorithm,
    lookahead: lookahead,
    completionTime: result.completionTime(),
    usedImportedData: usedImportedData,
    versionId: effectiveVersionId
  };

  // Save route to localStorage
  saveRoute(route);

  return route;
}

