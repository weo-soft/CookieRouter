# Quickstart Guide: Saved Routes Feature

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Prerequisites

- Existing Cookie Clicker Building Order Simulator feature (001) must be implemented
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for version control)

## Initial Setup

### 1. Ensure Base Feature is Working

Verify that the base simulator (feature 001) is functional:

```bash
npm install
npm run dev
```

Navigate to the application and verify you can:
- Select categories
- Calculate routes
- Track progress

### 2. Checkout Feature Branch

```bash
git checkout 002-saved-routes
```

## Development Workflow

### Running Tests

```bash
# Run all tests (including new saved routes tests)
npm test

# Run only saved routes tests
npm test -- saved-routes

# Run tests in watch mode
npm test -- --watch
```

### Testing Saved Routes Functionality

1. **Save a Route**:
   - Calculate a route for any category
   - Click "Save Route" button
   - Enter a name (or use default)
   - Verify route appears in saved routes list
   - Verify success message appears

2. **Access Saved Route**:
   - Open saved routes list (displayed above route section)
   - Click "Load" button or click on a saved route item
   - Verify route displays with all building steps
   - Verify progress checkboxes are preserved
   - Verify route shows "(Saved)" indicator

3. **Test Independent Progress**:
   - Save two routes
   - Check off buildings in Route A
   - Switch to Route B
   - Verify Route B's progress is unchanged
   - Switch back to Route A
   - Verify Route A's progress is preserved

4. **Rename Saved Route**:
   - Click the rename button (✎) on a saved route
   - Edit the name inline
   - Press Enter or click the save button (✓)
   - Verify the new name appears in the list

5. **Delete Saved Route**:
   - Click the delete button (×) on a saved route
   - Confirm deletion
   - Verify route is removed from list
   - Verify associated progress is also deleted

## Project Structure (New Files)

```
src/
├── js/
│   ├── storage.js              # Extended with saved route operations
│   └── ui/
│       ├── saved-routes-list.js    # New: Display and manage saved routes
│       ├── save-route-dialog.js    # New: Dialog for saving routes
│       └── route-display.js        # Extended: Add "Save Route" button

tests/
├── unit/
│   └── saved-routes.test.js        # New: Test saved route storage
└── integration/
    └── saved-routes-workflow.test.js  # New: Test save/access workflow
```

## Key Files to Understand

1. **`src/js/storage.js`**: Extended with `getSavedRoutes()`, `saveSavedRoute()`, `deleteSavedRoute()`, `updateSavedRouteName()`
2. **`src/js/ui/saved-routes-list.js`**: New component for displaying and managing saved routes
3. **`src/js/ui/save-route-dialog.js`**: New component for saving routes with custom names
4. **`src/js/ui/route-display.js`**: Extended with "Save Route" button

## Common Tasks

### Testing Saved Route Storage

```javascript
// In browser console or test
import { getSavedRoutes, saveSavedRoute } from './js/storage.js';

// Save a test route
const savedRoute = {
  id: 'saved-route-test-1',
  name: 'Test Route',
  categoryId: 'predefined-fledgling',
  categoryName: 'Fledgling',
  versionId: 'v2048',
  routeData: {
    buildings: [...],
    algorithm: 'GPL',
    lookahead: 1,
    completionTime: 123.45,
    startingBuildings: {}
  },
  savedAt: Date.now(),
  lastAccessedAt: Date.now()
};
saveSavedRoute(savedRoute);

// Retrieve it
const savedRoutes = getSavedRoutes();
console.log(savedRoutes);
```

### Testing Progress Independence

```javascript
// Save two routes
const route1 = { id: 'route-1', ... };
const route2 = { id: 'route-2', ... };
saveSavedRoute(route1);
saveSavedRoute(route2);

// Update progress for route 1
updateProgress('route-1', [1, 2, 3]);

// Verify route 2 progress is unchanged
const progress2 = getProgress('route-2');
console.log(progress2); // Should be null or empty
```

### Debugging Saved Routes

1. Open browser DevTools
2. Check localStorage:
   ```javascript
   // View all saved routes
   JSON.parse(localStorage.getItem('cookieRouter:savedRoutes'))
   
   // View saved route progress
   JSON.parse(localStorage.getItem('cookieRouter:progress'))
   ```
3. Set breakpoints in `saved-routes-list.js` or `save-route-dialog.js`
4. Use `console.log()` to inspect saved route data

## Troubleshooting

### Saved Route Not Appearing in List

- Check localStorage: `localStorage.getItem('cookieRouter:savedRoutes')`
- Verify route was saved successfully (check for errors in console)
- Ensure saved routes list component is initialized
- Check that route ID is valid

### Progress Not Preserved

- Verify progress is keyed by saved route ID (not calculated route ID)
- Check `cookieRouter:progress` in localStorage
- Ensure progress is loaded when saved route is accessed
- Verify `updateLastAccessed()` is called when route is opened

### Duplicate Names Allowed

- This is by design - duplicate names are allowed
- Users can rename routes if they want uniqueness
- Consider adding visual indicator if multiple routes share same name

### localStorage Quota Exceeded

- Delete old saved routes
- Check storage usage: `console.log(JSON.stringify(localStorage).length)`
- Implement cleanup of old routes
- Show user-friendly error message suggesting deletion

### Route Data Mismatch

- Verify route data is complete snapshot when saved
- Check that `routeData` includes all required fields
- Ensure route data is immutable (not modified after save)

## Integration with Existing Features

### Route Display Integration

The route display component has been extended with:
1. "Save Route" button (only shown for calculated routes, not saved routes)
2. Support for displaying both calculated and saved routes
3. Progress tracking that works for both route types

### Main Application Integration

The main application now:
1. Initializes saved routes list component on startup
2. Handles route save events and refreshes saved routes list
3. Handles saved route selection and updates route display
4. Maintains separate progress tracking for each saved route

## Next Steps

1. Review [data-model.md](./data-model.md) for SavedRoute entity structure
2. Review [contracts/storage.md](./contracts/storage.md) for storage operations
3. Review [plan.md](./plan.md) for implementation details
4. Start with User Story 1 (P1): Save Calculated Route

## Resources

- [MDN localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- Existing storage utilities: `src/js/storage.js`
- Existing UI patterns: `src/js/ui/category-selector.js`, `src/js/ui/route-display.js`

