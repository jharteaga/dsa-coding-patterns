import code from './simple-sort.ts?code';
import { numsErr } from '../../lib/check';
import { randArray } from '../../lib/ds';
import { Tracer, arr, mark, span, vars } from '../../lib/trace';
import type { Case, Problem } from '../../types';

// #region bubble
export function bubbleSort(nums: number[]): number[] {
  const n = nums.length;
  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false;
    // After each pass the largest remaining value has "bubbled" to the end.
    for (let j = 0; j < n - 1 - pass; j++) {
      if (nums[j] > nums[j + 1]) { // @compare
        [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]]; // @swap
        swapped = true;
      }
    }
    if (!swapped) break; // no swaps = already sorted // @early
  }
  return nums; // @done
}
// #endregion

// #region selection
export function selectionSort(nums: number[]): number[] {
  const n = nums.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i; // @start
    for (let j = i + 1; j < n; j++) {
      if (nums[j] < nums[min]) min = j; // @compare
    }
    if (min !== i) [nums[i], nums[min]] = [nums[min], nums[i]]; // @swap
  }
  return nums; // @done
}
// #endregion

// #region insertion
export function insertionSort(nums: number[]): number[] {
  for (let i = 1; i < nums.length; i++) {
    const value = nums[i]; // @pick
    let j = i - 1;
    // Shift larger values one slot right to open a gap.
    while (j >= 0 && nums[j] > value) {
      nums[j + 1] = nums[j]; // @shift
      j--;
    }
    nums[j + 1] = value; // @insert
  }
  return nums; // @done
}
// #endregion

function traceBubble(a: number[]) {
  const t = new Tracer();
  const n = a.length;
  let cmp = 0;
  let swaps = 0;
  const v = (hl: Record<number, never | string>, sortedFrom: number) => [arr(a, { layout: 'bars', hl: { ...span('done', sortedFrom, n - 1), ...hl } as never }), vars({ comparisons: cmp, swaps })];
  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - pass; j++) {
      cmp++;
      const out = a[j] > a[j + 1];
      t.add(
        'compare',
        {
          en: `Compare neighbours ${a[j]} and ${a[j + 1]}: ${out ? 'out of order.' : 'already in order, leave them.'}`,
          es: `Compara los vecinos ${a[j]} y ${a[j + 1]}: ${out ? 'están desordenados.' : 'ya están en orden, déjalos.'}`,
        },
        ...v(mark('compare', j, j + 1), n - pass),
      );
      if (out) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swapped = true;
        t.add(
          'swap',
          { en: `Swap them. The larger value (${a[j + 1]}) moves one step right.`, es: `Intercámbialos. El valor mayor (${a[j + 1]}) avanza un paso a la derecha.` },
          ...v(mark('active', j, j + 1), n - pass),
        );
      }
    }
    if (!swapped) {
      t.add(
        'early',
        {
          en: 'A full pass with no swaps means everything is in order. Stop early.',
          es: 'Una pasada completa sin intercambios significa que todo está en orden. Detente antes.',
        },
        ...v({}, 0),
      );
      break;
    }
    t.add(
      undefined,
      {
        en: `End of pass ${pass + 1}: the largest unsorted value has bubbled to its final place.`,
        es: `Fin de la pasada ${pass + 1}: el mayor valor sin ordenar subió como burbuja hasta su lugar final.`,
      },
      ...v({}, n - 1 - pass),
    );
  }
  t.add('done', { en: `Sorted with **${cmp} comparisons** and **${swaps} swaps**.`, es: `Ordenado con **${cmp} comparaciones** y **${swaps} intercambios**.` }, ...v({}, 0));
  return t.frames;
}

function traceSelection(a: number[]) {
  const t = new Tracer();
  const n = a.length;
  let cmp = 0;
  let swaps = 0;
  const v = (hl: object, sortedTo: number, pointers = {}) => [arr(a, { layout: 'bars', pointers, hl: { ...span('done', 0, sortedTo), ...hl } as never }), vars({ comparisons: cmp, swaps })];
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    t.add(
      'start',
      {
        en: `Find the smallest value in the unsorted part (index ${i} onward). Assume it is ${a[i]} for now.`,
        es: `Encuentra el valor más pequeño en la parte sin ordenar (del índice ${i} en adelante). Por ahora supón que es ${a[i]}.`,
      },
      ...v(mark('good', min), i - 1, { i }),
    );
    for (let j = i + 1; j < n; j++) {
      cmp++;
      const smaller = a[j] < a[min];
      t.add(
        'compare',
        {
          en: `Is ${a[j]} smaller than the current minimum ${a[min]}? ${smaller ? 'Yes — new minimum.' : 'No.'}`,
          es: `¿${a[j]} es menor que el mínimo actual ${a[min]}? ${smaller ? 'Sí: nuevo mínimo.' : 'No.'}`,
        },
        ...v({ ...mark('good', min), ...mark('compare', j) }, i - 1, { i, j }),
      );
      if (smaller) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      swaps++;
      t.add(
        'swap',
        {
          en: `The minimum is ${a[i]}. Swap it into position ${i} — one swap per pass.`,
          es: `El mínimo es ${a[i]}. Intercámbialo a la posición ${i}: un intercambio por pasada.`,
        },
        ...v(mark('active', i, min), i - 1, { i }),
      );
    } else t.add('swap', { en: `${a[i]} is already the minimum; no swap needed.`, es: `${a[i]} ya es el mínimo; no hace falta intercambiar.` }, ...v({}, i, { i }));
  }
  t.add(
    'done',
    {
      en: `Sorted with **${cmp} comparisons** and only **${swaps} swaps** — but the comparisons are always n(n−1)/2, even on sorted input.`,
      es: `Ordenado con **${cmp} comparaciones** y solo **${swaps} intercambios**, pero las comparaciones siempre son n(n−1)/2, incluso con una entrada ordenada.`,
    },
    ...v({}, n - 1),
  );
  return t.frames;
}

function traceInsertion(a: number[]) {
  const t = new Tracer();
  let cmp = 0;
  let shifts = 0;
  const v = (hl: object, sortedTo: number, pointers = {}) => [arr(a, { layout: 'bars', pointers, hl: { ...span('done', 0, sortedTo), ...hl } as never }), vars({ comparisons: cmp, shifts })];
  for (let i = 1; i < a.length; i++) {
    const value = a[i];
    let j = i - 1;
    t.add(
      'pick',
      {
        en: `Everything left of index ${i} is sorted. Pick up ${value} and find where it belongs among them.`,
        es: `Todo lo que está a la izquierda del índice ${i} está ordenado. Toma ${value} y encuentra dónde le corresponde entre ellos.`,
      },
      ...v(mark('active', i), i - 1, { i }),
    );
    while (j >= 0) {
      cmp++;
      if (a[j] <= value) break;
      a[j + 1] = a[j];
      shifts++;
      t.add(
        'shift',
        { en: `${a[j]} is larger than ${value}: slide it one slot right.`, es: `${a[j]} es mayor que ${value}: deslízalo una posición a la derecha.` },
        ...v({ ...mark('compare', j + 1), ...mark('muted', j) }, i, { j }),
      );
      j--;
    }
    a[j + 1] = value;
    t.add(
      'insert',
      {
        en: `Drop ${value} into the gap at index ${j + 1}. The first ${i + 1} values are now sorted.`,
        es: `Coloca ${value} en el hueco del índice ${j + 1}. Los primeros ${i + 1} valores ya están ordenados.`,
      },
      ...v(mark('good', j + 1), i),
    );
  }
  t.add(
    'done',
    {
      en: `Sorted with **${cmp} comparisons** and **${shifts} shifts**. On nearly-sorted input this is close to n.`,
      es: `Ordenado con **${cmp} comparaciones** y **${shifts} desplazamientos**. Con una entrada casi ordenada, esto se acerca a n.`,
    },
    ...v({}, a.length - 1),
  );
  return t.frames;
}

export const sortCases: Case[] = [
  { name: { en: 'random order', es: 'orden aleatorio' }, args: [[5, 2, 9, 1, 5, 6]], expected: [1, 2, 5, 5, 6, 9] },
  { name: { en: 'empty array', es: 'arreglo vacío' }, args: [[]], expected: [] },
  { name: { en: 'single element', es: 'un solo elemento' }, args: [[42]], expected: [42] },
  { name: { en: 'two elements, swapped', es: 'dos elementos, invertidos' }, args: [[2, 1]], expected: [1, 2] },
  { name: { en: 'already sorted (best case)', es: 'ya ordenado (mejor caso)' }, args: [[1, 2, 3, 4, 5, 6]], expected: [1, 2, 3, 4, 5, 6] },
  { name: { en: 'reverse sorted (worst case)', es: 'ordenado al revés (peor caso)' }, args: [[6, 5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5, 6] },
  { name: { en: 'all equal', es: 'todos iguales' }, args: [[7, 7, 7, 7]], expected: [7, 7, 7, 7] },
  { name: { en: 'many duplicates', es: 'muchos duplicados' }, args: [[3, 1, 3, 1, 2, 2, 3]], expected: [1, 1, 2, 2, 3, 3, 3] },
  { name: { en: 'negative numbers', es: 'números negativos' }, args: [[0, -5, 3, -1, -5, 8]], expected: [-5, -5, -1, 0, 3, 8] },
  { name: { en: 'one element out of place', es: 'un elemento fuera de lugar' }, args: [[1, 2, 3, 4, 0]], expected: [0, 1, 2, 3, 4] },
];
export const sortDemoValidate = (a: unknown) =>
  numsErr(a, 12, { en: 'The array', es: 'El arreglo' }) ??
  ((a as number[]).some((x) => !Number.isInteger(x) || x < -99 || x > 99) ? { en: 'Use whole numbers between -99 and 99.', es: 'Usa números enteros entre -99 y 99.' } : null);

export const simpleSort: Problem = {
  id: 'simple-sort',
  title: { en: 'Sort an array — the three simple sorts', es: 'Ordena un arreglo: los tres ordenamientos simples' },
  difficulty: 'Easy',
  statement: [
    { en: 'Sort an array of integers into ascending order, in place.', es: 'Ordena un arreglo de enteros de forma ascendente, en el mismo lugar (in place).' },
    {
      en: 'Bubble, selection and insertion sort are the algorithms people invent naturally. All three are O(n²) in the worst case, but they waste work in different ways — compare them two at a time in the animation.',
      es: 'Los ordenamientos de burbuja, selección e inserción son los algoritmos que la gente inventa de forma natural. Los tres son O(n²) en el peor caso, pero desperdician trabajo de maneras distintas: compáralos de dos en dos en la animación.',
    },
  ],
  examples: [{ input: 'nums = [5, 2, 9, 1, 5, 6]', output: '[1, 2, 5, 5, 6, 9]' }],
  insight: {
    en: 'All three keep a sorted region that grows by one element per pass, and each pass costs up to n steps — hence n × n. **Insertion sort** is the one worth remembering: it does almost no work on data that is already nearly sorted (O(n) best case), it is stable, and real libraries use it for small arrays inside their fast sorts. To beat O(n²) in general you need a different idea — see the next pattern.',
    es: 'Los tres mantienen una región ordenada que crece un elemento por pasada, y cada pasada cuesta hasta n pasos; de ahí n × n. El **ordenamiento por inserción** es el que vale la pena recordar: casi no trabaja con datos que ya están casi ordenados (O(n) en el mejor caso), es estable, y las bibliotecas reales lo usan para arreglos pequeños dentro de sus ordenamientos rápidos. Para superar O(n²) en general necesitas otra idea: mira el siguiente patrón.',
  },
  approaches: [
    {
      id: 'bubble',
      label: { en: 'Bubble sort', es: 'Ordenamiento de burbuja' },
      kind: 'brute',
      fn: bubbleSort,
      time: 'O(n²)',
      space: 'O(1)',
      note: {
        en: 'Repeatedly sweep the array swapping neighbours that are out of order; the largest value "bubbles" to the end each sweep. Lots of swaps. Best case O(n) thanks to the early exit. Stable.',
        es: 'Barre el arreglo una y otra vez intercambiando vecinos desordenados; en cada barrido el valor más grande "sube como burbuja" hasta el final. Muchos intercambios. Mejor caso O(n) gracias a la salida anticipada. Estable.',
      },
    },
    {
      id: 'selection',
      label: { en: 'Selection sort', es: 'Ordenamiento por selección' },
      kind: 'brute',
      fn: selectionSort,
      time: 'O(n²)',
      space: 'O(1)',
      note: {
        en: 'Find the minimum of the unsorted part and swap it to the front. At most n − 1 swaps (good when writes are expensive), but always n²/2 comparisons, even on sorted input. Not stable.',
        es: 'Encuentra el mínimo de la parte sin ordenar e intercámbialo al frente. Como máximo n − 1 intercambios (bueno cuando escribir es costoso), pero siempre n²/2 comparaciones, incluso con una entrada ordenada. No es estable.',
      },
    },
    {
      id: 'insertion',
      label: { en: 'Insertion sort', es: 'Ordenamiento por inserción' },
      kind: 'better',
      fn: insertionSort,
      time: 'O(n²)',
      space: 'O(1)',
      note: {
        en: 'Take the next value and slide it left into its place among the already-sorted values — how most people sort a hand of cards. O(n) on nearly-sorted input. Stable.',
        es: 'Toma el siguiente valor y deslízalo a la izquierda hasta su lugar entre los valores ya ordenados, como la mayoría ordena las cartas en la mano. O(n) con una entrada casi ordenada. Estable.',
      },
    },
  ],
  code,
  mutates: true,
  cases: sortCases,
  bench: {
    sizes: [100, 1000, 5000, 20_000],
    nLabel: { en: 'array length (random order)', es: 'longitud del arreglo (orden aleatorio)' },
    gen: (n) => [randArray(n)],
  },
  demo: {
    inputs: [{ name: 'nums', value: '[6, 3, 8, 2, 9, 1, 5]' }],
    validate: sortDemoValidate,
    traces: { bubble: traceBubble, selection: traceSelection, insertion: traceInsertion },
  },
};
