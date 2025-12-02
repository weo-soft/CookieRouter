/**
 * Script to convert version JS files to JSON format
 * Usage: node scripts/convert-version-to-json.js src/data/versions/v2052.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants for number calculations
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

// Evaluate expressions safely
function evaluateExpression(expr) {
  try {
    // Replace number constants with their values
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

// Parse upgrade line to extract upgrade data
function parseUpgradeLine(line) {
  // Match: menu.add(new Upgrade('Name', { req }, price, { effects }, id));
  const match = line.match(/menu\.add\(new Upgrade\(([^)]+)\)\)/);
  if (!match) return null;
  
  const args = match[1];
  // Parse arguments - this is complex, we'll need to handle nested structures
  // For now, return the raw match for manual processing
  return { raw: args, line };
}

// Main conversion function
function convertVersionFile(inputPath) {
  const content = readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n');
  
  // Extract version ID from filename
  const versionId = inputPath.match(/v(\d+(_\w+)?)/)?.[0] || 'unknown';
  
  // Find building names
  const buildingNamesMatch = content.match(/export const buildingNames = \[([^\]]+)\]/s);
  const buildingNames = buildingNamesMatch 
    ? buildingNamesMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''))
    : [];
  
  // Find basePrices
  const basePricesMatch = content.match(/export const basePrices = \{([^}]+)\}/s);
  const basePrices = {};
  if (basePricesMatch) {
    const pricesText = basePricesMatch[1];
    buildingNames.forEach(name => {
      const priceMatch = pricesText.match(new RegExp(`'${name}':\\s*([^,}]+)`, 's'));
      if (priceMatch) {
        const priceExpr = priceMatch[1].trim();
        basePrices[name] = evaluateExpression(priceExpr);
      }
    });
  }
  
  // Find baseRates
  const baseRatesMatch = content.match(/export const baseRates = \{([^}]+)\}/s);
  const baseRates = {};
  if (baseRatesMatch) {
    const ratesText = baseRatesMatch[1];
    buildingNames.forEach(name => {
      const rateMatch = ratesText.match(new RegExp(`'${name}':\\s*([^,}]+)`, 's'));
      if (rateMatch) {
        const rateExpr = rateMatch[1].trim();
        baseRates[name] = evaluateExpression(rateExpr);
      }
    });
  }
  
  // Extract upgrades - this is complex, we'll need manual parsing
  // For now, return what we can extract automatically
  const upgrades = [];
  const upgradeLines = lines.filter(line => line.includes('menu.add(new Upgrade'));
  
  console.log(`Found ${upgradeLines.length} upgrade lines`);
  console.log('Note: Upgrade parsing requires manual conversion due to complexity');
  console.log('Building data extracted:');
  console.log(JSON.stringify({ version: versionId, buildings: { names: buildingNames, basePrices, baseRates } }, null, 2));
  
  return {
    version: versionId,
    buildings: {
      names: buildingNames,
      basePrices,
      baseRates
    },
    upgrades: [] // Will be populated manually
  };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const inputFile = process.argv[2] || join(__dirname, '../src/data/versions/v2052.js');
  const result = convertVersionFile(inputFile);
  console.log('\nPartial conversion complete. Upgrades need manual conversion.');
}

export { convertVersionFile, evaluateExpression };

