# Tasks: Import Cookie Clicker Save Games

**Input**: Design documents from `/specs/003-import-save-games/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included per constitution requirements (80% coverage for core parsing logic, 60% overall).

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

**Purpose**: Project initialization and basic structure for save game import feature

- [x] T001 [P] Create save game parser module structure in src/js/save-game-parser.js
- [x] T002 [P] Create save game importer module structure in src/js/save-game-importer.js
- [x] T003 [P] Create error classes for save game parsing in src/js/save-game-parser.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core parsing and import logic that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core Parsing Functions

- [x] T004 Implement decodeSaveString function to handle URL encoding and remove "!END!" suffix in src/js/save-game-parser.js
- [x] T005 Implement base64 decoding with error handling in src/js/save-game-parser.js
- [x] T006 Implement section parsing (split by "|" character) in src/js/save-game-parser.js
- [x] T007 Implement extractBuildingCounts function to parse building section in src/js/save-game-parser.js
- [x] T008 Implement detectVersion function to detect game version from save string in src/js/save-game-parser.js
- [x] T009 Implement extractGameStats function to extract cookies, CpS, hardcore mode, etc. in src/js/save-game-parser.js
- [x] T010 Implement parseSaveGame main parsing function that orchestrates all parsing steps in src/js/save-game-parser.js

### Import Workflow Functions

- [x] T011 Implement importSaveGame async function for complete import workflow in src/js/save-game-importer.js
- [x] T012 Implement validateImportedData function with multi-level validation in src/js/save-game-importer.js
- [x] T013 Implement getImportedSaveGame function to retrieve current import in src/js/save-game-importer.js
- [x] T014 Implement clearImportedSaveGame function to clear current import in src/js/save-game-importer.js
- [x] T015 Implement getImportState function to retrieve import status in src/js/save-game-importer.js
- [x] T016 Extend storage.js to add temporary save game state storage functions in src/js/storage.js

### Error Classes

- [x] T017 [P] Implement SaveGameParseError class in src/js/save-game-parser.js
- [x] T018 [P] Implement SaveGameDecodeError class in src/js/save-game-parser.js
- [x] T019 [P] Implement SaveGameValidationError class in src/js/save-game-importer.js
- [x] T020 [P] Implement SaveGameVersionError class in src/js/save-game-importer.js

### Tests for Foundational Phase

- [x] T021 [P] Write unit tests for decodeSaveString function in tests/unit/save-game-parser.test.js
- [x] T022 [P] Write unit tests for base64 decoding in tests/unit/save-game-parser.test.js
- [x] T023 [P] Write unit tests for extractBuildingCounts function in tests/unit/save-game-parser.test.js
- [x] T024 [P] Write unit tests for detectVersion function in tests/unit/save-game-parser.test.js
- [x] T025 [P] Write unit tests for extractGameStats function in tests/unit/save-game-parser.test.js
- [x] T026 [P] Write unit tests for parseSaveGame function with example save file in tests/unit/save-game-parser.test.js
- [x] T027 [P] Write unit tests for importSaveGame workflow in tests/unit/save-game-importer.test.js
- [x] T028 [P] Write unit tests for validateImportedData function in tests/unit/save-game-importer.test.js
- [x] T029 [P] Write unit tests for error handling (invalid format, corrupted data) in tests/unit/save-game-parser.test.js
- [x] T030 [P] Write unit tests for error classes in tests/unit/save-game-parser.test.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Import Save Game Data (Priority: P1) 🎯 MVP

**Goal**: User can paste Cookie Clicker save game data, system parses it and extracts relevant game state information, displays confirmation, and automatically populates starting buildings

**Independent Test**: Paste a valid Cookie Clicker save game string, verify system parses it correctly, confirms import success, and extracted data is available for route calculations

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T031 [P] [US1] Write integration test for save game import workflow (paste → parse → confirm) in tests/integration/save-game-import-workflow.test.js

### Implementation for User Story 1

- [x] T032 [US1] Create save game import dialog UI component with text area for pasting save string in src/js/ui/save-game-import-dialog.js
- [x] T033 [US1] Implement import button and validation feedback in save game import dialog in src/js/ui/save-game-import-dialog.js
- [x] T034 [US1] Implement error message display for invalid/corrupted save data in src/js/ui/save-game-import-dialog.js
- [x] T035 [US1] Implement success confirmation display after successful import in src/js/ui/save-game-import-dialog.js
- [x] T036 [US1] Integrate save game import dialog with importSaveGame function in src/js/ui/save-game-import-dialog.js
- [x] T037 [US1] Extend StartingBuildingsSelector to auto-populate from imported building counts in src/js/ui/starting-buildings.js
- [x] T038 [US1] Extend VersionSelector to auto-select version from imported save game in src/js/ui/version-selector.js
- [x] T039 [US1] Add import button/trigger to main application UI in src/index.html
- [x] T040 [US1] Integrate save game import dialog with main application in src/main.js
- [x] T041 [US1] Style save game import dialog component in src/styles/main.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Explore Imported Save Game Content (Priority: P2)

**Goal**: User can view and explore extracted save game data to verify it was parsed correctly and understand what information is available

**Independent Test**: Import a save game and verify that a detailed view displays all extracted information including building counts, cookies, cookies per second, and other relevant game state

### Tests for User Story 2

- [x] T042 [P] [US2] Write unit test for save game details view component in tests/unit/save-game-details-view.test.js

### Implementation for User Story 2

- [x] T043 [US2] Create save game details view UI component in src/js/ui/save-game-details-view.js
- [x] T044 [US2] Implement building counts display in organized table/grid format in src/js/ui/save-game-details-view.js
- [x] T045 [US2] Implement game statistics display (total cookies, cookies per second) in src/js/ui/save-game-details-view.js
- [x] T046 [US2] Implement version and game mode information display in src/js/ui/save-game-details-view.js
- [x] T047 [US2] Implement collapsible/expandable functionality for details view in src/js/ui/save-game-details-view.js
- [x] T048 [US2] Integrate save game details view with getImportedSaveGame function in src/js/ui/save-game-details-view.js
- [x] T049 [US2] Add details view trigger/button to main application UI in src/index.html
- [x] T050 [US2] Integrate save game details view with main application in src/main.js
- [x] T051 [US2] Style save game details view component in src/styles/main.css

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Use Imported Data for Route Calculation (Priority: P3)

**Goal**: System automatically uses imported save game data when calculating routes, so users don't need to manually configure starting buildings or other parameters

**Independent Test**: Import a save game, select a category, verify route calculation uses imported building counts and game state as the starting point

### Tests for User Story 3

- [x] T052 [P] [US3] Write integration test for using imported data in route calculation in tests/integration/save-game-import-workflow.test.js

### Implementation for User Story 3

- [x] T053 [US3] Modify calculateRoute function to check for imported save game data in src/js/simulation.js
- [x] T054 [US3] Implement automatic population of starting buildings from imported data in calculateRoute in src/js/simulation.js
- [x] T055 [US3] Implement automatic use of imported hardcore mode setting in route calculation in src/js/simulation.js
- [x] T056 [US3] Implement automatic use of imported version in route calculation in src/js/simulation.js
- [x] T057 [US3] Ensure manual override of starting buildings still works when imported data exists in src/js/ui/starting-buildings.js
- [x] T058 [US3] Ensure imported data persists across category selections in src/js/simulation.js
- [x] T059 [US3] Add visual indicator when route calculation uses imported data in src/js/ui/route-display.js

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Manage Imported Save Games (Priority: P4)

**Goal**: User can manage imported save games, including clearing the current import, importing a new save, or updating their existing import with new data

**Independent Test**: Import a save game, then clear it or import a different save, verify system correctly updates all relevant data points

### Tests for User Story 4

- [x] T060 [P] [US4] Write unit test for clear import functionality in tests/unit/save-game-importer.test.js
- [x] T061 [P] [US4] Write unit test for replace import functionality in tests/unit/save-game-importer.test.js

### Implementation for User Story 4

- [x] T062 [US4] Add clear import button to save game import dialog in src/js/ui/save-game-import-dialog.js
- [x] T063 [US4] Implement clear import functionality that removes imported data and resets starting buildings in src/js/ui/save-game-import-dialog.js
- [x] T064 [US4] Implement replace import functionality (new import replaces previous) in src/js/ui/save-game-import-dialog.js
- [x] T065 [US4] Add import status indicator to main application UI in src/index.html
- [x] T066 [US4] Implement import status display (loaded/not loaded) using getImportState in src/main.js
- [x] T067 [US4] Update import status indicator when import is cleared in src/main.js
- [x] T068 [US4] Update import status indicator when new import is loaded in src/main.js
- [x] T069 [US4] Style import status indicator in src/styles/main.css

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T070 [P] Add loading indicators during save game parsing (per SC-001: <5 seconds) in src/js/ui/save-game-import-dialog.js
- [x] T071 [P] Optimize parsing performance to meet <5 second requirement in src/js/save-game-parser.js
- [x] T072 [P] Optimize details view rendering to meet <2 second requirement (per SC-003) in src/js/ui/save-game-details-view.js
- [x] T073 [P] Optimize validation to meet <3 second requirement (per SC-007) in src/js/save-game-importer.js
- [x] T074 [P] Add keyboard navigation and accessibility features (WCAG 2.1 Level AA) to import dialog in src/js/ui/save-game-import-dialog.js
- [x] T075 [P] Add keyboard navigation and accessibility features to details view in src/js/ui/save-game-details-view.js
- [x] T076 [P] Add responsive design for mobile and desktop for import UI components in src/styles/main.css
- [x] T077 [P] Add comprehensive error handling for edge cases (unsupported versions, corrupted data, missing sections) in src/js/save-game-parser.js
- [x] T078 [P] Add user-friendly error messages for all error scenarios in src/js/ui/save-game-import-dialog.js
- [x] T079 [P] Add integration tests for complete import → use → clear workflow in tests/integration/save-game-import-workflow.test.js
- [x] T080 Code cleanup and refactoring: Review all code for complexity limits and documentation
- [x] T081 Run quickstart.md validation and update if needed

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for import dialog component
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for imported data availability
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US1 for import functionality

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core logic before UI components
- UI components before integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001-T003)
- All Foundational error class tasks marked [P] can run in parallel (T017-T020)
- All Foundational test tasks marked [P] can run in parallel (T021-T030)
- Once Foundational phase completes, User Stories 1, 2, 3, and 4 can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all foundational error class tasks together:
Task: "Implement SaveGameParseError class in src/js/save-game-parser.js"
Task: "Implement SaveGameDecodeError class in src/js/save-game-parser.js"
Task: "Implement SaveGameValidationError class in src/js/save-game-importer.js"
Task: "Implement SaveGameVersionError class in src/js/save-game-importer.js"

# Launch all foundational test tasks together:
Task: "Write unit tests for decodeSaveString function in tests/unit/save-game-parser.test.js"
Task: "Write unit tests for base64 decoding in tests/unit/save-game-parser.test.js"
Task: "Write unit tests for extractBuildingCounts function in tests/unit/save-game-parser.test.js"
Task: "Write unit tests for detectVersion function in tests/unit/save-game-parser.test.js"
Task: "Write unit tests for extractGameStats function in tests/unit/save-game-parser.test.js"
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
- Follow constitution requirements: code quality, testing (80% core parsing, 60% overall), UX (WCAG 2.1 Level AA), performance (<5s import, <2s view, <3s validation)
- Reference example save file: `example_save/save` for testing
- Reference Cookie Clicker Save Format Wiki: https://cookieclicker.wiki.gg/wiki/Save

---

## Task Summary

- **Total Tasks**: 81
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 27 tasks (17 implementation + 10 tests)
- **Phase 3 (User Story 1)**: 11 tasks (1 test + 10 implementation)
- **Phase 4 (User Story 2)**: 10 tasks (1 test + 9 implementation)
- **Phase 5 (User Story 3)**: 8 tasks (1 test + 7 implementation)
- **Phase 6 (User Story 4)**: 10 tasks (2 tests + 8 implementation)
- **Phase 7 (Polish)**: 12 tasks

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 41 tasks

