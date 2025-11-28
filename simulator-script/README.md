# IdleRouting

A Cookie Clicker game optimizer and simulator that finds optimal playthroughs for speedruns using routing algorithms.

## Purpose

This project simulates Cookie Clicker gameplay and uses routing algorithms to determine the optimal sequence of building purchases and upgrades to minimize completion time for various speedrun categories. It's designed to help speedrunners find the most efficient strategies for reaching specific cookie targets.

## Features

- **Game Simulation**: Accurately simulates Cookie Clicker mechanics including:
  - Building purchases with exponential price scaling (1.15x per building)
  - Upgrade purchases with requirements
  - Cookie production rates (CpS) calculations
  - Player clicking simulation with configurable CPS and delay
  - Time tracking for speedrun optimization

- **Routing Algorithms**: 
  - **GPL (Payoff Load)**: A heuristic-based algorithm that minimizes payoff load locally to find good playthroughs
  - **DFS (Depth-First Search)**: Brute-force optimal routing (placeholder implementation)

- **Multiple Game Versions**: Support for different Cookie Clicker versions:
  - v2031 (classic)
  - v2048 (extended with more buildings)
  - v10466 (standard)
  - v10466_xmas (holiday/Christmas mode)

- **Speedrun Categories**: Pre-configured scenarios for different speedrun categories:
  - `fledgling`: Speedrun to 1 million cookies
  - `neverclick`: Bake 1 million cookies with only 15 manual clicks
  - `hardcore`: Bake 1 billion cookies with no upgrades
  - `forty`: Route to 40 achievements (30 million cookies)
  - `forty_holiday`: 40 achievement run in holiday mode (4 million cookies)
  - `longhaul`: Route to first optimal ascension (1000 septillion cookies)
  - `short`: Short speedrun for testing (1000 cookies)

## Project Structure

```
IdleRouting/
├── main.py                    # Entry point and example usage
├── router.py                  # Routing algorithms (GPL, DFS)
├── cookie_clicker/
│   ├── game.py               # Game simulation engine
│   ├── categories.py         # Speedrun category definitions
│   └── versions/             # Game version data
│       ├── v2031.py
│       ├── v2048.py
│       ├── v10466.py
│       ├── v10466_xmas.py
│       └── v_classic.py
```

## Usage

### Basic Example

```python
from router import Router
import cookie_clicker.categories as cats

# Create a game instance for a specific speedrun category
g = cats.longhaul(player_cps=8)

# Initialize the router
r = Router()

# Route the game using GPL algorithm with lookahead depth of 1
game_over = r.route_GPL(g, lookahead=1)

# Get the final completion time
final_time = game_over.completion_time()
print('Final time: ' + str(final_time / 60 / 60))  # Print in hours
print(game_over.num_buildings)
```

### Available Speedrun Categories

```python
import cookie_clicker.categories as cats

# Fledgling: 1 million cookies
game = cats.fledgling(version=v2031, player_cps=8, player_delay=1)

# Neverclick: 1 million cookies with minimal clicking
game = cats.neverclick(version=v2031, player_cps=0, player_delay=0)

# Hardcore: 1 billion cookies, no upgrades
game = cats.hardcore(version=v2048, player_cps=8, player_delay=1)

# Forty achievements
game = cats.forty(version=v10466, player_cps=8, player_delay=1)

# Forty achievements (holiday mode)
game = cats.forty_holiday(version=v10466_xmas, player_cps=8, player_delay=1)

# Longhaul: First optimal ascension
game = cats.longhaul(version=v2048, player_cps=8, player_delay=1)

# Short test run
game = cats.short(version=v2031, player_cps=8, player_delay=1)
```

### Routing Algorithms

#### GPL (Payoff Load) Algorithm

The GPL algorithm uses a heuristic that minimizes "payoff load" - a metric that considers both the price of a purchase and the rate improvement it provides. It uses a lookahead parameter to explore multiple generations of moves ahead.

```python
router = Router()
game_over = router.route_GPL(game, lookahead=1)  # lookahead=1 means 1 move ahead
```

**Parameters:**
- `game`: A `Game` instance to route
- `lookahead`: Number of generations to look ahead (default: 1). Higher values provide better optimization but are slower.

#### DFS (Depth-First Search) Algorithm

Currently a placeholder that returns the game unchanged. Intended for brute-force optimal routing.

```python
router = Router()
game_over = router.route_DFS(game)
```

## Game Configuration

### Player Settings

- `player_cps`: Cookies per second from manual clicking (default: 8)
- `player_delay`: Delay in seconds when switching from clicking to purchasing (default: 1)

### Game Versions

Each version file defines:
- Building names and base prices
- Base production rates for each building
- Available upgrades with requirements and effects
- Building-specific and global effects

## How It Works

1. **Game State**: The `Game` class maintains the current state including:
   - Number of each building owned
   - Total cookies produced
   - Time elapsed
   - Active upgrades and their effects
   - Target cookie count

2. **Routing**: The router explores possible game states by:
   - Generating all possible next moves (building purchases or upgrades)
   - Evaluating each move using the routing algorithm
   - Selecting the best move based on the algorithm's criteria
   - Repeating until the target is reached

3. **Optimization**: The GPL algorithm calculates "payoff load" for each potential move:
   ```
   payoff_load = price * (1 + current_rate / rate_change)
   ```
   This metric balances the cost of a purchase against the rate improvement it provides.

## Output

During routing, the algorithm prints progress information for each move:
- Last purchase made
- Time elapsed (in hours)
- Total cookies produced
- Current cookies per second (CpS)

The final game state includes:
- `completion_time()`: Total time to reach the target
- `num_buildings`: Dictionary of buildings owned
- `history`: List of all purchases made in order

## Requirements

- Python 3.x
- No external dependencies (uses only standard library)

## Notes

- The router uses a greedy approach with lookahead, which provides good results but may not be globally optimal
- The simulation accounts for the time cost of switching between clicking and purchasing
- Hardcore mode disables all upgrades
- Some categories pre-purchase buildings to unlock upgrades (e.g., Cursor purchases to unlock mouse upgrades)

