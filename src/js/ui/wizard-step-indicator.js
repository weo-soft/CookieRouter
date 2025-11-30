/**
 * Wizard Step Indicator UI component
 * Displays progress through wizard steps (1 of 3, 2 of 3, 3 of 3)
 */

export class WizardStepIndicator {
  constructor(containerId, currentStep = 0, totalSteps = 3) {
    this.container = document.getElementById(containerId);
    this.currentStep = currentStep;
    this.totalSteps = totalSteps;
  }

  /**
   * Render the step indicator
   */
  render() {
    if (!this.container) return;

    const steps = [];
    for (let i = 0; i < this.totalSteps; i++) {
      const stepNum = i + 1;
      const isActive = i === this.currentStep;
      const isCompleted = i < this.currentStep;
      
      steps.push(`
        <div class="wizard-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
             data-step="${i}" 
             role="tab" 
             aria-selected="${isActive}"
             aria-label="Step ${stepNum} of ${this.totalSteps}">
          <span class="step-number">${stepNum}</span>
          <span class="step-label">${this.getStepLabel(i)}</span>
        </div>
      `);
    }

    this.container.innerHTML = `
      <div class="wizard-step-indicator" role="tablist" aria-label="Wizard steps">
        ${steps.join('')}
      </div>
    `;
  }

  /**
   * Get step label for a given step index
   * @param {number} stepIndex - Step index (0-based)
   * @returns {string} Step label
   */
  getStepLabel(stepIndex) {
    const labels = [
      'Initial Setup',
      'Category Selection',
      'Summary & Calculate'
    ];
    return labels[stepIndex] || `Step ${stepIndex + 1}`;
  }

  /**
   * Update the current step
   * @param {number} stepIndex - New current step index (0-based)
   */
  updateStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.totalSteps) {
      console.error(`Invalid step index: ${stepIndex}`);
      return;
    }
    
    this.currentStep = stepIndex;
    this.render();
  }

  /**
   * Initialize the step indicator
   */
  init() {
    this.render();
  }
}

