/**
 * Version selector UI component
 * Allows users to select which game version to use for calculations
 */

export class VersionSelector {
  constructor(containerId, onSelect) {
    this.container = document.getElementById(containerId);
    this.onSelect = onSelect;
    this.selectedVersion = 'v2052'; // Default version
    this.versions = [
      { id: 'v2052', name: 'v2052 (Default)', description: 'Latest version with "You" building and new upgrade tiers' },
      { id: 'v2048', name: 'v2048', description: 'Previous version with all buildings' },
      { id: 'v2031', name: 'v2031', description: 'Earlier version' },
      { id: 'v10466', name: 'v10466', description: 'Classic version with 8 buildings' },
      { id: 'v10466_xmas', name: 'v10466 (Christmas)', description: 'Classic version with holiday upgrades' }
    ];
  }

  /**
   * Initialize the version selector
   */
  async init() {
    // Load saved version preference from localStorage
    const savedVersion = localStorage.getItem('selectedVersion');
    if (savedVersion && this.versions.find(v => v.id === savedVersion)) {
      this.selectedVersion = savedVersion;
    }
    
    this.render();
    
    // Trigger initial selection
    if (this.onSelect) {
      this.onSelect(this.selectedVersion);
    }
  }

  /**
   * Render the version selector
   */
  render() {
    if (!this.container) return;

    // Check if container is in header (simplified version) or main section (full version)
    const isInHeader = this.container.id === 'version-selector-header';

    if (isInHeader) {
      // Simplified version for header
      this.container.innerHTML = `
        <select id="version-select" class="version-select-header" aria-label="Select game version">
          ${this.versions.map(v => `
            <option value="${v.id}" ${v.id === this.selectedVersion ? 'selected' : ''}>
              ${this.escapeHtml(v.name)}
            </option>
          `).join('')}
        </select>
      `;
    } else {
      // Full version with label and description
      this.container.innerHTML = `
        <label for="version-select" class="version-label">Game Version:</label>
        <select id="version-select" class="version-select" aria-label="Select game version">
          ${this.versions.map(v => `
            <option value="${v.id}" ${v.id === this.selectedVersion ? 'selected' : ''}>
              ${this.escapeHtml(v.name)}
            </option>
          `).join('')}
        </select>
        <div class="version-description">
          ${this.versions.find(v => v.id === this.selectedVersion)?.description || ''}
        </div>
      `;
    }

    // Attach event listener
    const select = this.container.querySelector('#version-select');
    if (select) {
      select.addEventListener('change', (e) => {
        this.selectVersion(e.target.value);
      });
    }
  }

  /**
   * Select a version
   */
  selectVersion(versionId) {
    if (!this.versions.find(v => v.id === versionId)) {
      console.warn(`Unknown version: ${versionId}`);
      return;
    }

    this.selectedVersion = versionId;
    
    // Save preference to localStorage
    localStorage.setItem('selectedVersion', versionId);
    
    // Re-render to update description
    this.render();
    
    // Notify parent
    if (this.onSelect) {
      this.onSelect(versionId);
    }
  }

  /**
   * Get selected version
   */
  getSelectedVersion() {
    return this.selectedVersion;
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

