import code from './sorted-squares.ts?code';
import { sortedArray } from '../../lib/ds';
import type { Problem } from '../../types';

// #region brute
export function sortedSquaresBrute(nums: number[]): number[] {
  // Squaring breaks the order (negatives become large), so sort again.
  return nums.map((x) => x * x).sort((a, b) => a - b);
}
// #endregion

// #region two
export function sortedSquares(nums: number[]): number[] {
  const out = new Array<number>(nums.length);
  let left = 0;
  let right = nums.length - 1;
  // The largest square is always at one of the two ends. Fill `out` from the back.
  for (let k = nums.length - 1; k >= 0; k--) {
    if (Math.abs(nums[left]) > Math.abs(nums[right])) {
      out[k] = nums[left] * nums[left];
      left++;
    } else {
      out[k] = nums[right] * nums[right];
      right--;
    }
  }
  return out;
}
// #endregion

export const sortedSquaresProblem: Problem = {
  id: 'sorted-squares',
  title: { en: 'Squares of a sorted array', es: 'Cuadrados de un arreglo ordenado' },
  difficulty: 'Easy',
  statement: [{ en: 'Given an array sorted in ascending order (it may contain negatives), return the squares of its values, also sorted in ascending order.', es: 'Dado un arreglo ordenado de forma ascendente (puede contener negativos), devuelve los cuadrados de sus valores, también en orden ascendente.' }],
  examples: [{ input: 'nums = [-4, -1, 0, 3, 10]', output: '[0, 1, 9, 16, 100]' }],
  insight:
    { en: 'After squaring, the big values are at **both ends** (very negative or very positive) and the small ones are in the middle. So the largest remaining square is always at `left` or `right`. Compare the two ends, take the bigger square, and write the result array from back to front. No sorting needed.', es: 'Después de elevar al cuadrado, los valores grandes están en **ambos extremos** (muy negativos o muy positivos) y los pequeños en el medio. Así que el mayor cuadrado restante siempre está en `left` o en `right`. Compara los dos extremos, toma el cuadrado mayor y escribe el arreglo resultado de atrás hacia adelante. No hace falta ordenar.' },
  approaches: [
    { id: 'brute', label: { en: 'Square, then sort', es: 'Elevar al cuadrado y luego ordenar' }, kind: 'brute', fn: sortedSquaresBrute, time: 'O(n log n)', space: 'O(n)', note: { en: 'Simple and correct, but it throws away the order the input already had and pays for a full sort.', es: 'Simple y correcto, pero desperdicia el orden que ya tenía la entrada y paga un ordenamiento completo.' } },
    { id: 'two', label: { en: 'Two pointers, fill from the back', es: 'Dos punteros, llenando desde atrás' }, kind: 'optimal', fn: sortedSquares, time: 'O(n)', space: 'O(n)', note: { en: 'One pass. The O(n) space is just the output array.', es: 'Una pasada. El espacio O(n) es solo el arreglo de salida.' } },
  ],
  code,
  cases: [
    { name: { en: 'mixed signs', es: 'signos mezclados' }, args: [[-4, -1, 0, 3, 10]], expected: [0, 1, 9, 16, 100] },
    { name: { en: 'empty array', es: 'arreglo vacío' }, args: [[]], expected: [] },
    { name: { en: 'single negative', es: 'un solo negativo' }, args: [[-3]], expected: [9] },
    { name: { en: 'all negative', es: 'todos negativos' }, args: [[-7, -3, -1]], expected: [1, 9, 49] },
    { name: { en: 'all positive', es: 'todos positivos' }, args: [[1, 2, 5]], expected: [1, 4, 25] },
    { name: { en: 'equal absolute values', es: 'valores absolutos iguales' }, args: [[-2, -2, 2, 2]], expected: [4, 4, 4, 4] },
    { name: { en: 'zeros', es: 'ceros' }, args: [[0, 0, 0]], expected: [0, 0, 0] },
    { name: { en: 'largest square on the left', es: 'el mayor cuadrado a la izquierda' }, args: [[-10, 1, 2]], expected: [1, 4, 100] },
    { name: { en: 'two elements', es: 'dos elementos' }, args: [[-1, 1]], expected: [1, 1] },
  ],
  bench: { sizes: [100, 1000, 10_000, 100_000, 1_000_000], nLabel: { en: 'array length', es: 'longitud del arreglo' }, gen: (n) => [sortedArray(n, -10_000, 10_000)] },
};
