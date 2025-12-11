/**
 * Debug script to investigate step 6 of longhaul route calculation
 * Checks what buildings are available and why Antimatter Condenser was chosen
 */

import { calculateRoute } from './src/js/simulation.js';
import { loadCategory } from './src/js/categories.js';
import { parseSaveGame } from './src/js/save-game-parser.js';
import fs from 'fs';

async function debugStep6() {
  console.log('Loading save game...');
  const saveString = fs.readFileSync('./test_data/save.txt', 'utf8');
  const saveData = await parseSaveGame(saveString);
  
  console.log('Save game loaded:', {
    version: saveData.version,
    buildings: saveData.buildings?.length || 0,
    totalCookies: saveData.miscGameData?.cookies || 0,
    timeElapsed: saveData.miscGameData?.timeElapsed || 0
  });
  
  console.log('\nLoading category...');
  const category = await loadCategory('longhaul');
  console.log('Category loaded:', category.name);
  
  console.log('\nCalculating route...');
  const route = await calculateRoute(
    category,
    {}, // startingBuildings - will use imported save
    {
      algorithm: 'GPL',
      lookahead: 1
    },
    saveData.version || 'v2052'
  );
  
  console.log(`\nRoute calculated: ${route.buildings.length} steps`);
  
  // Find step 6
  const step6 = route.buildings.find(s => s.order === 6);
  if (!step6) {
    console.log('\nStep 6 not found! Available steps:');
    route.buildings.forEach(s => {
      console.log(`  Step ${s.order}: ${s.buildingName} (time: ${(s.timeSinceLastStep || 0) / 3600}h)`);
    });
    return;
  }
  
  console.log('\n=== STEP 6 ANALYSIS ===');
  console.log(`Building: ${step6.buildingName}`);
  console.log(`Cookies Required: ${step6.cookiesRequired}`);
  console.log(`Time Since Last Step: ${(step6.timeSinceLastStep || 0) / 3600}h (${step6.timeSinceLastStep || 0}s)`);
  console.log(`CpS Increase: ${step6.cpsIncrease}`);
  
  // Show previous steps for context
  console.log('\n=== PREVIOUS STEPS ===');
  for (let i = 1; i <= 6; i++) {
    const step = route.buildings.find(s => s.order === i);
    if (step) {
      console.log(`Step ${step.order}: ${step.buildingName} - ${formatNumber(step.cookiesRequired)} cookies, ${(step.timeSinceLastStep || 0) / 3600}h wait`);
    }
  }
  
  // Show next few steps
  console.log('\n=== NEXT STEPS ===');
  for (let i = 7; i <= Math.min(10, route.buildings.length); i++) {
    const step = route.buildings.find(s => s.order === i);
    if (step) {
      console.log(`Step ${step.order}: ${step.buildingName} - ${formatNumber(step.cookiesRequired)} cookies, ${(step.timeSinceLastStep || 0) / 3600}h wait`);
    }
  }
}

function formatNumber(num) {
  if (num >= 1e24) return (num / 1e24).toFixed(2) + 'Sx';
  if (num >= 1e21) return (num / 1e21).toFixed(2) + 'S';
  if (num >= 1e18) return (num / 1e18).toFixed(2) + 'Qi';
  if (num >= 1e15) return (num / 1e15).toFixed(2) + 'Qa';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  return num.toFixed(2);
}

debugStep6().catch(console.error);
