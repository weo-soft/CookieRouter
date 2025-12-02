/**
 * Script to fix building data in JSON by extracting from JS module
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

// Update building data from JS module
jsonData.buildings.names = v2052.buildingNames.filter(name => name && name.trim() !== '');
jsonData.buildings.basePrices = v2052.basePrices;
jsonData.buildings.baseRates = v2052.baseRates;

// Write back
writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

console.log('Fixed building data in JSON file');
console.log(`Buildings: ${jsonData.buildings.names.length}`);
console.log(`Upgrades: ${jsonData.upgrades.length}`);

