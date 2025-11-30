# Data Model: Route Creation Wizard

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Entities

### WizardState

Represents the current state of the route creation wizard, including the current step, all step data, and validation state. This entity exists only in memory during the wizard process and is not persisted to localStorage.

**Fields**:
- `currentStep` (number, required): Current step index (0 = Initial Setup, 1 = Category Selection, 2 = Summary & Calculate)
- `step1Data` (object, required): Data from Step 1 - Initial Setup
  - `setupChoice` (string, required): One of "import", "manual", or "fresh"
  - `importedSaveGame` (object, optional): Imported save game data if "import" was selected (structure matches ImportedSaveGame from save-game-importer)
  - `manualBuildings` (object, optional): Manual building configuration if "manual" was selected (map of building names to counts)
  - `versionId` (string, optional): Game version ID (from import or default)
- `step2Data` (object, required): Data from Step 2 - Category Selection
  - `categoryType` (string, required): One of "predefined" or "custom"
  - `selectedCategoryId` (string, optional): ID of selected predefined category
  - `categoryConfig` (object, required): Category configuration (either predefined with adjustments or custom)
    - `name` (string, required): Category name
    - `version` (string, required): Game version
    - `targetCookies` (number, required): Target cookie count
    - `playerCps` (number, optional): Player clicks per second
    - `playerDelay` (number, optional): Player delay in seconds
    - `hardcoreMode` (boolean, optional): Whether hardcore mode is enabled
    - `initialBuildings` (object, optional): Initial buildings for category
- `validationErrors` (object, required): Validation errors per step
  - `step1` (array, optional): Array of error messages for step 1
  - `step2` (array, optional): Array of error messages for step 2
- `isCalculating` (boolean, required): Whether route calculation is in progress
- `calculatedRoute` (object, optional): Calculated route object if calculation completed successfully

**Validation Rules**:
- `currentStep` must be 0, 1, or 2
- `step1Data.setupChoice` must be one of "import", "manual", or "fresh"
- `step2Data.categoryType` must be one of "predefined" or "custom"
- `step2Data.categoryConfig.targetCookies` must be positive number
- `step2Data.categoryConfig.version` must be valid version identifier
- All validation error arrays must contain strings

**Storage**: Stored in memory only (wizard component instance), not persisted to localStorage

**Relationships**:
- WizardState is used by RouteCreationWizard component (one-to-one)
- WizardState.step1Data.importedSaveGame references ImportedSaveGame (optional)
- WizardState.step2Data.selectedCategoryId references Category (optional, if predefined)
- WizardState.calculatedRoute references Route (optional, after calculation)

### RouteCreationConfig

Represents the complete configuration assembled through the wizard, ready for route calculation. This is derived from WizardState and passed to the route calculation function.

**Fields**:
- `startingBuildings` (object, required): Final starting buildings configuration (merged from import and manual settings, with manual taking precedence)
- `category` (object, required): Category configuration for route calculation
  - `id` (string, required): Category ID (predefined ID or generated for custom)
  - `name` (string, required): Category name
  - `isPredefined` (boolean, required): Whether this is a predefined category
  - `version` (string, required): Game version
  - `targetCookies` (number, required): Target cookie count
  - `playerCps` (number, optional): Player clicks per second
  - `playerDelay` (number, optional): Player delay in seconds
  - `hardcoreMode` (boolean, optional): Whether hardcore mode is enabled
  - `initialBuildings` (object, optional): Initial buildings for category
- `versionId` (string, required): Game version ID to use for calculation
- `algorithm` (string, optional): Algorithm to use (default: "GPL")
- `lookahead` (number, optional): Lookahead depth for GPL algorithm (default: 1)

**Validation Rules**:
- `startingBuildings` must be object with building names as keys and non-negative integers as values
- `category.targetCookies` must be positive number
- `category.version` must be valid version identifier
- `versionId` must be valid version identifier
- `algorithm` must be "GPL" or "DFS" if provided

**Storage**: Not persisted, created from WizardState when route calculation is triggered

**Relationships**:
- RouteCreationConfig is derived from WizardState (one-to-one transformation)
- RouteCreationConfig.category may reference Category (if predefined)
- RouteCreationConfig is passed to calculateRoute function

## Data Flow

### Wizard Initialization

1. User clicks "Create Route" button
2. System creates new WizardState with:
   - currentStep: 0
   - step1Data: { setupChoice: null }
   - step2Data: { categoryType: null, categoryConfig: null }
   - validationErrors: {}
   - isCalculating: false
3. System displays wizard modal with Step 1 (Initial Setup)

### Step 1: Initial Setup

1. User selects setup option (import/manual/fresh)
2. System updates WizardState.step1Data.setupChoice
3. Based on choice:
   - **Import**: User provides save game string, system imports and stores in WizardState.step1Data.importedSaveGame
   - **Manual**: User configures buildings, system stores in WizardState.step1Data.manualBuildings
   - **Fresh**: System sets empty buildings, no additional data needed
4. User clicks "Next"
5. System validates Step 1:
   - If "import" selected: validate imported save game is valid
   - If "manual" selected: validate at least one building configured (optional, can be empty)
   - If "fresh": no validation needed
6. If validation passes: advance to Step 2, update WizardState.currentStep = 1
7. If validation fails: display errors in WizardState.validationErrors.step1, prevent advancement

### Step 2: Category Selection

1. User selects category type (predefined or custom)
2. System updates WizardState.step2Data.categoryType
3. Based on type:
   - **Predefined**: User selects category, system loads default config, user can adjust settings
   - **Custom**: User creates new category with all parameters
4. System stores category configuration in WizardState.step2Data.categoryConfig
5. User clicks "Next"
6. System validates Step 2:
   - Category must be selected/configured
   - targetCookies must be positive
   - version must be valid
   - Other parameters must be valid (non-negative numbers, valid booleans)
7. If validation passes: advance to Step 3, update WizardState.currentStep = 2
8. If validation fails: display errors in WizardState.validationErrors.step2, prevent advancement

### Step 3: Summary & Calculation

1. System displays summary of all selections from WizardState
2. User reviews summary
3. User clicks "Calculate Route"
4. System creates RouteCreationConfig from WizardState:
   - Merge starting buildings (imported + manual, manual takes precedence)
   - Use category configuration from step2Data
   - Use versionId from step1Data or default
5. System sets WizardState.isCalculating = true
6. System calls calculateRoute(RouteCreationConfig.category, RouteCreationConfig.startingBuildings, options, RouteCreationConfig.versionId)
7. During calculation: system updates progress indicators
8. On success:
   - System stores calculated route in WizardState.calculatedRoute
   - System automatically saves route (via existing saveRoute function)
   - System sets WizardState.isCalculating = false
   - System displays success message
   - System closes wizard and displays route in main interface
9. On error:
   - System sets WizardState.isCalculating = false
   - System displays error message
   - System allows user to navigate back to fix configuration

### Navigation (Back/Forward)

1. User clicks "Back" on any step
2. System decrements WizardState.currentStep
3. System displays previous step with all data from WizardState restored
4. System preserves all wizard state (no data loss)
5. User can modify previous selections
6. User clicks "Next" again
7. System validates current step before advancing
8. Process repeats

### Cancel

1. User clicks "Cancel" or closes wizard
2. System discards WizardState (no persistence)
3. System closes wizard modal
4. System returns to main interface

## State Transitions

```
[Initial] → [Step 1: Initial Setup]
              ↓ (Next, validated)
[Step 2: Category Selection]
              ↓ (Next, validated)
[Step 3: Summary & Calculate]
              ↓ (Calculate Route)
[Calculating...]
              ↓ (Success)
[Route Calculated & Saved] → [Wizard Closed]
              ↓ (Error)
[Error Display] → [User can navigate back]
```

## Data Merging Logic

### Starting Buildings Merge (FR-019)

When creating RouteCreationConfig:
1. Start with empty object: `startingBuildings = {}`
2. If WizardState.step1Data.importedSaveGame exists:
   - Merge imported buildingCounts: `startingBuildings = { ...importedSaveGame.buildingCounts }`
3. If WizardState.step1Data.manualBuildings exists:
   - Merge manual buildings (takes precedence): `startingBuildings = { ...startingBuildings, ...manualBuildings }`
4. Result: Manual buildings override imported buildings, imported buildings override empty state

### Category Configuration

- If predefined category selected: Use predefined category config as base, apply user adjustments
- If custom category created: Use user-provided config directly
- Final config stored in WizardState.step2Data.categoryConfig

## Storage Schema

WizardState is **not** stored in localStorage. It exists only in memory during the wizard process.

RouteCreationConfig is **not** stored. It is created on-demand when route calculation is triggered.

Only the final calculated Route is persisted to localStorage (via existing saveRoute function, same storage as existing routes).

## Data Integrity

- WizardState.currentStep must always be valid (0, 1, or 2)
- WizardState.step1Data.setupChoice must be set before advancing to Step 2
- WizardState.step2Data.categoryConfig must be valid before advancing to Step 3
- RouteCreationConfig must be valid before route calculation
- All validation errors must be cleared before allowing step advancement
- Calculated route must be valid before saving

