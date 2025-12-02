/**
 * Route Chain Type Definitions
 * JSDoc type definitions for route chain data structures
 */

/**
 * @typedef {Object} RouteChain
 * @property {string} id - Unique identifier for the route chain (format: route-chain-{timestamp}-{random})
 * @property {string} name - User-provided name for the chain (or auto-generated default)
 * @property {ChainedRoute[]} routes - Ordered array of ChainedRoute objects (one per route in chain)
 * @property {number} createdAt - Timestamp when chain was created (milliseconds since epoch)
 * @property {number} lastAccessedAt - Timestamp when chain was last opened (milliseconds since epoch)
 * @property {number} savedAt - Timestamp when chain was saved (milliseconds since epoch)
 * @property {Object} [overallProgress] - Overall progress tracking for the entire chain
 * @property {number} overallProgress.totalRoutes - Total number of routes in chain
 * @property {number} overallProgress.completedRoutes - Number of routes fully completed
 * @property {number} [overallProgress.inProgressRouteIndex] - Index of route currently in progress (0-based)
 */

/**
 * @typedef {Object} ChainedRoute
 * @property {number} routeIndex - Zero-based index of this route in the chain (0, 1, 2, ...)
 * @property {RouteConfig} routeConfig - Route configuration (category or achievement route)
 * @property {Object} [calculatedRoute] - Calculated route data (null if not yet calculated)
 * @property {Object} startingBuildings - Starting buildings used for calculation (accumulated from previous routes)
 * @property {string[]} startingUpgrades - Starting upgrades used for calculation (accumulated from previous routes)
 * @property {Object} progress - Progress tracking data (map of step order to checked state)
 * @property {number} completedSteps - Count of completed (checked) steps
 * @property {boolean} isComplete - Whether all steps in this route are completed
 * @property {number} [calculatedAt] - Timestamp when route was calculated (milliseconds since epoch)
 * @property {Object} [calculationError] - Error information if calculation failed
 * @property {string} calculationError.message - Error message
 * @property {number} calculationError.timestamp - When error occurred
 */

/**
 * @typedef {Object} RouteConfig
 * @property {string} type - One of "category" or "achievement"
 * @property {string} [categoryId] - Category ID if type is "category"
 * @property {string} [categoryName] - Category display name if type is "category"
 * @property {string[]} [achievementIds] - Array of achievement IDs if type is "achievement"
 * @property {string} versionId - Game version ID used for this route
 * @property {boolean} [hardcoreMode] - Whether hardcore mode is enabled for this route
 */

/**
 * @typedef {Object} ChainCalculationState
 * @property {string} [chainId] - ID of chain being calculated (if saving)
 * @property {number} currentRouteIndex - Zero-based index of route currently being calculated
 * @property {number} totalRoutes - Total number of routes in chain
 * @property {Object} accumulatedBuildings - Buildings accumulated from all previous routes
 * @property {string[]} accumulatedUpgrades - Upgrades accumulated from all previous routes
 * @property {Object[]} calculatedRoutes - Array of calculated route results (one per completed route)
 * @property {ChainCalculationError[]} errors - Array of calculation errors encountered
 * @property {boolean} isCalculating - Whether calculation is currently in progress
 * @property {boolean} isComplete - Whether all routes have been calculated successfully
 * @property {boolean} isFailed - Whether calculation failed (stopped due to error)
 */

/**
 * @typedef {Object} ChainCalculationError
 * @property {number} routeIndex - Index of route that failed
 * @property {string} routeName - Name of route that failed
 * @property {string} message - Error message
 * @property {number} timestamp - When error occurred
 */

/**
 * @typedef {Object} ChainCalculationResult
 * @property {boolean} success - Whether all routes calculated successfully
 * @property {Object[]} calculatedRoutes - Array of calculated routes (one per route in chain)
 * @property {Object} accumulatedBuildings - Final accumulated buildings after all routes
 * @property {string[]} accumulatedUpgrades - Final accumulated upgrades after all routes
 * @property {ChainCalculationError[]} errors - Array of errors (empty if success)
 */

/**
 * @typedef {Object} ChainCalculationProgress
 * @property {number} currentRouteIndex - Index of route currently being calculated
 * @property {number} totalRoutes - Total number of routes in chain
 * @property {string} routeName - Name of current route
 * @property {Object} [routeProgress] - Progress for current route (from calculateRoute)
 */

