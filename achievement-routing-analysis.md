# Achievement Routing Feasibility Analysis

## Executive Summary

**Yes, it is feasible to calculate routes for many achievements**, but with important limitations. The current `simulation.js` can be adapted to support achievement-based routing, though some achievements are not routeable due to their requirements.

## Achievement Categories Analysis

### ✅ Routeable Achievements

#### 1. **Building Count Achievements** (~150+ achievements)
- **Pattern**: "Have X [building name]"
- **Examples**: 
  - "Have 1 cursor" (id: 34)
  - "Have 50 farms" (id: 44)
  - "Have 100 grandmas" (id: 42)
- **Feasibility**: ✅ **Highly Feasible**
- **Implementation**: Check `game.numBuildings[buildingName] >= targetCount`
- **Stop Condition**: Route completes when building count requirement is met

#### 2. **Cookies Per Second (CpS) Achievements** (~30+ achievements)
- **Pattern**: "Bake X cookies per second"
- **Examples**:
  - "Bake 1 cookie per second" (id: 16)
  - "Bake 1 million cookies per second" (id: 21)
  - "Bake 1 billion cookies per second" (id: 24)
- **Feasibility**: ✅ **Highly Feasible**
- **Implementation**: Check `game.rate() >= targetCps`
- **Stop Condition**: Route completes when CpS requirement is met

#### 3. **Total Cookies Baked Achievements** (~30+ achievements)
- **Pattern**: "Bake X cookies in one ascension"
- **Examples**:
  - "Bake 1 cookie in one ascension" (id: 0)
  - "Bake 1 million cookies in one ascension" (id: 3)
  - "Bake 1 trillion cookies in one ascension" (id: 5)
- **Feasibility**: ✅ **Already Supported**
- **Implementation**: This is essentially what the current system does with `targetCookies`
- **Stop Condition**: Route completes when `game.totalCookies >= targetCookies`

#### 4. **Upgrade Count Achievements** (~10+ achievements)
- **Pattern**: "Purchase X upgrades"
- **Examples**:
  - "Purchase 20 upgrades" (id: 74)
  - "Purchase 50 upgrades" (id: 75)
  - "Purchase 100 upgrades" (id: 90)
- **Feasibility**: ✅ **Feasible**
- **Implementation**: Track `game.history.length` (upgrades purchased)
- **Stop Condition**: Route completes when upgrade count requirement is met

#### 5. **Building Total Count Achievements** (~10+ achievements)
- **Pattern**: "Own X buildings" (total across all types)
- **Examples**:
  - "Own 100 buildings" (id: 72)
  - "Own 500 buildings" (id: 73)
  - "Own 1,000 buildings" (id: 83)
- **Feasibility**: ✅ **Feasible**
- **Implementation**: Sum all `game.numBuildings` values
- **Stop Condition**: Route completes when total building count requirement is met

#### 6. **Building Level Achievements** (~15+ achievements)
- **Pattern**: "Reach level X [building name]"
- **Examples**:
  - "Reach level 10 cursors" (id: 307)
  - "Reach level 10 grandmas" (id: 308)
- **Feasibility**: ⚠️ **Partially Feasible**
- **Implementation**: Requires sugar lump system (not currently in simulation)
- **Note**: Building levels require sugar lumps, which are time-gated. This would require additional game mechanics.

#### 7. **Combined Building Achievements** (~5+ achievements)
- **Pattern**: "Have at least X of everything"
- **Examples**:
  - "Have at least 100 of everything" (id: 91)
  - "Have at least 200 of everything" (id: 129)
- **Feasibility**: ✅ **Feasible**
- **Implementation**: Check `min(Object.values(game.numBuildings)) >= targetCount`
- **Stop Condition**: Route completes when minimum building count across all types is met

### ❌ Non-Routeable Achievements

#### 1. **Clicking Achievements** (~10+ achievements)
- **Pattern**: "Make X cookies from clicking"
- **Examples**:
  - "Make 1,000 cookies from clicking" (id: 30)
  - "Make 100,000 cookies from clicking" (id: 31)
- **Reason**: Requires manual clicking, not automated building purchases
- **Note**: Could potentially be simulated if clicking mechanics are added

#### 2. **Golden Cookie Achievements** (~10+ achievements)
- **Pattern**: "Click X golden cookies"
- **Examples**:
  - "Click a golden cookie" (id: 67)
  - "Click 7 golden cookies" (id: 68)
- **Reason**: Random events, not deterministic building purchases

#### 3. **Wrinkler/Reindeer Achievements** (~10+ achievements)
- **Pattern**: "Burst X wrinklers" / "Pop X reindeer"
- **Reason**: Random events during grandmapocalypse/seasons

#### 4. **Ascension Achievements** (~10+ achievements)
- **Pattern**: "Ascend with X cookies baked"
- **Examples**:
  - "Ascend with 1 million cookies baked" (id: 26)
- **Reason**: These are actually routeable! They're the same as "Bake X cookies" but with ascension context
- **Note**: Could be treated as total cookies baked achievements

#### 5. **Miscellaneous Achievements** (~20+ achievements)
- Various one-time actions (dunk cookie, name bakery, etc.)
- Seasonal achievements
- Shadow achievements (cheating, speed runs, etc.)

## Implementation Approach

### Option 1: Extend Current `calculateRoute()` Function

```javascript
export async function calculateRoute(
  category, 
  startingBuildings = {}, 
  options = {}, 
  versionId = 'v2052',
  achievementGoal = null  // NEW: Achievement ID or achievement object
) {
  // Parse achievement requirements
  if (achievementGoal) {
    const requirements = parseAchievementRequirements(achievementGoal);
    // Set game goal based on achievement type
    if (requirements.type === 'buildingCount') {
      game.targetBuilding = { name: requirements.building, count: requirements.count };
    } else if (requirements.type === 'cps') {
      game.targetCps = requirements.cps;
    } else if (requirements.type === 'totalCookies') {
      game.targetCookies = requirements.cookies;
    }
    // ... etc
  }
  // ... rest of existing logic
}
```

### Option 2: Create New `calculateAchievementRoute()` Function

```javascript
export async function calculateAchievementRoute(
  achievementId,
  startingBuildings = {},
  options = {},
  versionId = 'v2052'
) {
  // Load achievement data
  const achievement = getAchievementById(achievementId);
  if (!achievement) {
    throw new Error(`Achievement ${achievementId} not found`);
  }
  
  // Parse achievement requirements
  const requirements = parseAchievementRequirements(achievement);
  if (!requirements.routeable) {
    throw new Error(`Achievement "${achievement.name}" is not routeable`);
  }
  
  // Create a pseudo-category for the achievement
  const achievementCategory = {
    id: `achievement-${achievementId}`,
    name: achievement.name,
    targetCookies: requirements.type === 'totalCookies' ? requirements.cookies : null,
    targetCps: requirements.type === 'cps' ? requirements.cps : null,
    targetBuilding: requirements.type === 'buildingCount' ? requirements : null,
    // ... other requirements
  };
  
  // Use existing calculateRoute with achievement-specific goals
  return await calculateRoute(achievementCategory, startingBuildings, options, versionId);
}
```

## Required Modifications

### 1. **Game Class Extensions**

Add achievement goal tracking to `Game` class:

```javascript
// In Game constructor
this.targetCookies = 0;  // Existing
this.targetCps = null;  // NEW
this.targetBuilding = null;  // NEW: { name: string, count: number }
this.targetUpgradeCount = null;  // NEW
this.targetTotalBuildings = null;  // NEW
```

### 2. **Router Modifications**

Update `routeGPL()` to check achievement conditions:

```javascript
async routeGPL(game, lookahead = 1, onProgress = null) {
  while (true) {
    // Check if any achievement goal is met
    if (game.targetCookies && game.totalCookies >= game.targetCookies) {
      break;
    }
    if (game.targetCps && game.rate() >= game.targetCps) {
      break;
    }
    if (game.targetBuilding && 
        game.numBuildings[game.targetBuilding.name] >= game.targetBuilding.count) {
      break;
    }
    if (game.targetUpgradeCount && game.history.length >= game.targetUpgradeCount) {
      break;
    }
    // ... existing logic
  }
}
```

### 3. **Achievement Parser**

Create a function to parse achievement descriptions:

```javascript
function parseAchievementRequirements(achievement) {
  const desc = achievement.description.toLowerCase();
  
  // Building count: "Have X [building]"
  const buildingMatch = desc.match(/have (\d+(?:,\d+)*) (\w+(?:\s+\w+)*)/);
  if (buildingMatch) {
    return {
      type: 'buildingCount',
      building: normalizeBuildingName(buildingMatch[2]),
      count: parseInt(buildingMatch[1].replace(/,/g, ''))
    };
  }
  
  // CpS: "Bake X cookies per second"
  const cpsMatch = desc.match(/bake ([\d,]+) cookies? per second/);
  if (cpsMatch) {
    return {
      type: 'cps',
      cps: parseNumber(cpsMatch[1])
    };
  }
  
  // Total cookies: "Bake X cookies in one ascension"
  const totalMatch = desc.match(/bake ([\d,]+) cookies? in one ascension/);
  if (totalMatch) {
    return {
      type: 'totalCookies',
      cookies: parseNumber(totalMatch[1])
    };
  }
  
  // ... more patterns
  
  return { routeable: false };
}
```

## Challenges & Considerations

### 1. **Description Parsing Complexity**
- Achievement descriptions use natural language
- Need robust parsing for edge cases
- Some descriptions may be ambiguous
- **Solution**: Create a comprehensive parser with fallbacks

### 2. **Building Name Normalization**
- Descriptions use display names ("alchemy lab" vs "Alchemy Lab")
- Need mapping to internal building names
- **Solution**: Create a mapping table

### 3. **Number Format Parsing**
- Descriptions use formatted numbers ("1,000" vs "1000")
- Need to handle large numbers (million, billion, etc.)
- **Solution**: Use a number parser that handles both formats

### 4. **Multiple Requirements**
- Some achievements may have multiple conditions
- **Example**: "Have at least 1 of every building" (id: 64)
- **Solution**: Support compound conditions

### 5. **Performance**
- Achievement routes may be shorter than category routes
- Some achievements may require very long routes
- **Solution**: Same optimization techniques as current system

## Estimated Routeable Achievements

Based on analysis of `achievements.json`:
- **Total Achievements**: ~430
- **Routeable Achievements**: ~250-300 (58-70%)
- **Non-Routeable Achievements**: ~130-180 (30-42%)

### Breakdown:
- Building count: ~150
- CpS: ~30
- Total cookies: ~30
- Upgrades: ~10
- Building totals: ~10
- Combined: ~10
- Levels: ~15 (partially)
- **Total Routeable**: ~255

## Recommendation

**Proceed with implementation** using Option 2 (new function) for cleaner separation of concerns:

1. ✅ Create `calculateAchievementRoute()` function
2. ✅ Implement achievement requirement parser
3. ✅ Extend Game class with achievement goal tracking
4. ✅ Update Router to check achievement conditions
5. ✅ Add UI support for achievement route selection

This would provide significant value to users who want to optimize their path to specific achievements, especially for speedrunning or completionist playstyles.

