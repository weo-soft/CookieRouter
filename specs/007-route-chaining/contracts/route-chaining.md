# Route Chaining Contract: API Interface

**Date**: 2025-01-27  
**Feature**: [spec.md](../spec.md)

## Overview

This contract defines the interface for route chaining functionality. Route chaining allows users to select multiple routes (categories or achievement routes) and calculate them in sequence, with each route using buildings and upgrades from previous routes as its starting state.

## Namespace

All route chaining-related classes and functions are exported from:
- `src/js/ui/route-creation-wizard.js` (extended)
- `src/js/ui/wizard-route-chain-selection.js` (new)
- `src/js/ui/route-chain-display.js` (new)
- `src/js/ui/route-chain-navigation.js` (new)
- `src/js/simulation.js` (extended)
- `src/js/storage.js` (extended)

## Core Functions

### Chain Calculation

#### `calculateRouteChain(chainConfig, initialStartingBuildings, initialStartingUpgrades, options)`

Calculates all routes in a chain sequentially, accumulating buildings and upgrades from each route for the next.

**Parameters**:
- `chainConfig` (object, required): Chain configuration
  - `routes` (array, required): Array of route configurations (categories or achievement routes)
  - `versionId` (string, optional): Default game version ID (default: 'v2052')
- `initialStartingBuildings` (object, optional): Initial starting buildings (from wizard or import)
  - Map of building names to counts
- `initialStartingUpgrades` (array, optional): Initial starting upgrades (from wizard or import)
  - Array of upgrade names
- `options` (object, optional): Calculation options
  - `algorithm` (string, optional): Algorithm to use ('GPL' or 'DFS', default: 'GPL')
  - `lookahead` (number, optional): Lookahead depth (default: 1)
  - `onProgress` (function, optional): Progress callback
    - Signature: `(progress: ChainCalculationProgress) => void`
    - `progress.currentRouteIndex` (number): Index of route currently being calculated
    - `progress.totalRoutes` (number): Total number of routes in chain
    - `progress.routeName` (string): Name of current route
    - `progress.routeProgress` (object, optional): Progress for current route (from calculateRoute)

**Returns**: `Promise<ChainCalculationResult>`

**ChainCalculationResult**:
```typescript
{
  success: boolean;
  calculatedRoutes: Route[];  // Array of calculated routes (one per route in chain)
  accumulatedBuildings: object;  // Final accumulated buildings after all routes
  accumulatedUpgrades: string[];  // Final accumulated upgrades after all routes
  errors: ChainCalculationError[];  // Array of errors (empty if success)
}
```

**ChainCalculationError**:
```typescript
{
  routeIndex: number;  // Index of route that failed
  routeName: string;  // Name of route that failed
  message: string;  // Error message
  timestamp: number;  // When error occurred
}
```

**Behavior**:
- Calculates routes sequentially (route 0, then 1, then 2, ...)
- For each route:
  - Uses accumulated buildings/upgrades from previous routes as starting state
  - Calls `calculateRoute` with accumulated state
  - Extracts final buildings and upgrades from calculated route
  - Updates accumulated state for next route
- Stops on first error (does not continue calculating remaining routes)
- Returns partial results if error occurs (successfully calculated routes are included)

**Throws**: Never throws (errors are returned in result.errors array)

---

### Chain Storage

#### `saveRouteChain(routeChain)`

Saves a route chain to localStorage.

**Parameters**:
- `routeChain` (RouteChain, required): Route chain object to save

**Returns**: `void`

**Throws**: 
- `Error` if localStorage quota exceeded
- `Error` if route chain validation fails

**Behavior**:
- Validates route chain structure
- Generates unique ID if not provided
- Sets `savedAt` timestamp if not provided
- Appends to `cookieRouter:routeChains` array in localStorage
- Updates existing chain if ID already exists

---

#### `getRouteChains()`

Retrieves all saved route chains from localStorage.

**Returns**: `Array<RouteChain>`

**Behavior**:
- Returns all route chains from localStorage
- Returns empty array if none exist or on error
- Chains are sorted by `lastAccessedAt` (most recent first)

---

#### `getRouteChainById(chainId)`

Retrieves a specific route chain by ID.

**Parameters**:
- `chainId` (string, required): Route chain ID

**Returns**: `RouteChain | null`

**Behavior**:
- Returns route chain with matching ID
- Returns null if not found or on error
- Updates `lastAccessedAt` timestamp

---

#### `deleteRouteChain(chainId)`

Deletes a route chain from localStorage.

**Parameters**:
- `chainId` (string, required): Route chain ID to delete

**Returns**: `void`

**Behavior**:
- Removes route chain from localStorage
- No error if chain doesn't exist (idempotent)

---

#### `updateRouteChainProgress(chainId, routeIndex, progress)`

Updates progress for a specific route within a chain.

**Parameters**:
- `chainId` (string, required): Route chain ID
- `routeIndex` (number, required): Index of route in chain (0-based)
- `progress` (object, required): Progress data
  - Map of step order (number) to checked state (boolean)

**Returns**: `void`

**Behavior**:
- Updates progress for specified route in chain
- Updates `completedSteps` and `isComplete` fields
- Updates overall chain progress
- Saves updated chain to localStorage

---

## UI Components

### `WizardRouteChainSelection`

Component for selecting multiple routes in the wizard.

**Constructor**:
```javascript
new WizardRouteChainSelection(containerId, onRoutesSelected, options)
```

**Parameters**:
- `containerId` (string, required): ID of DOM element to render into
- `onRoutesSelected` (function, required): Callback when routes are selected
  - Signature: `(routes: RouteConfig[]) => void`
- `options` (object, optional): Component options
  - `allowReordering` (boolean, default: true): Allow users to reorder routes
  - `allowRemoval` (boolean, default: true): Allow users to remove routes
  - `maxRoutes` (number, default: 50): Maximum number of routes allowed

**Methods**:
- `render()`: Renders the component
- `getSelectedRoutes()`: Returns array of selected route configurations
- `addRoute(routeConfig)`: Adds a route to the selection
- `removeRoute(routeIndex)`: Removes a route from the selection
- `reorderRoutes(fromIndex, toIndex)`: Reorders routes in the selection
- `validate()`: Validates that at least one route is selected

---

### `RouteChainDisplay`

Component for displaying a route chain with navigation between routes.

**Constructor**:
```javascript
new RouteChainDisplay(containerId, routeChain, onProgressUpdate, options)
```

**Parameters**:
- `containerId` (string, required): ID of DOM element to render into
- `routeChain` (RouteChain, required): Route chain to display
- `onProgressUpdate` (function, optional): Callback when progress is updated
  - Signature: `(chainId: string, routeIndex: number, progress: object) => void`
- `options` (object, optional): Display options
  - `showCumulativeBuildings` (boolean, default: true): Show cumulative building counts
  - `showProgress` (boolean, default: true): Show progress indicators
  - `defaultRouteIndex` (number, default: 0): Route to display initially

**Methods**:
- `render()`: Renders the component
- `showRoute(routeIndex)`: Displays a specific route in the chain
- `updateProgress(routeIndex, progress)`: Updates progress for a route
- `getCurrentRouteIndex()`: Returns index of currently displayed route

---

### `RouteChainNavigation`

Component for navigating between routes in a chain.

**Constructor**:
```javascript
new RouteChainNavigation(containerId, routeChain, onRouteChange, options)
```

**Parameters**:
- `containerId` (string, required): ID of DOM element to render into
- `routeChain` (RouteChain, required): Route chain to navigate
- `onRouteChange` (function, required): Callback when route changes
  - Signature: `(routeIndex: number) => void`
- `options` (object, optional): Navigation options
  - `showProgress` (boolean, default: true): Show progress indicators
  - `highlightCurrent` (boolean, default: true): Highlight current route

**Methods**:
- `render()`: Renders the component
- `setCurrentRoute(routeIndex)`: Sets the current route and highlights it
- `goToNext()`: Navigates to next route
- `goToPrevious()`: Navigates to previous route
- `goToRoute(routeIndex)`: Navigates to specific route

---

## Extended Functions

### `calculateRoute` (Extended)

The existing `calculateRoute` function is used as-is for individual route calculations within chains. No changes to its interface are required.

**Usage in chains**:
- Called once per route in the chain
- `startingBuildings` parameter receives accumulated buildings from previous routes
- `options.manualUpgrades` parameter receives accumulated upgrades from previous routes
- Returns Route object which is then used to extract final state for next route

---

## Building Accumulation Logic

### Extracting Final State from Route

After calculating a route, extract final building counts and purchased upgrades:

**Buildings**:
- Iterate through route.buildings array
- For each step where `buildingCount !== null` (building purchase):
  - Increment count for that building name
- Result: Map of building names to final counts

**Upgrades**:
- Iterate through route.buildings array
- For each step where `buildingCount === null` (upgrade purchase):
  - Add `buildingName` to upgrades array (avoid duplicates)
- Result: Array of upgrade names

**Implementation**:
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
```

---

## Error Handling

### Calculation Errors

When a route calculation fails:
- Stop chain calculation immediately
- Return partial results (successfully calculated routes)
- Include error in result.errors array
- Allow user to:
  - Modify chain (remove/reorder routes)
  - Retry calculation from failed route
  - Save partial chain (if user chooses)

### Storage Errors

When localStorage operations fail:
- Display user-friendly error message
- Suggest freeing up space or removing old chains
- Preserve in-memory state if possible

---

## Integration Points

### Route Creation Wizard

The wizard is extended to support route chain selection:
- New step (or option in existing step) for selecting multiple routes
- Chain selection replaces single route selection
- Chain calculation replaces single route calculation
- Chain display replaces single route display

### Saved Routes

Route chains are stored separately from individual saved routes:
- Different localStorage key (`cookieRouter:routeChains` vs `cookieRouter:savedRoutes`)
- Different data structure (RouteChain vs SavedRoute)
- Can coexist with individual saved routes

### Route Display

Route chain display reuses existing RouteDisplay component:
- Each route in chain is displayed using RouteDisplay
- Navigation component switches between routes
- Progress tracking works per-route within chain

---

## Performance Considerations

- Chain calculation is sequential (cannot be parallelized due to state dependencies)
- Progress updates should be non-blocking (use setTimeout or requestAnimationFrame)
- Route navigation should be fast (< 1 second per SC-004)
- Large chains (10+ routes) should use virtual scrolling or pagination for route list

---

## Version Compatibility

- Route chains can mix routes with different game versions
- System warns about version mismatches but allows them
- Building accumulation works across versions (building names are consistent)
- Hardcore mode is cumulative (once enabled, stays enabled for rest of chain)

