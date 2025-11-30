# Data Model: Import Cookie Clicker Save Games

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Entities

### ImportedSaveGame

Represents parsed save game data extracted from Cookie Clicker export. Contains all relevant game state information needed for route calculations.

**Fields**:
- `rawSaveString` (string, optional): Original save string before parsing (for debugging/display)
- `version` (string, optional): Detected Cookie Clicker version (e.g., "v2031", "v2048", "v10466", "v10466_xmas", "v2052")
- `buildingCounts` (object, required): Map of building names to counts owned
  - Keys: Building names (e.g., "Cursor", "Grandma", "Farm")
  - Values: Non-negative integers representing number of each building owned
- `upgrades` (array, optional): Array of purchased upgrade names
- `unlockedUpgrades` (array, optional): Array of unlocked but not yet purchased upgrade names
- `achievements` (array, optional): Array of unlocked achievement indices (or names if mapped)
- `totalCookies` (number, optional): Total cookies produced in the save game
- `cookiesPerSecond` (number, optional): Current cookies per second in the save game
- `hardcoreMode` (boolean, optional): Whether hardcore mode is enabled (default: false)
- `playerCps` (number, optional): Player clicks per second from save game
- `playerDelay` (number, optional): Player delay when switching from clicking to purchasing
- `timeElapsed` (number, optional): Time elapsed in seconds from save game
- `cookiesEarned` (number, optional): Total cookies earned (if available)
- `cookiesBaked` (number, optional): Total cookies baked (if available)
- `cookiesReset` (number, optional): Total cookies reset (if available)
- `cookiesForfeited` (number, optional): Total cookies forfeited (if available)
- `playerName` (string, optional): Player's name from save game
- `startDate` (number, optional): Timestamp when game was started (milliseconds since epoch)
- `lastDate` (number, optional): Timestamp of last save (milliseconds since epoch)
- `currentDate` (number, optional): Current game date timestamp (milliseconds since epoch)
- `mods` (array, optional): Array of active mod names
- `importedAt` (number, required): Timestamp when save was imported (milliseconds since epoch)
- `parseErrors` (array, optional): Array of warning/error messages from parsing (for user feedback)

**Validation Rules**:
- `buildingCounts` must be object with building names as keys and non-negative integers as values
- `totalCookies` must be non-negative number if provided
- `cookiesPerSecond` must be non-negative number if provided
- `playerCps` must be non-negative number if provided
- `timeElapsed` must be non-negative number if provided
- `version` must be one of supported versions if provided: "v2031", "v2048", "v10466", "v10466_xmas", "v2052"
- `importedAt` must be valid timestamp

**Storage**: Stored temporarily in memory and optionally in localStorage under key `cookieRouter:importedSaveGame` (not persisted across browser sessions per spec assumptions)

**Relationships**:
- ImportedSaveGame is used to populate StartingBuildings (one-to-one relationship)
- ImportedSaveGame may reference a Game Version (many-to-one via version field)
- ImportedSaveGame is replaced when new save is imported (FR-014)

### SaveGameImportState

Represents the current import status and metadata for tracking import operations.

**Fields**:
- `isLoaded` (boolean, required): Whether save data is currently loaded
- `importedAt` (number, optional): Timestamp when current save was imported (milliseconds since epoch)
- `version` (string, optional): Detected version of current import
- `hasErrors` (boolean, required): Whether import had any errors or warnings
- `errorMessages` (array, optional): Array of error messages if import failed
- `warningMessages` (array, optional): Array of warning messages if import had issues

**Validation Rules**:
- `isLoaded` must be boolean
- `importedAt` must be valid timestamp if provided
- `version` must be valid version identifier if provided
- `hasErrors` must be boolean
- `errorMessages` and `warningMessages` must be arrays of strings

**Storage**: Stored in application state (memory), not persisted

**Relationships**:
- SaveGameImportState tracks status of ImportedSaveGame (one-to-one relationship)

## Data Flow

### Importing a Save Game

1. User pastes save game string into import field (FR-001)
2. System validates format (base64, "!END!" suffix, URL encoding) (FR-011)
3. System decodes save string (URL decode → remove "!END!" → base64 decode)
4. System parses decoded string (split by "|" for sections, ";" for entries)
5. System extracts relevant data:
   - Building counts from building section (FR-003)
   - Total cookies from stats section (FR-004)
   - Cookies per second from stats section (FR-005)
   - Game version from version section or inference (FR-006)
   - Hardcore mode from settings section (FR-007)
   - Player CPS and time elapsed if available (FR-019, FR-020)
6. System creates ImportedSaveGame object with extracted data
7. System validates extracted data (FR-011):
   - Building counts are non-negative integers
   - Numeric values are valid numbers
   - Building names exist in detected/selected version (FR-018)
8. System stores ImportedSaveGame in memory and optionally localStorage
9. System updates SaveGameImportState (isLoaded: true, importedAt: now)
10. System displays confirmation and save game details (FR-008)

### Using Imported Data for Route Calculation

1. User selects a category for route calculation
2. System checks if ImportedSaveGame exists
3. If exists, system automatically:
   - Populates starting buildings with imported buildingCounts (FR-009, FR-010)
   - Sets hardcore mode if imported (User Story 3 Acceptance Scenario 3)
   - Selects version if detected from import (User Story 1 Acceptance Scenario 5)
4. User can manually override starting buildings if desired (FR-016)
5. System calculates route using imported data as starting point (FR-010)

### Displaying Save Game Details

1. User views save game details (User Story 2)
2. System loads ImportedSaveGame from memory
3. System displays:
   - Building counts in organized format (User Story 2 Acceptance Scenario 1)
   - Game statistics (total cookies, cookies per second) (User Story 2 Acceptance Scenario 2)
   - Version and game mode information (User Story 2 Acceptance Scenario 3)
4. User can collapse/expand details view (User Story 2 Acceptance Scenario 5)

### Clearing Imported Data

1. User initiates clear action (FR-013)
2. System removes ImportedSaveGame from memory
3. System removes from localStorage if stored
4. System clears starting buildings (returns to empty state)
5. System updates SaveGameImportState (isLoaded: false)
6. System updates UI to show no import status (FR-017)

### Replacing Imported Data

1. User imports new save game (FR-014)
2. System follows import flow above
3. System replaces previous ImportedSaveGame with new one
4. System updates starting buildings with new building counts
5. System updates SaveGameImportState with new import metadata

## Storage Schema

### Memory Structure (Application State)

```javascript
// In application state object
{
  importedSaveGame: {
    rawSaveString: "Mi4wNTN8fDE3NjM4MjM3ODU5NjU...",
    version: "v2052",
    buildingCounts: {
      "Cursor": 23,
      "Grandma": 25,
      "Farm": 20,
      "Mine": 15,
      "Factory": 10,
      "Bank": 4,
      // ... other buildings
    },
    totalCookies: 248402.5281663947,
    cookiesPerSecond: 10585973.5281692999,
    hardcoreMode: false,
    playerCps: 8,
    timeElapsed: 9092.3,
    importedAt: 1737984000000,
    parseErrors: []
  },
  importState: {
    isLoaded: true,
    importedAt: 1737984000000,
    version: "v2052",
    hasErrors: false,
    errorMessages: [],
    warningMessages: []
  }
}
```

### localStorage Structure (Optional, Temporary)

```javascript
{
  "cookieRouter:importedSaveGame": {
    "version": "v2052",
    "buildingCounts": {
      "Cursor": 23,
      "Grandma": 25,
      // ... other buildings
    },
    "totalCookies": 248402.5281663947,
    "cookiesPerSecond": 10585973.5281692999,
    "hardcoreMode": false,
    "playerCps": 8,
    "timeElapsed": 9092.3,
    "importedAt": 1737984000000
  }
}
```

**Note**: localStorage storage is optional and temporary. Data is not loaded on page refresh per spec assumptions. It provides resilience against accidental page refreshes during the session.

## Data Integrity

- ImportedSaveGame.buildingCounts keys must match building names from selected game version
- Building counts from save game that don't exist in selected version are ignored (FR-018)
- ImportedSaveGame is replaced entirely when new save is imported (no merging)
- SaveGameImportState.isLoaded must be true if ImportedSaveGame exists
- Clearing import must remove both ImportedSaveGame and reset SaveGameImportState

## Error Handling

### Invalid Save Format

- If base64 decoding fails: Set error message, do not create ImportedSaveGame
- If section parsing fails: Create ImportedSaveGame with available data, add warning to parseErrors
- If required section missing: Create ImportedSaveGame with partial data, add warning

### Invalid Data Values

- If building count is negative: Set to 0, add warning
- If building name doesn't exist in version: Ignore that building, add warning
- If numeric value is invalid: Set to 0 or undefined, add warning
- If version detection fails: Use default version (v2052), add warning

### Version Mismatch

- If detected version not supported: Use closest supported version, add warning
- If buildings from save don't exist in selected version: Ignore those buildings, add warning

## Migration Considerations

- No migration needed (new feature)
- Does not affect existing data structures
- Backward compatible: existing features continue to work without imported data

