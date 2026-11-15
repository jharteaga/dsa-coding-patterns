import code from './two-sum.ts?code';
import { first, intErr, numsErr } from '../../lib/check';
import { randArray, randInt, shuffle } from '../../lib/ds';
import { Tracer, arr, mark, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region brute
export function twoSumBrute(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [-1, -1];
}
// #endregion

// #region map
export function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>(); // value -> index where we saw it
  for (let j = 0; j < nums.length; j++) {
    const need = target - nums[j]; // @need
    const i = seen.get(need);
    if (i !== undefined) return [i, j]; // @found
    seen.set(nums[j], j); // @store
  }
  return [-1, -1]; // @miss
}
// #endregion

function trace(nums: number[], target: number) {
  const t = new Tracer();
  const seen = new Map<number, number>();
  const mapView = () => vars(Object.fromEntries([...seen].map(([k, v]) => [`${k}`, { en: `index ${v}`, es: `índice ${v}` }])), { en: 'seen (value → index)', es: 'vistos (valor → índice)' });
  for (let j = 0; j < nums.length; j++) {
    const need = target - nums[j];
    t.add('need', { en: `At ${nums[j]}. For this to be half of a pair, the other half must be ${target} − ${nums[j]} = **${need}**. Have we already seen ${need}?`, es: `En ${nums[j]}. Para que sea la mitad de un par, la otra mitad debe ser ${target} − ${nums[j]} = **${need}**. ¿Ya vimos ${need}?` }, arr(nums, { pointers: { j }, hl: mark('active', j) }), vars({ target, need }), mapView());
    if (seen.has(need)) {
      const i = seen.get(need)!;
      t.add('found', { en: `Yes — ${need} was seen at index ${i}. One hash lookup instead of scanning the array. Answer: **[${i}, ${j}]**.`, es: `Sí: ${need} se vio en el índice ${i}. Una sola búsqueda en el mapa hash en lugar de recorrer el arreglo. Respuesta: **[${i}, ${j}]**.` }, arr(nums, { hl: mark('good', i, j) }), mapView());
      return t.frames;
    }
    seen.set(nums[j], j);
    t.add('store', { en: `No. Remember ${nums[j]} (index ${j}) so a later number can find it.`, es: `No. Guarda ${nums[j]} (índice ${j}) para que un número posterior pueda encontrarlo.` }, arr(nums, { pointers: { j }, hl: mark('done', j) }), mapView());
  }
  t.add('miss', { en: 'Reached the end without finding a pair.', es: 'Llegamos al final sin encontrar un par.' }, arr(nums), mapView());
  return t.frames;
}

export const twoSumProblem: Problem = {
  id: 'two-sum',
  title: { en: 'Two Sum (unsorted array)', es: 'Two Sum (arreglo sin ordenar)' },
  difficulty: 'Easy',
  statement: [
    { en: 'Given an **unsorted** array of integers and a `target`, return the indices `[i, j]` (`i < j`) of two numbers that add up to `target`. Each input has at most one valid answer; return `[-1, -1]` if there is none.', es: 'Dado un arreglo de enteros **sin ordenar** y un `target`, devuelve los índices `[i, j]` (`i < j`) de dos números que suman `target`. Cada entrada tiene como máximo una respuesta válida; devuelve `[-1, -1]` si no hay ninguna.' },
  ],
  examples: [{ input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' }],
  insight:
    { en: 'For each number you know exactly what its partner must be: `target − number`. The slow part of the brute force is *searching* for that partner with an inner loop. A hash map answers "have I seen this value, and where?" in O(1) — so the inner loop becomes a single lookup. You trade O(n) memory for an O(n) speed-up.', es: 'Para cada número sabes exactamente cuál debe ser su pareja: `target − número`. La parte lenta de la fuerza bruta es *buscar* esa pareja con un bucle interno. Un mapa hash responde "¿ya vi este valor, y dónde?" en O(1), así que el bucle interno se convierte en una sola búsqueda. Cambias O(n) de memoria por una aceleración de O(n).' },
  approaches: [
    { id: 'brute', label: { en: 'Try every pair', es: 'Probar cada par' }, kind: 'brute', fn: twoSumBrute, time: 'O(n²)', space: 'O(1)', note: { en: 'For each element, scan everything after it looking for its partner.', es: 'Para cada elemento, recorre todo lo que viene después buscando su pareja.' } },
    { id: 'map', label: { en: 'Hash map of values seen', es: 'Mapa hash de valores vistos' }, kind: 'optimal', fn: twoSum, time: 'O(n)', space: 'O(n)', note: { en: 'One pass. Check for the partner *before* storing the current number, so an element is never paired with itself.', es: 'Una pasada. Busca la pareja *antes* de guardar el número actual, para que un elemento nunca se empareje consigo mismo.' } },
  ],
  code,
  cases: [
    { name: { en: 'first two elements', es: 'los dos primeros elementos' }, args: [[2, 7, 11, 15], 9], expected: [0, 1] },
    { name: { en: 'no pair', es: 'sin par' }, args: [[1, 2, 3], 7], expected: [-1, -1] },
    { name: { en: 'empty array', es: 'arreglo vacío' }, args: [[], 0], expected: [-1, -1] },
    { name: { en: 'single element', es: 'un solo elemento' }, args: [[5], 10], expected: [-1, -1] },
    { name: { en: 'same value twice', es: 'el mismo valor dos veces' }, args: [[3, 3], 6], expected: [0, 1] },
    { name: { en: 'must not reuse one element', es: 'no se puede reutilizar un elemento' }, args: [[3, 2, 4], 6], expected: [1, 2] },
    { name: { en: 'negative numbers', es: 'números negativos' }, args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
    { name: { en: 'zeros', es: 'ceros' }, args: [[0, 4, 3, 0], 0], expected: [0, 3] },
    { name: { en: 'pair at the two ends', es: 'par en los dos extremos' }, args: [[5, 1, 2, 9, 10], 15], expected: [0, 4] },
    { name: { en: 'mixed signs', es: 'signos mezclados' }, args: [[-10, 7, 19, 15], 9], expected: [0, 2] },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 30_000],
    nLabel: { en: 'array length (no pair exists: worst case)', es: 'longitud del arreglo (no existe par: peor caso)' },
    gen: (n) => {
      if (n >= 20) return [randArray(n, 0, 1_000_000), -5];
      // small inputs for the agreement test: powers of two, so every pair sum is unique
      const nums = shuffle(Array.from({ length: n }, (_, i) => 2 ** i));
      return [nums, nums[randInt(0, n - 1)] + nums[randInt(0, n - 1)]];
    },
  },
  demo: {
    inputs: [
      { name: 'nums', value: '[8, 3, 11, 5, 14, 2, 9]' },
      { name: 'target', value: '16' },
    ],
    validate: (nums, target) => first(numsErr(nums, 12), intErr(target, 'target')),
    traces: { map: trace },
  },
};
