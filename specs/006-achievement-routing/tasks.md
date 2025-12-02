# Tasks: Achievement-Based Route Calculation

**Input**: Design documents from `/specs/006-achievement-routing/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/achievement-routing.md, quickstart.md

**Tests**: Tests are included per constitution requirements (80% coverage for new achievement routing code).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/` at repository root
- Paths follow plan.md structure: `src/js/`, `src/data/`, `src/styles/`, `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification of existing infrastructure

- [x] T001 Verify existing achievement data files are accessible (src/data/achievements.json, src/data/achievement-requirements.js)
- [x] T002 [P] Verify existing route calculation system is functional (src/js/simulation.js, src/js/router.js, src/js/game.js)
- [x] T003 [P] Verify existing UI components are accessible (src/js/ui/route-creation-wizard.js, src/js/ui/route-display.js)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core Logic Extensions

- [x] T004 Extend Game class with achievement goal tracking properties in src/js/game.js
- [x] T005 Implement Game.isAchievementGoalMet() method in src/js/game.js
- [x] T006 Extend Router.routeGPL() to check achievement goals in src/js/router.js
- [x] T007 Create achievement utilities module with filtering and search functions in src/js/utils/achievement-utils.js

### Achievement Goal Conversion

- [x] T008 Create setAchievementGoals() helper function to convert achievements to game goals in src/js/simulation.js
- [x] T009 Extend calculateRoute() to handle achievement goals from category object in src/js/simulation.js

### Tests for Foundational Components

- [ ] T010 [P] Write unit tests for Game.isAchievementGoalMet() with all goal types in tests/unit/game.test.js
- [ ] T011 [P] Write unit tests for Router achievement goal checking in tests/unit/router.test.js
- [ ] T012 [P] Write unit tests for achievement utilities (filtering, search) in tests/unit/achievement-utils.test.js
- [ ] T013 [P] Write unit tests for setAchievementGoals() helper function in tests/unit/simulation.test.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Calculate Route for Single Achievement (Priority: P1) 🎯 MVP

**Goal**: User selects a single achievement and sees the optimal building purchase route calculated and displayed

**Independent Test**: Select a single routeable achievement, run simulation, verify detailed building order list is displayed that will result in the achievement being unlocked

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Write integration test for single achievement route calculation in tests/integration/achievement-routing.test.js

### Implementation for User Story 1

- [x] T015 [US1] Create calculateAchievementRoute() function for single achievement in src/js/simulation.js
- [x] T016 [US1] Create wizard achievement selection UI component skeleton in src/js/ui/wizard-achievement-selection.js
- [x] T017 [US1] Implement achievement list display with routeable/non-routeable distinction in src/js/ui/wizard-achievement-selection.js
- [x] T018 [US1] Implement single achievement selection with checkbox in src/js/ui/wizard-achievement-selection.js
- [x] T019 [US1] Display achievement name and requirement description when selected in src/js/ui/wizard-achievement-selection.js
- [x] T020 [US1] Integrate achievement selection step into route creation wizard in src/js/ui/route-creation-wizard.js
- [x] T021 [US1] Pass selected achievement ID to route calculation in src/js/ui/route-creation-wizard.js
- [x] T022 [US1] Extend route display to show achievement requirement met indicator in src/js/ui/route-display.js
- [x] T023 [US1] Add achievement metadata (achievementIds) to route storage format in src/js/storage.js
- [x] T024 [US1] Style achievement selection UI component in src/styles/main.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Calculate Route for Multiple Achievements (Priority: P2)

**Goal**: User selects multiple achievements and sees a single route that efficiently reaches all selected achievement requirements

**Independent Test**: Select multiple achievements, run simulation, verify calculated route meets all selected achievement requirements in the most efficient sequence

### Tests for User Story 2

- [ ] T025 [P] [US2] Write integration test for multiple achievement route calculation in tests/integration/achievement-routing.test.js

### Implementation for User Story 2

- [ ] T026 [US2] Extend calculateAchievementRoute() to accept array of achievement IDs (1-5) in src/js/simulation.js
- [ ] T027 [US2] Implement validation for maximum 5 achievements in calculateAchievementRoute() in src/js/simulation.js
- [ ] T028 [US2] Extend setAchievementGoals() to handle multiple achievements with conflicting requirements in src/js/simulation.js
- [ ] T029 [US2] Implement multi-select functionality in wizard achievement selection component in src/js/ui/wizard-achievement-selection.js
- [ ] T030 [US2] Display all selected achievements with combined requirements summary in src/js/ui/wizard-achievement-selection.js
- [ ] T031 [US2] Track achievement unlocks during route calculation (achievementUnlocks array) in src/js/simulation.js
- [ ] T032 [US2] Extend route display to show which achievements unlock at each step in src/js/ui/route-display.js
- [ ] T033 [US2] Add achievement unlock markers (achievementUnlocks) to route storage format in src/js/storage.js
- [ ] T034 [US2] Display achievement completion summary in route header in src/js/ui/route-display.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Filter and Search Achievements (Priority: P3)

**Goal**: User can quickly find specific achievements from a large list using filters and search

**Independent Test**: Use search and filter options to locate specific achievements and verify only matching achievements are displayed

### Tests for User Story 3

- [ ] T035 [P] [US3] Write unit tests for achievement filtering and search performance (< 100ms for 200+ achievements) in tests/unit/achievement-utils.test.js

### Implementation for User Story 3

- [x] T036 [US3] Implement filterAchievementsByType() function in src/js/utils/achievement-utils.js
- [x] T037 [US3] Implement searchAchievements() function with case-insensitive matching in src/js/utils/achievement-utils.js
- [x] T038 [US3] Implement getRouteableAchievements() filter function in src/js/utils/achievement-utils.js
- [x] T039 [US3] Implement filterAchievements() combined filter function in src/js/utils/achievement-utils.js
- [x] T040 [US3] Add search input field to achievement selection UI in src/js/ui/wizard-achievement-selection.js
- [x] T041 [US3] Add requirement type filter dropdown to achievement selection UI in src/js/ui/wizard-achievement-selection.js
- [x] T042 [US3] Add "Routeable Only" toggle filter to achievement selection UI in src/js/ui/wizard-achievement-selection.js
- [x] T043 [US3] Implement debounced search (100ms) to avoid excessive filtering in src/js/ui/wizard-achievement-selection.js
- [x] T044 [US3] Implement combined filter application (all active filters) in src/js/ui/wizard-achievement-selection.js
- [x] T045 [US3] Style search and filter UI elements in src/styles/main.css

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - View Achievement Requirements Before Routing (Priority: P3)

**Goal**: User can view detailed requirement information for each achievement before selecting it for routing

**Independent Test**: View achievement details and verify requirement information is clearly displayed and understandable

### Tests for User Story 4

- [ ] T046 [P] [US4] Write unit tests for achievement requirement display formatting in tests/unit/achievement-utils.test.js

### Implementation for User Story 4

- [x] T047 [US4] Create formatAchievementRequirement() utility function to format requirement display in src/js/utils/achievement-utils.js
- [x] T048 [US4] Implement achievement detail view/modal in wizard achievement selection component in src/js/ui/wizard-achievement-selection.js
- [x] T049 [US4] Display achievement name, description, and specific requirement values in detail view in src/js/ui/wizard-achievement-selection.js
- [x] T050 [US4] Format building count requirements (building name and count) in detail view in src/js/ui/wizard-achievement-selection.js
- [x] T051 [US4] Format CPS requirements (target CPS value) in detail view in src/js/ui/wizard-achievement-selection.js
- [x] T052 [US4] Format total cookies requirements (target cookie amount) in detail view in src/js/ui/wizard-achievement-selection.js
- [x] T053 [US4] Display non-routeable achievement explanation (reason) in detail view in src/js/ui/wizard-achievement-selection.js
- [x] T054 [US4] Add click/hover interaction to show achievement details in achievement list in src/js/ui/wizard-achievement-selection.js
- [x] T055 [US4] Style achievement detail view/modal in src/styles/main.css

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and edge case handling

### Edge Case Handling

- [x] T056 [P] Handle achievement requirements already met by starting game state in src/js/simulation.js
- [x] T057 [P] Handle achievements that cannot be reached (insufficient cookies) with clear error message in src/js/simulation.js
- [x] T058 [P] Handle zero achievements selected with validation error in src/js/ui/wizard-achievement-selection.js
- [x] T059 [P] Handle building level achievements with note about manual sugar lump management in src/js/ui/wizard-achievement-selection.js
- [x] T060 [P] Handle very large achievement requirement values (formatting) in src/js/utils/achievement-utils.js

### Integration & Compatibility

- [x] T061 Integrate achievement-based routing with existing starting buildings functionality in src/js/simulation.js
- [x] T062 Integrate achievement-based routing with existing save game import functionality in src/js/simulation.js
- [x] T063 Ensure backward compatibility with existing cookie-based routes in src/js/storage.js
- [x] T064 Add achievement route filtering/search in saved routes list in src/js/ui/saved-routes-list.js

### Performance & UX

- [ ] T065 [P] Verify achievement route calculation performance meets SC-002 (single: < 2x cookie routes) in tests/integration/achievement-routing.test.js
- [ ] T066 [P] Verify achievement route calculation performance meets SC-003 (multiple: < 3x single) in tests/integration/achievement-routing.test.js
- [ ] T067 [P] Verify achievement filtering/search performance meets SC-004 (< 100ms for 200+ achievements) in tests/unit/achievement-utils.test.js
- [x] T068 Add loading indicators during achievement route calculation in src/js/ui/route-creation-wizard.js
- [x] T069 Add error handling for invalid/non-routeable achievement selection in src/js/ui/wizard-achievement-selection.js
- [x] T070 Add keyboard navigation and accessibility features (WCAG 2.1 Level AA) to achievement selection UI in src/js/ui/wizard-achievement-selection.js

### Code Quality

- [x] T071 [P] Code review: Verify all new code follows existing style patterns and documentation standards
- [x] T072 [P] Run ESLint and fix any linting errors in new code
- [ ] T073 [P] Verify test coverage meets 80% threshold for new achievement routing code
- [x] T074 [P] Review code complexity (cyclomatic complexity < 10 per function) in all new files

### Documentation

- [ ] T075 Update quickstart.md with any implementation changes discovered during development
- [x] T076 Add JSDoc comments to all new public functions and classes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for single achievement route calculation
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for achievement selection UI component
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for achievement selection UI component

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core logic before UI components
- UI components before integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Within Foundational Phase (Phase 2)**:
- T010, T011, T012, T013 can run in parallel (different test files)

**Within User Story 1 (Phase 3)**:
- T014 (test) can run in parallel with T015-T024 (implementation) after test is written

**Within User Story 2 (Phase 4)**:
- T025 (test) can run in parallel with T026-T034 (implementation) after test is written

**Within User Story 3 (Phase 5)**:
- T035 (test) can run in parallel with T036-T045 (implementation) after test is written
- T036, T037, T038, T039 can run in parallel (different utility functions)

**Within User Story 4 (Phase 6)**:
- T046 (test) can run in parallel with T047-T055 (implementation) after test is written

**Within Polish Phase (Phase 7)**:
- T056-T060 (edge cases) can run in parallel
- T065, T066, T067 (performance tests) can run in parallel
- T071, T072, T073, T074 (code quality) can run in parallel

### Implementation Strategy

**MVP Scope**: User Story 1 (P1) - Single Achievement Route Calculation
- Provides core value: users can calculate routes for individual achievements
- Can be tested and validated independently
- Establishes foundation for multiple achievement support

**Incremental Delivery**:
1. **MVP (US1)**: Single achievement routing → deploy and validate
2. **Enhancement (US2)**: Multiple achievement routing → deploy and validate
3. **UX Improvement (US3)**: Filter and search → deploy and validate
4. **UX Improvement (US4)**: Requirement details → deploy and validate
5. **Polish**: Edge cases, performance, integration → final release

---

## Task Summary

**Total Tasks**: 76

**Tasks by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 10 tasks
- Phase 3 (User Story 1 - P1): 11 tasks
- Phase 4 (User Story 2 - P2): 10 tasks
- Phase 5 (User Story 3 - P3): 11 tasks
- Phase 6 (User Story 4 - P3): 10 tasks
- Phase 7 (Polish): 21 tasks

**Tasks by User Story**:
- User Story 1: 11 tasks (MVP)
- User Story 2: 10 tasks
- User Story 3: 11 tasks
- User Story 4: 10 tasks

**Parallel Opportunities**: 25+ tasks can be executed in parallel

**Independent Test Criteria**:
- **US1**: Select single routeable achievement → verify route unlocks achievement
- **US2**: Select multiple achievements → verify route unlocks all achievements
- **US3**: Use search/filter → verify only matching achievements displayed
- **US4**: View achievement details → verify requirement information displayed

**Suggested MVP Scope**: User Story 1 (P1) - 11 tasks in Phase 3

