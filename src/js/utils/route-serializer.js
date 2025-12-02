/**
 * Route Serializer
 * Handles serialization and deserialization of routes for import/export
 * Uses base64 encoding for safe file transfer
 */

/**
 * Serializes route data to base64-encoded JSON string for export
 * @param {Object} routeData - Route data to serialize
 * @param {string} routeType - Type of route ("savedRoute" | "routeChain" | "calculatedRoute" | "achievementRoute")
 * @returns {string} Base64-encoded JSON string
 * @throws {Error} If serialization or encoding fails
 */
export function serializeRouteForExport(routeData, routeType) {
  try {
    // Create export file structure
    const exportFile = {
      version: '1.0',
      routeType: routeType,
      exportedAt: Date.now(),
      routeData: routeData
    };

    // Serialize to JSON
    const jsonString = JSON.stringify(exportFile);

    // Base64 encode using browser native API
    const base64String = btoa(jsonString);

    return base64String;
  } catch (error) {
    throw new Error(`Failed to serialize route for export: ${error.message}`);
  }
}

/**
 * Deserializes base64-encoded route data from import file
 * @param {string} base64String - Base64-encoded JSON string
 * @returns {Object} Parsed route data object
 * @throws {Error} If base64 decoding or JSON parsing fails
 */
export function deserializeRouteFromImport(base64String) {
  try {
    // Base64 decode using browser native API
    const decodedString = atob(base64String);

    // Parse JSON
    const parsedData = JSON.parse(decodedString);

    return parsedData;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse JSON from import file: ${error.message}`);
    }
    throw new Error(`Failed to decode base64 from import file: ${error.message}`);
  }
}

