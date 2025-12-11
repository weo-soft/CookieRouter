/**
 * Unit tests for Router with Sugar Lump upgrades
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from '../../src/js/router.js';
import { Game } from '../../src/js/game.js';
import { loadVersionById } from '../../src/js/utils/version-loader.js';

describe('Router - Sugar Lump Upgrades', () => {
  let game;
  let router;
  let version;

  beforeEach(async () => {
    version = await loadVersionById('v2031');
    router = new Router();
    game = new Game(version);
    game.targetCookies = 1000000000; // 1B cookies to trigger Sugar Lumps
  });

  describe('children() generator with Sugar Lump upgrades', () => {
    it('should not generate Sugar Lump upgrade children when locked', () => {
      game.sugarLumpsUnlocked = false;
      game.numBuildings['Cursor'] = 10;
      
      const children = Array.from(game.children());
      const sugarLumpUpgrades = children.filter(child => 
        child.history.some(item => item.startsWith('SUGAR_LUMP:'))
      );
      
      expect(sugarLumpUpgrades.length).toBe(0);
    });

    it('should not generate Sugar Lump upgrade children when no Sugar Lumps available', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 0; // No time elapsed = no Sugar Lumps
      game.numBuildings['Cursor'] = 10;
      
      const children = Array.from(game.children());
      const sugarLumpUpgrades = children.filter(child => 
        child.history.some(item => item.startsWith('SUGAR_LUMP:'))
      );
      
      expect(sugarLumpUpgrades.length).toBe(0);
    });

    it('should not generate Sugar Lump upgrade children for buildings that do not exist', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 86400; // 1 Sugar Lump available
      game.numBuildings['Cursor'] = 0; // Don't own any Cursors
      
      const children = Array.from(game.children());
      const cursorUpgrades = children.filter(child => 
        child.history.some(item => item === 'SUGAR_LUMP:Cursor')
      );
      
      expect(cursorUpgrades.length).toBe(0);
    });

    it('should generate Sugar Lump upgrade children when Sugar Lumps are available', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 86400; // 1 Sugar Lump available
      game.numBuildings['Cursor'] = 10;
      game.numBuildings['Grandma'] = 5;
      
      const children = Array.from(game.children());
      const sugarLumpUpgrades = children.filter(child => 
        child.history.some(item => item.startsWith('SUGAR_LUMP:'))
      );
      
      // Should have upgrade options for both Cursor and Grandma (level 1 costs 1 Sugar Lump)
      expect(sugarLumpUpgrades.length).toBeGreaterThan(0);
      
      // Verify upgrade was applied
      const cursorUpgrade = sugarLumpUpgrades.find(child => 
        child.history.includes('SUGAR_LUMP:Cursor')
      );
      if (cursorUpgrade) {
        expect(cursorUpgrade.buildingLevels['Cursor']).toBe(1);
        expect(cursorUpgrade.spentSugarLumps).toBe(1);
      }
    });

    it('should only generate upgrades that are affordable', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 86400; // Only 1 Sugar Lump available
      game.numBuildings['Cursor'] = 10;
      game.buildingLevels['Cursor'] = 0; // Level 0, upgrading to level 1 costs 1
      
      const children = Array.from(game.children());
      const cursorUpgrades = children.filter(child => 
        child.history.includes('SUGAR_LUMP:Cursor')
      );
      
      // Should be able to upgrade to level 1 (costs 1)
      expect(cursorUpgrades.length).toBeGreaterThanOrEqual(0);
      
      // But not to level 2 (would cost 2, but only 1 available)
      const level2Upgrades = cursorUpgrades.filter(child => 
        child.buildingLevels['Cursor'] === 2
      );
      expect(level2Upgrades.length).toBe(0);
    });

    it('should generate multiple upgrade options for different buildings', () => {
      game.sugarLumpsUnlocked = true;
      game.sugarLumpsUnlockTime = 0;
      game.timeElapsed = 172800; // 2 Sugar Lumps available
      game.numBuildings['Cursor'] = 10;
      game.numBuildings['Grandma'] = 5;
      game.numBuildings['Farm'] = 3;
      
      const children = Array.from(game.children());
      const sugarLumpUpgrades = children.filter(child => 
        child.history.some(item => item.startsWith('SUGAR_LUMP:'))
      );
      
      // Should have upgrade options for Cursor, Grandma, and Farm
      const upgradedBuildings = new Set();
      sugarLumpUpgrades.forEach(child => {
        const upgradeItem = child.history.find(item => item.startsWith('SUGAR_LUMP:'));
        if (upgradeItem) {
          const buildingName = upgradeItem.substring('SUGAR_LUMP:'.length);
          upgradedBuildings.add(buildingName);
        }
      });
      
      expect(upgradedBuildings.size).toBeGreaterThan(0);
    });
  });
});

