/**
 * Unit tests for Wizard Initial Setup Component (Step 1)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WizardInitialSetup } from '../../src/js/ui/wizard-initial-setup.js';

describe('WizardInitialSetup', () => {
  let container;
  let component;

  beforeEach(() => {
    // Create a container element for each test
    container = document.createElement('div');
    container.id = 'test-initial-setup';
    document.body.appendChild(container);

    component = new WizardInitialSetup('test-initial-setup');
  });

  afterEach(() => {
    // Clean up
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const state = component.getState();
      
      expect(state.setupChoice).toBeNull();
      expect(state.importedSaveGame).toBeNull();
      expect(state.manualBuildings).toBeNull();
      expect(state.versionId).toBeNull();
    });

    it('should initialize with provided initial state', () => {
      const initialState = {
        setupChoice: 'fresh',
        versionId: 'v2048'
      };
      
      component = new WizardInitialSetup('test-initial-setup', initialState);
      const state = component.getState();
      
      expect(state.setupChoice).toBe('fresh');
      expect(state.versionId).toBe('v2048');
    });
  });

  describe('Setup choice selection', () => {
    it('should handle import save game choice', () => {
      const onUpdate = vi.fn();
      component = new WizardInitialSetup('test-initial-setup', null, onUpdate);
      component.render();
      
      const importRadio = container.querySelector('input[value="import"]');
      importRadio.click();
      
      expect(component.getState().setupChoice).toBe('import');
      expect(onUpdate).toHaveBeenCalled();
    });

    it('should handle manual setup choice', () => {
      const onUpdate = vi.fn();
      component = new WizardInitialSetup('test-initial-setup', null, onUpdate);
      component.render();
      
      const manualRadio = container.querySelector('input[value="manual"]');
      manualRadio.click();
      
      expect(component.getState().setupChoice).toBe('manual');
      expect(onUpdate).toHaveBeenCalled();
    });

    it('should handle fresh start choice', () => {
      const onUpdate = vi.fn();
      component = new WizardInitialSetup('test-initial-setup', null, onUpdate);
      component.render();
      
      const freshRadio = container.querySelector('input[value="fresh"]');
      freshRadio.click();
      
      expect(component.getState().setupChoice).toBe('fresh');
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  describe('State management', () => {
    it('should update state when setState is called', () => {
      component.render();
      
      const newState = {
        setupChoice: 'import',
        versionId: 'v2048'
      };
      
      component.setState(newState);
      
      const state = component.getState();
      expect(state.setupChoice).toBe('import');
      expect(state.versionId).toBe('v2048');
    });

    it('should preserve existing state when setState is called with partial data', () => {
      component.setState({ setupChoice: 'manual' });
      component.setState({ versionId: 'v2052' });
      
      const state = component.getState();
      expect(state.setupChoice).toBe('manual');
      expect(state.versionId).toBe('v2052');
    });
  });

  describe('Error handling', () => {
    it('should display error messages', () => {
      component.render();
      
      const errors = ['Please select an initial setup option'];
      component.showErrors(errors);
      
      const errorElement = container.querySelector('#step1-error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Please select an initial setup option');
      expect(errorElement.style.display).not.toBe('none');
    });

    it('should clear error messages', () => {
      component.render();
      component.showErrors(['Error message']);
      component.clearErrors();
      
      const errorElement = container.querySelector('#step1-error');
      expect(errorElement.style.display).toBe('none');
    });
  });
});

