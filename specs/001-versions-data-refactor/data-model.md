# Data Model: Rework Versions Data Structure

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Entities

### VersionData (JSON)

Represents a complete game version's static data stored in JSON format. This is the source of truth for version information.

**Fields**:
- `version` (string, required): Version identifier (e.g., "v2052", "v2048")
- `buildings` (object, required): Building data
  - `names` (array<string>, required): Ordered array of building names
  - `basePrices` (object<string, number>, required): Map of building names to base purchase prices
  - `baseRates` (object<string, number>, required): Map of building names to base cookies per second
- `upgrades` (array<UpgradeDefinition>, required): Array of upgrade definitions

**Validation Rules**:
- `version` must match pattern `^v\d+(_\w+)?$` (e.g., "v2052", "v10466_xmas")
- `buildings.names` must be non-empty array
- `buildings.basePrices` must have entry for each building in `names`
- `buildings.baseRates` must have entry for each building in `names`
- All prices and rates must be positive numbers
- `upgrades` array must contain at least one upgrade

**Storage**: JSON files in `src/data/versions/{versionId}.json`

**Relationships**:
- One VersionData file per game version
- Referenced by VersionLoader module of same name

### UpgradeDefinition (JSON)

Represents a single upgrade definition within a version's JSON data.

**Fields**:
- `name` (string, required): Upgrade display name (e.g., "Reinforced index finger")
- `requirements` (object<string, number>, required): Building requirements map (e.g., `{"Cursor": 1}`)
- `price` (number, required): Purchase price in cookies (must be positive)
- `effects` (object<string, EffectDefinition>, required): Map of effect targets to effect definitions
  - Keys: Building names, "mouse", or "all"
  - Values: EffectDefinition objects
- `id` (number, optional): Cookie Clicker upgrade ID (required for save game compatibility)

**Validation Rules**:
- `name` must be non-empty string
- `requirements` must be object with building names as keys and non-negative integers as values
- `price` must be positive number
- `effects` must have at least one entry
- `id` must be non-negative integer if provided
- Effect targets must be valid building names, "mouse", or "all"

**Storage**: Part of `upgrades` array in VersionData JSON

**Relationships**:
- Belongs to a VersionData entity
- References EffectDefinition objects for each target

### EffectDefinition (JSON)

Represents a calculation method reference and parameters for an upgrade effect.

**Fields**:
- `type` (string, required): Calculation method name (e.g., "multiplier", "grandmaBoost", "fingersBoost", "percentBoost")
- `params` (array<number>, required): Parameters for the calculation method
- `priority` (number, required): Effect priority (0-2, determines application order)

**Validation Rules**:
- `type` must be one of: "multiplier", "grandmaBoost", "fingersBoost", "percentBoost", "mouseBoost", "custom"
- `params` must be array of numbers
- `priority` must be integer between 0 and 2 (inclusive)
- Parameter count must match expected count for the method type:
  - `multiplier`: 1 parameter (multiplier value)
  - `grandmaBoost`: 1 parameter (divisor n)
  - `fingersBoost`: 1 parameter (additive value x)
  - `percentBoost`: 1 parameter (percentage p)
  - `mouseBoost`: 0 parameters
  - `custom`: Variable (defined by custom function)

**Storage**: Part of `effects` object in UpgradeDefinition

**Relationships**:
- Referenced by UpgradeDefinition
- Resolved to Effect object by version loader using upgrade-effects utils

### VersionLoader (JavaScript Module)

JavaScript module that loads JSON version data and transforms it into the version object format expected by the game simulation system.

**Exports**:
- `default` (object): Version object with structure:
  - `buildingNames` (array<string>): Building names array
  - `basePrices` (object<string, number>): Base prices map
  - `baseRates` (object<string, number>): Base rates map
  - `menu` (Set<Upgrade>): Set of Upgrade objects
  - `upgradesById` (array<Upgrade>): Array of upgrades indexed by ID (sparse array)

**Responsibilities**:
- Import JSON version data
- Import calculation methods from upgrade-effects utils
- Transform JSON data into Upgrade and Effect objects
- Build upgradesById array for save game compatibility
- Validate JSON data structure
- Provide helpful error messages for invalid data

**Storage**: JavaScript files in `src/data/versions/{versionId}.js`

**Relationships**:
- Imports VersionData JSON file of same name
- Imports calculation methods from `src/js/utils/upgrade-effects.js`
- Exports version object consumed by game simulation system

### UpgradeEffectUtils (JavaScript Module)

Utility module containing reusable calculation functions for upgrade effects.

**Exports**:
- `createMultiplier(x)` (function): Returns Effect with multiplier calculation
- `createGrandmaBoost(n)` (function): Returns Effect with grandma boost calculation
- `createFingersBoost(x)` (function): Returns Effect with fingers boost calculation
- `createPercentBoost(p)` (function): Returns Effect with percentage boost calculation
- `createMouseBoost()` (function): Returns Effect with mouse boost calculation
- `createEffectFromDefinition(def)` (function): Factory function that creates Effect from EffectDefinition object

**Responsibilities**:
- Provide calculation methods for upgrade effects
- Maintain same function signatures as original implementations
- Return Effect objects with correct priority
- Handle parameter validation

**Storage**: `src/js/utils/upgrade-effects.js`

**Relationships**:
- Imported by VersionLoader modules
- Uses Effect class from `src/js/game.js`

## State Transitions

### Version Loading Flow

1. **JSON File** → Loaded by version loader module
2. **JSON Data** → Validated for required fields and types
3. **EffectDefinitions** → Resolved to Effect objects using upgrade-effects utils
4. **UpgradeDefinitions** → Transformed to Upgrade objects
5. **Version Object** → Exported for use by game simulation

### Migration Flow

1. **Original JS File** → Analyzed to extract data and methods
2. **Data Extracted** → Written to JSON file
3. **Methods Extracted** → Moved to upgrade-effects utils
4. **Loader Created** → New JS file imports JSON and utils
5. **Testing** → Verified identical behavior
6. **Old File Removed** → After successful migration

## Data Integrity

### Validation Points

1. **JSON Schema Validation**: Runtime validation in version loaders
2. **Effect Method Validation**: Verify calculation method names exist in utils
3. **Parameter Validation**: Verify parameter counts match method requirements
4. **Building Reference Validation**: Verify all building names in requirements/effects exist in buildingNames
5. **ID Uniqueness**: Verify upgrade IDs are unique within a version

### Error Handling

- Invalid JSON: Syntax error with file path
- Missing required fields: Clear error listing missing fields
- Invalid effect type: Error with valid types listed
- Invalid building reference: Error with building name and valid options
- Duplicate upgrade ID: Error with conflicting IDs

## Migration Considerations

### Backward Compatibility

- Version loader modules maintain same filename and export structure
- Existing dynamic imports continue to work: `import(\`../data/versions/${versionId}.js\`)`
- Version object structure unchanged: `{buildingNames, basePrices, baseRates, menu, upgradesById}`
- All existing code using versions continues to work without changes

### Data Preservation

- All upgrade data preserved (names, requirements, prices, effects, IDs)
- Building data preserved (names, prices, rates)
- Calculation logic preserved (same algorithms, same results)
- Upgrade ordering preserved (for upgradesById array construction)

