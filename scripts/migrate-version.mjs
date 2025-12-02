/**
 * Migrate a version file to JSON + loader format
 * Usage: node scripts/migrate-version.mjs v2031
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const versionId = process.argv[2];
if (!versionId) {
  console.error('Usage: node scripts/migrate-version.mjs <versionId>');
  process.exit(1);
}

// Import the version module dynamically
const versionPath = `../src/data/versions/${versionId}.js`;
const versionModule = await import(versionPath);
const version = versionModule.default;

// Constants for evaluation
const million = 10**6;
const billion = 10**9;
const trillion = 10**12;
const quadrillion = 10**15;
const quintillion = 10**18;
const sextillion = 10**21;
const septillion = 10**24;
const octillion = 10**27;
const nonillion = 10**30;
const decillion = 10**33;
const undecillion = 10**36;
const duodecillion = 10**39;
const tredecillion = 10**42;
const quattuordecillion = 10**45;
const quindecillion = 10**48;
const sexdecillion = 10**51;
const septendecillion = 10**54;
const octodecillion = 10**57;
const novemdecillion = 10**60;
const vigintillion = 10**63;
const unvigintillion = 10**66;

function evaluateExpression(expr) {
  try {
    const replaced = expr
      .replace(/\bmillion\b/g, million)
      .replace(/\bbillion\b/g, billion)
      .replace(/\btrillion\b/g, trillion)
      .replace(/\bquadrillion\b/g, quadrillion)
      .replace(/\bquintillion\b/g, quintillion)
      .replace(/\bsextillion\b/g, sextillion)
      .replace(/\bseptillion\b/g, septillion)
      .replace(/\boctillion\b/g, octillion)
      .replace(/\bnonillion\b/g, nonillion)
      .replace(/\bdecillion\b/g, decillion)
      .replace(/\bundecillion\b/g, undecillion)
      .replace(/\bduodecillion\b/g, duodecillion)
      .replace(/\btredecillion\b/g, tredecillion)
      .replace(/\bquattuordecillion\b/g, quattuordecillion)
      .replace(/\bquindecillion\b/g, quindecillion)
      .replace(/\bsexdecillion\b/g, sexdecillion)
      .replace(/\bseptendecillion\b/g, septendecillion)
      .replace(/\boctodecillion\b/g, octodecillion)
      .replace(/\bnovemdecillion\b/g, novemdecillion)
      .replace(/\bvigintillion\b/g, vigintillion)
      .replace(/\bunvigintillion\b/g, unvigintillion);
    
    return new Function('return ' + replaced)();
  } catch (e) {
    console.error(`Error evaluating: ${expr}`, e);
    return 0;
  }
}

// Convert Effect to JSON definition by testing it
function effectToDefinition(effect, upgradeName, target, sourceLine) {
  // Test with sample game state
  const testGame = {
    numBuildings: { 'Grandma': 10, 'Cursor': 5, 'Farm': 3 },
    buildingNames: ['Cursor', 'Grandma', 'Farm'],
    buildingOnlyRate: () => 10
  };
  const testRate = 100;
  
  const result1 = effect.func(testRate, testGame);
  
  // Check for multiplier (priority 2, simple multiplication)
  if (effect.priority === 2 && result1 === testRate * 2.0) {
    return { type: 'multiplier', params: [2.0], priority: 2 };
  }
  
  // Check for fingersBoost (priority 1, additive, depends on building count)
  if (effect.priority === 1) {
    const testGame2 = { ...testGame, numBuildings: { ...testGame.numBuildings, 'Grandma': 20 } };
    const result2 = effect.func(testRate, testGame2);
    if (result2 > result1) {
      // Likely fingersBoost or mouseBoost
      if (sourceLine && sourceLine.includes('fingersBoost(')) {
        const match = sourceLine.match(/fingersBoost\(([^)]+)\)/);
        if (match) {
          const param = match[1].trim();
          const value = evaluateExpression(param);
          return { type: 'fingersBoost', params: [value], priority: 1 };
        }
      }
      if (sourceLine && (sourceLine.includes('mouseBoost') || sourceLine.includes('buildingOnlyRate'))) {
        return { type: 'mouseBoost', params: [], priority: 1 };
      }
    }
  }
  
  // Check for percentBoost (priority 0)
  if (effect.priority === 0) {
    if (sourceLine && sourceLine.includes('percentBoost(')) {
      const match = sourceLine.match(/percentBoost\(([^)]+)\)/);
      if (match) {
        const value = parseFloat(match[1]);
        return { type: 'percentBoost', params: [value], priority: 0 };
      }
    }
  }
  
  // Check for grandmaBoost (priority 2, depends on Grandma count)
  if (effect.priority === 2) {
    const testGame3 = { ...testGame, numBuildings: { 'Grandma': 10 } };
    const result3 = effect.func(testRate, testGame3);
    if (result3 > testRate && result3 !== testRate * 2.0) {
      if (sourceLine && sourceLine.includes('grandmaBoost(')) {
        const match = sourceLine.match(/grandmaBoost\(([^)]+)\)/);
        if (match) {
          const value = parseFloat(match[1]);
          return { type: 'grandmaBoost', params: [value], priority: 2 };
        }
      }
    }
  }
  
  // Check for synergy effects
  if (effect.priority === 2 && sourceLine && sourceLine.includes('new Effect')) {
    const match = sourceLine.match(/r \* \(1 \+ ([^ ]+) \* game\.numBuildings\[['"]([^'"]+)['"]\]\)/);
    if (match) {
      const multiplier = parseFloat(match[1]);
      const building = match[2];
      return { type: 'synergy', params: [multiplier, building], priority: 2 };
    }
  }
  
  // Fallback: try to infer from source line
  if (sourceLine) {
    if (sourceLine.includes('double') || sourceLine === 'double') {
      return { type: 'multiplier', params: [2.0], priority: 2 };
    }
    if (sourceLine.includes('multiplier(')) {
      const match = sourceLine.match(/multiplier\(([^)]+)\)/);
      if (match) {
        const value = parseFloat(match[1]);
        return { type: 'multiplier', params: [value], priority: 2 };
      }
    }
  }
  
  console.warn(`Could not determine effect type for ${upgradeName} -> ${target}, using multiplier(2.0) as fallback`);
  return { type: 'multiplier', params: [2.0], priority: 2 };
}

// Read source file to get effect calls
const sourcePath = join(__dirname, `../src/data/versions/${versionId}.js`);
const source = readFileSync(sourcePath, 'utf-8');
const sourceLines = source.split('\n');

// Find upgrade line in source
function findUpgradeLine(upgradeName) {
  for (let i = 0; i < sourceLines.length; i++) {
    if (sourceLines[i].includes(`'${upgradeName}'`) || sourceLines[i].includes(`"${upgradeName}"`)) {
      let fullLine = sourceLines[i];
      let j = i;
      while (!fullLine.includes(');') && j < sourceLines.length - 1) {
        j++;
        fullLine += ' ' + sourceLines[j].trim();
      }
      return fullLine;
    }
  }
  return null;
}

// Convert Upgrade to JSON definition
function upgradeToDefinition(upgrade) {
  const sourceLine = findUpgradeLine(upgrade.name);
  const effects = {};
  
  for (const [target, effect] of Object.entries(upgrade.effects)) {
    // Extract effect call from source line
    let effectCall = null;
    if (sourceLine) {
      const targetPattern = new RegExp(`['"]${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]:\\s*([^,}]+)`);
      const match = targetPattern.exec(sourceLine);
      if (match) {
        effectCall = match[1].trim();
      }
    }
    
    effects[target] = effectToDefinition(effect, upgrade.name, target, effectCall || sourceLine);
  }
  
  return {
    name: upgrade.name,
    requirements: upgrade.req || {},
    price: upgrade.price,
    effects: effects,
    id: upgrade.id !== null && upgrade.id !== undefined ? upgrade.id : undefined
  };
}

// Extract data
const upgrades = Array.from(version.menu).map(upgradeToDefinition);

// Sort by ID
upgrades.sort((a, b) => {
  const idA = a.id ?? 999999;
  const idB = b.id ?? 999999;
  return idA - idB;
});

// Create JSON data
const jsonData = {
  version: versionId,
  buildings: {
    names: version.buildingNames.filter(name => name && name.trim() !== ''),
    basePrices: version.basePrices,
    baseRates: version.baseRates
  },
  upgrades: upgrades
};

// Write JSON file
const jsonPath = join(__dirname, `../src/data/versions/${versionId}.json`);
writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

console.log(`✅ Extracted ${versionId} to JSON`);
console.log(`   Buildings: ${jsonData.buildings.names.length}`);
console.log(`   Upgrades: ${jsonData.upgrades.length}`);
console.log(`   JSON file: ${jsonPath}`);

// Create loader file
const loaderTemplate = `/**
 * Version loader for ${versionId}
 * Loads JSON version data and transforms it into the version object format
 * expected by the game simulation system.
 * 
 * This file replaces the original ${versionId}.js which contained hardcoded data.
 * The data is now stored in ${versionId}.json for easier maintenance.
 */

import versionData from './${versionId}.json';
import { Upgrade, Effect } from '../../js/game.js';
import {
  createMultiplier,
  createGrandmaBoost,
  createFingersBoost,
  createPercentBoost,
  createMouseBoost,
  createSynergyEffect,
  createEffectFromDefinition
} from '../../js/utils/upgrade-effects.js';

// Validate version data structure
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
      throw new Error(\`Building \${buildingName} missing in basePrices\`);
    }
    
    if (!(buildingName in data.buildings.baseRates)) {
      throw new Error(\`Building \${buildingName} missing in baseRates\`);
    }
  }
  
  // Validate upgrades
  for (let i = 0; i < data.upgrades.length; i++) {
    const upgrade = data.upgrades[i];
    
    if (!upgrade.name) {
      throw new Error(\`Upgrade at index \${i} missing name\`);
    }
    
    if (typeof upgrade.price !== 'number' || upgrade.price <= 0) {
      throw new Error(\`Upgrade "\${upgrade.name}" has invalid price: \${upgrade.price}\`);
    }
    
    if (!upgrade.effects || typeof upgrade.effects !== 'object') {
      throw new Error(\`Upgrade "\${upgrade.name}" missing or invalid effects\`);
    }
    
    // Validate effect definitions
    for (const [target, effectDef] of Object.entries(upgrade.effects)) {
      if (!effectDef.type) {
        throw new Error(\`Upgrade "\${upgrade.name}" effect for \${target} missing type\`);
      }
      
      if (!Array.isArray(effectDef.params)) {
        throw new Error(\`Upgrade "\${upgrade.name}" effect for \${target} params must be an array\`);
      }
    }
  }
}

// Build upgradesById array from menu Set
function buildUpgradesByIdArray(menu) {
  const upgradesById = [];
  
  for (const upgrade of menu) {
    if (upgrade.id !== null && upgrade.id !== undefined) {
      upgradesById[upgrade.id] = upgrade;
    }
  }
  
  return upgradesById;
}

// Transform JSON data into version object
function createVersionObject(data) {
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
          console.warn(\`Skipping custom effect for upgrade "\${upgradeDef.name}" target "\${target}" - needs manual conversion\`);
          continue;
        }
        effects[target] = createEffectFromDefinition(effectDef);
      } catch (error) {
        throw new Error(\`Failed to create effect for upgrade "\${upgradeDef.name}" target "\${target}": \${error.message}\`);
      }
    }
    
    // Skip upgrades with no valid effects
    if (Object.keys(effects).length === 0) {
      console.warn(\`Skipping upgrade "\${upgradeDef.name}" - no valid effects\`);
      continue;
    }
    
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
  
  // Export constants if they exist in original
  const exports = {
    buildingNames,
    basePrices,
    baseRates,
    menu,
    upgradesById
  };
  
  // Add septillion if it exists in original
  if (version.septillion !== undefined) {
    exports.septillion = version.septillion;
  }
  
  return exports;
}

// Validate and transform
try {
  validateVersionData(versionData);
} catch (error) {
  console.error('Version data validation failed:', error);
  throw error;
}

const versionObj = createVersionObject(versionData);

export default versionObj;
`;

// Backup old file and write new loader
const oldLoaderPath = join(__dirname, `../src/data/versions/${versionId}.js`);
const backupPath = join(__dirname, `../src/data/versions/${versionId}.js.backup`);

// Backup old file if it exists and isn't already a backup
if (!oldLoaderPath.includes('.backup')) {
  try {
    const oldContent = readFileSync(oldLoaderPath, 'utf-8');
    if (!oldContent.includes('import versionData')) {
      // Only backup if it's not already a loader
      writeFileSync(backupPath, oldContent, 'utf-8');
      console.log(`   Backed up original to ${backupPath}`);
    }
  } catch (e) {
    // File might not exist, that's okay
  }
}

// Write new loader
writeFileSync(oldLoaderPath, loaderTemplate, 'utf-8');
console.log(`✅ Created loader: ${oldLoaderPath}`);

console.log(`\n✅ Migration complete for ${versionId}!`);

