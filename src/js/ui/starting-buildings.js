/**
 * Starting buildings selector UI component
 * Allows users to specify buildings they already own
 */

export class StartingBuildingsSelector {
  constructor(containerId, onUpdate) {
    this.container = document.getElementById(containerId);
    this.onUpdate = onUpdate;
    this.startingBuildings = {};
    this.purchasedUpgrades = new Set(); // Track purchased upgrades
    this.availableBuildings = [];
    this.availableUpgrades = []; // Array of upgrade objects
    this.upgradesByBuilding = new Map(); // Map building name to array of upgrades
    this.currentVersion = null;
    this.currentUpgradeDialog = null; // Currently open upgrade dialog
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
      // Dynamically import the version to get building names and upgrades
      const versionModules = await import(`../../data/versions/${versionId}.js`);
      const version = versionModules.default;
      this.currentVersion = version;
      this.availableBuildings = version.buildingNames || [];
      
      // Extract upgrade objects from the menu Set and organize by building
      this.availableUpgrades = [];
      this.upgradesByBuilding = new Map();
      
      // Initialize map for all buildings
      for (const buildingName of this.availableBuildings) {
        this.upgradesByBuilding.set(buildingName, []);
      }
      
      if (version.menu && version.menu instanceof Set) {
        for (const upgrade of version.menu) {
          this.availableUpgrades.push(upgrade);
          
          // Organize upgrades by which buildings they affect
          // An upgrade can affect multiple buildings, so add it to all relevant building lists
          if (upgrade.effects) {
            const affectedBuildings = new Set();
            
            for (const buildingName in upgrade.effects) {
              // Map 'mouse' upgrades to 'Cursor' building
              if (buildingName === 'mouse' && this.availableBuildings.includes('Cursor')) {
                affectedBuildings.add('Cursor');
              } else if (buildingName === 'all') {
                // Global upgrades - show in Cursor building dialog as a catch-all
                if (this.availableBuildings.includes('Cursor')) {
                  affectedBuildings.add('Cursor');
                }
              } else if (this.upgradesByBuilding.has(buildingName)) {
                affectedBuildings.add(buildingName);
              }
            }
            
            // If upgrade affects at least one building, add it to those building lists
            if (affectedBuildings.size > 0) {
              for (const buildingName of affectedBuildings) {
                this.upgradesByBuilding.get(buildingName).push(upgrade);
              }
            } else if (this.availableBuildings.includes('Cursor')) {
              // Fallback: assign to Cursor if no specific building found
              this.upgradesByBuilding.get('Cursor').push(upgrade);
            }
          }
        }
      } else if (Array.isArray(version.menu)) {
        for (const upgrade of version.menu) {
          this.availableUpgrades.push(upgrade);
          
          // Organize upgrades by which buildings they affect
          // An upgrade can affect multiple buildings, so add it to all relevant building lists
          if (upgrade.effects) {
            const affectedBuildings = new Set();
            
            for (const buildingName in upgrade.effects) {
              // Map 'mouse' upgrades to 'Cursor' building
              if (buildingName === 'mouse' && this.availableBuildings.includes('Cursor')) {
                affectedBuildings.add('Cursor');
              } else if (buildingName === 'all') {
                // Global upgrades - show in Cursor building dialog as a catch-all
                if (this.availableBuildings.includes('Cursor')) {
                  affectedBuildings.add('Cursor');
                }
              } else if (this.upgradesByBuilding.has(buildingName)) {
                affectedBuildings.add(buildingName);
              }
            }
            
            // If upgrade affects at least one building, add it to those building lists
            if (affectedBuildings.size > 0) {
              for (const buildingName of affectedBuildings) {
                this.upgradesByBuilding.get(buildingName).push(upgrade);
              }
            } else if (this.availableBuildings.includes('Cursor')) {
              // Fallback: assign to Cursor if no specific building found
              this.upgradesByBuilding.get('Cursor').push(upgrade);
            }
          }
        }
      }
      
      // Remove duplicates and sort upgrades by name for each building
      for (const [buildingName, upgrades] of this.upgradesByBuilding.entries()) {
        // Remove duplicates (upgrades might be added multiple times)
        const uniqueUpgrades = Array.from(new Map(upgrades.map(upg => [upg.name, upg])).values());
        this.upgradesByBuilding.set(buildingName, uniqueUpgrades);
        uniqueUpgrades.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      this.render();
    } catch (error) {
      console.error('Error loading version for starting buildings:', error);
      // Fallback to empty list
      this.availableBuildings = [];
      this.availableUpgrades = [];
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
            Specify buildings you already own. Click the ⚙️ button next to each building to select upgrades. The simulation will start from this state.
          </p>
          
          <div class="starting-buildings-section">
            <h4 class="section-title">Buildings</h4>
            <div class="starting-buildings-grid" id="starting-buildings-grid">
              ${this.availableBuildings.map(building => this.renderBuildingInput(building)).join('')}
            </div>
          </div>
          
          <div class="starting-buildings-actions">
            <button type="button" class="btn-clear" id="clear-starting-buildings">Clear All Buildings</button>
            <button type="button" class="btn-clear" id="clear-starting-upgrades">Clear All Upgrades</button>
          </div>
          
          <div id="building-upgrades-dialog-container"></div>
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
    const upgradesForBuilding = this.upgradesByBuilding.get(buildingName) || [];
    const purchasedCount = upgradesForBuilding.filter(upg => this.purchasedUpgrades.has(upg.name)).length;
    const hasUpgrades = upgradesForBuilding.length > 0;
    
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
        ${hasUpgrades ? `
          <button
            type="button"
            class="btn-upgrades"
            data-building="${this.escapeHtml(buildingName)}"
            aria-label="Select upgrades for ${this.escapeHtml(buildingName)}"
            title="Select upgrades (${purchasedCount}/${upgradesForBuilding.length})"
          >
            ⚙️
            ${purchasedCount > 0 ? `<span class="upgrade-count-badge">${purchasedCount}</span>` : ''}
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Show upgrade selection dialog for a building
   */
  showUpgradeDialog(buildingName) {
    const upgrades = this.upgradesByBuilding.get(buildingName) || [];
    if (upgrades.length === 0) {
      return; // No upgrades for this building
    }

    const dialogContainer = this.container.querySelector('#building-upgrades-dialog-container');
    if (!dialogContainer) return;

    // Create dialog HTML
    const dialogId = `upgrade-dialog-${this.sanitizeId(buildingName)}`;
    dialogContainer.innerHTML = `
      <div class="building-upgrades-dialog-overlay" id="${dialogId}-overlay">
        <div class="building-upgrades-dialog">
          <div class="dialog-header">
            <h3>Upgrades for ${this.escapeHtml(buildingName)}</h3>
            <button type="button" class="dialog-close-btn" aria-label="Close dialog">&times;</button>
          </div>
          <div class="dialog-content">
            <div class="upgrades-list">
              ${upgrades.map(upgrade => {
                const isChecked = this.purchasedUpgrades.has(upgrade.name);
                return `
                  <label class="upgrade-checkbox-label">
                    <input
                      type="checkbox"
                      class="upgrade-checkbox"
                      data-upgrade="${this.escapeHtml(upgrade.name)}"
                      ${isChecked ? 'checked' : ''}
                    >
                    <span class="upgrade-name">${this.escapeHtml(upgrade.name)}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>
          <div class="dialog-footer">
            <button type="button" class="btn-primary" id="${dialogId}-save">Save</button>
            <button type="button" class="btn-secondary" id="${dialogId}-cancel">Cancel</button>
          </div>
        </div>
      </div>
    `;

    // Attach event listeners
    const overlay = dialogContainer.querySelector(`#${dialogId}-overlay`);
    const closeBtn = dialogContainer.querySelector('.dialog-close-btn');
    const cancelBtn = dialogContainer.querySelector(`#${dialogId}-cancel`);
    const saveBtn = dialogContainer.querySelector(`#${dialogId}-save`);
    const checkboxes = dialogContainer.querySelectorAll('.upgrade-checkbox');

    const closeDialog = () => {
      dialogContainer.innerHTML = '';
      this.currentUpgradeDialog = null;
    };

    closeBtn?.addEventListener('click', closeDialog);
    cancelBtn?.addEventListener('click', closeDialog);
    
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeDialog();
      }
    });

    saveBtn?.addEventListener('click', () => {
      // Update purchased upgrades for this building
      const buildingUpgrades = upgrades.map(upg => upg.name);
      
      // Remove all upgrades for this building first
      for (const upgradeName of buildingUpgrades) {
        this.purchasedUpgrades.delete(upgradeName);
      }
      
      // Add selected upgrades
      checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
          this.purchasedUpgrades.add(checkbox.dataset.upgrade);
        }
      });
      
      // Notify parent component
      if (this.onUpdate) {
        this.onUpdate(this.getStartingBuildings(), this.getPurchasedUpgrades());
      }
      
      // Re-render to update button badge
      this.render();
      
      closeDialog();
    });

    // Handle Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeDialog();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    this.currentUpgradeDialog = buildingName;
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

    // Listen for upgrade button clicks
    const upgradeButtons = this.container.querySelectorAll('.btn-upgrades');
    upgradeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const buildingName = button.dataset.building;
        this.showUpgradeDialog(buildingName);
      });
    });

    // Clear all buildings button
    const clearBuildingsButton = this.container.querySelector('#clear-starting-buildings');
    if (clearBuildingsButton) {
      clearBuildingsButton.addEventListener('click', () => {
        this.clearAllBuildings();
      });
    }

    // Clear all upgrades button
    const clearUpgradesButton = this.container.querySelector('#clear-starting-upgrades');
    if (clearUpgradesButton) {
      clearUpgradesButton.addEventListener('click', () => {
        this.clearAllUpgrades();
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
      this.onUpdate(this.getStartingBuildings(), this.getPurchasedUpgrades());
    }
  }


  /**
   * Clear all starting buildings
   */
  clearAllBuildings() {
    this.startingBuildings = {};
    const inputs = this.container.querySelectorAll('.building-count-input');
    inputs.forEach(input => {
      input.value = 0;
    });

    if (this.onUpdate) {
      this.onUpdate(this.getStartingBuildings(), this.getPurchasedUpgrades());
    }
  }

  /**
   * Clear all purchased upgrades
   */
  clearAllUpgrades() {
    this.purchasedUpgrades.clear();
    // Re-render to update upgrade button badges
    this.render();

    if (this.onUpdate) {
      this.onUpdate(this.getStartingBuildings(), this.getPurchasedUpgrades());
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
   * Get current purchased upgrades
   * @returns {Array} Array of upgrade names
   */
  getPurchasedUpgrades() {
    // Return an array copy
    return Array.from(this.purchasedUpgrades);
  }

  /**
   * Set purchased upgrades
   * @param {Array} upgrades - Array of upgrade names
   */
  setPurchasedUpgrades(upgrades) {
    this.purchasedUpgrades = new Set(upgrades || []);
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

