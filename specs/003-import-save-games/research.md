# Research: Import Cookie Clicker Save Games

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Research Questions

### 1. Cookie Clicker Save Format Structure

**Question**: What is the exact structure of Cookie Clicker save game format and how to parse it?

**Decision**: Cookie Clicker save games are base64-encoded strings with the following structure:
- Suffixed with "!END!" marker
- Optionally URL-encoded (e.g., '=' replaced with '%3D')
- Sections separated by "|" character (ASCII 124)
- Data entries within sections delimited by ";" character
- Bitfields have no separation character between entries
- Reference documentation: https://cookieclicker.wiki.gg/wiki/Save

**Rationale**: 
- Format is well-documented on the Cookie Clicker wiki
- Example save file provided in `example_save/save` demonstrates the format
- Standard base64 decoding and string parsing can handle the format
- Section-based structure allows selective extraction of needed data

**Alternatives Considered**:
- Using external parsing library: Unnecessary, format is simple enough to parse manually
- Server-side parsing: Violates offline requirement, adds complexity
- Full save game emulation: Overkill, only need specific fields for route calculation

**Implementation Notes**:
- Use `decodeURIComponent()` to handle URL encoding first
- Remove "!END!" suffix before base64 decoding
- Use `atob()` for base64 decoding (native browser API)
- Split by "|" to get sections
- Parse each section based on its known structure from wiki documentation
- Extract only relevant fields: building counts, cookies, cookies per second, version, hardcore mode

### 2. Building Count Extraction from Save Format

**Question**: How to extract building counts from Cookie Clicker save format?

**Decision**: Building counts are stored in a specific section of the save format. The section contains building data in a structured format where each building type has associated count data. Need to map Cookie Clicker building names to application building names.

**Rationale**:
- Building counts are essential for route calculation (FR-003, FR-009, FR-010)
- Save format has a dedicated section for building data
- Building names may need mapping between Cookie Clicker format and application format

**Alternatives Considered**:
- Manual entry only: Violates requirement to import save data
- Guessing from other data: Unreliable, building counts are explicitly stored

**Implementation Notes**:
- Parse building section from save format
- Extract building counts for each building type
- Map Cookie Clicker building names to application building names (may be identical)
- Handle cases where save game has buildings not in selected version (FR-018)
- Validate building counts are non-negative integers

### 3. Game Version Detection from Save Format

**Question**: How to detect Cookie Clicker game version from save game data?

**Decision**: Game version information may be encoded in the save format, either explicitly or implicitly through data structure. Need to detect version and map to application version IDs (v2031, v2048, v10466, v10466_xmas, v2052).

**Rationale**:
- Different versions have different buildings and mechanics (FR-006, FR-012)
- Version detection allows automatic version selection (User Story 1, Acceptance Scenario 5)
- Version mismatch can cause parsing errors or incorrect data extraction

**Alternatives Considered**:
- User manual selection: Less convenient, violates auto-detection requirement
- Assume latest version: May cause errors with older saves
- Version detection from building list: May be unreliable if buildings overlap

**Implementation Notes**:
- Check for explicit version field in save format
- If not available, infer from building list or data structure
- Map detected version to application version ID
- Fall back to default version (v2052) if detection fails
- Warn user if detected version is not supported

### 4. Base64 and URL Decoding Strategy

**Question**: How to handle base64 decoding and URL decoding of save game strings?

**Decision**: Use native browser APIs: `decodeURIComponent()` for URL decoding, `atob()` for base64 decoding. Handle errors gracefully for invalid encoding.

**Rationale**:
- Native browser APIs are sufficient and don't require external dependencies
- Both APIs are widely supported in modern browsers
- Error handling can provide user-friendly messages for invalid data

**Alternatives Considered**:
- External base64 library: Unnecessary, native API is sufficient
- Server-side decoding: Violates offline requirement
- Manual decoding: Error-prone, native APIs are reliable

**Implementation Notes**:
- First check if string is URL-encoded (contains %XX patterns)
- Use `decodeURIComponent()` if URL-encoded
- Remove "!END!" suffix if present
- Use `atob()` for base64 decoding
- Catch `DOMException` for invalid base64 and provide user-friendly error
- Validate decoded string is not empty

### 5. Save Game Data Validation Strategy

**Question**: How to validate imported save game data and handle errors?

**Decision**: Implement multi-level validation: format validation (base64, structure), data validation (required fields present, valid ranges), and semantic validation (building names match version, counts are reasonable).

**Rationale**:
- Validation prevents errors during route calculation (FR-011)
- Multi-level validation provides specific error messages
- Graceful error handling improves user experience (SC-007)

**Alternatives Considered**:
- No validation: Leads to cryptic errors during calculation
- Single-level validation: Less specific error messages
- Strict validation (reject on any issue): Too restrictive, may reject valid saves with minor issues

**Implementation Notes**:
- Format validation: Check base64 encoding, "!END!" suffix, section separators
- Structure validation: Verify sections exist, required fields present
- Data validation: Check numeric ranges, non-negative counts, valid building names
- Semantic validation: Verify buildings exist in selected version, version compatibility
- Provide specific error messages for each validation failure
- Allow partial import if some data is invalid (extract what's valid)

### 6. Integration with Existing Starting Buildings Component

**Question**: How to integrate imported save game data with existing starting buildings selector?

**Decision**: Extend `StartingBuildingsSelector` class to accept imported building counts and auto-populate fields. Maintain ability for manual override (FR-016).

**Rationale**:
- Reuses existing UI component (FR-009)
- Maintains consistency with current workflow
- Allows manual adjustment if needed (FR-016, User Story 3 Acceptance Scenario 4)

**Alternatives Considered**:
- New component for imported data: Duplicates functionality, inconsistent UX
- Separate import-only workflow: Violates requirement to use imported data automatically

**Implementation Notes**:
- Add `setStartingBuildings()` method call after successful import
- Trigger `onUpdate` callback to notify parent component
- Preserve manual edits if user modifies after import
- Clear imported data indicator if user manually changes buildings

### 7. Save Game Data Display and Exploration

**Question**: How to display imported save game data for user exploration?

**Decision**: Create a collapsible details view component that displays extracted data in organized sections: building counts, game statistics (cookies, CpS), version info, game mode settings. Allow collapsing/expanding.

**Rationale**:
- Provides visibility into imported data (FR-008, User Story 2)
- Builds user confidence in import accuracy
- Organized display improves readability (User Story 2 Acceptance Scenario 4)

**Alternatives Considered**:
- No display: Violates requirement to explore content
- Full raw data display: Too technical, poor UX
- Separate page: Breaks workflow, unnecessary complexity

**Implementation Notes**:
- Create `SaveGameDetailsView` component
- Display building counts in table/grid format
- Show game statistics (total cookies, cookies per second, time elapsed)
- Display detected version and game mode (hardcore, etc.)
- Make collapsible/expandable for space efficiency
- Use consistent styling with existing UI components

### 8. Temporary Storage Strategy for Imported Data

**Question**: How to store imported save game data during the session?

**Decision**: Store parsed save game data in memory (JavaScript object) and optionally in localStorage with a temporary key. Clear on page refresh or explicit clear action. Do not persist across browser sessions (per spec assumptions).

**Rationale**:
- Memory storage is fast and sufficient for session use
- localStorage backup provides resilience if page accidentally refreshes
- Non-persistent storage aligns with spec assumptions (users can re-import)

**Alternatives Considered**:
- Persistent localStorage: Violates spec assumption that data doesn't need to persist
- SessionStorage: Similar to localStorage but clears on tab close, acceptable alternative
- No storage: Data lost on accidental refresh, poor UX

**Implementation Notes**:
- Store parsed data in application state object
- Optionally save to localStorage key `cookieRouter:importedSaveGame`
- Clear on explicit "Clear Import" action (FR-013)
- Clear on new import (replaces previous, FR-014)
- Do not load from localStorage on page load (per spec assumptions)

## Technology Decisions Summary

| Technology | Choice | Rationale |
|------------|--------|-----------|
| Base64 Decoding | Native `atob()` | No external dependency, widely supported |
| URL Decoding | Native `decodeURIComponent()` | No external dependency, standard API |
| Parsing | Manual string parsing | Format is simple, no need for complex parser |
| Storage | Memory + optional localStorage | Fast, sufficient for session use |
| Validation | Multi-level validation | Provides specific error messages |
| UI Component | Extend existing components | Maintains consistency, reuses code |

## Open Questions Resolved

All technical questions have been resolved. The approach uses native browser APIs, manual parsing of well-documented format, and extends existing components for consistency. Error handling and validation provide robust user experience.

## References

- Cookie Clicker Save Format Wiki: https://cookieclicker.wiki.gg/wiki/Save
- Example save file: `example_save/save` in repository
- MDN Base64 Decoding: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/atob
- MDN URL Decoding: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent

