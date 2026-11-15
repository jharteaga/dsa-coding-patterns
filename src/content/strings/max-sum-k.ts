import code from './max-sum-k.ts?code';
import { first, intErr, numsErr } from '../../lib/check';
import { randArray } from '../../lib/ds';
import { Tracer, arr, mark, span, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region brute
export function maxSumBrute(nums: number[], k: number): number {
  let best = -Infinity;
  for (let start = 0; start + k <= nums.length; start++) {
    let sum = 0;
    for (let i = start; i < start + k; i++) sum += nums[i]; // re-add all k elements // @add
    best = Math.max(best, sum); // @best
  }
  return best; // @done
}
// #endregion

// #region window
export function maxSum(nums: number[], k: number): number {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i]; // first window // @first
  let best = sum;
  for (let right = k; right < nums.length; right++) {
    sum += nums[right]; // one element enters on the right... // @enter
    sum -= nums[right - k]; // ...one leaves on the left // @leave
    best = Math.max(best, sum); // @best
  }
  return best; // @done
}
// #endregion

function traceBrute(nums: number[], k: number) {
  const t = new Tracer();
  let best = -Infinity;
  let adds = 0;
  for (let start = 0; start + k <= nums.length; start++) {
    let sum = 0;
    for (let i = start; i < start + k; i++) {
      sum += nums[i];
      adds++;
    }
    best = Math.max(best, sum);
    t.add('add', {
        en: `Window [${start}…${start + k - 1}]: add up all ${k} elements from scratch → ${sum}.${start > 0 ? ` (${k - 1} of them were already added for the previous window.)` : ''}`,
        es: `Ventana [${start}…${start + k - 1}]: suma sus ${k} elementos desde cero → ${sum}.${start > 0 ? ` (${k - 1} de ellos ya se habían sumado para la ventana anterior.)` : ''}`,
      }, arr(nums, { hl: span('window', start, start + k - 1) }), vars({ sum, best, 'additions so far': adds }));
  }
  t.add('done', { en: `Best sum **${best}**, using ${adds} additions.`, es: `Mejor suma **${best}**, usando ${adds} sumas.` }, arr(nums), vars({ best, 'additions so far': adds }));
  return t.frames;
}

function traceWindow(nums: number[], k: number) {
  const t = new Tracer();
  let sum = 0;
  let adds = 0;
  for (let i = 0; i < k; i++) {
    sum += nums[i];
    adds++;
  }
  let best = sum;
  t.add('first', { en: `Add up the first window once: ${sum}.`, es: `Suma la primera ventana una sola vez: ${sum}.` }, arr(nums, { hl: span('window', 0, k - 1) }), vars({ sum, best, 'additions/subtractions so far': adds }));
  for (let right = k; right < nums.length; right++) {
    sum += nums[right];
    sum -= nums[right - k];
    adds += 2;
    best = Math.max(best, sum);
    t.add('enter', { en: `Slide one step: **${nums[right]} enters** on the right, **${nums[right - k]} leaves** on the left. The ${k - 1} elements in between are untouched. New sum: ${sum}.`, es: `Desliza un paso: **entra ${nums[right]}** por la derecha, **sale ${nums[right - k]}** por la izquierda. Los ${k - 1} elementos de en medio no se tocan. Nueva suma: ${sum}.` }, arr(nums, { pointers: { right }, hl: { ...span('window', right - k + 1, right), ...mark('good', right), ...mark('bad', right - k) } }), vars({ sum, best, 'additions/subtractions so far': adds }));
  }
  t.add('done', { en: `Best sum **${best}**, using only ${adds} additions/subtractions.`, es: `Mejor suma **${best}**, usando solo ${adds} sumas/restas.` }, arr(nums), vars({ best, 'additions/subtractions so far': adds }));
  return t.frames;
}

export const maxSumK: Problem = {
  id: 'max-sum-k',
  title: { en: 'Maximum sum of k consecutive elements', es: 'Suma máxima de k elementos consecutivos' },
  difficulty: 'Easy',
  statement: [{ en: 'Given an array of integers and a number `k` (1 ≤ k ≤ length), return the largest sum of any `k` consecutive elements.', es: 'Dado un arreglo de enteros y un número `k` (1 ≤ k ≤ longitud), devuelve la mayor suma de cualesquiera `k` elementos consecutivos.' }],
  examples: [{ input: 'nums = [2, 1, 5, 1, 3, 2], k = 3', output: '9', why: { en: 'The window [5, 1, 3] has the largest sum.', es: 'La ventana [5, 1, 3] tiene la mayor suma.' } }],
  insight:
    { en: 'Two neighbouring windows overlap in all but two elements. Moving the window one step right changes its sum by exactly: **plus the element that enters, minus the element that leaves**. So keep the sum and adjust it, instead of rebuilding it. The cost per window drops from k to 2.', es: 'Dos ventanas vecinas coinciden en todos los elementos menos dos. Mover la ventana un paso a la derecha cambia su suma exactamente en: **más el elemento que entra, menos el elemento que sale**. Así que conserva la suma y ajústala, en vez de reconstruirla. El costo por ventana baja de k a 2.' },
  approaches: [
    { id: 'brute', label: { en: 'Re-add every window', es: 'Volver a sumar cada ventana' }, kind: 'brute', fn: maxSumBrute, time: 'O(n · k)', space: 'O(1)', note: { en: 'For each of the n − k + 1 windows, add its k elements from scratch.', es: 'Para cada una de las n − k + 1 ventanas, suma sus k elementos desde cero.' } },
    { id: 'window', label: { en: 'Fixed-size sliding window', es: 'Ventana deslizante de tamaño fijo' }, kind: 'optimal', fn: maxSum, time: 'O(n)', space: 'O(1)', note: { en: 'Compute the first window, then slide: add one, subtract one.', es: 'Calcula la primera ventana y luego desliza: suma uno, resta uno.' } },
  ],
  code,
  cases: [
    { name: { en: 'classic example', es: 'ejemplo clásico' }, args: [[2, 1, 5, 1, 3, 2], 3], expected: 9 },
    { name: { en: 'k = 1 → the largest element', es: 'k = 1 → el elemento más grande' }, args: [[4, 9, 2], 1], expected: 9 },
    { name: { en: 'k = length → the whole array', es: 'k = longitud → el arreglo completo' }, args: [[4, 9, 2], 3], expected: 15 },
    { name: { en: 'single element', es: 'un solo elemento' }, args: [[7], 1], expected: 7 },
    { name: { en: 'all negative', es: 'todos negativos' }, args: [[-5, -2, -8, -1], 2], expected: -7 },
    { name: { en: 'best window at the start', es: 'mejor ventana al inicio' }, args: [[9, 9, 1, 1, 1], 2], expected: 18 },
    { name: { en: 'best window at the end', es: 'mejor ventana al final' }, args: [[1, 1, 1, 9, 9], 2], expected: 18 },
    { name: { en: 'zeros', es: 'ceros' }, args: [[0, 0, 0, 0], 3], expected: 0 },
    { name: { en: 'mixed signs', es: 'signos mezclados' }, args: [[1, -1, 5, -2, 3], 3], expected: 6 },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'array length (k = n / 10)', es: 'longitud del arreglo (k = n / 10)' },
    gen: (n) => [randArray(n), Math.max(1, Math.floor(n / (n < 20 ? 2 : 10)))],
  },
  demo: {
    inputs: [
      { name: 'nums', value: '[2, 1, 5, 1, 3, 2, 6, 1]' },
      { name: 'k', value: '3' },
    ],
    validate: (nums, k) => first(numsErr(nums, 12, 'nums', 1), intErr(k, 'k', 1, (nums as number[]).length)),
    traces: { brute: traceBrute, window: traceWindow },
  },
};
