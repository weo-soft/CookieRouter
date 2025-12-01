/**
 * Save Game Import Dialog UI component
 * Allows users to paste and import Cookie Clicker save game data
 */

import { importSaveGame, getImportState, clearImportedSaveGame } from '../save-game-importer.js';
import { SaveGameParseError, SaveGameDecodeError } from '../save-game-parser.js';
import { SaveGameValidationError, SaveGameVersionError } from '../save-game-importer.js';

export class SaveGameImportDialog {
  constructor(containerId, onImport, onClear, options = {}) {
    this.container = document.getElementById(containerId);
    this.onImport = onImport; // Callback when import succeeds
    this.onClear = onClear; // Callback when import is cleared
    this.isVisible = false;
    this.options = {
      autoHide: options.autoHide !== false, // Default to true, can be disabled for wizard context
      onImportComplete: options.onImportComplete || null // Optional callback after import completes
    };
  }

  /**
   * Show the import dialog
   */
  show() {
    this.isVisible = true;
    this.render();
    this.attachEventListeners();
    
    // Focus on the textarea
    const textarea = this.container.querySelector('#save-game-input');
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
    this.isVisible = false;
  }

  /**
   * Render the dialog
   */
  render() {
    if (!this.container) return;

    const importState = getImportState();
    const hasImport = importState.isLoaded;

    this.container.innerHTML = `
      <div class="save-game-import-dialog-overlay" role="dialog" aria-labelledby="save-game-import-dialog-title" aria-modal="true">
        <div class="save-game-import-dialog">
          <h2 id="save-game-import-dialog-title">Import Cookie Clicker Save Game</h2>
          <form id="save-game-import-form">
            <div class="form-group">
              <label for="save-game-input">Paste your Cookie Clicker save data:</label>
              <textarea 
                id="save-game-input" 
                rows="8"
                placeholder="Paste your exported save game data here..."
                required
                aria-required="true"
                aria-describedby="import-help"
              ></textarea>
              <p id="import-help" class="help-text">
                Export your save from Cookie Clicker (Options → Export save), then paste it here.
              </p>
              <p class="error-message" id="import-error" role="alert"></p>
              <p class="success-message" id="import-success" role="alert"></p>
              <div class="loading-indicator" id="import-loading" style="display: none;">
                <span class="spinner"></span>
                <span>Parsing save game data...</span>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary" id="import-btn">Import Save Game</button>
              ${hasImport ? '<button type="button" id="clear-import-btn" class="btn-secondary">Clear Import</button>' : ''}
              ${this.options.autoHide !== false ? '<button type="button" id="cancel-import-btn" class="btn-secondary">Cancel</button>' : ''}
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const form = this.container.querySelector('#save-game-import-form');
    const cancelBtn = this.container.querySelector('#cancel-import-btn');
    const clearBtn = this.container.querySelector('#clear-import-btn');

    form?.addEventListener('submit', this.handleSubmit.bind(this));
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', this.handleClear.bind(this));
    }

    // Close on overlay click (only if autoHide is enabled, i.e., modal mode)
    if (this.options.autoHide !== false) {
      const overlay = this.container.querySelector('.save-game-import-dialog-overlay');
      overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide();
        }
      });

      // Close on Escape key (only in modal mode)
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          this.hide();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    }
  }

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    const textarea = this.container.querySelector('#save-game-input');
    const saveString = textarea.value.trim();
    const errorElement = this.container.querySelector('#import-error');
    const successElement = this.container.querySelector('#import-success');
    const loadingElement = this.container.querySelector('#import-loading');
    const importBtn = this.container.querySelector('#import-btn');

    // Clear previous messages
    if (errorElement) errorElement.textContent = '';
    if (errorElement) errorElement.style.display = 'none';
    if (successElement) successElement.textContent = '';
    if (successElement) successElement.style.display = 'none';

    if (!saveString) {
      if (errorElement) {
        errorElement.textContent = 'Please paste your save game data.';
        errorElement.style.display = 'block';
      }
      return;
    }

    // Show loading indicator
    if (loadingElement) loadingElement.style.display = 'flex';
    if (importBtn) importBtn.disabled = true;

    try {
      // Import the save game
      const imported = await importSaveGame(saveString);
      
      // Update UI to show import status (this will also hide loading indicator)
      this.render();
      
      // Show success message after render
      const newSuccessElement = this.container.querySelector('#import-success');
      if (newSuccessElement) {
        newSuccessElement.textContent = 'Save game imported successfully!';
        newSuccessElement.style.display = 'block';
      }

      // Notify parent component
      if (this.onImport) {
        this.onImport(imported);
      }

      // Call optional import complete callback (for auto-advancing wizard)
      if (this.options.onImportComplete) {
        this.options.onImportComplete(imported);
      }

      // Hide import dialog after a short delay (only if autoHide is enabled)
      // The details dialog will be shown by the parent component
      if (this.options.autoHide) {
        setTimeout(() => {
          this.hide();
        }, 1000);
      }
    } catch (error) {
      console.error('Error importing save game:', error);
      
      // Show appropriate error message
      let errorMessage = 'Failed to import save game. Please check your save data and try again.';
      
      if (error instanceof SaveGameParseError) {
        errorMessage = `Failed to parse save game: ${error.message}`;
      } else if (error instanceof SaveGameDecodeError) {
        errorMessage = `Failed to decode save game: ${error.message}. Make sure the save data is complete and not corrupted.`;
      } else if (error instanceof SaveGameValidationError) {
        errorMessage = `Save game validation failed: ${error.validationErrors.join(', ')}`;
      } else if (error instanceof SaveGameVersionError) {
        errorMessage = `Unsupported version: ${error.detectedVersion}. Supported versions: ${error.supportedVersions.join(', ')}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      }
    } finally {
      // Hide loading indicator (get fresh reference in case render() was called)
      const currentLoadingElement = this.container.querySelector('#import-loading');
      if (currentLoadingElement) currentLoadingElement.style.display = 'none';
      
      // Re-enable import button (get fresh reference in case render() was called)
      const currentImportBtn = this.container.querySelector('#import-btn');
      if (currentImportBtn) currentImportBtn.disabled = false;
    }
  }

  /**
   * Handle clear import button click
   */
  handleClear() {
    clearImportedSaveGame();
    this.render();
    
    // Notify parent component
    if (this.onClear) {
      this.onClear();
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

