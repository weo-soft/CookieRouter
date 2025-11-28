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
import { calculateRoute } from './js/simulation.js';

// Initialize UI components
const versionSelector = new VersionSelector('version-selector-header', handleVersionSelect);
const categorySelector = new CategorySelector('category-section', handleCategorySelect);
const customCategoryForm = new CustomCategoryForm('custom-category-section', handleCategorySaved, handleCategoryFormCancel);
const startingBuildingsSelector = new StartingBuildingsSelector('starting-buildings-section', handleStartingBuildingsUpdate);
const saveRouteDialog = new SaveRouteDialog('save-route-dialog-section', handleRouteSaved, handleSaveRouteCancel);
const savedRoutesList = new SavedRoutesList('saved-routes-section', handleSavedRouteSelect);
const routeDisplay = new RouteDisplay('route-section', handleSaveRouteClick);

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

