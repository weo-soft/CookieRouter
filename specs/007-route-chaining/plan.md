# Implementation Plan: Route Chaining

**Branch**: `007-route-chaining` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-route-chaining/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend the route creation wizard to support selecting and calculating multiple routes in sequence (route chains). Each route in the chain uses buildings and upgrades purchased in all previous routes as its starting state. The system will calculate routes sequentially, accumulate building/upgrade state across routes, display the complete chain with navigation between routes, and support saving route chains with independent progress tracking for each route in the chain.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: Vite (build tool), existing project dependencies (no new external libraries required)  
**Storage**: Browser localStorage API (extending existing storage utilities), in-memory chain calculation state during process  
**Testing**: Vitest (Vite's testing framework) for unit and integration tests  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with ES6+ and localStorage support  
**Project Type**: web (single-page application - extension of existing feature)  
**Performance Goals**: Route chain creation in under 2 minutes for 2-5 routes (per SC-001), chain calculation with 3 routes in under 5 minutes (per SC-002), route navigation in under 1 second (per SC-004)  
**Constraints**: No backend/server required, must work offline, must integrate with existing route creation wizard, category selection, and route calculation systems, must support mixing category-based and achievement-based routes in chains, must handle calculation errors gracefully  
**Scale/Scope**: Single-user application, route chains typically contain 2-5 routes but should support longer chains (10+ routes), integrates with existing save game import, category selection, achievement routing, and route calculation systems

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**: 
- ✅ ESLint configured for JavaScript with standard rules (existing)
- ✅ Code documentation required for all functions/classes
- ✅ Complexity limits enforced (cyclomatic complexity < 10 per function)
- ✅ Code review required before merge

**Testing**: 
- ✅ Unit tests required for chain state management and building accumulation logic
- ✅ Unit tests for chain calculation sequencing and error handling
- ✅ Integration tests for complete route chain workflow (selection, calculation, display, saving)
- ✅ Integration tests for progress tracking across routes in a chain
- ✅ Coverage target: 80% for core chain logic, 60% overall

**User Experience**: 
- ✅ Responsive design for mobile and desktop (consistent with existing UI)
- ✅ WCAG 2.1 Level AA accessibility (keyboard navigation, screen reader support, focus management)
- ✅ Clear visual separation between routes in a chain
- ✅ Clear progress indicators during chain calculation
- ✅ Clear navigation between routes in displayed chain
- ✅ Consistent UI patterns with existing route display and wizard components

**Performance**: 
- ✅ Route chain creation (selection) must complete within 2 minutes for 2-5 routes (per SC-001)
- ✅ Chain calculation progress updates must be non-blocking
- ✅ Route navigation in chain must complete within 1 second (per SC-004)
- ✅ Chain calculation must complete within 5 minutes for 3 routes (per SC-002)
- ✅ No performance degradation when displaying long chains (10+ routes)

**Quality Gates**: 
- ✅ Code Quality Gate: ESLint passes, code review approved
- ✅ Testing Gate: All tests pass, coverage thresholds met
- ✅ Performance Gate: Chain creation < 2 min, calculation < 5 min for 3 routes, navigation < 1s
- ✅ UX Gate: Accessibility audit, responsive design verified, chain navigation clear

## Project Structure

### Documentation (this feature)

```text
specs/007-route-chaining/
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
│   ├── ui/
│   │   ├── route-creation-wizard.js    # Extend: Add route chain selection step
│   │   ├── wizard-route-chain-selection.js # New: Step for selecting multiple routes for chaining
│   │   ├── route-chain-display.js      # New: Display component for route chains
│   │   ├── route-chain-navigation.js   # New: Navigation component for switching between routes in chain
│   │   └── ... (existing components)
│   ├── simulation.js                   # Extend: Add chain calculation function
│   ├── storage.js                      # Extend: Add route chain storage functions
│   └── ... (existing files)
├── styles/
│   └── main.css         # Extend: Styles for route chain interface
└── ... (existing files)

tests/
├── unit/
│   ├── route-chain.test.js             # New: Test chain state management
│   ├── chain-calculation.test.js       # New: Test building accumulation logic
│   └── ... (existing tests)
└── integration/
    ├── route-chain-workflow.test.js    # New: Test complete chain workflow
    └── ... (existing tests)
```

**Structure Decision**: Single web application structure. Extends existing route creation wizard, simulation, storage, and UI components. New components for chain-specific functionality (selection, display, navigation) are added to the existing UI structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

