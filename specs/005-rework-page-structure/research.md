# Research: Rework Page Structure for Route Wizard Workflow

**Feature**: 005-rework-page-structure  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Research Questions

### 1. Page State Detection Strategy

**Question**: How should the application detect whether saved routes exist and determine the appropriate page state to display?

**Decision**: Use synchronous `getSavedRoutes()` function from existing `storage.js` module during application initialization. Check array length to determine state:
- Empty array (length === 0) → First-time user experience
- Non-empty array (length > 0) → Returning user experience

**Rationale**: 
- `getSavedRoutes()` already exists and handles localStorage errors gracefully (returns empty array on error)
- Synchronous operation ensures no delay in page state determination
- Aligns with existing error handling patterns (FR-009 requirement)
- No new dependencies or complexity required

**Alternatives Considered**:
- Async detection with loading state: Rejected - unnecessary complexity, localStorage is synchronous
- Separate state management system: Rejected - overkill for binary state (has routes / no routes)
- Server-side detection: Rejected - application is client-side only, no backend

---

### 2. Component Initialization Strategy

**Question**: How should components be conditionally initialized based on page state?

**Decision**: Conditionally instantiate components in `main.js` initialization based on detected page state:
- First-time users: Only initialize wizard, route display, and saved routes list (for after first route creation)
- Returning users: Initialize saved routes list, route display, and wizard (both paths available)
- Never initialize: `CategorySelector`, `CustomCategoryForm`, `StartingBuildingsSelector` in main.js (only in wizard)

**Rationale**:
- Maintains existing component architecture (no changes to component classes)
- Clear separation: main page components vs wizard-only components
- Reduces memory footprint by not instantiating unused components
- Follows existing initialization patterns in `init()` function

**Alternatives Considered**:
- Lazy loading components: Rejected - adds unnecessary complexity, components are lightweight
- Conditional rendering with existing instances: Rejected - components should not exist if not needed
- Single component manager: Rejected - over-engineering, current approach is simpler

---

### 3. HTML Structure Cleanup

**Question**: Should unused section containers be removed from HTML or kept for potential future use?

**Decision**: Remove unused section containers (`category-section`, `custom-category-section`, `starting-buildings-section`) from `index.html` since these components will only exist within the wizard's DOM structure.

**Rationale**:
- Cleaner HTML structure aligns with FR-004, FR-005, FR-006
- Prevents accidental rendering of components outside wizard
- Reduces DOM complexity
- Wizard creates its own containers dynamically, so these sections are not needed

**Alternatives Considered**:
- Keep containers but hide with CSS: Rejected - violates requirement to remove components from main page
- Keep containers for future use: Rejected - YAGNI principle, can add back if needed
- Conditional rendering in HTML: Rejected - not possible with static HTML, would require template system

---

### 4. Dynamic State Transition Handling

**Question**: How should the page handle the transition from first-time user (no saved routes) to returning user (has saved routes) after creating the first route?

**Decision**: After wizard completes and saves first route, re-check saved routes count and update page structure dynamically:
1. Call `getSavedRoutes()` again after route save
2. If count changed from 0 to >0, update UI to show returning user experience
3. Show saved routes list and provide option to create another route

**Rationale**:
- Aligns with FR-008 requirement for dynamic updates
- Provides immediate feedback to user that their route was saved
- Maintains consistency with page state detection logic
- No page refresh required

**Alternatives Considered**:
- Page refresh after save: Rejected - poor UX, loses any transient state
- Optimistic UI update: Rejected - could be inconsistent if save fails
- Event-driven state management: Rejected - over-engineering for simple state transition

---

### 5. Error Handling for localStorage

**Question**: How should localStorage read errors be handled to meet FR-009 requirement?

**Decision**: Rely on existing `getSavedRoutes()` error handling which:
- Catches localStorage errors gracefully
- Returns empty array on any error (corruption, quota exceeded, unavailable)
- Logs errors to console for debugging
- Defaults to first-time user experience (empty array = no saved routes)

**Rationale**:
- Existing function already implements required error handling
- Consistent with application's error handling patterns
- Meets FR-009 requirement without additional code
- First-time user experience is safe default (wizard is always available)

**Alternatives Considered**:
- Custom error UI: Rejected - localStorage errors are rare, console logging sufficient
- Retry mechanism: Rejected - localStorage errors are typically persistent, retry won't help
- User notification: Rejected - adds complexity, first-time experience is acceptable fallback

---

### 6. Wizard State Preservation

**Question**: Should wizard state be preserved across page refreshes?

**Decision**: No - wizard state should reset on page refresh. If user refreshes during wizard, they return to appropriate page state (first-time prompt or saved routes choice) and can restart wizard.

**Rationale**:
- Wizard is designed as a single-session workflow
- Preserving state adds complexity (localStorage serialization, state restoration)
- User can easily restart wizard if needed
- Aligns with existing wizard behavior (no state persistence currently)

**Alternatives Considered**:
- Preserve wizard state in localStorage: Rejected - adds complexity, wizard is quick to restart
- Preserve wizard state in sessionStorage: Rejected - sessionStorage clears on tab close anyway
- Auto-resume wizard: Rejected - user may have refreshed intentionally to start over

---

## Technical Decisions Summary

1. **State Detection**: Synchronous `getSavedRoutes()` check on initialization
2. **Component Initialization**: Conditional instantiation based on page state
3. **HTML Structure**: Remove unused section containers
4. **State Transitions**: Re-check saved routes after first route creation
5. **Error Handling**: Rely on existing `getSavedRoutes()` error handling
6. **Wizard State**: No persistence across refreshes (reset on refresh)

All research questions resolved. No NEEDS CLARIFICATION markers remain.














