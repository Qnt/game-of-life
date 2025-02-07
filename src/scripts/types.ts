export type Coords = {
  x: number;
  y: number;
};

export type Cell = {
  curAlive: boolean;
  nextAlive?: boolean;
};

export type GameState = {
  isRunning: boolean;
  runningIntervalId?: number;
  generationCount: number;
  speed: number;
  cellsData: Cell[][];
};

export type View = {
  displayCells(): void;
  displayGameInfo(): void;
};

export type Controller = {
  startGame(): void;
  updateGame(): void;
  pauseGame(): void;
  resetGame(): void;
  toggleCell(coords: Coords): void;
};
