/**
 * Upgrade Effect Calculation Utilities
 * 
 * Contains reusable calculation functions for upgrade effects.
 * These functions create Effect objects that can be applied to buildings or mouse clicks.
 * 
 * All functions maintain the same signatures as the original implementations
 * in version files to ensure backward compatibility.
 */

import { Effect } from '../game.js';

/**
 * Creates a multiplier effect that multiplies the rate by a constant factor
 * @param {number} x - Multiplier value (e.g., 2.0 for doubling)
 * @returns {Effect} Effect object with priority 2 (multiplicative)
 */
export function createMultiplier(x) {
  const func = (r, game) => r * x;
  return new Effect(2, func);
}

/**
 * Creates a grandma boost effect that increases rate based on number of grandmas
 * Formula: rate * (1 + 0.01 * floor(grandmas / n))
 * @param {number} n - Divisor for grandma count calculation
 * @returns {Effect} Effect object with priority 2 (multiplicative)
 */
export function createGrandmaBoost(n) {
  const func = (r, game) => r * (1 + 0.01 * Math.floor(game.numBuildings['Grandma'] / n));
  return new Effect(2, func);
}

/**
 * Creates a fingers boost effect that adds to rate based on total non-cursor buildings
 * Formula: rate + x * sum(all buildings except Cursor)
 * @param {number} x - Additive value per building
 * @returns {Effect} Effect object with priority 1 (additive)
 */
export function createFingersBoost(x) {
  const func = (r, game) => {
    let sum = 0;
    for (const name of game.buildingNames) {
      if (name !== 'Cursor') {
        sum += game.numBuildings[name];
      }
    }
    return r + x * sum;
  };
  return new Effect(1, func);
}

/**
 * Creates a percentage boost effect that increases rate by a percentage
 * Formula: rate * (1 + p / 100.0)
 * @param {number} p - Percentage value (e.g., 50 for 50% boost)
 * @returns {Effect} Effect object with priority 0 (applied last)
 */
export function createPercentBoost(p) {
  const func = (r, game) => r * (1 + p / 100.0);
  return new Effect(0, func);
}

/**
 * Creates a mouse boost effect that adds to rate based on building-only rate
 * Formula: rate + 0.01 * buildingOnlyRate()
 * @returns {Effect} Effect object with priority 1 (additive)
 */
export function createMouseBoost() {
  const func = (r, game) => r + 0.01 * game.buildingOnlyRate();
  return new Effect(1, func);
}

/**
 * Creates a synergy effect that multiplies rate based on another building's count
 * Formula: rate * (1 + multiplier * game.numBuildings[otherBuilding])
 * Used for synergy upgrades like "Accelerated development" and "Peer review"
 * @param {number} multiplier - Multiplier value (e.g., 0.05 for 5% per building)
 * @param {string} otherBuilding - Name of the other building to count
 * @returns {Effect} Effect object with priority 2 (multiplicative)
 */
export function createSynergyEffect(multiplier, otherBuilding) {
  const func = (r, game) => r * (1 + multiplier * game.numBuildings[otherBuilding]);
  return new Effect(2, func);
}

/**
 * Factory function that creates an Effect from an EffectDefinition object
 * This is used by version loaders to convert JSON effect definitions to Effect objects
 * 
 * @param {Object} def - EffectDefinition object with structure:
 *   - type: string - Calculation method name ('multiplier', 'grandmaBoost', etc.)
 *   - params: array<number> - Parameters for the calculation method
 *   - priority: number - Effect priority (0-2)
 * @returns {Effect} Effect object
 * @throws {Error} If effect type is invalid or parameter count is wrong
 */
export function createEffectFromDefinition(def) {
  if (!def || typeof def !== 'object') {
    throw new Error('Effect definition must be an object');
  }

  const { type, params, priority } = def;

  if (!type || typeof type !== 'string') {
    throw new Error('Effect definition must have a valid type string');
  }

  if (!Array.isArray(params)) {
    throw new Error('Effect definition params must be an array');
  }

  // Validate priority
  if (priority !== undefined && (priority < 0 || priority > 2 || !Number.isInteger(priority))) {
    throw new Error('Effect priority must be an integer between 0 and 2');
  }

  // Create effect based on type
  let effect;
  switch (type) {
    case 'multiplier':
      if (params.length !== 1) {
        throw new Error(`multiplier effect requires 1 parameter, got ${params.length}`);
      }
      effect = createMultiplier(params[0]);
      break;

    case 'grandmaBoost':
      if (params.length !== 1) {
        throw new Error(`grandmaBoost effect requires 1 parameter, got ${params.length}`);
      }
      effect = createGrandmaBoost(params[0]);
      break;

    case 'fingersBoost':
      if (params.length !== 1) {
        throw new Error(`fingersBoost effect requires 1 parameter, got ${params.length}`);
      }
      effect = createFingersBoost(params[0]);
      break;

    case 'percentBoost':
      if (params.length !== 1) {
        throw new Error(`percentBoost effect requires 1 parameter, got ${params.length}`);
      }
      effect = createPercentBoost(params[0]);
      break;

    case 'mouseBoost':
      if (params.length !== 0) {
        throw new Error(`mouseBoost effect requires 0 parameters, got ${params.length}`);
      }
      effect = createMouseBoost();
      break;

    case 'synergy':
      if (params.length !== 2) {
        throw new Error(`synergy effect requires 2 parameters [multiplier, otherBuilding], got ${params.length}`);
      }
      effect = createSynergyEffect(params[0], params[1]);
      break;

    default:
      throw new Error(`Unknown effect type: ${type}. Valid types: multiplier, grandmaBoost, fingersBoost, percentBoost, mouseBoost, synergy`);
  }

  // Override priority if specified in definition (allows custom priorities)
  if (priority !== undefined && effect.priority !== priority) {
    // Create new effect with specified priority
    return new Effect(priority, effect.func);
  }

  return effect;
}

