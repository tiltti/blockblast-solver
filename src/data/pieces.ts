import type { Piece } from '../types/index';

// Helper to create pieces from string patterns for readability
function createPiece(id: string, name: string, pattern: string[]): Piece {
  const shape = pattern.map(row =>
    row.split('').map(cell => cell === '#')
  );
  return { id, name, shape };
}

export const ALL_PIECES: Piece[] = [
  // Single blocks
  createPiece('1x1', '1×1 Block', ['#']),

  // Horizontal lines
  createPiece('1x2', '1×2 Horizontal', ['##']),
  createPiece('1x3', '1×3 Horizontal', ['###']),
  createPiece('1x4', '1×4 Horizontal', ['####']),
  createPiece('1x5', '1×5 Horizontal', ['#####']),

  // Vertical lines
  createPiece('2x1', '2×1 Vertical', ['#', '#']),
  createPiece('3x1', '3×1 Vertical', ['#', '#', '#']),
  createPiece('4x1', '4×1 Vertical', ['#', '#', '#', '#']),
  createPiece('5x1', '5×1 Vertical', ['#', '#', '#', '#', '#']),

  // Squares
  createPiece('2x2', '2×2 Square', ['##', '##']),
  createPiece('3x3', '3×3 Square', ['###', '###', '###']),

  // Small L shapes (2x2 with one missing)
  createPiece('L-small-1', 'Small L (↗)', ['##', '#.']),
  createPiece('L-small-2', 'Small L (↘)', ['#.', '##']),
  createPiece('L-small-3', 'Small L (↙)', ['.#', '##']),
  createPiece('L-small-4', 'Small L (↖)', ['##', '.#']),

  // Medium L shapes (3 blocks in L)
  createPiece('L-med-1', 'L Shape (↗)', ['#.', '#.', '##']),
  createPiece('L-med-2', 'L Shape (↘)', ['##', '#.', '#.']),
  createPiece('L-med-3', 'L Shape (↙)', ['##', '.#', '.#']),
  createPiece('L-med-4', 'L Shape (↖)', ['.#', '.#', '##']),

  // Horizontal L shapes
  createPiece('L-horiz-1', 'L Horizontal (↗)', ['#..', '###']),
  createPiece('L-horiz-2', 'L Horizontal (↘)', ['###', '#..']),
  createPiece('L-horiz-3', 'L Horizontal (↙)', ['###', '..#']),
  createPiece('L-horiz-4', 'L Horizontal (↖)', ['..#', '###']),

  // Big L shapes (5 blocks)
  createPiece('L-big-1', 'Big L (↗)', ['#..', '#..', '###']),
  createPiece('L-big-2', 'Big L (↘)', ['###', '#..', '#..']),
  createPiece('L-big-3', 'Big L (↙)', ['###', '..#', '..#']),
  createPiece('L-big-4', 'Big L (↖)', ['..#', '..#', '###']),

  // T shapes
  createPiece('T-1', 'T Shape (↓)', ['###', '.#.']),
  createPiece('T-2', 'T Shape (↑)', ['.#.', '###']),
  createPiece('T-3', 'T Shape (→)', ['#.', '##', '#.']),
  createPiece('T-4', 'T Shape (←)', ['.#', '##', '.#']),

  // S/Z shapes
  createPiece('S-1', 'S Shape', ['.##', '##.']),
  createPiece('S-2', 'S Shape Vertical', ['#.', '##', '.#']),
  createPiece('Z-1', 'Z Shape', ['##.', '.##']),
  createPiece('Z-2', 'Z Shape Vertical', ['.#', '##', '#.']),

  // Plus/Cross shape
  createPiece('plus', 'Plus', ['.#.', '###', '.#.']),

  // Corner pieces (from screenshot - bottom middle looks like this)
  createPiece('corner-1', 'Corner (↗)', ['##', '.#']),
  createPiece('corner-2', 'Corner (↘)', ['#.', '##']),
  createPiece('corner-3', 'Corner (↙)', ['.#', '##']),
  createPiece('corner-4', 'Corner (↖)', ['##', '#.']),

  // Extended corners (like in screenshot bottom middle)
  createPiece('ext-corner-1', 'Extended Corner (↗)', ['##', '..', '#.']),
  createPiece('ext-corner-2', 'Extended Corner 2', ['#.', '##']),

  // Diagonal-ish shapes
  createPiece('stair-1', 'Stairs Right', ['#..', '##.', '.##']),
  createPiece('stair-2', 'Stairs Left', ['..#', '.##', '##.']),

  // U shape
  createPiece('U-1', 'U Shape (↓)', ['#.#', '###']),
  createPiece('U-2', 'U Shape (↑)', ['###', '#.#']),
  createPiece('U-3', 'U Shape (→)', ['##', '.#', '##']),
  createPiece('U-4', 'U Shape (←)', ['##', '#.', '##']),

  // Diagonal pieces (2 blocks)
  createPiece('diag-2-dr', 'Diagonal 2 ↘', ['#.', '.#']),
  createPiece('diag-2-dl', 'Diagonal 2 ↙', ['.#', '#.']),

  // Diagonal pieces (3 blocks)
  createPiece('diag-3-dr', 'Diagonal 3 ↘', ['#..', '.#.', '..#']),
  createPiece('diag-3-dl', 'Diagonal 3 ↙', ['..#', '.#.', '#..']),

  // Diagonal pieces (4 blocks)
  createPiece('diag-4-dr', 'Diagonal 4 ↘', ['#...', '.#..', '..#.', '...#']),
  createPiece('diag-4-dl', 'Diagonal 4 ↙', ['...#', '..#.', '.#..', '#...']),
];

// Group pieces by category for easier selection
export const PIECE_CATEGORIES = {
  'Lines': ALL_PIECES.filter(p => p.id.includes('x1') || p.id.includes('1x')),
  'Squares': ALL_PIECES.filter(p => p.id.includes('x2') && !p.id.includes('1x') || p.id === '3x3'),
  'L Shapes': ALL_PIECES.filter(p => p.id.startsWith('L-')),
  'T Shapes': ALL_PIECES.filter(p => p.id.startsWith('T-')),
  'S/Z Shapes': ALL_PIECES.filter(p => p.id.startsWith('S-') || p.id.startsWith('Z-')),
  'Corners': ALL_PIECES.filter(p => p.id.includes('corner')),
  'Diagonals': ALL_PIECES.filter(p => p.id.startsWith('diag-')),
  'Other': ALL_PIECES.filter(p => p.id === 'plus' || p.id.startsWith('stair') || p.id.startsWith('U-')),
};
