import code from './spiral.ts?code';
import { Tracer, grid, vars } from '../../lib/trace';
import type { L, Problem, Tone } from '../../types';
import { matrixErr, randMatrix } from './_util';

// #region visited
export function spiralVisited(matrix: number[][]): number[] {
  if (matrix.length === 0) return [];
  const rows = matrix.length;
  const cols = matrix[0].length;
  const seen = matrix.map((row) => row.map(() => false)); // a whole second matrix
  const dr = [0, 1, 0, -1]; // right, down, left, up
  const dc = [1, 0, -1, 0];
  const out: number[] = [];
  let r = 0;
  let c = 0;
  let dir = 0;
  for (let k = 0; k < rows * cols; k++) {
    out.push(matrix[r][c]);
    seen[r][c] = true;
    const nr = r + dr[dir];
    const nc = c + dc[dir];
    // Turn right when the next cell is outside the matrix or already visited.
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) dir = (dir + 1) % 4;
    r += dr[dir];
    c += dc[dir];
  }
  return out;
}
// #endregion

// #region layers
export function spiral(matrix: number[][]): number[] {
  const out: number[] = [];
  if (matrix.length === 0) return out;
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1; // @init
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(matrix[top][c]); // @right
    top++;
    for (let r = top; r <= bottom; r++) out.push(matrix[r][right]); // @down
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(matrix[bottom][c]); // @left
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(matrix[r][left]); // @up
      left++;
    }
  }
  return out; // @done
}
// #endregion

function trace(m: number[][]) {
  const t = new Tracer();
  const out: number[] = [];
  const done: Record<string, Tone> = {};
  let top = 0;
  let bottom = m.length - 1;
  let left = 0;
  let right = m[0].length - 1;
  const snap = (step: string, caption: L, cells: [number, number][]) => {
    const hl = { ...done };
    for (const [r, c] of cells) hl[`${r},${c}`] = 'active';
    t.add(step, caption, grid(m, hl), vars({ top, bottom, left, right }), vars({ output: out }));
    for (const [r, c] of cells) done[`${r},${c}`] = 'done';
  };
  t.add('init', { en: 'Four boundaries fence in the part of the matrix not yet visited: top, bottom, left, right.', es: 'Cuatro límites encierran la parte de la matriz que aún no se ha visitado: top, bottom, left, right.' }, grid(m), vars({ top, bottom, left, right }));
  while (top <= bottom && left <= right) {
    let cells: [number, number][] = [];
    for (let c = left; c <= right; c++) (cells.push([top, c]), out.push(m[top][c]));
    snap('right', { en: `Walk the **top row** left → right. That row is finished, so move the top boundary down.`, es: `Recorre la **fila superior** de izquierda → derecha. Esa fila está terminada, así que baja el límite superior.` }, cells);
    top++;
    cells = [];
    for (let r = top; r <= bottom; r++) (cells.push([r, right]), out.push(m[r][right]));
    if (cells.length) snap('down', { en: 'Walk the **right column** top → bottom, then move the right boundary in.', es: 'Recorre la **columna derecha** de arriba → abajo y luego mueve el límite derecho hacia dentro.' }, cells);
    right--;
    if (top <= bottom) {
      cells = [];
      for (let c = right; c >= left; c--) (cells.push([bottom, c]), out.push(m[bottom][c]));
      if (cells.length) snap('left', { en: 'Walk the **bottom row** right → left, then move the bottom boundary up. (Only if a row is still left — otherwise we would re-read the top row.)', es: 'Recorre la **fila inferior** de derecha → izquierda y luego sube el límite inferior. (Solo si aún queda una fila; si no, volveríamos a leer la fila superior.)' }, cells);
      bottom--;
    }
    if (left <= right) {
      cells = [];
      for (let r = bottom; r >= top; r--) (cells.push([r, left]), out.push(m[r][left]));
      if (cells.length) snap('up', { en: 'Walk the **left column** bottom → top, then move the left boundary in. One full ring is peeled off.', es: 'Recorre la **columna izquierda** de abajo → arriba y luego mueve el límite izquierdo hacia dentro. Se ha pelado un anillo completo.' }, cells);
      left++;
    }
  }
  t.add('done', { en: `The boundaries crossed: every cell was visited once. Result: **[${out.join(', ')}]**.`, es: `Los límites se cruzaron: cada celda se visitó una vez. Resultado: **[${out.join(', ')}]**.` }, grid(m, done), vars({ output: out }));
  return t.frames;
}

export const spiralProblem: Problem = {
  id: 'spiral',
  title: { en: 'Spiral order', es: 'Orden en espiral' },
  difficulty: 'Medium',
  statement: [{ en: 'Return all elements of an `m × n` matrix in **spiral order**: start at the top-left, go right, then down, then left, then up, and keep spiralling inward.', es: 'Devuelve todos los elementos de una matriz `m × n` en **orden en espiral**: empieza arriba a la izquierda, ve a la derecha, luego abajo, luego a la izquierda, luego arriba, y sigue girando en espiral hacia dentro.' }],
  examples: [{ input: 'matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', output: '[1, 2, 3, 6, 9, 8, 7, 4, 5]' }],
  insight:
    { en: 'You do not need to remember *which cells* you have visited — only **where the unvisited rectangle is**. Four numbers (top, bottom, left, right) describe it. Walk one edge, then shrink that boundary by one. This replaces an entire boolean matrix with four integers. The two `if` guards handle a single leftover row or column.', es: 'No necesitas recordar *qué celdas* has visitado, solo **dónde está el rectángulo sin visitar**. Cuatro números (top, bottom, left, right) lo describen. Recorre un borde y luego encoge ese límite en uno. Esto reemplaza una matriz booleana entera por cuatro enteros. Las dos guardas `if` manejan una sola fila o columna sobrante.' },
  approaches: [
    { id: 'visited', label: { en: 'Simulate with a visited matrix', es: 'Simular con una matriz de visitados' }, kind: 'brute', fn: spiralVisited, time: 'O(m·n)', space: 'O(m·n)', note: { en: 'Move in the current direction and turn right whenever the next cell is out of bounds or already seen. Works, but needs a second matrix the same size as the input.', es: 'Avanza en la dirección actual y gira a la derecha cuando la siguiente celda esté fuera de los límites o ya vista. Funciona, pero necesita una segunda matriz del mismo tamaño que la entrada.' } },
    { id: 'layers', label: { en: 'Shrinking boundaries', es: 'Límites que se encogen' }, kind: 'optimal', fn: spiral, time: 'O(m·n)', space: 'O(1)', note: { en: 'Every cell must be read once, so the time cannot improve — the win here is **memory**: O(1) extra instead of O(m·n).', es: 'Cada celda debe leerse una vez, así que el tiempo no puede mejorar: la ganancia aquí es la **memoria**: O(1) extra en lugar de O(m·n).' } },
  ],
  code,
  cases: [
    { name: { en: '3 × 3', es: '3 × 3' }, args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
    { name: { en: '3 × 4 (wide)', es: '3 × 4 (ancha)' }, args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
    { name: { en: 'empty matrix', es: 'matriz vacía' }, args: [[]], expected: [] },
    { name: { en: '1 × 1', es: '1 × 1' }, args: [[[7]]], expected: [7] },
    { name: { en: 'single row', es: 'una sola fila' }, args: [[[1, 2, 3, 4]]], expected: [1, 2, 3, 4] },
    { name: { en: 'single column', es: 'una sola columna' }, args: [[[1], [2], [3]]], expected: [1, 2, 3] },
    { name: { en: '4 × 2 (tall)', es: '4 × 2 (alta)' }, args: [[[1, 2], [3, 4], [5, 6], [7, 8]]], expected: [1, 2, 4, 6, 8, 7, 5, 3] },
    { name: { en: '2 × 2', es: '2 × 2' }, args: [[[1, 2], [3, 4]]], expected: [1, 2, 4, 3] },
    { name: { en: '4 × 4', es: '4 × 4' }, args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]], expected: [1, 2, 3, 4, 8, 12, 16, 15, 14, 13, 9, 5, 6, 7, 11, 10] },
  ],
  bench: { sizes: [10, 30, 100, 300, 1000], nLabel: { en: 'matrix side (n × n cells)', es: 'lado de la matriz (n × n celdas)' }, gen: (n) => [randMatrix(n, n + (n < 20 ? n % 3 : 0))] },
  demo: {
    inputs: [{ name: 'matrix', value: '[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]' }],
    validate: (m) => matrixErr(m, 6),
    traces: { layers: trace },
  },
};
