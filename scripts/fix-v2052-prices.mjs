import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Read the backup file
const backupPath = join(projectRoot, 'src/data/versions/v2052.js.backup');
const backupContent = readFileSync(backupPath, 'utf-8');

// Read the JSON file
const jsonPath = join(projectRoot, 'src/data/versions/v2052.json');
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

// Define constants that might be used in the backup file
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

// Function to evaluate price expressions
function evaluatePrice(priceExpr) {
  try {
    // Use Function constructor to safely evaluate the expression
    return new Function('million', 'billion', 'trillion', 'quadrillion', 'quintillion', 
                       'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion',
                       'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion',
                       'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion',
                       'novemdecillion', 'vigintillion', 'unvigintillion',
                       `return ${priceExpr}`)(
      million, billion, trillion, quadrillion, quintillion,
      sextillion, septillion, octillion, nonillion, decillion,
      undecillion, duodecillion, tredecillion, quattuordecillion,
      quindecillion, sexdecillion, septendecillion, octodecillion,
      novemdecillion, vigintillion, unvigintillion
    );
  } catch (error) {
    console.error(`Error evaluating price: ${priceExpr}`, error);
    return null;
  }
}

// Extract upgrade prices from backup file
// Pattern: new Upgrade('Name', {...}, PRICE, {...}, ID)
// Handle both single and double quotes, and escaped quotes
const upgradePattern = /new Upgrade\s*\(\s*['"]([^'"]*(?:\\.[^'"]*)*)['"]\s*,\s*\{[^}]*\}\s*,\s*([^,]+)\s*,\s*\{[^}]*\}\s*,\s*(\d+)\s*\)/g;

const upgradePrices = new Map();
let match;

while ((match = upgradePattern.exec(backupContent)) !== null) {
  const name = match[1];
  const priceExpr = match[2].trim();
  const id = parseInt(match[3]);
  
  // Evaluate the price expression
  const price = evaluatePrice(priceExpr);
  
  if (price !== null && price > 0) {
    upgradePrices.set(name, { price, id });
  } else {
    console.warn(`Could not evaluate price for "${name}": ${priceExpr}`);
  }
}

console.log(`Found ${upgradePrices.size} upgrades with prices in backup file`);

// Update JSON file with correct prices
let fixedCount = 0;
let notFoundCount = 0;

for (const upgrade of jsonData.upgrades) {
  if (upgrade.price === 0) {
    const backupData = upgradePrices.get(upgrade.name);
    
    if (backupData) {
      upgrade.price = backupData.price;
      fixedCount++;
    } else {
      console.warn(`Could not find price for upgrade: "${upgrade.name}" (id: ${upgrade.id})`);
      notFoundCount++;
    }
  }
}

console.log(`Fixed ${fixedCount} upgrades with price 0`);
if (notFoundCount > 0) {
  console.warn(`Could not fix ${notFoundCount} upgrades`);
}

// Write updated JSON
writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
console.log(`Updated ${jsonPath}`);

