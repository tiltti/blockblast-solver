import type { Grid, Piece, Solution, SolutionStep, Position } from '../types/index';
import {
  copyGrid,
  placePiece,
  clearLines,
  getValidPositions,
  evaluateBoard,
  getPieceSize,
} from './grid';

// Generate all permutations of an array
function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];

  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const perms = permutations(remaining);
    for (const perm of perms) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

interface PlacementCandidate {
  position: Position;
  score: number;
}

// Advanced solver that tries multiple positions for each piece
function trySolveWithOrderAdvanced(
  grid: Grid,
  pieces: Piece[],
  depth: number = 0,
  maxDepth: number = 3
): Solution | null {
  if (depth >= pieces.length) {
    return { steps: [], totalLinesCleared: 0 };
  }

  const piece = pieces[depth];
  const positions = getValidPositions(grid, piece);

  if (positions.length === 0) {
    return null;
  }

  // Score and sort positions
  const scoredPositions: PlacementCandidate[] = positions.map(pos => {
    const afterPlace = placePiece(grid, piece, pos);
    const { grid: afterClear, cleared } = clearLines(afterPlace);
    let score = evaluateBoard(afterClear) + cleared * 100;
    return { position: pos, score };
  });

  scoredPositions.sort((a, b) => b.score - a.score);

  // Try top positions (limit to avoid explosion)
  const topN = Math.min(scoredPositions.length, depth === 0 ? 10 : 5);

  let bestSolution: Solution | null = null;
  let bestFinalScore = -Infinity;

  for (let i = 0; i < topN; i++) {
    const pos = scoredPositions[i].position;
    const boardBefore = copyGrid(grid);
    const afterPlace = placePiece(grid, piece, pos);
    const { grid: afterClear, cleared } = clearLines(afterPlace);

    const subSolution = trySolveWithOrderAdvanced(
      afterClear,
      pieces,
      depth + 1,
      maxDepth
    );

    if (subSolution) {
      const step: SolutionStep = {
        placement: { piece, position: pos },
        boardBefore,
        boardWithPiece: copyGrid(afterPlace),
        boardAfter: afterClear,
        linesCleared: cleared,
      };

      const fullSolution: Solution = {
        steps: [step, ...subSolution.steps],
        totalLinesCleared: cleared + subSolution.totalLinesCleared,
      };

      // Calculate final score based on final board state and lines cleared
      const finalBoard = fullSolution.steps[fullSolution.steps.length - 1].boardAfter;
      const finalScore = evaluateBoard(finalBoard) + fullSolution.totalLinesCleared * 100;

      if (finalScore > bestFinalScore) {
        bestFinalScore = finalScore;
        bestSolution = fullSolution;
      }
    }
  }

  return bestSolution;
}

// Main solver function
export function solve(grid: Grid, pieces: Piece[]): Solution | null {
  if (pieces.length === 0) return null;

  // Filter out null pieces
  const validPieces = pieces.filter((p): p is Piece => p !== null);
  if (validPieces.length === 0) return null;

  // Try all permutations of the pieces
  const allPermutations = permutations(validPieces);

  let bestSolution: Solution | null = null;
  let bestFinalScore = -Infinity;

  for (const perm of allPermutations) {
    const solution = trySolveWithOrderAdvanced(grid, perm);

    if (solution) {
      const finalBoard = solution.steps[solution.steps.length - 1].boardAfter;
      const finalScore = evaluateBoard(finalBoard) + solution.totalLinesCleared * 100;

      if (finalScore > bestFinalScore) {
        bestFinalScore = finalScore;
        bestSolution = solution;
      }
    }
  }

  return bestSolution;
}

// Quick check if pieces can possibly fit (for validation)
export function canPiecesFit(grid: Grid, pieces: Piece[]): boolean {
  const validPieces = pieces.filter((p): p is Piece => p !== null);
  if (validPieces.length === 0) return true;

  // Quick heuristic: total cells needed vs available
  const totalPieceCells = validPieces.reduce((sum, p) => sum + getPieceSize(p), 0);

  // Count empty cells and potential clears
  let emptyCells = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (!cell) emptyCells++;
    }
  }

  // Very rough check - if pieces need more space than available, might not fit
  // But lines can be cleared, so this is just a hint
  return emptyCells >= totalPieceCells * 0.3; // Allow some overlap due to clearing
}
