import { useState } from 'react';
import type { Piece } from '../types/index';
import { ALL_PIECES, PIECE_CATEGORIES } from '../data/pieces';

interface PieceSelectorProps {
  selectedPieces: (Piece | null)[];
  onPieceSelect: (index: number, piece: Piece | null) => void;
}

function PiecePreview({ piece, size = 'normal' }: { piece: Piece; size?: 'normal' | 'small' }) {
  const cellSize = size === 'normal' ? 'w-5 h-5' : 'w-3 h-3';
  const gap = size === 'normal' ? 'gap-0.5' : 'gap-px';

  return (
    <div className={`inline-grid ${gap}`} style={{ gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)` }}>
      {piece.shape.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`${cellSize} rounded-sm ${cell ? 'bg-[#66a033] border border-[#5a9030]' : 'bg-transparent'}`}
          />
        ))
      )}
    </div>
  );
}

export function PieceSelector({ selectedPieces, onPieceSelect }: PieceSelectorProps) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Lines');

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
                  <PiecePreview piece={selectedPieces[index]!} />
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
            {Object.keys(PIECE_CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => setExpandedCategory(category)}
                className={`
                  px-2 py-1 text-xs rounded transition-colors
                  ${expandedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Pieces in selected category */}
          {expandedCategory && (
            <div className="flex flex-wrap gap-2">
              {PIECE_CATEGORIES[expandedCategory as keyof typeof PIECE_CATEGORIES].map((piece) => (
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
        </div>
      )}
    </div>
  );
}
