/**
 * Predefined speedrun categories
 * Ported from Python categories.py
 */

import { Game } from './game.js';
import v2031 from '../data/versions/v2031.js';
import v2048 from '../data/versions/v2048.js';
import v2052 from '../data/versions/v2052.js';
import v10466 from '../data/versions/v10466.js';
import v10466_xmas from '../data/versions/v10466_xmas.js';

const million = 10**6;
const billion = 10**9;
const trillion = 10**12;

/**
 * The generic speedrun to 1 million cookies baked
 */
export function fledgling(version = v2052, playerCps = 8, playerDelay = 1) {
  const game = new Game(version);
  game.targetCookies = 1 * million;
  game.playerCps = playerCps;
  game.playerDelay = playerDelay;

  // Buy a cursor to unlock the mouse/cursor upgrades. The router is short-sighted.
  for (let i = 0; i < 10; i++) {
    game.purchaseBuilding('Cursor');
  }

  return game;
}

/**
 * Bake 1 million cookies while only clicking the big cookie by hand 15 times
 */
export function neverclick(version = v2052, playerCps = 0, playerDelay = 0) {
  const game = new Game(version);
  game.targetCookies = 1 * million;
  game.playerCps = playerCps;
  game.playerDelay = playerDelay;

  // Simulate a single cursor purchase
  game.numBuildings['Cursor'] = 1;
  game.totalCookies = 15;
  game.timeElapsed = 1.2;

  return game;
}

/**
 * Bake 1 billion cookies with no upgrades
 */
export function hardcore(version = v2052, playerCps = 8, playerDelay = 1) {
  const game = new Game(version);
  game.targetCookies = 1 * billion;
  game.playerCps = playerCps;
  game.playerDelay = playerDelay;
  game.hardcoreMode = true;
  return game;
}

/**
 * A short speedrun for testing purposes
 */
export function short(version = v2052, playerCps = 8, playerDelay = 1) {
  const game = new Game(version);
  game.targetCookies = 1000;
  game.playerCps = playerCps;
  game.playerDelay = playerDelay;
  return game;
}

/**
 * To 40 achievements. We just aim for a large amount of cookies
 * and assume that will be enough to get 40.
 */
export function forty(version = v10466, playerCps = 8, playerDelay = 1) {
  const game = new Game(version);
  game.targetCookies = 30 * million;
  game.playerCps = playerCps;
  game.playerDelay = playerDelay;

  // Buy a cursor to unlock the mouse/cursor upgrades. The router is short-sighted.
  game.purchaseBuilding('Cursor');

  return game;
}

/**
 * The 40 achievement run but in holiday mode. Christmas is fastest.
 */
export function fortyHoliday(version = v10466_xmas, playerCps = 8, playerDelay = 1) {
  const game = new Game(version);
  game.targetCookies = 4 * million;
  game.playerCps = playerCps;
  game.playerDelay = playerDelay;

  // We buy a few santa upgrades before doing anything else to ensure we get at
  // least 2 or 3 good upgrades. The time loss is worth the good rng.
  game.totalCookies = 60;
  game.timeElapsed = 15;

  // Buy a cursor to unlock the mouse/cursor upgrades. The router is short-sighted.
  game.purchaseBuilding('Cursor');

  return game;
}

/**
 * Route to the first optimal ascension for long-term playthrough.
 */
export function longhaul(version = v2052, playerCps = 8, playerDelay = 1) {
  const game = new Game(version);
  const septillion = 10**24;
  game.targetCookies = 1000 * septillion;
  game.playerCps = playerCps;
  game.playerDelay = playerDelay;
  game.purchaseBuilding('Cursor');
  return game;
}

/**
 * Nevercore category
 */
export function nevercore(version = v2052, playerCps = 0.0001, playerDelay = 0) {
  const game = new Game(version);
  game.targetCookies = 1000000;
  game.playerCps = playerCps;
  game.playerDelay = playerDelay;
  game.numBuildings['Cursor'] = 1;
  game.hardcoreMode = true;
  return game;
}

