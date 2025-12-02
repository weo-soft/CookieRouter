/**
 * Script to extract version data from JS module and convert to JSON
 * This imports the actual module and extracts the data programmatically
 */

import v2052 from '../src/data/versions/v2052.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Convert Effect object to JSON definition
function effectToDefinition(effect, effectCall) {
  // Try to determine effect type from the original call
  // This is a heuristic - we'll need to match based on priority and behavior
  
  // Check if it's a multiplier (priority 2, simple multiplication)
  if (effect.priority === 2) {
    // Test with a sample to determine multiplier value
    const testGame = { numBuildings: {}, buildingNames: [] };
    const testRate = 100;
    const result = effect.func(testRate, testGame);
    
    if (result === testRate * 2.0) {
      return { type: 'multiplier', params: [2.0], priority: 2 };
    }
    
    // Check for grandmaBoost (priority 2, depends on Grandma count)
    // This is harder to detect automatically, we'll need the original call
    
    // Check effectCall string for hints
    if (effectCall && effectCall.includes('multiplier')) {
      const match = effectCall.match(/multiplier\(([^)]+)\)/);
      if (match) {
        const value = parseFloat(match[1]);
        return { type: 'multiplier', params: [value], priority: 2 };
      }
    }
    
    if (effectCall && effectCall.includes('grandmaBoost')) {
      const match = effectCall.match(/grandmaBoost\(([^)]+)\)/);
      if (match) {
        const value = parseFloat(match[1]);
        return { type: 'grandmaBoost', params: [value], priority: 2 };
      }
    }
    
    if (effectCall && effectCall.includes('double')) {
      return { type: 'multiplier', params: [2.0], priority: 2 };
    }
  }
  
  // Check for fingersBoost (priority 1, additive)
  if (effect.priority === 1) {
    if (effectCall && effectCall.includes('fingersBoost')) {
      const match = effectCall.match(/fingersBoost\(([^)]+)\)/);
      if (match) {
        const value = parseFloat(match[1]);
        return { type: 'fingersBoost', params: [value], priority: 1 };
      }
    }
    
    if (effectCall && effectCall.includes('mouseBoost')) {
      return { type: 'mouseBoost', params: [], priority: 1 };
    }
  }
  
  // Check for percentBoost (priority 0)
  if (effect.priority === 0) {
    if (effectCall && effectCall.includes('percentBoost')) {
      const match = effectCall.match(/percentBoost\(([^)]+)\)/);
      if (match) {
        const value = parseFloat(match[1]);
        return { type: 'percentBoost', params: [value], priority: 0 };
      }
    }
  }
  
  // Fallback: return custom effect (will need manual conversion)
  return { type: 'custom', params: [], priority: effect.priority };
}

// Convert Upgrade to JSON definition
function upgradeToDefinition(upgrade) {
  const effects = {};
  
  for (const [target, effect] of Object.entries(upgrade.effects)) {
    // We can't easily determine the original effect call from the Effect object
    // So we'll need to use heuristics or manual mapping
    // For now, use a simple approach based on priority and test
    effects[target] = effectToDefinition(effect, null);
  }
  
  return {
    name: upgrade.name,
    requirements: upgrade.req,
    price: upgrade.price,
    effects: effects,
    id: upgrade.id !== null && upgrade.id !== undefined ? upgrade.id : undefined
  };
}

// Main extraction
function extractVersionData() {
  const upgrades = Array.from(v2052.menu).map(upgradeToDefinition);
  
  // Sort upgrades by ID for consistency
  upgrades.sort((a, b) => {
    const idA = a.id ?? 999999;
    const idB = b.id ?? 999999;
    return idA - idB;
  });
  
  const versionData = {
    version: 'v2052',
    buildings: {
      names: v2052.buildingNames,
      basePrices: v2052.basePrices,
      baseRates: v2052.baseRates
    },
    upgrades: upgrades
  };
  
  return versionData;
}

// Run extraction
const data = extractVersionData();
const outputPath = join(__dirname, '../src/data/versions/v2052.json');
writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`Extracted version data to ${outputPath}`);
console.log(`Buildings: ${data.buildings.names.length}`);
console.log(`Upgrades: ${data.upgrades.length}`);
console.log('\nNote: Effect definitions may need manual review for custom effects');

