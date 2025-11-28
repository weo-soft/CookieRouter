# Research: Cookie Clicker Building Order Simulator

**Date**: 2025-11-23  
**Feature**: [spec.md](./spec.md)

## Research Questions

### 1. Python to JavaScript Conversion Strategy

**Question**: How to port Python simulation code to JavaScript while maintaining algorithm correctness?

**Decision**: Port Python classes directly to JavaScript ES6 classes with equivalent logic. Use JavaScript's native features (classes, modules, async/await) instead of Python-specific constructs.

**Rationale**: 
- Python code uses standard OOP patterns that map directly to JavaScript classes
- No external Python dependencies (uses only standard library)
- Game logic is deterministic and mathematical, making port straightforward
- JavaScript's number handling is sufficient for Cookie Clicker calculations

**Alternatives Considered**:
- Transpiling Python with Pyodide: Adds significant bundle size and complexity
- Rewriting from scratch: Unnecessary given existing working code
- Using WebAssembly: Overkill for this use case, adds compilation complexity

**Implementation Notes**:
- Convert Python dicts to JavaScript Maps or plain objects
- Convert Python lists to JavaScript arrays
- Use JavaScript's `Math` object for mathematical operations
- Handle floating-point precision carefully (use appropriate precision for cookie calculations)

### 2. Vite Configuration and Build Setup

**Question**: What Vite configuration is needed for a minimal vanilla JS application?

**Decision**: Use Vite with default configuration, minimal plugins. Use ES modules for code organization.

**Rationale**:
- Vite's default setup is sufficient for vanilla JS projects
- ES modules provide clean code organization without build complexity
- Hot module replacement improves development experience
- No need for JSX/TypeScript/other transpilation

**Alternatives Considered**:
- Webpack: More complex configuration, slower dev server
- Parcel: Less popular, fewer resources
- No build tool: Loses benefits of modern development workflow

**Implementation Notes**:
- Configure Vite to serve from `src/` directory
- Use Vite's asset handling for static files
- Enable source maps for debugging
- Configure build output for production

### 3. localStorage Data Structure and Management

**Question**: How to structure and manage localStorage data for categories, routes, and progress?

**Decision**: Use namespaced keys with JSON serialization. Implement wrapper utilities for type safety and error handling.

**Rationale**:
- localStorage is synchronous and simple to use
- JSON serialization handles complex objects
- Namespacing prevents key collisions
- Wrapper utilities provide error handling and validation

**Alternatives Considered**:
- IndexedDB: Overkill for this use case, adds complexity
- SessionStorage: Doesn't persist across sessions (violates requirements)
- External storage service: Requires backend (violates requirements)

**Implementation Notes**:
- Use keys like `cookieRouter:categories`, `cookieRouter:routes`, `cookieRouter:progress`
- Implement versioning for data migration if schema changes
- Handle localStorage quota exceeded errors gracefully
- Validate data on read to handle corruption

### 4. Performance Optimization for Route Calculation

**Question**: How to ensure route calculations complete in under 5 seconds without blocking UI?

**Decision**: Use Web Workers for route calculation if needed, otherwise use async/await with progress callbacks. Optimize algorithm implementation.

**Rationale**:
- Web Workers prevent UI blocking for long calculations
- Progress callbacks provide user feedback
- Algorithm optimization may eliminate need for workers
- Modern browsers have good Web Worker support

**Alternatives Considered**:
- Synchronous calculation: Blocks UI, poor user experience
- Server-side calculation: Requires backend (violates requirements)
- Incremental calculation: Adds complexity, may not be necessary

**Implementation Notes**:
- Profile route calculation performance first
- Implement Web Workers only if calculation exceeds 1-2 seconds
- Use `requestAnimationFrame` or `setTimeout` for progress updates
- Consider memoization for repeated calculations

### 5. Testing Strategy for Client-Side Simulation

**Question**: How to test simulation logic that runs entirely in the browser?

**Decision**: Use Vitest for unit tests of core logic (Game, Router classes). Use manual testing and browser DevTools for UI testing.

**Rationale**:
- Vitest integrates well with Vite
- Unit tests can verify algorithm correctness
- UI testing can be manual given the interactive nature
- Browser DevTools provide debugging capabilities

**Alternatives Considered**:
- Playwright/Cypress: Adds complexity, may be overkill for MVP
- Jest: Less integrated with Vite
- No automated testing: Violates constitution testing requirements

**Implementation Notes**:
- Write unit tests for Game class methods (rate calculation, building purchase, etc.)
- Write unit tests for Router algorithms (GPL, DFS)
- Test localStorage operations with mocks
- Create test fixtures from known game states

### 6. Accessibility and Responsive Design Approach

**Question**: How to ensure WCAG 2.1 Level AA compliance with vanilla HTML/CSS/JS?

**Decision**: Use semantic HTML, ARIA attributes where needed, keyboard navigation, and responsive CSS with mobile-first approach.

**Rationale**:
- Semantic HTML provides baseline accessibility
- ARIA attributes enhance screen reader support
- Keyboard navigation is standard web practice
- Mobile-first responsive design ensures usability on all devices

**Alternatives Considered**:
- Accessibility framework: Adds dependencies (violates minimal libraries requirement)
- Desktop-only design: Violates responsive design requirement
- Minimal accessibility: Violates constitution UX requirements

**Implementation Notes**:
- Use proper heading hierarchy (h1, h2, h3)
- Ensure all interactive elements are keyboard accessible
- Provide alt text for images/icons
- Use sufficient color contrast (4.5:1 for text)
- Test with screen readers (NVDA, JAWS, VoiceOver)

### 7. Number Formatting and Display

**Question**: How to format large cookie numbers (millions, billions, etc.) for display?

**Decision**: Implement custom formatting utility that converts numbers to scientific notation or abbreviated format (1.5M, 2.3B, etc.).

**Rationale**:
- Cookie Clicker uses very large numbers
- Scientific notation or abbreviations improve readability
- Custom utility avoids external library dependency
- Can match Cookie Clicker's own formatting style

**Alternatives Considered**:
- External library (numeral.js): Adds dependency (violates minimal libraries)
- Plain numbers: Poor readability for large values
- Full scientific notation: Less user-friendly than abbreviations

**Implementation Notes**:
- Format: 1,000,000 → "1.00M", 1,000,000,000 → "1.00B"
- Support up to at least 1 trillion (1T) for typical routes
- Use consistent decimal places (2 decimal places)
- Handle edge cases (0, negative numbers, NaN)

## Technology Decisions Summary

| Technology | Choice | Rationale |
|------------|--------|-----------|
| Build Tool | Vite | Fast dev server, minimal config, good for vanilla JS |
| Testing | Vitest | Integrated with Vite, fast, good ES module support |
| Storage | localStorage | Simple, sufficient for use case, no backend needed |
| Code Organization | ES Modules | Native, no transpilation needed, clean imports |
| Performance | Web Workers (if needed) | Prevents UI blocking for long calculations |
| Formatting | Custom utility | Avoids external dependencies |

## Open Questions Resolved

All technical questions have been resolved. The approach uses minimal dependencies, maintains algorithm correctness, and meets all performance and accessibility requirements.

