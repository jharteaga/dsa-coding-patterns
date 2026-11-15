import code from './k-merge.ts?code';
import { Heap, randInt, sortedArray } from '../../lib/ds';
import { Tracer, grid, heapTree, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';

// #region concat
export function mergeKSort(lists: number[][]): number[] {
  // Glue everything together and sort from scratch,
  // ignoring that every list was already sorted.
  return lists.flat().sort((a, b) => a - b);
}
// #endregion

// #region heap
export function mergeK(lists: number[][]): number[] {
  // Heap entries: [value, which list, index inside that list]; smallest value on top.
  const heap = new Heap<number[]>((a, b) => a[0] < b[0]);
  lists.forEach((list, li) => {
    if (list.length > 0) heap.push([list[0], li, 0]); // the head of every list // @seed
  });

  const out: number[] = [];
  while (heap.size > 0) {
    const [value, li, i] = heap.pop() as number[]; // smallest of all the heads // @pop
    out.push(value);
    if (i + 1 < lists[li].length) heap.push([lists[li][i + 1], li, i + 1]); // its successor steps up // @push
  }
  return out; // @done
}
// #endregion

function trace(lists: number[][]) {
  const t = new Tracer();
  const width = Math.max(1, ...lists.map((l) => l.length));
  const pos = lists.map(() => 0);
  const out: number[] = [];
  const heap = new Heap<number[]>((a, b) => a[0] < b[0]);
  const views = (flash?: [number, number]) => {
    const hl: Record<string, Tone> = {};
    lists.forEach((l, r) => l.forEach((_, c) => (hl[`${r},${c}`] = c < pos[r] ? 'muted' : c === pos[r] ? 'compare' : 'none' as Tone)));
    if (flash) hl[`${flash[0]},${flash[1]}`] = 'good';
    return [
      grid(
        lists.map((l) => Array.from({ length: width }, (_, c) => l[c] ?? null)),
        hl,
        { label: { en: 'sorted lists (blue = current head of each list)', es: 'listas ordenadas (azul = cabeza actual de cada lista)' }, rowLabels: lists.map((_, i) => `list ${i}`) },
      ),
      heapTree(heap.items.map((e) => e[0]), { en: 'min-heap: one entry per list', es: 'min-heap: una entrada por lista' }, { 0: 'active' }),
      vars({ output: out }),
    ];
  };
  lists.forEach((l, li) => l.length && heap.push([l[0], li, 0]));
  t.add(
    'seed',
    {
      en: `The smallest value overall must be the **head of one of the lists**. Put the ${heap.size} heads in a min-heap.`,
      es: `El menor valor de todos tiene que ser la **cabeza de alguna de las listas**. Pon las ${heap.size} cabezas en un min-heap.`,
    },
    ...views(),
  );
  while (heap.size) {
    const [v, li, i] = heap.pop()!;
    out.push(v);
    pos[li] = i + 1;
    const has = i + 1 < lists[li].length;
    if (has) heap.push([lists[li][i + 1], li, i + 1]);
    t.add(
      has ? 'push' : 'pop',
      {
        en: `Take the smallest head, **${v}** (from list ${li}), into the output. ${has ? `List ${li}'s next value, ${lists[li][i + 1]}, replaces it in the heap.` : `List ${li} is now used up.`}`,
        es: `Toma la menor cabeza, **${v}** (de la lista ${li}), y pásala a la salida. ${has ? `El siguiente valor de la lista ${li}, ${lists[li][i + 1]}, la reemplaza en el montículo.` : `La lista ${li} ya se agotó.`}`,
      },
      ...views([li, i]),
    );
  }
  t.add(
    'done',
    {
      en: `Merged: **[${out.join(', ')}]**. The heap never held more than ${lists.length} values, so each step cost O(log k).`,
      es: `Mezclado: **[${out.join(', ')}]**. El montículo nunca guardó más de ${lists.length} valores, así que cada paso costó O(log k).`,
    },
    ...views(),
  );
  return t.frames;
}

export const kMerge: Problem = {
  id: 'k-merge',
  title: { en: 'Merge k sorted lists', es: 'Mezclar k listas ordenadas' },
  difficulty: 'Hard',
  statement: [
    {
      en: 'You are given `k` lists, each already sorted in ascending order. Merge them into a single sorted list.',
      es: 'Recibes `k` listas, cada una ya ordenada de forma ascendente. Mézclalas en una sola lista ordenada.',
    },
  ],
  examples: [{ input: 'lists = [[1, 4, 5], [1, 3, 4], [2, 6]]', output: '[1, 1, 2, 3, 4, 4, 5, 6]' }],
  insight: {
    en: 'Because every list is sorted, the next value of the merged output can only be one of the k **current heads**. Finding the smallest of k values is exactly what a min-heap is for. Pop the smallest head, output it, and push the next value from the same list. The heap always holds at most k items, so each of the N values costs O(log k).',
    es: 'Como cada lista está ordenada, el siguiente valor de la salida mezclada solo puede ser una de las k **cabezas actuales**. Encontrar el menor de k valores es justo para lo que sirve un min-heap. Extrae la menor cabeza, pásala a la salida e inserta el siguiente valor de la misma lista. El montículo siempre guarda como máximo k elementos, así que cada uno de los N valores cuesta O(log k).',
  },
  approaches: [
    {
      id: 'concat',
      label: { en: 'Concatenate and sort', es: 'Concatenar y ordenar' },
      kind: 'brute',
      fn: mergeKSort,
      time: 'O(N log N)',
      space: 'O(N)',
      note: {
        en: 'N is the total number of values. Throws away the existing order. (In the benchmark it can still win at small sizes: the built-in sort is native code and detects pre-sorted runs. The heap’s advantage is that it needs only k values in memory and can produce output lazily — essential for merging huge files or streams.)',
        es: 'N es la cantidad total de valores. Desperdicia el orden que ya existe. (En el benchmark puede ganar con tamaños pequeños: el sort integrado es código nativo y detecta tramos ya ordenados. La ventaja del montículo es que solo necesita k valores en memoria y puede producir la salida de forma perezosa, algo esencial para mezclar archivos o flujos enormes).',
      },
    },
    {
      id: 'heap',
      label: { en: 'Min-heap of the k heads', es: 'Min-heap de las k cabezas' },
      kind: 'optimal',
      fn: mergeK,
      time: 'O(N log k)',
      space: 'O(k)',
      note: {
        en: 'log k instead of log N: with a million values spread over 8 lists, each step is 3 comparisons instead of 20.',
        es: 'log k en lugar de log N: con un millón de valores repartidos en 8 listas, cada paso son 3 comparaciones en lugar de 20.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'three lists', es: 'tres listas' }, args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expected: [1, 1, 2, 3, 4, 4, 5, 6] },
    { name: { en: 'no lists', es: 'sin listas' }, args: [[]], expected: [] },
    { name: { en: 'one empty list', es: 'una lista vacía' }, args: [[[]]], expected: [] },
    { name: { en: 'some lists empty', es: 'algunas listas vacías' }, args: [[[], [1], []]], expected: [1] },
    { name: { en: 'single list', es: 'una sola lista' }, args: [[[1, 2, 3]]], expected: [1, 2, 3] },
    { name: { en: 'lists do not interleave', es: 'las listas no se intercalan' }, args: [[[7, 8], [1, 2], [4, 5]]], expected: [1, 2, 4, 5, 7, 8] },
    { name: { en: 'duplicates across lists', es: 'repetidos entre listas' }, args: [[[2, 2], [2], [2, 2]]], expected: [2, 2, 2, 2, 2] },
    { name: { en: 'negative numbers', es: 'números negativos' }, args: [[[-5, 0], [-9, -1, 3]]], expected: [-9, -5, -1, 0, 3] },
    { name: { en: 'very different lengths', es: 'longitudes muy distintas' }, args: [[[1], [0, 2, 3, 4, 5, 6]]], expected: [0, 1, 2, 3, 4, 5, 6] },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'total values (spread over 8 lists)', es: 'valores totales (repartidos en 8 listas)' },
    gen: (n) => [Array.from({ length: n < 20 ? randInt(1, 4) : 8 }, () => sortedArray(n < 20 ? randInt(0, 5) : n >> 3))],
  },
  demo: {
    inputs: [{ name: 'lists (each sorted)', value: '[[1, 4, 9], [2, 3, 10], [5, 6]]' }],
    validate: (ls) =>
      !Array.isArray(ls) || !ls.length || ls.length > 4 || !ls.every((l) => Array.isArray(l) && l.length <= 5 && l.every((x: unknown, i: number) => typeof x === 'number' && (i === 0 || l[i - 1] <= (x as number))))
        ? {
            en: 'Use 1–4 lists of up to 5 numbers each, every list sorted ascending.',
            es: 'Usa de 1 a 4 listas de hasta 5 números cada una, todas ordenadas de forma ascendente.',
          }
        : null,
    traces: { heap: trace },
  },
};
