# Data Model: Route Import/Export

**Date**: 2025-01-27  
**Feature**: [spec.md](./spec.md)

## Entities

### RouteExportFile

Represents the structure of an exported route file. Contains base64-encoded JSON data with route information.

**Fields**:
- `version` (string, required): Export format version (e.g., "1.0")
- `routeType` (string, required): Type of route being exported ("savedRoute" | "routeChain" | "calculatedRoute" | "achievementRoute")
- `exportedAt` (number, required): Timestamp when route was exported (milliseconds since epoch)
- `routeData` (object, required): Route-specific data structure (varies by routeType)

**Validation Rules**:
- `version` must be non-empty string
- `routeType` must be one of: "savedRoute", "routeChain", "calculatedRoute", "achievementRoute"
- `exportedAt` must be valid timestamp
- `routeData` structure must match routeType

**Storage**: Exported as base64-encoded JSON text file (not stored in localStorage)

**File Format**:
- File content: Base64-encoded JSON string
- File extension: `.json`
- File name pattern: `cookie-router-{routeType}-{routeName}-{timestamp}.json`

**Relationships**:
- RouteExportFile represents one SavedRoute, RouteChain, calculated Route, or AchievementRoute

---

### RouteImportPreview

Represents a temporary preview of an imported route displayed to the user before saving. Stored in memory only.

**Fields**:
- `routeType` (string, required): Type of imported route
- `routeData` (object, required): Parsed route data from import file
- `validationResult` (object, required): Validation result from import
  - `isValid` (boolean): Whether import file is valid
  - `errors` (array): Array of validation error messages
  - `warnings` (array): Array of warning messages (e.g., missing categories)
- `importedAt` (number, required): Timestamp when file was imported
- `fileName` (string, required): Name of imported file

**Validation Rules**:
- `routeType` must be valid route type
- `routeData` must match routeType structure
- `validationResult.isValid` must be true for preview to be displayed
- `importedAt` must be valid timestamp

**Storage**: In-memory only (module-level variable), not persisted to localStorage

**Relationships**:
- RouteImportPreview represents one imported route file
- RouteImportPreview is temporary (cleared on save or cancel)

---

### ImportValidationResult

Represents the result of validating an imported route file.

**Fields**:
- `isValid` (boolean, required): Whether the import file is valid
- `errors` (array, required): Array of error messages if invalid
  - Each error: `{ stage: string, message: string }`
  - Stages: "file", "base64", "json", "schema", "route"
- `warnings` (array, required): Array of warning messages
  - Each warning: `{ type: string, message: string }`
  - Types: "missingCategory", "versionMismatch", "duplicateId"
- `parsedData` (object, optional): Parsed route data if validation succeeds
- `routeType` (string, optional): Detected route type if validation succeeds

**Validation Rules**:
- `isValid` must be boolean
- `errors` must be array (empty if valid)
- `warnings` must be array
- `parsedData` must be present if `isValid` is true
- `routeType` must be present if `isValid` is true

**Storage**: Temporary, used during import validation process

---

## Data Flow

### Export Workflow

1. User clicks "Export Route" button on displayed route
2. System determines route type (savedRoute, routeChain, calculatedRoute, achievementRoute)
3. System collects route data:
   - For savedRoute: Load from localStorage `cookieRouter:savedRoutes`
   - For routeChain: Load from localStorage `cookieRouter:routeChains`
   - For calculatedRoute: Use current in-memory route data
   - For achievementRoute: Use current in-memory route data
4. System creates RouteExportFile object:
   - `version`: "1.0"
   - `routeType`: Detected route type
   - `exportedAt`: Current timestamp
   - `routeData`: Collected route data
5. System serializes RouteExportFile to JSON
6. System base64-encodes JSON string using `btoa()`
7. System creates Blob with base64-encoded content
8. System triggers file download with descriptive filename
9. Export complete

### Import Workflow

1. User clicks "Import Route" button
2. System opens file selection dialog
3. User selects route export file
4. System reads file content (text)
5. System validates file:
   - Stage 1: Verify file is readable
   - Stage 2: Verify content is valid base64
   - Stage 3: Decode base64 and verify valid JSON
   - Stage 4: Verify JSON schema (version, routeType, routeData)
   - Stage 5: Verify route-specific data structure
6. System creates ImportValidationResult
7. If validation succeeds:
   - System creates RouteImportPreview with parsed data
   - System displays preview to user
8. If validation fails:
   - System displays error messages
   - User can dismiss and try different file
9. User explores preview (view route details)
10. User chooses action:
    - Save: Persist to localStorage
    - Cancel: Clear preview, no save

### Save Imported Route Workflow

1. User reviews RouteImportPreview
2. User clicks "Save Route" button
3. System checks for duplicate IDs:
   - Check localStorage for existing route with same ID
   - If duplicate found:
     - Prompt user: overwrite, rename, or cancel
     - If rename: Generate new ID
     - If overwrite: Proceed with existing ID
     - If cancel: Abort save
4. System checks for missing category references:
   - If categories don't exist: Display warning but allow save
5. System persists route to localStorage:
   - For savedRoute: Save to `cookieRouter:savedRoutes`
   - For routeChain: Save to `cookieRouter:routeChains`
6. System clears RouteImportPreview from memory
7. System displays confirmation
8. System updates route list display

### Duplicate ID Handling

1. System detects duplicate ID during save
2. System displays dialog with options:
   - "Overwrite existing route"
   - "Rename imported route"
   - "Cancel"
3. If user chooses overwrite:
   - System replaces existing route in localStorage
   - System preserves route ID
4. If user chooses rename:
   - System generates new unique ID
   - System updates route ID in routeData
   - System saves with new ID
5. If user chooses cancel:
   - System aborts save
   - System keeps preview available

---

## Export File Structure

### SavedRoute Export

```json
{
  "version": "1.0",
  "routeType": "savedRoute",
  "exportedAt": 1706380800000,
  "routeData": {
    "id": "saved-route-1706380800000-abc123",
    "name": "My Custom Route",
    "categoryId": "custom-category-123",
    "categoryName": "My Category",
    "versionId": "v2052",
    "routeData": {
      "buildings": [...],
      "algorithm": "GPL",
      "lookahead": 1,
      "completionTime": 123.45,
      "startingBuildings": {}
    },
    "savedAt": 1706380800000,
    "lastAccessedAt": 1706380800000
  }
}
```

### RouteChain Export

```json
{
  "version": "1.0",
  "routeType": "routeChain",
  "exportedAt": 1706380800000,
  "routeData": {
    "id": "route-chain-1706380800000-abc123",
    "name": "My Route Chain",
    "routes": [
      {
        "routeIndex": 0,
        "routeConfig": {...},
        "calculatedRoute": {...},
        "startingBuildings": {},
        "startingUpgrades": [],
        "progress": {},
        "completedSteps": 0,
        "isComplete": false
      }
    ],
    "createdAt": 1706380800000,
    "lastAccessedAt": 1706380800000,
    "savedAt": 1706380800000,
    "overallProgress": {...}
  }
}
```

### CalculatedRoute Export

```json
{
  "version": "1.0",
  "routeType": "calculatedRoute",
  "exportedAt": 1706380800000,
  "routeData": {
    "categoryId": "predefined-fledgling",
    "categoryName": "Fledgling",
    "versionId": "v2052",
    "buildings": [...],
    "algorithm": "GPL",
    "lookahead": 1,
    "completionTime": 123.45,
    "startingBuildings": {},
    "calculatedAt": 1706380800000
  }
}
```

### AchievementRoute Export

```json
{
  "version": "1.0",
  "routeType": "achievementRoute",
  "exportedAt": 1706380800000,
  "routeData": {
    "achievementIds": [34, 44],
    "versionId": "v2052",
    "buildings": [...],
    "algorithm": "GPL",
    "lookahead": 1,
    "completionTime": 123.45,
    "startingBuildings": {},
    "calculatedAt": 1706380800000
  }
}
```

---

## Validation Rules

### File Format Validation

1. **File Readability**: File must be readable text file
2. **Base64 Format**: Content must be valid base64 string
3. **JSON Structure**: Decoded content must be valid JSON
4. **Schema Validation**: JSON must contain required fields:
   - `version` (string)
   - `routeType` (string, one of valid types)
   - `exportedAt` (number)
   - `routeData` (object)

### Route-Specific Validation

#### SavedRoute Validation

- `routeData.id` must be non-empty string
- `routeData.name` must be non-empty string, max 100 characters
- `routeData.categoryId` must be non-empty string
- `routeData.versionId` must be valid version identifier
- `routeData.routeData.buildings` must be non-empty array
- `routeData.routeData.algorithm` must be "GPL" or "DFS"

#### RouteChain Validation

- `routeData.id` must be non-empty string
- `routeData.name` must be non-empty string, max 100 characters
- `routeData.routes` must be non-empty array
- Each route in `routeData.routes` must have valid `routeIndex` (sequential, starting from 0)
- Each route must have valid `routeConfig` matching its type

#### CalculatedRoute Validation

- `routeData.categoryId` must be non-empty string
- `routeData.buildings` must be non-empty array
- `routeData.algorithm` must be "GPL" or "DFS"

#### AchievementRoute Validation

- `routeData.achievementIds` must be non-empty array of numbers
- `routeData.buildings` must be non-empty array
- `routeData.algorithm` must be "GPL" or "DFS"

---

## Storage Schema

### Export Files (Not in localStorage)

Export files are downloaded to user's file system. Structure:
- **Content**: Base64-encoded JSON string
- **Format**: Plain text file
- **Extension**: `.json`
- **Naming**: `cookie-router-{routeType}-{sanitizedRouteName}-{timestamp}.json`

### Import Preview (In-Memory Only)

```javascript
// Module-level variable (not persisted)
let currentImportPreview = {
  routeType: "savedRoute",
  routeData: { /* parsed route data */ },
  validationResult: {
    isValid: true,
    errors: [],
    warnings: [{ type: "missingCategory", message: "Category 'custom-123' not found" }]
  },
  importedAt: 1706380800000,
  fileName: "cookie-router-savedRoute-MyRoute-1706380800000.json"
};
```

---

## Migration Considerations

- No migration needed - this is a new feature
- Export files are independent of localStorage structure
- Imported routes follow existing storage patterns (savedRoutes, routeChains)
- Existing routes remain unchanged

---

## Data Integrity

- Export files must contain complete route data for recreation
- Import validation must prevent invalid data from being saved
- Duplicate ID handling must prevent data loss
- Missing category references must be handled gracefully (warn but allow)
- Route chain structure and order must be preserved during export/import









