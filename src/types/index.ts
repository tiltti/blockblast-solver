// Grid is 8x8, each cell is either filled (true) or empty (false)
export type Grid = boolean[][];

// A piece is defined by its shape as a 2D array of booleans
export interface Piece {
  id: string;
  name: string;
  shape: boolean[][];
}

// Position on the grid
export interface Position {
  row: number;
  col: number;
}

// A placement is a piece at a specific position
export interface Placement {
  piece: Piece;
  position: Position;
}

// Solution step shows the board state after placing a piece
export interface SolutionStep {
  placement: Placement;
  boardBefore: Grid;
  boardWithPiece: Grid; // After placing piece, before clearing lines
  boardAfter: Grid; // After clearing lines
  linesCleared: number;
}

// Complete solution with all 3 steps
export interface Solution {
  steps: SolutionStep[];
  totalLinesCleared: number;
}

// App state for localStorage
export interface AppState {
  board: Grid;
  selectedPieces: (Piece | null)[];
}
