import code from './kth-largest.ts?code';
import { first, intErr, numsErr } from '../../lib/check';
import { Heap, randArray, randInt } from '../../lib/ds';
import { Tracer, arr, heapTree, mark, span } from '../../lib/trace';
import type { Problem } from '../../types';

// #region sort
export function kthLargestSort(nums: number[], k: number): number {
  const sorted = [...nums].sort((a, b) => b - a); // largest first: orders ALL n values
  return sorted[k - 1];
}
// #endregion

// #region heap
export function kthLargest(nums: number[], k: number): number {
  // Min-heap holding the k largest values seen so far.
  // Its top is the smallest of them = the k-th largest overall.
  const heap = new Heap<number>((a, b) => a < b);
  for (const x of nums) {
    if (heap.size < k) {
      heap.push(x); // still filling up // @fill
    } else if (x > (heap.peek() as number)) {
      heap.pop(); // x beats the weakest of the top k: swap them // @replace
      heap.push(x);
    } // otherwise x is too small to matter // @skip
  }
  return heap.peek() as number; // @done
}
// #endregion

function trace(nums: number[], k: number) {
  const t = new Tracer();
  const heap = new Heap<number>((a, b) => a < b);
  const views = (i: number, tone: 'active' | 'good' | 'bad') => [
    arr(nums, { label: 'nums', pointers: { i }, hl: { ...span('muted', 0, i - 1), ...mark(tone, i) } }),
    heapTree(heap.items, { en: `min-heap of the ${k} largest so far (smallest of them on top)`, es: `min-heap de los ${k} mayores hasta ahora (el menor de ellos en la cima)` }, { 0: 'compare' }),
  ];
  nums.forEach((x, i) => {
    if (heap.size < k) {
      heap.push(x);
      t.add('fill', { en: `The heap holds fewer than ${k} values, so ${x} goes in.`, es: `El montículo tiene menos de ${k} valores, así que ${x} entra.` }, ...views(i, 'good'));
    } else if (x > heap.peek()!) {
      const out = heap.pop();
      heap.push(x);
      t.add(
        'replace',
        {
          en: `${x} is bigger than the top of the heap (${out}), the weakest member of the current top ${k}. ${out} is out, ${x} is in.`,
          es: `${x} es mayor que la cima del montículo (${out}), el miembro más débil del top ${k} actual. ${out} sale, ${x} entra.`,
        },
        ...views(i, 'good'),
      );
    } else {
      t.add(
        'skip',
        {
          en: `${x} is not bigger than the top of the heap (${heap.peek()}). It cannot be among the ${k} largest — skip it without touching the heap.`,
          es: `${x} no es mayor que la cima del montículo (${heap.peek()}). No puede estar entre los ${k} mayores: sáltalo sin tocar el montículo.`,
        },
        ...views(i, 'bad'),
      );
    }
  });
  t.add(
    'done',
    {
      en: `The heap holds the ${k} largest values. Its top — the smallest of them — is the **${k}${['th', 'st', 'nd', 'rd'][k < 4 ? k : 0]} largest: ${heap.peek()}**.`,
      es: `El montículo guarda los ${k} valores más grandes. Su cima, el menor de ellos, es el **${k}.º mayor: ${heap.peek()}**.`,
    },
    arr(nums, { label: 'nums' }),
    heapTree(heap.items, { en: 'the k largest values', es: 'los k valores más grandes' }, { 0: 'good' }),
  );
  return t.frames;
}

export const kthLargestProblem: Problem = {
  id: 'kth-largest',
  title: { en: 'K-th largest element', es: 'K-ésimo elemento más grande' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'Return the `k`-th largest element of an unsorted array (1 ≤ k ≤ length). Duplicates count separately: in `[5, 5, 4]` the 2nd largest is 5.',
      es: 'Devuelve el `k`-ésimo elemento más grande de un arreglo sin ordenar (1 ≤ k ≤ longitud). Los repetidos cuentan por separado: en `[5, 5, 4]` el 2.º mayor es 5.',
    },
  ],
  examples: [{ input: 'nums = [3, 2, 1, 5, 6, 4], k = 2', output: '5' }],
  insight: {
    en: 'Sorting answers a much bigger question than was asked — it orders *everything*. You only need to keep track of the **k best values so far**. And the only member of that group you ever need to look at is the weakest one: a newcomer either beats it (replace it) or does not (ignore the newcomer). A min-heap of size k gives you that weakest member in O(1) and replaces it in O(log k).',
    es: 'Ordenar responde una pregunta mucho más grande que la planteada: ordena *todo*. Solo necesitas llevar la cuenta de los **k mejores valores hasta ahora**. Y el único miembro de ese grupo que necesitas mirar es el más débil: un recién llegado o lo supera (lo reemplaza) o no (ignoras al recién llegado). Un min-heap de tamaño k te da ese miembro más débil en O(1) y lo reemplaza en O(log k).',
  },
  approaches: [
    {
      id: 'sort',
      label: { en: 'Sort everything', es: 'Ordenar todo' },
      kind: 'brute',
      fn: kthLargestSort,
      time: 'O(n log n)',
      space: 'O(n)',
      note: {
        en: 'Simple and often fast enough. But it does more work than needed, and cannot handle a stream of values that never ends.',
        es: 'Sencillo y a menudo suficientemente rápido. Pero hace más trabajo del necesario y no puede manejar un flujo de valores que nunca termina.',
      },
    },
    {
      id: 'heap',
      label: { en: 'Min-heap of size k', es: 'Min-heap de tamaño k' },
      kind: 'optimal',
      fn: kthLargest,
      time: 'O(n log k)',
      space: 'O(k)',
      note: {
        en: 'When k is much smaller than n this is nearly linear, with only k values in memory. Note the benchmark: the built-in sort is heavily optimised native code, so the heap needs a large n and small k before it wins in practice — Big O ignores such constant factors.',
        es: 'Cuando k es mucho menor que n, esto es casi lineal, con solo k valores en memoria. Fíjate en el benchmark: el sort integrado es código nativo muy optimizado, así que el montículo necesita un n grande y un k pequeño para ganar en la práctica; Big O ignora esos factores constantes.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'classic example', es: 'ejemplo clásico' }, args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
    { name: { en: 'with duplicates', es: 'con repetidos' }, args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
    { name: { en: 'single element', es: 'un solo elemento' }, args: [[1], 1], expected: 1 },
    { name: { en: 'k = 1 → the maximum', es: 'k = 1 → el máximo' }, args: [[7, 9, 3], 1], expected: 9 },
    { name: { en: 'k = n → the minimum', es: 'k = n → el mínimo' }, args: [[7, 9, 3], 3], expected: 3 },
    { name: { en: 'all equal', es: 'todos iguales' }, args: [[4, 4, 4], 2], expected: 4 },
    { name: { en: 'negative numbers', es: 'números negativos' }, args: [[-1, -5, -3], 2], expected: -3 },
    { name: { en: 'already sorted ascending', es: 'ya ordenado ascendente' }, args: [[1, 2, 3, 4, 5], 2], expected: 4 },
    { name: { en: 'already sorted descending', es: 'ya ordenado descendente' }, args: [[5, 4, 3, 2, 1], 4], expected: 2 },
  ],
  bench: {
    sizes: [1000, 10_000, 100_000, 1_000_000],
    nLabel: { en: 'array length (k = 10)', es: 'longitud del arreglo (k = 10)' },
    gen: (n) => [randArray(n, -1_000_000, 1_000_000), randInt(1, Math.min(n, 10))],
  },
  demo: {
    inputs: [
      { name: 'nums', value: '[3, 9, 1, 7, 4, 8, 2, 6]' },
      { name: 'k', value: '3' },
    ],
    validate: (nums, k) => first(numsErr(nums, 12, 'nums', 1), intErr(k, 'k', 1, Math.min(7, (nums as number[]).length))),
    traces: { heap: trace },
  },
};
