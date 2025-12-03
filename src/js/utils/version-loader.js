/**
 * Shared version loader for all game versions
 * Loads JSON version data and transforms it into the version object format
 * expected by the game simulation system.
 * 
 * This loader can be used by all version files (v2031, v2048, v10466, v10466_xmas, v2052)
 * since they all export the same structure.
 */

import { Upgrade, Effect } from '../game.js';
import {
  createMultiplier,
  createGrandmaBoost,
  createFingersBoost,
  createPercentBoost,
  createMouseBoost,
  createSynergyEffect,
  createEffectFromDefinition
} from './upgrade-effects.js';

/**
 * Validates version data structure
 * @param {Object} data - Version data object from JSON
 * @throws {Error} If validation fails
 */
function validateVersionData(data) {
  if (!data.version) {
    throw new Error('Version data missing required field: version');
  }
  
  if (!data.buildings) {
    throw new Error('Version data missing required field: buildings');
  }
  
  if (!Array.isArray(data.buildings.names)) {
    throw new Error('Version data buildings.names must be an array');
  }
  
  if (!data.buildings.basePrices || typeof data.buildings.basePrices !== 'object') {
    throw new Error('Version data buildings.basePrices must be an object');
  }
  
  if (!data.buildings.baseRates || typeof data.buildings.baseRates !== 'object') {
    throw new Error('Version data buildings.baseRates must be an object');
  }
  
  if (!Array.isArray(data.upgrades)) {
    throw new Error('Version data upgrades must be an array');
  }
  
  // Validate building data consistency
  for (const buildingName of data.buildings.names) {
    if (!buildingName || buildingName.trim() === '') continue;
    
    if (!(buildingName in data.buildings.basePrices)) {
      throw new Error(`Building ${buildingName} missing in basePrices`);
    }
    
    if (!(buildingName in data.buildings.baseRates)) {
      throw new Error(`Building ${buildingName} missing in baseRates`);
    }
  }
  
  // Validate upgrades
  for (let i = 0; i < data.upgrades.length; i++) {
    const upgrade = data.upgrades[i];
    
    if (!upgrade.name) {
      throw new Error(`Upgrade at index ${i} missing name`);
    }
    
    if (typeof upgrade.price !== 'number' || upgrade.price <= 0) {
      throw new Error(`Upgrade "${upgrade.name}" has invalid price: ${upgrade.price}`);
    }
    
    if (!upgrade.effects || typeof upgrade.effects !== 'object') {
      throw new Error(`Upgrade "${upgrade.name}" missing or invalid effects`);
    }
    
    // Validate effect definitions
    for (const [target, effectDef] of Object.entries(upgrade.effects)) {
      if (!effectDef.type) {
        throw new Error(`Upgrade "${upgrade.name}" effect for ${target} missing type`);
      }
      
      if (!Array.isArray(effectDef.params)) {
        throw new Error(`Upgrade "${upgrade.name}" effect for ${target} params must be an array`);
      }
    }
  }
}

/**
 * Builds upgradesById array from menu Set
 * @param {Set<Upgrade>} menu - Set of Upgrade objects
 * @returns {Array<Upgrade>} Sparse array indexed by upgrade ID
 */
function buildUpgradesByIdArray(menu) {
  const upgradesById = [];
  
  for (const upgrade of menu) {
    if (upgrade.id !== null && upgrade.id !== undefined) {
      upgradesById[upgrade.id] = upgrade;
    }
  }
  
  return upgradesById;
}

/**
 * Transforms JSON version data into version object format
 * @param {Object} data - Version data from JSON
 * @param {Object} options - Optional configuration
 *   - septillion: number - Value for septillion constant (default: 10**24)
 * @returns {Object} Version object with buildingNames, basePrices, baseRates, menu, upgradesById, septillion
 */
export function createVersionObject(data, options = {}) {
  // Filter out empty building names
  const buildingNames = data.buildings.names.filter(name => name && name.trim() !== '');
  
  // Build basePrices and baseRates objects
  const basePrices = {};
  const baseRates = {};
  
  for (const name of buildingNames) {
    if (name in data.buildings.basePrices) {
      basePrices[name] = data.buildings.basePrices[name];
    }
    if (name in data.buildings.baseRates) {
      baseRates[name] = data.buildings.baseRates[name];
    }
  }
  
  // Create menu Set of Upgrade objects
  const menu = new Set();
  
  for (const upgradeDef of data.upgrades) {
    // Convert effect definitions to Effect objects
    const effects = {};
    
    for (const [target, effectDef] of Object.entries(upgradeDef.effects)) {
      try {
        // Skip custom effects for now
        if (effectDef.type === 'custom') {
          console.warn(`Skipping custom effect for upgrade "${upgradeDef.name}" target "${target}" - needs manual conversion`);
          continue;
        }
        effects[target] = createEffectFromDefinition(effectDef);
      } catch (error) {
        throw new Error(`Failed to create effect for upgrade "${upgradeDef.name}" target "${target}": ${error.message}`);
      }
    }
    
    // Allow upgrades with no effects (e.g., golden cookie appearance upgrades)
    // These upgrades exist in the game but don't affect CpS calculations
    
    // Create Upgrade object
    const upgrade = new Upgrade(
      upgradeDef.name,
      upgradeDef.requirements || {},
      upgradeDef.price,
      effects,
      upgradeDef.id !== undefined ? upgradeDef.id : null
    );
    
    menu.add(upgrade);
  }
  
  // Build upgradesById array
  const upgradesById = buildUpgradesByIdArray(menu);
  
  // Export septillion constant (default: 10**24, can be overridden)
  const septillion = options.septillion !== undefined ? options.septillion : 10**24;
  
  return {
    buildingNames,
    basePrices,
    baseRates,
    menu,
    upgradesById,
    septillion
  };
}

/**
 * Loads and validates a version from JSON data
 * @param {Object} versionData - Version data from JSON import
 * @param {Object} options - Optional configuration
 * @returns {Object} Version object ready for use
 */
export function loadVersion(versionData, options = {}) {
  // Validate version data structure
  try {
    validateVersionData(versionData);
  } catch (error) {
    console.error('Version data validation failed:', error);
    throw error;
  }
  
  // Transform to version object
  return createVersionObject(versionData, options);
}

// Pre-load all version JSON files using Vite's import.meta.glob
// This avoids Vite's limitation on variable imports in the same directory
// Note: Path is relative to this file's location (src/js/utils/)
const versionModules = import.meta.glob('../../data/versions/v*.json', { eager: true });

/**
 * Loads a version by version ID
 * Uses pre-loaded version modules to avoid Vite's dynamic import limitations
 * @param {string} versionId - Version ID (e.g., 'v2052', 'v2031')
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object>} Promise resolving to version object (actually synchronous, but kept as Promise for API compatibility)
 * @throws {Error} If version file not found or loading fails
 */
export async function loadVersionById(versionId, options = {}) {
  try {
    // Find the version module in the pre-loaded glob
    // The path will be something like '../../data/versions/v2052.json'
    const versionPath = `../../data/versions/${versionId}.json`;
    const versionDataModule = versionModules[versionPath];
    
    if (!versionDataModule) {
      throw new Error(`Version ${versionId} not found. Supported versions: v2031, v2048, v10466, v10466_xmas, v2052`);
    }
    
    // Extract the version data (could be default export or the module itself)
    const versionData = versionDataModule.default || versionDataModule;
    
    // Load and return the version object
    return loadVersion(versionData, options);
  } catch (error) {
    if (error.message.includes('not found')) {
      throw error;
    }
    throw new Error(`Failed to load version ${versionId}: ${error.message}`);
  }
}



