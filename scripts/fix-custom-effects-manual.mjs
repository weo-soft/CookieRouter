/**
 * Manually fix remaining custom effects
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jsonPath = join(__dirname, '../src/data/versions/v2052.json');
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

// Manual fixes based on source code
const fixes = {
  'Thousand fingers': { 'Cursor': { type: 'fingersBoost', params: [0.1], priority: 1 } },
  'Million fingers': { 'Cursor': { type: 'fingersBoost', params: [0.4], priority: 1 } },
  'Billion fingers': { 'Cursor': { type: 'fingersBoost', params: [4.5], priority: 1 } },
  'Trillion fingers': { 'Cursor': { type: 'fingersBoost', params: [45], priority: 1 } },
  'Quadrillion fingers': { 'Cursor': { type: 'fingersBoost', params: [950], priority: 1 } },
  'Quintillion fingers': { 'Cursor': { type: 'fingersBoost', params: [19000], priority: 1 } },
  'Sextillion fingers': { 'Cursor': { type: 'fingersBoost', params: [380000], priority: 1 } },
  'Septillion fingers': { 'Cursor': { type: 'fingersBoost', params: [7600000], priority: 1 } },
  'Octillion fingers': { 'Cursor': { type: 'fingersBoost', params: [152000000], priority: 1 } },
  'Nonillion fingers': { 'Cursor': { type: 'fingersBoost', params: [3040000000], priority: 1 } },
  'Decillion fingers': { 'Cursor': { type: 'fingersBoost', params: [60800000000], priority: 1 } },
  'Undecillion fingers': { 'Cursor': { type: 'fingersBoost', params: [1216000000000], priority: 1 } },
  'Bingo center': { 'Grandma': { type: 'multiplier', params: [4.0], priority: 2 } }
};

let fixedCount = 0;

for (const upgrade of jsonData.upgrades) {
  if (fixes[upgrade.name]) {
    for (const [target, effect] of Object.entries(fixes[upgrade.name])) {
      if (upgrade.effects && upgrade.effects[target]) {
        if (upgrade.effects[target].type === 'custom') {
          upgrade.effects[target] = effect;
          fixedCount++;
          console.log(`Fixed ${upgrade.name} -> ${target}: ${effect.type}(${effect.params.join(', ')})`);
        }
      }
    }
  }
}

writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

console.log(`\nFixed ${fixedCount} custom effects`);

