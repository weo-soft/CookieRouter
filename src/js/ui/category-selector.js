/**
 * Category selector UI component
 * Displays list of predefined and user-created categories
 */

import { getCategories, deleteCategory } from '../storage.js';
import { short, fledgling, neverclick, hardcore } from '../categories.js';
import { formatNumber as formatNumberUtil } from '../utils/format.js';
import { renderNumberInputWithMultiplier, getNumberInputWithMultiplierValue } from '../utils/number-input.js';

export class CategorySelector {
  constructor(containerId, onSelect, options = {}) {
    this.container = document.getElementById(containerId);
    this.onSelect = onSelect;
    this.categories = [];
    this.selectedCategory = null;
    this.expandedCategoryId = null; // Track which category is expanded
    this.options = {
      showCreateButton: options.showCreateButton !== false, // Default to true, can be disabled for wizard context
      onSettingsChange: options.onSettingsChange || null // Callback when settings are changed in expanded view
    };
  }

  /**
   * Initialize the category selector
   */
  async init() {
    await this.loadCategories();
    this.render();
  }

  /**
   * Load categories from storage and predefined list
   */
  async loadCategories() {
    // Get predefined categories
    const predefined = [
      {
        id: 'predefined-short',
        name: 'Short (Test)',
        isPredefined: true,
        version: 'v2048',
        targetCookies: 1000,
        playerCps: 8,
        playerDelay: 1,
        hardcoreMode: false
      },
      {
        id: 'predefined-fledgling',
        name: 'Fledgling',
        isPredefined: true,
        version: 'v2048',
        targetCookies: 1000000,
        playerCps: 8,
        playerDelay: 1,
        hardcoreMode: false
      },
      {
        id: 'predefined-neverclick',
        name: 'Neverclick',
        isPredefined: true,
        version: 'v2048',
        targetCookies: 1000000,
        playerCps: 0,
        playerDelay: 0,
        hardcoreMode: false
      },
      {
        id: 'predefined-hardcore',
        name: 'Hardcore',
        isPredefined: true,
        version: 'v2048',
        targetCookies: 1000000000,
        playerCps: 8,
        playerDelay: 1,
        hardcoreMode: true
      },
      {
        id: 'predefined-forty',
        name: 'Forty',
        isPredefined: true,
        version: 'v10466',
        targetCookies: 30 * 1000000, // 30 million
        playerCps: 8,
        playerDelay: 1,
        hardcoreMode: false
      },
      {
        id: 'predefined-forty-holiday',
        name: 'Forty Holiday',
        isPredefined: true,
        version: 'v10466_xmas',
        targetCookies: 4 * 1000000, // 4 million
        playerCps: 8,
        playerDelay: 1,
        hardcoreMode: false
      },
      {
        id: 'predefined-longhaul',
        name: 'Longhaul',
        isPredefined: true,
        version: 'v2048',
        targetCookies: 1000 * Math.pow(10, 24), // 1000 septillion
        playerCps: 8,
        playerDelay: 1,
        hardcoreMode: false
      },
      {
        id: 'predefined-nevercore',
        name: 'Nevercore',
        isPredefined: true,
        version: 'v2048',
        targetCookies: 1000000,
        playerCps: 0.0001,
        playerDelay: 0,
        hardcoreMode: true
      }
    ];

    // Get user-created categories
    const userCategories = getCategories().filter(c => !c.isPredefined);

    this.categories = [...predefined, ...userCategories];
  }

  /**
   * Render the category selector
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="category-header">
        <h2>Select Category</h2>
        ${this.options.showCreateButton ? `
          <button type="button" class="btn-create-category" id="create-category-btn">
            + Create Custom Category
          </button>
        ` : ''}
      </div>
      <div class="category-list" role="listbox" aria-label="Categories">
        ${this.categories.map(cat => {
          const isExpanded = this.expandedCategoryId === cat.id;
          const isSelected = this.selectedCategory?.id === cat.id;
          return `
          <div class="category-item-wrapper ${isExpanded ? 'expanded' : ''}">
            <div 
              class="category-item ${isSelected ? 'selected' : ''}"
              data-category-id="${cat.id}"
              role="option"
              aria-selected="${isSelected}"
            >
              <div class="category-item-main">
                <div class="category-info">
                  <div class="category-name-row">
                    <span class="category-name">${this.escapeHtml(cat.name)}</span>
                    <span class="category-description">${this.escapeHtml(this.getCategoryDescription(cat))}</span>
                  </div>
                  <span class="category-target">Target: ${this.formatNumber(cat.targetCookies)}</span>
                </div>
                <div class="category-actions">
                  ${!cat.isPredefined ? `
                    <button 
                      class="btn-delete-category"
                      data-category-id="${cat.id}"
                      aria-label="Delete category ${this.escapeHtml(cat.name)}"
                      title="Delete category"
                      onclick="event.stopPropagation();"
                    >
                      ×
                    </button>
                  ` : ''}
                  <button 
                    class="btn-expand-category"
                    data-category-id="${cat.id}"
                    aria-label="${isExpanded ? 'Collapse' : 'Expand'} category ${this.escapeHtml(cat.name)}"
                    title="${isExpanded ? 'Collapse' : 'Expand'}"
                    onclick="event.stopPropagation();"
                  >
                    ${isExpanded ? '▼' : '▶'}
                  </button>
                </div>
              </div>
            </div>
            ${isExpanded ? this.renderCategorySettings(cat) : ''}
          </div>
        `;
        }).join('')}
      </div>
    `;

    // Attach event listeners
    this.container.querySelectorAll('.category-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Only select if clicking on the main item, not on buttons
        if (!e.target.closest('.category-actions')) {
          const categoryId = item.dataset.categoryId;
          // If already expanded, toggle to collapse; otherwise select and expand
          if (this.expandedCategoryId === categoryId) {
            this.toggleExpand(categoryId);
          } else {
            this.selectCategory(categoryId);
          }
        }
      });
    });

    // Attach expand/collapse button listeners
    this.container.querySelectorAll('.btn-expand-category').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const categoryId = button.dataset.categoryId;
        this.toggleExpand(categoryId);
      });
    });

    // Attach delete button listeners
    this.container.querySelectorAll('.btn-delete-category').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const categoryId = button.dataset.categoryId;
        this.deleteCategory(categoryId);
      });
    });

    // Attach settings change listeners if expanded
    if (this.expandedCategoryId) {
      this.attachSettingsListeners();
    }

    // Attach create category button listener
    const createButton = this.container.querySelector('#create-category-btn');
    if (createButton) {
      createButton.addEventListener('click', () => {
        if (this.onCreateCategory) {
          this.onCreateCategory();
        }
      });
    }
  }

  /**
   * Select a category
   */
  selectCategory(categoryId) {
    this.selectedCategory = this.categories.find(c => c.id === categoryId);
    if (this.selectedCategory && this.onSelect) {
      this.onSelect(this.selectedCategory);
    }
    // Auto-expand when selected
    if (this.selectedCategory) {
      this.expandedCategoryId = categoryId;
    }
    this.render(); // Re-render to update selection state
  }

  /**
   * Toggle expand/collapse for a category
   */
  toggleExpand(categoryId) {
    if (this.expandedCategoryId === categoryId) {
      this.expandedCategoryId = null;
    } else {
      this.expandedCategoryId = categoryId;
      // Auto-select when expanding
      if (!this.selectedCategory || this.selectedCategory.id !== categoryId) {
        this.selectCategory(categoryId);
      }
    }
    this.render();
  }

  /**
   * Render category settings adjustment UI
   */
  renderCategorySettings(category) {
    return `
      <div class="category-settings-expanded">
        <div class="category-settings-header">
          <h4>Customize Settings</h4>
          <p class="info-text">Adjust these settings before calculating the route.</p>
        </div>
        <div class="category-settings-form">
          ${renderNumberInputWithMultiplier(
            `category-target-cookies-${category.id}`,
            `category-target-cookies-multiplier-${category.id}`,
            category.targetCookies || 1000000,
            'Target Cookies:',
            null
          )}

          <div class="category-settings-form-row">
            <div class="form-group">
              <label for="category-player-cps-${category.id}">Player CPS:</label>
              <input 
                type="number" 
                id="category-player-cps-${category.id}" 
                min="0" 
                step="0.1"
                value="${category.playerCps || 8}"
                class="form-input"
                data-setting="playerCps"
              >
            </div>

            <div class="form-group">
              <label for="category-player-delay-${category.id}">Player Delay (seconds):</label>
              <input 
                type="number" 
                id="category-player-delay-${category.id}" 
                min="0" 
                step="0.1"
                value="${category.playerDelay || 1}"
                class="form-input"
                data-setting="playerDelay"
              >
            </div>

            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  id="category-hardcore-mode-${category.id}" 
                  ${category.hardcoreMode ? 'checked' : ''}
                  data-setting="hardcoreMode"
                >
                Hardcore Mode (no upgrades)
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners for settings changes
   */
  attachSettingsListeners() {
    if (!this.expandedCategoryId) return;

    const category = this.categories.find(c => c.id === this.expandedCategoryId);
    if (!category) return;

    const targetCookiesInput = this.container.querySelector(`#category-target-cookies-${category.id}`);
    const targetCookiesMultiplier = this.container.querySelector(`#category-target-cookies-multiplier-${category.id}`);
    const playerCpsInput = this.container.querySelector(`#category-player-cps-${category.id}`);
    const playerDelayInput = this.container.querySelector(`#category-player-delay-${category.id}`);
    const hardcoreModeInput = this.container.querySelector(`#category-hardcore-mode-${category.id}`);

    const updateSettings = () => {
      const targetCookies = targetCookiesInput && targetCookiesMultiplier
        ? getNumberInputWithMultiplierValue(`category-target-cookies-${category.id}`, `category-target-cookies-multiplier-${category.id}`)
        : (parseFloat(targetCookiesInput?.value) || category.targetCookies);
      
      const updatedCategory = {
        ...category,
        targetCookies: targetCookies,
        playerCps: parseFloat(playerCpsInput?.value) || category.playerCps,
        playerDelay: parseFloat(playerDelayInput?.value) || category.playerDelay,
        hardcoreMode: hardcoreModeInput?.checked || false
      };

      // Update the category in our list
      const index = this.categories.findIndex(c => c.id === category.id);
      if (index !== -1) {
        this.categories[index] = updatedCategory;
      }

      // Update selected category if it's the same
      if (this.selectedCategory?.id === category.id) {
        this.selectedCategory = updatedCategory;
      }

      // Notify parent of settings change
      if (this.options.onSettingsChange) {
        this.options.onSettingsChange(updatedCategory);
      }

      // Also call onSelect with updated category
      if (this.onSelect) {
        this.onSelect(updatedCategory);
      }
    };

    if (targetCookiesInput) {
      targetCookiesInput.addEventListener('change', updateSettings);
      targetCookiesInput.addEventListener('input', updateSettings);
    }
    if (targetCookiesMultiplier) {
      targetCookiesMultiplier.addEventListener('change', updateSettings);
    }
    if (playerCpsInput) {
      playerCpsInput.addEventListener('change', updateSettings);
      playerCpsInput.addEventListener('input', updateSettings);
    }
    if (playerDelayInput) {
      playerDelayInput.addEventListener('change', updateSettings);
      playerDelayInput.addEventListener('input', updateSettings);
    }
    if (hardcoreModeInput) {
      hardcoreModeInput.addEventListener('change', updateSettings);
    }
  }

  /**
   * Get selected category
   */
  getSelectedCategory() {
    return this.selectedCategory;
  }

  /**
   * Refresh categories list
   */
  async refresh() {
    await this.loadCategories();
    this.render();
  }

  /**
   * Delete a category
   */
  deleteCategory(categoryId) {
    const category = this.categories.find(c => c.id === categoryId);
    if (!category || category.isPredefined) {
      return;
    }

    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteCategory(categoryId);
      
      // If the deleted category was selected, clear selection
      if (this.selectedCategory?.id === categoryId) {
        this.selectedCategory = null;
        if (this.onSelect) {
          this.onSelect(null);
        }
      }

      // Refresh the list
      this.refresh();
    }
  }

  /**
   * Set callback for create category button
   */
  setOnCreateCategory(callback) {
    this.onCreateCategory = callback;
  }

  /**
   * Get short description for a category
   * @param {Object} category - Category object
   * @returns {string} Short description
   */
  getCategoryDescription(category) {
    if (category.isPredefined) {
      // Generate descriptions for predefined categories
      const descriptions = {
        'predefined-short': 'Quick test category',
        'predefined-fledgling': 'Standard speedrun to 1 million cookies',
        'predefined-neverclick': 'Reach 1 million with minimal clicking',
        'predefined-hardcore': 'Reach 1 billion with no upgrades',
        'predefined-forty': 'Reach 30 million in version 10466',
        'predefined-forty-holiday': 'Reach 4 million in holiday version',
        'predefined-longhaul': 'Reach 1000 septillion cookies',
        'predefined-nevercore': 'Neverclick + Hardcore: minimal clicking, no upgrades'
      };
      return descriptions[category.id] || 'Predefined speedrun category';
    } else {
      // Generate description for custom categories based on properties
      const parts = [];
      if (category.hardcoreMode) {
        parts.push('Hardcore');
      }
      if (category.playerCps === 0 || category.playerCps < 0.1) {
        parts.push('Neverclick');
      }
      if (parts.length === 0) {
        parts.push('Custom');
      }
      return parts.join(' • ') + ' category';
    }
  }

  /**
   * Format number for display
   */
  formatNumber(num) {
    return formatNumberUtil(num);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

