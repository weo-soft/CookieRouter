# Data Model: Sugar Lumps Building Upgrades

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Entities

### Sugar Lump State

Represents Sugar Lump availability and spending state in the game simulation.

**Fields**:
- `sugarLumpsUnlocked` (boolean, required): Whether Sugar Lumps have been unlocked (1B cookies reached)
- `sugarLumpsUnlockTime` (number, nullable): Time elapsed (seconds) when Sugar Lumps were unlocked, null if not unlocked
- `availableSugarLumps` (number, required): Current count of available Sugar Lumps (calculated from time)
- `spentSugarLumps` (number, required): Total Sugar Lumps spent on building upgrades
- `buildingLevels` (object, required): Map of building names to Sugar Lump upgrade levels

**Validation Rules**:
- `sugarLumpsUnlocked` must be boolean
- `sugarLumpsUnlockTime` must be null if `sugarLumpsUnlocked` is false, non-negative number if true
- `availableSugarLumps` must be non-negative integer
- `spentSugarLumps` must be non-negative integer
- `availableSugarLumps` must be >= `spentSugarLumps` (cannot spend more than available)
- `buildingLevels` must be object with building names as keys and non-negative integers as values

**Calculation**:
- `availableSugarLumps = Math.floor((timeElapsed - sugarLumpsUnlockTime) / 86400)` if unlocked, else 0
- Formula: 24 hours = 86400 seconds

**Storage**: Stored in Game class instance during route calculation, included in route step snapshots

**Relationships**:
- Sugar Lump State belongs to one Game instance (one-to-one)
- Sugar Lump State tracks many Building Levels (one-to-many)

### Building Level

Represents the Sugar Lump upgrade level of a specific building type.

**Fields**:
- `buildingName` (string, required): Name of the building (e.g., "Cursor", "Grandma")
- `level` (number, required): Current Sugar Lump upgrade level (0 = no upgrades)

**Validation Rules**:
- `buildingName` must be a valid building name from the game version
- `level` must be non-negative integer
- Level 0 means no Sugar Lump upgrades applied
- Level N means N levels of Sugar Lump upgrades applied

**Upgrade Cost**:
- Cost to upgrade FROM level N TO level N+1 = (N+1) Sugar Lumps
- Cumulative cost to reach level N = 1 + 2 + ... + N = N * (N + 1) / 2 Sugar Lumps

**CpS Bonus**:
- Each level provides +1% Building CpS (multiplicative)
- Level N provides: `finalRate = baseRate * (1 + N * 0.01)`
- Example: Level 3 = +3% = multiplier of 1.03

**Storage**: Stored in Game.buildingLevels object, included in route step snapshots

**Relationships**:
- Building Level belongs to one Building (many-to-one)
- Building Level affects Building CpS calculation

### Sugar Lump Harvest Event

Represents a discrete event when a Sugar Lump becomes available.

**Fields**:
- `type` (string, required): Event type, always "sugarLumpHarvest"
- `timeElapsed` (number, required): Time elapsed (seconds) when harvest occurred
- `availableSugarLumps` (number, required): Total available Sugar Lumps after harvest
- `harvestNumber` (number, required): Sequential harvest number (1st, 2nd, 3rd, etc.)

**Validation Rules**:
- `type` must be exactly "sugarLumpHarvest"
- `timeElapsed` must be non-negative number
- `availableSugarLumps` must be positive integer (harvest only occurs when Sugar Lumps are unlocked)
- `harvestNumber` must be positive integer
- Harvest events occur exactly every 24 hours (86400 seconds) after unlock

**Storage**: Included in route steps array as discrete step objects

**Relationships**:
- Sugar Lump Harvest Event belongs to one Route (many-to-one)
- Sugar Lump Harvest Event occurs at specific time in route progression

### Building Level Upgrade Event

Represents a discrete event when a building is upgraded using Sugar Lumps.

**Fields**:
- `type` (string, required): Event type, always "buildingLevelUpgrade"
- `buildingName` (string, required): Name of the building being upgraded
- `level` (number, required): New upgrade level after upgrade
- `previousLevel` (number, required): Previous upgrade level before upgrade
- `cost` (number, required): Sugar Lumps spent for this upgrade
- `availableSugarLumps` (number, required): Available Sugar Lumps after spending
- `timeElapsed` (number, required): Time elapsed (seconds) when upgrade occurred

**Validation Rules**:
- `type` must be exactly "buildingLevelUpgrade"
- `buildingName` must be a valid building name
- `level` must be `previousLevel + 1` (one level at a time)
- `level` must be positive integer (cannot upgrade to level 0)
- `cost` must equal `level` (cost to upgrade TO level N is N Sugar Lumps)
- `availableSugarLumps` must be non-negative integer
- Upgrade can only occur if building exists (`numBuildings[buildingName] > 0`)

**Storage**: Included in route steps array as discrete step objects

**Relationships**:
- Building Level Upgrade Event belongs to one Route (many-to-one)
- Building Level Upgrade Event upgrades one Building Level (many-to-one)
- Building Level Upgrade Event occurs at specific time in route progression

## Route Step Extensions

Route steps are extended to include Sugar Lump state and events.

### Extended Route Step

Existing route step structure is extended with optional Sugar Lump fields:

**Additional Fields** (optional, only present when Sugar Lumps are unlocked):
- `sugarLumps` (object, optional): Sugar Lump state at this step
  - `unlocked` (boolean): Whether Sugar Lumps are unlocked
  - `unlockTime` (number, nullable): Time when unlocked
  - `available` (number): Available Sugar Lumps
  - `spent` (number): Spent Sugar Lumps
  - `buildingLevels` (object): Map of building names to levels

**Step Types**:
- `buildingPurchase`: Existing step type (no change)
- `upgradePurchase`: Existing step type (no change)
- `sugarLumpHarvest`: New step type for harvest events
- `buildingLevelUpgrade`: New step type for level upgrade events

**Validation Rules**:
- `sugarLumps` object only present if `sugarLumps.unlocked === true`
- Sugar Lump events (`sugarLumpHarvest`, `buildingLevelUpgrade`) only appear if Sugar Lumps are unlocked
- Building level upgrade steps must have corresponding building purchase step (building must exist)

## State Transitions

### Sugar Lump Unlock

**Trigger**: `totalCookies >= 1000000000`

**State Changes**:
- `sugarLumpsUnlocked`: false → true
- `sugarLumpsUnlockTime`: null → `timeElapsed`
- `availableSugarLumps`: 0 → 0 (first harvest occurs 24 hours later)

**Side Effects**:
- Sugar Lump harvest events become possible
- Building level upgrades become possible
- Route calculation can generate Sugar Lump upgrade child states

### Sugar Lump Harvest

**Trigger**: `timeElapsed >= sugarLumpsUnlockTime + (harvestNumber * 86400)`

**State Changes**:
- `availableSugarLumps`: N → N + 1
- Harvest event added to route steps

**Constraints**:
- Only occurs if `sugarLumpsUnlocked === true`
- Occurs exactly every 24 hours (86400 seconds) after unlock
- Harvest number increments sequentially (1, 2, 3, ...)

### Building Level Upgrade

**Trigger**: Router selects Sugar Lump upgrade as optimal move

**State Changes**:
- `buildingLevels[buildingName]`: N → N + 1
- `spentSugarLumps`: M → M + (N + 1)
- `availableSugarLumps`: A → A - (N + 1)
- Upgrade event added to route steps

**Constraints**:
- `availableSugarLumps >= cost` (cannot spend more than available)
- `numBuildings[buildingName] > 0` (building must exist)
- `cost === level` (cost to upgrade TO level N is N Sugar Lumps)

## Data Flow

1. **Route Calculation**:
   - Game instance tracks Sugar Lump state during calculation
   - Router generates Sugar Lump upgrade child states when available
   - Sugar Lump state included in each route step snapshot

2. **Route Conversion**:
   - Sugar Lump state extracted from game state at each step
   - Harvest events detected by comparing available Sugar Lumps between steps
   - Upgrade events detected by comparing building levels between steps

3. **Route Display**:
   - Sugar Lump state displayed in route step details
   - Harvest events shown as discrete steps with timing
   - Upgrade events shown as discrete steps with building, level, and cost

4. **Route Storage**:
   - Sugar Lump state included in saved route data
   - Harvest and upgrade events preserved in route steps
   - Backward compatible: routes without Sugar Lumps have no Sugar Lump fields

