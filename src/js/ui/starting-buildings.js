/**
 * Starting buildings selector UI component
 * Allows users to specify buildings they already own
 */

export class StartingBuildingsSelector {
  constructor(containerId, onUpdate) {
    this.container = document.getElementById(containerId);
    this.onUpdate = onUpdate;
    this.startingBuildings = {};
    this.availableBuildings = [];
    this.currentVersion = null;
    // Check if we're in wizard context - if so, always expanded
    this.isInWizard = containerId && containerId.includes('wizard');
    this.isCollapsed = !this.isInWizard; // Expanded in wizard, collapsed by default elsewhere
  }

  /**
   * Initialize the component with a game version
   * @param {Object} version - Game version data
   */
  async init(versionId = 'v2052') {
    try {
      // Dynamically import the version to get building names
      const versionModules = await import(`../../data/versions/${versionId}.js`);
      const version = versionModules.default;
      this.currentVersion = version;
      this.availableBuildings = version.buildingNames || [];
      this.render();
    } catch (error) {
      console.error('Error loading version for starting buildings:', error);
      // Fallback to empty list
      this.availableBuildings = [];
      this.render();
    }
  }

  /**
   * Render the starting buildings selector
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="starting-buildings-container">
        ${!this.isInWizard ? `
          <div class="starting-buildings-header" id="starting-buildings-header">
            <h3>Starting Buildings (Optional)</h3>
            <button type="button" class="collapse-toggle" id="collapse-toggle" aria-label="Toggle starting buildings section" aria-expanded="${!this.isCollapsed}">
              <span class="collapse-icon">${this.isCollapsed ? '▼' : '▲'}</span>
            </button>
          </div>
        ` : `
          <div class="starting-buildings-header" id="starting-buildings-header">
            <h3>Starting Buildings (Optional)</h3>
          </div>
        `}
        <div class="starting-buildings-content ${this.isInWizard ? '' : (this.isCollapsed ? 'collapsed' : '')}" id="starting-buildings-content">
          <p class="starting-buildings-description">
            Specify buildings you already own. The simulation will start from this state.
          </p>
          <div class="starting-buildings-grid" id="starting-buildings-grid">
            ${this.availableBuildings.map(building => this.renderBuildingInput(building)).join('')}
          </div>
          <div class="starting-buildings-actions">
            <button type="button" class="btn-clear" id="clear-starting-buildings">Clear All</button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Render a single building input
   */
  renderBuildingInput(buildingName) {
    const count = this.startingBuildings[buildingName] || 0;
    return `
      <div class="building-input-group" data-building="${this.escapeHtml(buildingName)}">
        <label for="building-${this.sanitizeId(buildingName)}" class="building-label">
          ${this.escapeHtml(buildingName)}
        </label>
        <input
          type="number"
          id="building-${this.sanitizeId(buildingName)}"
          class="building-count-input"
          min="0"
          value="${count}"
          data-building="${this.escapeHtml(buildingName)}"
          aria-label="Number of ${this.escapeHtml(buildingName)} owned"
        >
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Collapse toggle button - only attach if not in wizard context
    if (!this.isInWizard) {
      const toggleButton = this.container.querySelector('#collapse-toggle');
      const header = this.container.querySelector('#starting-buildings-header');
      if (toggleButton) {
        toggleButton.addEventListener('click', () => {
          this.toggleCollapse();
        });
      }
      // Make header clickable
      if (header) {
        header.addEventListener('click', (e) => {
          // Only toggle if clicking on header, not on the button itself (to avoid double toggle)
          if (e.target === header || e.target.closest('h3')) {
            this.toggleCollapse();
          }
        });
        header.style.cursor = 'pointer';
      }
    }

    // Listen for input changes
    const inputs = this.container.querySelectorAll('.building-count-input');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.handleInputChange(e);
      });
      input.addEventListener('change', (e) => {
        this.handleInputChange(e);
      });
    });

    // Clear all button
    const clearButton = this.container.querySelector('#clear-starting-buildings');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearAll();
      });
    }
  }

  /**
   * Toggle collapse state
   */
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.render();
  }

  /**
   * Handle input change
   */
  handleInputChange(event) {
    const buildingName = event.target.dataset.building;
    const value = parseInt(event.target.value, 10);

    if (isNaN(value) || value < 0) {
      // Invalid input, reset to 0
      event.target.value = 0;
      delete this.startingBuildings[buildingName];
    } else if (value === 0) {
      // Remove from starting buildings if 0
      delete this.startingBuildings[buildingName];
    } else {
      // Update starting buildings
      this.startingBuildings[buildingName] = value;
    }

    // Notify parent component
    if (this.onUpdate) {
      this.onUpdate(this.getStartingBuildings());
    }
  }

  /**
   * Clear all starting buildings
   */
  clearAll() {
    this.startingBuildings = {};
    const inputs = this.container.querySelectorAll('.building-count-input');
    inputs.forEach(input => {
      input.value = 0;
    });

    if (this.onUpdate) {
      this.onUpdate(this.getStartingBuildings());
    }
  }

  /**
   * Get current starting buildings
   * @returns {Object} Map of building names to counts
   */
  getStartingBuildings() {
    // Return a copy to prevent external modification
    return { ...this.startingBuildings };
  }

  /**
   * Set starting buildings
   * @param {Object} buildings - Map of building names to counts
   */
  setStartingBuildings(buildings) {
    this.startingBuildings = { ...buildings };
    this.render();
  }

  /**
   * Validate building names against available buildings
   * @param {Object} buildings - Map of building names to counts
   * @returns {Object} Validated buildings (invalid ones removed)
   */
  validateBuildings(buildings) {
    const validated = {};
    for (const [buildingName, count] of Object.entries(buildings)) {
      if (this.availableBuildings.includes(buildingName) && count > 0) {
        validated[buildingName] = count;
      }
    }
    return validated;
  }

  /**
   * Sanitize building name for use as HTML ID
   */
  sanitizeId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show/hide the component
   */
  setVisible(visible) {
    if (this.container) {
      this.container.style.display = visible ? 'block' : 'none';
    }
  }
}

