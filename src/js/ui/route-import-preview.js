/**
 * Route Import Preview UI
 * Displays preview of imported routes before saving
 */

// In-memory preview state (not persisted to localStorage)
let currentPreview = null;

/**
 * Displays import preview to user with route details
 * @param {Object} importData - Import data with validation result
 */
export function showImportPreview(importData) {
  if (!importData || !importData.validationResult || !importData.validationResult.isValid) {
    console.error('Cannot show preview: invalid import data');
    return;
  }

  currentPreview = {
    routeType: importData.routeType || importData.validationResult.routeType,
    routeData: importData.parsedData?.routeData || importData.validationResult.parsedData?.routeData,
    validationResult: importData.validationResult,
    importedAt: Date.now(),
    fileName: importData.fileName || 'unknown'
  };

  // Find or create preview container
  let container = document.getElementById('import-preview-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'import-preview-container';
    document.body.appendChild(container);
  }

  renderPreview(currentPreview, container);
}

/**
 * Gets the current import preview if one exists
 * @returns {Object|null} RouteImportPreview object or null
 */
export function getCurrentImportPreview() {
  return currentPreview;
}

/**
 * Clears the current import preview from memory
 */
export function clearImportPreview() {
  currentPreview = null;
  const container = document.getElementById('import-preview-container');
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Renders preview UI showing route details
 * @param {Object} previewData - Preview data to render
 * @param {HTMLElement} container - Container element to render into
 */
export function renderPreview(previewData, container) {
  if (!previewData || !container) {
    return;
  }

  const routeData = previewData.routeData;
  const routeType = previewData.routeType;

  // Build preview HTML
  let html = `
    <div class="import-preview">
      <h3>Route Import Preview</h3>
      <div class="preview-info">
        <p><strong>File:</strong> ${escapeHtml(previewData.fileName)}</p>
        <p><strong>Route Type:</strong> ${escapeHtml(routeType)}</p>
        <p><strong>Imported:</strong> ${new Date(previewData.importedAt).toLocaleString()}</p>
      </div>
  `;

  // Display route-specific information
  if (routeType === 'savedRoute' || routeType === 'calculatedRoute') {
    html += `
      <div class="preview-route-details">
        <p><strong>Name:</strong> ${routeData.name || routeData.categoryName || 'Unnamed'}</p>
        <p><strong>Category:</strong> ${routeData.categoryName || routeData.categoryId || 'N/A'}</p>
        <p><strong>Version:</strong> ${routeData.versionId || 'N/A'}</p>
        <p><strong>Buildings:</strong> ${routeData.buildings?.length || routeData.routeData?.buildings?.length || 0} steps</p>
        <p><strong>Algorithm:</strong> ${routeData.algorithm || routeData.routeData?.algorithm || 'N/A'}</p>
        ${routeData.completionTime || routeData.routeData?.completionTime ? `<p><strong>Completion Time:</strong> ${(routeData.completionTime || routeData.routeData.completionTime).toFixed(2)}s</p>` : ''}
      </div>
    `;
  } else if (routeType === 'routeChain') {
    html += `
      <div class="preview-route-details">
        <p><strong>Name:</strong> ${routeData.name || 'Unnamed Chain'}</p>
        <p><strong>Routes:</strong> ${routeData.routes?.length || 0} routes in chain</p>
        ${routeData.overallProgress ? `<p><strong>Progress:</strong> ${routeData.overallProgress.completedRoutes || 0}/${routeData.overallProgress.totalRoutes || 0} completed</p>` : ''}
      </div>
    `;
  } else if (routeType === 'achievementRoute') {
    html += `
      <div class="preview-route-details">
        <p><strong>Achievements:</strong> ${routeData.achievementIds?.join(', ') || 'N/A'}</p>
        <p><strong>Version:</strong> ${routeData.versionId || 'N/A'}</p>
        <p><strong>Buildings:</strong> ${routeData.buildings?.length || 0} steps</p>
      </div>
    `;
  }

  // Display warnings if any
  if (previewData.validationResult.warnings && previewData.validationResult.warnings.length > 0) {
    html += `
      <div class="preview-warnings">
        <h4>Warnings:</h4>
        <ul>
          ${previewData.validationResult.warnings.map(w => `<li>${escapeHtml(w.message)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // Add action buttons
  html += `
      <div class="preview-actions">
        <button id="save-imported-route-btn" class="btn-primary">Save Route</button>
        <button id="cancel-import-btn" class="btn-secondary">Cancel</button>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Attach event handlers
  const saveBtn = container.querySelector('#save-imported-route-btn');
  const cancelBtn = container.querySelector('#cancel-import-btn');

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      try {
        // Import saveImportedRoute dynamically to avoid circular dependency
        const { saveImportedRoute } = await import('./route-import.js');
        await saveImportedRoute(previewData);
        clearImportPreview();
        
        // Show success message
        alert('Route imported successfully!');
        
        // Refresh saved routes list if it exists
        const savedRoutesSection = document.getElementById('saved-routes-section');
        if (savedRoutesSection) {
          // Trigger a custom event to refresh the saved routes list
          const refreshEvent = new CustomEvent('refreshSavedRoutes');
          window.dispatchEvent(refreshEvent);
        }
      } catch (error) {
        console.error('Failed to save imported route:', error);
        alert(`Failed to save route: ${error.message}`);
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      clearImportPreview();
    });
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

