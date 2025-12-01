/**
 * Cookie Clicker Achievements Mapping
 * Maps achievement IDs (indices) to achievement names and descriptions
 * Based on Cookie Clicker v2.052 (as of the wiki data)
 * 
 * Reference: https://cookieclicker.fandom.com/wiki/Achievement
 * 
 * Note: Achievement IDs in save games are stored as bitfield indices in section 7.
 * This mapping allows conversion from indices to human-readable achievement information.
 * 
 * IMPORTANT: This file loads achievement data from achievements.json.
 * Unknown achievement IDs will be displayed as "Achievement {id}" with a fallback description.
 */

/**
 * Achievement data structure:
 * {
 *   id: number,           // Achievement index in the bitfield
 *   name: string,         // Achievement name
 *   description: string,  // Achievement condition/description
 *   category: string,     // Category (e.g., "Cookies baked in one ascension", "Clicking", "Miscellaneous", "Shadow Achievements")
 *   type: string          // "normal" or "shadow"
 * }
 */
// Import achievements from JSON file
import achievementsData from './achievements.json';

// Ensure achievements is always an array, even if import fails
export const achievements = Array.isArray(achievementsData) ? achievementsData : [];

/**
 * Creates a map from achievement ID to achievement data
 * @returns {Map<number, Object>} Map of achievement ID to achievement object
 */
export function createAchievementMap() {
  const map = new Map();
  achievements.forEach(achievement => {
    map.set(achievement.id, achievement);
  });
  return map;
}

/**
 * Gets achievement data by ID
 * @param {number} id - Achievement ID
 * @returns {Object|undefined} Achievement object or undefined if not found
 */
export function getAchievementById(id) {
  return achievements.find(a => a.id === id);
}

/**
 * Gets achievement name by ID
 * @param {number} id - Achievement ID
 * @returns {string|undefined} Achievement name or undefined if not found
 */
export function getAchievementName(id) {
  const achievement = getAchievementById(id);
  return achievement ? achievement.name : undefined;
}

/**
 * Gets achievement description by ID
 * @param {number} id - Achievement ID
 * @returns {string|undefined} Achievement description or undefined if not found
 */
export function getAchievementDescription(id) {
  const achievement = getAchievementById(id);
  return achievement ? achievement.description : undefined;
}

/**
 * Converts an array of achievement IDs to achievement objects
 * @param {number[]} achievementIds - Array of achievement IDs
 * @returns {Object[]} Array of achievement objects
 */
export function getAchievementsByIds(achievementIds) {
  return achievementIds
    .map(id => getAchievementById(id))
    .filter(achievement => achievement !== undefined);
}
