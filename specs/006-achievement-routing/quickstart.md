# Quickstart: Achievement-Based Route Calculation

**Feature**: Achievement-Based Route Calculation  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This guide provides a quick start for implementing achievement-based route calculation. The implementation extends the existing route calculation system to support achievement goals.

## Implementation Steps

### Step 1: Extend Game Class

Add achievement goal tracking properties to the `Game` class.

**File**: `src/js/game.js`

**Changes**:
1. Add achievement goal properties to constructor:
```javascript
// In Game constructor, add after targetCookies:
this.targetCps = null;
this.targetBuilding = null; // { name: string, count: number }
this.targetUpgradeCount = null;
this.targetTotalBuildings = null;
this.targetMinBuildings = null;
this.targetBuildingLevel = null; // { building: string, level: number }
this.achievementGoals = []; // Array of achievement IDs
```

2. Add `isAchievementGoalMet()` method:
```javascript
isAchievementGoalMet() {
  // Check CPS goal
  if (this.targetCps !== null && this.rate() < this.targetCps) {
    return false;
  }
  
  // Check building count goal
  if (this.targetBuilding !== null) {
    const current = this.numBuildings[this.targetBuilding.name] || 0;
    if (current < this.targetBuilding.count) {
      return false;
    }
  }
  
  // Check upgrade count goal
  if (this.targetUpgradeCount !== null && this.history.length < this.targetUpgradeCount) {
    return false;
  }
  
  // Check total buildings goal
  if (this.targetTotalBuildings !== null) {
    const total = Object.values(this.numBuildings).reduce((sum, count) => sum + count, 0);
    if (total < this.targetTotalBuildings) {
      return false;
    }
  }
  
  // Check min buildings goal
  if (this.targetMinBuildings !== null) {
    const min = Math.min(...Object.values(this.numBuildings));
    if (min < this.targetMinBuildings) {
      return false;
    }
  }
  
  // Check building level goal (note: requires sugar lump simulation)
  if (this.targetBuildingLevel !== null) {
    // For now, just check building count (leveling requires manual sugar lumps)
    const current = this.numBuildings[this.targetBuildingLevel.building] || 0;
    if (current < 1) {
      return false;
    }
    // TODO: Add sugar lump simulation for full level support
  }
  
  return true;
}
```

### Step 2: Extend Router Class

Modify `routeGPL()` to check achievement goals.

**File**: `src/js/router.js`

**Changes**:
Update the main loop condition:
```javascript
// Change from:
if (game.totalCookies >= game.targetCookies) {
  break;
}

// To:
if (game.totalCookies >= game.targetCookies || game.isAchievementGoalMet()) {
  break;
}
```

### Step 3: Create Achievement Utilities

Create utility functions for achievement filtering and search.

**File**: `src/js/utils/achievement-utils.js` (new)

**Content**:
```javascript
import { achievements } from '../../data/achievements.js';
import { getAchievementRequirement, isAchievementRouteable } from '../../data/achievement-requirements.js';

/**
 * Filters achievements by requirement type
 */
export function filterAchievementsByType(achievements, requirementType) {
  return achievements.filter(achievement => {
    const requirement = getAchievementRequirement(achievement.id);
    return requirement && requirement.type === requirementType;
  });
}

/**
 * Searches achievements by name or description
 */
export function searchAchievements(achievements, query) {
  const lowerQuery = query.toLowerCase();
  return achievements.filter(achievement => {
    return achievement.name.toLowerCase().includes(lowerQuery) ||
           achievement.description.toLowerCase().includes(lowerQuery);
  });
}

/**
 * Filters to show only routeable achievements
 */
export function getRouteableAchievements(achievements) {
  return achievements.filter(achievement => 
    isAchievementRouteable(achievement.id)
  );
}

/**
 * Combines multiple filters
 */
export function filterAchievements(achievements, filters) {
  let result = [...achievements];
  
  if (filters.routeableOnly) {
    result = getRouteableAchievements(result);
  }
  
  if (filters.requirementType) {
    result = filterAchievementsByType(result, filters.requirementType);
  }
  
  if (filters.searchQuery) {
    result = searchAchievements(result, filters.searchQuery);
  }
  
  return result;
}
```

### Step 4: Extend Simulation Module

Add achievement route calculation function.

**File**: `src/js/simulation.js`

**Changes**:
1. Import achievement utilities:
```javascript
import { getAchievementById } from '../data/achievements.js';
import { getAchievementRequirement, isAchievementRouteable } from '../data/achievement-requirements.js';
```

2. Add helper function to convert achievements to game goals:
```javascript
function setAchievementGoals(game, achievementIds) {
  // Reset all achievement goals
  game.targetCps = null;
  game.targetBuilding = null;
  game.targetUpgradeCount = null;
  game.targetTotalBuildings = null;
  game.targetMinBuildings = null;
  game.targetBuildingLevel = null;
  game.achievementGoals = [];
  
  // Process each achievement
  for (const achievementId of achievementIds) {
    const requirement = getAchievementRequirement(achievementId);
    if (!requirement || requirement.type === 'notRouteable') {
      continue;
    }
    
    game.achievementGoals.push(achievementId);
    
    // Set goal based on requirement type
    switch (requirement.type) {
      case 'buildingCount':
        // If multiple building goals, use the highest count
        if (!game.targetBuilding || requirement.count > game.targetBuilding.count) {
          game.targetBuilding = { name: requirement.building, count: requirement.count };
        }
        break;
      case 'cps':
        // If multiple CPS goals, use the highest value
        if (game.targetCps === null || requirement.value > game.targetCps) {
          game.targetCps = requirement.value;
        }
        break;
      case 'totalCookies':
        // If multiple cookie goals, use the highest value
        if (game.targetCookies === 0 || requirement.value > game.targetCookies) {
          game.targetCookies = requirement.value;
        }
        break;
      case 'upgradeCount':
        // If multiple upgrade goals, use the highest count
        if (game.targetUpgradeCount === null || requirement.count > game.targetUpgradeCount) {
          game.targetUpgradeCount = requirement.count;
        }
        break;
      case 'totalBuildings':
        // If multiple total building goals, use the highest count
        if (game.targetTotalBuildings === null || requirement.count > game.targetTotalBuildings) {
          game.targetTotalBuildings = requirement.count;
        }
        break;
      case 'minBuildings':
        // If multiple min building goals, use the highest count
        if (game.targetMinBuildings === null || requirement.count > game.targetMinBuildings) {
          game.targetMinBuildings = requirement.count;
        }
        break;
      case 'buildingLevel':
        // For building levels, we route to having the building (leveling is manual)
        if (!game.targetBuildingLevel) {
          game.targetBuildingLevel = { building: requirement.building, level: requirement.level };
        }
        break;
    }
  }
}
```

3. Add `calculateAchievementRoute()` function:
```javascript
export async function calculateAchievementRoute(
  achievementIds,
  startingBuildings = {},
  options = {},
  versionId = 'v2052'
) {
  // Validate achievements
  if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
    throw new Error('At least one achievement must be selected');
  }
  
  if (achievementIds.length > 5) {
    throw new Error('Maximum 5 achievements can be selected');
  }
  
  // Validate all achievements are routeable
  for (const id of achievementIds) {
    const achievement = getAchievementById(id);
    if (!achievement) {
      throw new Error(`Achievement ${id} not found`);
    }
    if (!isAchievementRouteable(id)) {
      throw new Error(`Achievement "${achievement.name}" is not routeable`);
    }
  }
  
  // Create pseudo-category for achievement route
  const category = {
    id: `achievement-${achievementIds.join('-')}`,
    name: `Achievement Route: ${achievementIds.map(id => getAchievementById(id).name).join(', ')}`,
    achievementIds: achievementIds,
    isPredefined: false
  };
  
  // Use existing calculateRoute with achievement goals
  const route = await calculateRoute(category, startingBuildings, options, versionId);
  
  // Add achievement metadata to route
  route.achievementIds = achievementIds;
  route.achievementUnlocks = []; // Will be populated during route replay
  
  return route;
}
```

4. Modify `calculateRoute()` to handle achievement goals:
```javascript
// In calculateRoute(), after creating game instance, add:
if (category.achievementIds && category.achievementIds.length > 0) {
  setAchievementGoals(game, category.achievementIds);
}
```

### Step 5: Create Achievement Selection UI Component

Create wizard step component for achievement selection.

**File**: `src/js/ui/wizard-achievement-selection.js` (new)

**Structure**: Follow existing wizard step pattern (see `wizard-initial-setup.js` for reference)

**Key Features**:
- Display filtered/searchable achievement list
- Allow multi-select with checkboxes
- Show achievement requirements
- Filter by requirement type
- Search by name/description
- "Routeable Only" toggle
- Display selected achievements summary

### Step 6: Integrate into Route Creation Wizard

Add achievement selection step to wizard.

**File**: `src/js/ui/route-creation-wizard.js`

**Changes**:
1. Add achievement selection step between initial setup and summary
2. Store selected achievement IDs in wizard state
3. Pass achievement IDs to route calculation
4. Update wizard step indicator

### Step 7: Extend Route Display

Add achievement completion markers to route display.

**File**: `src/js/ui/route-display.js`

**Changes**:
1. Check if route has `achievementIds` property
2. During route replay, track when achievements unlock
3. Display achievement icons/badges at unlock steps
4. Show achievement summary in route header

### Step 8: Update Route Storage

Extend route storage format to include achievement metadata.

**File**: `src/js/storage.js`

**Changes**:
- Route objects now include `achievementIds` and `achievementUnlocks`
- Existing routes without these properties remain compatible
- Filter/search saved routes by achievement

## Testing Checklist

- [ ] Unit tests for `Game.isAchievementGoalMet()` with all goal types
- [ ] Unit tests for achievement utilities (filtering, search)
- [ ] Unit tests for `setAchievementGoals()` helper
- [ ] Integration tests for `calculateAchievementRoute()` with single achievement
- [ ] Integration tests for `calculateAchievementRoute()` with multiple achievements
- [ ] Integration tests for achievement selection UI component
- [ ] Integration tests for route display with achievement markers
- [ ] Performance tests for achievement filtering/search (200+ achievements)
- [ ] Performance tests for achievement route calculation (meet SC-002, SC-003)

## Key Implementation Notes

1. **Backward Compatibility**: All changes must maintain compatibility with existing cookie-based routes
2. **Performance**: Achievement filtering must be fast (< 100ms for 200+ items)
3. **Error Handling**: Clear error messages for invalid/non-routeable achievements
4. **UI Consistency**: Achievement selection follows existing wizard step patterns
5. **Data Access**: Use existing achievement data files directly (no additional API layer)

## Next Steps

After implementation:
1. Run test suite
2. Verify performance targets (SC-002, SC-003)
3. Test with various achievement combinations
4. Update documentation
5. Code review



