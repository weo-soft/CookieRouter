/**
 * Main application entry point
 * Initializes the Cookie Clicker Building Order Simulator
 */

import { RouteDisplay } from './js/ui/route-display.js';
import { RouteChainDisplay } from './js/ui/route-chain-display.js';
import { SaveRouteDialog } from './js/ui/save-route-dialog.js';
import { SavedRoutesList } from './js/ui/saved-routes-list.js';
import { SaveGameImportDialog } from './js/ui/save-game-import-dialog.js';
import { SaveGameDetailsView } from './js/ui/save-game-details-view.js';
import { SaveGameDetailsDialog } from './js/ui/save-game-details-dialog.js';
import { RouteCreationWizard } from './js/ui/route-creation-wizard.js';
import { calculateRoute } from './js/simulation.js';
import { getImportedSaveGame, getImportState } from './js/save-game-importer.js';
import { getSavedRoutes } from './js/storage.js';
import { logStorageInfo, logStorageAnalysis } from './js/utils/storage-analysis.js';
import { showImportPreview, clearImportPreview } from './js/ui/route-import-preview.js';
import { RouteImportDialog } from './js/ui/route-import-dialog.js';

// Initialize UI components (conditionally based on page state)
// CategorySelector, CustomCategoryForm, and StartingBuildingsSelector are only used in wizard, not in main.js
let savedRoutesList = null; // Will be initialized conditionally based on page state
const saveRouteDialog = new SaveRouteDialog('save-route-dialog-section', handleRouteSaved, handleSaveRouteCancel);
const routeDisplay = new RouteDisplay('route-section', handleSaveRouteClick);
const routeChainDisplay = new RouteChainDisplay('route-section', handleSaveRouteClick);
const saveGameImportDialog = new SaveGameImportDialog('save-game-import-dialog-section', handleSaveGameImported, handleSaveGameCleared);
const saveGameDetailsView = new SaveGameDetailsView('save-game-details-section');
const saveGameDetailsDialog = new SaveGameDetailsDialog('save-game-details-dialog-section', handleCreateRouteFromSaveGame, handleSaveGameDetailsDialogClose);
const routeCreationWizard = new RouteCreationWizard('route-creation-wizard-section', handleWizardComplete, handleWizardCancel);
const routeImportDialog = new RouteImportDialog('route-import-dialog-section', handleRouteImportComplete);

let isCalculating = false;
let currentVersion = 'v2052'; // Default version
let currentStartingBuildings = {};

/**
 * Detect the current page state based on saved routes
 * @returns {Object} PageState object with hasSavedRoutes boolean
 */
export function detectPageState() {
  try {
    const savedRoutes = getSavedRoutes();
    // Handle case where getSavedRoutes() might return undefined or null
    if (!savedRoutes || !Array.isArray(savedRoutes)) {
      return { hasSavedRoutes: false };
    }
    return {
      hasSavedRoutes: savedRoutes.length > 0
    };
  } catch (error) {
    // Default to first-time user experience on any error
    console.error('Error detecting page state:', error);
    return { hasSavedRoutes: false };
  }
}


/**
 * Handle starting buildings update
 * Note: This is only used in wizard context now, not in main page
 * @param {Object} startingBuildings - Starting buildings configuration
 */
function _handleStartingBuildingsUpdate(startingBuildings) {
  currentStartingBuildings = startingBuildings;
  // Route calculation happens in wizard context
}

/**
 * Handle category selection
 * Note: This is only used in wizard context now, not in main page
 * @param {Object} category - Selected category
 */
async function _handleCategorySelect(category) {
  // Category selection now happens in wizard context only
  // This function is kept for backward compatibility but won't be called from main page
  if (isCalculating) return;
  
  if (!category) {
    routeDisplay.displayRoute(null);
    return;
  }

  // Show loading state
  routeDisplay.showLoading(0);
  isCalculating = true;

  try {
    // Get validated starting buildings (from wizard context)
    const startingBuildings = currentStartingBuildings;
    
    // Progress callback to update UI during calculation
    const onProgress = (progress) => {
      routeDisplay.updateLoadingProgress(progress.moves);
    };
    
    // Calculate route with current version and starting buildings
    const route = await calculateRoute(category, startingBuildings, {
      algorithm: 'GPL',
      lookahead: 1,
      onProgress: onProgress
    }, currentVersion);

    // Display route
    await routeDisplay.displayRoute(route);
    // Update category and version for save functionality
    routeDisplay.setCategoryAndVersion(category, currentVersion);
  } catch (error) {
    console.error('Error calculating route:', error);
    routeDisplay.showError(`Failed to calculate route: ${error.message}`);
  } finally {
    isCalculating = false;
  }
}

/**
 * Handle save route button click
 */
function handleSaveRouteClick(route, category, versionId) {
  if (!route || !category) {
    console.error('Cannot save route: route and category are required');
    return;
  }
  saveRouteDialog.show(route, category, versionId || currentVersion);
}

/**
 * Handle route saved successfully
 */
function handleRouteSaved() {
  // Show success message (could be a toast notification)
  // For now, we'll just log it
  console.log('Route saved successfully');
  // Refresh saved routes list to show the new route
  if (savedRoutesList) {
    savedRoutesList.refresh();
  }
}

/**
 * Handle save route dialog cancel
 */
function handleSaveRouteCancel() {
  // Dialog is already hidden, nothing special needed
}

/**
 * Handle saved route selection
 */
async function handleSavedRouteSelect(savedRoute) {
  // Show route section
  const routeSection = document.getElementById('route-section');
  if (routeSection) {
    routeSection.style.display = '';
  }
  
  // Display the saved route
  await routeDisplay.displayRoute(savedRoute, true); // true = isSavedRoute
}

/**
 * Initialize application
 */
/**
 * Handle category saved
 * Note: This is only used in wizard context now, not in main page
 * @param {Object} _category - Saved category (unused, kept for compatibility)
 */
function _handleCategorySaved(_category) {
  // Category creation now happens in wizard context only
  // This function is kept for backward compatibility
}

/**
 * Handle category form cancel
 * Note: This is only used in wizard context now, not in main page
 */
function _handleCategoryFormCancel() {
  // Form is hidden, nothing special needed
}

/**
 * Handle save game imported successfully
 */
async function handleSaveGameImported(importedSaveGame) {
  // Auto-populate starting buildings from imported data
  if (importedSaveGame && importedSaveGame.buildingCounts) {
    // Update current starting buildings (will be used in wizard)
    currentStartingBuildings = importedSaveGame.buildingCounts;
  }

  // Update current version if detected
  if (importedSaveGame && importedSaveGame.version) {
    currentVersion = importedSaveGame.version;
  }

  // Show save game details dialog instead of showing in main page
  saveGameDetailsDialog.show();
}

/**
 * Handle create route from save game (from details dialog)
 */
function handleCreateRouteFromSaveGame() {
  const importedSaveGame = getImportedSaveGame();
  if (!importedSaveGame) {
    console.warn('No imported save game available');
    return;
  }

  // Open wizard at category selection step (step 1) with import data pre-populated
  routeCreationWizard.show({
    step1Data: {
      setupChoice: 'import',
      importedSaveGame: importedSaveGame,
      manualBuildings: null,
      versionId: importedSaveGame.version || null
    }
  }, 1); // Start at step 1 (category selection)
}

/**
 * Handle save game details dialog close
 */
function handleSaveGameDetailsDialogClose() {
  // Dialog was closed, nothing special needed
}

/**
 * Handle route import complete
 * @param {Object} validationResult - Validation result from import
 * @param {string} fileName - Name of imported file or 'pasted-data'
 */
function handleRouteImportComplete(validationResult, fileName) {
  if (validationResult.isValid) {
    showImportPreview({
      routeType: validationResult.routeType,
      parsedData: validationResult.parsedData,
      validationResult: validationResult,
      fileName: fileName
    });
  } else {
    // Errors are already shown in the dialog
    // Keep dialog open so user can fix and retry
  }
}

/**
 * Handle save game cleared
 */
function handleSaveGameCleared() {
  // Clear starting buildings
  currentStartingBuildings = {};
  
  // Hide save game details section
  const saveGameDetailsSection = document.getElementById('save-game-details-section');
  if (saveGameDetailsSection) {
    saveGameDetailsSection.style.display = 'none';
  }
  
  // Refresh details view
  if (saveGameDetailsView) {
    saveGameDetailsView.refresh();
  }
}

/**
 * Update page state after a route is saved
 * Re-evaluates page state and updates UI if state changed from first-time to returning user
 */
async function updatePageStateAfterRouteSave() {
  try {
    // Check current state after route save
    const currentState = detectPageState();
    
    // Always remove welcome section if it exists (route was just created)
    const welcomeSection = document.getElementById('welcome-section');
    if (welcomeSection) {
      welcomeSection.remove();
    }
    
    // If we now have saved routes, ensure returning user UI is shown
    if (currentState.hasSavedRoutes) {
      // Initialize saved routes list if not already initialized
      if (!savedRoutesList) {
        savedRoutesList = new SavedRoutesList('saved-routes-section', handleSavedRouteSelect);
        await savedRoutesList.init();
      }
      
      // Show saved routes section
      const savedRoutesSection = document.getElementById('saved-routes-section');
      if (savedRoutesSection) {
        savedRoutesSection.style.display = '';
      }
      
      // Check if returning user UI is already shown, if not, render it
      const choiceSection = document.getElementById('route-choice-section');
      if (!choiceSection) {
        renderReturningUserUI();
      }
    }
    
    // Show route section since a route was just created
    const routeSection = document.getElementById('route-section');
    if (routeSection) {
      routeSection.style.display = '';
    }
    
    // Refresh saved routes list to show the new route
    if (savedRoutesList) {
      savedRoutesList.refresh();
    }
  } catch (error) {
    console.error('Error updating page state after route save:', error);
    // Continue with current UI state on error
  }
}

/**
 * Handle wizard completion
 * @param {Object} route - Calculated route or route chain result
 * @param {Object} category - Category configuration (null for chains)
 * @param {string} versionId - Game version ID
 */
async function handleWizardComplete(route, category, versionId) {
  console.log('[Main] Wizard completion handler called', { route, category, versionId });
  
  try {
    // Check if this is a route chain (has calculatedRoutes array)
    if (route && Array.isArray(route.calculatedRoutes) && route.calculatedRoutes.length > 0) {
      // Display route chain
      console.log('[Main] Displaying route chain...');
      // Extract route configs from wizard state if available
      const routeConfigs = route.routeConfigs || [];
      await routeChainDisplay.displayRouteChain(route, versionId, routeConfigs);
      console.log('[Main] Route chain displayed');
    } else {
      // Display single route
      // Set category and version on route display for saving
      if (category && versionId) {
        routeDisplay.setCategoryAndVersion(category, versionId);
      }
      
      // Display the calculated route
      console.log('[Main] Displaying route...');
      await routeDisplay.displayRoute(route);
      console.log('[Main] Route displayed');
    
      // Show warning if route couldn't be saved
      if (route.saveError) {
        console.warn('[Main] Route save failed:', route.saveError);
        // Show a user-visible warning (could be enhanced with a toast notification)
        const routeSection = document.getElementById('route-section');
        if (routeSection) {
          const warning = document.createElement('div');
          warning.className = 'save-warning';
          warning.style.cssText = 'background: #fff3cd; border: 1px solid #ffc107; padding: 12px; margin: 10px 0; border-radius: 4px; color: #856404;';
          warning.innerHTML = `
            <strong>Warning:</strong> The route was calculated successfully but could not be saved to localStorage. 
            ${route.saveError.includes('quota') ? 'Please delete old routes to free up space.' : route.saveError}
          `;
          routeSection.insertBefore(warning, routeSection.firstChild);
        }
      }
    }
    
    // Common post-display logic for both chains and single routes
    // Check if a save game was imported during the wizard and make it available
    const importedSaveGame = getImportedSaveGame();
    if (importedSaveGame) {
      // Refresh save game details view to show the imported data
      if (saveGameDetailsView) {
        saveGameDetailsView.refresh();
      }
      
      // Update starting buildings if needed
      if (importedSaveGame.buildingCounts) {
        currentStartingBuildings = importedSaveGame.buildingCounts;
      }
      
      // Update current version if detected
      if (importedSaveGame.version) {
        currentVersion = importedSaveGame.version;
      }
    }
    
    // Update page state after route save (handles first-time to returning user transition)
    console.log('[Main] Updating page state...');
    await updatePageStateAfterRouteSave();
    console.log('[Main] Page state updated');
    
    // Scroll to route section to show the calculated route
    const routeSection = document.getElementById('route-section');
    if (routeSection) {
      console.log('[Main] Scrolling to route section...');
      routeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn('[Main] Route section not found');
    }
    
    console.log('[Main] Route created via wizard:', route);
    if (category) {
      console.log('[Main] Category:', category);
    }
  } catch (error) {
    console.error('[Main] Error in wizard completion handler:', error);
    throw error;
  }
}

/**
 * Handle wizard cancellation
 */
function handleWizardCancel() {
  // Wizard was cancelled, nothing special needed
  console.log('Wizard cancelled');
}

/**
 * Setup settings dropdown functionality
 */
function setupSettingsDropdown() {
  const settingsBtn = document.getElementById('settings-btn');
  const settingsMenu = document.getElementById('settings-menu');
  const clearStorageBtn = document.getElementById('clear-storage-btn');

  if (!settingsBtn || !settingsMenu || !clearStorageBtn) {
    return;
  }

  // Toggle dropdown on button click
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = settingsMenu.getAttribute('aria-hidden') === 'false';
    settingsMenu.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
    settingsBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
      settingsMenu.setAttribute('aria-hidden', 'true');
      settingsBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close dropdown on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsMenu.getAttribute('aria-hidden') === 'false') {
      settingsMenu.setAttribute('aria-hidden', 'true');
      settingsBtn.setAttribute('aria-expanded', 'false');
      settingsBtn.focus();
    }
  });

  // Handle clear storage button
  clearStorageBtn.addEventListener('click', () => {
    handleClearStorage();
    // Close dropdown after action
    settingsMenu.setAttribute('aria-hidden', 'true');
    settingsBtn.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Handle clear all localStorage data
 */
function handleClearStorage() {
  const confirmed = confirm(
    'Are you sure you want to clear all data?\n\n' +
    'This will delete:\n' +
    '• All saved routes\n' +
    '• All calculated routes\n' +
    '• All progress tracking\n' +
    '• All custom categories\n' +
    '• All imported save game data\n\n' +
    'This action cannot be undone!'
  );

  if (!confirmed) {
    return;
  }

  try {
    // Clear all cookieRouter localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cookieRouter:')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log(`[Storage] Cleared ${keysToRemove.length} localStorage item(s)`);

    // Reload the page to reset the application state
    alert('All data has been cleared. The page will reload.');
    window.location.reload();
  } catch (error) {
    console.error('[Storage] Error clearing localStorage:', error);
    alert('Error clearing data: ' + error.message);
  }
}

/**
 * Render first-time user UI (no saved routes)
 */
function renderFirstTimeUserUI() {
  const main = document.querySelector('main');
  if (!main) return;
  
  // Hide sections that don't serve a purpose for first-time users
  const saveGameDetailsSection = document.getElementById('save-game-details-section');
  const savedRoutesSection = document.getElementById('saved-routes-section');
  const routeSection = document.getElementById('route-section');
  
  if (saveGameDetailsSection) {
    saveGameDetailsSection.style.display = 'none';
  }
  if (savedRoutesSection) {
    savedRoutesSection.style.display = 'none';
  }
  if (routeSection) {
    routeSection.style.display = 'none';
  }
  
  // Create welcome message and wizard prompt
  const welcomeSection = document.createElement('div');
  welcomeSection.id = 'welcome-section';
  welcomeSection.className = 'welcome-section';
  welcomeSection.innerHTML = `
    <div class="welcome-content">
      <h2>Welcome to Cookie Clicker Building Order Simulator</h2>
      <p>Create your first route to get started!</p>
      <button type="button" id="start-wizard-btn" class="btn-primary btn-large">
        Create Your First Route
      </button>
    </div>
  `;
  
  // Insert at the beginning of main
  main.insertBefore(welcomeSection, main.firstChild);
  
  // Set up wizard button
  const startWizardBtn = document.getElementById('start-wizard-btn');
  if (startWizardBtn) {
    startWizardBtn.addEventListener('click', () => {
      routeCreationWizard.show();
    });
  }
}

/**
 * Render returning user UI (has saved routes)
 */
function renderReturningUserUI() {
  const main = document.querySelector('main');
  if (!main) return;
  
  // Show sections that are relevant for returning users
  const savedRoutesSection = document.getElementById('saved-routes-section');
  if (savedRoutesSection) {
    savedRoutesSection.style.display = '';
  }
  
  // Hide save game details section (details are now shown in dialog)
  const saveGameDetailsSection = document.getElementById('save-game-details-section');
  if (saveGameDetailsSection) {
    saveGameDetailsSection.style.display = 'none';
  }
  
  // Hide route section if no route is displayed
  const routeSection = document.getElementById('route-section');
  if (routeSection) {
    routeSection.style.display = 'none';
  }
  
  // Create choice section
  const choiceSection = document.createElement('div');
  choiceSection.id = 'route-choice-section';
  choiceSection.className = 'route-choice-section';
  choiceSection.innerHTML = `
    <div class="choice-content">
      <h2>What would you like to do?</h2>
      <div class="choice-buttons">
        <button type="button" id="create-new-route-btn" class="btn-primary">
          Create New Route
        </button>
        <button type="button" id="load-existing-route-btn" class="btn-secondary">
          Load Existing Route
        </button>
      </div>
    </div>
  `;
  
  // Insert at the beginning of main
  main.insertBefore(choiceSection, main.firstChild);
  
  // Set up buttons
  const createNewBtn = document.getElementById('create-new-route-btn');
  if (createNewBtn) {
    createNewBtn.addEventListener('click', () => {
      routeCreationWizard.show();
    });
  }
  
  const loadExistingBtn = document.getElementById('load-existing-route-btn');
  if (loadExistingBtn) {
    loadExistingBtn.addEventListener('click', () => {
      // Scroll to the saved routes section
      const savedRoutesSection = document.getElementById('saved-routes-section');
      if (savedRoutesSection) {
        savedRoutesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

async function init() {
  try {
    // Detect page state
    const pageState = detectPageState();
    
    // Always initialize route display and wizard
    // (RouteDisplay and RouteCreationWizard are always needed)
    
    // Conditionally initialize saved routes list
    if (pageState.hasSavedRoutes) {
      savedRoutesList = new SavedRoutesList('saved-routes-section', handleSavedRouteSelect);
      await savedRoutesList.init();
    }
    
    // Render appropriate UI based on page state
    if (pageState.hasSavedRoutes) {
      renderReturningUserUI();
    } else {
      renderFirstTimeUserUI();
    }
    
    // Set up create route button (in header)
    const createRouteBtn = document.getElementById('create-route-btn');
    if (createRouteBtn) {
      createRouteBtn.addEventListener('click', () => {
        routeCreationWizard.show();
      });
    }

    // Set up import route button
    const importRouteBtn = document.getElementById('import-route-btn');
    if (importRouteBtn) {
      importRouteBtn.addEventListener('click', () => {
        routeImportDialog.show();
      });
    }

    // Set up import save game button
    const importBtn = document.getElementById('import-save-game-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        saveGameImportDialog.show();
      });
    }

    // Set up settings dropdown
    setupSettingsDropdown();

    // Initialize save game details view
    if (saveGameDetailsView) {
      saveGameDetailsView.init();
    }

    // Hide save game details section (details are now shown in dialog)
    const saveGameDetailsSection = document.getElementById('save-game-details-section');
    if (saveGameDetailsSection) {
      saveGameDetailsSection.style.display = 'none';
    }
    
    // Hide route section if no route is displayed (for returning users)
    // The route section will be shown when a route is loaded or created
    if (pageState.hasSavedRoutes) {
      // Use setTimeout to check after RouteDisplay might have rendered its empty state
      setTimeout(() => {
        const routeSection = document.getElementById('route-section');
        if (routeSection) {
          // Check if it only has the empty state message (no actual route content)
          const hasEmptyState = routeSection.querySelector('.empty-state');
          const hasRouteContent = routeSection.querySelector('.route-header') || 
                                  routeSection.querySelector('.route-list');
          if (hasEmptyState && !hasRouteContent) {
            routeSection.style.display = 'none';
          }
        }
      }, 100);
    }
    
    // Make storage debugging functions available globally
    if (typeof window !== 'undefined') {
      window.logStorageInfo = logStorageInfo;
      window.logStorageAnalysis = logStorageAnalysis;
      console.log('💾 Storage debugging available: Use logStorageInfo() or logStorageAnalysis() in console');
      console.log('💾 Enable auto-logging: Set window.DEBUG_STORAGE = true');
    }
    
    console.log('Cookie Clicker Building Order Simulator initialized');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Default to first-time user experience on error
    try {
      renderFirstTimeUserUI();
    } catch (renderError) {
      console.error('Failed to render error fallback UI:', renderError);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

