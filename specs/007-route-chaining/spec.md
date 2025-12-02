# Feature Specification: Route Chaining

**Feature Branch**: `007-route-chaining`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "The user should be able to chain routes together. The wizard should provide the option to select multiple routes to complete them in sequence. Eg starting with Nevercore, followed by Hardcore into Longhaul. Each route takes the Buildings/upgrades bought during the previous route as starting buildings to calculate the optimal route for the specific route target. The user should also be able to chain in achievement routes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Multiple Routes for Chaining (Priority: P1)

A user wants to create a sequence of routes that will be completed one after another. They can select multiple routes (categories or achievement routes) in the wizard, and the system will calculate each route in sequence, using the buildings and upgrades purchased in previous routes as the starting point for subsequent routes.

**Why this priority**: This is the core functionality - without the ability to select multiple routes, users cannot create route chains. This is essential for users who want to optimize their gameplay across multiple goals.

**Independent Test**: Can be fully tested by opening the route creation wizard, selecting multiple routes (e.g., Nevercore, then Hardcore, then Longhaul), and verifying the system accepts the selection and displays the route sequence.

**Acceptance Scenarios**:

1. **Given** the user is in the route creation wizard, **When** they reach the route selection step, **Then** the system provides an option to select multiple routes instead of just one
2. **Given** the user chooses to create a route chain, **When** they select multiple routes, **Then** the system displays all selected routes in sequence order
3. **Given** the user has selected multiple routes, **When** they view the route sequence, **Then** the system shows the order in which routes will be calculated (e.g., "1. Nevercore → 2. Hardcore → 3. Longhaul")
4. **Given** the user has selected multiple routes, **When** they want to reorder them, **Then** the system allows them to change the sequence order
5. **Given** the user has selected multiple routes, **When** they want to remove a route from the chain, **Then** the system allows them to remove individual routes from the sequence
6. **Given** the user can select both category-based routes and achievement-based routes, **When** they create a route chain, **Then** the system allows mixing both types in a single chain

---

### User Story 2 - Calculate Chained Routes with Building Progression (Priority: P1)

A user wants the system to calculate each route in the chain, where each route uses the buildings and upgrades purchased during all previous routes as its starting state. The system calculates routes sequentially, accumulating buildings and upgrades from each route to use as the starting point for the next route.

**Why this priority**: This is the core value proposition - each route must build upon the previous routes. Without this building progression, route chaining has no purpose and users cannot optimize across multiple goals.

**Independent Test**: Can be fully tested by creating a route chain with two routes, calculating the chain, and verifying that the second route's calculation uses buildings purchased in the first route as its starting buildings.

**Acceptance Scenarios**:

1. **Given** a route chain has been selected, **When** the user initiates route calculation, **Then** the system calculates the first route using the initial starting buildings
2. **Given** the first route in a chain has been calculated, **When** the system calculates the second route, **Then** the system uses all buildings and upgrades purchased in the first route as starting buildings for the second route
3. **Given** multiple routes are in a chain, **When** the system calculates each subsequent route, **Then** the system accumulates buildings and upgrades from all previous routes as the starting state
4. **Given** a route chain is being calculated, **When** calculation is in progress, **Then** the system displays progress indicating which route is currently being calculated (e.g., "Calculating route 2 of 3: Hardcore")
5. **Given** all routes in a chain have been calculated, **When** calculation completes, **Then** the system displays the complete chain with all routes showing their building purchase sequences
6. **Given** a route chain includes an achievement route, **When** the system calculates the achievement route, **Then** it uses buildings and upgrades from previous routes as the starting state

---

### User Story 3 - View and Navigate Chained Routes (Priority: P2)

A user wants to view the complete route chain and navigate between individual routes in the chain to see the building purchase sequence for each route. They can see how buildings accumulate across routes and track progress through the entire chain.

**Why this priority**: Users need to understand the complete chain and see how each route builds upon the previous ones. This enables users to follow the route chain effectively and understand the progression.

**Independent Test**: Can be fully tested by viewing a calculated route chain and verifying that users can see all routes in the chain, navigate between them, and view the building sequences for each route.

**Acceptance Scenarios**:

1. **Given** a route chain has been calculated, **When** the user views the chain, **Then** the system displays all routes in the chain with clear visual separation between routes
2. **Given** a route chain is displayed, **When** the user views a route in the chain, **Then** the system shows the building purchase sequence for that specific route
3. **Given** a route chain is displayed, **When** the user navigates between routes, **Then** the system allows switching between routes in the chain to view each route's details
4. **Given** a route chain is displayed, **When** the user views a route, **Then** the system shows which buildings and upgrades were carried forward from previous routes
5. **Given** a route chain is displayed, **When** the user views the complete chain, **Then** the system shows the cumulative building counts at the start of each route in the chain

---

### User Story 4 - Save and Access Route Chains (Priority: P2)

A user wants to save a route chain so they can access it later, continue tracking progress, and work on multiple route chains simultaneously. Saved route chains behave like individual saved routes but contain multiple routes in sequence.

**Why this priority**: Users need to preserve their route chains for later use, especially for long chains that may take significant time to complete. This enables users to manage multiple route chains and maintain progress across sessions.

**Independent Test**: Can be fully tested by saving a route chain, accessing it from the saved routes list, and verifying that the complete chain with all routes is preserved and accessible.

**Acceptance Scenarios**:

1. **Given** a route chain has been calculated, **When** the user saves the chain, **Then** the system prompts for a name and saves the complete chain
2. **Given** a route chain has been saved, **When** the user views their saved routes, **Then** the saved chain appears in the list with an indicator that it is a chain (not a single route)
3. **Given** a saved route chain exists, **When** the user opens it, **Then** the system displays the complete chain with all routes and preserved progress
4. **Given** multiple route chains are saved, **When** the user views saved routes, **Then** each chain is displayed independently and can be accessed separately
5. **Given** a saved route chain is accessed, **When** the user tracks progress, **Then** progress is maintained separately for each route in the chain

---

### User Story 5 - Track Progress Through Route Chain (Priority: P3)

A user wants to track their progress through a route chain, checking off buildings as they purchase them. Progress is tracked independently for each route in the chain, and users can see their overall progress through the entire chain.

**Why this priority**: Progress tracking helps users follow the route chain and know where they are in the sequence. This improves usability and helps users stay organized when working through long chains.

**Independent Test**: Can be fully tested by checking off buildings in different routes of a chain and verifying that progress is maintained separately for each route and the overall chain progress is updated.

**Acceptance Scenarios**:

1. **Given** a route chain is displayed, **When** the user checks off buildings in the first route, **Then** the system tracks progress for that specific route
2. **Given** progress is tracked in a route chain, **When** the user switches between routes in the chain, **Then** progress for each route is maintained independently
3. **Given** a route chain is being followed, **When** the user completes all buildings in the first route, **Then** the system indicates that the first route is complete and they can proceed to the next route
4. **Given** a route chain is displayed, **When** the user views the chain, **Then** the system shows overall progress through the entire chain (e.g., "Route 1 of 3 complete, Route 2 in progress")
5. **Given** progress is updated in a saved route chain, **When** the user saves or the system auto-saves, **Then** progress for all routes in the chain is preserved

---

### Edge Cases

- What happens when a user tries to create a route chain with zero routes selected?
- How does the system handle a route chain where one route's calculation fails?
- What happens when a user creates a route chain with conflicting game versions (e.g., one route uses v2048, another uses v2052)?
- How does the system handle a route chain where one route requires hardcore mode and another does not?
- What happens when a user tries to reorder routes in a chain after calculation has started?
- How does the system handle very long route chains (e.g., 10+ routes)?
- What happens when a user creates a route chain where an achievement route's requirements are already met by buildings from previous routes?
- How does the system handle a route chain where the first route doesn't purchase any buildings (edge case)?
- What happens when a user tries to save a route chain with a name that already exists?
- How does the system handle a route chain where one route's target is already reached by buildings from previous routes?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to select multiple routes (categories or achievement routes) in the route creation wizard
- **FR-002**: System MUST display selected routes in sequence order and allow users to view the route chain
- **FR-003**: System MUST allow users to reorder routes in a chain before calculation
- **FR-004**: System MUST allow users to remove individual routes from a chain before calculation
- **FR-005**: System MUST allow mixing category-based routes and achievement-based routes in a single chain
- **FR-006**: System MUST calculate routes in a chain sequentially, one after another
- **FR-007**: System MUST use all buildings and upgrades purchased in previous routes as starting buildings for each subsequent route in the chain
- **FR-008**: System MUST accumulate buildings and upgrades from all previous routes when calculating each route in the chain
- **FR-009**: System MUST display progress during chain calculation indicating which route is currently being calculated
- **FR-010**: System MUST display the complete route chain with all routes after calculation completes
- **FR-011**: System MUST allow users to navigate between routes in a displayed chain to view each route's building purchase sequence
- **FR-012**: System MUST show which buildings and upgrades were carried forward from previous routes when displaying a route in the chain
- **FR-013**: System MUST show cumulative building counts at the start of each route in the chain
- **FR-014**: System MUST allow users to save route chains with a custom name
- **FR-015**: System MUST store saved route chains persistently in local storage
- **FR-016**: System MUST display saved route chains in the saved routes list with an indicator that they are chains
- **FR-017**: System MUST allow users to access saved route chains and view them with all routes preserved
- **FR-018**: System MUST maintain separate progress tracking for each route within a chain
- **FR-019**: System MUST track overall progress through the entire route chain
- **FR-020**: System MUST preserve progress for all routes in a chain when saving
- **FR-021**: System MUST validate that at least one route is selected before allowing chain calculation
- **FR-022**: System MUST handle calculation errors for individual routes in a chain gracefully, allowing users to modify the chain and retry

### Key Entities *(include if feature involves data)*

- **RouteChain**: Represents a sequence of routes that will be calculated and completed in order. Contains an ordered list of route configurations (categories or achievement routes), metadata about the chain (name, creation date), and calculated route results for each step in the chain.

- **ChainedRoute**: Represents a single route within a chain. Contains the route configuration, the calculated route result, the starting buildings/upgrades used for calculation (accumulated from previous routes), and progress tracking data.

- **ChainCalculationState**: Represents the state during chain calculation. Tracks which route is currently being calculated, accumulated buildings/upgrades from completed routes, and any errors encountered during calculation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a route chain with 2-5 routes in under 2 minutes
- **SC-002**: System calculates a route chain with 3 routes in under 5 minutes (assuming average route calculation time)
- **SC-003**: 95% of route chains calculate successfully without errors when valid routes are selected
- **SC-004**: Users can navigate between routes in a chain and view route details in under 1 second
- **SC-005**: Saved route chains are accessible and display correctly 100% of the time
- **SC-006**: Progress tracking maintains accuracy for all routes in a chain across multiple sessions
- **SC-007**: Users can successfully follow a route chain and complete all routes in sequence without losing progress

## Assumptions

- Route chains will typically contain 2-5 routes, but the system should support longer chains
- Users will want to save route chains for later use, similar to how individual routes are saved
- Building and upgrade accumulation from previous routes is the primary mechanism for chaining
- Route chains can mix category-based routes (cookie targets) and achievement-based routes
- Each route in a chain is calculated independently, using the accumulated state from previous routes
- Progress tracking for route chains follows the same pattern as individual routes (checkboxes for building purchases)
- Route chains are saved as a single entity, not as separate individual routes

