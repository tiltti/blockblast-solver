import { useState, useEffect, useCallback } from 'react';
import type { Grid as GridType, Piece, Solution } from './types/index';
import { Grid } from './components/Grid';
import { PieceSelector } from './components/PieceSelector';
import { SolutionDisplay } from './components/SolutionDisplay';
import { createEmptyGrid, copyGrid } from './utils/grid';
import { solve } from './utils/solver';
import { saveState, loadState, clearState, getDefaultState } from './utils/storage';

function App() {
  const [board, setBoard] = useState<GridType>(() => loadState().board);
  const [selectedPieces, setSelectedPieces] = useState<(Piece | null)[]>(() => loadState().selectedPieces);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Save state on changes
  useEffect(() => {
    saveState({ board, selectedPieces });
  }, [board, selectedPieces]);

  const handleCellClick = useCallback((row: number, col: number) => {
    setBoard(prev => {
      const newBoard = copyGrid(prev);
      newBoard[row][col] = !newBoard[row][col];
      return newBoard;
    });
    // Clear solution when board changes
    setSolution(null);
    setError(undefined);
  }, []);

  const handleCellPaint = useCallback((row: number, col: number, value: boolean) => {
    setBoard(prev => {
      const newBoard = copyGrid(prev);
      newBoard[row][col] = value;
      return newBoard;
    });
    // Clear solution when board changes
    setSolution(null);
    setError(undefined);
  }, []);

  const handlePieceSelect = useCallback((index: number, piece: Piece | null) => {
    setSelectedPieces(prev => {
      const newPieces = [...prev];
      newPieces[index] = piece;
      return newPieces;
    });
    // Clear solution when pieces change
    setSolution(null);
    setError(undefined);
  }, []);

  const handleSolve = useCallback(() => {
    const validPieces = selectedPieces.filter((p): p is Piece => p !== null);
    if (validPieces.length === 0) {
      setError('Please select at least one piece to solve');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const result = solve(board, validPieces);
        if (result) {
          setSolution(result);
        } else {
          setError('No solution found! The pieces cannot fit on the board.');
        }
      } catch (e) {
        setError('An error occurred while solving');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, [board, selectedPieces]);

  const handleClearBoard = useCallback(() => {
    setBoard(createEmptyGrid());
    setSolution(null);
    setError(undefined);
  }, []);

  const handleReset = useCallback(() => {
    const defaultState = getDefaultState();
    setBoard(defaultState.board);
    setSelectedPieces(defaultState.selectedPieces);
    setSolution(null);
    setError(undefined);
    clearState();
  }, []);

  // Called when user clicks "Solved!" - updates board to final state and clears pieces
  const handleSolved = useCallback((finalBoard: GridType) => {
    setBoard(finalBoard);
    setSelectedPieces([null, null, null]);
    setSolution(null);
    setError(undefined);
  }, []);

  return (
    <div className="min-h-screen bg-[#c4b8a5] py-4 sm:py-6 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Block Blast Solver</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Set up board, select pieces, solve!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Left Column: Board Setup */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl p-3 sm:p-6 shadow-lg">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-700">Game Board</h2>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={handleClearBoard}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                Click or drag to paint cells.
              </p>
              <div className="flex justify-center">
                <Grid grid={board} onCellClick={handleCellClick} onCellPaint={handleCellPaint} interactive />
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-6 shadow-lg">
              <PieceSelector
                selectedPieces={selectedPieces}
                onPieceSelect={handlePieceSelect}
              />
            </div>

            <button
              onClick={handleSolve}
              disabled={isLoading}
              className={`
                w-full py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-bold transition-all
                ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              {isLoading ? 'Solving...' : 'Solve!'}
            </button>
          </div>

          {/* Right Column: Solution */}
          <div className="bg-white rounded-xl p-3 sm:p-6 shadow-lg">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Solution</h2>
            <SolutionDisplay solution={solution} isLoading={isLoading} error={error} onSolved={handleSolved} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
