# Implementation Plan: Update Route from Save Game

**Branch**: `010-update-route-save` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-update-route-save/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend the existing saved routes feature to allow users to update a saved route by importing their current save game data and triggering a recalculation. The route is recalculated using the imported game state as the new starting point, while preserving the route's identity, name, and progress tracking. This enables users to keep routes current with their actual game progress without manually deleting and recreating routes.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: Vite (build tool), existing project dependencies (no new external libraries required)  
**Storage**: Browser localStorage API (extending existing storage utilities)  
**Testing**: Vitest (Vite's testing framework) for unit and integration tests  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with ES6+ and localStorage support  
**Project Type**: web (single-page application - extension of existing features)  
**Performance Goals**: Route update operation completes successfully in under 30 seconds for typical routes (per SC-002), error messages displayed within 3 seconds (per SC-006)  
**Constraints**: No backend/server required, must work offline, localStorage size limits (~5-10MB typical), must preserve route identity and progress during updates, must handle version compatibility between saved routes and imported save games  
**Scale/Scope**: Single-user application, updates apply to individual saved routes, route recalculation uses existing simulation algorithms (GPL/DFS), must handle concurrent update prevention

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**: 
- ✅ ESLint configured for JavaScript with standard rules (existing)
- ✅ Code documentation required for all functions/classes
- ✅ Complexity limits enforced (cyclomatic complexity < 10 per function)
- ✅ Code review required before merge

**Testing**: 
- ✅ Unit tests required for route update operations
- ✅ Unit tests for progress preservation logic
- ✅ Integration tests for route update workflow (import → update → verify)
- ✅ Coverage target: 80% for core update logic, 60% overall

**User Experience**: 
- ✅ Responsive design for mobile and desktop (consistent with existing UI)
- ✅ WCAG 2.1 Level AA accessibility (keyboard navigation, screen reader support)
- ✅ Clear error messages for invalid save games, version mismatches, calculation failures
- ✅ Progress indicators during route recalculation
- ✅ Consistent UI patterns with existing save game import and route display

**Performance**: 
- ✅ Route update operation must complete within 30 seconds (per SC-002)
- ✅ Error messages must be displayed within 3 seconds (per SC-006)
- ✅ UI must remain responsive during recalculation (use existing progress callbacks)
- ✅ No performance degradation when updating routes

**Quality Gates**: 
- ✅ Code Quality Gate: ESLint passes, code review approved
- ✅ Testing Gate: All tests pass, coverage thresholds met
- ✅ Performance Gate: Update < 30 seconds, error messages < 3 seconds
- ✅ UX Gate: Accessibility audit, responsive design verified

## Project Structure

### Documentation (this feature)

```text
specs/010-update-route-save/
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
├── js/
│   ├── storage.js       # Extend: Add updateSavedRoute function
│   ├── simulation.js    # Extend: Reuse calculateRoute for updates
│   ├── save-game-importer.js  # Existing: Import functionality
│   ├── ui/
│   │   ├── route-display.js        # Extend: Add "Update Route" button/option
│   │   ├── save-game-import-dialog.js  # Extend: Add update trigger option
│   │   └── saved-routes-list.js    # Extend: Show update status/actions
│   └── utils/
│       └── route-update.js         # New: Route update logic and progress preservation
├── styles/
│   └── main.css         # Extend: Styles for update UI elements
└── ...

tests/
├── unit/
│   ├── route-update.test.js        # New: Test route update operations
│   ├── progress-preservation.test.js # New: Test progress preservation logic
│   └── ...
└── integration/
    ├── route-update-workflow.test.js # New: Test update workflow
    └── ...
```

**Structure Decision**: Extending existing single-page web application structure. Route update functionality will reuse existing `calculateRoute` function from `simulation.js` and extend `storage.js` with update operations. New utility module `route-update.js` will handle update-specific logic including progress preservation. UI components will be extended to add update triggers and status indicators.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. The architecture extends existing patterns without introducing new complexity. Route updates reuse existing calculation infrastructure, and progress preservation logic is straightforward (map old step indices to new step indices where possible).

