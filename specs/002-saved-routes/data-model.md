# Data Model: Saved Routes

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Entities

### SavedRoute

Represents a user-saved route instance that can be accessed later with independent progress tracking.

**Fields**:
- `id` (string, required): Unique identifier for the saved route (generated on save, format: `saved-route-{timestamp}-{random}`)
- `name` (string, required): User-provided name for the route (or auto-generated default)
- `categoryId` (string, required): ID of the category this route was calculated for
- `categoryName` (string, required): Display name of the category (snapshot at save time)
- `versionId` (string, required): Game version ID used for calculation (e.g., "v2048", "v2052")
- `routeData` (object, required): Complete route calculation data (immutable snapshot)
  - `buildings` (array): Ordered list of building purchase steps (same structure as Route.buildings)
  - `algorithm` (string): Algorithm used ("GPL" or "DFS")
  - `lookahead` (number): Lookahead depth if applicable
  - `completionTime` (number): Total time to reach target in seconds
  - `startingBuildings` (object): Starting buildings used for calculation
- `savedAt` (number, required): Timestamp when route was saved (milliseconds since epoch)
- `lastAccessedAt` (number, required): Timestamp when route was last opened (milliseconds since epoch)
- `createdAt` (number, optional): Timestamp when route was created (for compatibility, same as savedAt if not provided)

**Validation Rules**:
- `name` must be non-empty string, max 100 characters
- `categoryId` must reference a valid category (may be predefined or custom)
- `versionId` must be a valid game version identifier
- `routeData` must contain valid route structure with non-empty buildings array
- `savedAt` and `lastAccessedAt` must be valid timestamps

**Storage**: Stored in localStorage under key `cookieRouter:savedRoutes` as JSON array

**Relationships**:
- SavedRoute references one Category (many-to-one via categoryId)
- SavedRoute has one SavedRouteProgress (one-to-one via id)
- SavedRoute is independent of Route (saved routes are snapshots, not references)

### SavedRouteProgress

Represents progress tracking data for a specific saved route. Extends the existing Progress entity pattern.

**Fields**:
- `savedRouteId` (string, required): ID of the saved route this progress belongs to
- `completedBuildings` (array, required): Array of building step orders that have been checked off
- `lastUpdated` (number, required): Timestamp when progress was last updated

**Validation Rules**:
- `savedRouteId` must reference a valid saved route
- `completedBuildings` must be array of positive integers
- Each value in `completedBuildings` must correspond to a valid step order in the saved route
- Values in `completedBuildings` should be unique

**Storage**: Stored in localStorage under key `cookieRouter:progress` as JSON object with savedRouteId as keys (same storage as existing progress, but keyed by saved route ID)

**Relationships**:
- SavedRouteProgress belongs to one SavedRoute (one-to-one via savedRouteId)

## Data Flow

### Saving a Route

1. User calculates a route (existing flow)
2. User clicks "Save Route" button
3. System prompts for route name (or uses default)
4. System creates SavedRoute object with:
   - Generated unique ID
   - User-provided or default name
   - Category reference (ID and name snapshot)
   - Version ID snapshot
   - Complete route data copy
   - Current timestamp as savedAt and lastAccessedAt
5. System saves to localStorage under `cookieRouter:savedRoutes`
6. System creates initial SavedRouteProgress (empty completedBuildings array)
7. System displays confirmation

### Accessing a Saved Route

1. User views saved routes list
2. User selects a saved route
3. System loads SavedRoute from localStorage
4. System loads SavedRouteProgress for that route
5. System updates lastAccessedAt timestamp
6. System displays route with progress checkboxes populated
7. System saves updated lastAccessedAt

### Updating Progress

1. User checks/unchecks building in saved route
2. System updates SavedRouteProgress.completedBuildings
3. System updates SavedRouteProgress.lastUpdated
4. System saves progress to localStorage
5. System updates UI to reflect changes

### Deleting a Saved Route

1. User initiates delete action
2. System confirms deletion
3. System removes SavedRoute from `cookieRouter:savedRoutes` array
4. System removes SavedRouteProgress from `cookieRouter:progress` object
5. System updates saved routes list

## Storage Schema

### localStorage Structure

```javascript
{
  "cookieRouter:savedRoutes": [
    {
      "id": "saved-route-1737984000000-abc123",
      "name": "Fledgling - 2025-01-27 14:30",
      "categoryId": "predefined-fledgling",
      "categoryName": "Fledgling",
      "versionId": "v2048",
      "routeData": {
        "buildings": [...],
        "algorithm": "GPL",
        "lookahead": 1,
        "completionTime": 123.45,
        "startingBuildings": {}
      },
      "savedAt": 1737984000000,
      "lastAccessedAt": 1737984000000
    }
  ],
  "cookieRouter:progress": {
    "saved-route-1737984000000-abc123": {
      "savedRouteId": "saved-route-1737984000000-abc123",
      "completedBuildings": [1, 2, 3],
      "lastUpdated": 1737984100000
    }
  }
}
```

## Migration Considerations

- Existing routes and progress remain unchanged
- Saved routes are separate from calculated routes
- No migration needed for existing data
- Backward compatible: existing features continue to work

## Data Integrity

- SavedRoute.id must be unique within savedRoutes array
- SavedRouteProgress.savedRouteId must reference existing SavedRoute
- Deleting SavedRoute must also delete associated SavedRouteProgress
- SavedRoute.routeData is immutable (never modified after save)

