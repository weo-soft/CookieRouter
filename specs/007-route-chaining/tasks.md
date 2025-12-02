# Tasks: Route Chaining

**Input**: Design documents from `/specs/007-route-chaining/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/route-chaining.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure for new UI components in src/js/ui/
- [x] T002 [P] Create placeholder files for new components: wizard-route-chain-selection.js, route-chain-display.js, route-chain-navigation.js
- [x] T003 [P] Create test directory structure: tests/unit/route-chain.test.js, tests/unit/chain-calculation.test.js, tests/integration/route-chain-workflow.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create utility function extractFinalStateFromRoute in src/js/utils/route-state-extractor.js to extract buildings and upgrades from a calculated route
- [x] T005 [P] Create ChainCalculationState class/object structure in src/js/simulation.js for tracking chain calculation state
- [x] T006 [P] Create RouteChain and ChainedRoute data structure definitions (JSDoc types) in src/js/types/route-chain.js
- [x] T007 Create validation functions for RouteChain and ChainedRoute in src/js/utils/route-chain-validator.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Select Multiple Routes for Chaining (Priority: P1) 🎯 MVP

**Goal**: Users can select multiple routes (categories or achievement routes) in the wizard, view the route sequence, reorder routes, and remove routes from the chain.

**Independent Test**: Open the route creation wizard, select multiple routes (e.g., Nevercore, then Hardcore, then Longhaul), verify the system accepts the selection and displays the route sequence. Test reordering and removal.

### Implementation for User Story 1

- [x] T008 [US1] Create WizardRouteChainSelection component class in src/js/ui/wizard-route-chain-selection.js with constructor, render, and basic structure
- [x] T009 [US1] Implement route selection UI in WizardRouteChainSelection.render() to allow adding category-based routes
- [x] T010 [US1] Implement route selection UI in WizardRouteChainSelection.render() to allow adding achievement-based routes
- [x] T011 [US1] Implement route list display in WizardRouteChainSelection.render() showing all selected routes in sequence order
- [x] T012 [US1] Implement addRoute method in WizardRouteChainSelection to add routes to the chain
- [x] T013 [US1] Implement removeRoute method in WizardRouteChainSelection to remove routes from the chain
- [x] T014 [US1] Implement reorderRoutes method in WizardRouteChainSelection to change route sequence order
- [x] T015 [US1] Implement getSelectedRoutes method in WizardRouteChainSelection to return array of selected route configurations
- [x] T016 [US1] Implement validate method in WizardRouteChainSelection to ensure at least one route is selected (FR-021)
- [x] T017 [US1] Extend RouteCreationWizard in src/js/ui/route-creation-wizard.js to add route chain selection option in category selection step
- [x] T018 [US1] Integrate WizardRouteChainSelection component into RouteCreationWizard when chain mode is selected
- [x] T019 [US1] Update RouteCreationWizard state management to store selected routes array instead of single route
- [x] T020 [US1] Add UI controls for reordering routes (up/down buttons or drag-and-drop) in wizard-route-chain-selection.js
- [x] T021 [US1] Add UI controls for removing routes (remove button) in wizard-route-chain-selection.js
- [x] T022 [US1] Add visual indicator showing route sequence order (e.g., "1. Nevercore → 2. Hardcore → 3. Longhaul") in wizard-route-chain-selection.js
- [x] T023 [US1] Add styles for route chain selection UI in src/styles/main.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can select multiple routes, view them, reorder them, and remove them.

---

## Phase 4: User Story 2 - Calculate Chained Routes with Building Progression (Priority: P1)

**Goal**: System calculates each route in the chain sequentially, using buildings and upgrades from previous routes as starting state. Progress indicators show which route is being calculated.

**Independent Test**: Create a route chain with two routes, calculate the chain, verify that the second route's calculation uses buildings purchased in the first route as its starting buildings. Verify progress indicators work.

### Implementation for User Story 2

- [ ] T024 [US2] Implement calculateRouteChain function in src/js/simulation.js with signature from contract
- [ ] T025 [US2] Implement sequential route calculation loop in calculateRouteChain to calculate routes one after another
- [ ] T026 [US2] Implement building accumulation logic in calculateRouteChain using extractFinalStateFromRoute for each completed route
- [ ] T027 [US2] Implement upgrade accumulation logic in calculateRouteChain using extractFinalStateFromRoute for each completed route
- [ ] T028 [US2] Implement progress callback handling in calculateRouteChain to report current route being calculated
- [ ] T029 [US2] Implement error handling in calculateRouteChain to stop on first error and return partial results
- [ ] T030 [US2] Implement ChainCalculationResult structure in calculateRouteChain return value
- [ ] T031 [US2] Extend RouteCreationWizard.calculateRoute in src/js/ui/route-creation-wizard.js to detect chain mode and call calculateRouteChain
- [ ] T032 [US2] Implement progress display in RouteCreationWizard showing which route is currently being calculated (e.g., "Calculating route 2 of 3: Hardcore")
- [ ] T033 [US2] Update wizard summary step to show chain calculation progress instead of single route progress
- [ ] T034 [US2] Handle calculation errors gracefully in RouteCreationWizard allowing user to modify chain and retry (FR-022)
- [ ] T035 [US2] Store calculated routes in RouteCreationWizard state after chain calculation completes
- [ ] T036 [US2] Add error display UI in RouteCreationWizard showing which route failed and error message

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can select routes and calculate chains with building progression.

---

## Phase 5: User Story 3 - View and Navigate Chained Routes (Priority: P2)

**Goal**: Users can view the complete route chain, navigate between routes, see building purchase sequences for each route, and see cumulative building counts.

**Independent Test**: View a calculated route chain, verify users can see all routes, navigate between them, view building sequences, and see cumulative building counts at the start of each route.

### Implementation for User Story 3

- [ ] T037 [US3] Create RouteChainDisplay component class in src/js/ui/route-chain-display.js with constructor and basic structure
- [ ] T038 [US3] Implement render method in RouteChainDisplay to display route chain with clear visual separation between routes
- [ ] T039 [US3] Implement showRoute method in RouteChainDisplay to display a specific route in the chain
- [ ] T040 [US3] Integrate existing RouteDisplay component in RouteChainDisplay to show individual route building sequences
- [ ] T041 [US3] Create RouteChainNavigation component class in src/js/ui/route-chain-navigation.js for route selector/navigation
- [ ] T042 [US3] Implement render method in RouteChainNavigation to show route list with navigation controls
- [ ] T043 [US3] Implement setCurrentRoute method in RouteChainNavigation to highlight current route
- [ ] T044 [US3] Implement goToNext and goToPrevious methods in RouteChainNavigation for navigation
- [ ] T045 [US3] Implement goToRoute method in RouteChainNavigation to navigate to specific route by index
- [ ] T046 [US3] Integrate RouteChainNavigation into RouteChainDisplay for route switching
- [ ] T047 [US3] Implement display of cumulative building counts at start of each route in RouteChainDisplay
- [ ] T048 [US3] Implement display of carried-forward buildings and upgrades from previous routes in RouteChainDisplay
- [ ] T049 [US3] Update RouteCreationWizard to display RouteChainDisplay after chain calculation completes instead of single route display
- [ ] T050 [US3] Add styles for route chain display and navigation in src/styles/main.css
- [ ] T051 [US3] Ensure route navigation completes in under 1 second (SC-004) by optimizing RouteChainDisplay.showRoute

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - users can select routes, calculate chains, and view/navigate the results.

---

## Phase 6: User Story 4 - Save and Access Route Chains (Priority: P2)

**Goal**: Users can save route chains, access them from saved routes list, and view them with all routes preserved. Chains are displayed with an indicator distinguishing them from single routes.

**Independent Test**: Save a route chain, access it from saved routes list, verify the complete chain with all routes is preserved and accessible. Verify chain indicator is shown.

### Implementation for User Story 4

- [ ] T052 [US4] Implement saveRouteChain function in src/js/storage.js to save route chain to localStorage under key 'cookieRouter:routeChains'
- [ ] T053 [US4] Implement getRouteChains function in src/js/storage.js to retrieve all saved route chains
- [ ] T054 [US4] Implement getRouteChainById function in src/js/storage.js to retrieve specific route chain by ID
- [ ] T055 [US4] Implement deleteRouteChain function in src/js/storage.js to delete route chain from localStorage
- [ ] T056 [US4] Add validation in saveRouteChain to ensure route chain structure is valid before saving
- [ ] T057 [US4] Add ID generation logic in saveRouteChain if ID not provided (format: route-chain-{timestamp}-{random})
- [ ] T058 [US4] Add timestamp management in saveRouteChain (savedAt, createdAt, lastAccessedAt)
- [ ] T059 [US4] Implement updateRouteChainProgress function in src/js/storage.js to update progress for specific route in chain
- [ ] T060 [US4] Extend saved routes list UI to display route chains with chain indicator (different icon/badge)
- [ ] T061 [US4] Update saved routes list to load and display route chains alongside individual saved routes
- [ ] T062 [US4] Implement save chain dialog/prompt in RouteChainDisplay or RouteCreationWizard to get chain name
- [ ] T063 [US4] Connect save button in RouteChainDisplay to saveRouteChain function
- [ ] T064 [US4] Implement loading saved route chain and displaying it with RouteChainDisplay
- [ ] T065 [US4] Update lastAccessedAt timestamp when route chain is opened
- [ ] T066 [US4] Ensure saved route chains are accessible and display correctly 100% of the time (SC-005)

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently - users can select routes, calculate chains, view them, and save/access them.

---

## Phase 7: User Story 5 - Track Progress Through Route Chain (Priority: P3)

**Goal**: Users can track progress through a route chain by checking off buildings. Progress is tracked independently for each route, and overall chain progress is shown.

**Independent Test**: Check off buildings in different routes of a chain, verify progress is maintained separately for each route and overall chain progress is updated. Verify progress persists across sessions.

### Implementation for User Story 5

- [ ] T067 [US5] Implement progress tracking data structure in ChainedRoute (progress object, completedSteps, isComplete)
- [ ] T068 [US5] Extend RouteChainDisplay to show progress checkboxes for each route in the chain
- [ ] T069 [US5] Implement progress update handler in RouteChainDisplay to update progress when user checks/unchecks buildings
- [ ] T070 [US5] Implement independent progress tracking per route in RouteChainDisplay (progress stored per routeIndex)
- [ ] T071 [US5] Implement overall chain progress calculation in RouteChainDisplay (totalRoutes, completedRoutes, inProgressRouteIndex)
- [ ] T072 [US5] Display overall chain progress indicator in RouteChainDisplay (e.g., "Route 1 of 3 complete, Route 2 in progress")
- [ ] T073 [US5] Implement route completion detection in RouteChainDisplay (isComplete when all steps checked)
- [ ] T074 [US5] Display route completion indicators in RouteChainNavigation showing which routes are complete
- [ ] T075 [US5] Connect progress updates to updateRouteChainProgress function to persist to localStorage
- [ ] T076 [US5] Implement auto-save of progress changes in RouteChainDisplay
- [ ] T077 [US5] Load and restore progress when displaying saved route chain
- [ ] T078 [US5] Ensure progress tracking maintains accuracy for all routes in a chain across multiple sessions (SC-006)
- [ ] T079 [US5] Update overallProgress in RouteChain when progress is updated

**Checkpoint**: At this point, all user stories should be complete - users can select routes, calculate chains, view/navigate them, save/access them, and track progress.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T080 [P] Add error handling for edge cases: zero routes selected, calculation failures, version conflicts, hardcore mode conflicts
- [ ] T081 [P] Add validation warnings for version mismatches and hardcore mode conflicts in route chain selection
- [ ] T082 [P] Optimize performance for long chains (10+ routes) in RouteChainDisplay and RouteChainNavigation
- [ ] T083 [P] Add accessibility features (keyboard navigation, screen reader support, focus management) to route chain UI components
- [ ] T084 [P] Add responsive design styles for mobile devices in src/styles/main.css
- [ ] T085 [P] Add loading states and error messages throughout route chain workflow
- [ ] T086 [P] Add unit tests for extractFinalStateFromRoute utility in tests/unit/route-state-extractor.test.js
- [ ] T087 [P] Add unit tests for chain calculation logic in tests/unit/chain-calculation.test.js
- [ ] T088 [P] Add unit tests for route chain storage functions in tests/unit/route-chain-storage.test.js
- [ ] T089 [P] Add integration tests for complete route chain workflow in tests/integration/route-chain-workflow.test.js
- [ ] T090 [P] Add integration tests for progress tracking across routes in tests/integration/route-chain-progress.test.js
- [ ] T091 [P] Run quickstart.md validation to ensure all examples work correctly
- [ ] T092 [P] Update documentation with route chaining examples and usage patterns
- [ ] T093 [P] Code cleanup and refactoring across all route chain components
- [ ] T094 [P] Performance testing: verify chain creation < 2 min (SC-001), calculation < 5 min for 3 routes (SC-002), navigation < 1s (SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3)
  - US1 and US2 (both P1) can be worked on in parallel after foundational
  - US3 and US4 (both P2) can be worked on in parallel after US1/US2
  - US5 (P3) depends on US4 for progress persistence
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for route selection, but can be developed in parallel
- **User Story 3 (P2)**: Can start after US2 completes - Depends on chain calculation being functional
- **User Story 4 (P2)**: Can start after US3 completes - Depends on chain display being functional
- **User Story 5 (P3)**: Can start after US4 completes - Depends on chain saving/loading being functional

### Within Each User Story

- Component structure before implementation details
- Core functionality before UI polish
- Data flow before error handling
- Basic features before advanced features

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - US1 and US2 can be developed in parallel (different components)
  - US3 and US4 can be developed in parallel after US1/US2 (different components)
- All Polish tasks marked [P] can run in parallel
- Different test files can be written in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all component creation tasks together:
Task: "Create WizardRouteChainSelection component class in src/js/ui/wizard-route-chain-selection.js"
Task: "Extend RouteCreationWizard in src/js/ui/route-creation-wizard.js to add route chain selection option"

# Launch all UI implementation tasks together (after component structure):
Task: "Implement route selection UI in WizardRouteChainSelection.render() to allow adding category-based routes"
Task: "Implement route selection UI in WizardRouteChainSelection.render() to allow adding achievement-based routes"
Task: "Add UI controls for reordering routes (up/down buttons or drag-and-drop) in wizard-route-chain-selection.js"
Task: "Add UI controls for removing routes (remove button) in wizard-route-chain-selection.js"
```

---

## Parallel Example: User Story 2

```bash
# Launch all calculation logic tasks together:
Task: "Implement sequential route calculation loop in calculateRouteChain to calculate routes one after another"
Task: "Implement building accumulation logic in calculateRouteChain using extractFinalStateFromRoute"
Task: "Implement upgrade accumulation logic in calculateRouteChain using extractFinalStateFromRoute"
Task: "Implement error handling in calculateRouteChain to stop on first error and return partial results"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Select Multiple Routes)
4. Complete Phase 4: User Story 2 (Calculate Chained Routes)
5. **STOP and VALIDATE**: Test User Stories 1 & 2 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic chain selection)
3. Add User Story 2 → Test independently → Deploy/Demo (Chain calculation - MVP!)
4. Add User Story 3 → Test independently → Deploy/Demo (Chain viewing)
5. Add User Story 4 → Test independently → Deploy/Demo (Chain saving)
6. Add User Story 5 → Test independently → Deploy/Demo (Progress tracking)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Selection UI)
   - Developer B: User Story 2 (Calculation logic) - can start in parallel with US1
3. Once US1 and US2 complete:
   - Developer A: User Story 3 (Display/Navigation)
   - Developer B: User Story 4 (Storage) - can start in parallel with US3
4. Once US3 and US4 complete:
   - Developer A: User Story 5 (Progress tracking)
   - Developer B: Polish tasks
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are optional - only add if explicitly requested (not included in this task list per spec)
- All file paths are relative to repository root
- Follow existing code patterns and conventions from route-creation-wizard.js and route-display.js

---

## Summary

**Total Tasks**: 94 tasks
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 4 tasks
- Phase 3 (User Story 1): 16 tasks
- Phase 4 (User Story 2): 13 tasks
- Phase 5 (User Story 3): 15 tasks
- Phase 6 (User Story 4): 15 tasks
- Phase 7 (User Story 5): 13 tasks
- Phase 8 (Polish): 15 tasks

**Task Count Per User Story**:
- User Story 1: 16 tasks
- User Story 2: 13 tasks
- User Story 3: 15 tasks
- User Story 4: 15 tasks
- User Story 5: 13 tasks

**Parallel Opportunities Identified**:
- Setup phase: 2 tasks can run in parallel
- Foundational phase: 2 tasks can run in parallel
- User Stories 1 & 2: Can be developed in parallel after foundational
- User Stories 3 & 4: Can be developed in parallel after US1/US2
- Polish phase: All 15 tasks can run in parallel

**Independent Test Criteria**:
- **US1**: Open wizard, select multiple routes, verify selection and display works
- **US2**: Create chain with 2 routes, calculate, verify second route uses first route's buildings
- **US3**: View calculated chain, navigate between routes, verify building sequences and cumulative counts
- **US4**: Save chain, access from saved routes list, verify chain is preserved with indicator
- **US5**: Check off buildings in different routes, verify independent progress and overall progress

**Suggested MVP Scope**: User Stories 1 & 2 (Select Routes + Calculate Chains)
- Delivers core value: users can create and calculate route chains
- Can be tested independently
- Provides foundation for remaining stories

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P] marker, [Story] label, and file paths

