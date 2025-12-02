/**
 * Fix effect types in v2031.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jsonPath = join(__dirname, '../src/data/versions/v2031.json');
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

// Fix mouseBoost
for (const upgrade of jsonData.upgrades) {
  if (upgrade.name === 'Plastic mouse' && upgrade.effects.mouse) {
    upgrade.effects.mouse = { type: 'mouseBoost', params: [], priority: 1 };
  }
}

// Fix grandmaBoost for grandma type upgrades
const grandmaUpgrades = {
  'Farmer grandmas': { 'Farm': 1 },
  'Miner grandmas': { 'Mine': 2 },
  'Worker grandmas': { 'Factory': 3 },
  'Banker grandmas': { 'Bank': 4 },
  'Priestess grandmas': { 'Temple': 5 },
  'Witch grandmas': { 'Wizard tower': 6 },
  'Cosmic grandmas': { 'Shipment': 7 }
};

for (const upgrade of jsonData.upgrades) {
  if (grandmaUpgrades[upgrade.name]) {
    for (const [target, n] of Object.entries(grandmaUpgrades[upgrade.name])) {
      if (upgrade.effects[target]) {
        upgrade.effects[target] = { type: 'grandmaBoost', params: [n], priority: 2 };
      }
    }
  }
}

writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
console.log('Fixed v2031 effect types');

