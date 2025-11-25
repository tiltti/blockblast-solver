import type { Grid, Piece, Position } from '../types/index';

export const GRID_SIZE = 8;

// Create an empty 8x8 grid
export function createEmptyGrid(): Grid {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
}

// Deep copy a grid
export function copyGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}

// Check if a piece can be placed at a position
export function canPlacePiece(grid: Grid, piece: Piece, position: Position): boolean {
  const { shape } = piece;
  const { row, col } = position;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const gridRow = row + r;
        const gridCol = col + c;

        // Check bounds
        if (gridRow < 0 || gridRow >= GRID_SIZE || gridCol < 0 || gridCol >= GRID_SIZE) {
          return false;
        }

        // Check if cell is already occupied
        if (grid[gridRow][gridCol]) {
          return false;
        }
      }
    }
  }

  return true;
}

// Place a piece on the grid (returns new grid, doesn't mutate)
export function placePiece(grid: Grid, piece: Piece, position: Position): Grid {
  const newGrid = copyGrid(grid);
  const { shape } = piece;
  const { row, col } = position;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        newGrid[row + r][col + c] = true;
      }
    }
  }

  return newGrid;
}

// Clear complete rows and columns, returns the new grid and count of lines cleared
export function clearLines(grid: Grid): { grid: Grid; cleared: number } {
  const newGrid = copyGrid(grid);
  let cleared = 0;

  // Find complete rows
  const completeRows: number[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    if (newGrid[r].every(cell => cell)) {
      completeRows.push(r);
    }
  }

  // Find complete columns
  const completeCols: number[] = [];
  for (let c = 0; c < GRID_SIZE; c++) {
    if (newGrid.every(row => row[c])) {
      completeCols.push(c);
    }
  }

  // Clear rows
  for (const r of completeRows) {
    for (let c = 0; c < GRID_SIZE; c++) {
      newGrid[r][c] = false;
    }
  }

  // Clear columns
  for (const c of completeCols) {
    for (let r = 0; r < GRID_SIZE; r++) {
      newGrid[r][c] = false;
    }
  }

  cleared = completeRows.length + completeCols.length;

  return { grid: newGrid, cleared };
}

// Get all valid positions for a piece on a grid
export function getValidPositions(grid: Grid, piece: Piece): Position[] {
  const positions: Position[] = [];
  const { shape } = piece;

  for (let row = 0; row <= GRID_SIZE - shape.length; row++) {
    for (let col = 0; col <= GRID_SIZE - shape[0].length; col++) {
      if (canPlacePiece(grid, piece, { row, col })) {
        positions.push({ row, col });
      }
    }
  }

  return positions;
}

// Count empty cells in the grid
export function countEmptyCells(grid: Grid): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (!cell) count++;
    }
  }
  return count;
}

// Count filled cells in a piece
export function getPieceSize(piece: Piece): number {
  let count = 0;
  for (const row of piece.shape) {
    for (const cell of row) {
      if (cell) count++;
    }
  }
  return count;
}

// Evaluate how good a board position is (higher is better)
export function evaluateBoard(grid: Grid): number {
  let score = 0;

  // Prefer keeping the board more empty
  score += countEmptyCells(grid) * 10;

  // Check for almost-complete rows/columns (bonus for setting up clears)
  for (let r = 0; r < GRID_SIZE; r++) {
    const filledInRow = grid[r].filter(c => c).length;
    if (filledInRow >= 6) score += (filledInRow - 5) * 5;
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    let filledInCol = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c]) filledInCol++;
    }
    if (filledInCol >= 6) score += (filledInCol - 5) * 5;
  }

  // Penalty for isolated empty cells (holes)
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) {
        let neighbors = 0;
        if (r > 0 && grid[r - 1][c]) neighbors++;
        if (r < GRID_SIZE - 1 && grid[r + 1][c]) neighbors++;
        if (c > 0 && grid[r][c - 1]) neighbors++;
        if (c < GRID_SIZE - 1 && grid[r][c + 1]) neighbors++;
        if (neighbors >= 3) score -= 20; // Surrounded hole
      }
    }
  }

  return score;
}
