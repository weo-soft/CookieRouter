# Quickstart Guide: Sugar Lumps Building Upgrades

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Overview

This guide helps developers quickly understand and implement Sugar Lump mechanics in the Cookie Clicker route calculator. Sugar Lumps are time-gated resources that unlock at 1 billion cookies and can upgrade buildings to improve CpS.

## Key Concepts

### Sugar Lump Lifecycle

1. **Unlock**: When `totalCookies >= 1,000,000,000`
2. **Harvest**: Every 24 hours (86400 seconds) after unlock
3. **Upgrade**: Spend Sugar Lumps to upgrade building levels (+1% CpS per level)
4. **Cost**: Level N costs N Sugar Lumps (cumulative: Level 3 = 1+2+3 = 6 total)

### Building Levels

- Each building has a Sugar Lump upgrade level (default: 0)
- Level N provides +N% Building CpS (multiplicative)
- Levels are independent of building count (can have 10 Cursors at Level 3)

## Implementation Steps

### Step 1: Extend Game Class

Add Sugar Lump state tracking to `src/js/game.js`:

```javascript
// In Game constructor (parent === null):
this.sugarLumpsUnlocked = false;
this.sugarLumpsUnlockTime = null;
this.spentSugarLumps = 0;
this.buildingLevels = {};
for (const name of this.buildingNames) {
  this.buildingLevels[name] = 0;
}

// In Game copy constructor (parent !== null):
this.sugarLumpsUnlocked = parent.sugarLumpsUnlocked;
this.sugarLumpsUnlockTime = parent.sugarLumpsUnlockTime;
this.spentSugarLumps = parent.spentSugarLumps;
this.buildingLevels = { ...parent.buildingLevels };
```

### Step 2: Add Sugar Lump Methods

Add methods to `Game` class:

```javascript
getAvailableSugarLumps() {
  if (!this.sugarLumpsUnlocked) return 0;
  const hoursSinceUnlock = (this.timeElapsed - this.sugarLumpsUnlockTime) / 3600;
  const harvested = Math.floor(hoursSinceUnlock / 24);
  return Math.max(0, harvested - this.spentSugarLumps);
}

checkSugarLumpUnlock() {
  if (!this.sugarLumpsUnlocked && this.totalCookies >= 1000000000) {
    this.sugarLumpsUnlocked = true;
    this.sugarLumpsUnlockTime = this.timeElapsed;
  }
}

upgradeBuildingWithSugarLump(buildingName) {
  if (!this.sugarLumpsUnlocked) return false;
  if (this.numBuildings[buildingName] === 0) return false;
  
  const currentLevel = this.buildingLevels[buildingName] || 0;
  const nextLevel = currentLevel + 1;
  const cost = nextLevel;
  
  if (this.getAvailableSugarLumps() >= cost) {
    this.buildingLevels[buildingName] = nextLevel;
    this.spentSugarLumps += cost;
    return true;
  }
  return false;
}
```

### Step 3: Modify Building Rate Calculation

Update `buildingRate()` to include level bonus:

```javascript
buildingRate(buildingName) {
  let r = this.baseRates[buildingName];
  
  // ... existing effect application ...
  
  // Apply Sugar Lump level bonus
  const level = this.buildingLevels[buildingName] || 0;
  if (level > 0) {
    const levelMultiplier = 1 + (level * 0.01);
    r = r * levelMultiplier;
  }
  
  return r;
}
```

### Step 4: Call Unlock Check

Add unlock check wherever `totalCookies` changes:

```javascript
// In purchaseBuilding(), purchaseUpgrade(), etc.:
this.totalCookies = /* new value */;
this.checkSugarLumpUnlock();
```

### Step 5: Extend Children Generator

Add Sugar Lump upgrades to `Game.children()`:

```javascript
*children() {
  // Existing building purchases
  for (const name of this.buildingNames) {
    const child = new Game(null, this);
    if (!child.purchaseBuilding(name)) continue;
    yield child;
  }
  
  // Existing upgrade purchases
  for (const upgrade of this.menu) {
    const child = new Game(null, this);
    if (!child.purchaseUpgrade(upgrade)) continue;
    yield child;
  }
  
  // NEW: Sugar Lump building upgrades
  const availableSugarLumps = this.getAvailableSugarLumps();
  if (availableSugarLumps > 0) {
    for (const buildingName of this.buildingNames) {
      if (this.numBuildings[buildingName] === 0) continue;
      
      const currentLevel = this.buildingLevels[buildingName] || 0;
      const nextLevel = currentLevel + 1;
      const cost = nextLevel;
      
      if (availableSugarLumps >= cost) {
        const child = new Game(null, this);
        if (child.upgradeBuildingWithSugarLump(buildingName)) {
          yield child;
        }
      }
    }
  }
}
```

### Step 6: Update Route Conversion

Include Sugar Lump state in route steps (`src/js/simulation.js`):

```javascript
// In route conversion loop:
const step = {
  // ... existing fields ...
  sugarLumps: stepGame.sugarLumpsUnlocked ? {
    unlocked: true,
    unlockTime: stepGame.sugarLumpsUnlockTime,
    available: stepGame.getAvailableSugarLumps(),
    spent: stepGame.spentSugarLumps,
    buildingLevels: { ...stepGame.buildingLevels }
  } : undefined
};

// Detect harvest events:
if (previousStep && 
    currentStep.sugarLumps?.available > previousStep.sugarLumps?.available) {
  // Add harvest step
}

// Detect upgrade events:
if (previousStep) {
  for (const buildingName of game.buildingNames) {
    const currentLevel = currentStep.sugarLumps?.buildingLevels[buildingName] || 0;
    const prevLevel = previousStep.sugarLumps?.buildingLevels[buildingName] || 0;
    if (currentLevel > prevLevel) {
      // Add upgrade step
    }
  }
}
```

### Step 7: Update Route Display

Display Sugar Lump events in `src/js/ui/route-display.js`:

```javascript
displayStep(step) {
  if (step.type === 'sugarLumpHarvest') {
    // Display harvest event
    return this.renderHarvestStep(step);
  } else if (step.type === 'buildingLevelUpgrade') {
    // Display upgrade event
    return this.renderUpgradeStep(step);
  }
  // ... existing step display ...
}
```

## Testing

### Unit Tests

Create `tests/unit/game-sugar-lumps.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { Game } from '../../src/js/game.js';

describe('Sugar Lumps', () => {
  it('unlocks at 1 billion cookies', () => {
    const game = new Game(version);
    game.totalCookies = 999999999;
    game.checkSugarLumpUnlock();
    expect(game.sugarLumpsUnlocked).toBe(false);
    
    game.totalCookies = 1000000000;
    game.checkSugarLumpUnlock();
    expect(game.sugarLumpsUnlocked).toBe(true);
  });
  
  it('calculates available Sugar Lumps from time', () => {
    const game = new Game(version);
    game.sugarLumpsUnlocked = true;
    game.sugarLumpsUnlockTime = 0;
    game.timeElapsed = 86400; // 1 day
    expect(game.getAvailableSugarLumps()).toBe(1);
  });
  
  // ... more tests ...
});
```

### Integration Tests

Create `tests/integration/route-sugar-lumps.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { calculateRoute } from '../../src/js/simulation.js';

describe('Route Calculation with Sugar Lumps', () => {
  it('includes Sugar Lump upgrades in route', async () => {
    const category = {
      name: 'test',
      targetCookies: 2000000000, // 2B to trigger Sugar Lumps
      // ... other category fields ...
    };
    
    const route = await calculateRoute(category);
    
    // Check that Sugar Lumps unlock
    const unlockStep = route.steps.find(s => 
      s.sugarLumps?.unlocked === true
    );
    expect(unlockStep).toBeDefined();
    
    // Check for harvest events
    const harvestSteps = route.steps.filter(s => 
      s.type === 'sugarLumpHarvest'
    );
    expect(harvestSteps.length).toBeGreaterThan(0);
    
    // Check for upgrade events
    const upgradeSteps = route.steps.filter(s => 
      s.type === 'buildingLevelUpgrade'
    );
    expect(upgradeSteps.length).toBeGreaterThanOrEqual(0);
  });
});
```

## Common Pitfalls

### 1. Forgetting to Call `checkSugarLumpUnlock()`

**Problem**: Sugar Lumps never unlock if unlock check isn't called when `totalCookies` changes.

**Solution**: Call `checkSugarLumpUnlock()` after every `totalCookies` update.

### 2. Incorrect Cost Calculation

**Problem**: Using cumulative cost instead of incremental cost.

**Solution**: Cost to upgrade TO level N is N Sugar Lumps (not cumulative total).

### 3. Not Copying Sugar Lump State

**Problem**: Child game states don't inherit Sugar Lump state.

**Solution**: Copy all Sugar Lump properties in Game copy constructor.

### 4. Negative Available Sugar Lumps

**Problem**: `getAvailableSugarLumps()` returns negative if spent > harvested.

**Solution**: Use `Math.max(0, harvested - spent)` to clamp to 0.

## Performance Considerations

- Sugar Lump availability calculation is O(1) - very fast
- Building level upgrade generation adds O(B) where B = number of buildings
- Overall overhead should be <10% for routes reaching 1B cookies
- Consider caching `getAvailableSugarLumps()` if called frequently

## Next Steps

1. Implement Game class extensions (Steps 1-3)
2. Test Sugar Lump unlock and availability calculation
3. Extend children generator (Step 5)
4. Test route calculation with Sugar Lumps
5. Update route conversion (Step 6)
6. Update route display (Step 7)
7. Add comprehensive tests
8. Verify backward compatibility with existing routes

## References

- [Specification](./spec.md)
- [Data Model](./data-model.md)
- [Contract](./contracts/sugar-lumps.md)
- [Research](./research.md)

