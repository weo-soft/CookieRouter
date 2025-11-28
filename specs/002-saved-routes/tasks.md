# Tasks: Saved Routes

**Input**: Design documents from `/specs/002-saved-routes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included per constitution requirements (80% coverage for core storage logic, 60% overall).

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

- [x] T001 Extend storage utilities with saved route CRUD operations in src/js/storage.js
- [x] T002 [P] Write unit tests for saved route storage operations in tests/unit/saved-routes.test.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2: User Story 1 - Save Calculated Route (Priority: P1) 🎯 MVP

**Goal**: User calculates a route and saves it with a custom name for later access

**Independent Test**: Calculate a route, save it with a name, verify it appears in saved routes list and can be accessed later

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T003 [P] [US1] Write unit test for saving routes with custom names in tests/unit/saved-routes.test.js
- [x] T004 [P] [US1] Write unit test for default route name generation in tests/unit/saved-routes.test.js

### Implementation for User Story 1

- [x] T005 [US1] Create save route dialog UI component in src/js/ui/save-route-dialog.js
- [x] T006 [US1] Add "Save Route" button to route display component in src/js/ui/route-display.js
- [x] T007 [US1] Implement route name generation (default format: "{Category Name} - {Timestamp}") in src/js/ui/save-route-dialog.js
- [x] T008 [US1] Implement route save functionality that creates SavedRoute object in src/js/ui/save-route-dialog.js
- [x] T009 [US1] Integrate save route dialog with route display in src/js/ui/route-display.js
- [x] T010 [US1] Add validation for route names (1-100 characters) in src/js/ui/save-route-dialog.js
- [x] T011 [US1] Add success confirmation after route is saved in src/js/ui/save-route-dialog.js
- [x] T012 [US1] Style save route dialog component in src/styles/main.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 3: User Story 2 - Access Saved Routes (Priority: P2)

**Goal**: User can view and access previously saved routes to continue tracking progress or review route details

**Independent Test**: Open a saved route from the list and verify it displays with all details and preserved progress

### Tests for User Story 2

- [x] T013 [P] [US2] Write unit test for loading saved routes in tests/unit/saved-routes.test.js
- [x] T014 [P] [US2] Write integration test for accessing saved routes in tests/integration/saved-routes-workflow.test.js

### Implementation for User Story 2

- [x] T015 [US2] Create saved routes list UI component in src/js/ui/saved-routes-list.js
- [x] T016 [US2] Implement display of saved routes with metadata (name, category, dates) in src/js/ui/saved-routes-list.js
- [x] T017 [US2] Implement saved route selection and loading in src/js/ui/saved-routes-list.js
- [x] T018 [US2] Update route display to handle saved routes (different from calculated routes) in src/js/ui/route-display.js
- [x] T019 [US2] Implement lastAccessedAt timestamp update when route is accessed in src/js/ui/saved-routes-list.js
- [x] T020 [US2] Integrate saved routes list with main application in src/main.js
- [x] T021 [US2] Add HTML container for saved routes list in src/index.html
- [x] T022 [US2] Style saved routes list component in src/styles/main.css

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 4: User Story 3 - Track Progress Independently Per Route (Priority: P3)

**Goal**: User can track progress separately for each saved route, enabling work on multiple routes simultaneously

**Independent Test**: Save two routes, check off buildings in one, switch to the other, verify progress is maintained separately

### Tests for User Story 3

- [x] T023 [P] [US3] Write unit test for independent progress tracking per saved route in tests/unit/saved-routes.test.js
- [x] T024 [P] [US3] Write integration test for progress independence across multiple saved routes in tests/integration/saved-routes-workflow.test.js

### Implementation for User Story 3

- [x] T025 [US3] Extend progress storage to support saved route IDs in src/js/storage.js
- [x] T026 [US3] Update route display to use saved route ID for progress tracking in src/js/ui/route-display.js
- [x] T027 [US3] Ensure progress updates are keyed by saved route ID (not calculated route ID) in src/js/ui/route-display.js
- [x] T028 [US3] Implement progress loading for saved routes when accessed in src/js/ui/saved-routes-list.js
- [x] T029 [US3] Verify progress persistence when switching between saved routes in src/js/ui/saved-routes-list.js

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 5: User Story 4 - Manage Saved Routes (Priority: P4)

**Goal**: User can manage saved routes by renaming, deleting, or organizing them

**Independent Test**: Rename a saved route, delete a saved route, verify changes are reflected in the saved routes list

### Tests for User Story 4

- [x] T030 [P] [US4] Write unit test for renaming saved routes in tests/unit/saved-routes.test.js
- [x] T031 [P] [US4] Write unit test for deleting saved routes in tests/unit/saved-routes.test.js

### Implementation for User Story 4

- [x] T032 [US4] Add rename functionality to saved routes list component in src/js/ui/saved-routes-list.js
- [x] T033 [US4] Add delete functionality to saved routes list component in src/js/ui/saved-routes-list.js
- [x] T034 [US4] Implement delete confirmation dialog in src/js/ui/saved-routes-list.js
- [x] T035 [US4] Ensure deleted routes also remove associated progress data in src/js/storage.js
- [x] T036 [US4] Add rename and delete UI controls (buttons/icons) to saved routes list in src/js/ui/saved-routes-list.js
- [x] T037 [US4] Style rename and delete controls in src/styles/main.css
- [x] T038 [US4] Add error handling for rename validation (empty name, too long) in src/js/ui/saved-routes-list.js

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T039 [P] Add error handling for localStorage quota exceeded in src/js/storage.js
- [x] T040 [P] Add error handling for corrupted saved route data in src/js/storage.js
- [x] T041 [P] Add data validation and error recovery for invalid saved route data in src/js/storage.js
- [x] T042 [P] Add responsive design for saved routes UI components in src/styles/main.css
- [x] T043 [P] Add keyboard navigation and accessibility features (WCAG 2.1 Level AA) for saved routes components
- [x] T044 [P] Add loading indicators during saved route operations in src/js/ui/saved-routes-list.js
- [x] T045 [P] Add comprehensive error messages for saved route operations across all components
- [x] T046 [P] Add integration tests for complete saved routes user journeys in tests/integration/saved-routes-workflow.test.js
- [x] T047 Code cleanup and refactoring: Review all code for complexity limits and documentation
- [x] T048 Run quickstart.md validation and update if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies - can start immediately (project already exists)
- **User Stories (Phase 2+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 1) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 1) - Depends on US1 for save functionality
- **User Story 3 (P3)**: Can start after Foundational (Phase 1) - Depends on US1 and US2 for saved routes and access
- **User Story 4 (P4)**: Can start after Foundational (Phase 1) - Depends on US1 and US2 for saved routes and access

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core logic before UI components
- UI components before integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational test tasks marked [P] can run in parallel (T002)
- All User Story test tasks marked [P] can run in parallel (T003-T004, T013-T014, T023-T024, T030-T031)
- Once Foundational phase completes, User Stories 1, 2, 3, and 4 can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members
- UI components within a story marked [P] can run in parallel if they don't depend on each other

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write unit test for saving routes with custom names in tests/unit/saved-routes.test.js"
Task: "Write unit test for default route name generation in tests/unit/saved-routes.test.js"

# Launch UI components that don't depend on each other:
Task: "Create save route dialog UI component in src/js/ui/save-route-dialog.js"
Task: "Add 'Save Route' button to route display component in src/js/ui/route-display.js"
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
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
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
- Follow constitution requirements: code quality, testing (80% core, 60% overall), UX (WCAG 2.1 Level AA), performance (<1s save, <500ms list display)

