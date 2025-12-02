/**
 * Route Creation Wizard
 * Main component orchestrating the multistep route creation process
 */

import { WizardStepIndicator } from './wizard-step-indicator.js';
import { WizardInitialSetup } from './wizard-initial-setup.js';
import { WizardCategorySelection } from './wizard-category-selection.js';
import { WizardSummary } from './wizard-summary.js';
import { calculateRoute, calculateRouteChain } from '../simulation.js';
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
        categoryConfig: null,
        selectedRoutes: [] // For route chain mode
      },
      validationErrors: {
        step1: [],
        step2: []
      },
      isCalculating: false,
      calculatedRoute: null,
      calculatedRouteChain: null // For route chain mode
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
   * @param {Object} initialState - Optional initial state to pre-populate wizard
   * @param {number} startStep - Optional step to start at (0 = Initial Setup, 1 = Category Selection, 2 = Summary)
   */
  show(initialState = null, startStep = 0) {
    if (!this.container) {
      console.error('RouteCreationWizard: container not found');
      return;
    }

    // Validate startStep
    if (startStep < 0 || startStep > 2) {
      console.warn('Invalid startStep, defaulting to 0');
      startStep = 0;
    }

    // If starting at step 2, ensure step 1 data is valid
    if (startStep >= 1 && initialState?.step1Data) {
      // Ensure setupChoice is set if we're skipping step 1
      if (!initialState.step1Data.setupChoice && initialState.step1Data.importedSaveGame) {
        initialState.step1Data.setupChoice = 'import';
      }
    }

    // Reset state
    this.state = {
      currentStep: startStep,
      step1Data: {
        setupChoice: initialState?.step1Data?.setupChoice || null,
        importedSaveGame: initialState?.step1Data?.importedSaveGame || null,
        manualBuildings: initialState?.step1Data?.manualBuildings || null,
        manualUpgrades: initialState?.step1Data?.manualUpgrades || null,
        versionId: initialState?.step1Data?.versionId || null
      },
      step2Data: {
        categoryType: initialState?.step2Data?.categoryType || null,
        selectedCategoryId: initialState?.step2Data?.selectedCategoryId || null,
        categoryConfig: initialState?.step2Data?.categoryConfig || null,
        achievementIds: initialState?.step2Data?.achievementIds || null,
        selectedRoutes: initialState?.step2Data?.selectedRoutes || [] // For route chain mode
      },
      validationErrors: {
        step1: [],
        step2: []
      },
      isCalculating: false,
      calculatedRoute: null,
      calculatedRouteChain: null // For route chain mode
    };

    this.isVisible = true;
    if (this.container) {
      this.container.style.display = '';
    }
    this.render();
    this.attachEventListeners();
  }

  /**
   * Hide the wizard modal
   */
  hide() {
    console.log('[Wizard] hide() called');
    this.isVisible = false;
    if (this.container) {
      console.log('[Wizard] Clearing container HTML and hiding container');
      this.container.innerHTML = '';
      // Also hide the container element itself
      this.container.style.display = 'none';
      console.log('[Wizard] Container hidden, display style:', this.container.style.display);
    } else {
      console.warn('[Wizard] Container not found!');
    }
    if (this.onCancel) {
      console.log('[Wizard] Calling onCancel callback');
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
      this.initialSetup = new WizardInitialSetup(
        'temp-step-container',
        this.state.step1Data,
        (data) => {
          this.updateStep1Data(data);
        },
        () => {
          // Auto-advance callback: move to next step after successful import
          this.nextStep();
        }
      );
      this.initialSetup.render();
      
      // Restore state when navigating back
      if (this.state.step1Data.setupChoice) {
        this.initialSetup.setState(this.state.step1Data);
      }
    } else if (this.state.currentStep === 1) {
      // Step 2: Category Selection
      this.categorySelection = new WizardCategorySelection(
        'temp-step-container',
        this.state.step2Data,
        (data) => {
          this.updateStep2Data(data);
        },
        () => {
          // Auto-advance callback: move to next step after successful category creation
          this.nextStep();
        }
      );
      this.categorySelection.render();
      
      // Restore state when navigating back
      if (this.state.step2Data.categoryType) {
        this.categorySelection.setState(this.state.step2Data);
      }
    } else if (this.state.currentStep === 2) {
      // Step 3: Summary & Calculate
      console.log('[Wizard] Creating summary component for step 3');
      const wizardInstance = this; // Capture 'this' for the callback
      this.summary = new WizardSummary('temp-step-container', this.state, async () => {
        console.log('[Wizard] Summary onCalculate callback called');
        return await wizardInstance.calculateRoute();
      });
      this.summary.render();
      console.log('[Wizard] Summary component created and rendered');
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
        this.state.validationErrors.step2.push('Please select a route type');
      } else if (this.state.step2Data.categoryType === 'chain') {
        // Validate route chain
        if (!this.state.step2Data.selectedRoutes || this.state.step2Data.selectedRoutes.length === 0) {
          this.state.validationErrors.step2.push('Please select at least one route for the chain');
        }
        // Additional validation can be added here (e.g., max routes, version compatibility)
      } else {
        // Validate single route (predefined, custom, or achievement)
        if (!this.state.step2Data.categoryConfig) {
          this.state.validationErrors.step2.push('Please configure a category');
        } else {
          // Validate category config values
          // Achievement routes don't need targetCookies
          if (this.state.step2Data.categoryType !== 'achievement') {
            if (!this.state.step2Data.categoryConfig.targetCookies || this.state.step2Data.categoryConfig.targetCookies <= 0) {
              this.state.validationErrors.step2.push('Target cookies must be greater than 0');
            }
          } else {
            // Validate achievement selection
            if (!this.state.step2Data.categoryConfig.achievementIds || this.state.step2Data.categoryConfig.achievementIds.length === 0) {
              this.state.validationErrors.step2.push('Please select at least one achievement');
            }
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
    console.log('[Wizard] calculateRoute() called');
    
    if (this.state.isCalculating) {
      console.error('[Wizard] Calculation already in progress');
      throw new Error('Route calculation already in progress');
    }

    // Check if this is a route chain
    const isChainMode = this.state.step2Data.categoryType === 'chain' && 
                       this.state.step2Data.selectedRoutes && 
                       this.state.step2Data.selectedRoutes.length > 0;

    if (isChainMode) {
      return await this.calculateRouteChain();
    }

    // Single route calculation (existing logic)
    // Create RouteCreationConfig from wizard state
    console.log('[Wizard] Creating route config...');
    const config = this.createRouteCreationConfig();
    console.log('[Wizard] Route config created:', config);
    
    this.state.isCalculating = true;
    if (this.summary) {
      this.summary.setCalculating(true);
    }

    try {
      console.log('[Wizard] Starting route calculation...');
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
        // Yield to browser to keep UI responsive
        return new Promise(resolve => setTimeout(resolve, 0));
      };

      // Collect purchased upgrades
      let purchasedUpgrades = [];
      if (this.state.step1Data.importedSaveGame?.upgrades) {
        purchasedUpgrades = [...this.state.step1Data.importedSaveGame.upgrades];
      }
      // Manual upgrades take precedence
      if (this.state.step1Data.manualUpgrades && Array.isArray(this.state.step1Data.manualUpgrades)) {
        purchasedUpgrades = [...this.state.step1Data.manualUpgrades];
      }

      // Calculate route
      console.log('[Wizard] Calling calculateRoute with:', { category: config.category.name, versionId, startingBuildings });
      const route = await calculateRoute(config.category, startingBuildings, {
        algorithm: 'GPL',
        lookahead: 1,
        onProgress: onProgress,
        manualUpgrades: purchasedUpgrades
      }, versionId);
      console.log('[Wizard] Route calculation returned:', route);

      // Store calculated route
      this.state.calculatedRoute = route;
      this.state.isCalculating = false;
      console.log('[Wizard] Route stored in state');

      // Check if route save failed (non-critical error)
      if (route.saveError) {
        console.warn('[Wizard] Route calculated but save failed:', route.saveError);
        // Show warning but don't block completion
      }

      // Route is automatically saved by calculateRoute function (or attempted to be saved)
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
      
      // Add achievement IDs if present
      if (config.category.achievementIds) {
        category.achievementIds = config.category.achievementIds;
      }

      // Reset calculating state before closing
      if (this.summary) {
        this.summary.setCalculating(false);
      }

      console.log('[Wizard] Route calculation completed, closing wizard');
      console.log('[Wizard] Wizard state before hide:', { isVisible: this.isVisible, containerExists: !!this.container });
      
      // Close wizard first
      console.log('[Wizard] Calling hide()...');
      this.hide();
      console.log('[Wizard] hide() completed, isVisible:', this.isVisible);
      
      // Call completion callback after wizard is closed
      if (this.onComplete) {
        try {
          console.log('[Wizard] Calling completion callback');
          this.onComplete(route, category, versionId);
          console.log('[Wizard] Completion callback finished');
        } catch (error) {
          console.error('[Wizard] Error in wizard completion callback:', error);
          // Don't re-throw - wizard is already closed
        }
      } else {
        console.warn('[Wizard] No completion callback registered');
      }

      return route;
    } catch (error) {
      console.error('[Wizard] Error during route calculation:', error);
      this.state.isCalculating = false;
      if (this.summary) {
        this.summary.setCalculating(false);
        this.summary.showError(error.message || 'Failed to calculate route');
      }
      throw error;
    }
  }

  /**
   * Calculate route chain from wizard configuration
   * @returns {Promise<Object>} Chain calculation result
   */
  async calculateRouteChain() {
    console.log('[Wizard] calculateRouteChain() called');
    
    if (this.state.isCalculating) {
      console.error('[Wizard] Calculation already in progress');
      throw new Error('Route calculation already in progress');
    }

    if (!this.state.step2Data.selectedRoutes || this.state.step2Data.selectedRoutes.length === 0) {
      throw new Error('No routes selected for chain');
    }

    this.state.isCalculating = true;
    if (this.summary) {
      this.summary.setCalculating(true);
    }

    try {
      console.log('[Wizard] Starting chain calculation...');
      
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

      // Collect purchased upgrades
      let purchasedUpgrades = [];
      if (this.state.step1Data.importedSaveGame?.upgrades) {
        purchasedUpgrades = [...this.state.step1Data.importedSaveGame.upgrades];
      }
      if (this.state.step1Data.manualUpgrades && Array.isArray(this.state.step1Data.manualUpgrades)) {
        purchasedUpgrades = [...this.state.step1Data.manualUpgrades];
      }

      // Progress callback to update UI during chain calculation
      const onProgress = (progress) => {
        if (this.summary) {
          // Update summary with chain progress
          const progressText = `Calculating route ${progress.currentRouteIndex + 1} of ${progress.totalRoutes}: ${progress.routeName}`;
          this.summary.updateChainProgress(progressText, progress.currentRouteIndex, progress.totalRoutes, progress.routeProgress);
        }
        // Yield to browser to keep UI responsive
        return new Promise(resolve => setTimeout(resolve, 0));
      };

      // Create chain config
      const chainConfig = {
        routes: this.state.step2Data.selectedRoutes.map(route => route.routeConfig),
        versionId: versionId
      };

      // Calculate chain
      console.log('[Wizard] Calling calculateRouteChain with:', { routes: chainConfig.routes.length, versionId, startingBuildings });
      const result = await calculateRouteChain(chainConfig, startingBuildings, purchasedUpgrades, {
        algorithm: 'GPL',
        lookahead: 1,
        onProgress: onProgress
      });
      console.log('[Wizard] Chain calculation returned:', result);

      // Store calculated chain with route configs for saving
      this.state.calculatedRouteChain = {
        calculatedRoutes: result.calculatedRoutes,
        accumulatedBuildings: result.accumulatedBuildings,
        accumulatedUpgrades: result.accumulatedUpgrades,
        errors: result.errors,
        success: result.success,
        routeConfigs: this.state.step2Data.selectedRoutes.map(r => r.routeConfig) // Store configs for saving
      };
      this.state.isCalculating = false;

      // Handle errors
      if (!result.success && result.errors.length > 0) {
        const error = result.errors[0];
        const errorMessage = `Route ${error.routeIndex + 1} (${error.routeName}) failed: ${error.message}`;
        if (this.summary) {
          this.summary.setCalculating(false);
          this.summary.showError(errorMessage);
        }
        // Don't throw - allow user to see partial results and retry
        console.error('[Wizard] Chain calculation failed:', errorMessage);
      } else {
        // Reset calculating state
        if (this.summary) {
          this.summary.setCalculating(false);
        }
      }

      console.log('[Wizard] Chain calculation completed');
      
      // Close wizard and call completion callback
      this.hide();
      
      if (this.onComplete) {
        try {
          // Pass chain result to completion callback with route configs
          this.onComplete(this.state.calculatedRouteChain, null, versionId);
        } catch (error) {
          console.error('[Wizard] Error in wizard completion callback:', error);
        }
      }

      return this.state.calculatedRouteChain;
    } catch (error) {
      console.error('[Wizard] Error during chain calculation:', error);
      this.state.isCalculating = false;
      if (this.summary) {
        this.summary.setCalculating(false);
        this.summary.showError(error.message || 'Failed to calculate route chain');
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
    // Use version from categoryConfig, fallback to step1Data.versionId, then default to v2052
    const categoryVersion = step2Data.categoryConfig.version || 
                           step1Data.versionId || 
                           step1Data.importedSaveGame?.version || 
                           'v2052';
    
    const category = {
      id: step2Data.selectedCategoryId || `custom-${Date.now()}`,
      name: step2Data.categoryConfig.name,
      isPredefined: step2Data.categoryType === 'predefined',
      version: categoryVersion,
      targetCookies: step2Data.categoryConfig.targetCookies || 0, // Achievement routes may not have targetCookies
      playerCps: step2Data.categoryConfig.playerCps || 8,
      playerDelay: step2Data.categoryConfig.playerDelay || 1,
      hardcoreMode: step2Data.categoryConfig.hardcoreMode || false,
      initialBuildings: step2Data.categoryConfig.initialBuildings || {}
    };
    
    // Add achievement IDs if this is an achievement route
    if (step2Data.categoryType === 'achievement' && step2Data.categoryConfig.achievementIds) {
      category.achievementIds = step2Data.categoryConfig.achievementIds;
    }

    return {
      startingBuildings,
      category,
      versionId,
      algorithm: 'GPL',
      lookahead: 1
    };
  }
}

