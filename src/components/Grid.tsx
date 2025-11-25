import type { Grid as GridType, Placement } from '../types/index';

interface GridProps {
  grid: GridType;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
  placement?: Placement; // Highlight where a piece was placed
  size?: 'normal' | 'small';
  label?: string;
}

export function Grid({
  grid,
  onCellClick,
  interactive = false,
  placement,
  size = 'normal',
  label,
}: GridProps) {
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

  return (
    <div className="flex flex-col items-center">
      {label && (
        <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      )}
      <div
        className={`grid grid-cols-8 ${gap} bg-[#4a4238] p-1.5 rounded-lg shadow-lg`}
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
                  transition-all
                  ${interactive ? 'cursor-pointer hover:opacity-80' : ''}
                  ${
                    isFilled
                      ? isHighlighted
                        ? 'bg-[#7cb342] shadow-inner border border-[#8bc34a]' // Newly placed - bright green
                        : 'bg-[#66a033] shadow-inner border border-[#5a9030]' // Existing - darker green
                      : 'bg-[#5c5347]' // Empty - dark brown
                  }
                `}
                onClick={() => interactive && onCellClick?.(rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
