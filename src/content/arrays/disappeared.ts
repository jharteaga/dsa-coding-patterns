import code from './disappeared.ts?code';
import { randArray } from '../../lib/ds';
import type { Problem } from '../../types';

// #region brute
export function findDisappearedBrute(nums: number[]): number[] {
  const missing: number[] = [];
  for (let value = 1; value <= nums.length; value++) {
    if (!nums.includes(value)) missing.push(value);
  }
  return missing;
}
// #endregion

// #region set
export function findDisappearedSet(nums: number[]): number[] {
  const present = new Set(nums);
  const missing: number[] = [];
  for (let value = 1; value <= nums.length; value++) {
    if (!present.has(value)) missing.push(value);
  }
  return missing;
}
// #endregion

// #region cyclic
export function findDisappeared(nums: number[]): number[] {
  let i = 0;
  while (i < nums.length) {
    const home = nums[i] - 1; // value v belongs at index v - 1
    if (nums[home] !== nums[i]) {
      [nums[i], nums[home]] = [nums[home], nums[i]];
    } else {
      i++; // in place, or a duplicate of what is already home
    }
  }
  const missing: number[] = [];
  for (let j = 0; j < nums.length; j++) {
    if (nums[j] !== j + 1) missing.push(j + 1);
  }
  return missing;
}
// #endregion

export const disappeared: Problem = {
  id: 'disappeared',
  title: { en: 'Find all numbers that disappeared', es: 'Encontrar todos los números que desaparecieron' },
  difficulty: 'Easy',
  statement: [
    { en: 'An array of length `n` holds numbers from `1…n`; some appear twice, so others are missing. Return all the numbers from `1…n` that do not appear, in ascending order.', es: 'Un arreglo de longitud `n` contiene números de `1…n`; algunos aparecen dos veces, así que faltan otros. Devuelve todos los números de `1…n` que no aparecen, en orden ascendente.' },
  ],
  examples: [{ input: 'nums = [4, 3, 2, 7, 8, 2, 3, 1]', output: '[5, 6]' }],
  insight:
    { en: 'Same trick, shifted by one: value `v` belongs at index `v − 1`. After cyclic sorting, duplicates are left stranded in the slots whose rightful owners never showed up — so every index `j` not holding `j + 1` reveals a missing number. A hash set gives the same O(n) time; cyclic sort does it without the extra memory.', es: 'El mismo truco, desplazado en uno: el valor `v` va en el índice `v − 1`. Tras el ordenamiento cíclico, los duplicados quedan varados en las casillas cuyos dueños legítimos nunca aparecieron, así que cada índice `j` que no tiene `j + 1` revela un número faltante. Un conjunto hash da el mismo tiempo O(n); el ordenamiento cíclico lo logra sin la memoria extra.' },
  approaches: [
    { id: 'brute', label: { en: 'Search for each value', es: 'Buscar cada valor' }, kind: 'brute', fn: findDisappearedBrute, time: 'O(n²)', space: 'O(1)', note: { en: 'For each value 1…n, scan the whole array.', es: 'Para cada valor 1…n, recorre todo el arreglo.' } },
    { id: 'set', label: { en: 'Hash set', es: 'Conjunto hash' }, kind: 'better', fn: findDisappearedSet, time: 'O(n)', space: 'O(n)', note: { en: 'Put everything in a set, then check each value 1…n. Fast, but uses O(n) extra memory.', es: 'Mete todo en un conjunto y luego revisa cada valor 1…n. Rápido, pero usa O(n) de memoria extra.' } },
    { id: 'cyclic', label: { en: 'Cyclic sort', es: 'Ordenamiento cíclico' }, kind: 'optimal', fn: findDisappeared, time: 'O(n)', space: 'O(1)', note: { en: 'Linear time and no extra memory (besides the output), by rearranging the input in place.', es: 'Tiempo lineal y sin memoria extra (aparte de la salida), reordenando la entrada en el lugar.' } },
  ],
  code,
  mutates: true,
  cases: [
    { name: { en: 'two missing', es: 'faltan dos' }, args: [[4, 3, 2, 7, 8, 2, 3, 1]], expected: [5, 6] },
    { name: { en: 'nothing missing', es: 'no falta nada' }, args: [[2, 1, 3]], expected: [] },
    { name: { en: 'empty array', es: 'arreglo vacío' }, args: [[]], expected: [] },
    { name: { en: 'single element', es: 'un solo elemento' }, args: [[1]], expected: [] },
    { name: { en: 'all the same value', es: 'todos con el mismo valor' }, args: [[1, 1, 1]], expected: [2, 3] },
    { name: { en: 'missing the largest', es: 'falta el mayor' }, args: [[1, 1]], expected: [2] },
    { name: { en: 'missing the smallest', es: 'falta el menor' }, args: [[2, 2]], expected: [1] },
    { name: { en: 'already sorted, with a duplicate', es: 'ya ordenado, con un duplicado' }, args: [[1, 2, 2, 4]], expected: [3] },
    { name: { en: 'every value is n', es: 'todos los valores son n' }, args: [[4, 4, 4, 4]], expected: [1, 2, 3] },
  ],
  bench: { sizes: [100, 1000, 10_000, 50_000], nLabel: { en: 'array length', es: 'longitud del arreglo' }, gen: (n) => [randArray(n, 1, n)] },
};
