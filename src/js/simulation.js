/**
 * Simulation functions for calculating routes
 * Implements the simulation contract from contracts/simulation.md
 */

import { Router } from './router.js';
import { getImportedSaveGame } from './save-game-importer.js';
import { getAchievementRequirement } from './utils/achievement-requirements.js';
import { extractFinalStateFromRoute } from './utils/route-state-extractor.js';

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
    const { loadVersionById } = await import('./utils/version-loader.js');
    version = await loadVersionById(effectiveVersionId);
  } catch (error) {
    console.warn(`Failed to load version ${effectiveVersionId}, falling back to v2052`, error);
    try {
      const { loadVersionById } = await import('./utils/version-loader.js');
      version = await loadVersionById('v2052');
      effectiveVersionId = 'v2052';
    } catch (fallbackError) {
      throw new Error(`Failed to load version ${effectiveVersionId} and fallback v2052: ${fallbackError.message}`);
    }
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
      game = await categoryFunctions[functionName](version, category.playerCps || 8, category.playerDelay || 1);
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

  // Apply starting buildings (merged from imported data and manual override)
  // This must be done BEFORE applying upgrades so that upgrade requirements can be checked correctly
  for (const [buildingName, count] of Object.entries(effectiveStartingBuildings)) {
    if (game.buildingNames.includes(buildingName)) {
      game.numBuildings[buildingName] = (game.numBuildings[buildingName] || 0) + count;
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
  // Buildings are already applied above, so upgrade requirements can be checked correctly
  if (purchasedUpgrades.length > 0) {
    const upgradeMap = new Map();
    for (const upgrade of version.menu) {
      upgradeMap.set(upgrade.name, upgrade);
    }
    
    for (const upgradeName of purchasedUpgrades) {
      const upgrade = upgradeMap.get(upgradeName);
      if (!upgrade) {
        console.warn(`[Simulation] Upgrade "${upgradeName}" from save game not found in version menu`);
        continue;
      }
      // Apply purchased upgrades regardless of current requirements
      // Upgrades are permanent once purchased, so we should apply them even if buildings were sold
      // Buildings are already applied above, so requirements should normally be satisfied anyway
      if (!game.hasSatisfied(upgrade.req)) {
        console.warn(`[Simulation] Upgrade "${upgradeName}" is purchased but requirements not satisfied. Applying anyway (upgrades are permanent).`);
      }
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

  // Set achievement goals if category has achievementIds
  if (category.achievementIds && category.achievementIds.length > 0) {
    // Validate achievement IDs
    const validAchievementIds = category.achievementIds.filter(id => {
      const requirement = getAchievementRequirement(id);
      return requirement && requirement.type !== 'notRouteable';
    });
    
    if (validAchievementIds.length === 0) {
      throw new Error('No valid routeable achievements selected. Please select at least one routeable achievement.');
    }
    
    // Check if any achievements are already met by starting state
    const alreadyMetAchievements = [];
    for (const achievementId of validAchievementIds) {
      const requirement = getAchievementRequirement(achievementId);
      if (requirement && requirement.type !== 'notRouteable') {
        let isMet = false;
        switch (requirement.type) {
          case 'buildingCount':
            const current = game.numBuildings[requirement.building] || 0;
            isMet = current >= requirement.count;
            break;
          case 'cps':
            isMet = game.rate() >= requirement.value;
            break;
          case 'totalCookies':
            isMet = game.totalCookies >= requirement.value;
            break;
          case 'upgradeCount':
            const upgradeCount = game.history.filter(item => !game.buildingNames.includes(item)).length;
            isMet = upgradeCount >= requirement.count;
            break;
          case 'totalBuildings':
            const total = Object.values(game.numBuildings).reduce((sum, count) => sum + count, 0);
            isMet = total >= requirement.count;
            break;
          case 'minBuildings':
            const buildingCounts = Object.values(game.numBuildings);
            if (buildingCounts.length > 0) {
              const min = Math.min(...buildingCounts);
              isMet = min >= requirement.count;
            }
            break;
          case 'buildingLevel':
            const buildingCount = game.numBuildings[requirement.building] || 0;
            isMet = buildingCount >= 1;
            break;
        }
        if (isMet) {
          alreadyMetAchievements.push(achievementId);
        }
      }
    }
    
    // Filter out already met achievements (they're already unlocked)
    const remainingAchievementIds = validAchievementIds.filter(id => !alreadyMetAchievements.includes(id));
    
    if (remainingAchievementIds.length === 0) {
      throw new Error('All selected achievements are already met by your starting game state.');
    }
    
    setAchievementGoals(game, remainingAchievementIds);
    
    // Log info about already met achievements
    if (alreadyMetAchievements.length > 0) {
      console.log(`[Simulation] ${alreadyMetAchievements.length} achievement(s) already met:`, alreadyMetAchievements);
    }
    
    // Debug: Log achievement goals state
    console.log(`[Simulation] Setting achievement goals:`, {
      achievementIds: remainingAchievementIds,
      achievementGoals: game.achievementGoals,
      targetCps: game.targetCps,
      targetBuilding: game.targetBuilding,
      targetCookies: game.targetCookies,
      isGoalMet: game.isAchievementGoalMet()
    });
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
  
  // Copy achievement goals to stepGame for tracking unlocks
  if (game.achievementGoals && game.achievementGoals.length > 0) {
    stepGame.achievementGoals = [...game.achievementGoals];
    stepGame.targetCps = game.targetCps;
    stepGame.targetBuilding = game.targetBuilding ? { ...game.targetBuilding } : null;
    stepGame.targetUpgradeCount = game.targetUpgradeCount;
    stepGame.targetTotalBuildings = game.targetTotalBuildings;
    stepGame.targetMinBuildings = game.targetMinBuildings;
    stepGame.targetBuildingLevel = game.targetBuildingLevel ? { ...game.targetBuildingLevel } : null;
  }
  
  // Track achievement unlocks
  const achievementUnlocks = [];
  const unlockedAchievements = new Set();
  
  let previousTimeElapsed = 0; // Track previous step's time for calculating time since last step
  let stepOrder = 0; // Track actual step order (only increments when a step is created, not skipped)
  
  for (let i = 0; i < result.history.length; i++) {
    const item = result.history[i];
    
    // Capture rate and cookies before purchase
    const rateBefore = stepGame.rate();
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
        continue; // Skip this item if we can't find it (already purchased from imported save)
      }
    }
    
    // Increment step order only when we actually create a step (not skipped)
    stepOrder++;
    
    // Capture rate and time after purchase (purchaseBuilding/purchaseUpgrade updates these)
    const rateAfter = stepGame.rate();
    const timeAfter = stepGame.timeElapsed;
    
    // Calculate time since last step (time it took to save up for this purchase)
    const timeSinceLastStep = timeAfter - previousTimeElapsed;
    
    // Calculate CpS increase
    const cpsIncrease = rateAfter - rateBefore;
    
    // Check for achievement unlocks at this step
    const stepAchievementUnlocks = [];
    if (stepGame.achievementGoals && stepGame.achievementGoals.length > 0) {
      for (const achievementId of stepGame.achievementGoals) {
        if (!unlockedAchievements.has(achievementId)) {
          // Check if this specific achievement is met
          const requirement = getAchievementRequirement(achievementId);
          if (requirement && requirement.type !== 'notRouteable') {
            let isMet = false;
            switch (requirement.type) {
              case 'buildingCount':
                const current = stepGame.numBuildings[requirement.building] || 0;
                isMet = current >= requirement.count;
                break;
              case 'cps':
                isMet = stepGame.rate() >= requirement.value;
                break;
              case 'totalCookies':
                isMet = stepGame.totalCookies >= requirement.value;
                break;
              case 'upgradeCount':
                const upgradeCount = stepGame.history.filter(item => !stepGame.buildingNames.includes(item)).length;
                isMet = upgradeCount >= requirement.count;
                break;
              case 'totalBuildings':
                const total = Object.values(stepGame.numBuildings).reduce((sum, count) => sum + count, 0);
                isMet = total >= requirement.count;
                break;
              case 'minBuildings':
                const buildingCounts = Object.values(stepGame.numBuildings);
                if (buildingCounts.length > 0) {
                  const min = Math.min(...buildingCounts);
                  isMet = min >= requirement.count;
                }
                break;
              case 'buildingLevel':
                const buildingCount = stepGame.numBuildings[requirement.building] || 0;
                isMet = buildingCount >= 1; // At least have the building
                break;
            }
            
            if (isMet) {
              unlockedAchievements.add(achievementId);
              stepAchievementUnlocks.push(achievementId);
            }
          }
        }
      }
    }
    
    // Store only non-calculable values to reduce storage size
    // Calculable values (cookiesPerSecond, timeElapsed, totalCookies) will be computed on display
    const step = {
      order: stepOrder, // Use stepOrder instead of i + 1 to avoid gaps when items are skipped
      buildingName: item, // Building or upgrade name
      cookiesRequired: price,
      cpsIncrease: cpsIncrease,
      timeSinceLastStep: timeSinceLastStep,
      buildingCount: buildingCount, // null for upgrades, number for buildings
    };
    
    // Store initial values for first step only (needed for calculation chain)
    if (stepOrder === 1) {
      step.initialCookiesPerSecond = rateAfter;
      step.initialTimeElapsed = timeAfter;
      step.initialTotalCookies = cookiesBefore;
    }
    
    // Only include achievement unlocks if present
    if (stepAchievementUnlocks.length > 0) {
      step.achievementUnlocks = stepAchievementUnlocks;
    }
    
    routeBuildings.push(step);
    
    // Track achievement unlocks for route metadata
    if (stepAchievementUnlocks.length > 0) {
      achievementUnlocks.push({
        stepIndex: stepOrder, // Use stepOrder instead of i + 1
        achievementIds: stepAchievementUnlocks
      });
    }
    
    // Update previousTimeElapsed for next iteration
    previousTimeElapsed = timeAfter;
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
  
  // Add achievement metadata if this is an achievement route
  if (category.achievementIds && category.achievementIds.length > 0) {
    route.achievementIds = category.achievementIds;
    route.achievementUnlocks = achievementUnlocks;
  }

  // Routes are NOT automatically saved - they are only saved when user clicks "Save Route" button
  // This prevents localStorage from filling up with temporary calculated routes

  return route;
}

/**
 * @typedef {object} ChainCalculationProgress
 * @property {number} currentRouteIndex - Index of route currently being calculated.
 * @property {number} totalRoutes - Total number of routes in chain.
 * @property {string} routeName - Name of current route.
 * @property {object} [routeProgress] - Progress for current route (from calculateRoute).
 */

/**
 * Calculate a route chain - calculates all routes sequentially with building progression
 * @param {Object} chainConfig - Chain configuration
 *   - routes: Array of route configurations (categories or achievement routes)
 *   - versionId: Default game version ID (optional, default: 'v2052')
 * @param {Object} initialStartingBuildings - Initial starting buildings (from wizard or import)
 * @param {Array} initialStartingUpgrades - Initial starting upgrades (from wizard or import)
 * @param {Object} options - Calculation options
 *   - algorithm: 'GPL' or 'DFS' (default: 'GPL')
 *   - lookahead: number (default: 1)
 *   - onProgress: function(progress: ChainCalculationProgress) - Progress callback
 * @returns {Promise<Object>} ChainCalculationResult
 */
export async function calculateRouteChain(chainConfig, initialStartingBuildings = {}, initialStartingUpgrades = [], options = {}) {
  const {
    algorithm = 'GPL',
    lookahead = 1,
    onProgress = null
  } = options;

  const routes = chainConfig.routes || [];
  const defaultVersionId = chainConfig.versionId || 'v2052';

  if (!routes || routes.length === 0) {
    return {
      success: false,
      calculatedRoutes: [],
      accumulatedBuildings: initialStartingBuildings,
      accumulatedUpgrades: initialStartingUpgrades,
      errors: [{
        routeIndex: -1,
        routeName: 'Chain Configuration',
        message: 'No routes specified in chain configuration',
        timestamp: Date.now()
      }]
    };
  }

  // Initialize accumulation state
  let accumulatedBuildings = { ...initialStartingBuildings };
  let accumulatedUpgrades = [...initialStartingUpgrades];
  const calculatedRoutes = [];
  const errors = [];

  // Calculate each route sequentially
  for (let i = 0; i < routes.length; i++) {
    const routeConfig = routes[i];
    const routeName = routeConfig.type === 'category'
      ? (routeConfig.categoryName || routeConfig.categoryId || `Route ${i + 1}`)
      : `Achievement Route (${routeConfig.achievementIds?.join(', ') || 'Unknown'})`;

    // Report progress
    if (onProgress) {
      await onProgress({
        currentRouteIndex: i,
        totalRoutes: routes.length,
        routeName: routeName,
        routeProgress: null
      });
    }

    try {
      // Create category object for calculateRoute
      let category;
      if (routeConfig.type === 'category') {
        // Find the category (predefined or custom)
        const { getCategoryById } = await import('./storage.js');
        const storedCategory = getCategoryById(routeConfig.categoryId);
        
        if (storedCategory) {
          category = {
            id: storedCategory.id,
            name: storedCategory.name,
            isPredefined: storedCategory.isPredefined,
            version: storedCategory.version || routeConfig.versionId || defaultVersionId,
            targetCookies: storedCategory.targetCookies,
            playerCps: storedCategory.playerCps || 8,
            playerDelay: storedCategory.playerDelay || 1,
            hardcoreMode: storedCategory.hardcoreMode || routeConfig.hardcoreMode || false,
            initialBuildings: storedCategory.initialBuildings || {}
          };
        } else {
          // Predefined category - create from config
          category = {
            id: routeConfig.categoryId,
            name: routeConfig.categoryName || routeConfig.categoryId,
            isPredefined: true,
            version: routeConfig.versionId || defaultVersionId,
            targetCookies: 0, // Will be set by category function
            playerCps: 8,
            playerDelay: 1,
            hardcoreMode: routeConfig.hardcoreMode || false
          };
        }
      } else if (routeConfig.type === 'achievement') {
        // Achievement route
        category = {
          id: `achievement-route-${i}`,
          name: `Achievement Route (${routeConfig.achievementIds.join(', ')})`,
          isPredefined: false,
          version: routeConfig.versionId || defaultVersionId,
          achievementIds: routeConfig.achievementIds,
          hardcoreMode: routeConfig.hardcoreMode || false
        };
      } else {
        throw new Error(`Unknown route type: ${routeConfig.type}`);
      }

      // Calculate route with accumulated state
      const routeOptions = {
        algorithm: algorithm,
        lookahead: lookahead,
        manualUpgrades: accumulatedUpgrades,
        onProgress: (routeProgress) => {
          // Forward route-level progress if callback provided
          if (onProgress) {
            onProgress({
              currentRouteIndex: i,
              totalRoutes: routes.length,
              routeName: routeName,
              routeProgress: routeProgress
            });
          }
        }
      };

      const versionId = routeConfig.versionId || defaultVersionId;
      const calculatedRoute = await calculateRoute(category, accumulatedBuildings, routeOptions, versionId);

      // Extract final state from this route
      const finalState = extractFinalStateFromRoute(calculatedRoute, accumulatedBuildings, accumulatedUpgrades);

      // Update accumulated state for next route
      accumulatedBuildings = finalState.buildings;
      accumulatedUpgrades = finalState.upgrades;

      // Store calculated route
      calculatedRoutes.push(calculatedRoute);

    } catch (error) {
      // Error calculating this route - stop chain calculation
      errors.push({
        routeIndex: i,
        routeName: routeName,
        message: error.message || 'Unknown error during route calculation',
        timestamp: Date.now()
      });

      // Return partial results
      return {
        success: false,
        calculatedRoutes: calculatedRoutes,
        accumulatedBuildings: accumulatedBuildings,
        accumulatedUpgrades: accumulatedUpgrades,
        errors: errors
      };
    }
  }

  // All routes calculated successfully
  return {
    success: true,
    calculatedRoutes: calculatedRoutes,
    accumulatedBuildings: accumulatedBuildings,
    accumulatedUpgrades: accumulatedUpgrades,
    errors: []
  };
}

/**
 * Chain Calculation State
 * Tracks state during chain calculation (in-memory only)
 * @typedef {Object} ChainCalculationState
 * @property {string} [chainId] - ID of chain being calculated (if saving)
 * @property {number} currentRouteIndex - Zero-based index of route currently being calculated
 * @property {number} totalRoutes - Total number of routes in chain
 * @property {Object} accumulatedBuildings - Buildings accumulated from all previous routes
 * @property {string[]} accumulatedUpgrades - Upgrades accumulated from all previous routes
 * @property {Object[]} calculatedRoutes - Array of calculated route results (one per completed route)
 * @property {Array} errors - Array of calculation errors encountered
 * @property {boolean} isCalculating - Whether calculation is currently in progress
 * @property {boolean} isComplete - Whether all routes have been calculated successfully
 * @property {boolean} isFailed - Whether calculation failed (stopped due to error)
 */

/**
 * Sets achievement goals on a game instance based on achievement IDs
 * @param {Game} game - Game instance to set goals on
 * @param {number[]} achievementIds - Array of achievement IDs
 */
function setAchievementGoals(game, achievementIds) {
  // Reset all achievement goals
  game.targetCps = null;
  game.targetBuilding = null;
  game.targetUpgradeCount = null;
  game.targetTotalBuildings = null;
  game.targetMinBuildings = null;
  game.targetBuildingLevel = null;
  game.achievementGoals = [];
  
  // Process each achievement
  for (const achievementId of achievementIds) {
    const requirement = getAchievementRequirement(achievementId);
    if (!requirement || requirement.type === 'notRouteable') {
      continue;
    }
    
    game.achievementGoals.push(achievementId);
    
    // Set goal based on requirement type
    switch (requirement.type) {
      case 'buildingCount':
        // If multiple building goals, use the highest count for that building
        // If different buildings, we need to track multiple (for now, use highest count)
        if (!game.targetBuilding || 
            (requirement.building === game.targetBuilding.name && requirement.count > game.targetBuilding.count) ||
            (requirement.building !== game.targetBuilding.name && requirement.count > (game.targetBuilding.count || 0))) {
          game.targetBuilding = { name: requirement.building, count: requirement.count };
        }
        break;
      case 'cps':
        // If multiple CPS goals, use the highest value
        if (game.targetCps === null || requirement.value > game.targetCps) {
          game.targetCps = requirement.value;
        }
        break;
      case 'totalCookies':
        // If multiple cookie goals, use the highest value
        if (game.targetCookies === 0 || requirement.value > game.targetCookies) {
          game.targetCookies = requirement.value;
        }
        break;
      case 'upgradeCount':
        // If multiple upgrade goals, use the highest count
        if (game.targetUpgradeCount === null || requirement.count > game.targetUpgradeCount) {
          game.targetUpgradeCount = requirement.count;
        }
        break;
      case 'totalBuildings':
        // If multiple total building goals, use the highest count
        if (game.targetTotalBuildings === null || requirement.count > game.targetTotalBuildings) {
          game.targetTotalBuildings = requirement.count;
        }
        break;
      case 'minBuildings':
        // If multiple min building goals, use the highest count
        if (game.targetMinBuildings === null || requirement.count > game.targetMinBuildings) {
          game.targetMinBuildings = requirement.count;
        }
        break;
      case 'buildingLevel':
        // For building levels, we route to having the building (leveling is manual)
        if (!game.targetBuildingLevel) {
          game.targetBuildingLevel = { building: requirement.building, level: requirement.level };
        }
        break;
    }
  }
}

