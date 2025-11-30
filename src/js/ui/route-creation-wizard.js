/**
 * Route Creation Wizard
 * Main component orchestrating the multistep route creation process
 */

import { WizardStepIndicator } from './wizard-step-indicator.js';
import { WizardInitialSetup } from './wizard-initial-setup.js';
import { WizardCategorySelection } from './wizard-category-selection.js';
import { WizardSummary } from './wizard-summary.js';
import { calculateRoute } from '../simulation.js';
import { saveRoute } from '../storage.js';
import { getImportedSaveGame } from '../save-game-importer.js';

export class RouteCreationWizard {
  constructor(containerId, onComplete = null, onCancel = null) {
    this.container = document.getElementById(containerId);
    this.onComplete = onComplete;
    this.onCancel = onCancel;
    
    // Initialize wizard state
    this.state = {
      currentStep: 0,
      step1Data: {
        setupChoice: null,
        importedSaveGame: null,
        manualBuildings: null,
        versionId: null
      },
      step2Data: {
        categoryType: null,
        selectedCategoryId: null,
        categoryConfig: null
      },
      validationErrors: {
        step1: [],
        step2: []
      },
      isCalculating: false,
      calculatedRoute: null
    };

    // Step components
    this.stepIndicator = null;
    this.initialSetup = null;
    this.categorySelection = null;
    this.summary = null;

    this.isVisible = false;
  }

  /**
   * Show the wizard modal
   */
  show() {
    if (!this.container) {
      console.error('RouteCreationWizard: container not found');
      return;
    }

    // Reset state
    this.state = {
      currentStep: 0,
      step1Data: {
        setupChoice: null,
        importedSaveGame: null,
        manualBuildings: null,
        versionId: null
      },
      step2Data: {
        categoryType: null,
        selectedCategoryId: null,
        categoryConfig: null
      },
      validationErrors: {
        step1: [],
        step2: []
      },
      isCalculating: false,
      calculatedRoute: null
    };

    this.isVisible = true;
    this.render();
    this.attachEventListeners();
  }

  /**
   * Hide the wizard modal
   */
  hide() {
    this.isVisible = false;
    if (this.container) {
      this.container.innerHTML = '';
    }
    if (this.onCancel) {
      this.onCancel();
    }
  }

  /**
   * Render the wizard
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="route-creation-wizard-overlay" role="dialog" aria-labelledby="wizard-title" aria-modal="true">
        <div class="route-creation-wizard">
          <div class="wizard-header">
            <h2 id="wizard-title">Create Route</h2>
            <button type="button" class="wizard-close-btn" aria-label="Close wizard">&times;</button>
          </div>
          
          <div class="wizard-step-indicator-container" id="wizard-step-indicator"></div>
          
          <div class="wizard-content">
            <div class="wizard-step-container" id="wizard-step-container"></div>
          </div>
          
          <div class="wizard-footer">
            <button type="button" id="wizard-back-btn" class="btn-secondary" disabled>Back</button>
            <button type="button" id="wizard-next-btn" class="btn-primary">Next</button>
            <button type="button" id="wizard-cancel-btn" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    `;

    // Initialize step indicator
    const indicatorContainer = this.container.querySelector('#wizard-step-indicator');
    if (indicatorContainer) {
      this.stepIndicator = new WizardStepIndicator('wizard-step-indicator', this.state.currentStep, 3);
      this.stepIndicator.init();
    }

    // Set focus trap and initial focus
    this.setupFocusManagement();

    // Render current step
    this.renderCurrentStep();
    this.updateNavigationButtons();
    
    // Setup focus management after render
    setTimeout(() => {
      this.setupFocusManagement();
    }, 50);
  }

  /**
   * Render the current step content
   */
  renderCurrentStep() {
    const stepContainer = this.container.querySelector('#wizard-step-container');
    if (!stepContainer) return;

    // Create temporary container for step content
    const tempContainer = document.createElement('div');
    tempContainer.id = 'temp-step-container';
    stepContainer.innerHTML = '';
    stepContainer.appendChild(tempContainer);

    if (this.state.currentStep === 0) {
      // Step 1: Initial Setup
      this.initialSetup = new WizardInitialSetup('temp-step-container', this.state.step1Data, (data) => {
        this.updateStep1Data(data);
      });
      this.initialSetup.render();
      
      // Restore state when navigating back
      if (this.state.step1Data.setupChoice) {
        this.initialSetup.setState(this.state.step1Data);
      }
    } else if (this.state.currentStep === 1) {
      // Step 2: Category Selection
      this.categorySelection = new WizardCategorySelection('temp-step-container', this.state.step2Data, (data) => {
        this.updateStep2Data(data);
      });
      this.categorySelection.render();
      
      // Restore state when navigating back
      if (this.state.step2Data.categoryType) {
        this.categorySelection.setState(this.state.step2Data);
      }
    } else if (this.state.currentStep === 2) {
      // Step 3: Summary & Calculate
      this.summary = new WizardSummary('temp-step-container', this.state, async () => {
        return await this.calculateRoute();
      });
      this.summary.render();
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeBtn = this.container.querySelector('.wizard-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Navigation buttons
    const backBtn = this.container.querySelector('#wizard-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.previousStep());
    }

    const nextBtn = this.container.querySelector('#wizard-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }

    const cancelBtn = this.container.querySelector('#wizard-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hide());
    }

    // Close on overlay click
    const overlay = this.container.querySelector('.route-creation-wizard-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide();
        }
      });
    }

    // Keyboard navigation
    this.attachKeyboardListeners();
  }

  /**
   * Attach keyboard event listeners
   */
  attachKeyboardListeners() {
    const overlay = this.container.querySelector('.route-creation-wizard-overlay');
    if (overlay) {
      overlay.addEventListener('keydown', (e) => {
        // Escape key closes wizard
        if (e.key === 'Escape') {
          this.hide();
        }
        // Enter key on Next button (when not in input field)
        if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
          const nextBtn = this.container.querySelector('#wizard-next-btn');
          if (nextBtn && !nextBtn.disabled && this.state.currentStep < 2) {
            e.preventDefault();
            nextBtn.click();
          }
        }
      });
    }
  }

  /**
   * Setup focus management (trap focus in modal, focus first field)
   */
  setupFocusManagement() {
    const overlay = this.container.querySelector('.route-creation-wizard-overlay');
    if (!overlay) return;

    // Make overlay focusable for focus trap
    overlay.setAttribute('tabindex', '-1');
    
    // Focus the wizard dialog
    const wizardDialog = this.container.querySelector('.route-creation-wizard');
    if (wizardDialog) {
      wizardDialog.setAttribute('tabindex', '-1');
      wizardDialog.focus();
    }

    // Focus first interactive element in current step
    setTimeout(() => {
      const firstInput = this.container.querySelector('input[type="radio"], input[type="text"], input[type="number"], button:not([disabled])');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  /**
   * Update navigation button states
   */
  updateNavigationButtons() {
    const backBtn = this.container.querySelector('#wizard-back-btn');
    const nextBtn = this.container.querySelector('#wizard-next-btn');

    if (backBtn) {
      backBtn.disabled = this.state.currentStep === 0;
    }

    if (nextBtn) {
      if (this.state.currentStep === 2) {
        nextBtn.textContent = 'Calculate Route';
        nextBtn.style.display = 'none'; // Summary step has its own calculate button
      } else {
        nextBtn.textContent = 'Next';
        nextBtn.style.display = 'block';
      }
    }
  }

  /**
   * Navigate to next step
   */
  nextStep() {
    if (this.state.currentStep >= 2) return; // Already on last step

    // Validate current step
    if (!this.validateCurrentStep()) {
      return; // Validation failed, errors are displayed
    }

    // Advance to next step
    this.state.currentStep++;
    if (this.stepIndicator) {
      this.stepIndicator.updateStep(this.state.currentStep);
    }
    this.renderCurrentStep();
    this.updateNavigationButtons();
    this.setupFocusManagement(); // Re-setup focus for new step
  }

  /**
   * Navigate to previous step
   */
  previousStep() {
    if (this.state.currentStep <= 0) return; // Already on first step

    // Clear validation errors for current step before going back
    if (this.state.currentStep === 1) {
      this.state.validationErrors.step2 = [];
      if (this.categorySelection) {
        this.categorySelection.clearErrors();
      }
    } else if (this.state.currentStep === 2) {
      if (this.summary) {
        this.summary.clearError();
      }
    }

    // Go back to previous step
    this.state.currentStep--;
    if (this.stepIndicator) {
      this.stepIndicator.updateStep(this.state.currentStep);
    }
    this.renderCurrentStep();
    this.updateNavigationButtons();
    this.setupFocusManagement(); // Re-setup focus for new step
  }

  /**
   * Navigate to specific step
   * @param {number} stepIndex - Step index (0, 1, or 2)
   */
  goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex > 2) {
      console.error(`Invalid step index: ${stepIndex}`);
      return;
    }

    this.state.currentStep = stepIndex;
    if (this.stepIndicator) {
      this.stepIndicator.updateStep(this.state.currentStep);
    }
    this.renderCurrentStep();
    this.updateNavigationButtons();
    this.setupFocusManagement(); // Re-setup focus for new step
  }

  /**
   * Validate current step
   * @returns {boolean} True if valid, false otherwise
   */
  validateCurrentStep() {
    // Clear previous errors for current step
    if (this.state.currentStep === 0) {
      this.state.validationErrors.step1 = [];
    } else if (this.state.currentStep === 1) {
      this.state.validationErrors.step2 = [];
    }

    if (this.state.currentStep === 0) {
      // Validate Step 1
      if (!this.state.step1Data.setupChoice) {
        this.state.validationErrors.step1.push('Please select an initial setup option');
      }
      
      // Additional validation for import option
      if (this.state.step1Data.setupChoice === 'import') {
        // Check if import was attempted but failed
        const importedSaveGame = getImportedSaveGame();
        if (!this.state.step1Data.importedSaveGame && !importedSaveGame) {
          this.state.validationErrors.step1.push('Please import a save game or select a different option');
        } else if (importedSaveGame && !this.state.step1Data.importedSaveGame) {
          // Import exists but not stored in state - update state
          this.state.step1Data.importedSaveGame = importedSaveGame;
        }
      }
      
      if (this.initialSetup) {
        this.initialSetup.showErrors(this.state.validationErrors.step1);
        if (this.state.validationErrors.step1.length > 0) {
          this.initialSetup.highlightInvalidOption();
        } else {
          this.initialSetup.clearOptionHighlights();
        }
      }

      return this.state.validationErrors.step1.length === 0;
    } else if (this.state.currentStep === 1) {
      // Validate Step 2
      if (!this.state.step2Data.categoryType) {
        this.state.validationErrors.step2.push('Please select a category type');
      }
      
      if (!this.state.step2Data.categoryConfig) {
        this.state.validationErrors.step2.push('Please configure a category');
      } else {
        // Validate category config values
        if (!this.state.step2Data.categoryConfig.targetCookies || this.state.step2Data.categoryConfig.targetCookies <= 0) {
          this.state.validationErrors.step2.push('Target cookies must be greater than 0');
        }
        if (!this.state.step2Data.categoryConfig.version) {
          this.state.validationErrors.step2.push('Please select a game version');
        }
        if (this.state.step2Data.categoryConfig.playerCps !== undefined && this.state.step2Data.categoryConfig.playerCps < 0) {
          this.state.validationErrors.step2.push('Player CPS cannot be negative');
        }
        if (this.state.step2Data.categoryConfig.playerDelay !== undefined && this.state.step2Data.categoryConfig.playerDelay < 0) {
          this.state.validationErrors.step2.push('Player delay cannot be negative');
        }
      }

      if (this.categorySelection) {
        this.categorySelection.showErrors(this.state.validationErrors.step2);
      }

      return this.state.validationErrors.step2.length === 0;
    }

    return true; // Step 3 doesn't need validation before display
  }

  /**
   * Update Step 1 data
   * @param {Object} data - Partial Step 1 data
   */
  updateStep1Data(data) {
    this.state.step1Data = { ...this.state.step1Data, ...data };
    
    // If version ID is updated, update it in state
    if (data.versionId) {
      this.state.step1Data.versionId = data.versionId;
    }
  }

  /**
   * Update Step 2 data
   * @param {Object} data - Partial Step 2 data
   */
  updateStep2Data(data) {
    this.state.step2Data = { ...this.state.step2Data, ...data };
  }

  /**
   * Get current wizard state
   * @returns {Object} Copy of wizard state
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Calculate route from wizard configuration
   * @returns {Promise<Object>} Calculated route
   */
  async calculateRoute() {
    if (this.state.isCalculating) {
      throw new Error('Route calculation already in progress');
    }

    // Create RouteCreationConfig from wizard state
    const config = this.createRouteCreationConfig();
    
    this.state.isCalculating = true;
    if (this.summary) {
      this.summary.setCalculating(true);
    }

    try {
      // Merge starting buildings (import + manual, manual takes precedence)
      const startingBuildings = {};
      if (this.state.step1Data.importedSaveGame?.buildingCounts) {
        Object.assign(startingBuildings, this.state.step1Data.importedSaveGame.buildingCounts);
      }
      if (this.state.step1Data.manualBuildings) {
        Object.assign(startingBuildings, this.state.step1Data.manualBuildings);
      }

      // Get version ID
      const versionId = this.state.step1Data.versionId || 
                       this.state.step1Data.importedSaveGame?.version || 
                       'v2052';

      // Progress callback to update UI during calculation
      const onProgress = (progress) => {
        if (this.summary) {
          this.summary.updateProgress(progress.moves || 0);
        }
      };

      // Calculate route
      const route = await calculateRoute(config.category, startingBuildings, {
        algorithm: 'GPL',
        lookahead: 1,
        onProgress: onProgress
      }, versionId);

      // Store calculated route
      this.state.calculatedRoute = route;
      this.state.isCalculating = false;

      // Route is automatically saved by calculateRoute function
      // Get the category config for passing to completion callback
      const category = {
        id: config.category.id,
        name: config.category.name,
        version: config.category.version,
        targetCookies: config.category.targetCookies,
        playerCps: config.category.playerCps,
        playerDelay: config.category.playerDelay,
        hardcoreMode: config.category.hardcoreMode,
        initialBuildings: config.category.initialBuildings,
        isPredefined: config.category.isPredefined
      };

      // Close wizard and call completion callback with both route and category
      this.hide();
      if (this.onComplete) {
        this.onComplete(route, category, versionId);
      }

      return route;
    } catch (error) {
      this.state.isCalculating = false;
      if (this.summary) {
        this.summary.setCalculating(false);
        this.summary.showError(error.message || 'Failed to calculate route');
      }
      throw error;
    }
  }

  /**
   * Create RouteCreationConfig from wizard state
   * @returns {Object} RouteCreationConfig
   */
  createRouteCreationConfig() {
    const { step1Data, step2Data } = this.state;

    // Merge starting buildings
    const startingBuildings = {};
    if (step1Data.importedSaveGame?.buildingCounts) {
      Object.assign(startingBuildings, step1Data.importedSaveGame.buildingCounts);
    }
    if (step1Data.manualBuildings) {
      Object.assign(startingBuildings, step1Data.manualBuildings);
    }

    // Get version ID
    const versionId = step1Data.versionId || 
                     step1Data.importedSaveGame?.version || 
                     'v2052';

    // Create category config
    const category = {
      id: step2Data.selectedCategoryId || `custom-${Date.now()}`,
      name: step2Data.categoryConfig.name,
      isPredefined: step2Data.categoryType === 'predefined',
      version: step2Data.categoryConfig.version,
      targetCookies: step2Data.categoryConfig.targetCookies,
      playerCps: step2Data.categoryConfig.playerCps || 8,
      playerDelay: step2Data.categoryConfig.playerDelay || 1,
      hardcoreMode: step2Data.categoryConfig.hardcoreMode || false,
      initialBuildings: step2Data.categoryConfig.initialBuildings || {}
    };

    return {
      startingBuildings,
      category,
      versionId,
      algorithm: 'GPL',
      lookahead: 1
    };
  }
}

