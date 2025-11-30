/**
 * Unit tests for save game importer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  importSaveGame,
  validateImportedData,
  getImportedSaveGame,
  clearImportedSaveGame,
  getImportState,
  SaveGameValidationError,
  SaveGameVersionError
} from '../../src/js/save-game-importer.js';

// Minimal valid save string for testing
const MINIMAL_SAVE = 'Mi4wNTN8fHx8MjMsMjMsODI5MCwwLCwwLDIzOzI1LDI1LDk0MTI1LDAsLDAsMjU7fA==!END!';

describe('validateImportedData', () => {
  it('should validate valid imported data', () => {
    const importedData = {
      buildingCounts: { Cursor: 23, Grandma: 25 },
      totalCookies: 1000,
      cookiesPerSecond: 10,
      version: 'v2052',
      importedAt: Date.now()
    };
    const result = validateImportedData(importedData, 'v2052');
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should detect invalid building counts', () => {
    const importedData = {
      buildingCounts: { Cursor: -5, Grandma: 'invalid' },
      importedAt: Date.now()
    };
    const result = validateImportedData(importedData, 'v2052');
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('getImportedSaveGame', () => {
  beforeEach(() => {
    clearImportedSaveGame();
  });

  it('should return null when no save is imported', () => {
    expect(getImportedSaveGame()).toBeNull();
  });
});

describe('clearImportedSaveGame', () => {
  it('should clear imported save game', () => {
    clearImportedSaveGame();
    expect(getImportedSaveGame()).toBeNull();
    expect(getImportState().isLoaded).toBe(false);
  });
});

describe('getImportState', () => {
  beforeEach(() => {
    clearImportedSaveGame();
  });

  it('should return initial state when no import', () => {
    const state = getImportState();
    expect(state.isLoaded).toBe(false);
    expect(state.hasErrors).toBe(false);
  });
});

describe('Error Classes', () => {
  it('SaveGameValidationError should have correct properties', () => {
    const error = new SaveGameValidationError('Test', ['error1'], {});
    expect(error.name).toBe('SaveGameValidationError');
    expect(error.validationErrors).toEqual(['error1']);
  });

  it('SaveGameVersionError should have correct properties', () => {
    const error = new SaveGameVersionError('Test', 'v9999', ['v2052']);
    expect(error.name).toBe('SaveGameVersionError');
    expect(error.detectedVersion).toBe('v9999');
  });
});

