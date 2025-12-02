/**
 * Wizard Summary Component (Step 3)
 * Displays summary of selections and triggers route calculation
 */

export class WizardSummary {
  constructor(containerId, wizardState = null, onCalculate = null) {
    this.container = document.getElementById(containerId);
    this.wizardState = wizardState;
    this.onCalculate = onCalculate;
    this.isCalculating = false;
    this.progressCallback = null;
  }

  /**
   * Render the summary step
   */
  render() {
    if (!this.container) return;

    const summary = this.buildSummary();
    const canCalculate = this.canCalculate();

    this.container.innerHTML = `
      <div class="wizard-step-content">
        <h2>Summary & Calculate</h2>
        <p class="step-description">Review your selections and calculate the route:</p>
        
        <div class="summary-section">
          ${summary}
        </div>

        <div class="calculation-section">
          ${this.isCalculating ? this.renderCalculating() : this.renderCalculateButton(canCalculate)}
        </div>

        <div class="error-message" id="step3-error" role="alert" aria-live="polite" style="display: none;"></div>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Build summary HTML from wizard state
   * @returns {string} Summary HTML
   */
  buildSummary() {
    if (!this.wizardState) {
      return '<p class="error">No wizard state available</p>';
    }

    const { step1Data, step2Data } = this.wizardState;
    let html = '<div class="summary-items">';

    // Step 1 summary
    html += '<div class="summary-item">';
    html += '<h3>Initial Setup</h3>';
    if (step1Data.setupChoice === 'import') {
      html += '<p>Import Save Game</p>';
      if (step1Data.importedSaveGame) {
        html += `<p class="summary-detail">Version: ${step1Data.importedSaveGame.version || 'N/A'}</p>`;
      }
    } else if (step1Data.setupChoice === 'manual') {
      html += '<p>Manual Building Setup</p>';
      if (step1Data.manualBuildings) {
        const buildingCount = Object.keys(step1Data.manualBuildings).length;
        html += `<p class="summary-detail">${buildingCount} building(s) configured</p>`;
      }
    } else if (step1Data.setupChoice === 'fresh') {
      html += '<p>Start Fresh</p>';
    } else {
      html += '<p class="error">No setup choice selected</p>';
    }
    html += '</div>';

    // Step 2 summary
    html += '<div class="summary-item">';
    html += '<h3>Category</h3>';
    if (step2Data.categoryConfig) {
      html += `<p>${step2Data.categoryConfig.name || 'Unnamed Category'}</p>`;
      html += `<p class="summary-detail">Target: ${this.formatNumber(step2Data.categoryConfig.targetCookies)} cookies</p>`;
      html += `<p class="summary-detail">Version: ${step2Data.categoryConfig.version || 'N/A'}</p>`;
    } else {
      html += '<p class="error">No category selected</p>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    if (typeof num !== 'number') return String(num);
    return num.toLocaleString();
  }

  /**
   * Check if route can be calculated
   * @returns {boolean} True if calculation is possible
   */
  canCalculate() {
    if (!this.wizardState) return false;
    const { step1Data, step2Data } = this.wizardState;
    return step1Data.setupChoice && step2Data.categoryConfig;
  }

  /**
   * Render calculate button
   * @param {boolean} enabled - Whether button should be enabled
   * @returns {string} Button HTML
   */
  renderCalculateButton(enabled) {
    return `
      <div class="calculation-controls">
        <button 
          type="button" 
          id="calculate-route-btn" 
          class="btn-primary ${!enabled ? 'disabled' : ''}"
          ${!enabled ? 'disabled' : ''}
        >
          Calculate Route
        </button>
        ${this.isCalculating ? '<div class="calculation-progress" id="calculation-progress"></div>' : ''}
      </div>
    `;
  }

  /**
   * Render calculating state
   * @returns {string} Calculating HTML
   */
  renderCalculating() {
    return `
      <div class="calculating-indicator">
        <div class="spinner"></div>
        <p>Calculating optimal route...</p>
        <div class="calculation-progress" id="calculation-progress">
          <p id="progress-text">Processing moves...</p>
        </div>
      </div>
    `;
  }

  /**
   * Update calculation progress
   * @param {number} moves - Number of moves processed
   */
  updateProgress(moves) {
    if (this.isCalculating) {
      const progressText = this.container.querySelector('#progress-text');
      if (progressText) {
        progressText.textContent = `Processing moves: ${moves}`;
      }
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const calculateBtn = this.container.querySelector('#calculate-route-btn');
    if (calculateBtn) {
      console.log('[WizardSummary] Attaching click handler to calculate button');
      calculateBtn.addEventListener('click', () => {
        console.log('[WizardSummary] Calculate button clicked!');
        this.handleCalculate();
      });
    } else {
      console.warn('[WizardSummary] Calculate button not found!');
    }
  }

  /**
   * Handle calculate button click
   */
  async handleCalculate() {
    console.log('[WizardSummary] handleCalculate() called', { isCalculating: this.isCalculating, canCalculate: this.canCalculate() });
    
    if (this.isCalculating || !this.canCalculate()) {
      console.log('[WizardSummary] Cannot calculate - already calculating or invalid state');
      return;
    }

    if (this.onCalculate) {
      console.log('[WizardSummary] Starting calculation...');
      this.isCalculating = true;
      this.render();
      
      try {
        console.log('[WizardSummary] Calling onCalculate callback...');
        await this.onCalculate();
        console.log('[WizardSummary] onCalculate completed successfully');
        // On success, wizard will close, so we don't need to reset state here
        // But reset it anyway in case wizard doesn't close for some reason
        this.isCalculating = false;
      } catch (error) {
        console.error('[WizardSummary] Error in onCalculate:', error);
        this.showError(error.message || 'Failed to calculate route');
        this.isCalculating = false;
        this.render();
      }
    } else {
      console.error('[WizardSummary] No onCalculate callback registered!');
    }
  }

  /**
   * Set calculating state
   * @param {boolean} calculating - Whether calculation is in progress
   */
  setCalculating(calculating) {
    this.isCalculating = calculating;
    this.render();
  }

  /**
   * Update wizard state
   * @param {Object} wizardState - New wizard state
   */
  updateState(wizardState) {
    this.wizardState = wizardState;
    this.render();
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorElement = this.container.querySelector('#step3-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      // Scroll to error message
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Clear error message
   */
  clearError() {
    const errorElement = this.container.querySelector('#step3-error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }
}

