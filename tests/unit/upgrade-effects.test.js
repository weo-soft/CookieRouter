/**
 * Unit tests for upgrade-effects utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  createMultiplier,
  createGrandmaBoost,
  createFingersBoost,
  createPercentBoost,
  createMouseBoost,
  createEffectFromDefinition
} from '../../src/js/utils/upgrade-effects.js';
import { Game } from '../../src/js/game.js';
import v2031 from '../../src/data/versions/v2031.js';

describe('upgrade-effects', () => {
  describe('createMultiplier', () => {
    it('should create a multiplier effect with correct priority', () => {
      const effect = createMultiplier(2.0);
      expect(effect.priority).toBe(2);
      expect(typeof effect.func).toBe('function');
    });

    it('should multiply rate by the multiplier value', () => {
      const effect = createMultiplier(2.5);
      const game = new Game(v2031);
      game.numBuildings['Cursor'] = 10;
      
      const initialRate = 100;
      const result = effect.func(initialRate, game);
      expect(result).toBe(250); // 100 * 2.5
    });

    it('should work with fractional multipliers', () => {
      const effect = createMultiplier(0.5);
      const game = new Game(v2031);
      const result = effect.func(100, game);
      expect(result).toBe(50); // 100 * 0.5
    });
  });

  describe('createGrandmaBoost', () => {
    it('should create a grandma boost effect with correct priority', () => {
      const effect = createGrandmaBoost(1);
      expect(effect.priority).toBe(2);
      expect(typeof effect.func).toBe('function');
    });

    it('should boost rate based on grandma count', () => {
      const effect = createGrandmaBoost(1);
      const game = new Game(v2031);
      game.numBuildings['Grandma'] = 10;
      
      const initialRate = 100;
      const result = effect.func(initialRate, game);
      // Formula: 100 * (1 + 0.01 * floor(10 / 1)) = 100 * 1.1 = 110
      expect(result).toBe(110);
    });

    it('should use floor division for grandma count', () => {
      const effect = createGrandmaBoost(2);
      const game = new Game(v2031);
      game.numBuildings['Grandma'] = 5;
      
      const result = effect.func(100, game);
      // Formula: 100 * (1 + 0.01 * floor(5 / 2)) = 100 * (1 + 0.01 * 2) = 102
      expect(result).toBe(102);
    });
  });

  describe('createFingersBoost', () => {
    it('should create a fingers boost effect with correct priority', () => {
      const effect = createFingersBoost(0.1);
      expect(effect.priority).toBe(1);
      expect(typeof effect.func).toBe('function');
    });

    it('should add to rate based on non-cursor building count', () => {
      const effect = createFingersBoost(0.1);
      const game = new Game(v2031);
      game.numBuildings['Grandma'] = 5;
      game.numBuildings['Farm'] = 3;
      game.numBuildings['Cursor'] = 10; // Should be excluded
      
      const initialRate = 100;
      const result = effect.func(initialRate, game);
      // Formula: 100 + 0.1 * (5 + 3) = 100 + 0.8 = 100.8
      expect(result).toBe(100.8);
    });

    it('should exclude Cursor from building count', () => {
      const effect = createFingersBoost(1.0);
      const game = new Game(v2031);
      game.numBuildings['Cursor'] = 100; // Should not count
      game.numBuildings['Grandma'] = 2;
      
      const result = effect.func(50, game);
      // Formula: 50 + 1.0 * 2 = 52 (Cursor excluded)
      expect(result).toBe(52);
    });
  });

  describe('createPercentBoost', () => {
    it('should create a percent boost effect with correct priority', () => {
      const effect = createPercentBoost(50);
      expect(effect.priority).toBe(0);
      expect(typeof effect.func).toBe('function');
    });

    it('should increase rate by percentage', () => {
      const effect = createPercentBoost(50);
      const game = new Game(v2031);
      
      const initialRate = 100;
      const result = effect.func(initialRate, game);
      // Formula: 100 * (1 + 50 / 100.0) = 100 * 1.5 = 150
      expect(result).toBe(150);
    });

    it('should work with different percentage values', () => {
      const effect = createPercentBoost(25);
      const game = new Game(v2031);
      const result = effect.func(100, game);
      expect(result).toBe(125); // 100 * 1.25
    });
  });

  describe('createMouseBoost', () => {
    it('should create a mouse boost effect with correct priority', () => {
      const effect = createMouseBoost();
      expect(effect.priority).toBe(1);
      expect(typeof effect.func).toBe('function');
    });

    it('should add to rate based on building-only rate', () => {
      const effect = createMouseBoost();
      const game = new Game(v2031);
      game.numBuildings['Cursor'] = 5;
      game.numBuildings['Grandma'] = 3;
      
      // buildingOnlyRate = 5 * 0.1 + 3 * 1 = 0.5 + 3 = 3.5
      // mouseBoost adds: 0.01 * 3.5 = 0.035
      const initialRate = 10;
      const result = effect.func(initialRate, game);
      expect(result).toBeCloseTo(10.035, 5);
    });
  });

  describe('createEffectFromDefinition', () => {
    it('should create multiplier effect from definition', () => {
      const def = { type: 'multiplier', params: [2.0], priority: 2 };
      const effect = createEffectFromDefinition(def);
      
      expect(effect.priority).toBe(2);
      const game = new Game(v2031);
      expect(effect.func(100, game)).toBe(200);
    });

    it('should create grandmaBoost effect from definition', () => {
      const def = { type: 'grandmaBoost', params: [1], priority: 2 };
      const effect = createEffectFromDefinition(def);
      
      const game = new Game(v2031);
      game.numBuildings['Grandma'] = 10;
      expect(effect.func(100, game)).toBe(110);
    });

    it('should create fingersBoost effect from definition', () => {
      const def = { type: 'fingersBoost', params: [0.1], priority: 1 };
      const effect = createEffectFromDefinition(def);
      
      const game = new Game(v2031);
      game.numBuildings['Grandma'] = 5;
      expect(effect.func(100, game)).toBe(100.5);
    });

    it('should create percentBoost effect from definition', () => {
      const def = { type: 'percentBoost', params: [50], priority: 0 };
      const effect = createEffectFromDefinition(def);
      
      const game = new Game(v2031);
      expect(effect.func(100, game)).toBe(150);
    });

    it('should create mouseBoost effect from definition', () => {
      const def = { type: 'mouseBoost', params: [], priority: 1 };
      const effect = createEffectFromDefinition(def);
      
      expect(effect.priority).toBe(1);
      const game = new Game(v2031);
      game.numBuildings['Grandma'] = 1;
      const result = effect.func(10, game);
      expect(result).toBeGreaterThan(10);
    });

    it('should override priority if specified in definition', () => {
      const def = { type: 'multiplier', params: [2.0], priority: 1 };
      const effect = createEffectFromDefinition(def);
      expect(effect.priority).toBe(1); // Overridden from default 2
    });

    it('should throw error for invalid effect type', () => {
      const def = { type: 'invalidType', params: [], priority: 0 };
      expect(() => createEffectFromDefinition(def)).toThrow('Unknown effect type');
    });

    it('should throw error for wrong parameter count', () => {
      const def = { type: 'multiplier', params: [2.0, 3.0], priority: 2 };
      expect(() => createEffectFromDefinition(def)).toThrow('multiplier effect requires 1 parameter');
    });

    it('should throw error for missing type', () => {
      const def = { params: [2.0], priority: 2 };
      expect(() => createEffectFromDefinition(def)).toThrow('Effect definition must have a valid type string');
    });

    it('should throw error for invalid params array', () => {
      const def = { type: 'multiplier', params: 'not-an-array', priority: 2 };
      expect(() => createEffectFromDefinition(def)).toThrow('Effect definition params must be an array');
    });

    it('should throw error for invalid priority', () => {
      const def = { type: 'multiplier', params: [2.0], priority: 5 };
      expect(() => createEffectFromDefinition(def)).toThrow('Effect priority must be an integer between 0 and 2');
    });
  });
});

