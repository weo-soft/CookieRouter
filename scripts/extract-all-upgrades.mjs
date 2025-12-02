/**
 * Extract all upgrades from v2052.js module and add missing ones to JSON
 */

import v2052 from '../src/data/versions/v2052.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read existing JSON
const jsonPath = join(__dirname, '../src/data/versions/v2052.json');
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

// Get all upgrades from JS module
const allUpgrades = Array.from(v2052.menu);

// Create a map of existing upgrades by name
const existingUpgradesMap = new Map();
for (const upgrade of jsonData.upgrades) {
  existingUpgradesMap.set(upgrade.name, upgrade);
}

// Find missing upgrades
const missingUpgrades = [];
for (const upgrade of allUpgrades) {
  if (!existingUpgradesMap.has(upgrade.name)) {
    missingUpgrades.push(upgrade);
  }
}

console.log(`Found ${allUpgrades.size} upgrades in JS module`);
console.log(`Found ${jsonData.upgrades.length} upgrades in JSON`);
console.log(`Missing ${missingUpgrades.length} upgrades`);

// Convert Effect to JSON definition
function effectToDefinition(effect, target, upgradeName) {
  // Check if it's a multiplier (priority 2, simple multiplication)
  if (effect.priority === 2) {
    const testGame = { numBuildings: {}, buildingNames: [] };
    const testRate = 100;
    const result = effect.func(testRate, testGame);
    
    // Check for simple multiplier
    if (result === testRate * 2.0) {
      return { type: 'multiplier', params: [2.0], priority: 2 };
    }
    
    // Check for synergy effect (depends on another building)
    // Test with a building count
    testGame.numBuildings['You'] = 10;
    const result2 = effect.func(testRate, testGame);
    
    // If result changed, it's likely a synergy effect
    if (result2 !== result) {
      // Try to extract the multiplier and building name
      // For "Accelerated development": r * (1 + 0.05 * game.numBuildings['You'])
      // For "Peer review": r * (1 + 0.05 * game.numBuildings['You']) or r * (1 + 0.001 * game.numBuildings['Javascript console'])
      
      // Calculate multiplier: (result2 / result - 1) / buildingCount
      const multiplier = (result2 / result - 1) / 10;
      
      // Determine other building name based on target
      let otherBuilding = 'You';
      if (target === 'You' && upgradeName === 'Accelerated development') {
        otherBuilding = 'Time machine';
      } else if (target === 'You' && upgradeName === 'Peer review') {
        otherBuilding = 'Javascript console';
      } else if (target === 'Time machine' || target === 'Javascript console') {
        otherBuilding = 'You';
      }
      
      return { type: 'synergy', params: [multiplier, otherBuilding], priority: 2 };
    }
  }
  
  // Check for grandmaBoost (priority 2, depends on Grandma count)
  if (effect.priority === 2) {
    const testGame = { numBuildings: { 'Grandma': 10 }, buildingNames: ['Grandma'] };
    const testRate = 100;
    const result = effect.func(testRate, testGame);
    if (result > testRate) {
      // Might be grandmaBoost, but we can't determine n easily
      // For now, mark as custom
    }
  }
  
  // Check for fingersBoost (priority 1, additive)
  if (effect.priority === 1) {
    const testGame = { numBuildings: { 'Grandma': 5 }, buildingNames: ['Cursor', 'Grandma'] };
    const testRate = 100;
    const result = effect.func(testRate, testGame);
    if (result > testRate) {
      // Might be fingersBoost or mouseBoost
    }
  }
  
  // Default: return as custom (shouldn't happen for standard effects)
  console.warn(`Could not determine effect type for ${upgradeName} -> ${target}, using custom`);
  return { type: 'custom', params: [], priority: effect.priority };
}

// Convert Upgrade to JSON definition
function upgradeToDefinition(upgrade) {
  const effects = {};
  
  for (const [target, effect] of Object.entries(upgrade.effects)) {
    effects[target] = effectToDefinition(effect, target, upgrade.name);
  }
  
  return {
    name: upgrade.name,
    requirements: upgrade.req || {},
    price: upgrade.price,
    effects: effects,
    id: upgrade.id !== null && upgrade.id !== undefined ? upgrade.id : undefined
  };
}

// Convert missing upgrades
const missingUpgradeDefs = missingUpgrades.map(upgradeToDefinition);

// Add to JSON
jsonData.upgrades.push(...missingUpgradeDefs);

// Sort by ID
jsonData.upgrades.sort((a, b) => {
  const idA = a.id ?? 999999;
  const idB = b.id ?? 999999;
  return idA - idB;
});

// Write back
writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

console.log(`Added ${missingUpgradeDefs.length} missing upgrades to JSON`);
console.log(`Total upgrades in JSON: ${jsonData.upgrades.length}`);

// List the missing upgrades that were added
console.log('\nAdded upgrades:');
missingUpgradeDefs.forEach(u => console.log(`  - ${u.name} (ID: ${u.id})`));

