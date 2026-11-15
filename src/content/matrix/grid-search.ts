import type { Pattern } from '../../types';
import { gridPath } from './grid-path';
import { islands } from './islands';

export const gridSearch: Pattern = {
  id: 'grid-bfs-dfs',
  group: 'Matrix',
  order: 3,
  title: { en: 'Grid BFS / DFS (flood fill)', es: 'BFS / DFS en cuadrículas (flood fill)' },
  tagline: { en: 'Treat each cell as a node connected to its four neighbours, and explore without visiting anything twice.', es: 'Trata cada celda como un nodo conectado a sus cuatro vecinos, y explora sin visitar nada dos veces.' },
  cues: [
    { en: 'gives a **grid / map / board / image** of land and water, walls and paths, pixels and colours', es: 'da una **cuadrícula / mapa / tablero / imagen** de tierra y agua, paredes y caminos, píxeles y colores' },
    { en: 'asks to **count regions**, measure the largest region, fill an area, or capture surrounded cells', es: 'pide **contar regiones**, medir la región más grande, rellenar un área o capturar celdas rodeadas' },
    { en: 'asks for the **shortest path / fewest moves** between cells (→ BFS)', es: 'pide el **camino más corto / menos movimientos** entre celdas (→ BFS)' },
    { en: 'spreads something step by step: rotting oranges, fire, infection, distance to the nearest gate (→ BFS from many sources at once)', es: 'algo se propaga paso a paso: naranjas que se pudren, fuego, infección, distancia a la puerta más cercana (→ BFS desde muchos orígenes a la vez)' },
  ],
  model: [
    { en: 'A grid is a graph in disguise. Every cell is a node; its neighbours are the cells above, below, left and right (sometimes diagonals too). You never build the graph — you compute neighbours on the fly with `(r ± 1, c)` and `(r, c ± 1)` and check the bounds.', es: 'Una cuadrícula es un grafo disfrazado. Cada celda es un nodo; sus vecinos son las celdas de arriba, abajo, izquierda y derecha (a veces también las diagonales). Nunca construyes el grafo: calculas los vecinos sobre la marcha con `(r ± 1, c)` y `(r, c ± 1)` y compruebas los límites.' },
    { en: 'The one rule that makes everything work: **mark a cell as visited the moment you first reach it**, and never enter a visited cell. Without it you loop forever or do exponential work; with it every cell is processed once, giving O(rows × cols).', es: 'La única regla que hace que todo funcione: **marca una celda como visitada en el momento en que la alcanzas por primera vez**, y nunca entres en una celda visitada. Sin ella entras en un bucle infinito o haces trabajo exponencial; con ella cada celda se procesa una vez, lo que da O(filas × columnas).' },
    { en: '**Flood fill** = start at a cell and visit everything connected to it. To count regions, scan the grid and start a flood at each unvisited cell of interest; the number of floods started is the number of regions.', es: '**Flood fill** = empieza en una celda y visita todo lo conectado a ella. Para contar regiones, recorre la cuadrícula e inicia un relleno en cada celda de interés no visitada; el número de rellenos iniciados es el número de regiones.' },
    { en: 'DFS (stack or recursion) and BFS (queue) both flood correctly. Choose **BFS when distance matters**: it expands in rings, so the step count when it first reaches a cell is the shortest distance.', es: 'DFS (pila o recursión) y BFS (cola) rellenan correctamente. Elige **BFS cuando importa la distancia**: se expande en anillos, así que el número de pasos cuando alcanza una celda por primera vez es la distancia más corta.' },
    { en: 'Recursion depth is a real risk on big grids (a 1000 × 1000 island is a million nested calls), which is why the code here uses an explicit stack.', es: 'La profundidad de recursión es un riesgo real en cuadrículas grandes (una isla de 1000 × 1000 son un millón de llamadas anidadas), por eso el código aquí usa una pila explícita.' },
  ],
  template: `for each cell (r, c):
    if cell is interesting and not seen:
        count += 1
        frontier = [(r, c)]; seen[r][c] = true
        while frontier not empty:
            (cr, cc) = frontier.pop()          # stack = DFS, queue = BFS
            for (nr, nc) in 4 neighbours of (cr, cc):
                if in bounds and interesting and not seen:
                    seen[nr][nc] = true        # mark when ADDING, not when popping
                    frontier.push((nr, nc))`,
  problems: [islands, gridPath],
  quiz: [
    { q: { en: 'Given a 2D image and a starting pixel, recolour that pixel and all connected pixels of the same colour.', es: 'Dada una imagen 2D y un píxel inicial, cambia el color de ese píxel y de todos los píxeles conectados del mismo color.' }, why: { en: 'Spread from one cell to everything connected to it: flood fill on a grid.', es: 'Propagarse desde una celda a todo lo conectado con ella: flood fill en una cuadrícula.' } },
    { q: { en: 'In a grid of fresh and rotten oranges, each minute a rotten orange rots its four neighbours. How many minutes until no fresh orange remains?', es: 'En una cuadrícula de naranjas frescas y podridas, cada minuto una naranja podrida pudre a sus cuatro vecinas. ¿Cuántos minutos pasan hasta que no quede ninguna naranja fresca?' }, why: { en: 'Something spreading one step per minute from several sources — multi-source BFS on a grid, counting levels.', es: 'Algo que se propaga un paso por minuto desde varios orígenes: BFS multiorigen en una cuadrícula, contando niveles.' } },
    { q: { en: 'Given a maze as a grid of open cells and walls, find the fewest moves from the entrance to the exit.', es: 'Dado un laberinto como una cuadrícula de celdas abiertas y paredes, encuentra el menor número de movimientos desde la entrada hasta la salida.' }, why: { en: '“Fewest moves” in an unweighted grid means BFS: the first time it reaches the exit is the shortest route.', es: '“Menos movimientos” en una cuadrícula sin pesos significa BFS: la primera vez que llega a la salida es la ruta más corta.' } },
  ],
};
