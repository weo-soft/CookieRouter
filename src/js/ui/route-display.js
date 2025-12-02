/**
 * Route display UI component
 * Displays calculated route with building purchase order
 */

import { getProgress, saveProgress, updateProgress, clearProgress } from '../storage.js';
import { getAchievementById } from '../utils/achievements.js';
import { formatNumber } from '../utils/format.js';

export class RouteDisplay {
  constructor(containerId, onSaveRoute = null) {
    this.container = document.getElementById(containerId);
    this.currentRoute = null;
    this.progress = null;
    this.currentCategory = null;
    this.currentVersionId = null;
    this.onSaveRoute = onSaveRoute; // Callback when save route is clicked
    this.tooltipElement = null; // Shared tooltip element
    this.buildingOrder = null; // Building order from version data
  }

  /**
   * Set the current category and version for saving routes
   * @param {Object} category - Current category
   * @param {string} versionId - Current version ID
   */
  async setCategoryAndVersion(category, versionId) {
    this.currentCategory = category;
    this.currentVersionId = versionId;
    // Load building order from version data
    await this.loadBuildingOrder(versionId);
  }

  /**
   * Load building order from version data
   * @param {string} versionId - Version ID
   */
  async loadBuildingOrder(versionId) {
    if (!versionId) {
      versionId = this.currentVersionId || 'v2052';
    }
    
    try {
      const { loadVersionById } = await import('../utils/version-loader.js');
      const version = await loadVersionById(versionId);
      this.buildingOrder = version.buildingNames || [];
    } catch (error) {
      console.warn(`Failed to load building order for ${versionId}, using default`, error);
      // Fallback to a default order if loading fails
      this.buildingOrder = ['Cursor', 'Grandma', 'Farm', 'Mine', 'Factory', 'Bank', 'Temple', 'Wizard tower', 'Shipment', 'Alchemy lab', 'Portal', 'Time machine', 'Antimatter condenser', 'Prism', 'Chancemaker', 'Fractal engine', 'Javascript console', 'Idleverse', 'Cortex baker', 'You'];
    }
  }

  /**
   * Sort buildings by game order
   * @param {Array} buildingEntries - Array of [buildingName, count] tuples
   * @returns {Array} Sorted array
   */
  sortBuildingsByOrder(buildingEntries) {
    if (!this.buildingOrder || this.buildingOrder.length === 0) {
      // Fallback to alphabetical if no order available
      return buildingEntries.sort(([a], [b]) => a.localeCompare(b));
    }
    
    // Create a map of building name to index for fast lookup
    const orderMap = new Map();
    this.buildingOrder.forEach((name, index) => {
      orderMap.set(name, index);
    });
    
    return buildingEntries.sort(([a], [b]) => {
      const indexA = orderMap.get(a) ?? Infinity;
      const indexB = orderMap.get(b) ?? Infinity;
      return indexA - indexB;
    });
  }

  /**
   * Calculate derived values for a route step
   * Calculates cookiesPerSecond, timeElapsed, and totalCookies from stored values
   * @param {Object} step - Route step object
   * @param {Object} previousStep - Previous step (with calculated values) or null for first step
   * @returns {Object} Step with calculated values added
   */
  calculateStepValues(step, previousStep = null) {
    const calculated = { ...step };
    
    // Backward compatibility: if step already has calculated values, use them
    if (step.cookiesPerSecond !== undefined && step.timeElapsed !== undefined && step.totalCookies !== undefined) {
      // Old format - values already calculated, just return as-is
      return calculated;
    }
    
    if (previousStep === null) {
      // First step - use initial values if available, otherwise defaults
      calculated.cookiesPerSecond = step.initialCookiesPerSecond || step.cookiesPerSecond || 0;
      calculated.timeElapsed = step.initialTimeElapsed || step.timeElapsed || 0;
      calculated.totalCookies = step.initialTotalCookies || step.totalCookies || 0;
    } else {
      // Calculate from previous step
      calculated.cookiesPerSecond = previousStep.cookiesPerSecond + (step.cpsIncrease || 0);
      calculated.timeElapsed = previousStep.timeElapsed + (step.timeSinceLastStep || 0);
      
      // Calculate totalCookies: previous total - cost + cookies generated during wait time
      const cookiesAfterPurchase = previousStep.totalCookies - previousStep.cookiesRequired;
      const cookiesGenerated = previousStep.cookiesPerSecond * (step.timeSinceLastStep || 0);
      calculated.totalCookies = cookiesAfterPurchase + cookiesGenerated;
    }
    
    return calculated;
  }

  /**
   * Display a route (either calculated or saved)
   * @param {Object} route - Route object (calculated) or SavedRoute object
   * @param {boolean} isSavedRoute - Whether this is a saved route
   */
  async displayRoute(route, isSavedRoute = false) {
    if (!route) {
      this.currentRoute = null;
      this.progress = null;
      this.render();
      return;
    }

    this.currentRoute = route;
    this.isSavedRoute = isSavedRoute;

    // For saved routes, use routeData and savedRouteId
    let versionId = null;
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
      versionId = route.versionId;
    } else {
      versionId = route.versionId || this.currentVersionId;
    }

    // Load building order for the route's version
    if (versionId) {
      await this.loadBuildingOrder(versionId);
    } else if (this.currentVersionId) {
      await this.loadBuildingOrder(this.currentVersionId);
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
          ${this.currentRoute.usedImportedData ? '<span class="imported-data-indicator" title="This route was calculated using imported save game data">📥 Using Imported Data</span>' : ''}
          ${this.currentRoute.achievementIds && this.currentRoute.achievementIds.length > 0 ? `
            <span class="achievement-route-indicator" title="Achievement-based route">
              🏆 ${this.currentRoute.achievementIds.length} Achievement${this.currentRoute.achievementIds.length !== 1 ? 's' : ''}
            </span>
            ${this.currentRoute.achievementUnlocks && this.currentRoute.achievementUnlocks.length > 0 ? `
              <span class="achievement-completion-summary" title="Achievements unlocked during route">
                ✓ ${this.currentRoute.achievementUnlocks.reduce((sum, unlock) => sum + unlock.achievementIds.length, 0)} Unlocked
              </span>
            ` : ''}
          ` : ''}
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
      ${this.renderRouteSummary()}
      <div class="route-list" role="list">
        ${(() => {
          // Pre-calculate all step values efficiently (only calculate each step once)
          const calculatedSteps = [];
          for (let i = 0; i < buildings.length; i++) {
            const previousStep = i > 0 ? calculatedSteps[i - 1] : null;
            calculatedSteps.push(this.calculateStepValues(buildings[i], previousStep));
          }
          return calculatedSteps.map((calculatedStep, index) => {
            const isCompleted = this.progress.completedBuildings.includes(calculatedStep.order);
            return `
            <div class="route-step ${isCompleted ? 'completed' : ''}" 
                 role="listitem"
                 data-step-order="${calculatedStep.order}">
              <label class="step-checkbox">
                <input 
                  type="checkbox" 
                  ${isCompleted ? 'checked' : ''}
                  aria-label="Mark step ${calculatedStep.order} as completed"
                  data-step-order="${calculatedStep.order}"
                >
                <span class="step-number">${calculatedStep.order}</span>
              </label>
              <div class="step-content">
                <div class="step-info">
                  <span class="step-building">${this.escapeHtml(calculatedStep.buildingName)}${calculatedStep.buildingCount !== null && calculatedStep.buildingCount !== undefined ? ` [${calculatedStep.buildingCount}]` : ''}</span>
                  <span class="step-separator">•</span>
                  <span class="step-detail">Cookies: ${formatNumber(calculatedStep.cookiesRequired)}</span>
                  <span class="step-separator">•</span>
                  <span class="step-detail">CpS: ${formatNumber(calculatedStep.cookiesPerSecond)}${calculatedStep.cpsIncrease !== undefined && calculatedStep.cpsIncrease > 0 ? ` (+${formatNumber(calculatedStep.cpsIncrease)})` : ''}</span>
                  <span class="step-separator">•</span>
                  <span class="step-detail">Time: ${this.formatTime(calculatedStep.timeElapsed)}</span>
                  ${calculatedStep.timeSinceLastStep !== undefined ? `
                  <span class="step-separator">•</span>
                  <span class="step-detail">Since Last: ${this.formatTime(calculatedStep.timeSinceLastStep)}</span>
                  ` : ''}
                </div>
                ${calculatedStep.achievementUnlocks && calculatedStep.achievementUnlocks.length > 0 ? `
                <div class="step-achievement-unlocks">
                  <span class="achievement-unlock-icon">🏆</span>
                  <span class="achievement-unlock-text">
                    Achievement${calculatedStep.achievementUnlocks.length !== 1 ? 's' : ''} unlocked: 
                    ${calculatedStep.achievementUnlocks.map(id => {
                      const achievement = getAchievementById(id);
                      return achievement ? achievement.name : `Achievement ${id}`;
                    }).join(', ')}
                  </span>
                </div>
                ` : ''}
              </div>
              <button 
                class="step-check-all-btn" 
                data-step-order="${calculatedStep.order}"
                aria-label="Check all previous steps up to step ${calculatedStep.order}"
                title="Check all previous steps">
                ✓ All
              </button>
              <button 
                class="step-info-icon" 
                data-step-order="${calculatedStep.order}"
                aria-label="Show summary up to step ${calculatedStep.order}"
                title="Show summary">
                ℹ
              </button>
            </div>
          `;
          }).join('');
        })()}
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

    // Attach tooltip event listeners
    this.attachTooltipListeners();

    // Attach route summary toggle listener
    const summaryToggle = this.container.querySelector('.route-summary-toggle');
    if (summaryToggle) {
      summaryToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const content = this.container.querySelector('.route-summary-content');
        if (content) {
          const isCurrentlyExpanded = summaryToggle.getAttribute('aria-expanded') === 'true';
          const willBeExpanded = !isCurrentlyExpanded;
          
          // Update collapsed class based on new state
          if (willBeExpanded) {
            content.classList.remove('collapsed');
          } else {
            content.classList.add('collapsed');
          }
          
          // Update aria-expanded attribute
          summaryToggle.setAttribute('aria-expanded', willBeExpanded ? 'true' : 'false');
          
          // Update icon to reflect new state
          const icon = summaryToggle.querySelector('.collapse-icon');
          if (icon) {
            icon.textContent = willBeExpanded ? '▼' : '▶';
          }
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
   * Includes years, days, hours, minutes, and seconds as appropriate
   * Handles very long durations (hundreds/thousands of days)
   */
  formatTime(seconds) {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    
    if (seconds < 3600) {
      return `${(seconds / 60).toFixed(1)}m`;
    }
    
    if (seconds < 86400) {
      // Less than 1 day, show hours
      return `${(seconds / 3600).toFixed(2)}h`;
    }
    
    // 1 day or more
    const days = Math.floor(seconds / 86400);
    const remainingSeconds = seconds % 86400;
    const hours = remainingSeconds / 3600;
    
    // Check if we need to show years (365 days = 1 year)
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      
      if (remainingDays === 0 && hours < 0.01) {
        // Exactly years, no remaining days/hours
        return `${years}y`;
      }
      
      if (remainingDays === 0) {
        // Years with hours only
        return `${years}y ${hours.toFixed(2)}h`;
      }
      
      if (hours < 0.01) {
        // Years and days, no hours
        return `${years}y ${remainingDays}d`;
      }
      
      // Years, days, and hours
      return `${years}y ${remainingDays}d ${hours.toFixed(2)}h`;
    }
    
    // Less than 1 year, show days and hours
    if (hours < 0.01) {
      // Less than 0.01 hours remaining, just show days
      return `${days}d`;
    }
    
    // Show days and hours
    return `${days}d ${hours.toFixed(2)}h`;
  }

  /**
   * Attach tooltip event listeners to info icons
   */
  attachTooltipListeners() {
    const infoIcons = this.container.querySelectorAll('.step-info-icon');

    // Create tooltip element if it doesn't exist
    if (!this.tooltipElement) {
      this.tooltipElement = document.createElement('div');
      this.tooltipElement.className = 'route-step-tooltip';
      this.tooltipElement.style.display = 'none';
      document.body.appendChild(this.tooltipElement);
    }

    infoIcons.forEach(iconElement => {
      const stepOrder = parseInt(iconElement.getAttribute('data-step-order'));
      if (isNaN(stepOrder)) return;

      const showTooltip = (e) => {
        if (!this.tooltipElement || !this.currentRoute) return;
        
        // Calculate summary for this step
        const summary = this.calculateSummaryUpToStep(stepOrder);
        const tooltipContent = this.formatSummaryTooltip(summary);
        this.tooltipElement.innerHTML = tooltipContent;
        this.tooltipElement.style.display = 'block';
        
        // Force reflow to get accurate dimensions
        this.tooltipElement.offsetHeight;
        
        // Position tooltip at mouse location
        const updateTooltipPosition = (mouseEvent) => {
          if (!this.tooltipElement) return;
          
          const tooltipRect = this.tooltipElement.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          // Get mouse coordinates
          let mouseX = mouseEvent.clientX + scrollLeft;
          let mouseY = mouseEvent.clientY + scrollTop;
          
          // Offset tooltip slightly from cursor
          const offsetX = 15;
          const offsetY = 15;
          
          let left = mouseX + offsetX;
          let top = mouseY + offsetY;
          
          // Adjust if tooltip would go off screen
          if (left + tooltipRect.width > window.innerWidth + scrollLeft - 10) {
            left = mouseX - tooltipRect.width - offsetX;
          }
          if (top + tooltipRect.height > window.innerHeight + scrollTop - 10) {
            top = mouseY - tooltipRect.height - offsetY;
          }
          if (left < scrollLeft + 10) {
            left = scrollLeft + 10;
          }
          if (top < scrollTop + 10) {
            top = scrollTop + 10;
          }
          
          this.tooltipElement.style.top = `${top}px`;
          this.tooltipElement.style.left = `${left}px`;
        };
        
        // Initial position
        updateTooltipPosition(e);
        
        // Update position as mouse moves
        const mouseMoveHandler = (moveEvent) => {
          updateTooltipPosition(moveEvent);
        };
        
        iconElement.addEventListener('mousemove', mouseMoveHandler);
        
        // Store handler for cleanup
        iconElement._tooltipMouseMoveHandler = mouseMoveHandler;
      };

      const hideTooltip = () => {
        if (this.tooltipElement) {
          this.tooltipElement.style.display = 'none';
        }
        // Remove mousemove handler
        if (iconElement._tooltipMouseMoveHandler) {
          iconElement.removeEventListener('mousemove', iconElement._tooltipMouseMoveHandler);
          delete iconElement._tooltipMouseMoveHandler;
        }
      };

      iconElement.addEventListener('mouseenter', showTooltip);
      iconElement.addEventListener('mouseleave', hideTooltip);
      iconElement.addEventListener('focus', showTooltip);
      iconElement.addEventListener('blur', hideTooltip);
    });
  }

  /**
   * Calculate summary of buildings and upgrades up to a given step
   * @param {number} stepOrder - Step order to calculate summary up to (inclusive)
   * @returns {Object} Summary object with buildings and upgrades
   */
  calculateSummaryUpToStep(stepOrder) {
    if (!this.currentRoute || !this.currentRoute.buildings) {
      return { buildings: {}, upgrades: [] };
    }

    const buildings = { ...(this.currentRoute.startingBuildings || {}) };
    const upgrades = [];

    // Process all steps up to and including stepOrder
    for (const step of this.currentRoute.buildings) {
      if (step.order > stepOrder) {
        break;
      }

      // Check if it's a building (has buildingCount) or upgrade (no buildingCount)
      if (step.buildingCount !== null && step.buildingCount !== undefined) {
        // It's a building
        const buildingName = step.buildingName;
        buildings[buildingName] = (buildings[buildingName] || 0) + 1;
      } else {
        // It's an upgrade
        upgrades.push(step.buildingName);
      }
    }

    return { buildings, upgrades };
  }

  /**
   * Render the permanent route summary section
   * @returns {string} HTML string for the summary section
   */
  renderRouteSummary() {
    if (!this.currentRoute || !this.currentRoute.buildings || this.currentRoute.buildings.length === 0) {
      return '';
    }

    // Calculate final summary (up to the last step)
    const finalStepOrder = this.currentRoute.buildings.length;
    const summary = this.calculateSummaryUpToStep(finalStepOrder);
    
    return this.formatSummaryDisplay(summary);
  }

  /**
   * Format summary as HTML for permanent display
   * @param {Object} summary - Summary object with buildings and upgrades
   * @returns {string} HTML string for the summary section
   */
  formatSummaryDisplay(summary) {
    const { buildings, upgrades } = summary;
    
    let html = '<div class="route-summary-section">';
    
    // Header with toggle button (collapsible for all routes)
    html += '<div class="route-summary-header">';
    html += '<h3 class="route-summary-title">Route Summary</h3>';
    html += '<button class="route-summary-toggle collapse-toggle" aria-label="Toggle route summary" aria-expanded="false">';
    html += '<span class="collapse-icon">▶</span>';
    html += '</button>';
    html += '</div>';
    
    // Content wrapper with collapsible class - collapsed by default
    html += '<div class="route-summary-content collapsed">';
    
    // Buildings section - sort by game order
    const buildingEntries = Object.entries(buildings)
      .filter(([_, count]) => count > 0);
    const sortedBuildingEntries = this.sortBuildingsByOrder(buildingEntries);
    
    if (sortedBuildingEntries.length > 0) {
      html += '<div class="summary-section-buildings">';
      html += '<h4 class="summary-section-title">Buildings</h4>';
      html += '<div class="summary-buildings-grid">';
      for (const [buildingName, count] of sortedBuildingEntries) {
        html += `<div class="summary-building-item">`;
        html += `<span class="summary-building-name">${this.escapeHtml(buildingName)}</span>`;
        html += `<span class="summary-building-count">${count}</span>`;
        html += `</div>`;
      }
      html += '</div>';
      html += '</div>';
    }
    
    // Upgrades section
    if (upgrades.length > 0) {
      html += '<div class="summary-section-upgrades">';
      html += '<h4 class="summary-section-title">Upgrades</h4>';
      html += '<div class="summary-upgrades-list">';
      for (const upgradeName of upgrades.sort()) {
        html += `<div class="summary-upgrade-item">${this.escapeHtml(upgradeName)}</div>`;
      }
      html += '</div>';
      html += '</div>';
    }
    
    if (sortedBuildingEntries.length === 0 && upgrades.length === 0) {
      html += '<div class="summary-empty">No buildings or upgrades in this route</div>';
    }
    
    html += '</div>';
    html += '</div>';
    return html;
  }

  /**
   * Format summary as HTML for tooltip
   * @param {Object} summary - Summary object with buildings and upgrades
   * @returns {string} HTML string for tooltip
   */
  formatSummaryTooltip(summary) {
    const { buildings, upgrades } = summary;
    
    let html = '<div class="route-summary-tooltip">';
    
    // Buildings section - sort by game order
    const buildingEntries = Object.entries(buildings)
      .filter(([_, count]) => count > 0);
    const sortedBuildingEntries = this.sortBuildingsByOrder(buildingEntries);
    
    if (sortedBuildingEntries.length > 0) {
      html += '<div class="summary-section"><strong>Buildings:</strong><ul class="summary-list">';
      for (const [buildingName, count] of sortedBuildingEntries) {
        html += `<li>${this.escapeHtml(buildingName)}: ${count}</li>`;
      }
      html += '</ul></div>';
    }
    
    // Upgrades section
    if (upgrades.length > 0) {
      html += '<div class="summary-section"><strong>Upgrades:</strong><ul class="summary-list">';
      for (const upgradeName of upgrades.sort()) {
        html += `<li>${this.escapeHtml(upgradeName)}</li>`;
      }
      html += '</ul></div>';
    }
    
    if (sortedBuildingEntries.length === 0 && upgrades.length === 0) {
      html += '<div class="summary-empty">No buildings or upgrades yet</div>';
    }
    
    html += '</div>';
    return html;
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

