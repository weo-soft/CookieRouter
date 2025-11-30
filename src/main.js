/**
 * Main application entry point
 * Initializes the Cookie Clicker Building Order Simulator
 */

import { CategorySelector } from './js/ui/category-selector.js';
import { RouteDisplay } from './js/ui/route-display.js';
import { VersionSelector } from './js/ui/version-selector.js';
import { StartingBuildingsSelector } from './js/ui/starting-buildings.js';
import { CustomCategoryForm } from './js/ui/custom-category-form.js';
import { SaveRouteDialog } from './js/ui/save-route-dialog.js';
import { SavedRoutesList } from './js/ui/saved-routes-list.js';
import { SaveGameImportDialog } from './js/ui/save-game-import-dialog.js';
import { SaveGameDetailsView } from './js/ui/save-game-details-view.js';
import { RouteCreationWizard } from './js/ui/route-creation-wizard.js';
import { calculateRoute } from './js/simulation.js';
import { getImportedSaveGame, getImportState } from './js/save-game-importer.js';

// Initialize UI components
const versionSelector = new VersionSelector('version-selector-header', handleVersionSelect);
const categorySelector = new CategorySelector('category-section', handleCategorySelect);
const customCategoryForm = new CustomCategoryForm('custom-category-section', handleCategorySaved, handleCategoryFormCancel);
const startingBuildingsSelector = new StartingBuildingsSelector('starting-buildings-section', handleStartingBuildingsUpdate);
const saveRouteDialog = new SaveRouteDialog('save-route-dialog-section', handleRouteSaved, handleSaveRouteCancel);
const savedRoutesList = new SavedRoutesList('saved-routes-section', handleSavedRouteSelect);
const routeDisplay = new RouteDisplay('route-section', handleSaveRouteClick);
const saveGameImportDialog = new SaveGameImportDialog('save-game-import-dialog-section', handleSaveGameImported, handleSaveGameCleared);
const saveGameDetailsView = new SaveGameDetailsView('save-game-details-section');
const routeCreationWizard = new RouteCreationWizard('route-creation-wizard-section', handleWizardComplete, handleWizardCancel);

let isCalculating = false;
let currentVersion = 'v2052'; // Default version
let currentStartingBuildings = {};

/**
 * Handle version selection
 */
async function handleVersionSelect(versionId) {
  currentVersion = versionId;
  // Update starting buildings selector with new version
  await startingBuildingsSelector.init(versionId);
  // Recalculate route if a category is selected
  const selectedCategory = categorySelector.getSelectedCategory();
  if (selectedCategory) {
    handleCategorySelect(selectedCategory);
  }
}

/**
 * Handle starting buildings update
 */
function handleStartingBuildingsUpdate(startingBuildings) {
  currentStartingBuildings = startingBuildings;
  // Recalculate route if a category is selected
  const selectedCategory = categorySelector.getSelectedCategory();
  if (selectedCategory) {
    handleCategorySelect(selectedCategory);
  }
}

/**
 * Handle category selection
 */
async function handleCategorySelect(category) {
  if (isCalculating) return;
  
  if (!category) {
    routeDisplay.displayRoute(null);
    return;
  }

  // Show loading state
  routeDisplay.showLoading(0);
  isCalculating = true;

  try {
    // Get validated starting buildings
    const startingBuildings = startingBuildingsSelector.validateBuildings(currentStartingBuildings);
    
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
 */
function handleCategorySaved(category) {
  // Refresh category selector to show new category
  categorySelector.refresh();
  // Optionally select the newly created category
  categorySelector.selectCategory(category.id);
}

/**
 * Handle category form cancel
 */
function handleCategoryFormCancel() {
  // Form is hidden, nothing special needed
}

/**
 * Handle save game imported successfully
 */
async function handleSaveGameImported(importedSaveGame) {
  // Auto-populate starting buildings from imported data
  if (importedSaveGame && importedSaveGame.buildingCounts) {
    startingBuildingsSelector.setStartingBuildings(importedSaveGame.buildingCounts);
    // Update current starting buildings
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

  // Recalculate route if a category is selected
  const selectedCategory = categorySelector.getSelectedCategory();
  if (selectedCategory) {
    handleCategorySelect(selectedCategory);
  }
}

/**
 * Handle save game cleared
 */
function handleSaveGameCleared() {
  // Clear starting buildings
  startingBuildingsSelector.setStartingBuildings({});
  currentStartingBuildings = {};
  
  // Refresh details view
  if (saveGameDetailsView) {
    saveGameDetailsView.refresh();
  }
  
  // Update import status indicator
  updateImportStatusIndicator();
  
  // Recalculate route if a category is selected
  const selectedCategory = categorySelector.getSelectedCategory();
  if (selectedCategory) {
    handleCategorySelect(selectedCategory);
  }
}

/**
 * Handle wizard completion
 * @param {Object} route - Calculated route
 * @param {Object} category - Category configuration
 * @param {string} versionId - Game version ID
 */
function handleWizardComplete(route, category, versionId) {
  // Set category and version on route display for saving
  if (category && versionId) {
    routeDisplay.setCategoryAndVersion(category, versionId);
  }
  
  // Display the calculated route
  routeDisplay.displayRoute(route);
  
  // Refresh saved routes list to show the new route
  if (savedRoutesList) {
    savedRoutesList.refresh();
  }
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

async function init() {
  try {
    await versionSelector.init();
    await startingBuildingsSelector.init(currentVersion);
    await categorySelector.init();
    await savedRoutesList.init();
    
    // Set up create category button callback
    categorySelector.setOnCreateCategory(() => {
      customCategoryForm.show();
    });
    
    // Set up create route button
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
    document.getElementById('category-section').innerHTML = 
      '<p class="error">Failed to load categories. Please refresh the page.</p>';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

