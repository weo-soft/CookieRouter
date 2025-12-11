/**
 * Script to analyze step 6 of a calculated route
 * Run this in the browser console after calculating a route
 * 
 * Usage:
 * 1. Calculate a route in the UI
 * 2. Open browser console
 * 3. Find the route object (check routeDisplay.currentRoute or look for route in main.js)
 * 4. Run: analyzeStep6(route)
 */

window.analyzeStep6 = function(route) {
  if (!route || !route.buildings) {
    console.error('No route data provided. Route should have a buildings array.');
    console.log('Try: analyzeStep6(routeDisplay.currentRoute) or find the route object from the UI');
    return;
  }
  
  console.log('=== STEP 6 ANALYSIS ===');
  
  // Find step 6
  const step6 = route.buildings.find(s => s.order === 6);
  if (!step6) {
    console.log('Step 6 not found. Available steps:');
    route.buildings.slice(0, 20).forEach(s => {
      console.log(`  Step ${s.order}: ${s.buildingName} - ${((s.timeSinceLastStep || 0) / 3600).toFixed(2)}h wait`);
    });
    return;
  }
  
  console.log('Step 6 Details:');
  console.log('  Building:', step6.buildingName);
  console.log('  Cookies Required:', step6.cookiesRequired);
  console.log('  Time Since Last Step:', (step6.timeSinceLastStep || 0) / 3600, 'hours');
  console.log('  CpS Increase:', step6.cpsIncrease);
  
  // Show context: previous steps
  console.log('\n=== PREVIOUS STEPS (for context) ===');
  for (let i = Math.max(1, step6.order - 5); i < step6.order; i++) {
    const step = route.buildings.find(s => s.order === i);
    if (step) {
      const timeHours = (step.timeSinceLastStep || 0) / 3600;
      console.log(`Step ${step.order}: ${step.buildingName} - ${timeHours.toFixed(2)}h wait, ${step.cpsIncrease} CpS increase`);
    }
  }
  
  // Show next steps
  console.log('\n=== NEXT STEPS (for context) ===');
  for (let i = step6.order + 1; i <= Math.min(step6.order + 5, route.buildings.length); i++) {
    const step = route.buildings.find(s => s.order === i);
    if (step) {
      const timeHours = (step.timeSinceLastStep || 0) / 3600;
      console.log(`Step ${step.order}: ${step.buildingName} - ${timeHours.toFixed(2)}h wait, ${step.cpsIncrease} CpS increase`);
    }
  }
  
  // Analyze: Find all steps with similar or shorter wait times
  console.log('\n=== ANALYSIS: Steps with shorter wait times ===');
  const stepsWithShorterWait = route.buildings
    .filter(s => s.order > step6.order && (s.timeSinceLastStep || 0) < (step6.timeSinceLastStep || 0))
    .slice(0, 10);
  
  if (stepsWithShorterWait.length > 0) {
    console.log('Found steps AFTER step 6 with shorter wait times:');
    stepsWithShorterWait.forEach(s => {
      const timeHours = (s.timeSinceLastStep || 0) / 3600;
      console.log(`  Step ${s.order}: ${s.buildingName} - ${timeHours.toFixed(2)}h wait (${step6.timeSinceLastStep / 3600 - timeHours} hours shorter)`);
    });
    console.log('\n⚠️ This suggests step 6 might not be optimal - cheaper buildings were available later.');
  } else {
    console.log('No steps found with shorter wait times after step 6.');
  }
  
  // Check if there are steps before step 6 with longer waits
  console.log('\n=== Steps BEFORE step 6 with longer wait times ===');
  const stepsBeforeWithLongerWait = route.buildings
    .filter(s => s.order < step6.order && (s.timeSinceLastStep || 0) > (step6.timeSinceLastStep || 0))
    .slice(0, 10);
  
  if (stepsBeforeWithLongerWait.length > 0) {
    console.log('Found steps BEFORE step 6 with longer wait times:');
    stepsBeforeWithLongerWait.forEach(s => {
      const timeHours = (s.timeSinceLastStep || 0) / 3600;
      console.log(`  Step ${s.order}: ${s.buildingName} - ${timeHours.toFixed(2)}h wait`);
    });
  } else {
    console.log('No steps found with longer wait times before step 6.');
  }
  
  console.log('\n=== CONCLUSION ===');
  if (step6.timeSinceLastStep / 3600 > 6) {
    console.log('⚠️ Step 6 has a very long wait time (>6 hours).');
    console.log('This could indicate:');
    console.log('1. All other buildings at that point had even worse payoff loads');
    console.log('2. The algorithm (lookahead=1) is making locally optimal but not globally optimal choices');
    console.log('3. There may be a bug in the evaluation logic');
    console.log('\nRecommendation: Try increasing lookahead to 2 or 3 to see if it improves the route.');
  }
};

console.log('Step 6 analyzer loaded. Use: analyzeStep6(route)');
console.log('To find the route object, check: routeDisplay.currentRoute or look in the main.js logs');
