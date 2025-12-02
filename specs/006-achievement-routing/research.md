# Research: Achievement-Based Route Calculation

**Feature**: Achievement-Based Route Calculation  
**Date**: 2025-01-27  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. How to extend Game class to support multiple achievement goal types?

**Decision**: Extend Game class with optional achievement goal properties that complement existing `targetCookies` property.

**Rationale**: 
- Existing `Game` class already has `targetCookies` for cookie-based routing
- Achievement goals can be represented as optional properties that don't interfere with existing functionality
- Multiple achievement types require different goal tracking (buildingCount, cps, totalCookies, upgradeCount, totalBuildings, minBuildings, buildingLevel)
- Backward compatibility maintained by making all achievement goal properties optional

**Alternatives Considered**:
- Create separate AchievementGame class: Rejected - would duplicate code and break existing patterns
- Replace targetCookies with generic goal object: Rejected - would break existing cookie-based routes
- Use composition with goal checker: Considered but adds unnecessary indirection

**Implementation Approach**:
```javascript
// In Game constructor, add optional achievement goal properties:
this.targetCps = null;
this.targetBuilding = null; // { name: string, count: number }
this.targetUpgradeCount = null;
this.targetTotalBuildings = null;
this.targetMinBuildings = null; // minimum count across all building types
this.targetBuildingLevel = null; // { building: string, level: number }
this.achievementGoals = []; // Array of achievement IDs being targeted
```

### 2. How to modify Router.routeGPL() to check achievement conditions?

**Decision**: Add achievement goal checking logic to the main routing loop, checking all goal types after each move.

**Rationale**:
- Router.routeGPL() already checks `game.totalCookies >= game.targetCookies` in its main loop
- Achievement goals can be checked using similar pattern
- Need to check all active achievement goals, not just one
- Must support multiple achievements simultaneously

**Alternatives Considered**:
- Separate achievement goal checker function: Accepted - creates reusable, testable logic
- Inline goal checking: Rejected - would make routeGPL() too complex
- Pre-calculate goal satisfaction: Rejected - goals change as game state changes

**Implementation Approach**:
```javascript
// Add helper method to Game class:
isAchievementGoalMet() {
  // Check all achievement goal types
  // Return true if all active goals are satisfied
}

// In Router.routeGPL():
while (true) {
  // Check if cookie target OR achievement goals are met
  if (game.totalCookies >= game.targetCookies || game.isAchievementGoalMet()) {
    break;
  }
  // ... rest of routing logic
}
```

### 3. How to integrate achievement selection into route creation wizard?

**Decision**: Add new wizard step for achievement selection, placed after initial setup but before route calculation.

**Rationale**:
- Existing wizard has clear step structure (wizard-initial-setup.js, wizard-category-selection.js, etc.)
- Achievement selection is a distinct user action that deserves its own step
- Can reuse existing wizard step indicator and navigation patterns
- Must allow selection of multiple achievements with filtering/search

**Alternatives Considered**:
- Integrate into category selection: Rejected - achievements are different from categories
- Separate wizard flow: Rejected - would create confusing dual entry points
- Modal dialog: Considered but breaks wizard flow consistency

**Implementation Approach**:
- Create `wizard-achievement-selection.js` component following existing wizard step pattern
- Add achievement selection step between initial setup and summary
- Store selected achievement IDs in wizard state
- Pass achievement goals to route calculation

### 4. How to efficiently filter and search 200+ achievements?

**Decision**: Implement client-side filtering with debounced search, using achievement requirement data for type filtering.

**Rationale**:
- All achievement data is already loaded (achievements.json, achievement-requirements.js)
- Client-side filtering is fast enough for 200+ items (< 100ms target)
- No need for server-side search
- Can use requirement type from achievement-requirements.js for filtering

**Alternatives Considered**:
- Server-side search: Rejected - no backend, all data is client-side
- Virtual scrolling: Considered but 200 items is manageable without it
- Indexed search library: Considered but adds dependency for simple filtering

**Implementation Approach**:
- Create `achievement-utils.js` with filtering/search functions
- Filter by requirement type using achievement-requirements.js mapping
- Search by name/description using case-insensitive string matching
- Debounce search input (100ms) to avoid excessive filtering during typing
- Cache filtered results until search/filter changes

### 5. How to handle multiple achievement goals with conflicting requirements?

**Decision**: Router calculates route that satisfies all goals, prioritizing efficiency. If goals conflict (e.g., one requires farms, another requires cursors), route finds compromise path.

**Rationale**:
- GPL algorithm already optimizes for efficiency
- Multiple goals can be treated as AND conditions (all must be met)
- Router naturally finds paths that satisfy multiple constraints
- May not be perfectly optimal for each individual achievement, but finds reasonable compromise

**Alternatives Considered**:
- Calculate separate routes and merge: Rejected - would create suboptimal combined route
- Prioritize one achievement over others: Rejected - user selected all achievements, all should be met
- Warn user about conflicts: Considered but adds complexity, router handles it automatically

**Implementation Approach**:
- `isAchievementGoalMet()` checks ALL active achievement goals
- Router continues until all goals are satisfied
- Route display shows which achievements are unlocked at which step
- If route cannot satisfy all goals (edge case), return error with explanation

### 6. How to display achievement completion in route display?

**Decision**: Add achievement completion markers to route steps, showing which achievements are unlocked at each point.

**Rationale**:
- Users need to see when achievements are unlocked during route execution
- Route display already shows building purchases and game state
- Achievement markers provide valuable feedback
- Can use visual indicators (icons, badges) to show achievement unlocks

**Alternatives Considered**:
- Separate achievement timeline: Rejected - adds complexity, better integrated
- Only show at route end: Rejected - users want to see progress
- Tooltip on hover: Considered but less discoverable than inline markers

**Implementation Approach**:
- Extend route data structure to include achievement unlocks per step
- Route display component shows achievement icons/badges when achievements unlock
- Use achievement data (achievements.json) for display names/icons
- Highlight completed achievements in route summary

### 7. How to handle building level achievements (require sugar lumps)?

**Decision**: Mark building level achievements as routeable but note that sugar lump mechanics are not currently simulated. Route will calculate to building purchase requirements, but leveling requires manual sugar lump management.

**Rationale**:
- Building levels require sugar lumps which are time-gated (not deterministic)
- Can still route to having the required buildings
- User can manually level buildings after route completes
- Better to support partially than exclude entirely

**Alternatives Considered**:
- Exclude building level achievements: Rejected - users still want routes to required building counts
- Simulate sugar lump generation: Rejected - too complex, time-gated mechanics
- Warn user about manual leveling: Accepted - clear communication

**Implementation Approach**:
- Include buildingLevel achievements in routeable list
- Route calculates to required building count
- Display note that building leveling requires manual sugar lump management
- Future enhancement: could add sugar lump simulation if needed

## Technology Decisions

### Achievement Data Access

**Decision**: Use existing `achievements.json` and `achievement-requirements.js` files directly, importing them as ES6 modules.

**Rationale**:
- Data files already exist and are properly structured
- ES6 imports provide type-safe access
- No need for additional data layer or API
- Matches existing codebase patterns

### Route Storage Format

**Decision**: Extend existing route storage format to include `achievementIds` array in route metadata.

**Rationale**:
- Existing routes stored in localStorage with metadata
- Adding achievementIds maintains backward compatibility
- Allows filtering/searching saved routes by achievement
- Minimal change to existing storage system

### UI Component Pattern

**Decision**: Follow existing wizard step component pattern for achievement selection UI.

**Rationale**:
- Consistency with existing codebase
- Reuses wizard infrastructure (step indicator, navigation)
- Proven pattern that works well
- Easy to maintain and extend

## Dependencies Resolved

- ✅ Achievement data structure: Already available in `achievements.json`
- ✅ Requirement mappings: Already available in `achievement-requirements.js`
- ✅ Route calculation infrastructure: Existing `simulation.js` and `router.js` can be extended
- ✅ UI patterns: Existing wizard components provide template
- ✅ Storage: Existing localStorage system can be extended

## Open Questions (Resolved)

All research questions have been resolved. No remaining clarifications needed.

## Next Steps

Proceed to Phase 1: Design & Contracts
- Create data-model.md with achievement route entities
- Create contracts/achievement-routing.md with API contracts
- Create quickstart.md with implementation guide



