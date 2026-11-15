import code from './grid-path.ts?code';
import type { Problem } from '../../types';
import { randMatrix } from './_util';

// #region dfs
export function shortestPathDfs(grid: number[][]): number {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  if (rows === 0 || grid[0][0] === 1) return -1;
  const onPath = grid.map((row) => row.map(() => false));
  let best = Infinity;

  // Try every possible route and remember the shortest.
  const walk = (r: number, c: number, steps: number): void => {
    if (r === rows - 1 && c === cols - 1) {
      best = Math.min(best, steps);
      return;
    }
    onPath[r][c] = true;
    for (const [nr, nc] of [[r + 1, c], [r, c + 1], [r - 1, c], [r, c - 1]]) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === 1 || onPath[nr][nc]) continue;
      walk(nr, nc, steps + 1);
    }
    onPath[r][c] = false; // un-mark, so other routes may pass through here
  };
  walk(0, 0, 0);
  return best === Infinity ? -1 : best;
}
// #endregion

// #region bfs
export function shortestPath(grid: number[][]): number {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  if (rows === 0 || grid[0][0] === 1) return -1;
  const seen = grid.map((row) => row.map(() => false));
  seen[0][0] = true;
  let frontier = [[0, 0]]; // all cells exactly `steps` moves from the start
  let steps = 0;
  while (frontier.length > 0) {
    const next: number[][] = [];
    for (const [r, c] of frontier) {
      if (r === rows - 1 && c === cols - 1) return steps; // first arrival = shortest
      for (const [nr, nc] of [[r + 1, c], [r, c + 1], [r - 1, c], [r, c - 1]]) {
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (grid[nr][nc] === 1 || seen[nr][nc]) continue;
        seen[nr][nc] = true; // marked for good: we already have the shortest way here
        next.push([nr, nc]);
      }
    }
    frontier = next;
    steps++;
  }
  return -1;
}
// #endregion

export const gridPath: Problem = {
  id: 'grid-path',
  title: { en: 'Shortest path in a grid', es: 'Camino más corto en una cuadrícula' },
  difficulty: 'Medium',
  statement: [
    { en: 'In a grid, `0` is an open cell and `1` is a wall. Starting in the top-left cell, moving up/down/left/right, return the **minimum number of moves** to reach the bottom-right cell, or `-1` if it cannot be reached.', es: 'En una cuadrícula, `0` es una celda abierta y `1` es una pared. Empezando en la celda superior izquierda y moviéndote arriba/abajo/izquierda/derecha, devuelve el **número mínimo de movimientos** para llegar a la celda inferior derecha, o `-1` si no se puede alcanzar.' },
  ],
  examples: [{ input: 'grid = [[0, 0, 0], [1, 1, 0], [0, 0, 0]]', output: '4', why: { en: 'Right, right, down, down.', es: 'Derecha, derecha, abajo, abajo.' } }],
  insight:
    { en: 'DFS finds *a* path, not the *shortest* one — to be sure, it has to try them all, and the number of routes explodes exponentially. **BFS explores in rings**: all cells 1 move away, then all cells 2 moves away, and so on. The first time it reaches a cell, it got there by a shortest route, so each cell needs to be visited only once. "Fewest steps in an unweighted grid/graph" always means BFS.', es: 'DFS encuentra *un* camino, no el *más corto*: para estar seguro tiene que probarlos todos, y el número de rutas explota exponencialmente. **BFS explora en anillos**: todas las celdas a 1 movimiento, luego todas las celdas a 2 movimientos, y así sucesivamente. La primera vez que llega a una celda, llegó por una ruta más corta, así que cada celda solo necesita visitarse una vez. "Menos pasos en una cuadrícula/grafo sin pesos" siempre significa BFS.' },
  approaches: [
    { id: 'dfs', label: { en: 'DFS over every route', es: 'DFS sobre todas las rutas' }, kind: 'brute', fn: shortestPathDfs, time: 'O(4^(m·n))', space: 'O(m·n)', benchMax: 6, note: { en: 'Backtracking: walk, un-mark, try another way. Correct, but the count of distinct routes grows explosively — a 7 × 7 open grid already has hundreds of millions.', es: 'Backtracking: avanza, desmarca, prueba otro camino. Correcto, pero la cantidad de rutas distintas crece de forma explosiva: una cuadrícula abierta de 7 × 7 ya tiene cientos de millones.' } },
    { id: 'bfs', label: { en: 'BFS ring by ring', es: 'BFS anillo por anillo' }, kind: 'optimal', fn: shortestPath, time: 'O(m·n)', space: 'O(m·n)', note: { en: 'Each cell enters the frontier at most once. A 1000 × 1000 grid is a million steps — instant.', es: 'Cada celda entra en la frontera como máximo una vez. Una cuadrícula de 1000 × 1000 son un millón de pasos: instantáneo.' } },
  ],
  code,
  cases: [
    { name: { en: 'around a wall', es: 'rodeando una pared' }, args: [[[0, 0, 0], [1, 1, 0], [0, 0, 0]]], expected: 4 },
    { name: { en: 'empty grid', es: 'cuadrícula vacía' }, args: [[]], expected: -1 },
    { name: { en: '1 × 1: already there', es: '1 × 1: ya estás ahí' }, args: [[[0]]], expected: 0 },
    { name: { en: 'start is a wall', es: 'el inicio es una pared' }, args: [[[1, 0], [0, 0]]], expected: -1 },
    { name: { en: 'end is a wall', es: 'el final es una pared' }, args: [[[0, 0], [0, 1]]], expected: -1 },
    { name: { en: 'completely blocked', es: 'completamente bloqueada' }, args: [[[0, 1], [1, 0]]], expected: -1 },
    { name: { en: 'open 3 × 3', es: '3 × 3 abierta' }, args: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: 4 },
    { name: { en: 'single row', es: 'una sola fila' }, args: [[[0, 0, 0, 0]]], expected: 3 },
    { name: { en: 'must go backwards (snake)', es: 'hay que retroceder (serpiente)' }, args: [[[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]]], expected: 10 },
    { name: { en: 'single column with a wall', es: 'una sola columna con una pared' }, args: [[[0], [1], [0]]], expected: -1 },
  ],
  bench: {
    sizes: [3, 4, 5, 6, 30, 100, 300],
    nLabel: { en: 'grid side (n × n open cells)', es: 'lado de la cuadrícula (n × n celdas abiertas)' },
    gen: (n) => [n <= 3 ? randMatrix(n + 1, n + 1, 0, 9).map((row) => row.map((x) => (x < 3 ? 1 : 0))) : Array.from({ length: n }, () => new Array(n).fill(0))],
  },
};
