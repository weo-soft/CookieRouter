/**
 * Integration tests for save game import workflow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { importSaveGame, getImportedSaveGame, clearImportedSaveGame, getImportState } from '../../src/js/save-game-importer.js';
import { calculateRoute } from '../../src/js/simulation.js';

// Mock category for testing
const mockCategory = {
  id: 'test-category',
  name: 'Test Category',
  isPredefined: false,
  targetCookies: 1000000,
  playerCps: 8,
  playerDelay: 1,
  hardcoreMode: false
};

describe('Save Game Import Workflow', () => {
  beforeEach(() => {
    // Clear any existing imports before each test
    clearImportedSaveGame();
  });

  it('should import save game and make data available', async () => {
    // Minimal valid save string (base64 encoded "2.053|section2|section3|section4|23,23,8290,0,,0,23;25,25,94125,0,,0,25;|section6")
    const saveString = 'Mi4wNTN8c2VjdGlvbjJ8c2VjdGlvbjN8c2VjdGlvbjR8MjMsMjMsODI5MCwwLCwwLDIzOzI1LDI1LDk0MTI1LDAsLDAsMjU7fHNlY3Rpb242!END!';
    
    const imported = await importSaveGame(saveString);
    
    expect(imported).toBeDefined();
    expect(getImportedSaveGame()).toBeDefined();
    expect(getImportState().isLoaded).toBe(true);
  });

  it('should clear imported save game', () => {
    // First import something
    const saveString = 'Mi4wNTN8c2VjdGlvbjJ8c2VjdGlvbjN8c2VjdGlvbjR8MjMsMjMsODI5MCwwLCwwLDIzOzI1LDI1LDk0MTI1LDAsLDAsMjU7fHNlY3Rpb242!END!';
    
    importSaveGame(saveString).then(() => {
      expect(getImportedSaveGame()).toBeDefined();
      
      clearImportedSaveGame();
      
      expect(getImportedSaveGame()).toBeNull();
      expect(getImportState().isLoaded).toBe(false);
    });
  });

  it('should replace previous import with new import', async () => {
    const saveString1 = 'Mi4wNTN8c2VjdGlvbjJ8c2VjdGlvbjN8c2VjdGlvbjR8MjMsMjMsODI5MCwwLCwwLDIzOzI1LDI1LDk0MTI1LDAsLDAsMjU7fHNlY3Rpb242!END!';
    const saveString2 = 'Mi4wNTN8c2VjdGlvbjJ8c2VjdGlvbjN8c2VjdGlvbjR8MzAsMzAsMTAwMDAsMCwsMCwzMDs0MCw0MCwyMDAwMCwwLCwwLDQwO3xzZWN0aW9uNg==!END!';
    
    await importSaveGame(saveString1);
    const firstImport = getImportedSaveGame();
    
    await importSaveGame(saveString2);
    const secondImport = getImportedSaveGame();
    
    expect(secondImport).toBeDefined();
    expect(secondImport).not.toEqual(firstImport);
  });
});

