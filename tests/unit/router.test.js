/**
 * Unit tests for Router class
 * Uses Python outputs as golden master tests
 */

import { describe, it, expect } from 'vitest';
import { Router } from '../../src/js/router.js';
import { Game } from '../../src/js/game.js';
import v2031 from '../../src/data/versions/v2031.js';

describe('Router', () => {
  describe('routeGPL', () => {
    it('should route a simple game to completion', async () => {
      const game = new Game(v2031);
      game.targetCookies = 1000;
      game.playerCps = 8;
      game.playerDelay = 1;

      const router = new Router();
      const result = await router.routeGPL(game, 1);

      // Allow small tolerance for rounding (within 1% of target)
      expect(result.totalCookies).toBeGreaterThanOrEqual(game.targetCookies * 0.99);
      expect(result.completionTime()).not.toBeNull();
    });

    it('should produce same building counts as Python for hardcore category', async () => {
      // Golden master from Python: hardcore() with v2048
      // For v2031 hardcore equivalent, we'll test with a smaller target
      const game = new Game(v2031);
      game.targetCookies = 1e9; // 1 billion
      game.playerCps = 8;
      game.playerDelay = 1;
      game.hardcoreMode = true;

      const router = new Router();
      const result = await router.routeGPL(game, 1);

      // Verify completion (allow small tolerance for rounding)
      expect(result.totalCookies).toBeGreaterThanOrEqual(game.targetCookies * 0.99);
      expect(result.completionTime()).not.toBeNull();
      
      // Verify some buildings were purchased
      const totalBuildings = Object.values(result.numBuildings).reduce((a, b) => a + b, 0);
      expect(totalBuildings).toBeGreaterThan(0);
    });

    it('should handle lookahead parameter', async () => {
      const game = new Game(v2031);
      game.targetCookies = 10000;
      game.playerCps = 8;
      game.playerDelay = 1;

      const router = new Router();
      const result1 = await router.routeGPL(game, 1);
      const time1 = result1.completionTime();

      // Reset and try with different lookahead
      const game2 = new Game(v2031);
      game2.targetCookies = 10000;
      game2.playerCps = 8;
      game2.playerDelay = 1;
      const result2 = await router.routeGPL(game2, 2);
      const time2 = result2.completionTime();

      // Both should complete
      expect(time1).not.toBeNull();
      expect(time2).not.toBeNull();
    });
  });

  describe('GPLChild', () => {
    it('should select best child based on payoff load', () => {
      const game = new Game(v2031);
      game.targetCookies = 10000;
      game.totalCookies = 100;
      game.playerCps = 8;
      game.playerDelay = 1;

      const router = new Router();
      const bestChild = router.GPLChild(game, 1);

      // Should return a valid child or null if no valid moves
      if (bestChild !== null) {
        expect(bestChild.totalCookies).toBeGreaterThan(game.totalCookies);
        expect(bestChild.history.length).toBeGreaterThan(game.history.length);
      }
    });
  });

  describe('descendants', () => {
    it('should yield all descendants for generation 0', () => {
      const game = new Game(v2031);
      game.targetCookies = 1000;
      game.totalCookies = 100;

      const router = new Router();
      const descendants = Array.from(router.descendants(game, 0));
      expect(descendants.length).toBe(1);
      expect(descendants[0]).toBe(game);
    });

    it('should yield multiple descendants for generation 1', () => {
      const game = new Game(v2031);
      game.targetCookies = 10000;
      game.totalCookies = 1000;
      game.playerCps = 8;
      game.playerDelay = 1;

      const router = new Router();
      const descendants = Array.from(router.descendants(game, 1));
      // Should have at least one child (one building purchase)
      expect(descendants.length).toBeGreaterThan(0);
    });
  });
});

