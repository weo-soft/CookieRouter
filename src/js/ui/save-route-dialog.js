/**
 * Save Route Dialog UI component
 * Allows users to save calculated routes with custom names
 */

import { saveSavedRoute, saveProgress } from '../storage.js';

export class SaveRouteDialog {
  constructor(containerId, onSave, onCancel) {
    this.container = document.getElementById(containerId);
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.currentRoute = null;
    this.currentCategory = null;
    this.currentVersionId = null;
  }

  /**
   * Show the save route dialog
   * @param {Object} route - Route object to save
   * @param {Object} category - Category object
   * @param {string} versionId - Game version ID
   */
  show(route, category, versionId) {
    if (!route || !category) {
      console.error('SaveRouteDialog.show: route and category are required');
      return;
    }

    this.currentRoute = route;
    this.currentCategory = category;
    this.currentVersionId = versionId || 'v2052';

    const defaultName = this.generateDefaultRouteName(category.name);
    this.render(defaultName);
    this.attachEventListeners();
    
    // Focus on the name input
    const nameInput = this.container.querySelector('#save-route-name');
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  }

  /**
   * Hide the save route dialog
   */
  hide() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.currentRoute = null;
    this.currentCategory = null;
  }

  /**
   * Generate default route name from category name and timestamp
   * Format: "{Category Name} - {YYYY-MM-DD HH:MM}"
   * @param {string} categoryName - Name of the category
   * @returns {string} Default route name
   */
  generateDefaultRouteName(categoryName) {
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, '0');
    const day = String(timestamp.getDate()).padStart(2, '0');
    const hours = String(timestamp.getHours()).padStart(2, '0');
    const minutes = String(timestamp.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    return `${categoryName} - ${formattedDate}`;
  }

  /**
   * Render the dialog
   * @param {string} defaultName - Default name for the route
   */
  render(defaultName) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="save-route-dialog-overlay" role="dialog" aria-labelledby="save-route-dialog-title" aria-modal="true">
        <div class="save-route-dialog">
          <h2 id="save-route-dialog-title">Save Route</h2>
          <form id="save-route-form">
            <div class="form-group">
              <label for="save-route-name">Route Name:</label>
              <input 
                type="text" 
                id="save-route-name" 
                value="${this.escapeHtml(defaultName)}" 
                maxlength="100"
                required
                aria-required="true"
                aria-describedby="name-help"
              >
              <p id="name-help" class="help-text">Enter a name for this route (1-100 characters)</p>
              <p class="error-message" id="name-error" role="alert"></p>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Save Route</button>
              <button type="button" id="cancel-save-route-btn" class="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const form = this.container.querySelector('#save-route-form');
    const cancelBtn = this.container.querySelector('#cancel-save-route-btn');
    const nameInput = this.container.querySelector('#save-route-name');

    form?.addEventListener('submit', this.handleSubmit.bind(this));
    cancelBtn?.addEventListener('click', () => {
      this.hide();
      if (this.onCancel) {
        this.onCancel();
      }
    });

    // Close on overlay click
    const overlay = this.container.querySelector('.save-route-dialog-overlay');
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hide();
        if (this.onCancel) {
          this.onCancel();
        }
      }
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.hide();
        if (this.onCancel) {
          this.onCancel();
        }
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Validate name on input
    nameInput?.addEventListener('input', () => {
      this.validateName(nameInput.value);
    });
  }

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  handleSubmit(event) {
    event.preventDefault();
    
    const nameInput = this.container.querySelector('#save-route-name');
    const routeName = nameInput.value.trim();

    if (!this.validateName(routeName)) {
      return;
    }

    try {
      this.saveRoute(routeName);
      this.showSuccessMessage();
      // Hide dialog after a short delay to show success message
      setTimeout(() => {
        this.hide();
        if (this.onSave) {
          this.onSave();
        }
      }, 1500);
    } catch (error) {
      console.error('Error saving route:', error);
      const errorElement = this.container.querySelector('#name-error');
      if (errorElement) {
        let errorMessage = 'Failed to save route. Please try again.';
        if (error.message) {
          if (error.message.includes('quota exceeded')) {
            errorMessage = 'Storage is full. Please delete some old saved routes and try again.';
          } else if (error.message.includes('validation')) {
            errorMessage = error.message;
          } else {
            errorMessage = error.message;
          }
        }
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      }
    }
  }

  /**
   * Validate route name
   * @param {string} name - Route name to validate
   * @returns {boolean} True if valid, false otherwise
   */
  validateName(name) {
    const errorElement = this.container.querySelector('#name-error');
    if (!errorElement) return false;

    errorElement.textContent = '';

    if (!name || name.trim().length === 0) {
      errorElement.textContent = 'Route name is required.';
      return false;
    }

    if (name.length > 100) {
      errorElement.textContent = 'Route name cannot exceed 100 characters.';
      return false;
    }

    return true;
  }

  /**
   * Save the route with the given name
   * @param {string} routeName - Name for the route
   */
  saveRoute(routeName) {
    if (!this.currentRoute || !this.currentCategory) {
      throw new Error('Route and category are required to save');
    }

    // Generate unique ID for saved route
    const savedRouteId = `saved-route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    // Create SavedRoute object
    const savedRoute = {
      id: savedRouteId,
      name: routeName,
      categoryId: this.currentCategory.id,
      categoryName: this.currentCategory.name,
      versionId: this.currentVersionId,
      routeData: {
        buildings: this.currentRoute.buildings || [],
        algorithm: this.currentRoute.algorithm || 'GPL',
        lookahead: this.currentRoute.lookahead || 1,
        completionTime: this.currentRoute.completionTime || 0,
        startingBuildings: this.currentRoute.startingBuildings || {}
      },
      savedAt: now,
      lastAccessedAt: now,
      createdAt: now
    };

    // Save to localStorage
    saveSavedRoute(savedRoute);

    // Create initial progress for this saved route
    // Note: saveProgress expects a progress object with routeId, but for saved routes
    // we use savedRouteId. The storage layer handles both cases.
    const progress = {
      routeId: savedRouteId, // Use routeId field for compatibility
      completedBuildings: [],
      lastUpdated: now
    };
    saveProgress(progress);
  }

  /**
   * Show success message after saving
   */
  showSuccessMessage() {
    const form = this.container.querySelector('#save-route-form');
    if (form) {
      form.innerHTML = `
        <div class="success-message" role="alert">
          <span class="success-icon">✓</span>
          <p>Route saved successfully!</p>
        </div>
      `;
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

