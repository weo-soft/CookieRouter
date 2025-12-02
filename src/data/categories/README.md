# Predefined Categories

This directory contains JSON configuration files for predefined speedrun categories.

## Adding a New Category

To add a new predefined category, simply create a new JSON file in this directory following this structure:

```json
{
  "name": "categoryName",
  "description": "Description of the category",
  "version": "v2052",
  "targetCookies": 1000000,
  "defaultPlayerCps": 8,
  "defaultPlayerDelay": 1,
  "hardcoreMode": false,
  "initialBuildings": {},
  "initialCookies": null,
  "initialTime": null,
  "initialPurchases": []
}
```

### Field Descriptions

- **name** (string, required): The function name for this category (camelCase)
- **description** (string, optional): Human-readable description
- **version** (string, required): Game version ID (e.g., "v2052", "v10466", "v10466_xmas")
- **targetCookies** (number or string, required): Target cookie count. Can be a number or a mathematical expression string (e.g., "1 * 10**6" for 1 million)
- **defaultPlayerCps** (number, optional): Default clicks per second (default: 8)
- **defaultPlayerDelay** (number, optional): Default delay when switching from clicking to purchasing in seconds (default: 1)
- **hardcoreMode** (boolean, optional): Whether upgrades are disabled (default: false)
- **initialBuildings** (object, optional): Map of building names to initial counts (default: {})
- **initialCookies** (number or null, optional): Initial cookie count (default: null)
- **initialTime** (number or null, optional): Initial time elapsed in seconds (default: null)
- **initialPurchases** (array, optional): Array of building names to purchase initially (default: [])

### Example: Simple Category

```json
{
  "name": "myCategory",
  "description": "My custom category",
  "version": "v2052",
  "targetCookies": 1000000,
  "defaultPlayerCps": 8,
  "defaultPlayerDelay": 1,
  "hardcoreMode": false,
  "initialBuildings": {},
  "initialCookies": null,
  "initialTime": null,
  "initialPurchases": []
}
```

### Example: Complex Category

```json
{
  "name": "complexCategory",
  "description": "Category with initial state",
  "version": "v10466",
  "targetCookies": "30 * 10**6",
  "defaultPlayerCps": 0,
  "defaultPlayerDelay": 0,
  "hardcoreMode": true,
  "initialBuildings": {
    "Cursor": 1,
    "Grandma": 5
  },
  "initialCookies": 1000,
  "initialTime": 10.5,
  "initialPurchases": [
    "Cursor",
    "Cursor"
  ]
}
```

## Automatic Function Generation

Categories are automatically discovered and loaded using Vite's `import.meta.glob`. 

**No code changes needed!** Simply create a JSON file in this directory and it will be automatically:
- Loaded at module initialization
- Converted to a category function
- Made available through the `categories` export object

### Accessing Categories

**Existing categories** (fledgling, neverclick, etc.) are exported individually for backward compatibility:
```javascript
import { fledgling } from './categories.js';
```

**All categories** (including new ones) are available through the `categories` object:
```javascript
import { categories } from './categories.js';
const myNewCategory = categories.myNewCategory;
```

**Dynamic imports** (used in simulation.js) will also have access to all categories:
```javascript
const categoryFunctions = await import('./categories.js');
// Access via: categoryFunctions.categories.newCategory
// Or if explicitly exported: categoryFunctions.newCategory
```

### Note for Simulation

The `simulation.js` file uses a `categoryMap` to map display names to function names. For new categories to work seamlessly with the simulation, you may need to add an entry to the `categoryMap` in `simulation.js`, or access them via `categoryFunctions.categories.newCategory`.

