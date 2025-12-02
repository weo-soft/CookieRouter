/**
 * Route Export Dialog UI component
 * Shows export data preview and allows copying or downloading
 */

export class RouteExportDialog {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.exportData = null;
    this.fileName = null;
  }

  /**
   * Show the export dialog
   * @param {string} base64Content - Base64-encoded export data
   * @param {string} fileName - Filename for download
   * @param {Object} routeInfo - Route information for display
   */
  show(base64Content, fileName, routeInfo = {}) {
    if (!base64Content || !fileName) {
      console.error('RouteExportDialog.show: base64Content and fileName are required');
      return;
    }

    this.exportData = base64Content;
    this.fileName = fileName;
    this.render(routeInfo);
    this.attachEventListeners();
    
    // Focus on the textarea for easy selection
    const textarea = this.container.querySelector('#export-data-textarea');
    if (textarea) {
      textarea.focus();
      textarea.select();
    }
  }

  /**
   * Hide the export dialog
   */
  hide() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.exportData = null;
    this.fileName = null;
  }

  /**
   * Render the dialog
   * @param {Object} routeInfo - Route information for display
   */
  render(routeInfo) {
    if (!this.container) return;

    const routeName = routeInfo.name || 'Route';
    const routeType = routeInfo.type || 'route';
    const dataLength = this.exportData.length;

    this.container.innerHTML = `
      <div class="route-export-dialog-overlay" role="dialog" aria-labelledby="export-dialog-title" aria-modal="true">
        <div class="route-export-dialog">
          <div class="dialog-header">
            <h2 id="export-dialog-title">Export Route</h2>
            <button type="button" class="dialog-close-btn" aria-label="Close dialog">&times;</button>
          </div>
          
          <div class="dialog-content">
            <div class="export-info">
              <p><strong>Route:</strong> ${this.escapeHtml(routeName)}</p>
              <p><strong>Type:</strong> ${this.escapeHtml(routeType)}</p>
              <p><strong>File:</strong> ${this.escapeHtml(this.fileName)}</p>
              <p><strong>Data Size:</strong> ${this.formatBytes(dataLength)}</p>
            </div>
            
            <div class="export-data-container">
              <label for="export-data-textarea">Export Data (Base64):</label>
              <textarea 
                id="export-data-textarea" 
                class="export-data-textarea"
                readonly
                aria-label="Export data in base64 format"
              >${this.escapeHtml(this.exportData)}</textarea>
              <p class="help-text">This is the base64-encoded route data. You can copy it or download it as a file.</p>
            </div>
          </div>
          
          <div class="dialog-footer">
            <button type="button" id="copy-export-data-btn" class="btn-secondary">
              📋 Copy to Clipboard
            </button>
            <button type="button" id="download-export-file-btn" class="btn-primary">
              💾 Download File
            </button>
            <button type="button" id="cancel-export-btn" class="btn-secondary">
              Cancel
            </button>
          </div>
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
      closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Cancel button
    const cancelBtn = this.container.querySelector('#cancel-export-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Copy to clipboard button
    const copyBtn = this.container.querySelector('#copy-export-data-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        await this.copyToClipboard();
      });
    }

    // Download button
    const downloadBtn = this.container.querySelector('#download-export-file-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        this.downloadFile();
      });
    }

    // Close on overlay click
    const overlay = this.container.querySelector('.route-export-dialog-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide();
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    if (e.key === 'Escape' && this.exportData) {
      this.hide();
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }

  /**
   * Copy export data to clipboard
   */
  async copyToClipboard() {
    const textarea = this.container.querySelector('#export-data-textarea');
    if (!textarea) return;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(this.exportData);
        this.showCopySuccess();
      } else {
        // Fallback for older browsers
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices
        const successful = document.execCommand('copy');
        if (successful) {
          this.showCopySuccess();
        } else {
          throw new Error('execCommand copy failed');
        }
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Final fallback: select text and show instructions
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      alert('Failed to copy automatically. The text has been selected - please press Ctrl+C (or Cmd+C on Mac) to copy.');
    }
  }

  /**
   * Show copy success feedback
   */
  showCopySuccess() {
    const copyBtn = this.container.querySelector('#copy-export-data-btn');
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.disabled = false;
      }, 2000);
    }
  }

  /**
   * Download the export file
   */
  downloadFile() {
    if (!this.exportData || !this.fileName) return;

    try {
      // Create Blob with base64 content
      const blob = new Blob([this.exportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      // Create temporary anchor element for download
      const a = document.createElement('a');
      a.href = url;
      a.download = this.fileName;
      a.style.display = 'none';

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success feedback
      const downloadBtn = this.container.querySelector('#download-export-file-btn');
      if (downloadBtn) {
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = '✓ Downloaded!';
        downloadBtn.disabled = true;
        setTimeout(() => {
          downloadBtn.textContent = originalText;
          downloadBtn.disabled = false;
        }, 2000);
      }

      // Optionally close dialog after download
      setTimeout(() => {
        this.hide();
      }, 1000);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Format bytes to human-readable size
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted size string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

