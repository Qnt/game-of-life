import { getCoordsFromClientXY, throttle } from '../libs/utils';
import { Cell, Controller, GameState, View } from './types';

const CELL_SIZE = 10;
const ROWS = 40;
const COLS = 70;
const STORAGE_ID = 'game-of-life';
const DEFAULT_GAME_STATE: GameState = {
  isRunning: false,
  runningIntervalId: 0,
  generationCount: 0,
  speed: 500,
  cellsData: [],
  cellSize: CELL_SIZE,
  rows: ROWS,
  cols: COLS,
};

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
});

pauseBtnEl.addEventListener('click', () => {
  controller.pauseGame();
});

resetBtnEl.addEventListener('click', () => {
  controller.resetGame();
});

canvasEl.addEventListener('mousedown', handleClick);

function handleClick(event: MouseEvent) {
  const canvasRect = canvasEl.getBoundingClientRect();
  const normalizedX = event.clientX - canvasRect.left;
  const normalizedY = event.clientY - canvasRect.top;
  const coords = { x: normalizedX, y: normalizedY };
  const { col, row } = getCoordsFromClientXY({
    coords,
    canvasRect,
    cols: model.cols,
    rows: model.rows,
  });
  controller.toggleCell(col, row);
  view.displayCells();
}

const model: GameState = { ...DEFAULT_GAME_STATE };

const controller: Controller = {
  initGame() {
    const storedData = controller.readFromStorage(STORAGE_ID);
    if (storedData) {
      Object.assign(model, storedData);
    } else {
      Object.assign(model, {
        ...DEFAULT_GAME_STATE,
        cellsData: this.generetaCellsData(),
      });
    }
  },

  writeToStorage(storageId) {
    localStorage.setItem(storageId, JSON.stringify(model));
  },

  readFromStorage(storageId) {
    const storedData = localStorage.getItem(storageId);
    if (!storedData) return null;
    const parsedData = JSON.parse(storedData) as GameState;
    return parsedData;
  },

  startGame() {
    clearInterval(model.runningIntervalId);
    model.runningIntervalId = setInterval(
      () => controller.updateGame(),
      model.speed
    );
    model.isRunning = true;
    this.writeToStorage(STORAGE_ID);
    document.dispatchEvent(new Event('game-state-changed'));
  },

  generetaCellsData() {
    return new Array(model.rows).fill(null).map(() =>
      new Array(model.cols).fill(null).map(
        () =>
          ({
            curAlive: false,
            nextAlive: false,
          } satisfies Cell)
      )
    );
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
    model.generationCount += 1;
    this.writeToStorage(STORAGE_ID);
    document.dispatchEvent(new Event('game-state-changed'));
  },

  pauseGame() {
    if (!model.isRunning) return;
    clearInterval(model.runningIntervalId);
    model.isRunning = false;
    this.writeToStorage(STORAGE_ID);
    document.dispatchEvent(new Event('game-state-changed'));
  },

  resetGame() {
    clearInterval(model.runningIntervalId);
    model.isRunning = false;
    model.generationCount = 0;
    model.cellsData = controller.generetaCellsData();
    this.writeToStorage(STORAGE_ID);
    document.dispatchEvent(new Event('game-state-changed'));
  },

  toggleCell(col, row) {
    const cell = model.cellsData[row][col];
    cell.curAlive = !cell.curAlive;
    this.writeToStorage(STORAGE_ID);
    document.dispatchEvent(new Event('game-state-changed'));
  },
};

const view: View = {
  displayCells() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    for (let i = 0; i < model.cellsData.length; i++) {
      for (let j = 0; j < model.cellsData[0].length; j++) {
        const cell = model.cellsData[i][j];
        const offsetX = j * model.cellSize;
        const offsetY = i * model.cellSize;

        if (cell.curAlive) {
          ctx.fillRect(offsetX, offsetY, model.cellSize, model.cellSize);
        } else {
          ctx.clearRect(offsetX, offsetY, model.cellSize, model.cellSize);
          ctx.strokeRect(offsetX, offsetY, model.cellSize, model.cellSize);
        }
      }
    }
  },

  displayGameInfo() {
    statusEl.textContent = model.isRunning ? 'running' : 'paused';
    generationCountEl.textContent = `${model.generationCount}`;
  },
};

function init() {
  controller.initGame();
  if (model.isRunning) {
    controller.startGame();
  }
  view.displayCells();
  view.displayGameInfo();
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio;
  canvasEl.width = model.cellSize * model.cols * dpr;
  canvasEl.height = model.cellSize * model.rows * dpr;
  ctx.scale(dpr, dpr);
  view.displayCells();
}

window.addEventListener('load', () => {
  init();
  resizeCanvas();
});
window.addEventListener('resize', throttle(resizeCanvas, 300));
