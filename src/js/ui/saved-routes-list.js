/**
 * Saved Routes List UI component
 * Displays and manages saved routes
 */

import { getSavedRoutes, getSavedRouteById, updateLastAccessed, updateSavedRouteName, deleteSavedRoute } from '../storage.js';
import { formatNumber } from '../utils/format.js';

export class SavedRoutesList {
  constructor(containerId, onSelectRoute) {
    this.container = document.getElementById(containerId);
    this.onSelectRoute = onSelectRoute;
    this.savedRoutes = [];
    this.selectedRouteId = null;
    this.renamingRouteId = null; // Track which route is being renamed
    this.isLoading = false; // Track loading state
  }

  /**
   * Initialize the saved routes list
   */
  async init() {
    this.loadSavedRoutes();
    this.render();
  }

  /**
   * Load saved routes from storage
   */
  loadSavedRoutes() {
    try {
      this.savedRoutes = getSavedRoutes();
      // Sort by lastAccessedAt (most recent first)
      this.savedRoutes.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
    } catch (error) {
      console.error('Error loading saved routes:', error);
      this.savedRoutes = [];
      // Show error message to user if container is available
      if (this.container) {
        this.container.innerHTML = `
          <div class="error-state">
            <p class="error-message">Failed to load saved routes. Please refresh the page.</p>
            <p class="error-detail">${this.escapeHtml(error.message)}</p>
          </div>
        `;
      }
    }
  }

  /**
   * Render the saved routes list
   */
  render() {
    if (!this.container) return;

    if (this.isLoading) {
      this.container.innerHTML = `
        <div class="saved-routes-loading">
          <div class="spinner"></div>
          <p>Loading saved routes...</p>
        </div>
      `;
      return;
    }

    if (this.savedRoutes.length === 0) {
      this.container.innerHTML = `
        <div class="saved-routes-empty">
          <p>No saved routes yet. Calculate a route and save it to get started!</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="saved-routes-header">
        <h2>Saved Routes</h2>
        <span class="saved-routes-count">${this.savedRoutes.length} route${this.savedRoutes.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="saved-routes-list" role="listbox" aria-label="Saved routes">
        ${this.savedRoutes.map(route => this.renderRouteItem(route)).join('')}
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Render a single saved route item
   * @param {Object} route - SavedRoute object
   * @returns {string} HTML string for the route item
   */
  renderRouteItem(route) {
    const isSelected = this.selectedRouteId === route.id;
    const isRenaming = this.renamingRouteId === route.id;
    const savedDate = new Date(route.savedAt);
    const lastAccessedDate = new Date(route.lastAccessedAt);
    const formattedSavedDate = this.formatDate(savedDate);
    const formattedLastAccessed = this.formatDate(lastAccessedDate);
    const buildingCount = route.routeData?.buildings?.length || 0;

    return `
      <div class="saved-route-item ${isSelected ? 'selected' : ''}" 
           data-route-id="${this.escapeHtml(route.id)}"
           role="option"
           aria-selected="${isSelected}"
           tabindex="0">
        <div class="saved-route-main">
          ${isRenaming ? `
            <div class="saved-route-rename-input">
              <input type="text" 
                     class="rename-input" 
                     value="${this.escapeHtml(route.name)}"
                     maxlength="100"
                     data-route-id="${this.escapeHtml(route.id)}"
                     aria-label="New route name">
              <div class="rename-actions">
                <button class="btn-save-rename" 
                        data-route-id="${this.escapeHtml(route.id)}"
                        aria-label="Save new name"
                        title="Save">
                  ✓
                </button>
                <button class="btn-cancel-rename" 
                        data-route-id="${this.escapeHtml(route.id)}"
                        aria-label="Cancel rename"
                        title="Cancel">
                  ×
                </button>
              </div>
            </div>
          ` : `
            <div class="saved-route-name">${this.escapeHtml(route.name)}</div>
          `}
          <div class="saved-route-meta">
            <span class="saved-route-category">${this.escapeHtml(route.categoryName)}</span>
            <span class="saved-route-separator">•</span>
            <span class="saved-route-version">${this.escapeHtml(route.versionId)}</span>
            <span class="saved-route-separator">•</span>
            <span class="saved-route-buildings">${buildingCount} steps</span>
            ${route.routeData?.achievementIds && route.routeData.achievementIds.length > 0 ? `
              <span class="saved-route-separator">•</span>
              <span class="saved-route-achievements" title="Achievement-based route">
                🏆 ${route.routeData.achievementIds.length} Achievement${route.routeData.achievementIds.length !== 1 ? 's' : ''}
              </span>
            ` : ''}
          </div>
          <div class="saved-route-dates">
            <span class="saved-route-date">Saved: ${formattedSavedDate}</span>
            <span class="saved-route-separator">•</span>
            <span class="saved-route-date">Last accessed: ${formattedLastAccessed}</span>
          </div>
        </div>
        <div class="saved-route-actions">
          <button class="btn-load-route" 
                  data-route-id="${this.escapeHtml(route.id)}"
                  aria-label="Load route ${this.escapeHtml(route.name)}"
                  title="Load route">
            Load
          </button>
          <button class="btn-rename-route" 
                  data-route-id="${this.escapeHtml(route.id)}"
                  aria-label="Rename route ${this.escapeHtml(route.name)}"
                  title="Rename route">
            ✎
          </button>
          <button class="btn-delete-route" 
                  data-route-id="${this.escapeHtml(route.id)}"
                  aria-label="Delete route ${this.escapeHtml(route.name)}"
                  title="Delete route">
            ×
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Load route buttons
    this.container.querySelectorAll('.btn-load-route').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const routeId = e.target.dataset.routeId;
        this.selectRoute(routeId);
      });
    });

    // Rename route buttons
    this.container.querySelectorAll('.btn-rename-route').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const routeId = e.target.dataset.routeId;
        this.startRename(routeId);
      });
    });

    // Delete route buttons
    this.container.querySelectorAll('.btn-delete-route').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const routeId = e.target.dataset.routeId;
        this.deleteRoute(routeId);
      });
    });

    // Rename input handlers
    this.container.querySelectorAll('.rename-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const routeId = input.dataset.routeId;
          this.saveRename(routeId, input.value);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.cancelRename();
        }
      });

      input.addEventListener('blur', () => {
        // Don't cancel on blur - let user click save/cancel buttons
      });
    });

    // Save rename buttons
    this.container.querySelectorAll('.btn-save-rename').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const routeId = btn.dataset.routeId;
        const input = this.container.querySelector(`.rename-input[data-route-id="${routeId}"]`);
        if (input) {
          this.saveRename(routeId, input.value);
        }
      });
    });

    // Cancel rename buttons
    this.container.querySelectorAll('.btn-cancel-rename').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cancelRename();
      });
    });

    // Route item click handlers
    this.container.querySelectorAll('.saved-route-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.saved-route-actions')) {
          const routeId = item.dataset.routeId;
          this.selectRoute(routeId);
        }
      });

      // Keyboard navigation
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const routeId = item.dataset.routeId;
          this.selectRoute(routeId);
        }
      });
    });
  }

  /**
   * Select and load a saved route
   * @param {string} routeId - ID of the route to load
   */
  selectRoute(routeId) {
    const route = getSavedRouteById(routeId);
    if (!route) {
      console.error(`Saved route with ID ${routeId} not found`);
      return;
    }

    // Show loading state
    this.isLoading = true;
    this.render();

    // Update lastAccessedAt timestamp in storage
    try {
      updateLastAccessed(routeId);
      // Update in-memory route object without reloading/re-sorting
      const inMemoryRoute = this.savedRoutes.find(r => r.id === routeId);
      if (inMemoryRoute) {
        inMemoryRoute.lastAccessedAt = Date.now();
      }
    } catch (error) {
      console.error('Error updating lastAccessedAt:', error);
    }

    // Update selected state
    this.selectedRouteId = routeId;
    // Don't reload/re-sort - this causes the list to jump around
    // The lastAccessedAt is updated in-memory, and will be correct on next page load
    this.isLoading = false;
    this.render();

    // Notify parent component
    if (this.onSelectRoute) {
      this.onSelectRoute(route);
    }
  }

  /**
   * Refresh the saved routes list
   */
  refresh() {
    this.loadSavedRoutes();
    this.render();
  }

  /**
   * Format date for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      // Format as YYYY-MM-DD HH:MM
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
  }

  /**
   * Start renaming a route
   * @param {string} routeId - ID of the route to rename
   */
  startRename(routeId) {
    const route = getSavedRouteById(routeId);
    if (!route) {
      console.error(`Route with ID ${routeId} not found`);
      return;
    }

    this.renamingRouteId = routeId;
    this.render(); // Re-render to show input field
  }

  /**
   * Cancel renaming
   */
  cancelRename() {
    this.renamingRouteId = null;
    this.render();
  }

  /**
   * Save renamed route
   * @param {string} routeId - ID of the route
   * @param {string} newName - New name for the route
   */
  saveRename(routeId, newName) {
    const trimmedName = newName.trim();
    
    // Validate name
    if (!trimmedName || trimmedName.length === 0) {
      alert('Route name cannot be empty.');
      return;
    }

    if (trimmedName.length > 100) {
      alert('Route name cannot exceed 100 characters.');
      return;
    }

    // Show loading state
    this.isLoading = true;
    this.render();

    try {
      updateSavedRouteName(routeId, trimmedName);
      // Update in-memory route object without reloading/re-sorting
      const inMemoryRoute = this.savedRoutes.find(r => r.id === routeId);
      if (inMemoryRoute) {
        inMemoryRoute.name = trimmedName;
      }
      this.renamingRouteId = null;
      // Don't reload/re-sort - this causes the list to jump around
      this.isLoading = false;
      this.render();
    } catch (error) {
      this.isLoading = false;
      console.error('Error renaming route:', error);
      let errorMessage = 'Failed to rename route.';
      if (error.message) {
        if (error.message.includes('not found')) {
          errorMessage = 'Route not found. It may have been deleted.';
        } else if (error.message.includes('between 1 and 100')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      alert(errorMessage);
      this.render();
    }
  }

  /**
   * Delete a route with confirmation
   * @param {string} routeId - ID of the route to delete
   */
  deleteRoute(routeId) {
    const route = getSavedRouteById(routeId);
    if (!route) {
      console.error(`Route with ID ${routeId} not found`);
      return;
    }

    if (confirm(`Are you sure you want to delete "${route.name}"? This action cannot be undone.`)) {
      // Show loading state
      this.isLoading = true;
      this.render();

      try {
        deleteSavedRoute(routeId);
        
        // If the deleted route was selected, clear selection
        if (this.selectedRouteId === routeId) {
          this.selectedRouteId = null;
          if (this.onSelectRoute) {
            this.onSelectRoute(null);
          }
        }

        // Refresh the list
        this.loadSavedRoutes();
        this.isLoading = false;
        this.render();
      } catch (error) {
        this.isLoading = false;
        console.error('Error deleting route:', error);
        let errorMessage = 'Failed to delete route.';
        if (error.message) {
          errorMessage = error.message;
        }
        alert(errorMessage);
        this.render();
      }
    }
  }

  /**
   * Focus next route item
   * @param {HTMLElement} currentItem - Current route item element
   */
  focusNextRoute(currentItem) {
    const items = Array.from(this.container.querySelectorAll('.saved-route-item'));
    const currentIndex = items.indexOf(currentItem);
    if (currentIndex < items.length - 1) {
      items[currentIndex + 1].focus();
    }
  }

  /**
   * Focus previous route item
   * @param {HTMLElement} currentItem - Current route item element
   */
  focusPreviousRoute(currentItem) {
    const items = Array.from(this.container.querySelectorAll('.saved-route-item'));
    const currentIndex = items.indexOf(currentItem);
    if (currentIndex > 0) {
      items[currentIndex - 1].focus();
    }
  }

  /**
   * Focus first route item
   */
  focusFirstRoute() {
    const firstItem = this.container.querySelector('.saved-route-item');
    if (firstItem) {
      firstItem.focus();
    }
  }

  /**
   * Focus last route item
   */
  focusLastRoute() {
    const items = this.container.querySelectorAll('.saved-route-item');
    if (items.length > 0) {
      items[items.length - 1].focus();
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

