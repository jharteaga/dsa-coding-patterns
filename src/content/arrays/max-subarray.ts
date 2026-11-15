import code from './max-subarray.ts?code';
import { numsErr } from '../../lib/check';
import { randArray } from '../../lib/ds';
import { Tracer, arr, mark, span, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region brute
export function maxSubarrayBrute(nums: number[]): number {
  let best = -Infinity;
  for (let start = 0; start < nums.length; start++) {
    let sum = 0;
    for (let end = start; end < nums.length; end++) {
      sum += nums[end];
      best = Math.max(best, sum);
    }
  }
  return best;
}
// #endregion

// #region kadane
export function maxSubarray(nums: number[]): number {
  let current = nums[0]; // best sum of a subarray ending exactly here
  let best = nums[0]; // @init
  for (let i = 1; i < nums.length; i++) {
    // Extend the previous run, or start fresh at nums[i]?
    current = Math.max(nums[i], current + nums[i]); // @choose
    best = Math.max(best, current); // @best
  }
  return best; // @done
}
// #endregion

function trace(nums: number[]) {
  const t = new Tracer();
  let current = nums[0];
  let best = nums[0];
  let start = 0;
  let bestRange: [number, number] = [0, 0];
  t.add('init', { en: `Start with the first element: the best subarray ending at index 0 is just [${nums[0]}].`, es: `Empieza con el primer elemento: el mejor subarreglo que termina en el índice 0 es solo [${nums[0]}].` }, arr(nums, { pointers: { i: 0 }, hl: mark('window', 0) }), vars({ current, best }));
  for (let i = 1; i < nums.length; i++) {
    const extend = current + nums[i];
    const fresh = nums[i] > extend;
    if (fresh) start = i;
    t.add('choose', {
        en: `At ${nums[i]}: the run so far sums to ${current}. ${fresh ? `Extending would give ${extend}, which is worse than ${nums[i]} alone — the old run was dragging us down (it was negative). **Drop it and start fresh here.**` : `Extending gives ${extend}, at least as good as ${nums[i]} alone. **Keep extending.**`}`,
        es: `En ${nums[i]}: el tramo hasta ahora suma ${current}. ${fresh ? `Extenderlo daría ${extend}, que es peor que ${nums[i]} solo: el tramo anterior nos estaba hundiendo (era negativo). **Suéltalo y empieza de nuevo aquí.**` : `Extenderlo da ${extend}, al menos tan bueno como ${nums[i]} solo. **Sigue extendiendo.**`}`,
      }, arr(nums, { pointers: { i }, hl: { ...span('good', bestRange[0], bestRange[1]), ...span('window', start, i) } }), vars({ 'extend (current + x)': extend, 'start fresh (x)': nums[i], best }));
    current = Math.max(nums[i], extend);
    if (current > best) {
      best = current;
      bestRange = [start, i];
      t.add('best', { en: `The run ending here sums to ${current} — a new best.`, es: `El tramo que termina aquí suma ${current}: un nuevo mejor.` }, arr(nums, { pointers: { i }, hl: span('good', start, i) }), vars({ current, best }));
    }
  }
  t.add('done', { en: `One pass. The maximum subarray sum is **${best}** (indices ${bestRange[0]}…${bestRange[1]}).`, es: `Una pasada. La suma máxima de un subarreglo es **${best}** (índices ${bestRange[0]}…${bestRange[1]}).` }, arr(nums, { hl: span('good', bestRange[0], bestRange[1]) }), vars({ best }));
  return t.frames;
}

export const maxSubarrayProblem: Problem = {
  id: 'max-subarray',
  title: { en: 'Maximum subarray sum', es: 'Maximum Subarray (suma máxima de un subarreglo)' },
  difficulty: 'Medium',
  statement: [{ en: 'Given a non-empty array of integers (negatives allowed), find the contiguous subarray with the largest sum and return that sum.', es: 'Dado un arreglo no vacío de enteros (se permiten negativos), encuentra el subarreglo contiguo con la mayor suma y devuelve esa suma.' }],
  examples: [{ input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', why: { en: 'The subarray [4, -1, 2, 1] sums to 6.', es: 'El subarreglo [4, -1, 2, 1] suma 6.' } }],
  insight:
    { en: 'Ask a smaller question at each index: **what is the best subarray that ends exactly here?** There are only two candidates — the best one ending at the previous index plus this element, or this element on its own. If the previous run’s sum is negative it can only hurt, so drop it. The overall answer is the largest of these "ending here" values.', es: 'Hazte una pregunta más pequeña en cada índice: **¿cuál es el mejor subarreglo que termina exactamente aquí?** Solo hay dos candidatos: el mejor que termina en el índice anterior más este elemento, o este elemento solo. Si la suma del tramo anterior es negativa solo puede perjudicar, así que suéltala. La respuesta global es el mayor de estos valores "que terminan aquí".' },
  approaches: [
    { id: 'brute', label: { en: 'Every start × every end', es: 'Cada inicio × cada fin' }, kind: 'brute', fn: maxSubarrayBrute, time: 'O(n²)', space: 'O(1)', note: { en: 'Compute the sum of every one of the n(n+1)/2 subarrays, keeping a running sum per start.', es: 'Calcula la suma de cada uno de los n(n+1)/2 subarreglos, llevando una suma acumulada por cada inicio.' } },
    { id: 'kadane', label: { en: 'Kadane’s algorithm', es: 'Algoritmo de Kadane' }, kind: 'optimal', fn: maxSubarray, time: 'O(n)', space: 'O(1)', note: { en: 'One pass, two variables. This is dynamic programming in its smallest form: each answer is built from the previous one.', es: 'Una pasada, dos variables. Es programación dinámica en su forma más pequeña: cada respuesta se construye a partir de la anterior.' } },
  ],
  code,
  cases: [
    { name: { en: 'classic example', es: 'ejemplo clásico' }, args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
    { name: { en: 'single element', es: 'un solo elemento' }, args: [[1]], expected: 1 },
    { name: { en: 'single negative element', es: 'un solo elemento negativo' }, args: [[-7]], expected: -7 },
    { name: { en: 'all negative → the least negative', es: 'todos negativos → el menos negativo' }, args: [[-3, -1, -2]], expected: -1 },
    { name: { en: 'all positive → the whole array', es: 'todos positivos → el arreglo completo' }, args: [[5, 4, 1, 7, 8]], expected: 25 },
    { name: { en: 'zeros', es: 'ceros' }, args: [[0, 0, 0]], expected: 0 },
    { name: { en: 'best is at the start', es: 'lo mejor está al inicio' }, args: [[6, -10, 1, 2]], expected: 6 },
    { name: { en: 'best is at the end', es: 'lo mejor está al final' }, args: [[1, -10, 4, 5]], expected: 9 },
    { name: { en: 'worth crossing a small negative', es: 'vale la pena cruzar un negativo pequeño' }, args: [[5, -1, 5]], expected: 9 },
    { name: { en: 'not worth crossing a big negative', es: 'no vale la pena cruzar un negativo grande' }, args: [[5, -9, 6]], expected: 6 },
  ],
  bench: { sizes: [100, 1000, 10_000, 30_000], nLabel: { en: 'array length', es: 'longitud del arreglo' }, gen: (n) => [randArray(n, -100, 100)] },
  demo: {
    inputs: [{ name: 'nums', value: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]' }],
    validate: (nums) => numsErr(nums, 14, 'nums', 1),
    traces: { kadane: trace },
  },
};
