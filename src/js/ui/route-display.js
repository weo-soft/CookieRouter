/**
 * Route display UI component
 * Displays calculated route with building purchase order
 */

import { getProgress, saveProgress, updateProgress, clearProgress } from '../storage.js';
import { formatNumber } from '../utils/format.js';

export class RouteDisplay {
  constructor(containerId, onSaveRoute = null) {
    this.container = document.getElementById(containerId);
    this.currentRoute = null;
    this.progress = null;
    this.currentCategory = null;
    this.currentVersionId = null;
    this.onSaveRoute = onSaveRoute; // Callback when save route is clicked
  }

  /**
   * Set the current category and version for saving routes
   * @param {Object} category - Current category
   * @param {string} versionId - Current version ID
   */
  setCategoryAndVersion(category, versionId) {
    this.currentCategory = category;
    this.currentVersionId = versionId;
  }

  /**
   * Display a route (either calculated or saved)
   * @param {Object} route - Route object (calculated) or SavedRoute object
   * @param {boolean} isSavedRoute - Whether this is a saved route
   */
  displayRoute(route, isSavedRoute = false) {
    if (!route) {
      this.currentRoute = null;
      this.progress = null;
      this.render();
      return;
    }

    this.currentRoute = route;
    this.isSavedRoute = isSavedRoute;

    // For saved routes, use routeData and savedRouteId
    if (isSavedRoute) {
      // Convert saved route to display format
      this.currentRoute = {
        id: route.id, // Use saved route ID for progress tracking
        buildings: route.routeData.buildings || [],
        completionTime: route.routeData.completionTime || 0,
        algorithm: route.routeData.algorithm || 'GPL',
        lookahead: route.routeData.lookahead || 1,
        startingBuildings: route.routeData.startingBuildings || {}
      };
    }

    // Get progress using route ID (works for both calculated and saved routes)
    this.progress = getProgress(route.id);
    if (!this.progress) {
      // Create and save new progress if it doesn't exist
      this.progress = {
        routeId: route.id,
        completedBuildings: [],
        lastUpdated: Date.now()
      };
      saveProgress(this.progress);
    }
    this.render();
  }

  /**
   * Render the route display
   */
  render() {
    if (!this.container || !this.currentRoute) {
      this.container.innerHTML = '<p class="empty-state">No route selected. Select a category and calculate a route.</p>';
      return;
    }

    // Save scroll position before re-rendering
    const routeList = this.container.querySelector('.route-list');
    const savedScrollTop = routeList ? routeList.scrollTop : 0;

    const { buildings, completionTime, algorithm } = this.currentRoute;
    const completedCount = this.progress.completedBuildings.length;
    const totalCount = buildings.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    this.container.innerHTML = `
      <div class="route-header">
        <div class="route-header-top">
          <h2>Building Purchase Route${this.isSavedRoute ? ' (Saved)' : ''}</h2>
          <div class="route-header-actions">
            ${completedCount > 0 ? `<button id="reset-progress-btn" class="btn-secondary" aria-label="Reset all progress">Reset</button>` : ''}
            ${this.onSaveRoute && !this.isSavedRoute ? `<button id="save-route-btn" class="btn-primary" aria-label="Save this route">Save Route</button>` : ''}
          </div>
        </div>
        <div class="route-meta">
          <span>Algorithm: ${algorithm}</span>
          <span>Completion Time: ${this.formatTime(completionTime)}</span>
          <span>Total Steps: ${totalCount}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" role="progressbar" 
               aria-valuenow="${progressPercent}" 
               aria-valuemin="0" 
               aria-valuemax="100"
               style="width: ${progressPercent}%">
          </div>
          <span class="progress-text">${completedCount} / ${totalCount} completed</span>
        </div>
      </div>
      <div class="route-list" role="list">
        ${buildings.map((step, index) => {
          const isCompleted = this.progress.completedBuildings.includes(step.order);
          return `
            <div class="route-step ${isCompleted ? 'completed' : ''}" 
                 role="listitem"
                 data-step-order="${step.order}">
              <label class="step-checkbox">
                <input 
                  type="checkbox" 
                  ${isCompleted ? 'checked' : ''}
                  aria-label="Mark step ${step.order} as completed"
                  data-step-order="${step.order}"
                >
                <span class="step-number">${step.order}</span>
              </label>
              <div class="step-content">
                <div class="step-info">
                  <span class="step-building">${this.escapeHtml(step.buildingName)}${step.buildingCount !== null && step.buildingCount !== undefined ? ` [${step.buildingCount}]` : ''}</span>
                  <span class="step-separator">•</span>
                  <span class="step-detail">Cookies: ${formatNumber(step.cookiesRequired)}</span>
                  <span class="step-separator">•</span>
                  <span class="step-detail">CpS: ${formatNumber(step.cookiesPerSecond)}</span>
                  <span class="step-separator">•</span>
                  <span class="step-detail">Time: ${this.formatTime(step.timeElapsed)}</span>
                </div>
              </div>
              <button 
                class="step-check-all-btn" 
                data-step-order="${step.order}"
                aria-label="Check all previous steps up to step ${step.order}"
                title="Check all previous steps">
                ✓ All
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Attach checkbox event listeners
    this.container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const stepOrder = parseInt(e.target.dataset.stepOrder);
        this.toggleStep(stepOrder, e.target.checked);
      });
    });

    // Attach "check all previous" button listeners
    this.container.querySelectorAll('.step-check-all-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        // Use currentTarget to ensure we get the button, not a child element
        const stepOrder = parseInt(e.currentTarget.dataset.stepOrder);
        if (!isNaN(stepOrder)) {
          this.checkAllPreviousSteps(stepOrder);
        }
      });
    });

    // Attach reset progress button listener
    const resetBtn = this.container.querySelector('#reset-progress-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress? This will uncheck all steps.')) {
          this.resetAllProgress();
        }
      });
    }

    // Attach save route button listener
    const saveBtn = this.container.querySelector('#save-route-btn');
    if (saveBtn && this.onSaveRoute) {
      saveBtn.addEventListener('click', () => {
        if (this.onSaveRoute) {
          this.onSaveRoute(this.currentRoute, this.currentCategory, this.currentVersionId);
        }
      });
    }

    // Restore scroll position after rendering
    if (savedScrollTop > 0) {
      const newRouteList = this.container.querySelector('.route-list');
      if (newRouteList) {
        // Use requestAnimationFrame to ensure DOM is fully updated
        requestAnimationFrame(() => {
          newRouteList.scrollTop = savedScrollTop;
        });
      }
    }
  }

  /**
   * Reset all progress - uncheck all steps
   */
  resetAllProgress() {
    if (!this.currentRoute) return;
    
    // Clear progress from storage
    clearProgress(this.currentRoute.id);
    
    // Reset progress object
    this.progress = {
      routeId: this.currentRoute.id,
      completedBuildings: [],
      lastUpdated: Date.now()
    };
    
    // Save the empty progress
    saveProgress(this.progress);
    
    // Re-render to update the UI
    this.render();
  }

  /**
   * Check all previous steps up to and including the given step
   * @param {number} stepOrder - The step order to check up to
   */
  checkAllPreviousSteps(stepOrder) {
    if (!this.currentRoute) return;
    if (!stepOrder || stepOrder < 1) return;
    
    // Get fresh progress from storage to ensure we have the latest state
    const currentProgress = getProgress(this.currentRoute.id);
    
    // Ensure progress exists
    if (!currentProgress) {
      this.progress = {
        routeId: this.currentRoute.id,
        completedBuildings: [],
        lastUpdated: Date.now()
      };
      saveProgress(this.progress);
    } else {
      this.progress = currentProgress;
    }

    // Build a new array containing ONLY steps from 1 to stepOrder
    // This ensures we never include steps beyond the clicked step
    const finalCompletedBuildings = [];
    for (let i = 1; i <= stepOrder; i++) {
      // Include step i if it was already completed OR if we're checking it now
      if (this.progress.completedBuildings.includes(i)) {
        finalCompletedBuildings.push(i);
      } else {
        // This step wasn't completed, so we're checking it now
        finalCompletedBuildings.push(i);
      }
    }
    
    // Sort to ensure proper order
    finalCompletedBuildings.sort((a, b) => a - b);
    
    // Update progress with only steps up to stepOrder
    this.progress.completedBuildings = finalCompletedBuildings;
    this.progress.lastUpdated = Date.now();
    this.progress.routeId = this.currentRoute.id;

    // Update progress in storage
    try {
      updateProgress(this.currentRoute.id, this.progress.completedBuildings);
    } catch (error) {
      if (error.message && error.message.includes('not found')) {
        saveProgress(this.progress);
      } else {
        console.error('Error updating progress:', error);
        saveProgress(this.progress);
      }
    }
    
    this.render(); // Re-render to update progress bar and checkboxes
  }

  /**
   * Toggle a step's completion status
   */
  toggleStep(stepOrder, completed) {
    if (!this.currentRoute) return;
    
    // Ensure progress exists
    if (!this.progress) {
      // Create progress if it doesn't exist
      this.progress = {
        routeId: this.currentRoute.id,
        completedBuildings: [],
        lastUpdated: Date.now()
      };
      saveProgress(this.progress);
    }

    if (completed) {
      if (!this.progress.completedBuildings.includes(stepOrder)) {
        this.progress.completedBuildings.push(stepOrder);
        this.progress.completedBuildings.sort((a, b) => a - b);
      }
    } else {
      this.progress.completedBuildings = this.progress.completedBuildings.filter(
        order => order !== stepOrder
      );
    }

    this.progress.lastUpdated = Date.now();
    
    // Ensure progress has the correct routeId
    this.progress.routeId = this.currentRoute.id;
    
    // Update progress - use try/catch in case progress doesn't exist in storage
    try {
      updateProgress(this.currentRoute.id, this.progress.completedBuildings);
    } catch (error) {
      // If progress doesn't exist in storage, save it directly
      if (error.message && error.message.includes('not found')) {
        // Progress doesn't exist in storage, save it directly
        saveProgress(this.progress);
      } else {
        console.error('Error updating progress:', error);
        // Still try to save directly as fallback
        saveProgress(this.progress);
      }
    }
    
    this.render(); // Re-render to update progress bar
  }

  /**
   * Show loading state
   * @param {number} steps - Optional number of steps calculated so far
   */
  showLoading(steps = 0) {
    if (!this.container) return;
    const stepsText = steps > 0 ? ` (${steps} steps calculated)` : '';
    this.container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Calculating optimal route...${stepsText}</p>
      </div>
    `;
  }

  /**
   * Update loading state with progress
   * @param {number} steps - Number of steps calculated so far
   */
  updateLoadingProgress(steps) {
    if (!this.container) return;
    
    // Directly update the text - requestAnimationFrame might not help if calculation is blocking
    const loadingState = this.container.querySelector('.loading-state');
    if (loadingState) {
      const textElement = loadingState.querySelector('p');
      if (textElement) {
        textElement.textContent = `Calculating optimal route... (${steps} steps calculated)`;
      } else {
        // Fallback: recreate the loading state if structure is wrong
        const stepsText = steps > 0 ? ` (${steps} steps calculated)` : '';
        this.container.innerHTML = `
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Calculating optimal route...${stepsText}</p>
          </div>
        `;
      }
    } else {
      // If loading state doesn't exist, recreate it
      const stepsText = steps > 0 ? ` (${steps} steps calculated)` : '';
      this.container.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Calculating optimal route...${stepsText}</p>
        </div>
      `;
    }
  }

  /**
   * Show error state
   */
  showError(message) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="error-state">
        <p class="error-message">${this.escapeHtml(message)}</p>
        <button class="retry-button" onclick="location.reload()">Retry</button>
      </div>
    `;
  }

  /**
   * Format time in seconds to readable format
   */
  formatTime(seconds) {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(2)}h`;
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

