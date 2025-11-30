/**
 * Wizard Category Selection Component (Step 2)
 * Handles category selection: predefined or custom
 */

import { CategorySelector } from './category-selector.js';
import { CustomCategoryForm } from './custom-category-form.js';
import { getCategories } from '../storage.js';

export class WizardCategorySelection {
  constructor(containerId, initialState = null, onUpdate = null) {
    this.container = document.getElementById(containerId);
    this.state = initialState || {
      categoryType: null,
      selectedCategoryId: null,
      categoryConfig: null
    };
    this.onUpdate = onUpdate;
    this.categorySelector = null;
    this.customCategoryForm = null;
    this.categorySelectorContainer = null;
    this.customFormContainer = null;
    this.settingsAdjustmentContainer = null;
  }

  /**
   * Render the category selection step
   */
  async render() {
    if (!this.container) return;

    const { categoryType } = this.state;

    this.container.innerHTML = `
      <div class="wizard-step-content">
        <h2>Category Selection</h2>
        <p class="step-description">Choose a predefined category or create a custom one:</p>
        
        <div class="category-options">
          <label class="category-option ${categoryType === 'predefined' ? 'selected' : ''}">
            <input type="radio" name="category-type" value="predefined" ${categoryType === 'predefined' ? 'checked' : ''}>
            <div class="option-content">
              <strong>Predefined Category</strong>
              <p>Select from existing speedrun categories</p>
            </div>
          </label>
          
          <label class="category-option ${categoryType === 'custom' ? 'selected' : ''}">
            <input type="radio" name="category-type" value="custom" ${categoryType === 'custom' ? 'checked' : ''}>
            <div class="option-content">
              <strong>Custom Category</strong>
              <p>Create a custom category with your own settings</p>
            </div>
          </label>
        </div>

        <div class="category-content" id="category-content-area"></div>
        
        <div class="error-message" id="step2-error" role="alert" aria-live="polite" style="display: none;"></div>
      </div>
    `;

    this.attachEventListeners();
    await this.updateContent();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const radioButtons = this.container.querySelectorAll('input[name="category-type"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.handleTypeChange(e.target.value);
      });
    });
  }

  /**
   * Handle category type change
   * @param {string} type - Selected type ('predefined' or 'custom')
   */
  async handleTypeChange(type) {
    this.state.categoryType = type;
    // Clear previous selection when switching types
    if (type === 'predefined') {
      this.state.selectedCategoryId = null;
      this.state.categoryConfig = null;
    } else if (type === 'custom') {
      this.state.selectedCategoryId = null;
      this.state.categoryConfig = null;
    }
    await this.updateContent();
    this.notifyUpdate();
  }

  /**
   * Update content area based on selected type
   */
  async updateContent() {
    const contentArea = this.container.querySelector('#category-content-area');
    if (!contentArea) return;

    const { categoryType, selectedCategoryId } = this.state;

    // Clear previous content and destroy existing components
    contentArea.innerHTML = '';
    this.categorySelector = null;
    this.customCategoryForm = null;

    if (categoryType === 'predefined') {
      // Create container for category selector
      this.categorySelectorContainer = document.createElement('div');
      this.categorySelectorContainer.id = 'wizard-category-selector-container';
      contentArea.appendChild(this.categorySelectorContainer);

      // Create CategorySelector instance
      this.categorySelector = new CategorySelector(
        'wizard-category-selector-container',
        (category) => {
          this.handleCategorySelected(category);
        }
      );

      // Initialize category selector
      await this.categorySelector.init();

      // Create container for settings adjustment
      this.settingsAdjustmentContainer = document.createElement('div');
      this.settingsAdjustmentContainer.id = 'wizard-category-settings';
      this.settingsAdjustmentContainer.style.display = 'none';
      contentArea.appendChild(this.settingsAdjustmentContainer);

      // Restore selected category if navigating back
      // Use setTimeout to ensure categorySelector is fully initialized
      setTimeout(() => {
        if (selectedCategoryId && this.categorySelector) {
          this.categorySelector.selectCategory(selectedCategoryId);
          const category = this.categorySelector.getSelectedCategory();
          if (category) {
            this.showCategorySettings(category);
          }
        }
      }, 100);
    } else if (categoryType === 'custom') {
      // Create container for custom category form
      this.customFormContainer = document.createElement('div');
      this.customFormContainer.id = 'wizard-custom-category-container';
      contentArea.appendChild(this.customFormContainer);

      // Create CustomCategoryForm instance
      this.customCategoryForm = new CustomCategoryForm(
        'wizard-custom-category-container',
        (category) => {
          this.handleCustomCategoryCreated(category);
        },
        () => {
          // Cancel handler - do nothing, form stays visible
        }
      );

      // Show the custom category form
      this.customCategoryForm.show();

      // Restore custom category config if navigating back
      if (this.state.categoryConfig && !this.state.selectedCategoryId) {
        // Form will need to be populated with existing config
        // This will be handled by the form's state restoration
      }
    }
  }

  /**
   * Handle predefined category selection
   * @param {Object} category - Selected category
   */
  handleCategorySelected(category) {
    if (!category) {
      this.state.selectedCategoryId = null;
      this.state.categoryConfig = null;
      this.hideCategorySettings();
      this.notifyUpdate();
      return;
    }

    this.state.selectedCategoryId = category.id;
    
    // Create category config from predefined category
    this.state.categoryConfig = {
      name: category.name,
      version: category.version || 'v2052',
      targetCookies: category.targetCookies,
      playerCps: category.playerCps || 8,
      playerDelay: category.playerDelay || 1,
      hardcoreMode: category.hardcoreMode || false,
      initialBuildings: category.initialBuildings || {}
    };

    this.showCategorySettings(category);
    this.notifyUpdate();
  }

  /**
   * Show category settings adjustment UI
   * @param {Object} category - Category to show settings for
   */
  showCategorySettings(category) {
    if (!this.settingsAdjustmentContainer) return;

    this.settingsAdjustmentContainer.style.display = 'block';
    this.settingsAdjustmentContainer.innerHTML = `
      <div class="category-settings-adjustment">
        <h3>Adjust Category Settings (Optional)</h3>
        <p class="info-text">You can modify these settings before calculating the route.</p>
        
        <div class="form-group">
          <label for="wizard-target-cookies">Target Cookies:</label>
          <input 
            type="number" 
            id="wizard-target-cookies" 
            min="1" 
            value="${category.targetCookies || 1000000}"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="wizard-player-cps">Player CPS:</label>
          <input 
            type="number" 
            id="wizard-player-cps" 
            min="0" 
            step="0.1"
            value="${category.playerCps || 8}"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="wizard-player-delay">Player Delay (seconds):</label>
          <input 
            type="number" 
            id="wizard-player-delay" 
            min="0" 
            step="0.1"
            value="${category.playerDelay || 1}"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label>
            <input 
              type="checkbox" 
              id="wizard-hardcore-mode" 
              ${category.hardcoreMode ? 'checked' : ''}
            >
            Hardcore Mode (no upgrades)
          </label>
        </div>
      </div>
    `;

    // Attach event listeners for settings changes
    this.attachSettingsListeners();
  }

  /**
   * Attach event listeners for settings adjustment
   */
  attachSettingsListeners() {
    if (!this.settingsAdjustmentContainer) return;

    const targetCookiesInput = this.settingsAdjustmentContainer.querySelector('#wizard-target-cookies');
    const playerCpsInput = this.settingsAdjustmentContainer.querySelector('#wizard-player-cps');
    const playerDelayInput = this.settingsAdjustmentContainer.querySelector('#wizard-player-delay');
    const hardcoreModeInput = this.settingsAdjustmentContainer.querySelector('#wizard-hardcore-mode');

    const updateConfig = () => {
      if (this.state.categoryConfig) {
        this.state.categoryConfig.targetCookies = parseFloat(targetCookiesInput.value) || this.state.categoryConfig.targetCookies;
        this.state.categoryConfig.playerCps = parseFloat(playerCpsInput.value) || this.state.categoryConfig.playerCps;
        this.state.categoryConfig.playerDelay = parseFloat(playerDelayInput.value) || this.state.categoryConfig.playerDelay;
        this.state.categoryConfig.hardcoreMode = hardcoreModeInput.checked;
        this.notifyUpdate();
      }
    };

    if (targetCookiesInput) {
      targetCookiesInput.addEventListener('change', updateConfig);
      targetCookiesInput.addEventListener('input', updateConfig);
    }
    if (playerCpsInput) {
      playerCpsInput.addEventListener('change', updateConfig);
      playerCpsInput.addEventListener('input', updateConfig);
    }
    if (playerDelayInput) {
      playerDelayInput.addEventListener('change', updateConfig);
      playerDelayInput.addEventListener('input', updateConfig);
    }
    if (hardcoreModeInput) {
      hardcoreModeInput.addEventListener('change', updateConfig);
    }
  }

  /**
   * Hide category settings adjustment UI
   */
  hideCategorySettings() {
    if (this.settingsAdjustmentContainer) {
      this.settingsAdjustmentContainer.style.display = 'none';
    }
  }

  /**
   * Handle custom category created
   * @param {Object} category - Created custom category
   */
  handleCustomCategoryCreated(category) {
    this.state.selectedCategoryId = category.id;
    this.state.categoryConfig = {
      name: category.name,
      version: category.version || 'v2052',
      targetCookies: category.targetCookies,
      playerCps: category.playerCps || 8,
      playerDelay: category.playerDelay || 1,
      hardcoreMode: category.hardcoreMode || false,
      initialBuildings: category.initialBuildings || {}
    };
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
  async setState(newState) {
    this.state = { ...this.state, ...newState };
    await this.render();
    
    // Restore component states if they exist
    if (newState.categoryType === 'predefined' && this.categorySelector && newState.selectedCategoryId) {
      this.categorySelector.selectCategory(newState.selectedCategoryId);
      const category = this.categorySelector.getSelectedCategory();
      if (category) {
        this.showCategorySettings(category);
      }
    } else if (newState.categoryType === 'custom' && this.customCategoryForm && newState.categoryConfig) {
      // Custom form will need to be populated - this may require form modifications
    }
  }

  /**
   * Show validation errors
   * @param {Array<string>} errors - Array of error messages
   */
  showErrors(errors) {
    const errorElement = this.container.querySelector('#step2-error');
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
    this.clearFieldHighlights();
  }

  /**
   * Highlight invalid fields
   */
  highlightInvalidFields() {
    if (!this.settingsAdjustmentContainer) return;
    
    const errors = this.state.validationErrors.step2 || [];
    
    // Highlight target cookies if invalid
    if (errors.some(e => e.includes('Target cookies'))) {
      const input = this.settingsAdjustmentContainer.querySelector('#wizard-target-cookies');
      if (input) {
        input.classList.add('error-field');
      }
    }
    
    // Highlight player CPS if invalid
    if (errors.some(e => e.includes('Player CPS'))) {
      const input = this.settingsAdjustmentContainer.querySelector('#wizard-player-cps');
      if (input) {
        input.classList.add('error-field');
      }
    }
    
    // Highlight player delay if invalid
    if (errors.some(e => e.includes('Player delay'))) {
      const input = this.settingsAdjustmentContainer.querySelector('#wizard-player-delay');
      if (input) {
        input.classList.add('error-field');
      }
    }
  }

  /**
   * Clear field highlights
   */
  clearFieldHighlights() {
    if (!this.settingsAdjustmentContainer) return;
    
    const inputs = this.settingsAdjustmentContainer.querySelectorAll('.error-field');
    inputs.forEach(input => {
      input.classList.remove('error-field');
    });
  }
}

