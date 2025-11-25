import { useState } from 'react';
import type { Piece } from '../types/index';
import { ALL_PIECES, PIECE_CATEGORIES } from '../data/pieces';

interface PieceSelectorProps {
  selectedPieces: (Piece | null)[];
  onPieceSelect: (index: number, piece: Piece | null) => void;
}

function PiecePreview({ piece, size = 'normal', maxSize }: { piece: Piece; size?: 'normal' | 'small'; maxSize?: number }) {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;

  // Calculate cell size to fit within maxSize container
  let cellSizePx: number;
  let gapPx: number;

  if (maxSize) {
    // Calculate cell size to fit piece within maxSize x maxSize container
    const maxDimension = Math.max(rows, cols);
    gapPx = 2;
    const totalGap = (maxDimension - 1) * gapPx;
    cellSizePx = Math.floor((maxSize - totalGap) / maxDimension);
    cellSizePx = Math.min(cellSizePx, 20); // Cap at 20px
  } else {
    cellSizePx = size === 'normal' ? 20 : 12;
    gapPx = size === 'normal' ? 2 : 1;
  }

  return (
    <div
      className="inline-grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSizePx}px)`,
        gap: `${gapPx}px`
      }}
    >
      {piece.shape.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`rounded-sm ${cell ? 'bg-[#66a033] border border-[#5a9030]' : 'bg-transparent'}`}
            style={{ width: cellSizePx, height: cellSizePx }}
          />
        ))
      )}
    </div>
  );
}

// Custom piece creator component
function CustomPieceCreator({ onCreatePiece }: { onCreatePiece: (piece: Piece) => void }) {
  const [grid, setGrid] = useState<boolean[][]>(() =>
    Array(4).fill(null).map(() => Array(4).fill(false))
  );

  const toggleCell = (row: number, col: number) => {
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = !newGrid[row][col];
      return newGrid;
    });
  };

  const handleCreate = () => {
    // Trim the grid to remove empty rows/cols
    const trimmed = trimShape(grid);
    if (!trimmed) return;

    const piece: Piece = {
      id: `custom-${Date.now()}`,
      name: 'Custom',
      shape: trimmed,
    };
    onCreatePiece(piece);
  };

  const handleClear = () => {
    setGrid(Array(4).fill(null).map(() => Array(4).fill(false)));
  };

  const hasAnyCells = grid.some(row => row.some(cell => cell));

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
      <div className="text-xs text-gray-600 mb-2 font-medium">Create custom piece:</div>
      <div className="flex items-start gap-3">
        <div className="inline-grid grid-cols-4 gap-1">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => toggleCell(rowIndex, colIndex)}
                className={`
                  w-6 h-6 rounded-sm border transition-colors
                  ${cell
                    ? 'bg-[#66a033] border-[#5a9030]'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                  }
                `}
              />
            ))
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={handleCreate}
            disabled={!hasAnyCells}
            className={`
              px-3 py-1 text-xs rounded font-medium transition-colors
              ${hasAnyCells
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Use
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1 text-xs rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

// Trim empty rows and columns from shape
function trimShape(grid: boolean[][]): boolean[][] | null {
  // Find bounds
  let minRow = -1, maxRow = -1, minCol = -1, maxCol = -1;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) {
        if (minRow === -1) minRow = r;
        maxRow = r;
        if (minCol === -1 || c < minCol) minCol = c;
        if (maxCol === -1 || c > maxCol) maxCol = c;
      }
    }
  }

  if (minRow === -1) return null; // Empty grid

  // Extract trimmed shape
  const trimmed: boolean[][] = [];
  for (let r = minRow; r <= maxRow; r++) {
    const row: boolean[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      row.push(grid[r][c]);
    }
    trimmed.push(row);
  }

  return trimmed;
}

export function PieceSelector({ selectedPieces, onPieceSelect }: PieceSelectorProps) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Lines');
  const [customPiece, setCustomPiece] = useState<Piece | null>(null);

  const handleSlotClick = (index: number) => {
    if (activeSlot === index) {
      setActiveSlot(null);
    } else {
      setActiveSlot(index);
    }
  };

  const handlePieceClick = (piece: Piece) => {
    if (activeSlot !== null) {
      onPieceSelect(activeSlot, piece);
      // Move to next empty slot or close
      const nextEmpty = selectedPieces.findIndex((p, i) => i > activeSlot && p === null);
      if (nextEmpty !== -1) {
        setActiveSlot(nextEmpty);
      } else {
        const firstEmpty = selectedPieces.findIndex(p => p === null);
        if (firstEmpty !== -1 && firstEmpty !== activeSlot) {
          setActiveSlot(firstEmpty);
        } else {
          setActiveSlot(null);
        }
      }
    }
  };

  const handleClearSlot = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onPieceSelect(index, null);
  };

  const handleCustomPieceCreate = (piece: Piece) => {
    setCustomPiece(piece);
    handlePieceClick(piece);
  };

  // Get pieces for current category
  const getPiecesForCategory = (): Piece[] => {
    if (activeCategory === 'All') {
      return ALL_PIECES;
    }
    if (activeCategory === 'Custom') {
      return customPiece ? [customPiece] : [];
    }
    return PIECE_CATEGORIES[activeCategory as keyof typeof PIECE_CATEGORIES] || [];
  };

  const categories = ['All', ...Object.keys(PIECE_CATEGORIES), 'Custom'];

  return (
    <div className="space-y-4">
      {/* Selected Pieces Slots */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Selected Pieces (3)</h3>
        <div className="flex gap-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              onClick={() => handleSlotClick(index)}
              className={`
                relative w-24 h-24 rounded-lg border-2 flex items-center justify-center
                cursor-pointer transition-all
                ${activeSlot === index
                  ? 'border-blue-500 bg-blue-50'
                  : selectedPieces[index]
                    ? 'border-gray-300 bg-white'
                    : 'border-dashed border-gray-400 bg-gray-50'
                }
              `}
            >
              {selectedPieces[index] ? (
                <>
                  <PiecePreview piece={selectedPieces[index]!} maxSize={72} />
                  <button
                    onClick={(e) => handleClearSlot(index, e)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </>
              ) : (
                <span className="text-gray-400 text-sm">Piece {index + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Piece Library */}
      {activeSlot !== null && (
        <div className="border rounded-lg p-3 bg-white">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Select piece for slot {activeSlot + 1}
          </h3>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  px-2 py-1 text-xs rounded transition-colors
                  ${activeCategory === category
                    ? category === 'All'
                      ? 'bg-purple-500 text-white'
                      : category === 'Custom'
                        ? 'bg-orange-500 text-white'
                        : 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Custom piece creator */}
          {activeCategory === 'Custom' && (
            <CustomPieceCreator onCreatePiece={handleCustomPieceCreate} />
          )}

          {/* Pieces grid */}
          {activeCategory !== 'Custom' && (
            <div className={`flex flex-wrap gap-2 ${activeCategory === 'All' ? 'max-h-64 overflow-y-auto' : ''}`}>
              {getPiecesForCategory().map((piece) => (
                <button
                  key={piece.id}
                  onClick={() => handlePieceClick(piece)}
                  className="p-2 rounded border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  title={piece.name}
                >
                  <PiecePreview piece={piece} size="small" />
                </button>
              ))}
            </div>
          )}

          {/* Show custom piece if exists and in Custom tab */}
          {activeCategory === 'Custom' && customPiece && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-2">Your custom piece:</div>
              <button
                onClick={() => handlePieceClick(customPiece)}
                className="p-2 rounded border border-orange-300 bg-orange-50 hover:border-orange-400 hover:bg-orange-100 transition-colors"
                title="Custom piece"
              >
                <PiecePreview piece={customPiece} size="small" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
