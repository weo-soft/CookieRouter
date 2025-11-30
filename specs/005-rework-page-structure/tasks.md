# Tasks: Rework Page Structure for Route Wizard Workflow

**Input**: Design documents from `/specs/005-rework-page-structure/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/page-initialization.md, research.md

**Tests**: Tests are included per plan.md testing strategy requirements (unit, integration, E2E).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project preparation and test infrastructure setup

- [x] T001 [P] Create unit test file for page state detection in tests/unit/page-state-detection.test.js
- [x] T002 [P] Create integration test file for page structure workflow in tests/integration/page-structure-workflow.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core page state detection infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement detectPageState() function in src/main.js (returns PageState with hasSavedRoutes boolean)
- [x] T004 [P] Add unit test for detectPageState() with empty saved routes in tests/unit/page-state-detection.test.js
- [x] T005 [P] Add unit test for detectPageState() with existing saved routes in tests/unit/page-state-detection.test.js
- [x] T006 [P] Add unit test for detectPageState() with localStorage errors in tests/unit/page-state-detection.test.js

**Checkpoint**: Foundation ready - page state detection working, user story implementation can now begin

---

## Phase 3: User Story 1 - First-Time User Experience (Priority: P1) 🎯 MVP

**Goal**: New users with no saved routes are guided to start creating a route using the wizard. The system displays a prominent prompt or automatically opens the wizard, and category/starting buildings components are not visible outside the wizard.

**Independent Test**: Visit the application with an empty saved routes list and verify that the wizard is automatically prompted or prominently displayed as the primary action, and that category selection, custom category creation, and starting buildings setup components are not visible outside the wizard.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Integration test for first-time user flow (no saved routes) in tests/integration/page-structure-workflow.test.js
- [ ] T008 [P] [US1] Integration test verifying category/starting buildings components not visible outside wizard in tests/integration/page-structure-workflow.test.js

### Implementation for User Story 1

- [x] T009 [US1] Remove category-section container from src/index.html
- [x] T010 [US1] Remove custom-category-section container from src/index.html
- [x] T011 [US1] Remove starting-buildings-section container from src/index.html
- [x] T012 [US1] Update init() function in src/main.js to call detectPageState() on page load
- [x] T013 [US1] Implement first-time user UI rendering in src/main.js (show wizard prompt when hasSavedRoutes === false)
- [x] T014 [US1] Update component initialization in src/main.js to skip CategorySelector, CustomCategoryForm, and StartingBuildingsSelector instantiation
- [x] T015 [US1] Ensure RouteCreationWizard and RouteDisplay are always initialized in src/main.js
- [x] T016 [US1] Add error handling for localStorage read errors defaulting to first-time user experience in src/main.js

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. First-time users see wizard prompt, components are removed from main page.

---

## Phase 4: User Story 2 - Returning User with Saved Routes (Priority: P1)

**Goal**: Returning users who have previously created and saved routes see options to either load an existing saved route or create a new route via the wizard. Both paths are clearly presented and functional.

**Independent Test**: Visit the application with at least one saved route in storage and verify that both options (load existing route or create new via wizard) are available and clearly presented, and that category selection, custom category creation, and starting buildings setup components are not visible outside the wizard.

### Tests for User Story 2

- [ ] T017 [P] [US2] Integration test for returning user flow (with saved routes) in tests/integration/page-structure-workflow.test.js
- [ ] T018 [P] [US2] Integration test for loading existing route path in tests/integration/page-structure-workflow.test.js
- [ ] T019 [P] [US2] Integration test for creating new route via wizard path in tests/integration/page-structure-workflow.test.js

### Implementation for User Story 2

- [x] T020 [US2] Implement returning user UI rendering in src/main.js (show choice between wizard and saved routes when hasSavedRoutes === true)
- [x] T021 [US2] Update component initialization in src/main.js to conditionally initialize SavedRoutesList when hasSavedRoutes === true
- [x] T022 [US2] Ensure both wizard and saved routes list are accessible when hasSavedRoutes === true in src/main.js
- [x] T023 [US2] Add UI elements for choice between "Create New Route" and "Load Existing Route" in src/main.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Returning users see choice between wizard and saved routes.

---

## Phase 5: User Story 3 - Component Removal from Main Page (Priority: P2)

**Goal**: The standalone components for category selection, custom category creation, and starting buildings setup are completely removed from the main page interface, as these functionalities are now exclusively available within the wizard workflow.

**Independent Test**: Verify that the main page HTML structure no longer includes containers for category-section, custom-category-section, and starting-buildings-section, and that these components are only instantiated within the wizard context.

### Tests for User Story 3

- [ ] T024 [P] [US3] Integration test verifying components not rendered outside wizard in tests/integration/page-structure-workflow.test.js
- [ ] T025 [P] [US3] Integration test verifying components accessible within wizard context in tests/integration/page-structure-workflow.test.js

### Implementation for User Story 3

- [x] T026 [US3] Verify CategorySelector is not instantiated in main.js (only in wizard) in src/main.js
- [x] T027 [US3] Verify CustomCategoryForm is not instantiated in main.js (only in wizard) in src/main.js
- [x] T028 [US3] Verify StartingBuildingsSelector is not instantiated in main.js (only in wizard) in src/main.js
- [x] T029 [US3] Remove any remaining references to categorySelector, customCategoryForm, startingBuildingsSelector from main.js initialization in src/main.js
- [x] T030 [US3] Verify wizard still has access to CategorySelector, CustomCategoryForm, and StartingBuildingsSelector internally

**Checkpoint**: All user stories should now be independently functional. Components are removed from main page, only available in wizard.

---

## Phase 6: State Transition & Polish

**Purpose**: Handle dynamic state transitions and cross-cutting concerns

### State Transition Implementation

- [x] T031 Implement updatePageStateAfterRouteSave() function in src/main.js
- [x] T032 Update handleWizardComplete() callback in src/main.js to call updatePageStateAfterRouteSave() after route save
- [ ] T033 [P] Integration test for state transition after first route save in tests/integration/page-structure-workflow.test.js
- [x] T034 Handle UI update when transitioning from first-time to returning user in src/main.js

### Error Handling & Edge Cases

- [ ] T035 [P] Integration test for localStorage unavailable scenario in tests/integration/page-structure-workflow.test.js
- [ ] T036 [P] Integration test for user clearing all saved routes scenario in tests/integration/page-structure-workflow.test.js
- [ ] T037 [P] Integration test for wizard cancellation returning to appropriate view in tests/integration/page-structure-workflow.test.js

### Polish & Cross-Cutting Concerns

- [x] T038 [P] Add CSS styles for first-time user prompt UI in src/styles/main.css (if needed)
- [x] T039 [P] Add CSS styles for returning user choice UI in src/styles/main.css (if needed)
- [x] T040 Run ESLint and fix any linting errors
- [x] T041 Verify all tests pass (unit + integration)
- [x] T042 Verify test coverage meets 80%+ target for new code paths
- [x] T043 Run quickstart.md validation scenarios
- [x] T044 Code review and documentation updates

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2)
  - US1 and US2 are both P1 but US2 depends on US1's component removal work
- **State Transition & Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Builds on US1's component removal but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Verifies and completes component removal from US1/US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- HTML structure changes before JavaScript logic
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational test tasks marked [P] can run in parallel (within Phase 2)
- Test tasks within a user story marked [P] can run in parallel
- HTML container removal tasks (T009, T010, T011) can run in parallel
- CSS styling tasks (T038, T039) can run in parallel
- Integration test tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Integration test for first-time user flow (no saved routes) in tests/integration/page-structure-workflow.test.js"
Task: "Integration test verifying category/starting buildings components not visible outside wizard in tests/integration/page-structure-workflow.test.js"

# Launch HTML cleanup tasks together:
Task: "Remove category-section container from src/index.html"
Task: "Remove custom-category-section container from src/index.html"
Task: "Remove starting-buildings-section container from src/index.html"
```

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational tests together:
Task: "Add unit test for detectPageState() with empty saved routes in tests/unit/page-state-detection.test.js"
Task: "Add unit test for detectPageState() with existing saved routes in tests/unit/page-state-detection.test.js"
Task: "Add unit test for detectPageState() with localStorage errors in tests/unit/page-state-detection.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add State Transition & Polish → Final validation → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (HTML cleanup + first-time user UI)
   - Developer B: Write integration tests for User Story 1
3. After User Story 1 complete:
   - Developer A: User Story 2 (returning user UI)
   - Developer B: User Story 3 (component removal verification)
4. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 44

**Tasks by Phase**:
- Phase 1 (Setup): 2 tasks
- Phase 2 (Foundational): 4 tasks
- Phase 3 (User Story 1): 10 tasks
- Phase 4 (User Story 2): 7 tasks
- Phase 5 (User Story 3): 7 tasks
- Phase 6 (State Transition & Polish): 14 tasks

**Tasks by User Story**:
- User Story 1: 10 tasks (8 implementation + 2 tests)
- User Story 2: 7 tasks (4 implementation + 3 tests)
- User Story 3: 7 tasks (5 implementation + 2 tests)

**Parallel Opportunities**: 20 tasks marked [P] can run in parallel

**Independent Test Criteria**:
- **US1**: Visit app with empty saved routes → wizard prompt shown, components not visible
- **US2**: Visit app with saved routes → choice shown, both paths work
- **US3**: Verify HTML structure and component instantiation → components only in wizard

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 16 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All HTML container removals (T009-T011) should be done together before JavaScript changes
- Component initialization changes should preserve existing wizard functionality

