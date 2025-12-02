/**
 * Achievement Requirements Mapping
 * 
 * One-time translation of achievement descriptions into structured, routeable requirements.
 * This file maps achievement IDs to their routeable requirements for use in route calculation.
 * 
 * Requirement Types:
 * - buildingCount: { type: 'buildingCount', building: string, count: number }
 * - cps: { type: 'cps', value: number }
 * - totalCookies: { type: 'totalCookies', value: number }
 * - upgradeCount: { type: 'upgradeCount', count: number }
 * - totalBuildings: { type: 'totalBuildings', count: number }
 * - minBuildings: { type: 'minBuildings', count: number } // "at least X of everything"
 * - buildingLevel: { type: 'buildingLevel', building: string, level: number }
 * - notRouteable: { type: 'notRouteable', reason: string }
 */

import achievementRequirementsData from '../../data/achievements/achievement-requirements.json';

/**
 * Achievement requirements map
 * Maps achievement ID to routeable requirement object
 * Data is loaded from achievement-requirements.json
 */
export const achievementRequirements = achievementRequirementsData;

/**
 * Gets the routeable requirement for an achievement
 * @param {number} achievementId - Achievement ID
 * @returns {Object|null} Requirement object or null if not found/not routeable
 */
export function getAchievementRequirement(achievementId) {
  return achievementRequirements[achievementId] || null;
}

/**
 * Checks if an achievement is routeable
 * @param {number} achievementId - Achievement ID
 * @returns {boolean} True if achievement is routeable
 */
export function isAchievementRouteable(achievementId) {
  const requirement = achievementRequirements[achievementId];
  return requirement && requirement.type !== 'notRouteable';
}

/**
 * Gets all routeable achievement IDs
 * @returns {number[]} Array of routeable achievement IDs
 */
export function getRouteableAchievementIds() {
  return Object.keys(achievementRequirements)
    .map(id => parseInt(id, 10))
    .filter(id => isAchievementRouteable(id));
}
