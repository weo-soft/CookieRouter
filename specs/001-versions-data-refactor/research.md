# Research: Rework Versions Data Structure

**Feature**: [spec.md](./spec.md) | **Date**: 2025-01-27

## Research Questions

### Q1: How to represent calculation method references in JSON?

**Context**: Upgrade effects need to reference calculation methods (e.g., `multiplier(2.0)`, `grandmaBoost(1)`, `fingersBoost(0.1)`). JSON cannot contain executable code, so we need a way to represent these references.

**Decision**: Use a structured object format with method name and parameters:
```json
{
  "type": "multiplier",
  "params": [2.0],
  "priority": 2
}
```

**Rationale**: 
- Explicit and parseable
- Allows validation of method names and parameter types
- Maintains priority information needed for Effect construction
- Easy to extend with additional metadata if needed

**Alternatives considered**:
- String format like `"multiplier(2.0)"`: Requires parsing, error-prone, harder to validate
- Function name only with separate params: Less compact, but clearer structure
- **Chosen**: Structured object provides best balance of clarity and validation

### Q2: JSON schema design for version data

**Context**: Need a standardized schema for version JSON files that includes buildings, prices, rates, and upgrades.

**Decision**: Use a flat JSON structure with clear sections:
```json
{
  "version": "v2052",
  "buildings": {
    "names": ["Cursor", "Grandma", ...],
    "basePrices": { "Cursor": 15, ... },
    "baseRates": { "Cursor": 0.1, ... }
  },
  "upgrades": [
    {
      "name": "Reinforced index finger",
      "requirements": { "Cursor": 1 },
      "price": 100,
      "effects": {
        "Cursor": { "type": "multiplier", "params": [2.0], "priority": 2 },
        "mouse": { "type": "multiplier", "params": [2.0], "priority": 2 }
      },
      "id": 0
    }
  ]
}
```

**Rationale**:
- Matches current JavaScript structure closely (easier migration)
- Clear separation of concerns (buildings vs upgrades)
- Arrays for upgrades allow easy iteration
- Objects for effects allow multiple targets per upgrade

**Alternatives considered**:
- Nested structure with upgrades grouped by building: More complex, harder to maintain
- Separate files for buildings and upgrades: Too fragmented, harder to manage
- **Chosen**: Single file per version maintains simplicity and matches current structure

### Q3: Version loader implementation pattern

**Context**: Need JavaScript modules that load JSON, apply calculation methods, and produce the same API as current version modules.

**Decision**: Version loader pattern:
```javascript
import versionData from './v2052.json';
import { createMultiplier, createGrandmaBoost, ... } from '../../js/utils/upgrade-effects.js';
import { Upgrade, Effect } from '../../js/game.js';

// Transform JSON data into version object
const menu = new Set();
for (const upgradeDef of versionData.upgrades) {
  const effects = {};
  for (const [target, effectDef] of Object.entries(upgradeDef.effects)) {
    effects[target] = createEffectFromDefinition(effectDef);
  }
  menu.add(new Upgrade(upgradeDef.name, upgradeDef.requirements, upgradeDef.price, effects, upgradeDef.id));
}

export default {
  buildingNames: versionData.buildings.names,
  basePrices: versionData.buildings.basePrices,
  baseRates: versionData.buildings.baseRates,
  menu,
  upgradesById: buildUpgradesByIdArray(menu)
};
```

**Rationale**:
- Maintains exact same export structure (backward compatible)
- Clear separation: JSON = data, loader = transformation logic
- Calculation methods imported from utils (no duplication)
- Can add validation and error handling in loader

**Alternatives considered**:
- Runtime JSON loading with fetch(): Adds async complexity, not needed for build-time
- Code generation from JSON: Over-engineered for this use case
- **Chosen**: Static import of JSON (Vite supports this) with synchronous transformation

### Q4: JSON validation approach

**Context**: Need to ensure JSON version files are valid and contain required fields.

**Decision**: Use runtime validation in version loaders with clear error messages:
- Check required fields exist
- Validate data types (arrays, objects, numbers)
- Validate upgrade effect definitions reference valid calculation methods
- Provide helpful error messages pointing to specific issues

**Rationale**:
- No need for external schema validation library (adds dependency)
- Runtime validation catches issues early (during development)
- Clear error messages help developers fix JSON files quickly
- Can be tested with unit tests

**Alternatives considered**:
- JSON Schema with ajv library: Adds dependency, but provides stronger validation
- TypeScript types only: Doesn't catch runtime issues
- **Chosen**: Runtime validation in loaders provides good balance of validation without extra dependencies

### Q5: Migration strategy for existing versions

**Context**: Need to convert 5 existing JavaScript version files to JSON + loader format.

**Decision**: Incremental migration approach:
1. Create new utils file with calculation methods
2. Convert one version (e.g., v2052) to JSON + loader
3. Test thoroughly to ensure identical behavior
4. Convert remaining versions one by one
5. Remove old JS files only after all are converted and tested

**Rationale**:
- Lowers risk by testing each conversion
- Allows rollback if issues found
- Can verify backward compatibility at each step
- Team can review each conversion

**Alternatives considered**:
- Big bang conversion of all versions: Higher risk, harder to debug
- Keep both formats during transition: Adds complexity, not needed
- **Chosen**: Incremental approach minimizes risk and allows validation at each step

### Q6: Calculation method organization

**Context**: Multiple calculation methods (multiplier, grandmaBoost, fingersBoost, percentBoost, mouseBoost, etc.) need to be organized in utils.

**Decision**: Single utils file `src/js/utils/upgrade-effects.js` with:
- Factory functions that return Effect objects
- Each function matches current signature (e.g., `multiplier(x)`, `grandmaBoost(n)`)
- Clear documentation of each method's purpose and parameters
- Export all methods for use by version loaders

**Rationale**:
- Single file keeps related functionality together
- Easy to find and maintain all upgrade effect calculations
- Matches existing utils pattern in codebase
- Can be easily extended with new calculation methods

**Alternatives considered**:
- Separate file per calculation method: Too fragmented
- Group by effect type (multiplicative, additive, etc.): More complex organization
- **Chosen**: Single file provides simplicity and matches existing codebase patterns

## Technical Decisions Summary

1. **JSON Structure**: Flat structure with buildings and upgrades arrays, effect definitions as structured objects
2. **Effect Representation**: Object format `{type, params, priority}` for calculation method references
3. **Version Loaders**: JavaScript modules that import JSON and transform to current API format
4. **Validation**: Runtime validation in loaders with helpful error messages
5. **Migration**: Incremental conversion, one version at a time
6. **Utils Organization**: Single `upgrade-effects.js` file with all calculation methods

## Open Questions Resolved

- ✅ How to represent function calls in JSON → Structured objects
- ✅ JSON schema design → Flat structure matching current JS structure
- ✅ Loader implementation → Static JSON import with transformation
- ✅ Validation approach → Runtime validation in loaders
- ✅ Migration strategy → Incremental, one version at a time
- ✅ Utils organization → Single file with all methods

## References

- Vite JSON import documentation: Supports static JSON imports
- Existing utils pattern: `src/js/utils/` directory structure
- Current version file structure: `src/data/versions/v2052.js` (reference implementation)

