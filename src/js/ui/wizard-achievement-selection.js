/**
 * Wizard Achievement Selection Component
 * Handles achievement selection for achievement-based routes.
 * Supports filtering, searching, and selecting up to 5 achievements.
 * Provides detailed achievement information via modal dialogs.
 */

import { achievements, getAchievementById } from '../utils/achievements.js';
import { getAchievementRequirement, isAchievementRouteable } from '../utils/achievement-requirements.js';
import { filterAchievements, formatAchievementRequirement } from '../utils/achievement-utils.js';
import { formatNumber } from '../utils/format.js';

export class WizardAchievementSelection {
  constructor(containerId, initialState = null, onUpdate = null) {
    this.container = document.getElementById(containerId);
    this.state = initialState || {
      selectedAchievementIds: [],
      searchQuery: '',
      requirementTypeFilter: null,
      routeableOnly: true
    };
    this.onUpdate = onUpdate;
    this.allAchievements = achievements;
    this.filteredAchievements = [];
  }

  /**
   * Render the achievement selection UI
   */
  async render() {
    if (!this.container) return;

    await this.updateFilteredAchievements();

    this.container.innerHTML = `
      <div class="wizard-step-content">
        <h2>Achievement Selection</h2>
        <p class="step-description">Select one or more achievements to calculate a route for:</p>
        
        <div class="achievement-filters">
          <div class="filter-group">
            <label for="achievement-search">Search:</label>
            <input 
              type="text" 
              id="achievement-search" 
              placeholder="Search achievements..." 
              value="${this.state.searchQuery}"
              class="achievement-search-input"
            >
          </div>
          
          <div class="filter-group">
            <label for="requirement-type-filter">Filter by type:</label>
            <select id="requirement-type-filter" class="requirement-type-select">
              <option value="">All types</option>
              <option value="buildingCount" ${this.state.requirementTypeFilter === 'buildingCount' ? 'selected' : ''}>Building Count</option>
              <option value="cps" ${this.state.requirementTypeFilter === 'cps' ? 'selected' : ''}>Cookies Per Second</option>
              <option value="totalCookies" ${this.state.requirementTypeFilter === 'totalCookies' ? 'selected' : ''}>Total Cookies</option>
              <option value="upgradeCount" ${this.state.requirementTypeFilter === 'upgradeCount' ? 'selected' : ''}>Upgrade Count</option>
              <option value="totalBuildings" ${this.state.requirementTypeFilter === 'totalBuildings' ? 'selected' : ''}>Total Buildings</option>
              <option value="minBuildings" ${this.state.requirementTypeFilter === 'minBuildings' ? 'selected' : ''}>Min Buildings</option>
              <option value="buildingLevel" ${this.state.requirementTypeFilter === 'buildingLevel' ? 'selected' : ''}>Building Level</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>
              <input 
                type="checkbox" 
                id="routeable-only-filter" 
                ${this.state.routeableOnly ? 'checked' : ''}
              >
              Routeable only
            </label>
          </div>
        </div>
        
        <div class="selected-achievements-summary" id="selected-achievements-summary" style="${this.state.selectedAchievementIds.length > 0 ? '' : 'display: none;'}">
          <h3>Selected Achievements (${this.state.selectedAchievementIds.length})</h3>
          <div id="selected-achievements-list"></div>
        </div>
        
        <div class="achievement-list-container">
          <div class="achievement-list" id="achievement-list">
            ${this.renderAchievementList()}
          </div>
        </div>
        
        <div class="error-message" id="achievement-selection-error" role="alert" aria-live="polite" style="display: none;"></div>
      </div>
    `;

    this.attachEventListeners();
    this.updateSelectedAchievementsDisplay();
  }

  /**
   * Render the achievement list
   */
  renderAchievementList() {
    if (this.filteredAchievements.length === 0) {
      return '<p class="no-results">No achievements found matching your filters.</p>';
    }

    return this.filteredAchievements.map(achievement => {
      const requirement = getAchievementRequirement(achievement.id);
      const isRouteable = isAchievementRouteable(achievement.id);
      const isSelected = this.state.selectedAchievementIds.includes(achievement.id);
      const requirementText = requirement ? formatAchievementRequirement(requirement) : 'Unknown requirement';

      return `
        <div class="achievement-item ${isSelected ? 'selected' : ''} ${!isRouteable ? 'not-routeable' : ''}" data-achievement-id="${achievement.id}">
          <label class="achievement-checkbox-label">
            <input 
              type="checkbox" 
              class="achievement-checkbox" 
              value="${achievement.id}"
              ${isSelected ? 'checked' : ''}
              ${!isRouteable ? 'disabled' : ''}
            >
            <div class="achievement-content">
              <div class="achievement-header">
                <span class="achievement-name">${achievement.name}</span>
                ${!isRouteable ? '<span class="not-routeable-badge">Not routeable</span>' : ''}
                <button type="button" class="achievement-detail-btn" data-achievement-id="${achievement.id}" aria-label="View achievement details">ℹ</button>
              </div>
              <div class="achievement-description">${achievement.description}</div>
              <div class="achievement-requirement">Requirement: ${requirementText}</div>
            </div>
          </label>
        </div>
      `;
    }).join('');
  }

  /**
   * Update filtered achievements based on current filters
   */
  async updateFilteredAchievements() {
    const filters = {
      routeableOnly: this.state.routeableOnly,
      requirementType: this.state.requirementTypeFilter || null,
      searchQuery: this.state.searchQuery || ''
    };

    this.filteredAchievements = filterAchievements(this.allAchievements, filters);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Search input with debouncing
    const searchInput = this.container.querySelector('#achievement-search');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.state.searchQuery = e.target.value;
          this.updateFilteredAchievements().then(() => {
            this.updateAchievementList();
          });
        }, 100);
      });
    }

    // Requirement type filter
    const typeFilter = this.container.querySelector('#requirement-type-filter');
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        this.state.requirementTypeFilter = e.target.value || null;
        this.updateFilteredAchievements().then(() => {
          this.updateAchievementList();
        });
      });
    }

    // Routeable only filter
    const routeableFilter = this.container.querySelector('#routeable-only-filter');
    if (routeableFilter) {
      routeableFilter.addEventListener('change', (e) => {
        this.state.routeableOnly = e.target.checked;
        this.updateFilteredAchievements().then(() => {
          this.updateAchievementList();
        });
      });
    }

    // Achievement checkboxes
    const checkboxes = this.container.querySelectorAll('.achievement-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.handleAchievementToggle(parseInt(e.target.value, 10), e.target.checked);
      });
    });

    // Achievement detail buttons
    const detailButtons = this.container.querySelectorAll('.achievement-detail-btn');
    detailButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const achievementId = parseInt(e.target.dataset.achievementId || e.target.closest('[data-achievement-id]')?.dataset.achievementId, 10);
        if (achievementId !== undefined && !isNaN(achievementId)) {
          this.showAchievementDetails(achievementId);
        }
      });
    });
  }

  /**
   * Handle achievement toggle
   */
  handleAchievementToggle(achievementId, isSelected) {
    if (isSelected) {
      // Add to selection (max 5 for multiple achievements)
      if (this.state.selectedAchievementIds.length < 5) {
        this.state.selectedAchievementIds.push(achievementId);
      } else {
        // Show error if trying to select more than 5
        this.showError('You can select up to 5 achievements at a time.');
        // Uncheck the checkbox
        const checkbox = this.container.querySelector(`input[value="${achievementId}"]`);
        if (checkbox) checkbox.checked = false;
        return;
      }
    } else {
      // Remove from selection
      this.state.selectedAchievementIds = this.state.selectedAchievementIds.filter(id => id !== achievementId);
    }

    this.updateSelectedAchievementsDisplay();
    this.updateAchievementList();
    
    if (this.onUpdate) {
      this.onUpdate(this.state);
    }
  }

  /**
   * Update selected achievements display
   */
  updateSelectedAchievementsDisplay() {
    const summaryContainer = this.container.querySelector('#selected-achievements-summary');
    const listContainer = this.container.querySelector('#selected-achievements-list');
    
    if (!summaryContainer || !listContainer) return;

    if (this.state.selectedAchievementIds.length === 0) {
      summaryContainer.style.display = 'none';
      return;
    }

    summaryContainer.style.display = 'block';
    
    listContainer.innerHTML = this.state.selectedAchievementIds.map(id => {
      const achievement = getAchievementById(id);
      const requirement = getAchievementRequirement(id);
      const requirementText = requirement ? formatAchievementRequirement(requirement) : 'Unknown';
      
      return `
        <div class="selected-achievement-item">
          <span class="selected-achievement-name">${achievement ? achievement.name : `Achievement ${id}`}</span>
          <span class="selected-achievement-requirement">${requirementText}</span>
          <button type="button" class="remove-achievement-btn" data-achievement-id="${id}" aria-label="Remove achievement">×</button>
        </div>
      `;
    }).join('');

    // Attach remove button listeners
    const removeButtons = listContainer.querySelectorAll('.remove-achievement-btn');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.achievementId, 10);
        this.handleAchievementToggle(id, false);
      });
    });
  }

  /**
   * Update achievement list display
   */
  updateAchievementList() {
    const listContainer = this.container.querySelector('#achievement-list');
    if (!listContainer) return;

    listContainer.innerHTML = this.renderAchievementList();
    this.attachEventListeners(); // Re-attach listeners for new checkboxes
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorContainer = this.container.querySelector('#achievement-selection-error');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
      setTimeout(() => {
        errorContainer.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Set state
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Validate selection
   */
  validate() {
    if (this.state.selectedAchievementIds.length === 0) {
      this.showError('Please select at least one achievement.');
      return false;
    }
    
    // Validate that all selected achievements are routeable
    for (const achievementId of this.state.selectedAchievementIds) {
      if (!isAchievementRouteable(achievementId)) {
        this.showError(`Achievement ${achievementId} is not routeable. Please remove it from your selection.`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Show achievement details modal
   */
  showAchievementDetails(achievementId) {
    const achievement = getAchievementById(achievementId);
    const requirement = getAchievementRequirement(achievementId);
    
    if (!achievement) {
      this.showError('Achievement not found.');
      return;
    }

    const requirementText = requirement ? formatAchievementRequirement(requirement) : 'Unknown requirement';
    const isRouteable = requirement && requirement.type !== 'notRouteable';
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'achievement-detail-modal-overlay';
    modal.innerHTML = `
      <div class="achievement-detail-modal">
        <div class="achievement-detail-header">
          <h3>${achievement.name}</h3>
          <button type="button" class="achievement-detail-close" aria-label="Close">×</button>
        </div>
        <div class="achievement-detail-content">
          <div class="achievement-detail-section">
            <strong>Description:</strong>
            <p>${achievement.description}</p>
          </div>
          <div class="achievement-detail-section">
            <strong>Category:</strong>
            <p>${achievement.category || 'Unknown'}</p>
          </div>
          <div class="achievement-detail-section">
            <strong>Type:</strong>
            <p>${achievement.type === 'shadow' ? 'Shadow Achievement' : 'Normal Achievement'}</p>
          </div>
          <div class="achievement-detail-section">
            <strong>Requirement:</strong>
            <p class="achievement-requirement-detail ${!isRouteable ? 'not-routeable-text' : ''}">${requirementText}</p>
            ${!isRouteable && requirement && requirement.reason ? `
              <p class="not-routeable-explanation">Note: ${requirement.reason}</p>
            ` : ''}
            ${requirement && requirement.type === 'buildingLevel' ? `
              <p class="building-level-note">⚠️ Note: Building leveling requires sugar lumps, which are not simulated. This route will get you the building, but you'll need to level it manually using sugar lumps in the game.</p>
            ` : ''}
            ${requirement && requirement.value && requirement.value > 1e15 ? `
              <p class="large-value-note">Note: This achievement requires a very large value (${formatNumber(requirement.value)}). Route calculation may take longer than usual.</p>
            ` : ''}
          </div>
        </div>
        <div class="achievement-detail-footer">
          <button type="button" class="btn-primary achievement-detail-select-btn" ${!isRouteable ? 'disabled' : ''}>
            ${this.state.selectedAchievementIds.includes(achievementId) ? 'Deselect' : 'Select'} Achievement
          </button>
          <button type="button" class="btn-secondary achievement-detail-close-btn">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    modal.querySelector('.achievement-detail-close').addEventListener('click', closeModal);
    modal.querySelector('.achievement-detail-close-btn').addEventListener('click', closeModal);
    modal.querySelector('.achievement-detail-modal-overlay').addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Select/deselect handler
    const selectBtn = modal.querySelector('.achievement-detail-select-btn');
    if (selectBtn && isRouteable) {
      selectBtn.addEventListener('click', () => {
        const isSelected = this.state.selectedAchievementIds.includes(achievementId);
        this.handleAchievementToggle(achievementId, !isSelected);
        closeModal();
      });
      
      // Keyboard navigation
      selectBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isSelected = this.state.selectedAchievementIds.includes(achievementId);
          this.handleAchievementToggle(achievementId, !isSelected);
          closeModal();
        }
      });
    }
    
    // Focus management
    const closeBtn = modal.querySelector('.achievement-detail-close');
    const closeBtn2 = modal.querySelector('.achievement-detail-close-btn');
    if (closeBtn) closeBtn.focus();
    
    // Keyboard escape handler
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Focus trap for accessibility
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const trapFocus = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    modal.addEventListener('keydown', trapFocus);
  }
}

