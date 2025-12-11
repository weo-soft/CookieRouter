/**
 * Router class - Contains routing algorithms for finding optimal building purchase orders
 * Ported from Python router.py
 */

import { Game } from './game.js';

export class Router {
  /**
   * Brute-forces the optimal playthrough of 'game' with depth-first-search.
   * Currently a placeholder implementation.
   */
  routeDFS(game) {
    return game;
  }

  /**
   * Finds a decent playthrough of 'game' by minimizing payoff load locally.
   * Now async to allow UI updates during calculation.
   */
  async routeGPL(game, lookahead = 1, onProgress = null) {
    const startTime = performance.now();
    let numMoves = 0;
    const initialTarget = game.targetCookies;
    const initialCookies = game.totalCookies;
    
    // Start logging removed for less verbose output
    
    // Helper function to yield control to browser
    const yieldToBrowser = () => {
      return new Promise(resolve => setTimeout(resolve, 0));
    };
    
    while (true) {
      // Check if target is already reached (cookie target OR achievement goals)
      // Achievement goals take precedence if present
      if (game.achievementGoals && game.achievementGoals.length > 0) {
        const isMet = game.isAchievementGoalMet();
        if (isMet) {
          console.log(`[Router] Achievement goals met at start:`, {
            achievementGoals: game.achievementGoals,
            targetCps: game.targetCps,
            targetBuilding: game.targetBuilding,
            targetCookies: game.targetCookies,
            numBuildings: game.numBuildings,
            rate: game.rate(),
            totalCookies: game.totalCookies
          });
          break;
        }
      } else if (game.totalCookies >= game.targetCookies) {
        break;
      }
      
      const childStartTime = performance.now();
      const child = this.GPLChild(game, lookahead);
      const childTime = performance.now() - childStartTime;
      
      if (child === null) {
        console.log(`[Router] GPLChild returned null. Checking if we can continue...`, {
          rate: game.rate(),
          targetCookies: game.targetCookies,
          totalCookies: game.totalCookies,
          achievementGoals: game.achievementGoals,
          isGoalMet: game.isAchievementGoalMet(),
          targetBuilding: game.targetBuilding
        });
        
        // No valid moves found, but check if we can still reach target
        if (game.rate() > 0) {
          // If we have a cookie target, continue until target is reached naturally
          if (game.targetCookies > 0) {
            const remaining = game.targetCookies - game.totalCookies;
            const timeNeeded = remaining / game.rate();
            game.timeElapsed += timeNeeded;
            game.totalCookies = game.targetCookies;
          }
          // If achievement goals are met, we're done
          if (game.isAchievementGoalMet()) {
            console.log(`[Router] Achievement goals met, breaking`);
            break;
          }
          
          // For achievement routes, if we can't make a purchase yet but have a rate,
          // simulate waiting until we can afford the cheapest building we need
          if (game.achievementGoals && game.achievementGoals.length > 0 && !game.isAchievementGoalMet()) {
            console.log(`[Router] Achievement goals not met, trying to find cheapest building...`);
            
            // Find the cheapest building we need for achievement goals
            let cheapestPrice = null;
            let cheapestBuilding = null;
            
            // Check building-related achievement goals
            if (game.targetBuilding) {
              const price = game.buildingPrice(game.targetBuilding.name);
              console.log(`[Router] Target building ${game.targetBuilding.name} costs ${price}, have ${game.totalCookies}`);
              if (cheapestPrice === null || price < cheapestPrice) {
                cheapestPrice = price;
                cheapestBuilding = game.targetBuilding.name;
              }
            }
            
            // Also check all buildings in case we need any building
            if (cheapestPrice === null) {
              for (const buildingName of game.buildingNames) {
                const price = game.buildingPrice(buildingName);
                if (cheapestPrice === null || price < cheapestPrice) {
                  cheapestPrice = price;
                  cheapestBuilding = buildingName;
                }
              }
            }
            
            console.log(`[Router] Cheapest building: ${cheapestBuilding}, price: ${cheapestPrice}, have: ${game.totalCookies}`);
            
            // If we found a building, try to purchase it (either we have enough cookies or we'll wait)
            if (cheapestBuilding && game.rate() > 0) {
              // If we don't have enough cookies yet, simulate waiting
              if (cheapestPrice > game.totalCookies) {
                const cookiesNeeded = cheapestPrice - game.totalCookies;
                const timeNeeded = cookiesNeeded / game.rate();
                console.log(`[Router] Simulating wait: need ${cookiesNeeded} cookies, will take ${timeNeeded}s`);
                game.timeElapsed += timeNeeded;
                game.totalCookies = cheapestPrice;
              }
              
              // Now try to purchase the building
              const purchaseChild = new Game(null, game);
              if (purchaseChild.purchaseBuilding(cheapestBuilding)) {
                console.log(`[Router] Successfully purchased ${cheapestBuilding}, continuing...`);
                game = purchaseChild;
                numMoves += 1;
                continue; // Continue the loop with the new game state
              } else {
                console.log(`[Router] Failed to purchase ${cheapestBuilding}`, {
                  totalCookies: game.totalCookies,
                  price: cheapestPrice,
                  canAfford: game.totalCookies >= cheapestPrice
                });
              }
            } else {
              console.log(`[Router] Cannot purchase building:`, {
                cheapestBuilding,
                cheapestPrice,
                totalCookies: game.totalCookies,
                rate: game.rate()
              });
            }
          }
        } else {
          console.log(`[Router] Rate is 0, cannot continue`);
        }
        console.log(`[Router] Breaking - no valid moves and cannot continue`);
        break;
      }
      
      game = child;
      numMoves += 1;
      
      // Progress logging
      const progress = (game.totalCookies - initialCookies) / (initialTarget - initialCookies);
      const elapsedTime = performance.now() - startTime;
      
      // Call progress callback if provided (every 5 moves for better feedback, or on first few moves)
      if (onProgress && (numMoves % 5 === 0 || numMoves <= 3)) {
        try {
          onProgress({
            moves: numMoves,
            progress: progress,
            cookies: game.totalCookies,
            targetCookies: game.targetCookies,
            rate: game.rate(),
            timeElapsed: game.timeElapsed
          });
          // Yield to browser after progress update to allow UI to repaint
          await yieldToBrowser();
        } catch (error) {
          console.error('[Router] Error in progress callback:', error);
        }
      }
      
      // Progress logging removed - only log on completion
      
      // Yield to browser every 20 moves to prevent complete blocking
      if (numMoves % 20 === 0) {
        await yieldToBrowser();
      }
    }
    
    const totalTime = performance.now() - startTime;
    console.log(`[Router] Complete: ${numMoves} moves in ${(totalTime / 1000).toFixed(2)}s`);
    
    return game;
  }

  /**
   * Returns the child of 'game' with the lowest payoff load.
   * (an easy heuristic giving locally optimal routing in simple cases)
   */
  GPLChild(game, generation = 1) {
    const gameRate = game.rate(); // Calculate this once to save computer power
    let bestChild = null;
    let bestPl = null;
    let bestPrice = null;
    
    let childCount = 0;
    let validChildCount = 0;
    let descendantCount = 0;

    // First, check for Sugar Lump upgrades - these should be prioritized as they're instant and always beneficial
    let sugarLumpUpgrade = null;
    for (const child of game.children()) {
      // Check if this is a Sugar Lump upgrade (history ends with SUGAR_LUMP:...)
      const lastHistoryItem = child.history[child.history.length - 1];
      if (lastHistoryItem && typeof lastHistoryItem === 'string' && lastHistoryItem.startsWith('SUGAR_LUMP:')) {
        // Sugar Lump upgrade - instant, no time cost, always improves CpS
        const rateChange = child.rate() - gameRate;
        if (rateChange > 0) {
          // Sugar Lump upgrades are instant (timeChange = 0), so payoffLoad = 0
          // This makes them very attractive - prioritize them
          sugarLumpUpgrade = child;
          break; // Take the first available Sugar Lump upgrade (they're all instant and beneficial)
        }
      }
    }
    
    // If we found a Sugar Lump upgrade, return it immediately (they're always optimal when available)
    if (sugarLumpUpgrade !== null) {
      return sugarLumpUpgrade;
    }

    // Otherwise, evaluate regular children (buildings, upgrades)
    for (const child of game.children()) {
      // Skip Sugar Lump upgrades - we already checked them above
      const lastHistoryItem = child.history[child.history.length - 1];
      if (lastHistoryItem && typeof lastHistoryItem === 'string' && lastHistoryItem.startsWith('SUGAR_LUMP:')) {
        continue;
      }
      
      childCount++;
      let bestDescendantPl = null;
      let bestDescendantPrice = null;
      let descendantCountForChild = 0;
      
      for (const descendant of this.descendants(child, generation - 1)) {
        descendantCountForChild++;
        descendantCount++;
        // What changed from 'game' to this descendant?
        const timeChange = descendant.timeElapsed - game.timeElapsed;
        const rateChange = descendant.rate() - gameRate;
        // Make sure the CpS actually went up
        if (rateChange === 0) continue;
        // Payoff load calculation
        const price = gameRate * timeChange;
        const payoffLoad = price * (1 + gameRate / rateChange);
        // Record the best descendant of this 'child'
        if (bestDescendantPl === null || payoffLoad < bestDescendantPl) {
          bestDescendantPl = payoffLoad;
          bestDescendantPrice = price;
        }
      }
      // If there were no descendants just move on to the next child
      if (bestDescendantPl === null) continue;
      validChildCount++;
      
      // Prefer significantly cheaper purchases when payoff loads are similar
      // This helps avoid skipping over affordable purchases in favor of expensive ones
      // If new purchase is 10x+ cheaper and payoff load is within 15% of best, prefer it
      let shouldSelect = false;
      if (bestPl === null) {
        // First valid purchase found
        shouldSelect = true;
      } else if (bestDescendantPl < bestPl) {
        // Better payoff load
        shouldSelect = true;
      } else if (bestPrice !== null && bestDescendantPrice !== null) {
        // Check if significantly cheaper with acceptable payoff load
        const priceRatio = bestPrice / bestDescendantPrice;
        const payoffRatio = bestDescendantPl / bestPl;
        // Prefer if 10x+ cheaper and payoff load is within 15% of best
        if (priceRatio >= 10 && payoffRatio <= 1.15) {
          shouldSelect = true;
        }
      }
      
      if (shouldSelect) {
        bestChild = child;
        bestPl = bestDescendantPl;
        bestPrice = bestDescendantPrice;
      }
    }
    
    // GPLChild evaluation logging removed for less verbose output
    
    return bestChild;
  }

  /**
   * Macro for Game's "children" method.
   * Yields all descendants of a game object of a given generation.
   * Recursive.
   */
  *descendants(game, generation = 1) {
    // Generation 0 just means return the game that was passed in
    if (generation === 0) {
      yield game;
      return;
    }
    // Recursive call. Call "descendants" on game's children
    for (const child of game.children()) {
      for (const descendant of this.descendants(child, generation - 1)) {
        yield descendant;
      }
    }
  }
}

