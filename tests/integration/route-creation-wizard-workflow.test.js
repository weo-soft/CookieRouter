/**
 * Integration tests for Route Creation Wizard workflow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RouteCreationWizard } from '../../src/js/ui/route-creation-wizard.js';

describe('Route Creation Wizard Workflow', () => {
  let container;
  let wizard;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'route-creation-wizard-section';
    document.body.appendChild(container);

    wizard = new RouteCreationWizard('route-creation-wizard-section');
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Step 1 workflow - all three options', () => {
    it('should allow selecting import save game option', () => {
      wizard.show();
      
      const importRadio = container.querySelector('input[value="import"]');
      expect(importRadio).toBeTruthy();
      
      importRadio.click();
      
      const state = wizard.getState();
      expect(state.step1Data.setupChoice).toBe('import');
    });

    it('should allow selecting manual setup option', () => {
      wizard.show();
      
      const manualRadio = container.querySelector('input[value="manual"]');
      expect(manualRadio).toBeTruthy();
      
      manualRadio.click();
      
      const state = wizard.getState();
      expect(state.step1Data.setupChoice).toBe('manual');
    });

    it('should allow selecting fresh start option', () => {
      wizard.show();
      
      const freshRadio = container.querySelector('input[value="fresh"]');
      expect(freshRadio).toBeTruthy();
      
      freshRadio.click();
      
      const state = wizard.getState();
      expect(state.step1Data.setupChoice).toBe('fresh');
    });

    it('should proceed to Step 2 when fresh start is selected and Next is clicked', () => {
      wizard.show();
      
      const freshRadio = container.querySelector('input[value="fresh"]');
      freshRadio.click();
      
      const nextBtn = container.querySelector('#wizard-next-btn');
      nextBtn.click();
      
      const state = wizard.getState();
      expect(state.currentStep).toBe(1);
    });
  });
});

