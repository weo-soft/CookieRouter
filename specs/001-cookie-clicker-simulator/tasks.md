# Tasks: Cookie Clicker Building Order Simulator

**Input**: Design documents from `/specs/001-cookie-clicker-simulator/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included per constitution requirements (80% coverage for core simulation logic, 60% overall).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/` at repository root
- Paths follow plan.md structure: `src/js/`, `src/data/`, `src/styles/`, `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan (src/, tests/, public/ directories)
- [x] T002 Initialize Vite project with package.json and vite.config.js
- [x] T003 [P] Configure ESLint with eslint.config.js
- [x] T004 [P] Configure Vitest with vitest.config.js
- [x] T005 [P] Create index.html entry point in src/index.html
- [x] T006 [P] Create main.js application entry point in src/main.js
- [x] T007 [P] Create main.css stylesheet in src/styles/main.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Port Game class from Python to JavaScript in src/js/game.js
- [x] T009 Port Router class from Python to JavaScript in src/js/router.js
- [x] T010 [P] Port game version v2031 data to src/data/versions/v2031.js
- [ ] T011 [P] Port game version v2048 data to src/data/versions/v2048.js
- [ ] T012 [P] Port game version v10466 data to src/data/versions/v10466.js
- [ ] T013 [P] Port game version v10466_xmas data to src/data/versions/v10466_xmas.js
- [x] T014 Port predefined categories from Python to src/js/categories.js
- [x] T015 Implement localStorage wrapper utilities in src/js/storage.js
- [x] T016 Implement number formatting utility in src/js/utils/format.js
- [x] T017 [P] Write unit tests for Game class in tests/unit/game.test.js
- [x] T018 [P] Write unit tests for Router class in tests/unit/router.test.js
- [x] T019 [P] Write unit tests for storage utilities in tests/unit/storage.test.js
- [x] T020 [P] Write unit tests for categories in tests/unit/categories.test.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Simulate Predefined Category Route (Priority: P1) 🎯 MVP

**Goal**: User selects a predefined category and sees the optimal building purchase route calculated and displayed

**Independent Test**: Select a predefined category, run simulation, verify detailed building order list is displayed with buildings in optimal purchase sequence

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [P] [US1] Write integration test for category selection and route calculation in tests/integration/category-selection.test.js

### Implementation for User Story 1

- [x] T022 [US1] Create category selector UI component in src/js/ui/category-selector.js
- [x] T023 [US1] Create route display UI component in src/js/ui/route-display.js
- [x] T024 [US1] Implement calculateRoute function that uses Router to generate routes in src/js/simulation.js
- [x] T025 [US1] Implement route saving to localStorage after calculation in src/js/simulation.js
- [x] T026 [US1] Integrate category selector with main application in src/main.js
- [x] T027 [US1] Integrate route display with main application in src/main.js
- [x] T028 [US1] Add loading indicator during route calculation in src/js/ui/route-display.js
- [x] T029 [US1] Add error handling for failed route calculations in src/js/ui/route-display.js
- [x] T030 [US1] Style category selector and route display components in src/styles/main.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Track Progress Through Route (Priority: P2)

**Goal**: User can check off buildings in a displayed route to track progress, with state persisting across sessions

**Independent Test**: Check off buildings in a displayed route, verify checked state persists and visually indicates progress through the route

### Tests for User Story 2

- [x] T031 [P] [US2] Write unit test for progress tracking in tests/unit/progress.test.js

### Implementation for User Story 2

- [x] T032 [US2] Add checkbox functionality to route display component in src/js/ui/route-display.js
- [x] T033 [US2] Implement progress save to localStorage when checkbox is toggled in src/js/ui/route-display.js
- [x] T034 [US2] Implement progress load from localStorage when route is displayed in src/js/ui/route-display.js
- [x] T035 [US2] Add visual progress indicators (e.g., completed count, progress bar) in src/js/ui/route-display.js
- [x] T036 [US2] Style progress tracking UI elements in src/styles/main.css

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Customize Simulation with Starting Buildings (Priority: P3)

**Goal**: User can specify buildings they already own, and simulation calculates route starting from that state

**Independent Test**: Select buildings already owned, run simulation, verify route starts from appropriate point and only includes buildings not yet purchased

### Tests for User Story 3

- [x] T037 [P] [US3] Write unit test for starting buildings functionality in tests/integration/simulation.test.js

### Implementation for User Story 3

- [x] T038 [US3] Create starting buildings selector UI component in src/js/ui/starting-buildings.js
- [x] T039 [US3] Integrate starting buildings selector with category selection in src/main.js
- [x] T040 [US3] Modify calculateRoute to accept and use starting buildings parameter in src/js/simulation.js
- [x] T041 [US3] Update Game initialization to use starting buildings in src/js/game.js
- [x] T042 [US3] Add validation for starting buildings (valid building names) in src/js/ui/starting-buildings.js
- [x] T043 [US3] Style starting buildings selector in src/styles/main.css

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Create and Store Custom Categories (Priority: P4)

**Goal**: User can create custom categories with custom goals and parameters, save them, and use them for simulations

**Independent Test**: Create a new category with custom parameters, save it, verify it appears in category list and can be used for simulations

### Tests for User Story 4

- [x] T044 [P] [US4] Write unit test for custom category creation and storage in tests/unit/categories.test.js

### Implementation for User Story 4

- [x] T045 [US4] Create custom category form UI component in src/js/ui/custom-category-form.js
- [x] T046 [US4] Implement category validation according to data-model.md in src/js/ui/custom-category-form.js
- [x] T047 [US4] Implement custom category save to localStorage in src/js/ui/custom-category-form.js
- [x] T048 [US4] Update category selector to include user-created categories in src/js/ui/category-selector.js
- [x] T049 [US4] Implement category deletion functionality in src/js/ui/category-selector.js
- [x] T050 [US4] Add error handling for duplicate category names in src/js/ui/custom-category-form.js
- [x] T051 [US4] Style custom category form in src/styles/main.css

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T052 [P] Add responsive design for mobile and desktop in src/styles/main.css
- [ ] T053 [P] Add keyboard navigation and accessibility features (WCAG 2.1 Level AA) across all UI components
- [ ] T054 [P] Add error messages for localStorage quota exceeded in src/js/storage.js
- [ ] T055 [P] Add data validation and error recovery for corrupted localStorage data in src/js/storage.js
- [ ] T056 Performance optimization: Profile route calculation and add Web Workers if needed in src/js/simulation.js
- [ ] T057 Add comprehensive error handling and user-friendly error messages across all components
- [ ] T058 [P] Add integration tests for complete user journeys in tests/integration/user-journeys.test.js
- [ ] T059 Code cleanup and refactoring: Review all code for complexity limits and documentation
- [ ] T060 Run quickstart.md validation and update if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for route display component
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for simulation integration
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US1 for category selector integration

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core logic before UI components
- UI components before integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T007)
- All Foundational game version data tasks marked [P] can run in parallel (T010-T013)
- All Foundational test tasks marked [P] can run in parallel (T017-T020)
- Once Foundational phase completes, User Stories 1, 2, 3, and 4 can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all foundational game version data tasks together:
Task: "Port game version v2031 data to src/data/versions/v2031.js"
Task: "Port game version v2048 data to src/data/versions/v2048.js"
Task: "Port game version v10466 data to src/data/versions/v10466.js"
Task: "Port game version v10466_xmas data to src/data/versions/v10466_xmas.js"

# Launch all foundational test tasks together:
Task: "Write unit tests for Game class in tests/unit/game.test.js"
Task: "Write unit tests for Router class in tests/unit/router.test.js"
Task: "Write unit tests for storage utilities in tests/unit/storage.test.js"
Task: "Write unit tests for categories in tests/unit/categories.test.js"
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
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are relative to repository root
- Follow constitution requirements: code quality, testing (80% core, 60% overall), UX (WCAG 2.1 Level AA), performance (<5s route calculation)

