import code from './subarray-sum.ts?code';
import { randArray, randInt } from '../../lib/ds';
import type { Problem } from '../../types';

// #region brute
export function subarraySumBrute(nums: number[], k: number): number {
  let count = 0;
  for (let start = 0; start < nums.length; start++) {
    let sum = 0;
    for (let end = start; end < nums.length; end++) {
      sum += nums[end]; // sum of nums[start..end]
      if (sum === k) count++;
    }
  }
  return count;
}
// #endregion

// #region prefix
export function subarraySum(nums: number[], k: number): number {
  // seen.get(s) = how many prefixes so far have sum s
  const seen = new Map<number, number>([[0, 1]]); // the empty prefix
  let prefix = 0;
  let count = 0;
  for (const x of nums) {
    prefix += x;
    // A subarray ending here sums to k exactly when an earlier
    // prefix equals (prefix - k).
    count += seen.get(prefix - k) ?? 0;
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
  }
  return count;
}
// #endregion

export const subarraySumProblem: Problem = {
  id: 'subarray-sum',
  title: { en: 'Count subarrays that sum to k', es: 'Contar subarreglos que suman k' },
  difficulty: 'Medium',
  statement: [
    { en: 'Given an array of integers (negatives allowed) and a number `k`, return how many **contiguous subarrays** have a sum equal to `k`.', es: 'Dado un arreglo de enteros (se permiten negativos) y un número `k`, devuelve cuántos **subarreglos contiguos** tienen una suma igual a `k`.' },
  ],
  examples: [
    { input: 'nums = [1, 2, 3], k = 3', output: '2', why: { en: '[1, 2] and [3].', es: '[1, 2] y [3].' } },
    { input: 'nums = [1, -1, 0], k = 0', output: '3', why: { en: '[1, -1], [0] and [1, -1, 0].', es: '[1, -1], [0] y [1, -1, 0].' } },
  ],
  insight:
    { en: 'Let `prefix[i]` be the sum of the first i elements. The sum of any subarray is a **difference of two prefixes**: `sum(i..j) = prefix[j+1] − prefix[i]`. So "a subarray ending here sums to k" means "some earlier prefix equals `currentPrefix − k`". Keep a hash map counting the prefix sums seen so far and that question is one lookup. (A sliding window does not work here because negative numbers break its logic.)', es: 'Sea `prefix[i]` la suma de los primeros i elementos. La suma de cualquier subarreglo es una **diferencia de dos prefijos**: `sum(i..j) = prefix[j+1] − prefix[i]`. Así que "un subarreglo que termina aquí suma k" significa "algún prefijo anterior es igual a `currentPrefix − k`". Mantén un mapa hash que cuente las sumas de prefijos vistas hasta ahora y esa pregunta es una sola búsqueda. (Una ventana deslizante no funciona aquí porque los números negativos rompen su lógica.)' },
  approaches: [
    { id: 'brute', label: { en: 'Every start × every end', es: 'Cada inicio × cada fin' }, kind: 'brute', fn: subarraySumBrute, time: 'O(n²)', space: 'O(1)', note: { en: 'Fix a start, extend the end one element at a time keeping a running sum. There are n(n+1)/2 subarrays.', es: 'Fija un inicio y extiende el fin de a un elemento, llevando una suma acumulada. Hay n(n+1)/2 subarreglos.' } },
    { id: 'prefix', label: { en: 'Prefix sums + hash map', es: 'Sumas de prefijos + mapa hash' }, kind: 'optimal', fn: subarraySum, time: 'O(n)', space: 'O(n)', note: { en: 'One pass. The map starts with {0: 1} so that subarrays starting at index 0 are counted.', es: 'Una pasada. El mapa empieza con {0: 1} para que se cuenten los subarreglos que empiezan en el índice 0.' } },
  ],
  code,
  cases: [
    { name: { en: 'two matches', es: 'dos coincidencias' }, args: [[1, 2, 3], 3], expected: 2 },
    { name: { en: 'overlapping matches', es: 'coincidencias solapadas' }, args: [[1, 1, 1], 2], expected: 2 },
    { name: { en: 'empty array', es: 'arreglo vacío' }, args: [[], 0], expected: 0 },
    { name: { en: 'single element equal to k', es: 'un solo elemento igual a k' }, args: [[5], 5], expected: 1 },
    { name: { en: 'single element, no match', es: 'un solo elemento, sin coincidencia' }, args: [[5], 3], expected: 0 },
    { name: { en: 'negatives and zero', es: 'negativos y cero' }, args: [[1, -1, 0], 0], expected: 3 },
    { name: { en: 'all zeros, k = 0', es: 'todo ceros, k = 0' }, args: [[0, 0, 0], 0], expected: 6 },
    { name: { en: 'whole array is the only match', es: 'el arreglo completo es la única coincidencia' }, args: [[2, 4, 6], 12], expected: 1 },
    { name: { en: 'negative k', es: 'k negativo' }, args: [[-1, -1, 1], -2], expected: 1 },
    { name: { en: 'no match', es: 'sin coincidencia' }, args: [[1, 2, 3], 7], expected: 0 },
  ],
  bench: { sizes: [100, 1000, 10_000, 30_000], nLabel: { en: 'array length', es: 'longitud del arreglo' }, gen: (n) => [randArray(n, -10, 10), randInt(-5, 5)] },
};
