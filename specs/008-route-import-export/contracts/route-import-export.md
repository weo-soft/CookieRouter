# Route Import/Export Contract: API Interface

**Date**: 2025-01-27  
**Feature**: [spec.md](../spec.md)

## Overview

This contract defines the interface for route import/export operations. All operations handle route serialization, base64 encoding/decoding, file operations, validation, and preview management.

## Namespace

All functions are exported from:
- `src/js/utils/route-serializer.js` - Serialization and encoding
- `src/js/utils/route-validator.js` - Validation logic
- `src/js/ui/route-export.js` - Export UI and file operations
- `src/js/ui/route-import.js` - Import UI and file operations
- `src/js/ui/route-import-preview.js` - Preview display component

## Export Functions

### `exportRoute(routeData: object, routeType: string, routeName: string): void`

Exports a route to a downloadable file. Serializes route data, base64-encodes it, and triggers file download.

**Parameters**:
- `routeData` (object, required): Route data to export (SavedRoute, RouteChain, or calculated route object)
- `routeType` (string, required): Type of route ("savedRoute" | "routeChain" | "calculatedRoute" | "achievementRoute")
- `routeName` (string, required): Name of route for filename generation

**Returns**: 
- `void` (triggers file download)

**Errors**:
- Throws `Error` if routeData is invalid
- Throws `Error` if routeType is invalid
- Throws `Error` if base64 encoding fails

**Example**:
```javascript
import { exportRoute } from './ui/route-export.js';
import { getSavedRouteById } from './storage.js';

const savedRoute = getSavedRouteById('saved-route-123');
exportRoute(savedRoute, 'savedRoute', savedRoute.name);
// Downloads: cookie-router-savedRoute-MyRoute-1706380800000.json
```

---

### `serializeRouteForExport(routeData: object, routeType: string): string`

Serializes route data to base64-encoded JSON string for export.

**Parameters**:
- `routeData` (object, required): Route data to serialize
- `routeType` (string, required): Type of route

**Returns**: 
- Base64-encoded JSON string

**Errors**:
- Throws `Error` if serialization fails
- Throws `Error` if base64 encoding fails

**Example**:
```javascript
import { serializeRouteForExport } from './utils/route-serializer.js';

const routeData = { id: 'route-123', name: 'My Route', ... };
const base64String = serializeRouteForExport(routeData, 'savedRoute');
// Returns: "eyJ2ZXJzaW9uIjoiMS4wIiwicm91dGVUeXBlIjoic2F2ZWRSb3V0ZSIs..."
```

---

### `createExportFile(base64Content: string, fileName: string): void`

Creates a downloadable file from base64-encoded content.

**Parameters**:
- `base64Content` (string, required): Base64-encoded file content
- `fileName` (string, required): Filename for download

**Returns**: 
- `void` (triggers file download)

**Errors**:
- Throws `Error` if Blob creation fails
- Throws `Error` if download trigger fails

**Example**:
```javascript
import { createExportFile } from './ui/route-export.js';

const base64 = "eyJ2ZXJzaW9uIjoiMS4wIiwicm91dGVUeXBlIjoic2F2ZWRSb3V0ZSIs...";
createExportFile(base64, 'cookie-router-savedRoute-MyRoute-1706380800000.json');
```

---

## Import Functions

### `importRouteFile(file: File): Promise<ImportValidationResult>`

Imports a route file, validates it, and returns validation result.

**Parameters**:
- `file` (File, required): File object from file input

**Returns**: 
- `Promise<ImportValidationResult>` - Validation result with parsed data if valid

**Errors**:
- Throws `Error` if file read fails
- Returns validation result with errors if validation fails

**Example**:
```javascript
import { importRouteFile } from './ui/route-import.js';

const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const result = await importRouteFile(file);
  if (result.isValid) {
    console.log('Route imported:', result.parsedData);
  } else {
    console.error('Import failed:', result.errors);
  }
});
```

---

### `validateImportFile(fileContent: string): ImportValidationResult`

Validates an imported route file through multiple stages.

**Parameters**:
- `fileContent` (string, required): File content as text string

**Returns**: 
- `ImportValidationResult` object with validation status, errors, warnings, and parsed data

**Validation Stages**:
1. Base64 format validation
2. Base64 decoding
3. JSON parsing
4. Schema validation (version, routeType, routeData)
5. Route-specific validation

**Errors**:
- Returns validation result with errors array if any stage fails

**Example**:
```javascript
import { validateImportFile } from './utils/route-validator.js';

const fileContent = "eyJ2ZXJzaW9uIjoiMS4wIiwicm91dGVUeXBlIjoic2F2ZWRSb3V0ZSIs...";
const result = validateImportFile(fileContent);
if (result.isValid) {
  console.log('Valid route:', result.parsedData);
} else {
  result.errors.forEach(err => console.error(`${err.stage}: ${err.message}`));
}
```

---

### `deserializeRouteFromImport(base64String: string): object`

Deserializes base64-encoded route data from import file.

**Parameters**:
- `base64String` (string, required): Base64-encoded JSON string

**Returns**: 
- Parsed route data object

**Errors**:
- Throws `Error` if base64 decoding fails
- Throws `Error` if JSON parsing fails

**Example**:
```javascript
import { deserializeRouteFromImport } from './utils/route-serializer.js';

const base64 = "eyJ2ZXJzaW9uIjoiMS4wIiwicm91dGVUeXBlIjoic2F2ZWRSb3V0ZSIs...";
const routeData = deserializeRouteFromImport(base64);
// Returns: { version: "1.0", routeType: "savedRoute", routeData: {...} }
```

---

## Preview Functions

### `showImportPreview(importData: object): void`

Displays import preview to user with route details.

**Parameters**:
- `importData` (object, required): Parsed import data with validation result

**Returns**: 
- `void` (displays preview UI)

**Example**:
```javascript
import { showImportPreview } from './ui/route-import-preview.js';

const importData = {
  routeType: 'savedRoute',
  routeData: { /* parsed route */ },
  validationResult: { isValid: true, warnings: [] }
};
showImportPreview(importData);
```

---

### `getCurrentImportPreview(): RouteImportPreview | null`

Gets the current import preview if one exists.

**Parameters**: None

**Returns**: 
- `RouteImportPreview` object if preview exists, `null` otherwise

**Example**:
```javascript
import { getCurrentImportPreview } from './ui/route-import-preview.js';

const preview = getCurrentImportPreview();
if (preview) {
  console.log('Preview route:', preview.routeData);
}
```

---

### `clearImportPreview(): void`

Clears the current import preview from memory.

**Parameters**: None

**Returns**: 
- `void`

**Example**:
```javascript
import { clearImportPreview } from './ui/route-import-preview.js';

clearImportPreview(); // Clears preview after save or cancel
```

---

## Save Functions

### `saveImportedRoute(preview: RouteImportPreview, options?: object): Promise<void>`

Saves an imported route from preview to localStorage.

**Parameters**:
- `preview` (RouteImportPreview, required): Import preview to save
- `options` (object, optional): Save options
  - `overwriteExisting` (boolean): Overwrite if duplicate ID exists
  - `renameIfDuplicate` (boolean): Generate new ID if duplicate exists

**Returns**: 
- `Promise<void>` - Resolves when save completes

**Errors**:
- Throws `Error` if preview is invalid
- Throws `Error` if localStorage save fails
- Throws `Error` if duplicate ID handling fails

**Example**:
```javascript
import { saveImportedRoute, getCurrentImportPreview } from './ui/route-import.js';

const preview = getCurrentImportPreview();
if (preview) {
  await saveImportedRoute(preview, { renameIfDuplicate: true });
  console.log('Route saved successfully');
}
```

---

### `checkDuplicateRouteId(routeId: string, routeType: string): boolean`

Checks if a route ID already exists in localStorage.

**Parameters**:
- `routeId` (string, required): Route ID to check
- `routeType` (string, required): Route type ("savedRoute" | "routeChain")

**Returns**: 
- `boolean` - `true` if duplicate exists, `false` otherwise

**Example**:
```javascript
import { checkDuplicateRouteId } from './utils/route-validator.js';

const isDuplicate = checkDuplicateRouteId('saved-route-123', 'savedRoute');
if (isDuplicate) {
  // Prompt user for overwrite/rename
}
```

---

### `handleDuplicateRouteId(routeId: string, routeType: string, userChoice: string): Promise<string>`

Handles duplicate route ID based on user choice.

**Parameters**:
- `routeId` (string, required): Original route ID
- `routeType` (string, required): Route type
- `userChoice` (string, required): User choice ("overwrite" | "rename" | "cancel")

**Returns**: 
- `Promise<string>` - Resolved route ID (original, new, or empty string if cancelled)

**Errors**:
- Throws `Error` if userChoice is invalid
- Throws `Error` if ID generation fails

**Example**:
```javascript
import { handleDuplicateRouteId } from './utils/route-validator.js';

const finalId = await handleDuplicateRouteId('route-123', 'savedRoute', 'rename');
if (finalId) {
  // Use finalId for save
}
```

---

## Validation Functions

### `validateRouteSchema(parsedData: object): { isValid: boolean, errors: array }`

Validates that parsed import data matches expected schema.

**Parameters**:
- `parsedData` (object, required): Parsed JSON data from import

**Returns**: 
- Object with `isValid` boolean and `errors` array

**Example**:
```javascript
import { validateRouteSchema } from './utils/route-validator.js';

const parsed = JSON.parse(decodedJson);
const validation = validateRouteSchema(parsed);
if (!validation.isValid) {
  validation.errors.forEach(err => console.error(err));
}
```

---

### `validateRouteData(routeData: object, routeType: string): { isValid: boolean, errors: array, warnings: array }`

Validates route-specific data structure.

**Parameters**:
- `routeData` (object, required): Route data to validate
- `routeType` (string, required): Route type

**Returns**: 
- Object with `isValid`, `errors`, and `warnings` arrays

**Example**:
```javascript
import { validateRouteData } from './utils/route-validator.js';

const validation = validateRouteData(routeData, 'savedRoute');
if (validation.warnings.length > 0) {
  validation.warnings.forEach(warn => console.warn(warn.message));
}
```

---

### `checkMissingCategoryReferences(routeData: object, routeType: string): array`

Checks for missing category references and returns warnings.

**Parameters**:
- `routeData` (object, required): Route data to check
- `routeType` (string, required): Route type

**Returns**: 
- Array of warning objects: `[{ type: "missingCategory", message: string }]`

**Example**:
```javascript
import { checkMissingCategoryReferences } from './utils/route-validator.js';

const warnings = checkMissingCategoryReferences(routeData, 'savedRoute');
warnings.forEach(warn => console.warn(warn.message));
```

---

## Error Classes

### `RouteExportError extends Error`

Error class for export failures.

**Properties**:
- `message` (string): Error message
- `routeType` (string): Route type that failed to export
- `originalError` (Error): Original error if any

---

### `RouteImportError extends Error`

Error class for import failures.

**Properties**:
- `message` (string): Error message
- `validationStage` (string): Stage where validation failed
- `originalError` (Error): Original error if any

---

### `RouteValidationError extends Error`

Error class for validation failures.

**Properties**:
- `message` (string): Error message
- `errors` (array): Array of validation errors
- `warnings` (array): Array of validation warnings

---

## Type Definitions

### `RouteExportFile`

```typescript
interface RouteExportFile {
  version: string;
  routeType: "savedRoute" | "routeChain" | "calculatedRoute" | "achievementRoute";
  exportedAt: number;
  routeData: object; // Varies by routeType
}
```

### `ImportValidationResult`

```typescript
interface ImportValidationResult {
  isValid: boolean;
  errors: Array<{ stage: string, message: string }>;
  warnings: Array<{ type: string, message: string }>;
  parsedData?: RouteExportFile;
  routeType?: string;
}
```

### `RouteImportPreview`

```typescript
interface RouteImportPreview {
  routeType: string;
  routeData: object;
  validationResult: ImportValidationResult;
  importedAt: number;
  fileName: string;
}
```


