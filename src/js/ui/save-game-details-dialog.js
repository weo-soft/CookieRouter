/**
 * Save Game Details Dialog UI component
 * Shows imported save game data in a modal dialog with option to create route
 */

import { getImportedSaveGame } from '../save-game-importer.js';

export class SaveGameDetailsDialog {
  constructor(containerId, onCreateRoute = null, onClose = null) {
    this.container = document.getElementById(containerId);
    this.onCreateRoute = onCreateRoute; // Callback to open wizard with import pre-selected
    this.onClose = onClose; // Callback when dialog is closed
    this.isVisible = false;
  }

  /**
   * Show the details dialog
   */
  show() {
    this.isVisible = true;
    this.render();
    this.attachEventListeners();
    
    // Focus the dialog
    const dialog = this.container.querySelector('.save-game-details-dialog');
    if (dialog) {
      dialog.focus();
    }
  }

  /**
   * Hide the details dialog
   */
  hide() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.isVisible = false;
    if (this.onClose) {
      this.onClose();
    }
  }

  /**
   * Render the dialog
   */
  render() {
    if (!this.container) return;

    const importedSaveGame = getImportedSaveGame();

    if (!importedSaveGame) {
      this.container.innerHTML = '';
      return;
    }

    this.container.innerHTML = `
      <div class="save-game-details-dialog-overlay" role="dialog" aria-labelledby="save-game-details-dialog-title" aria-modal="true">
        <div class="save-game-details-dialog">
          <div class="dialog-header">
            <h2 id="save-game-details-dialog-title">Imported Save Game</h2>
            <button type="button" class="dialog-close-btn" aria-label="Close dialog">&times;</button>
          </div>
          
          <div class="dialog-content">
            ${this.renderGameStats(importedSaveGame)}
            ${this.renderBuildingCounts(importedSaveGame)}
            ${this.renderUpgrades(importedSaveGame)}
            ${this.renderAchievements(importedSaveGame)}
            ${this.renderVersionInfo(importedSaveGame)}
            ${this.renderMetadata(importedSaveGame)}
          </div>
          
          <div class="dialog-footer">
            <button type="button" id="create-route-from-save-btn" class="btn-primary">
              Create Route from Save Game
            </button>
            <button type="button" id="close-details-dialog-btn" class="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render game statistics section
   */
  renderGameStats(importedSaveGame) {
    return `
      <div class="save-game-stats">
        <h3>Game Statistics</h3>
        <div class="stats-grid">
          ${importedSaveGame.totalCookies !== undefined ? `
            <div class="stat-item">
              <span class="stat-label">Total Cookies:</span>
              <span class="stat-value">${this.formatNumber(importedSaveGame.totalCookies)}</span>
            </div>
          ` : ''}
          ${importedSaveGame.cookiesPerSecond !== undefined ? `
            <div class="stat-item">
              <span class="stat-label">Cookies per Second:</span>
              <span class="stat-value">${this.formatNumber(importedSaveGame.cookiesPerSecond)}</span>
            </div>
          ` : ''}
          ${importedSaveGame.playerCps !== undefined ? `
            <div class="stat-item">
              <span class="stat-label">Player CPS:</span>
              <span class="stat-value">${this.formatNumber(importedSaveGame.playerCps)}</span>
            </div>
          ` : ''}
          ${importedSaveGame.timeElapsed !== undefined ? `
            <div class="stat-item">
              <span class="stat-label">Time Elapsed:</span>
              <span class="stat-value">${this.formatTime(importedSaveGame.timeElapsed)}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render building counts section
   */
  renderBuildingCounts(importedSaveGame) {
    if (!importedSaveGame.buildingCounts || Object.keys(importedSaveGame.buildingCounts).length === 0) {
      return '<div class="save-game-buildings"><h3>Buildings</h3><p>No building data available.</p></div>';
    }

    const buildings = Object.entries(importedSaveGame.buildingCounts)
      .filter(([name, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    if (buildings.length === 0) {
      return '<div class="save-game-buildings"><h3>Buildings</h3><p>No buildings owned.</p></div>';
    }

    return `
      <div class="save-game-buildings">
        <h3>Owned Buildings</h3>
        <div class="buildings-grid">
          ${buildings.map(([name, count]) => `
            <div class="building-item">
              <span class="building-name">${this.escapeHtml(name)}</span>
              <span class="building-count">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render version and game mode information
   */
  renderVersionInfo(importedSaveGame) {
    return `
      <div class="save-game-version-info">
        <h3>Game Information</h3>
        <div class="info-grid">
          ${importedSaveGame.version ? `
            <div class="info-item">
              <span class="info-label">Version:</span>
              <span class="info-value">${this.escapeHtml(importedSaveGame.version)}</span>
            </div>
          ` : ''}
          <div class="info-item">
            <span class="info-label">Hardcore Mode:</span>
            <span class="info-value">${importedSaveGame.hardcoreMode ? 'Yes' : 'No'}</span>
          </div>
          ${importedSaveGame.playerName ? `
            <div class="info-item">
              <span class="info-label">Player Name:</span>
              <span class="info-value">${this.escapeHtml(importedSaveGame.playerName)}</span>
            </div>
          ` : ''}
          ${importedSaveGame.mods && importedSaveGame.mods.length > 0 ? `
            <div class="info-item">
              <span class="info-label">Mods:</span>
              <span class="info-value">${importedSaveGame.mods.length} active</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render upgrades section
   */
  renderUpgrades(importedSaveGame) {
    const purchased = importedSaveGame.upgrades || [];
    const unlocked = importedSaveGame.unlockedUpgrades || [];
    
    // Filter out purchased upgrades from unlocked list
    const unlockedNotPurchased = unlocked.filter(upgrade => !purchased.includes(upgrade));
    
    const hasPurchased = purchased.length > 0;
    const hasUnlocked = unlockedNotPurchased.length > 0;
    
    if (!hasPurchased && !hasUnlocked) {
      return '<div class="save-game-upgrades"><h3>Upgrades</h3><p>No upgrades available.</p></div>';
    }

    return `
      <div class="save-game-upgrades">
        <h3>Upgrades</h3>
        ${hasPurchased ? `
          <div class="upgrades-section">
            <h4 class="upgrades-section-title">Purchased (${purchased.length})</h4>
            <div class="upgrades-list">
              ${purchased.map(upgrade => `
                <div class="upgrade-item upgrade-purchased">
                  <span class="upgrade-name">${this.escapeHtml(upgrade)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        ${hasUnlocked ? `
          <div class="upgrades-section">
            <h4 class="upgrades-section-title">Unlocked, Not Yet Purchased (${unlockedNotPurchased.length})</h4>
            <div class="upgrades-list">
              ${unlockedNotPurchased.map(upgrade => `
                <div class="upgrade-item upgrade-unlocked">
                  <span class="upgrade-name">${this.escapeHtml(upgrade)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render achievements section
   */
  renderAchievements(importedSaveGame) {
    if (!importedSaveGame.achievements || importedSaveGame.achievements.length === 0) {
      return '<div class="save-game-achievements"><h3>Achievements</h3><p>No achievements unlocked.</p></div>';
    }

    return `
      <div class="save-game-achievements">
        <h3>Unlocked Achievements (${importedSaveGame.achievements.length})</h3>
        <div class="achievements-list">
          <p class="achievements-note">Achievement indices: ${importedSaveGame.achievements.join(', ')}</p>
          <p class="achievements-note"><em>Note: Achievement names require additional mapping data.</em></p>
        </div>
      </div>
    `;
  }

  /**
   * Render metadata section
   */
  renderMetadata(importedSaveGame) {
    const metadataItems = [];
    
    if (importedSaveGame.importedAt) {
      const importedDate = new Date(importedSaveGame.importedAt);
      metadataItems.push(`
        <div class="metadata-item">
          <span class="metadata-label">Imported:</span>
          <span class="metadata-value">${importedDate.toLocaleString()}</span>
        </div>
      `);
    }
    
    if (importedSaveGame.startDate) {
      const startDate = new Date(importedSaveGame.startDate);
      metadataItems.push(`
        <div class="metadata-item">
          <span class="metadata-label">Game Started:</span>
          <span class="metadata-value">${startDate.toLocaleString()}</span>
        </div>
      `);
    }
    
    if (importedSaveGame.lastDate) {
      const lastDate = new Date(importedSaveGame.lastDate);
      metadataItems.push(`
        <div class="metadata-item">
          <span class="metadata-label">Last Played:</span>
          <span class="metadata-value">${lastDate.toLocaleString()}</span>
        </div>
      `);
    }
    
    if (metadataItems.length === 0) return '';

    return `
      <div class="save-game-metadata">
        <h3>Import Information</h3>
        <div class="metadata-grid">
          ${metadataItems.join('')}
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeBtn = this.container.querySelector('.dialog-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Close button in footer
    const closeFooterBtn = this.container.querySelector('#close-details-dialog-btn');
    if (closeFooterBtn) {
      closeFooterBtn.addEventListener('click', () => this.hide());
    }

    // Create route button
    const createRouteBtn = this.container.querySelector('#create-route-from-save-btn');
    if (createRouteBtn) {
      createRouteBtn.addEventListener('click', () => {
        this.hide();
        if (this.onCreateRoute) {
          this.onCreateRoute();
        }
      });
    }

    // Close on overlay click
    const overlay = this.container.querySelector('.save-game-details-dialog-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide();
        }
      });
    }

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  /**
   * Format number with commas
   */
  formatNumber(num) {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1e12) {
      return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  /**
   * Format time in seconds to human-readable format
   */
  formatTime(seconds) {
    if (seconds === undefined || seconds === null) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
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

