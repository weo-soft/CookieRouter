# Feature Specification: Sugar Lumps Building Upgrades

**Feature Branch**: `009-sugar-lumps`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "there is a time based upgrade in the game, Sugar Lumps. Once the player reaches 1 Billion produced cookies, Sugar Lumps are unlocked. Every 24 hours one sugar Lump is harvested. Sugar Lumps can be used to upgrade buildings, providing +1% Building CpS per upgrade-level. each level costs the same amount of Sugar Lumps as the level, eg. Level 1 = 1 Sugar Lump, Level 2 = 2 Lumps, Level 3 = 3 Lumps and so on. The Sugar Lump Upgrades for Buildings should be considered for the route calculation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Route Calculation Considers Sugar Lump Upgrades (Priority: P1)

A user wants the route calculator to account for Sugar Lump building upgrades when determining the optimal building purchase order. The system should simulate Sugar Lump harvesting and apply building level upgrades to improve CpS calculations, resulting in more accurate route optimization.

**Why this priority**: This is the core value of the feature - ensuring route calculations account for Sugar Lump upgrades to provide accurate optimal routes. Without this, Sugar Lump upgrades are ignored and routes may be suboptimal.

**Independent Test**: Can be fully tested by calculating a route that reaches 1 billion cookies, verifying that Sugar Lumps are harvested at 24-hour intervals, and confirming that building level upgrades are applied to CpS calculations during route optimization.

**Acceptance Scenarios**:

1. **Given** a route calculation reaches 1 billion total cookies produced, **When** the simulation continues, **Then** Sugar Lumps become available for harvesting every 24 hours of simulated time
2. **Given** Sugar Lumps are available, **When** the route calculator optimizes building purchases, **Then** it considers applying Sugar Lump upgrades to buildings to improve CpS
3. **Given** a building has Sugar Lump upgrades applied, **When** CpS is calculated for route optimization, **Then** the building's CpS is increased by 1% per upgrade level
4. **Given** Sugar Lump upgrades are considered, **When** a route is calculated, **Then** the optimal building purchase order accounts for the improved CpS from upgraded buildings

---

### User Story 2 - Display Sugar Lump Harvesting in Route (Priority: P2)

A user wants to see when Sugar Lumps are harvested and available during route execution. The route display should show Sugar Lump harvesting events and indicate when Sugar Lumps become available for use.

**Why this priority**: Users need visibility into Sugar Lump availability to understand when building upgrades become possible and to track Sugar Lump accumulation throughout the route.

**Independent Test**: Can be fully tested by calculating a route that includes Sugar Lump harvesting, verifying that Sugar Lump harvest events appear in the route display at appropriate time intervals, and confirming that available Sugar Lump counts are shown.

**Acceptance Scenarios**:

1. **Given** a route reaches 1 billion cookies produced, **When** the route is displayed, **Then** Sugar Lump harvest events appear every 24 hours of simulated time
2. **Given** Sugar Lumps are harvested, **When** viewing the route, **Then** the available Sugar Lump count is displayed and updated at each harvest point
3. **Given** Sugar Lumps are available, **When** viewing route steps, **Then** users can see how many Sugar Lumps are available at each point in the route

---

### User Story 3 - Display Building Level Upgrades in Route (Priority: P3)

A user wants to see when building level upgrades are applied using Sugar Lumps during route execution. The route display should show which buildings are upgraded and to what level, along with the Sugar Lump cost.

**Why this priority**: Users need to understand which buildings receive Sugar Lump upgrades and when, to follow the optimal route strategy and track Sugar Lump spending.

**Independent Test**: Can be fully tested by calculating a route that includes Sugar Lump building upgrades, verifying that building level upgrade steps appear in the route display with correct level and cost information.

**Acceptance Scenarios**:

1. **Given** Sugar Lumps are available and a building upgrade is optimal, **When** viewing the route, **Then** building level upgrade steps are displayed showing the building name, new level, and Sugar Lump cost
2. **Given** a building receives multiple level upgrades, **When** viewing the route, **Then** each upgrade level is shown as a separate step with cumulative Sugar Lump costs
3. **Given** building level upgrades are applied, **When** viewing subsequent route steps, **Then** the improved CpS from upgraded buildings is reflected in game state calculations

---

### Edge Cases

- What happens when a route reaches 1 billion cookies but doesn't have enough simulated time for Sugar Lump harvesting?
- How does the system handle routes that complete before reaching 1 billion cookies (Sugar Lumps never unlock)?
- What happens when Sugar Lumps are available but no building upgrades are optimal for the route?
- How does the system handle building level upgrades when multiple buildings could benefit from upgrades but Sugar Lumps are limited?
- What happens when a route requires more Sugar Lumps than can be harvested in the available time?
- How does the system handle Sugar Lump upgrades for buildings that haven't been purchased yet?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST unlock Sugar Lumps when total cookies produced reaches 1 billion
- **FR-002**: System MUST simulate Sugar Lump harvesting every 24 hours of simulated time after unlock
- **FR-003**: System MUST track available Sugar Lump count throughout route calculation
- **FR-004**: System MUST allow applying Sugar Lump upgrades to buildings, increasing Building CpS by 1% per upgrade level
- **FR-005**: System MUST calculate Sugar Lump upgrade costs as cumulative (Level 1 = 1, Level 2 = 1+2=3 total, Level 3 = 1+2+3=6 total)
- **FR-006**: System MUST consider Sugar Lump building upgrades when optimizing route calculations
- **FR-007**: System MUST display Sugar Lump harvest events in route output
- **FR-008**: System MUST display building level upgrade steps in route output with building name, level, and Sugar Lump cost
- **FR-009**: System MUST update available Sugar Lump count when upgrades are applied
- **FR-010**: System MUST account for Sugar Lump upgrade CpS bonuses when calculating building CpS for route optimization
- **FR-011**: System MUST handle routes that never reach 1 billion cookies (Sugar Lumps remain locked)
- **FR-012**: System MUST optimize Sugar Lump spending decisions during route calculation (which buildings to upgrade and when)

### Key Entities *(include if feature involves data)*

- **Sugar Lump**: Represents a time-gated resource that becomes available every 24 hours after 1 billion cookies are produced. Tracks availability count and harvest timing.
- **Building Level**: Represents the Sugar Lump upgrade level of a building. Each level provides +1% Building CpS and costs Sugar Lumps equal to the level number.
- **Sugar Lump Harvest Event**: Represents a point in simulated time when a Sugar Lump becomes available. Occurs every 24 hours after unlock.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Routes that reach 1 billion cookies correctly unlock Sugar Lumps and begin harvesting every 24 hours
- **SC-002**: Building CpS calculations include Sugar Lump upgrade bonuses when buildings have been upgraded
- **SC-003**: Route calculations produce optimal building purchase orders that account for Sugar Lump upgrade benefits
- **SC-004**: Route display shows Sugar Lump harvest events at correct time intervals (every 24 hours after unlock)
- **SC-005**: Route display shows building level upgrade steps with accurate level and cost information
- **SC-006**: Sugar Lump spending is optimized during route calculation (upgrades applied when they improve route efficiency)
- **SC-007**: Routes that complete before 1 billion cookies correctly handle Sugar Lumps as locked (no harvest events, no upgrades available)

## Assumptions

- Sugar Lump harvesting occurs exactly every 24 hours of simulated game time (not real-world time)
- Sugar Lump upgrades provide a multiplicative +1% Building CpS bonus per level (e.g., Level 3 = +3% Building CpS)
- Sugar Lump upgrade costs are cumulative (Level N costs 1+2+...+N Sugar Lumps total)
- Route calculation can simulate time passage to determine Sugar Lump availability
- Sugar Lump upgrades can be applied to any building type
- The route optimizer will determine optimal Sugar Lump spending as part of route calculation
- Sugar Lump harvesting continues indefinitely once unlocked (no maximum limit)
- Building level upgrades are permanent once applied (cannot be undone or transferred)

## Dependencies

- Existing route calculation system - needs to support time-based resource simulation and building upgrade optimization
- Game state tracking system - needs to track Sugar Lump count and building levels
- Building CpS calculation system - needs to incorporate Sugar Lump upgrade bonuses
- Route display system - needs to show Sugar Lump harvest events and building level upgrades

