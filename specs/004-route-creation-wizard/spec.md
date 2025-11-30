# Feature Specification: Route Creation Wizard

**Feature Branch**: `004-route-creation-wizard`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "create a multistep process that takes the user through the process of creating/calculating a route. The user is first prompted to either import a save, manually setting up buildings and upgrades or start fresh. In the next Step the user can either configure their own category or choose one of the predefined ones. If they choose a predefined category, they can adjust the settings as needed. After the setup the route is calculated and saved, ready for the user to follow along"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Route Creation with Initial Setup (Priority: P1)

A user wants to create a new route and needs to set up their starting game state. They can choose to import a save game, manually configure their starting buildings, or start from a fresh state.

**Why this priority**: This is the entry point for route creation. Users must be able to establish their starting state before proceeding to category selection and route calculation.

**Independent Test**: Can be fully tested by initiating route creation, selecting one of the three setup options (import save, manual setup, or fresh start), and verifying the system proceeds to the next step with the appropriate starting state configured.

**Acceptance Scenarios**:

1. **Given** the user wants to create a route, **When** they initiate the route creation process, **Then** the system presents three options: import save game, manually set up buildings, or start fresh
2. **Given** the user selects "Import Save Game", **When** they provide a valid save game string, **Then** the system imports the save data and extracts starting buildings, version, and game settings
3. **Given** the user selects "Manually Set Up Buildings", **When** they configure their starting buildings, **Then** the system stores the manual building configuration for use in route calculation
4. **Given** the user selects "Start Fresh", **When** they proceed, **Then** the system uses empty starting buildings and default game settings
5. **Given** the user has imported a save game, **When** they proceed to the next step, **Then** the imported data (buildings, version, settings) is available for route calculation

---

### User Story 2 - Select or Configure Category (Priority: P1)

A user wants to choose the goal and parameters for their route. They can select a predefined category or create a custom category with their own settings.

**Why this priority**: Category selection determines the route's target and calculation parameters. This is essential for route calculation and must happen before the route can be computed.

**Independent Test**: Can be fully tested by selecting a predefined category or creating a custom category, and verifying the system stores the category configuration and proceeds to route calculation.

**Acceptance Scenarios**:

1. **Given** the user has completed initial setup, **When** they proceed to category selection, **Then** the system presents options to choose a predefined category or create a custom category
2. **Given** the user selects a predefined category, **When** they view the category, **Then** the system displays the category's default settings (target cookies, version, player CPS, hardcore mode, etc.)
3. **Given** the user selects a predefined category, **When** they adjust any settings, **Then** the system allows modifications and stores the adjusted values
4. **Given** the user chooses to create a custom category, **When** they configure category parameters, **Then** the system allows them to set target cookies, version, player CPS, player delay, hardcore mode, and other relevant settings
5. **Given** the user has selected or configured a category, **When** they proceed, **Then** the system uses the category configuration for route calculation

---

### User Story 3 - Calculate and Save Route (Priority: P1)

A user wants the system to calculate the optimal route based on their setup and category selection, then save it for future use.

**Why this priority**: Route calculation and saving is the final step that delivers the core value. Without this, the wizard process is incomplete and users cannot access their calculated routes.

**Independent Test**: Can be fully tested by completing the wizard steps, triggering route calculation, and verifying the route is calculated, displayed, and saved successfully.

**Acceptance Scenarios**:

1. **Given** the user has completed initial setup and category selection, **When** they proceed to route calculation, **Then** the system calculates the optimal building purchase route using the configured starting state and category parameters
2. **Given** route calculation is in progress, **When** the system is calculating, **Then** the user sees progress indicators showing calculation status
3. **Given** route calculation completes successfully, **When** the route is ready, **Then** the system displays the calculated route with all building steps in optimal order
4. **Given** a route has been calculated, **When** the calculation completes, **Then** the route is automatically saved and ready for the user to follow along
5. **Given** a route has been saved, **When** the user views their saved routes, **Then** the newly created route appears in the list with appropriate metadata

---

### User Story 4 - Navigate Through Wizard Steps (Priority: P2)

A user wants to move forward and backward through the wizard steps, reviewing and modifying their choices before finalizing the route calculation.

**Why this priority**: Users need flexibility to correct mistakes, review their selections, and understand the process. Navigation controls improve usability and reduce errors.

**Independent Test**: Can be fully tested by moving forward and backward through wizard steps, modifying previous selections, and verifying changes are preserved.

**Acceptance Scenarios**:

1. **Given** the user is on any wizard step, **When** they click "Next", **Then** the system advances to the next step if all required information is provided
2. **Given** the user is on any step after the first, **When** they click "Back", **Then** the system returns to the previous step with all previously entered data preserved
3. **Given** the user navigates back to a previous step, **When** they modify their selections, **Then** the system updates the configuration and allows them to proceed forward again
4. **Given** the user is on the final step, **When** they review their configuration, **Then** the system displays a summary of their choices (starting state, category, settings)
5. **Given** the user wants to cancel the wizard, **When** they click "Cancel" or close the wizard, **Then** the system discards any unsaved progress and returns to the main interface

---

### User Story 5 - Validate Inputs and Handle Errors (Priority: P2)

A user wants clear feedback when they provide invalid input or when errors occur during the wizard process, with guidance on how to fix issues.

**Why this priority**: Error handling prevents user frustration and ensures data integrity. Users need to understand what went wrong and how to correct it.

**Independent Test**: Can be fully tested by providing invalid inputs at each step and verifying appropriate error messages are displayed with guidance for correction.

**Acceptance Scenarios**:

1. **Given** the user attempts to import an invalid save game, **When** the import fails, **Then** the system displays a clear error message explaining what went wrong and how to fix it
2. **Given** the user tries to proceed without selecting a category, **When** they click "Next", **Then** the system prevents advancement and highlights the missing required information
3. **Given** the user provides invalid category parameters (e.g., negative target cookies), **When** they attempt to proceed, **Then** the system validates inputs and shows specific error messages for invalid fields
4. **Given** route calculation fails, **When** an error occurs, **Then** the system displays an error message and allows the user to modify their configuration and retry
5. **Given** the user provides incomplete information, **When** they attempt to proceed, **Then** the system identifies missing required fields and guides them to complete the information

---

### Edge Cases

- What happens when a user imports a save game, then navigates back and chooses to manually set up buildings instead?
- How does the system handle a user who starts fresh, then navigates back and decides to import a save game?
- What happens when a user selects a predefined category, adjusts settings, then navigates back and selects a different predefined category?
- How does the system handle route calculation when the starting buildings conflict with the category's initial buildings?
- What happens when a user creates a custom category with settings that make route calculation impossible (e.g., target already reached)?
- How does the system handle navigation when the user is on the final step and wants to go back multiple steps?
- What happens when a user closes the browser during the wizard process?
- How does the system handle very long route calculations that take significant time?
- What happens when a user tries to create a route with a category name that already exists?
- How does the system handle a user who modifies imported save game data after importing it?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present a multistep wizard interface for route creation with clear step indicators
- **FR-002**: System MUST provide three options for initial setup: import save game, manually set up buildings, or start fresh
- **FR-003**: System MUST allow users to import a save game string and extract starting buildings, version, and game settings
- **FR-004**: System MUST allow users to manually configure starting buildings before route calculation
- **FR-005**: System MUST support starting from a fresh state with no pre-owned buildings
- **FR-006**: System MUST allow users to select from predefined categories in the category selection step
- **FR-007**: System MUST allow users to adjust settings of predefined categories (target cookies, version, player CPS, hardcore mode, etc.)
- **FR-008**: System MUST allow users to create custom categories with configurable parameters
- **FR-009**: System MUST validate all user inputs at each wizard step before allowing progression
- **FR-010**: System MUST calculate the optimal route using the configured starting state and category parameters
- **FR-011**: System MUST automatically save the calculated route upon successful calculation
- **FR-012**: System MUST display the calculated route to the user after calculation completes
- **FR-013**: System MUST provide navigation controls (Next, Back, Cancel) for moving through wizard steps
- **FR-014**: System MUST preserve user input when navigating backward and forward through steps
- **FR-015**: System MUST display progress indicators during route calculation
- **FR-016**: System MUST show a summary of user selections before final route calculation
- **FR-017**: System MUST handle errors gracefully with clear error messages and recovery options
- **FR-018**: System MUST prevent progression to the next step if required information is missing
- **FR-019**: System MUST merge imported save game data with manually configured buildings (manual settings take precedence)
- **FR-020**: System MUST allow users to modify their selections at any step before final calculation

### Key Entities *(include if feature involves data)*

- **WizardState**: Represents the current state of the route creation wizard, including the current step, initial setup choice (import/manual/fresh), starting buildings configuration, selected or created category, and any validation errors
- **RouteCreationConfig**: Represents the complete configuration assembled through the wizard, including starting buildings, category parameters, game version, and all settings needed for route calculation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the entire route creation wizard (from start to calculated route) in under 2 minutes for predefined categories
- **SC-002**: 90% of users can successfully create a route through the wizard on their first attempt without assistance
- **SC-003**: Route calculation completes and saves successfully for 95% of valid wizard configurations
- **SC-004**: Users can navigate backward and forward through wizard steps without losing any entered data
- **SC-005**: Error messages are displayed within 1 second of invalid input, with clear guidance on how to fix the issue
- **SC-006**: Imported save games are processed and validated within 3 seconds for typical save game sizes
- **SC-007**: The wizard guides users through all required steps with 100% of required fields validated before route calculation
- **SC-008**: Users can modify their selections at any step and have changes reflected in the final route calculation

## Assumptions

- Users understand the concept of importing save games and have access to their save game strings
- Users are familiar with Cookie Clicker game mechanics and building types
- The wizard will be presented as a modal or dedicated interface overlay
- Route calculation may take time for complex categories, and users will wait for completion
- Users may want to create multiple routes and will use the wizard multiple times
- Imported save game data can be merged with manual building configurations
- Predefined categories can be modified by users before route calculation
- The wizard process is linear (step-by-step) but allows backward navigation
- All wizard data is stored in memory during the process and only persisted when the route is calculated and saved
- Users may cancel the wizard at any point, discarding unsaved progress

