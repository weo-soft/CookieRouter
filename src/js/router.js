/**
 * Router class - Contains routing algorithms for finding optimal building purchase orders
 * Ported from Python router.py
 */

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
      // Check if target is already reached
      if (game.totalCookies >= game.targetCookies) {
        break;
      }
      
      const childStartTime = performance.now();
      const child = this.GPLChild(game, lookahead);
      const childTime = performance.now() - childStartTime;
      
      if (child === null) {
        // No valid moves found, but check if we can still reach target
        if (game.rate() > 0) {
          // Continue until target is reached naturally
          const remaining = game.targetCookies - game.totalCookies;
          const timeNeeded = remaining / game.rate();
          game.timeElapsed += timeNeeded;
          game.totalCookies = game.targetCookies;
        }
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

    for (const child of game.children()) {
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

