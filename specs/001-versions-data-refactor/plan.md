# Implementation Plan: Rework Versions Data Structure

**Branch**: `001-versions-data-refactor` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-versions-data-refactor/spec.md`

## Summary

Refactor the version data structure to separate data from code by:
1. Moving version data (buildings, prices, rates, upgrades) to JSON files for easier maintenance
2. Extracting calculation methods (multiplier, grandmaBoost, fingersBoost, etc.) to utility files for reuse
3. Creating version loader modules that combine JSON data with utility functions to produce the same API as current JS modules
4. Maintaining 100% backward compatibility with existing code that imports versions

## Technical Context

**Language/Version**: JavaScript (ES6 modules), Node.js compatible  
**Primary Dependencies**: Vite (build tool), Vitest (testing), no external runtime dependencies for version loading  
**Storage**: JSON files in `src/data/versions/` directory (file-based, no database)  
**Testing**: Vitest with jsdom environment, coverage thresholds: 60% (lines, functions, branches, statements)  
**Target Platform**: Web browser (ES6 modules), Vite dev server and production builds  
**Project Type**: Single web application (frontend-only, no backend)  
**Performance Goals**: Version loading should complete in <50ms, no noticeable impact on route calculation performance  
**Constraints**: Must maintain exact same external API, zero breaking changes to existing imports, JSON files must be loadable via dynamic import  
**Scale/Scope**: 5 version files to convert (v2031, v2048, v10466, v10466_xmas, v2052), ~600+ upgrade definitions total, ~20 building types per version

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check (✅ PASSED)

**Code Quality**: 
- ✅ Refactoring maintains existing code structure and patterns
- ✅ New utility modules will follow existing utils pattern (see `src/js/utils/`)
- ✅ Version loader modules will be documented with JSDoc comments
- ✅ JSON schema validation will ensure data quality
- ✅ All code will pass ESLint checks (existing linting rules apply)

**Testing**: 
- ✅ Unit tests required for version loader functions
- ✅ Integration tests required to verify JSON-based versions produce identical results to JS-based versions
- ✅ Test coverage must maintain or exceed current thresholds (60%)
- ✅ Regression tests will verify backward compatibility (all existing tests must pass)
- ✅ JSON schema validation tests will ensure data integrity

**User Experience**: 
- ✅ N/A - This is an internal refactoring with no user-facing changes
- ✅ No UI changes required, all changes are behind-the-scenes

**Performance**: 
- ✅ Version loading performance must match or exceed current JS module loading (<50ms target)
- ✅ JSON parsing overhead should be negligible (JSON.parse is fast)
- ✅ No performance regressions in route calculation (critical path)
- ✅ Lazy loading of versions via dynamic import maintained

**Quality Gates**: 
- ✅ **Code Quality Gate**: ESLint passing, JSDoc documentation complete
- ✅ **Testing Gate**: All existing tests pass, new tests for version loaders, coverage maintained
- ✅ **Performance Gate**: No measurable performance regression in version loading or route calculation
- ✅ **UX Gate**: N/A (internal refactoring)

### Post-Design Check (✅ PASSED)

**Code Quality**: 
- ✅ Design maintains existing patterns (version loaders follow current module structure)
- ✅ JSON data structure is clear and well-documented in data-model.md
- ✅ Version loader implementation pattern defined in research.md
- ✅ Runtime validation approach ensures data quality without external dependencies
- ✅ All design decisions documented with rationale

**Testing**: 
- ✅ Testing strategy defined: unit tests for loaders/utils, integration tests for compatibility
- ✅ Contract tests specified in version-loading.md
- ✅ Coverage targets maintained (60% threshold)
- ✅ Regression testing approach: compare JSON vs JS versions for identical results

**User Experience**: 
- ✅ No user-facing changes (internal refactoring only)
- ✅ Backward compatibility maintained (existing imports work unchanged)

**Performance**: 
- ✅ Performance targets maintained (<50ms version loading)
- ✅ Static JSON imports (Vite) are fast, no async overhead
- ✅ No changes to route calculation path (performance preserved)

**Quality Gates**: 
- ✅ **Code Quality Gate**: Design includes validation and error handling
- ✅ **Testing Gate**: Comprehensive test strategy defined (unit, integration, contract, regression)
- ✅ **Performance Gate**: Design maintains performance targets, static imports are fast
- ✅ **UX Gate**: N/A (internal refactoring)

## Project Structure

### Documentation (this feature)

```text
specs/001-versions-data-refactor/
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
├── data/
│   └── versions/
│       ├── v2031.json          # NEW: JSON version data
│       ├── v2048.json          # NEW: JSON version data
│       ├── v10466.json         # NEW: JSON version data
│       ├── v10466_xmas.json    # NEW: JSON version data
│       ├── v2052.json          # NEW: JSON version data
│       ├── v2031.js            # NEW: Version loader (replaces old v2031.js)
│       ├── v2048.js            # NEW: Version loader (replaces old v2048.js)
│       ├── v10466.js           # NEW: Version loader (replaces old v10466.js)
│       ├── v10466_xmas.js      # NEW: Version loader (replaces old v10466_xmas.js)
│       └── v2052.js            # NEW: Version loader (replaces old v2052.js)
├── js/
│   └── utils/
│       └── upgrade-effects.js  # NEW: Calculation methods (multiplier, grandmaBoost, etc.)
└── ...

tests/
├── unit/
│   ├── version-loader.test.js      # NEW: Tests for version loaders
│   ├── upgrade-effects.test.js     # NEW: Tests for calculation methods
│   └── version-json.test.js        # NEW: Tests for JSON schema validation
└── integration/
    └── version-compatibility.test.js  # NEW: Tests comparing JSON vs JS versions
```

**Structure Decision**: 
- Version data stored as JSON files in `src/data/versions/` (same location as current JS files)
- Version loader modules (`.js`) in same directory, maintain same filenames for backward compatibility
- Calculation utilities in `src/js/utils/upgrade-effects.js` following existing utils pattern
- Tests mirror source structure in `tests/unit/` and `tests/integration/`

## Complexity Tracking

> **No violations** - This refactoring maintains existing structure and patterns, only reorganizing code and data separation.
