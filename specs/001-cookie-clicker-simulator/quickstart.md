# Quickstart Guide: Cookie Clicker Building Order Simulator

**Date**: 2025-11-23  
**Feature**: [spec.md](./spec.md)

## Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for version control)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Vite (build tool and dev server)
- Vitest (testing framework)
- ESLint (code linting)
- Any other minimal dependencies

### 2. Start Development Server

```bash
npm run dev
```

This starts the Vite development server, typically at `http://localhost:5173`

### 3. Open in Browser

Navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

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

This creates an optimized build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Project Structure

```
src/
├── index.html          # Main HTML entry point
├── main.js            # Application entry point
├── styles/
│   └── main.css      # Main stylesheet
├── js/
│   ├── game.js       # Game simulation engine
│   ├── router.js      # Routing algorithms
│   ├── categories.js  # Category definitions
│   ├── storage.js     # localStorage utilities
│   └── ui/           # UI components
└── data/
    └── versions/     # Game version data
```

## Key Files to Understand

1. **`src/main.js`**: Application entry point, initializes UI and event handlers
2. **`src/js/game.js`**: Core game simulation logic (ported from Python)
3. **`src/js/router.js`**: Routing algorithms (GPL, DFS)
4. **`src/js/storage.js`**: localStorage wrapper functions
5. **`src/data/versions/*.js`**: Game version data (buildings, prices, rates)

## Common Tasks

### Adding a New Predefined Category

1. Edit `src/js/categories.js`
2. Add category function following existing pattern
3. Export the category
4. Update category selector UI to include it

### Porting Python Code to JavaScript

1. Identify the Python class/function to port
2. Create equivalent JavaScript class/function in appropriate file
3. Convert Python data structures:
   - `dict` → `Map` or plain object
   - `list` → `Array`
   - Python numbers → JavaScript numbers (watch for precision)
4. Write unit tests to verify correctness
5. Test with known inputs/outputs from Python version

### Testing localStorage Operations

```javascript
// In browser console or test
import { getCategories, saveCategory } from './js/storage.js';

// Save a test category
const category = {
  id: 'test-1',
  name: 'Test Category',
  isPredefined: false,
  version: 'v2031',
  targetCookies: 1000000
};
saveCategory(category);

// Retrieve it
const categories = getCategories();
console.log(categories);
```

### Debugging Route Calculation

1. Open browser DevTools
2. Set breakpoints in `router.js` or `game.js`
3. Use `console.log()` to inspect game state
4. Check `game.history` to see purchase sequence
5. Verify `game.rate()` returns expected CpS values

## Troubleshooting

### localStorage Quota Exceeded

- Delete old routes: Clear `cookieRouter:routes` in localStorage
- Check storage usage: `console.log(JSON.stringify(localStorage).length)`
- Implement cleanup of old routes automatically

### Route Calculation Too Slow

- Reduce `lookahead` parameter for GPL algorithm
- Check for infinite loops in routing logic
- Profile with browser DevTools Performance tab
- Consider using Web Workers for long calculations

### Tests Failing

- Ensure test files are in `tests/` directory
- Check that imports use correct paths
- Verify test data matches expected format
- Run `npm test -- --reporter=verbose` for detailed output

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check for syntax errors in JavaScript files
- Verify all imports are correct

## Next Steps

1. Review [data-model.md](./data-model.md) for entity structures
2. Review [contracts/](./contracts/) for API interfaces
3. Review [plan.md](./plan.md) for implementation details
4. Start with User Story 1 (P1): Simulate predefined category route

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [MDN localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

