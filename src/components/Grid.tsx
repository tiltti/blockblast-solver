import { useState, useCallback, useEffect } from 'react';
import type { Grid as GridType, Placement } from '../types/index';

interface GridProps {
  grid: GridType;
  onCellClick?: (row: number, col: number) => void;
  onCellPaint?: (row: number, col: number, value: boolean) => void;
  interactive?: boolean;
  placement?: Placement;
  size?: 'normal' | 'small';
  label?: string;
}

export function Grid({
  grid,
  onCellClick,
  onCellPaint,
  interactive = false,
  placement,
  size = 'normal',
  label,
}: GridProps) {
  const [isPainting, setIsPainting] = useState(false);
  const [paintValue, setPaintValue] = useState<boolean>(true);

  const cellSize = size === 'normal' ? 'w-9 h-9' : 'w-6 h-6';
  const gap = size === 'normal' ? 'gap-0.5' : 'gap-px';

  // Create a set of highlighted cells from the placement
  const highlightedCells = new Set<string>();
  if (placement) {
    const { piece, position } = placement;
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          highlightedCells.add(`${position.row + r},${position.col + c}`);
        }
      }
    }
  }

  const handleMouseDown = useCallback((row: number, col: number, e: React.MouseEvent) => {
    if (!interactive) return;
    e.preventDefault();

    const currentValue = grid[row][col];
    const newValue = !currentValue;

    setIsPainting(true);
    setPaintValue(newValue);

    if (onCellPaint) {
      onCellPaint(row, col, newValue);
    } else if (onCellClick) {
      onCellClick(row, col);
    }
  }, [interactive, grid, onCellPaint, onCellClick]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!interactive || !isPainting) return;

    // Only paint if the cell value is different from what we're painting
    if (grid[row][col] !== paintValue) {
      if (onCellPaint) {
        onCellPaint(row, col, paintValue);
      } else if (onCellClick) {
        onCellClick(row, col);
      }
    }
  }, [interactive, isPainting, paintValue, grid, onCellPaint, onCellClick]);

  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
  }, []);

  // Global mouse up listener to stop painting even if mouse leaves grid
  useEffect(() => {
    if (isPainting) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isPainting, handleMouseUp]);

  return (
    <div className="flex flex-col items-center">
      {label && (
        <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      )}
      <div
        className={`grid grid-cols-8 ${gap} bg-[#4a4238] p-1.5 rounded-lg shadow-lg select-none`}
        onMouseLeave={() => setIsPainting(false)}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isHighlighted = highlightedCells.has(`${rowIndex},${colIndex}`);
            const isFilled = cell;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  ${cellSize}
                  rounded-sm
                  transition-colors
                  ${interactive ? 'cursor-pointer hover:opacity-80' : ''}
                  ${
                    isFilled
                      ? isHighlighted
                        ? 'bg-[#7cb342] shadow-inner border border-[#8bc34a]'
                        : 'bg-[#66a033] shadow-inner border border-[#5a9030]'
                      : 'bg-[#5c5347]'
                  }
                `}
                onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
