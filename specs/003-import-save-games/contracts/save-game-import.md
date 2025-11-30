# Save Game Import Contract: API Interface

**Date**: 2025-01-27  
**Feature**: [spec.md](../spec.md)

## Overview

This contract defines the interface for save game import operations. All operations handle Cookie Clicker save format parsing, validation, and data extraction.

## Namespace

All functions are exported from `src/js/save-game-importer.js` and `src/js/save-game-parser.js`.

## Core Parsing Functions

### `parseSaveGame(saveString: string): ImportedSaveGame | null`

Parses a Cookie Clicker save game string and extracts relevant game state data.

**Parameters**:
- `saveString` (string, required): Raw save game string (may be URL-encoded, base64-encoded, with "!END!" suffix)

**Returns**: 
- `ImportedSaveGame` object if parsing succeeds
- `null` if parsing fails (invalid format, cannot decode)

**Errors**:
- Throws `SaveGameParseError` if save string is empty or invalid format
- Throws `SaveGameDecodeError` if base64/URL decoding fails
- Logs warnings to console for recoverable parsing issues

**Example**:
```javascript
import { parseSaveGame } from './save-game-parser.js';

const saveString = "Mi4wNTN8fDE3NjM4MjM3ODU5NjU...!END!";
const importedData = parseSaveGame(saveString);
if (importedData) {
  console.log('Imported buildings:', importedData.buildingCounts);
}
```

---

### `decodeSaveString(saveString: string): string`

Decodes a save game string (handles URL encoding and removes "!END!" suffix).

**Parameters**:
- `saveString` (string, required): Raw save game string

**Returns**: 
- Decoded string ready for base64 decoding

**Errors**:
- Throws `SaveGameDecodeError` if URL decoding fails

**Example**:
```javascript
import { decodeSaveString } from './save-game-parser.js';

const encoded = "Mi4wNTN8fDE3NjM4MjM3ODU5NjU%3D%3D!END!";
const decoded = decodeSaveString(encoded); // "Mi4wNTN8fDE3NjM4MjM3ODU5NjU=="
```

---

### `extractBuildingCounts(decodedSave: string, versionId: string): object`

Extracts building counts from decoded save string for a specific game version.

**Parameters**:
- `decodedSave` (string, required): Decoded save string (after base64 decoding)
- `versionId` (string, required): Game version ID to map buildings to (e.g., "v2052")

**Returns**: 
- Object mapping building names to counts: `{ "Cursor": 23, "Grandma": 25, ... }`

**Errors**:
- Returns empty object if building section not found
- Logs warnings for buildings that don't exist in specified version

**Example**:
```javascript
import { extractBuildingCounts } from './save-game-parser.js';

const decoded = "4.053|...|23,23,8290,0,,,23;25,25,94125,0,,,25;...";
const buildings = extractBuildingCounts(decoded, "v2052");
// { "Cursor": 23, "Grandma": 25, "Farm": 20, ... }
```

---

### `detectVersion(decodedSave: string): string | null`

Detects Cookie Clicker version from decoded save string.

**Parameters**:
- `decodedSave` (string, required): Decoded save string

**Returns**: 
- Version ID string (e.g., "v2052", "v2048") if detected
- `null` if version cannot be determined

**Example**:
```javascript
import { detectVersion } from './save-game-parser.js';

const decoded = "4.053|...";
const version = detectVersion(decoded); // "v2052" or null
```

---

### `extractGameStats(decodedSave: string): object`

Extracts game statistics (cookies, cookies per second, etc.) from decoded save string.

**Parameters**:
- `decodedSave` (string, required): Decoded save string

**Returns**: 
- Object with game statistics:
  ```javascript
  {
    totalCookies: number,
    cookiesPerSecond: number,
    hardcoreMode: boolean,
    playerCps: number,
    timeElapsed: number
  }
  ```

**Errors**:
- Returns object with undefined values for missing fields
- Logs warnings for missing or invalid data

**Example**:
```javascript
import { extractGameStats } from './save-game-parser.js';

const decoded = "4.053|...|248402.5281663947;10585973.5281692999;...";
const stats = extractGameStats(decoded);
// { totalCookies: 248402.52, cookiesPerSecond: 10585973.52, ... }
```

## Import Workflow Functions

### `importSaveGame(saveString: string): Promise<ImportedSaveGame>`

Complete import workflow: validates, parses, and stores save game data.

**Parameters**:
- `saveString` (string, required): Raw save game string from user

**Returns**: 
- Promise resolving to `ImportedSaveGame` object

**Errors**:
- Rejects with `SaveGameParseError` if parsing fails
- Rejects with `SaveGameValidationError` if validation fails
- Rejects with `SaveGameVersionError` if version not supported

**Example**:
```javascript
import { importSaveGame } from './save-game-importer.js';

try {
  const imported = await importSaveGame(userPastedString);
  console.log('Import successful:', imported.buildingCounts);
} catch (error) {
  console.error('Import failed:', error.message);
}
```

---

### `validateImportedData(importedData: ImportedSaveGame, versionId: string): ValidationResult`

Validates imported save game data against a game version.

**Parameters**:
- `importedData` (ImportedSaveGame, required): Parsed save game data
- `versionId` (string, required): Game version to validate against

**Returns**: 
- `ValidationResult` object:
  ```javascript
  {
    isValid: boolean,
    errors: string[],
    warnings: string[],
    validatedData: ImportedSaveGame
  }
  ```

**Errors**: None (returns validation result, doesn't throw)

**Example**:
```javascript
import { validateImportedData } from './save-game-importer.js';

const result = validateImportedData(importedData, "v2052");
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
```

---

### `getImportedSaveGame(): ImportedSaveGame | null`

Retrieves currently imported save game data.

**Parameters**: None

**Returns**: 
- `ImportedSaveGame` object if save is loaded
- `null` if no save is currently imported

**Errors**: None

**Example**:
```javascript
import { getImportedSaveGame } from './save-game-importer.js';

const imported = getImportedSaveGame();
if (imported) {
  console.log('Current import:', imported.buildingCounts);
}
```

---

### `clearImportedSaveGame(): void`

Clears currently imported save game data.

**Parameters**: None

**Returns**: void

**Errors**: None (idempotent)

**Example**:
```javascript
import { clearImportedSaveGame } from './save-game-importer.js';

clearImportedSaveGame();
```

---

### `getImportState(): SaveGameImportState`

Retrieves current import status.

**Parameters**: None

**Returns**: 
- `SaveGameImportState` object with current status

**Errors**: None

**Example**:
```javascript
import { getImportState } from './save-game-importer.js';

const state = getImportState();
console.log('Import loaded:', state.isLoaded);
```

## Error Types

### `SaveGameParseError`

Thrown when save string cannot be parsed (invalid format, missing sections).

**Properties**:
- `message` (string): Human-readable error message
- `saveString` (string): Original save string that failed
- `parseStep` (string): Which parsing step failed

### `SaveGameDecodeError`

Thrown when save string cannot be decoded (invalid base64, URL encoding issues).

**Properties**:
- `message` (string): Human-readable error message
- `saveString` (string): Original save string that failed
- `decodeType` (string): "base64" or "url"

### `SaveGameValidationError`

Thrown when parsed data fails validation.

**Properties**:
- `message` (string): Human-readable error message
- `validationErrors` (string[]): Array of specific validation errors
- `importedData` (ImportedSaveGame): Data that failed validation

### `SaveGameVersionError`

Thrown when detected version is not supported.

**Properties**:
- `message` (string): Human-readable error message
- `detectedVersion` (string): Version that was detected
- `supportedVersions` (string[]): List of supported versions

## Implementation Notes

- All parsing functions should handle missing or malformed sections gracefully
- Return partial data with warnings rather than failing completely when possible
- Log all parsing warnings to console for debugging
- Use async/await for import workflow to allow UI updates during parsing
- Validate building names against version data before returning
- Handle edge cases: empty strings, very large numbers, missing sections

## Integration Points

### With Starting Buildings Component

```javascript
import { getImportedSaveGame } from './save-game-importer.js';
import { StartingBuildingsSelector } from './ui/starting-buildings.js';

const imported = getImportedSaveGame();
if (imported) {
  startingBuildingsSelector.setStartingBuildings(imported.buildingCounts);
}
```

### With Version Selector

```javascript
import { getImportedSaveGame } from './save-game-importer.js';
import { VersionSelector } from './ui/version-selector.js';

const imported = getImportedSaveGame();
if (imported && imported.version) {
  versionSelector.selectVersion(imported.version);
}
```

### With Route Calculation

```javascript
import { getImportedSaveGame } from './save-game-importer.js';
import { calculateRoute } from './simulation.js';

const imported = getImportedSaveGame();
const startingBuildings = imported ? imported.buildingCounts : {};
const hardcoreMode = imported ? imported.hardcoreMode : false;

const route = await calculateRoute(category, startingBuildings, {
  hardcoreMode: hardcoreMode
}, imported?.version || 'v2052');
```

