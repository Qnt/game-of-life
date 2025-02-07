import { Cell, GameState, View, Controller, Coords } from './types';

const DEFAULT_CELLS_DATA: Cell[][] = new Array(20).fill(null).map(() =>
  new Array(20).fill(null).map(
    () =>
      ({
        curAlive: false,
        nextAlive: false,
      } satisfies Cell)
  )
);

const OFFSET_MATRIX = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

function init() {
  const canvasEl = document.getElementById('game-of-life') as HTMLCanvasElement;
  const ctx = canvasEl.getContext('2d') as CanvasRenderingContext2D;
  const statusEl = document.querySelector(
    '[data-game-status]'
  ) as HTMLSpanElement;
  const generationCountEl = document.querySelector(
    '[data-game-generation]'
  ) as HTMLSpanElement;
  const nextGenBtnEl = document.getElementById('next-gen') as HTMLButtonElement;
  const startBtnEl = document.getElementById('start') as HTMLButtonElement;
  const pauseBtnEl = document.getElementById('pause') as HTMLButtonElement;
  const resetBtnEl = document.getElementById('reset') as HTMLButtonElement;

  document.addEventListener('game-state-changed', () => {
    view.displayCells();
    view.displayGameInfo();
  });

  nextGenBtnEl.addEventListener('click', () => {
    controller.updateGame();
  });

  startBtnEl.addEventListener('click', () => {
    controller.startGame();
    model.runningIntervalId = setInterval(controller.updateGame, model.speed);
  });

  pauseBtnEl.addEventListener('click', () => {
    controller.pauseGame();
  });

  resetBtnEl.addEventListener('click', () => {
    controller.resetGame();
  });

  canvasEl.addEventListener('mousedown', handleClick);
  function handleClick(event: MouseEvent) {
    const rect = canvasEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      controller.toggleCell({ x, y });
      view.displayCells();
    }
  }

  const model: GameState = {
    isRunning: false,
    runningIntervalId: 0,
    generationCount: 0,
    speed: 500,
    cellsData: structuredClone(DEFAULT_CELLS_DATA),
  };

  const controller: Controller = {
    startGame() {
      if (model.isRunning) return;
      model.isRunning = true;
      document.dispatchEvent(new Event('game-state-changed'));
    },

    updateGame() {
      const cellsData = model.cellsData;
      function isValidNeighborCell(row: number, col: number) {
        if (row < 0 || col < 0) {
          return false;
        }
        if (row >= cellsData.length || col >= cellsData[row].length) {
          return false;
        }
        return true;
      }

      for (let i = 0; i < cellsData.length; i++) {
        for (let j = 0; j < cellsData[i].length; j++) {
          const curCell = cellsData[i][j];
          let aliveNeighbors = 0;
          for (const [offsetX, offsetY] of OFFSET_MATRIX) {
            if (isValidNeighborCell(i + offsetX, j + offsetY)) {
              const neighborCell = cellsData[i + offsetX][j + offsetY];
              aliveNeighbors += +neighborCell.curAlive;
            }
          }
          if (curCell.curAlive) {
            curCell.nextAlive = aliveNeighbors === 2 || aliveNeighbors === 3;
          } else {
            curCell.nextAlive = aliveNeighbors === 3;
          }
        }
      }

      for (const row of model.cellsData) {
        for (const cell of row) {
          cell.curAlive = cell.nextAlive ?? cell.curAlive;
          cell.nextAlive = false;
        }
      }
      model.generationCount++;

      document.dispatchEvent(new Event('game-state-changed'));
    },
    pauseGame() {
      if (!model.isRunning) return;
      clearInterval(model.runningIntervalId);
      model.isRunning = false;
      document.dispatchEvent(new Event('game-state-changed'));
    },
    resetGame() {
      if (model.isRunning) {
        clearInterval(model.runningIntervalId);
        model.isRunning = false;
      }
      model.generationCount = 0;
      model.cellsData = DEFAULT_CELLS_DATA;
      document.dispatchEvent(new Event('game-state-changed'));
    },

    toggleCell({ x, y }: Coords) {
      const cellSize = canvasEl.width / model.cellsData.length;
      const row = Math.floor(x / cellSize);
      const col = Math.floor(y / cellSize);
      const cell = model.cellsData[row][col];
      cell.curAlive = !cell.curAlive;
      document.dispatchEvent(new Event('game-state-changed'));
    },
  };

  const view: View = {
    displayCells() {
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';

      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      const cols = model.cellsData.length;
      let cellSize = canvasEl.width;
      if (cols > 0) {
        cellSize = Math.floor(canvasEl.width / model.cellsData.length);
      }

      for (let i = 0; i < model.cellsData.length; i++) {
        for (let j = 0; j < model.cellsData[i].length; j++) {
          const cell = model.cellsData[i][j];
          const offsetX = i * cellSize;
          const offsetY = j * cellSize;

          if (cell.curAlive) {
            ctx.fillRect(offsetX, offsetY, cellSize, cellSize);
          } else {
            ctx.clearRect(offsetX, offsetY, cellSize, cellSize);
            ctx.strokeRect(offsetX, offsetY, cellSize, cellSize);
          }
        }
      }
    },
    displayGameInfo() {
      statusEl.textContent = model.isRunning ? 'running' : 'paused';
      generationCountEl.textContent = `${model.generationCount}`;
    },
  };

  view.displayCells();
  view.displayGameInfo();
}

window.addEventListener('load', init);
