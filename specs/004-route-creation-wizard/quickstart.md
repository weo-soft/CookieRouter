# Quickstart Guide: Route Creation Wizard Feature

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Prerequisites

- Existing Cookie Clicker Building Order Simulator features (001, 002, 003) must be implemented
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for version control)

## Initial Setup

### 1. Ensure Base Features are Working

Verify that the base features are functional:

```bash
npm install
npm run dev
```

Navigate to the application and verify you can:
- Select categories and calculate routes
- Import save games
- Save and access saved routes

### 2. Checkout Feature Branch

```bash
git checkout 004-route-creation-wizard
```

## Development Workflow

### Running Tests

```bash
# Run all tests (including new wizard tests)
npm test

# Run only wizard tests
npm test -- wizard

# Run tests in watch mode
npm test -- --watch
```

### Testing Wizard Functionality

1. **Initiate Wizard**:
   - Click "Create Route" button in header or main interface
   - Verify wizard modal opens with Step 1 (Initial Setup)
   - Verify step indicator shows "Step 1 of 3"

2. **Step 1: Initial Setup**:
   - **Option A - Import Save**:
     - Select "Import Save Game" option
     - Paste save game string
     - Click "Import" (or use existing import dialog)
     - Verify imported data is displayed
   - **Option B - Manual Setup**:
     - Select "Manually Set Up Buildings" option
     - Configure starting buildings
     - Verify buildings are configured
   - **Option C - Start Fresh**:
     - Select "Start Fresh" option
     - Verify no starting buildings are set
   - Click "Next" to proceed
   - Verify validation works (try proceeding without selecting an option)

3. **Step 2: Category Selection**:
   - **Option A - Predefined Category**:
     - Select a predefined category
     - Verify category settings are displayed
     - Adjust settings (target cookies, player CPS, etc.)
     - Verify adjustments are saved
   - **Option B - Custom Category**:
     - Select "Create Custom Category"
     - Fill in category parameters
     - Verify all fields are validated
   - Click "Next" to proceed
   - Verify validation works (try proceeding without selecting a category)

4. **Step 3: Summary & Calculate**:
   - Verify summary displays all selections from Steps 1 and 2
   - Review starting buildings, category, and settings
   - Click "Calculate Route"
   - Verify progress indicator shows during calculation
   - Verify route is calculated and automatically saved
   - Verify wizard closes and route is displayed in main interface

5. **Navigation Testing**:
   - Complete Step 1, proceed to Step 2
   - Click "Back" to return to Step 1
   - Verify all Step 1 data is preserved
   - Modify Step 1 selection
   - Click "Next" again
   - Verify changes are reflected in Step 2

6. **Error Handling**:
   - Try importing invalid save game → verify error message
   - Try proceeding without selecting category → verify validation error
   - Try calculating with invalid configuration → verify error and retry option

7. **Cancel**:
   - Start wizard, complete Step 1
   - Click "Cancel"
   - Verify wizard closes
   - Verify wizard state is discarded (no route saved)

## Project Structure (New Files)

```
src/
├── js/
│   └── ui/
│       ├── route-creation-wizard.js    # New: Main wizard component
│       ├── wizard-step-indicator.js     # New: Step progress indicator
│       ├── wizard-initial-setup.js      # New: Step 1 component
│       ├── wizard-category-selection.js # New: Step 2 component
│       └── wizard-summary.js            # New: Step 3 component

tests/
├── unit/
│   ├── route-creation-wizard.test.js        # New: Test wizard state management
│   └── wizard-navigation.test.js            # New: Test navigation logic
└── integration/
    └── route-creation-wizard-workflow.test.js # New: Test complete wizard flow
```

## Key Files to Understand

1. **`src/js/ui/route-creation-wizard.js`**: Main wizard component managing state and flow
2. **`src/js/ui/wizard-initial-setup.js`**: Step 1 component integrating with SaveGameImportDialog and StartingBuildingsSelector
3. **`src/js/ui/wizard-category-selection.js`**: Step 2 component integrating with CategorySelector and CustomCategoryForm
4. **`src/js/ui/wizard-summary.js`**: Step 3 component showing summary and triggering route calculation
5. **`src/js/ui/wizard-step-indicator.js`**: Step progress visualization component

## Common Tasks

### Testing Wizard State Management

```javascript
// In browser console or test
import { RouteCreationWizard } from './js/ui/route-creation-wizard.js';

// Create wizard instance
const wizard = new RouteCreationWizard('wizard-container', (route) => {
  console.log('Route calculated:', route);
}, () => {
  console.log('Wizard cancelled');
});

// Show wizard
wizard.show();

// Get current state
const state = wizard.getState();
console.log('Current step:', state.currentStep);
console.log('Step 1 data:', state.step1Data);
console.log('Step 2 data:', state.step2Data);

// Update step 1 data
wizard.updateStep1Data({
  setupChoice: 'import',
  importedSaveGame: { /* ... */ }
});

// Navigate
wizard.nextStep();
wizard.previousStep();
```

### Testing Step Validation

```javascript
// Validate current step
const isValid = wizard.validateCurrentStep();
if (!isValid) {
  const errors = wizard.getState().validationErrors;
  console.log('Validation errors:', errors);
}
```

### Testing Route Calculation

```javascript
// Complete wizard steps
wizard.updateStep1Data({ setupChoice: 'fresh' });
wizard.nextStep();
wizard.updateStep2Data({ 
  categoryType: 'predefined',
  selectedCategoryId: 'predefined-fledgling',
  categoryConfig: { /* ... */ }
});
wizard.nextStep();

// Calculate route
try {
  const route = await wizard.calculateRoute();
  console.log('Route calculated:', route);
} catch (error) {
  console.error('Calculation failed:', error);
}
```

### Debugging Wizard State

1. Open browser DevTools
2. Access wizard instance:
   ```javascript
   // If wizard is global or accessible
   const state = wizard.getState();
   console.log('Wizard state:', state);
   ```
3. Check step data:
   ```javascript
   console.log('Step 1:', state.step1Data);
   console.log('Step 2:', state.step2Data);
   console.log('Validation errors:', state.validationErrors);
   ```
4. Set breakpoints in wizard component methods
5. Use `console.log()` to inspect state transitions

## Troubleshooting

### Wizard Not Opening

- Verify "Create Route" button is present in HTML
- Check that wizard component is initialized in main.js
- Verify container element exists: `document.getElementById('wizard-container')`
- Check console for initialization errors

### State Not Preserving on Navigation

- Verify WizardState is stored in wizard component instance (not recreated)
- Check that `updateStep1Data()` and `updateStep2Data()` are called correctly
- Ensure state is not cleared when navigating
- Verify step components receive and use initial state

### Validation Not Working

- Check that `validateCurrentStep()` is called before `nextStep()`
- Verify validation errors are stored in `WizardState.validationErrors`
- Ensure error messages are displayed in step components
- Check that "Next" button is disabled when validation fails

### Route Calculation Fails

- Verify RouteCreationConfig is created correctly from WizardState
- Check that starting buildings are merged properly (manual overrides import)
- Ensure category configuration is valid
- Check that calculateRoute function receives correct parameters
- Verify error handling displays error message and allows retry

### Existing Components Not Integrating

- Verify existing components are embedded (not replaced) in wizard steps
- Check that component callbacks update wizard state
- Ensure component visibility is controlled by wizard
- Verify data flows from wizard state to components when navigating back

### Step Indicator Not Updating

- Check that `WizardStepIndicator.updateStep()` is called on navigation
- Verify step indicator receives correct currentStep value
- Ensure step indicator component is rendered in wizard

## Integration with Existing Features

### Save Game Import Integration

The wizard embeds SaveGameImportDialog in Step 1:
- Dialog is shown inline (not as separate modal) when "Import Save" is selected
- Imported data is stored in WizardState.step1Data.importedSaveGame
- Imported buildings are merged with manual buildings (manual takes precedence)

### Starting Buildings Integration

The wizard embeds StartingBuildingsSelector in Step 1:
- Selector is shown when "Manual Setup" is selected
- Manual buildings are stored in WizardState.step1Data.manualBuildings
- Buildings are merged with imported buildings for final configuration

### Category Selection Integration

The wizard embeds CategorySelector and CustomCategoryForm in Step 2:
- CategorySelector is shown for predefined category selection
- CustomCategoryForm is shown when "Create Custom" is selected
- Category configuration (with adjustments) is stored in WizardState.step2Data.categoryConfig

### Route Calculation Integration

The wizard uses existing calculateRoute function:
- Creates RouteCreationConfig from WizardState
- Calls calculateRoute with configuration
- Automatically saves route on success
- Displays route in main interface after wizard closes

## Next Steps

1. Review [data-model.md](./data-model.md) for WizardState and RouteCreationConfig entities
2. Review [contracts/wizard.md](./contracts/wizard.md) for wizard API interface
3. Review [plan.md](./plan.md) for implementation details
4. Review [research.md](./research.md) for technical decisions
5. Start with User Story 1 (P1): Start Route Creation with Initial Setup

## Resources

- Existing UI components: `src/js/ui/save-game-import-dialog.js`, `src/js/ui/starting-buildings.js`, `src/js/ui/category-selector.js`, `src/js/ui/custom-category-form.js`
- Existing route calculation: `src/js/simulation.js`
- Existing storage: `src/js/storage.js`
- Dialog patterns: `src/js/ui/save-route-dialog.js` (for modal overlay pattern)

