/**
 * Fix effect types in JSON by reading source code
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourcePath = join(__dirname, '../src/data/versions/v2052.js');
const jsonPath = join(__dirname, '../src/data/versions/v2052.json');

const source = readFileSync(sourcePath, 'utf-8');
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

// Parse effect calls from source
function parseEffectFromSource(upgradeName, target, sourceLine) {
  // Extract effect call from line
  if (sourceLine.includes('fingersBoost(')) {
    const match = sourceLine.match(/fingersBoost\(([^)]+)\)/);
    if (match) {
      const param = match[1].trim();
      // Evaluate expression
      const million = 10**6;
      const billion = 10**9;
      const trillion = 10**12;
      let value = param.replace(/\bmillion\b/g, `* ${million}`)
                       .replace(/\bbillion\b/g, `* ${billion}`)
                       .replace(/\btrillion\b/g, `* ${trillion}`);
      try {
        const numValue = new Function('return ' + value.replace(/\* /g, '*'))();
        return { type: 'fingersBoost', params: [numValue], priority: 1 };
      } catch (e) {
        // Try direct evaluation
        const numValue = eval(param.replace(/\bmillion\b/g, million)
                                   .replace(/\bbillion\b/g, billion)
                                   .replace(/\btrillion\b/g, trillion));
        return { type: 'fingersBoost', params: [numValue], priority: 1 };
      }
    }
  }
  
  if (sourceLine.includes('percentBoost(')) {
    const match = sourceLine.match(/percentBoost\(([^)]+)\)/);
    if (match) {
      const value = parseFloat(match[1]);
      return { type: 'percentBoost', params: [value], priority: 0 };
    }
  }
  
  if (sourceLine.includes('multiplier(')) {
    const match = sourceLine.match(/multiplier\(([^)]+)\)/);
    if (match) {
      const value = parseFloat(match[1]);
      return { type: 'multiplier', params: [value], priority: 2 };
    }
  }
  
  if (sourceLine.includes('grandmaBoost(')) {
    const match = sourceLine.match(/grandmaBoost\(([^)]+)\)/);
    if (match) {
      const value = parseFloat(match[1]);
      return { type: 'grandmaBoost', params: [value], priority: 2 };
    }
  }
  
  if (sourceLine === 'double' || sourceLine.includes('double')) {
    return { type: 'multiplier', params: [2.0], priority: 2 };
  }
  
  if (sourceLine.includes('mouseBoost')) {
    return { type: 'mouseBoost', params: [], priority: 1 };
  }
  
  // Check for synergy effects
  if (sourceLine.includes('new Effect(2, (r, game) => r * (1 +')) {
    // Extract multiplier and building
    const match = sourceLine.match(/r \* \(1 \+ ([^ ]+) \* game\.numBuildings\[['"]([^'"]+)['"]\]\)/);
    if (match) {
      const multiplier = parseFloat(match[1]);
      const building = match[2];
      return { type: 'synergy', params: [multiplier, building], priority: 2 };
    }
  }
  
  return null;
}

// Find upgrade line in source
function findUpgradeLine(upgradeName) {
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`'${upgradeName}'`) || lines[i].includes(`"${upgradeName}"`)) {
      // Get the full upgrade definition (may span multiple lines)
      let fullLine = lines[i];
      let j = i;
      while (!fullLine.includes(');') && j < lines.length - 1) {
        j++;
        fullLine += ' ' + lines[j].trim();
      }
      return fullLine;
    }
  }
  return null;
}

// Fix effects for upgrades marked as custom
let fixedCount = 0;
for (const upgrade of jsonData.upgrades) {
  if (upgrade.effects) {
    let needsFix = false;
    for (const [target, effect] of Object.entries(upgrade.effects)) {
      if (effect.type === 'custom') {
        needsFix = true;
        break;
      }
    }
    
    if (needsFix) {
      const sourceLine = findUpgradeLine(upgrade.name);
      if (sourceLine) {
        // Parse effects from source
        for (const [target, effect] of Object.entries(upgrade.effects)) {
          if (effect.type === 'custom') {
            // Extract effect for this target from source line
            const targetMatch = new RegExp(`['"]${target}['"]:\\s*([^,}]+)`).exec(sourceLine);
            if (targetMatch) {
              const effectCall = targetMatch[1].trim();
              const fixedEffect = parseEffectFromSource(upgrade.name, target, effectCall);
              if (fixedEffect) {
                upgrade.effects[target] = fixedEffect;
                fixedCount++;
              }
            }
          }
        }
      }
    }
  }
  
  // Fix Peer review ID
  if (upgrade.name === 'Peer review' && upgrade.id === undefined) {
    upgrade.id = 860;
  }
}

// Fix Accelerated development and Peer review synergy effects manually
for (const upgrade of jsonData.upgrades) {
  if (upgrade.name === 'Accelerated development') {
    upgrade.effects['Time machine'] = { type: 'synergy', params: [0.05, 'You'], priority: 2 };
    upgrade.effects['You'] = { type: 'synergy', params: [0.001, 'Time machine'], priority: 2 };
  } else if (upgrade.name === 'Peer review') {
    upgrade.effects['Javascript console'] = { type: 'synergy', params: [0.05, 'You'], priority: 2 };
    upgrade.effects['You'] = { type: 'synergy', params: [0.001, 'Javascript console'], priority: 2 };
    upgrade.id = 860;
  }
}

writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

console.log(`Fixed ${fixedCount} effect definitions`);
console.log(`Total upgrades: ${jsonData.upgrades.length}`);

