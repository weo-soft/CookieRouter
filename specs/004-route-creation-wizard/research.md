# Research: Route Creation Wizard Feature

**Feature**: 004-route-creation-wizard  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Research Questions

### 1. Wizard State Management Pattern

**Question**: How should wizard state be managed to support backward/forward navigation while preserving user input and integrating with existing components?

**Decision**: Use a centralized wizard state object stored in memory (not localStorage) that tracks:
- Current step index (0, 1, 2)
- Step 1 data: setup choice (import/manual/fresh), imported save game data (if any), manual building configuration (if any)
- Step 2 data: selected category (predefined or custom), category adjustments/configuration
- Validation errors per step
- Navigation history (for potential undo/redo, though not required)

The wizard component will maintain this state and pass relevant data to existing components (SaveGameImportDialog, StartingBuildingsSelector, CategorySelector, CustomCategoryForm) as needed. State is only persisted to localStorage when the route is successfully calculated and saved.

**Rationale**: 
- In-memory state is sufficient for wizard flow (per spec assumption)
- Centralized state makes navigation and validation straightforward
- Reusing existing components maintains consistency and reduces code duplication
- State preservation during navigation is explicit and controllable

**Alternatives Considered**:
- Store state in localStorage during wizard: Rejected - adds complexity, not needed per spec
- Use state management library (Redux, etc.): Rejected - overkill for single wizard, adds dependency
- Each step manages own state: Rejected - makes navigation and validation complex

### 2. Wizard UI Pattern and Step Indicators

**Question**: What UI pattern should be used for the wizard interface and how should step progress be indicated?

**Decision**: Use a modal dialog overlay (similar to existing SaveRouteDialog and SaveGameImportDialog) with:
- Step indicator at top showing: "Step 1 of 3: Initial Setup", "Step 2 of 3: Category Selection", "Step 3 of 3: Summary & Calculate"
- Visual progress bar or numbered steps (1 → 2 → 3) with current step highlighted
- Navigation buttons: "Back" (disabled on step 1), "Next" (or "Calculate Route" on final step), "Cancel"
- Each step content area that shows/hides based on current step
- Summary view on final step showing all selections before calculation

**Rationale**:
- Consistent with existing dialog patterns in the application
- Modal overlay focuses user attention on wizard task
- Clear step indicators reduce confusion
- Progress visualization helps users understand where they are in the process

**Alternatives Considered**:
- Inline wizard (no modal): Rejected - would require significant layout changes, less focused
- Accordion-style steps: Rejected - doesn't enforce sequential flow, less clear
- Tab-based interface: Rejected - allows skipping steps, doesn't match wizard pattern

### 3. Integration with Existing Components

**Question**: How should the wizard integrate with existing UI components (SaveGameImportDialog, StartingBuildingsSelector, CategorySelector, CustomCategoryForm) without duplicating code?

**Decision**: The wizard will:
- Embed existing components within wizard step containers
- Control visibility of existing components (show/hide based on step and user choices)
- Listen to events/callbacks from existing components to update wizard state
- Pass wizard state data to existing components when navigating back to a step
- Reuse existing validation logic from components
- Keep existing components unchanged (they continue to work standalone)

For example:
- Step 1: Show SaveGameImportDialog inline (not as separate modal) when "Import Save" is selected
- Step 1: Show StartingBuildingsSelector when "Manual Setup" is selected
- Step 2: Show CategorySelector inline, show CustomCategoryForm when "Create Custom" is selected
- Wizard manages which component is visible and coordinates data flow

**Rationale**:
- Maximizes code reuse and maintains consistency
- Existing components are tested and working
- Reduces maintenance burden
- Users familiar with existing components will recognize them in wizard

**Alternatives Considered**:
- Create new wizard-specific components: Rejected - duplicates code, increases maintenance
- Refactor existing components to be wizard-aware: Rejected - breaks backward compatibility, adds complexity
- Use existing components as-is in separate views: Considered but rejected - loses integration benefits

### 4. Step 1: Initial Setup Options Handling

**Question**: How should the three initial setup options (Import Save, Manual Setup, Start Fresh) be presented and how should switching between them work?

**Decision**: Present as three radio buttons or card-based selection:
- "Import Save Game" - when selected, shows SaveGameImportDialog inline (not as modal)
- "Manually Set Up Buildings" - when selected, shows StartingBuildingsSelector
- "Start Fresh" - when selected, clears any previous selections, uses empty starting buildings

User can switch between options, and wizard state tracks the current choice. If user switches from "Import Save" to "Manual Setup", the imported data is preserved in wizard state but manual settings take precedence (per FR-019). If user switches back to "Import Save", previously imported data is restored.

**Rationale**:
- Clear, mutually exclusive options
- Allows users to change their mind
- Preserves data when switching (better UX)
- Follows spec requirement that manual settings take precedence

**Alternatives Considered**:
- Allow multiple options simultaneously: Rejected - conflicts with spec, adds complexity
- Clear data when switching: Rejected - poor UX, users lose work
- Separate steps for each option: Rejected - unnecessary, adds steps

### 5. Step 2: Predefined Category Adjustment

**Question**: How should users adjust settings of predefined categories? Should adjustments create a temporary custom category or modify the predefined category in-place?

**Decision**: When a predefined category is selected, show its default settings in an editable form (similar to CustomCategoryForm but pre-populated). Adjustments create a temporary category configuration that exists only in wizard state. The original predefined category is not modified. If user proceeds, the adjusted configuration is used for route calculation. If user navigates back and selects a different category, adjustments are lost (as expected for wizard flow).

**Rationale**:
- Predefined categories remain unchanged (preserves them for other uses)
- Temporary adjustments are appropriate for wizard context
- Clear that adjustments are for this route only
- Simple implementation (no category management needed)

**Alternatives Considered**:
- Create new custom category from adjustments: Rejected - adds complexity, user may not want to save it
- Modify predefined category: Rejected - breaks other users/routes using that category
- Show adjustments as overrides: Considered but rejected - more complex, temporary config is simpler

### 6. Validation and Error Handling Strategy

**Question**: How should input validation work across wizard steps, and how should errors be displayed?

**Decision**: 
- Validation occurs when user clicks "Next" to proceed to next step
- Each step validates its own required fields
- Validation errors are displayed inline near the relevant fields
- "Next" button is disabled or shows error if validation fails
- Error messages are specific and actionable (e.g., "Please select a category" or "Target cookies must be greater than 0")
- Validation state is stored in wizard state for persistence during navigation

For route calculation errors:
- Display error message in final step
- Allow user to navigate back to modify configuration
- Show retry option after fixing issues

**Rationale**:
- Prevents users from proceeding with invalid data
- Clear feedback helps users fix issues quickly
- Inline errors are more discoverable than summary at end
- Per-step validation reduces cognitive load

**Alternatives Considered**:
- Validate all steps at end: Rejected - poor UX, users discover issues too late
- Real-time validation on every keystroke: Rejected - can be annoying, validation on "Next" is sufficient
- Separate validation step: Rejected - adds unnecessary step, validation should be immediate

### 7. Route Calculation Integration

**Question**: How should route calculation be integrated into the wizard, and how should progress be displayed?

**Decision**: 
- Final step shows summary of all selections (starting state, category, settings)
- "Calculate Route" button triggers calculation (replaces "Next" on final step)
- During calculation, show progress indicator (reuse existing RouteDisplay progress UI)
- Wizard remains open during calculation (user can see progress)
- On success: automatically save route, show success message, close wizard, display route in main interface
- On error: show error message in wizard, allow user to modify configuration and retry

**Rationale**:
- Summary gives users confidence before calculation
- Progress feedback is essential for long calculations
- Automatic save on success matches spec (FR-011)
- Error handling allows recovery without restarting wizard

**Alternatives Considered**:
- Close wizard before calculation: Rejected - loses context, can't show progress
- Calculate in background: Rejected - user should see progress, calculation is part of wizard flow
- Manual save after calculation: Rejected - conflicts with spec requirement for automatic save

### 8. Navigation and State Preservation

**Question**: How should backward navigation work, and how should state be preserved when navigating between steps?

**Decision**: 
- "Back" button returns to previous step with all previously entered data restored
- Wizard state object maintains all step data regardless of current step
- When navigating back, populate form fields/components with saved state data
- When navigating forward, validate current step before allowing progression
- "Cancel" button closes wizard and discards all wizard state (per spec)

**Rationale**:
- Users expect data to persist when going back
- State preservation is explicit requirement (FR-014)
- Validation on forward navigation prevents invalid data accumulation
- Cancel behavior matches user expectations

**Alternatives Considered**:
- Clear data when going back: Rejected - violates spec, poor UX
- Validate all previous steps when going back: Rejected - unnecessary, only validate on forward
- Warn before cancel: Considered but rejected - adds friction, cancel should be simple

### 9. Wizard Entry Point

**Question**: How should users initiate the wizard? Should it replace existing route creation flow or be an additional option?

**Decision**: Add a "Create Route" or "New Route" button in the header or main interface that opens the wizard. The wizard is an additional, guided way to create routes. Existing functionality (direct category selection, manual starting buildings setup) remains available for users who prefer it. Both flows result in calculated and saved routes.

**Rationale**:
- Provides choice for users (guided vs. direct)
- Maintains backward compatibility
- Wizard is optional enhancement, not replacement
- Users familiar with existing flow can continue using it

**Alternatives Considered**:
- Replace existing flow with wizard: Rejected - breaks existing user workflows, too disruptive
- Wizard only, remove existing flow: Rejected - removes user choice, may frustrate power users
- Auto-detect and suggest wizard: Considered but rejected - adds complexity, explicit button is clearer

### 10. Error Recovery and Edge Cases

**Question**: How should the wizard handle edge cases like browser close during wizard, invalid save game import, or route calculation failures?

**Decision**: 
- Browser close: Wizard state is lost (in-memory only, per spec). User must restart wizard. This is acceptable per spec assumptions.
- Invalid save game import: Show error in Step 1, allow user to retry import or switch to manual setup/fresh start
- Route calculation failure: Show error in Step 3, allow user to navigate back to modify configuration and retry
- All errors: Display clear, actionable error messages with guidance on how to fix

**Rationale**:
- In-memory state loss on browser close is expected and acceptable
- Error recovery options prevent user frustration
- Clear error messages help users understand and fix issues
- Retry options maintain wizard flow without forcing restart

**Alternatives Considered**:
- Persist wizard state in localStorage: Rejected - conflicts with spec assumption, adds complexity
- Auto-recover on browser reopen: Rejected - not specified, adds significant complexity
- Block navigation on errors: Rejected - too restrictive, users should be able to fix issues

## Technical Decisions Summary

1. **State Management**: In-memory wizard state object tracking all step data
2. **UI Pattern**: Modal dialog overlay with step indicators and progress visualization
3. **Component Integration**: Embed and coordinate existing components within wizard steps
4. **Initial Setup**: Radio/card selection with inline component display based on choice
5. **Category Adjustment**: Temporary category configuration in wizard state
6. **Validation**: Per-step validation on "Next" with inline error messages
7. **Route Calculation**: Integrated into final step with progress display and automatic save
8. **Navigation**: State preservation on backward navigation, validation on forward
9. **Entry Point**: New "Create Route" button alongside existing functionality
10. **Error Handling**: Clear error messages with retry/recovery options

## Dependencies

- Existing UI components: SaveGameImportDialog, StartingBuildingsSelector, CategorySelector, CustomCategoryForm, RouteDisplay
- Existing utilities: save-game-importer.js, simulation.js, storage.js
- Existing styles and dialog patterns
- localStorage API (browser native)

## Integration Points

- Create new RouteCreationWizard component orchestrating wizard flow
- Create wizard step components (wizard-initial-setup.js, wizard-category-selection.js, wizard-summary.js)
- Create wizard step indicator component
- Integrate wizard entry point in main.js and index.html
- Extend main.css with wizard-specific styles
- Coordinate with existing components for data flow and event handling

