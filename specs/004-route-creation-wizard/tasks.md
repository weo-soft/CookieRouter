# Tasks: Route Creation Wizard

**Input**: Design documents from `/specs/004-route-creation-wizard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included per constitution requirements (80% coverage for core wizard logic, 60% overall).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/` at repository root
- Paths follow plan.md structure: `src/js/ui/`, `src/styles/`, `tests/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Project structure and HTML container setup

- [x] T001 Add wizard container element to HTML in src/index.html
- [x] T002 [P] Create wizard step indicator component file structure in src/js/ui/wizard-step-indicator.js
- [x] T003 [P] Create wizard initial setup component file structure in src/js/ui/wizard-initial-setup.js
- [x] T004 [P] Create wizard category selection component file structure in src/js/ui/wizard-category-selection.js
- [x] T005 [P] Create wizard summary component file structure in src/js/ui/wizard-summary.js
- [x] T006 [P] Create main wizard component file structure in src/js/ui/route-creation-wizard.js

**Checkpoint**: File structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core wizard infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Implement WizardState data structure and initialization in src/js/ui/route-creation-wizard.js
- [x] T008 Implement basic wizard modal overlay structure in src/js/ui/route-creation-wizard.js
- [x] T009 Implement wizard show() and hide() methods in src/js/ui/route-creation-wizard.js
- [x] T010 [P] Implement wizard step indicator component with step display in src/js/ui/wizard-step-indicator.js
- [x] T011 [P] Add base wizard styles (modal overlay, dialog container) in src/styles/main.css
- [x] T012 [P] Write unit test for WizardState initialization in tests/unit/route-creation-wizard.test.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Start Route Creation with Initial Setup (Priority: P1) 🎯 MVP

**Goal**: User can initiate route creation and set up their starting game state (import save, manual setup, or fresh start)

**Independent Test**: Initiate route creation, select one of three setup options, verify system proceeds to next step with appropriate starting state configured

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US1] Write unit test for wizard initialization and Step 1 display in tests/unit/route-creation-wizard.test.js
- [x] T014 [P] [US1] Write unit test for initial setup choice selection (import/manual/fresh) in tests/unit/wizard-initial-setup.test.js
- [ ] T015 [P] [US1] Write unit test for save game import integration in Step 1 in tests/unit/wizard-initial-setup.test.js
- [ ] T016 [P] [US1] Write unit test for manual buildings configuration in Step 1 in tests/unit/wizard-initial-setup.test.js

### Implementation for User Story 1

- [x] T017 [US1] Implement wizard initial setup component with three option selection (import/manual/fresh) in src/js/ui/wizard-initial-setup.js
- [x] T018 [US1] Integrate SaveGameImportDialog in Step 1 when "Import Save" is selected in src/js/ui/wizard-initial-setup.js
- [x] T019 [US1] Integrate StartingBuildingsSelector in Step 1 when "Manual Setup" is selected in src/js/ui/wizard-initial-setup.js
- [x] T020 [US1] Implement "Start Fresh" option handling (empty buildings) in src/js/ui/wizard-initial-setup.js
- [x] T021 [US1] Implement updateStep1Data() method to store Step 1 choices in wizard state in src/js/ui/route-creation-wizard.js
- [x] T022 [US1] Render Step 1 content in main wizard component in src/js/ui/route-creation-wizard.js
- [x] T023 [US1] Style Step 1 component (option selection UI) in src/styles/main.css
- [x] T024 [US1] Add integration test for Step 1 workflow (all three options) in tests/integration/route-creation-wizard-workflow.test.js

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Select or Configure Category (Priority: P1) 🎯 MVP

**Goal**: User can choose a predefined category or create a custom category with their own settings

**Independent Test**: Select a predefined category or create a custom category, verify system stores category configuration and proceeds to route calculation

### Tests for User Story 2

- [ ] T025 [P] [US2] Write unit test for predefined category selection in Step 2 in tests/unit/wizard-category-selection.test.js
- [ ] T026 [P] [US2] Write unit test for predefined category settings adjustment in Step 2 in tests/unit/wizard-category-selection.test.js
- [ ] T027 [P] [US2] Write unit test for custom category creation in Step 2 in tests/unit/wizard-category-selection.test.js
- [ ] T028 [P] [US2] Write unit test for category configuration storage in wizard state in tests/unit/route-creation-wizard.test.js

### Implementation for User Story 2

- [x] T029 [US2] Implement wizard category selection component with predefined/custom option in src/js/ui/wizard-category-selection.js
- [x] T030 [US2] Integrate CategorySelector in Step 2 for predefined category selection in src/js/ui/wizard-category-selection.js
- [x] T031 [US2] Implement predefined category settings adjustment UI in src/js/ui/wizard-category-selection.js
- [x] T032 [US2] Integrate CustomCategoryForm in Step 2 when "Create Custom" is selected in src/js/ui/wizard-category-selection.js
- [x] T033 [US2] Implement updateStep2Data() method to store Step 2 category configuration in wizard state in src/js/ui/route-creation-wizard.js
- [x] T034 [US2] Render Step 2 content in main wizard component in src/js/ui/route-creation-wizard.js
- [x] T035 [US2] Style Step 2 component (category selection and configuration UI) in src/styles/main.css
- [ ] T036 [US2] Add integration test for Step 2 workflow (predefined and custom) in tests/integration/route-creation-wizard-workflow.test.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Calculate and Save Route (Priority: P1) 🎯 MVP

**Goal**: System calculates optimal route based on setup and category selection, then automatically saves it

**Independent Test**: Complete wizard steps, trigger route calculation, verify route is calculated, displayed, and saved successfully

### Tests for User Story 3

- [ ] T037 [P] [US3] Write unit test for RouteCreationConfig creation from WizardState in tests/unit/route-creation-wizard.test.js
- [ ] T038 [P] [US3] Write unit test for starting buildings merge logic (import + manual, manual precedence) in tests/unit/route-creation-wizard.test.js
- [ ] T039 [P] [US3] Write unit test for route calculation integration in wizard in tests/unit/wizard-summary.test.js
- [ ] T040 [P] [US3] Write unit test for automatic route save after calculation in tests/unit/wizard-summary.test.js

### Implementation for User Story 3

- [x] T041 [US3] Implement wizard summary component displaying all selections in src/js/ui/wizard-summary.js
- [x] T042 [US3] Implement RouteCreationConfig creation from WizardState (merge starting buildings, category config) in src/js/ui/route-creation-wizard.js
- [x] T043 [US3] Implement calculateRoute() method that calls existing calculateRoute function in src/js/ui/route-creation-wizard.js
- [x] T044 [US3] Integrate route calculation progress indicators in Step 3 in src/js/ui/wizard-summary.js
- [x] T045 [US3] Implement automatic route save after successful calculation in src/js/ui/route-creation-wizard.js
- [x] T046 [US3] Implement wizard completion callback (onComplete) with route display in src/js/ui/route-creation-wizard.js
- [x] T047 [US3] Render Step 3 content in main wizard component in src/js/ui/route-creation-wizard.js
- [x] T048 [US3] Style Step 3 component (summary and calculation UI) in src/styles/main.css
- [ ] T049 [US3] Add integration test for complete wizard workflow (all steps to route calculation) in tests/integration/route-creation-wizard-workflow.test.js

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should work together for complete wizard flow

---

## Phase 6: User Story 4 - Navigate Through Wizard Steps (Priority: P2)

**Goal**: User can move forward and backward through wizard steps, reviewing and modifying choices

**Independent Test**: Move forward and backward through wizard steps, modify previous selections, verify changes are preserved

### Tests for User Story 4

- [ ] T050 [P] [US4] Write unit test for nextStep() navigation with validation in tests/unit/route-creation-wizard.test.js
- [ ] T051 [P] [US4] Write unit test for previousStep() navigation with state preservation in tests/unit/route-creation-wizard.test.js
- [ ] T052 [P] [US4] Write unit test for goToStep() navigation method in tests/unit/route-creation-wizard.test.js
- [ ] T053 [P] [US4] Write unit test for state preservation when navigating backward and forward in tests/unit/route-creation-wizard.test.js

### Implementation for User Story 4

- [x] T054 [US4] Implement nextStep() method with step validation before advancement in src/js/ui/route-creation-wizard.js
- [x] T055 [US4] Implement previousStep() method with state restoration in src/js/ui/route-creation-wizard.js
- [x] T056 [US4] Implement goToStep() method for direct step navigation in src/js/ui/route-creation-wizard.js
- [x] T057 [US4] Implement navigation button states (Back disabled on step 0, Next disabled on validation failure) in src/js/ui/route-creation-wizard.js
- [x] T058 [US4] Implement step indicator update on navigation in src/js/ui/wizard-step-indicator.js
- [x] T059 [US4] Implement state restoration when navigating back to previous steps in src/js/ui/wizard-initial-setup.js
- [x] T060 [US4] Implement state restoration when navigating back to previous steps in src/js/ui/wizard-category-selection.js
- [x] T061 [US4] Implement cancel button functionality (discard state, close wizard) in src/js/ui/route-creation-wizard.js
- [ ] T062 [US4] Add integration test for navigation workflow (forward, backward, state preservation) in tests/integration/route-creation-wizard-workflow.test.js

**Checkpoint**: At this point, User Stories 1-4 should work with full navigation support

---

## Phase 7: User Story 5 - Validate Inputs and Handle Errors (Priority: P2)

**Goal**: System provides clear feedback for invalid input and errors, with guidance on how to fix issues

**Independent Test**: Provide invalid inputs at each step, verify appropriate error messages are displayed with guidance for correction

### Tests for User Story 5

- [ ] T063 [P] [US5] Write unit test for Step 1 validation (setup choice required) in tests/unit/route-creation-wizard.test.js
- [ ] T064 [P] [US5] Write unit test for Step 1 validation (invalid save game import) in tests/unit/wizard-initial-setup.test.js
- [ ] T065 [P] [US5] Write unit test for Step 2 validation (category required) in tests/unit/route-creation-wizard.test.js
- [ ] T066 [P] [US5] Write unit test for Step 2 validation (invalid category parameters) in tests/unit/wizard-category-selection.test.js
- [ ] T067 [P] [US5] Write unit test for route calculation error handling in tests/unit/wizard-summary.test.js
- [ ] T068 [P] [US5] Write unit test for error message display timing (within 1 second) in tests/unit/route-creation-wizard.test.js

### Implementation for User Story 5

- [x] T069 [US5] Implement validateCurrentStep() method for Step 1 validation in src/js/ui/route-creation-wizard.js
- [x] T070 [US5] Implement validateCurrentStep() method for Step 2 validation in src/js/ui/route-creation-wizard.js
- [x] T071 [US5] Implement validation error storage in WizardState.validationErrors in src/js/ui/route-creation-wizard.js
- [x] T072 [US5] Implement inline error message display in Step 1 component in src/js/ui/wizard-initial-setup.js
- [x] T073 [US5] Implement inline error message display in Step 2 component in src/js/ui/wizard-category-selection.js
- [x] T074 [US5] Implement error message display for invalid save game import in src/js/ui/wizard-initial-setup.js
- [x] T075 [US5] Implement error message display for invalid category parameters in src/js/ui/wizard-category-selection.js
- [x] T076 [US5] Implement route calculation error handling and display in Step 3 in src/js/ui/wizard-summary.js
- [x] T077 [US5] Implement error recovery (allow navigation back to fix issues) in src/js/ui/route-creation-wizard.js
- [x] T078 [US5] Implement field highlighting for validation errors in src/js/ui/wizard-initial-setup.js
- [x] T079 [US5] Implement field highlighting for validation errors in src/js/ui/wizard-category-selection.js
- [x] T080 [US5] Style error messages and validation feedback in src/styles/main.css
- [ ] T081 [US5] Add integration test for error handling workflow (invalid inputs, error messages, recovery) in tests/integration/route-creation-wizard-workflow.test.js

**Checkpoint**: At this point, all user stories should be complete with full validation and error handling

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final polish, accessibility, performance optimization, and integration with main application

- [ ] T082 Add "Create Route" button to main application interface in src/index.html
- [ ] T083 Integrate wizard with main application (initialize, show on button click) in src/main.js
- [ ] T084 Implement keyboard navigation (Enter for Next, Escape for Cancel) in src/js/ui/route-creation-wizard.js
- [ ] T085 Implement focus management (focus first field on step change, trap focus in modal) in src/js/ui/route-creation-wizard.js
- [ ] T086 Add ARIA labels and roles for accessibility in src/js/ui/route-creation-wizard.js
- [ ] T087 Add ARIA labels and roles for accessibility in src/js/ui/wizard-step-indicator.js
- [ ] T088 Add ARIA labels and roles for accessibility in src/js/ui/wizard-initial-setup.js
- [ ] T089 Add ARIA labels and roles for accessibility in src/js/ui/wizard-category-selection.js
- [ ] T090 Add ARIA labels and roles for accessibility in src/js/ui/wizard-summary.js
- [ ] T091 Optimize step transition performance (target < 100ms) in src/js/ui/route-creation-wizard.js
- [ ] T092 Add responsive design styles for mobile devices in src/styles/main.css
- [ ] T093 Add loading states and animations for step transitions in src/styles/main.css
- [ ] T094 Verify all tests pass and coverage meets thresholds (80% core, 60% overall)
- [ ] T095 Run ESLint and fix any code quality issues
- [ ] T096 Perform accessibility audit (WCAG 2.1 Level AA)
- [ ] T097 Perform performance testing (step transitions, error display, import processing)
- [ ] T098 Update documentation (README if applicable, code comments)

**Checkpoint**: Feature complete and ready for review

---

## Dependencies

### User Story Completion Order

1. **Phase 1-2**: Setup and Foundational (MUST complete first)
2. **Phase 3**: User Story 1 - Initial Setup (P1, can start after Phase 2)
3. **Phase 4**: User Story 2 - Category Selection (P1, can start after Phase 2, depends on US1 for full flow)
4. **Phase 5**: User Story 3 - Calculate and Save Route (P1, depends on US1 and US2)
5. **Phase 6**: User Story 4 - Navigation (P2, depends on US1, US2, US3)
6. **Phase 7**: User Story 5 - Validation and Error Handling (P2, depends on US1, US2, US3, US4)
7. **Phase 8**: Polish (depends on all user stories)

### Parallel Execution Opportunities

**Within Phase 3 (US1)**:
- T013-T016 (tests) can run in parallel
- T017-T020 (component implementation) can run in parallel after T017

**Within Phase 4 (US2)**:
- T025-T028 (tests) can run in parallel
- T029-T032 (component implementation) can run in parallel after T029

**Within Phase 5 (US3)**:
- T037-T040 (tests) can run in parallel
- T041-T044 (component implementation) can run in parallel

**Within Phase 6 (US4)**:
- T050-T053 (tests) can run in parallel
- T054-T058 (navigation methods) can run in parallel after T054

**Within Phase 7 (US5)**:
- T063-T068 (tests) can run in parallel
- T069-T075 (validation implementation) can run in parallel after T069-T070

**Within Phase 8 (Polish)**:
- T082-T090 (accessibility and integration) can run in parallel
- T091-T093 (performance and styling) can run in parallel

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Suggested MVP**: Phases 1-5 (Setup, Foundational, US1, US2, US3)

This provides:
- Complete wizard flow from start to calculated route
- All three setup options (import/manual/fresh)
- Category selection (predefined and custom)
- Automatic route calculation and saving
- Basic step indicators

**MVP excludes**:
- Backward navigation (Phase 6)
- Comprehensive validation and error handling (Phase 7)
- Full accessibility polish (Phase 8)

### Incremental Delivery

1. **Sprint 1**: Phases 1-3 (Setup, Foundational, US1) - Users can start wizard and configure initial setup
2. **Sprint 2**: Phase 4 (US2) - Users can select/configure categories
3. **Sprint 3**: Phase 5 (US3) - Users can complete wizard and get calculated route
4. **Sprint 4**: Phases 6-7 (US4, US5) - Full navigation and validation
5. **Sprint 5**: Phase 8 (Polish) - Accessibility, performance, final integration

## Task Summary

- **Total Tasks**: 98
- **Setup Tasks**: 6 (Phase 1)
- **Foundational Tasks**: 6 (Phase 2)
- **User Story 1 Tasks**: 12 (Phase 3)
- **User Story 2 Tasks**: 12 (Phase 4)
- **User Story 3 Tasks**: 13 (Phase 5)
- **User Story 4 Tasks**: 13 (Phase 6)
- **User Story 5 Tasks**: 19 (Phase 7)
- **Polish Tasks**: 17 (Phase 8)

## Independent Test Criteria

- **US1**: Can initiate wizard, select setup option, proceed to Step 2
- **US2**: Can select predefined category or create custom, proceed to Step 3
- **US3**: Can complete wizard, calculate route, verify route is saved and displayed
- **US4**: Can navigate forward/backward, modify selections, verify state preserved
- **US5**: Can see validation errors, fix issues, verify error messages are clear and actionable

