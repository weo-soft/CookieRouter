# Feature Specification: Import Cookie Clicker Save Games

**Feature Branch**: `003-import-save-games`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Create an import functionality for cookie Clicker Save games. The User should be able to provide/paste the exported save data from the cookie clicker game. The User can see an explore the content of the saved game. The page updates all relevant datapoints to calculate/simulate the routes based on the Data from the save game."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import Save Game Data (Priority: P1)

A user wants to import their Cookie Clicker save game data so they can use their actual game state for route calculations instead of manually entering building counts. They can paste the exported save data from Cookie Clicker.

**Why this priority**: This is the core functionality - without the ability to import save data, users must manually enter all their building counts, which is error-prone and time-consuming. This feature significantly improves the user experience by automating data entry.

**Independent Test**: Can be fully tested by pasting a valid Cookie Clicker save game string, verifying the system parses it correctly, and confirming that the extracted data is available for route calculations.

**Acceptance Scenarios**:

1. **Given** the user is on the main page, **When** they paste Cookie Clicker save game data into an import field, **Then** the system parses the save data and extracts relevant game state information
2. **Given** valid save game data is pasted, **When** the import completes, **Then** the system displays confirmation that the save was imported successfully
3. **Given** invalid or corrupted save game data is pasted, **When** the user attempts to import, **Then** the system displays an error message explaining what went wrong
4. **Given** save game data is imported, **When** the user views the starting buildings section, **Then** all building counts from the save game are automatically populated
5. **Given** save game data contains game version information, **When** the import completes, **Then** the system automatically selects the appropriate game version if available

---

### User Story 2 - Explore Imported Save Game Content (Priority: P2)

A user wants to view and explore the data extracted from their imported save game to verify it was parsed correctly and understand what information is available for route calculations.

**Why this priority**: Users need confidence that their save data was correctly imported. Providing visibility into the extracted data builds trust and helps users understand what information is being used for calculations.

**Independent Test**: Can be fully tested by importing a save game and verifying that a detailed view displays all extracted information including building counts, cookies, cookies per second, and other relevant game state.

**Acceptance Scenarios**:

1. **Given** a save game has been imported, **When** the user views the save game details, **Then** the system displays all extracted building counts in a readable format
2. **Given** a save game has been imported, **When** the user views the save game details, **Then** the system displays total cookies, cookies per second, and other relevant game statistics
3. **Given** a save game has been imported, **When** the user views the save game details, **Then** the system displays the detected game version and any special game mode settings (e.g., hardcore mode)
4. **Given** save game details are displayed, **When** the user scrolls through the information, **Then** all data is presented in an organized, easy-to-read format
5. **Given** save game details are displayed, **When** the user wants to hide the details, **Then** the system allows collapsing or dismissing the details view

---

### User Story 3 - Use Imported Data for Route Calculation (Priority: P3)

A user wants the system to automatically use the imported save game data (building counts, game state) when calculating routes, so they don't need to manually configure starting buildings or other parameters.

**Why this priority**: The primary value of importing save data is to streamline route calculations. Without automatically using the imported data, users still need to manually configure everything, negating the benefit of import.

**Independent Test**: Can be fully tested by importing a save game, selecting a category, and verifying that the route calculation uses the imported building counts and game state as the starting point.

**Acceptance Scenarios**:

1. **Given** a save game has been imported, **When** the user selects a category and calculates a route, **Then** the system automatically uses the imported building counts as starting buildings
2. **Given** a save game has been imported, **When** the user calculates a route, **Then** the system uses the imported total cookies and cookies per second if relevant to the calculation
3. **Given** a save game has been imported with hardcore mode enabled, **When** the user calculates a route, **Then** the system respects the hardcore mode setting in the calculation
4. **Given** imported save game data is being used, **When** the user manually modifies starting buildings, **Then** the system allows manual overrides while preserving the imported data as a baseline
5. **Given** a save game has been imported, **When** the user switches to a different category, **Then** the imported data remains available and is used for subsequent route calculations

---

### User Story 4 - Manage Imported Save Games (Priority: P4)

A user wants to manage imported save games, including clearing the current import, importing a new save, or updating their existing import with new data.

**Why this priority**: Users may want to import different save games, update their import with new data, or start fresh. Management capabilities ensure the feature remains flexible and useful over time.

**Independent Test**: Can be fully tested by importing a save game, then clearing it or importing a different save, and verifying that the system correctly updates all relevant data points.

**Acceptance Scenarios**:

1. **Given** a save game has been imported, **When** the user imports a new save game, **Then** the system replaces the previous import with the new data
2. **Given** a save game has been imported, **When** the user clears the import, **Then** all imported data is removed and starting buildings return to empty state
3. **Given** a save game has been imported, **When** the user views the import status, **Then** the system indicates that save data is currently loaded
4. **Given** no save game is imported, **When** the user views the import status, **Then** the system indicates that no save data is loaded

---

### Edge Cases

- What happens when a user imports a save game from a Cookie Clicker version that is not supported by the application?
- How does the system handle save games with corrupted or malformed data?
- What happens when a save game contains building types that don't exist in the selected game version?
- How does the system handle save games with extremely large numbers (e.g., very high cookie counts)?
- What happens when a user imports a save game while a route calculation is in progress?
- How does the system handle save games with missing or incomplete data fields?
- What happens when a user pastes save game data that is partially cut off or truncated?
- How does the system handle save games from different Cookie Clicker game modes (e.g., different challenge modes)?
- What happens when a user imports a save game, then manually changes starting buildings, then imports again?
- How does the system handle save games with negative or invalid building counts?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an interface for users to paste or provide Cookie Clicker save game data
- **FR-002**: System MUST parse Cookie Clicker save game format and extract relevant game state data
- **FR-003**: System MUST extract building counts (number of each building owned) from imported save games
- **FR-004**: System MUST extract total cookies produced from imported save games
- **FR-005**: System MUST extract cookies per second from imported save games
- **FR-006**: System MUST extract game version information from imported save games when available
- **FR-007**: System MUST extract hardcore mode setting from imported save games when available
- **FR-008**: System MUST display imported save game data in an explorable, readable format
- **FR-009**: System MUST automatically populate starting buildings with imported building counts after successful import
- **FR-010**: System MUST automatically use imported game state data (building counts, cookies, cookies per second) when calculating routes
- **FR-011**: System MUST validate imported save game data and display error messages for invalid or corrupted data
- **FR-012**: System MUST handle save games from different Cookie Clicker versions and map data appropriately
- **FR-013**: System MUST allow users to clear or remove imported save game data
- **FR-014**: System MUST allow users to import a new save game, replacing any previously imported data
- **FR-015**: System MUST preserve imported save game data across category selections and route calculations
- **FR-016**: System MUST allow users to manually override imported building counts if desired
- **FR-017**: System MUST display import status (whether save data is currently loaded) to users
- **FR-018**: System MUST handle cases where imported save game contains buildings not available in the selected game version
- **FR-019**: System MUST extract and use player clicks per second from imported save games when available
- **FR-020**: System MUST extract and use time elapsed from imported save games when relevant

### Key Entities *(include if feature involves data)*

- **ImportedSaveGame**: Represents parsed save game data extracted from Cookie Clicker export. Contains building counts, total cookies, cookies per second, game version, hardcore mode setting, player CPS, time elapsed, and other relevant game state information. This data is used to automatically configure starting buildings and route calculation parameters.
- **SaveGameImportState**: Represents the current import status, including whether save data is loaded, the source of the import, and when it was imported. Used to track and display import status to users.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully import a Cookie Clicker save game and see extracted data within 5 seconds of pasting the save string
- **SC-002**: 95% of valid Cookie Clicker save games are successfully parsed and imported without errors
- **SC-003**: Users can view all extracted save game data (buildings, cookies, statistics) in an organized view within 2 seconds of import completion
- **SC-004**: Imported building counts are automatically applied to starting buildings and used in route calculations with 100% accuracy
- **SC-005**: Users can import a new save game or clear the current import within 2 user actions
- **SC-006**: 90% of users can successfully import a save game and use it for route calculation on their first attempt without assistance
- **SC-007**: Invalid or corrupted save game data is detected and appropriate error messages are displayed within 3 seconds of import attempt
- **SC-008**: Imported save game data persists and remains available for route calculations until explicitly cleared or replaced

## Assumptions

- Cookie Clicker save game format is a base64-encoded string that can be decoded and parsed
- Save game format structure is documented or can be reverse-engineered from example saves
- The application can handle save games from multiple Cookie Clicker versions (v2031, v2048, v10466, v10466_xmas, v2052, etc.)
- Building names in save games match or can be mapped to building names used in the application
- Users will primarily import save games to get accurate building counts for route calculations
- Save game data may contain more information than needed, and the system should extract only relevant fields
- Imported save game data does not need to be persisted across browser sessions (users can re-import if needed)
- Users may want to manually adjust imported data before using it for calculations
- Save games may contain data for game features not used in route calculations (e.g., achievements, upgrades), which can be ignored

