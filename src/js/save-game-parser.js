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
 * Matches Python parser logic: unquote first, then remove !END!, then base64 decode
 * @param {string} saveString - Raw save game string
 * @returns {string} Decoded string ready for base64 decoding
 * @throws {SaveGameDecodeError} If URL decoding fails
 */
export function decodeSaveString(saveString) {
  if (!saveString || typeof saveString !== 'string') {
    throw new SaveGameDecodeError('Save string is empty or invalid', saveString, 'url');
  }

  try {
    // Always unquote first (matches Python parser: unquote(save_code))
    let decoded = decodeURIComponent(saveString);

    // Remove "!END!" suffix if present (matches Python: removesuffix("!END!"))
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
 * Extracts building data from section 5 (matches Python parser building_data)
 * @param {string} decodedSave - Decoded save string (after base64 decoding)
 * @param {string} versionId - Game version ID to map buildings to (e.g., "v2052")
 * @returns {Promise<Array<Object>>} Promise resolving to array of building objects with detailed data
 */
export async function extractBuildings(decodedSave, versionId) {
  const sections = parseSections(decodedSave);
  
  // Building data is in section 5 (index 5)
  // Format: "amount_owned,amount_bought,total_cookies,level,minigame_save,muted,highest_amount_owned;..."
  if (sections.length < 6 || !sections[5]) {
    return [];
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
  }
  
  const buildings = [];
  
  // Parse each building entry according to Python parser building_data structure
  // Format: "amount_owned,amount_bought,total_cookies,level,minigame_save,muted,highest_amount_owned"
  entries.forEach((entry, index) => {
    const parts = entry.split(',').map(p => p || null); // Empty strings become null (matches Python: b or None)
    
    const building = {
      index: index,
      name: buildingNames[index] || `Building ${index}`,
      amountOwned: parts[0] ? parseValue(parts[0], parseInt) : undefined,
      amountBought: parts[1] ? parseValue(parts[1], parseInt) : undefined,
      totalCookies: parts[2] ? parseValue(parts[2], parseFloat) : undefined,
      level: parts[3] ? parseValue(parts[3], parseInt) : undefined,
      minigameSave: parts[4] || undefined,
      muted: parts[5] ? parseValue(parts[5], parseInt, (x) => Boolean(x)) : undefined,
      highestAmountOwned: parts[6] ? parseValue(parts[6], parseInt) : undefined
    };
    
    buildings.push(building);
  });

  return buildings;
}

/**
 * Extracts building counts from decoded save string for a specific game version
 * (Backward compatibility wrapper around extractBuildings)
 * @param {string} decodedSave - Decoded save string (after base64 decoding)
 * @param {string} versionId - Game version ID to map buildings to (e.g., "v2052")
 * @returns {Promise<Object>} Promise resolving to object mapping building names to counts: { "Cursor": 23, "Grandma": 25, ... }
 */
export async function extractBuildingCounts(decodedSave, versionId) {
  const buildings = await extractBuildings(decodedSave, versionId);
  const buildingCounts = {};
  
  buildings.forEach(building => {
    if (building.amountOwned !== undefined && building.name) {
      buildingCounts[building.name] = building.amountOwned;
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
 * Helper function to parse values with type conversion (matches Python parser parse_value)
 * @param {string} value - Value to parse
 * @param {...Function} parsers - Parser functions to apply in order
 * @returns {*} Parsed value or undefined if parsing fails
 */
function parseValue(value, ...parsers) {
  if (value === 'NaN' || value === '' || value === null || value === undefined) {
    return undefined;
  }
  try {
    let result = value;
    for (const parser of parsers) {
      if (typeof parser === 'function') {
        result = parser(result);
        if (isNaN(result) && (typeof result === 'number')) {
          return undefined;
        }
      }
    }
    return result;
  } catch (error) {
    return undefined;
  }
}

/**
 * Parses vault data (matches Python vault_parser)
 * @param {string} vaultData - Vault data string
 * @returns {number[]} Array of integers
 */
function parseVault(vaultData) {
  if (!vaultData || vaultData.trim() === '') {
    return [];
  }
  return vaultData.split(',').map(d => parseInt(d.trim(), 10)).filter(d => !isNaN(d));
}

/**
 * Extracts misc game data from section 4 (matches Python parser misc_game_data_data)
 * @param {string} decodedSave - Decoded save string
 * @returns {Object} Object with misc game data fields
 */
export function extractMiscGameData(decodedSave) {
  const sections = parseSections(decodedSave);
  
  const miscData = {};
  
  if (sections.length > 4 && sections[4]) {
    const miscSection = sections[4];
    const parts = miscSection.split(';');
    
    // Map fields according to Python parser misc_game_data_data structure
    const fieldParsers = [
      { name: 'cookies', parser: () => parseValue(parts[0], parseFloat) },
      { name: 'totalCookiesEarned', parser: () => parseValue(parts[1], parseFloat) },
      { name: 'cookieClicks', parser: () => parseValue(parts[2], parseFloat) },
      { name: 'goldenCookieClicks', parser: () => parseValue(parts[3], parseFloat) },
      { name: 'cookiesMadeByClicking', parser: () => parseValue(parts[4], parseFloat) },
      { name: 'goldenCookiesMissed', parser: () => parseValue(parts[5], parseFloat) },
      { name: 'backgroundType', parser: () => parseValue(parts[6], parseInt) },
      { name: 'milkType', parser: () => parseValue(parts[7], parseInt) },
      { name: 'cookiesFromPastRuns', parser: () => parseValue(parts[8], parseFloat) },
      { name: 'elderWrath', parser: () => parseValue(parts[9], parseFloat) },
      { name: 'pledges', parser: () => parseValue(parts[10], parseInt) },
      { name: 'pledgeTimeLeft', parser: () => parseValue(parts[11], parseInt) },
      { name: 'currentlyResearching', parser: () => parseValue(parts[12], parseInt) },
      { name: 'researchTimeLeft', parser: () => parseValue(parts[13], parseInt) },
      { name: 'ascensions', parser: () => parseValue(parts[14], parseInt) },
      { name: 'goldenCookieClicksThisRun', parser: () => parseValue(parts[15], parseInt) },
      { name: 'cookiesSuckedByWrinklers', parser: () => parseValue(parts[16], parseFloat) },
      { name: 'wrinklersPopped', parser: () => parseValue(parts[17], parseInt) },
      { name: 'santaLevel', parser: () => parseValue(parts[18], parseInt) },
      { name: 'reindeerClicked', parser: () => parseValue(parts[19], parseInt) },
      { name: 'seasonTimeLeft', parser: () => parseValue(parts[20], parseInt) },
      { name: 'seasonSwitcherUses', parser: () => parseValue(parts[21], parseInt) },
      { name: 'currentSeason', parser: () => parts[22] || undefined },
      { name: 'amountCookiesInWrinklers', parser: () => parseValue(parts[23], parseFloat) },
      { name: 'numberOfWrinklers', parser: () => parseValue(parts[24], parseInt) },
      { name: 'prestigeLevel', parser: () => parseValue(parts[25], parseFloat) },
      { name: 'heavenlyChips', parser: () => parseValue(parts[26], parseFloat) },
      { name: 'heavenlyChipsSpent', parser: () => parseValue(parts[27], parseFloat) },
      { name: 'heavenlyCookies', parser: () => parseValue(parts[28], parseFloat) },
      { name: 'ascensionMode', parser: () => parseValue(parts[29], parseInt) },
      { name: 'permanentUpgrade0', parser: () => parseValue(parts[30], parseInt) },
      { name: 'permanentUpgrade1', parser: () => parseValue(parts[31], parseInt) },
      { name: 'permanentUpgrade2', parser: () => parseValue(parts[32], parseInt) },
      { name: 'permanentUpgrade3', parser: () => parseValue(parts[33], parseInt) },
      { name: 'permanentUpgrade4', parser: () => parseValue(parts[34], parseInt) },
      { name: 'dragonLevel', parser: () => parseValue(parts[35], parseInt) },
      { name: 'dragonAura0', parser: () => parseValue(parts[36], parseInt) },
      { name: 'dragonAura1', parser: () => parseValue(parts[37], parseInt) },
      { name: 'chimeType', parser: () => parseValue(parts[38], parseInt) },
      { name: 'volume', parser: () => parseValue(parts[39], parseInt) },
      { name: 'numberOfShinyWrinklers', parser: () => parseValue(parts[40], parseFloat) },
      { name: 'amountOfCookiesContainedInShinyWrinklers', parser: () => parseValue(parts[41], parseFloat) },
      { name: 'currentAmountOfSugarLumps', parser: () => parseValue(parts[42], parseFloat) },
      { name: 'totalAmountOfSugarLumps', parser: () => parseValue(parts[43], parseFloat) },
      { name: 'timeWhenCurrentLumpStarted', parser: () => parseValue(parts[44], parseFloat) },
      { name: 'timeWhenLastRefilledMinigameWithLump', parser: () => parseValue(parts[45], parseFloat) },
      { name: 'sugarLumpType', parser: () => parseValue(parts[46], parseInt) },
      { name: 'vault', parser: () => parts[47] ? parseVault(parts[47]) : undefined },
      { name: 'heralds', parser: () => parseValue(parts[48], parseInt) },
      { name: 'goldenCookieFortune', parser: () => parseValue(parts[49], parseFloat) },
      { name: 'cpsFortune', parser: () => parseValue(parts[50], parseFloat) },
      { name: 'highestRawCps', parser: () => parseValue(parts[51], parseFloat) },
      { name: 'musicVolume', parser: () => parseValue(parts[52], parseInt) },
      { name: 'cookiesSent', parser: () => parseValue(parts[53], parseInt) },
      { name: 'cookiesReceived', parser: () => parseValue(parts[54], parseInt) }
    ];
    
    // Extract permanent upgrades and dragon auras into arrays (matches Python parser)
    const permanentUpgrades = [];
    const dragonAuras = [];
    
    for (const field of fieldParsers) {
      if (field.name.startsWith('permanentUpgrade')) {
        const value = field.parser();
        if (value !== undefined) {
          const index = parseInt(field.name.replace('permanentUpgrade', ''), 10);
          permanentUpgrades[index] = value;
        }
      } else if (field.name.startsWith('dragonAura')) {
        const value = field.parser();
        if (value !== undefined) {
          const index = parseInt(field.name.replace('dragonAura', ''), 10);
          dragonAuras[index] = value;
        }
      } else {
        const value = field.parser();
        if (value !== undefined) {
          miscData[field.name] = value;
        }
      }
    }
    
    if (permanentUpgrades.length > 0) {
      miscData.permanentUpgrades = permanentUpgrades.filter(x => x !== undefined);
    }
    if (dragonAuras.length > 0) {
      miscData.dragonAuras = dragonAuras.filter(x => x !== undefined);
    }
  }
  
  return miscData;
}

/**
 * Extracts run details from section 2 (matches Python parser run_detail_data)
 * @param {string} decodedSave - Decoded save string
 * @returns {Object} Object with run details:
 *   {
 *     startDate: number,
 *     legacyStartDate: number,
 *     lastOpenedGameDate: number,
 *     bakeryName: string,
 *     seed: string,
 *     youCustomizer: number[]
 *   }
 */
export function extractRunDetails(decodedSave) {
  const sections = parseSections(decodedSave);
  
  const runDetails = {
    startDate: undefined,
    legacyStartDate: undefined,
    lastOpenedGameDate: undefined,
    bakeryName: undefined,
    seed: undefined,
    youCustomizer: undefined
  };
  
  // Section 2 contains run details
  // Format: "start_date;legacy_start_date;last_opened_game_date;bakery_name;seed;you_customizer"
  if (sections.length > 2 && sections[2]) {
    const runDetailsSection = sections[2];
    const parts = runDetailsSection.split(';');
    
    // Parse according to Python parser run_detail_data structure:
    // start_date (int)
    if (parts[0]) {
      const startDate = parseValue(parts[0], parseInt);
      if (!isNaN(startDate) && startDate > 0) {
        runDetails.startDate = startDate;
      }
    }
    
    // legacy_start_date (int)
    if (parts[1]) {
      const legacyStartDate = parseValue(parts[1], parseInt);
      if (!isNaN(legacyStartDate) && legacyStartDate > 0) {
        runDetails.legacyStartDate = legacyStartDate;
      }
    }
    
    // last_opened_game_date (int)
    if (parts[2]) {
      const lastOpenedGameDate = parseValue(parts[2], parseInt);
      if (!isNaN(lastOpenedGameDate) && lastOpenedGameDate > 0) {
        runDetails.lastOpenedGameDate = lastOpenedGameDate;
      }
    }
    
    // bakery_name (string)
    if (parts[3] && parts[3].trim()) {
      runDetails.bakeryName = parts[3].trim();
    }
    
    // seed (string)
    if (parts[4] && parts[4].trim()) {
      runDetails.seed = parts[4].trim();
    }
    
    // you_customizer (list of ints, comma-separated)
    if (parts[5] && parts[5].trim()) {
      try {
        runDetails.youCustomizer = parts[5].split(',').map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x));
      } catch (error) {
        // If parsing fails, leave as undefined
      }
    }
  }
  
  return runDetails;
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
 * Extracts preferences from bitfield section 3 (matches Python parser preference_names)
 * @param {string} decodedSave - Decoded save string
 * @returns {Object} Object with preference flags as booleans
 */
export function extractPreferences(decodedSave) {
  const sections = parseSections(decodedSave);
  
  const preferences = {};
  
  // Preferences are in section 3 as a bitfield
  if (sections.length > 3 && sections[3]) {
    const preferencesBitfield = Array.from(sections[3]);
    
    const preferenceNames = [
      'particles',
      'numbers',
      'autosave',
      'autoupdate',
      'milk',
      'fancy',
      'warn',
      'cursors',
      'focus',
      'format',
      'notifs',
      'wobbly',
      'monospace',
      'filters',
      'cookiesound',
      'crates',
      'showBackupWarning',
      'extraButtons',
      'askLumps',
      'customGrandmas',
      'timeout',
      'cloudSave',
      'bgMusic',
      'notScary',
      'fullscreen',
      'screenreader',
      'discordPresence'
    ];
    
    preferenceNames.forEach((name, index) => {
      if (index < preferencesBitfield.length) {
        preferences[name] = Boolean(parseInt(preferencesBitfield[index], 10));
      }
    });
  }
  
  return preferences;
}

/**
 * Extracts achievements from bitfield section 7 (matches Python parser - returns boolean array)
 * @param {string} decodedSave - Decoded save string
 * @param {string} versionId - Game version ID
 * @returns {Promise<Array<boolean|Object>>} Promise resolving to array of achievement unlock status (booleans) or achievement objects
 */
export async function extractAchievements(decodedSave, versionId) {
  const sections = parseSections(decodedSave);
  
  // Achievements are in section 7 as a bitfield
  if (sections.length < 8 || !sections[7]) {
    return [];
  }
  
  const achievementsBitfield = Array.from(sections[7]);
  
  // Python parser returns simple boolean array: [bool(int(ach)) for ach in achievements]
  // For backward compatibility, we'll return both formats
  const achievements = achievementsBitfield.map(bit => Boolean(parseInt(bit, 10)));
  
  // Also try to load achievement mapping for detailed info (backward compatibility)
  let getAchievementById;
  try {
    const achievementsModule = await import('./utils/achievements.js');
    getAchievementById = achievementsModule.getAchievementById;
    
    // If mapping available, return detailed objects instead
    const unlockedAchievements = [];
    for (let i = 0; i < achievements.length; i++) {
      if (achievements[i]) {
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
  } catch (error) {
    // Fallback: return boolean array (matches Python parser)
    return achievements;
  }
}

/**
 * Extracts buffs from section 8 (matches Python parser buffs_data)
 * @param {string} decodedSave - Decoded save string
 * @returns {Array<Object>} Array of buff objects
 */
export function extractBuffs(decodedSave) {
  const sections = parseSections(decodedSave);
  
  const buffs = [];
  
  // Buffs are in section 8
  if (sections.length > 8 && sections[8]) {
    const buffsSection = sections[8];
    const buffEntries = buffsSection.split(';').filter(e => e.trim());
    
    // Parse each buff according to Python parser buffs_data structure
    // Format: "id,max_time,time,arg_0,arg_1,arg_2"
    buffEntries.forEach((buffEntry, index) => {
      const parts = buffEntry.split(',');
      
      const buff = {
        id: parts[0] ? parseValue(parts[0], parseInt) : undefined,
        maxTime: parts[1] ? parseValue(parts[1], parseInt) : undefined,
        time: parts[2] ? parseValue(parts[2], parseInt) : undefined,
        arg0: parts[3] ? parseValue(parts[3], parseFloat) : undefined,
        arg1: parts[4] ? parseValue(parts[4], parseFloat) : undefined,
        arg2: parts[5] ? parseValue(parts[5], parseFloat) : undefined
      };
      
      buffs.push(buff);
    });
  }
  
  return buffs;
}

/**
 * Extracts mod data from section 9 (matches Python parser - returns raw string)
 * @param {string} decodedSave - Decoded save string
 * @returns {string} Raw mod data string
 */
export function extractModData(decodedSave) {
  const sections = parseSections(decodedSave);
  
  // Mod data is in section 9 (Python parser returns raw string)
  if (sections.length > 9 && sections[9]) {
    return sections[9];
  }
  
  return '';
}

/**
 * Extracts mods from section 9 (backward compatibility wrapper)
 * @param {string} decodedSave - Decoded save string
 * @returns {string[]} Array of mod names
 */
export function extractMods(decodedSave) {
  const modData = extractModData(decodedSave);
  
  // Format: "META:mod1,mod2,mod3;"
  if (modData.startsWith('META:')) {
    const modsString = modData.substring(5); // Remove "META:" prefix
    const mods = modsString.split(',').map(mod => mod.trim()).filter(mod => mod && !mod.startsWith('*'));
    return mods;
  }
  
  return [];
}

/**
 * Parses a Cookie Clicker save game string and extracts relevant game state data
 * Matches Python parser structure and logic
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
    // Step 1: Decode URL encoding and remove "!END!" suffix (matches Python: unquote then removesuffix)
    const decoded = decodeSaveString(saveString);

    // Step 2: Decode base64 (matches Python: base64.b64decode)
    const base64Decoded = decodeBase64(decoded);

    // Step 3: Parse sections (matches Python: split("|"))
    const sections = parseSections(base64Decoded);

    // Step 4: Extract data (matches Python parser structure)
    const version = sections[0] || undefined;
    const versionId = detectVersion(base64Decoded) || 'v2052';
    
    const runDetails = extractRunDetails(base64Decoded);
    const preferences = extractPreferences(base64Decoded);
    const miscGameData = extractMiscGameData(base64Decoded);
    const buildings = await extractBuildings(base64Decoded, versionId);
    const upgradeData = await extractUpgrades(base64Decoded, versionId);
    const achievements = await extractAchievements(base64Decoded, versionId);
    const buffs = extractBuffs(base64Decoded);
    const modData = extractModData(base64Decoded);

    // Step 5: Calculate timeElapsed from startDate
    // Time elapsed is calculated as the difference between lastOpenedGameDate and startDate
    // These are Unix timestamps in milliseconds, so convert to seconds
    let timeElapsed = undefined;
    if (runDetails.startDate !== undefined && runDetails.lastOpenedGameDate !== undefined) {
      if (runDetails.lastOpenedGameDate >= runDetails.startDate) {
        timeElapsed = (runDetails.lastOpenedGameDate - runDetails.startDate) / 1000; // Convert milliseconds to seconds
      }
    }

    // Step 6: Create ImportedSaveGame object with all extracted data
    // Maintain backward compatibility while adding new fields
    const buildingCounts = {};
    buildings.forEach(building => {
      if (building.amountOwned !== undefined && building.name) {
        buildingCounts[building.name] = building.amountOwned;
      }
    });

    const importedSaveGame = {
      rawSaveString: saveString,
      version: versionId || undefined,
      
      // New structure matching Python parser
      runDetails: runDetails,
      preferences: preferences,
      miscGameData: miscGameData,
      buildings: buildings,
      upgrades: upgradeData.purchased,
      unlockedUpgrades: upgradeData.unlocked,
      achievements: achievements,
      buffs: buffs,
      modData: modData,
      
      // Backward compatibility fields
      buildingCounts: buildingCounts,
      totalCookies: miscGameData.cookies,
      cookiesPerSecond: undefined, // Not stored in save, calculated dynamically
      hardcoreMode: preferences.ascensionMode === 1 || false, // Infer from ascension mode
      playerCps: undefined,
      playerDelay: undefined,
      timeElapsed: timeElapsed,
      cookiesEarned: miscGameData.totalCookiesEarned,
      cookiesBaked: miscGameData.totalCookiesEarned,
      cookiesReset: undefined,
      cookiesForfeited: undefined,
      playerName: runDetails.bakeryName,
      startDate: runDetails.startDate,
      lastDate: runDetails.lastOpenedGameDate,
      currentDate: runDetails.lastOpenedGameDate,
      mods: extractMods(base64Decoded),
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

