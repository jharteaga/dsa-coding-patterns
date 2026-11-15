import code from './fast-sort.ts?code';
import simpleCode from './simple-sort.ts?code';
import { randArray } from '../../lib/ds';
import { Tracer, arr, mark, mergeCode, span, vars } from '../../lib/trace';
import type { Problem } from '../../types';
import { insertionSort, sortCases, sortDemoValidate } from './simple-sort';

// #region merge
export function mergeSort(nums: number[]): number[] {
  const sort = (lo: number, hi: number): void => {
    if (lo >= hi) return; // 0 or 1 element: already sorted
    const mid = lo + Math.floor((hi - lo) / 2); // @split
    sort(lo, mid);
    sort(mid + 1, hi);

    // Merge the two sorted halves nums[lo..mid] and nums[mid+1..hi].
    const left = nums.slice(lo, mid + 1);
    const right = nums.slice(mid + 1, hi + 1); // @halves
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      nums[k++] = left[i] <= right[j] ? left[i++] : right[j++]; // @take
    }
    while (i < left.length) nums[k++] = left[i++]; // @rest
    while (j < right.length) nums[k++] = right[j++];
  };
  sort(0, nums.length - 1);
  return nums; // @done
}
// #endregion

// #region quick
export function quickSort(nums: number[]): number[] {
  const sort = (lo: number, hi: number): void => {
    if (lo >= hi) return;
    // Use the middle element as pivot; park it at the end.
    const mid = lo + Math.floor((hi - lo) / 2);
    [nums[mid], nums[hi]] = [nums[hi], nums[mid]];
    const pivot = nums[hi]; // @pivot

    // Partition: everything smaller than the pivot goes to the left.
    let store = lo;
    for (let i = lo; i < hi; i++) {
      if (nums[i] < pivot) { // @compare
        [nums[i], nums[store]] = [nums[store], nums[i]]; // @swap
        store++;
      }
    }
    [nums[store], nums[hi]] = [nums[hi], nums[store]]; // pivot lands in its final place // @place

    sort(lo, store - 1);
    sort(store + 1, hi);
  };
  sort(0, nums.length - 1);
  return nums; // @done
}
// #endregion

// #region heap
export function heapSort(nums: number[]): number[] {
  const n = nums.length;
  // Push nums[i] down until both children are smaller (max-heap inside nums[0..size)).
  const siftDown = (i: number, size: number): void => {
    while (true) {
      const l = 2 * i + 1;
      const r = l + 1;
      let largest = i;
      if (l < size && nums[l] > nums[largest]) largest = l;
      if (r < size && nums[r] > nums[largest]) largest = r;
      if (largest === i) return;
      [nums[i], nums[largest]] = [nums[largest], nums[i]];
      i = largest;
    }
  };

  // 1. Turn the array into a max-heap: O(n).
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
  // 2. Repeatedly move the maximum to the end and shrink the heap.
  for (let end = n - 1; end > 0; end--) {
    [nums[0], nums[end]] = [nums[end], nums[0]];
    siftDown(0, end);
  }
  return nums;
}
// #endregion

// #region counting
export function countingSort(nums: number[]): number[] {
  if (nums.length === 0) return nums;
  let min = nums[0];
  let max = nums[0];
  for (const x of nums) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  // One counter per possible value. No comparisons between elements at all.
  const counts = new Array<number>(max - min + 1).fill(0);
  for (const x of nums) counts[x - min]++;

  let k = 0;
  for (let v = 0; v < counts.length; v++) {
    for (let c = counts[v]; c > 0; c--) nums[k++] = v + min;
  }
  return nums;
}
// #endregion

function traceMerge(a: number[]) {
  const t = new Tracer();
  let writes = 0;
  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = lo + Math.floor((hi - lo) / 2);
    t.add(
      'split',
      {
        en: `Split [${lo}..${hi}] in the middle. Sort each half separately first (by splitting again…).`,
        es: `Parte [${lo}..${hi}] por la mitad. Primero ordena cada mitad por separado (partiéndola de nuevo…).`,
      },
      arr(a, { layout: 'bars', hl: { ...span('window', lo, mid), ...span('alt', mid + 1, hi) } }),
      vars({ writes }),
    );
    sort(lo, mid);
    sort(mid + 1, hi);
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    t.add(
      'halves',
      {
        en: `Both halves of [${lo}..${hi}] are now sorted on their own: [${left.join(', ')}] and [${right.join(', ')}]. Merge them.`,
        es: `Las dos mitades de [${lo}..${hi}] ya están ordenadas por separado: [${left.join(', ')}] y [${right.join(', ')}]. Mézclalas.`,
      },
      arr(a, { layout: 'bars', hl: { ...span('window', lo, mid), ...span('alt', mid + 1, hi) } }),
      vars({ left, right, writes }),
    );
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length || j < right.length) {
      const takeLeft = j >= right.length || (i < left.length && left[i] <= right[j]);
      const val = takeLeft ? left[i++] : right[j++];
      a[k] = val;
      writes++;
      t.add(
        i < left.length && j < right.length ? 'take' : 'take',
        {
          en: `Look only at the front of each half and take the smaller one: **${val}** goes to index ${k}.`,
          es: `Mira solo el frente de cada mitad y toma el menor: **${val}** va al índice ${k}.`,
        },
        arr(a, { layout: 'bars', hl: { ...span('done', lo, k - 1), ...mark('good', k), ...span('muted', k + 1, hi) } }),
        vars({ 'left remaining': left.slice(i), 'right remaining': right.slice(j), writes }),
      );
      k++;
    }
  };
  sort(0, a.length - 1);
  t.add(
    'done',
    {
      en: `Sorted. Each of the ~log₂(n) levels of splitting needs n writes to merge: **${writes} writes** in total.`,
      es: `Ordenado. Cada uno de los ~log₂(n) niveles de partición necesita n escrituras para mezclar: **${writes} escrituras** en total.`,
    },
    arr(a, { layout: 'bars', hl: span('done', 0, a.length - 1) }),
    vars({ writes }),
  );
  return t.frames;
}

function traceQuick(a: number[]) {
  const t = new Tracer();
  const placed = new Set<number>();
  let cmp = 0;
  const base = () => Object.fromEntries([...placed].map((i) => [i, 'done' as const]));
  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      placed.add(lo);
      return;
    }
    const mid = lo + Math.floor((hi - lo) / 2);
    [a[mid], a[hi]] = [a[hi], a[mid]];
    const pivot = a[hi];
    t.add(
      'pivot',
      {
        en: `Work on [${lo}..${hi}]. Pick a pivot (${pivot}) and park it at the end. Goal: smaller values to its left, larger to its right.`,
        es: `Trabaja en [${lo}..${hi}]. Elige un pivote (${pivot}) y déjalo al final. Meta: los valores menores a su izquierda y los mayores a su derecha.`,
      },
      arr(a, { layout: 'bars', pointers: { pivot: hi }, hl: { ...base(), ...span('window', lo, hi - 1), ...mark('alt', hi) } }),
      vars({ comparisons: cmp }),
    );
    let store = lo;
    for (let i = lo; i < hi; i++) {
      cmp++;
      const small = a[i] < pivot;
      t.add(
        'compare',
        {
          en: `Is ${a[i]} smaller than the pivot ${pivot}? ${small ? 'Yes — it belongs in the "smaller" zone.' : 'No — leave it.'}`,
          es: `¿${a[i]} es menor que el pivote ${pivot}? ${small ? 'Sí: pertenece a la zona de "menores".' : 'No: déjalo.'}`,
        },
        arr(a, { layout: 'bars', pointers: { store, i }, hl: { ...base(), ...span('compare', lo, store - 1), ...mark('active', i), ...mark('alt', hi) } }),
        vars({ comparisons: cmp }),
      );
      if (small) {
        [a[i], a[store]] = [a[store], a[i]];
        store++;
      }
    }
    [a[store], a[hi]] = [a[hi], a[store]];
    placed.add(store);
    t.add(
      'place',
      {
        en: `Put the pivot ${pivot} between the two zones, at index ${store}. That is its **final** position — it never moves again. Now sort each side the same way.`,
        es: `Coloca el pivote ${pivot} entre las dos zonas, en el índice ${store}. Esa es su posición **final**: nunca vuelve a moverse. Ahora ordena cada lado de la misma forma.`,
      },
      arr(a, { layout: 'bars', hl: { ...base(), ...span('compare', lo, store - 1), ...mark('good', store) } }),
      vars({ comparisons: cmp }),
    );
    sort(lo, store - 1);
    sort(store + 1, hi);
  };
  sort(0, a.length - 1);
  t.add(
    'done',
    { en: `Sorted with **${cmp} comparisons**.`, es: `Ordenado con **${cmp} comparaciones**.` },
    arr(a, { layout: 'bars', hl: span('done', 0, a.length - 1) }),
    vars({ comparisons: cmp }),
  );
  return t.frames;
}

export const fastSort: Problem = {
  id: 'fast-sort',
  title: { en: 'Sort an array — divide and conquer', es: 'Ordena un arreglo: divide y vencerás' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'Sort an array of integers into ascending order — this time faster than O(n²).',
      es: 'Ordena un arreglo de enteros de forma ascendente, esta vez más rápido que O(n²).',
    },
    {
      en: 'Insertion sort is included as the baseline so you can watch the gap open up in the benchmark.',
      es: 'El ordenamiento por inserción se incluye como referencia para que veas cómo se abre la brecha en el benchmark.',
    },
  ],
  examples: [{ input: 'nums = [5, 2, 9, 1, 5, 6]', output: '[1, 2, 5, 5, 6, 9]' }],
  insight: {
    en: 'The simple sorts move each element one small step at a time. The fast sorts **split the problem in half**. You can only halve n about log₂(n) times before reaching single elements, and each level of halving needs O(n) work in total — so n × log n. For 1,000,000 elements that is about 20 million steps instead of a trillion.',
    es: 'Los ordenamientos simples mueven cada elemento un pequeño paso a la vez. Los ordenamientos rápidos **parten el problema a la mitad**. Solo puedes partir n a la mitad unas log₂(n) veces antes de llegar a elementos sueltos, y cada nivel de partición necesita O(n) de trabajo en total; por eso n × log n. Para 1,000,000 de elementos son unos 20 millones de pasos en lugar de un billón.',
  },
  approaches: [
    {
      id: 'insertion',
      label: { en: 'Insertion sort (baseline)', es: 'Ordenamiento por inserción (referencia)' },
      kind: 'brute',
      fn: insertionSort,
      time: 'O(n²)',
      space: 'O(1)',
      note: { en: 'The best of the simple sorts, from the previous pattern.', es: 'El mejor de los ordenamientos simples, del patrón anterior.' },
    },
    {
      id: 'merge',
      label: { en: 'Merge sort', es: 'Merge sort (ordenamiento por mezcla)' },
      kind: 'optimal',
      fn: mergeSort,
      time: 'O(n log n)',
      space: 'O(n)',
      note: {
        en: 'Split in half, sort each half recursively, then **merge** the two sorted halves by repeatedly taking the smaller front element. Always O(n log n), and stable — but needs O(n) extra memory for the merge.',
        es: 'Parte a la mitad, ordena cada mitad recursivamente y luego **mezcla** las dos mitades ordenadas tomando repetidamente el menor elemento del frente. Siempre O(n log n) y estable, pero necesita O(n) de memoria extra para la mezcla.',
      },
    },
    {
      id: 'quick',
      label: { en: 'Quick sort', es: 'Quick sort (ordenamiento rápido)' },
      kind: 'optimal',
      fn: quickSort,
      time: 'O(n log n) avg',
      space: 'O(log n)',
      note: {
        en: 'Pick a pivot, **partition** so smaller values are left of it and larger right, then sort each side. In place and usually the fastest in practice. Worst case O(n²) if the pivots are consistently terrible. Not stable.',
        es: 'Elige un pivote, **particiona** para que los valores menores queden a su izquierda y los mayores a su derecha, y luego ordena cada lado. Trabaja en el mismo lugar y suele ser el más rápido en la práctica. Peor caso O(n²) si los pivotes son malos una y otra vez. No es estable.',
      },
    },
    {
      id: 'heap',
      label: { en: 'Heap sort', es: 'Heap sort (ordenamiento por montículo)' },
      kind: 'optimal',
      fn: heapSort,
      time: 'O(n log n)',
      space: 'O(1)',
      note: {
        en: 'Arrange the array as a max-heap, then repeatedly swap the maximum to the end and repair the heap. Guaranteed O(n log n) with no extra memory, but slower in practice than quick sort. Not stable.',
        es: 'Organiza el arreglo como un montículo de máximos (max-heap) y luego intercambia repetidamente el máximo al final y repara el montículo. O(n log n) garantizado sin memoria extra, pero más lento en la práctica que quick sort. No es estable.',
      },
    },
    {
      id: 'counting',
      label: { en: 'Counting sort', es: 'Ordenamiento por conteo' },
      kind: 'optimal',
      fn: countingSort,
      time: 'O(n + k)',
      space: 'O(k)',
      note: {
        en: 'Not a comparison sort: count how many times each value occurs, then write the values out in order. k is the range of values (max − min). Beats n log n when the range is small — useless when it is huge.',
        es: 'No es un ordenamiento por comparación: cuenta cuántas veces aparece cada valor y luego escribe los valores en orden. k es el rango de valores (máx − mín). Supera n log n cuando el rango es pequeño, pero no sirve cuando es enorme.',
      },
    },
  ],
  code: mergeCode(simpleCode, code),
  mutates: true,
  cases: sortCases,
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'array length (random values −1000…1000)', es: 'longitud del arreglo (valores aleatorios −1000…1000)' },
    gen: (n) => [randArray(n)],
  },
  demo: {
    inputs: [{ name: 'nums', value: '[6, 3, 8, 2, 9, 1, 5, 7]' }],
    validate: sortDemoValidate,
    traces: { merge: traceMerge, quick: traceQuick },
  },
};
