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
      
      // Safety check: ensure child is a valid Game instance before reassigning
      if (child === null || typeof child.rate !== 'function') {
        console.error('[Router] GPLChild returned invalid child:', child);
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
    // Safety check: ensure game is a valid Game instance
    if (!game || typeof game.rate !== 'function') {
      console.error('[Router] GPLChild called with invalid game object:', game);
      return null;
    }
    
    const gameRate = game.rate(); // Calculate this once to save computer power
    const currentStep = game.history.length + 1; // Next step number (1-indexed)
    
    // DEBUG: Log first few steps and step 6 specifically
    const debugStep6 = currentStep === 6;
    if (currentStep <= 10) {
      console.log(`[Router] 🔍 Step ${currentStep} evaluation, history length:`, game.history.length, 'history:', game.history.slice(-3));
    }
    
    let bestChild = null;
    let bestPl = null;
    let bestPrice = null;
    
    let childCount = 0;
    let validChildCount = 0;
    let descendantCount = 0;

    // Collect all children once to avoid generator issues
    // Since children() is a generator that creates new instances, we need to evaluate them in a single pass
    const allChildren = [];
    const sugarLumpChildren = [];
    
    try {
      let upgradeCount = 0;
      let buildingCount = 0;
      const availableUpgrades = [];
      
      for (const child of game.children()) {
        // Safety check: ensure child is a valid Game instance
        if (!child || typeof child.rate !== 'function') {
          console.warn('[Router] Invalid child encountered, skipping');
          continue;
        }
        
        const lastHistoryItem = child.history[child.history.length - 1];
        if (lastHistoryItem && typeof lastHistoryItem === 'string' && lastHistoryItem.startsWith('SUGAR_LUMP:')) {
          // Store Sugar Lump upgrades separately for evaluation
          sugarLumpChildren.push(child);
        } else {
          // Store regular children
          allChildren.push(child);
          
          // Track upgrade vs building counts for debugging
          if (lastHistoryItem && !game.buildingNames.includes(lastHistoryItem)) {
            upgradeCount++;
            if (lastHistoryItem.toLowerCase().includes('kitten')) {
              availableUpgrades.push(lastHistoryItem);
            }
          } else {
            buildingCount++;
          }
        }
      }
      
      // DEBUG: Log available kitten upgrades (only if there's a mismatch and it's not just a price issue)
      const menuUpgradeNames = Array.from(game.menu).map(u => u.name).filter(n => n.toLowerCase().includes('kitten'));
      if (menuUpgradeNames.length > availableUpgrades.length) {
        const unavailable = menuUpgradeNames.filter(n => !availableUpgrades.includes(n));
        // Check if unavailable upgrades are just too expensive (expected behavior)
        const unavailableUpgrades = Array.from(game.menu).filter(u => unavailable.includes(u.name));
        const tooExpensive = unavailableUpgrades.filter(u => u.price > game.totalCookies);
        const otherIssues = unavailable.filter(name => {
          const upgrade = Array.from(game.menu).find(u => u.name === name);
          return upgrade && upgrade.price <= game.totalCookies;
        });
        
        // Only warn if there are issues other than price (requirements, etc.)
        if (otherIssues.length > 0) {
          console.warn('[Router] ⚠️ Some kitten upgrades in menu are not available as children (not price-related):', otherIssues);
        }
      }
    } catch (error) {
      console.error('[Router] Error collecting children:', error);
      return null;
    }
    
    // Evaluate Sugar Lump upgrades - find the best one (highest rate change)
    // Sugar Lump upgrades are instant (no time cost) and should be prioritized
    let bestSugarLumpUpgrade = null;
    let bestSugarLumpRateChange = 0;
    for (const child of sugarLumpChildren) {
      const rateChange = child.rate() - gameRate;
      if (rateChange > bestSugarLumpRateChange) {
        bestSugarLumpRateChange = rateChange;
        bestSugarLumpUpgrade = child;
      }
    }
    
    // If we found a Sugar Lump upgrade with positive rate change, return it immediately
    // (they're always optimal when available since they're instant)
    if (bestSugarLumpUpgrade !== null) {
      return bestSugarLumpUpgrade;
    }

    // Otherwise, evaluate regular children (buildings, upgrades)
    // DEBUG: Track evaluation details for step 6 investigation
    const debugInfo = debugStep6 ? [] : null;
    
    if (debugStep6) {
      console.log('[Router] ⚠️⚠️⚠️ STEP 6 DETECTED - Starting evaluation, allChildren count:', allChildren.length);
    }
    
    for (const child of allChildren) {
      
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
        if (rateChange === 0) {
          continue;
        }
        // Payoff load calculation
        const price = gameRate * timeChange;
        const payoffLoad = price * (1 + gameRate / rateChange);
        
        // DEBUG: Log evaluation details for step 6
        if (debugStep6 && debugInfo !== null) {
          const buildingName = child.history.length > 0 ? child.history[child.history.length - 1] : 'unknown';
          debugInfo.push({
            building: buildingName,
            timeChange: timeChange,
            timeChangeHours: timeChange / 3600,
            rateChange: rateChange,
            price: price,
            payoffLoad: payoffLoad,
            currentRate: gameRate
          });
        }
        
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
      // Very aggressive preference for cheaper buildings to avoid long waits
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
        
        // Very aggressive preference logic for cheaper buildings:
        // Strongly favor cheaper buildings to avoid long wait times
        // The key insight: Even if payoff load is worse, buying cheaper buildings first
        // increases CpS sooner, making subsequent purchases faster overall
        // 1. If 1.5x+ cheaper and payoff load within 50% of best, prefer it
        // 2. If 2x+ cheaper and payoff load within 100% of best (2x), prefer it
        // 3. If 3x+ cheaper, prefer it even if payoff load is up to 2.5x worse
        // 4. If 5x+ cheaper, prefer it even if payoff load is up to 4x worse
        // 5. If 10x+ cheaper, prefer it even if payoff load is up to 8x worse
        // 6. If 20x+ cheaper, prefer it even if payoff load is up to 15x worse
        // 7. If 50x+ cheaper, prefer it even if payoff load is up to 30x worse
        // This very strongly biases toward cheaper buildings to avoid situations like step 6's 6.72h wait
        if (priceRatio >= 50 && payoffRatio <= 30.0) {
          shouldSelect = true;
        } else if (priceRatio >= 20 && payoffRatio <= 15.0) {
          shouldSelect = true;
        } else if (priceRatio >= 10 && payoffRatio <= 8.0) {
          shouldSelect = true;
        } else if (priceRatio >= 5 && payoffRatio <= 4.0) {
          shouldSelect = true;
        } else if (priceRatio >= 3 && payoffRatio <= 2.5) {
          shouldSelect = true;
        } else if (priceRatio >= 2 && payoffRatio <= 2.0) {
          shouldSelect = true;
        } else if (priceRatio >= 1.5 && payoffRatio <= 1.5) {
          shouldSelect = true;
        }
      }
      
      if (shouldSelect) {
        bestChild = child;
        bestPl = bestDescendantPl;
        bestPrice = bestDescendantPrice;
      }
    }
    
    // DEBUG: Log step 6 evaluation results
    if (debugStep6) {
      const selectedBuilding = bestChild ? bestChild.history[bestChild.history.length - 1] : null;
      console.log('[Router] ⚠️⚠️⚠️ STEP 6 EVALUATION COMPLETE ⚠️⚠️⚠️', {
        currentStep: currentStep,
        historyLength: game.history.length,
        totalChildren: childCount,
        validChildren: validChildCount,
        selectedBuilding: selectedBuilding,
        selectedPayoffLoad: bestPl,
        selectedPrice: bestPrice,
        selectedTimeHours: bestPrice ? (bestPrice / gameRate) / 3600 : null,
        currentRate: gameRate,
        debugInfoExists: debugInfo !== null,
        debugInfoLength: debugInfo ? debugInfo.length : 'N/A'
      });
      
      if (debugInfo && debugInfo.length > 0) {
        const sorted = debugInfo.sort((a, b) => a.payoffLoad - b.payoffLoad);
        console.log('[Router] ⚠️⚠️⚠️ STEP 6 - TOP 10 BY PAYOFF LOAD ⚠️⚠️⚠️:', sorted.slice(0, 10).map(opt => ({
          building: opt.building,
          payoffLoad: opt.payoffLoad,
          timeHours: opt.timeChangeHours,
          rateChange: opt.rateChange,
          price: opt.price
        })));
        
        const cheapest = debugInfo.sort((a, b) => a.timeChange - b.timeChange).slice(0, 10);
        console.log('[Router] ⚠️⚠️⚠️ STEP 6 - TOP 10 CHEAPEST ⚠️⚠️⚠️:', cheapest.map(opt => ({
          building: opt.building,
          payoffLoad: opt.payoffLoad,
          timeHours: opt.timeChangeHours,
          rateChange: opt.rateChange,
          price: opt.price
        })));
      } else {
        console.log('[Router] ⚠️⚠️⚠️ STEP 6 - NO DEBUG INFO COLLECTED ⚠️⚠️⚠️');
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

