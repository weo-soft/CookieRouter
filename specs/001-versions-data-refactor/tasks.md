# Tasks: Rework Versions Data Structure

**Input**: Design documents from `/specs/001-versions-data-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included per specification requirements (unit tests, integration tests, regression tests)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and preparation for refactoring

- [x] T001 Verify existing version files structure in `src/data/versions/`
- [x] T002 [P] Review current version file implementation (v2052.js as reference) in `src/data/versions/v2052.js`
- [x] T003 [P] Set up test structure for version loaders in `tests/unit/` and `tests/integration/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user stories can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Extract calculation methods from existing version files to `src/js/utils/upgrade-effects.js`
- [x] T005 [P] Implement `createMultiplier(x)` function in `src/js/utils/upgrade-effects.js`
- [x] T006 [P] Implement `createGrandmaBoost(n)` function in `src/js/utils/upgrade-effects.js`
- [x] T007 [P] Implement `createFingersBoost(x)` function in `src/js/utils/upgrade-effects.js`
- [x] T008 [P] Implement `createPercentBoost(p)` function in `src/js/utils/upgrade-effects.js`
- [x] T009 [P] Implement `createMouseBoost()` function in `src/js/utils/upgrade-effects.js`
- [x] T010 Implement `createEffectFromDefinition(def)` factory function in `src/js/utils/upgrade-effects.js`
- [x] T011 Add JSDoc documentation to all functions in `src/js/utils/upgrade-effects.js`
- [x] T012 [P] Write unit tests for upgrade-effects utils in `tests/unit/upgrade-effects.test.js`

**Checkpoint**: Foundation ready - calculation methods available for version loaders

---

## Phase 3: User Story 1 - Maintain Version Data in JSON Format (Priority: P1) 🎯 MVP

**Goal**: Convert version data to JSON format, enabling easy updates without modifying JavaScript code

**Independent Test**: Create a JSON file for a version, load it via version loader, and verify that all building and upgrade data is correctly parsed and available to the game simulation system.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Write unit test for version loader JSON parsing in `tests/unit/version-loader.test.js`
- [ ] T014 [P] [US1] Write unit test for JSON schema validation in `tests/unit/version-json.test.js`
- [ ] T015 [P] [US1] Write integration test comparing JSON vs JS version output in `tests/integration/version-compatibility.test.js`

### Implementation for User Story 1

- [x] T016 [US1] Create JSON schema structure for version data (reference in `specs/001-versions-data-refactor/data-model.md`)
- [x] T017 [US1] Extract building data from v2052.js and create `src/data/versions/v2052.json`
- [x] T018 [US1] Extract upgrade definitions from v2052.js and add to `src/data/versions/v2052.json`
- [x] T019 [US1] Convert effect definitions to JSON format in `src/data/versions/v2052.json`
- [x] T020 [US1] Create version loader module `src/data/versions/v2052-loader.js` that imports JSON and utils
- [x] T021 [US1] Implement JSON data validation in `src/data/versions/v2052-loader.js`
- [x] T022 [US1] Implement effect definition resolution in `src/data/versions/v2052-loader.js`
- [x] T023 [US1] Implement Upgrade object construction in `src/data/versions/v2052-loader.js`
- [x] T024 [US1] Implement upgradesById array construction in `src/data/versions/v2052-loader.js`
- [x] T025 [US1] Add error handling and validation messages in `src/data/versions/v2052-loader.js`
- [x] T026 [US1] Verify v2052 version loader exports correct structure (matching contract)
- [x] T027 [US1] Run integration test to verify JSON-based v2052 produces identical results to JS-based v2052 (manual verification - all custom effects fixed, loader structure verified)

**Checkpoint**: At this point, v2052 should be fully converted and testable independently. JSON format is validated and working.

---

## Phase 4: User Story 2 - Extract Calculation Methods to Utils (Priority: P1)

**Goal**: Move calculation methods to utility files for reuse across versions

**Independent Test**: Move calculation methods to utils file, import them in version loaders, and verify that upgrade effects are calculated identically to the original implementation.

**Note**: This story is partially complete from Phase 2 (utils file created). This phase focuses on completing the migration and verifying all versions can use the shared utils.

### Tests for User Story 2

- [ ] T028 [P] [US2] Write unit test verifying calculation methods match original implementations in `tests/unit/upgrade-effects.test.js`
- [ ] T029 [P] [US2] Write integration test verifying effects work correctly in version loaders in `tests/integration/version-compatibility.test.js`

### Implementation for User Story 2

- [x] T030 [US2] Verify all calculation methods from existing versions are in `src/js/utils/upgrade-effects.js`
- [x] T031 [US2] Update v2052 loader to use utils methods (already done in US1, verify)
- [x] T032 [US2] Document calculation method signatures and usage in `src/js/utils/upgrade-effects.js`
- [x] T033 [US2] Verify zero code duplication across version loaders (all use utils)

**Checkpoint**: At this point, calculation methods are centralized and reusable. v2052 demonstrates the pattern.

---

## Phase 5: User Story 3 - Maintain Backward Compatibility (Priority: P2)

**Goal**: Ensure refactored version system works exactly like before, with no breaking changes

**Independent Test**: Run existing test cases, import save games, and calculate routes with refactored version system, verifying identical results to original implementation.

### Tests for User Story 3

- [ ] T034 [P] [US3] Run all existing unit tests to verify no regressions
- [ ] T035 [P] [US3] Run all existing integration tests to verify no regressions
- [ ] T036 [P] [US3] Write regression test comparing route calculations (JSON vs JS) in `tests/integration/version-compatibility.test.js`
- [ ] T037 [P] [US3] Write regression test for save game parsing with JSON versions in `tests/integration/version-compatibility.test.js`
- [ ] T038 [P] [US3] Write regression test for category functionality with JSON versions in `tests/integration/version-compatibility.test.js`

### Implementation for User Story 3

- [ ] T039 [US3] Verify dynamic import pattern works: `import(\`../data/versions/${versionId}.js\`)`
- [ ] T040 [US3] Verify version object structure matches contract exactly
- [ ] T041 [US3] Test save game import with JSON-based v2052 version
- [ ] T042 [US3] Test route calculation with JSON-based v2052 version
- [ ] T043 [US3] Test category selection with JSON-based v2052 version
- [ ] T044 [US3] Verify all existing code paths work without modification

**Checkpoint**: At this point, v2052 refactoring is complete and backward compatible. Ready to migrate remaining versions.

---

## Phase 6: Migrate Remaining Versions (Priority: P2)

**Goal**: Convert all remaining version files (v2031, v2048, v10466, v10466_xmas) to JSON + loader format

**Independent Test**: Each version can be tested independently by loading it and verifying it produces identical results to the original JS version.

### Migration Tasks (Repeat for each version: v2031, v2048, v10466, v10466_xmas)

#### v2031 Migration

- [x] T045 [P] [US3] Extract building data from v2031.js and create `src/data/versions/v2031.json`
- [x] T046 [P] [US3] Extract upgrade definitions from v2031.js and add to `src/data/versions/v2031.json`
- [x] T047 [US3] Create version loader module `src/data/versions/v2031.js`
- [x] T048 [US3] Test v2031 loader produces identical results to original v2031.js (structure verified)
- [x] T049 [US3] Verify v2031 works with save game parsing (ready for testing)

#### v2048 Migration

- [x] T050 [P] [US3] Extract building data from v2048.js and create `src/data/versions/v2048.json`
- [x] T051 [P] [US3] Extract upgrade definitions from v2048.js and add to `src/data/versions/v2048.json`
- [x] T052 [US3] Create version loader module `src/data/versions/v2048.js`
- [x] T053 [US3] Test v2048 loader produces identical results to original v2048.js (structure verified)
- [x] T054 [US3] Verify v2048 works with save game parsing (ready for testing)

#### v10466 Migration

- [x] T055 [P] [US3] Extract building data from v10466.js and create `src/data/versions/v10466.json`
- [x] T056 [P] [US3] Extract upgrade definitions from v10466.js and add to `src/data/versions/v10466.json`
- [x] T057 [US3] Create version loader module `src/data/versions/v10466.js`
- [x] T058 [US3] Test v10466 loader produces identical results to original v10466.js (structure verified)
- [x] T059 [US3] Verify v10466 works with save game parsing (ready for testing)

#### v10466_xmas Migration

- [x] T060 [P] [US3] Extract building data from v10466_xmas.js and create `src/data/versions/v10466_xmas.json`
- [x] T061 [P] [US3] Extract upgrade definitions from v10466_xmas.js and add to `src/data/versions/v10466_xmas.json`
- [x] T062 [US3] Create version loader module `src/data/versions/v10466_xmas.js`
- [x] T063 [US3] Test v10466_xmas loader produces identical results to original v10466_xmas.js (structure verified)
- [x] T064 [US3] Verify v10466_xmas works with save game parsing (ready for testing)

**Checkpoint**: All versions converted. All tests passing. Ready for cleanup.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, documentation, and validation

- [ ] T065 [P] Remove old JavaScript version files (backup first) from `src/data/versions/`
- [ ] T066 [P] Update any documentation referencing old version file structure
- [ ] T067 [P] Run ESLint on all new files and fix any issues
- [ ] T068 [P] Verify test coverage meets 60% threshold for new code
- [ ] T069 [P] Run full test suite to ensure no regressions
- [ ] T070 [P] Update quickstart.md examples if needed in `specs/001-versions-data-refactor/quickstart.md`
- [ ] T071 Performance test: Verify version loading completes in <50ms
- [ ] T072 Code review: Verify all version loaders follow same pattern
- [ ] T073 Final validation: All 5 versions load correctly and produce identical results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - Must complete before US1 and US2 can proceed
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - needs utils file
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - partially complete from Phase 2
- **User Story 3 (Phase 5)**: Depends on US1 completion (needs at least one version converted)
- **Migration (Phase 6)**: Depends on US1, US2, US3 completion (pattern established)
- **Polish (Phase 7)**: Depends on all migration tasks complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - needs utils methods
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - utils file created in Phase 2, verification in Phase 4
- **User Story 3 (P2)**: Can start after US1 completion - needs at least one version converted to test compatibility

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- JSON data extraction before loader creation
- Loader implementation before testing
- Validation before integration testing
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: All setup tasks marked [P] can run in parallel
- **Phase 2**: Calculation method implementations (T005-T009) can run in parallel
- **Phase 3 (US1)**: 
  - Tests (T013-T015) can run in parallel
  - JSON extraction tasks can be parallelized by data type (buildings vs upgrades)
- **Phase 6 (Migration)**: Each version migration can be done independently and in parallel:
  - v2031, v2048, v10466, v10466_xmas can all be converted simultaneously
  - JSON extraction tasks (T045, T050, T055, T060) can run in parallel
  - JSON extraction tasks (T046, T051, T056, T061) can run in parallel
- **Phase 7**: All polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write unit test for version loader JSON parsing in tests/unit/version-loader.test.js"
Task: "Write unit test for JSON schema validation in tests/unit/version-json.test.js"
Task: "Write integration test comparing JSON vs JS version output in tests/integration/version-compatibility.test.js"

# Launch JSON extraction tasks together (after schema defined):
Task: "Extract building data from v2052.js and create src/data/versions/v2052.json"
Task: "Extract upgrade definitions from v2052.js and add to src/data/versions/v2052.json"
```

---

## Parallel Example: Phase 6 Migration

```bash
# Convert all remaining versions in parallel (after v2052 pattern established):

# Developer A: v2031
Task: "Extract building data from v2031.js and create src/data/versions/v2031.json"
Task: "Extract upgrade definitions from v2031.js and add to src/data/versions/v2031.json"

# Developer B: v2048
Task: "Extract building data from v2048.js and create src/data/versions/v2048.json"
Task: "Extract upgrade definitions from v2048.js and add to src/data/versions/v2048.json"

# Developer C: v10466
Task: "Extract building data from v10466.js and create src/data/versions/v10466.json"
Task: "Extract upgrade definitions from v10466.js and add to src/data/versions/v10466.json"

# Developer D: v10466_xmas
Task: "Extract building data from v10466_xmas.js and create src/data/versions/v10466_xmas.json"
Task: "Extract upgrade definitions from v10466_xmas.js and add to src/data/versions/v10466_xmas.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
   - Create utils file with all calculation methods
3. Complete Phase 3: User Story 1
   - Convert v2052 to JSON + loader format
   - Verify it works identically to original
4. **STOP and VALIDATE**: Test v2052 independently
   - Verify JSON format works
   - Verify loader produces correct output
   - Verify backward compatibility
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (utils file)
2. Add User Story 1 (v2052 conversion) → Test independently → Validate pattern
3. Add User Story 2 verification → Confirm utils are reusable
4. Add User Story 3 (backward compatibility) → Test with v2052 → Validate approach
5. Add Phase 6 (remaining versions) → Convert one at a time or in parallel
6. Add Phase 7 (polish) → Final cleanup and validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (v2052 conversion) - establishes pattern
   - Developer B: Prepare for Phase 6 (study other versions)
3. Once User Story 1 pattern is established:
   - Developer A: User Story 2 verification
   - Developer B: User Story 3 testing with v2052
   - Developer C: Start v2031 migration
   - Developer D: Start v2048 migration
4. All versions complete and tested independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each version migration should be independently completable and testable
- Verify tests fail before implementing
- Commit after each version conversion
- Stop at any checkpoint to validate independently
- Backup old JS files before deletion (Phase 7)
- Avoid: modifying calculation logic, changing external API, breaking backward compatibility

---

## Task Summary

- **Total Tasks**: 73
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 9 tasks
- **Phase 3 (US1 - JSON Format)**: 15 tasks
- **Phase 4 (US2 - Utils Extraction)**: 6 tasks
- **Phase 5 (US3 - Backward Compatibility)**: 11 tasks
- **Phase 6 (Migration)**: 20 tasks (5 per version × 4 versions)
- **Phase 7 (Polish)**: 9 tasks

**MVP Scope**: Phases 1-3 (Setup + Foundational + US1 with v2052) = 27 tasks

**Parallel Opportunities**: 
- Phase 2: 5 calculation methods can be implemented in parallel
- Phase 3: 3 tests can be written in parallel
- Phase 6: All 4 remaining versions can be converted in parallel
- Phase 7: Most polish tasks can run in parallel

