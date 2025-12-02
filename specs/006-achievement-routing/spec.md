# Feature Specification: Achievement-Based Route Calculation

**Feature Branch**: `006-achievement-routing`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "besides calculating/simulating routes to reach certain amounts of cookies, the user should be able to calculate/simulate optimal routes to reach one or more achievement requirements"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calculate Route for Single Achievement (Priority: P1)

A user wants to find the optimal building purchase sequence to unlock a specific achievement. They select an achievement from a list of available achievements, and the system calculates and displays the optimal route to meet that achievement's requirements.

**Why this priority**: This is the core value proposition for achievement routing - providing optimal routes to unlock specific achievements. Without this, the feature has no purpose.

**Independent Test**: Can be fully tested by selecting a single routeable achievement, running a simulation, and verifying that a detailed building order list is displayed that will result in the achievement being unlocked.

**Acceptance Scenarios**:

1. **Given** the user is creating a new route, **When** they select "Achievement-based route" as the route type, **Then** the system displays a list of routeable achievements
2. **Given** a list of routeable achievements is displayed, **When** the user selects a single achievement, **Then** the system shows the achievement name and its requirement description
3. **Given** a single achievement is selected, **When** the user starts the route calculation, **Then** the system calculates the optimal building purchase sequence to meet that achievement's requirements
4. **Given** a route calculation completes for an achievement, **When** the user views the route, **Then** the route displays buildings in optimal purchase order and indicates when the achievement requirement will be met
5. **Given** a non-routeable achievement exists, **When** the user views the achievement list, **Then** non-routeable achievements are either excluded or clearly marked as unavailable for routing

---

### User Story 2 - Calculate Route for Multiple Achievements (Priority: P2)

A user wants to find the optimal route that unlocks multiple achievements simultaneously. They select multiple achievements, and the system calculates a single route that efficiently reaches all selected achievement requirements.

**Why this priority**: Many users want to optimize their gameplay by working toward multiple achievements at once. This significantly increases the value of the routing system by enabling more complex optimization strategies.

**Independent Test**: Can be fully tested by selecting multiple achievements, running a simulation, and verifying that the calculated route meets all selected achievement requirements in the most efficient sequence.

**Acceptance Scenarios**:

1. **Given** the user is creating an achievement-based route, **When** they select multiple achievements, **Then** the system shows all selected achievements and their combined requirements
2. **Given** multiple achievements are selected, **When** the user starts the route calculation, **Then** the system calculates a route that meets all achievement requirements
3. **Given** a route is calculated for multiple achievements, **When** the user views the route, **Then** the route indicates which achievement requirements are met at each step
4. **Given** multiple achievements with conflicting requirements are selected, **When** the system calculates the route, **Then** the route prioritizes the most efficient path that satisfies all requirements
5. **Given** a route for multiple achievements is displayed, **When** the user reviews the route, **Then** they can see which achievements are unlocked at which point in the sequence

---

### User Story 3 - Filter and Search Achievements (Priority: P3)

A user wants to quickly find specific achievements from a large list. They can filter achievements by type, search by name, or view only routeable achievements to streamline their selection process.

**Why this priority**: With hundreds of achievements available, users need efficient ways to find the achievements they want to route. This improves usability and reduces friction in the route creation process.

**Independent Test**: Can be fully tested by using search and filter options to locate specific achievements and verifying that only matching achievements are displayed.

**Acceptance Scenarios**:

1. **Given** the user is viewing the achievement selection interface, **When** they enter text in a search field, **Then** the achievement list filters to show only achievements matching the search term
2. **Given** the user is viewing achievements, **When** they select a filter option (e.g., "Building Count", "Cookies Per Second"), **Then** only achievements of that type are displayed
3. **Given** the user wants to see only routeable achievements, **When** they enable a "Routeable Only" filter, **Then** non-routeable achievements are hidden from the list
4. **Given** multiple filters are active, **When** the user views the achievement list, **Then** only achievements matching all active filters are displayed

---

### User Story 4 - View Achievement Requirements Before Routing (Priority: P3)

A user wants to understand what an achievement requires before selecting it for routing. They can view detailed information about each achievement's requirements, including the specific values needed (e.g., "Have 50 farms", "Bake 1 million cookies per second").

**Why this priority**: Users need to make informed decisions about which achievements to pursue. Clear requirement information helps users understand what they're committing to and select appropriate achievements for their goals.

**Independent Test**: Can be fully tested by viewing achievement details and verifying that requirement information is clearly displayed and understandable.

**Acceptance Scenarios**:

1. **Given** the user is viewing the achievement list, **When** they view details for an achievement, **Then** the system displays the achievement name, description, and specific requirement values
2. **Given** an achievement with a building count requirement, **When** the user views its details, **Then** the system shows which building and how many are required
3. **Given** an achievement with a cookies per second requirement, **When** the user views its details, **Then** the system shows the target CPS value
4. **Given** a non-routeable achievement, **When** the user views its details, **Then** the system explains why it cannot be routed

---

### Edge Cases

- What happens when a user selects an achievement that requires more buildings than can be purchased with available cookies in the simulation?
- How does the system handle achievements with requirements that are already met by the starting game state?
- What happens when a user selects multiple achievements where one achievement's requirements are a subset of another's?
- How does the system handle achievements that require building levels (which may depend on sugar lumps not currently simulated)?
- What happens when a user tries to route to an achievement that requires clicking or random events?
- How does the system handle very large achievement requirement values (e.g., "Have 1,000,000 farms")?
- What happens when a user selects achievements that have conflicting optimal paths (e.g., one requires focusing on farms, another requires focusing on cursors)?
- How does the system handle achievements that are already unlocked in the starting game state?
- What happens when a user selects zero achievements or deselects all achievements before calculating?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to select "Achievement-based route" as a route type when creating a new route
- **FR-002**: System MUST display a list of available achievements for route calculation
- **FR-003**: System MUST distinguish between routeable and non-routeable achievements in the user interface
- **FR-004**: System MUST allow users to select one or more routeable achievements as route goals
- **FR-005**: System MUST display achievement names and requirement descriptions when achievements are selected
- **FR-006**: System MUST calculate optimal building purchase sequences to meet selected achievement requirements
- **FR-007**: System MUST support routing for achievement types including: building count, cookies per second, total cookies baked, upgrade count, total buildings owned, minimum buildings across all types, and building levels
- **FR-008**: System MUST prevent selection of non-routeable achievements (e.g., clicking achievements, golden cookie achievements, random event achievements)
- **FR-009**: System MUST calculate routes that efficiently satisfy all requirements when multiple achievements are selected
- **FR-010**: System MUST indicate in the route display when each achievement requirement is met
- **FR-011**: System MUST allow users to filter achievements by requirement type (building count, CPS, total cookies, etc.)
- **FR-012**: System MUST allow users to search achievements by name or description
- **FR-013**: System MUST allow users to filter to show only routeable achievements
- **FR-014**: System MUST display detailed requirement information for each achievement before selection
- **FR-015**: System MUST handle starting game states where some achievement requirements may already be met
- **FR-016**: System MUST integrate achievement-based routing with existing starting buildings functionality
- **FR-017**: System MUST integrate achievement-based routing with existing save game import functionality
- **FR-018**: System MUST save achievement-based routes with metadata indicating which achievements were targeted
- **FR-019**: System MUST allow users to view saved achievement-based routes and see which achievements were targeted

### Key Entities *(include if feature involves data)*

- **Achievement**: Represents a Cookie Clicker achievement with an ID, name, description, category, and type (normal/shadow). Contains requirement information that determines if it can be routed.
- **Achievement Requirement**: Represents the parsed, routeable requirement for an achievement. Types include buildingCount, cps, totalCookies, upgradeCount, totalBuildings, minBuildings, buildingLevel, or notRouteable.
- **Achievement Route**: A route calculated to meet one or more achievement requirements. Extends the base route concept with achievement-specific metadata and goal tracking.
- **Route Goal**: The target condition(s) for a route calculation. Can be a cookie amount (existing) or one or more achievement requirements (new).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select and calculate routes for any routeable achievement type (building count, CPS, total cookies, upgrade count, total buildings, minimum buildings, building levels) within 5 seconds of opening the achievement selection interface
- **SC-002**: Route calculations for single achievements complete and display results within the same time performance as existing cookie-based routes (no more than 2x slower)
- **SC-003**: Route calculations for multiple achievements (up to 5) complete within 3x the time of single achievement routes
- **SC-004**: Users can successfully identify and select routeable achievements from a list of 200+ total achievements using search and filter tools in under 30 seconds
- **SC-005**: 95% of calculated achievement routes correctly meet all selected achievement requirements when verified through route replay
- **SC-006**: Users can understand achievement requirements from displayed information without needing to reference external sources
- **SC-007**: Achievement-based routes integrate seamlessly with existing features (starting buildings, save game import, route saving) with no degradation in functionality
- **SC-008**: The system correctly identifies and excludes non-routeable achievements, preventing user selection errors

## Assumptions

- Achievement requirement data is already available in the system (achievement-requirements.js provides the mapping)
- The existing route calculation algorithms can be extended to support achievement-based goals without fundamental changes
- Building level achievements may require additional game mechanics (sugar lumps) that are not currently simulated, but the system will handle them gracefully
- Users understand that some achievements cannot be routed due to their requirement types (clicking, random events, etc.)
- Multiple achievement routes may not always be perfectly optimal for all achievements simultaneously, but will provide a reasonable compromise solution
- Achievement-based routes will use the same storage and persistence mechanisms as existing cookie-based routes

## Dependencies

- Existing route calculation system (simulation.js, router.js)
- Achievement data and requirement mapping (achievements.js, achievement-requirements.js)
- Existing UI components for route creation and display
- Existing save game import and starting buildings functionality

