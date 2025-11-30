/**
 * Save Game Details View UI component
 * Displays detailed information about imported save game data
 */

import { getImportedSaveGame } from '../save-game-importer.js';

export class SaveGameDetailsView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isCollapsed = true;
  }

  /**
   * Initialize the details view
   */
  init() {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Render the details view
   */
  render() {
    if (!this.container) return;

    const importedSaveGame = getImportedSaveGame();

    if (!importedSaveGame) {
      this.container.innerHTML = `
        <div class="save-game-details-empty">
          <p>No save game imported. Import a save game to view details.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="save-game-details-container">
        <div class="save-game-details-header" id="save-game-details-header">
          <h3>Imported Save Game Details</h3>
          <button 
            type="button" 
            class="collapse-toggle" 
            id="save-game-details-toggle" 
            aria-label="Toggle save game details" 
            aria-expanded="${!this.isCollapsed}"
          >
            <span class="collapse-icon">${this.isCollapsed ? '▼' : '▲'}</span>
          </button>
        </div>
        <div class="save-game-details-content ${this.isCollapsed ? 'collapsed' : ''}" id="save-game-details-content">
          ${this.renderGameStats(importedSaveGame)}
          ${this.renderBuildingCounts(importedSaveGame)}
          ${this.renderUpgrades(importedSaveGame)}
          ${this.renderAchievements(importedSaveGame)}
          ${this.renderVersionInfo(importedSaveGame)}
          ${this.renderMetadata(importedSaveGame)}
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
        <h4>Game Statistics</h4>
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
      return '<div class="save-game-buildings"><h4>Buildings</h4><p>No building data available.</p></div>';
    }

    const buildings = Object.entries(importedSaveGame.buildingCounts)
      .filter(([name, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    if (buildings.length === 0) {
      return '<div class="save-game-buildings"><h4>Buildings</h4><p>No buildings owned.</p></div>';
    }

    return `
      <div class="save-game-buildings">
        <h4>Owned Buildings</h4>
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
        <h4>Game Information</h4>
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
    
    // Filter out purchased upgrades from unlocked list (to show only unlocked but not purchased)
    const unlockedNotPurchased = unlocked.filter(upgrade => !purchased.includes(upgrade));
    
    const hasPurchased = purchased.length > 0;
    const hasUnlocked = unlockedNotPurchased.length > 0;
    
    if (!hasPurchased && !hasUnlocked) {
      return '<div class="save-game-upgrades"><h4>Upgrades</h4><p>No upgrades available.</p></div>';
    }

    return `
      <div class="save-game-upgrades">
        <h4>Upgrades</h4>
        ${hasPurchased ? `
          <div class="upgrades-section">
            <h5 class="upgrades-section-title">Purchased (${purchased.length})</h5>
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
            <h5 class="upgrades-section-title">Unlocked, Not Yet Purchased (${unlockedNotPurchased.length})</h5>
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
      return '<div class="save-game-achievements"><h4>Achievements</h4><p>No achievements unlocked.</p></div>';
    }

    return `
      <div class="save-game-achievements">
        <h4>Unlocked Achievements (${importedSaveGame.achievements.length})</h4>
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
        <h4>Import Information</h4>
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
    const toggleBtn = this.container.querySelector('#save-game-details-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleCollapse();
      });
    }
  }

  /**
   * Toggle collapse/expand state
   */
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.render();
    this.attachEventListeners();
  }

  /**
   * Refresh the view (re-render with current data)
   */
  refresh() {
    this.render();
    this.attachEventListeners();
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

