# Tasks: Route Import/Export

**Input**: Design documents from `/specs/008-route-import-export/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are included per constitution requirements (80% coverage for core export/import logic, 60% overall).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/` at repository root
- Paths follow plan.md structure: `src/js/`, `src/js/ui/`, `src/js/utils/`, `src/styles/`, `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for route import/export feature

- [x] T001 [P] Create route serializer module structure in src/js/utils/route-serializer.js
- [x] T002 [P] Create route validator module structure in src/js/utils/route-validator.js
- [x] T003 [P] Create route export UI module structure in src/js/ui/route-export.js
- [x] T004 [P] Create route import UI module structure in src/js/ui/route-import.js
- [x] T005 [P] Create route import preview UI module structure in src/js/ui/route-import-preview.js
- [x] T006 [P] Create error classes for route import/export in src/js/utils/route-validator.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core serialization and validation logic that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core Serialization Functions

- [x] T007 Implement serializeRouteForExport function to serialize route data to JSON in src/js/utils/route-serializer.js
- [x] T008 Implement base64 encoding using btoa() in serializeRouteForExport in src/js/utils/route-serializer.js
- [x] T009 Implement deserializeRouteFromImport function to decode base64 and parse JSON in src/js/utils/route-serializer.js
- [x] T010 Implement base64 decoding using atob() in deserializeRouteFromImport in src/js/utils/route-serializer.js
- [x] T011 Implement export file structure creation (version, routeType, exportedAt, routeData) in src/js/utils/route-serializer.js
- [x] T012 [P] Write unit tests for route serialization/deserialization in tests/unit/route-serializer.test.js
- [x] T013 [P] Write unit tests for base64 encoding/decoding in tests/unit/route-serializer.test.js

### Core Validation Functions

- [x] T014 Implement isValidBase64 helper function for base64 format validation in src/js/utils/route-validator.js
- [x] T015 Implement validateRouteSchema function for export file schema validation in src/js/utils/route-validator.js
- [x] T016 Implement validateRouteData function for route-specific data validation in src/js/utils/route-validator.js
- [x] T017 Implement checkMissingCategoryReferences function to detect missing categories in src/js/utils/route-validator.js
- [x] T018 Implement checkDuplicateRouteId function to detect duplicate route IDs in src/js/utils/route-validator.js
- [x] T019 [P] Write unit tests for validation functions in tests/unit/route-validator.test.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Export Any Route (Priority: P1) 🎯 MVP

**Goal**: User can export any calculated route (saved or unsaved, custom, predefined, chained, achievement) to a downloadable file

**Independent Test**: Calculate or open any route type, click export button, verify downloadable file is generated containing all route data

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [P] [US1] Write unit test for exporting saved routes in tests/unit/route-export.test.js
- [ ] T021 [P] [US1] Write unit test for exporting route chains in tests/unit/route-export.test.js
- [ ] T022 [P] [US1] Write unit test for exporting calculated routes in tests/unit/route-export.test.js
- [ ] T023 [P] [US1] Write unit test for exporting achievement routes in tests/unit/route-export.test.js
- [ ] T024 [P] [US1] Write unit test for export file naming in tests/unit/route-export.test.js
- [ ] T025 [P] [US1] Write integration test for complete export workflow in tests/integration/route-export-workflow.test.js

### Implementation for User Story 1

- [x] T026 [US1] Implement generateExportFileName function to create descriptive filenames in src/js/ui/route-export.js
- [x] T027 [US1] Implement createExportFile function using Blob API and download trigger in src/js/ui/route-export.js
- [x] T028 [US1] Implement exportRoute function that serializes and downloads route in src/js/ui/route-export.js
- [x] T029 [US1] Implement route type detection logic (savedRoute, routeChain, calculatedRoute, achievementRoute) in src/js/ui/route-export.js
- [x] T030 [US1] Add export button to saved route display component in src/js/ui/saved-routes-list.js
- [x] T031 [US1] Add export button to route chain display component in src/js/ui/route-chain-display.js
- [x] T032 [US1] Add export button to calculated route display in src/js/ui/route-display.js
- [x] T033 [US1] Add export button to achievement route display in src/js/ui/route-display.js (achievement routes use same RouteDisplay component)
- [x] T034 [US1] Integrate export functionality with all route display components in src/js/ui/route-export.js
- [x] T035 [US1] Style export buttons consistently with existing UI in src/styles/main.css
- [x] T036 [US1] Add error handling for export failures in src/js/ui/route-export.js

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Import and Preview Route (Priority: P1)

**Goal**: User can import a route file and preview all route details before saving

**Independent Test**: Select an import file, view route preview, verify all route details are displayed correctly before any save action

### Tests for User Story 2

- [ ] T037 [P] [US2] Write unit test for file reading and validation in tests/unit/route-import.test.js
- [ ] T038 [P] [US2] Write unit test for import validation stages in tests/unit/route-validator.test.js
- [ ] T039 [P] [US2] Write unit test for preview state management in tests/unit/route-import-preview.test.js
- [ ] T040 [P] [US2] Write integration test for complete import and preview workflow in tests/integration/route-import-workflow.test.js

### Implementation for User Story 2

- [x] T041 [US2] Implement validateImportFile function with multi-stage validation in src/js/utils/route-validator.js
- [x] T042 [US2] Implement file reading using FileReader API in src/js/ui/route-import.js
- [x] T043 [US2] Implement importRouteFile function that reads and validates file in src/js/ui/route-import.js
- [x] T044 [US2] Implement setupImportButton function to handle file selection in src/js/ui/route-import.js
- [x] T045 [US2] Create import preview container UI structure in src/js/ui/route-import-preview.js
- [x] T046 [US2] Implement showImportPreview function to display route preview in src/js/ui/route-import-preview.js
- [x] T047 [US2] Implement getCurrentImportPreview function to retrieve preview state in src/js/ui/route-import-preview.js
- [x] T048 [US2] Implement clearImportPreview function to clear preview from memory in src/js/ui/route-import-preview.js
- [x] T049 [US2] Implement renderPreview function to display route details (name, type, building steps, metadata) in src/js/ui/route-import-preview.js
- [x] T050 [US2] Add preview display for route chains showing all routes in chain in src/js/ui/route-import-preview.js
- [x] T051 [US2] Add import button to main UI navigation in src/main.js
- [x] T052 [US2] Integrate import functionality with main UI in src/main.js
- [x] T053 [US2] Style import preview component consistently with existing UI in src/styles/main.css
- [ ] T054 [US2] Add accessibility features (keyboard navigation, screen reader support) to import preview in src/js/ui/route-import-preview.js

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Save Imported Route (Priority: P2)

**Goal**: User can save an imported route from preview to localStorage

**Independent Test**: Import a route, preview it, click save, verify it appears in saved routes list with all data intact

### Tests for User Story 3

- [ ] T055 [P] [US3] Write unit test for saving imported routes to localStorage in tests/unit/route-import.test.js
- [ ] T056 [P] [US3] Write unit test for duplicate ID handling in tests/unit/route-validator.test.js
- [ ] T057 [P] [US3] Write integration test for complete import and save workflow in tests/integration/route-import-workflow.test.js

### Implementation for User Story 3

- [x] T058 [US3] Implement saveImportedRoute function to persist route to localStorage in src/js/ui/route-import.js
- [x] T059 [US3] Implement handleDuplicateRouteId function with user choice dialog in src/js/utils/route-validator.js
- [ ] T060 [US3] Create duplicate ID dialog UI component in src/js/ui/route-import.js
- [x] T061 [US3] Implement generateNewRouteId function for renaming imported routes in src/js/utils/route-validator.js
- [x] T062 [US3] Add "Save Route" button to import preview component in src/js/ui/route-import-preview.js
- [x] T063 [US3] Add "Cancel" button to import preview component in src/js/ui/route-import-preview.js
- [x] T064 [US3] Implement save button handler that calls saveImportedRoute in src/js/ui/route-import-preview.js
- [x] T065 [US3] Implement cancel button handler that clears preview in src/js/ui/route-import-preview.js
- [x] T066 [US3] Add success confirmation after route is saved in src/js/ui/route-import-preview.js
- [x] T067 [US3] Update route list display after successful import in src/main.js
- [ ] T068 [US3] Handle saving route chains to localStorage in src/js/ui/route-import.js
- [ ] T069 [US3] Verify saved routes have all progress tracking capabilities in src/js/ui/route-import.js

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 6: User Story 4 - Handle Import Errors and Validation (Priority: P3)

**Goal**: System provides clear error messages for invalid imports and prevents invalid data from being saved

**Independent Test**: Attempt to import invalid files (wrong format, corrupted data, incompatible versions) and verify appropriate error messages are displayed

### Tests for User Story 4

- [ ] T070 [P] [US4] Write unit test for invalid file format error handling in tests/unit/route-validator.test.js
- [ ] T071 [P] [US4] Write unit test for corrupted data error handling in tests/unit/route-validator.test.js
- [ ] T072 [P] [US4] Write unit test for missing required fields error handling in tests/unit/route-validator.test.js
- [ ] T073 [P] [US4] Write unit test for version mismatch warning handling in tests/unit/route-validator.test.js
- [ ] T074 [P] [US4] Write integration test for error display and user feedback in tests/integration/route-import-workflow.test.js

### Implementation for User Story 4

- [x] T075 [US4] Implement error message display component for import errors in src/js/ui/route-import.js
- [x] T076 [US4] Add error display for invalid file format in src/js/ui/route-import.js
- [x] T077 [US4] Add error display for base64 decoding failures in src/js/ui/route-import.js
- [x] T078 [US4] Add error display for JSON parsing failures in src/js/ui/route-import.js
- [x] T079 [US4] Add error display for schema validation failures in src/js/ui/route-import.js
- [x] T080 [US4] Add error display for route-specific validation failures in src/js/ui/route-import.js
- [x] T081 [US4] Implement warning display for missing category references in src/js/ui/route-import-preview.js
- [x] T082 [US4] Implement warning display for version mismatches in src/js/ui/route-import-preview.js
- [x] T083 [US4] Add dismiss functionality for error messages in src/js/ui/route-import.js
- [x] T084 [US4] Style error and warning messages consistently with existing UI in src/styles/main.css
- [ ] T085 [US4] Add accessibility features to error messages (ARIA labels, focus management) in src/js/ui/route-import.js

**Checkpoint**: At this point, User Story 4 should be fully functional and testable independently

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final polish, edge case handling, and integration with existing systems

### Edge Case Handling

- [ ] T086 Handle exporting routes with missing category references in src/js/ui/route-export.js
- [ ] T087 Handle exporting route chains with missing categories in src/js/ui/route-export.js
- [ ] T088 Handle importing routes that require missing categories (warn but allow) in src/js/ui/route-import.js
- [ ] T089 Handle large export files (performance optimization) in src/js/ui/route-export.js
- [ ] T090 Prevent exporting routes that are currently being calculated in src/js/ui/route-export.js
- [ ] T091 Handle importing routes from different game versions gracefully in src/js/ui/route-import.js
- [ ] T092 Verify route chain order is preserved during export/import in src/js/utils/route-serializer.js

### Integration & Polish

- [ ] T093 Add export/import functionality to route creation wizard if applicable in src/js/ui/route-creation-wizard.js
- [ ] T094 Ensure export/import works with existing progress tracking system in src/js/storage.js
- [ ] T095 Add loading indicators during export/import operations in src/js/ui/route-export.js and src/js/ui/route-import.js
- [ ] T096 Verify responsive design for import/export interfaces on mobile devices in src/styles/main.css
- [ ] T097 Add keyboard shortcuts for export/import if applicable in src/js/ui/route-export.js and src/js/ui/route-import.js
- [ ] T098 Verify all error messages are user-friendly and actionable in src/js/ui/route-import.js
- [ ] T099 Add console logging for debugging export/import operations in src/js/utils/route-serializer.js and src/js/utils/route-validator.js
- [ ] T100 Run ESLint and fix any code quality issues across all new files

### Documentation

- [ ] T101 Update README with export/import feature documentation if applicable
- [ ] T102 Add JSDoc comments to all export/import functions per code quality requirements

---

## Dependencies & Story Completion Order

### Story Dependencies

- **US1 (Export)** and **US2 (Import/Preview)** can be implemented in parallel (both P1)
- **US3 (Save Imported)** depends on **US2** (needs preview functionality)
- **US4 (Error Handling)** can be implemented in parallel with **US3** but enhances **US2** and **US3**

### Recommended Implementation Order

1. **Phase 1-2**: Setup and foundational tasks (blocking)
2. **Phase 3-4**: US1 and US2 in parallel (both P1, independent)
3. **Phase 5**: US3 (depends on US2)
4. **Phase 6**: US4 (enhances US2 and US3)
5. **Phase 7**: Polish and edge cases

### Parallel Execution Examples

**US1 (Export) - Can run in parallel:**
- T020-T025 (tests) can run in parallel
- T026-T028 (core export functions) can run in parallel with T029 (route type detection)
- T030-T033 (export button integration) can run in parallel

**US2 (Import/Preview) - Can run in parallel:**
- T037-T040 (tests) can run in parallel
- T041-T043 (validation and file reading) can run in parallel with T045-T048 (preview functions)
- T049-T050 (preview rendering) can run in parallel

**US3 (Save Imported) - Can run in parallel:**
- T055-T057 (tests) can run in parallel
- T058-T061 (save and duplicate handling) can run in parallel with T062-T065 (UI buttons)

**US4 (Error Handling) - Can run in parallel:**
- T070-T074 (tests) can run in parallel
- T075-T080 (error displays) can run in parallel
- T081-T082 (warning displays) can run in parallel

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**MVP includes**: User Story 1 (Export Any Route) only

**Rationale**: Export is the foundation - users can share routes even if import isn't ready. Export is simpler (no validation, no preview) and provides immediate value.

**MVP Tasks**: Phase 1, Phase 2, Phase 3 (US1 only)

### Incremental Delivery

1. **Increment 1 (MVP)**: Export functionality (US1)
   - Users can export any route type
   - Files are base64-encoded and downloadable
   - Export buttons integrated into route displays

2. **Increment 2**: Import and preview (US2)
   - Users can import route files
   - Preview shows route details before saving
   - Validation prevents invalid imports

3. **Increment 3**: Save imported routes (US3)
   - Users can save previewed routes
   - Duplicate ID handling
   - Integration with localStorage

4. **Increment 4**: Error handling (US4)
   - Comprehensive error messages
   - Warning displays
   - User-friendly feedback

5. **Increment 5**: Polish
   - Edge cases
   - Performance optimization
   - Documentation

---

## Task Summary

- **Total Tasks**: 102
- **Setup Tasks**: 6 (Phase 1)
- **Foundational Tasks**: 13 (Phase 2)
- **US1 Tasks**: 17 (Phase 3)
- **US2 Tasks**: 18 (Phase 4)
- **US3 Tasks**: 15 (Phase 5)
- **US4 Tasks**: 16 (Phase 6)
- **Polish Tasks**: 17 (Phase 7)

### Independent Test Criteria

- **US1**: Calculate or open any route type, click export button, verify downloadable file is generated containing all route data
- **US2**: Select an import file, view route preview, verify all route details are displayed correctly before any save action
- **US3**: Import a route, preview it, click save, verify it appears in saved routes list with all data intact
- **US4**: Attempt to import invalid files (wrong format, corrupted data, incompatible versions) and verify appropriate error messages are displayed

### Format Validation

✅ All tasks follow the checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ All tasks include exact file paths
✅ User story tasks include [US1], [US2], [US3], or [US4] labels
✅ Parallelizable tasks are marked with [P]
✅ Tasks are organized by phase and user story

