/**
 * Game class - Simulates Cookie Clicker gameplay
 * Ported from Python game.py
 */

export class Upgrade {
  constructor(name, req, price, effects) {
    this.name = name;
    this.req = req;
    this.price = price;
    this.effects = effects;
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

  constructor(version, parent = null) {
    if (parent === null) {
      // Version data
      this.buildingNames = [...version.buildingNames];
      this.basePrices = { ...version.basePrices };
      this.baseRates = { ...version.baseRates };
      this.menu = new Set(version.menu);
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
      this.timeElapsed = 0;
      this.playerCps = 0;
      this.playerDelay = 0;
      // Speedrun data
      this.targetCookies = 0;
      this.hardcoreMode = false;
      this.history = [];
    } else {
      // Version data from parent
      this.buildingNames = [...parent.buildingNames];
      this.basePrices = { ...parent.basePrices };
      this.baseRates = { ...parent.baseRates };
      this.menu = new Set(parent.menu);
      // Gameplay data
      this.numBuildings = { ...parent.numBuildings };
      this.effects = {};
      for (const name in parent.effects) {
        this.effects[name] = [...parent.effects[name]];
      }
      this.totalCookies = parent.totalCookies;
      this.timeElapsed = parent.timeElapsed;
      this.playerCps = parent.playerCps;
      this.playerDelay = parent.playerDelay;
      // Speedrun data
      this.targetCookies = parent.targetCookies;
      this.hardcoreMode = parent.hardcoreMode;
      this.history = [...parent.history];
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
    for (const effect of buildingEffects) {
      r = effect.func(r, this);
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
    for (const effect of this.effects['all']) {
      r = effect.func(r, this);
    }

    return r;
  }

  /**
   * Returns the cookies per second made by the players clicking
   */
  mouseRate() {
    let r = 1.0;
    for (const effect of this.effects['mouse']) {
      r = effect.func(r, this);
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
   */
  spend(price) {
    // Make sure we don't overshoot our target
    if (this.totalCookies + price > this.targetCookies) {
      // If we're close, just advance to target
      if (this.totalCookies < this.targetCookies) {
        const remaining = this.targetCookies - this.totalCookies;
        const timeNeeded = remaining / this.rate();
        this.timeElapsed += timeNeeded;
        this.totalCookies = this.targetCookies;
      }
      return false;
    }
    this.totalCookies += price;

    // How long would it take to save up 'price' with just buildings?
    let buildingOnlyTime = null;
    if (this.buildingOnlyRate()) {
      buildingOnlyTime = price / this.buildingOnlyRate();
    }

    // This simulates the loss of cookies during a purchase when you
    // have to take your mouse off the big cookie.
    if (buildingOnlyTime === null || buildingOnlyTime > this.playerDelay) {
      // This is the case for when the player purchase delay is longer than
      // time it would take to save up for the purchase with only buildings.
      // Ergo, the mouse will provide some amount of clicks towards this
      // purchase.
      const sharedMousePrice = price - this.playerDelay * this.buildingOnlyRate();
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
   * Purchase a given upgrade. True if successful.
   */
  purchaseUpgrade(upgrade) {
    if (this.hardcoreMode) return false;
    if (!this.hasSatisfied(upgrade.req)) return false;
    if (!this.spend(upgrade.price)) return false;
    for (const buildingName in upgrade.effects) {
      this.effects[buildingName].push(upgrade.effects[buildingName]);
    }
    this.history.push(upgrade.name);
    this.menu.delete(upgrade);
    return true;
  }
}

