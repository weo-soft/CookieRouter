/**
 * Fix effect types for all migrated versions
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fix v2031
const v2031Path = join(__dirname, '../src/data/versions/v2031.json');
const v2031Data = JSON.parse(readFileSync(v2031Path, 'utf-8'));

// Fix mouseBoost
for (const upgrade of v2031Data.upgrades) {
  if (upgrade.name.includes('mouse') && upgrade.effects.mouse) {
    upgrade.effects.mouse = { type: 'mouseBoost', params: [], priority: 1 };
  }
}

// Fix grandmaBoost for grandma type upgrades (v2031 uses grandmaType)
const v2031GrandmaUpgrades = {
  'Farmer grandmas': { 'Farm': 1 },
  'Miner grandmas': { 'Mine': 2 },
  'Worker grandmas': { 'Factory': 3 },
  'Banker grandmas': { 'Bank': 4 },
  'Priestess grandmas': { 'Temple': 5 },
  'Witch grandmas': { 'Wizard tower': 6 },
  'Cosmic grandmas': { 'Shipment': 7 }
};

for (const upgrade of v2031Data.upgrades) {
  if (v2031GrandmaUpgrades[upgrade.name]) {
    for (const [target, n] of Object.entries(v2031GrandmaUpgrades[upgrade.name])) {
      if (upgrade.effects[target]) {
        upgrade.effects[target] = { type: 'grandmaBoost', params: [n], priority: 2 };
      }
    }
  }
}

// Fix fingersBoost for fingers upgrades (v2031 uses fingersType)
const v2031FingersUpgrades = {
  'Thousand fingers': 0.1,
  'Million fingers': 0.4,
  'Billion fingers': 4.5,
  'Trillion fingers': 45,
  'Quadrillion fingers': 950,
  'Quintillion fingers': 19000,
  'Sextillion fingers': 380000,
  'Septillion fingers': 7600000,
  'Octillion fingers': 152000000,
  'Nonillion fingers': 3040000000
};

for (const upgrade of v2031Data.upgrades) {
  if (v2031FingersUpgrades[upgrade.name]) {
    const value = v2031FingersUpgrades[upgrade.name];
    if (upgrade.effects.Cursor) {
      upgrade.effects.Cursor = { type: 'fingersBoost', params: [value], priority: 1 };
    }
    if (upgrade.effects.mouse) {
      upgrade.effects.mouse = { type: 'fingersBoost', params: [value], priority: 1 };
    }
  }
}

writeFileSync(v2031Path, JSON.stringify(v2031Data, null, 2), 'utf-8');
console.log('✅ Fixed v2031 effects');

// Fix v2048
const v2048Path = join(__dirname, '../src/data/versions/v2048.json');
if (existsSync(v2048Path)) {
  const v2048Data = JSON.parse(readFileSync(v2048Path, 'utf-8'));
  
  // Fix mouseBoost
  for (const upgrade of v2048Data.upgrades) {
    if (upgrade.name.includes('mouse') && upgrade.effects.mouse) {
      upgrade.effects.mouse = { type: 'mouseBoost', params: [], priority: 1 };
    }
  }
  
  // Fix fingersBoost (same values as v2031)
  for (const upgrade of v2048Data.upgrades) {
    if (v2031FingersUpgrades[upgrade.name]) {
      const value = v2031FingersUpgrades[upgrade.name];
      if (upgrade.effects.Cursor) {
        upgrade.effects.Cursor = { type: 'fingersBoost', params: [value], priority: 1 };
      }
      if (upgrade.effects.mouse) {
        upgrade.effects.mouse = { type: 'fingersBoost', params: [value], priority: 1 };
      }
    }
  }
  
  // Fix grandmaBoost for grandma type upgrades
  const v2048GrandmaUpgrades = {
    'Farmer grandmas': { 'Farm': 1 },
    'Miner grandmas': { 'Mine': 2 },
    'Worker grandmas': { 'Factory': 3 },
    'Banker grandmas': { 'Bank': 4 },
    'Priestess grandmas': { 'Temple': 5 },
    'Witch grandmas': { 'Wizard tower': 6 },
    'Cosmic grandmas': { 'Shipment': 7 },
    'Transmuted grandmas': { 'Alchemy lab': 8 },
    'Altered grandmas': { 'Portal': 9 },
    'Grandmas\' grandmas': { 'Time machine': 10 },
    'Antigrandmas': { 'Antimatter condenser': 11 },
    'Rainbow grandmas': { 'Prism': 12 },
    'Lucky grandmas': { 'Chancemaker': 13 },
    'Metagrandmas': { 'Fractal engine': 14 },
    'Binary grandmas': { 'Javascript console': 15 },
    'Alternate grandmas': { 'Idleverse': 16 },
    'Brainy grandmas': { 'Cortex baker': 17 }
  };
  
  for (const upgrade of v2048Data.upgrades) {
    if (v2048GrandmaUpgrades[upgrade.name]) {
      for (const [target, n] of Object.entries(v2048GrandmaUpgrades[upgrade.name])) {
        if (upgrade.effects[target]) {
          upgrade.effects[target] = { type: 'grandmaBoost', params: [n], priority: 2 };
        }
      }
    }
  }
  
  writeFileSync(v2048Path, JSON.stringify(v2048Data, null, 2), 'utf-8');
  console.log('✅ Fixed v2048 effects');
}

console.log('✅ All effects fixed!');

