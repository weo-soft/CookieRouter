# Implementation Plan: Cookie Clicker Building Order Simulator

**Branch**: `001-cookie-clicker-simulator` | **Date**: 2025-11-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cookie-clicker-simulator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a static single-page web application that simulates and calculates optimal building purchase orders for Cookie Clicker. The application converts existing Python simulation code to JavaScript, runs entirely client-side using Vite, and uses localStorage for data persistence. Users can select predefined categories, create custom categories, simulate routes with optional starting buildings, and track progress through routes with checkboxes.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: Vite (build tool), minimal external libraries (TBD during research)  
**Storage**: Browser localStorage API for categories, routes, and progress tracking  
**Testing**: Vitest (Vite's testing framework) for unit tests, manual testing for UI interactions  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with ES6+ and localStorage support  
**Project Type**: web (single-page application)  
**Performance Goals**: Route calculation completes in under 5 seconds for typical categories (per SC-001), UI remains responsive during calculations  
**Constraints**: No backend/server required, must work offline after initial load, localStorage size limits (~5-10MB typical), must handle routes with 50+ buildings (per SC-002)  
**Scale/Scope**: Single-user application, routes typically contain 20-200 building purchases, support for 10+ predefined categories plus unlimited user-created categories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**: 
- ✅ ESLint configured for JavaScript with standard rules
- ✅ Code documentation required for all functions/classes
- ✅ Complexity limits enforced (cyclomatic complexity < 10 per function)
- ✅ Code review required before merge

**Testing**: 
- ✅ Unit tests required for simulation logic (Game, Router classes)
- ✅ Unit tests for localStorage operations
- ✅ Manual testing checklist for UI interactions
- ✅ Coverage target: 80% for core simulation logic, 60% overall

**User Experience**: 
- ✅ Responsive design for mobile and desktop
- ✅ WCAG 2.1 Level AA accessibility (keyboard navigation, screen reader support)
- ✅ Clear error messages for invalid inputs
- ✅ Loading indicators during route calculation
- ✅ Consistent UI patterns across all features

**Performance**: 
- ✅ Route calculation must complete within 5 seconds (per SC-001)
- ✅ UI must remain responsive during calculations (use Web Workers if needed)
- ✅ localStorage operations must be non-blocking
- ✅ Initial page load under 2 seconds

**Quality Gates**: 
- ✅ Code Quality Gate: ESLint passes, code review approved
- ✅ Testing Gate: All tests pass, coverage thresholds met
- ✅ Performance Gate: Route calculation < 5 seconds, no UI blocking
- ✅ UX Gate: Accessibility audit, responsive design verified

## Project Structure

### Documentation (this feature)

```text
specs/001-cookie-clicker-simulator/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── index.html           # Main HTML entry point
├── main.js              # Application entry point
├── styles/
│   └── main.css        # Main stylesheet
├── js/
│   ├── game.js         # Game simulation engine (ported from Python)
│   ├── router.js       # Routing algorithms (ported from Python)
│   ├── categories.js   # Category definitions (ported from Python)
│   ├── storage.js      # localStorage wrapper/utilities
│   ├── ui/
│   │   ├── category-selector.js    # Category selection UI
│   │   ├── route-display.js        # Route display with checkboxes
│   │   ├── custom-category-form.js # Custom category creation
│   │   └── starting-buildings.js   # Starting buildings selector
│   └── utils/
│       └── format.js   # Number formatting utilities
├── data/
│   └── versions/        # Game version data (ported from Python)
│       ├── v2031.js
│       ├── v2048.js
│       ├── v10466.js
│       └── v10466_xmas.js
└── assets/             # Static assets (if any)

tests/
├── unit/
│   ├── game.test.js
│   ├── router.test.js
│   ├── categories.test.js
│   └── storage.test.js
└── integration/
    └── simulation.test.js

public/                 # Static files served by Vite
├── favicon.ico
└── (other static assets)

vite.config.js         # Vite configuration
package.json           # Dependencies and scripts
eslint.config.js       # ESLint configuration
vitest.config.js       # Vitest configuration
```

**Structure Decision**: Single-page web application structure. All simulation logic runs client-side. Python code from `simulator-script/` will be ported to JavaScript modules in `src/js/`. UI components are organized in `src/js/ui/` for maintainability. Game version data is separated into `src/data/versions/` for easy updates.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. The architecture follows standard web application patterns with clear separation of concerns.
