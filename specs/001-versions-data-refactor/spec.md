# Feature Specification: Rework Versions Data Structure

**Feature Branch**: `001-versions-data-refactor`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "rework the versions data structure. For better maintainability the actual version Data should be stored in json files, for easier future updates, where as the methods that are currently used to eg calculate the effect of upgrades etc. should be moved in appropriate utils files"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintain Version Data in JSON Format (Priority: P1)

As a developer maintaining version data, I want version data stored in JSON files so that I can easily update building names, prices, rates, and upgrade definitions without modifying JavaScript code.

**Why this priority**: This is the core refactoring goal - separating data from code to improve maintainability. Without this, the feature cannot deliver its primary value.

**Independent Test**: Can be fully tested by creating a JSON file for a version, loading it, and verifying that all building and upgrade data is correctly parsed and available to the game simulation system.

**Acceptance Scenarios**:

1. **Given** a version JSON file exists with building names, base prices, and base rates, **When** the system loads the version, **Then** all building data is correctly available for game simulation
2. **Given** a version JSON file exists with upgrade definitions, **When** the system loads the version, **Then** all upgrades are correctly parsed and available in the upgrade menu
3. **Given** an existing version JavaScript file, **When** it is converted to JSON format, **Then** the game simulation produces identical results to the original JavaScript version

---

### User Story 2 - Extract Calculation Methods to Utils (Priority: P1)

As a developer, I want upgrade effect calculation methods (like multiplier, grandmaBoost, fingersBoost) moved to utility files so that they can be reused across versions and maintained independently from version data.

**Why this priority**: This separation of concerns is essential for the refactoring. Calculation logic should be reusable and not duplicated in each version file.

**Independent Test**: Can be fully tested by moving calculation methods to a utils file, importing them in version loaders, and verifying that upgrade effects are calculated identically to the original implementation.

**Acceptance Scenarios**:

1. **Given** calculation methods are moved to a utils file, **When** a version loader imports and uses these methods, **Then** upgrade effects are calculated correctly
2. **Given** multiple version files need the same calculation method, **When** they import from the utils file, **Then** they share the same implementation without code duplication
3. **Given** an upgrade uses a calculation method from utils, **When** the upgrade effect is applied during simulation, **Then** the effect calculation produces the same result as before the refactoring

---

### User Story 3 - Maintain Backward Compatibility (Priority: P2)

As a user of the application, I want the refactored version system to work exactly like before so that my existing routes, categories, and save game imports continue to function without any changes.

**Why this priority**: This ensures the refactoring doesn't break existing functionality. While not the primary goal, it's critical for a successful refactoring.

**Independent Test**: Can be fully tested by running existing test cases, importing save games, and calculating routes with the refactored version system, verifying identical results to the original implementation.

**Acceptance Scenarios**:

1. **Given** an existing route calculation using a version, **When** the version is loaded from JSON instead of JavaScript, **Then** the calculated route is identical
2. **Given** a save game import that references a version, **When** the version data is loaded from JSON, **Then** the save game is parsed and imported correctly
3. **Given** a category configuration that specifies a version, **When** the version is loaded from the new structure, **Then** the category functions correctly

---

### Edge Cases

- What happens when a version JSON file is malformed or missing required fields?
- How does the system handle version files that reference calculation methods that don't exist in utils?
- What happens when a version JSON file contains upgrade definitions with invalid effect references?
- How does the system handle migration from old JavaScript version files to new JSON format?
- What happens when multiple versions need different variations of the same calculation method?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store version data (building names, base prices, base rates, upgrade definitions) in JSON files
- **FR-002**: System MUST load version data from JSON files and make it available to the game simulation system
- **FR-003**: System MUST move calculation methods (multiplier, grandmaBoost, fingersBoost, percentBoost, etc.) to utility files
- **FR-004**: System MUST allow version JSON files to reference and use calculation methods from utility files
- **FR-005**: System MUST maintain the same external API for version loading (existing code that imports versions should continue to work)
- **FR-006**: System MUST preserve all upgrade effect calculations to produce identical results to the original implementation
- **FR-007**: System MUST support all existing versions (v2031, v2048, v10466, v10466_xmas, v2052) in the new structure
- **FR-008**: System MUST handle upgrade definitions in JSON format, including requirements, prices, effects, and IDs
- **FR-009**: System MUST maintain the upgradesById array structure for save game parsing compatibility
- **FR-010**: System MUST validate JSON version files to ensure required fields are present and correctly formatted

### Key Entities *(include if feature involves data)*

- **Version Data File (JSON)**: Represents a game version's static data including building names, base prices, base rates, and upgrade definitions. Stored as JSON for easy editing and maintenance.

- **Version Loader Module**: JavaScript module that loads JSON version data, applies calculation methods from utils, and constructs the version object expected by the game simulation system.

- **Upgrade Effect Utils**: Utility module containing reusable calculation functions (multiplier, grandmaBoost, fingersBoost, percentBoost, etc.) that can be imported and used by version loaders.

- **Upgrade Definition**: JSON representation of an upgrade including name, requirements, price, effects (with references to calculation methods), and optional ID.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing version files (v2031, v2048, v10466, v10466_xmas, v2052) are successfully converted to JSON format
- **SC-002**: Route calculations using JSON-based versions produce identical results to JavaScript-based versions (100% match in building purchase sequences and timing)
- **SC-003**: Save game imports work correctly with JSON-based versions (all upgrades correctly parsed and applied)
- **SC-004**: Version data can be updated by editing JSON files without modifying JavaScript code
- **SC-005**: Calculation methods are centralized in utils files with zero duplication across version loaders
- **SC-006**: All existing tests pass with the refactored version system (no test failures introduced by the refactoring)

## Assumptions

- Version JSON files will use a standardized schema that can be validated
- Calculation methods in utils will maintain the same function signatures as the original implementations
- The refactoring will be done incrementally, allowing both old and new formats to coexist during migration
- JSON files will use string references to calculation methods (e.g., "multiplier(2.0)") that are resolved by the version loader
- Upgrade effect definitions in JSON will need a way to specify which calculation method to use and its parameters
- The version loader will be responsible for instantiating Effect objects using the calculation methods from utils

## Dependencies

- Existing game simulation system that expects version objects with specific structure (buildingNames, basePrices, baseRates, menu, upgradesById)
- Save game parser that relies on upgradesById array structure
- Route calculation system that uses version data

## Out of Scope

- Changing the game simulation logic or upgrade effect calculation algorithms
- Adding new features or capabilities to the version system
- Modifying the external API or interfaces used by other parts of the system
- Performance optimizations (unless required to maintain existing performance)
- Adding new version data fields or capabilities beyond what currently exists
