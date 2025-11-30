/**
 * Unit tests for Route Creation Wizard
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RouteCreationWizard } from '../../src/js/ui/route-creation-wizard.js';

describe('RouteCreationWizard', () => {
  let container;
  let wizard;

  beforeEach(() => {
    // Create a container element for each test
    container = document.createElement('div');
    container.id = 'route-creation-wizard-section';
    document.body.appendChild(container);

    wizard = new RouteCreationWizard('route-creation-wizard-section');
  });

  afterEach(() => {
    // Clean up
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('WizardState initialization', () => {
    it('should initialize with default state', () => {
      const state = wizard.getState();
      
      expect(state.currentStep).toBe(0);
      expect(state.step1Data.setupChoice).toBeNull();
      expect(state.step1Data.importedSaveGame).toBeNull();
      expect(state.step1Data.manualBuildings).toBeNull();
      expect(state.step2Data.categoryType).toBeNull();
      expect(state.step2Data.selectedCategoryId).toBeNull();
      expect(state.step2Data.categoryConfig).toBeNull();
      expect(state.validationErrors.step1).toEqual([]);
      expect(state.validationErrors.step2).toEqual([]);
      expect(state.isCalculating).toBe(false);
      expect(state.calculatedRoute).toBeNull();
    });

    it('should reset state when show() is called', () => {
      // Modify state
      wizard.state.currentStep = 2;
      wizard.state.step1Data.setupChoice = 'import';
      
      // Show wizard (should reset)
      wizard.show();
      
      const state = wizard.getState();
      expect(state.currentStep).toBe(0);
      expect(state.step1Data.setupChoice).toBeNull();
    });
  });

  describe('show() and hide()', () => {
    it('should show wizard modal when show() is called', () => {
      wizard.show();
      
      expect(wizard.isVisible).toBe(true);
      expect(container.querySelector('.route-creation-wizard-overlay')).toBeTruthy();
      expect(container.querySelector('.route-creation-wizard')).toBeTruthy();
    });

    it('should hide wizard modal when hide() is called', () => {
      wizard.show();
      expect(wizard.isVisible).toBe(true);
      
      wizard.hide();
      
      expect(wizard.isVisible).toBe(false);
      expect(container.innerHTML).toBe('');
    });

    it('should call onCancel callback when hide() is called', () => {
      const onCancel = vi.fn();
      wizard = new RouteCreationWizard('route-creation-wizard-section', null, onCancel);
      
      wizard.show();
      wizard.hide();
      
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('getState()', () => {
    it('should return a copy of wizard state', () => {
      const state1 = wizard.getState();
      const state2 = wizard.getState();
      
      // Should be different objects
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    it('should not allow direct mutation of returned state', () => {
      const state = wizard.getState();
      state.currentStep = 5;
      
      // Original state should not be modified
      const newState = wizard.getState();
      expect(newState.currentStep).toBe(0);
    });
  });

  describe('Step 1 display', () => {
    it('should display Step 1 (Initial Setup) when wizard is shown', () => {
      wizard.show();
      
      const stepContainer = container.querySelector('#wizard-step-container');
      expect(stepContainer).toBeTruthy();
      
      // Check that initial setup content is rendered
      const setupContent = container.querySelector('.wizard-step-content');
      expect(setupContent).toBeTruthy();
    });

    it('should render step indicator showing Step 1 of 3', () => {
      wizard.show();
      
      const stepIndicator = container.querySelector('.wizard-step-indicator');
      expect(stepIndicator).toBeTruthy();
      
      const activeStep = container.querySelector('.wizard-step.active');
      expect(activeStep).toBeTruthy();
    });
  });
});

