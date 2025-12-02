# Quickstart: Route Chaining

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Overview

Route chaining allows users to select multiple routes (categories or achievement routes) and calculate them in sequence. Each route uses buildings and upgrades purchased in previous routes as its starting state, enabling optimization across multiple goals.

## Key Concepts

- **Route Chain**: A sequence of routes that are calculated and completed in order
- **Building Accumulation**: Each route uses buildings/upgrades from all previous routes as starting state
- **Chain Calculation**: Routes are calculated sequentially, one after another
- **Progress Tracking**: Each route in a chain has independent progress tracking

## Basic Usage

### Creating a Route Chain

1. Open the route creation wizard
2. Complete initial setup (import save, manual setup, or fresh start)
3. **Select "Create Route Chain" option** (new option in category selection step)
4. Add routes to the chain:
   - Click "Add Route" button
   - Select route type (category or achievement)
   - Configure route settings
   - Route is added to chain
5. Reorder routes if needed (drag and drop or use up/down buttons)
6. Remove routes if needed (click remove button)
7. Click "Calculate Chain" to calculate all routes sequentially

### Viewing a Route Chain

1. After calculation completes, the chain is displayed
2. Use route selector (tabs or sidebar) to switch between routes
3. Each route shows:
   - Building purchase sequence
   - Cumulative building counts at start of route
   - Progress checkboxes
4. Navigate between routes using Previous/Next buttons or route selector

### Saving a Route Chain

1. Click "Save Chain" button
2. Enter a name for the chain (or use auto-generated name)
3. Chain is saved to localStorage
4. Access saved chains from "Saved Routes" list (chains are marked with chain indicator)

### Tracking Progress

1. Check off buildings as you purchase them in each route
2. Progress is tracked independently for each route
3. Overall chain progress is shown at the top
4. Progress is automatically saved

## Code Examples

### Calculate a Route Chain

```javascript
import { calculateRouteChain } from './simulation.js';

const chainConfig = {
  routes: [
    {
      type: 'category',
      categoryId: 'predefined-nevercore',
      categoryName: 'Nevercore',
      versionId: 'v2048',
      hardcoreMode: true
    },
    {
      type: 'category',
      categoryId: 'predefined-hardcore',
      categoryName: 'Hardcore',
      versionId: 'v2048',
      hardcoreMode: true
    },
    {
      type: 'category',
      categoryId: 'predefined-longhaul',
      categoryName: 'Longhaul',
      versionId: 'v2048',
      hardcoreMode: false
    }
  ],
  versionId: 'v2048'
};

const initialBuildings = {}; // Start fresh
const initialUpgrades = [];

const result = await calculateRouteChain(
  chainConfig,
  initialBuildings,
  initialUpgrades,
  {
    algorithm: 'GPL',
    lookahead: 1,
    onProgress: (progress) => {
      console.log(`Calculating route ${progress.currentRouteIndex + 1} of ${progress.totalRoutes}: ${progress.routeName}`);
    }
  }
);

if (result.success) {
  console.log(`Chain calculated successfully! ${result.calculatedRoutes.length} routes`);
  console.log('Final buildings:', result.accumulatedBuildings);
  console.log('Final upgrades:', result.accumulatedUpgrades);
} else {
  console.error('Chain calculation failed:', result.errors);
}
```

### Save a Route Chain

```javascript
import { saveRouteChain } from './storage.js';

const routeChain = {
  id: `route-chain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Nevercore → Hardcore → Longhaul',
  routes: [
    // ... ChainedRoute objects from calculation
  ],
  createdAt: Date.now(),
  lastAccessedAt: Date.now(),
  savedAt: Date.now(),
  overallProgress: {
    totalRoutes: 3,
    completedRoutes: 0,
    inProgressRouteIndex: 0
  }
};

try {
  saveRouteChain(routeChain);
  console.log('Chain saved successfully');
} catch (error) {
  console.error('Failed to save chain:', error);
}
```

### Load and Display a Route Chain

```javascript
import { getRouteChainById } from './storage.js';
import { RouteChainDisplay } from './ui/route-chain-display.js';

const chainId = 'route-chain-1706389200000-abc123';
const routeChain = getRouteChainById(chainId);

if (routeChain) {
  const display = new RouteChainDisplay(
    'route-chain-container',
    routeChain,
    (chainId, routeIndex, progress) => {
      // Update progress in storage
      updateRouteChainProgress(chainId, routeIndex, progress);
    }
  );
  
  display.render();
  display.showRoute(0); // Show first route
}
```

### Extract Final State from a Route

```javascript
function extractFinalStateFromRoute(route) {
  const buildings = { ...(route.startingBuildings || {}) };
  const upgrades = [...(route.startingUpgrades || [])];
  
  for (const step of route.buildings) {
    if (step.buildingCount !== null && step.buildingCount !== undefined) {
      // Building purchase
      buildings[step.buildingName] = (buildings[step.buildingName] || 0) + 1;
    } else {
      // Upgrade purchase
      if (!upgrades.includes(step.buildingName)) {
        upgrades.push(step.buildingName);
      }
    }
  }
  
  return { buildings, upgrades };
}

// Usage in chain calculation
const route1 = await calculateRoute(category1, initialBuildings, { manualUpgrades: initialUpgrades });
const state1 = extractFinalStateFromRoute(route1);

const route2 = await calculateRoute(category2, state1.buildings, { manualUpgrades: state1.upgrades });
const state2 = extractFinalStateFromRoute(route2);
// ... continue for remaining routes
```

## Common Patterns

### Chain with Mixed Route Types

```javascript
const chainConfig = {
  routes: [
    {
      type: 'category',
      categoryId: 'predefined-nevercore',
      // ...
    },
    {
      type: 'achievement',
      achievementIds: ['Centennial', 'Centenary'],
      versionId: 'v2048',
      // ...
    },
    {
      type: 'category',
      categoryId: 'predefined-longhaul',
      // ...
    }
  ]
};
```

### Handle Calculation Errors

```javascript
const result = await calculateRouteChain(chainConfig, initialBuildings, initialUpgrades);

if (!result.success) {
  // Check which route failed
  const failedRoute = result.errors[0];
  console.error(`Route ${failedRoute.routeIndex + 1} (${failedRoute.routeName}) failed: ${failedRoute.message}`);
  
  // Options:
  // 1. Remove failed route and retry
  // 2. Modify route configuration and retry
  // 3. Save partial chain (successfully calculated routes)
}
```

### Update Progress

```javascript
import { updateRouteChainProgress } from './storage.js';

// User checks off building at step 5 in route 0
updateRouteChainProgress(chainId, 0, {
  1: true,
  2: true,
  3: true,
  4: true,
  5: true  // Newly checked
});
```

## Integration with Existing Features

### Route Creation Wizard

- Wizard is extended with chain selection option
- Chain selection replaces single route selection when enabled
- Chain calculation replaces single route calculation
- Chain display replaces single route display

### Saved Routes

- Route chains are stored separately from individual saved routes
- Chains appear in saved routes list with chain indicator
- Can coexist with individual saved routes

### Route Display

- Existing RouteDisplay component is reused for individual routes
- RouteChainDisplay wraps RouteDisplay and adds navigation
- Progress tracking works the same way

## Performance Tips

- Chain calculation is sequential (cannot be parallelized)
- Progress callbacks should be non-blocking
- For long chains (10+ routes), consider showing progress for each route
- Route navigation should be fast (< 1 second)

## Troubleshooting

### Chain Calculation Fails

- Check that all route configurations are valid
- Verify game versions are compatible
- Check that starting buildings/upgrades are valid
- Review error messages in result.errors array

### Progress Not Saving

- Check localStorage quota (may be full)
- Verify chain ID is valid
- Check browser console for errors

### Routes Not Accumulating Correctly

- Verify building extraction logic is correct
- Check that upgrades are being tracked
- Ensure route calculation is using accumulated state

## Next Steps

- See [data-model.md](./data-model.md) for detailed data structures
- See [contracts/route-chaining.md](./contracts/route-chaining.md) for API reference
- See [plan.md](./plan.md) for implementation details

