import { Coords } from '../scripts/types';

export function throttle<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
) {
  let isWaiting = false;

  return (...args: T) => {
    if (isWaiting) return;
    fn(...args);
    isWaiting = true;
    setTimeout(() => (isWaiting = false), delay);
  };
}

export function getCoordsFromClientXY({
  coords,
  cols,
  rows,
  canvasRect,
}: {
  canvasRect: DOMRect;
  coords: Coords;
  cols: number;
  rows: number;
}) {
  const curCellSizeX = canvasRect.width / cols;
  const curCellSizeY = canvasRect.height / rows;
  const col = Math.floor(coords.x / curCellSizeX);
  const row = Math.floor(coords.y / curCellSizeY);
  return { col, row };
}
