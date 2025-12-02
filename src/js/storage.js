/**
 * localStorage wrapper utilities for Cookie Router
 * Implements the storage contract from contracts/storage.md
 */

import { logStorageInfo } from './utils/storage-analysis.js';
import { validateRouteChain } from './utils/route-chain-validator.js';

const STORAGE_PREFIX = 'cookieRouter:';

/**
 * Get all categories from localStorage
 * @returns {Array} Array of Category objects, empty array if none exist or on error
 */
export function getCategories() {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + 'categories');
    if (!data) return [];
    const categories = JSON.parse(data);
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('Error reading categories from localStorage:', error);
    return [];
  }
}

/**
 * Save a category to localStorage
 * @param {Object} category - Category object to save
 * @throws {Error} If localStorage quota exceeded or validation fails
 */
export function saveCategory(category) {
  try {
    const categories = getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(STORAGE_PREFIX + 'categories', JSON.stringify(categories));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('localStorage quota exceeded. Please delete old categories.');
    }
    throw error;
  }
}

/**
 * Delete a category from localStorage
 * @param {string} categoryId - ID of category to delete
 */
export function deleteCategory(categoryId) {
  try {
    const categories = getCategories();
    const filtered = categories.filter(c => c.id !== categoryId);
    localStorage.setItem(STORAGE_PREFIX + 'categories', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting category:', error);
  }
}

/**
 * Get a category by ID
 * @param {string} categoryId - ID of category to retrieve
 * @returns {Object|null} Category object or null if not found
 */
export function getCategoryById(categoryId) {
  const categories = getCategories();
  return categories.find(c => c.id === categoryId) || null;
}

/**
 * Get all routes from localStorage
 * @returns {Array} Array of Route objects, empty array if none exist or on error
 */
export function getRoutes() {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + 'routes');
    if (!data) return [];
    const routes = JSON.parse(data);
    return Array.isArray(routes) ? routes : [];
  } catch (error) {
    console.error('Error reading routes from localStorage:', error);
    return [];
  }
}

/**
 * Save a calculated route to localStorage (temporary storage)
 * Note: This function is kept for backward compatibility but is not called automatically.
 * User-saved routes should use saveSavedRoute() instead.
 * @param {Object} route - Route object to save
 * @throws {Error} If localStorage quota exceeded or validation fails
 */
export function saveRoute(route) {
  // Debug logging - enable by setting window.DEBUG_STORAGE = true in console
  if (typeof window !== 'undefined' && window.DEBUG_STORAGE) {
    console.log('[Storage] Saving route, current storage:');
    logStorageInfo();
  }
  try {
    const routes = getRoutes();
    const index = routes.findIndex(r => r.id === route.id);
    if (index >= 0) {
      routes[index] = route;
    } else {
      routes.push(route);
    }
    
    localStorage.setItem(STORAGE_PREFIX + 'routes', JSON.stringify(routes));
    
    // Debug logging after save
    if (typeof window !== 'undefined' && window.DEBUG_STORAGE) {
      const finalRoutes = getRoutes();
      const finalSize = new Blob([JSON.stringify(finalRoutes)]).size;
      console.log(`[Storage] Route saved. Total routes: ${finalRoutes.length}, size: ${(finalSize / 1024).toFixed(2)} KB`);
      logStorageInfo();
    }
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('localStorage quota exceeded. Please delete old routes or saved routes.');
    }
    throw error;
  }
}

/**
 * Get a route by ID
 * @param {string} routeId - ID of route to retrieve
 * @returns {Object|null} Route object or null if not found
 */
export function getRouteById(routeId) {
  const routes = getRoutes();
  return routes.find(r => r.id === routeId) || null;
}

/**
 * Get routes by category ID
 * @param {string} categoryId - ID of category
 * @returns {Array} Array of Route objects for that category
 */
export function getRoutesByCategory(categoryId) {
  const routes = getRoutes();
  return routes.filter(r => r.categoryId === categoryId);
}

/**
 * Delete a route from localStorage
 * @param {string} routeId - ID of route to delete
 */
export function deleteRoute(routeId) {
  try {
    const routes = getRoutes();
    const filtered = routes.filter(r => r.id !== routeId);
    localStorage.setItem(STORAGE_PREFIX + 'routes', JSON.stringify(filtered));
    // Also delete associated progress
    clearProgress(routeId);
  } catch (error) {
    console.error('Error deleting route:', error);
  }
}

/**
 * Get progress for a route
 * @param {string} routeId - ID of route
 * @returns {Object|null} Progress object or null if not found
 */
export function getProgress(routeId) {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + 'progress');
    if (!data) return null;
    const progress = JSON.parse(data);
    return progress[routeId] || null;
  } catch (error) {
    console.error('Error reading progress from localStorage:', error);
    return null;
  }
}

/**
 * Save progress for a route
 * @param {Object} progress - Progress object to save
 * @throws {Error} If localStorage quota exceeded or validation fails
 */
export function saveProgress(progress) {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + 'progress');
    const allProgress = data ? JSON.parse(data) : {};
    allProgress[progress.routeId] = progress;
    localStorage.setItem(STORAGE_PREFIX + 'progress', JSON.stringify(allProgress));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('localStorage quota exceeded. Please delete old progress.');
    }
    throw error;
  }
}

/**
 * Update progress for a route
 * @param {string} routeId - ID of route
 * @param {Array<number>} completedBuildings - Array of step orders that are completed
 * @throws {Error} If routeId doesn't exist or validation fails
 */
export function updateProgress(routeId, completedBuildings) {
  const progress = getProgress(routeId);
  if (!progress) {
    throw new Error(`Progress for route ${routeId} not found`);
  }
  progress.completedBuildings = completedBuildings;
  progress.lastUpdated = Date.now();
  saveProgress(progress);
}

/**
 * Clear progress for a route
 * @param {string} routeId - ID of route
 */
export function clearProgress(routeId) {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + 'progress');
    if (!data) return;
    const allProgress = JSON.parse(data);
    delete allProgress[routeId];
    localStorage.setItem(STORAGE_PREFIX + 'progress', JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error clearing progress:', error);
  }
}

/**
 * Validate a SavedRoute object according to data model
 * @param {Object} savedRoute - SavedRoute object to validate
 * @throws {Error} If validation fails
 */
function validateSavedRoute(savedRoute) {
  if (!savedRoute || typeof savedRoute !== 'object') {
    throw new Error('SavedRoute must be an object');
  }
  if (!savedRoute.id || typeof savedRoute.id !== 'string') {
    throw new Error('SavedRoute.id must be a non-empty string');
  }
  if (!savedRoute.name || typeof savedRoute.name !== 'string') {
    throw new Error('SavedRoute.name must be a non-empty string');
  }
  if (savedRoute.name.length === 0 || savedRoute.name.length > 100) {
    throw new Error('SavedRoute.name must be between 1 and 100 characters');
  }
  if (!savedRoute.categoryId || typeof savedRoute.categoryId !== 'string') {
    throw new Error('SavedRoute.categoryId must be a non-empty string');
  }
  if (!savedRoute.categoryName || typeof savedRoute.categoryName !== 'string') {
    throw new Error('SavedRoute.categoryName must be a non-empty string');
  }
  if (!savedRoute.versionId || typeof savedRoute.versionId !== 'string') {
    throw new Error('SavedRoute.versionId must be a non-empty string');
  }
  if (!savedRoute.routeData || typeof savedRoute.routeData !== 'object') {
    throw new Error('SavedRoute.routeData must be an object');
  }
  if (!Array.isArray(savedRoute.routeData.buildings) || savedRoute.routeData.buildings.length === 0) {
    throw new Error('SavedRoute.routeData.buildings must be a non-empty array');
  }
  if (typeof savedRoute.savedAt !== 'number' || savedRoute.savedAt <= 0) {
    throw new Error('SavedRoute.savedAt must be a positive number (timestamp)');
  }
  if (typeof savedRoute.lastAccessedAt !== 'number' || savedRoute.lastAccessedAt <= 0) {
    throw new Error('SavedRoute.lastAccessedAt must be a positive number (timestamp)');
  }
}

/**
 * Get all saved routes from localStorage
 * @returns {Array} Array of SavedRoute objects, empty array if none exist or on error
 */
export function getSavedRoutes() {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + 'savedRoutes');
    if (!data) return [];
    const savedRoutes = JSON.parse(data);
    
    // Validate that it's an array
    if (!Array.isArray(savedRoutes)) {
      console.warn('Saved routes data is not an array, resetting to empty array');
      // Try to recover by clearing corrupted data
      try {
        localStorage.removeItem(STORAGE_PREFIX + 'savedRoutes');
      } catch (e) {
        console.error('Error clearing corrupted saved routes data:', e);
      }
      return [];
    }
    
    // Filter out invalid routes and log warnings
    const validRoutes = savedRoutes.filter((route, index) => {
      try {
        validateSavedRoute(route);
        return true;
      } catch (error) {
        console.warn(`Invalid saved route at index ${index}, skipping:`, error.message);
        return false;
      }
    });
    
    // If we filtered out invalid routes, save the cleaned data
    if (validRoutes.length !== savedRoutes.length) {
      try {
        localStorage.setItem(STORAGE_PREFIX + 'savedRoutes', JSON.stringify(validRoutes));
        console.info(`Cleaned saved routes: removed ${savedRoutes.length - validRoutes.length} invalid route(s)`);
      } catch (e) {
        console.error('Error saving cleaned saved routes:', e);
      }
    }
    
    return validRoutes;
  } catch (error) {
    console.error('Error reading saved routes from localStorage:', error);
    // Try to recover by clearing corrupted data
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'savedRoutes');
      console.info('Cleared corrupted saved routes data');
    } catch (e) {
      console.error('Error clearing corrupted saved routes data:', e);
    }
    return [];
  }
}

/**
 * Save a saved route to localStorage
 * @param {Object} savedRoute - SavedRoute object to save
 * @throws {Error} If localStorage quota exceeded or validation fails
 */
export function saveSavedRoute(savedRoute) {
  validateSavedRoute(savedRoute);
  try {
    const savedRoutes = getSavedRoutes();
    const index = savedRoutes.findIndex(r => r.id === savedRoute.id);
    if (index >= 0) {
      savedRoutes[index] = savedRoute;
    } else {
      savedRoutes.push(savedRoute);
    }
    localStorage.setItem(STORAGE_PREFIX + 'savedRoutes', JSON.stringify(savedRoutes));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('localStorage quota exceeded. Please delete old saved routes.');
    }
    throw error;
  }
}

/**
 * Get a saved route by ID
 * @param {string} savedRouteId - ID of saved route to retrieve
 * @returns {Object|null} SavedRoute object or null if not found
 */
export function getSavedRouteById(savedRouteId) {
  try {
    const savedRoutes = getSavedRoutes();
    return savedRoutes.find(r => r.id === savedRouteId) || null;
  } catch (error) {
    console.error('Error getting saved route by ID:', error);
    return null;
  }
}

/**
 * Delete a saved route from localStorage by ID. Also deletes associated progress.
 * @param {string} savedRouteId - ID of saved route to delete
 */
export function deleteSavedRoute(savedRouteId) {
  try {
    const savedRoutes = getSavedRoutes();
    const filtered = savedRoutes.filter(r => r.id !== savedRouteId);
    localStorage.setItem(STORAGE_PREFIX + 'savedRoutes', JSON.stringify(filtered));
    // Also delete associated progress
    clearProgress(savedRouteId);
  } catch (error) {
    console.error('Error deleting saved route:', error);
  }
}

/**
 * Update the name of a saved route
 * @param {string} savedRouteId - ID of saved route to update
 * @param {string} newName - New name for the route (must be non-empty, max 100 characters)
 * @throws {Error} If savedRouteId doesn't exist or newName validation fails
 */
export function updateSavedRouteName(savedRouteId, newName) {
  if (!newName || typeof newName !== 'string') {
    throw new Error('Route name must be a non-empty string');
  }
  if (newName.length === 0 || newName.length > 100) {
    throw new Error('Route name must be between 1 and 100 characters');
  }
  const savedRoute = getSavedRouteById(savedRouteId);
  if (!savedRoute) {
    throw new Error(`Saved route with ID ${savedRouteId} not found`);
  }
  savedRoute.name = newName;
  saveSavedRoute(savedRoute);
}

/**
 * Update the lastAccessedAt timestamp for a saved route
 * @param {string} savedRouteId - ID of saved route to update
 * @throws {Error} If savedRouteId doesn't exist
 */
export function updateLastAccessed(savedRouteId) {
  const savedRoute = getSavedRouteById(savedRouteId);
  if (!savedRoute) {
    throw new Error(`Saved route with ID ${savedRouteId} not found`);
  }
  savedRoute.lastAccessedAt = Date.now();
  saveSavedRoute(savedRoute);
}

/**
 * Save imported save game data to localStorage (temporary storage, not persisted across sessions)
 * @param {Object} importedSaveGame - ImportedSaveGame object to save
 * @throws {Error} If localStorage quota exceeded
 */
export function saveImportedSaveGame(importedSaveGame) {
  try {
    // Store without rawSaveString to save space
    const { rawSaveString, ...dataToStore } = importedSaveGame;
    localStorage.setItem(STORAGE_PREFIX + 'importedSaveGame', JSON.stringify(dataToStore));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('localStorage quota exceeded. Please clear old data.');
    }
    throw error;
  }
}

/**
 * Get imported save game data from localStorage (temporary storage)
 * @returns {Object|null} ImportedSaveGame object or null if not found
 */
export function getImportedSaveGameFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + 'importedSaveGame');
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading imported save game from localStorage:', error);
    return null;
  }
}

/**
 * Clear imported save game data from localStorage
 */
export function clearImportedSaveGameFromStorage() {
  try {
    localStorage.removeItem(STORAGE_PREFIX + 'importedSaveGame');
  } catch (error) {
    console.error('Error clearing imported save game from localStorage:', error);
  }
}

/**
 * Get all route chains from localStorage
 * @returns {Array} Array of RouteChain objects, empty array if none exist or on error
 */
export function getRouteChains() {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + 'routeChains');
    if (!data) return [];
    const routeChains = JSON.parse(data);
    
    // Validate that it's an array
    if (!Array.isArray(routeChains)) {
      console.warn('Route chains data is not an array, resetting to empty array');
      try {
        localStorage.removeItem(STORAGE_PREFIX + 'routeChains');
      } catch (e) {
        console.error('Error clearing corrupted route chains data:', e);
      }
      return [];
    }
    
    // Filter out invalid chains and log warnings
    const validChains = routeChains.filter((chain, index) => {
      try {
        const validation = validateRouteChain(chain);
        if (!validation.isValid) {
          console.warn(`Invalid route chain at index ${index}, skipping:`, validation.errors.join(', '));
          return false;
        }
        return true;
      } catch (error) {
        console.warn(`Error validating route chain at index ${index}, skipping:`, error.message);
        return false;
      }
    });
    
    // If we filtered out invalid chains, save the cleaned data
    if (validChains.length !== routeChains.length) {
      try {
        localStorage.setItem(STORAGE_PREFIX + 'routeChains', JSON.stringify(validChains));
        console.info(`Cleaned route chains: removed ${routeChains.length - validChains.length} invalid chain(s)`);
      } catch (e) {
        console.error('Error saving cleaned route chains:', e);
      }
    }
    
    return validChains;
  } catch (error) {
    console.error('Error reading route chains from localStorage:', error);
    // Try to recover by clearing corrupted data
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'routeChains');
      console.info('Cleared corrupted route chains data');
    } catch (e) {
      console.error('Error clearing corrupted route chains data:', e);
    }
    return [];
  }
}

/**
 * Save a route chain to localStorage
 * @param {Object} routeChain - RouteChain object to save
 * @throws {Error} If localStorage quota exceeded or validation fails
 */
export function saveRouteChain(routeChain) {
  // Validate route chain
  const validation = validateRouteChain(routeChain);
  if (!validation.isValid) {
    throw new Error(`Route chain validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Generate ID if not provided
  if (!routeChain.id) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    routeChain.id = `route-chain-${timestamp}-${random}`;
  }
  
  // Set timestamps if not provided
  const now = Date.now();
  if (!routeChain.createdAt) {
    routeChain.createdAt = now;
  }
  if (!routeChain.savedAt) {
    routeChain.savedAt = now;
  }
  if (!routeChain.lastAccessedAt) {
    routeChain.lastAccessedAt = now;
  }
  
  // Ensure overallProgress is set correctly
  if (!routeChain.overallProgress) {
    routeChain.overallProgress = {
      totalRoutes: routeChain.routes.length,
      completedRoutes: 0,
      inProgressRouteIndex: null
    };
  } else {
    // Update totalRoutes to match routes.length
    routeChain.overallProgress.totalRoutes = routeChain.routes.length;
  }
  
  try {
    const routeChains = getRouteChains();
    const index = routeChains.findIndex(c => c.id === routeChain.id);
    if (index >= 0) {
      routeChains[index] = routeChain;
    } else {
      routeChains.push(routeChain);
    }
    localStorage.setItem(STORAGE_PREFIX + 'routeChains', JSON.stringify(routeChains));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('localStorage quota exceeded. Please delete old route chains.');
    }
    throw error;
  }
}

/**
 * Get a route chain by ID
 * @param {string} chainId - ID of route chain to retrieve
 * @returns {Object|null} RouteChain object or null if not found
 */
export function getRouteChainById(chainId) {
  try {
    const routeChains = getRouteChains();
    return routeChains.find(c => c.id === chainId) || null;
  } catch (error) {
    console.error('Error getting route chain by ID:', error);
    return null;
  }
}

/**
 * Delete a route chain from localStorage by ID
 * @param {string} chainId - ID of route chain to delete
 */
export function deleteRouteChain(chainId) {
  try {
    const routeChains = getRouteChains();
    const filtered = routeChains.filter(c => c.id !== chainId);
    localStorage.setItem(STORAGE_PREFIX + 'routeChains', JSON.stringify(filtered));
    
    // Also delete associated progress for each route in the chain
    const chain = routeChains.find(c => c.id === chainId);
    if (chain && chain.routes) {
      chain.routes.forEach((route, index) => {
        // Progress is stored per route using chainId-routeIndex format
        const progressId = `${chainId}-${index}`;
        clearProgress(progressId);
      });
    }
  } catch (error) {
    console.error('Error deleting route chain:', error);
  }
}

/**
 * Update the lastAccessedAt timestamp for a route chain
 * @param {string} chainId - ID of route chain to update
 * @throws {Error} If chainId doesn't exist
 */
export function updateRouteChainLastAccessed(chainId) {
  const routeChain = getRouteChainById(chainId);
  if (!routeChain) {
    throw new Error(`Route chain with ID ${chainId} not found`);
  }
  routeChain.lastAccessedAt = Date.now();
  saveRouteChain(routeChain);
}

/**
 * Update progress for a specific route in a chain
 * @param {string} chainId - ID of route chain
 * @param {number} routeIndex - Index of route in chain (0-based)
 * @param {Object} progress - Progress data (map of step order to checked state)
 * @param {number} completedSteps - Count of completed steps
 * @param {boolean} isComplete - Whether route is complete
 * @throws {Error} If chainId doesn't exist or routeIndex is invalid
 */
export function updateRouteChainProgress(chainId, routeIndex, progress, completedSteps, isComplete) {
  const routeChain = getRouteChainById(chainId);
  if (!routeChain) {
    throw new Error(`Route chain with ID ${chainId} not found`);
  }
  
  if (routeIndex < 0 || routeIndex >= routeChain.routes.length) {
    throw new Error(`Invalid route index ${routeIndex} for chain with ${routeChain.routes.length} routes`);
  }
  
  // Update the route's progress
  const route = routeChain.routes[routeIndex];
  route.progress = progress;
  route.completedSteps = completedSteps;
  route.isComplete = isComplete;
  
  // Update overall progress
  if (!routeChain.overallProgress) {
    routeChain.overallProgress = {
      totalRoutes: routeChain.routes.length,
      completedRoutes: 0,
      inProgressRouteIndex: null
    };
  }
  
  // Count completed routes
  routeChain.overallProgress.completedRoutes = routeChain.routes.filter(r => r.isComplete).length;
  
  // Update inProgressRouteIndex
  const inProgressIndex = routeChain.routes.findIndex(r => !r.isComplete && r.completedSteps > 0);
  routeChain.overallProgress.inProgressRouteIndex = inProgressIndex >= 0 ? inProgressIndex : null;
  
  // Update lastAccessedAt
  routeChain.lastAccessedAt = Date.now();
  
  saveRouteChain(routeChain);
}

