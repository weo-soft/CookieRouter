# Data Model: Cookie Clicker Building Order Simulator

**Date**: 2025-11-23  
**Feature**: [spec.md](./spec.md)

## Entities

### Category

Represents a route configuration with a specific goal. Can be predefined (built-in) or user-created.

**Fields**:
- `id` (string, required): Unique identifier for the category
- `name` (string, required): Display name of the category
- `isPredefined` (boolean, required): Whether this is a built-in category or user-created
- `version` (string, required): Cookie Clicker game version (e.g., "v2031", "v2048", "v10466")
- `targetCookies` (number, required): Target cookie count to reach
- `playerCps` (number, optional): Player clicks per second (default: 8)
- `playerDelay` (number, optional): Delay when switching from clicking to purchasing in seconds (default: 1)
- `hardcoreMode` (boolean, optional): Whether upgrades are disabled (default: false)
- `initialBuildings` (object, optional): Map of building names to initial counts (default: {})
- `createdAt` (number, optional): Timestamp when category was created (for user-created categories)
- `updatedAt` (number, optional): Timestamp when category was last modified

**Validation Rules**:
- `name` must be non-empty string, max 100 characters
- `targetCookies` must be positive number
- `playerCps` must be non-negative number
- `playerDelay` must be non-negative number
- `version` must be one of: "v2031", "v2048", "v10466", "v10466_xmas"
- `initialBuildings` must be object with building names as keys and non-negative integers as values

**Storage**: Stored in localStorage under key `cookieRouter:categories` as JSON array

**Relationships**:
- One Category can have many Routes (one-to-many)
- Category references Game Version data

### Route

Represents a calculated sequence of buildings in optimal purchase order for a specific category.

**Fields**:
- `id` (string, required): Unique identifier for the route
- `categoryId` (string, required): ID of the category this route was calculated for
- `buildings` (array, required): Ordered list of building purchase steps
  - Each step contains:
    - `order` (number, required): Purchase order position (1, 2, 3, ...)
    - `buildingName` (string, required): Name of the building to purchase
    - `cookiesRequired` (number, required): Cookies needed at this point
    - `cookiesPerSecond` (number, required): CpS at this point in the route
    - `timeElapsed` (number, required): Time elapsed in seconds at this point
    - `totalCookies` (number, required): Total cookies produced at this point
- `calculatedAt` (number, required): Timestamp when route was calculated
- `startingBuildings` (object, optional): Buildings that were already owned when route was calculated
- `algorithm` (string, required): Algorithm used ("GPL" or "DFS")
- `lookahead` (number, optional): Lookahead depth for GPL algorithm (default: 1)
- `completionTime` (number, required): Total time to reach target in seconds

**Validation Rules**:
- `buildings` array must be non-empty
- Each building step must have valid `order` (sequential, starting from 1)
- `buildingName` must be a valid building name from the game version
- All numeric fields must be non-negative
- `algorithm` must be "GPL" or "DFS"

**Storage**: Stored in localStorage under key `cookieRouter:routes` as JSON array

**Relationships**:
- Route belongs to one Category (many-to-one)
- Route can have one Progress state (one-to-one)

### Building

Represents a Cookie Clicker building type. This is reference data, not user-created.

**Fields**:
- `name` (string, required): Building name (e.g., "Cursor", "Grandma", "Farm")
- `basePrice` (number, required): Base purchase price
- `baseRate` (number, required): Base cookies per second production
- `priceMultiplier` (number, required): Price increase per building owned (default: 1.15)

**Validation Rules**:
- `name` must be non-empty string
- `basePrice` must be positive number
- `baseRate` must be non-negative number
- `priceMultiplier` must be >= 1.0

**Storage**: Defined in game version data files (`src/data/versions/*.js`), not stored in localStorage

**Relationships**:
- Building appears in many Route steps (many-to-many through Route)
- Building belongs to a Game Version

### Progress

Represents user's progress tracking through a route.

**Fields**:
- `routeId` (string, required): ID of the route being tracked
- `completedBuildings` (array, required): Array of building step orders that have been checked off
- `lastUpdated` (number, required): Timestamp when progress was last updated

**Validation Rules**:
- `completedBuildings` must be array of positive integers
- Each value in `completedBuildings` must correspond to a valid step order in the route
- Values in `completedBuildings` should be unique

**Storage**: Stored in localStorage under key `cookieRouter:progress` as JSON object with routeId as keys

**Relationships**:
- Progress belongs to one Route (one-to-one)

### SimulationState

Represents the current game state used for route calculation. This is a transient entity used during simulation, not persisted.

**Fields**:
- `ownedBuildings` (object, required): Map of building names to counts owned
- `totalCookies` (number, required): Total cookies produced so far
- `timeElapsed` (number, required): Time elapsed in seconds
- `cookiesPerSecond` (number, required): Current CpS
- `targetCookies` (number, required): Target cookie count
- `hardcoreMode` (boolean, required): Whether upgrades are disabled
- `history` (array, required): List of purchases made so far

**Validation Rules**:
- All numeric fields must be non-negative
- `ownedBuildings` must be object with building names as keys
- `history` must be array of strings (building/upgrade names)

**Storage**: Not persisted, exists only during route calculation

**Relationships**:
- SimulationState is used by Router to calculate Route

## Data Flow

1. **Category Selection**: User selects a category → System loads category data
2. **Starting Buildings**: User optionally selects starting buildings → System creates SimulationState
3. **Route Calculation**: System uses Router with SimulationState → Generates Route with building steps
4. **Route Storage**: System saves Route to localStorage
5. **Progress Tracking**: User checks off buildings → System updates Progress for that Route
6. **Custom Category**: User creates category → System saves Category to localStorage

## localStorage Schema

```javascript
// Categories
localStorage.setItem('cookieRouter:categories', JSON.stringify([
  {
    id: 'cat-1',
    name: 'Fledgling',
    isPredefined: true,
    version: 'v2031',
    targetCookies: 1000000,
    playerCps: 8,
    playerDelay: 1,
    hardcoreMode: false,
    initialBuildings: { Cursor: 10 }
  },
  // ... more categories
]));

// Routes
localStorage.setItem('cookieRouter:routes', JSON.stringify([
  {
    id: 'route-1',
    categoryId: 'cat-1',
    buildings: [
      {
        order: 1,
        buildingName: 'Cursor',
        cookiesRequired: 15,
        cookiesPerSecond: 0.1,
        timeElapsed: 0,
        totalCookies: 0
      },
      // ... more steps
    ],
    calculatedAt: 1700764800000,
    startingBuildings: {},
    algorithm: 'GPL',
    lookahead: 1,
    completionTime: 3600
  },
  // ... more routes
]));

// Progress
localStorage.setItem('cookieRouter:progress', JSON.stringify({
  'route-1': {
    routeId: 'route-1',
    completedBuildings: [1, 2, 3, 5, 7],
    lastUpdated: 1700764900000
  },
  // ... more progress entries
}));
```

## Data Migration Strategy

If data schema changes in the future:
1. Check localStorage for version marker (`cookieRouter:version`)
2. If version mismatch, run migration function
3. Update version marker after migration
4. Handle missing/corrupted data gracefully (reset to defaults)

## Error Handling

- **localStorage quota exceeded**: Show user-friendly error, suggest deleting old routes
- **Invalid/corrupted data**: Validate on read, reset to defaults if invalid
- **Missing route for progress**: Clear orphaned progress entries
- **Missing category for route**: Mark route as orphaned or delete

