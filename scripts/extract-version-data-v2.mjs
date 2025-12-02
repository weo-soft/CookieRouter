/**
 * Improved script to extract version data from JS source file
 * Parses the source code to extract effect calls correctly
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    // Replace constants with their numeric values
    let replaced = expr.trim();
    
    // Handle expressions like "70 * undecillion" - replace the constant name with its value
    const constants = {
      million, billion, trillion, quadrillion, quintillion, sextillion, septillion,
      octillion, nonillion, decillion, undecillion, duodecillion, tredecillion,
      quattuordecillion, quindecillion, sexdecillion, septendecillion, octodecillion,
      novemdecillion, vigintillion, unvigintillion
    };
    
    for (const [name, value] of Object.entries(constants)) {
      // Replace standalone constant names (not already part of a number)
      replaced = replaced.replace(new RegExp(`\\b${name}\\b`, 'g'), value);
    }
    
    return new Function('return ' + replaced)();
  } catch (e) {
    console.error(`Error evaluating: ${expr}`, e);
    return 0;
  }
}

// Parse effect call to definition
function parseEffectCall(effectStr) {
  effectStr = effectStr.trim();
  
  // Handle double (which is multiplier(2.0))
  if (effectStr === 'double') {
    return { type: 'multiplier', params: [2.0], priority: 2 };
  }
  
  // Handle mouseBoost (no params)
  if (effectStr === 'mouseBoost') {
    return { type: 'mouseBoost', params: [], priority: 1 };
  }
  
  // Parse function calls: multiplier(2.0), grandmaBoost(1), etc.
  const funcMatch = effectStr.match(/(\w+)\(([^)]*)\)/);
  if (funcMatch) {
    const funcName = funcMatch[1];
    const paramsStr = funcMatch[2];
    
    // Determine priority based on function name
    let priority = 2; // default
    if (funcName === 'percentBoost') priority = 0;
    else if (funcName === 'fingersBoost' || funcName === 'mouseBoost') priority = 1;
    else if (funcName === 'multiplier' || funcName === 'grandmaBoost') priority = 2;
    
    // Parse parameters
    const params = [];
    if (paramsStr) {
      // Split by comma, but be careful with nested expressions
      const paramValues = paramsStr.split(',').map(p => p.trim());
      for (const param of paramValues) {
        const value = evaluateExpression(param);
        params.push(value);
      }
    }
    
    return { type: funcName, params, priority };
  }
  
  // Handle new Effect(...) - custom effects
  const customMatch = effectStr.match(/new Effect\((\d+),\s*\(r,\s*game\)\s*=>\s*([^}]+)\)/);
  if (customMatch) {
    const priority = parseInt(customMatch[1]);
    const funcBody = customMatch[2];
    // For custom effects, we'll need to store them differently
    // For now, mark as custom
    return { type: 'custom', params: [], priority, _custom: funcBody };
  }
  
  console.warn(`Could not parse effect: ${effectStr}`);
  return { type: 'custom', params: [], priority: 2 };
}

// Parse upgrade line
function parseUpgradeLine(line) {
  // Match: menu.add(new Upgrade('Name', { req }, price, { effects }, id));
  const upgradeMatch = line.match(/menu\.add\(new Upgrade\(([^)]+)\)\)/);
  if (!upgradeMatch) return null;
  
  const argsStr = upgradeMatch[1];
  
  // Parse arguments - this is tricky because of nested structures
  // We'll use a more sophisticated parser
  let args = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    const prev = i > 0 ? argsStr[i - 1] : '';
    
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar && prev !== '\\') {
      inString = false;
      current += char;
    } else if (!inString && char === '{') {
      depth++;
      current += char;
    } else if (!inString && char === '}') {
      depth--;
      current += char;
    } else if (!inString && depth === 0 && char === ',') {
      args.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    args.push(current.trim());
  }
  
  if (args.length < 4) {
    console.warn(`Could not parse upgrade line: ${line.substring(0, 80)}...`);
    return null;
  }
  
  // Parse name (first arg, remove quotes)
  const name = args[0].replace(/^['"]|['"]$/g, '');
  
  // Parse requirements (second arg, should be an object)
  let requirements = {};
  try {
    const reqStr = args[1].trim();
    if (reqStr !== '{}') {
      // Parse object like { 'Cursor': 1 }
      const reqMatch = reqStr.match(/\{([^}]+)\}/);
      if (reqMatch) {
        const reqPairs = reqMatch[1].split(',').map(p => p.trim());
        for (const pair of reqPairs) {
          const [key, value] = pair.split(':').map(s => s.trim());
          const cleanKey = key.replace(/['"]/g, '');
          const cleanValue = parseInt(value);
          requirements[cleanKey] = cleanValue;
        }
      }
    }
  } catch (e) {
    console.warn(`Error parsing requirements: ${args[1]}`, e);
  }
  
  // Parse price (third arg)
  let price = 0;
  try {
    const priceStr = args[2].trim();
    price = evaluateExpression(priceStr);
  } catch (e) {
    console.warn(`Error parsing price: ${args[2]}`, e);
  }
  
  // Parse effects (fourth arg, should be an object)
  const effects = {};
  try {
    const effectsStr = args[3].trim();
    if (effectsStr !== '{}') {
      // Parse object like { 'Cursor': double, 'mouse': double }
      const effectsMatch = effectsStr.match(/\{([^}]+)\}/);
      if (effectsMatch) {
        const effectPairs = effectsMatch[1].split(',').map(p => p.trim());
        for (const pair of effectPairs) {
          const [key, value] = pair.split(':').map(s => s.trim());
          const cleanKey = key.replace(/['"]/g, '');
          const effectDef = parseEffectCall(value);
          effects[cleanKey] = effectDef;
        }
      }
    }
  } catch (e) {
    console.warn(`Error parsing effects: ${args[3]}`, e);
  }
  
  // Parse ID (fifth arg, optional)
  let id = undefined;
  if (args.length > 4) {
    try {
      const idStr = args[4].trim();
      if (idStr) {
        id = parseInt(idStr);
      }
    } catch (e) {
      // ID is optional, ignore errors
    }
  }
  
  return {
    name,
    requirements,
    price,
    effects,
    id
  };
}

// Main extraction
function extractVersionData(inputPath) {
  const content = readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n');
  
  // Extract building names
  const buildingNamesMatch = content.match(/export const buildingNames = \[([^\]]+)\]/s);
  const buildingNames = buildingNamesMatch 
    ? buildingNamesMatch[1].split(',').map(s => s.trim().replace(/['"]/g, '').replace(/\n/g, ''))
    : [];
  
  // Extract basePrices
  const basePrices = {};
  const pricesMatch = content.match(/export const basePrices = \{([^}]+)\}/s);
  if (pricesMatch) {
    const pricesText = pricesMatch[1];
    buildingNames.forEach(name => {
      const priceMatch = pricesText.match(new RegExp(`'${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':\\s*([^,}\\n]+)`, 's'));
      if (priceMatch) {
        const priceExpr = priceMatch[1].trim();
        basePrices[name] = evaluateExpression(priceExpr);
      }
    });
  }
  
  // Extract baseRates
  const baseRates = {};
  const ratesMatch = content.match(/export const baseRates = \{([^}]+)\}/s);
  if (ratesMatch) {
    const ratesText = ratesMatch[1];
    buildingNames.forEach(name => {
      const rateMatch = ratesText.match(new RegExp(`'${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':\\s*([^,}\\n]+)`, 's'));
      if (rateMatch) {
        const rateExpr = rateMatch[1].trim();
        baseRates[name] = evaluateExpression(rateExpr);
      }
    });
  }
  
  // Extract upgrades
  const upgrades = [];
  for (const line of lines) {
    if (line.includes('menu.add(new Upgrade')) {
      const upgrade = parseUpgradeLine(line);
      if (upgrade) {
        upgrades.push(upgrade);
      }
    }
  }
  
  // Sort by ID for consistency
  upgrades.sort((a, b) => {
    const idA = a.id ?? 999999;
    const idB = b.id ?? 999999;
    return idA - idB;
  });
  
  return {
    version: 'v2052',
    buildings: {
      names: buildingNames,
      basePrices,
      baseRates
    },
    upgrades
  };
}

// Run extraction
const inputPath = join(__dirname, '../src/data/versions/v2052.js');
const data = extractVersionData(inputPath);
const outputPath = join(__dirname, '../src/data/versions/v2052.json');
writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`Extracted version data to ${outputPath}`);
console.log(`Buildings: ${data.buildings.names.length}`);
console.log(`Upgrades: ${data.upgrades.length}`);
console.log(`\nChecking for custom effects...`);

// Check for custom effects
const customEffects = data.upgrades.filter(u => 
  Object.values(u.effects).some(e => e.type === 'custom')
);
if (customEffects.length > 0) {
  console.log(`\nWarning: Found ${customEffects.length} upgrades with custom effects that need manual review:`);
  customEffects.slice(0, 5).forEach(u => {
    console.log(`  - ${u.name}`);
  });
}

