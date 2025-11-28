/**
 * Simulation functions for calculating routes
 * Implements the simulation contract from contracts/simulation.md
 */

import { Router } from './router.js';
import { saveRoute } from './storage.js';

/**
 * Calculates the optimal building purchase route for a given category
 * @param {Object} category - Category configuration
 * @param {Object} startingBuildings - Optional map of building names to counts already owned
 * @param {Object} options - Optional simulation options
 * @param {string} versionId - Game version ID (default: 'v2052')
 * @returns {Promise<Object>} Route object
 */
export async function calculateRoute(category, startingBuildings = {}, options = {}, versionId = 'v2052') {
  const {
    algorithm = 'GPL',
    lookahead = 1,
    onProgress = null
  } = options;

  // Import game and categories dynamically to avoid circular dependencies
  const { Game } = await import('./game.js');
  const categoryFunctions = await import('./categories.js');
  
  // Load the selected version
  let version;
  try {
    const versionModules = await import(`../data/versions/${versionId}.js`);
    version = versionModules.default;
  } catch (error) {
    console.warn(`Failed to load version ${versionId}, falling back to v2052`, error);
    const versionModules = await import('../data/versions/v2052.js');
    version = versionModules.default;
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
    game.hardcoreMode = category.hardcoreMode || false;
    
    // Apply initial buildings from category
    if (category.initialBuildings) {
      for (const [buildingName, count] of Object.entries(category.initialBuildings)) {
        game.numBuildings[buildingName] = count;
      }
    }
  }

  // Apply starting buildings (user's current state)
  for (const [buildingName, count] of Object.entries(startingBuildings)) {
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
  
  for (let i = 0; i < result.history.length; i++) {
    const item = result.history[i];
    
    const rate = stepGame.rate();
    const timeBefore = stepGame.timeElapsed;
    const cookiesBefore = stepGame.totalCookies;
    let price;
    
    // Check if it's a building or upgrade
    if (stepGame.buildingNames.includes(item)) {
      // It's a building
      price = stepGame.buildingPrice(item);
      stepGame.purchaseBuilding(item);
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
    
    routeBuildings.push({
      order: i + 1,
      buildingName: item, // Building or upgrade name
      cookiesRequired: price,
      cookiesPerSecond: rate,
      timeElapsed: timeBefore,
      totalCookies: cookiesBefore
    });
  }
  

  const route = {
    id: `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    categoryId: category.id,
    buildings: routeBuildings,
    calculatedAt: Date.now(),
    startingBuildings: startingBuildings,
    algorithm: algorithm,
    lookahead: lookahead,
    completionTime: result.completionTime()
  };

  // Save route to localStorage
  saveRoute(route);

  return route;
}

