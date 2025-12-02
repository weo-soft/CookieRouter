/**
 * Route Validator
 * Validates imported route files through multiple stages
 */

/**
 * Custom error class for route export errors
 */
export class RouteExportError extends Error {
  constructor(message, routeType, originalError) {
    super(message);
    this.name = 'RouteExportError';
    this.routeType = routeType;
    this.originalError = originalError;
  }
}

/**
 * Custom error class for route import errors
 */
export class RouteImportError extends Error {
  constructor(message, validationStage, originalError) {
    super(message);
    this.name = 'RouteImportError';
    this.validationStage = validationStage;
    this.originalError = originalError;
  }
}

/**
 * Custom error class for route validation errors
 */
export class RouteValidationError extends Error {
  constructor(message, errors, warnings) {
    super(message);
    this.name = 'RouteValidationError';
    this.errors = errors || [];
    this.warnings = warnings || [];
  }
}

/**
 * Validates base64 string format
 * @param {string} str - String to validate
 * @returns {boolean} True if valid base64 format
 */
export function isValidBase64(str) {
  if (!str || typeof str !== 'string') {
    return false;
  }

  // Base64 strings should only contain A-Z, a-z, 0-9, +, /, and = (padding)
  // Length should be multiple of 4 (after padding)
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(str)) {
    return false;
  }

  // Try to decode to verify it's valid
  try {
    atob(str);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates export file schema
 * @param {Object} parsedData - Parsed JSON data
 * @returns {{isValid: boolean, errors: Array}} Validation result
 */
export function validateRouteSchema(parsedData) {
  const errors = [];

  if (!parsedData || typeof parsedData !== 'object') {
    errors.push({ stage: 'schema', message: 'Parsed data must be an object' });
    return { isValid: false, errors };
  }

  if (!parsedData.version || typeof parsedData.version !== 'string') {
    errors.push({ stage: 'schema', message: 'Missing or invalid version field' });
  }

  const validRouteTypes = ['savedRoute', 'routeChain', 'calculatedRoute', 'achievementRoute'];
  if (!parsedData.routeType || !validRouteTypes.includes(parsedData.routeType)) {
    errors.push({ stage: 'schema', message: `Missing or invalid routeType. Must be one of: ${validRouteTypes.join(', ')}` });
  }

  if (typeof parsedData.exportedAt !== 'number' || parsedData.exportedAt <= 0) {
    errors.push({ stage: 'schema', message: 'Missing or invalid exportedAt timestamp' });
  }

  if (!parsedData.routeData || typeof parsedData.routeData !== 'object') {
    errors.push({ stage: 'schema', message: 'Missing or invalid routeData field' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates route-specific data structure
 * @param {Object} routeData - Route data to validate
 * @param {string} routeType - Route type
 * @returns {{isValid: boolean, errors: Array, warnings: Array}} Validation result
 */
export function validateRouteData(routeData, routeType) {
  const errors = [];
  const warnings = [];

  if (!routeData || typeof routeData !== 'object') {
    errors.push({ stage: 'route', message: 'Route data must be an object' });
    return { isValid: false, errors, warnings };
  }

  switch (routeType) {
    case 'savedRoute':
      if (!routeData.id || typeof routeData.id !== 'string') {
        errors.push({ stage: 'route', message: 'SavedRoute must have a non-empty id field' });
      }
      if (!routeData.name || typeof routeData.name !== 'string' || routeData.name.length === 0 || routeData.name.length > 100) {
        errors.push({ stage: 'route', message: 'SavedRoute must have a name between 1 and 100 characters' });
      }
      if (!routeData.categoryId || typeof routeData.categoryId !== 'string') {
        errors.push({ stage: 'route', message: 'SavedRoute must have a non-empty categoryId' });
      }
      if (!routeData.versionId || typeof routeData.versionId !== 'string') {
        errors.push({ stage: 'route', message: 'SavedRoute must have a valid versionId' });
      }
      if (!routeData.routeData || !Array.isArray(routeData.routeData.buildings) || routeData.routeData.buildings.length === 0) {
        errors.push({ stage: 'route', message: 'SavedRoute must have routeData with non-empty buildings array' });
      }
      if (routeData.routeData && routeData.routeData.algorithm && !['GPL', 'DFS'].includes(routeData.routeData.algorithm)) {
        errors.push({ stage: 'route', message: 'SavedRoute algorithm must be "GPL" or "DFS"' });
      }
      break;

    case 'routeChain':
      if (!routeData.id || typeof routeData.id !== 'string') {
        errors.push({ stage: 'route', message: 'RouteChain must have a non-empty id field' });
      }
      if (!routeData.name || typeof routeData.name !== 'string' || routeData.name.length === 0 || routeData.name.length > 100) {
        errors.push({ stage: 'route', message: 'RouteChain must have a name between 1 and 100 characters' });
      }
      if (!Array.isArray(routeData.routes) || routeData.routes.length === 0) {
        errors.push({ stage: 'route', message: 'RouteChain must have a non-empty routes array' });
      } else {
        // Validate route order
        routeData.routes.forEach((route, index) => {
          if (route.routeIndex !== index) {
            errors.push({ stage: 'route', message: `RouteChain route at index ${index} has incorrect routeIndex: ${route.routeIndex}` });
          }
        });
      }
      break;

    case 'calculatedRoute':
      if (!routeData.categoryId || typeof routeData.categoryId !== 'string') {
        errors.push({ stage: 'route', message: 'CalculatedRoute must have a non-empty categoryId' });
      }
      if (!Array.isArray(routeData.buildings) || routeData.buildings.length === 0) {
        errors.push({ stage: 'route', message: 'CalculatedRoute must have a non-empty buildings array' });
      }
      if (routeData.algorithm && !['GPL', 'DFS'].includes(routeData.algorithm)) {
        errors.push({ stage: 'route', message: 'CalculatedRoute algorithm must be "GPL" or "DFS"' });
      }
      break;

    case 'achievementRoute':
      if (!Array.isArray(routeData.achievementIds) || routeData.achievementIds.length === 0) {
        errors.push({ stage: 'route', message: 'AchievementRoute must have a non-empty achievementIds array' });
      }
      if (!Array.isArray(routeData.buildings) || routeData.buildings.length === 0) {
        errors.push({ stage: 'route', message: 'AchievementRoute must have a non-empty buildings array' });
      }
      if (routeData.algorithm && !['GPL', 'DFS'].includes(routeData.algorithm)) {
        errors.push({ stage: 'route', message: 'AchievementRoute algorithm must be "GPL" or "DFS"' });
      }
      break;

    default:
      errors.push({ stage: 'route', message: `Unknown route type: ${routeType}` });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks for missing category references in route data
 * Note: This function should be called with storage functions passed in to avoid circular dependencies
 * @param {Object} routeData - Route data to check
 * @param {string} routeType - Route type
 * @param {Function} getCategoryById - Function to get category by ID (optional, for async usage)
 * @returns {Array} Array of warning objects
 */
export function checkMissingCategoryReferences(routeData, routeType, getCategoryById = null) {
  const warnings = [];

  // If getCategoryById is not provided, we can't check, so return empty warnings
  // The caller should import and pass the function
  if (!getCategoryById) {
    return warnings;
  }

  if (routeType === 'savedRoute' && routeData.categoryId) {
    const category = getCategoryById(routeData.categoryId);
    if (!category) {
      warnings.push({
        type: 'missingCategory',
        message: `Category "${routeData.categoryId}" not found in localStorage. Route data will be preserved but category reference may be invalid.`
      });
    }
  } else if (routeType === 'routeChain' && Array.isArray(routeData.routes)) {
    routeData.routes.forEach((route, index) => {
      if (route.routeConfig && route.routeConfig.type === 'category' && route.routeConfig.categoryId) {
        const category = getCategoryById(route.routeConfig.categoryId);
        if (!category) {
          warnings.push({
            type: 'missingCategory',
            message: `Category "${route.routeConfig.categoryId}" for route ${index} not found in localStorage. Route data will be preserved but category reference may be invalid.`
          });
        }
      }
    });
  } else if (routeType === 'calculatedRoute' && routeData.categoryId) {
    const category = getCategoryById(routeData.categoryId);
    if (!category) {
      warnings.push({
        type: 'missingCategory',
        message: `Category "${routeData.categoryId}" not found in localStorage. Route data will be preserved but category reference may be invalid.`
      });
    }
  }

  return warnings;
}

/**
 * Checks if a route ID already exists in localStorage
 * Note: This function should be called with storage functions passed in to avoid circular dependencies
 * @param {string} routeId - Route ID to check
 * @param {string} routeType - Route type ("savedRoute" | "routeChain")
 * @param {Function} getSavedRoutes - Function to get saved routes (optional)
 * @param {Function} getRouteChains - Function to get route chains (optional)
 * @returns {boolean} True if duplicate exists
 */
export function checkDuplicateRouteId(routeId, routeType, getSavedRoutes = null, getRouteChains = null) {
  if (!routeId || typeof routeId !== 'string') {
    return false;
  }

  if (routeType === 'savedRoute' && getSavedRoutes) {
    const savedRoutes = getSavedRoutes();
    return savedRoutes.some(route => route.id === routeId);
  } else if (routeType === 'routeChain' && getRouteChains) {
    const routeChains = getRouteChains();
    return routeChains.some(chain => chain.id === routeId);
  }

  return false;
}

/**
 * Validates an imported route file through multiple stages
 * @param {string} fileContent - File content as text string
 * @returns {Object} ImportValidationResult with validation status, errors, warnings, and parsed data
 */
export function validateImportFile(fileContent) {
  const result = {
    isValid: false,
    errors: [],
    warnings: [],
    parsedData: null,
    routeType: null
  };

  // Stage 1: Base64 validation
  if (!isValidBase64(fileContent)) {
    result.errors.push({ stage: 'base64', message: 'Invalid base64 format' });
    return result;
  }

  // Stage 2: Decode base64
  let decoded;
  try {
    decoded = atob(fileContent);
  } catch (error) {
    result.errors.push({ stage: 'base64', message: `Base64 decoding failed: ${error.message}` });
    return result;
  }

  // Stage 3: JSON parse
  let parsed;
  try {
    parsed = JSON.parse(decoded);
  } catch (error) {
    result.errors.push({ stage: 'json', message: `Invalid JSON format: ${error.message}` });
    return result;
  }

  // Stage 4: Schema validation
  const schemaValidation = validateRouteSchema(parsed);
  if (!schemaValidation.isValid) {
    result.errors.push(...schemaValidation.errors);
    return result;
  }

  // Stage 5: Route-specific validation
  const routeValidation = validateRouteData(parsed.routeData, parsed.routeType);
  result.errors.push(...routeValidation.errors);
  result.warnings.push(...routeValidation.warnings);

  // Check missing categories (async - will be handled by caller with storage functions)
  // Note: This is a warning, not an error, so we allow import to proceed

  if (result.errors.length === 0) {
    result.isValid = true;
    result.parsedData = parsed;
    result.routeType = parsed.routeType;
  }

  return result;
}

/**
 * Handles duplicate route ID based on user choice
 * @param {string} routeId - Original route ID
 * @param {string} routeType - Route type
 * @param {string} userChoice - User choice ("overwrite" | "rename" | "cancel")
 * @returns {Promise<string>} Resolved route ID (original, new, or empty string if cancelled)
 */
export async function handleDuplicateRouteId(routeId, routeType, userChoice) {
  if (userChoice === 'cancel') {
    return '';
  }

  if (userChoice === 'overwrite') {
    return routeId;
  }

  if (userChoice === 'rename') {
    return generateNewRouteId(routeType);
  }

  throw new Error(`Invalid user choice: ${userChoice}. Must be "overwrite", "rename", or "cancel"`);
}

/**
 * Generates a new unique route ID
 * @param {string} routeType - Route type
 * @returns {string} New unique route ID
 */
export function generateNewRouteId(routeType) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);

  if (routeType === 'savedRoute') {
    return `saved-route-${timestamp}-${random}`;
  } else if (routeType === 'routeChain') {
    return `route-chain-${timestamp}-${random}`;
  }

  // Fallback for other types
  return `${routeType}-${timestamp}-${random}`;
}

