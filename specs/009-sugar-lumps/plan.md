# Implementation Plan: Sugar Lumps Building Upgrades

**Branch**: `009-sugar-lumps` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-sugar-lumps/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add Sugar Lump mechanics to the Cookie Clicker route calculator. Sugar Lumps are time-gated resources that unlock at 1 billion cookies produced and harvest every 24 hours. They can be used to upgrade buildings, providing +1% Building CpS per level. The route calculation system must simulate Sugar Lump harvesting, track availability, optimize upgrade spending, and display harvest/upgrade events in routes.

## Technical Context

**Language/Version**: JavaScript (ES6 modules), Node.js compatible  
**Primary Dependencies**: Vite (build tool), Vitest (testing), no external runtime dependencies  
**Storage**: Browser localStorage (via existing storage.js), in-memory during route calculation  
**Testing**: Vitest with jsdom for DOM testing  
**Target Platform**: Modern web browsers (ES6+), static site deployment  
**Project Type**: Single-page web application  
**Performance Goals**: Route calculations complete within 5 seconds for typical categories, Sugar Lump simulation adds <10% overhead  
**Constraints**: Must maintain backward compatibility with existing routes, Sugar Lump calculations must be deterministic  
**Scale/Scope**: Routes with 100-1000 building purchase steps, Sugar Lump harvesting over days/weeks of simulated time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**: Feature design aligns with code quality standards
- Sugar Lump logic will be added to existing Game class with clear documentation
- New methods will follow existing code patterns and naming conventions
- Code will pass ESLint checks and maintain complexity thresholds

**Testing**: Testing strategy defined
- Unit tests for Sugar Lump harvesting logic (unlock condition, timing)
- Unit tests for building level upgrade cost calculation and CpS bonuses
- Integration tests for route calculation with Sugar Lump upgrades
- Test coverage target: 80%+ for new Sugar Lump code paths

**User Experience**: UX consistency validated
- Sugar Lump harvest events displayed consistently with existing route step format
- Building level upgrades shown with clear visual indicators
- Route display maintains existing UI patterns and accessibility

**Performance**: Performance targets established
- Sugar Lump simulation adds minimal overhead (<10% to route calculation time)
- Time-based harvesting uses efficient calculations (no per-step iteration)
- Route display rendering performance maintained

**Quality Gates**: Gates identified
- Code Quality Gate: ESLint passing, code review approval
- Testing Gate: All tests passing, 80%+ coverage for Sugar Lump code
- Performance Gate: Route calculation time increase <10% for routes reaching 1B cookies
- UX Gate: Route display shows Sugar Lump events clearly and consistently

## Project Structure

### Documentation (this feature)

```text
specs/009-sugar-lumps/
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
│   ├── game.js              # Add Sugar Lump tracking and building level state
│   ├── router.js            # Add Sugar Lump upgrade as child state option
│   ├── simulation.js        # Ensure Sugar Lump state preserved in route conversion
│   └── ui/
│       └── route-display.js # Display Sugar Lump harvest and upgrade events

tests/
├── unit/
│   ├── game-sugar-lumps.test.js      # Sugar Lump harvesting tests
│   ├── game-building-levels.test.js  # Building level upgrade tests
│   └── router-sugar-lumps.test.js    # Route optimization with Sugar Lumps
└── integration/
    └── route-sugar-lumps.test.js     # End-to-end route calculation with Sugar Lumps
```

**Structure Decision**: Single-page web application structure maintained. Sugar Lump functionality extends existing Game class and route calculation system. No new major components required - extends existing patterns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

