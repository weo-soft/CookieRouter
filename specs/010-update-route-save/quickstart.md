# Quickstart: Update Route from Save Game

**Feature**: 010-update-route-save  
**Date**: 2025-01-27

## Overview

This feature allows users to update an existing saved route by importing their current save game data and triggering a recalculation. The route is recalculated using the imported game state as the new starting point, while preserving the route's identity, name, and progress tracking.

## Prerequisites

- Feature 002-saved-routes: Saved routes functionality must be implemented
- Feature 003-import-save-games: Save game import functionality must be implemented
- Existing route calculation infrastructure (`calculateRoute` function)

## Quick Implementation Guide

### 1. Extend Storage Functions

Add route update function to `src/js/storage.js`:

```javascript
/**
 * Updates a saved route by recalculating it with imported save game data
 * @param {string} savedRouteId - ID of route to update
 * @param {Object} importedSaveGame - Imported save game data
 * @param {Object} options - Update options (onProgress, preserveProgress, etc.)
 * @returns {Promise<Object>} Update result with success status and updated route
 */
export async function updateSavedRoute(savedRouteId, importedSaveGame, options = {}) {
  // Implementation: validate, recalculate, preserve progress, update storage
}
```

### 2. Create Progress Preservation Utility

Create `src/js/utils/route-update.js`:

```javascript
/**
 * Preserves progress from old route structure to new route structure
 * @param {Object} oldRoute - Original route before update
 * @param {Object} newRoute - Updated route after recalculation
 * @param {number[]} oldProgress - Completed step orders from old route
 * @returns {number[]} Preserved step orders from new route
 */
export function preserveRouteProgress(oldRoute, newRoute, oldProgress) {
  // Implementation: map old steps to new steps by building name and position
}
```

### 3. Extend Route Display UI

Add "Update Route" button to `src/js/ui/route-display.js`:

```javascript
// Show update button when:
// 1. Viewing a saved route
// 2. Save game is imported
// 3. No update in progress

if (this.isSavedRoute && getImportedSaveGame()) {
  this.renderUpdateButton();
}
```

### 4. Add Update State Management

Track update state in memory (not persisted):

```javascript
// In route-update.js or similar
const updateStates = new Map(); // routeId -> RouteUpdateState

export function getRouteUpdateState(routeId) {
  return updateStates.get(routeId) || null;
}

export function setRouteUpdateState(routeId, state) {
  updateStates.set(routeId, state);
}
```

### 5. Wire Up Update Flow

In route display component:

```javascript
async handleUpdateRoute() {
  const importedSave = getImportedSaveGame();
  if (!importedSave) {
    showError('No save game imported');
    return;
  }

  // Validate
  const validation = validateRouteUpdate(this.currentRoute, importedSave);
  if (!validation.isValid) {
    showErrors(validation.errors);
    return;
  }

  // Show progress indicator
  this.setUpdating(true);

  try {
    // Update route
    const result = await updateSavedRoute(this.currentRoute.id, importedSave, {
      onProgress: (progress) => this.updateProgressIndicator(progress),
      preserveProgress: true
    });

    if (result.success) {
      // Reload route display
      await this.displayRoute(result.updatedRoute, true);
      showSuccess('Route updated successfully');
    } else {
      showError(result.error.message);
    }
  } finally {
    this.setUpdating(false);
  }
}
```

## Key Implementation Points

### Progress Preservation

- Map old route building steps to new route building steps
- Match by building name and relative position (within ±2 positions)
- Preserve completed status for matching steps
- Clear progress for steps that no longer exist

### Version Compatibility

- Check route version vs imported save game version
- Warn user if versions differ but are compatible
- Prevent update if versions are incompatible
- Use imported version for recalculation if compatible

### Error Handling

- Validate imported save game before starting update
- Preserve original route if update fails
- Display clear error messages
- Handle cancellation gracefully

### UI Feedback

- Show "Update Route" button when conditions are met
- Display progress indicator during recalculation
- Show success/error messages
- Allow cancellation of long-running updates

## Testing Checklist

- [ ] Update route with matching version save game
- [ ] Update route with compatible but different version
- [ ] Prevent update with incompatible version
- [ ] Preserve progress for matching building steps
- [ ] Clear progress for removed building steps
- [ ] Handle calculation errors gracefully
- [ ] Preserve route identity (name, ID) after update
- [ ] Update metadata (lastUpdatedAt, lastAccessedAt)
- [ ] Cancel in-progress update
- [ ] Prevent concurrent updates

## Integration Points

- **storage.js**: Extend with `updateSavedRoute` function
- **simulation.js**: Reuse `calculateRoute` for recalculation
- **save-game-importer.js**: Use `getImportedSaveGame` for imported data
- **route-display.js**: Add update UI and handlers
- **route-update.js**: New utility for progress preservation and validation

## Common Pitfalls

1. **Not preserving route identity**: Ensure `id` and `name` remain unchanged
2. **Losing progress**: Always map progress from old to new route structure
3. **Version mismatches**: Validate version compatibility before update
4. **Concurrent updates**: Use update state flag to prevent concurrent updates
5. **Error recovery**: Always preserve original route if update fails

## Next Steps

After implementing core update functionality:
1. Add update status indicators to saved routes list
2. Add bulk update capabilities (if needed)
3. Add update history tracking (optional)
4. Optimize progress preservation algorithm for large routes

