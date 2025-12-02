# Data Model: Achievement-Based Route Calculation

**Feature**: Achievement-Based Route Calculation  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Entities

### Achievement

Represents a Cookie Clicker achievement with metadata and routeability information.

**Source**: `src/data/achievements.json` (existing)

**Fields**:
- `id` (number): Unique achievement identifier
- `name` (string): Achievement display name
- `description` (string): Achievement requirement description
- `category` (string): Achievement category (e.g., "Cookies baked in one ascension", "Cursor")
- `type` (string): "normal" or "shadow"

**Relationships**:
- Has one `AchievementRequirement` (via achievement-requirements.js mapping)

**Validation**:
- `id` must be non-negative integer
- `name` and `description` must be non-empty strings
- `type` must be "normal" or "shadow"

### AchievementRequirement

Represents the parsed, routeable requirement for an achievement. Maps achievement IDs to structured requirement objects.

**Source**: `src/data/achievement-requirements.js` (existing)

**Types**:
- `buildingCount`: `{ type: 'buildingCount', building: string, count: number }`
- `cps`: `{ type: 'cps', value: number }`
- `totalCookies`: `{ type: 'totalCookies', value: number }`
- `upgradeCount`: `{ type: 'upgradeCount', count: number }`
- `totalBuildings`: `{ type: 'totalBuildings', count: number }`
- `minBuildings`: `{ type: 'minBuildings', count: number }`
- `buildingLevel`: `{ type: 'buildingLevel', building: string, level: number }`
- `notRouteable`: `{ type: 'notRouteable', reason: string }`

**Fields** (varies by type):
- `type` (string): Requirement type (required for all)
- `building` (string): Building name (for buildingCount, buildingLevel)
- `count` (number): Count value (for buildingCount, upgradeCount, totalBuildings, minBuildings)
- `value` (number): Numeric value (for cps, totalCookies)
- `level` (number): Building level (for buildingLevel)
- `reason` (string): Non-routeable reason (for notRouteable)

**Relationships**:
- Maps to one `Achievement` (via achievement ID)

**Validation**:
- `type` must be one of the valid types
- Type-specific fields must be present and valid
- `count` and `value` must be non-negative numbers
- `building` must be valid building name

### AchievementGoal

Represents an active achievement goal in a route calculation. Extends Game class with achievement-specific goal tracking.

**Fields** (added to Game class):
- `targetCps` (number | null): Target cookies per second
- `targetBuilding` (Object | null): `{ name: string, count: number }` - target building count
- `targetUpgradeCount` (number | null): Target upgrade count
- `targetTotalBuildings` (number | null): Target total buildings owned
- `targetMinBuildings` (number | null): Target minimum buildings across all types
- `targetBuildingLevel` (Object | null): `{ building: string, level: number }` - target building level
- `achievementGoals` (number[]): Array of achievement IDs being targeted

**State Transitions**:
- Initialized: All goal properties set to null, achievementGoals empty
- Goals Set: Achievement goals populated from selected achievements
- Goal Met: `isAchievementGoalMet()` returns true
- Route Complete: All goals satisfied, route calculation stops

**Validation**:
- At least one goal must be active (targetCookies or achievement goals)
- `achievementGoals` array must contain valid achievement IDs
- Goal values must be non-negative numbers
- Building names must be valid building types

### AchievementRoute

A route calculated to meet one or more achievement requirements. Extends the base route concept with achievement-specific metadata.

**Fields** (extends existing Route):
- All existing route fields (buildings, steps, metadata, etc.)
- `achievementIds` (number[]): Array of achievement IDs that were targeted
- `achievementUnlocks` (Object[]): Array of `{ stepIndex: number, achievementId: number }` indicating when achievements unlock

**Relationships**:
- References multiple `Achievement` (via achievementIds)
- Contains multiple route steps with achievement unlock markers

**Validation**:
- `achievementIds` must be non-empty array for achievement routes
- `achievementUnlocks` must have valid step indices
- All achievementIds must reference routeable achievements

### RouteGoal

The target condition(s) for a route calculation. Can be a cookie amount (existing) or one or more achievement requirements (new).

**Types**:
- Cookie Goal: `{ type: 'cookies', targetCookies: number }` (existing)
- Achievement Goal: `{ type: 'achievements', achievementIds: number[] }` (new)
- Combined Goal: `{ type: 'combined', targetCookies: number, achievementIds: number[] }` (future)

**Fields**:
- `type` (string): Goal type
- `targetCookies` (number | null): Cookie target (for cookie/combined goals)
- `achievementIds` (number[] | null): Achievement IDs (for achievement/combined goals)

**Validation**:
- `type` must be valid goal type
- At least one target must be specified
- Achievement IDs must be valid and routeable

## State Management

### Achievement Selection State

Stored in route creation wizard state during route creation.

**Fields**:
- `selectedAchievementIds` (number[]): Currently selected achievement IDs
- `filterType` (string | null): Active filter by requirement type
- `searchQuery` (string): Search query for achievement name/description
- `showRouteableOnly` (boolean): Filter to show only routeable achievements

**Transitions**:
- Initial: Empty selection, no filters
- Selection: Achievement IDs added/removed
- Filter: Filter type or search query changed
- Submit: Selected achievements passed to route calculation

### Route Calculation State

Tracks achievement goal satisfaction during route calculation.

**Fields** (in Game instance):
- Achievement goal properties (as defined in AchievementGoal)
- `satisfiedAchievements` (Set<number>): Set of achievement IDs that have been satisfied

**Transitions**:
- Initialize: Goals set from selected achievements
- Progress: Game state changes, goals checked each iteration
- Satisfy: Individual achievements marked as satisfied
- Complete: All goals satisfied, calculation stops

## Data Flow

1. **User Selection**: User selects achievements in wizard → `selectedAchievementIds` stored in wizard state
2. **Goal Conversion**: Selected achievement IDs → Achievement requirements → Game achievement goal properties
3. **Route Calculation**: Router checks achievement goals each iteration → Updates `satisfiedAchievements` set
4. **Route Storage**: Calculated route + `achievementIds` + `achievementUnlocks` → Stored in localStorage
5. **Route Display**: Route loaded from storage → Achievement unlock markers displayed at appropriate steps

## Integration Points

### With Existing Route System

- **Route Storage**: Extends existing route format with `achievementIds` and `achievementUnlocks`
- **Route Display**: Extends existing route display to show achievement completion markers
- **Route Calculation**: Extends existing `calculateRoute()` to accept achievement goals

### With Achievement Data

- **Data Access**: Imports `achievements.json` and `achievement-requirements.js` as ES6 modules
- **Requirement Lookup**: Uses `getAchievementRequirement()` from achievement-requirements.js
- **Routeability Check**: Uses `isAchievementRouteable()` from achievement-requirements.js

### With UI Components

- **Wizard Integration**: New achievement selection step in route creation wizard
- **Route Display**: Achievement markers added to existing route display component
- **Filtering/Search**: New utility functions for achievement filtering and search



