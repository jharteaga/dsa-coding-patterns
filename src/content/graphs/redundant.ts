import code from './redundant.ts?code';
import { randInt, shuffle } from '../../lib/ds';
import { Tracer, arr, mark, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { edgesErr, graph } from './_util';

// #region dfs
export function findRedundantDfs(edges: number[][]): number[] {
  const neighbours = new Map<number, number[]>();
  // Is there already a path from `from` to `target` using the edges added so far?
  const connected = (from: number, target: number): boolean => {
    const seen = new Set<number>([from]);
    const stack = [from];
    while (stack.length > 0) {
      const node = stack.pop() as number;
      if (node === target) return true;
      for (const next of neighbours.get(node) ?? []) {
        if (!seen.has(next)) {
          seen.add(next);
          stack.push(next);
        }
      }
    }
    return false;
  };

  for (const [a, b] of edges) {
    if (connected(a, b)) return [a, b]; // a full graph search for every edge
    if (!neighbours.has(a)) neighbours.set(a, []);
    if (!neighbours.has(b)) neighbours.set(b, []);
    (neighbours.get(a) as number[]).push(b);
    (neighbours.get(b) as number[]).push(a);
  }
  return [];
}
// #endregion

// #region unionfind
export function findRedundant(edges: number[][]): number[] {
  const n = edges.length;
  const parent = Array.from({ length: n + 1 }, (_, i) => i); // each node is its own group
  const size = new Array<number>(n + 1).fill(1);

  // Follow parent links to the group's representative ("root").
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path compression: skip a level on the way up
      x = parent[x];
    }
    return x; // @find
  };

  for (const [a, b] of edges) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return [a, b]; // already in the same group: this edge closes a cycle // @cycle
    // Union by size: hang the smaller group under the larger one.
    if (size[rootA] < size[rootB]) {
      parent[rootA] = rootB; // @union
      size[rootB] += size[rootA];
    } else {
      parent[rootB] = rootA;
      size[rootA] += size[rootB];
    }
  }
  return []; // @none
}
// #endregion

function trace(edges: number[][]) {
  const t = new Tracer();
  const n = edges.length;
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const size = new Array<number>(n + 1).fill(1);
  const find = (x: number) => {
    while (parent[x] !== x) x = parent[x];
    return x;
  };
  const used: number[][] = [];
  const views = (hl: Record<number, Tone> = {}, edgeHl: Record<string, Tone> = {}) => [
    graph(n, used, { base: 1, hl: Object.fromEntries(Object.entries(hl).map(([k, v]) => [+k - 1, v])), edgeHl: Object.fromEntries(Object.entries(edgeHl).map(([k, v]) => [k.split('-').map((x) => +x - 1).join('-'), v])), label: { en: 'edges added so far', es: 'aristas agregadas hasta ahora' } }),
    arr(parent.slice(1), {
      label: {
        en: 'parent[node] — follow it to reach the group’s root (shown for nodes 1…n; index = node − 1)',
        es: 'parent[node] — síguelo para llegar a la raíz del grupo (se muestra para los nodos 1…n; índice = nodo − 1)',
      },
      hl: Object.fromEntries(Object.entries(hl).map(([k, v]) => [+k - 1, v])) }),
  ];
  t.add(undefined, { en: 'Every node starts as its own group: it is its own parent (its own root).', es: 'Cada nodo empieza como su propio grupo: es su propio padre (su propia raíz).' }, ...views());
  for (const [a, b] of edges) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) {
      used.push([a, b]);
      t.add(
        'cycle',
        {
          en: `Edge [${a}, ${b}]: both ends already have the **same root** (${ra}), so they are already connected by another route. This edge closes a cycle — it is the redundant one.`,
          es: `Arista [${a}, ${b}]: ambos extremos ya tienen la **misma raíz** (${ra}), así que ya están conectados por otra ruta. Esta arista cierra un ciclo — es la redundante.`,
        },
        ...views(mark('bad', a, b), { [`${a}-${b}`]: 'bad' }), vars({ answer: [a, b] }));
      return t.frames;
    }
    if (size[ra] < size[rb]) (parent[ra] = rb), (size[rb] += size[ra]);
    else (parent[rb] = ra), (size[ra] += size[rb]);
    used.push([a, b]);
    t.add(
      'union',
      {
        en: `Edge [${a}, ${b}]: root of ${a} is ${ra}, root of ${b} is ${rb} — different groups, so the edge is useful. **Merge** them: the smaller group's root now points to the larger group's root.`,
        es: `Arista [${a}, ${b}]: la raíz de ${a} es ${ra}, la raíz de ${b} es ${rb} — grupos distintos, así que la arista es útil. **Fusiónalos**: la raíz del grupo más pequeño ahora apunta a la raíz del grupo más grande.`,
      },
      ...views(mark('good', a, b), { [`${a}-${b}`]: 'good' }), vars({ [`find(${a})`]: ra, [`find(${b})`]: rb }));
  }
  t.add('none', { en: 'Every edge joined two separate groups: there is no redundant edge.', es: 'Cada arista unió dos grupos separados: no hay arista redundante.' }, ...views());
  return t.frames;
}

/** a random tree on nodes 1..n plus one extra edge (placed last) */
const treePlusOne = (n: number, chain: boolean) => {
  const edges: number[][] = [];
  for (let v = 2; v <= n; v++) edges.push([chain ? v - 1 : randInt(1, v - 1), v]);
  if (!chain) shuffle(edges);
  if (n >= 2) edges.push(chain ? [1, n] : [randInt(1, n - 1), n]);
  return [edges.slice(0, Math.max(n, 0))];
};

export const redundant: Problem = {
  id: 'redundant',
  title: { en: 'Redundant connection (the edge that makes a cycle)', es: 'Redundant Connection (la arista que forma un ciclo)' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'A network of `n` nodes (numbered `1…n`) was a tree — connected, with no cycles — until one extra cable was added. You are given all `n` edges in the order they were installed. Return the first edge that connects two nodes which were **already connected**. Return `[]` if there is none.',
      es: 'Una red de `n` nodos (numerados `1…n`) era un árbol — conexa, sin ciclos — hasta que se agregó un cable extra. Te dan las `n` aristas en el orden en que se instalaron. Devuelve la primera arista que conecta dos nodos que **ya estaban conectados**. Devuelve `[]` si no hay ninguna.',
    },
  ],
  examples: [{ input: 'edges = [[1, 2], [1, 3], [2, 3]]', output: '[2, 3]', why: { en: '2 and 3 are already linked through 1 when [2, 3] arrives.', es: '2 y 3 ya están unidos a través de 1 cuando llega [2, 3].' } }],
  insight: {
    en: 'The question asked for every edge is "are these two nodes already in the same group?" — and then, if not, "merge their groups". A graph search answers the first question in O(V) each time. **Union-Find** is a structure built for exactly these two operations: each group is a little tree with a single root; two nodes are in the same group iff they have the same root. With two small optimisations, both operations take practically constant time.',
    es: 'La pregunta para cada arista es "¿están estos dos nodos ya en el mismo grupo?" — y luego, si no, "fusiona sus grupos". Una búsqueda en el grafo responde la primera pregunta en O(V) cada vez. **Union-Find** es una estructura hecha justo para estas dos operaciones: cada grupo es un pequeño árbol con una sola raíz; dos nodos están en el mismo grupo si y solo si tienen la misma raíz. Con dos pequeñas optimizaciones, ambas operaciones toman tiempo prácticamente constante.',
  },
  approaches: [
    { id: 'dfs', label: { en: 'Search the graph before adding each edge', es: 'Buscar en el grafo antes de agregar cada arista' }, kind: 'brute', fn: findRedundantDfs, time: 'O(V²)', space: 'O(V)', note: {
        en: 'Before adding edge [a, b], run a DFS from a to see whether b is already reachable. One full search per edge.',
        es: 'Antes de agregar la arista [a, b], ejecuta un DFS desde a para ver si b ya es alcanzable. Una búsqueda completa por arista.',
      },
    },
    { id: 'unionfind', label: { en: 'Union-Find (disjoint sets)', es: 'Union-Find (conjuntos disjuntos)' }, kind: 'optimal', fn: findRedundant, time: 'O(V · α(V)) ≈ O(V)', space: 'O(V)', note: {
        en: 'α is the inverse Ackermann function — below 5 for any input that fits in the universe, so treat it as constant. It comes from **path compression** (flatten paths while walking them) plus **union by size** (attach the small tree under the big one).',
        es: 'α es la función inversa de Ackermann — menor que 5 para cualquier entrada que quepa en el universo, así que trátala como constante. Proviene de la **compresión de caminos** (aplanar los caminos mientras los recorres) más la **unión por tamaño** (colgar el árbol pequeño bajo el grande).',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'triangle', es: 'triángulo' }, args: [[[1, 2], [1, 3], [2, 3]]], expected: [2, 3] },
    { name: { en: 'cycle in the middle of the list', es: 'ciclo en medio de la lista' }, args: [[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], expected: [1, 4] },
    { name: { en: 'no edges', es: 'sin aristas' }, args: [[]], expected: [] },
    { name: { en: 'a tree: nothing redundant', es: 'un árbol: nada redundante' }, args: [[[1, 2], [2, 3]]], expected: [] },
    { name: { en: 'duplicate edge', es: 'arista duplicada' }, args: [[[1, 2], [1, 2]]], expected: [1, 2] },
    { name: { en: 'long cycle closed by the last edge', es: 'ciclo largo cerrado por la última arista' }, args: [[[1, 2], [2, 3], [3, 4], [4, 5], [5, 1]]], expected: [5, 1] },
    { name: { en: 'two groups merged, then a cycle', es: 'dos grupos fusionados y luego un ciclo' }, args: [[[1, 2], [3, 4], [2, 3], [1, 4]]], expected: [1, 4] },
    { name: { en: 'star plus one', es: 'estrella más una' }, args: [[[1, 2], [1, 3], [1, 4], [3, 4]]], expected: [3, 4] },
    { name: { en: 'edge written in reverse', es: 'arista escrita al revés' }, args: [[[2, 1], [3, 2], [1, 3]]], expected: [1, 3] },
  ],
  bench: {
    sizes: [100, 1000, 5000, 20_000],
    nLabel: { en: 'number of nodes (a long chain closed by the last edge)', es: 'número de nodos (una cadena larga cerrada por la última arista)' },
    gen: (n) => treePlusOne(n, n >= 20),
  },
  demo: {
    inputs: [{ name: 'edges (nodes numbered from 1)', value: '[[1, 2], [3, 4], [2, 3], [5, 6], [4, 5], [1, 5], [6, 7]]' }],
    validate: (edges) =>
      Array.isArray(edges)
        ? edgesErr(Math.max(1, edges.length), edges, 9, 9, 1)
        : { en: 'Use a list of edges such as [[1, 2], [2, 3], [1, 3]].', es: 'Usa una lista de aristas como [[1, 2], [2, 3], [1, 3]].' },
    traces: { unionfind: trace },
  },
};
