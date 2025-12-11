/**
 * Route Update Utilities
 * Handles route update operations including progress preservation and validation
 * Implements the route update contract from contracts/route-update.md
 */

/**
 * Custom error class for route update errors
 */
export class RouteUpdateError extends Error {
  constructor(message, code, routeId) {
    super(message);
    this.name = 'RouteUpdateError';
    this.code = code || 'UNKNOWN_ERROR';
    this.routeId = routeId;
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message, errors, warnings) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors || [];
    this.warnings = warnings || [];
  }
}

/**
 * Custom error class for version mismatch errors
 */
export class VersionMismatchError extends Error {
  constructor(message, routeVersion, importedVersion, compatible) {
    super(message);
    this.name = 'VersionMismatchError';
    this.routeVersion = routeVersion;
    this.importedVersion = importedVersion;
    this.compatible = compatible;
  }
}

/**
 * Compatible versions matrix
 * All these versions are compatible (same building structure)
 */
const COMPATIBLE_VERSIONS = ['v2031', 'v2048', 'v10466', 'v10466_xmas', 'v2052'];

/**
 * In-memory storage for route update states
 * Keyed by route ID, cleared when update completes or fails
 */
const updateStates = new Map();

/**
 * Preserves progress from old route structure to new route structure
 * Maps old building steps to new building steps by matching building name and relative position
 * 
 * @param {Object} oldRoute - Original route before update (must have buildings array)
 * @param {Object} newRoute - Updated route after recalculation (must have buildings array)
 * @param {number[]} oldProgress - Array of completed step orders from old route
 * @returns {number[]} Array of step orders from new route that correspond to preserved progress
 */
export function preserveRouteProgress(oldRoute, newRoute, oldProgress) {
  if (!oldRoute || !newRoute || !Array.isArray(oldProgress)) {
    return [];
  }

  const oldBuildings = oldRoute.buildings || [];
  const newBuildings = newRoute.buildings || [];
  const preservedProgress = [];

  // For each completed step in old route
  for (const completedStepOrder of oldProgress) {
    // Get the building at this step order (1-indexed)
    const oldBuildingIndex = completedStepOrder - 1;
    if (oldBuildingIndex < 0 || oldBuildingIndex >= oldBuildings.length) {
      continue; // Invalid step order, skip
    }

    const oldBuilding = oldBuildings[oldBuildingIndex];
    const oldBuildingName = oldBuilding?.name || oldBuilding?.building || null;
    if (!oldBuildingName) {
      continue; // No building name, skip
    }

    // Find matching step in new route
    // Match by building name and relative position (within ±2 positions tolerance)
    let bestMatch = null;
    let bestMatchDistance = Infinity;

    for (let newIndex = 0; newIndex < newBuildings.length; newIndex++) {
      const newBuilding = newBuildings[newIndex];
      const newBuildingName = newBuilding?.name || newBuilding?.building || null;
      
      if (newBuildingName === oldBuildingName) {
        // Building name matches, check position distance
        const positionDistance = Math.abs(newIndex - oldBuildingIndex);
        if (positionDistance <= 2 && positionDistance < bestMatchDistance) {
          bestMatch = newIndex + 1; // Convert to 1-indexed step order
          bestMatchDistance = positionDistance;
        }
      }
    }

    // If match found, add to preserved progress
    if (bestMatch !== null) {
      preservedProgress.push(bestMatch);
    }
    // If no match found, progress is lost for this step (skip)
  }

  // Validate: Ensure all preserved step orders exist in new route
  const validatedProgress = preservedProgress.filter(stepOrder => {
    return stepOrder >= 1 && stepOrder <= newBuildings.length;
  });

  return validatedProgress;
}

/**
 * Validates that a route update can proceed with the given imported save game data
 * 
 * @param {Object} savedRoute - SavedRoute object to be updated
 * @param {Object} importedSaveGame - ImportedSaveGame object
 * @returns {Object} ValidationResult object with isValid, errors, warnings, versionCompatible
 */
export function validateRouteUpdate(savedRoute, importedSaveGame) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    versionCompatible: true
  };

  // Check that route exists and is valid
  if (!savedRoute || typeof savedRoute !== 'object') {
    result.isValid = false;
    result.errors.push('Saved route is invalid or missing');
    return result;
  }

  if (!savedRoute.id || !savedRoute.versionId) {
    result.isValid = false;
    result.errors.push('Saved route is missing required fields (id or versionId)');
    return result;
  }

  // Check that imported save game exists and is valid
  if (!importedSaveGame || typeof importedSaveGame !== 'object') {
    result.isValid = false;
    result.errors.push('Imported save game data is invalid or missing');
    return result;
  }

  // Check for required fields in imported save game
  // Building counts can come from buildings array or buildingCounts object
  const hasBuildings = importedSaveGame.buildings && Array.isArray(importedSaveGame.buildings) && importedSaveGame.buildings.length > 0;
  const hasBuildingCounts = importedSaveGame.buildingCounts && typeof importedSaveGame.buildingCounts === 'object';
  
  if (!hasBuildings && !hasBuildingCounts) {
    result.isValid = false;
    result.errors.push('Imported save game data is missing building information');
    return result;
  }

  // Check version compatibility
  const routeVersion = savedRoute.versionId;
  const importedVersion = importedSaveGame.version || 'v2052'; // Default to v2052 if not specified

  // Check if versions are compatible
  const routeVersionCompatible = COMPATIBLE_VERSIONS.includes(routeVersion);
  const importedVersionCompatible = COMPATIBLE_VERSIONS.includes(importedVersion);

  if (!routeVersionCompatible) {
    result.isValid = false;
    result.errors.push(`Route version ${routeVersion} is not supported`);
    result.versionCompatible = false;
    return result;
  }

  if (!importedVersionCompatible) {
    result.isValid = false;
    result.errors.push(`Imported save game version ${importedVersion} is not supported`);
    result.versionCompatible = false;
    return result;
  }

  // Versions are both compatible, check if they match
  if (routeVersion !== importedVersion) {
    // Versions differ but are compatible - warn user
    result.warnings.push(`Version mismatch: Route is ${routeVersion}, imported save is ${importedVersion}. Versions are compatible, update will proceed using imported version.`);
    result.versionCompatible = true; // Compatible but different
  } else {
    result.versionCompatible = true; // Same version
  }

  return result;
}

/**
 * Gets the current update state for a route
 * 
 * @param {string} routeId - ID of the route
 * @returns {Object|null} RouteUpdateState object if update in progress, null otherwise
 */
export function getRouteUpdateState(routeId) {
  if (!routeId || typeof routeId !== 'string') {
    return null;
  }
  return updateStates.get(routeId) || null;
}

/**
 * Sets the update state for a route
 * 
 * @param {string} routeId - ID of the route
 * @param {Object} state - RouteUpdateState object
 */
function setRouteUpdateState(routeId, state) {
  if (!routeId || typeof routeId !== 'string') {
    return;
  }
  if (state === null) {
    updateStates.delete(routeId);
  } else {
    updateStates.set(routeId, state);
  }
}

/**
 * Cancels an in-progress route update
 * 
 * @param {string} routeId - ID of the route being updated
 * @returns {boolean} true if cancellation successful, false if no update in progress
 */
export function cancelRouteUpdate(routeId) {
  if (!routeId || typeof routeId !== 'string') {
    return false;
  }

  const updateState = getRouteUpdateState(routeId);
  if (!updateState || !updateState.isUpdating) {
    return false; // No update in progress
  }

  // Set cancellation flag
  updateState.isCancelled = true;
  updateState.isUpdating = false;
  setRouteUpdateState(routeId, updateState);

  return true;
}

/**
 * Creates a new update state for a route
 * 
 * @param {string} routeId - ID of the route
 * @returns {Object} RouteUpdateState object
 */
export function createRouteUpdateState(routeId) {
  const state = {
    routeId: routeId,
    isUpdating: true,
    isCancelled: false,
    startedAt: Date.now()
  };
  setRouteUpdateState(routeId, state);
  return state;
}

/**
 * Clears the update state for a route
 * 
 * @param {string} routeId - ID of the route
 */
export function clearRouteUpdateState(routeId) {
  setRouteUpdateState(routeId, null);
}

/**
 * Updates the progress in the update state
 * 
 * @param {string} routeId - ID of the route
 * @param {Object} progress - Progress object with moves and currentBuilding
 */
export function updateRouteUpdateProgress(routeId, progress) {
  const state = getRouteUpdateState(routeId);
  if (state) {
    state.progress = progress;
    setRouteUpdateState(routeId, state);
  }
}

/**
 * Sets error in the update state
 * 
 * @param {string} routeId - ID of the route
 * @param {string} message - Error message
 * @param {string} code - Error code
 */
export function setRouteUpdateError(routeId, message, code) {
  const state = getRouteUpdateState(routeId);
  if (state) {
    state.error = {
      message: message,
      code: code || 'UNKNOWN_ERROR',
      timestamp: Date.now()
    };
    state.isUpdating = false;
    state.completedAt = Date.now();
    setRouteUpdateState(routeId, state);
  }
}

/**
 * Marks update as complete
 * 
 * @param {string} routeId - ID of the route
 */
export function completeRouteUpdate(routeId) {
  const state = getRouteUpdateState(routeId);
  if (state) {
    state.isUpdating = false;
    state.completedAt = Date.now();
    setRouteUpdateState(routeId, state);
  }
}

