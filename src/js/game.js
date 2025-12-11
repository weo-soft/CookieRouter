/**
 * Game class - Simulates Cookie Clicker gameplay
 * Ported from Python game.py
 */

import { getAchievementRequirement, achievementRequirements } from './utils/achievement-requirements.js';
import { createPercentBoost } from './utils/upgrade-effects.js';

export class Upgrade {
  constructor(name, req, price, effects, id = null) {
    this.name = name;
    this.req = req;
    this.price = price;
    this.effects = effects;
    this.id = id; // Cookie Clicker upgrade ID - corresponds to position in Game.UpgradesById array
  }
}

export class Effect {
  constructor(priority, func) {
    this.priority = priority;
    this.func = func;
  }
}

export class Game {
  static PRICE_RATE = 1.15;

  constructor(version, parent = null, versionData = null) {
    if (parent === null) {
      // Version data
      this.buildingNames = [...version.buildingNames];
      this.basePrices = { ...version.basePrices };
      this.baseRates = { ...version.baseRates };
      this.menu = new Set(version.menu);
      // Store raw version data for checking upgrade effect types (e.g., kitten upgrades)
      this.versionData = versionData;
      // Gameplay data
      this.numBuildings = {};
      for (const name of this.buildingNames) {
        this.numBuildings[name] = 0;
      }
      this.effects = {};
      for (const name of this.buildingNames) {
        this.effects[name] = [];
      }
      this.effects['mouse'] = [];
      this.effects['all'] = [];
      this.totalCookies = 0;
      this.cookiesSpent = 0; // Track cookies spent to calculate available cookies
      this.timeElapsed = 0;
      this.playerCps = 0;
      this.playerDelay = 0;
      // Speedrun data
      this.targetCookies = 0;
      this.hardcoreMode = false;
      this.history = [];
      // Achievement goal tracking
      this.targetCps = null;
      this.targetBuilding = null; // { name: string, count: number }
      this.targetUpgradeCount = null;
      this.targetTotalBuildings = null;
      this.targetMinBuildings = null; // minimum count across all building types
      this.targetBuildingLevel = null; // { building: string, level: number }
      this.achievementGoals = []; // Array of achievement IDs being targeted
      // Sugar Lump state tracking
      this.sugarLumpsUnlocked = false;
      this.sugarLumpsUnlockTime = null; // Time when 1B cookies reached
      this.spentSugarLumps = 0;
      this.buildingLevels = {};
      for (const name of this.buildingNames) {
        this.buildingLevels[name] = 0;
      }
      // Track initial achievements from save game (for milk calculation)
      this.initialAchievementCount = 0;
    } else {
      // Version data from parent
      this.buildingNames = [...parent.buildingNames];
      this.basePrices = { ...parent.basePrices };
      this.baseRates = { ...parent.baseRates };
      this.menu = new Set(parent.menu);
      // Copy version data reference from parent (needed for kitten upgrade detection)
      this.versionData = parent.versionData;
      // Also copy initialAchievementCount from parent
      this.initialAchievementCount = parent.initialAchievementCount || 0;
      // Gameplay data
      this.numBuildings = { ...parent.numBuildings };
      this.effects = {};
      for (const name in parent.effects) {
        this.effects[name] = [...parent.effects[name]];
      }
      this.totalCookies = parent.totalCookies;
      this.cookiesSpent = parent.cookiesSpent;
      this.timeElapsed = parent.timeElapsed;
      this.playerCps = parent.playerCps;
      this.playerDelay = parent.playerDelay;
      // Speedrun data
      this.targetCookies = parent.targetCookies;
      this.hardcoreMode = parent.hardcoreMode;
      this.history = [...parent.history];
      // Achievement goal tracking
      this.targetCps = parent.targetCps;
      this.targetBuilding = parent.targetBuilding ? { ...parent.targetBuilding } : null;
      this.targetUpgradeCount = parent.targetUpgradeCount;
      this.targetTotalBuildings = parent.targetTotalBuildings;
      this.targetMinBuildings = parent.targetMinBuildings;
      this.targetBuildingLevel = parent.targetBuildingLevel ? { ...parent.targetBuildingLevel } : null;
      this.achievementGoals = [...parent.achievementGoals];
      // Sugar Lump state tracking
      this.sugarLumpsUnlocked = parent.sugarLumpsUnlocked;
      this.sugarLumpsUnlockTime = parent.sugarLumpsUnlockTime;
      this.spentSugarLumps = parent.spentSugarLumps;
      this.buildingLevels = { ...parent.buildingLevels };
      // initialAchievementCount already copied above at line 85
    }
  }

  // Router required methods

  /**
   * Returns current cookies per second
   */
  rate() {
    return this.buildingOnlyRate() + this.mouseRate();
  }

  /**
   * Returns total cookies produced
   */
  currencyProduced() {
    return this.totalCookies;
  }

  /**
   * Iterate over possible successive game states
   */
  *children() {
    for (const name of this.buildingNames) {
      const child = new Game(null, this);
      if (!child.purchaseBuilding(name)) continue;
      yield child;
    }
    for (const upgrade of this.menu) {
      const child = new Game(null, this);
      if (!child.purchaseUpgrade(upgrade)) continue;
      yield child;
    }
    // Sugar Lump building upgrades
    const availableSugarLumps = this.getAvailableSugarLumps();
    if (availableSugarLumps > 0) {
      for (const buildingName of this.buildingNames) {
        if (this.numBuildings[buildingName] === 0) continue; // Must own building
        
        const currentLevel = this.buildingLevels[buildingName] || 0;
        const nextLevel = currentLevel + 1;
        const cost = nextLevel; // Cost to upgrade TO next level
        
        if (availableSugarLumps >= cost) {
          const child = new Game(null, this);
          if (child.upgradeBuildingWithSugarLump(buildingName)) {
            yield child;
          }
        }
      }
    }
  }

  /**
   * Returns the final time of this game if played out with no further purchases
   */
  completionTime() {
    if (this.totalCookies >= this.targetCookies) {
      return this.timeElapsed;
    }
    if (!this.rate()) return null;
    const remainingCookies = this.targetCookies - this.totalCookies;
    return this.timeElapsed + remainingCookies / this.rate();
  }

  // Query methods

  /**
   * Returns the cookies per second of single building of a given type
   */
  buildingRate(buildingName) {
    let r = this.baseRates[buildingName];
    const buildingEffects = [...this.effects[buildingName]].sort((a, b) => b.priority - a.priority);
    
    // Separate fingersBoost effects from other effects
    // Fingers upgrades multiply each other, so we need to handle them specially
    const fingersEffects = [];
    const otherEffects = [];
    
    for (const effect of buildingEffects) {
      // Check if this is a fingersBoost effect by examining the function
      // FingersBoost effects add (0.1 * multiplier * nonCursorBuildings) to the rate
      // We can identify them by checking if they access numBuildings and exclude Cursor
      // For now, we'll use a simpler approach: check if effect has a special property
      // or we can check the effect's behavior
      if (effect.isFingersBoost) {
        fingersEffects.push(effect);
      } else {
        otherEffects.push(effect);
      }
    }
    
    // Apply non-fingers effects first (multipliers, synergies, etc.)
    for (const effect of otherEffects) {
      r = effect.func(r, this);
    }
    
    // Apply fingers effects multiplicatively
    // Fingers upgrades stack multiplicatively: Thousand (1x), Million (5x), Billion (10x), Trillion+ (20x)
    // So if we have Thousand, Million, and Billion: 0.1 * 1 * 5 * 10 = 5.0 per building
    if (fingersEffects.length > 0) {
      // Calculate total multiplier by multiplying all fingers multipliers
      let totalFingersMultiplier = 1;
      for (const effect of fingersEffects) {
        // Extract multiplier from effect (stored in effect metadata or calculate from effect)
        // The multiplier is stored in the effect's params when created
        // We need to extract it - for now, we'll calculate it from the effect function
        // Actually, a better approach: store multiplier in effect metadata
        const multiplier = effect.fingersMultiplier || 1;
        totalFingersMultiplier *= multiplier;
      }
      
      // Calculate non-cursor buildings
      let nonCursorBuildings = 0;
      for (const name of this.buildingNames) {
        if (name !== 'Cursor') {
          nonCursorBuildings += this.numBuildings[name];
        }
      }
      
      // Apply fingers boost: base 0.1 per building, multiplied by total multiplier
      const fingersBoost = 0.1 * totalFingersMultiplier * nonCursorBuildings;
      r += fingersBoost;
    }
    
    // Apply Sugar Lump level bonus (multiplicative +1% per level)
    const level = this.buildingLevels[buildingName] || 0;
    if (level > 0) {
      const levelMultiplier = 1 + (level * 0.01); // +1% per level
      r = r * levelMultiplier;
    }
    
    return r;
  }

  /**
   * Returns the cookies per second produced by all buildings
   */
  buildingOnlyRate() {
    let r = 0;

    // Add up each building's rate
    for (const name of this.buildingNames) {
      r += this.buildingRate(name) * this.numBuildings[name];
    }

    // Then apply any global effects (like kittens)
    // Sort by priority (higher priority first) for consistent application order
    const globalEffects = [...this.effects['all']].sort((a, b) => b.priority - a.priority);
    for (const effect of globalEffects) {
      r = effect.func(r, this);
    }

    return r;
  }

  /**
   * Returns the cookies per second made by the players clicking
   */
  mouseRate() {
    let r = 1.0;
    const mouseEffects = [...this.effects['mouse']].sort((a, b) => b.priority - a.priority);
    
    // Separate fingersBoost effects from other effects (same as buildingRate)
    const fingersEffects = [];
    const otherEffects = [];
    
    for (const effect of mouseEffects) {
      if (effect.isFingersBoost) {
        fingersEffects.push(effect);
      } else {
        otherEffects.push(effect);
      }
    }
    
    // Apply non-fingers effects first
    for (const effect of otherEffects) {
      r = effect.func(r, this);
    }
    
    // Apply fingers effects multiplicatively
    if (fingersEffects.length > 0) {
      let totalFingersMultiplier = 1;
      for (const effect of fingersEffects) {
        const multiplier = effect.fingersMultiplier || 1;
        totalFingersMultiplier *= multiplier;
      }
      
      // Calculate non-cursor buildings
      let nonCursorBuildings = 0;
      for (const name of this.buildingNames) {
        if (name !== 'Cursor') {
          nonCursorBuildings += this.numBuildings[name];
        }
      }
      
      // Apply fingers boost: base 0.1 per building, multiplied by total multiplier
      const fingersBoost = 0.1 * totalFingersMultiplier * nonCursorBuildings;
      r += fingersBoost;
    }
    
    return r * this.playerCps;
  }

  /**
   * Returns the current price of a single building of a given type
   */
  buildingPrice(buildingName) {
    const numBuilding = this.numBuildings[buildingName];
    const basePrice = this.basePrices[buildingName];
    return Math.ceil(basePrice * Math.pow(Game.PRICE_RATE, numBuilding));
  }

  /**
   * Calculates and returns the number of available Sugar Lumps based on time elapsed.
   * Sugar Lumps are harvested every 24 hours (86400 seconds) after unlock.
   * Formula: Math.floor((timeElapsed - unlockTime) / 86400) - spentSugarLumps
   * @returns {number} Available Sugar Lumps (non-negative integer, clamped to 0)
   */
  getAvailableSugarLumps() {
    if (!this.sugarLumpsUnlocked) return 0;
    const secondsSinceUnlock = this.timeElapsed - this.sugarLumpsUnlockTime;
    const hoursSinceUnlock = secondsSinceUnlock / 3600;
    const harvested = Math.floor(hoursSinceUnlock / 24);
    return Math.max(0, harvested - this.spentSugarLumps);
  }

  /**
   * Checks if Sugar Lumps should be unlocked based on total cookies produced.
   * Sugar Lumps unlock when totalCookies reaches 1 billion (1,000,000,000).
   * Sets sugarLumpsUnlocked to true and records unlockTime when condition is met.
   * Should be called whenever totalCookies changes.
   */
  checkSugarLumpUnlock() {
    if (!this.sugarLumpsUnlocked && this.totalCookies >= 1000000000) {
      this.sugarLumpsUnlocked = true;
      this.sugarLumpsUnlockTime = this.timeElapsed;
    }
  }

  /**
   * Upgrades a building's Sugar Lump level by 1, spending the required Sugar Lumps.
   * Each level provides +1% Building CpS (multiplicative bonus).
   * Cost to upgrade TO level N is N Sugar Lumps (e.g., Level 1 costs 1, Level 2 costs 2, etc.).
   * @param {string} buildingName - Name of building to upgrade
   * @returns {boolean} True if upgrade successful, false if not affordable, building doesn't exist, or Sugar Lumps not unlocked
   */
  upgradeBuildingWithSugarLump(buildingName) {
    if (!this.sugarLumpsUnlocked) return false;
    if (!this.buildingNames.includes(buildingName)) return false;
    if (this.numBuildings[buildingName] === 0) return false;
    
    const currentLevel = this.buildingLevels[buildingName] || 0;
    const nextLevel = currentLevel + 1;
    const cost = nextLevel; // Cost to upgrade TO next level
    
    if (this.getAvailableSugarLumps() >= cost) {
      this.buildingLevels[buildingName] = nextLevel;
      this.spentSugarLumps += cost;
      // Add to history with special prefix to identify Sugar Lump upgrades
      this.history.push(`SUGAR_LUMP:${buildingName}`);
      return true;
    }
    return false;
  }

  /**
   * Checks if this game owns certain amounts of some buildings
   */
  hasSatisfied(req) {
    for (const buildingName in req) {
      if (this.numBuildings[buildingName] < req[buildingName]) {
        return false;
      }
    }
    return true;
  }

  // Gameplay methods

  /**
   * Spends a given amount of cookies. Also updates time and other such.
   * Note: totalCookies represents cookies produced. When we "spend", we're
   * simulating earning enough cookies to make the purchase.
   * If we already have enough cookies available, the purchase happens immediately.
   */
  spend(price) {
    // Calculate available cookies (total produced minus spent)
    const availableCookies = this.totalCookies - this.cookiesSpent;
    
    // Make sure we don't overshoot our target
    // For achievement routes, targetCookies may be 0, so we need to check if we have achievement goals
    const hasAchievementGoals = this.achievementGoals && this.achievementGoals.length > 0;
    const shouldCheckTarget = this.targetCookies > 0 || !hasAchievementGoals;
    
    if (shouldCheckTarget && this.totalCookies + price > this.targetCookies) {
      // If we're close, just advance to target
      if (this.totalCookies < this.targetCookies) {
        const remaining = this.targetCookies - this.totalCookies;
        const timeNeeded = remaining / this.rate();
        this.timeElapsed += timeNeeded;
        this.totalCookies = this.targetCookies;
        this.checkSugarLumpUnlock();
      }
      return false;
    }

    // Check if we already have enough cookies available
    // If so, we can purchase immediately without waiting
    if (availableCookies >= price) {
      // We have enough cookies, so we can buy immediately
      // Just increment cookiesSpent - we're spending from what we already have
      // totalCookies stays the same (total produced doesn't change when spending existing cookies)
      this.cookiesSpent += price;
      // Add a small delay for the purchase action (playerDelay)
      if (this.playerDelay > 0) {
        this.timeElapsed += this.playerDelay;
      }
      return true;
    }

    // We don't have enough cookies, so we need to earn more
    // Calculate how much more we need
    const cookiesNeeded = price - availableCookies;
    // Add only the needed amount to totalCookies (we'll earn the needed amount)
    // This simulates producing enough cookies to make the purchase
    this.totalCookies += cookiesNeeded;
    this.checkSugarLumpUnlock();
    // Increment cookiesSpent by the full price to track the purchase
    this.cookiesSpent += price;

    // How long would it take to save up 'cookiesNeeded' with just buildings?
    let buildingOnlyTime = null;
    if (this.buildingOnlyRate()) {
      buildingOnlyTime = cookiesNeeded / this.buildingOnlyRate();
    }

    // This simulates the loss of cookies during a purchase when you
    // have to take your mouse off the big cookie.
    if (buildingOnlyTime === null || buildingOnlyTime > this.playerDelay) {
      // This is the case for when the player purchase delay is longer than
      // time it would take to save up for the purchase with only buildings.
      // Ergo, the mouse will provide some amount of clicks towards this
      // purchase.
      const sharedMousePrice = cookiesNeeded - this.playerDelay * this.buildingOnlyRate();
      // The amount of time during saving up for which the mouse and the
      // buildings are both contributing
      const mouseActiveTime = sharedMousePrice / this.rate();
      this.timeElapsed += mouseActiveTime + this.playerDelay;
    } else {
      // This is the case when the purchase is saved up for so quickly, that
      // there's no point in even removing the mouse from the store to
      // slide it back over to the big cookie.
      this.timeElapsed += buildingOnlyTime;
    }

    return true;
  }

  /**
   * Purchase a single building of a given type. True if successful.
   */
  purchaseBuilding(buildingName) {
    const price = this.buildingPrice(buildingName);
    if (!this.spend(price)) return false;
    this.numBuildings[buildingName] += 1;
    this.history.push(buildingName);
    return true;
  }

  /**
   * Calculates which achievements are unlocked based on current game state
   * Checks all routeable achievements, not just achievement goals
   * @returns {number[]} Array of unlocked achievement IDs
   */
  calculateUnlockedAchievements() {
    const unlocked = [];
    
    // Check all routeable achievements
    for (const achievementIdStr in achievementRequirements) {
      const achievementId = parseInt(achievementIdStr, 10);
      const requirement = achievementRequirements[achievementIdStr];
      
      // Skip non-routeable achievements
      if (!requirement || requirement.type === 'notRouteable') {
        continue;
      }
      
      // Check if this achievement is met
      let isMet = false;
      switch (requirement.type) {
        case 'buildingCount':
          const current = this.numBuildings[requirement.building] || 0;
          isMet = current >= requirement.count;
          break;
        case 'cps':
          isMet = this.rate() >= requirement.value;
          break;
        case 'totalCookies':
          isMet = this.totalCookies >= requirement.value;
          break;
        case 'upgradeCount':
          // Count upgrades: exclude buildings and Sugar Lump upgrades (SUGAR_LUMP: prefix)
          const upgradeCount = this.history.filter(item => {
            // Exclude buildings
            if (this.buildingNames.includes(item)) return false;
            // Exclude Sugar Lump upgrades (they have SUGAR_LUMP: prefix)
            if (typeof item === 'string' && item.startsWith('SUGAR_LUMP:')) return false;
            return true;
          }).length;
          isMet = upgradeCount >= requirement.count;
          break;
        case 'totalBuildings':
          const total = Object.values(this.numBuildings).reduce((sum, count) => sum + count, 0);
          isMet = total >= requirement.count;
          break;
        case 'minBuildings':
          const buildingCounts = Object.values(this.numBuildings);
          if (buildingCounts.length > 0) {
            const min = Math.min(...buildingCounts);
            isMet = min >= requirement.count;
          }
          break;
        case 'buildingLevel':
          const buildingCount = this.numBuildings[requirement.building] || 0;
          isMet = buildingCount >= 1; // At least have the building
          break;
      }
      
      if (isMet) {
        unlocked.push(achievementId);
      }
    }
    
    return unlocked;
  }

  /**
   * Calculates milk amount from unlocked achievements
   * Each achievement gives 4% milk
   * Includes both:
   * - Initial achievements from save game (stored in initialAchievementCount)
   * - Achievements unlocked during route calculation (calculated dynamically)
   * @returns {number} Milk amount (e.g., 2.28 for 57 achievements = 228%)
   */
  calculateMilkAmount() {
    // If we have initial achievements from save game, use that as the base
    // The current game state might not meet achievement requirements yet,
    // but we still have the achievements from the save game
    if (this.initialAchievementCount && this.initialAchievementCount > 0) {
      // Use initial count as base, and add any new achievements unlocked during route
      const unlockedAchievements = this.calculateUnlockedAchievements();
      // For now, just use the initial count (we can't easily track which are new vs old)
      // This ensures kitten upgrades work correctly with save game data
      return this.initialAchievementCount * 0.04;
    }
    
    // Fallback: calculate from current game state if no initial achievements
    const unlockedAchievements = this.calculateUnlockedAchievements();
    return unlockedAchievements.length * 0.04;
  }

  /**
   * Purchase a given upgrade. True if successful.
   * Handles kitten upgrades dynamically based on current achievement count.
   */
  purchaseUpgrade(upgrade) {
    if (this.hardcoreMode) return false;
    if (!this.hasSatisfied(upgrade.req)) return false;
    if (!this.spend(upgrade.price)) return false;
    
    // Check if this is a kitten upgrade and needs dynamic calculation
    let hasKittenEffect = false;
    let kittenMilkFactor = null;
    let kittenTargets = []; // Track which targets have kitten effects

    if (this.versionData && this.versionData.upgrades) {
      const upgradeDef = this.versionData.upgrades.find(u => u.name === upgrade.name);
      if (upgradeDef && upgradeDef.effects) {
        for (const [target, effectDef] of Object.entries(upgradeDef.effects)) {
          if (effectDef.type === 'kitten' && effectDef.params && effectDef.params.length > 0) {
            hasKittenEffect = true;
            kittenMilkFactor = effectDef.params[0];
            kittenTargets.push(target);
          }
        }
      }
    }
    
    if (hasKittenEffect && kittenMilkFactor !== null) {
      // This is a kitten upgrade - calculate dynamic boost based on current milk amount
      const milkAmount = this.calculateMilkAmount();
      const boostPercent = (kittenMilkFactor * milkAmount) * 100;
      
      // Create dynamic percentBoost effect (priority 0, same as regular percentBoost)
      // Only create if boostPercent > 0 (should always be true if milkAmount > 0)
      if (boostPercent <= 0) {
        return false;
      }
      
      // Use createPercentBoost for consistency with regular percentBoost upgrades
      // This ensures kitten upgrades work exactly like regular percentBoost upgrades
      const dynamicEffect = createPercentBoost(boostPercent);
      
      // Apply dynamic effect to all targets that the upgrade affects
      // If upgrade affects 'all', apply to global effects array (applied once to total building rate)
      if (kittenTargets.includes('all')) {
        // Apply to global effects array - this affects all buildings at once
        this.effects['all'].push(dynamicEffect);
      } else {
        // Apply to specific targets
        for (const target of kittenTargets) {
          if (target === 'mouse') {
            // Mouse upgrades affect Cursor
            if (this.buildingNames.includes('Cursor')) {
              this.effects['Cursor'].push(dynamicEffect);
            }
          } else if (this.effects[target]) {
            this.effects[target].push(dynamicEffect);
          }
        }
      }
      
      // Don't apply upgrade.effects for kitten targets - they contain placeholder effects (0% boost)
      // Only apply effects for non-kitten targets (if any)
      for (const buildingName in upgrade.effects) {
        // Skip targets that have kitten effects (they're already handled above)
        // Check if this buildingName is a kitten target
        const isKittenTarget = kittenTargets.includes(buildingName) || 
                               (buildingName === 'Cursor' && kittenTargets.includes('mouse')) ||
                               (buildingName === 'all' && kittenTargets.includes('all'));
        
        if (!isKittenTarget) {
          // This target doesn't have kitten effects, apply the effect normally
          this.effects[buildingName].push(upgrade.effects[buildingName]);
        }
        // If it's a kitten target, we skip it (already applied dynamic effect above)
        // This prevents the placeholder effect (0% boost) from being applied
      }
    } else {
      // Regular upgrade - apply effects as-is
      for (const buildingName in upgrade.effects) {
        this.effects[buildingName].push(upgrade.effects[buildingName]);
      }
    }
    
    this.history.push(upgrade.name);
    this.menu.delete(upgrade);
    return true;
  }

  /**
   * Checks if all active achievement goals are satisfied.
   * Evaluates each achievement goal individually to properly handle multiple building goals.
   * 
   * @returns {boolean} True if all achievement goals are met, false otherwise
   */
  isAchievementGoalMet() {
    // If no achievement goals, check cookie target only
    if (!this.achievementGoals || this.achievementGoals.length === 0) {
      return this.totalCookies >= this.targetCookies;
    }
    
    // Track if we found any valid requirements to check
    let foundValidRequirement = false;
    
    // Check each achievement goal individually
    // This allows proper handling of multiple building goals
    for (const achievementId of this.achievementGoals) {
      const requirement = getAchievementRequirement(achievementId);
      if (!requirement || requirement.type === 'notRouteable') {
        continue;
      }
      
      foundValidRequirement = true;
      
      // Check each requirement type
      switch (requirement.type) {
        case 'buildingCount':
          const current = this.numBuildings[requirement.building] || 0;
          if (current < requirement.count) {
            return false;
          }
          break;
        case 'cps':
          if (this.rate() < requirement.value) {
            return false;
          }
          break;
        case 'totalCookies':
          if (this.totalCookies < requirement.value) {
            return false;
          }
          break;
        case 'upgradeCount':
          // Count upgrades: exclude buildings and Sugar Lump upgrades (SUGAR_LUMP: prefix)
          const upgradeCount = this.history.filter(item => {
            // Exclude buildings
            if (this.buildingNames.includes(item)) return false;
            // Exclude Sugar Lump upgrades (they have SUGAR_LUMP: prefix)
            if (typeof item === 'string' && item.startsWith('SUGAR_LUMP:')) return false;
            return true;
          }).length;
          if (upgradeCount < requirement.count) {
            return false;
          }
          break;
        case 'totalBuildings':
          const total = Object.values(this.numBuildings).reduce((sum, count) => sum + count, 0);
          if (total < requirement.count) {
            return false;
          }
          break;
        case 'minBuildings':
          const buildingCounts = Object.values(this.numBuildings);
          if (buildingCounts.length === 0) {
            return false;
          }
          const min = Math.min(...buildingCounts);
          if (min < requirement.count) {
            return false;
          }
          break;
        case 'buildingLevel':
          // For building levels, check that building exists (leveling requires manual sugar lumps)
          const buildingCount = this.numBuildings[requirement.building] || 0;
          if (buildingCount < 1) {
            return false;
          }
          // TODO: Add sugar lump simulation for full level support
          break;
      }
    }
    
    // If we have achievement goals but no valid requirements were found, return false
    // (This shouldn't happen in normal flow, but prevents false positives)
    if (!foundValidRequirement) {
      return false;
    }
    
    return true;
  }
}

