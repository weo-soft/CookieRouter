/**
 * Category selector UI component
 * Displays list of predefined and user-created categories
 */

import { getCategories, deleteCategory } from '../storage.js';
import { short, fledgling, neverclick, hardcore } from '../categories.js';
import { formatNumber as formatNumberUtil } from '../utils/format.js';

export class CategorySelector {
  constructor(containerId, onSelect) {
    this.container = document.getElementById(containerId);
    this.onSelect = onSelect;
    this.categories = [];
    this.selectedCategory = null;
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
        <button type="button" class="btn-create-category" id="create-category-btn">
          + Create Custom Category
        </button>
      </div>
      <div class="category-list" role="listbox" aria-label="Categories">
        ${this.categories.map(cat => `
          <div class="category-item-wrapper">
            <button 
              class="category-item ${this.selectedCategory?.id === cat.id ? 'selected' : ''}"
              data-category-id="${cat.id}"
              role="option"
              aria-selected="${this.selectedCategory?.id === cat.id}"
            >
              <div class="category-name">${this.escapeHtml(cat.name)}</div>
              <div class="category-meta">
                ${cat.isPredefined ? '<span class="badge">Predefined</span>' : '<span class="badge user">Custom</span>'}
                <span class="target">Target: ${this.formatNumber(cat.targetCookies)}</span>
              </div>
            </button>
            ${!cat.isPredefined ? `
              <button 
                class="btn-delete-category"
                data-category-id="${cat.id}"
                aria-label="Delete category ${this.escapeHtml(cat.name)}"
                title="Delete category"
              >
                ×
              </button>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    // Attach event listeners
    this.container.querySelectorAll('.category-item').forEach(button => {
      button.addEventListener('click', (e) => {
        const categoryId = e.currentTarget.dataset.categoryId;
        this.selectCategory(categoryId);
      });
    });

    // Attach delete button listeners
    this.container.querySelectorAll('.btn-delete-category').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const categoryId = e.currentTarget.dataset.categoryId;
        this.deleteCategory(categoryId);
      });
    });

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
    this.render(); // Re-render to update selection state
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

