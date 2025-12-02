/**
 * Route Chain Validator
 * Validation functions for RouteChain and ChainedRoute data structures
 */

/**
 * Validate a RouteChain object
 * @param {Object} routeChain - Route chain to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validateRouteChain(routeChain) {
  const errors = [];

  if (!routeChain) {
    return { isValid: false, errors: ['Route chain is required'] };
  }

  // Validate id
  if (!routeChain.id || typeof routeChain.id !== 'string') {
    errors.push('Route chain must have a valid id (string)');
  }

  // Validate name
  if (!routeChain.name || typeof routeChain.name !== 'string') {
    errors.push('Route chain must have a valid name (string)');
  } else if (routeChain.name.length === 0) {
    errors.push('Route chain name cannot be empty');
  } else if (routeChain.name.length > 100) {
    errors.push('Route chain name cannot exceed 100 characters');
  }

  // Validate routes array
  if (!Array.isArray(routeChain.routes)) {
    errors.push('Route chain must have a routes array');
  } else {
    if (routeChain.routes.length === 0) {
      errors.push('Route chain must contain at least one route (FR-021)');
    } else if (routeChain.routes.length > 50) {
      errors.push('Route chain cannot exceed 50 routes');
    } else {
      // Validate each route
      routeChain.routes.forEach((route, index) => {
        const routeValidation = validateChainedRoute(route, index);
        if (!routeValidation.isValid) {
          errors.push(`Route at index ${index}: ${routeValidation.errors.join(', ')}`);
        }
      });
    }
  }

  // Validate timestamps
  if (typeof routeChain.createdAt !== 'number' || routeChain.createdAt <= 0) {
    errors.push('Route chain must have a valid createdAt timestamp');
  }
  if (typeof routeChain.lastAccessedAt !== 'number' || routeChain.lastAccessedAt <= 0) {
    errors.push('Route chain must have a valid lastAccessedAt timestamp');
  }
  if (typeof routeChain.savedAt !== 'number' || routeChain.savedAt <= 0) {
    errors.push('Route chain must have a valid savedAt timestamp');
  }

  // Validate overallProgress if present
  if (routeChain.overallProgress) {
    if (typeof routeChain.overallProgress.totalRoutes !== 'number') {
      errors.push('overallProgress.totalRoutes must be a number');
    } else if (routeChain.overallProgress.totalRoutes !== routeChain.routes.length) {
      errors.push('overallProgress.totalRoutes must equal routes.length');
    }
    if (typeof routeChain.overallProgress.completedRoutes !== 'number') {
      errors.push('overallProgress.completedRoutes must be a number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate a ChainedRoute object
 * @param {Object} chainedRoute - Chained route to validate
 * @param {number} expectedIndex - Expected route index (for validation)
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validateChainedRoute(chainedRoute, expectedIndex = null) {
  const errors = [];

  if (!chainedRoute) {
    return { isValid: false, errors: ['Chained route is required'] };
  }

  // Validate routeIndex
  if (typeof chainedRoute.routeIndex !== 'number' || chainedRoute.routeIndex < 0) {
    errors.push('Chained route must have a valid routeIndex (non-negative integer)');
  } else if (expectedIndex !== null && chainedRoute.routeIndex !== expectedIndex) {
    errors.push(`Chained route routeIndex (${chainedRoute.routeIndex}) does not match expected index (${expectedIndex})`);
  }

  // Validate routeConfig
  if (!chainedRoute.routeConfig || typeof chainedRoute.routeConfig !== 'object') {
    errors.push('Chained route must have a valid routeConfig object');
  } else {
    const config = chainedRoute.routeConfig;
    
    if (config.type !== 'category' && config.type !== 'achievement') {
      errors.push('routeConfig.type must be "category" or "achievement"');
    }
    
    if (config.type === 'category') {
      if (!config.categoryId || typeof config.categoryId !== 'string') {
        errors.push('routeConfig.categoryId is required when type is "category"');
      }
    } else if (config.type === 'achievement') {
      if (!Array.isArray(config.achievementIds) || config.achievementIds.length === 0) {
        errors.push('routeConfig.achievementIds is required and must be non-empty when type is "achievement"');
      }
    }
    
    if (!config.versionId || typeof config.versionId !== 'string') {
      errors.push('routeConfig.versionId is required');
    }
  }

  // Validate startingBuildings
  if (!chainedRoute.startingBuildings || typeof chainedRoute.startingBuildings !== 'object') {
    errors.push('Chained route must have a valid startingBuildings object');
  } else {
    for (const [key, value] of Object.entries(chainedRoute.startingBuildings)) {
      if (typeof value !== 'number' || value < 0) {
        errors.push(`startingBuildings.${key} must be a non-negative integer`);
      }
    }
  }

  // Validate startingUpgrades
  if (!Array.isArray(chainedRoute.startingUpgrades)) {
    errors.push('Chained route must have a valid startingUpgrades array');
  } else {
    chainedRoute.startingUpgrades.forEach((upgrade, index) => {
      if (typeof upgrade !== 'string') {
        errors.push(`startingUpgrades[${index}] must be a string`);
      }
    });
  }

  // Validate progress
  if (!chainedRoute.progress || typeof chainedRoute.progress !== 'object') {
    errors.push('Chained route must have a valid progress object');
  } else {
    for (const [key, value] of Object.entries(chainedRoute.progress)) {
      const stepOrder = Number(key);
      if (isNaN(stepOrder) || stepOrder < 1) {
        errors.push(`progress key "${key}" must be a positive integer`);
      }
      if (typeof value !== 'boolean') {
        errors.push(`progress[${key}] must be a boolean`);
      }
    }
  }

  // Validate completedSteps
  if (typeof chainedRoute.completedSteps !== 'number' || chainedRoute.completedSteps < 0) {
    errors.push('Chained route must have a valid completedSteps (non-negative integer)');
  }

  // Validate isComplete
  if (typeof chainedRoute.isComplete !== 'boolean') {
    errors.push('Chained route must have a valid isComplete (boolean)');
  }

  // Validate calculatedRoute if present
  if (chainedRoute.calculatedRoute !== null && chainedRoute.calculatedRoute !== undefined) {
    if (!chainedRoute.calculatedRoute.buildings || !Array.isArray(chainedRoute.calculatedRoute.buildings)) {
      errors.push('calculatedRoute.buildings must be an array');
    } else {
      // Validate completedSteps doesn't exceed total steps
      const totalSteps = chainedRoute.calculatedRoute.buildings.length;
      if (chainedRoute.completedSteps > totalSteps) {
        errors.push(`completedSteps (${chainedRoute.completedSteps}) cannot exceed total steps (${totalSteps})`);
      }
      // Validate isComplete matches completedSteps
      if (chainedRoute.isComplete && chainedRoute.completedSteps !== totalSteps) {
        errors.push('isComplete is true but completedSteps does not equal total steps');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

