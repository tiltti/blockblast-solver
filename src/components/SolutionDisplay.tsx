import type { Solution, Piece, Position, Grid } from '../types/index';

interface SolutionDisplayProps {
  solution: Solution | null;
  isLoading?: boolean;
  error?: string;
  onSolved?: (finalBoard: Grid) => void;
}

// Mini piece preview
function PiecePreview({ piece, color = 'green' }: { piece: Piece; color?: 'green' | 'orange' }) {
  const bgColor = color === 'orange' ? 'bg-[#ff9800] border-[#ffb74d]' : 'bg-[#7cb342] border-[#8bc34a]';
  return (
    <div
      className="inline-grid gap-px"
      style={{ gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)` }}
    >
      {piece.shape.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${
              cell ? `${bgColor} border` : 'bg-transparent'
            }`}
          />
        ))
      )}
    </div>
  );
}

// Find which rows and columns will be cleared
function findClearedLines(grid: boolean[][]): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];
  const size = 8;

  for (let r = 0; r < size; r++) {
    if (grid[r].every(cell => cell)) {
      rows.push(r);
    }
  }

  for (let c = 0; c < size; c++) {
    if (grid.every(row => row[c])) {
      cols.push(c);
    }
  }

  return { rows, cols };
}

// Format the cleared lines message
function formatClearedMessage(rows: number[], cols: number[]): string {
  const parts: string[] = [];

  if (rows.length > 0) {
    parts.push(`${rows.length} row${rows.length > 1 ? 's' : ''}`);
  }
  if (cols.length > 0) {
    parts.push(`${cols.length} column${cols.length > 1 ? 's' : ''}`);
  }

  return parts.join(' and ');
}

// Solution grid that clearly shows placement and cleared lines
function SolutionGrid({
  grid,
  placement,
  stepNumber,
  showClears,
}: {
  grid: boolean[][];
  placement: { piece: Piece; position: Position };
  stepNumber: number;
  showClears: boolean;
}) {
  const placedCells = new Set<string>();
  const { piece, position } = placement;
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        placedCells.add(`${position.row + r},${position.col + c}`);
      }
    }
  }

  const clearedLines = showClears ? findClearedLines(grid) : { rows: [], cols: [] };
  const clearedRows = new Set(clearedLines.rows);
  const clearedCols = new Set(clearedLines.cols);

  return (
    <div className="inline-grid grid-cols-8 gap-0.5 bg-[#4a4238] p-1.5 sm:p-2 rounded-lg">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = `${rowIndex},${colIndex}`;
          const isPlaced = placedCells.has(key);
          const isFilled = cell;
          const willClear = clearedRows.has(rowIndex) || clearedCols.has(colIndex);

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-6 h-6 sm:w-8 sm:h-8 rounded-sm flex items-center justify-center text-xs font-bold relative
                ${
                  isFilled
                    ? isPlaced
                      ? 'bg-[#ff9800] border-2 border-[#ffb74d] shadow-md'
                      : 'bg-[#66a033] border border-[#5a9030]'
                    : 'bg-[#5c5347]'
                }
                ${willClear && isFilled ? 'animate-pulse' : ''}
              `}
            >
              {isPlaced && isFilled && (
                <span className="text-white drop-shadow-md font-bold text-xs sm:text-sm">{stepNumber}</span>
              )}
              {willClear && isFilled && !isPlaced && (
                <span className="text-white/80 text-base sm:text-lg">×</span>
              )}
              {willClear && isFilled && isPlaced && (
                <span className="absolute -top-1 -right-1 text-red-500 text-xs font-bold">×</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export function SolutionDisplay({ solution, isLoading, error, onSolved }: SolutionDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Solving...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-500">
          Set up the board and select 3 pieces, then click "Solve" to find the solution.
        </p>
      </div>
    );
  }

  const finalBoard = solution.steps[solution.steps.length - 1].boardAfter;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
        <span className="text-green-800 font-bold text-base sm:text-lg">Solution Found!</span>
        {solution.totalLinesCleared > 0 && (
          <span className="text-green-700 text-sm sm:text-base">
            Cleared: <strong>{solution.totalLinesCleared}</strong>
          </span>
        )}
      </div>

      {/* Piece order - compact on mobile */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2 sm:mb-3">Place pieces in this order:</h3>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {solution.steps.map((step, index) => (
            <div key={index} className="flex items-center gap-1 sm:gap-2">
              {index > 0 && <span className="text-blue-400 text-lg sm:text-xl">→</span>}
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white rounded-lg border border-blue-200">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                  {index + 1}
                </span>
                <PiecePreview piece={step.placement.piece} color="orange" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step by step boards - stacked vertically on mobile */}
      <div className="space-y-4 sm:space-y-6">
        {solution.steps.map((step, index) => {
          const clearedLines = findClearedLines(step.boardWithPiece);
          const hasClears = step.linesCleared > 0;

          return (
            <div key={index} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
              {/* Step header - always horizontal */}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-base sm:text-lg font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="font-bold text-gray-800 text-base sm:text-lg">
                  {step.placement.piece.name}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 ml-auto">
                  Row {step.placement.position.row + 1}, Col {step.placement.position.col + 1}
                </span>
              </div>

              {/* Board - centered */}
              <div className="flex justify-center">
                <SolutionGrid
                  grid={step.boardWithPiece}
                  placement={step.placement}
                  stepNumber={index + 1}
                  showClears={hasClears}
                />
              </div>

              {/* Clears info */}
              {hasClears && (
                <div className="mt-2 text-xs sm:text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded text-center">
                  <strong>Clears:</strong> {formatClearedMessage(clearedLines.rows, clearedLines.cols)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Solved button */}
      {onSolved && (
        <button
          onClick={() => onSolved(finalBoard)}
          className="w-full py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
        >
          Solved! Continue →
        </button>
      )}
    </div>
  );
}
