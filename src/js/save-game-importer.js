/**
 * Save Game Importer
 * Import workflow and state management for Cookie Clicker save games
 */

import { parseSaveGame, SaveGameParseError, SaveGameDecodeError } from './save-game-parser.js';

/**
 * Custom error class for save game validation errors
 */
export class SaveGameValidationError extends Error {
  constructor(message, validationErrors, importedData) {
    super(message);
    this.name = 'SaveGameValidationError';
    this.validationErrors = validationErrors || [];
    this.importedData = importedData;
  }
}

/**
 * Custom error class for save game version errors
 */
export class SaveGameVersionError extends Error {
  constructor(message, detectedVersion, supportedVersions) {
    super(message);
    this.name = 'SaveGameVersionError';
    this.detectedVersion = detectedVersion;
    this.supportedVersions = supportedVersions || ['v2031', 'v2048', 'v10466', 'v10466_xmas', 'v2052'];
  }
}

// Application state for imported save game
let importedSaveGame = null;
let importState = {
  isLoaded: false,
  importedAt: null,
  version: null,
  hasErrors: false,
  errorMessages: [],
  warningMessages: []
};

/**
 * Validates imported save game data against a game version
 * @param {Object} importedData - Parsed save game data
 * @param {string} versionId - Game version to validate against
 * @returns {Object} ValidationResult object:
 *   {
 *     isValid: boolean,
 *     errors: string[],
 *     warnings: string[],
 *     validatedData: ImportedSaveGame
 *   }
 */
export function validateImportedData(importedData, versionId) {
  const errors = [];
  const warnings = [];
  const validatedData = { ...importedData };

  // Validate building counts
  if (!importedData.buildingCounts || typeof importedData.buildingCounts !== 'object') {
    errors.push('Building counts are missing or invalid');
  } else {
    // Validate each building count is non-negative integer
    for (const [buildingName, count] of Object.entries(importedData.buildingCounts)) {
      if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
        warnings.push(`Invalid building count for ${buildingName}: ${count}`);
        // Set to 0 if invalid
        validatedData.buildingCounts[buildingName] = 0;
      }
    }
  }

  // Validate upgrades array
  if (importedData.upgrades !== undefined) {
    if (!Array.isArray(importedData.upgrades)) {
      warnings.push('Upgrades data is not an array');
      validatedData.upgrades = [];
    } else {
      // Ensure all upgrade names are strings
      validatedData.upgrades = importedData.upgrades.filter(upgrade => typeof upgrade === 'string');
    }
  }

  // Validate unlocked upgrades array
  if (importedData.unlockedUpgrades !== undefined) {
    if (!Array.isArray(importedData.unlockedUpgrades)) {
      warnings.push('Unlocked upgrades data is not an array');
      validatedData.unlockedUpgrades = [];
    } else {
      // Ensure all upgrade names are strings
      validatedData.unlockedUpgrades = importedData.unlockedUpgrades.filter(upgrade => typeof upgrade === 'string');
    }
  }

  // Validate achievements array
  if (importedData.achievements !== undefined) {
    if (!Array.isArray(importedData.achievements)) {
      warnings.push('Achievements data is not an array');
      validatedData.achievements = [];
    }
  }

  // Validate mods array
  if (importedData.mods !== undefined) {
    if (!Array.isArray(importedData.mods)) {
      warnings.push('Mods data is not an array');
      validatedData.mods = [];
    } else {
      validatedData.mods = importedData.mods.filter(mod => typeof mod === 'string');
    }
  }

  // Validate numeric fields
  if (importedData.totalCookies !== undefined && (typeof importedData.totalCookies !== 'number' || importedData.totalCookies < 0)) {
    warnings.push('Invalid total cookies value');
    validatedData.totalCookies = undefined;
  }

  if (importedData.cookiesPerSecond !== undefined && (typeof importedData.cookiesPerSecond !== 'number' || importedData.cookiesPerSecond < 0)) {
    warnings.push('Invalid cookies per second value');
    validatedData.cookiesPerSecond = undefined;
  }

  if (importedData.playerCps !== undefined && (typeof importedData.playerCps !== 'number' || importedData.playerCps < 0)) {
    warnings.push('Invalid player CPS value');
    validatedData.playerCps = undefined;
  }

  if (importedData.timeElapsed !== undefined && (typeof importedData.timeElapsed !== 'number' || importedData.timeElapsed < 0)) {
    warnings.push('Invalid time elapsed value');
    validatedData.timeElapsed = undefined;
  }

  // Validate version
  const supportedVersions = ['v2031', 'v2048', 'v10466', 'v10466_xmas', 'v2052'];
  if (importedData.version && !supportedVersions.includes(importedData.version)) {
    warnings.push(`Unsupported version detected: ${importedData.version}`);
    validatedData.version = undefined;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validatedData
  };
}

/**
 * Complete import workflow: validates, parses, and stores save game data
 * @param {string} saveString - Raw save game string from user
 * @returns {Promise<Object>} Promise resolving to ImportedSaveGame object
 * @throws {SaveGameParseError} If parsing fails
 * @throws {SaveGameValidationError} If validation fails
 * @throws {SaveGameVersionError} If version not supported
 */
export async function importSaveGame(saveString) {
  try {
    // Parse the save game (now async)
    const parsed = await parseSaveGame(saveString);

    // Detect or use default version
    const versionId = parsed.version || 'v2052';

    // Validate the parsed data
    const validation = validateImportedData(parsed, versionId);

    if (!validation.isValid) {
      throw new SaveGameValidationError(
        'Save game data validation failed',
        validation.errors,
        parsed
      );
    }

    // Check version support
    const supportedVersions = ['v2031', 'v2048', 'v10466', 'v10466_xmas', 'v2052'];
    if (parsed.version && !supportedVersions.includes(parsed.version)) {
      throw new SaveGameVersionError(
        `Unsupported version: ${parsed.version}`,
        parsed.version,
        supportedVersions
      );
    }

    // Store imported data
    importedSaveGame = validation.validatedData;
    importState = {
      isLoaded: true,
      importedAt: Date.now(),
      version: parsed.version || null,
      hasErrors: validation.warnings.length > 0,
      errorMessages: [],
      warningMessages: validation.warnings
    };

    // Optionally store in localStorage for resilience
    try {
      localStorage.setItem('cookieRouter:importedSaveGame', JSON.stringify(importedSaveGame));
    } catch (error) {
      // Ignore localStorage errors, memory storage is sufficient
      console.warn('Failed to store imported save game in localStorage:', error);
    }

    return importedSaveGame;
  } catch (error) {
    // Update import state with error
    importState = {
      isLoaded: false,
      importedAt: null,
      version: null,
      hasErrors: true,
      errorMessages: [error.message],
      warningMessages: []
    };

    throw error;
  }
}

/**
 * Retrieves currently imported save game data
 * @returns {Object|null} ImportedSaveGame object if save is loaded, null if no save is currently imported
 */
export function getImportedSaveGame() {
  return importedSaveGame;
}

/**
 * Clears currently imported save game data
 */
export function clearImportedSaveGame() {
  importedSaveGame = null;
  importState = {
    isLoaded: false,
    importedAt: null,
    version: null,
    hasErrors: false,
    errorMessages: [],
    warningMessages: []
  };

  // Remove from localStorage
  try {
    localStorage.removeItem('cookieRouter:importedSaveGame');
  } catch (error) {
    console.warn('Failed to remove imported save game from localStorage:', error);
  }
}

/**
 * Retrieves current import status
 * @returns {Object} SaveGameImportState object with current status
 */
export function getImportState() {
  return { ...importState };
}

