import code from './flat-search.ts?code';
import { randInt } from '../../lib/ds';
import type { Problem } from '../../types';

// #region scan
export function searchFlatScan(matrix: number[][], target: number): boolean {
  for (const row of matrix) {
    if (row.includes(target)) return true;
  }
  return false;
}
// #endregion

// #region binary
export function searchFlat(matrix: number[][], target: number): boolean {
  if (matrix.length === 0) return false;
  const cols = matrix[0].length;
  // Pretend the matrix is one long sorted array of rows * cols elements.
  let lo = 0;
  let hi = matrix.length * cols - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = matrix[Math.floor(mid / cols)][mid % cols]; // index -> (row, col)
    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}
// #endregion

const flatGrid = (rows: number, cols: number) => Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => 2 * (r * cols + c)));

export const flatSearch: Problem = {
  id: 'flat-search',
  title: { en: 'Search a fully sorted matrix', es: 'Buscar en una matriz totalmente ordenada' },
  difficulty: 'Medium',
  statement: [
    { en: 'Each row is sorted left to right **and** the first value of each row is greater than the last value of the previous row. Return whether `target` is in the matrix, in O(log(m·n)).', es: 'Cada fila está ordenada de izquierda a derecha **y** el primer valor de cada fila es mayor que el último valor de la fila anterior. Devuelve si `target` está en la matriz, en O(log(m·n)).' },
  ],
  examples: [{ input: 'matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 16', output: 'true' }],
  insight:
    { en: 'Read row after row and you get **one long sorted array** — the matrix is just that array folded into lines. So do an ordinary binary search over indices `0 … m·n − 1`, and translate an index into coordinates when you need to look: `row = index / cols` (rounded down), `col = index % cols`.', es: 'Lee fila tras fila y obtienes **un único arreglo ordenado largo**: la matriz es solo ese arreglo doblado en líneas. Así que haz una búsqueda binaria normal sobre los índices `0 … m·n − 1`, y traduce un índice a coordenadas cuando necesites mirar: `row = index / cols` (redondeado hacia abajo), `col = index % cols`.' },
  approaches: [
    { id: 'scan', label: { en: 'Look at every cell', es: 'Mirar cada celda' }, kind: 'brute', fn: searchFlatScan, time: 'O(m·n)', space: 'O(1)', note: { en: 'Checks each row with a linear scan.', es: 'Revisa cada fila con un recorrido lineal.' } },
    { id: 'binary', label: { en: 'Binary search on a virtual 1D array', es: 'Búsqueda binaria sobre un arreglo 1D virtual' }, kind: 'optimal', fn: searchFlat, time: 'O(log(m·n))', space: 'O(1)', note: { en: 'The matrix is never actually flattened — only the index arithmetic changes.', es: 'La matriz nunca se aplana de verdad: solo cambia la aritmética de índices.' } },
  ],
  code,
  cases: [
    { name: { en: 'target present', es: 'target presente' }, args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 16], expected: true },
    { name: { en: 'target absent', es: 'target ausente' }, args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], expected: false },
    { name: { en: 'empty matrix', es: 'matriz vacía' }, args: [[], 3], expected: false },
    { name: { en: '1 × 1, found', es: '1 × 1, encontrado' }, args: [[[1]], 1], expected: true },
    { name: { en: '1 × 1, missing', es: '1 × 1, ausente' }, args: [[[1]], 2], expected: false },
    { name: { en: 'first cell', es: 'primera celda' }, args: [[[1, 3], [5, 7]], 1], expected: true },
    { name: { en: 'last cell', es: 'última celda' }, args: [[[1, 3], [5, 7]], 7], expected: true },
    { name: { en: 'between two rows', es: 'entre dos filas' }, args: [[[1, 3], [5, 7]], 4], expected: false },
    { name: { en: 'single column', es: 'una sola columna' }, args: [[[1], [3], [5]], 3], expected: true },
    { name: { en: 'single row', es: 'una sola fila' }, args: [[[1, 3, 5]], 6], expected: false },
  ],
  bench: {
    sizes: [10, 30, 100, 300, 1000],
    nLabel: { en: 'matrix side (n × n cells)', es: 'lado de la matriz (n × n celdas)' },
    gen: (n) => [flatGrid(n, n), n < 20 ? randInt(0, 2 * n * n) : 2 * n * n + 1],
  },
};
