/**
 * Main application entry point
 * Initializes the Cookie Clicker Building Order Simulator
 */

import { RouteDisplay } from './js/ui/route-display.js';
import { VersionSelector } from './js/ui/version-selector.js';
import { SaveRouteDialog } from './js/ui/save-route-dialog.js';
import { SavedRoutesList } from './js/ui/saved-routes-list.js';
import { SaveGameImportDialog } from './js/ui/save-game-import-dialog.js';
import { SaveGameDetailsView } from './js/ui/save-game-details-view.js';
import { RouteCreationWizard } from './js/ui/route-creation-wizard.js';
import { calculateRoute } from './js/simulation.js';
import { getImportedSaveGame, getImportState } from './js/save-game-importer.js';
import { getSavedRoutes } from './js/storage.js';

// Initialize UI components (conditionally based on page state)
const versionSelector = new VersionSelector('version-selector-header', handleVersionSelect);
// CategorySelector, CustomCategoryForm, and StartingBuildingsSelector are only used in wizard, not in main.js
let savedRoutesList = null; // Will be initialized conditionally based on page state
const saveRouteDialog = new SaveRouteDialog('save-route-dialog-section', handleRouteSaved, handleSaveRouteCancel);
const routeDisplay = new RouteDisplay('route-section', handleSaveRouteClick);
const saveGameImportDialog = new SaveGameImportDialog('save-game-import-dialog-section', handleSaveGameImported, handleSaveGameCleared);
const saveGameDetailsView = new SaveGameDetailsView('save-game-details-section');
const routeCreationWizard = new RouteCreationWizard('route-creation-wizard-section', handleWizardComplete, handleWizardCancel);

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
 * Handle version selection
 */
async function handleVersionSelect(versionId) {
  currentVersion = versionId;
  // Note: startingBuildingsSelector and categorySelector are only in wizard now
  // Version selection still works, but route recalculation happens in wizard context
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
    routeDisplay.displayRoute(route);
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
function handleSavedRouteSelect(savedRoute) {
  // Display the saved route
  routeDisplay.displayRoute(savedRoute, true); // true = isSavedRoute
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

  // Auto-select version if detected
  if (importedSaveGame && importedSaveGame.version) {
    versionSelector.selectVersion(importedSaveGame.version);
    currentVersion = importedSaveGame.version;
  }

  // Refresh details view
  if (saveGameDetailsView) {
    saveGameDetailsView.refresh();
  }

  // Update import status indicator
  updateImportStatusIndicator();
}

/**
 * Handle save game cleared
 */
function handleSaveGameCleared() {
  // Clear starting buildings
  currentStartingBuildings = {};
  
  // Refresh details view
  if (saveGameDetailsView) {
    saveGameDetailsView.refresh();
  }
  
  // Update import status indicator
  updateImportStatusIndicator();
}

/**
 * Update page state after a route is saved
 * Re-evaluates page state and updates UI if state changed from first-time to returning user
 */
async function updatePageStateAfterRouteSave() {
  try {
    const previousState = detectPageState();
    const newState = detectPageState();
    
    // If state changed from first-time (no routes) to returning (has routes)
    if (!previousState.hasSavedRoutes && newState.hasSavedRoutes) {
      // Initialize saved routes list if not already initialized
      if (!savedRoutesList) {
        savedRoutesList = new SavedRoutesList('saved-routes-section', handleSavedRouteSelect);
        await savedRoutesList.init();
      }
      
      // Remove first-time user UI and show returning user UI
      const welcomeSection = document.getElementById('welcome-section');
      if (welcomeSection) {
        welcomeSection.remove();
      }
      
      renderReturningUserUI();
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
 * @param {Object} route - Calculated route
 * @param {Object} category - Category configuration
 * @param {string} versionId - Game version ID
 */
async function handleWizardComplete(route, category, versionId) {
  // Set category and version on route display for saving
  if (category && versionId) {
    routeDisplay.setCategoryAndVersion(category, versionId);
  }
  
  // Display the calculated route
  routeDisplay.displayRoute(route);
  
  // Check if a save game was imported during the wizard and make it available
  const importedSaveGame = getImportedSaveGame();
  if (importedSaveGame) {
    // Refresh save game details view to show the imported data
    if (saveGameDetailsView) {
      saveGameDetailsView.refresh();
    }
    
    // Update import status indicator
    updateImportStatusIndicator();
    
    // Update starting buildings if needed
    if (importedSaveGame.buildingCounts) {
      currentStartingBuildings = importedSaveGame.buildingCounts;
    }
    
    // Auto-select version if detected
    if (importedSaveGame.version) {
      versionSelector.selectVersion(importedSaveGame.version);
      currentVersion = importedSaveGame.version;
    }
  }
  
  // Update page state after route save (handles first-time to returning user transition)
  await updatePageStateAfterRouteSave();
  
  console.log('Route created via wizard:', route);
  if (category) {
    console.log('Category:', category);
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
 * Update import status indicator in header
 */
function updateImportStatusIndicator() {
  const indicatorContainer = document.getElementById('import-status-indicator');
  if (!indicatorContainer) return;

  const importState = getImportState();
  
  if (importState.isLoaded) {
    indicatorContainer.innerHTML = `
      <span class="import-status-badge loaded" title="Save game imported">
        <span class="status-icon">✓</span>
        <span class="status-text">Imported</span>
        ${importState.version ? `<span class="status-version">${importState.version}</span>` : ''}
      </span>
    `;
  } else {
    indicatorContainer.innerHTML = `
      <span class="import-status-badge not-loaded" title="No save game imported">
        <span class="status-icon">○</span>
        <span class="status-text">Not Imported</span>
      </span>
    `;
  }
}

/**
 * Render first-time user UI (no saved routes)
 */
function renderFirstTimeUserUI() {
  const main = document.querySelector('main');
  if (!main) return;
  
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
      // Show saved routes list (it should already be initialized)
      const savedRoutesSection = document.getElementById('saved-routes-section');
      if (savedRoutesSection) {
        savedRoutesSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

async function init() {
  try {
    // Detect page state
    const pageState = detectPageState();
    
    // Always initialize version selector
    await versionSelector.init();
    
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

    // Set up import save game button
    const importBtn = document.getElementById('import-save-game-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        saveGameImportDialog.show();
      });
    }

    // Initialize and update import status indicator
    updateImportStatusIndicator();

    // Initialize save game details view
    if (saveGameDetailsView) {
      saveGameDetailsView.init();
    }

    // Check if there's an imported save game and auto-populate
    const importedSaveGame = getImportedSaveGame();
    if (importedSaveGame) {
      handleSaveGameImported(importedSaveGame);
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

