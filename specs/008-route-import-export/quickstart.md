# Quickstart: Route Import/Export

**Feature**: Route Import/Export  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This quickstart guide provides step-by-step instructions for implementing the route import/export feature. The feature allows users to export any calculated route (saved or unsaved, custom, predefined, chained, or achievement-based) and import route files with preview before saving.

## Architecture Summary

### Components

1. **Route Serializer** (`src/js/utils/route-serializer.js`): Handles serialization/deserialization and base64 encoding/decoding
2. **Route Validator** (`src/js/utils/route-validator.js`): Validates imported route files through multiple stages
3. **Route Export UI** (`src/js/ui/route-export.js`): Export functionality and file download
4. **Route Import UI** (`src/js/ui/route-import.js`): Import functionality and file selection
5. **Route Import Preview** (`src/js/ui/route-import-preview.js`): Preview display component

### Data Flow

**Export**: Route Data → Serialize → Base64 Encode → File Download  
**Import**: File Selection → Read → Base64 Decode → Validate → Preview → Save

## Implementation Steps

### Step 1: Create Route Serializer

**File**: `src/js/utils/route-serializer.js`

**Purpose**: Handle route serialization and base64 encoding/decoding

**Key Functions**:
- `serializeRouteForExport(routeData, routeType)`: Serialize route to base64-encoded JSON
- `deserializeRouteFromImport(base64String)`: Deserialize base64-encoded route data

**Implementation Notes**:
- Use `JSON.stringify()` for serialization
- Use `btoa()` for base64 encoding
- Use `atob()` for base64 decoding
- Use `JSON.parse()` for deserialization
- Wrap route data in export file structure: `{ version, routeType, exportedAt, routeData }`

**Example**:
```javascript
export function serializeRouteForExport(routeData, routeType) {
  const exportFile = {
    version: "1.0",
    routeType: routeType,
    exportedAt: Date.now(),
    routeData: routeData
  };
  const jsonString = JSON.stringify(exportFile);
  return btoa(jsonString);
}
```

---

### Step 2: Create Route Validator

**File**: `src/js/utils/route-validator.js`

**Purpose**: Validate imported route files through multiple stages

**Key Functions**:
- `validateImportFile(fileContent)`: Multi-stage validation
- `validateRouteSchema(parsedData)`: Schema validation
- `validateRouteData(routeData, routeType)`: Route-specific validation
- `checkMissingCategoryReferences(routeData, routeType)`: Check for missing categories
- `checkDuplicateRouteId(routeId, routeType)`: Check for duplicate IDs

**Validation Stages**:
1. Base64 format validation
2. Base64 decoding
3. JSON parsing
4. Schema validation
5. Route-specific validation

**Example**:
```javascript
export function validateImportFile(fileContent) {
  const result = {
    isValid: false,
    errors: [],
    warnings: [],
    parsedData: null,
    routeType: null
  };

  // Stage 1: Base64 validation
  if (!isValidBase64(fileContent)) {
    result.errors.push({ stage: "base64", message: "Invalid base64 format" });
    return result;
  }

  // Stage 2: Decode
  let decoded;
  try {
    decoded = atob(fileContent);
  } catch (error) {
    result.errors.push({ stage: "base64", message: "Base64 decoding failed" });
    return result;
  }

  // Stage 3: JSON parse
  let parsed;
  try {
    parsed = JSON.parse(decoded);
  } catch (error) {
    result.errors.push({ stage: "json", message: "Invalid JSON format" });
    return result;
  }

  // Stage 4: Schema validation
  const schemaValidation = validateRouteSchema(parsed);
  if (!schemaValidation.isValid) {
    result.errors.push(...schemaValidation.errors);
    return result;
  }

  // Stage 5: Route-specific validation
  const routeValidation = validateRouteData(parsed.routeData, parsed.routeType);
  result.errors.push(...routeValidation.errors);
  result.warnings.push(...routeValidation.warnings);

  // Check missing categories
  const categoryWarnings = checkMissingCategoryReferences(parsed.routeData, parsed.routeType);
  result.warnings.push(...categoryWarnings);

  if (result.errors.length === 0) {
    result.isValid = true;
    result.parsedData = parsed;
    result.routeType = parsed.routeType;
  }

  return result;
}
```

---

### Step 3: Create Route Export UI

**File**: `src/js/ui/route-export.js`

**Purpose**: Export functionality and file download

**Key Functions**:
- `exportRoute(routeData, routeType, routeName)`: Main export function
- `createExportFile(base64Content, fileName)`: Create and download file
- `generateExportFileName(routeType, routeName)`: Generate descriptive filename

**Implementation Notes**:
- Use `Blob` API to create file
- Use `URL.createObjectURL()` for download link
- Use `<a>` element with `download` attribute to trigger download
- Filename format: `cookie-router-{routeType}-{sanitizedName}-{timestamp}.json`

**Example**:
```javascript
export function exportRoute(routeData, routeType, routeName) {
  // Serialize and encode
  const base64Content = serializeRouteForExport(routeData, routeType);
  
  // Generate filename
  const fileName = generateExportFileName(routeType, routeName);
  
  // Create and download file
  createExportFile(base64Content, fileName);
}

function createExportFile(base64Content, fileName) {
  const blob = new Blob([base64Content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

---

### Step 4: Create Route Import UI

**File**: `src/js/ui/route-import.js`

**Purpose**: Import functionality and file selection

**Key Functions**:
- `importRouteFile(file)`: Main import function
- `setupImportButton(buttonElement, onImportComplete)`: Setup import button
- `handleFileSelection(file)`: Handle file selection

**Implementation Notes**:
- Use `<input type="file">` for file selection
- Read file as text using `FileReader`
- Validate file after reading
- Show preview on successful validation
- Show errors on validation failure

**Example**:
```javascript
export async function importRouteFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const fileContent = e.target.result;
      const validationResult = validateImportFile(fileContent);
      resolve(validationResult);
    };
    
    reader.onerror = (error) => {
      reject(new RouteImportError('Failed to read file', 'file', error));
    };
    
    reader.readAsText(file);
  });
}

export function setupImportButton(buttonElement, onImportComplete) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const result = await importRouteFile(file);
        onImportComplete(result, file.name);
      } catch (error) {
        console.error('Import failed:', error);
      }
    }
  });
  
  buttonElement.addEventListener('click', () => {
    fileInput.click();
  });
}
```

---

### Step 5: Create Route Import Preview

**File**: `src/js/ui/route-import-preview.js`

**Purpose**: Preview display component

**Key Functions**:
- `showImportPreview(importData)`: Display preview
- `getCurrentImportPreview()`: Get current preview
- `clearImportPreview()`: Clear preview
- `renderPreview(previewData, container)`: Render preview UI

**Implementation Notes**:
- Store preview in module-level variable (memory only)
- Display route details: name, type, building steps, metadata
- Show warnings for missing categories
- Provide "Save" and "Cancel" buttons
- Use existing route display components for consistency

**Example**:
```javascript
let currentPreview = null;

export function showImportPreview(importData) {
  currentPreview = {
    routeType: importData.routeType,
    routeData: importData.parsedData.routeData,
    validationResult: importData,
    importedAt: Date.now(),
    fileName: importData.fileName
  };
  
  renderPreview(currentPreview, document.getElementById('import-preview-container'));
}

export function getCurrentImportPreview() {
  return currentPreview;
}

export function clearImportPreview() {
  currentPreview = null;
  const container = document.getElementById('import-preview-container');
  if (container) {
    container.innerHTML = '';
  }
}
```

---

### Step 6: Integrate Export Buttons

**Integration Points**:
1. **Saved Route Display**: Add export button to saved route view
2. **Route Chain Display**: Add export button to route chain view
3. **Calculated Route Display**: Add export button to calculated route view
4. **Achievement Route Display**: Add export button to achievement route view

**Implementation**:
- Add export button to each route display component
- Call `exportRoute()` with appropriate route data and type
- Determine route type based on context

**Example**:
```javascript
// In saved route display component
function addExportButton(routeElement, savedRoute) {
  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export Route';
  exportBtn.addEventListener('click', () => {
    exportRoute(savedRoute, 'savedRoute', savedRoute.name);
  });
  routeElement.appendChild(exportBtn);
}
```

---

### Step 7: Integrate Import Functionality

**Integration Points**:
1. **Main Navigation**: Add "Import Route" button to main UI
2. **Route List View**: Add import option to route management

**Implementation**:
- Add import button to main UI
- Setup file selection on button click
- Show preview after successful import
- Handle save/cancel actions

**Example**:
```javascript
// In main.js or route management component
import { setupImportButton, saveImportedRoute, getCurrentImportPreview } from './ui/route-import.js';
import { showImportPreview, clearImportPreview } from './ui/route-import-preview.js';

const importBtn = document.getElementById('import-route-btn');
setupImportButton(importBtn, (validationResult, fileName) => {
  if (validationResult.isValid) {
    showImportPreview({
      routeType: validationResult.routeType,
      parsedData: validationResult.parsedData,
      validationResult: validationResult,
      fileName: fileName
    });
  } else {
    // Show error messages
    displayImportErrors(validationResult.errors);
  }
});

// Save button handler
document.getElementById('save-imported-route-btn').addEventListener('click', async () => {
  const preview = getCurrentImportPreview();
  if (preview) {
    try {
      await saveImportedRoute(preview);
      clearImportPreview();
      showSuccessMessage('Route imported successfully');
      refreshRouteList();
    } catch (error) {
      showErrorMessage('Failed to save route: ' + error.message);
    }
  }
});
```

---

### Step 8: Handle Duplicate IDs

**Implementation**:
- Check for duplicates before saving
- Show dialog with options: overwrite, rename, cancel
- Generate new ID if rename chosen
- Update route data with new ID before saving

**Example**:
```javascript
async function saveImportedRoute(preview) {
  const routeId = preview.routeData.id;
  const routeType = preview.routeType;
  
  // Check for duplicate
  if (checkDuplicateRouteId(routeId, routeType)) {
    const userChoice = await showDuplicateDialog(routeId);
    if (userChoice === 'cancel') {
      return;
    }
    
    if (userChoice === 'rename') {
      preview.routeData.id = generateNewRouteId(routeType);
    }
  }
  
  // Save to localStorage
  if (routeType === 'savedRoute') {
    saveSavedRoute(preview.routeData);
  } else if (routeType === 'routeChain') {
    saveRouteChain(preview.routeData);
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Route serializer: Serialize/deserialize all route types
- [ ] Route serializer: Base64 encoding/decoding
- [ ] Route validator: All validation stages
- [ ] Route validator: Missing category detection
- [ ] Route validator: Duplicate ID detection

### Integration Tests

- [ ] Export workflow: Export saved route → download file
- [ ] Export workflow: Export route chain → download file
- [ ] Export workflow: Export calculated route → download file
- [ ] Import workflow: Select file → validate → preview
- [ ] Import workflow: Preview → save → verify in localStorage
- [ ] Import workflow: Preview → cancel → no save
- [ ] Duplicate handling: Overwrite existing route
- [ ] Duplicate handling: Rename imported route
- [ ] Error handling: Invalid file format
- [ ] Error handling: Missing required fields

---

## Common Patterns

### Export Pattern

```javascript
// 1. Get route data
const routeData = getRouteData(); // From current display or storage

// 2. Determine route type
const routeType = determineRouteType(routeData);

// 3. Get route name
const routeName = getRouteName(routeData);

// 4. Export
exportRoute(routeData, routeType, routeName);
```

### Import Pattern

```javascript
// 1. User selects file
// 2. Read file
const validationResult = await importRouteFile(file);

// 3. Validate
if (validationResult.isValid) {
  // 4. Show preview
  showImportPreview(validationResult);
  
  // 5. User reviews and saves
  await saveImportedRoute(preview);
} else {
  // Show errors
  displayErrors(validationResult.errors);
}
```

---

## Next Steps

1. Implement route serializer utility
2. Implement route validator utility
3. Implement export UI component
4. Implement import UI component
5. Implement preview component
6. Integrate export buttons into route displays
7. Integrate import functionality into main UI
8. Add error handling and user feedback
9. Write unit tests
10. Write integration tests








