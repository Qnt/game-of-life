export type Coords = {
  x: number;
  y: number;
};

export type Cell = {
  curAlive: boolean;
  nextAlive?: boolean;
};

export interface GameState {
  isRunning: boolean;
  runningIntervalId?: number;
  generationCount: number;
  speed: number;
  cellsData: Cell[][];
  cellSize: number;
  rows: number;
  cols: number;
}

export interface View {
  displayCells(): void;
  displayGameInfo(): void;
}

export interface Controller {
  initGame(): void;
  writeToStorage(storageId: string): void;
  readFromStorage(storageId: string): GameState | null;
  generetaCellsData(): Cell[][];
  startGame(): void;
  updateGame(): void;
  pauseGame(): void;
  resetGame(): void;
  toggleCell(col: number, row: number): void;
}
