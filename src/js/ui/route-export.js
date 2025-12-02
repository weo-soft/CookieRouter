/**
 * Route Export UI
 * Handles export functionality and file download
 */

import { serializeRouteForExport } from '../utils/route-serializer.js';
import { RouteExportError } from '../utils/route-validator.js';
import { RouteExportDialog } from './route-export-dialog.js';

/**
 * Generates a descriptive filename for export
 * @param {string} routeType - Type of route
 * @param {string} routeName - Name of route
 * @returns {string} Filename in format: cookie-router-{routeType}-{routeName}-{timestamp}.txt
 */
export function generateExportFileName(routeType, routeName) {
  // Sanitize route name for filename (remove invalid characters)
  const sanitizedName = (routeName || 'route')
    .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 50); // Limit length

  const timestamp = Date.now();
  return `cookie-router-${routeType}-${sanitizedName}-${timestamp}.txt`;
}

/**
 * Creates a downloadable file from base64-encoded content
 * @param {string} base64Content - Base64-encoded file content
 * @param {string} fileName - Filename for download
 * @throws {Error} If Blob creation or download trigger fails
 */
export function createExportFile(base64Content, fileName) {
  try {
    // Create Blob with base64 content
    const blob = new Blob([base64Content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create temporary anchor element for download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Failed to create export file: ${error.message}`);
  }
}

// Global export dialog instance
let exportDialog = null;

/**
 * Get or create the export dialog instance
 * @returns {RouteExportDialog} Export dialog instance
 */
function getExportDialog() {
  if (!exportDialog) {
    exportDialog = new RouteExportDialog('route-export-dialog-section');
  }
  return exportDialog;
}

/**
 * Exports a route - shows dialog with preview and options to copy or download
 * @param {Object} routeData - Route data to export
 * @param {string} routeType - Type of route
 * @param {string} routeName - Name of route for filename
 * @throws {RouteExportError} If export fails
 */
export function exportRoute(routeData, routeType, routeName) {
  try {
    // Serialize and encode route data
    const base64Content = serializeRouteForExport(routeData, routeType);

    // Generate filename
    const fileName = generateExportFileName(routeType, routeName);

    // Show export dialog with preview
    const dialog = getExportDialog();
    dialog.show(base64Content, fileName, {
      name: routeName,
      type: routeType
    });
  } catch (error) {
    throw new RouteExportError(
      `Failed to export route: ${error.message}`,
      routeType,
      error
    );
  }
}

/**
 * Detects route type from route data
 * @param {Object} routeData - Route data
 * @returns {string} Route type ("savedRoute" | "routeChain" | "calculatedRoute" | "achievementRoute")
 */
export function detectRouteType(routeData) {
  if (!routeData || typeof routeData !== 'object') {
    throw new Error('Invalid route data: must be an object');
  }

  // Check for savedRoute (has id, name, categoryId, routeData nested structure)
  if (routeData.id && routeData.name && routeData.categoryId && routeData.routeData) {
    return 'savedRoute';
  }

  // Check for routeChain (has routes array)
  if (Array.isArray(routeData.routes) && routeData.routes.length > 0) {
    return 'routeChain';
  }

  // Check for achievementRoute (has achievementIds array)
  if (Array.isArray(routeData.achievementIds) && routeData.achievementIds.length > 0) {
    return 'achievementRoute';
  }

  // Default to calculatedRoute (has categoryId and buildings)
  if (routeData.categoryId && Array.isArray(routeData.buildings)) {
    return 'calculatedRoute';
  }

  throw new Error('Cannot determine route type from route data');
}

