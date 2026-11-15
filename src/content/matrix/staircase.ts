import code from './staircase.ts?code';
import { first, intErr } from '../../lib/check';
import { randInt } from '../../lib/ds';
import { Tracer, grid, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { matrixErr } from './_util';

// #region scan
export function searchMatrixScan(matrix: number[][], target: number): boolean {
  for (const row of matrix) {
    for (const value of row) {
      if (value === target) return true;
    }
  }
  return false;
}
// #endregion

// #region rows
export function searchMatrixRows(matrix: number[][], target: number): boolean {
  // Each row is sorted, so binary search every row.
  for (const row of matrix) {
    let lo = 0;
    let hi = row.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (row[mid] === target) return true;
      if (row[mid] < target) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return false;
}
// #endregion

// #region stairs
export function searchMatrix(matrix: number[][], target: number): boolean {
  if (matrix.length === 0) return false;
  let r = 0;
  let c = matrix[0].length - 1; // start at the top-right corner // @init
  while (r < matrix.length && c >= 0) {
    const value = matrix[r][c]; // @look
    if (value === target) return true; // @found
    if (value > target) c--; // everything below in this column is even bigger // @left
    else r++; // everything to the left in this row is even smaller // @down
  }
  return false; // @miss
}
// #endregion

function trace(m: number[][], target: number) {
  const t = new Tracer();
  let r = 0;
  let c = m[0].length - 1;
  const dead: Record<string, Tone> = {};
  let looked = 0;
  t.add('init', { en: 'Start in the **top-right corner**. From there, going left makes values smaller and going down makes them bigger — so one comparison always tells us which way to go.', es: 'Empieza en la **esquina superior derecha**. Desde ahí, ir a la izquierda da valores más pequeños e ir hacia abajo los da más grandes, así que una comparación siempre nos dice hacia dónde ir.' }, grid(m, { [`${r},${c}`]: 'active' }), vars({ target }));
  while (r < m.length && c >= 0) {
    const v = m[r][c];
    looked++;
    if (v === target) {
      t.add('found', { en: `${v} is the target. Found after looking at only ${looked} of ${m.length * m[0].length} cells.`, es: `${v} es el objetivo. Encontrado tras mirar solo ${looked} de ${m.length * m[0].length} celdas.` }, grid(m, { ...dead, [`${r},${c}`]: 'good' }), vars({ target, 'cells looked at': looked }));
      return t.frames;
    }
    if (v > target) {
      for (let k = r; k < m.length; k++) dead[`${k},${c}`] = 'muted';
      t.add('left', { en: `${v} is bigger than ${target}. Everything **below** it in this column is bigger still, so the whole column is ruled out. Step left.`, es: `${v} es mayor que ${target}. Todo lo que está **debajo** en esta columna es aún mayor, así que se descarta la columna entera. Paso a la izquierda.` }, grid(m, { ...dead, [`${r},${c}`]: 'bad' }), vars({ target, 'cells looked at': looked }));
      c--;
    } else {
      for (let k = 0; k <= c; k++) dead[`${r},${k}`] = 'muted';
      t.add('down', { en: `${v} is smaller than ${target}. Everything to its **left** in this row is smaller still, so the whole row is ruled out. Step down.`, es: `${v} es menor que ${target}. Todo lo que está a su **izquierda** en esta fila es aún menor, así que se descarta la fila entera. Paso hacia abajo.` }, grid(m, { ...dead, [`${r},${c}`]: 'bad' }), vars({ target, 'cells looked at': looked }));
      r++;
    }
    if (r < m.length && c >= 0) t.add('look', { en: `Now at row ${r}, column ${c}: ${m[r][c]}.`, es: `Ahora en la fila ${r}, columna ${c}: ${m[r][c]}.` }, grid(m, { ...dead, [`${r},${c}`]: 'active' }), vars({ target, 'cells looked at': looked }));
  }
  t.add('miss', { en: `Walked off the matrix: ${target} is not present. Looked at ${looked} cells — at most rows + columns.`, es: `Salimos de la matriz: ${target} no está. Miramos ${looked} celdas: como máximo filas + columnas.` }, grid(m, dead), vars({ 'cells looked at': looked }));
  return t.frames;
}

/** rows and columns both ascending */
const sortedGrid = (n: number) => Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => 3 * (r + c) + ((r * 7 + c * 3) % 3)));

export const staircase: Problem = {
  id: 'staircase',
  title: { en: 'Search a row- and column-sorted matrix', es: 'Buscar en una matriz ordenada por filas y columnas' },
  difficulty: 'Medium',
  statement: [
    { en: 'Every **row** of the matrix is sorted left to right and every **column** is sorted top to bottom. (A row does not have to start after the previous row ends.) Return whether `target` is in the matrix.', es: 'Cada **fila** de la matriz está ordenada de izquierda a derecha y cada **columna** de arriba abajo. (Una fila no tiene que empezar después de donde termina la anterior.) Devuelve si `target` está en la matriz.' },
  ],
  examples: [{ input: 'matrix = [[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], target = 5', output: 'true' }],
  insight:
    { en: 'Pick a corner where the two directions disagree. At the **top-right**, moving left gives smaller values and moving down gives larger ones. So compare with the target: if the cell is too big, its entire column (below it) is too big — step left. If too small, its entire row (to the left) is too small — step down. Each step deletes a full row or column, so at most rows + columns steps.', es: 'Elige una esquina donde las dos direcciones no coincidan. En la **superior derecha**, moverse a la izquierda da valores más pequeños y moverse hacia abajo da valores más grandes. Así que compara con el objetivo: si la celda es demasiado grande, toda su columna (debajo de ella) es demasiado grande: paso a la izquierda. Si es demasiado pequeña, toda su fila (a la izquierda) es demasiado pequeña: paso hacia abajo. Cada paso elimina una fila o columna completa, así que como máximo hay filas + columnas pasos.' },
  approaches: [
    { id: 'scan', label: { en: 'Look at every cell', es: 'Mirar cada celda' }, kind: 'brute', fn: searchMatrixScan, time: 'O(m·n)', space: 'O(1)', note: { en: 'Ignores both sort orders.', es: 'Ignora ambos órdenes.' } },
    { id: 'rows', label: { en: 'Binary search each row', es: 'Búsqueda binaria en cada fila' }, kind: 'better', fn: searchMatrixRows, time: 'O(m·log n)', space: 'O(1)', note: { en: 'Uses the row order but not the column order.', es: 'Usa el orden de las filas pero no el de las columnas.' } },
    { id: 'stairs', label: { en: 'Staircase walk from the top-right', es: 'Recorrido en escalera desde la esquina superior derecha' }, kind: 'optimal', fn: searchMatrix, time: 'O(m + n)', space: 'O(1)', note: { en: 'Uses both orders at once. The bottom-left corner works just as well; the other two corners do not (both directions would move the same way).', es: 'Usa ambos órdenes a la vez. La esquina inferior izquierda funciona igual de bien; las otras dos esquinas no (ambas direcciones moverían los valores en el mismo sentido).' } },
  ],
  code,
  cases: [
    { name: { en: 'target present', es: 'target presente' }, args: [[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], 5], expected: true },
    { name: { en: 'target absent (falls in a gap)', es: 'target ausente (cae en un hueco)' }, args: [[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], 15], expected: false },
    { name: { en: 'empty matrix', es: 'matriz vacía' }, args: [[], 1], expected: false },
    { name: { en: '1 × 1, found', es: '1 × 1, encontrado' }, args: [[[5]], 5], expected: true },
    { name: { en: '1 × 1, missing', es: '1 × 1, ausente' }, args: [[[5]], 6], expected: false },
    { name: { en: 'single row', es: 'una sola fila' }, args: [[[1, 3, 5, 7]], 7], expected: true },
    { name: { en: 'single column', es: 'una sola columna' }, args: [[[1], [3], [5]], 4], expected: false },
    { name: { en: 'target is the top-left (smallest)', es: 'target es la esquina superior izquierda (el menor)' }, args: [[[1, 4], [2, 5]], 1], expected: true },
    { name: { en: 'target is the bottom-right (largest)', es: 'target es la esquina inferior derecha (el mayor)' }, args: [[[1, 4], [2, 5]], 5], expected: true },
    { name: { en: 'smaller than everything', es: 'menor que todo' }, args: [[[1, 4], [2, 5]], 0], expected: false },
    { name: { en: 'larger than everything', es: 'mayor que todo' }, args: [[[1, 4], [2, 5]], 9], expected: false },
  ],
  bench: {
    sizes: [10, 30, 100, 300, 1000],
    nLabel: { en: 'matrix side (n × n cells; target absent)', es: 'lado de la matriz (n × n celdas; target ausente)' },
    gen: (n) => (n < 20 ? [sortedGrid(n), randInt(0, 6 * n)] : [sortedGrid(n), -1]),
  },
  demo: {
    inputs: [
      { name: 'matrix (rows and columns sorted)', value: '[[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24]]' },
      { name: 'target', value: '13' },
    ],
    validate: (m, target) =>
      first(matrixErr(m, 6), intErr(target, 'target'), (m as number[][]).some((row, r) => row.some((v, c) => (c > 0 && row[c - 1] > v) || (r > 0 && m[r - 1][c] > v))) ? { en: 'Every row must be sorted left→right and every column top→bottom.', es: 'Cada fila debe estar ordenada de izquierda→derecha y cada columna de arriba→abajo.' } : null),
    traces: { stairs: trace },
  },
};
