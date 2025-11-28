/**
 * Custom category form UI component
 * Allows users to create and save custom categories
 */

import { saveCategory, getCategories } from '../storage.js';

export class CustomCategoryForm {
  constructor(containerId, onSave, onCancel) {
    this.container = document.getElementById(containerId);
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.isVisible = false;
    this.editingCategory = null;
    this.availableVersions = [
      { id: 'v2052', name: 'v2.052 (Current)' },
      { id: 'v2048', name: 'v2.048 (Previous)' },
      { id: 'v2031', name: 'v2.031 (Legacy)' },
      { id: 'v10466', name: 'v1.0466 (Classic)' },
      { id: 'v10466_xmas', name: 'v10466 (Christmas)' }
    ];
    // Hide container on initialization
    if (this.container) {
      this.render();
    }
  }

  /**
   * Show the form (for creating new category)
   */
  show() {
    this.editingCategory = null;
    this.isVisible = true;
    this.render();
  }

  /**
   * Show the form for editing an existing category
   */
  showForEdit(category) {
    this.editingCategory = category;
    this.isVisible = true;
    this.render();
  }

  /**
   * Hide the form
   */
  hide() {
    this.isVisible = false;
    this.editingCategory = null;
    this.render();
  }

  /**
   * Render the form
   */
  render() {
    if (!this.container) return;

    if (!this.isVisible) {
      this.container.innerHTML = '';
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = '';

    const category = this.editingCategory || this.getDefaultCategory();

    this.container.innerHTML = `
      <div class="custom-category-form-container">
        <h3>${this.editingCategory ? 'Edit Category' : 'Create Custom Category'}</h3>
        <form id="custom-category-form" class="custom-category-form">
          <div class="form-group">
            <label for="category-name">Category Name *</label>
            <input
              type="text"
              id="category-name"
              name="name"
              required
              maxlength="100"
              value="${this.escapeHtml(category.name)}"
              aria-required="true"
              aria-describedby="name-error"
            >
            <span id="name-error" class="error-message" role="alert"></span>
          </div>

          <div class="form-group">
            <label for="category-version">Game Version *</label>
            <select
              id="category-version"
              name="version"
              required
              aria-required="true"
            >
              ${this.availableVersions.map(v => `
                <option value="${v.id}" ${v.id === category.version ? 'selected' : ''}>
                  ${v.name}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="target-cookies">Target Cookies *</label>
            <input
              type="number"
              id="target-cookies"
              name="targetCookies"
              required
              min="1"
              step="1"
              value="${category.targetCookies}"
              aria-required="true"
              aria-describedby="target-error"
            >
            <span id="target-error" class="error-message" role="alert"></span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="player-cps">Player Clicks Per Second</label>
              <input
                type="number"
                id="player-cps"
                name="playerCps"
                min="0"
                step="0.1"
                value="${category.playerCps || 8}"
                aria-describedby="cps-help"
              >
              <span id="cps-help" class="help-text">Default: 8</span>
            </div>

            <div class="form-group">
              <label for="player-delay">Player Delay (seconds)</label>
              <input
                type="number"
                id="player-delay"
                name="playerDelay"
                min="0"
                step="0.1"
                value="${category.playerDelay || 1}"
                aria-describedby="delay-help"
              >
              <span id="delay-help" class="help-text">Default: 1</span>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                id="hardcore-mode"
                name="hardcoreMode"
                ${category.hardcoreMode ? 'checked' : ''}
              >
              <span>Hardcore Mode (disable upgrades)</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              ${this.editingCategory ? 'Update Category' : 'Create Category'}
            </button>
            <button type="button" class="btn-secondary" id="cancel-category-form">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Get default category values
   */
  getDefaultCategory() {
    return {
      name: '',
      version: 'v2052',
      targetCookies: 1000000,
      playerCps: 8,
      playerDelay: 1,
      hardcoreMode: false
    };
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const form = this.container.querySelector('#custom-category-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    const cancelButton = this.container.querySelector('#cancel-category-form');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.handleCancel();
      });
    }
  }

  /**
   * Handle form submission
   */
  handleSubmit() {
    const form = this.container.querySelector('#custom-category-form');
    if (!form) return;

    const formData = new FormData(form);
    const categoryData = {
      name: formData.get('name').trim(),
      version: formData.get('version'),
      targetCookies: parseFloat(formData.get('targetCookies')),
      playerCps: parseFloat(formData.get('playerCps')) || 8,
      playerDelay: parseFloat(formData.get('playerDelay')) || 1,
      hardcoreMode: formData.get('hardcoreMode') === 'on'
    };

    // Validate category
    const validation = this.validateCategory(categoryData);
    if (!validation.valid) {
      this.showValidationErrors(validation.errors);
      return;
    }

    // Check for duplicate names (if creating new, or if editing and name changed)
    if (!this.editingCategory || categoryData.name !== this.editingCategory.name) {
      const existing = getCategories().find(c => 
        !c.isPredefined && 
        c.name.toLowerCase() === categoryData.name.toLowerCase()
      );
      if (existing) {
        this.showValidationErrors({ name: 'A category with this name already exists.' });
        return;
      }
    }

    // Create category object
    const category = {
      id: this.editingCategory ? this.editingCategory.id : `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: categoryData.name,
      isPredefined: false,
      version: categoryData.version,
      targetCookies: categoryData.targetCookies,
      playerCps: categoryData.playerCps,
      playerDelay: categoryData.playerDelay,
      hardcoreMode: categoryData.hardcoreMode
    };

    // Add timestamps
    if (this.editingCategory) {
      category.createdAt = this.editingCategory.createdAt;
      category.updatedAt = Date.now();
    } else {
      category.createdAt = Date.now();
    }

    try {
      saveCategory(category);
      this.hide();
      if (this.onSave) {
        this.onSave(category);
      }
    } catch (error) {
      this.showValidationErrors({ general: error.message || 'Failed to save category.' });
    }
  }

  /**
   * Validate category data
   */
  validateCategory(category) {
    const errors = {};

    // Name validation
    if (!category.name || category.name.trim().length === 0) {
      errors.name = 'Category name is required.';
    } else if (category.name.length > 100) {
      errors.name = 'Category name must be 100 characters or less.';
    }

    // Version validation
    const validVersions = this.availableVersions.map(v => v.id);
    if (!validVersions.includes(category.version)) {
      errors.version = 'Invalid game version.';
    }

    // Target cookies validation
    if (!category.targetCookies || category.targetCookies <= 0) {
      errors.target = 'Target cookies must be a positive number.';
    } else if (!isFinite(category.targetCookies)) {
      errors.target = 'Target cookies must be a valid number.';
    }

    // Player CPS validation
    if (category.playerCps < 0) {
      errors.playerCps = 'Player CPS must be non-negative.';
    }

    // Player delay validation
    if (category.playerDelay < 0) {
      errors.playerDelay = 'Player delay must be non-negative.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Show validation errors
   */
  showValidationErrors(errors) {
    // Clear previous errors
    this.container.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });

    // Show new errors
    for (const [field, message] of Object.entries(errors)) {
      const errorElement = this.container.querySelector(`#${field}-error`);
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      } else if (field === 'general') {
        // Show general error at top of form
        const form = this.container.querySelector('#custom-category-form');
        if (form) {
          let generalError = form.querySelector('.general-error');
          if (!generalError) {
            generalError = document.createElement('div');
            generalError.className = 'general-error error-message';
            generalError.setAttribute('role', 'alert');
            form.insertBefore(generalError, form.firstChild);
          }
          generalError.textContent = message;
          generalError.style.display = 'block';
        }
      }
    }
  }

  /**
   * Handle cancel
   */
  handleCancel() {
    this.hide();
    if (this.onCancel) {
      this.onCancel();
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

