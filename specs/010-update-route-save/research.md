# Research: Update Route from Save Game

**Feature**: 010-update-route-save  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Research Questions

### 1. Progress Preservation Strategy

**Question**: How should progress (completed buildings) be preserved when a route is updated and the building sequence changes?

**Decision**: Use a mapping strategy that preserves progress for building steps that remain valid:
- Map old route building steps to new route building steps by matching building name and purchase order
- For steps that match (same building at same relative position), preserve the completed status
- For steps that no longer exist in the updated route, clear the progress (remove from completedBuildings array)
- For new steps in the updated route, start with uncompleted status

**Rationale**: 
- Provides best user experience by preserving progress where possible
- Clear and predictable behavior (users understand that matching steps keep progress)
- Handles route structure changes gracefully
- Simple to implement (compare building names and positions)

**Alternatives Considered**:
- Clear all progress on update: Rejected - too disruptive, users lose all progress
- Preserve by building name only (ignore position): Rejected - may preserve wrong steps if route structure changes significantly
- Ask user to confirm progress clearing: Rejected - adds friction, automatic handling is better
- Mark obsolete progress separately: Considered but rejected - adds complexity, clearing is simpler

### 2. Version Compatibility Handling

**Question**: How should version differences between saved routes and imported save games be handled?

**Decision**: Use a compatibility strategy with user notification:
- If imported save game version matches route version: Proceed with update
- If versions differ but are compatible (e.g., v2048 and v2052): Warn user but allow update, use imported save game version for recalculation
- If versions are incompatible: Prevent update, display clear error message explaining version mismatch
- Version compatibility matrix: v2031, v2048, v10466, v10466_xmas, v2052 are all compatible (same building structure)

**Rationale**:
- Prevents data corruption from incompatible versions
- Provides flexibility for compatible versions
- Clear user feedback prevents confusion
- Matches existing save game import behavior

**Alternatives Considered**:
- Always prevent version mismatches: Rejected - too restrictive, compatible versions should work
- Always allow version mismatches: Rejected - may cause issues with incompatible versions
- Auto-convert versions: Rejected - complex, error-prone, better to recalculate with correct version

### 3. Concurrent Update Prevention

**Question**: How should concurrent route updates be prevented?

**Decision**: Use a simple in-memory flag per route:
- Track update state in RouteUpdateState object keyed by route ID
- Set `isUpdating: true` when update starts, `isUpdating: false` when complete
- Disable update button/action while `isUpdating` is true
- Show loading indicator during update
- Allow cancellation via cancel button that sets `isUpdating: false` and stops calculation

**Rationale**:
- Simple and effective for single-user application
- No need for complex locking mechanisms
- Prevents race conditions and duplicate calculations
- Provides clear user feedback

**Alternatives Considered**:
- Queue multiple updates: Rejected - unnecessary complexity for single-user app
- Use Web Workers for isolation: Rejected - adds complexity, in-memory flag sufficient
- Database-level locking: Rejected - no database, localStorage doesn't support locking

### 4. Update Trigger UI Pattern

**Question**: What UI pattern should be used to trigger route updates?

**Decision**: Use a two-step pattern:
1. User imports save game data (existing import dialog)
2. When viewing a saved route with imported save game available, show "Update Route" button/action
3. Button triggers update confirmation dialog (optional) or directly starts update
4. Show progress indicator during recalculation
5. Display success/error message when complete

**Rationale**:
- Reuses existing save game import infrastructure
- Clear and discoverable (button appears when conditions are met)
- Consistent with existing UI patterns
- Provides feedback at each step

**Alternatives Considered**:
- Auto-update on import: Rejected - too aggressive, user should control when to update
- Separate update dialog: Considered but rejected - adds extra step, button is simpler
- Context menu option: Rejected - less discoverable than button

### 5. Route Metadata Updates

**Question**: What metadata should be updated when a route is successfully updated?

**Decision**: Update minimal metadata to preserve route identity:
- Update `lastAccessedAt` timestamp (user is viewing/updating the route)
- Add `lastUpdatedAt` timestamp (new field) to track when route was last recalculated
- Preserve `savedAt` timestamp (original save time)
- Preserve `name`, `id`, `categoryId`, `categoryName`, `versionId` (route identity)
- Update `routeData` with new calculation results

**Rationale**:
- Preserves route identity (name, ID, category) as required
- Tracks update history with `lastUpdatedAt`
- Maintains original save timestamp for reference
- Minimal changes reduce risk of breaking existing functionality

**Alternatives Considered**:
- Update `savedAt` timestamp: Rejected - loses original save time information
- Create new route instead of updating: Rejected - violates requirement to preserve route identity
- Update `versionId` to match imported save: Considered but rejected - preserves original version context

### 6. Error Handling and Recovery

**Question**: How should errors during route update be handled?

**Decision**: Use fail-safe error handling:
- Validate imported save game data before starting update
- If validation fails: Display error, do not start update, preserve original route
- If calculation fails: Catch error, display error message, preserve original route unchanged
- If progress preservation fails: Log warning but continue update (progress may be lost but route updates)
- Always preserve original route if update fails (atomic operation)

**Rationale**:
- Prevents data loss (original route always preserved)
- Clear error messages help users understand what went wrong
- Validation before update prevents wasted calculation time
- Graceful degradation (progress loss acceptable if route updates)

**Alternatives Considered**:
- Rollback on any error: Rejected - adds complexity, original route already preserved
- Partial updates: Rejected - may leave route in inconsistent state
- Retry mechanism: Rejected - errors likely indicate real problems, retry won't help

### 7. Update Cancellation

**Question**: How should users cancel an in-progress route update?

**Decision**: Provide cancellation via cancel button:
- Show cancel button alongside progress indicator during update
- Cancel button sets update state to cancelled and stops calculation
- Calculation function checks cancellation flag periodically and exits early
- On cancellation: Preserve original route, clear update state, show cancellation message
- Cancelled updates do not modify the route

**Rationale**:
- Gives users control over long-running calculations
- Prevents wasted computation if user changes mind
- Simple to implement (flag check in calculation loop)
- Clear user feedback

**Alternatives Considered**:
- No cancellation: Rejected - poor UX for long calculations
- Force stop (kill calculation): Rejected - may leave state inconsistent, graceful cancellation better
- Background calculation: Rejected - adds complexity, cancellation sufficient

## Technical Decisions Summary

1. **Progress Preservation**: Map old steps to new steps by building name and position, clear unmatched steps
2. **Version Compatibility**: Warn on version differences, prevent incompatible versions, allow compatible versions
3. **Concurrency**: In-memory flag per route prevents concurrent updates
4. **UI Pattern**: "Update Route" button appears when save game imported, triggers update with progress feedback
5. **Metadata**: Update `lastUpdatedAt` and `lastAccessedAt`, preserve all identity fields
6. **Error Handling**: Validate before update, preserve original route on failure, clear error messages
7. **Cancellation**: Cancel button stops calculation gracefully, preserves original route

## Dependencies

- Existing `calculateRoute` function from `simulation.js` (reuse for recalculation)
- Existing `save-game-importer.js` (import functionality)
- Existing `storage.js` (extend with update operations)
- Existing `route-display.js` (extend with update UI)
- Existing progress tracking infrastructure

## Integration Points

- Extend `storage.js` with `updateSavedRoute(savedRouteId, newRouteData)` function
- Extend `route-display.js` to show "Update Route" button when save game imported
- Create `utils/route-update.js` with progress preservation logic
- Extend `save-game-import-dialog.js` to optionally trigger route update
- Update `saved-routes-list.js` to show update status/metadata
- Reuse `calculateRoute` from `simulation.js` for recalculation

## Open Questions Resolved

All technical questions resolved. No NEEDS CLARIFICATION items remain.

