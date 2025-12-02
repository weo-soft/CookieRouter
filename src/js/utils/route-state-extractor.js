/**
 * Route State Extractor Utility
 * Extracts final building counts and purchased upgrades from a calculated route
 */

/**
 * Extract final state (buildings and upgrades) from a calculated route
 * This is used to accumulate state across routes in a chain
 * 
 * @param {Object} route - Calculated route object
 * @param {Object} initialBuildings - Initial starting buildings (optional, defaults to route.startingBuildings)
 * @param {Array} initialUpgrades - Initial starting upgrades (optional, defaults to empty array)
 * @returns {Object} Object with buildings and upgrades
 *   - buildings: Map of building names to final counts
 *   - upgrades: Array of upgrade names (no duplicates)
 */
export function extractFinalStateFromRoute(route, initialBuildings = null, initialUpgrades = null) {
  if (!route || !route.buildings) {
    return {
      buildings: initialBuildings || route?.startingBuildings || {},
      upgrades: initialUpgrades || []
    };
  }

  // Start with initial buildings (from route or provided)
  const buildings = { ...(initialBuildings || route.startingBuildings || {}) };
  const upgrades = [...(initialUpgrades || [])];

  // Process all steps in the route
  for (const step of route.buildings) {
    // Check if it's a building (has buildingCount) or upgrade (no buildingCount)
    if (step.buildingCount !== null && step.buildingCount !== undefined) {
      // It's a building purchase
      const buildingName = step.buildingName;
      buildings[buildingName] = (buildings[buildingName] || 0) + 1;
    } else {
      // It's an upgrade purchase
      const upgradeName = step.buildingName;
      // Avoid duplicates
      if (!upgrades.includes(upgradeName)) {
        upgrades.push(upgradeName);
      }
    }
  }

  return { buildings, upgrades };
}

