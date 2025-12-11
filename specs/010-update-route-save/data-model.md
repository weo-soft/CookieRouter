# Data Model: Update Route from Save Game

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Entities

### SavedRoute (Extended)

Represents a saved route that can be updated with new save game data. Extends the existing SavedRoute entity from feature 002-saved-routes.

**Fields** (existing + new):
- `id` (string, required): Unique identifier for the saved route (preserved during update)
- `name` (string, required): User-provided name for the route (preserved during update)
- `categoryId` (string, required): ID of the category this route was calculated for (preserved during update)
- `categoryName` (string, required): Display name of the category (preserved during update)
- `versionId` (string, required): Game version ID used for calculation (preserved during update, may differ from imported save game version)
- `routeData` (object, required): Complete route calculation data (updated during route update)
  - `buildings` (array): Ordered list of building purchase steps (recalculated)
  - `algorithm` (string): Algorithm used ("GPL" or "DFS") (preserved from original)
  - `lookahead` (number): Lookahead depth if applicable (preserved from original)
  - `completionTime` (number): Total time to reach target in seconds (recalculated)
  - `startingBuildings` (object): Starting buildings used for calculation (updated from imported save game)
- `savedAt` (number, required): Timestamp when route was originally saved (preserved during update)
- `lastAccessedAt` (number, required): Timestamp when route was last opened (updated during update)
- `lastUpdatedAt` (number, optional): Timestamp when route was last recalculated/updated (new field, set on update)
- `createdAt` (number, optional): Timestamp when route was created (preserved during update)

**Validation Rules**:
- All existing SavedRoute validation rules apply
- `lastUpdatedAt` must be valid timestamp if provided
- `lastUpdatedAt` must be >= `savedAt` if both provided
- Updated `routeData` must contain valid route structure with non-empty buildings array

**Storage**: Stored in localStorage under key `cookieRouter:savedRoutes` as JSON array (same as existing)

**Relationships**:
- SavedRoute references one Category (many-to-one via categoryId)
- SavedRoute has one SavedRouteProgress (one-to-one via id)
- SavedRoute can be updated using one ImportedSaveGame (temporary relationship during update)

### ImportedSaveGame (Existing)

Represents the current save game data imported by the user. Used as input for route updates. Defined in feature 003-import-save-games.

**Fields** (as defined in feature 003):
- `buildingCounts` (object): Map of building names to counts
- `totalCookies` (number): Total cookies produced
- `cookiesPerSecond` (number): Current cookies per second
- `version` (string): Game version identifier
- `hardcoreMode` (boolean): Whether hardcore mode is enabled
- `upgrades` (array): Array of purchased upgrade names
- `achievements` (array): Array of achievement IDs
- Other game state data...

**Usage in Route Update**:
- `buildingCounts` used as new `startingBuildings` for recalculation
- `version` checked for compatibility with route's `versionId`
- `hardcoreMode` used if route category supports it
- `upgrades` used as `manualUpgrades` in calculation options

### RouteUpdateState (New)

Represents the state of an ongoing route update operation. Tracks update progress and prevents concurrent updates.

**Fields**:
- `routeId` (string, required): ID of the route being updated
- `isUpdating` (boolean, required): Whether update is currently in progress
- `isCancelled` (boolean, required): Whether update was cancelled by user
- `progress` (object, optional): Progress information from calculation
  - `moves` (number): Number of moves calculated so far
  - `currentBuilding` (string): Current building being evaluated
- `error` (object, optional): Error information if update failed
  - `message` (string): Error message
  - `code` (string): Error code (e.g., "VALIDATION_ERROR", "CALCULATION_ERROR", "VERSION_MISMATCH")
  - `timestamp` (number): When error occurred
- `startedAt` (number, optional): Timestamp when update started
- `completedAt` (number, optional): Timestamp when update completed or failed

**Validation Rules**:
- `routeId` must reference an existing SavedRoute
- `isUpdating` and `isCancelled` cannot both be true
- `error` must have `message` if present
- `completedAt` must be >= `startedAt` if both provided

**Storage**: Stored in memory only (not persisted to localStorage). Cleared when update completes or fails.

**Relationships**:
- RouteUpdateState tracks one SavedRoute (one-to-one via routeId)

### SavedRouteProgress (Extended)

Represents progress tracking data for a specific saved route. Extends existing SavedRouteProgress from feature 002-saved-routes. Progress may be modified during route updates.

**Fields** (existing):
- `savedRouteId` (string, required): ID of the saved route this progress belongs to
- `completedBuildings` (array, required): Array of building step orders that have been checked off (may be modified during update)
- `lastUpdated` (number, required): Timestamp when progress was last updated (updated when route is updated)

**Progress Preservation During Update**:
- When route is updated, `completedBuildings` array is mapped from old route structure to new route structure
- Steps that match (same building at same relative position) preserve completed status
- Steps that no longer exist are removed from `completedBuildings`
- New steps start uncompleted
- `lastUpdated` timestamp is updated to reflect the progress modification

**Validation Rules**:
- All existing SavedRouteProgress validation rules apply
- After update, `completedBuildings` values must correspond to valid step orders in updated route
- Values in `completedBuildings` should be unique

**Storage**: Stored in localStorage under key `cookieRouter:progress` as JSON object with savedRouteId as keys (same as existing)

## Data Flow

### Updating a Saved Route

1. User views a saved route (existing flow)
2. User imports save game data (existing import flow from feature 003)
3. System validates imported save game data:
   - Check version compatibility with route's versionId
   - Validate building counts and game state
   - If validation fails: Display error, stop update
4. User triggers route update (clicks "Update Route" button)
5. System creates RouteUpdateState:
   - Set `isUpdating: true`
   - Set `routeId` to current route ID
   - Set `startedAt` timestamp
6. System loads current SavedRoute and SavedRouteProgress
7. System maps progress from old route to new route structure (preservation logic)
8. System recalculates route using `calculateRoute`:
   - Use imported `buildingCounts` as `startingBuildings`
   - Use route's original `algorithm` and `lookahead` options
   - Use imported `upgrades` as `manualUpgrades`
   - Use imported `version` or route's `versionId` (based on compatibility)
9. System updates SavedRoute:
   - Update `routeData` with new calculation results
   - Update `lastUpdatedAt` timestamp (new field)
   - Update `lastAccessedAt` timestamp
   - Preserve `id`, `name`, `categoryId`, `categoryName`, `versionId`, `savedAt`
10. System updates SavedRouteProgress:
    - Update `completedBuildings` with mapped progress
    - Update `lastUpdated` timestamp
11. System saves updated SavedRoute and SavedRouteProgress to localStorage
12. System clears RouteUpdateState (`isUpdating: false`)
13. System displays success message and updated route

### Handling Update Errors

1. If validation fails before update:
   - Display error message (version mismatch, invalid data, etc.)
   - Do not modify SavedRoute or SavedRouteProgress
   - Clear RouteUpdateState
2. If calculation fails during update:
   - Catch error in calculation
   - Display error message
   - Preserve original SavedRoute unchanged
   - Preserve original SavedRouteProgress unchanged
   - Clear RouteUpdateState
3. If progress preservation fails:
   - Log warning
   - Continue with update (route updates, progress may be lost)
   - Clear `completedBuildings` if mapping fails completely

### Cancelling an Update

1. User clicks cancel button during update
2. System sets RouteUpdateState `isCancelled: true`
3. Calculation checks cancellation flag and exits early
4. System preserves original SavedRoute unchanged
5. System preserves original SavedRouteProgress unchanged
6. System clears RouteUpdateState
7. System displays cancellation message

## Storage Schema

### localStorage Structure (Extended)

```javascript
{
  "cookieRouter:savedRoutes": [
    {
      "id": "saved-route-1737984000000-abc123",
      "name": "Fledgling Route",
      "categoryId": "predefined-fledgling",
      "categoryName": "Fledgling",
      "versionId": "v2048",
      "routeData": {
        "buildings": [...],  // Updated during route update
        "algorithm": "GPL",
        "lookahead": 1,
        "completionTime": 123.45,  // Recalculated
        "startingBuildings": {...}  // Updated from imported save game
      },
      "savedAt": 1737984000000,  // Preserved
      "lastAccessedAt": 1737985000000,  // Updated
      "lastUpdatedAt": 1737985000000  // New field, set on update
    }
  ],
  "cookieRouter:progress": {
    "saved-route-1737984000000-abc123": {
      "savedRouteId": "saved-route-1737984000000-abc123",
      "completedBuildings": [1, 2, 3],  // May be modified during update
      "lastUpdated": 1737985000000  // Updated when route is updated
    }
  },
  "cookieRouter:importedSaveGame": {
    // Existing imported save game data (from feature 003)
    "buildingCounts": {...},
    "version": "v2052",
    ...
  }
}
```

**Note**: RouteUpdateState is not stored in localStorage (memory-only).

## Migration Considerations

- Existing SavedRoute objects do not have `lastUpdatedAt` field - this is optional and added only when route is updated
- Existing SavedRouteProgress remains compatible - progress preservation logic handles both old and new progress structures
- No migration needed for existing data
- Backward compatible: existing features continue to work, routes without `lastUpdatedAt` are valid

## Data Integrity

- SavedRoute.id must remain unchanged during update (route identity preserved)
- SavedRoute.name must remain unchanged during update (route identity preserved)
- SavedRouteProgress.savedRouteId must reference existing SavedRoute
- RouteUpdateState.routeId must reference existing SavedRoute
- Only one RouteUpdateState can exist per route at a time (enforced by `isUpdating` flag)
- Updated routeData must be valid route structure
- Updated completedBuildings must reference valid step orders in updated route

## Progress Preservation Algorithm

When updating a route, progress is preserved using the following algorithm:

1. **Load old route and progress**: Get current SavedRoute.routeData.buildings and SavedRouteProgress.completedBuildings
2. **Calculate new route**: Recalculate route with imported save game data
3. **Map progress**:
   - For each completed building step in old route:
     - Find matching step in new route by:
         - Building name matches
         - Relative position is similar (within tolerance, e.g., ±2 positions)
     - If match found: Add new step order to preserved progress
     - If no match found: Skip (progress lost for this step)
4. **Update progress**: Set SavedRouteProgress.completedBuildings to mapped progress array
5. **Validate**: Ensure all preserved step orders exist in new route

**Example**:
- Old route: [Cursor, Grandma, Farm, Mine, Factory]
- Completed: [1, 2, 3] (first 3 buildings)
- New route: [Cursor, Grandma, Farm, Mine, Factory, Shipment] (added Shipment at end)
- Preserved: [1, 2, 3] (same steps, same positions)

**Example with changes**:
- Old route: [Cursor, Grandma, Farm]
- Completed: [1, 2, 3]
- New route: [Cursor, Farm, Grandma] (order changed)
- Preserved: [1] (only Cursor matches at position 1)
- Lost: [2, 3] (Grandma and Farm moved, don't match positions)

