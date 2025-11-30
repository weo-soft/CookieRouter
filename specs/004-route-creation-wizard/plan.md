# Implementation Plan: Route Creation Wizard

**Branch**: `004-route-creation-wizard` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-route-creation-wizard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a multistep wizard interface that guides users through the process of creating and calculating a route. The wizard consolidates existing functionality (save game import, starting buildings configuration, category selection) into a guided flow with three main steps: (1) Initial Setup (import save/manual setup/fresh start), (2) Category Selection (predefined or custom with adjustments), and (3) Route Calculation & Summary. The wizard provides navigation controls, input validation, error handling, and automatically saves the calculated route upon completion.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: Vite (build tool), existing project dependencies (no new external libraries required)  
**Storage**: Browser localStorage API (extending existing storage utilities), in-memory wizard state during process  
**Testing**: Vitest (Vite's testing framework) for unit and integration tests  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with ES6+ and localStorage support  
**Project Type**: web (single-page application - extension of existing feature)  
**Performance Goals**: Wizard completion in under 2 minutes for predefined categories (per SC-001), error messages displayed within 1 second (per SC-005), save game import processed within 3 seconds (per SC-006)  
**Constraints**: No backend/server required, must work offline, must integrate with existing UI components and patterns, wizard state stored in memory (not persisted until route is saved), must support backward/forward navigation with state preservation  
**Scale/Scope**: Single-user application, wizard handles one route creation at a time, integrates with existing save game import, category selection, and route calculation systems

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**: 
- ✅ ESLint configured for JavaScript with standard rules (existing)
- ✅ Code documentation required for all functions/classes
- ✅ Complexity limits enforced (cyclomatic complexity < 10 per function)
- ✅ Code review required before merge

**Testing**: 
- ✅ Unit tests required for wizard state management
- ✅ Unit tests for wizard navigation and validation logic
- ✅ Integration tests for complete wizard workflow (all steps)
- ✅ Integration tests for error handling and edge cases
- ✅ Coverage target: 80% for core wizard logic, 60% overall

**User Experience**: 
- ✅ Responsive design for mobile and desktop (consistent with existing UI)
- ✅ WCAG 2.1 Level AA accessibility (keyboard navigation, screen reader support, focus management)
- ✅ Clear step indicators and progress visualization
- ✅ Clear error messages with actionable guidance
- ✅ Loading indicators during route calculation
- ✅ Consistent UI patterns with existing dialogs and forms

**Performance**: 
- ✅ Wizard step transitions must complete within 100ms
- ✅ Error messages displayed within 1 second of invalid input (per SC-005)
- ✅ Save game import processed within 3 seconds (per SC-006)
- ✅ Wizard state management must be non-blocking
- ✅ No performance degradation when navigating between steps

**Quality Gates**: 
- ✅ Code Quality Gate: ESLint passes, code review approved
- ✅ Testing Gate: All tests pass, coverage thresholds met
- ✅ Performance Gate: Step transitions < 100ms, error display < 1s, import < 3s
- ✅ UX Gate: Accessibility audit, responsive design verified, step indicators clear

## Project Structure

### Documentation (this feature)

```text
specs/004-route-creation-wizard/
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
│   │   ├── route-creation-wizard.js    # New: Main wizard component orchestrating steps
│   │   ├── wizard-step-indicator.js   # New: Step progress indicator component
│   │   ├── wizard-initial-setup.js    # New: Step 1 - Initial setup (import/manual/fresh)
│   │   ├── wizard-category-selection.js # New: Step 2 - Category selection/configuration
│   │   ├── wizard-summary.js           # New: Step 3 - Summary and calculation
│   │   └── ... (existing components)
│   └── ...
├── styles/
│   └── main.css         # Extend: Styles for wizard interface
└── ...

tests/
├── unit/
│   ├── route-creation-wizard.test.js        # New: Test wizard state management
│   ├── wizard-navigation.test.js            # New: Test navigation logic
│   └── ...
└── integration/
    ├── route-creation-wizard-workflow.test.js # New: Test complete wizard flow
    └── ...
```

**Structure Decision**: Create a new wizard component that orchestrates existing functionality (save game import dialog, starting buildings selector, category selector, custom category form) into a guided multistep flow. The wizard will manage state internally and coordinate with existing components rather than replacing them. This approach maintains backward compatibility and reuses existing, tested components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. The wizard architecture reuses existing components and patterns, adding orchestration logic without introducing significant new complexity.

