import code from './components.ts?code';
import { randInt } from '../../lib/ds';
import { Tracer, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { edgesErr, graph } from './_util';

// #region relabel
export function countComponentsRelabel(n: number, edges: number[][]): number {
  const label = Array.from({ length: n }, (_, i) => i); // every node starts in its own group
  let changed = true;
  // Sweep over all edges, copying the smaller label across, until nothing changes.
  while (changed) {
    changed = false;
    for (const [a, b] of edges) {
      if (label[a] !== label[b]) {
        const low = Math.min(label[a], label[b]);
        label[a] = low;
        label[b] = low;
        changed = true;
      }
    }
  }
  return new Set(label).size;
}
// #endregion

// #region dfs
export function countComponents(n: number, edges: number[][]): number {
  // 1. Adjacency list: for every node, the list of its neighbours.
  const neighbours: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    neighbours[a].push(b);
    neighbours[b].push(a); // undirected: record both directions
  }

  // 2. Start a search from every node not reached by an earlier search.
  const seen = new Array<boolean>(n).fill(false);
  let components = 0;
  for (let start = 0; start < n; start++) {
    if (seen[start]) continue; // @skip
    components++; // @new
    const stack = [start];
    seen[start] = true;
    while (stack.length > 0) {
      const node = stack.pop() as number; // @visit
      for (const next of neighbours[node]) {
        if (!seen[next]) {
          seen[next] = true; // @mark
          stack.push(next);
        }
      }
    }
  }
  return components; // @done
}
// #endregion

function trace(n: number, edges: number[][]) {
  const t = new Tracer();
  const nb: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) (nb[a].push(b), nb[b].push(a));
  const tones: Tone[] = ['good', 'compare', 'alt', 'window', 'done'];
  const hl: Record<number, Tone> = {};
  const seen = new Array<boolean>(n).fill(false);
  let components = 0;
  t.add(
    undefined,
    {
      en: 'First the edge list is turned into an **adjacency list** — for each node, who its neighbours are — so that "where can I go from here?" is a direct lookup.',
      es: 'Primero la lista de aristas se convierte en una **lista de adyacencia** — para cada nodo, quiénes son sus vecinos — de modo que "¿a dónde puedo ir desde aquí?" sea una consulta directa.',
    },
    graph(n, edges),
    vars(Object.fromEntries(nb.map((l, i) => [`${i}`, l])), { en: 'adjacency list', es: 'lista de adyacencia' }),
  );
  for (let s = 0; s < n; s++) {
    if (seen[s]) {
      t.add('skip', { en: `Node ${s} was already reached by an earlier search. Skip it.`, es: `Una búsqueda anterior ya alcanzó el nodo ${s}. Sáltalo.` }, graph(n, edges, { hl }), vars({ components }));
      continue;
    }
    components++;
    const tone = tones[(components - 1) % tones.length];
    const stack = [s];
    seen[s] = true;
    hl[s] = 'active';
    t.add(
      'new',
      {
        en: `Node ${s} has not been reached yet, so it belongs to a **new component** (#${components}). Explore everything reachable from it.`,
        es: `El nodo ${s} aún no se ha alcanzado, así que pertenece a una **nueva componente** (#${components}). Explora todo lo alcanzable desde él.`,
      },
      graph(n, edges, { hl }), vars({ components, stack }));
    while (stack.length) {
      const node = stack.pop()!;
      hl[node] = tone;
      const added: number[] = [];
      for (const next of nb[node])
        if (!seen[next]) {
          seen[next] = true;
          hl[next] = 'active';
          stack.push(next);
          added.push(next);
        }
      t.add(added.length ? 'mark' : 'visit', added.length
          ? { en: `Visit ${node}. Its unvisited neighbours ${added.join(', ')} are marked and queued up.`, es: `Visita ${node}. Sus vecinos no visitados ${added.join(', ')} se marcan y se ponen en espera.` }
          : { en: `Visit ${node}. All its neighbours are already marked.`, es: `Visita ${node}. Todos sus vecinos ya están marcados.` }, graph(n, edges, { hl }), vars({ components, stack }));
    }
  }
  t.add(
    'done',
    { en: `Every node was visited once and every edge looked at twice. Connected components: **${components}**.`, es: `Cada nodo se visitó una vez y cada arista se revisó dos veces. Componentes conexas: **${components}**.` }, graph(n, edges, { hl }), vars({ components }));
  return t.frames;
}

export const components: Problem = {
  id: 'components',
  title: { en: 'Count connected components', es: 'Contar componentes conexas' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'There are `n` nodes numbered `0…n−1` and a list of undirected `edges` `[a, b]`. Return the number of **connected components**: groups of nodes that can reach each other.',
      es: 'Hay `n` nodos numerados `0…n−1` y una lista de aristas no dirigidas `edges` `[a, b]`. Devuelve el número de **componentes conexas**: grupos de nodos que pueden alcanzarse entre sí.',
    },
  ],
  examples: [{ input: 'n = 5, edges = [[0, 1], [1, 2], [3, 4]]', output: '2', why: { en: '{0, 1, 2} and {3, 4}.', es: '{0, 1, 2} y {3, 4}.' } }],
  insight: {
    en: 'It is "number of islands" on a general graph. Walk through the nodes; each time you find one that no earlier search has reached, you have found a new component — count it and **explore everything reachable from it**, marking as you go. The key enabler is the adjacency list: built once in O(V + E), it lets you jump straight to a node’s neighbours instead of rescanning the whole edge list.',
    es: 'Es "número de islas" en un grafo general. Recorre los nodos; cada vez que encuentres uno que ninguna búsqueda anterior haya alcanzado, encontraste una nueva componente — cuéntala y **explora todo lo alcanzable desde ella**, marcando sobre la marcha. La clave es la lista de adyacencia: construida una vez en O(V + E), te permite saltar directo a los vecinos de un nodo en lugar de volver a recorrer toda la lista de aristas.',
  },
  approaches: [
    { id: 'relabel', label: { en: 'Spread labels over the edge list', es: 'Propagar etiquetas por la lista de aristas' }, kind: 'brute', fn: countComponentsRelabel, time: 'O(V · E)', space: 'O(V)', note: {
        en: 'Repeatedly sweeps all edges, pulling both endpoints to the smaller label. A long chain can need a full sweep per node.',
        es: 'Recorre repetidamente todas las aristas, llevando ambos extremos a la etiqueta menor. Una cadena larga puede necesitar una pasada completa por nodo.',
      },
    },
    { id: 'dfs', label: { en: 'Adjacency list + DFS', es: 'Lista de adyacencia + DFS' }, kind: 'optimal', fn: countComponents, time: 'O(V + E)', space: 'O(V + E)', note: { en: 'Each node is pushed once; each edge is examined once from each end.', es: 'Cada nodo se apila una vez; cada arista se examina una vez desde cada extremo.' },
    },
  ],
  code,
  cases: [
    { name: { en: 'two components', es: 'dos componentes' }, args: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
    { name: { en: 'one chain', es: 'una cadena' }, args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 1 },
    { name: { en: 'no edges: every node alone', es: 'sin aristas: cada nodo solo' }, args: [4, []], expected: 4 },
    { name: { en: 'single node', es: 'un solo nodo' }, args: [1, []], expected: 1 },
    { name: { en: 'zero nodes', es: 'cero nodos' }, args: [0, []], expected: 0 },
    { name: { en: 'a cycle', es: 'un ciclo' }, args: [3, [[0, 1], [1, 2], [2, 0]]], expected: 1 },
    { name: { en: 'duplicate edges', es: 'aristas duplicadas' }, args: [3, [[0, 1], [0, 1], [1, 0]]], expected: 2 },
    { name: { en: 'star', es: 'estrella' }, args: [5, [[0, 1], [0, 2], [0, 3], [0, 4]]], expected: 1 },
    { name: { en: 'pairs', es: 'pares' }, args: [6, [[0, 5], [1, 4], [2, 3]]], expected: 3 },
    { name: { en: 'edges listed high-to-low', es: 'aristas listadas de mayor a menor' }, args: [4, [[3, 2], [2, 1]]], expected: 2 },
  ],
  bench: {
    sizes: [100, 1000, 5000, 20_000],
    nLabel: { en: 'number of nodes (one long chain, edges in the worst order)', es: 'número de nodos (una cadena larga, aristas en el peor orden)' },
    gen: (n) => (n < 20 ? [n, Array.from({ length: randInt(0, n) }, () => [randInt(0, n - 1), randInt(0, n - 1)])] : [n, Array.from({ length: n - 1 }, (_, i) => [n - 2 - i, n - 1 - i])]),
  },
  demo: {
    inputs: [
      { name: 'n (nodes 0…n−1)', value: '8' },
      { name: 'edges', value: '[[0, 1], [1, 2], [2, 0], [3, 4], [5, 6], [6, 7]]' },
    ],
    validate: (n, edges) => edgesErr(n, edges),
    traces: { dfs: trace },
  },
};
