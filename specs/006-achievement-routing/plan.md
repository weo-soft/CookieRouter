# Implementation Plan: Achievement-Based Route Calculation

**Branch**: `006-achievement-routing` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-achievement-routing/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend the existing Cookie Clicker route calculation system to support achievement-based routing. Users can select one or more routeable achievements as route goals, and the system calculates optimal building purchase sequences to meet those achievement requirements. The implementation leverages existing achievement data (`achievements.json`) and requirement mappings (`achievement-requirements.js`) to integrate seamlessly with the current route calculation infrastructure.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: Existing codebase (Vite, Vitest), achievement data files (`src/data/achievements.json`, `src/data/achievement-requirements.js`)  
**Storage**: Browser localStorage API (extends existing route storage)  
**Testing**: Vitest for unit tests, integration tests for achievement routing workflows  
**Target Platform**: Modern web browsers (same as existing application)  
**Project Type**: web (single-page application extension)  
**Performance Goals**: Single achievement routes complete within 2x time of cookie-based routes (per SC-002), multiple achievement routes (up to 5) complete within 3x time of single achievement routes (per SC-003)  
**Constraints**: Must integrate with existing route calculation system without breaking changes, must handle 200+ achievements efficiently, must support all routeable achievement types (buildingCount, cps, totalCookies, upgradeCount, totalBuildings, minBuildings, buildingLevel)  
**Scale/Scope**: Extends existing single-user application, supports 1-5 achievements per route, handles 200+ total achievements with filtering/search

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**: 
- ✅ ESLint configured (existing)
- ✅ Code documentation required for all new functions/classes
- ✅ Complexity limits enforced (cyclomatic complexity < 10 per function)
- ✅ Code review required before merge
- ✅ New code must follow existing code style patterns

**Testing**: 
- ✅ Unit tests required for achievement requirement parsing and validation
- ✅ Unit tests for achievement goal checking logic in Router
- ✅ Integration tests for achievement route calculation workflows
- ✅ Coverage target: 80% for new achievement routing code, maintain existing coverage levels
- ✅ Tests must verify achievement routes meet all selected achievement requirements

**User Experience**: 
- ✅ Responsive design (extends existing UI)
- ✅ WCAG 2.1 Level AA accessibility (keyboard navigation, screen reader support)
- ✅ Clear error messages for non-routeable achievements
- ✅ Loading indicators during achievement route calculation
- ✅ Consistent UI patterns with existing route creation wizard
- ✅ Search and filter UI must be intuitive and performant

**Performance**: 
- ✅ Single achievement routes must complete within 2x time of cookie-based routes (per SC-002)
- ✅ Multiple achievement routes (up to 5) must complete within 3x time of single achievement routes (per SC-003)
- ✅ Achievement list filtering/search must be responsive (< 100ms for 200+ achievements)
- ✅ UI must remain responsive during calculations (use existing async patterns)

**Quality Gates**: 
- ✅ Code Quality Gate: ESLint passes, code review approved
- ✅ Testing Gate: All tests pass, coverage thresholds met
- ✅ Performance Gate: Achievement routes meet performance targets, no UI blocking
- ✅ UX Gate: Accessibility audit, responsive design verified, search/filter usability tested

## Project Structure

### Documentation (this feature)

```text
specs/006-achievement-routing/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── achievement-routing.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root - additions/modifications)

```text
src/
├── data/
│   ├── achievements.json              # Existing - achievement metadata
│   └── achievement-requirements.js    # Existing - requirement mappings
├── js/
│   ├── game.js                        # MODIFY - add achievement goal tracking
│   ├── router.js                      # MODIFY - add achievement goal checking
│   ├── simulation.js                  # MODIFY - add achievement route calculation
│   ├── ui/
│   │   ├── route-creation-wizard.js   # MODIFY - add achievement selection step
│   │   ├── wizard-achievement-selection.js  # NEW - achievement selection UI
│   │   └── route-display.js           # MODIFY - show achievement completion markers
│   └── utils/
│       └── achievement-utils.js       # NEW - achievement filtering/search utilities
└── styles/
    └── main.css                       # MODIFY - styles for achievement selection UI

tests/
├── unit/
│   ├── achievement-utils.test.js      # NEW - test achievement utilities
│   ├── game.test.js                   # MODIFY - test achievement goal tracking
│   └── router.test.js                 # MODIFY - test achievement goal checking
└── integration/
    └── achievement-routing.test.js    # NEW - test achievement route workflows
```

**Structure Decision**: Extend existing codebase with minimal changes. New achievement selection UI component follows existing wizard pattern. Achievement utilities module provides reusable filtering/search functionality. Game and Router classes extended to support achievement goals while maintaining backward compatibility with cookie-based routes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. The architecture extends existing patterns with clear separation of concerns. Achievement routing reuses existing route calculation infrastructure, minimizing complexity.



