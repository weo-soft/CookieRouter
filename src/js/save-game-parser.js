/**
 * Save Game Parser
 * Parses Cookie Clicker save game format and extracts relevant game state data
 * 
 * Cookie Clicker save format:
 * - Base64 encoded string
 * - Suffixed with "!END!"
 * - Optionally URL-encoded (e.g., '=' replaced with %3D)
 * - Sections separated by "|" character (ASCII 124)
 * - Data entries within sections delimited by ";" character
 * - Bitfields have no separation character between entries
 * 
 * Reference: https://cookieclicker.wiki.gg/wiki/Save
 */

/**
 * Custom error class for save game parsing errors
 */
export class SaveGameParseError extends Error {
  constructor(message, saveString, parseStep) {
    super(message);
    this.name = 'SaveGameParseError';
    this.saveString = saveString;
    this.parseStep = parseStep;
  }
}

/**
 * Custom error class for save game decoding errors
 */
export class SaveGameDecodeError extends Error {
  constructor(message, saveString, decodeType) {
    super(message);
    this.name = 'SaveGameDecodeError';
    this.saveString = saveString;
    this.decodeType = decodeType; // "base64" or "url"
  }
}

/**
 * Decodes a save game string (handles URL encoding and removes "!END!" suffix)
 * @param {string} saveString - Raw save game string
 * @returns {string} Decoded string ready for base64 decoding
 * @throws {SaveGameDecodeError} If URL decoding fails
 */
export function decodeSaveString(saveString) {
  if (!saveString || typeof saveString !== 'string') {
    throw new SaveGameDecodeError('Save string is empty or invalid', saveString, 'url');
  }

  try {
    // Check if URL-encoded (contains %XX patterns)
    let decoded = saveString;
    if (saveString.includes('%')) {
      decoded = decodeURIComponent(saveString);
    }

    // Remove "!END!" suffix if present
    if (decoded.endsWith('!END!')) {
      decoded = decoded.slice(0, -5);
    }

    return decoded;
  } catch (error) {
    throw new SaveGameDecodeError(
      `Failed to decode save string: ${error.message}`,
      saveString,
      'url'
    );
  }
}

/**
 * Decodes base64 string with error handling
 * @param {string} encodedString - Base64 encoded string
 * @returns {string} Decoded string
 * @throws {SaveGameDecodeError} If base64 decoding fails
 */
export function decodeBase64(encodedString) {
  try {
    return atob(encodedString);
  } catch (error) {
    throw new SaveGameDecodeError(
      `Failed to decode base64: ${error.message}`,
      encodedString,
      'base64'
    );
  }
}

/**
 * Parses sections from decoded save string (split by "|" character)
 * @param {string} decodedSave - Decoded save string
 * @returns {string[]} Array of section strings
 */
export function parseSections(decodedSave) {
  if (!decodedSave || typeof decodedSave !== 'string') {
    return [];
  }
  return decodedSave.split('|');
}

/**
 * Extracts building counts from decoded save string for a specific game version
 * @param {string} decodedSave - Decoded save string (after base64 decoding)
 * @param {string} versionId - Game version ID to map buildings to (e.g., "v2052")
 * @returns {Promise<Object>} Promise resolving to object mapping building names to counts: { "Cursor": 23, "Grandma": 25, ... }
 */
export async function extractBuildingCounts(decodedSave, versionId) {
  const sections = parseSections(decodedSave);
  
  // Building counts are typically in section 5 (index 5)
  // Format: "count,count,cookies,0,,0,count;count,count,cookies,0,,0,count;..."
  if (sections.length < 6 || !sections[5]) {
    console.warn('Building section not found in save data');
    return {};
  }

  const buildingSection = sections[5];
  const entries = buildingSection.split(';').filter(e => e.trim());
  
  // Load building names for the version
  let buildingNames = [];
  try {
    const { loadVersionById } = await import('./utils/version-loader.js');
    const version = await loadVersionById(versionId);
    buildingNames = version.buildingNames || [];
  } catch (error) {
    console.warn(`Failed to load version ${versionId} for building mapping:`, error);
    // Fallback: return counts with indices
    const buildingCounts = {};
    entries.forEach((entry, index) => {
      const parts = entry.split(',');
      if (parts.length >= 1) {
        const count = parseInt(parts[0], 10);
        if (!isNaN(count) && count >= 0) {
          buildingCounts[`building_${index}`] = count;
        }
      }
    });
    return buildingCounts;
  }
  
  const buildingCounts = {};
  
  // Parse each building entry and map to building name
  // Format: "count,count,cookies,0,,0,count"
  // First value is the building count
  entries.forEach((entry, index) => {
    const parts = entry.split(',');
    if (parts.length >= 1) {
      const count = parseInt(parts[0], 10);
      if (!isNaN(count) && count >= 0 && index < buildingNames.length) {
        const buildingName = buildingNames[index];
        if (buildingName) {
          buildingCounts[buildingName] = count;
        }
      }
    }
  });

  return buildingCounts;
}

/**
 * Detects Cookie Clicker version from decoded save string
 * @param {string} decodedSave - Decoded save string
 * @returns {string|null} Version ID string (e.g., "v2052", "v2048") if detected, null otherwise
 */
export function detectVersion(decodedSave) {
  const sections = parseSections(decodedSave);
  
  // Version is typically in section 0 as a number like "2.053"
  if (sections.length > 0 && sections[0]) {
    const versionString = sections[0].trim();
    
    // Map version numbers to version IDs
    // Version 2.053 corresponds to v2052
    // Version 2.048 corresponds to v2048
    // Version 2.031 corresponds to v2031
    // Version 1.0466 corresponds to v10466
    const versionMap = {
      '2.053': 'v2052',
      '2.052': 'v2052',
      '2.048': 'v2048',
      '2.031': 'v2031',
      '1.0466': 'v10466'
    };
    
    if (versionMap[versionString]) {
      return versionMap[versionString];
    }
    
    // Try to infer from version number
    if (versionString.startsWith('2.05')) {
      return 'v2052';
    } else if (versionString.startsWith('2.04')) {
      return 'v2048';
    } else if (versionString.startsWith('2.03')) {
      return 'v2031';
    } else if (versionString.startsWith('1.0466')) {
      return 'v10466';
    }
  }
  
  // Could also infer from number of buildings in section 5
  // v2052 has 20 buildings, v2048 has 19, v2031 has 10, v10466 has 8
  if (sections.length > 5 && sections[5]) {
    const buildingEntries = sections[5].split(';').filter(e => e.trim());
    const buildingCount = buildingEntries.length;
    
    if (buildingCount === 20) {
      return 'v2052';
    } else if (buildingCount === 19) {
      return 'v2048';
    } else if (buildingCount === 10) {
      return 'v2031';
    } else if (buildingCount === 8) {
      return 'v10466';
    }
  }
  
  return null;
}

/**
 * Extracts game statistics (cookies, cookies per second, etc.) from decoded save string
 * @param {string} decodedSave - Decoded save string
 * @returns {Object} Object with game statistics:
 *   {
 *     totalCookies: number,
 *     cookiesPerSecond: number,
 *     hardcoreMode: boolean,
 *     playerCps: number,
 *     timeElapsed: number,
 *     playerDelay: number,
 *     cookiesEarned: number,
 *     cookiesBaked: number,
 *     cookiesReset: number,
 *     cookiesForfeited: number
 *   }
 */
export function extractGameStats(decodedSave) {
  const sections = parseSections(decodedSave);
  
  const stats = {
    totalCookies: undefined,
    cookiesPerSecond: undefined,
    hardcoreMode: false,
    playerCps: undefined,
    playerDelay: undefined,
    timeElapsed: undefined,
    cookiesEarned: undefined,
    cookiesBaked: undefined,
    cookiesReset: undefined,
    cookiesForfeited: undefined
  };
  
  // Game stats are typically in section 4
  // Format: "totalCookies;cookiesPerSecond;playerCps;playerDelay;...;timeElapsed;..."
  if (sections.length > 4 && sections[4]) {
    const statsSection = sections[4];
    const parts = statsSection.split(';');
    
    // First value is total cookies
    if (parts[0]) {
      const totalCookies = parseFloat(parts[0]);
      if (!isNaN(totalCookies) && totalCookies >= 0) {
        stats.totalCookies = totalCookies;
      }
    }
    
    // Second value is cookies per second
    if (parts[1]) {
      const cookiesPerSecond = parseFloat(parts[1]);
      if (!isNaN(cookiesPerSecond) && cookiesPerSecond >= 0) {
        stats.cookiesPerSecond = cookiesPerSecond;
      }
    }
    
    // Player CPS is typically around index 2-3
    if (parts[2]) {
      const playerCps = parseFloat(parts[2]);
      if (!isNaN(playerCps) && playerCps >= 0) {
        stats.playerCps = playerCps;
      }
    }
    
    // Player delay
    if (parts[3]) {
      const playerDelay = parseFloat(parts[3]);
      if (!isNaN(playerDelay) && playerDelay >= 0) {
        stats.playerDelay = playerDelay;
      }
    }
    
    // Time elapsed is typically later in the section
    // Look for a reasonable time value (usually > 0)
    for (let i = 3; i < parts.length; i++) {
      const timeElapsed = parseFloat(parts[i]);
      if (!isNaN(timeElapsed) && timeElapsed > 0 && timeElapsed < 100000000) {
        stats.timeElapsed = timeElapsed;
        break;
      }
    }
  }
  
  // Hardcore mode detection - check section 3 bitfield (bit 0 typically indicates hardcore)
  if (sections.length > 3 && sections[3]) {
    const flagsSection = sections[3];
    if (flagsSection.length > 0 && flagsSection[0] === '1') {
      stats.hardcoreMode = true;
    }
  }
  
  return stats;
}

/**
 * Extracts player metadata from section 2
 * @param {string} decodedSave - Decoded save string
 * @returns {Object} Object with player metadata:
 *   {
 *     playerName: string,
 *     startDate: number,
 *     lastDate: number,
 *     currentDate: number
 *   }
 */
export function extractPlayerMetadata(decodedSave) {
  const sections = parseSections(decodedSave);
  
  const metadata = {
    playerName: undefined,
    startDate: undefined,
    lastDate: undefined,
    currentDate: undefined
  };
  
  // Section 2 contains player metadata
  // Format: "startDate;lastDate;currentDate;playerName;seed;flags,..."
  if (sections.length > 2 && sections[2]) {
    const metadataSection = sections[2];
    const parts = metadataSection.split(';');
    
    // First three values are timestamps
    if (parts[0]) {
      const startDate = parseInt(parts[0], 10);
      if (!isNaN(startDate) && startDate > 0) {
        metadata.startDate = startDate;
      }
    }
    
    if (parts[1]) {
      const lastDate = parseInt(parts[1], 10);
      if (!isNaN(lastDate) && lastDate > 0) {
        metadata.lastDate = lastDate;
      }
    }
    
    if (parts[2]) {
      const currentDate = parseInt(parts[2], 10);
      if (!isNaN(currentDate) && currentDate > 0) {
        metadata.currentDate = currentDate;
      }
    }
    
    // Player name is typically at index 3
    if (parts[3] && parts[3].trim()) {
      metadata.playerName = parts[3].trim();
    }
  }
  
  return metadata;
}

/**
 * Extracts upgrades from bitfield section 6
 * 
 * The bitfield structure (per Cookie Clicker wiki):
 * - For each upgrade, there are TWO bits:
 *   - Even bit (0, 2, 4, ...): unlocked status
 *   - Odd bit (1, 3, 5, ...): bought status
 * - Example: bit 0 = upgrade 0 unlocked, bit 1 = upgrade 0 bought
 * 
 * IMPORTANT: The bitfield order MUST match Cookie Clicker's Game.UpgradesById array order.
 * Upgrade ID 0 = bitfield index 0, Upgrade ID 1 = bitfield index 1, etc.
 * The version file's menu Set must have upgrades in the exact same order as Game.UpgradesById.
 * 
 * @param {string} decodedSave - Decoded save string
 * @param {string} versionId - Game version ID
 * @returns {Promise<{purchased: string[], unlocked: string[]}>} Promise resolving to object with purchased and unlocked upgrade arrays
 */
export async function extractUpgrades(decodedSave, versionId) {
  const sections = parseSections(decodedSave);
  
  // Upgrades are in section 6 as a bitfield (unlocked and bought flags)
  if (sections.length < 7 || !sections[6]) {
    return { purchased: [], unlocked: [] };
  }
  
  const upgradesBitfield = sections[6];
  
  // Load upgrade objects from version data, indexed by ID
  let upgradesById = [];
  try {
    const { loadVersionById } = await import('./utils/version-loader.js');
    const version = await loadVersionById(versionId);
    
    // Ensure version.upgradesById is an array of upgrade objects, indexed by their ID
    if (version.upgradesById && Array.isArray(version.upgradesById)) {
      upgradesById = version.upgradesById;
    } else {
      console.error(`[SaveGameParser] version.upgradesById is not correctly defined for ${versionId}.`);
      return { purchased: [], unlocked: [] };
    }
  } catch (error) {
    console.error(`[SaveGameParser] Error loading version data for ${versionId}:`, error);
    return { purchased: [], unlocked: [] };
  }
  
  const purchasedUpgrades = [];
  const unlockedUpgrades = [];
  
  // Parse bitfield: check both even bits (unlocked) and odd bits (bought)
  // The bit index directly corresponds to the upgrade ID.
  // Even bits are 'unlocked', odd bits are 'bought'.
  for (let upgradeId = 0; upgradeId < upgradesById.length; upgradeId++) {
    const upgrade = upgradesById[upgradeId];
    if (!upgrade) {
      // No upgrade with this ID in our data, skip
      continue;
    }
    
    const unlockedBitIndex = upgradeId * 2;
    const boughtBitIndex = upgradeId * 2 + 1;
    
    const unlockedBit = upgradesBitfield[unlockedBitIndex];
    const boughtBit = upgradesBitfield[boughtBitIndex] || '0'; // Default to '0' if bit is missing
    
    // Check unlocked status
    if (unlockedBit === '1') {
      unlockedUpgrades.push(upgrade.name);
    }
    
    // Check bought status
    // An upgrade is considered purchased if both the unlocked and bought bits are set.
    // We trust the save game data directly from Cookie Clicker.
    if (unlockedBit === '1' && boughtBit === '1') {
      purchasedUpgrades.push(upgrade.name);
    }
  }
  
  return { purchased: purchasedUpgrades, unlocked: unlockedUpgrades };
}

/**
 * Extracts achievements from bitfield section 7
 * @param {string} decodedSave - Decoded save string
 * @param {string} versionId - Game version ID
 * @returns {Promise<Array<{id: number, name: string, description: string}>>} Promise resolving to array of unlocked achievement objects
 */
export async function extractAchievements(decodedSave, versionId) {
  const sections = parseSections(decodedSave);
  
  // Achievements are in section 7 as a bitfield
  if (sections.length < 8 || !sections[7]) {
    return [];
  }
  
  const achievementsBitfield = sections[7];
  
  // Load achievement mapping
  let getAchievementById;
  try {
    const achievementsModule = await import('../data/achievements.js');
    getAchievementById = achievementsModule.getAchievementById;
  } catch (error) {
    console.warn('Failed to load achievement mapping:', error);
    // Fallback: return indices if mapping fails
    const unlockedAchievements = [];
    for (let i = 0; i < achievementsBitfield.length; i++) {
      if (achievementsBitfield[i] === '1') {
        unlockedAchievements.push({ id: i, name: `Achievement ${i}`, description: 'Unknown achievement' });
      }
    }
    return unlockedAchievements;
  }
  
  const unlockedAchievements = [];
  
  // Parse bitfield and map to achievement objects
  for (let i = 0; i < achievementsBitfield.length; i++) {
    if (achievementsBitfield[i] === '1') {
      const achievement = getAchievementById(i);
      if (achievement) {
        unlockedAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          type: achievement.type
        });
      } else {
        // Achievement ID not found in mapping - include with fallback name
        unlockedAchievements.push({
          id: i,
          name: `Achievement ${i}`,
          description: 'Unknown achievement (ID not in mapping)',
          category: 'unknown',
          type: 'normal'
        });
      }
    }
  }
  
  return unlockedAchievements;
}

/**
 * Extracts mods from section 9
 * @param {string} decodedSave - Decoded save string
 * @returns {string[]} Array of mod names
 */
export function extractMods(decodedSave) {
  const sections = parseSections(decodedSave);
  
  // Mods are in section 9
  if (sections.length < 10 || !sections[9]) {
    return [];
  }
  
  const modsSection = sections[9];
  
  // Format: "META:mod1,mod2,mod3;"
  if (modsSection.startsWith('META:')) {
    const modsString = modsSection.substring(5); // Remove "META:" prefix
    const mods = modsString.split(',').map(mod => mod.trim()).filter(mod => mod && !mod.startsWith('*'));
    return mods;
  }
  
  return [];
}

/**
 * Parses a Cookie Clicker save game string and extracts relevant game state data
 * @param {string} saveString - Raw save game string (may be URL-encoded, base64-encoded, with "!END!" suffix)
 * @returns {Promise<Object>} Promise resolving to ImportedSaveGame object if parsing succeeds
 * @throws {SaveGameParseError} If save string is empty or invalid format
 * @throws {SaveGameDecodeError} If base64/URL decoding fails
 */
export async function parseSaveGame(saveString) {
  if (!saveString || typeof saveString !== 'string' || saveString.trim().length === 0) {
    throw new SaveGameParseError('Save string is empty or invalid', saveString, 'validation');
  }

  try {
    // Step 1: Decode URL encoding and remove "!END!" suffix
    const decoded = decodeSaveString(saveString);

    // Step 2: Decode base64
    const base64Decoded = decodeBase64(decoded);

    // Step 3: Parse sections
    const sections = parseSections(base64Decoded);

    // Step 4: Extract data
    const version = detectVersion(base64Decoded);
    const versionId = version || 'v2052';
    const buildingCounts = await extractBuildingCounts(base64Decoded, versionId);
    const gameStats = extractGameStats(base64Decoded);
    const playerMetadata = extractPlayerMetadata(base64Decoded);
    const upgradeData = await extractUpgrades(base64Decoded, versionId);
    const achievements = await extractAchievements(base64Decoded, versionId);
    const mods = extractMods(base64Decoded);

    // Step 5: Create ImportedSaveGame object with all extracted data
    const importedSaveGame = {
      rawSaveString: saveString,
      version: version || undefined,
      buildingCounts: buildingCounts,
      upgrades: upgradeData.purchased,
      unlockedUpgrades: upgradeData.unlocked,
      achievements: achievements,
      totalCookies: gameStats.totalCookies,
      cookiesPerSecond: gameStats.cookiesPerSecond,
      hardcoreMode: gameStats.hardcoreMode || false,
      playerCps: gameStats.playerCps,
      playerDelay: gameStats.playerDelay,
      timeElapsed: gameStats.timeElapsed,
      cookiesEarned: gameStats.cookiesEarned,
      cookiesBaked: gameStats.cookiesBaked,
      cookiesReset: gameStats.cookiesReset,
      cookiesForfeited: gameStats.cookiesForfeited,
      playerName: playerMetadata.playerName,
      startDate: playerMetadata.startDate,
      lastDate: playerMetadata.lastDate,
      currentDate: playerMetadata.currentDate,
      mods: mods,
      importedAt: Date.now(),
      parseErrors: []
    };

    return importedSaveGame;
  } catch (error) {
    if (error instanceof SaveGameDecodeError || error instanceof SaveGameParseError) {
      throw error;
    }
    throw new SaveGameParseError(
      `Failed to parse save game: ${error.message}`,
      saveString,
      'parsing'
    );
  }
}

