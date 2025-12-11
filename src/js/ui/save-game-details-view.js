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
          ${this.renderSugarLumps(importedSaveGame)}
          ${this.renderUpgrades(importedSaveGame)}
          ${this.renderAchievements(importedSaveGame)}
          ${this.renderBuffs(importedSaveGame)}
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
    const miscData = importedSaveGame.miscGameData || {};
    const stats = [];
    
    // Cookies (prefer miscGameData.cookies)
    const cookies = miscData.cookies !== undefined ? miscData.cookies : importedSaveGame.totalCookies;
    if (cookies !== undefined) {
      stats.push(`<div class="stat-item"><span class="stat-label">Total Cookies:</span><span class="stat-value">${this.formatNumber(cookies)}</span></div>`);
    }
    
    // Cookies earned this ascension
    if (miscData.totalCookiesEarned !== undefined) {
      stats.push(`<div class="stat-item"><span class="stat-label">Cookies Earned (This Ascension):</span><span class="stat-value">${this.formatNumber(miscData.totalCookiesEarned)}</span></div>`);
    }
    
    // Prestige level
    if (miscData.prestigeLevel !== undefined) {
      stats.push(`<div class="stat-item"><span class="stat-label">Prestige Level:</span><span class="stat-value">${this.formatNumber(miscData.prestigeLevel)}</span></div>`);
    }
    
    // Heavenly chips
    if (miscData.heavenlyChips !== undefined) {
      stats.push(`<div class="stat-item"><span class="stat-label">Heavenly Chips:</span><span class="stat-value">${this.formatNumber(miscData.heavenlyChips)}</span></div>`);
    }
    
    // Ascensions
    if (miscData.ascensions !== undefined) {
      stats.push(`<div class="stat-item"><span class="stat-label">Ascensions:</span><span class="stat-value">${miscData.ascensions}</span></div>`);
    }
    
    // Cookie clicks
    if (miscData.cookieClicks !== undefined) {
      stats.push(`<div class="stat-item"><span class="stat-label">Cookie Clicks:</span><span class="stat-value">${this.formatNumber(miscData.cookieClicks)}</span></div>`);
    }
    
    // Golden cookie clicks
    if (miscData.goldenCookieClicks !== undefined) {
      stats.push(`<div class="stat-item"><span class="stat-label">Golden Cookie Clicks:</span><span class="stat-value">${this.formatNumber(miscData.goldenCookieClicks)}</span></div>`);
    }
    
    // Highest raw CPS
    if (miscData.highestRawCps !== undefined) {
      stats.push(`<div class="stat-item"><span class="stat-label">Highest Raw CPS:</span><span class="stat-value">${this.formatNumber(miscData.highestRawCps)}</span></div>`);
    }
    
    // Time elapsed
    if (importedSaveGame.timeElapsed !== undefined) {
      stats.push(`<div class="stat-item"><span class="stat-label">Time Elapsed:</span><span class="stat-value">${this.formatTime(importedSaveGame.timeElapsed)}</span></div>`);
    }
    
    if (stats.length === 0) {
      return '<div class="save-game-stats"><h4>Game Statistics</h4><p>No statistics available.</p></div>';
    }
    
    return `
      <div class="save-game-stats">
        <h4>Game Statistics</h4>
        <div class="stats-grid">
          ${stats.join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render building counts section with levels and detailed info
   */
  renderBuildingCounts(importedSaveGame) {
    // Prefer buildings array (new structure) over buildingCounts (backward compatibility)
    let buildings = [];
    
    if (importedSaveGame.buildings && Array.isArray(importedSaveGame.buildings)) {
      // Use new buildings array structure
      buildings = importedSaveGame.buildings
        .filter(b => b.amountOwned !== undefined && b.amountOwned > 0)
        .sort((a, b) => b.amountOwned - a.amountOwned);
    } else if (importedSaveGame.buildingCounts) {
      // Fallback to buildingCounts
      buildings = Object.entries(importedSaveGame.buildingCounts)
        .filter(([name, count]) => count > 0)
        .map(([name, count]) => ({ name, amountOwned: count }))
        .sort((a, b) => b.amountOwned - a.amountOwned);
    }

    if (buildings.length === 0) {
      return '<div class="save-game-buildings"><h4>Buildings</h4><p>No buildings owned.</p></div>';
    }

    return `
      <div class="save-game-buildings">
        <h4>Owned Buildings</h4>
        <div class="buildings-grid">
          ${buildings.map(building => {
            const name = building.name || 'Unknown';
            const count = building.amountOwned || 0;
            const level = building.level;
            const amountBought = building.amountBought;
            const totalCookies = building.totalCookies;
            const highestOwned = building.highestAmountOwned;
            
            let details = [];
            if (level !== undefined && level > 0) {
              details.push(`Level ${level}`);
            }
            if (amountBought !== undefined && amountBought !== count) {
              details.push(`Bought: ${amountBought}`);
            }
            if (highestOwned !== undefined && highestOwned > count) {
              details.push(`Highest: ${highestOwned}`);
            }
            
            return `
              <div class="building-item">
                <div class="building-header">
                  <span class="building-name">${this.escapeHtml(name)}</span>
                  <span class="building-count">${count}</span>
                </div>
                ${details.length > 0 ? `
                  <div class="building-details">
                    ${details.map(d => `<span class="building-detail">${d}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  /**
   * Render sugar lumps section
   */
  renderSugarLumps(importedSaveGame) {
    const miscData = importedSaveGame.miscGameData || {};
    
    const currentLumps = miscData.currentAmountOfSugarLumps;
    const totalLumps = miscData.totalAmountOfSugarLumps;
    const lumpType = miscData.sugarLumpType;
    const lumpStartTime = miscData.timeWhenCurrentLumpStarted;
    
    if (currentLumps === undefined && totalLumps === undefined) {
      return '';
    }
    
    const lumpTypeNames = {
      0: 'Normal',
      1: 'Bifurcated',
      2: 'Golden',
      3: 'Meaty',
      4: 'Caramelized'
    };
    
    const lumpTypeName = lumpType !== undefined && lumpTypeNames[lumpType] 
      ? lumpTypeNames[lumpType] 
      : 'Unknown';
    
    let lumpInfo = [];
    if (currentLumps !== undefined) {
      lumpInfo.push(`<div class="sugar-lump-item"><span class="sugar-lump-label">Current:</span><span class="sugar-lump-value">${this.formatNumber(currentLumps)}</span></div>`);
    }
    if (totalLumps !== undefined) {
      lumpInfo.push(`<div class="sugar-lump-item"><span class="sugar-lump-label">Total:</span><span class="sugar-lump-value">${this.formatNumber(totalLumps)}</span></div>`);
    }
    if (lumpType !== undefined) {
      lumpInfo.push(`<div class="sugar-lump-item"><span class="sugar-lump-label">Type:</span><span class="sugar-lump-value">${this.escapeHtml(lumpTypeName)}</span></div>`);
    }
    if (lumpStartTime !== undefined && lumpStartTime > 0) {
      const startDate = new Date(lumpStartTime);
      lumpInfo.push(`<div class="sugar-lump-item"><span class="sugar-lump-label">Started:</span><span class="sugar-lump-value">${startDate.toLocaleString()}</span></div>`);
    }
    
    return `
      <div class="save-game-sugar-lumps">
        <h4>Sugar Lumps</h4>
        <div class="sugar-lumps-grid">
          ${lumpInfo.join('')}
        </div>
      </div>
    `;
  }
  
  /**
   * Render buffs section
   */
  renderBuffs(importedSaveGame) {
    const buffs = importedSaveGame.buffs || [];
    
    if (!Array.isArray(buffs) || buffs.length === 0) {
      return '';
    }
    
    const activeBuffs = buffs.filter(buff => buff.time !== undefined && buff.time > 0);
    
    if (activeBuffs.length === 0) {
      return '';
    }
    
    return `
      <div class="save-game-buffs">
        <h4>Active Buffs (${activeBuffs.length})</h4>
        <div class="buffs-list">
          ${activeBuffs.map(buff => `
            <div class="buff-item">
              <div class="buff-header">
                <span class="buff-id">Buff ID: ${buff.id !== undefined ? buff.id : 'Unknown'}</span>
                ${buff.maxTime !== undefined ? `<span class="buff-time">${this.formatTime(buff.time)} / ${this.formatTime(buff.maxTime)}</span>` : ''}
              </div>
              ${buff.arg0 !== undefined || buff.arg1 !== undefined || buff.arg2 !== undefined ? `
                <div class="buff-args">
                  ${buff.arg0 !== undefined ? `<span>Arg 0: ${this.formatNumber(buff.arg0)}</span>` : ''}
                  ${buff.arg1 !== undefined ? `<span>Arg 1: ${this.formatNumber(buff.arg1)}</span>` : ''}
                  ${buff.arg2 !== undefined ? `<span>Arg 2: ${this.formatNumber(buff.arg2)}</span>` : ''}
                </div>
              ` : ''}
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
    const runDetails = importedSaveGame.runDetails || {};
    const miscData = importedSaveGame.miscGameData || {};
    const preferences = importedSaveGame.preferences || {};
    
    const infoItems = [];
    
    if (importedSaveGame.version) {
      infoItems.push(`<div class="info-item"><span class="info-label">Version:</span><span class="info-value">${this.escapeHtml(importedSaveGame.version)}</span></div>`);
    }
    
    // Hardcore mode (prefer miscGameData.ascensionMode)
    const isHardcore = miscData.ascensionMode === 1 || importedSaveGame.hardcoreMode === true;
    infoItems.push(`<div class="info-item"><span class="info-label">Hardcore Mode:</span><span class="info-value">${isHardcore ? 'Yes' : 'No'}</span></div>`);
    
    // Bakery name (prefer runDetails.bakeryName)
    const bakeryName = runDetails.bakeryName || importedSaveGame.playerName;
    if (bakeryName) {
      infoItems.push(`<div class="info-item"><span class="info-label">Bakery Name:</span><span class="info-value">${this.escapeHtml(bakeryName)}</span></div>`);
    }
    
    // Seed
    if (runDetails.seed) {
      infoItems.push(`<div class="info-item"><span class="info-label">Seed:</span><span class="info-value">${this.escapeHtml(runDetails.seed)}</span></div>`);
    }
    
    // Dragon level
    if (miscData.dragonLevel !== undefined) {
      infoItems.push(`<div class="info-item"><span class="info-label">Dragon Level:</span><span class="info-value">${miscData.dragonLevel}</span></div>`);
    }
    
    // Dragon auras
    if (miscData.dragonAuras && Array.isArray(miscData.dragonAuras) && miscData.dragonAuras.length > 0) {
      const auras = miscData.dragonAuras.filter(a => a !== undefined && a !== null);
      if (auras.length > 0) {
        infoItems.push(`<div class="info-item"><span class="info-label">Dragon Auras:</span><span class="info-value">${auras.join(', ')}</span></div>`);
      }
    }
    
    // Mods
    if (importedSaveGame.mods && importedSaveGame.mods.length > 0) {
      infoItems.push(`<div class="info-item"><span class="info-label">Mods:</span><span class="info-value">${importedSaveGame.mods.length} active</span></div>`);
    }
    
    return `
      <div class="save-game-version-info">
        <h4>Game Information</h4>
        <div class="info-grid">
          ${infoItems.join('')}
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

    // Handle boolean array (Python parser format) or object array (with mapping)
    let achievements = [];
    if (typeof importedSaveGame.achievements[0] === 'boolean') {
      // Boolean array: count true values but don't show individual achievements
      const count = importedSaveGame.achievements.filter(a => a === true).length;
      return `<div class="save-game-achievements"><h4>Achievements</h4><p>${count} achievements unlocked (details not available).</p></div>`;
    } else {
      // Object array: show detailed achievements
      achievements = importedSaveGame.achievements.map(achievement => {
        if (typeof achievement === 'number') {
          // Old format: just an index
          return { id: achievement, name: `Achievement ${achievement}`, description: 'Unknown achievement' };
        }
        // New format: achievement object
        return achievement;
      });
    }

    const achievementItems = achievements.map(achievement => {
      const typeClass = achievement.type === 'shadow' ? 'achievement-shadow' : '';
      return `
        <div class="achievement-item ${typeClass}">
          <div class="achievement-name">${this.escapeHtml(achievement.name)}</div>
          <div class="achievement-description">${this.escapeHtml(achievement.description)}</div>
          ${achievement.type === 'shadow' ? '<span class="achievement-badge shadow">Shadow</span>' : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="save-game-achievements">
        <h4>Unlocked Achievements (${achievements.length})</h4>
        <div class="achievements-list">
          ${achievementItems}
        </div>
      </div>
    `;
  }

  /**
   * Render metadata section
   */
  renderMetadata(importedSaveGame) {
    const runDetails = importedSaveGame.runDetails || {};
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
    
    // Start date (prefer runDetails.startDate)
    const startDate = runDetails.startDate || importedSaveGame.startDate;
    if (startDate) {
      const startDateObj = new Date(startDate);
      metadataItems.push(`
        <div class="metadata-item">
          <span class="metadata-label">Game Started:</span>
          <span class="metadata-value">${startDateObj.toLocaleString()}</span>
        </div>
      `);
    }
    
    // Legacy start date
    if (runDetails.legacyStartDate) {
      const legacyStartDate = new Date(runDetails.legacyStartDate);
      metadataItems.push(`
        <div class="metadata-item">
          <span class="metadata-label">Legacy Started:</span>
          <span class="metadata-value">${legacyStartDate.toLocaleString()}</span>
        </div>
      `);
    }
    
    // Last opened date (prefer runDetails.lastOpenedGameDate)
    const lastDate = runDetails.lastOpenedGameDate || importedSaveGame.lastDate;
    if (lastDate) {
      const lastDateObj = new Date(lastDate);
      metadataItems.push(`
        <div class="metadata-item">
          <span class="metadata-label">Last Played:</span>
          <span class="metadata-value">${lastDateObj.toLocaleString()}</span>
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
   * Shows years, days, hours, minutes, and seconds as appropriate
   */
  formatTime(seconds) {
    if (seconds === undefined || seconds === null) return 'N/A';
    
    const totalSeconds = Math.floor(seconds);
    
    // Calculate years (365 days = 1 year)
    const years = Math.floor(totalSeconds / (365 * 24 * 3600));
    const remainingAfterYears = totalSeconds % (365 * 24 * 3600);
    
    // Calculate days
    const days = Math.floor(remainingAfterYears / (24 * 3600));
    const remainingAfterDays = remainingAfterYears % (24 * 3600);
    
    // Calculate hours
    const hours = Math.floor(remainingAfterDays / 3600);
    const remainingAfterHours = remainingAfterDays % 3600;
    
    // Calculate minutes
    const minutes = Math.floor(remainingAfterHours / 60);
    const secs = remainingAfterHours % 60;
    
    // Build the formatted string, showing only non-zero components
    const parts = [];
    
    if (years > 0) {
      parts.push(`${years}y`);
    }
    if (days > 0) {
      parts.push(`${days}d`);
    }
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    if (secs > 0 || parts.length === 0) {
      parts.push(`${secs}s`);
    }
    
    return parts.join(' ');
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

