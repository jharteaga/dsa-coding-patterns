import code from './islands.ts?code';
import { Tracer, grid, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { matrixErr, randMatrix } from './_util';

// #region relabel
export function numIslandsRelabel(grid: number[][]): number {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  // Give every land cell its own label...
  const label = grid.map((row, r) => row.map((cell, c) => (cell === 1 ? r * cols + c : -1)));
  // ...then let each cell copy the smallest label among its neighbours,
  // sweeping the whole grid again and again until nothing changes.
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (label[r][c] === -1) continue;
        for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || label[nr][nc] === -1) continue;
          if (label[nr][nc] < label[r][c]) {
            label[r][c] = label[nr][nc];
            changed = true;
          }
        }
      }
    }
  }
  return new Set(label.flat().filter((x) => x !== -1)).size;
}
// #endregion

// #region flood
export function numIslands(grid: number[][]): number {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const seen = grid.map((row) => row.map(() => false));
  let islands = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || seen[r][c]) continue; // @scan
      islands++; // unvisited land = a brand-new island // @new
      // Flood fill: mark every cell reachable from here.
      const stack = [[r, c]];
      seen[r][c] = true;
      while (stack.length > 0) {
        const [cr, cc] = stack.pop() as number[]; // @pop
        for (const [nr, nc] of [[cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]]) {
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (grid[nr][nc] !== 1 || seen[nr][nc]) continue;
          seen[nr][nc] = true; // @mark
          stack.push([nr, nc]);
        }
      }
    }
  }
  return islands; // @done
}
// #endregion

function trace(g: number[][]) {
  const t = new Tracer();
  const rows = g.length;
  const cols = g[0].length;
  const hl: Record<string, Tone> = {};
  const tones: Tone[] = ['good', 'compare', 'alt', 'window', 'done'];
  g.forEach((row, r) => row.forEach((cell, c) => cell !== 1 && (hl[`${r},${c}`] = 'muted')));
  const seen = g.map((row) => row.map(() => false));
  let islands = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (g[r][c] !== 1 || seen[r][c]) continue;
      islands++;
      const tone = tones[(islands - 1) % tones.length];
      hl[`${r},${c}`] = 'active';
      t.add('new', { en: `Scanning row by row, we hit land at (${r}, ${c}) that no earlier flood has reached. That is island **#${islands}**. Now flood outward to claim all of it.`, es: `Recorriendo fila por fila, encontramos tierra en (${r}, ${c}) a la que ningún relleno anterior ha llegado. Esa es la isla **#${islands}**. Ahora rellenamos hacia fuera para reclamarla entera.` }, grid(g, hl), vars({ islands }));
      const stack = [[r, c]];
      seen[r][c] = true;
      while (stack.length) {
        const [cr, cc] = stack.pop()!;
        hl[`${cr},${cc}`] = tone;
        const added: string[] = [];
        for (const [nr, nc] of [[cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]]) {
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || g[nr][nc] !== 1 || seen[nr][nc]) continue;
          seen[nr][nc] = true;
          hl[`${nr},${nc}`] = 'active';
          stack.push([nr, nc]);
          added.push(`(${nr}, ${nc})`);
        }
        t.add(added.length ? 'mark' : 'pop', added.length ? { en: `From (${cr}, ${cc}), spread to its unvisited land neighbours: ${added.join(', ')}. They are marked now so no one visits them twice.`, es: `Desde (${cr}, ${cc}), nos extendemos a sus vecinos de tierra no visitados: ${added.join(', ')}. Se marcan ahora para que nadie los visite dos veces.` } : { en: `(${cr}, ${cc}) has no unvisited land neighbours.`, es: `(${cr}, ${cc}) no tiene vecinos de tierra sin visitar.` }, grid(g, hl), vars({ islands, stack: stack.map(([a, b]) => `(${a},${b})`).join(' ') || { en: 'empty', es: 'vacía' } }));
      }
    }
  t.add('done', { en: `Scan finished. Every land cell was visited exactly once. Number of islands: **${islands}**.`, es: `Recorrido terminado. Cada celda de tierra se visitó exactamente una vez. Número de islas: **${islands}**.` }, grid(g, hl), vars({ islands }));
  return t.frames;
}

export const islands: Problem = {
  id: 'islands',
  title: { en: 'Number of islands', es: 'Número de islas' },
  difficulty: 'Medium',
  statement: [
    { en: 'A grid contains `1` (land) and `0` (water). An **island** is a group of land cells connected horizontally or vertically (not diagonally). Return the number of islands.', es: 'Una cuadrícula contiene `1` (tierra) y `0` (agua). Una **isla** es un grupo de celdas de tierra conectadas horizontal o verticalmente (no en diagonal). Devuelve el número de islas.' },
  ],
  examples: [{ input: 'grid = [[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1]]', output: '2' }],
  insight:
    { en: 'Count islands by counting **starting points**. Scan the grid; the first time you touch a land cell that has not been visited, you have discovered a new island — add one, then immediately *flood fill* from it, marking every connected land cell as visited. Those cells can never be counted again. Each cell is visited once, so the whole thing is linear in the grid size.', es: 'Cuenta las islas contando **puntos de partida**. Recorre la cuadrícula; la primera vez que tocas una celda de tierra no visitada, has descubierto una isla nueva: suma uno y de inmediato haz *flood fill* desde ella, marcando como visitada cada celda de tierra conectada. Esas celdas nunca podrán contarse de nuevo. Cada celda se visita una vez, así que todo es lineal en el tamaño de la cuadrícula.' },
  approaches: [
    { id: 'relabel', label: { en: 'Spread labels until stable', es: 'Propagar etiquetas hasta que se estabilicen' }, kind: 'brute', fn: numIslandsRelabel, time: 'O((m·n)²)', space: 'O(m·n)', note: { en: 'Each land cell starts with a unique label and repeatedly adopts the smallest label next to it. A label can take many full sweeps to crawl across a long, winding island.', es: 'Cada celda de tierra empieza con una etiqueta única y adopta repetidamente la etiqueta más pequeña a su lado. Una etiqueta puede necesitar muchas pasadas completas para recorrer una isla larga y sinuosa.' } },
    { id: 'flood', label: { en: 'Scan + flood fill (DFS)', es: 'Recorrido + flood fill (DFS)' }, kind: 'optimal', fn: numIslands, time: 'O(m·n)', space: 'O(m·n)', note: { en: 'The flood uses an explicit stack rather than recursion, so a huge island cannot overflow the call stack. Swap the stack for a queue and it becomes BFS — equally correct here.', es: 'El relleno usa una pila explícita en lugar de recursión, así que una isla enorme no puede desbordar la pila de llamadas. Cambia la pila por una cola y se convierte en BFS, igual de correcto aquí.' } },
  ],
  code,
  cases: [
    { name: { en: 'two islands', es: 'dos islas' }, args: [[[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1]]], expected: 2 },
    { name: { en: 'empty grid', es: 'cuadrícula vacía' }, args: [[]], expected: 0 },
    { name: { en: 'single water cell', es: 'una sola celda de agua' }, args: [[[0]]], expected: 0 },
    { name: { en: 'single land cell', es: 'una sola celda de tierra' }, args: [[[1]]], expected: 1 },
    { name: { en: 'all land', es: 'todo tierra' }, args: [[[1, 1], [1, 1]]], expected: 1 },
    { name: { en: 'all water', es: 'todo agua' }, args: [[[0, 0], [0, 0]]], expected: 0 },
    { name: { en: 'diagonal cells are NOT connected', es: 'las celdas en diagonal NO están conectadas' }, args: [[[1, 0], [0, 1]]], expected: 2 },
    { name: { en: 'checkerboard', es: 'tablero de ajedrez' }, args: [[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], expected: 5 },
    { name: { en: 'one winding island', es: 'una isla sinuosa' }, args: [[[1, 1, 1], [0, 0, 1], [1, 1, 1], [1, 0, 0]]], expected: 1 },
    { name: { en: 'single row', es: 'una sola fila' }, args: [[[1, 0, 1, 1, 0, 1]]], expected: 3 },
    { name: { en: 'ring with a lake', es: 'anillo con un lago' }, args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: 1 },
  ],
  bench: { sizes: [10, 30, 100, 200], nLabel: { en: 'grid side (n × n cells, ~60% land)', es: 'lado de la cuadrícula (n × n celdas, ~60% tierra)' }, gen: (n) => [randMatrix(n, n, 0, 9).map((row) => row.map((x) => (x < 6 ? 1 : 0)))] },
  demo: {
    inputs: [{ name: 'grid (1 = land, 0 = water)', value: '[[1, 1, 0, 0, 1], [1, 0, 0, 1, 1], [0, 0, 1, 0, 0], [1, 0, 1, 1, 0]]' }],
    validate: (g) => matrixErr(g, 6, (x) => x === 0 || x === 1) && { en: 'Use a rectangular grid of 0s and 1s with at most 6 rows and 6 columns.', es: 'Usa una cuadrícula rectangular de 0 y 1 con como máximo 6 filas y 6 columnas.' },
    traces: { flood: trace },
  },
};
