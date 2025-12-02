# Quickstart: Rework Versions Data Structure

**Feature**: [spec.md](./spec.md) | **Date**: 2025-01-27

## Overview

This guide helps developers understand and work with the refactored version data structure. The refactoring separates data (JSON) from code (calculation methods in utils), making version data easier to maintain and update.

## Key Concepts

### Data vs Code Separation

- **Data** (JSON files): Building names, prices, rates, upgrade definitions
- **Code** (Utils): Calculation methods for upgrade effects
- **Loaders** (JS modules): Transform JSON + utils into version objects

### File Structure

```
src/data/versions/
├── v2052.json    # Version data (JSON)
├── v2052.js      # Version loader (transforms JSON to version object)
└── ...

src/js/utils/
└── upgrade-effects.js  # Calculation methods (multiplier, grandmaBoost, etc.)
```

## For Developers: Adding a New Version

### Step 1: Create JSON Data File

Create `src/data/versions/vXXXX.json`:

```json
{
  "version": "vXXXX",
  "buildings": {
    "names": ["Cursor", "Grandma", "Farm", ...],
    "basePrices": {
      "Cursor": 15,
      "Grandma": 100,
      ...
    },
    "baseRates": {
      "Cursor": 0.1,
      "Grandma": 1,
      ...
    }
  },
  "upgrades": [
    {
      "name": "Upgrade Name",
      "requirements": { "Cursor": 1 },
      "price": 100,
      "effects": {
        "Cursor": {
          "type": "multiplier",
          "params": [2.0],
          "priority": 2
        }
      },
      "id": 0
    }
  ]
}
```

### Step 2: Create Version Loader

Create `src/data/versions/vXXXX.js`:

```javascript
import versionData from './vXXXX.json';
import { createEffectFromDefinition } from '../../js/utils/upgrade-effects.js';
import { Upgrade, Effect } from '../../js/game.js';

// Validate and transform JSON data
const menu = new Set();

for (const upgradeDef of versionData.upgrades) {
  const effects = {};
  for (const [target, effectDef] of Object.entries(upgradeDef.effects)) {
    effects[target] = createEffectFromDefinition(effectDef);
  }
  
  menu.add(new Upgrade(
    upgradeDef.name,
    upgradeDef.requirements,
    upgradeDef.price,
    effects,
    upgradeDef.id
  ));
}

// Build upgradesById array
const upgradesById = [];
for (const upgrade of menu) {
  if (upgrade.id !== null && upgrade.id !== undefined) {
    upgradesById[upgrade.id] = upgrade;
  }
}

export default {
  buildingNames: versionData.buildings.names,
  basePrices: versionData.buildings.basePrices,
  baseRates: versionData.buildings.baseRates,
  menu,
  upgradesById
};
```

### Step 3: Test the Version

```javascript
// In your test file
import version from '../src/data/versions/vXXXX.js';

test('version loads correctly', () => {
  expect(version.buildingNames).toBeArray();
  expect(version.menu).toBeInstanceOf(Set);
  expect(version.upgradesById).toBeArray();
});
```

## For Developers: Adding a New Calculation Method

### Step 1: Add Method to Utils

Add to `src/js/utils/upgrade-effects.js`:

```javascript
/**
 * Creates a new calculation method effect
 * @param {number} param - Parameter description
 * @returns {Effect} Effect object with calculation function
 */
export function createNewMethod(param) {
  const func = (r, game) => {
    // Your calculation logic here
    return r * param; // Example
  };
  return new Effect(2, func); // Priority 2 for multiplicative
}
```

### Step 2: Update Effect Definition Type

Add "newMethod" to valid effect types in version loaders:

```javascript
const validEffectTypes = ['multiplier', 'grandmaBoost', 'newMethod', ...];
```

### Step 3: Use in JSON

Reference in upgrade JSON:

```json
{
  "type": "newMethod",
  "params": [2.5],
  "priority": 2
}
```

## For Developers: Updating Version Data

### Editing Building Data

1. Open the version JSON file (e.g., `v2052.json`)
2. Edit `buildings.basePrices` or `buildings.baseRates`
3. Save file
4. Changes take effect immediately (no code changes needed)

### Adding an Upgrade

1. Open the version JSON file
2. Add new object to `upgrades` array:

```json
{
  "name": "New Upgrade",
  "requirements": { "Cursor": 10 },
  "price": 1000,
  "effects": {
    "Cursor": {
      "type": "multiplier",
      "params": [2.0],
      "priority": 2
    }
  },
  "id": 999
}
```

3. Ensure `id` is unique within the version
4. Save file

### Modifying an Upgrade

1. Open the version JSON file
2. Find the upgrade in `upgrades` array
3. Modify fields (name, price, requirements, effects)
4. Save file

## For Developers: Migrating an Existing Version

### Step 1: Extract Data

Analyze existing JS file (`vXXXX.js`):

1. Extract `buildingNames` array
2. Extract `basePrices` object
3. Extract `baseRates` object
4. Extract upgrade definitions (name, req, price, effects, id)

### Step 2: Convert Effects to JSON Format

For each upgrade effect:

```javascript
// Original JS:
{ 'Cursor': multiplier(2.0) }

// Convert to JSON:
{
  "Cursor": {
    "type": "multiplier",
    "params": [2.0],
    "priority": 2
  }
}
```

### Step 3: Create JSON File

Create `vXXXX.json` with extracted data.

### Step 4: Create Loader

Create `vXXXX.js` loader (see "Adding a New Version" above).

### Step 5: Verify

Run tests to ensure identical behavior:

```javascript
// Compare old vs new
import oldVersion from './vXXXX.old.js';
import newVersion from './vXXXX.js';

// Verify structures match
expect(newVersion.buildingNames).toEqual(oldVersion.buildingNames);
expect(newVersion.menu.size).toBe(oldVersion.menu.size);
```

## Common Patterns

### Multiplier Effect

```json
{
  "type": "multiplier",
  "params": [2.0],
  "priority": 2
}
```

### Grandma Boost Effect

```json
{
  "type": "grandmaBoost",
  "params": [1],
  "priority": 2
}
```

### Fingers Boost Effect

```json
{
  "type": "fingersBoost",
  "params": [0.1],
  "priority": 1
}
```

### Percentage Boost Effect

```json
{
  "type": "percentBoost",
  "params": [50],
  "priority": 0
}
```

### Multiple Effects on One Upgrade

```json
{
  "name": "Upgrade with Multiple Effects",
  "requirements": { "Cursor": 1 },
  "price": 100,
  "effects": {
    "Cursor": {
      "type": "multiplier",
      "params": [2.0],
      "priority": 2
    },
    "mouse": {
      "type": "multiplier",
      "params": [2.0],
      "priority": 2
    }
  },
  "id": 0
}
```

## Troubleshooting

### Error: "Effect type 'xyz' not found"

**Cause**: Effect type doesn't exist in upgrade-effects utils.

**Fix**: 
1. Check `src/js/utils/upgrade-effects.js` for available methods
2. Verify effect type name matches exactly (case-sensitive)
3. Add new method to utils if needed

### Error: "Building 'X' not found in buildingNames"

**Cause**: Upgrade references a building that doesn't exist.

**Fix**:
1. Check `buildings.names` array in JSON
2. Verify building name spelling matches exactly
3. Add building to `names` array if it's missing

### Error: "Invalid parameter count for effect type 'xyz'"

**Cause**: Effect definition has wrong number of parameters.

**Fix**:
1. Check method signature in `upgrade-effects.js`
2. Verify `params` array length matches expected count
3. Update JSON with correct parameter count

### Version Not Loading

**Cause**: Module import fails.

**Fix**:
1. Verify JSON file exists and is valid JSON
2. Verify loader JS file exists and exports default
3. Check file paths match version ID exactly
4. Check browser console for detailed error messages

## Best Practices

1. **Always validate JSON** before committing (use JSON linter)
2. **Test after changes** to ensure version loads correctly
3. **Keep IDs unique** within each version
4. **Use consistent naming** for effect types (case-sensitive)
5. **Document custom effects** in upgrade-effects utils
6. **Incremental migration** - convert one version at a time
7. **Verify backward compatibility** after each migration

## Related Documentation

- [Data Model](./data-model.md) - Entity definitions and relationships
- [Version Loading Contract](./contracts/version-loading.md) - API contract details
- [Research](./research.md) - Technical decisions and rationale

