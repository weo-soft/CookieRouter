# Data Model: Route Chaining

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Entities

### RouteChain

Represents a sequence of routes that will be calculated and completed in order. Contains an ordered list of route configurations (categories or achievement routes), metadata about the chain, and calculated route results for each step in the chain.

**Fields**:
- `id` (string, required): Unique identifier for the route chain (generated on save, format: `route-chain-{timestamp}-{random}`)
- `name` (string, required): User-provided name for the chain (or auto-generated default)
- `routes` (array, required): Ordered array of `ChainedRoute` objects (one per route in chain)
- `createdAt` (number, required): Timestamp when chain was created (milliseconds since epoch)
- `lastAccessedAt` (number, required): Timestamp when chain was last opened (milliseconds since epoch)
- `savedAt` (number, required): Timestamp when chain was saved (milliseconds since epoch)
- `overallProgress` (object, optional): Overall progress tracking for the entire chain
  - `totalRoutes` (number): Total number of routes in chain
  - `completedRoutes` (number): Number of routes fully completed
  - `inProgressRouteIndex` (number, optional): Index of route currently in progress (0-based)

**Validation Rules**:
- `name` must be non-empty string, max 100 characters
- `routes` array must contain at least one `ChainedRoute` (per FR-021)
- `routes` array must not exceed 50 routes (reasonable limit to prevent performance issues)
- `createdAt`, `lastAccessedAt`, and `savedAt` must be valid timestamps
- `overallProgress.totalRoutes` must equal `routes.length`

**Storage**: Stored in localStorage under key `cookieRouter:routeChains` as JSON array

**Relationships**:
- RouteChain contains many ChainedRoute objects (one-to-many)
- Each ChainedRoute references one Category or Achievement route configuration

---

### ChainedRoute

Represents a single route within a chain. Contains the route configuration, the calculated route result, the starting buildings/upgrades used for calculation (accumulated from previous routes), and progress tracking data.

**Fields**:
- `routeIndex` (number, required): Zero-based index of this route in the chain (0, 1, 2, ...)
- `routeConfig` (object, required): Route configuration (category or achievement route)
  - `type` (string, required): One of "category" or "achievement"
  - `categoryId` (string, optional): Category ID if type is "category"
  - `categoryName` (string, optional): Category display name if type is "category"
  - `achievementIds` (array, optional): Array of achievement IDs if type is "achievement"
  - `versionId` (string, required): Game version ID used for this route
  - `hardcoreMode` (boolean, optional): Whether hardcore mode is enabled for this route
- `calculatedRoute` (object, optional): Calculated route data (null if not yet calculated)
  - Same structure as Route entity from spec 001 (buildings, algorithm, lookahead, completionTime, etc.)
- `startingBuildings` (object, required): Starting buildings used for calculation (accumulated from previous routes)
  - Map of building names to counts
- `startingUpgrades` (array, required): Starting upgrades used for calculation (accumulated from previous routes)
  - Array of upgrade names
- `progress` (object, required): Progress tracking data
  - Map of step order (number) to checked state (boolean)
  - Example: `{ 1: true, 2: true, 3: false, ... }`
- `completedSteps` (number, required): Count of completed (checked) steps
- `isComplete` (boolean, required): Whether all steps in this route are completed
- `calculatedAt` (number, optional): Timestamp when route was calculated (milliseconds since epoch)
- `calculationError` (object, optional): Error information if calculation failed
  - `message` (string): Error message
  - `timestamp` (number): When error occurred

**Validation Rules**:
- `routeIndex` must be non-negative integer
- `routeConfig.type` must be "category" or "achievement"
- `routeConfig.categoryId` required if type is "category"
- `routeConfig.achievementIds` required if type is "achievement" and must be non-empty array
- `startingBuildings` must be object with building names as keys and non-negative integers as values
- `startingUpgrades` must be array of strings (upgrade names)
- `progress` must be object with numeric keys (step orders) and boolean values
- `completedSteps` must be non-negative integer, not exceeding total steps in calculatedRoute
- `isComplete` must be true if `completedSteps` equals total steps in calculatedRoute

**Relationships**:
- ChainedRoute belongs to one RouteChain (many-to-one via chain structure)
- ChainedRoute references one Category or Achievement route configuration

---

### ChainCalculationState

Represents the state during chain calculation. Tracks which route is currently being calculated, accumulated buildings/upgrades from completed routes, and any errors encountered during calculation. This entity exists only in memory during the calculation process and is not persisted to localStorage.

**Fields**:
- `chainId` (string, optional): ID of chain being calculated (if saving)
- `currentRouteIndex` (number, required): Zero-based index of route currently being calculated
- `totalRoutes` (number, required): Total number of routes in chain
- `accumulatedBuildings` (object, required): Buildings accumulated from all previous routes
  - Map of building names to counts
- `accumulatedUpgrades` (array, required): Upgrades accumulated from all previous routes
  - Array of upgrade names
- `calculatedRoutes` (array, required): Array of calculated route results (one per completed route)
  - Each element is a Route object (from spec 001)
- `errors` (array, required): Array of calculation errors encountered
  - Each error object contains: `routeIndex`, `message`, `timestamp`
- `isCalculating` (boolean, required): Whether calculation is currently in progress
- `isComplete` (boolean, required): Whether all routes have been calculated successfully
- `isFailed` (boolean, required): Whether calculation failed (stopped due to error)

**Validation Rules**:
- `currentRouteIndex` must be non-negative integer, less than `totalRoutes`
- `totalRoutes` must be positive integer
- `accumulatedBuildings` must be object with building names as keys and non-negative integers as values
- `accumulatedUpgrades` must be array of strings
- `calculatedRoutes.length` must equal `currentRouteIndex` (one route per completed calculation)
- `isComplete` and `isFailed` cannot both be true

**Storage**: In-memory only, not persisted

**Relationships**:
- ChainCalculationState tracks calculation for one RouteChain (one-to-one during calculation)

---

## State Transitions

### Route Chain Creation Flow

1. User selects multiple routes in wizard
2. System creates RouteChain with empty `routes` array
3. User configures each route (category/achievement selection)
4. System creates ChainedRoute objects and adds to chain
5. User initiates calculation
6. System creates ChainCalculationState
7. System calculates routes sequentially, updating ChainCalculationState
8. On completion, System creates RouteChain with calculated routes
9. User saves RouteChain to localStorage

### Chain Calculation Flow

1. System initializes ChainCalculationState:
   - `currentRouteIndex = 0`
   - `accumulatedBuildings = initialStartingBuildings`
   - `accumulatedUpgrades = initialStartingUpgrades`
2. For each route in chain:
   - System calculates route using `accumulatedBuildings` and `accumulatedUpgrades`
   - On success:
     - Extract final buildings from calculated route
     - Extract purchased upgrades from calculated route
     - Update `accumulatedBuildings` and `accumulatedUpgrades`
     - Add calculated route to `calculatedRoutes`
     - Increment `currentRouteIndex`
   - On error:
     - Add error to `errors` array
     - Set `isFailed = true`
     - Stop calculation
3. When all routes calculated:
   - Set `isComplete = true`
   - Set `isCalculating = false`

### Building Accumulation Logic

When calculating route N in a chain:

1. Start with `accumulatedBuildings` and `accumulatedUpgrades` from previous routes (0 to N-1)
2. Calculate route N using:
   - `startingBuildings = accumulatedBuildings`
   - `options.manualUpgrades = accumulatedUpgrades`
3. After route N calculation completes:
   - Extract final building counts from route N's building steps:
     - Count each building purchase in route N
     - Add to `accumulatedBuildings`
   - Extract purchased upgrades from route N:
     - Identify upgrade purchases in route N's building steps (steps where `buildingCount === null`)
     - Add to `accumulatedUpgrades` (avoid duplicates)
4. Use updated `accumulatedBuildings` and `accumulatedUpgrades` for route N+1

---

## Data Merging Logic

### Starting Buildings Merge (FR-007, FR-008)

When calculating route N in a chain:

1. Start with `accumulatedBuildings` from routes 0 to N-1
2. Merge with initial starting buildings from wizard (if any):
   - Wizard starting buildings take precedence (override accumulated)
   - This allows user to override accumulated state if needed
3. Use merged buildings as `startingBuildings` for route calculation

### Starting Upgrades Merge (FR-007, FR-008)

When calculating route N in a chain:

1. Start with `accumulatedUpgrades` from routes 0 to N-1
2. Merge with initial starting upgrades from wizard (if any):
   - Wizard starting upgrades take precedence (override accumulated)
3. Use merged upgrades as `options.manualUpgrades` for route calculation

---

## Storage Schema

### localStorage Key: `cookieRouter:routeChains`

**Structure**: Array of RouteChain objects

**Example**:
```json
[
  {
    "id": "route-chain-1706389200000-abc123",
    "name": "Nevercore → Hardcore → Longhaul",
    "routes": [
      {
        "routeIndex": 0,
        "routeConfig": {
          "type": "category",
          "categoryId": "predefined-nevercore",
          "categoryName": "Nevercore",
          "versionId": "v2048",
          "hardcoreMode": true
        },
        "calculatedRoute": { /* Route object */ },
        "startingBuildings": {},
        "startingUpgrades": [],
        "progress": { "1": true, "2": false },
        "completedSteps": 1,
        "isComplete": false,
        "calculatedAt": 1706389200000
      },
      {
        "routeIndex": 1,
        "routeConfig": {
          "type": "category",
          "categoryId": "predefined-hardcore",
          "categoryName": "Hardcore",
          "versionId": "v2048",
          "hardcoreMode": true
        },
        "calculatedRoute": { /* Route object */ },
        "startingBuildings": { "Cursor": 10, "Grandma": 5 },
        "startingUpgrades": ["Reinforced index finger"],
        "progress": {},
        "completedSteps": 0,
        "isComplete": false,
        "calculatedAt": 1706389300000
      }
    ],
    "createdAt": 1706389200000,
    "lastAccessedAt": 1706389400000,
    "savedAt": 1706389200000,
    "overallProgress": {
      "totalRoutes": 2,
      "completedRoutes": 0,
      "inProgressRouteIndex": 0
    }
  }
]
```

---

## Migration Considerations

- Existing saved routes (from spec 002) remain unchanged
- Route chains are stored separately from individual saved routes
- No migration needed for existing data
- Route chains can reference categories and achievements that may be deleted later (graceful degradation)

