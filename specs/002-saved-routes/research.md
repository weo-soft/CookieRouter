# Research: Saved Routes Feature

**Feature**: 002-saved-routes  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Research Questions

### 1. localStorage Structure for Saved Routes

**Question**: How should saved routes be stored in localStorage to maintain separation from existing route storage while enabling efficient access?

**Decision**: Extend existing storage pattern with new key `cookieRouter:savedRoutes` as a JSON array. Each saved route will include:
- Unique ID (generated on save)
- User-provided name
- Full route data (copy of calculated route)
- Category reference (ID)
- Metadata (save timestamp, last accessed timestamp)
- Associated progress data (linked by route ID)

**Rationale**: 
- Follows existing pattern (`cookieRouter:categories`, `cookieRouter:routes`, `cookieRouter:progress`)
- Allows efficient querying and filtering
- Maintains separation from temporary calculated routes
- Enables easy migration if needed

**Alternatives Considered**:
- Store as part of existing routes array with flag: Rejected - would mix temporary and saved routes
- Use IndexedDB: Rejected - overkill for this use case, localStorage is sufficient
- Separate storage per saved route: Rejected - inefficient for listing and management

### 2. Progress Tracking Per Saved Route

**Question**: How should progress be tracked independently for each saved route?

**Decision**: Extend existing progress storage to use saved route ID as the key. Progress data structure remains the same (`completedBuildings` array), but is keyed by saved route ID instead of calculated route ID.

**Rationale**:
- Reuses existing progress tracking infrastructure
- Maintains one-to-one relationship (one progress per saved route)
- Clear separation between saved routes and their progress
- Backward compatible with existing progress storage

**Alternatives Considered**:
- Embed progress in saved route object: Rejected - violates separation of concerns, makes updates more complex
- Use separate progress storage with route ID mapping: Rejected - adds unnecessary complexity

### 3. Name Collision Handling

**Question**: How should duplicate route names be handled?

**Decision**: Allow duplicate names but generate unique IDs. Display names as-is in the list. If user wants uniqueness, they can rename manually. Optionally show a subtle indicator if multiple routes share the same name.

**Rationale**:
- Users may intentionally want multiple routes with same name (e.g., "Fledgling v1", "Fledgling v2")
- Simpler UX - no blocking validation
- Users can rename if they want uniqueness
- Less friction in save workflow

**Alternatives Considered**:
- Enforce unique names: Rejected - adds friction, may not be desired
- Auto-append number to duplicates: Rejected - can be confusing, better to let user control
- Warn but allow duplicates: Considered but rejected - adds complexity for minimal benefit

### 4. UI Pattern for Saved Routes List

**Question**: What UI pattern should be used for displaying and managing saved routes?

**Decision**: Use a list/card-based UI similar to category selector, with each saved route showing:
- Route name (editable inline or via dialog)
- Category name
- Save date / Last accessed date
- Progress indicator (X/Y buildings completed)
- Actions: Open, Rename, Delete

**Rationale**:
- Consistent with existing category selector UI
- Familiar pattern for users
- Supports all required operations (view, rename, delete)
- Scales well to 10-50 items

**Alternatives Considered**:
- Table view: Rejected - less mobile-friendly, more complex
- Dropdown selector: Rejected - doesn't support management operations well
- Modal dialog: Rejected - too heavy for frequent access

### 5. Default Route Naming

**Question**: What should be the default name when user doesn't provide one?

**Decision**: Generate default name as "{Category Name} - {Timestamp}" format, e.g., "Fledgling - 2025-01-27 14:30". User can rename immediately after save if desired.

**Rationale**:
- Provides meaningful default that identifies the route
- Timestamp ensures uniqueness
- Category name provides context
- User can easily rename if needed

**Alternatives Considered**:
- Just timestamp: Rejected - less meaningful
- Just category name: Rejected - not unique, confusing with multiple saves
- Sequential numbering: Rejected - complex to track, timestamp is simpler

### 6. Route Data Immutability

**Question**: Should saved routes be immutable snapshots or reference live category data?

**Decision**: Saved routes are immutable snapshots. All route calculation data (buildings, costs, times) is stored in the saved route object. Changes to category definitions or game versions do not affect saved routes.

**Rationale**:
- Preserves route as calculated at save time
- User expectations: saved route should remain as it was
- Avoids breaking saved routes when categories change
- Simpler implementation (no versioning or migration needed)

**Alternatives Considered**:
- Reference category with version: Rejected - adds complexity, breaks if category deleted
- Recalculate on access: Rejected - defeats purpose of saving, may produce different results

### 7. Storage Limits and Cleanup

**Question**: Should there be limits on number of saved routes or automatic cleanup?

**Decision**: No hard limit initially. Monitor localStorage usage. If storage quota exceeded, show clear error message suggesting deletion of old routes. Consider soft limit (e.g., 50 routes) with warning if approaching.

**Rationale**:
- Typical usage (10-50 routes) well within localStorage limits
- Hard limits add friction
- User should control what to keep
- Can add limits later if needed based on usage data

**Alternatives Considered**:
- Hard limit (e.g., 20 routes): Rejected - too restrictive, may frustrate users
- Automatic cleanup of old routes: Rejected - user may want to keep old routes
- Compression: Rejected - premature optimization, localStorage sufficient

## Technical Decisions Summary

1. **Storage**: New localStorage key `cookieRouter:savedRoutes` as JSON array
2. **Progress**: Extend existing progress storage, keyed by saved route ID
3. **Naming**: Allow duplicates, generate defaults with category name + timestamp
4. **UI**: Card-based list similar to category selector
5. **Data**: Immutable snapshots of route calculations
6. **Limits**: No hard limits, handle quota errors gracefully

## Dependencies

- Existing storage utilities (`src/js/storage.js`)
- Existing route display component (`src/js/ui/route-display.js`)
- Existing UI patterns and styles
- localStorage API (browser native)

## Integration Points

- Extend `storage.js` with saved route CRUD operations
- Add "Save Route" button to `route-display.js`
- Create new `saved-routes-list.js` component
- Create new `save-route-dialog.js` component
- Update main application to include saved routes UI

