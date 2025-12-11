# Research: Route Import/Export

**Feature**: Route Import/Export  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Research Questions

### Base64 Encoding/Decoding

**Question**: How should route data be base64 encoded for export files?

**Decision**: Use browser native `btoa()` function for encoding JSON-serialized route data. Use `atob()` for decoding during import.

**Rationale**: 
- Browser native APIs are available in all modern browsers
- Consistent with existing save game parser implementation (see `src/js/save-game-parser.js`)
- No external dependencies required
- Base64 encoding provides safe text representation for JSON data in files
- Handles special characters and binary data safely

**Alternatives Considered**:
- Custom base64 implementation: Rejected - unnecessary complexity, native APIs are sufficient
- JSON-only export: Rejected - user requirement specifies base64 encoding
- Compression before base64: Rejected - adds complexity, route data is typically small enough

**Implementation Notes**:
- Encode: `btoa(JSON.stringify(routeData))`
- Decode: `JSON.parse(atob(base64String))`
- Error handling required for invalid base64 strings
- File format: Plain text file containing base64-encoded JSON

---

### File Format Structure

**Question**: What structure should export files use?

**Decision**: Export files contain a JSON object with version identifier, route type, and route data. The entire JSON object is base64-encoded.

**Rationale**:
- JSON provides structured, parseable format
- Version identifier allows future format evolution
- Route type identifier enables proper handling during import
- Base64 encoding ensures safe file transfer and storage
- Consistent with existing data structures in the application

**File Structure**:
```json
{
  "version": "1.0",
  "routeType": "savedRoute" | "routeChain" | "calculatedRoute" | "achievementRoute",
  "exportedAt": timestamp,
  "routeData": { /* route-specific data */ }
}
```

**Alternatives Considered**:
- Binary format: Rejected - JSON is more readable and debuggable
- Multiple file formats per route type: Rejected - single format simplifies import logic
- Unencoded JSON: Rejected - user requirement specifies base64 encoding

---

### Export File Naming

**Question**: How should export files be named?

**Decision**: Generate descriptive filenames based on route type and name: `cookie-router-{routeType}-{routeName}-{timestamp}.json`

**Rationale**:
- Descriptive names help users identify exported routes
- Timestamp prevents filename conflicts
- `.json` extension indicates file type (even though content is base64-encoded)
- Route type in filename helps users understand what they're exporting

**Examples**:
- `cookie-router-savedRoute-My Custom Route-1706380800000.json`
- `cookie-router-routeChain-Achievement Chain-1706380800000.json`

**Alternatives Considered**:
- Generic names: Rejected - users need to identify files
- No extension: Rejected - file extension helps OS identify file type
- Binary extension: Rejected - content is text (base64), JSON extension is clearer

---

### Import Validation Strategy

**Question**: What validation should occur during import?

**Decision**: Multi-stage validation: file format → base64 decoding → JSON parsing → schema validation → route-specific validation.

**Rationale**:
- Progressive validation provides clear error messages at each stage
- Early validation prevents unnecessary processing of invalid files
- Schema validation ensures required fields are present
- Route-specific validation ensures route data integrity
- Error messages guide users to fix issues

**Validation Stages**:
1. File selection: Verify file exists and is readable
2. Base64 decoding: Verify valid base64 string
3. JSON parsing: Verify valid JSON structure
4. Schema validation: Verify required fields (version, routeType, routeData)
5. Route validation: Verify route data matches route type and contains required fields
6. Category reference validation: Warn if categories don't exist (but allow import)

**Alternatives Considered**:
- Single validation step: Rejected - less clear error messages
- No validation: Rejected - data integrity risk
- Strict validation (reject missing categories): Rejected - user requirement allows import with warnings

---

### Preview State Management

**Question**: How should imported route preview state be managed?

**Decision**: Store preview state in memory (module-level variable) until user saves or cancels. Do not persist to localStorage until save action.

**Rationale**:
- Preview is temporary - user may cancel
- Memory storage is sufficient for preview duration
- Avoids polluting localStorage with unsaved imports
- Consistent with existing save game import pattern (see `src/js/save-game-importer.js`)

**State Management**:
- Import file → parse → validate → store in memory
- Display preview from memory
- User saves → persist to localStorage
- User cancels → clear memory

**Alternatives Considered**:
- Immediate localStorage save: Rejected - user requirement specifies preview before save
- Session storage: Rejected - memory is sufficient, simpler
- IndexedDB: Rejected - overkill for temporary preview data

---

### Duplicate ID Handling

**Question**: How should duplicate route IDs be handled during import?

**Decision**: Detect duplicate IDs, prompt user to choose: overwrite existing route, rename imported route, or cancel import.

**Rationale**:
- Prevents accidental data loss
- Gives users control over import behavior
- Rename option allows keeping both routes
- Cancel option allows user to fix ID conflict externally

**Implementation**:
- Check localStorage for existing route with same ID
- If duplicate found, show dialog with three options
- Generate new ID if user chooses rename
- Update route ID before saving if renamed

**Alternatives Considered**:
- Auto-rename: Rejected - user should be aware of duplicates
- Auto-overwrite: Rejected - risk of data loss
- Reject import: Rejected - too restrictive, user may want to overwrite

---

### Route Chain Export/Import

**Question**: How should route chains be exported and imported?

**Decision**: Export entire chain as single file with all route data and chain structure. Preserve route order and chain metadata.

**Rationale**:
- Single file simplifies sharing and backup
- Preserving order is critical for chain functionality
- All route data needed for complete chain recreation
- Consistent with user requirement to support all route types

**Export Structure**:
- Include chain metadata (name, createdAt, etc.)
- Include all routes in order with full route data
- Include overall progress if applicable
- Base64 encode entire chain object

**Import Handling**:
- Validate chain structure
- Validate each route in chain
- Preserve route order during import
- Recreate chain with same structure

**Alternatives Considered**:
- Separate files per route: Rejected - loses chain structure and order
- Export only chain configuration: Rejected - incomplete, needs route data

---

### Missing Category References

**Question**: How should missing category references be handled?

**Decision**: Warn user during preview that categories don't exist, but allow import. Route data is preserved even if category is missing.

**Rationale**:
- User requirement specifies warning but allowing import
- Route data is still valid even without category
- User may create category later or use different category
- Prevents blocking imports due to category management

**Implementation**:
- Check if categoryId references exist in localStorage
- Display warning in preview if categories missing
- Allow save despite missing categories
- Route data remains intact, category reference may be invalid

**Alternatives Considered**:
- Reject import: Rejected - too restrictive per user requirement
- Auto-create categories: Rejected - categories have configuration that can't be inferred
- Remove category references: Rejected - loses route context

---

## Technology Choices

### Browser File API

**Decision**: Use File API and Blob API for file operations (export download, import file selection).

**Rationale**:
- Native browser APIs, no dependencies
- Standard approach for web file operations
- Works offline
- Consistent with modern web application patterns

### Base64 Encoding

**Decision**: Use browser native `btoa()` and `atob()` functions.

**Rationale**:
- No external dependencies
- Consistent with existing codebase (save game parser)
- Sufficient for route data size
- Widely supported

## Integration Points

### Existing Systems

1. **Storage System** (`src/js/storage.js`):
   - Extend with export/import helper functions if needed
   - Use existing `getSavedRoutes()`, `getRouteChains()`, etc. for data access

2. **Route Display Components**:
   - Add export buttons to route display interfaces
   - Integrate with existing route rendering

3. **Save Game Parser** (`src/js/save-game-parser.js`):
   - Reference base64 encoding/decoding patterns
   - Use similar error handling approaches

4. **Route Calculation** (`src/js/simulation.js`):
   - Export calculated routes before saving
   - Import routes may need recalculation if categories missing

## Open Questions Resolved

All research questions have been resolved. No NEEDS CLARIFICATION markers remain.







