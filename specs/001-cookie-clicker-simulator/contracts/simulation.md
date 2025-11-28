# Simulation Contract: Route Calculation

**Date**: 2025-11-23  
**Feature**: [spec.md](../spec.md)

## Overview

This contract defines the interface for route calculation/simulation operations. These functions convert game state into optimal building purchase routes.

## Core Functions

### `calculateRoute(category: Category, startingBuildings?: object, options?: SimulationOptions): Promise<Route>`

Calculates the optimal building purchase route for a given category.

**Parameters**:
- `category` (Category, required): Category configuration to simulate
- `startingBuildings` (object, optional): Map of building names to counts already owned
- `options` (SimulationOptions, optional): Algorithm and performance options
  - `algorithm` (string): "GPL" or "DFS" (default: "GPL")
  - `lookahead` (number): Lookahead depth for GPL (default: 1)
  - `onProgress` (function): Callback for progress updates

**Returns**: Promise that resolves to Route object

**Errors**:
- Throws if category is invalid
- Throws if startingBuildings contains invalid building names
- Throws if calculation exceeds maximum time limit (30 seconds)

**Performance**: Must complete within 5 seconds for typical categories (per SC-001)

**Progress Callback**:
```javascript
onProgress({
  currentStep: number,      // Current building step being calculated
  totalSteps: number,       // Estimated total steps
  timeElapsed: number,      // Time elapsed in calculation
  currentBuilding: string   // Current building being evaluated
})
```

---

### `Game` Class Interface

Represents the game simulation state. Ported from Python `Game` class.

#### Constructor

```javascript
new Game(version, parent)
```

**Parameters**:
- `version` (GameVersion): Game version data
- `parent` (Game, optional): Parent game state to clone

**Returns**: Game instance

---

#### Methods

##### `rate(): number`

Returns current cookies per second (CpS).

**Returns**: number (non-negative)

---

##### `purchaseBuilding(buildingName: string): boolean`

Purchases a building if affordable.

**Parameters**:
- `buildingName` (string): Name of building to purchase

**Returns**: boolean (true if purchased, false if not affordable)

**Side Effects**: Updates game state (buildings, cookies, time, history)

---

##### `children(): Game[]`

Generates all possible next game states (one building purchase each).

**Returns**: Array of Game instances representing possible next moves

---

##### `completionTime(): number`

Calculates total time to reach target cookies.

**Returns**: number (time in seconds)

---

##### `currencyProduced(): number`

Returns total cookies produced so far.

**Returns**: number (non-negative)

---

### `Router` Class Interface

Contains routing algorithms. Ported from Python `Router` class.

#### Constructor

```javascript
new Router()
```

**Returns**: Router instance

---

#### Methods

##### `routeGPL(game: Game, lookahead: number = 1): Game`

Routes a game using the GPL (Payoff Load) algorithm.

**Parameters**:
- `game` (Game): Initial game state
- `lookahead` (number): Number of generations to look ahead (default: 1)

**Returns**: Game instance with route completed (target reached)

**Algorithm**: Minimizes payoff load locally with configurable lookahead depth

---

##### `routeDFS(game: Game): Game`

Routes a game using depth-first search (brute force optimal).

**Parameters**:
- `game` (Game): Initial game state

**Returns**: Game instance with optimal route completed

**Note**: Currently placeholder implementation, may be computationally expensive

---

### `GameVersion` Interface

Represents game version data (buildings, prices, rates, upgrades).

**Fields**:
- `buildingNames` (string[]): Array of building names
- `basePrices` (object): Map of building names to base prices
- `baseRates` (object): Map of building names to base production rates
- `menu` (Set): Set of available upgrades

**Storage**: Defined in `src/data/versions/*.js` files

---

## Data Flow

1. User selects category → System loads category configuration
2. User optionally selects starting buildings → System creates initial Game state
3. System calls `calculateRoute()` → Router uses selected algorithm
4. Router iteratively calls `Game.children()` and evaluates moves
5. Router selects best move based on algorithm (GPL or DFS)
6. Process repeats until target cookies reached
7. System converts final Game state to Route object with building steps
8. System saves Route to localStorage

## Algorithm Details

### GPL (Payoff Load) Algorithm

Calculates payoff load for each potential move:
```
payoff_load = price * (1 + current_rate / rate_change)
```

Where:
- `price` = cookies required for purchase
- `current_rate` = current CpS
- `rate_change` = CpS increase from purchase

Selects move with lowest payoff load. Uses lookahead to evaluate multiple generations ahead.

### DFS (Depth-First Search) Algorithm

Explores all possible game states to find globally optimal route. Computationally expensive, may not be practical for large targets.

## Performance Requirements

- Route calculation must complete within 5 seconds for typical categories
- UI must remain responsive during calculation (use async/await or Web Workers)
- Algorithm should handle routes with 20-200 building purchases
- Memory usage should be reasonable (avoid storing all possible game states)

## Error Handling

- Invalid building names: Throw descriptive error
- Unreachable target: Return route with partial progress and error flag
- Calculation timeout: Throw timeout error after 30 seconds
- Invalid category configuration: Validate before calculation, throw early

## Implementation Notes

- Game state should be immutable (create new instances rather than mutating)
- Use efficient data structures for building lookups (Maps instead of objects if needed)
- Consider memoization for repeated calculations
- Profile performance and optimize hot paths
- Add progress callbacks for long calculations to provide user feedback

