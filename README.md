# Block Blast Solver

A web-based solver for the Block Blast puzzle game. Input your current game state and available pieces, and the solver finds the optimal placement order and positions.

## Game Rules (Block Blast)

- **8x8 grid** - The game board consists of 64 cells
- **Place pieces** - You receive 3 pieces at a time and must place ALL 3 before getting new ones
- **Clearing** - When a complete row OR column is filled, it clears (disappears), similar to Tetris
- **Game over** - If you can't fit all 3 pieces, the game ends
- **Order matters** - Pieces can be placed in any order, and often you need to place smaller pieces first to clear lines, making room for larger pieces

## How the Solver Works

### Algorithm

1. **Permutation search** - Tries all 6 possible orderings of the 3 pieces (3! = 6)
2. **Position scoring** - For each piece, evaluates all valid positions based on:
   - Lines cleared (rows + columns)
   - Board compactness (fewer holes)
   - Setup potential (almost-complete lines)
3. **Backtracking with pruning** - Explores top positions at each step, limiting search to avoid combinatorial explosion
4. **Best solution selection** - Returns the solution with the best final board state

### Visual Solution Display

- **Orange cells** - Newly placed piece (with step number 1, 2, or 3)
- **Green cells** - Existing blocks on the board
- **× markers** - Cells that will be cleared after placement
- **Pulsing animation** - Rows/columns about to clear

## Running the App

```bash
npm install
npm run dev
```

Opens at http://localhost:5175

## Usage

1. **Set up the board** - Click cells on the left grid to toggle filled/empty state to match your current game
2. **Select 3 pieces** - Click a piece slot, then select from the piece library (organized by categories: Lines, Squares, L Shapes, etc.)
3. **Click "Solve!"** - The solver finds the optimal placement order
4. **Follow the solution** - Each step shows exactly where to place each piece (orange with numbers)
5. **Click "Solved!"** - Updates the board to the final state so you can continue with the next 3 pieces

## Project Structure

```
src/
├── components/
│   ├── Grid.tsx          # 8x8 interactive game board
│   ├── PieceSelector.tsx # 3-slot piece selection with library
│   └── SolutionDisplay.tsx # Step-by-step solution visualization
├── data/
│   └── pieces.ts         # All Block Blast piece definitions (~50 shapes)
├── types/
│   └── index.ts          # TypeScript interfaces
└── utils/
    ├── grid.ts           # Grid manipulation (place, clear, validate)
    ├── solver.ts         # Solver algorithm
    └── storage.ts        # LocalStorage persistence
```

## Piece Categories

- **Lines** - 1x2 to 1x5 horizontal and vertical
- **Squares** - 2x2 and 3x3
- **L Shapes** - Small, medium, big, horizontal variants (all 4 rotations each)
- **T Shapes** - All 4 rotations
- **S/Z Shapes** - Standard and vertical
- **Corners** - 2x2 with one cell, extended corners
- **Diagonals** - 2, 3, and 4 block stair-step patterns (both directions)
- **Other** - Plus sign, stairs, U shapes

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- LocalStorage for state persistence (no backend needed)

## Future Improvements

- [ ] Screenshot/image input to auto-detect board state
- [ ] Piece detection from screenshot
- [ ] Better solver heuristics for edge cases
- [ ] Mobile-responsive layout
- [ ] Undo/redo functionality
