# Research: Route Chaining

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Research Questions

### 1. Building and Upgrade Accumulation Strategy

**Question**: How should buildings and upgrades be accumulated across routes in a chain?

**Research**: 
- Existing route calculation uses `startingBuildings` parameter to initialize game state
- Upgrades are tracked separately from buildings in the game state
- Route calculation returns a route with building purchase steps, but upgrades purchased during route are tracked in game state
- Need to extract final building counts and purchased upgrades from each route to use as starting state for next route

**Decision**: 
- Extract final building counts from each route's building steps (count buildings purchased)
- Track upgrades purchased during route calculation (game state maintains purchased upgrades list)
- Accumulate both buildings and upgrades from all previous routes
- Pass accumulated state as `startingBuildings` and `manualUpgrades` to next route calculation

**Rationale**: 
- Reuses existing route calculation interface (`calculateRoute` accepts `startingBuildings` and `options.manualUpgrades`)
- Maintains consistency with existing single-route calculation behavior
- Allows each route to be calculated independently using accumulated state

**Alternatives Considered**:
- Creating a new chain-aware calculation function: Rejected because it would duplicate logic and break consistency
- Storing intermediate game states: Rejected because it's more complex and doesn't provide additional value

---

### 2. Route Chain Data Structure

**Question**: How should route chains be stored and what data structure should represent a chain?

**Research**:
- Existing saved routes use `SavedRoute` structure with route data snapshot
- Route chains need to store multiple routes in sequence
- Need to track chain metadata (name, creation date) separate from individual route data
- Progress tracking needs to be per-route within chain

**Decision**:
- Create `RouteChain` entity with:
  - Chain metadata (id, name, createdAt, lastAccessedAt)
  - Ordered array of `ChainedRoute` objects (one per route in chain)
  - Overall progress tracking
- Each `ChainedRoute` contains:
  - Route configuration (category/achievement route)
  - Calculated route data
  - Starting buildings/upgrades used for calculation
  - Progress tracking data (checked buildings)
- Store in localStorage under `cookieRouter:routeChains` key

**Rationale**:
- Follows existing `SavedRoute` pattern for consistency
- Allows independent progress tracking per route
- Enables chain-level operations (save, load, delete) while preserving route-level details
- Compatible with existing storage utilities

**Alternatives Considered**:
- Storing chains as array of saved routes with chain metadata: Rejected because it would duplicate route data and complicate progress tracking
- Embedding chain info in route data: Rejected because it breaks single-route vs chain distinction

---

### 3. Chain Calculation Error Handling

**Question**: How should the system handle calculation errors for individual routes in a chain?

**Research**:
- Existing route calculation can fail (e.g., invalid category, calculation timeout)
- Chain calculation needs to handle partial failures gracefully
- Users should be able to retry failed routes or modify chain

**Decision**:
- If a route calculation fails:
  - Stop chain calculation at failed route
  - Display error message indicating which route failed and why
  - Store partial chain state (successfully calculated routes)
  - Allow user to:
    - Modify chain (remove/reorder routes)
    - Retry calculation from failed route
    - Save partial chain (if user chooses)
- Store error state in `ChainCalculationState` for recovery

**Rationale**:
- Provides clear feedback to users about what went wrong
- Preserves work done on successfully calculated routes
- Gives users control over how to proceed (modify vs retry)
- Follows existing error handling patterns in wizard

**Alternatives Considered**:
- Continuing calculation with default/empty route: Rejected because it would produce invalid chains
- Auto-retrying failed routes: Rejected because it could mask real issues and waste computation

---

### 4. Version and Hardcore Mode Compatibility

**Question**: How should the system handle route chains with different game versions or hardcore mode settings?

**Research**:
- Different routes may use different game versions (v2048, v2052, etc.)
- Hardcore mode affects upgrade availability
- Building/upgrade accumulation must account for version differences

**Decision**:
- Validate chain compatibility during route selection:
  - Warn if routes use different versions (but allow if user confirms)
  - Warn if routes mix hardcore and non-hardcore modes (but allow if user confirms)
- During calculation:
  - Use version from first route for building accumulation (or latest version if mixed)
  - Track hardcore mode state across routes (once hardcore is enabled, it stays enabled)
  - Map building names across versions if needed (building names are generally consistent)

**Rationale**:
- Provides flexibility for advanced users while warning about potential issues
- Hardcore mode is cumulative (once enabled, upgrades are disabled for rest of chain)
- Building names are consistent across versions, so accumulation should work

**Alternatives Considered**:
- Blocking mixed versions/modes: Rejected because it's too restrictive for advanced use cases
- Auto-converting between versions: Rejected because it's complex and error-prone

---

### 5. Chain Display and Navigation

**Question**: How should route chains be displayed and how should users navigate between routes?

**Research**:
- Existing `RouteDisplay` component shows single route with building steps
- Chain display needs to show multiple routes with clear separation
- Navigation between routes should be intuitive and fast

**Decision**:
- Create `RouteChainDisplay` component that:
  - Shows route list/selector at top (route names with progress indicators)
  - Displays selected route using existing `RouteDisplay` component
  - Shows cumulative building counts at start of each route
  - Provides navigation controls (previous/next route, route selector)
- Use tab-like interface or sidebar for route selection
- Highlight current route and show progress for each route

**Rationale**:
- Reuses existing `RouteDisplay` component for consistency
- Clear visual hierarchy (chain overview → route details)
- Fast navigation (under 1 second per SC-004)
- Familiar UI patterns (tabs/sidebar)

**Alternatives Considered**:
- Accordion/collapsible sections: Rejected because it makes navigation slower and harder to see full chain
- Separate pages for each route: Rejected because it breaks chain context and is slower

---

### 6. Progress Tracking Across Chains

**Question**: How should progress be tracked for each route within a chain?

**Research**:
- Existing saved routes track progress with checked building steps
- Chain progress needs to be tracked per-route and overall
- Progress should persist across sessions

**Decision**:
- Store progress in `ChainedRoute` object:
  - `progress` object mapping step order to checked state
  - `completedSteps` count
  - `isComplete` boolean
- Calculate overall chain progress from individual route progress
- Update progress when user checks/unchecks buildings
- Auto-save progress changes to localStorage

**Rationale**:
- Follows existing progress tracking pattern for consistency
- Independent progress per route enables users to work on different routes
- Overall progress provides chain-level status
- Auto-save prevents progress loss

**Alternatives Considered**:
- Single progress object for entire chain: Rejected because it doesn't allow independent route progress
- Manual save only: Rejected because it increases risk of progress loss

---

## Summary

All research questions have been resolved. The implementation will:
1. Accumulate buildings and upgrades by extracting final state from each route
2. Use `RouteChain` and `ChainedRoute` data structures stored in localStorage
3. Handle calculation errors by stopping at failure and allowing retry/modification
4. Warn about version/mode mismatches but allow them with user confirmation
5. Display chains with route selector and reuse existing `RouteDisplay` component
6. Track progress per-route within chain structure

No additional clarifications needed. Ready to proceed to Phase 1 design.

