# Feature Specification: Saved Routes

**Feature Branch**: `002-saved-routes`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Currently when selecting a different category the progress in the current one is lost and replaced with the calculation for the new one. Create a feature that lets the user "save" any calculated route to later access them again and progress them independently."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save Calculated Route (Priority: P1)

A user calculates a route for a category and wants to save it so they can access it later without losing their progress or needing to recalculate it. They can save the route with a custom name for easy identification.

**Why this priority**: This is the core functionality - without the ability to save routes, users cannot maintain multiple routes simultaneously. This is essential for users working on multiple categories or wanting to preserve their progress.

**Independent Test**: Can be fully tested by calculating a route, saving it with a name, and verifying it appears in a saved routes list and can be accessed later.

**Acceptance Scenarios**:

1. **Given** a route has been calculated and displayed, **When** the user clicks a "Save Route" button, **Then** the system prompts for a route name and saves the route
2. **Given** a route is saved, **When** the user views the saved routes list, **Then** the saved route appears with its name, category, and last accessed date
3. **Given** a route is being saved, **When** the user provides a name, **Then** the route is saved and the user receives confirmation
4. **Given** a route is being saved, **When** the user does not provide a name, **Then** the system generates a default name based on category and timestamp

---

### User Story 2 - Access Saved Routes (Priority: P2)

A user wants to view and access previously saved routes to continue tracking their progress or review the route details.

**Why this priority**: Saved routes are useless if users cannot access them. This enables the core value proposition of maintaining multiple routes.

**Independent Test**: Can be fully tested by opening a saved route from the list and verifying it displays with all its details and preserved progress.

**Acceptance Scenarios**:

1. **Given** multiple routes are saved, **When** the user views the saved routes list, **Then** all saved routes are displayed with their names, categories, and metadata
2. **Given** a saved route exists, **When** the user selects it from the list, **Then** the route is displayed with all building steps and preserved progress checkboxes
3. **Given** a saved route is accessed, **When** the user views it, **Then** the route shows the same calculation results as when it was saved
4. **Given** a saved route is accessed, **When** the user views it, **Then** all previously checked progress items remain checked

---

### User Story 3 - Track Progress Independently Per Route (Priority: P3)

A user wants to track progress separately for each saved route, so they can work on multiple routes simultaneously without progress from one route affecting another.

**Why this priority**: This is the key differentiator from the current behavior. Users need independent progress tracking to manage multiple routes effectively.

**Independent Test**: Can be fully tested by saving two routes, checking off buildings in one, switching to the other, and verifying progress is maintained separately for each route.

**Acceptance Scenarios**:

1. **Given** two routes are saved, **When** the user checks off buildings in Route A, **Then** Route B's progress remains unchanged
2. **Given** a user switches between saved routes, **When** they return to a previously viewed route, **Then** all progress checkboxes reflect the state from when they last viewed that route
3. **Given** progress is updated in a saved route, **When** the user switches to another route and returns, **Then** the updated progress is preserved

---

### User Story 4 - Manage Saved Routes (Priority: P4)

A user wants to manage their saved routes by renaming, deleting, or organizing them to keep their collection manageable.

**Why this priority**: As users save more routes, they need management capabilities to maintain organization and remove routes they no longer need.

**Independent Test**: Can be fully tested by renaming a saved route, deleting a saved route, and verifying the changes are reflected in the saved routes list.

**Acceptance Scenarios**:

1. **Given** a saved route exists, **When** the user renames it, **Then** the new name is saved and displayed in the list
2. **Given** a saved route exists, **When** the user deletes it, **Then** the route is removed from the list and can no longer be accessed
3. **Given** multiple saved routes exist, **When** the user deletes one, **Then** only that route is removed and other routes remain accessible
4. **Given** a saved route is deleted, **When** the user confirms deletion, **Then** the associated progress data is also removed

---

### Edge Cases

- What happens when a user tries to save a route with a name that already exists?
- How does the system handle saving a route when local storage is full?
- What happens when a user tries to access a saved route that references a category that has been deleted?
- How does the system handle corrupted saved route data?
- What happens when a user saves a route, then changes the category definition and tries to access the old route?
- How does the system handle very long route names?
- What happens when a user has saved the maximum number of routes (if a limit exists)?
- How does the system handle accessing a saved route when the game version used for that route is no longer available?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to save a calculated route with a custom name
- **FR-002**: System MUST store saved routes persistently in local storage
- **FR-003**: System MUST display a list of all saved routes with their names, categories, and metadata
- **FR-004**: System MUST allow users to access a saved route and view it with all building steps
- **FR-005**: System MUST maintain separate progress tracking for each saved route
- **FR-006**: System MUST preserve progress checkboxes independently for each saved route
- **FR-007**: System MUST allow users to rename saved routes
- **FR-008**: System MUST allow users to delete saved routes
- **FR-009**: System MUST prevent duplicate route names or handle them appropriately
- **FR-010**: System MUST display route metadata (category name, save date, last accessed date) in the saved routes list
- **FR-011**: System MUST allow users to switch between saved routes without losing progress in any route
- **FR-012**: System MUST preserve all route calculation details (buildings, costs, times) when saving
- **FR-013**: System MUST handle cases where a saved route's category or version is no longer available

### Key Entities *(include if feature involves data)*

- **SavedRoute**: Represents a user-saved route instance with a unique identifier, name, reference to the original category, full route calculation data, save timestamp, and last accessed timestamp
- **RouteProgress**: Represents progress tracking data associated with a specific saved route, including which building steps are completed (one-to-one relationship with SavedRoute)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can save a route and access it later within 3 user actions (save → view list → select route)
- **SC-002**: Users can maintain progress independently across at least 10 different saved routes simultaneously
- **SC-003**: 100% of saved routes preserve their calculation data and progress when accessed after page refresh
- **SC-004**: Users can switch between saved routes without losing progress in any route (0% data loss during route switching)
- **SC-005**: Route save operation completes successfully in under 1 second
- **SC-006**: Saved routes list displays all saved routes with metadata in under 500ms
- **SC-007**: 95% of users can successfully save and retrieve a route on their first attempt without instructions

## Assumptions

- Users will want to save routes with meaningful names to identify them later
- Users may save multiple routes for the same category with different starting buildings
- Saved routes should persist across browser sessions indefinitely (no automatic expiration)
- Route calculation data is immutable once saved (changes to category definitions don't affect saved routes)
- Local storage capacity is sufficient for typical usage (assumed 10-50 saved routes per user)
- Users understand that saved routes are tied to the specific game version used when calculated

