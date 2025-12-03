# Page Initialization Contract: Route Wizard Workflow

**Date**: 2025-01-27  
**Feature**: [spec.md](../spec.md)

## Overview

This contract defines the interface for page state detection and conditional component initialization based on whether saved routes exist. The main application entry point (`main.js`) must detect page state and initialize components accordingly.

## Namespace

All page initialization logic is in `src/main.js`. State detection uses `getSavedRoutes()` from `src/js/storage.js`.

## Page State Detection

### `detectPageState(): PageState`

Determines the current page state based on saved routes in storage.

**Returns**: PageState object with `hasSavedRoutes` boolean

**Implementation**:
```javascript
function detectPageState() {
  const savedRoutes = getSavedRoutes();
  return {
    hasSavedRoutes: savedRoutes.length > 0
  };
}
```

**Behavior**:
- Calls `getSavedRoutes()` synchronously
- Returns `{ hasSavedRoutes: false }` if `getSavedRoutes()` returns empty array (including on errors)
- Returns `{ hasSavedRoutes: true }` if any saved routes exist
- Must be called during application initialization

**Errors**: 
- Handled by `getSavedRoutes()` (returns [] on error)
- Never throws - always returns valid PageState

---

## Component Initialization

### `initializeComponents(pageState: PageState): void`

Initializes UI components based on detected page state.

**Parameters**:
- `pageState` (PageState, required): Current page state from `detectPageState()`

**Returns**: void

**Behavior**:
- Always initializes: `RouteCreationWizard`, `RouteDisplay`
- Conditionally initializes: `SavedRoutesList` (only if `pageState.hasSavedRoutes === true` or after first route save)
- Never initializes in main.js: `CategorySelector`, `CustomCategoryForm`, `StartingBuildingsSelector` (only in wizard)

**Component Initialization Rules**:

| Component | Initialize When | Notes |
|-----------|----------------|-------|
| `RouteCreationWizard` | Always | Available in both states |
| `RouteDisplay` | Always | Needed to display routes |
| `SavedRoutesList` | `hasSavedRoutes === true` | Only if routes exist |
| `CategorySelector` | Never (in main.js) | Only in wizard |
| `CustomCategoryForm` | Never (in main.js) | Only in wizard |
| `StartingBuildingsSelector` | Never (in main.js) | Only in wizard |

**Errors**:
- Component initialization errors should be caught and logged
- Application should continue initialization even if one component fails

---

## State Transition Handling

### `updatePageStateAfterRouteSave(): void`

Re-evaluates page state after a route is saved and updates UI if state changed.

**Returns**: void

**Behavior**:
1. Calls `detectPageState()` to get current state
2. If `hasSavedRoutes` changed from `false` to `true`:
   - Initialize `SavedRoutesList` if not already initialized
   - Update UI to show returning user experience (saved routes choice)
3. If state unchanged, no action needed

**When Called**:
- After `handleWizardComplete()` when first route is saved
- After any route save operation that might change state

**Errors**:
- Should handle gracefully - if state detection fails, maintain current UI state
- Log errors to console for debugging

---

## HTML Structure Requirements

### Required Containers

The following containers MUST exist in `src/index.html`:

- `#route-creation-wizard-section` - Wizard modal container (always present)
- `#route-section` - Route display container (always present)
- `#saved-routes-section` - Saved routes list container (conditionally used)

### Removed Containers

The following containers MUST be removed from `src/index.html`:

- `#category-section` - Category selector (only in wizard)
- `#custom-category-section` - Custom category form (only in wizard)
- `#starting-buildings-section` - Starting buildings selector (only in wizard)

**Rationale**: These components are only instantiated within the wizard's dynamic DOM structure, not on the main page.

---

## Integration Points

### Storage Integration

- Uses `getSavedRoutes()` from `src/js/storage.js`
- Uses `saveSavedRoute()` from `src/js/storage.js` (via wizard)
- No modifications to storage contract required

### Wizard Integration

- `RouteCreationWizard` creates its own DOM containers for wizard steps
- Wizard internally uses `CategorySelector`, `CustomCategoryForm`, `StartingBuildingsSelector`
- No changes to wizard contract required

### Component Lifecycle

1. **Initialization**: `init()` function in `main.js`
   - Detect page state
   - Initialize components conditionally
   - Render appropriate UI

2. **After Route Save**: `handleWizardComplete()` callback
   - Save route (via wizard)
   - Update page state
   - Refresh UI if state changed

3. **Error Recovery**: All errors default to first-time user experience
   - Safe fallback state
   - User can still access wizard

---

## Performance Requirements

- Page state detection: < 100ms (synchronous localStorage read)
- Component initialization: < 500ms per component
- Total page load: < 2 seconds (per SC-001, SC-002)

---

## Testing Requirements

### Unit Tests

- `detectPageState()` with empty saved routes
- `detectPageState()` with existing saved routes
- `detectPageState()` with localStorage errors
- `initializeComponents()` with different page states

### Integration Tests

- First-time user flow (no saved routes)
- Returning user flow (with saved routes)
- State transition after first route save
- Error handling (localStorage unavailable)

### E2E Tests

- Complete first-time user journey
- Complete returning user journey
- Verify components not visible outside wizard









