# Feature Specification: Rework Page Structure for Route Wizard Workflow

**Feature Branch**: `005-rework-page-structure`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "rework the page structure to better accomodate the workflow that is intruduced by the route-wizard."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time User Experience (Priority: P1)

A new user visits the application for the first time and has no saved routes. The system should guide them to start creating a route using the wizard.

**Why this priority**: This is the primary entry point for new users. Without saved routes, there's no alternative workflow, so the wizard is the only path forward.

**Independent Test**: Can be fully tested by visiting the application with an empty saved routes list and verifying that the wizard is automatically prompted or prominently displayed as the primary action.

**Acceptance Scenarios**:

1. **Given** a user visits the application for the first time, **When** there are no saved routes in storage, **Then** the system displays a prominent prompt or automatically opens the route creation wizard
2. **Given** a user with no saved routes, **When** they view the main page, **Then** category selection, custom category creation, and starting buildings setup components are not visible outside the wizard
3. **Given** a first-time user, **When** they complete the wizard and create their first route, **Then** the route is saved and the page transitions to show saved routes

---

### User Story 2 - Returning User with Saved Routes (Priority: P1)

A returning user who has previously created and saved routes visits the application. The system should present options to either load an existing saved route or create a new route via the wizard.

**Why this priority**: This covers the primary workflow for users who have already engaged with the application. They need clear access to both their existing work and the ability to create new routes.

**Independent Test**: Can be fully tested by visiting the application with at least one saved route in storage and verifying that both options (load existing route or create new via wizard) are available and clearly presented.

**Acceptance Scenarios**:

1. **Given** a user has saved routes in storage, **When** they visit the application, **Then** the system displays a choice between loading an existing saved route or creating a new route via the wizard
2. **Given** a returning user with saved routes, **When** they view the main page, **Then** category selection, custom category creation, and starting buildings setup components are not visible outside the wizard
3. **Given** a returning user, **When** they choose to load an existing route, **Then** the saved routes list is displayed and they can select a route to view
4. **Given** a returning user, **When** they choose to create a new route, **Then** the route creation wizard opens

---

### User Story 3 - Component Removal from Main Page (Priority: P2)

The standalone components for category selection, custom category creation, and starting buildings setup are removed from the main page interface, as these functionalities are now exclusively available within the wizard workflow.

**Why this priority**: This is a structural change that supports the wizard-centric workflow. While important for consistency, it's secondary to ensuring the primary user flows work correctly.

**Independent Test**: Can be fully tested by verifying that the main page HTML structure no longer includes containers for category-section, custom-category-section, and starting-buildings-section, and that these components are only instantiated within the wizard context.

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** viewing the main page structure, **Then** category selection, custom category creation, and starting buildings setup components are not rendered outside the wizard
2. **Given** a user is not in the wizard, **When** they view the main page, **Then** they cannot access category selection, custom category creation, or starting buildings configuration directly
3. **Given** a user opens the wizard, **When** they navigate through wizard steps, **Then** category selection, custom category creation, and starting buildings setup are available within the wizard context

---

### Edge Cases

- What happens when localStorage is unavailable or corrupted and saved routes cannot be read? System should gracefully handle this and treat as first-time user experience
- How does the system handle the transition from first-time user (no saved routes) to returning user (has saved routes) after creating the first route? The page should update its structure to show the choice between wizard and existing routes
- What if a user clears all saved routes? The system should transition back to first-time user experience
- How does the system handle browser refresh during wizard workflow? Wizard state should be preserved or gracefully reset
- What happens if the wizard is cancelled? User should return to the appropriate view (first-time prompt or saved routes choice)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect whether saved routes exist in storage on page load
- **FR-002**: System MUST display route creation wizard prompt when no saved routes exist
- **FR-003**: System MUST display choice between loading existing routes or creating new route via wizard when saved routes exist
- **FR-004**: System MUST remove category selection component from main page (only available in wizard)
- **FR-005**: System MUST remove custom category creation component from main page (only available in wizard)
- **FR-006**: System MUST remove starting buildings setup component from main page (only available in wizard)
- **FR-007**: System MUST preserve all wizard functionality including category selection, custom category creation, and starting buildings setup within the wizard workflow
- **FR-008**: System MUST update page structure dynamically when user transitions from no saved routes to having saved routes
- **FR-009**: System MUST handle localStorage read errors gracefully and default to first-time user experience
- **FR-010**: System MUST allow users to access saved routes list when they have existing saved routes

### Key Entities *(include if feature involves data)*

- **PageState**: Represents the current state of the main page (first-time user vs returning user with saved routes)
- **SavedRoutes**: Collection of previously saved routes stored in localStorage (existing entity, used for detection)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users with no saved routes see wizard prompt within 2 seconds of page load
- **SC-002**: Users with saved routes see choice between wizard and existing routes within 2 seconds of page load
- **SC-003**: 100% of category selection, custom category creation, and starting buildings setup functionality is accessible only through wizard workflow
- **SC-004**: Page structure correctly updates when user creates their first saved route (transitions from first-time to returning user experience)
- **SC-005**: System handles localStorage errors gracefully without breaking the user experience (no unhandled exceptions visible to users)
- **SC-006**: Users can successfully access both wizard and saved routes when they have existing saved routes (both paths functional)



