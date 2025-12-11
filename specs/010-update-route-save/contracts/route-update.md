# Route Update Contract: API Interface

**Date**: 2025-01-27  
**Feature**: [spec.md](../spec.md)

## Overview

This contract defines the interface for route update operations. All operations handle updating saved routes with new save game data, recalculating routes, and preserving progress.

## Namespace

All functions are exported from `src/js/storage.js` and `src/js/utils/route-update.js`.

## Core Update Functions

### `updateSavedRoute(savedRouteId: string, importedSaveGame: ImportedSaveGame, options?: RouteUpdateOptions): Promise<RouteUpdateResult>`

Updates a saved route by recalculating it with imported save game data as the new starting point.

**Parameters**:
- `savedRouteId` (string, required): ID of the saved route to update
- `importedSaveGame` (ImportedSaveGame, required): Imported save game data to use for recalculation
- `options` (RouteUpdateOptions, optional): Update options
  - `onProgress` (function, optional): Progress callback during calculation
  - `onCancel` (function, optional): Cancellation callback
  - `preserveProgress` (boolean, optional): Whether to preserve progress (default: true)

**Returns**: 
- Promise resolving to RouteUpdateResult object:
  ```typescript
  {
    success: boolean;
    updatedRoute?: SavedRoute;
    preservedProgress?: number[]; // Array of preserved step orders
    error?: {
      message: string;
      code: string; // "VALIDATION_ERROR", "CALCULATION_ERROR", "VERSION_MISMATCH", "CANCELLED"
    };
  }
  ```

**Errors**:
- Throws `RouteUpdateError` if saved route not found
- Throws `ValidationError` if imported save game data is invalid
- Throws `VersionMismatchError` if versions are incompatible
- Returns error in result if calculation fails

**Example**:
```javascript
import { updateSavedRoute } from './storage.js';
import { getImportedSaveGame } from './save-game-importer.js';

const importedSave = getImportedSaveGame();
const result = await updateSavedRoute('saved-route-123', importedSave, {
  onProgress: (progress) => console.log('Progress:', progress.moves),
  preserveProgress: true
});

if (result.success) {
  console.log('Route updated:', result.updatedRoute.name);
  console.log('Preserved progress:', result.preservedProgress);
} else {
  console.error('Update failed:', result.error.message);
}
```

---

### `preserveRouteProgress(oldRoute: Route, newRoute: Route, oldProgress: number[]): number[]`

Maps progress from old route structure to new route structure, preserving completed steps where possible.

**Parameters**:
- `oldRoute` (Route, required): Original route before update
- `newRoute` (Route, required): Updated route after recalculation
- `oldProgress` (number[], required): Array of completed step orders from old route

**Returns**: 
- Array of step orders from new route that correspond to preserved progress

**Algorithm**:
1. For each completed step in old route:
   - Find matching step in new route by building name and relative position
   - If match found (within ±2 position tolerance), add new step order to result
   - If no match found, skip (progress lost for this step)
2. Return array of preserved step orders

**Example**:
```javascript
import { preserveRouteProgress } from './utils/route-update.js';

const oldRoute = { buildings: [{ name: 'Cursor' }, { name: 'Grandma' }, { name: 'Farm' }] };
const newRoute = { buildings: [{ name: 'Cursor' }, { name: 'Grandma' }, { name: 'Farm' }, { name: 'Mine' }] };
const oldProgress = [1, 2, 3]; // First 3 buildings completed

const preserved = preserveRouteProgress(oldRoute, newRoute, oldProgress);
// Returns [1, 2, 3] - same steps preserved
```

---

### `validateRouteUpdate(savedRoute: SavedRoute, importedSaveGame: ImportedSaveGame): ValidationResult`

Validates that a route update can proceed with the given imported save game data.

**Parameters**:
- `savedRoute` (SavedRoute, required): Route to be updated
- `importedSaveGame` (ImportedSaveGame, required): Imported save game data

**Returns**: 
- ValidationResult object:
  ```typescript
  {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    versionCompatible: boolean;
  }
  ```

**Validation Rules**:
- Check version compatibility (route.versionId vs importedSaveGame.version)
- Validate imported save game data structure
- Check that route exists and is valid
- Verify imported save game has required fields (buildingCounts)

**Example**:
```javascript
import { validateRouteUpdate } from './utils/route-update.js';

const validation = validateRouteUpdate(savedRoute, importedSave);
if (!validation.isValid) {
  console.error('Validation failed:', validation.errors);
} else if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

---

### `getRouteUpdateState(routeId: string): RouteUpdateState | null`

Gets the current update state for a route.

**Parameters**:
- `routeId` (string, required): ID of the route

**Returns**: 
- RouteUpdateState object if update in progress, null otherwise

**Example**:
```javascript
import { getRouteUpdateState } from './utils/route-update.js';

const updateState = getRouteUpdateState('saved-route-123');
if (updateState && updateState.isUpdating) {
  console.log('Update in progress:', updateState.progress);
}
```

---

### `cancelRouteUpdate(routeId: string): boolean`

Cancels an in-progress route update.

**Parameters**:
- `routeId` (string, required): ID of the route being updated

**Returns**: 
- true if cancellation successful, false if no update in progress

**Example**:
```javascript
import { cancelRouteUpdate } from './utils/route-update.js';

const cancelled = cancelRouteUpdate('saved-route-123');
if (cancelled) {
  console.log('Update cancelled');
}
```

---

## Type Definitions

### RouteUpdateOptions

```typescript
{
  onProgress?: (progress: CalculationProgress) => void;
  onCancel?: () => void;
  preserveProgress?: boolean; // default: true
}
```

### RouteUpdateResult

```typescript
{
  success: boolean;
  updatedRoute?: SavedRoute;
  preservedProgress?: number[];
  error?: {
    message: string;
    code: string;
  };
}
```

### RouteUpdateState

```typescript
{
  routeId: string;
  isUpdating: boolean;
  isCancelled: boolean;
  progress?: {
    moves: number;
    currentBuilding: string;
  };
  error?: {
    message: string;
    code: string;
    timestamp: number;
  };
  startedAt?: number;
  completedAt?: number;
}
```

### ValidationResult

```typescript
{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  versionCompatible: boolean;
}
```

## Error Types

### RouteUpdateError

Thrown when route update operation fails.

**Properties**:
- `message` (string): Error message
- `code` (string): Error code
- `routeId` (string): ID of route that failed to update

### ValidationError

Thrown when route update validation fails.

**Properties**:
- `message` (string): Error message
- `errors` (string[]): Array of validation errors
- `warnings` (string[]): Array of validation warnings

### VersionMismatchError

Thrown when route and imported save game versions are incompatible.

**Properties**:
- `message` (string): Error message
- `routeVersion` (string): Version of the saved route
- `importedVersion` (string): Version of imported save game
- `compatible` (boolean): Whether versions are compatible

## Integration Points

- Uses `calculateRoute` from `simulation.js` for recalculation
- Uses `getImportedSaveGame` from `save-game-importer.js` for imported data
- Uses `getSavedRoute` and `saveSavedRoute` from `storage.js` for route persistence
- Uses `getProgress` and `saveProgress` from `storage.js` for progress tracking

## Usage Patterns

### Basic Update

```javascript
import { updateSavedRoute } from './storage.js';
import { getImportedSaveGame } from './save-game-importer.js';

const importedSave = getImportedSaveGame();
if (!importedSave) {
  console.error('No save game imported');
  return;
}

const result = await updateSavedRoute('saved-route-123', importedSave);
if (result.success) {
  console.log('Route updated successfully');
} else {
  console.error('Update failed:', result.error.message);
}
```

### Update with Progress Tracking

```javascript
const result = await updateSavedRoute('saved-route-123', importedSave, {
  onProgress: (progress) => {
    console.log(`Calculated ${progress.moves} moves`);
    updateProgressBar(progress.moves);
  }
});
```

### Update with Cancellation

```javascript
let updateCancelled = false;

const result = await updateSavedRoute('saved-route-123', importedSave, {
  onCancel: () => {
    updateCancelled = true;
  }
});

// In another part of code:
if (updateCancelled) {
  cancelRouteUpdate('saved-route-123');
}
```

### Validate Before Update

```javascript
import { validateRouteUpdate } from './utils/route-update.js';
import { getSavedRoute } from './storage.js';

const savedRoute = getSavedRoute('saved-route-123');
const validation = validateRouteUpdate(savedRoute, importedSave);

if (!validation.isValid) {
  displayErrors(validation.errors);
  return;
}

if (!validation.versionCompatible) {
  const proceed = confirm('Version mismatch. Continue anyway?');
  if (!proceed) return;
}

const result = await updateSavedRoute('saved-route-123', importedSave);
```

