# Quickstart Guide: Import Cookie Clicker Save Games

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Prerequisites

- Existing Cookie Clicker Building Order Simulator setup (from feature 001)
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Example save game file: `example_save/save` in repository

## Initial Setup

### 1. Verify Existing Setup

Ensure the base application is working:

```bash
npm install
npm run dev
```

Navigate to `http://localhost:5173` and verify the application loads.

### 2. Review Example Save File

Examine the example save file to understand the format:

```bash
cat example_save/save
```

The save file is a base64-encoded string with "!END!" suffix, optionally URL-encoded.

## Development Workflow

### Running Tests

```bash
# Run all tests including new save game import tests
npm test

# Run only save game import tests
npm test -- save-game

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Linting Code

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint -- --fix
```

### Building for Production

```bash
npm run build
```

## Project Structure

### New Files for This Feature

```
src/
├── js/
│   ├── save-game-parser.js        # New: Core parsing logic
│   ├── save-game-importer.js      # New: Import workflow
│   ├── ui/
│   │   ├── save-game-import-dialog.js  # New: Import UI
│   │   └── save-game-details-view.js    # New: Details display
│   └── storage.js                 # Extend: Add import state storage
├── styles/
│   └── main.css                   # Extend: Import UI styles
└── ...

tests/
├── unit/
│   ├── save-game-parser.test.js   # New: Parser tests
│   └── save-game-importer.test.js # New: Importer tests
└── integration/
    └── save-game-import-workflow.test.js # New: Workflow tests
```

## Key Files to Understand

1. **`src/js/save-game-parser.js`**: Core parsing logic for Cookie Clicker save format
   - `parseSaveGame()`: Main parsing function
   - `decodeSaveString()`: Handles URL/base64 decoding
   - `extractBuildingCounts()`: Extracts building data
   - `detectVersion()`: Detects game version
   - `extractGameStats()`: Extracts statistics

2. **`src/js/save-game-importer.js`**: Import workflow and state management
   - `importSaveGame()`: Complete import workflow
   - `validateImportedData()`: Data validation
   - `getImportedSaveGame()`: Retrieve current import
   - `clearImportedSaveGame()`: Clear import

3. **`src/js/ui/save-game-import-dialog.js`**: Import UI component
   - Text area for pasting save string
   - Import button and validation feedback
   - Error message display

4. **`src/js/ui/save-game-details-view.js`**: Details display component
   - Building counts table
   - Game statistics display
   - Version and mode information
   - Collapsible/expandable view

## Common Tasks

### Testing Save Game Parsing

```javascript
// In browser console or test
import { parseSaveGame } from './js/save-game-parser.js';

const exampleSave = "Mi4wNTN8fDE3NjM4MjM3ODU5NjU...!END!";
const result = parseSaveGame(exampleSave);
console.log('Parsed buildings:', result.buildingCounts);
console.log('Detected version:', result.version);
```

### Importing a Save Game Programmatically

```javascript
import { importSaveGame } from './js/save-game-importer.js';

try {
  const imported = await importSaveGame(userSaveString);
  console.log('Import successful!');
  console.log('Buildings:', imported.buildingCounts);
  console.log('Version:', imported.version);
} catch (error) {
  console.error('Import failed:', error.message);
}
```

### Using Imported Data for Route Calculation

```javascript
import { getImportedSaveGame } from './js/save-game-importer.js';
import { calculateRoute } from './js/simulation.js';

const imported = getImportedSaveGame();
if (imported) {
  // Use imported building counts as starting buildings
  const route = await calculateRoute(
    category,
    imported.buildingCounts,  // Starting buildings from import
    {
      hardcoreMode: imported.hardcoreMode || false
    },
    imported.version || 'v2052'
  );
}
```

### Extending Starting Buildings with Import

```javascript
import { getImportedSaveGame } from './js/save-game-importer.js';
import { StartingBuildingsSelector } from './js/ui/starting-buildings.js';

const selector = new StartingBuildingsSelector('starting-buildings', onUpdate);
await selector.init('v2052');

const imported = getImportedSaveGame();
if (imported) {
  // Auto-populate from import
  selector.setStartingBuildings(imported.buildingCounts);
}
```

## Testing Save Game Format

### Testing with Example Save

```javascript
// Load example save file
const fs = require('fs');
const exampleSave = fs.readFileSync('example_save/save', 'utf8');

// Test parsing
import { parseSaveGame } from './js/save-game-parser.js';
const result = parseSaveGame(exampleSave);
console.log('Example save parsed:', result);
```

### Testing Different Versions

```javascript
// Test version detection
import { detectVersion } from './js/save-game-parser.js';

const v2031Save = "..."; // Save from v2031
const v2052Save = "..."; // Save from v2052

console.log('v2031 detected:', detectVersion(v2031Save));
console.log('v2052 detected:', detectVersion(v2052Save));
```

### Testing Error Handling

```javascript
import { parseSaveGame } from './js/save-game-parser.js';

// Test invalid formats
try {
  parseSaveGame("invalid string");
} catch (error) {
  console.log('Expected error:', error.message);
}

try {
  parseSaveGame(""); // Empty string
} catch (error) {
  console.log('Expected error:', error.message);
}
```

## Troubleshooting

### Save Game Won't Parse

- **Check format**: Ensure save string ends with "!END!" and is base64-encoded
- **Check URL encoding**: Try URL-decoding if parsing fails: `decodeURIComponent(saveString)`
- **Check console**: Look for parsing warnings in browser console
- **Validate manually**: Try decoding base64 manually to see structure

### Building Counts Not Extracted

- **Check version**: Ensure detected version matches save game version
- **Check building names**: Verify building names in save match application building names
- **Check section parsing**: Verify building section exists in save format
- **Review parse errors**: Check `parseErrors` array in ImportedSaveGame

### Version Detection Fails

- **Check version field**: Look for explicit version in save format
- **Try inference**: Use building list to infer version
- **Fallback**: System will use default version (v2052) if detection fails
- **Manual selection**: User can manually select version if auto-detection fails

### Imported Data Not Used in Calculation

- **Check import state**: Verify `getImportState().isLoaded === true`
- **Check integration**: Ensure starting buildings component receives imported data
- **Check manual override**: User may have manually cleared starting buildings
- **Review workflow**: Verify import → populate → calculate flow

### Performance Issues

- **Large save files**: Very large save files (>100KB) may take longer to parse
- **Optimize parsing**: Use efficient string operations, avoid unnecessary iterations
- **Async parsing**: Ensure parsing is async to prevent UI blocking
- **Progress feedback**: Show loading indicator during parsing

## Next Steps

1. Review [data-model.md](./data-model.md) for entity structures
2. Review [contracts/save-game-import.md](./contracts/save-game-import.md) for API interfaces
3. Review [plan.md](./plan.md) for implementation details
4. Start with User Story 1 (P1): Import Save Game Data
5. Reference Cookie Clicker Save Format Wiki: https://cookieclicker.wiki.gg/wiki/Save

## Resources

- [Cookie Clicker Save Format Wiki](https://cookieclicker.wiki.gg/wiki/Save)
- [MDN Base64 Decoding](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/atob)
- [MDN URL Decoding](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)

