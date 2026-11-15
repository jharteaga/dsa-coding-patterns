import code from './classic-search.ts?code';
import { distinctSorted, randInt } from '../../lib/ds';
import { Tracer, arr, mark, span, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region linear
export function linearSearch(nums: number[], target: number): number {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i; // @check
  }
  return -1; // @miss
}
// #endregion

// #region binary
export function binarySearch(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1; // @init
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // @mid
    if (nums[mid] === target) return mid; // @found
    if (nums[mid] < target) lo = mid + 1; // @right
    else hi = mid - 1; // @left
  }
  return -1; // @miss
}
// #endregion

function traceLinear(nums: number[], target: number) {
  const t = new Tracer();
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) {
      t.add(
        'check',
        {
          en: `nums[${i}] = ${nums[i]} equals the target. Found it at index **${i}** after looking at ${i + 1} element(s).`,
          es: `nums[${i}] = ${nums[i]} es igual al objetivo. Lo encontramos en el índice **${i}** tras revisar ${i + 1} elemento(s).`,
        },
        arr(nums, { pointers: { i }, hl: { ...span('muted', 0, i - 1), ...mark('good', i) } }),
      );
      return t.frames;
    }
    t.add(
      'check',
      { en: `Is nums[${i}] = ${nums[i]} equal to ${target}? No — move one step right.`, es: `¿nums[${i}] = ${nums[i]} es igual a ${target}? No: avanza un paso a la derecha.` },
      arr(nums, { pointers: { i }, hl: { ...span('muted', 0, i - 1), ...mark('active', i) } }),
    );
  }
  t.add(
    'miss',
    { en: `Looked at all ${nums.length} elements and never saw ${target}. Return **-1**.`, es: `Revisamos los ${nums.length} elementos y nunca vimos ${target}. Devuelve **-1**.` },
    arr(nums, { hl: span('muted', 0, nums.length - 1) }),
  );
  return t.frames;
}

function traceBinary(nums: number[], target: number) {
  const t = new Tracer();
  let lo = 0;
  let hi = nums.length - 1;
  const out = () => ({ ...span('muted', 0, lo - 1), ...span('muted', hi + 1, nums.length - 1) });
  t.add(
    'init',
    {
      en: `The target, if present, is somewhere between index ${lo} and ${hi}. That range is our **search space**.`,
      es: `El objetivo, si está, se encuentra en algún lugar entre el índice ${lo} y el ${hi}. Ese rango es nuestro **espacio de búsqueda**.`,
    },
    arr(nums, { pointers: { lo, hi }, hl: span('window', lo, hi) }),
  );
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    t.add(
      'mid',
      {
        en: `Look at the middle of the search space: mid = ${mid}, nums[mid] = ${nums[mid]}.`,
        es: `Mira el centro del espacio de búsqueda: mid = ${mid}, nums[mid] = ${nums[mid]}.`,
      },
      arr(nums, { pointers: { lo, mid, hi }, hl: { ...span('window', lo, hi), ...out(), ...mark('active', mid) } }),
      vars({ target }),
    );
    if (nums[mid] === target) {
      t.add(
        'found',
        { en: `nums[${mid}] equals ${target}. Found it at index **${mid}**.`, es: `nums[${mid}] es igual a ${target}. Lo encontramos en el índice **${mid}**.` },
        arr(nums, { pointers: { mid }, hl: { ...out(), ...mark('good', mid) } }),
      );
      return t.frames;
    }
    if (nums[mid] < target) {
      lo = mid + 1;
      t.add(
        'right',
        {
          en: `${nums[mid]} is **smaller** than ${target}. The array is sorted, so everything to the left of mid is smaller too — throw away that whole half.`,
          es: `${nums[mid]} es **menor** que ${target}. El arreglo está ordenado, así que todo lo que está a la izquierda de mid también es menor: descarta esa mitad completa.`,
        },
        arr(nums, { pointers: { lo, hi }, hl: { ...span('window', lo, hi), ...out() } }),
      );
    } else {
      hi = mid - 1;
      t.add(
        'left',
        {
          en: `${nums[mid]} is **bigger** than ${target}. Everything to the right of mid is bigger too — throw away that whole half.`,
          es: `${nums[mid]} es **mayor** que ${target}. Todo lo que está a la derecha de mid también es mayor: descarta esa mitad completa.`,
        },
        arr(nums, { pointers: { lo, hi }, hl: { ...span('window', lo, hi), ...out() } }),
      );
    }
  }
  t.add(
    'miss',
    {
      en: `lo passed hi: the search space is empty, so ${target} is not in the array. Return **-1**.`,
      es: `lo rebasó a hi: el espacio de búsqueda está vacío, así que ${target} no está en el arreglo. Devuelve **-1**.`,
    },
    arr(nums, { hl: span('muted', 0, nums.length - 1) }),
  );
  return t.frames;
}

export const classicSearch: Problem = {
  id: 'classic-search',
  title: { en: 'Find a number in a sorted array', es: 'Encuentra un número en un arreglo ordenado' },
  difficulty: 'Easy',
  statement: [
    {
      en: 'Given an array of **distinct** integers `nums` sorted in ascending order and a `target`, return the index of `target`, or `-1` if it is not there.',
      es: 'Dado un arreglo de enteros **distintos** `nums` ordenado de forma ascendente y un `target`, devuelve el índice de `target`, o `-1` si no está.',
    },
  ],
  examples: [
    { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4', why: { en: '9 is at index 4.', es: '9 está en el índice 4.' } },
    { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2', output: '-1', why: { en: '2 is not in the array.', es: '2 no está en el arreglo.' } },
  ],
  insight: {
    en: 'The array is **sorted**, and linear search never uses that fact. Compare the target with the *middle* element: one comparison tells you which half the target cannot be in, so you discard half of what is left every step. 1,000,000 elements need at most 20 comparisons.',
    es: 'El arreglo está **ordenado**, y la búsqueda lineal nunca aprovecha ese hecho. Compara el objetivo con el elemento *del medio*: una comparación te dice en qué mitad no puede estar el objetivo, así que descartas la mitad de lo que queda en cada paso. 1,000,000 de elementos necesitan como máximo 20 comparaciones.',
  },
  approaches: [
    {
      id: 'linear',
      label: { en: 'Linear search', es: 'Búsqueda lineal' },
      kind: 'brute',
      fn: linearSearch,
      time: 'O(n)',
      space: 'O(1)',
      note: {
        en: 'Check every element from left to right. Correct for any array, sorted or not — but in the worst case (target missing or last) it looks at all n elements.',
        es: 'Revisa cada elemento de izquierda a derecha. Es correcta para cualquier arreglo, ordenado o no, pero en el peor caso (objetivo ausente o al final) revisa los n elementos.',
      },
    },
    {
      id: 'binary',
      label: { en: 'Binary search', es: 'Búsqueda binaria' },
      kind: 'optimal',
      fn: binarySearch,
      time: 'O(log n)',
      space: 'O(1)',
      note: {
        en: 'Keep a search space `[lo, hi]`. Look at the middle; if it is too small move `lo` past it, if too big move `hi` before it. The space halves every step, so it takes about log₂(n) steps.',
        es: 'Mantén un espacio de búsqueda `[lo, hi]`. Mira el centro; si es demasiado pequeño, mueve `lo` más allá de él; si es demasiado grande, mueve `hi` antes de él. El espacio se reduce a la mitad en cada paso, así que toma unos log₂(n) pasos.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'target in the middle', es: 'objetivo en el medio' }, args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
    { name: { en: 'target missing (between values)', es: 'objetivo ausente (entre valores)' }, args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
    { name: { en: 'empty array', es: 'arreglo vacío' }, args: [[], 7], expected: -1 },
    { name: { en: 'single element, found', es: 'un solo elemento, encontrado' }, args: [[5], 5], expected: 0 },
    { name: { en: 'single element, missing', es: 'un solo elemento, ausente' }, args: [[5], -5], expected: -1 },
    { name: { en: 'target is the first element', es: 'el objetivo es el primer elemento' }, args: [[1, 3, 5, 7, 9], 1], expected: 0 },
    { name: { en: 'target is the last element', es: 'el objetivo es el último elemento' }, args: [[1, 3, 5, 7, 9], 9], expected: 4 },
    { name: { en: 'smaller than everything', es: 'menor que todos' }, args: [[1, 3, 5, 7, 9], -100], expected: -1 },
    { name: { en: 'larger than everything', es: 'mayor que todos' }, args: [[1, 3, 5, 7, 9], 100], expected: -1 },
    { name: { en: 'two elements, second', es: 'dos elementos, el segundo' }, args: [[1, 2], 2], expected: 1 },
    { name: { en: 'negative numbers', es: 'números negativos' }, args: [[-9, -7, -4, -1], -7], expected: 1 },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000, 1_000_000],
    nLabel: { en: 'array length', es: 'longitud del arreglo' },
    // worst case for linear search: the target is not in the array
    gen: (n) => {
      const nums = distinctSorted(n);
      return [nums, Math.random() < 0.5 ? nums[n - 1] + 1 : nums[randInt(0, n - 1)]];
    },
  },
  demo: {
    inputs: [
      { name: 'nums (sorted)', value: '[1, 3, 4, 6, 8, 9, 11, 14, 15, 18, 21, 25]' },
      { name: 'target', value: '18' },
    ],
    validate: (nums: number[], target: number) =>
      !Array.isArray(nums) || nums.some((x) => typeof x !== 'number') || typeof target !== 'number'
        ? { en: 'nums must be an array of numbers and target a number.', es: 'nums debe ser un arreglo de números y target un número.' }
        : nums.some((x, i) => i > 0 && nums[i - 1] >= x)
          ? {
              en: 'nums must be sorted in ascending order with no duplicates — binary search only works on sorted data.',
              es: 'nums debe estar ordenado de forma ascendente y sin duplicados: la búsqueda binaria solo funciona con datos ordenados.',
            }
          : null,
    traces: { linear: traceLinear, binary: traceBinary },
  },
};
