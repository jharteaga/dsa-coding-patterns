import code from './pair-sum.ts?code';
import { first, intErr, numsErr } from '../../lib/check';
import { distinctSorted, randInt } from '../../lib/ds';
import { Tracer, arr, mark, span, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region brute
export function pairSumBrute(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j]; // @check
    }
  }
  return [-1, -1]; // @miss
}
// #endregion

// #region two
export function pairSum(nums: number[], target: number): number[] {
  let left = 0;
  let right = nums.length - 1; // @init
  while (left < right) {
    const sum = nums[left] + nums[right]; // @sum
    if (sum === target) return [left, right]; // @found
    if (sum < target) left++; // need a bigger sum // @left
    else right--; // need a smaller sum // @right
  }
  return [-1, -1]; // @miss
}
// #endregion

function traceBrute(nums: number[], target: number) {
  const t = new Tracer();
  let n = 0;
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++) {
      n++;
      const s = nums[i] + nums[j];
      const hit = s === target;
      t.add('check', {
        en: `Pair (${nums[i]}, ${nums[j]}): ${nums[i]} + ${nums[j]} = ${s}. ${hit ? `That is the target — found after trying **${n} pairs**.` : 'Not the target; try the next pair.'}`,
        es: `Par (${nums[i]}, ${nums[j]}): ${nums[i]} + ${nums[j]} = ${s}. ${hit ? `Es el objetivo: encontrado tras probar **${n} pares**.` : 'No es el objetivo; prueba el siguiente par.'}`,
      }, arr(nums, { pointers: { i, j }, hl: mark(hit ? 'good' : 'compare', i, j) }), vars({ target, 'pairs tried': n }));
      if (hit) return t.frames;
    }
  t.add('miss', { en: `Tried all ${n} pairs. None adds up to ${target}.`, es: `Se probaron los ${n} pares. Ninguno suma ${target}.` }, arr(nums), vars({ 'pairs tried': n }));
  return t.frames;
}

function traceTwo(nums: number[], target: number) {
  const t = new Tracer();
  let left = 0;
  let right = nums.length - 1;
  let n = 0;
  const out = () => ({ ...span('muted', 0, left - 1), ...span('muted', right + 1, nums.length - 1) });
  t.add('init', { en: 'Put one pointer on the smallest value and one on the largest.', es: 'Pon un puntero en el valor más pequeño y otro en el más grande.' }, arr(nums, { pointers: { left, right }, hl: mark('compare', left, right) }), vars({ target }));
  while (left < right) {
    const sum = nums[left] + nums[right];
    n++;
    if (sum === target) {
      t.add('found', { en: `${nums[left]} + ${nums[right]} = ${sum}. That is the target — found after only **${n} sums**.`, es: `${nums[left]} + ${nums[right]} = ${sum}. Es el objetivo: encontrado tras solo **${n} sumas**.` }, arr(nums, { pointers: { left, right }, hl: { ...out(), ...mark('good', left, right) } }), vars({ target, sum }));
      return t.frames;
    }
    t.add('sum', { en: `${nums[left]} + ${nums[right]} = ${sum}, which is ${sum < target ? 'too small' : 'too big'}.`, es: `${nums[left]} + ${nums[right]} = ${sum}, que es ${sum < target ? 'demasiado pequeño' : 'demasiado grande'}.` }, arr(nums, { pointers: { left, right }, hl: { ...out(), ...mark('compare', left, right) } }), vars({ target, sum }));
    if (sum < target) {
      t.add('left', { en: `${nums[left]} is already paired with the **largest** value available and is still too small — so ${nums[left]} cannot be part of any answer. Discard it: move left forward.`, es: `${nums[left]} ya está emparejado con el **mayor** valor disponible y aun así es demasiado pequeño, así que ${nums[left]} no puede formar parte de ninguna respuesta. Descártalo: avanza left.` }, arr(nums, { pointers: { left: left + 1, right }, hl: { ...out(), ...mark('bad', left) } }), vars({ target }));
      left++;
    } else {
      t.add('right', { en: `${nums[right]} is already paired with the **smallest** value available and is still too big — so ${nums[right]} cannot be part of any answer. Discard it: move right backward.`, es: `${nums[right]} ya está emparejado con el **menor** valor disponible y aun así es demasiado grande, así que ${nums[right]} no puede formar parte de ninguna respuesta. Descártalo: retrocede right.` }, arr(nums, { pointers: { left, right: right - 1 }, hl: { ...out(), ...mark('bad', right) } }), vars({ target }));
      right--;
    }
  }
  t.add('miss', { en: `The pointers met: no pair adds up to ${target}.`, es: `Los punteros se encontraron: ningún par suma ${target}.` }, arr(nums, { hl: span('muted', 0, nums.length - 1) }));
  return t.frames;
}

export const pairSumProblem: Problem = {
  id: 'pair-sum',
  title: { en: 'Pair with target sum (sorted array)', es: 'Pair with Target Sum (par con suma objetivo, arreglo ordenado)' },
  difficulty: 'Easy',
  statement: [
    { en: 'Given an array of **distinct** integers sorted in ascending order and a `target`, return the indices `[i, j]` (with `i < j`) of the two numbers that add up to `target`, or `[-1, -1]` if no such pair exists.', es: 'Dado un arreglo de enteros **distintos** ordenado de forma ascendente y un `target`, devuelve los índices `[i, j]` (con `i < j`) de los dos números que suman `target`, o `[-1, -1]` si no existe tal par.' },
  ],
  examples: [{ input: 'nums = [1, 2, 3, 4, 6], target = 6', output: '[1, 3]', why: { en: 'nums[1] + nums[3] = 2 + 4 = 6.', es: 'nums[1] + nums[3] = 2 + 4 = 6.' } }],
  insight:
    { en: 'Because the array is sorted, the sum of the two ends tells you which end is useless. Sum too small? The left value, even with the biggest possible partner, is not enough — drop it. Sum too big? The right value, even with the smallest partner, is too much — drop it. Every step eliminates one element for good, so n steps suffice.', es: 'Como el arreglo está ordenado, la suma de los dos extremos te dice cuál de ellos no sirve. ¿Suma demasiado pequeña? El valor de la izquierda, incluso con la mayor pareja posible, no alcanza: descártalo. ¿Suma demasiado grande? El valor de la derecha, incluso con la menor pareja, se pasa: descártalo. Cada paso elimina un elemento para siempre, así que bastan n pasos.' },
  approaches: [
    {
      id: 'brute',
      label: { en: 'Try every pair', es: 'Probar cada par' },
      kind: 'brute',
      fn: pairSumBrute,
      time: 'O(n²)',
      space: 'O(1)',
      note: { en: 'Two nested loops test all n(n−1)/2 pairs. Never uses the fact that the array is sorted.', es: 'Dos bucles anidados prueban los n(n−1)/2 pares. Nunca aprovecha que el arreglo está ordenado.' },
    },
    {
      id: 'two',
      label: { en: 'Two pointers from both ends', es: 'Dos punteros desde ambos extremos' },
      kind: 'optimal',
      fn: pairSum,
      time: 'O(n)',
      space: 'O(1)',
      note: { en: 'One pointer at each end, moving toward each other. Each iteration moves one pointer, so there are at most n iterations.', es: 'Un puntero en cada extremo, moviéndose uno hacia el otro. Cada iteración mueve un puntero, así que hay como máximo n iteraciones.' },
    },
  ],
  code,
  cases: [
    { name: { en: 'pair in the middle', es: 'par en el medio' }, args: [[1, 2, 3, 4, 6], 6], expected: [1, 3] },
    { name: { en: 'no pair', es: 'sin par' }, args: [[1, 2, 3, 9], 8], expected: [-1, -1] },
    { name: { en: 'empty array', es: 'arreglo vacío' }, args: [[], 5], expected: [-1, -1] },
    { name: { en: 'single element', es: 'un solo elemento' }, args: [[5], 5], expected: [-1, -1] },
    { name: { en: 'two elements that match', es: 'dos elementos que coinciden' }, args: [[2, 7], 9], expected: [0, 1] },
    { name: { en: 'the two ends', es: 'los dos extremos' }, args: [[1, 3, 5, 8], 9], expected: [0, 3] },
    { name: { en: 'negative numbers', es: 'números negativos' }, args: [[-8, -3, 0, 4, 11], 1], expected: [1, 3] },
    { name: { en: 'negative target', es: 'objetivo negativo' }, args: [[-8, -3, 0, 4, 11], -11], expected: [0, 1] },
    { name: { en: 'last two elements', es: 'los dos últimos elementos' }, args: [[1, 2, 3, 10, 20], 30], expected: [3, 4] },
    { name: { en: 'cannot use the same element twice', es: 'no se puede usar el mismo elemento dos veces' }, args: [[1, 3, 5], 6], expected: [0, 2] },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 30_000],
    nLabel: { en: 'array length (no pair exists: worst case)', es: 'longitud del arreglo (no existe par: peor caso)' },
    gen: (n) => {
      const nums = distinctSorted(n);
      return [nums, n < 20 ? nums[randInt(0, n - 1)] + nums[randInt(0, n - 1)] : 10_000_000];
    },
  },
  demo: {
    inputs: [
      { name: 'nums (sorted)', value: '[1, 3, 4, 6, 8, 11, 14, 17]' },
      { name: 'target', value: '20' },
    ],
    validate: (nums, target) => first(numsErr(nums, 12), intErr(target, 'target'), (nums as number[]).some((x, i) => i > 0 && nums[i - 1] >= x) ? { en: 'nums must be sorted ascending with no duplicates.', es: 'nums debe estar ordenado de forma ascendente y sin duplicados.' } : null),
    traces: { brute: traceBrute, two: traceTwo },
  },
};
