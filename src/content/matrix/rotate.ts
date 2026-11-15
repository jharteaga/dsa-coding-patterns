import code from './rotate.ts?code';
import type { Problem } from '../../types';
import { randMatrix } from './_util';

// #region copy
export function rotateCopy(matrix: number[][]): void {
  const n = matrix.length;
  const copy = matrix.map((row) => [...row]); // O(n²) extra memory
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      // Row r becomes column n-1-r.
      matrix[c][n - 1 - r] = copy[r][c];
    }
  }
}
// #endregion

// #region inplace
export function rotate(matrix: number[][]): void {
  const n = matrix.length;
  // 1. Transpose: flip over the main diagonal (rows become columns).
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) {
      [matrix[r][c], matrix[c][r]] = [matrix[c][r], matrix[r][c]];
    }
  }
  // 2. Reverse every row.
  for (const row of matrix) row.reverse();
}
// #endregion

export const rotateProblem: Problem = {
  id: 'rotate',
  title: { en: 'Rotate an image by 90°', es: 'Rotar una imagen 90°' },
  difficulty: 'Medium',
  statement: [{ en: 'Rotate an `n × n` matrix by 90 degrees clockwise, **in place** (modify the input; do not return a new matrix).', es: 'Rota una matriz `n × n` 90 grados en sentido horario, **en el lugar** (modifica la entrada; no devuelvas una matriz nueva).' }],
  examples: [{ input: 'matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', output: '[[7, 4, 1], [8, 5, 2], [9, 6, 3]]' }],
  insight:
    { en: 'A 90° rotation is hard to do directly without overwriting cells you still need. But it is the combination of **two simple moves that are each easy in place**: transpose the matrix (swap `[r][c]` with `[c][r]`), then reverse each row. Each move only swaps pairs of cells, so no copy is needed.', es: 'Una rotación de 90° es difícil de hacer directamente sin sobrescribir celdas que todavía necesitas. Pero es la combinación de **dos movimientos simples, cada uno fácil de hacer en el lugar**: transponer la matriz (intercambiar `[r][c]` con `[c][r]`) y luego invertir cada fila. Cada movimiento solo intercambia pares de celdas, así que no hace falta ninguna copia.' },
  approaches: [
    { id: 'copy', label: { en: 'Copy, then write back', es: 'Copiar y luego escribir de vuelta' }, kind: 'brute', fn: rotateCopy, time: 'O(n²)', space: 'O(n²)', note: { en: 'Uses the rule "row r becomes column n−1−r" with a full copy of the matrix as the source.', es: 'Usa la regla "la fila r se convierte en la columna n−1−r" con una copia completa de la matriz como origen.' } },
    { id: 'inplace', label: { en: 'Transpose + reverse rows', es: 'Transponer + invertir filas' }, kind: 'optimal', fn: rotate, time: 'O(n²)', space: 'O(1)', note: { en: 'Every cell must move, so O(n²) time is unavoidable. The improvement is zero extra memory.', es: 'Cada celda tiene que moverse, así que el tiempo O(n²) es inevitable. La mejora es cero memoria extra.' } },
  ],
  code,
  mutates: true,
  adapt: { out: (_r, args) => args[0] },
  cases: [
    { name: { en: '3 × 3', es: '3 × 3' }, args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
    { name: { en: 'empty', es: 'vacía' }, args: [[]], expected: [] },
    { name: { en: '1 × 1', es: '1 × 1' }, args: [[[5]]], expected: [[5]] },
    { name: { en: '2 × 2', es: '2 × 2' }, args: [[[1, 2], [3, 4]]], expected: [[3, 1], [4, 2]] },
    { name: { en: '4 × 4', es: '4 × 4' }, args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], expected: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
    { name: { en: 'all equal', es: 'todos iguales' }, args: [[[1, 1], [1, 1]]], expected: [[1, 1], [1, 1]] },
    { name: { en: 'negatives', es: 'negativos' }, args: [[[-1, -2], [-3, -4]]], expected: [[-3, -1], [-4, -2]] },
    { name: { en: 'identity-like', es: 'tipo identidad' }, args: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: [[0, 0, 1], [0, 1, 0], [1, 0, 0]] },
  ],
  bench: { sizes: [10, 30, 100, 300, 1000], nLabel: { en: 'matrix side (n × n cells)', es: 'lado de la matriz (n × n celdas)' }, gen: (n) => [randMatrix(n, n)] },
};
