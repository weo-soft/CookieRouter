# Contract: Version Loading

**Feature**: [spec.md](../spec.md) | **Date**: 2025-01-27

## Overview

This contract defines the API for loading game version data. The contract ensures backward compatibility while allowing the internal implementation to use JSON files and utility modules.

## Version Loader Module Contract

### Module Path Pattern

```
src/data/versions/{versionId}.js
```

Where `{versionId}` is a version identifier (e.g., "v2052", "v2048", "v10466_xmas").

### Module Export Contract

**Required Export**: `default` (object)

The default export MUST be an object with the following structure:

```typescript
interface Version {
  buildingNames: string[];
  basePrices: Record<string, number>;
  baseRates: Record<string, number>;
  menu: Set<Upgrade>;
  upgradesById: (Upgrade | undefined)[];
}
```

### Field Specifications

#### `buildingNames` (array<string>)

- **Type**: Array of strings
- **Required**: Yes
- **Description**: Ordered array of building names for this version
- **Constraints**: 
  - Must be non-empty
  - Must match keys in `basePrices` and `baseRates`
  - Order determines building sequence in game

#### `basePrices` (object<string, number>)

- **Type**: Object mapping building names to numbers
- **Required**: Yes
- **Description**: Base purchase price for each building (first purchase)
- **Constraints**:
  - Must have entry for each building in `buildingNames`
  - All values must be positive numbers
  - Keys must match building names exactly

#### `baseRates` (object<string, number>)

- **Type**: Object mapping building names to numbers
- **Required**: Yes
- **Description**: Base cookies per second production rate for each building
- **Constraints**:
  - Must have entry for each building in `buildingNames`
  - All values must be non-negative numbers
  - Keys must match building names exactly

#### `menu` (Set<Upgrade>)

- **Type**: Set of Upgrade objects
- **Required**: Yes
- **Description**: Set of all available upgrades for this version
- **Constraints**:
  - Must be a Set instance
  - All elements must be Upgrade objects
  - Upgrade objects must have valid structure (see Upgrade Contract)

#### `upgradesById` (array<Upgrade | undefined>)

- **Type**: Sparse array of Upgrade objects
- **Required**: Yes
- **Description**: Array of upgrades indexed by their ID property, for save game parsing compatibility
- **Constraints**:
  - Must be an array (can be sparse)
  - Elements at index `i` must have `id === i` (if defined)
  - Upgrades without IDs are not included in this array
  - Used by save game parser to match upgrade bitfield positions

## Upgrade Object Contract

### Structure

```typescript
interface Upgrade {
  name: string;
  req: Record<string, number>;
  price: number;
  effects: Record<string, Effect>;
  id?: number;
}
```

### Field Specifications

#### `name` (string)

- **Type**: string
- **Required**: Yes
- **Description**: Display name of the upgrade
- **Constraints**: Must be non-empty, unique within version

#### `req` (object<string, number>)

- **Type**: Object mapping building names to required counts
- **Required**: Yes
- **Description**: Building requirements to unlock this upgrade
- **Constraints**:
  - Keys must be valid building names from `buildingNames`
  - Values must be non-negative integers
  - Empty object `{}` means no requirements

#### `price` (number)

- **Type**: number
- **Required**: Yes
- **Description**: Purchase price in cookies
- **Constraints**: Must be positive number

#### `effects` (object<string, Effect>)

- **Type**: Object mapping effect targets to Effect objects
- **Required**: Yes
- **Description**: Effects applied by this upgrade
- **Constraints**:
  - Keys must be building names, "mouse", or "all"
  - Values must be Effect objects (see Effect Contract)
  - Must have at least one entry

#### `id` (number, optional)

- **Type**: number | undefined
- **Required**: No
- **Description**: Cookie Clicker upgrade ID for save game compatibility
- **Constraints**: 
  - If provided, must be non-negative integer
  - Must be unique within version
  - Used to index into `upgradesById` array

## Effect Object Contract

### Structure

```typescript
interface Effect {
  priority: number;
  func: (rate: number, game: Game) => number;
}
```

### Field Specifications

#### `priority` (number)

- **Type**: number
- **Required**: Yes
- **Description**: Effect priority (0-2), determines application order
- **Constraints**: Must be integer 0, 1, or 2
  - Priority 2: Applied first (multiplicative effects)
  - Priority 1: Applied second (additive effects)
  - Priority 0: Applied last (percentage boosts)

#### `func` (function)

- **Type**: `(rate: number, game: Game) => number`
- **Required**: Yes
- **Description**: Calculation function that transforms the rate based on game state
- **Parameters**:
  - `rate` (number): Current production rate before this effect
  - `game` (Game): Game instance with building counts and other state
- **Returns**: number (transformed rate after this effect)
- **Constraints**: Must be pure function (no side effects)

## Dynamic Import Contract

### Import Pattern

Version modules MUST be loadable via dynamic import:

```javascript
const versionModules = await import(`../data/versions/${versionId}.js`);
const version = versionModules.default;
```

### Behavior Requirements

1. **Module Resolution**: Must resolve to valid JavaScript module
2. **Default Export**: Must export default object matching Version interface
3. **Error Handling**: Invalid version IDs should throw module resolution errors
4. **Performance**: Import should complete in <50ms

## Backward Compatibility Guarantees

### Guaranteed Compatibility

1. **Import Paths**: Existing dynamic imports continue to work unchanged
2. **Export Structure**: Default export structure matches current implementation exactly
3. **Object Types**: All object types (Set, arrays, objects) match current structure
4. **Upgrade IDs**: `upgradesById` array structure preserved for save game parsing

### Breaking Changes

**None** - This refactoring maintains 100% backward compatibility.

## Validation Requirements

### Runtime Validation

Version loaders MUST validate:

1. JSON data structure (required fields present)
2. Data types (arrays, objects, numbers as expected)
3. Building name consistency (all references valid)
4. Effect method names (calculation methods exist in utils)
5. Parameter counts (match method requirements)

### Error Messages

Validation errors MUST provide:

1. Clear description of the issue
2. File path or location of the problem
3. Expected vs actual values
4. Suggestions for fixing (when applicable)

## Testing Requirements

### Contract Tests

Tests MUST verify:

1. All version modules export correct structure
2. Dynamic imports work for all supported versions
3. Version objects match expected interface
4. Upgrade objects have valid structure
5. Effect objects have valid function signatures
6. `upgradesById` array correctly indexes upgrades by ID

### Compatibility Tests

Tests MUST verify:

1. JSON-based versions produce identical results to JS-based versions
2. Route calculations match exactly
3. Save game parsing works correctly
4. All existing tests pass without modification

