# Storage Contract: Saved Routes Operations

**Date**: 2025-01-27  
**Feature**: [spec.md](../spec.md)

## Overview

This contract defines the interface for all localStorage operations related to saved routes. These operations extend the existing storage contract and follow the same patterns. All operations are synchronous and use JSON serialization.

## Namespace

All localStorage keys use the existing `cookieRouter:` prefix. Saved routes use the key `cookieRouter:savedRoutes`.

## Operations

### Saved Routes

#### `getSavedRoutes(): SavedRoute[]`

Retrieves all saved routes from localStorage.

**Returns**: Array of SavedRoute objects, empty array if none exist or on error

**Errors**: 
- Handles corrupted JSON gracefully (returns empty array)
- Handles missing key gracefully (returns empty array)

**Storage Key**: `cookieRouter:savedRoutes`

---

#### `saveSavedRoute(savedRoute: SavedRoute): void`

Saves a saved route to localStorage. If saved route with same ID exists, it is replaced.

**Parameters**:
- `savedRoute` (SavedRoute): SavedRoute object to save

**Returns**: void

**Errors**:
- Throws if localStorage quota exceeded
- Throws if savedRoute validation fails

**Storage Key**: `cookieRouter:savedRoutes`

---

#### `getSavedRouteById(savedRouteId: string): SavedRoute | null`

Retrieves a single saved route by ID.

**Parameters**:
- `savedRouteId` (string): ID of saved route to retrieve

**Returns**: SavedRoute object or null if not found

**Errors**: None (returns null on error)

**Storage Key**: `cookieRouter:savedRoutes`

---

#### `deleteSavedRoute(savedRouteId: string): void`

Deletes a saved route from localStorage by ID. Also deletes associated progress.

**Parameters**:
- `savedRouteId` (string): ID of saved route to delete

**Returns**: void

**Errors**: None (idempotent - no error if saved route doesn't exist)

**Storage Key**: `cookieRouter:savedRoutes` and `cookieRouter:progress`

---

#### `updateSavedRouteName(savedRouteId: string, newName: string): void`

Updates the name of a saved route.

**Parameters**:
- `savedRouteId` (string): ID of saved route to update
- `newName` (string): New name for the route (must be non-empty, max 100 characters)

**Returns**: void

**Errors**:
- Throws if savedRouteId doesn't exist
- Throws if newName validation fails (empty or too long)

**Storage Key**: `cookieRouter:savedRoutes`

---

#### `updateLastAccessed(savedRouteId: string): void`

Updates the lastAccessedAt timestamp for a saved route.

**Parameters**:
- `savedRouteId` (string): ID of saved route to update

**Returns**: void

**Errors**:
- Throws if savedRouteId doesn't exist

**Storage Key**: `cookieRouter:savedRoutes`

---

### Saved Route Progress

Saved route progress uses the existing progress storage contract, but is keyed by saved route ID instead of calculated route ID. The existing `getProgress`, `saveProgress`, `updateProgress`, and `clearProgress` functions work with saved routes when passed a saved route ID.

**Note**: Saved route progress is stored in the same `cookieRouter:progress` object as calculated route progress, but with different keys (saved route IDs vs calculated route IDs).

## Error Handling

All functions should handle localStorage errors gracefully:

1. **Quota Exceeded**: Catch `QuotaExceededError` and throw user-friendly error message suggesting deletion of old routes
2. **Corrupted Data**: Validate JSON on read, return empty/default values if invalid
3. **Missing Keys**: Return empty arrays/objects or null as appropriate
4. **Invalid Data**: Validate input parameters, throw descriptive errors

## Data Validation

All save operations must validate data according to data-model.md before saving:
- SavedRoute: Validate all required fields, name length (1-100 chars), routeData structure
- SavedRoute name: Must be non-empty string, max 100 characters

## Implementation Notes

- All operations are synchronous (localStorage API is synchronous)
- Use try-catch blocks for error handling
- Log errors to console in development mode
- Saved routes are independent of calculated routes (different storage keys)
- Progress for saved routes uses same storage structure but different keys

