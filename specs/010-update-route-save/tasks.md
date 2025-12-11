# Tasks: Update Route from Save Game

**Input**: Design documents from `/specs/010-update-route-save/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included per constitution requirements (80% coverage for core update logic, 60% overall).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/` at repository root
- Paths follow plan.md structure: `src/js/`, `src/styles/`, `tests/`

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Create route update utility module with progress preservation logic in src/js/utils/route-update.js
- [x] T002 [P] Write unit tests for progress preservation algorithm in tests/unit/progress-preservation.test.js
- [x] T003 [P] Write unit tests for route update validation logic in tests/unit/route-update.test.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2: User Story 1 - Update Saved Route with Current Save Game (Priority: P1) 🎯 MVP

**Goal**: User imports save game data and triggers route update, which recalculates the route using imported data as new starting point

**Independent Test**: Select a saved route, import a save game, trigger an update, and verify the route is recalculated with the new starting state

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Write unit test for updateSavedRoute function in tests/unit/route-update.test.js
- [x] T005 [P] [US1] Write integration test for route update workflow (import → update → verify) in tests/integration/route-update-workflow.test.js

### Implementation for User Story 1

- [x] T006 [US1] Extend storage.js with updateSavedRoute function that recalculates and updates route in src/js/storage.js
- [x] T007 [US1] Implement route update validation (check imported save game exists, route exists) in src/js/utils/route-update.js
- [x] T008 [US1] Implement route recalculation using calculateRoute with imported save game data in src/js/storage.js
- [x] T009 [US1] Add "Update Route" button to route display component (show when saved route + imported save game) in src/js/ui/route-display.js
- [x] T010 [US1] Implement update button click handler that triggers route update in src/js/ui/route-display.js
- [x] T011 [US1] Add progress indicator during route recalculation in src/js/ui/route-display.js
- [x] T012 [US1] Implement update state management (track isUpdating flag) in src/js/utils/route-update.js
- [x] T013 [US1] Prevent duplicate update requests while update in progress in src/js/ui/route-display.js
- [x] T014 [US1] Display success message when route update completes in src/js/ui/route-display.js
- [x] T015 [US1] Reload route display with updated route data after successful update in src/js/ui/route-display.js
- [x] T016 [US1] Style update route button and progress indicators in src/styles/main.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 3: User Story 2 - Preserve Route Identity During Update (Priority: P2)

**Goal**: Route update preserves route identity (name, ID) and progress tracking while updating calculation data

**Independent Test**: Update a route with progress checkboxes marked, verify route keeps its name and ID, confirm progress is preserved or appropriately handled

### Tests for User Story 2

- [ ] T017 [P] [US2] Write unit test for route identity preservation (name, ID unchanged) in tests/unit/route-update.test.js
- [ ] T018 [P] [US2] Write unit test for progress preservation during route update in tests/unit/progress-preservation.test.js
- [ ] T019 [P] [US2] Write integration test for progress preservation workflow in tests/integration/route-update-workflow.test.js

### Implementation for User Story 2

- [x] T020 [US2] Ensure route name is preserved during update (do not modify name field) in src/js/storage.js
- [x] T021 [US2] Ensure route ID is preserved during update (do not modify id field) in src/js/storage.js
- [x] T022 [US2] Implement preserveRouteProgress function that maps old steps to new steps in src/js/utils/route-update.js
- [x] T023 [US2] Map progress by building name and relative position (within ±2 positions tolerance) in src/js/utils/route-update.js
- [x] T024 [US2] Clear progress for steps that no longer exist in updated route in src/js/utils/route-update.js
- [x] T025 [US2] Update SavedRouteProgress.completedBuildings with mapped progress in src/js/storage.js
- [x] T026 [US2] Update SavedRouteProgress.lastUpdated timestamp when progress is preserved in src/js/storage.js
- [x] T027 [US2] Add lastUpdatedAt field to SavedRoute when route is updated in src/js/storage.js
- [x] T028 [US2] Update lastAccessedAt timestamp when route is updated in src/js/storage.js
- [x] T029 [US2] Preserve all route identity fields (categoryId, categoryName, versionId, savedAt) during update in src/js/storage.js
- [x] T030 [US2] Verify route remains accessible from same location in saved routes list after update in src/js/ui/saved-routes-list.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 4: User Story 3 - Handle Update Conflicts and Edge Cases (Priority: P3)

**Goal**: System handles edge cases gracefully (version mismatches, invalid data, calculation failures) without leaving routes in inconsistent states

**Independent Test**: Attempt to update routes with incompatible data, different game versions, or invalid save games, verify appropriate error handling

### Tests for User Story 3

- [ ] T031 [P] [US3] Write unit test for version compatibility validation in tests/unit/route-update.test.js
- [ ] T032 [P] [US3] Write unit test for invalid save game data rejection in tests/unit/route-update.test.js
- [ ] T033 [P] [US3] Write unit test for calculation failure handling (preserve original route) in tests/unit/route-update.test.js
- [ ] T034 [P] [US3] Write unit test for concurrent update prevention in tests/unit/route-update.test.js
- [ ] T035 [P] [US3] Write integration test for error handling workflow in tests/integration/route-update-workflow.test.js

### Implementation for User Story 3

- [x] T036 [US3] Implement validateRouteUpdate function that checks version compatibility in src/js/utils/route-update.js
- [x] T037 [US3] Check version compatibility matrix (v2031, v2048, v10466, v10466_xmas, v2052 are compatible) in src/js/utils/route-update.js
- [x] T038 [US3] Warn user if versions differ but are compatible, prevent update if incompatible in src/js/utils/route-update.js
- [x] T039 [US3] Validate imported save game data structure before allowing update in src/js/utils/route-update.js
- [x] T040 [US3] Display error message if imported save game data is invalid or corrupted in src/js/ui/route-display.js
- [x] T041 [US3] Prevent route update if validation fails (do not start calculation) in src/js/ui/route-display.js
- [x] T042 [US3] Catch calculation errors and preserve original route unchanged in src/js/storage.js
- [x] T043 [US3] Display error message when calculation fails (within 3 seconds per SC-006) in src/js/ui/route-display.js
- [x] T044 [US3] Implement concurrent update prevention using RouteUpdateState.isUpdating flag in src/js/utils/route-update.js
- [x] T045 [US3] Disable update button while update is in progress in src/js/ui/route-display.js
- [x] T046 [US3] Handle cases where imported save game has fewer buildings than original starting state in src/js/utils/route-update.js
- [x] T047 [US3] Handle cases where imported save game has incompatible game mode settings in src/js/utils/route-update.js
- [x] T048 [US3] Implement cancelRouteUpdate function that stops calculation gracefully in src/js/utils/route-update.js
- [x] T049 [US3] Add cancel button during route update in src/js/ui/route-display.js
- [x] T050 [US3] Implement cancellation handler that preserves original route in src/js/ui/route-display.js
- [x] T051 [US3] Display cancellation message when update is cancelled in src/js/ui/route-display.js
- [ ] T052 [US3] Ensure calculation checks cancellation flag periodically and exits early in src/js/simulation.js (if needed, extend calculateRoute)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T053 [P] Add error handling for localStorage quota exceeded during route update in src/js/storage.js
- [x] T054 [P] Add error handling for corrupted route data during update in src/js/storage.js
- [x] T055 [P] Add data validation and error recovery for invalid route update data in src/js/storage.js
- [x] T056 [P] Add responsive design for route update UI components in src/styles/main.css
- [x] T057 [P] Add keyboard navigation and accessibility features (WCAG 2.1 Level AA) for update button and dialogs in src/js/ui/route-display.js
- [x] T058 [P] Add comprehensive error messages for all update failure scenarios across components in src/js/ui/route-display.js
- [x] T059 [P] Add update status/metadata display to saved routes list (show lastUpdatedAt if present) in src/js/ui/saved-routes-list.js
- [x] T060 [P] Add integration tests for complete route update user journeys in tests/integration/route-update-workflow.test.js
- [x] T061 [P] Add performance validation (update completes in <30 seconds per SC-002) in tests/integration/route-update-workflow.test.js
- [x] T062 Code cleanup and refactoring: Review all code for complexity limits and documentation
- [x] T063 Run quickstart.md validation and update if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies - can start immediately (project already exists)
- **User Stories (Phase 2+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 1) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 1) - Depends on US1 for basic update functionality
- **User Story 3 (P3)**: Can start after Foundational (Phase 1) - Depends on US1 for basic update, US2 for progress preservation

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core logic before UI components
- UI components before integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational test tasks marked [P] can run in parallel (T002-T003)
- All User Story test tasks marked [P] can run in parallel (T004-T005, T017-T019, T031-T035)
- Once Foundational phase completes, User Stories 1, 2, and 3 can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members
- UI components within a story marked [P] can run in parallel if they don't depend on each other

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write unit test for updateSavedRoute function in tests/unit/route-update.test.js"
Task: "Write integration test for route update workflow in tests/integration/route-update-workflow.test.js"

# Launch core logic tasks that don't depend on each other:
Task: "Implement route update validation in src/js/utils/route-update.js"
Task: "Implement update state management in src/js/utils/route-update.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational
2. Complete Phase 2: User Story 1
3. **STOP and VALIDATE**: Test User Story 1 independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2 (can start after US1 core logic)
   - Developer C: User Story 3 (can start after US1 core logic)
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
- Follow constitution requirements: code quality, testing (80% core, 60% overall), UX (WCAG 2.1 Level AA), performance (<30s update, <3s error messages)
- Reuse existing `calculateRoute` from `simulation.js` - do not duplicate calculation logic
- RouteUpdateState is memory-only (not persisted to localStorage)
- Progress preservation uses building name + position matching algorithm from research.md

