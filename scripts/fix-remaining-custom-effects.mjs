/**
 * Fix remaining custom effects by reading source code
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourcePath = join(__dirname, '../src/data/versions/v2052.js.backup');
const jsonPath = join(__dirname, '../src/data/versions/v2052.json');

const source = readFileSync(sourcePath, 'utf-8');
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

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

// Fix custom effects
let fixedCount = 0;
const fixes = [];

for (const upgrade of jsonData.upgrades) {
  if (upgrade.effects) {
    for (const [target, effect] of Object.entries(upgrade.effects)) {
      if (effect.type === 'custom') {
        const sourceLine = findUpgradeLine(upgrade.name);
        if (sourceLine) {
          // Extract effect for this target
          const targetPattern = new RegExp(`['"]${target}['"]:\\s*([^,}]+)`);
          const match = targetPattern.exec(sourceLine);
          
          if (match) {
            const effectCall = match[1].trim();
            
            // Check for fingersBoost
            if (effectCall.includes('fingersBoost(')) {
              const fingersMatch = effectCall.match(/fingersBoost\(([^)]+)\)/);
              if (fingersMatch) {
                const param = fingersMatch[1].trim();
                const value = evaluateExpression(param);
                upgrade.effects[target] = { type: 'fingersBoost', params: [value], priority: 1 };
                fixedCount++;
                fixes.push(`${upgrade.name} -> ${target}: fingersBoost(${value})`);
                continue;
              }
            }
            
            // Check for multiplier
            if (effectCall.includes('multiplier(')) {
              const multMatch = effectCall.match(/multiplier\(([^)]+)\)/);
              if (multMatch) {
                const value = parseFloat(multMatch[1]);
                upgrade.effects[target] = { type: 'multiplier', params: [value], priority: 2 };
                fixedCount++;
                fixes.push(`${upgrade.name} -> ${target}: multiplier(${value})`);
                continue;
              }
            }
            
            // Check for double
            if (effectCall === 'double' || effectCall.includes('double')) {
              upgrade.effects[target] = { type: 'multiplier', params: [2.0], priority: 2 };
              fixedCount++;
              fixes.push(`${upgrade.name} -> ${target}: multiplier(2.0)`);
              continue;
            }
          }
        }
      }
      
      // Fix null params
      if (effect.params && effect.params.includes(null)) {
        const sourceLine = findUpgradeLine(upgrade.name);
        if (sourceLine && sourceLine.includes('fingersBoost(')) {
          const fingersMatch = sourceLine.match(/fingersBoost\(([^)]+)\)/);
          if (fingersMatch) {
            const param = fingersMatch[1].trim();
            const value = evaluateExpression(param);
            effect.params = [value];
            fixedCount++;
            fixes.push(`${upgrade.name} -> ${target}: fixed null param to ${value}`);
          }
        }
      }
    }
  }
}

writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

console.log(`Fixed ${fixedCount} custom effects and null params`);
console.log('\nFixes applied:');
fixes.forEach(f => console.log(`  - ${f}`));

