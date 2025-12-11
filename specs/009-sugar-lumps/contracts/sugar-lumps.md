# Sugar Lumps Contract: Building Upgrades

**Date**: 2025-01-27  
**Feature**: [spec.md](../spec.md)

## Overview

This contract defines the interface for Sugar Lump mechanics in the Cookie Clicker route calculator. Sugar Lumps are time-gated resources that unlock at 1 billion cookies and can be used to upgrade buildings, improving their CpS.

## Game Class Extensions

### New Properties

#### `sugarLumpsUnlocked: boolean`

Whether Sugar Lumps have been unlocked (1 billion cookies reached).

**Type**: boolean  
**Default**: false  
**Immutable**: Set once when unlock condition is met

#### `sugarLumpsUnlockTime: number | null`

Time elapsed (seconds) when Sugar Lumps were unlocked, or null if not unlocked.

**Type**: number | null  
**Default**: null  
**Immutable**: Set once when unlock condition is met

#### `spentSugarLumps: number`

Total Sugar Lumps spent on building upgrades.

**Type**: number  
**Default**: 0  
**Mutable**: Incremented when upgrades are applied

#### `buildingLevels: object`

Map of building names to Sugar Lump upgrade levels.

**Type**: `{ [buildingName: string]: number }`  
**Default**: All buildings initialized to level 0  
**Mutable**: Updated when buildings are upgraded

**Example**:
```javascript
{
  "Cursor": 3,
  "Grandma": 1,
  "Farm": 0
}
```

### New Methods

#### `getAvailableSugarLumps(): number`

Calculates and returns the number of available Sugar Lumps based on time elapsed.

**Returns**: number (non-negative integer)

**Calculation**:
- If `sugarLumpsUnlocked === false`: returns 0
- Otherwise: `Math.floor((timeElapsed - sugarLumpsUnlockTime) / 86400) - spentSugarLumps`
- Formula: 24 hours = 86400 seconds

**Side Effects**: None (pure calculation)

**Example**:
```javascript
// Sugar Lumps unlocked 2.5 days ago
game.sugarLumpsUnlocked = true;
game.sugarLumpsUnlockTime = 0;
game.timeElapsed = 216000; // 2.5 days = 216000 seconds
game.spentSugarLumps = 3;
game.getAvailableSugarLumps(); // Returns: Math.floor(216000 / 86400) - 3 = 2 - 3 = -1, clamped to 0
```

#### `checkSugarLumpUnlock(): void`

Checks if Sugar Lumps should be unlocked based on total cookies produced.

**Side Effects**: 
- Sets `sugarLumpsUnlocked = true` if `totalCookies >= 1000000000` and not already unlocked
- Sets `sugarLumpsUnlockTime = timeElapsed` when unlocking

**Call Frequency**: Should be called whenever `totalCookies` changes

**Example**:
```javascript
game.totalCookies = 999999999;
game.checkSugarLumpUnlock(); // No change
game.totalCookies = 1000000000;
game.checkSugarLumpUnlock(); // Unlocks Sugar Lumps
```

#### `upgradeBuildingWithSugarLump(buildingName: string): boolean`

Upgrades a building's Sugar Lump level by 1, spending the required Sugar Lumps.

**Parameters**:
- `buildingName` (string, required): Name of building to upgrade

**Returns**: boolean (true if upgrade successful, false if not affordable or building doesn't exist)

**Preconditions**:
- `sugarLumpsUnlocked === true`
- `numBuildings[buildingName] > 0` (building must exist)
- `getAvailableSugarLumps() >= cost` (must have enough Sugar Lumps)

**Side Effects**:
- Increments `buildingLevels[buildingName]` by 1
- Increments `spentSugarLumps` by cost
- Cost = `buildingLevels[buildingName] + 1` (cost to upgrade TO next level)

**Example**:
```javascript
game.buildingLevels["Cursor"] = 2;
game.numBuildings["Cursor"] = 10;
game.getAvailableSugarLumps(); // Returns 5
game.upgradeBuildingWithSugarLump("Cursor"); // Returns true, cost = 3
game.buildingLevels["Cursor"]; // Returns 3
game.spentSugarLumps; // Returns 3
```

#### `buildingRate(buildingName: string): number` (Modified)

Returns the cookies per second of a single building, including Sugar Lump level bonus.

**Parameters**:
- `buildingName` (string, required): Name of building

**Returns**: number (non-negative)

**Calculation**:
1. Start with `baseRates[buildingName]`
2. Apply building-specific effects (existing logic)
3. Apply Sugar Lump level bonus: `rate *= (1 + level * 0.01)`
   - Level 0: no bonus (multiplier = 1.0)
   - Level 1: +1% (multiplier = 1.01)
   - Level 2: +2% (multiplier = 1.02)
   - Level N: +N% (multiplier = 1 + N * 0.01)

**Example**:
```javascript
game.baseRates["Cursor"] = 0.1;
game.buildingLevels["Cursor"] = 3;
game.buildingRate("Cursor"); // Returns: 0.1 * 1.03 = 0.103
```

### Modified Methods

#### `children(): Generator<Game>`

Generates all possible next game states, including Sugar Lump building upgrades.

**Returns**: Generator that yields Game instances

**Generated States**:
1. Building purchases (existing)
2. Upgrade purchases (existing)
3. **NEW**: Sugar Lump building upgrades (for each building that exists and can be upgraded)

**Sugar Lump Upgrade Generation**:
- Only generates if `sugarLumpsUnlocked === true`
- Only generates for buildings where `numBuildings[buildingName] > 0`
- Only generates if `getAvailableSugarLumps() >= cost`
- Cost = `(buildingLevels[buildingName] || 0) + 1`

**Example**:
```javascript
// Game state: 1 Cursor, Sugar Lumps unlocked, 5 available
game.numBuildings["Cursor"] = 1;
game.buildingLevels["Cursor"] = 0;
game.sugarLumpsUnlocked = true;
game.getAvailableSugarLumps(); // Returns 5

for (const child of game.children()) {
  // Yields: building purchases, upgrade purchases, AND
  // Sugar Lump upgrade for Cursor (cost = 1, affordable)
}
```

## Router Class Extensions

### Modified Methods

#### `routeGPL(game: Game, lookahead: number, onProgress?: function): Promise<Game>`

Routes a game using GPL algorithm, now considering Sugar Lump upgrades as valid moves.

**Parameters**: (unchanged)

**Returns**: Promise<Game> (unchanged)

**Behavior Changes**:
- `Game.children()` now includes Sugar Lump upgrade states
- Router evaluates Sugar Lump upgrades alongside building/upgrade purchases
- Sugar Lump upgrades that improve CpS will be selected when optimal
- No special handling needed - router treats upgrades as regular moves

**Performance**: Sugar Lump upgrade generation adds minimal overhead (<10% to route calculation time)

## Route Step Extensions

### Sugar Lump State in Steps

Route steps include optional Sugar Lump state:

```javascript
{
  // ... existing step fields ...
  sugarLumps: {
    unlocked: boolean,
    unlockTime: number | null,
    available: number,
    spent: number,
    buildingLevels: { [buildingName: string]: number }
  }
}
```

**Presence**: `sugarLumps` object only present if `sugarLumps.unlocked === true`

### New Step Types

#### Sugar Lump Harvest Step

```javascript
{
  type: "sugarLumpHarvest",
  order: number,
  timeElapsed: number,
  availableSugarLumps: number,
  harvestNumber: number,
  sugarLumps: {
    unlocked: true,
    unlockTime: number,
    available: number,
    spent: number,
    buildingLevels: object
  }
}
```

**Generation**: Created when `availableSugarLumps` increases between steps

#### Building Level Upgrade Step

```javascript
{
  type: "buildingLevelUpgrade",
  order: number,
  buildingName: string,
  level: number,
  previousLevel: number,
  cost: number,
  timeElapsed: number,
  availableSugarLumps: number,
  sugarLumps: {
    unlocked: true,
    unlockTime: number,
    available: number,
    spent: number,
    buildingLevels: object
  }
}
```

**Generation**: Created when `buildingLevels[buildingName]` increases between steps

## Data Flow

1. **Route Calculation**:
   - Game tracks Sugar Lump state during calculation
   - `checkSugarLumpUnlock()` called when `totalCookies` changes
   - `getAvailableSugarLumps()` calculated from time elapsed
   - Router generates Sugar Lump upgrade child states via `children()`
   - Router selects optimal moves including Sugar Lump upgrades

2. **Route Conversion**:
   - Sugar Lump state extracted from game state at each step
   - Harvest events detected by comparing `availableSugarLumps` between steps
   - Upgrade events detected by comparing `buildingLevels` between steps
   - Events added as discrete route steps

3. **Route Display**:
   - Sugar Lump state displayed in step details
   - Harvest events shown with timing and count
   - Upgrade events shown with building, level, and cost

## Error Handling

### Invalid Building Name

**Error**: `buildingName` not in `buildingNames` array

**Handling**: Return false from `upgradeBuildingWithSugarLump()`, log warning

### Insufficient Sugar Lumps

**Error**: `getAvailableSugarLumps() < cost`

**Handling**: Return false from `upgradeBuildingWithSugarLump()`, don't generate child state

### Building Doesn't Exist

**Error**: `numBuildings[buildingName] === 0`

**Handling**: Return false from `upgradeBuildingWithSugarLump()`, don't generate child state

### Negative Time Calculation

**Error**: `timeElapsed < sugarLumpsUnlockTime` (shouldn't happen, but defensive)

**Handling**: Return 0 from `getAvailableSugarLumps()`

## Performance Requirements

- Sugar Lump availability calculation: O(1) - simple arithmetic
- Building level upgrade generation: O(B) where B = number of buildings
- Sugar Lump upgrade evaluation: Same as building purchase evaluation
- Overall route calculation overhead: <10% for routes reaching 1B cookies

## Backward Compatibility

- Routes without Sugar Lumps: No `sugarLumps` field in steps (optional)
- Existing route calculation: Works unchanged if Sugar Lumps never unlock
- Route display: Handles missing Sugar Lump fields gracefully
- Saved routes: Backward compatible (Sugar Lump fields optional)

## Testing Requirements

### Unit Tests

- `getAvailableSugarLumps()`: Various time scenarios
- `checkSugarLumpUnlock()`: Unlock condition, timing
- `upgradeBuildingWithSugarLump()`: Cost calculation, affordability checks
- `buildingRate()`: Level bonus calculation
- `children()`: Sugar Lump upgrade generation

### Integration Tests

- Route calculation with Sugar Lumps unlocking mid-route
- Route calculation with Sugar Lump upgrades applied
- Route display showing Sugar Lump events
- Backward compatibility with routes that don't reach 1B cookies

