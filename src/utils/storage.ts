import type { AppState } from '../types/index';
import { createEmptyGrid } from './grid';
import { ALL_PIECES } from '../data/pieces';

const STORAGE_KEY = 'block-blast-solver-state';

export function saveState(state: AppState): void {
  try {
    const serialized = JSON.stringify({
      board: state.board,
      selectedPieceIds: state.selectedPieces.map(p => p?.id ?? null),
    });
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function loadState(): AppState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return getDefaultState();
    }

    const data = JSON.parse(serialized);
    const selectedPieces = (data.selectedPieceIds as (string | null)[]).map(id => {
      if (!id) return null;
      return ALL_PIECES.find(p => p.id === id) ?? null;
    });

    return {
      board: data.board,
      selectedPieces,
    };
  } catch (e) {
    console.error('Failed to load state:', e);
    return getDefaultState();
  }
}

export function getDefaultState(): AppState {
  return {
    board: createEmptyGrid(),
    selectedPieces: [null, null, null],
  };
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
