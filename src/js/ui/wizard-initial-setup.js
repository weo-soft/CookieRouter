/**
 * Wizard Initial Setup Component (Step 1)
 * Handles initial setup: import save, manual setup, or fresh start
 */

import { SaveGameImportDialog } from './save-game-import-dialog.js';
import { StartingBuildingsSelector } from './starting-buildings.js';
import { getImportedSaveGame } from '../save-game-importer.js';

export class WizardInitialSetup {
  constructor(containerId, initialState = null, onUpdate = null) {
    this.container = document.getElementById(containerId);
    this.state = initialState || {
      setupChoice: null,
      importedSaveGame: null,
      manualBuildings: null,
      versionId: null
    };
    this.onUpdate = onUpdate;
    this.saveGameImportDialog = null;
    this.startingBuildingsSelector = null;
    this.importDialogContainer = null;
    this.manualSetupContainer = null;
  }

  /**
   * Render the initial setup step
   */
  render() {
    if (!this.container) return;

    const { setupChoice } = this.state;

    this.container.innerHTML = `
      <div class="wizard-step-content">
        <h2>Initial Setup</h2>
        <p class="step-description">Choose how you want to set up your starting game state:</p>
        
        <div class="setup-options">
          <label class="setup-option ${setupChoice === 'import' ? 'selected' : ''}">
            <input type="radio" name="setup-choice" value="import" ${setupChoice === 'import' ? 'checked' : ''}>
            <div class="option-content">
              <strong>Import Save Game</strong>
              <p>Import your Cookie Clicker save game to automatically configure starting buildings and settings</p>
            </div>
          </label>
          
          <label class="setup-option ${setupChoice === 'manual' ? 'selected' : ''}">
            <input type="radio" name="setup-choice" value="manual" ${setupChoice === 'manual' ? 'checked' : ''}>
            <div class="option-content">
              <strong>Manually Set Up Buildings</strong>
              <p>Manually configure which buildings you already own</p>
            </div>
          </label>
          
          <label class="setup-option ${setupChoice === 'fresh' ? 'selected' : ''}">
            <input type="radio" name="setup-choice" value="fresh" ${setupChoice === 'fresh' ? 'checked' : ''}>
            <div class="option-content">
              <strong>Start Fresh</strong>
              <p>Start from the beginning with no pre-owned buildings</p>
            </div>
          </label>
        </div>

        <div class="setup-content" id="setup-content-area"></div>
        
        <div class="error-message" id="step1-error" role="alert" aria-live="polite" style="display: none;"></div>
      </div>
    `;

    this.attachEventListeners();
    this.updateContent();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const radioButtons = this.container.querySelectorAll('input[name="setup-choice"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.handleChoiceChange(e.target.value);
      });
    });
  }

  /**
   * Handle setup choice change
   * @param {string} choice - Selected choice ('import', 'manual', or 'fresh')
   */
  handleChoiceChange(choice) {
    this.state.setupChoice = choice;
    this.updateContent();
    this.notifyUpdate();
  }

  /**
   * Update content area based on selected choice
   */
  updateContent() {
    const contentArea = this.container.querySelector('#setup-content-area');
    if (!contentArea) return;

    const { setupChoice } = this.state;

    // Clear previous content and destroy existing components
    contentArea.innerHTML = '';
    this.saveGameImportDialog = null;
    this.startingBuildingsSelector = null;

    if (setupChoice === 'import') {
      // Create container for import dialog (inline, not modal)
      this.importDialogContainer = document.createElement('div');
      this.importDialogContainer.id = 'wizard-import-dialog-container';
      contentArea.appendChild(this.importDialogContainer);

      // Create SaveGameImportDialog instance for inline use
      this.saveGameImportDialog = new SaveGameImportDialog(
        'wizard-import-dialog-container',
        (importedSaveGame) => {
          this.handleSaveGameImported(importedSaveGame);
        },
        () => {
          this.handleSaveGameCleared();
        }
      );

      // Show the import dialog inline
      this.saveGameImportDialog.show();

      // Get already imported save game if it exists
      const existingImport = getImportedSaveGame();
      if (existingImport) {
        this.handleSaveGameImported(existingImport);
      }
    } else if (setupChoice === 'manual') {
      // Create container for manual building selector
      this.manualSetupContainer = document.createElement('div');
      this.manualSetupContainer.id = 'wizard-manual-setup-container';
      contentArea.appendChild(this.manualSetupContainer);

      // Create StartingBuildingsSelector instance
      this.startingBuildingsSelector = new StartingBuildingsSelector(
        'wizard-manual-setup-container',
        (buildings) => {
          this.handleManualBuildingsUpdate(buildings);
        }
      );

      // Initialize with default version (will be updated if version is known)
      const versionId = this.state.versionId || 'v2052';
      this.startingBuildingsSelector.init(versionId);

      // Restore manual buildings if they exist
      if (this.state.manualBuildings) {
        this.startingBuildingsSelector.setStartingBuildings(this.state.manualBuildings);
      }
    } else if (setupChoice === 'fresh') {
      // Fresh start - no additional content needed
      contentArea.innerHTML = '<p class="info-text">Starting with no pre-owned buildings. Click Next to continue.</p>';
      // Clear any previous data
      this.state.importedSaveGame = null;
      this.state.manualBuildings = null;
      this.notifyUpdate();
    }
  }

  /**
   * Handle save game imported
   * @param {Object} importedSaveGame - Imported save game data
   */
  handleSaveGameImported(importedSaveGame) {
    this.state.importedSaveGame = importedSaveGame;
    if (importedSaveGame && importedSaveGame.version) {
      this.state.versionId = importedSaveGame.version;
    }
    this.clearErrors(); // Clear any previous errors
    this.notifyUpdate();
  }

  /**
   * Handle save game import error
   * @param {string} errorMessage - Error message
   */
  handleSaveGameImportError(errorMessage) {
    this.showErrors([errorMessage || 'Failed to import save game. Please check your save data and try again.']);
  }

  /**
   * Handle save game cleared
   */
  handleSaveGameCleared() {
    this.state.importedSaveGame = null;
    this.notifyUpdate();
  }

  /**
   * Handle manual buildings update
   * @param {Object} buildings - Building counts
   */
  handleManualBuildingsUpdate(buildings) {
    this.state.manualBuildings = buildings;
    this.notifyUpdate();
  }

  /**
   * Notify parent component of state update
   */
  notifyUpdate() {
    if (this.onUpdate) {
      this.onUpdate({ ...this.state });
    }
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Set state (for restoration when navigating back)
   * @param {Object} newState - New state to set
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
    
    // Restore component states if they exist
    if (newState.setupChoice === 'import' && this.saveGameImportDialog && newState.importedSaveGame) {
      // Import dialog will show the imported state automatically via getImportState()
    } else if (newState.setupChoice === 'manual' && this.startingBuildingsSelector && newState.manualBuildings) {
      this.startingBuildingsSelector.setStartingBuildings(newState.manualBuildings);
    }
  }

  /**
   * Show validation errors
   * @param {Array<string>} errors - Array of error messages
   */
  showErrors(errors) {
    const errorElement = this.container.querySelector('#step1-error');
    if (errorElement && errors && errors.length > 0) {
      // Display errors as a list for better readability
      errorElement.innerHTML = `
        <ul class="error-list">
          ${errors.map(error => `<li>${this.escapeHtml(error)}</li>`).join('')}
        </ul>
      `;
      errorElement.style.display = 'block';
      
      // Scroll to error message
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear validation errors
   */
  clearErrors() {
    this.showErrors([]);
  }

  /**
   * Highlight invalid option
   */
  highlightInvalidOption() {
    const options = this.container.querySelectorAll('.setup-option');
    options.forEach(option => {
      option.classList.add('error-option');
    });
  }

  /**
   * Clear option highlights
   */
  clearOptionHighlights() {
    const options = this.container.querySelectorAll('.setup-option');
    options.forEach(option => {
      option.classList.remove('error-option');
    });
  }
}

