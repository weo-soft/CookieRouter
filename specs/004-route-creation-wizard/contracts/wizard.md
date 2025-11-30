# Wizard Contract: Route Creation Wizard API Interface

**Date**: 2025-01-27  
**Feature**: [spec.md](../spec.md)

## Overview

This contract defines the interface for the Route Creation Wizard component. The wizard orchestrates a multistep process for creating and calculating routes, integrating with existing components (SaveGameImportDialog, StartingBuildingsSelector, CategorySelector, CustomCategoryForm) and route calculation functionality.

## Namespace

All wizard-related classes and functions are exported from `src/js/ui/route-creation-wizard.js` and related wizard step components.

## Core Wizard Component

### `RouteCreationWizard`

Main wizard component that manages the multistep flow and state.

#### Constructor

```javascript
new RouteCreationWizard(containerId, onComplete, onCancel)
```

**Parameters**:
- `containerId` (string, required): ID of DOM element to render wizard into
- `onComplete` (function, optional): Callback when route is successfully calculated and saved
  - Signature: `(route: Route) => void`
- `onCancel` (function, optional): Callback when wizard is cancelled
  - Signature: `() => void`

**Returns**: RouteCreationWizard instance

---

#### Methods

##### `show(): void`

Displays the wizard modal and initializes Step 1 (Initial Setup).

**Returns**: void

**Behavior**:
- Creates new WizardState with currentStep = 0
- Renders wizard modal overlay
- Displays Step 1 content
- Attaches event listeners

---

##### `hide(): void`

Hides the wizard modal and discards wizard state.

**Returns**: void

**Behavior**:
- Removes wizard modal from DOM
- Clears WizardState
- Calls onCancel callback if provided

---

##### `goToStep(stepIndex: number): void`

Navigates to a specific wizard step.

**Parameters**:
- `stepIndex` (number, required): Step index (0, 1, or 2)

**Returns**: void

**Behavior**:
- Validates stepIndex is valid (0, 1, or 2)
- Updates WizardState.currentStep
- Renders appropriate step content
- Updates step indicator
- Enables/disables navigation buttons as appropriate

**Errors**:
- Throws if stepIndex is invalid
- Throws if trying to advance without validation

---

##### `nextStep(): void`

Advances to the next wizard step after validating current step.

**Returns**: void

**Behavior**:
- Validates current step data
- If validation passes: increments currentStep, renders next step
- If validation fails: displays errors, prevents advancement

**Errors**:
- Throws if current step is invalid
- Throws if validation fails (errors stored in WizardState.validationErrors)

---

##### `previousStep(): void`

Returns to the previous wizard step.

**Returns**: void

**Behavior**:
- Decrements currentStep (if not already at step 0)
- Renders previous step with preserved data
- Updates step indicator

**Errors**:
- No error if already at step 0 (button should be disabled)

---

##### `validateCurrentStep(): boolean`

Validates the current wizard step's data.

**Returns**: boolean - true if valid, false if invalid

**Behavior**:
- Validates Step 1: setupChoice must be set, imported save game must be valid if import selected
- Validates Step 2: categoryType must be set, categoryConfig must be valid
- Stores validation errors in WizardState.validationErrors
- Returns validation result

---

##### `calculateRoute(): Promise<Route>`

Calculates the route using current wizard configuration.

**Returns**: Promise resolving to Route object

**Behavior**:
- Creates RouteCreationConfig from WizardState
- Sets WizardState.isCalculating = true
- Calls calculateRoute function with configuration
- Updates progress during calculation
- On success: stores route in WizardState.calculatedRoute, automatically saves route, sets isCalculating = false
- On error: sets isCalculating = false, throws error

**Errors**:
- Throws if RouteCreationConfig is invalid
- Throws if route calculation fails
- Throws if route save fails

---

##### `getState(): WizardState`

Returns the current wizard state.

**Returns**: WizardState object (read-only copy)

**Behavior**:
- Returns copy of current WizardState
- Does not allow direct mutation (use wizard methods to modify state)

---

##### `updateStep1Data(data: Partial<Step1Data>): void`

Updates Step 1 data in wizard state.

**Parameters**:
- `data` (object, required): Partial Step1Data object with fields to update

**Returns**: void

**Behavior**:
- Merges provided data into WizardState.step1Data
- Validates updated data
- Updates UI if wizard is currently showing Step 1

---

##### `updateStep2Data(data: Partial<Step2Data>): void`

Updates Step 2 data in wizard state.

**Parameters**:
- `data` (object, required): Partial Step2Data object with fields to update

**Returns**: void

**Behavior**:
- Merges provided data into WizardState.step2Data
- Validates updated data
- Updates UI if wizard is currently showing Step 2

---

## Wizard Step Components

### `WizardInitialSetup`

Component for Step 1: Initial Setup.

#### Constructor

```javascript
new WizardInitialSetup(containerId, initialState, onUpdate)
```

**Parameters**:
- `containerId` (string, required): ID of DOM element to render into
- `initialState` (Step1Data, optional): Initial step 1 data
- `onUpdate` (function, required): Callback when step data changes
  - Signature: `(data: Step1Data) => void`

---

### `WizardCategorySelection`

Component for Step 2: Category Selection.

#### Constructor

```javascript
new WizardCategorySelection(containerId, initialState, onUpdate)
```

**Parameters**:
- `containerId` (string, required): ID of DOM element to render into
- `initialState` (Step2Data, optional): Initial step 2 data
- `onUpdate` (function, required): Callback when step data changes
  - Signature: `(data: Step2Data) => void`

---

### `WizardSummary`

Component for Step 3: Summary & Calculate.

#### Constructor

```javascript
new WizardSummary(containerId, wizardState, onCalculate)
```

**Parameters**:
- `containerId` (string, required): ID of DOM element to render into
- `wizardState` (WizardState, required): Complete wizard state for summary display
- `onCalculate` (function, required): Callback when user clicks "Calculate Route"
  - Signature: `() => Promise<Route>`

---

### `WizardStepIndicator`

Component for displaying wizard step progress.

#### Constructor

```javascript
new WizardStepIndicator(containerId, currentStep, totalSteps)
```

**Parameters**:
- `containerId` (string, required): ID of DOM element to render into
- `currentStep` (number, required): Current step index (0-based)
- `totalSteps` (number, required): Total number of steps (3)

**Methods**:
- `updateStep(stepIndex: number): void` - Updates displayed current step

---

## Integration with Existing Components

The wizard integrates with existing components by:

1. **Embedding components**: Existing components are rendered within wizard step containers
2. **Event coordination**: Wizard listens to component events/callbacks to update wizard state
3. **Data passing**: Wizard passes state data to components when navigating to steps
4. **Visibility control**: Wizard shows/hides components based on user choices

### Component Integration Points

- **SaveGameImportDialog**: Embedded in Step 1 when "Import Save" is selected
- **StartingBuildingsSelector**: Embedded in Step 1 when "Manual Setup" is selected
- **CategorySelector**: Embedded in Step 2 for predefined category selection
- **CustomCategoryForm**: Embedded in Step 2 when "Create Custom" is selected
- **RouteDisplay**: Used to show calculated route after wizard completes

## Error Handling

All wizard methods should handle errors gracefully:

1. **Validation Errors**: Stored in WizardState.validationErrors, displayed inline
2. **Route Calculation Errors**: Displayed in Step 3, allow user to navigate back and retry
3. **Component Errors**: Propagated to wizard, displayed with context
4. **State Errors**: Logged to console, wizard state reset if unrecoverable

## Data Flow

1. User initiates wizard → `wizard.show()`
2. User completes Step 1 → `wizard.updateStep1Data()` → `wizard.nextStep()`
3. User completes Step 2 → `wizard.updateStep2Data()` → `wizard.nextStep()`
4. User reviews Step 3 → `wizard.calculateRoute()` → route calculated and saved
5. Wizard completes → `onComplete(route)` callback → wizard closes

## Implementation Notes

- Wizard state is stored in memory only (not persisted)
- Wizard coordinates with existing components but doesn't replace them
- All wizard methods are synchronous except `calculateRoute()` which is async
- Wizard handles all navigation, validation, and error display internally
- External code only needs to call `show()` and handle `onComplete`/`onCancel` callbacks

