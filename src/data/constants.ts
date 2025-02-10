import { GameState } from '../scripts/types';

export const CELL_SIZE = 10;
export const ROWS = 40;
export const COLS = 70;
export const STORAGE_ID = 'game-of-life';
export const DEFAULT_SPEED = 500;
export const DEFAULT_GAME_STATE: GameState = {
  isRunning: false,
  runningIntervalId: 0,
  generationCount: 0,
  speed: 500,
  cellsData: [],
  cellSize: CELL_SIZE,
  rows: ROWS,
  cols: COLS,
};

export const OFFSET_MATRIX = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];
