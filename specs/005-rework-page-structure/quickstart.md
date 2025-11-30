# Quickstart: Rework Page Structure for Route Wizard Workflow

**Feature**: 005-rework-page-structure  
**Date**: 2025-01-27

## Overview

This feature reworks the main page structure to accommodate a wizard-centric workflow. The page detects whether users have saved routes and presents different interfaces: first-time users see a wizard prompt, while returning users see a choice between loading existing routes or creating new ones.

## Key Changes

### 1. Page State Detection

The application now detects page state on load:

```javascript
// In main.js init()
const pageState = detectPageState();
// pageState.hasSavedRoutes = true/false
```

### 2. Conditional Component Initialization

Components are initialized based on page state:

- **Always initialized**: `RouteCreationWizard`, `RouteDisplay`
- **Conditionally initialized**: `SavedRoutesList` (only if saved routes exist)
- **Never initialized in main.js**: `CategorySelector`, `CustomCategoryForm`, `StartingBuildingsSelector` (only in wizard)

### 3. HTML Structure Updates

**Removed from `index.html`**:
- `#category-section`
- `#custom-category-section`
- `#starting-buildings-section`

**Kept in `index.html`**:
- `#route-creation-wizard-section`
- `#route-section`
- `#saved-routes-section`

## Implementation Steps

### Step 1: Add Page State Detection

```javascript
// In main.js
function detectPageState() {
  const savedRoutes = getSavedRoutes();
  return {
    hasSavedRoutes: savedRoutes.length > 0
  };
}
```

### Step 2: Update Component Initialization

```javascript
// In main.js init()
const pageState = detectPageState();

// Always initialize
const routeCreationWizard = new RouteCreationWizard(...);
const routeDisplay = new RouteDisplay(...);

// Conditionally initialize
if (pageState.hasSavedRoutes) {
  const savedRoutesList = new SavedRoutesList(...);
  savedRoutesList.init();
}
```

### Step 3: Remove Unused HTML Containers

Remove from `src/index.html`:
```html
<!-- Remove these -->
<div id="category-section"></div>
<div id="custom-category-section"></div>
<div id="starting-buildings-section"></div>
```

### Step 4: Update State After Route Save

```javascript
// In handleWizardComplete()
function handleWizardComplete(route, category, versionId) {
  // ... existing route save logic ...
  
  // Update page state if first route was saved
  const newPageState = detectPageState();
  if (newPageState.hasSavedRoutes && !pageState.hasSavedRoutes) {
    // Initialize saved routes list if not already
    if (!savedRoutesList) {
      savedRoutesList = new SavedRoutesList(...);
      savedRoutesList.init();
    }
    // Update UI to show returning user experience
    updateUIForReturningUser();
  }
}
```

## Testing

### Test First-Time User Flow

1. Clear localStorage (or use incognito)
2. Load application
3. Verify wizard prompt is shown
4. Verify category/starting buildings components are NOT visible
5. Complete wizard and save route
6. Verify UI updates to show saved routes

### Test Returning User Flow

1. Load application with existing saved routes
2. Verify choice between wizard and saved routes is shown
3. Verify category/starting buildings components are NOT visible
4. Test both paths: load existing route and create new route

### Test Error Handling

1. Simulate localStorage error (quota exceeded, unavailable)
2. Verify application defaults to first-time user experience
3. Verify no unhandled exceptions

## Files Modified

- `src/index.html` - Remove unused section containers
- `src/main.js` - Add page state detection and conditional initialization

## Files Not Modified

- `src/js/ui/route-creation-wizard.js` - No changes (wizard unchanged)
- `src/js/ui/category-selector.js` - No changes (only used in wizard)
- `src/js/ui/custom-category-form.js` - No changes (only used in wizard)
- `src/js/ui/starting-buildings.js` - No changes (only used in wizard)
- `src/js/storage.js` - No changes (uses existing functions)

## Dependencies

- No new dependencies required
- Uses existing `getSavedRoutes()` from `storage.js`
- Uses existing component classes (no modifications)

## Success Criteria

- ✅ Users with no saved routes see wizard prompt within 2 seconds
- ✅ Users with saved routes see choice within 2 seconds
- ✅ Category/starting buildings components only accessible in wizard
- ✅ Page structure updates after first route save
- ✅ localStorage errors handled gracefully

