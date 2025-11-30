# Implementation Plan: Import Cookie Clicker Save Games

**Branch**: `003-import-save-games` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-import-save-games/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend the existing Cookie Clicker Building Order Simulator to allow users to import their Cookie Clicker save game data. The system will parse base64-encoded save strings, extract relevant game state (building counts, cookies, cookies per second, game version, hardcore mode), automatically populate starting buildings, and allow users to explore the imported data. Imported data will be used automatically for route calculations, streamlining the user workflow.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: Vite (build tool), existing project dependencies, no new external libraries required for base64 decoding (native `atob()` and `decodeURIComponent()` available)  
**Storage**: Browser localStorage API (temporary storage for imported save game state, not persisted across sessions per spec assumptions)  
**Testing**: Vitest (Vite's testing framework) for unit and integration tests  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with ES6+ and localStorage support  
**Project Type**: web (single-page application - extension of existing feature)  
**Performance Goals**: Save game import and parsing completes within 5 seconds (per SC-001), save game data view displays within 2 seconds (per SC-003), invalid data detection within 3 seconds (per SC-007)  
**Constraints**: No backend/server required, must work offline, must handle base64 decoding and URL decoding, must parse Cookie Clicker save format (sections separated by "|", entries by ";", bitfields without separators), must support multiple Cookie Clicker versions (v2031, v2048, v10466, v10466_xmas, v2052, etc.), must handle corrupted/invalid save data gracefully  
**Scale/Scope**: Single-user application, save game strings can be 10KB-100KB in size, must parse and extract building counts for 10-20 building types, must handle save games from various Cookie Clicker versions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**: 
- ✅ ESLint configured for JavaScript with standard rules (existing)
- ✅ Code documentation required for all functions/classes
- ✅ Complexity limits enforced (cyclomatic complexity < 10 per function)
- ✅ Code review required before merge

**Testing**: 
- ✅ Unit tests required for save game parsing logic (base64 decoding, section parsing, data extraction)
- ✅ Unit tests for save game validation and error handling
- ✅ Integration tests for save game import workflow (paste → parse → populate → use in calculation)
- ✅ Coverage target: 80% for core parsing logic, 60% overall

**User Experience**: 
- ✅ Responsive design for mobile and desktop (consistent with existing UI)
- ✅ WCAG 2.1 Level AA accessibility (keyboard navigation, screen reader support)
- ✅ Clear error messages for invalid/corrupted save data
- ✅ Loading indicators during save game parsing
- ✅ Consistent UI patterns with existing import/export features

**Performance**: 
- ✅ Save game import must complete within 5 seconds (per SC-001)
- ✅ Save game data view must display within 2 seconds (per SC-003)
- ✅ Invalid data detection must complete within 3 seconds (per SC-007)
- ✅ Parsing operations must be non-blocking (use async/await)
- ✅ No performance degradation when importing large save games

**Quality Gates**: 
- ✅ Code Quality Gate: ESLint passes, code review approved
- ✅ Testing Gate: All tests pass, coverage thresholds met
- ✅ Performance Gate: Import < 5 seconds, view < 2 seconds, validation < 3 seconds
- ✅ UX Gate: Accessibility audit, responsive design verified, error messages clear

## Project Structure

### Documentation (this feature)

```text
specs/003-import-save-games/
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
│   ├── save-game-parser.js    # New: Parse Cookie Clicker save format
│   ├── save-game-importer.js  # New: Import logic and validation
│   ├── storage.js             # Extend: Add temporary save game state storage
│   ├── ui/
│   │   ├── save-game-import-dialog.js  # New: Import UI component
│   │   ├── save-game-details-view.js   # New: Display imported save data
│   │   ├── starting-buildings.js       # Extend: Auto-populate from imported data
│   │   └── version-selector.js         # Extend: Auto-select version from import
│   └── ...
├── styles/
│   └── main.css         # Extend: Styles for save game import UI
└── ...

tests/
├── unit/
│   ├── save-game-parser.test.js        # New: Test parsing logic
│   ├── save-game-importer.test.js      # New: Test import workflow
│   └── ...
└── integration/
    ├── save-game-import-workflow.test.js # New: Test full import → use workflow
    └── ...
```

**Structure Decision**: Extending existing single-page web application structure. New save game parsing and import logic will be separated into dedicated modules for maintainability. UI components will follow the same patterns as existing dialogs and views. Save game state will be stored temporarily in memory/localStorage but not persisted across sessions (per spec assumptions).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. The architecture extends existing patterns without introducing new complexity. Save game parsing is a well-defined format with clear separation of concerns.

