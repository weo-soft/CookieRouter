# Feature Specification: Update Route from Save Game

**Feature Branch**: `010-update-route-save`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "the user should be able to update a existing route by importing their current save game data and triggering a recalculation of the route by doing so."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update Saved Route with Current Save Game (Priority: P1)

A user has a saved route that was calculated with older game state data. They want to update the route by importing their current save game data, which will trigger a recalculation using their current building counts and game state as the new starting point.

**Why this priority**: This is the core functionality - without the ability to update routes with current save data, users must manually delete and recreate routes when their game state changes. This feature enables users to keep routes current with their actual game progress.

**Independent Test**: Can be fully tested by selecting a saved route, importing a save game, triggering an update, and verifying the route is recalculated with the new starting state.

**Acceptance Scenarios**:

1. **Given** a saved route exists, **When** the user imports their current save game data, **Then** the system provides an option to update the route with the imported data
2. **Given** a saved route is selected and save game data is imported, **When** the user triggers route update, **Then** the system recalculates the route using the imported building counts and game state as the new starting point
3. **Given** a route update is triggered, **When** the recalculation completes, **Then** the saved route is updated with the new calculation results
4. **Given** a route is updated with new save game data, **When** the update completes, **Then** the route reflects the user's current game state while preserving the route's name and metadata
5. **Given** a route update is in progress, **When** the recalculation is running, **Then** the system displays progress indicators and prevents duplicate update requests

---

### User Story 2 - Preserve Route Identity During Update (Priority: P2)

A user wants to update a saved route with new data while maintaining the route's identity, name, and associated progress tracking, so they don't lose their progress or need to rename the route.

**Why this priority**: Users need continuity - updating a route should feel like refreshing the same route, not creating a new one. Preserving identity ensures users don't lose track of their routes or progress.

**Independent Test**: Can be fully tested by updating a route with progress checkboxes marked, verifying the route keeps its name and ID, and confirming progress is preserved or appropriately handled.

**Acceptance Scenarios**:

1. **Given** a saved route has a custom name, **When** the route is updated with new save game data, **Then** the route name remains unchanged
2. **Given** a saved route has progress tracked (completed buildings), **When** the route is updated, **Then** the system preserves progress for building steps that remain valid in the updated route
3. **Given** a saved route is updated, **When** the update completes, **Then** the route maintains its unique identifier and remains accessible from the same location in the saved routes list
4. **Given** a route update changes the building sequence, **When** progress is preserved, **Then** completed buildings that no longer exist in the updated route are handled appropriately (cleared or marked as obsolete)

---

### User Story 3 - Handle Update Conflicts and Edge Cases (Priority: P3)

A user wants the system to handle various edge cases gracefully when updating routes, such as incompatible save game data, version mismatches, or calculation failures.

**Why this priority**: Real-world usage will encounter edge cases. Handling them gracefully ensures the feature remains reliable and doesn't leave routes in inconsistent states.

**Independent Test**: Can be fully tested by attempting to update routes with incompatible data, different game versions, or invalid save games, and verifying appropriate error handling.

**Acceptance Scenarios**:

1. **Given** a saved route was calculated for version A, **When** the user imports a save game from version B, **Then** the system handles the version difference appropriately (warns user, uses compatible version, or prevents update)
2. **Given** imported save game data is invalid or corrupted, **When** the user attempts to update a route, **Then** the system displays an error message and does not update the route
3. **Given** a route update calculation fails, **When** the error occurs, **Then** the system preserves the original route unchanged and displays an error message
4. **Given** a route update is attempted while another calculation is in progress, **When** the user triggers update, **Then** the system prevents concurrent updates or queues the request appropriately
5. **Given** imported save game data has fewer buildings than the route's original starting state, **When** the route is updated, **Then** the system handles this appropriately (recalculates from new state or warns user)

---

### Edge Cases

- What happens when a user updates a route with save game data that has significantly different building counts (e.g., much higher or lower)?
- How does the system handle updating a route when the imported save game is from a different game mode (e.g., hardcore vs normal)?
- What happens when a route update results in a route that is identical to the original route?
- How does the system handle updating a route chain (if route chains can be updated)?
- What happens when a user updates a route, then immediately updates it again with different save game data?
- How does the system handle updating a route when the category definition has changed since the route was originally saved?
- What happens when a route update takes a very long time to calculate?
- How does the system handle updating a route when the imported save game contains buildings not available in the route's category?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to import save game data while viewing a saved route
- **FR-002**: System MUST provide an interface to trigger route update after importing save game data
- **FR-003**: System MUST recalculate the route using imported save game data (building counts, game state) as the new starting point when update is triggered
- **FR-004**: System MUST update the saved route with new calculation results while preserving the route's unique identifier
- **FR-005**: System MUST preserve the route's name when updating with new save game data
- **FR-006**: System MUST preserve route progress (completed buildings) for steps that remain valid in the updated route
- **FR-007**: System MUST handle progress for building steps that no longer exist in the updated route (clear or mark as obsolete)
- **FR-008**: System MUST validate imported save game data before allowing route update
- **FR-009**: System MUST prevent route update if imported save game data is invalid or corrupted
- **FR-010**: System MUST handle version differences between the saved route and imported save game data
- **FR-011**: System MUST preserve the original route unchanged if update calculation fails
- **FR-012**: System MUST display error messages when route update fails
- **FR-013**: System MUST prevent concurrent route updates for the same route
- **FR-014**: System MUST display progress indicators during route recalculation
- **FR-015**: System MUST update route metadata (e.g., last updated timestamp) when route is successfully updated
- **FR-016**: System MUST allow users to cancel an in-progress route update
- **FR-017**: System MUST handle cases where imported save game data has incompatible game mode settings

### Key Entities *(include if feature involves data)*

- **SavedRoute**: Represents a saved route that can be updated. When updated, the routeData field is recalculated using new starting state from imported save game, while id, name, and other metadata are preserved.
- **ImportedSaveGame**: Represents the current save game data imported by the user. Contains building counts, game state, version, and other data used to update the route's starting point.
- **RouteUpdateState**: Represents the state of an ongoing route update operation, including whether update is in progress, progress indicators, and any errors encountered.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can update a saved route with imported save game data within 5 user actions (select route → import save → trigger update → confirm → view updated route)
- **SC-002**: Route update operation completes successfully (route recalculated and saved) in under 30 seconds for typical routes
- **SC-003**: 95% of route updates preserve route identity (name, ID) and successfully update calculation data
- **SC-004**: Route progress is preserved correctly for 90% of building steps that remain valid after update
- **SC-005**: Invalid save game data is detected and prevented from updating routes with 100% accuracy
- **SC-006**: Users receive clear error messages within 3 seconds when route update fails
- **SC-007**: Original route remains unchanged in 100% of cases where update calculation fails
- **SC-008**: 90% of users can successfully update a route with save game data on their first attempt without assistance

## Assumptions

- Users will want to update routes periodically as their game state progresses
- Imported save game data will typically represent a more advanced game state than the original route's starting point
- Route updates should feel like refreshing the same route, not creating a new route
- Users may want to update routes multiple times as they progress through the game
- Route updates may result in significantly different routes if game state has changed substantially
- Progress tracking should be preserved where possible, but may need adjustment when route structure changes
- Route updates use the same calculation algorithms and options as the original route calculation
- Users understand that updating a route replaces the route's calculation data but preserves its identity

