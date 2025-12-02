# Data Model: Page Structure Rework

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Entities

### PageState

Represents the current state of the main page, determining which UI elements and workflows are available to the user.

**Fields**:
- `hasSavedRoutes` (boolean, required): Whether user has any saved routes in storage
  - `true`: Returning user with saved routes (show choice between wizard and existing routes)
  - `false`: First-time user with no saved routes (show wizard prompt)

**State Transitions**:
```
[Initial Load] 
  → Check getSavedRoutes().length
  → hasSavedRoutes = (length > 0)
  → Render appropriate UI

[After First Route Save]
  → Re-check getSavedRoutes().length
  → If changed from 0 to >0: Update hasSavedRoutes = true
  → Update UI to returning user experience
```

**Validation Rules**:
- `hasSavedRoutes` is derived from `getSavedRoutes().length > 0`
- State is re-evaluated after route save operations
- State defaults to `false` (first-time user) on any localStorage error

**Storage**: Not persisted - computed on each page load from `getSavedRoutes()`

**Relationships**:
- PageState depends on SavedRoutes collection (existing entity)
- PageState determines which components are initialized

---

### ComponentInitializationState

Tracks which UI components should be initialized based on current PageState.

**Fields**:
- `initializeWizard` (boolean, required): Always true - wizard available in both states
- `initializeSavedRoutesList` (boolean, required): True if hasSavedRoutes or after first route save
- `initializeRouteDisplay` (boolean, required): Always true - needed to display routes
- `initializeCategorySelector` (boolean, required): Always false - only in wizard
- `initializeCustomCategoryForm` (boolean, required): Always false - only in wizard
- `initializeStartingBuildingsSelector` (boolean, required): Always false - only in wizard

**Derived From**: PageState.hasSavedRoutes

**Validation Rules**:
- All boolean fields must be explicitly set (no undefined values)
- Component initialization follows PageState rules

**Storage**: Not persisted - computed during application initialization

**Relationships**:
- ComponentInitializationState derived from PageState

---

## Data Flow

### Page Load Flow

```
1. Application starts (main.js init())
2. Call getSavedRoutes() from storage.js
3. Determine PageState.hasSavedRoutes = (getSavedRoutes().length > 0)
4. Create ComponentInitializationState based on PageState
5. Conditionally instantiate components per ComponentInitializationState
6. Render appropriate UI (first-time prompt or saved routes choice)
```

### First Route Creation Flow

```
1. User completes wizard and saves first route
2. Route saved to localStorage via saveSavedRoute()
3. Re-check getSavedRoutes().length
4. If length > 0 (was 0 before):
   - Update PageState.hasSavedRoutes = true
   - Update ComponentInitializationState.initializeSavedRoutesList = true
   - Initialize SavedRoutesList component if not already
   - Update UI to show returning user experience
```

### Error Handling Flow

```
1. getSavedRoutes() called
2. If localStorage error occurs:
   - getSavedRoutes() catches error and returns []
   - PageState.hasSavedRoutes = false (safe default)
   - Application continues with first-time user experience
   - Error logged to console for debugging
```

## Dependencies

### Existing Entities (No Changes)

- **SavedRoute**: Existing entity from 002-saved-routes feature
  - Used via `getSavedRoutes()` function
  - No modifications required

- **Route**: Existing entity from 001-cookie-clicker-simulator feature
  - Used when displaying routes
  - No modifications required

### Existing Functions (Used, Not Modified)

- `getSavedRoutes()`: Returns array of SavedRoute objects
  - Handles errors gracefully (returns [])
  - Used for state detection

- `saveSavedRoute()`: Saves a route to localStorage
  - Used when wizard completes
  - Triggers state re-evaluation

## Validation

### PageState Validation

- `hasSavedRoutes` must be boolean (not null/undefined)
- State must be re-evaluated after route save operations
- State must default to `false` on any error

### ComponentInitializationState Validation

- All boolean fields must be explicitly set
- `initializeCategorySelector`, `initializeCustomCategoryForm`, `initializeStartingBuildingsSelector` must always be `false`
- `initializeWizard` and `initializeRouteDisplay` must always be `true`

## Notes

- PageState is ephemeral (not persisted) - computed fresh on each page load
- ComponentInitializationState is computed once during initialization
- No new localStorage keys required - uses existing `cookieRouter:savedRoutes`
- All state transitions are synchronous (no async operations)







