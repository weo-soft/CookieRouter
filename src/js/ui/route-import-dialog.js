/**
 * Route Import Dialog UI component
 * Allows users to import routes by pasting data or selecting a file
 */

import { validateImportFile } from '../utils/route-validator.js';
import { RouteImportError } from '../utils/route-validator.js';
import { importRouteFile } from './route-import.js';

export class RouteImportDialog {
  constructor(containerId, onImportComplete) {
    this.container = document.getElementById(containerId);
    this.onImportComplete = onImportComplete;
  }

  /**
   * Show the import dialog
   */
  show() {
    this.render();
    this.attachEventListeners();
    
    // Focus on the textarea
    const textarea = this.container.querySelector('#paste-import-data');
    if (textarea) {
      textarea.focus();
    }
  }

  /**
   * Hide the import dialog
   */
  hide() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Render the dialog
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="route-import-dialog-overlay" role="dialog" aria-labelledby="import-dialog-title" aria-modal="true">
        <div class="route-import-dialog">
          <div class="dialog-header">
            <h2 id="import-dialog-title">Import Route</h2>
            <button type="button" class="dialog-close-btn" aria-label="Close dialog">&times;</button>
          </div>
          
          <div class="dialog-content">
            <div class="import-instructions">
              <p>Import a route by either pasting the base64-encoded data or selecting a file:</p>
            </div>

            <div class="import-options">
              <!-- Paste Option -->
              <div class="import-option">
                <h3>📋 Paste Data</h3>
                <div class="import-data-container">
                  <label for="paste-import-data">Route Data (Base64):</label>
                  <textarea 
                    id="paste-import-data" 
                    class="import-data-textarea"
                    placeholder="Paste your base64-encoded route data here..."
                    aria-label="Paste route data in base64 format"
                  ></textarea>
                  <p class="help-text">Paste the exported route data string here</p>
                </div>
                <div class="import-actions">
                  <button type="button" id="import-from-paste-btn" class="btn-primary">
                    Import from Paste
                  </button>
                </div>
              </div>

              <div class="import-divider">
                <span>OR</span>
              </div>

              <!-- File Option -->
              <div class="import-option">
                <h3>📁 Select File</h3>
                <div class="import-file-container">
                  <input 
                    type="file" 
                    id="file-import-input" 
                    accept=".txt,.json"
                    aria-label="Select route file to import"
                  >
                  <label for="file-import-input" class="file-input-label">
                    <span class="file-input-button">📁 Choose File</span>
                    <span class="file-input-name" id="selected-file-name">No file selected</span>
                  </label>
                  <p class="help-text">Select a .txt or .json file containing route data</p>
                </div>
                <div class="import-actions">
                  <button type="button" id="import-from-file-btn" class="btn-primary" disabled>
                    Import from File
                  </button>
                </div>
              </div>
            </div>

            <div class="import-error-container" id="import-error-container" role="alert"></div>
          </div>
          
          <div class="dialog-footer">
            <button type="button" id="cancel-import-btn" class="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeBtn = this.container.querySelector('.dialog-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Cancel button
    const cancelBtn = this.container.querySelector('#cancel-import-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Paste mode import
    const pasteImportBtn = this.container.querySelector('#import-from-paste-btn');
    if (pasteImportBtn) {
      pasteImportBtn.addEventListener('click', () => {
        this.handlePasteImport();
      });
    }

    // File mode - file selection
    const fileInput = this.container.querySelector('#file-import-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleFileSelection(e);
      });
    }

    // File mode import
    const fileImportBtn = this.container.querySelector('#import-from-file-btn');
    if (fileImportBtn) {
      fileImportBtn.addEventListener('click', () => {
        this.handleFileImport();
      });
    }

    // Close on overlay click
    const overlay = this.container.querySelector('.route-import-dialog-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide();
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.hide();
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }


  /**
   * Handle paste import
   */
  async handlePasteImport() {
    const textarea = this.container.querySelector('#paste-import-data');
    if (!textarea) return;

    const pastedData = textarea.value.trim();
    
    if (!pastedData) {
      this.showError('Please paste the route data into the field above.');
      return;
    }

    try {
      // Validate the pasted data
      const validationResult = validateImportFile(pastedData);
      
      if (validationResult.isValid) {
        // Success - call completion callback
        if (this.onImportComplete) {
          this.onImportComplete(validationResult, 'pasted-data');
        }
        this.hide();
      } else {
        // Show validation errors
        this.showErrors(validationResult.errors);
      }
    } catch (error) {
      console.error('Import failed:', error);
      this.showError(`Import failed: ${error.message}`);
    }
  }

  /**
   * Handle file selection
   * @param {Event} e - File input change event
   */
  handleFileSelection(e) {
    const file = e.target.files[0];
    const fileNameSpan = this.container.querySelector('#selected-file-name');
    const importBtn = this.container.querySelector('#import-from-file-btn');
    
    if (file) {
      if (fileNameSpan) {
        fileNameSpan.textContent = file.name;
      }
      if (importBtn) {
        importBtn.disabled = false;
      }
      this.clearErrors();
    } else {
      if (fileNameSpan) {
        fileNameSpan.textContent = 'No file selected';
      }
      if (importBtn) {
        importBtn.disabled = true;
      }
    }
  }

  /**
   * Handle file import
   */
  async handleFileImport() {
    const fileInput = this.container.querySelector('#file-import-input');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      this.showError('Please select a file to import.');
      return;
    }

    const file = fileInput.files[0];
    
    try {
      const result = await importRouteFile(file);
      
      if (result.isValid) {
        // Success - call completion callback
        if (this.onImportComplete) {
          this.onImportComplete(result, file.name);
        }
        this.hide();
      } else {
        // Show validation errors
        this.showErrors(result.errors);
      }
    } catch (error) {
      console.error('Import failed:', error);
      this.showError(`Import failed: ${error.message}`);
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorContainer = this.container.querySelector('#import-error-container');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="import-error">
          <strong>Error:</strong> ${this.escapeHtml(message)}
        </div>
      `;
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Show multiple error messages
   * @param {Array} errors - Array of error objects
   */
  showErrors(errors) {
    const errorContainer = this.container.querySelector('#import-error-container');
    if (errorContainer && errors && errors.length > 0) {
      errorContainer.innerHTML = `
        <div class="import-error">
          <strong>Import Failed</strong>
          <ul>
            ${errors.map(err => `<li><strong>${this.escapeHtml(err.stage || 'unknown')}:</strong> ${this.escapeHtml(err.message)}</li>`).join('')}
          </ul>
        </div>
      `;
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Clear error messages
   */
  clearErrors() {
    const errorContainer = this.container.querySelector('#import-error-container');
    if (errorContainer) {
      errorContainer.innerHTML = '';
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

