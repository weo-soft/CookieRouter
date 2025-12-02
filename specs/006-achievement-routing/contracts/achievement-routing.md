# API Contract: Achievement-Based Route Calculation

**Feature**: Achievement-Based Route Calculation  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This contract defines the APIs for achievement-based route calculation, extending the existing route calculation system to support achievement goals.

## Core APIs

### Achievement Data Access

#### `getAchievementById(id: number): Achievement | undefined`

Gets achievement data by ID.

**Source**: `src/data/achievements.js` (existing)

**Parameters**:
- `id` (number): Achievement ID

**Returns**: Achievement object or undefined if not found

**Example**:
```javascript
const achievement = getAchievementById(34);
// Returns: { id: 34, name: "Click", description: "Have 1 cursor", ... }
```

#### `getAchievementRequirement(achievementId: number): AchievementRequirement | null`

Gets the routeable requirement for an achievement.

**Source**: `src/data/achievement-requirements.js` (existing)

**Parameters**:
- `achievementId` (number): Achievement ID

**Returns**: Requirement object or null if not found/not routeable

**Example**:
```javascript
const requirement = getAchievementRequirement(34);
// Returns: { type: 'buildingCount', building: 'Cursor', count: 1 }
```

#### `isAchievementRouteable(achievementId: number): boolean`

Checks if an achievement is routeable.

**Source**: `src/data/achievement-requirements.js` (existing)

**Parameters**:
- `achievementId` (number): Achievement ID

**Returns**: True if achievement is routeable

**Example**:
```javascript
const routeable = isAchievementRouteable(34); // true
const notRouteable = isAchievementRouteable(67); // false (golden cookie)
```

#### `getRouteableAchievementIds(): number[]`

Gets all routeable achievement IDs.

**Source**: `src/data/achievement-requirements.js` (existing)

**Returns**: Array of routeable achievement IDs

**Example**:
```javascript
const routeableIds = getRouteableAchievementIds();
// Returns: [0, 1, 2, 3, 16, 17, 34, 35, ...]
```

### Achievement Utilities

#### `filterAchievementsByType(achievements: Achievement[], requirementType: string): Achievement[]`

Filters achievements by requirement type.

**Source**: `src/js/utils/achievement-utils.js` (new)

**Parameters**:
- `achievements` (Achievement[]): Array of achievements to filter
- `requirementType` (string): Requirement type to filter by (e.g., 'buildingCount', 'cps')

**Returns**: Filtered array of achievements

**Example**:
```javascript
const buildingAchievements = filterAchievementsByType(allAchievements, 'buildingCount');
```

#### `searchAchievements(achievements: Achievement[], query: string): Achievement[]`

Searches achievements by name or description.

**Source**: `src/js/utils/achievement-utils.js` (new)

**Parameters**:
- `achievements` (Achievement[]): Array of achievements to search
- `query` (string): Search query (case-insensitive)

**Returns**: Array of matching achievements

**Example**:
```javascript
const results = searchAchievements(allAchievements, 'cursor');
// Returns achievements with "cursor" in name or description
```

#### `getRouteableAchievements(achievements: Achievement[]): Achievement[]`

Filters to show only routeable achievements.

**Source**: `src/js/utils/achievement-utils.js` (new)

**Parameters**:
- `achievements` (Achievement[]): Array of achievements to filter

**Returns**: Array of routeable achievements only

**Example**:
```javascript
const routeable = getRouteableAchievements(allAchievements);
```

### Game Class Extensions

#### `Game.isAchievementGoalMet(): boolean`

Checks if all active achievement goals are satisfied.

**Source**: `src/js/game.js` (modified)

**Returns**: True if all achievement goals are met

**Logic**:
- Checks `targetCps` if set: `rate() >= targetCps`
- Checks `targetBuilding` if set: `numBuildings[building] >= count`
- Checks `targetUpgradeCount` if set: `history.length >= count`
- Checks `targetTotalBuildings` if set: sum of all `numBuildings` >= count
- Checks `targetMinBuildings` if set: min of all `numBuildings` >= count
- Checks `targetBuildingLevel` if set: building level >= level (note: requires sugar lump simulation)
- Returns true only if ALL active goals are satisfied

**Example**:
```javascript
const game = new Game(version);
game.targetBuilding = { name: 'Farm', count: 50 };
game.targetCps = 1000;
// ... route calculation ...
if (game.isAchievementGoalMet()) {
  // All goals satisfied
}
```

### Route Calculation

#### `calculateAchievementRoute(achievementIds: number[], startingBuildings?: Object, options?: Object, versionId?: string): Promise<Route>`

Calculates a route for one or more achievements.

**Source**: `src/js/simulation.js` (modified)

**Parameters**:
- `achievementIds` (number[]): Array of achievement IDs to target (1-5 achievements)
- `startingBuildings` (Object, optional): Map of building names to counts already owned
- `options` (Object, optional): Route calculation options
  - `algorithm` (string): 'GPL' or 'DFS' (default: 'GPL')
  - `lookahead` (number): Lookahead depth (default: 1)
  - `onProgress` (function): Progress callback
  - `manualUpgrades` (string[]): Array of upgrade names already purchased
- `versionId` (string, optional): Game version ID (default: 'v2052')

**Returns**: Promise resolving to Route object with achievement metadata

**Route Object Extensions**:
- `achievementIds` (number[]): Achievement IDs that were targeted
- `achievementUnlocks` (Object[]): Array of `{ stepIndex: number, achievementId: number }`

**Errors**:
- Throws if any achievement ID is invalid
- Throws if any achievement is not routeable
- Throws if achievementIds array is empty
- Throws if more than 5 achievements selected

**Example**:
```javascript
const route = await calculateAchievementRoute(
  [34, 44], // Cursor and Farm achievements
  { Cursor: 0, Farm: 10 },
  { algorithm: 'GPL', lookahead: 1 },
  'v2052'
);
```

#### `calculateRoute(category, startingBuildings?, options?, versionId?): Promise<Route>`

Extended to support achievement goals via category object.

**Source**: `src/js/simulation.js` (modified)

**Category Object Extensions**:
- `achievementIds` (number[], optional): Achievement IDs to target (alternative to targetCookies)
- If `achievementIds` present, route calculates to achievement goals instead of cookie target

**Example**:
```javascript
const category = {
  id: 'achievement-route',
  name: 'My Achievement Route',
  achievementIds: [34, 44]
};
const route = await calculateRoute(category, {}, {}, 'v2052');
```

### Router Extensions

#### `Router.routeGPL(game: Game, lookahead?: number, onProgress?: function): Promise<Game>`

Extended to check achievement goals in addition to cookie target.

**Source**: `src/js/router.js` (modified)

**Modifications**:
- Main loop now checks: `game.totalCookies >= game.targetCookies || game.isAchievementGoalMet()`
- Stops when either cookie target OR all achievement goals are met
- Tracks achievement satisfaction during routing

**Example**:
```javascript
const router = new Router();
const result = await router.routeGPL(game, 1, (progress) => {
  console.log(`Progress: ${progress.moves} moves`);
});
```

## UI Component APIs

### Achievement Selection Component

#### `WizardAchievementSelection`

Component for selecting achievements in route creation wizard.

**Source**: `src/js/ui/wizard-achievement-selection.js` (new)

**Methods**:
- `constructor(containerId: string, onSelectionChange?: function)`
- `setSelectedAchievements(achievementIds: number[])`
- `getSelectedAchievements(): number[]`
- `setFilter(type: string | null)`
- `setSearchQuery(query: string)`
- `setRouteableOnly(enabled: boolean)`
- `render()`

**Events**:
- `selectionchange`: Fired when selected achievements change

**Example**:
```javascript
const selector = new WizardAchievementSelection('achievement-selector', (ids) => {
  console.log('Selected:', ids);
});
selector.setRouteableOnly(true);
selector.render();
```

### Route Display Extensions

#### `RouteDisplay.showAchievementMarkers(enabled: boolean)`

Enables/disables achievement completion markers in route display.

**Source**: `src/js/ui/route-display.js` (modified)

**Parameters**:
- `enabled` (boolean): Whether to show achievement markers

**Example**:
```javascript
routeDisplay.showAchievementMarkers(true);
```

## Error Handling

### Invalid Achievement ID

**Error**: `Error: Achievement {id} not found`

**When**: Achievement ID doesn't exist in achievements.json

**Handling**: Show user-friendly error message, allow user to select different achievement

### Non-Routeable Achievement

**Error**: `Error: Achievement "{name}" is not routeable: {reason}`

**When**: User attempts to select non-routeable achievement

**Handling**: Prevent selection in UI, show explanation tooltip

### Empty Achievement Selection

**Error**: `Error: At least one achievement must be selected`

**When**: User attempts to calculate route with no achievements selected

**Handling**: Disable calculate button, show validation message

### Too Many Achievements

**Error**: `Error: Maximum 5 achievements can be selected`

**When**: User attempts to select more than 5 achievements

**Handling**: Disable additional selection, show limit message

### Conflicting Goals

**Note**: Not an error - router handles automatically

**When**: Multiple achievements have conflicting optimal paths

**Handling**: Router finds compromise path that satisfies all goals, may not be optimal for each individually

## Performance Requirements

- Achievement list filtering: < 100ms for 200+ achievements
- Achievement search: < 100ms with debouncing
- Single achievement route: < 2x time of cookie-based route
- Multiple achievement route (5): < 3x time of single achievement route
- UI remains responsive during calculation (async/await with progress callbacks)

## Backward Compatibility

- Existing cookie-based routes continue to work unchanged
- `calculateRoute()` with cookie targets works as before
- Route storage format extended but backward compatible
- Existing route display works with or without achievement markers



