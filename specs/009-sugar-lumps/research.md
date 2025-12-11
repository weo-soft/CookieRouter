# Research: Sugar Lumps Building Upgrades

**Feature**: Sugar Lumps Building Upgrades  
**Date**: 2025-01-27  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. How to efficiently simulate Sugar Lump harvesting during route calculation?

**Decision**: Calculate Sugar Lump availability based on simulated time elapsed, checking harvest intervals (every 24 hours) when game state advances.

**Rationale**: 
- Route calculation already tracks `timeElapsed` in Game class
- Sugar Lump harvesting is deterministic based on time (every 24 hours after unlock)
- Can calculate available Sugar Lumps without iterating through each 24-hour period
- Formula: `availableSugarLumps = Math.floor((timeElapsed - unlockTime) / 86400)` where unlockTime is when 1B cookies reached
- Must track when Sugar Lumps unlock (time when totalCookies reaches 1B)

**Alternatives Considered**:
- Iterate through each 24-hour period: Rejected - inefficient, would slow route calculation
- Pre-calculate all harvest times: Considered but unnecessary complexity
- Event-based simulation: Rejected - adds complexity without benefit for deterministic system

**Implementation Approach**:
```javascript
// In Game class:
this.sugarLumpsUnlocked = false;
this.sugarLumpsUnlockTime = null; // Time when 1B cookies reached
this.availableSugarLumps = 0;
this.buildingLevels = {}; // { buildingName: level }

// Method to calculate available Sugar Lumps:
getAvailableSugarLumps() {
  if (!this.sugarLumpsUnlocked) return 0;
  const hoursSinceUnlock = (this.timeElapsed - this.sugarLumpsUnlockTime) / 3600;
  return Math.floor(hoursSinceUnlock / 24);
}

// Check unlock condition when totalCookies changes:
checkSugarLumpUnlock() {
  if (!this.sugarLumpsUnlocked && this.totalCookies >= 1000000000) {
    this.sugarLumpsUnlocked = true;
    this.sugarLumpsUnlockTime = this.timeElapsed;
  }
}
```

### 2. How to integrate Sugar Lump upgrades into router's child state generation?

**Decision**: Add Sugar Lump building upgrades as child states in Game.children() generator, similar to building purchases and upgrade purchases.

**Rationale**:
- Router.routeGPL() uses Game.children() to explore possible next moves
- Sugar Lump upgrades are valid moves that should be considered during optimization
- Must check Sugar Lump availability and upgrade costs before generating child states
- Only generate upgrade children for buildings that exist (numBuildings > 0)
- Must respect cumulative cost (Level N costs 1+2+...+N Sugar Lumps)

**Alternatives Considered**:
- Separate optimization pass: Rejected - would break router's unified optimization approach
- Pre-calculate all possible upgrades: Rejected - too many combinations, inefficient
- Only upgrade at specific checkpoints: Rejected - may miss optimal upgrade timing

**Implementation Approach**:
```javascript
// In Game.children() generator:
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
      if (this.numBuildings[buildingName] === 0) continue; // Must own building
      
      const currentLevel = this.buildingLevels[buildingName] || 0;
      const nextLevel = currentLevel + 1;
      const costForNextLevel = nextLevel; // Cost to upgrade TO next level
      
      if (availableSugarLumps >= costForNextLevel) {
        const child = new Game(null, this);
        if (child.upgradeBuildingWithSugarLump(buildingName)) {
          yield child;
        }
      }
    }
  }
}
```

### 3. How to optimize Sugar Lump spending decisions during route calculation?

**Decision**: Let router's GPL algorithm naturally optimize Sugar Lump spending by treating upgrades as child states with their own payoff calculations.

**Rationale**:
- Router.routeGPL() already optimizes building/upgrade purchases by evaluating payoff
- Sugar Lump upgrades improve CpS, which affects payoff calculations
- Router will naturally prefer upgrades that improve route efficiency
- No special optimization logic needed - router handles it automatically
- May need to adjust payoff calculation to account for Sugar Lump cost vs. CpS benefit

**Alternatives Considered**:
- Separate Sugar Lump optimization pass: Rejected - breaks unified optimization, may miss optimal timing
- Prefer upgrades for highest CpS buildings: Rejected - router should evaluate actual payoff
- Upgrade all buildings equally: Rejected - not optimal, wastes Sugar Lumps

**Implementation Approach**:
- Router's existing payoff calculation will evaluate Sugar Lump upgrades
- Upgrades that improve CpS significantly will be preferred
- Upgrades that don't improve route efficiency won't be selected
- May need to tune payoff calculation if upgrades are undervalued (but start with existing logic)

### 4. How to track building levels in Game state?

**Decision**: Add `buildingLevels` object to Game class, tracking Sugar Lump upgrade level per building, initialized to 0 (no upgrades).

**Rationale**:
- Building levels are independent of building count (can have 10 Cursors at Level 3)
- Must track per-building to support different upgrade levels
- Levels affect CpS calculation (1% per level)
- Must be copied when creating child Game states
- Default level is 0 (no Sugar Lump upgrades)

**Alternatives Considered**:
- Store levels in building count: Rejected - levels are separate from count
- Separate BuildingLevel class: Rejected - unnecessary complexity
- Track only upgraded buildings: Rejected - need to know all levels for CpS calculation

**Implementation Approach**:
```javascript
// In Game constructor:
this.buildingLevels = {};
for (const name of this.buildingNames) {
  this.buildingLevels[name] = 0; // Initialize all to 0
}

// In Game copy constructor (parent !== null):
this.buildingLevels = { ...parent.buildingLevels };

// Method to upgrade building:
upgradeBuildingWithSugarLump(buildingName) {
  const currentLevel = this.buildingLevels[buildingName] || 0;
  const nextLevel = currentLevel + 1;
  const cost = nextLevel; // Cost to upgrade TO next level
  
  if (this.getAvailableSugarLumps() >= cost) {
    this.buildingLevels[buildingName] = nextLevel;
    // Note: Sugar Lumps are "spent" but we track availability, not a spendable resource
    // Instead, we track total spent Sugar Lumps and subtract from available
    this.spentSugarLumps = (this.spentSugarLumps || 0) + cost;
    return true;
  }
  return false;
}
```

### 5. How to incorporate building level bonuses into CpS calculation?

**Decision**: Modify `buildingRate()` method to apply Sugar Lump level bonus as multiplicative multiplier after other effects.

**Rationale**:
- Building CpS calculation already applies effects in `buildingRate()`
- Sugar Lump bonus is +1% per level (multiplicative)
- Should apply after all other building-specific effects
- Formula: `finalRate = baseRate * (1 + level * 0.01)`
- Example: Level 3 = +3% = multiplier of 1.03

**Alternatives Considered**:
- Apply bonus before other effects: Rejected - bonus should apply to final building rate
- Additive bonus: Rejected - spec says multiplicative +1% per level
- Separate calculation method: Rejected - would duplicate logic

**Implementation Approach**:
```javascript
// In Game.buildingRate():
buildingRate(buildingName) {
  let r = this.baseRates[buildingName];
  
  // Apply building-specific effects (existing logic)
  const buildingEffects = [...this.effects[buildingName]].sort((a, b) => b.priority - a.priority);
  // ... existing effect application ...
  
  // NEW: Apply Sugar Lump level bonus
  const level = this.buildingLevels[buildingName] || 0;
  if (level > 0) {
    const levelMultiplier = 1 + (level * 0.01); // +1% per level
    r = r * levelMultiplier;
  }
  
  return r;
}
```

### 6. How to display Sugar Lump events in route display?

**Decision**: Add Sugar Lump harvest and upgrade events as route steps, similar to building purchases and upgrade purchases.

**Rationale**:
- Route display already shows building purchases and upgrades as steps
- Sugar Lump events are discrete actions that occur at specific points
- Users need to see when Sugar Lumps are available and when upgrades are applied
- Route step format already supports different step types
- Must show Sugar Lump count and upgrade costs clearly

**Alternatives Considered**:
- Separate Sugar Lump timeline: Rejected - breaks route step continuity
- Only show upgrades, not harvests: Rejected - users need to see availability
- Tooltip-only display: Rejected - not discoverable enough

**Implementation Approach**:
```javascript
// Route step types:
{
  type: 'sugarLumpHarvest',
  timeElapsed: number,
  availableSugarLumps: number,
  // ... other step properties
}

{
  type: 'buildingLevelUpgrade',
  building: string,
  level: number, // New level
  cost: number, // Sugar Lumps spent
  availableSugarLumps: number, // After spending
  // ... other step properties
}

// In route-display.js:
displayStep(step) {
  if (step.type === 'sugarLumpHarvest') {
    // Display harvest event with icon/badge
  } else if (step.type === 'buildingLevelUpgrade') {
    // Display upgrade event with building name, level, cost
  }
  // ... existing step display logic
}
```

### 7. How to handle Sugar Lump state in route conversion (simulation.js)?

**Decision**: Include Sugar Lump state (unlocked status, unlock time, available count, building levels, spent count) in route step snapshots.

**Rationale**:
- Route conversion already captures game state at each step
- Sugar Lump state affects CpS calculations and must be preserved
- Route display needs Sugar Lump state to show harvest/upgrade events
- Must track state changes (harvests, upgrades) as discrete steps

**Alternatives Considered**:
- Recalculate Sugar Lumps from time: Considered but loses upgrade history
- Only track final state: Rejected - need intermediate states for display
- Separate Sugar Lump timeline: Rejected - breaks route step model

**Implementation Approach**:
```javascript
// In simulation.js route conversion:
const step = {
  // ... existing step properties ...
  sugarLumps: {
    unlocked: stepGame.sugarLumpsUnlocked,
    unlockTime: stepGame.sugarLumpsUnlockTime,
    available: stepGame.getAvailableSugarLumps(),
    spent: stepGame.spentSugarLumps || 0,
    buildingLevels: { ...stepGame.buildingLevels }
  }
};

// Detect Sugar Lump harvest events:
// Compare available Sugar Lumps between steps
if (currentStep.sugarLumps.available > previousStep.sugarLumps.available) {
  // Sugar Lump was harvested - add harvest step
}

// Detect building level upgrades:
// Compare building levels between steps
if (currentStep.sugarLumps.buildingLevels[building] > previousStep.sugarLumps.buildingLevels[building]) {
  // Building was upgraded - add upgrade step
}
```

### 8. How to handle routes that never reach 1 billion cookies?

**Decision**: Sugar Lumps remain locked (unlocked = false, available = 0) throughout route calculation and display.

**Rationale**:
- Sugar Lumps unlock condition is explicit (1B cookies)
- Routes that don't reach 1B should not have Sugar Lump mechanics
- No harvest events or upgrades should appear in route
- Maintains backward compatibility with existing routes
- Clear user expectation: Sugar Lumps only appear when relevant

**Alternatives Considered**:
- Show locked Sugar Lumps: Rejected - adds noise, not useful
- Estimate Sugar Lumps: Rejected - not deterministic, breaks simulation accuracy
- Warn user: Considered but unnecessary - route display makes it clear

**Implementation Approach**:
- Sugar Lumps remain locked until `totalCookies >= 1000000000`
- No Sugar Lump child states generated if locked
- Route display shows no Sugar Lump events if never unlocked
- Game state tracks unlock status but remains false for short routes

