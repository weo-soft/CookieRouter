/**
 * Achievement utilities for filtering and searching achievements
 */

import { achievements } from './achievements.js';
import { getAchievementRequirement, isAchievementRouteable } from './achievement-requirements.js';
import { formatNumber } from './format.js';

/**
 * Filters achievements by requirement type
 * @param {Array} achievements - Array of achievements to filter
 * @param {string} requirementType - Requirement type to filter by (e.g., 'buildingCount', 'cps')
 * @returns {Array} Filtered array of achievements
 */
export function filterAchievementsByType(achievements, requirementType) {
  return achievements.filter(achievement => {
    const requirement = getAchievementRequirement(achievement.id);
    return requirement && requirement.type === requirementType;
  });
}

/**
 * Searches achievements by name or description
 * @param {Array} achievements - Array of achievements to search
 * @param {string} query - Search query (case-insensitive)
 * @returns {Array} Array of matching achievements
 */
export function searchAchievements(achievements, query) {
  if (!query || query.trim() === '') {
    return achievements;
  }
  const lowerQuery = query.toLowerCase().trim();
  return achievements.filter(achievement => {
    return achievement.name.toLowerCase().includes(lowerQuery) ||
           achievement.description.toLowerCase().includes(lowerQuery);
  });
}

/**
 * Filters to show only routeable achievements
 * @param {Array} achievements - Array of achievements to filter
 * @returns {Array} Array of routeable achievements only
 */
export function getRouteableAchievements(achievements) {
  return achievements.filter(achievement => 
    isAchievementRouteable(achievement.id)
  );
}

/**
 * Combines multiple filters
 * @param {Array} achievements - Array of achievements to filter
 * @param {Object} filters - Filter options
 * @param {boolean} filters.routeableOnly - Filter to routeable only
 * @param {string} filters.requirementType - Filter by requirement type
 * @param {string} filters.searchQuery - Search query
 * @returns {Array} Filtered array of achievements
 */
export function filterAchievements(achievements, filters) {
  let result = [...achievements];
  
  if (filters.routeableOnly) {
    result = getRouteableAchievements(result);
  }
  
  if (filters.requirementType) {
    result = filterAchievementsByType(result, filters.requirementType);
  }
  
  if (filters.searchQuery) {
    result = searchAchievements(result, filters.searchQuery);
  }
  
  return result;
}

/**
 * Formats achievement requirement for display
 * @param {Object} requirement - Achievement requirement object
 * @returns {string} Formatted requirement description
 */
export function formatAchievementRequirement(requirement) {
  if (!requirement) {
    return 'Unknown requirement';
  }
  
  switch (requirement.type) {
    case 'buildingCount':
      return `Have ${requirement.count} ${requirement.building}${requirement.count !== 1 ? 's' : ''}`;
    case 'cps':
      return `Bake ${formatNumber(requirement.value)} cookies per second`;
    case 'totalCookies':
      return `Bake ${formatNumber(requirement.value)} cookies in one ascension`;
    case 'upgradeCount':
      return `Purchase ${requirement.count} upgrade${requirement.count !== 1 ? 's' : ''}`;
    case 'totalBuildings':
      return `Own ${requirement.count} building${requirement.count !== 1 ? 's' : ''}`;
    case 'minBuildings':
      return `Have at least ${requirement.count} of every building`;
    case 'buildingLevel':
      return `Reach level ${requirement.level} ${requirement.building}${requirement.level !== 1 ? 's' : ''}`;
    case 'notRouteable':
      return `Not routeable: ${requirement.reason}`;
    default:
      return 'Unknown requirement type';
  }
}


