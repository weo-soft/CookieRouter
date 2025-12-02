# Implementation Plan: Rework Page Structure for Route Wizard Workflow

**Branch**: `005-rework-page-structure` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-rework-page-structure/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Rework the main page structure to accommodate a wizard-centric workflow. The application will detect whether users have saved routes on page load and present different interfaces accordingly: first-time users (no saved routes) will be prompted to start the wizard, while returning users (with saved routes) will see a choice between loading existing routes or creating new ones via the wizard. Category selection, custom category creation, and starting buildings setup components will be removed from the main page and only available within the wizard workflow.

## Technical Context

**Language/Version**: JavaScript (ES6 modules)  
**Primary Dependencies**: Vite 5.0+, native DOM APIs, localStorage API  
**Storage**: localStorage (existing `cookieRouter:savedRoutes` key via `getSavedRoutes()` function)  
**Testing**: Vitest 1.0+ with jsdom for DOM testing  
**Target Platform**: Modern web browsers (ES6+ support)  
**Project Type**: Single-page web application  
**Performance Goals**: Page load detection and UI rendering within 2 seconds (per SC-001, SC-002)  
**Constraints**: Must gracefully handle localStorage errors, maintain backward compatibility with existing saved routes, no breaking changes to wizard functionality  
**Scale/Scope**: Single-page application, localStorage-based persistence, no server-side requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**: ✅ Feature design aligns with code quality standards
- Changes are localized to main.js initialization and HTML structure
- Existing component classes remain unchanged (only instantiation changes)
- No new dependencies required
- Code follows existing ES6 module patterns

**Testing**: ✅ Testing strategy defined
- Unit tests needed for page state detection logic (saved routes check)
- Integration tests needed for page structure rendering based on state
- E2E tests needed for user flows (first-time vs returning user)
- Coverage target: 80%+ for new code paths

**User Experience**: ✅ UX consistency validated
- Follows existing wizard modal pattern
- Maintains existing design system (buttons, modals, layouts)
- Accessibility: Maintains existing ARIA labels and keyboard navigation
- Responsive design: No changes to responsive behavior

**Performance**: ✅ Performance targets established
- Page load detection: < 100ms (localStorage read is synchronous)
- UI rendering: < 2 seconds total (per success criteria)
- No new async operations or network calls
- localStorage read is already optimized in existing code

**Quality Gates**: All gates apply
1. **Code Quality Gate**: ESLint must pass, code review required
2. **Testing Gate**: Unit + integration tests must pass, 80%+ coverage for new code
3. **Performance Gate**: Page load detection must complete within 2 seconds
4. **UX Gate**: Design review for first-time vs returning user flows

## Project Structure

### Documentation (this feature)

```text
specs/005-rework-page-structure/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/            # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── index.html           # Main HTML structure (remove unused section divs)
├── main.js              # Application initialization (add page state detection)
├── js/
│   ├── ui/
│   │   ├── route-creation-wizard.js    # Existing (no changes)
│   │   ├── saved-routes-list.js        # Existing (no changes)
│   │   ├── route-display.js            # Existing (no changes)
│   │   ├── category-selector.js        # Existing (only used in wizard)
│   │   ├── custom-category-form.js     # Existing (only used in wizard)
│   │   └── starting-buildings.js        # Existing (only used in wizard)
│   └── storage.js                      # Existing (uses getSavedRoutes())
└── styles/
    └── main.css                         # Existing (may need styles for new page states)

tests/
├── integration/
│   └── page-structure-workflow.test.js # New: Test first-time vs returning user flows
└── unit/
    └── page-state-detection.test.js     # New: Test saved routes detection logic
```

**Structure Decision**: Single-page web application structure. Changes are localized to:
1. `src/index.html` - Remove unused section containers
2. `src/main.js` - Add page state detection and conditional component initialization
3. New test files for page state logic and workflows

## Complexity Tracking

> **No violations identified - all changes are straightforward refactoring within existing architecture**







