/**
 * Wizard Route Chain Selection Component
 * Component for selecting multiple routes (categories or achievement routes) for chaining
 */

import { CategorySelector } from './category-selector.js';
import { CustomCategoryForm } from './custom-category-form.js';
import { WizardAchievementSelection } from './wizard-achievement-selection.js';

export class WizardRouteChainSelection {
  constructor(containerId, onRoutesSelected = null, options = {}) {
    this.container = document.getElementById(containerId);
    this.onRoutesSelected = onRoutesSelected;
    this.options = {
      allowReordering: options.allowReordering !== false,
      allowRemoval: options.allowRemoval !== false,
      maxRoutes: options.maxRoutes || 50,
      ...options
    };
    
    this.selectedRoutes = [];
    this.isVisible = false;
    this.categorySelector = null;
    this.customCategoryForm = null;
    this.achievementSelection = null;
  }

  /**
   * Render the component
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="wizard-route-chain-selection">
        <h3>Select Routes for Chain</h3>
        <p class="description">Add multiple routes to create a chain. Each route will use buildings and upgrades from previous routes.</p>
        
        <div class="route-chain-controls">
          <div class="add-route-section">
            <h4>Add Route</h4>
            <div class="route-type-selector">
              <label class="route-type-option">
                <input type="radio" name="route-type" value="category" checked>
                <span>Category Route</span>
              </label>
              <label class="route-type-option">
                <input type="radio" name="route-type" value="achievement">
                <span>Achievement Route</span>
              </label>
            </div>
            
            <div id="route-chain-category-selector" class="route-selector-content" style="display: block;">
              <!-- Category selector will be inserted here -->
            </div>
            
            <div id="route-chain-achievement-selector" class="route-selector-content" style="display: none;">
              <!-- Achievement selector will be inserted here -->
            </div>
            
            <button type="button" class="btn-add-route" id="btn-add-route" disabled>Add Route to Chain</button>
          </div>
          
          <div class="selected-routes-section">
            <h4>Selected Routes (${this.selectedRoutes.length})</h4>
            <div id="route-chain-list" class="route-chain-list">
              ${this.renderRouteList()}
            </div>
            <div class="route-chain-validation" id="route-chain-validation" style="display: none;"></div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.initializeSelectors();
  }

  /**
   * Render the list of selected routes
   * @returns {string} HTML string for route list
   */
  renderRouteList() {
    if (this.selectedRoutes.length === 0) {
      return '<p class="no-routes-message">No routes selected. Add routes above to create a chain.</p>';
    }

    return this.selectedRoutes.map((route, index) => {
      const routeName = route.routeConfig.type === 'category' 
        ? route.routeConfig.categoryName || route.routeConfig.categoryId
        : `Achievements: ${route.routeConfig.achievementIds?.join(', ') || 'Unknown'}`;
      
      return `
        <div class="route-chain-item" data-route-index="${index}">
          <div class="route-chain-item-header">
            <span class="route-index">${index + 1}.</span>
            <span class="route-name">${routeName}</span>
            <span class="route-type-badge">${route.routeConfig.type}</span>
          </div>
          <div class="route-chain-item-actions">
            ${this.options.allowReordering ? `
              <button type="button" class="btn-move-up" data-action="move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''} title="Move up">
                ↑
              </button>
              <button type="button" class="btn-move-down" data-action="move-down" data-index="${index}" ${index === this.selectedRoutes.length - 1 ? 'disabled' : ''} title="Move down">
                ↓
              </button>
            ` : ''}
            ${this.options.allowRemoval ? `
              <button type="button" class="btn-remove-route" data-action="remove" data-index="${index}" title="Remove route">
                ×
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Initialize category and achievement selectors
   */
  async initializeSelectors() {
    // Initialize category selector
    const categoryContainer = document.getElementById('route-chain-category-selector');
    if (categoryContainer) {
      this.categorySelector = new CategorySelector('route-chain-category-selector', (category) => {
        this.handleCategorySelected(category);
      }, {
        showCreateButton: false
      });
      await this.categorySelector.init();
    }

    // Initialize achievement selector
    const achievementContainer = document.getElementById('route-chain-achievement-selector');
    if (achievementContainer) {
      this.achievementSelection = new WizardAchievementSelection('route-chain-achievement-selector', null, (achievementIds) => {
        this.handleAchievementsSelected(achievementIds);
      });
      await this.achievementSelection.render();
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Route type selector
    const routeTypeRadios = this.container.querySelectorAll('input[name="route-type"]');
    routeTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.handleRouteTypeChange(e.target.value);
      });
    });

    // Add route button
    const addButton = this.container.querySelector('#btn-add-route');
    if (addButton) {
      addButton.addEventListener('click', () => {
        this.handleAddRoute();
      });
    }

    // Route list actions (move up, move down, remove)
    this.container.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]');
      if (!action) return;

      const actionType = action.dataset.action;
      const index = parseInt(action.dataset.index, 10);

      if (actionType === 'move-up') {
        this.reorderRoutes(index, index - 1);
      } else if (actionType === 'move-down') {
        this.reorderRoutes(index, index + 1);
      } else if (actionType === 'remove') {
        this.removeRoute(index);
      }
    });
  }

  /**
   * Handle route type change
   * @param {string} routeType - 'category' or 'achievement'
   */
  handleRouteTypeChange(routeType) {
    const categorySection = document.getElementById('route-chain-category-selector');
    const achievementSection = document.getElementById('route-chain-achievement-selector');
    const addButton = document.getElementById('btn-add-route');

    if (routeType === 'category') {
      if (categorySection) categorySection.style.display = 'block';
      if (achievementSection) achievementSection.style.display = 'none';
    } else {
      if (categorySection) categorySection.style.display = 'none';
      if (achievementSection) achievementSection.style.display = 'block';
    }

    // Reset add button state
    if (addButton) {
      addButton.disabled = true;
    }
  }

  /**
   * Handle category selected
   * @param {Object} category - Selected category
   */
  handleCategorySelected(category) {
    const addButton = document.getElementById('btn-add-route');
    if (addButton) {
      addButton.disabled = false;
    }
    this.pendingCategory = category;
  }

  /**
   * Handle achievements selected
   * @param {Array} achievementIds - Selected achievement IDs
   */
  handleAchievementsSelected(achievementIds) {
    const addButton = document.getElementById('btn-add-route');
    if (addButton && achievementIds && achievementIds.length > 0) {
      addButton.disabled = false;
    } else if (addButton) {
      addButton.disabled = true;
    }
    this.pendingAchievementIds = achievementIds;
  }

  /**
   * Handle add route button click
   */
  handleAddRoute() {
    const routeType = this.container.querySelector('input[name="route-type"]:checked')?.value;
    
    if (routeType === 'category' && this.pendingCategory) {
      this.addRoute({
        type: 'category',
        categoryId: this.pendingCategory.id,
        categoryName: this.pendingCategory.name,
        versionId: this.pendingCategory.version || 'v2052',
        hardcoreMode: this.pendingCategory.hardcoreMode || false
      });
      this.pendingCategory = null;
    } else if (routeType === 'achievement' && this.pendingAchievementIds && this.pendingAchievementIds.length > 0) {
      // Get version from achievement selection if available
      const versionId = this.achievementSelection?.state?.versionId || 'v2052';
      this.addRoute({
        type: 'achievement',
        achievementIds: [...this.pendingAchievementIds],
        versionId: versionId,
        hardcoreMode: false // Achievement routes typically don't use hardcore mode
      });
      this.pendingAchievementIds = null;
    }

    // Reset add button
    const addButton = document.getElementById('btn-add-route');
    if (addButton) {
      addButton.disabled = true;
    }
  }

  /**
   * Get selected routes
   * @returns {Array} Array of selected route configurations
   */
  getSelectedRoutes() {
    return this.selectedRoutes.map(route => ({
      routeIndex: route.routeIndex,
      routeConfig: route.routeConfig,
      startingBuildings: route.startingBuildings || {},
      startingUpgrades: route.startingUpgrades || []
    }));
  }

  /**
   * Add a route to the selection
   * @param {Object} routeConfig - Route configuration
   */
  addRoute(routeConfig) {
    if (this.selectedRoutes.length >= this.options.maxRoutes) {
      this.showValidationError(`Maximum ${this.options.maxRoutes} routes allowed`);
      return;
    }

    const chainedRoute = {
      routeIndex: this.selectedRoutes.length,
      routeConfig: {
        type: routeConfig.type,
        categoryId: routeConfig.categoryId,
        categoryName: routeConfig.categoryName,
        achievementIds: routeConfig.achievementIds,
        versionId: routeConfig.versionId,
        hardcoreMode: routeConfig.hardcoreMode || false
      },
      startingBuildings: {},
      startingUpgrades: [],
      progress: {},
      completedSteps: 0,
      isComplete: false
    };

    this.selectedRoutes.push(chainedRoute);
    this.updateRouteList();
    this.clearValidationError();

    if (this.onRoutesSelected) {
      this.onRoutesSelected(this.getSelectedRoutes());
    }
  }

  /**
   * Remove a route from the selection
   * @param {number} routeIndex - Index of route to remove
   */
  removeRoute(routeIndex) {
    if (routeIndex < 0 || routeIndex >= this.selectedRoutes.length) {
      return;
    }

    this.selectedRoutes.splice(routeIndex, 1);
    
    // Update route indices
    this.selectedRoutes.forEach((route, index) => {
      route.routeIndex = index;
    });

    this.updateRouteList();

    if (this.onRoutesSelected) {
      this.onRoutesSelected(this.getSelectedRoutes());
    }
  }

  /**
   * Reorder routes in the selection
   * @param {number} fromIndex - Current index
   * @param {number} toIndex - New index
   */
  reorderRoutes(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.selectedRoutes.length ||
        toIndex < 0 || toIndex >= this.selectedRoutes.length) {
      return;
    }

    // Move route
    const route = this.selectedRoutes.splice(fromIndex, 1)[0];
    this.selectedRoutes.splice(toIndex, 0, route);

    // Update route indices
    this.selectedRoutes.forEach((route, index) => {
      route.routeIndex = index;
    });

    this.updateRouteList();

    if (this.onRoutesSelected) {
      this.onRoutesSelected(this.getSelectedRoutes());
    }
  }

  /**
   * Update the route list display
   */
  updateRouteList() {
    const listContainer = document.getElementById('route-chain-list');
    if (listContainer) {
      listContainer.innerHTML = this.renderRouteList();
    }

    // Update header count
    const header = this.container.querySelector('.selected-routes-section h4');
    if (header) {
      header.textContent = `Selected Routes (${this.selectedRoutes.length})`;
    }
  }

  /**
   * Validate that at least one route is selected
   * @returns {boolean} True if valid
   */
  validate() {
    const isValid = this.selectedRoutes.length > 0;
    if (!isValid) {
      this.showValidationError('At least one route must be selected');
    } else {
      this.clearValidationError();
    }
    return isValid;
  }

  /**
   * Show validation error
   * @param {string} message - Error message
   */
  showValidationError(message) {
    const validationDiv = document.getElementById('route-chain-validation');
    if (validationDiv) {
      validationDiv.textContent = message;
      validationDiv.style.display = 'block';
      validationDiv.setAttribute('role', 'alert');
    }
  }

  /**
   * Clear validation error
   */
  clearValidationError() {
    const validationDiv = document.getElementById('route-chain-validation');
    if (validationDiv) {
      validationDiv.textContent = '';
      validationDiv.style.display = 'none';
      validationDiv.removeAttribute('role');
    }
  }
}
