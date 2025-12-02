/**
 * Route Import UI
 * Handles import functionality and file selection
 */

import { validateImportFile } from '../utils/route-validator.js';
import { RouteImportError } from '../utils/route-validator.js';

/**
 * Imports a route file, validates it, and returns validation result
 * @param {File} file - File object from file input
 * @returns {Promise<Object>} Promise resolving to ImportValidationResult
 * @throws {RouteImportError} If file read fails
 */
export async function importRouteFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new RouteImportError('No file provided', 'file', null));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        const validationResult = validateImportFile(fileContent);
        resolve(validationResult);
      } catch (error) {
        reject(new RouteImportError(
          `Failed to validate import file: ${error.message}`,
          'validation',
          error
        ));
      }
    };

    reader.onerror = (error) => {
      reject(new RouteImportError(
        'Failed to read file',
        'file',
        error
      ));
    };

    reader.readAsText(file);
  });
}

/**
 * Sets up import button with file selection handler
 * @param {HTMLElement} buttonElement - Button element to attach handler to
 * @param {Function} onImportComplete - Callback function called with validation result and filename
 */
export function setupImportButton(buttonElement, onImportComplete) {
  if (!buttonElement) {
    console.error('Import button element not found');
    return;
  }

  // Create hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.txt,.json'; // Accept both .txt (base64) and .json (for backwards compatibility)
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const result = await importRouteFile(file);
        if (onImportComplete) {
          onImportComplete(result, file.name);
        }
      } catch (error) {
        console.error('Import failed:', error);
        if (onImportComplete) {
          onImportComplete({
            isValid: false,
            errors: [{ stage: error.validationStage || 'unknown', message: error.message }],
            warnings: [],
            parsedData: null,
            routeType: null
          }, file.name);
        }
      }
    }

    // Reset file input to allow selecting the same file again
    fileInput.value = '';
  });

  // Trigger file input when button is clicked
  buttonElement.addEventListener('click', () => {
    fileInput.click();
  });

  // Store file input reference for cleanup if needed
  buttonElement._importFileInput = fileInput;
}

/**
 * Saves an imported route from preview to localStorage
 * @param {Object} preview - RouteImportPreview object
 * @param {Object} options - Save options (overwriteExisting, renameIfDuplicate)
 * @returns {Promise<void>} Resolves when save completes
 * @throws {Error} If save fails
 */
export async function saveImportedRoute(preview, options = {}) {
  if (!preview || !preview.routeData) {
    throw new Error('Invalid preview data');
  }

  const routeType = preview.routeType;
  const routeData = { ...preview.routeData }; // Clone to avoid mutating original

  // Import storage functions
  const { saveSavedRoute, saveRouteChain, getSavedRoutes, getRouteChains, getCategoryById } = await import('../storage.js');
  const { checkDuplicateRouteId, handleDuplicateRouteId, generateNewRouteId, checkMissingCategoryReferences } = await import('../utils/route-validator.js');

  // Check for duplicate ID
  let finalRouteId = routeData.id;
  if (routeData.id) {
    const isDuplicate = checkDuplicateRouteId(routeData.id, routeType, getSavedRoutes, getRouteChains);
    if (isDuplicate && !options.overwriteExisting) {
      if (options.renameIfDuplicate) {
        finalRouteId = generateNewRouteId(routeType);
        routeData.id = finalRouteId;
      } else {
        // Show dialog to user (simplified - in real implementation would use proper dialog)
        const userChoice = confirm(
          `Route with ID "${routeData.id}" already exists. ` +
          `Click OK to overwrite, or Cancel to rename.`
        ) ? 'overwrite' : 'rename';

        if (userChoice === 'cancel') {
          throw new Error('Import cancelled by user');
        }

        finalRouteId = await handleDuplicateRouteId(routeData.id, routeType, userChoice);
        if (!finalRouteId) {
          throw new Error('Import cancelled by user');
        }
        routeData.id = finalRouteId;
      }
    }
  } else {
    // Generate new ID if missing
    finalRouteId = generateNewRouteId(routeType);
    routeData.id = finalRouteId;
  }

  // Check for missing category references (warn but allow)
  const categoryWarnings = checkMissingCategoryReferences(routeData, routeType, getCategoryById);
  if (categoryWarnings.length > 0) {
    console.warn('Import warnings:', categoryWarnings);
    // Warnings are already displayed in preview, so we just log them here
  }

  // Set timestamps
  const now = Date.now();
  if (routeType === 'savedRoute') {
    routeData.savedAt = routeData.savedAt || now;
    routeData.lastAccessedAt = routeData.lastAccessedAt || now;
    saveSavedRoute(routeData);
  } else if (routeType === 'routeChain') {
    routeData.createdAt = routeData.createdAt || now;
    routeData.savedAt = routeData.savedAt || now;
    routeData.lastAccessedAt = routeData.lastAccessedAt || now;
    saveRouteChain(routeData);
  } else {
    throw new Error(`Cannot save route type: ${routeType}. Only savedRoute and routeChain can be saved.`);
  }
}

/**
 * Creates duplicate ID dialog UI component
 * @param {string} routeId - Duplicate route ID
 * @param {Function} onChoice - Callback with user choice ("overwrite" | "rename" | "cancel")
 * @returns {HTMLElement} Dialog element
 */
export function createDuplicateIdDialog(routeId, onChoice) {
  // TODO: Implement in T060
}

/**
 * Displays error message for import failures
 * @param {Array} errors - Array of error objects
 * @param {HTMLElement} container - Container element to display errors in
 */
export function displayImportErrors(errors, container) {
  if (!container || !errors || errors.length === 0) {
    return;
  }

  const errorHtml = `
    <div class="import-errors" role="alert">
      <h4>Import Failed</h4>
      <ul>
        ${errors.map(err => `<li><strong>${err.stage}:</strong> ${err.message}</li>`).join('')}
      </ul>
      <button class="btn-secondary" id="dismiss-errors-btn">Dismiss</button>
    </div>
  `;

  container.innerHTML = errorHtml;

  // Attach dismiss button
  const dismissBtn = container.querySelector('#dismiss-errors-btn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      container.innerHTML = '';
    });
  }
}

