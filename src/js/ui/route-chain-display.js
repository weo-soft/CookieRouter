/**
 * Route Chain Display Component
 * Component for displaying a route chain with navigation between routes
 */

import { RouteDisplay } from './route-display.js';
import { getProgress, saveProgress } from '../storage.js';
import { saveRouteChain } from '../storage.js';
import { extractFinalStateFromRoute } from '../utils/route-state-extractor.js';
import { formatNumber } from '../utils/format.js';

export class RouteChainDisplay {
  constructor(containerId, onSaveRoute = null) {
    this.container = document.getElementById(containerId);
    this.onSaveRoute = onSaveRoute;
    this.currentRouteChain = null;
    this.currentRouteChainResult = null; // The calculation result
    this.currentRouteIndex = 0;
    this.routeDisplays = []; // Array of RouteDisplay instances for each route
    this.isVisible = false;
    this.versionId = 'v2052';
    this.routeConfigs = []; // Store route configurations for saving
  }

  /**
   * Display a route chain
   * @param {Object} chainResult - Chain calculation result with calculatedRoutes array
   * @param {string} versionId - Game version ID
   * @param {Array} routeConfigs - Array of route configurations used to create the chain
   */
  async displayRouteChain(chainResult, versionId = 'v2052', routeConfigs = []) {
    if (!chainResult || !Array.isArray(chainResult.calculatedRoutes) || chainResult.calculatedRoutes.length === 0) {
      console.error('[RouteChainDisplay] Invalid chain result');
      return;
    }

    console.log('[RouteChainDisplay] displayRouteChain called', {
      hasContainer: !!this.container,
      containerId: this.container?.id,
      routesCount: chainResult.calculatedRoutes.length
    });

    this.currentRouteChainResult = chainResult;
    this.versionId = versionId;
    this.routeConfigs = routeConfigs;
    this.currentRouteIndex = 0;
    this.routeDisplays = [];

    // Create RouteDisplay instances for each route in the chain
    for (let i = 0; i < chainResult.calculatedRoutes.length; i++) {
      const route = chainResult.calculatedRoutes[i];
      const routeDisplay = new RouteDisplay(null, this.onSaveRoute);
      this.routeDisplays.push(routeDisplay);
    }

    await this.render();
  }

  /**
   * Render the route chain display
   */
  async render() {
    if (!this.container) {
      console.error('[RouteChainDisplay] Cannot render: container missing');
      return;
    }
    
    if (!this.currentRouteChainResult) {
      console.error('[RouteChainDisplay] Cannot render: chain result missing');
      return;
    }

    console.log('[RouteChainDisplay] Rendering chain display', {
      containerId: this.container.id,
      routesCount: this.currentRouteChainResult.calculatedRoutes.length,
      currentRouteIndex: this.currentRouteIndex
    });

    const routes = this.currentRouteChainResult.calculatedRoutes;
    const currentRoute = routes[this.currentRouteIndex];
    const totalRoutes = routes.length;

    // Build route navigation header
    let routeNavHtml = '<div class="route-chain-header">';
    routeNavHtml += '<div class="route-chain-header-top">';
    routeNavHtml += '<h2>Route Chain</h2>';
    routeNavHtml += '<button class="btn-primary" id="save-chain-btn">Save Chain</button>';
    routeNavHtml += '</div>';
    routeNavHtml += '<div class="route-chain-navigation">';
    
    // Previous button
    routeNavHtml += `<button 
      class="route-nav-btn ${this.currentRouteIndex === 0 ? 'disabled' : ''}" 
      id="chain-prev-btn"
      ${this.currentRouteIndex === 0 ? 'disabled' : ''}
    >← Previous Route</button>`;
    
    // Route indicator
    routeNavHtml += `<span class="route-indicator">Route ${this.currentRouteIndex + 1} of ${totalRoutes}</span>`;
    
    // Next button
    routeNavHtml += `<button 
      class="route-nav-btn ${this.currentRouteIndex === totalRoutes - 1 ? 'disabled' : ''}" 
      id="chain-next-btn"
      ${this.currentRouteIndex === totalRoutes - 1 ? 'disabled' : ''}
    >Next Route →</button>`;
    
    routeNavHtml += '</div>';
    
    // Route list overview
    routeNavHtml += '<div class="route-chain-overview">';
    routeNavHtml += '<h3>Chain Overview</h3>';
    routeNavHtml += '<ul class="route-chain-list">';
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const routeName = this.getRouteName(route, i);
      const isActive = i === this.currentRouteIndex;
      routeNavHtml += `<li class="route-chain-item ${isActive ? 'active' : ''}">
        <button class="route-chain-item-btn" data-route-index="${i}">
          ${i + 1}. ${routeName}
        </button>
      </li>`;
    }
    routeNavHtml += '</ul>';
    routeNavHtml += '</div>';
    
    routeNavHtml += '</div>';

    // Render combined steps from all routes
    routeNavHtml += this.renderCombinedSteps();

    // Combine header and route display container
    this.container.innerHTML = routeNavHtml;

    // Attach event listeners
    this.attachEventListeners();
    
    this.isVisible = true;
    console.log('[RouteChainDisplay] Render complete');
  }

  /**
   * Render combined steps from all routes in the chain
   * @returns {string} HTML for combined steps display
   */
  renderCombinedSteps() {
    if (!this.currentRouteChainResult || !this.currentRouteChainResult.calculatedRoutes) {
      return '';
    }

    const allRoutes = this.currentRouteChainResult.calculatedRoutes;
    const combinedSteps = [];
    let globalStepNumber = 1;
    let previousStep = null;

    // Aggregate steps from all routes
    for (let routeIndex = 0; routeIndex < allRoutes.length; routeIndex++) {
      const route = allRoutes[routeIndex];
      const routeName = this.getRouteName(route, routeIndex);
      const routeSteps = route.buildings || [];

      // Add route separator (store previous step for rendering route start state)
      combinedSteps.push({
        type: 'route-separator',
        routeIndex: routeIndex,
        routeName: routeName,
        globalStepNumber: globalStepNumber,
        previousStep: previousStep ? { ...previousStep } : null
      });

      // Process steps in this route
      for (let stepIndex = 0; stepIndex < routeSteps.length; stepIndex++) {
        const step = routeSteps[stepIndex];
        
        // Calculate step values using RouteDisplay logic
        const calculatedStep = this.calculateStepValues(step, previousStep, routeIndex === 0 && stepIndex === 0);
        
        combinedSteps.push({
          type: 'step',
          globalStepNumber: globalStepNumber++,
          routeIndex: routeIndex,
          routeName: routeName,
          step: {
            ...calculatedStep,
            order: globalStepNumber - 1
          }
        });
        
        previousStep = calculatedStep;
      }
    }

    // Render the combined steps
    let html = '<div class="chain-combined-steps">';
    html += '<h3>All Steps (Combined)</h3>';
    html += '<div class="route-list" role="list">';

    let separatorPreviousStep = null;
    for (const item of combinedSteps) {
      if (item.type === 'route-separator') {
        // Get the starting state for this route
        let routeStartState;
        if (item.previousStep) {
          // Use the final state from previous route (after last purchase)
          routeStartState = {
            cps: item.previousStep.cookiesPerSecond,
            time: item.previousStep.timeElapsed,
            cookies: item.previousStep.totalCookies - item.previousStep.cookiesRequired
          };
        } else if (item.routeIndex === 0 && allRoutes[0].buildings && allRoutes[0].buildings.length > 0) {
          // First route - use initial values from first step
          const firstStep = allRoutes[0].buildings[0];
          routeStartState = {
            cps: firstStep.initialCookiesPerSecond || 0,
            time: firstStep.initialTimeElapsed || 0,
            cookies: firstStep.initialTotalCookies || 0
          };
        } else {
          routeStartState = { cps: 0, time: 0, cookies: 0 };
        }
        
        html += `
          <div class="chain-route-separator" data-route-index="${item.routeIndex}">
            <div class="route-separator-content">
              <span class="route-separator-label">Route ${item.routeIndex + 1}: ${this.escapeHtml(item.routeName)}</span>
              <span class="route-separator-stats">
                Starting CpS: ${formatNumber(routeStartState.cps)} • 
                Starting Time: ${this.formatTime(routeStartState.time)} • 
                Starting Cookies: ${formatNumber(routeStartState.cookies)}
              </span>
            </div>
          </div>
        `;
        
        separatorPreviousStep = item.previousStep;
      } else if (item.type === 'step') {
        const step = item.step;
        const isCompleted = false; // TODO: Implement progress tracking for chains
        
        html += `
          <div class="route-step chain-step ${isCompleted ? 'completed' : ''}" 
               role="listitem"
               data-step-order="${step.order}"
               data-route-index="${item.routeIndex}">
            <label class="step-checkbox">
              <input 
                type="checkbox" 
                ${isCompleted ? 'checked' : ''}
                aria-label="Mark step ${step.order} as completed"
                data-step-order="${step.order}"
                data-route-index="${item.routeIndex}"
              >
              <span class="step-number">${step.order}</span>
            </label>
            <div class="step-content">
              <div class="step-info">
                <span class="step-route-badge" title="Route ${item.routeIndex + 1}: ${this.escapeHtml(item.routeName)}">
                  R${item.routeIndex + 1}
                </span>
                <span class="step-building">${this.escapeHtml(step.buildingName)}${step.buildingCount !== null && step.buildingCount !== undefined ? ` [${step.buildingCount}]` : ''}</span>
                <span class="step-separator">•</span>
                <span class="step-detail">Cookies: ${formatNumber(step.cookiesRequired)}</span>
                <span class="step-separator">•</span>
                <span class="step-detail">CpS: ${formatNumber(step.cookiesPerSecond)}${step.cpsIncrease !== undefined && step.cpsIncrease > 0 ? ` (+${formatNumber(step.cpsIncrease)})` : ''}</span>
                <span class="step-separator">•</span>
                <span class="step-detail">Time: ${this.formatTime(step.timeElapsed)}</span>
                ${step.timeSinceLastStep !== undefined ? `
                <span class="step-separator">•</span>
                <span class="step-detail">Since Last: ${this.formatTime(step.timeSinceLastStep)}</span>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }
    }

    html += '</div>';
    html += '</div>';
    return html;
  }

  /**
   * Format time in seconds to human-readable format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '0s';
    }
    
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs.toFixed(1)}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}h ${minutes}m ${secs.toFixed(1)}s`;
    }
  }

  /**
   * Calculate step values (similar to RouteDisplay.calculateStepValues)
   * @param {Object} step - Route step object
   * @param {Object} previousStep - Previous step or null
   * @param {boolean} isFirstStep - Whether this is the first step in the chain
   * @returns {Object} Step with calculated values
   */
  calculateStepValues(step, previousStep = null, isFirstStep = false) {
    const calculated = { ...step };
    
    // If step already has calculated values, use them (but adjust for chain context)
    if (step.cookiesPerSecond !== undefined && step.timeElapsed !== undefined && step.totalCookies !== undefined) {
      // Adjust for chain context if not first step
      if (!isFirstStep && previousStep) {
        calculated.timeElapsed = previousStep.timeElapsed + (step.timeSinceLastStep || 0);
        calculated.cookiesPerSecond = previousStep.cookiesPerSecond + (step.cpsIncrease || 0);
        // Recalculate total cookies based on chain context
        const cookiesAfterPurchase = previousStep.totalCookies - previousStep.cookiesRequired;
        const cookiesGenerated = previousStep.cookiesPerSecond * (step.timeSinceLastStep || 0);
        calculated.totalCookies = cookiesAfterPurchase + cookiesGenerated;
      }
      return calculated;
    }
    
    if (previousStep === null || isFirstStep) {
      // First step - use initial values if available
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
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return String(text);
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get route name for display
   * @param {Object} route - Route object
   * @param {number} index - Route index
   * @returns {string} Route name
   */
  getRouteName(route, index) {
    // Try to get name from route metadata
    if (route.categoryName) {
      return route.categoryName;
    }
    if (route.categoryId) {
      return route.categoryId;
    }
    if (route.achievementIds && route.achievementIds.length > 0) {
      return `Achievement Route (${route.achievementIds.join(', ')})`;
    }
    return `Route ${index + 1}`;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Previous button
    const prevBtn = this.container.querySelector('#chain-prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentRouteIndex > 0) {
          this.showRoute(this.currentRouteIndex - 1);
        }
      });
    }

    // Next button
    const nextBtn = this.container.querySelector('#chain-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentRouteIndex < this.currentRouteChain.calculatedRoutes.length - 1) {
          this.showRoute(this.currentRouteIndex + 1);
        }
      });
    }

    // Route list items
    const routeItems = this.container.querySelectorAll('.route-chain-item-btn');
    routeItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const routeIndex = parseInt(btn.getAttribute('data-route-index'), 10);
        if (!isNaN(routeIndex) && routeIndex >= 0 && routeIndex < this.currentRouteChainResult.calculatedRoutes.length) {
          this.showRoute(routeIndex);
        }
      });
    });

    // Save chain button
    const saveBtn = this.container.querySelector('#save-chain-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.handleSaveChain();
      });
    }
  }

  /**
   * Show a specific route in the chain
   * @param {number} routeIndex - Index of route to display
   */
  async showRoute(routeIndex) {
    if (!this.currentRouteChainResult || routeIndex < 0 || routeIndex >= this.currentRouteChainResult.calculatedRoutes.length) {
      return;
    }

    this.currentRouteIndex = routeIndex;
    
    // Re-render to update UI
    this.render();
    
    // Scroll to top of route display
    const routeDisplayContainer = this.container.querySelector('#chain-route-display-container');
    if (routeDisplayContainer) {
      routeDisplayContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Handle save chain button click
   */
  handleSaveChain() {
    const chainName = prompt('Enter a name for this route chain:', this.generateDefaultChainName());
    if (!chainName || chainName.trim() === '') {
      return; // User cancelled or entered empty name
    }

    try {
      // Convert chain result to RouteChain format
      const routeChain = this.convertChainResultToRouteChain(chainName.trim());
      saveRouteChain(routeChain);
      alert(`Route chain "${chainName}" saved successfully!`);
    } catch (error) {
      console.error('[RouteChainDisplay] Error saving chain:', error);
      alert(`Failed to save route chain: ${error.message}`);
    }
  }

  /**
   * Generate default chain name
   * @returns {string} Default chain name
   */
  generateDefaultChainName() {
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, '0');
    const day = String(timestamp.getDate()).padStart(2, '0');
    const hours = String(timestamp.getHours()).padStart(2, '0');
    const minutes = String(timestamp.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    return `Route Chain - ${formattedDate}`;
  }

  /**
   * Convert chain calculation result to RouteChain format for saving
   * @param {string} chainName - Name for the chain
   * @returns {Object} RouteChain object
   */
  convertChainResultToRouteChain(chainName) {
    const now = Date.now();
    let accumulatedBuildings = {};
    let accumulatedUpgrades = [];

    const routes = this.currentRouteChainResult.calculatedRoutes.map((calculatedRoute, index) => {
      // Get route config (from wizard state or from calculated route metadata)
      const routeConfig = this.routeConfigs[index] || {
        type: calculatedRoute.categoryId ? 'category' : 'achievement',
        categoryId: calculatedRoute.categoryId,
        categoryName: calculatedRoute.categoryName || calculatedRoute.categoryId,
        versionId: calculatedRoute.versionId || this.versionId,
        hardcoreMode: calculatedRoute.hardcoreMode || false
      };

      // Create ChainedRoute object
      const chainedRoute = {
        routeIndex: index,
        routeConfig: routeConfig,
        calculatedRoute: calculatedRoute,
        startingBuildings: { ...accumulatedBuildings },
        startingUpgrades: [...accumulatedUpgrades],
        progress: {},
        completedSteps: 0,
        isComplete: false,
        calculatedAt: now
      };

      // Extract final state from this route for next route
      const finalState = extractFinalStateFromRoute(calculatedRoute, accumulatedBuildings, accumulatedUpgrades);
      accumulatedBuildings = finalState.buildings;
      accumulatedUpgrades = finalState.upgrades;

      return chainedRoute;
    });

    return {
      id: null, // Will be generated by saveRouteChain
      name: chainName,
      routes: routes,
      createdAt: now,
      lastAccessedAt: now,
      savedAt: now,
      overallProgress: {
        totalRoutes: routes.length,
        completedRoutes: 0,
        inProgressRouteIndex: null
      }
    };
  }

  /**
   * Get current route index
   * @returns {number} Current route index
   */
  getCurrentRouteIndex() {
    return this.currentRouteIndex;
  }

  /**
   * Hide the route chain display
   */
  hide() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.isVisible = false;
  }
}
