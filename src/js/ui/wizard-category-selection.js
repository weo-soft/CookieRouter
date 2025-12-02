/**
 * Wizard Category Selection Component (Step 2)
 * Handles category selection: predefined or custom
 */

import { CategorySelector } from './category-selector.js';
import { CustomCategoryForm } from './custom-category-form.js';
import { WizardAchievementSelection } from './wizard-achievement-selection.js';
import { WizardRouteChainSelection } from './wizard-route-chain-selection.js';
import { getCategories } from '../storage.js';

export class WizardCategorySelection {
  constructor(containerId, initialState = null, onUpdate = null, onAutoAdvance = null) {
    this.container = document.getElementById(containerId);
    this.state = initialState || {
      categoryType: null,
      selectedCategoryId: null,
      categoryConfig: null,
      achievementIds: null
    };
    this.onUpdate = onUpdate;
    this.onAutoAdvance = onAutoAdvance;
    this.categorySelector = null;
    this.customCategoryForm = null;
    this.achievementSelection = null;
    this.categorySelectorContainer = null;
    this.customFormContainer = null;
    this.achievementSelectionContainer = null;
  }

  /**
   * Render the category selection step
   */
  async render() {
    if (!this.container) return;

    const { categoryType } = this.state;

    this.container.innerHTML = `
      <div class="wizard-step-content">
        <h2>Route Type Selection</h2>
        <p class="step-description">Choose how you want to create your route:</p>
        
        <div class="category-options">
          <div class="category-option-wrapper ${categoryType === 'predefined' ? 'expanded' : ''}" data-option="predefined">
            <label class="category-option ${categoryType === 'predefined' ? 'selected' : ''}">
              <input type="radio" name="category-type" value="predefined" ${categoryType === 'predefined' ? 'checked' : ''}>
              <div class="option-content">
                <strong>Predefined Category</strong>
                <p>Select from existing speedrun categories</p>
              </div>
            </label>
            <div class="category-option-content" id="category-content-predefined" style="display: ${categoryType === 'predefined' ? 'block' : 'none'};">
              <!-- Content will be inserted here -->
            </div>
          </div>
          
          <div class="category-option-wrapper ${categoryType === 'custom' ? 'expanded' : ''}" data-option="custom">
            <label class="category-option ${categoryType === 'custom' ? 'selected' : ''}">
              <input type="radio" name="category-type" value="custom" ${categoryType === 'custom' ? 'checked' : ''}>
              <div class="option-content">
                <strong>Custom Category</strong>
                <p>Create a custom category with your own settings</p>
              </div>
            </label>
            <div class="category-option-content" id="category-content-custom" style="display: ${categoryType === 'custom' ? 'block' : 'none'};">
              <!-- Content will be inserted here -->
            </div>
          </div>
          
          <div class="category-option-wrapper ${categoryType === 'achievement' ? 'expanded' : ''}" data-option="achievement">
            <label class="category-option ${categoryType === 'achievement' ? 'selected' : ''}">
              <input type="radio" name="category-type" value="achievement" ${categoryType === 'achievement' ? 'checked' : ''}>
              <div class="option-content">
                <strong>Achievement-based Route</strong>
                <p>Calculate route to unlock specific achievements</p>
              </div>
            </label>
            <div class="category-option-content" id="category-content-achievement" style="display: ${categoryType === 'achievement' ? 'block' : 'none'};">
              <!-- Content will be inserted here -->
            </div>
          </div>
          
          <div class="category-option-wrapper ${categoryType === 'chain' ? 'expanded' : ''}" data-option="chain">
            <label class="category-option ${categoryType === 'chain' ? 'selected' : ''}">
              <input type="radio" name="category-type" value="chain" ${categoryType === 'chain' ? 'checked' : ''}>
              <div class="option-content">
                <strong>Route Chain</strong>
                <p>Create a sequence of routes that build upon each other</p>
              </div>
            </label>
            <div class="category-option-content" id="category-content-chain" style="display: ${categoryType === 'chain' ? 'block' : 'none'};">
              <!-- Route chain selection will be inserted here -->
            </div>
          </div>
        </div>
        
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

    // Add click handlers to labels to allow collapsing when clicking already selected option
    const optionLabels = this.container.querySelectorAll('.category-option');
    optionLabels.forEach(label => {
      label.addEventListener('click', (e) => {
        // Don't handle if clicking on the radio button itself (it will trigger change event)
        if (e.target.type === 'radio') {
          return;
        }
        
        const radio = label.querySelector('input[type="radio"]');
        if (!radio) return;
        
        const optionValue = radio.value;
        
        // If this option is already selected, deselect it
        if (this.state.categoryType === optionValue) {
          e.preventDefault();
          e.stopPropagation();
          // Uncheck the radio button
          radio.checked = false;
          // Clear the selection
          this.handleTypeChange(null);
        }
        // Otherwise, let the default behavior select it
      });
    });
  }

  /**
   * Handle category type change
   * @param {string|null} type - Selected type ('predefined', 'custom', or null to deselect)
   */
  async handleTypeChange(type) {
    this.state.categoryType = type;
    
    // Uncheck all radio buttons first
    const allRadios = this.container.querySelectorAll('input[name="category-type"]');
    allRadios.forEach(radio => {
      radio.checked = false;
    });
    
    // Update selected state for all options
    const allOptions = this.container.querySelectorAll('.category-option');
    allOptions.forEach(option => {
      option.classList.remove('selected');
    });
    
    // Update expanded state for all wrappers
    const allWrappers = this.container.querySelectorAll('.category-option-wrapper');
    allWrappers.forEach(wrapper => {
      wrapper.classList.remove('expanded');
    });
    
    if (type) {
      // Check the selected radio button
      const selectedRadio = this.container.querySelector(`input[name="category-type"][value="${type}"]`);
      if (selectedRadio) {
        selectedRadio.checked = true;
      }
      
      const selectedWrapper = this.container.querySelector(`[data-option="${type}"]`);
      if (selectedWrapper) {
        const selectedOption = selectedWrapper.querySelector('.category-option');
        if (selectedOption) {
          selectedOption.classList.add('selected');
        }
        selectedWrapper.classList.add('expanded');
      }
      
      // Clear previous selection when switching types
      if (type === 'predefined') {
        this.state.selectedCategoryId = null;
        this.state.categoryConfig = null;
        this.state.achievementIds = null;
      } else if (type === 'custom') {
        this.state.selectedCategoryId = null;
        this.state.categoryConfig = null;
        this.state.achievementIds = null;
      } else if (type === 'achievement') {
        this.state.selectedCategoryId = null;
        this.state.categoryConfig = null;
        // Keep achievementIds if already set
      }
    } else {
      // Deselecting - clear all category data
      this.state.selectedCategoryId = null;
      this.state.categoryConfig = null;
      this.state.achievementIds = null;
      this.state.selectedRoutes = null;
    }
    
    await this.updateContent();
    this.notifyUpdate();
  }

  /**
   * Update content area based on selected type
   */
  async updateContent() {
    const { categoryType, selectedCategoryId } = this.state;

    // Get all option wrappers and content areas using data attributes
    const predefinedWrapper = this.container.querySelector('[data-option="predefined"]');
    const customWrapper = this.container.querySelector('[data-option="custom"]');
    const achievementWrapper = this.container.querySelector('[data-option="achievement"]');
    const chainWrapper = this.container.querySelector('[data-option="chain"]');
    
    const predefinedContent = this.container.querySelector('#category-content-predefined');
    const customContent = this.container.querySelector('#category-content-custom');
    const achievementContent = this.container.querySelector('#category-content-achievement');
    const chainContent = this.container.querySelector('#category-content-chain');

    // Update expanded state for all wrappers
    [predefinedWrapper, customWrapper, achievementWrapper, chainWrapper].forEach(wrapper => {
      if (wrapper) {
        wrapper.classList.remove('expanded');
      }
    });

    // Clear previous content and destroy existing components
    if (predefinedContent) predefinedContent.innerHTML = '';
    if (customContent) customContent.innerHTML = '';
    if (achievementContent) achievementContent.innerHTML = '';
    if (chainContent) chainContent.innerHTML = '';
    
    this.categorySelector = null;
    this.customCategoryForm = null;
    this.achievementSelection = null;
    this.routeChainSelection = null;

    if (categoryType === 'predefined') {
      // Expand predefined option
      if (predefinedWrapper) predefinedWrapper.classList.add('expanded');
      if (predefinedContent) predefinedContent.style.display = 'block';

      // Create container for category selector
      this.categorySelectorContainer = document.createElement('div');
      this.categorySelectorContainer.id = 'wizard-category-selector-container';
      if (predefinedContent) {
        predefinedContent.appendChild(this.categorySelectorContainer);
      }

      // Create CategorySelector instance
      // Hide create button since custom categories are handled in the wizard's second collapsible
      this.categorySelector = new CategorySelector(
        'wizard-category-selector-container',
        (category) => {
          this.handleCategorySelected(category);
        },
        {
          showCreateButton: false, // Hide create button in wizard context
          onSettingsChange: (category) => {
            // Update category config when settings are changed in expanded view
            this.handleCategorySelected(category);
          }
        }
      );

      // Initialize category selector
      await this.categorySelector.init();

      // Restore selected category if navigating back
      // Use setTimeout to ensure categorySelector is fully initialized
      setTimeout(() => {
        if (selectedCategoryId && this.categorySelector) {
          this.categorySelector.selectCategory(selectedCategoryId);
        }
      }, 100);
    } else if (categoryType === 'custom') {
      // Expand custom option
      if (customWrapper) customWrapper.classList.add('expanded');
      if (customContent) customContent.style.display = 'block';

      // Create container for custom category form
      this.customFormContainer = document.createElement('div');
      this.customFormContainer.id = 'wizard-custom-category-container';
      if (customContent) {
        customContent.appendChild(this.customFormContainer);
      }

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
    } else if (categoryType === 'achievement') {
      // Expand achievement option
      if (achievementWrapper) achievementWrapper.classList.add('expanded');
      if (achievementContent) achievementContent.style.display = 'block';

      // Create container for achievement selection
      this.achievementSelectionContainer = document.createElement('div');
      this.achievementSelectionContainer.id = 'wizard-achievement-selection-container';
      if (achievementContent) {
        achievementContent.appendChild(this.achievementSelectionContainer);
      }

      // Create WizardAchievementSelection instance
      this.achievementSelection = new WizardAchievementSelection(
        'wizard-achievement-selection-container',
        {
          selectedAchievementIds: this.state.achievementIds || [],
          searchQuery: '',
          requirementTypeFilter: null,
          routeableOnly: true
        },
        (state) => {
          this.handleAchievementSelection(state);
        }
      );

      // Render achievement selection
      await this.achievementSelection.render();

      // Restore selected achievements if navigating back
      if (this.state.achievementIds && this.state.achievementIds.length > 0) {
        this.achievementSelection.setState({
          selectedAchievementIds: this.state.achievementIds
        });
      }
    } else if (categoryType === 'chain') {
      // Expand chain option
      if (chainWrapper) chainWrapper.classList.add('expanded');
      if (chainContent) chainContent.style.display = 'block';

      // Create container for route chain selection
      this.routeChainSelectionContainer = document.createElement('div');
      this.routeChainSelectionContainer.id = 'wizard-route-chain-selection-container';
      if (chainContent) {
        chainContent.appendChild(this.routeChainSelectionContainer);
      }

      // Create WizardRouteChainSelection instance
      this.routeChainSelection = new WizardRouteChainSelection(
        'wizard-route-chain-selection-container',
        (routes) => {
          this.handleRouteChainSelected(routes);
        }
      );

      // Render route chain selection
      await this.routeChainSelection.render();

      // Restore selected routes if navigating back
      if (this.state.selectedRoutes && this.state.selectedRoutes.length > 0) {
        // Restore routes to chain selection
        this.state.selectedRoutes.forEach(route => {
          this.routeChainSelection.addRoute(route.routeConfig);
        });
      }
    } else {
      // No option selected - collapse all
      if (predefinedContent) predefinedContent.style.display = 'none';
      if (customContent) customContent.style.display = 'none';
      if (achievementContent) achievementContent.style.display = 'none';
      if (chainContent) chainContent.style.display = 'none';
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
      this.notifyUpdate();
      return;
    }

    this.state.selectedCategoryId = category.id;
    
    // Create category config from predefined category (or updated category with custom settings)
    this.state.categoryConfig = {
      name: category.name,
      version: category.version || 'v2052',
      targetCookies: category.targetCookies,
      playerCps: category.playerCps || 8,
      playerDelay: category.playerDelay || 1,
      hardcoreMode: category.hardcoreMode || false,
      initialBuildings: category.initialBuildings || {}
    };

    // Settings are now handled inline in the expanded category item
    this.notifyUpdate();
  }

  /**
   * Handle route chain selection
   * @param {Array} routes - Selected routes array
   */
  handleRouteChainSelected(routes) {
    this.state.selectedRoutes = routes;
    this.state.categoryType = 'chain';
    this.state.categoryConfig = {
      type: 'chain',
      routes: routes
    };
    this.notifyUpdate();
  }

  /**
   * Handle achievement selection
   * @param {Object} state - Achievement selection state
   */
  handleAchievementSelection(state) {
    this.state.achievementIds = state.selectedAchievementIds || [];
    
    // Create category config for achievement route
    if (this.state.achievementIds.length > 0) {
      this.state.categoryConfig = {
        name: `Achievement Route (${this.state.achievementIds.length} achievement${this.state.achievementIds.length !== 1 ? 's' : ''})`,
        isPredefined: false,
        version: 'v2052', // Default to v2052 for achievement routes
        achievementIds: this.state.achievementIds
      };
    } else {
      this.state.categoryConfig = null;
    }
    
    this.notifyUpdate();
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
    
    // Auto-advance to next step after a short delay
    if (this.onAutoAdvance) {
      setTimeout(() => {
        this.onAutoAdvance();
      }, 500);
    }
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
    // Field highlighting is now handled in the CategorySelector component
    // This method is kept for compatibility but does nothing
  }

  /**
   * Clear field highlights
   */
  clearFieldHighlights() {
    // Field highlighting is now handled in the CategorySelector component
    // This method is kept for compatibility but does nothing
  }
}

