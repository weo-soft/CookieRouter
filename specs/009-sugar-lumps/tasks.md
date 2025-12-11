# Tasks: Sugar Lumps Building Upgrades

**Input**: Design documents from `/specs/009-sugar-lumps/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included per plan.md testing strategy (80%+ coverage target for Sugar Lump code paths).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Review existing Game class structure in src/js/game.js
- [x] T002 [P] Review existing Router class structure in src/js/router.js
- [x] T003 [P] Review existing route conversion logic in src/js/simulation.js
- [x] T004 [P] Review existing route display structure in src/js/ui/route-display.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Sugar Lump state tracking that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. All user stories depend on Sugar Lump state tracking in the Game class.

### Tests for Foundational Phase

- [x] T005 [P] Create unit test file for Sugar Lump unlock logic in tests/unit/game-sugar-lumps.test.js
- [x] T006 [P] Create unit test file for building level tracking in tests/unit/game-building-levels.test.js

### Implementation for Foundational Phase

- [x] T007 Add Sugar Lump state properties to Game constructor (parent === null) in src/js/game.js
- [x] T008 Add Sugar Lump state copying to Game copy constructor (parent !== null) in src/js/game.js
- [x] T009 Implement getAvailableSugarLumps() method in src/js/game.js
- [x] T010 Implement checkSugarLumpUnlock() method in src/js/game.js
- [x] T011 Implement upgradeBuildingWithSugarLump() method in src/js/game.js
- [x] T012 Modify buildingRate() method to include Sugar Lump level bonus in src/js/game.js
- [x] T013 Add checkSugarLumpUnlock() calls wherever totalCookies changes in src/js/game.js

**Checkpoint**: Foundation ready - Sugar Lump state tracking is complete. User story implementation can now begin.

---

## Phase 3: User Story 1 - Route Calculation Considers Sugar Lump Upgrades (Priority: P1) 🎯 MVP

**Goal**: Route calculator accounts for Sugar Lump building upgrades when determining optimal building purchase order. System simulates Sugar Lump harvesting and applies building level upgrades to improve CpS calculations.

**Independent Test**: Calculate a route that reaches 1 billion cookies, verify Sugar Lumps are harvested at 24-hour intervals, and confirm building level upgrades are applied to CpS calculations during route optimization.

### Tests for User Story 1

- [x] T014 [P] [US1] Write unit test for Sugar Lump unlock at 1B cookies in tests/unit/game-sugar-lumps.test.js
- [x] T015 [P] [US1] Write unit test for Sugar Lump availability calculation from time in tests/unit/game-sugar-lumps.test.js
- [x] T016 [P] [US1] Write unit test for building level upgrade cost calculation in tests/unit/game-building-levels.test.js
- [x] T017 [P] [US1] Write unit test for building level CpS bonus calculation in tests/unit/game-building-levels.test.js
- [x] T018 [P] [US1] Write unit test for Sugar Lump upgrade child state generation in tests/unit/router-sugar-lumps.test.js
- [x] T019 [US1] Write integration test for route calculation with Sugar Lump upgrades in tests/integration/route-sugar-lumps.test.js

### Implementation for User Story 1

- [x] T020 [US1] Extend Game.children() generator to include Sugar Lump building upgrades in src/js/game.js
- [x] T021 [US1] Ensure Router.routeGPL() evaluates Sugar Lump upgrades as valid moves in src/js/router.js
- [x] T022 [US1] Verify Sugar Lump state is preserved during route calculation in src/js/simulation.js
- [x] T023 [US1] Add Sugar Lump state to route step snapshots in src/js/simulation.js
- [x] T024 [US1] Handle routes that never reach 1B cookies (Sugar Lumps remain locked) in src/js/simulation.js

**Checkpoint**: At this point, User Story 1 should be fully functional. Routes that reach 1B cookies will unlock Sugar Lumps, harvest them every 24 hours, and consider building upgrades during optimization.

---

## Phase 4: User Story 2 - Display Sugar Lump Harvesting in Route (Priority: P2)

**Goal**: Route display shows when Sugar Lumps are harvested and available during route execution. Users can see Sugar Lump harvesting events and track availability throughout the route.

**Independent Test**: Calculate a route that includes Sugar Lump harvesting, verify Sugar Lump harvest events appear in route display at appropriate time intervals, and confirm available Sugar Lump counts are shown.

### Tests for User Story 2

- [x] T025 [P] [US2] Write unit test for Sugar Lump harvest event detection in tests/unit/simulation-sugar-lumps.test.js
- [x] T026 [P] [US2] Write unit test for Sugar Lump harvest step creation in tests/unit/simulation-sugar-lumps.test.js
- [x] T027 [US2] Write integration test for route display with harvest events in tests/integration/route-display-sugar-lumps.test.js

### Implementation for User Story 2

- [x] T028 [US2] Detect Sugar Lump harvest events by comparing availableSugarLumps between steps in src/js/simulation.js
- [x] T029 [US2] Create Sugar Lump harvest step objects with type 'sugarLumpHarvest' in src/js/simulation.js
- [x] T030 [US2] Add harvest step rendering method renderHarvestStep() in src/js/ui/route-display.js
- [x] T031 [US2] Display Sugar Lump harvest events in route step list in src/js/ui/route-display.js
- [x] T032 [US2] Show available Sugar Lump count in route step details in src/js/ui/route-display.js
- [x] T033 [US2] Ensure harvest events appear at correct time intervals (every 24 hours) in route display

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Routes show Sugar Lump harvest events and availability counts.

---

## Phase 5: User Story 3 - Display Building Level Upgrades in Route (Priority: P3)

**Goal**: Route display shows when building level upgrades are applied using Sugar Lumps. Users can see which buildings are upgraded, to what level, and the Sugar Lump cost.

**Independent Test**: Calculate a route that includes Sugar Lump building upgrades, verify building level upgrade steps appear in route display with correct level and cost information.

### Tests for User Story 3

- [x] T034 [P] [US3] Write unit test for building level upgrade event detection in tests/unit/simulation-sugar-lumps.test.js
- [x] T035 [P] [US3] Write unit test for building level upgrade step creation in tests/unit/simulation-sugar-lumps.test.js
- [x] T036 [US3] Write integration test for route display with upgrade events in tests/integration/route-display-sugar-lumps.test.js

### Implementation for User Story 3

- [x] T037 [US3] Detect building level upgrade events by comparing buildingLevels between steps in src/js/simulation.js
- [x] T038 [US3] Create building level upgrade step objects with type 'buildingLevelUpgrade' in src/js/ui/route-display.js
- [x] T039 [US3] Add upgrade step rendering method renderUpgradeStep() in src/js/ui/route-display.js
- [x] T040 [US3] Display building level upgrade events in route step list in src/js/ui/route-display.js
- [x] T041 [US3] Show building name, new level, previous level, and cost in upgrade steps in src/js/ui/route-display.js
- [x] T042 [US3] Ensure multiple level upgrades for same building show as separate steps in route display
- [x] T043 [US3] Verify improved CpS from upgraded buildings is reflected in subsequent route steps

**Checkpoint**: All user stories should now be independently functional. Routes show Sugar Lump harvest events, upgrade events, and improved CpS calculations.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure quality

- [x] T044 [P] Add JSDoc documentation for all Sugar Lump methods in src/js/game.js
- [x] T045 [P] Add JSDoc documentation for Sugar Lump route step types in src/js/simulation.js
- [x] T046 [P] Add JSDoc documentation for Sugar Lump display methods in src/js/ui/route-display.js
- [x] T047 Verify backward compatibility with routes that don't reach 1B cookies
- [x] T048 Verify backward compatibility with existing saved routes (no Sugar Lump fields)
- [x] T049 Add error handling for edge cases (negative time, invalid building names) in src/js/game.js
- [x] T050 Run ESLint and fix any code quality issues
- [ ] T051 Run test coverage report and ensure 80%+ coverage for Sugar Lump code paths
- [ ] T052 Performance test: Verify route calculation overhead <10% for routes reaching 1B cookies
- [ ] T053 Validate quickstart.md implementation steps work correctly
- [ ] T054 Update README or documentation with Sugar Lump feature information

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational completion - Depends on US1 for route calculation
- **User Story 3 (Phase 5)**: Depends on Foundational completion - Depends on US1 for route calculation
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for route calculation with Sugar Lumps
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for route calculation with Sugar Lumps

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Core implementation before display/UI
- Event detection before display rendering
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T004) can run in parallel
- All Foundational test tasks (T005-T006) can run in parallel
- Foundational implementation tasks (T007-T013) must run sequentially (same file)
- All US1 test tasks (T014-T018) can run in parallel
- US1 implementation tasks (T020-T024) must run sequentially (modifying same files)
- All US2 test tasks (T025-T026) can run in parallel
- US2 implementation tasks (T028-T033) can mostly run in parallel (different files)
- All US3 test tasks (T034-T035) can run in parallel
- US3 implementation tasks (T037-T043) can mostly run in parallel (different files)
- All Polish tasks (T044-T054) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T014: "Write unit test for Sugar Lump unlock at 1B cookies in tests/unit/game-sugar-lumps.test.js"
Task T015: "Write unit test for Sugar Lump availability calculation from time in tests/unit/game-sugar-lumps.test.js"
Task T016: "Write unit test for building level upgrade cost calculation in tests/unit/game-building-levels.test.js"
Task T017: "Write unit test for building level CpS bonus calculation in tests/unit/game-building-levels.test.js"
Task T018: "Write unit test for Sugar Lump upgrade child state generation in tests/unit/router-sugar-lumps.test.js"

# These can all be written in parallel by different developers
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task T025: "Write unit test for Sugar Lump harvest event detection in tests/unit/simulation-sugar-lumps.test.js"
Task T026: "Write unit test for Sugar Lump harvest step creation in tests/unit/simulation-sugar-lumps.test.js"

# Implementation tasks that can run in parallel:
Task T030: "Add harvest step rendering method renderHarvestStep() in src/js/ui/route-display.js"
Task T031: "Display Sugar Lump harvest events in route step list in src/js/ui/route-display.js"
Task T032: "Show available Sugar Lump count in route step details in src/js/ui/route-display.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (review existing code)
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Calculate route reaching 1B cookies
   - Verify Sugar Lumps unlock
   - Verify upgrades are considered in route optimization
   - Verify CpS calculations include level bonuses
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - Routes now optimize with Sugar Lump upgrades
3. Add User Story 2 → Test independently → Deploy/Demo
   - Routes now show harvest events
4. Add User Story 3 → Test independently → Deploy/Demo
   - Routes now show upgrade events
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (core optimization)
   - Developer B: User Story 2 (harvest display) - can start after US1 tests pass
   - Developer C: User Story 3 (upgrade display) - can start after US1 tests pass
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
- Sugar Lump calculations must be deterministic (no randomness)
- Maintain backward compatibility with existing routes

---

## Task Summary

- **Total Tasks**: 54
- **Setup Tasks**: 4 (T001-T004)
- **Foundational Tasks**: 9 (T005-T013)
- **User Story 1 Tasks**: 10 (T014-T024)
- **User Story 2 Tasks**: 9 (T025-T033)
- **User Story 3 Tasks**: 10 (T034-T043)
- **Polish Tasks**: 11 (T044-T054)

**Parallel Opportunities**:
- Setup phase: 4 parallel tasks
- Foundational tests: 2 parallel tasks
- US1 tests: 5 parallel tasks
- US2 tests: 2 parallel tasks
- US3 tests: 2 parallel tasks
- Polish phase: 11 parallel tasks

**MVP Scope**: Phases 1-3 (Setup + Foundational + User Story 1)

