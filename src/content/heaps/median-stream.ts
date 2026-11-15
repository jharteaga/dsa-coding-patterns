import code from './median-stream.ts?code';
import { numsErr } from '../../lib/check';
import { Heap, randArray } from '../../lib/ds';
import { Tracer, arr, heapTree, mark, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region sort
export function mediansSort(values: number[]): number[] {
  const seen: number[] = [];
  return values.map((value) => {
    seen.push(value);
    const sorted = [...seen].sort((a, b) => a - b); // re-sort everything, every time
    const mid = sorted.length >> 1;
    return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  });
}
// #endregion

// #region heaps
export function medians(values: number[]): number[] {
  const low = new Heap<number>((a, b) => a > b); // max-heap: the smaller half, largest on top
  const high = new Heap<number>((a, b) => a < b); // min-heap: the larger half, smallest on top
  return values.map((value) => {
    // 1. Put the value in the correct half.
    if (low.size === 0 || value <= (low.peek() as number)) low.push(value); // @low
    else high.push(value); // @high
    // 2. Rebalance so that low has the same number of items as high, or one more.
    if (low.size > high.size + 1) high.push(low.pop() as number); // @balance
    else if (high.size > low.size) low.push(high.pop() as number);
    // 3. The median sits on top of the heaps.
    return low.size > high.size ? (low.peek() as number) : ((low.peek() as number) + (high.peek() as number)) / 2; // @median
  });
}
// #endregion

function trace(values: number[]) {
  const t = new Tracer();
  const low = new Heap<number>((a, b) => a > b);
  const high = new Heap<number>((a, b) => a < b);
  const out: number[] = [];
  const views = (i: number) => [
    arr(values, { label: { en: 'stream', es: 'flujo' }, pointers: { i }, hl: mark('active', i) }),
    heapTree(low.items, { en: 'smaller half (max-heap: its LARGEST on top)', es: 'mitad menor (max-heap: su MAYOR en la cima)' }, { 0: 'compare' }),
    heapTree(high.items, { en: 'larger half (min-heap: its SMALLEST on top)', es: 'mitad mayor (min-heap: su MENOR en la cima)' }, { 0: 'alt' }),
    vars({ medians: out }),
  ];
  values.forEach((v, i) => {
    const toLow = low.size === 0 || v <= low.peek()!;
    (toLow ? low : high).push(v);
    t.add(
      toLow ? 'low' : 'high',
      {
        en: `${v} arrives. ${toLow ? `It is not larger than the top of the smaller half, so it belongs in the **smaller half**.` : `It is larger than the top of the smaller half (${low.peek()}), so it belongs in the **larger half**.`}`,
        es: `Llega ${v}. ${toLow ? `No es mayor que la cima de la mitad menor, así que va en la **mitad menor**.` : `Es mayor que la cima de la mitad menor (${low.peek()}), así que va en la **mitad mayor**.`}`,
      },
      ...views(i),
    );
    if (low.size > high.size + 1) {
      const m = low.pop()!;
      high.push(m);
      t.add(
        'balance',
        {
          en: `The smaller half has two more items than the larger. Move its top (${m}) across to even them out.`,
          es: `La mitad menor tiene dos elementos más que la mayor. Pasa su cima (${m}) al otro lado para equilibrarlas.`,
        },
        ...views(i),
      );
    } else if (high.size > low.size) {
      const m = high.pop()!;
      low.push(m);
      t.add('balance', { en: `The larger half has more items. Move its top (${m}) across.`, es: `La mitad mayor tiene más elementos. Pasa su cima (${m}) al otro lado.` }, ...views(i));
    }
    const med = low.size > high.size ? low.peek()! : (low.peek()! + high.peek()!) / 2;
    out.push(med);
    t.add(
      'median',
      low.size > high.size
        ? { en: `Odd count: the median is the top of the smaller half, **${med}**.`, es: `Cantidad impar: la mediana es la cima de la mitad menor, **${med}**.` }
        : {
            en: `Even count: the median is the average of the two tops, (${low.peek()} + ${high.peek()}) / 2 = **${med}**.`,
            es: `Cantidad par: la mediana es el promedio de las dos cimas, (${low.peek()} + ${high.peek()}) / 2 = **${med}**.`,
          },
      ...views(i),
    );
  });
  return t.frames;
}

export const medianStream: Problem = {
  id: 'median-stream',
  title: { en: 'Median of a data stream', es: 'Mediana de un flujo de datos' },
  difficulty: 'Hard',
  statement: [
    {
      en: 'Numbers arrive one at a time. After each arrival, report the **median** of all numbers so far: the middle value when sorted, or the average of the two middle values when the count is even.',
      es: 'Los números llegan de uno en uno. Después de cada llegada, informa la **mediana** de todos los números hasta ahora: el valor central al ordenarlos, o el promedio de los dos valores centrales cuando la cantidad es par.',
    },
  ],
  examples: [
    {
      input: 'values = [5, 2, 8, 3]',
      output: '[5, 3.5, 5, 4]',
      why: { en: 'Sorted so far: [5] → [2,5] → [2,5,8] → [2,3,5,8].', es: 'Ordenados hasta ahora: [5] → [2,5] → [2,5,8] → [2,3,5,8].' },
    },
  ],
  insight: {
    en: 'The median only cares about the **boundary** between the smaller half and the larger half — not about the order inside each half. So keep the halves in two heaps: a max-heap for the smaller half (its largest value on top) and a min-heap for the larger half (its smallest on top). The two tops are exactly the middle values. Each new number costs O(log n) instead of a full re-sort.',
    es: 'A la mediana solo le importa la **frontera** entre la mitad menor y la mitad mayor, no el orden dentro de cada mitad. Así que guarda las mitades en dos montículos: un max-heap para la mitad menor (su mayor valor en la cima) y un min-heap para la mitad mayor (su menor valor en la cima). Las dos cimas son exactamente los valores centrales. Cada número nuevo cuesta O(log n) en lugar de reordenar todo.',
  },
  approaches: [
    {
      id: 'sort',
      label: { en: 'Re-sort after every number', es: 'Reordenar tras cada número' },
      kind: 'brute',
      fn: mediansSort,
      time: 'O(n² log n)',
      space: 'O(n)',
      note: {
        en: 'n insertions, each followed by an O(n log n) sort of everything seen so far.',
        es: 'n inserciones, cada una seguida de un ordenamiento O(n log n) de todo lo visto hasta ahora.',
      },
    },
    {
      id: 'heaps',
      label: { en: 'Two heaps', es: 'Dos montículos' },
      kind: 'optimal',
      fn: medians,
      time: 'O(n log n)',
      space: 'O(n)',
      note: {
        en: 'O(log n) per number. Invariants: everything in `low` ≤ everything in `high`, and `low` has the same size as `high` or exactly one more.',
        es: 'O(log n) por número. Invariantes: todo lo que está en `low` ≤ todo lo que está en `high`, y `low` tiene el mismo tamaño que `high` o exactamente uno más.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'mixed order', es: 'orden mezclado' }, args: [[5, 2, 8, 3]], expected: [5, 3.5, 5, 4] },
    { name: { en: 'no values', es: 'sin valores' }, args: [[]], expected: [] },
    { name: { en: 'single value', es: 'un solo valor' }, args: [[7]], expected: [7] },
    { name: { en: 'increasing', es: 'creciente' }, args: [[1, 2, 3, 4, 5]], expected: [1, 1.5, 2, 2.5, 3] },
    { name: { en: 'decreasing', es: 'decreciente' }, args: [[5, 4, 3, 2, 1]], expected: [5, 4.5, 4, 3.5, 3] },
    { name: { en: 'all equal', es: 'todos iguales' }, args: [[2, 2, 2]], expected: [2, 2, 2] },
    { name: { en: 'negative numbers', es: 'números negativos' }, args: [[-1, -3, -2]], expected: [-1, -2, -2] },
    { name: { en: 'duplicates around the middle', es: 'repetidos alrededor del medio' }, args: [[1, 3, 3, 1]], expected: [1, 2, 3, 2] },
    { name: { en: 'large then small', es: 'grandes y luego pequeños' }, args: [[100, 1, 50, 2]], expected: [100, 50.5, 50, 26] },
  ],
  bench: { sizes: [100, 1000, 5000, 20_000], nLabel: { en: 'numbers in the stream', es: 'números en el flujo' }, gen: (n) => [randArray(n)] },
  demo: {
    inputs: [{ name: 'stream', value: '[5, 2, 8, 3, 9, 1, 7]' }],
    validate: (v) => numsErr(v, 9, { en: 'The stream', es: 'El flujo' }, 1),
    traces: { heaps: trace },
  },
};
