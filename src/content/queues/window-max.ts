import code from './window-max.ts?code';
import { first, intErr, numsErr } from '../../lib/check';
import { randArray } from '../../lib/ds';
import { Tracer, arr, mark, span } from '../../lib/trace';
import type { Problem, Tone } from '../../types';

// #region brute
export function maxSlidingWindowBrute(nums: number[], k: number): number[] {
  const out: number[] = [];
  for (let start = 0; start + k <= nums.length; start++) {
    let max = nums[start];
    for (let i = start + 1; i < start + k; i++) max = Math.max(max, nums[i]); // rescan the window
    out.push(max);
  }
  return out;
}
// #endregion

// #region deque
export function maxSlidingWindow(nums: number[], k: number): number[] {
  const out: number[] = [];
  const deque: number[] = []; // indices; their values decrease from front to back
  let front = 0; // index into `deque` of its first live entry
  for (let i = 0; i < nums.length; i++) {
    // 1. Drop the front if it has slid out of the window.
    if (front < deque.length && deque[front] <= i - k) front++; // @expire
    // 2. Drop smaller values from the back: they can never be the max again.
    while (deque.length > front && nums[deque[deque.length - 1]] <= nums[i]) deque.pop(); // @evict
    deque.push(i); // @push
    // 3. The front is the maximum of the current window.
    if (i >= k - 1) out.push(nums[deque[front]]); // @record
  }
  return out; // @done
}
// #endregion

function trace(nums: number[], k: number) {
  const t = new Tracer();
  const out: number[] = [];
  let dq: number[] = [];
  const views = (i: number, extra: Record<number, Tone> = {}) => [
    arr(nums, { label: 'nums', layout: 'bars', pointers: { i }, hl: { ...span('window', Math.max(0, i - k + 1), i), ...Object.fromEntries(dq.map((d) => [d, 'compare' as const])), ...extra } }),
    arr(dq.map((d) => nums[d]), { label: { en: 'deque (front → back): candidates for the maximum, always decreasing', es: 'deque (frente → final): candidatos al máximo, siempre decreciente' } }),
    arr(out, { label: { en: 'window maximums', es: 'máximos de cada ventana' } }),
  ];
  for (let i = 0; i < nums.length; i++) {
    if (dq.length && dq[0] <= i - k) {
      const gone = dq[0];
      dq = dq.slice(1);
      t.add('expire', { en: `The window moved: index ${gone} (value ${nums[gone]}) is no longer inside it. Remove it from the **front** of the deque.`, es: `La ventana se movió: el índice ${gone} (valor ${nums[gone]}) ya no está dentro. Quítalo del **frente** del deque.` }, ...views(i, mark('bad', gone)));
    }
    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) {
      const gone = dq.pop()!;
      t.add('evict', { en: `${nums[i]} arrives. ${nums[gone]} is smaller **and** older, so it will leave the window first and can never be the maximum again. Remove it from the **back**.`, es: `Llega ${nums[i]}. ${nums[gone]} es menor **y** más antiguo, así que saldrá primero de la ventana y nunca podrá volver a ser el máximo. Quítalo del **final**.` }, ...views(i, mark('bad', gone)));
    }
    dq.push(i);
    t.add('push', { en: `Add ${nums[i]} at the back. The deque is still decreasing, so its front is the largest.`, es: `Agrega ${nums[i]} al final. El deque sigue siendo decreciente, así que su frente es el mayor.` }, ...views(i));
    if (i >= k - 1) {
      out.push(nums[dq[0]]);
      t.add('record', { en: `The window [${i - k + 1}…${i}] is complete. Its maximum is the front of the deque: **${nums[dq[0]]}** — no rescanning.`, es: `La ventana [${i - k + 1}…${i}] está completa. Su máximo es el frente del deque: **${nums[dq[0]]}**, sin volver a recorrerla.` }, ...views(i, mark('good', dq[0])));
    }
  }
  t.add('done', { en: `Result: **[${out.join(', ')}]**. Each index entered the deque once and left at most once.`, es: `Resultado: **[${out.join(', ')}]**. Cada índice entró al deque una vez y salió como máximo una vez.` }, arr(nums, { label: 'nums', layout: 'bars' }), arr(out, { label: { en: 'window maximums', es: 'máximos de cada ventana' } }));
  return t.frames;
}

export const windowMax: Problem = {
  id: 'window-max',
  title: { en: 'Sliding window maximum', es: 'Máximo en ventana deslizante' },
  difficulty: 'Hard',
  statement: [{ en: 'A window of size `k` slides from the left end of `nums` to the right, one position at a time. Return the **maximum** of each window.', es: 'Una ventana de tamaño `k` se desliza desde el extremo izquierdo de `nums` hacia la derecha, una posición a la vez. Devuelve el **máximo** de cada ventana.' }],
  examples: [{ input: 'nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3', output: '[3, 3, 5, 5, 6, 7]' }],
  insight:
    { en: 'When a new value enters the window, every *smaller* value already in it becomes useless: the newcomer is bigger and will stay in the window longer, so those can never be the maximum again. Throw them away. What remains is a list of candidates in decreasing order — the first is the current maximum. Values leave at the front when they slide out of the window and at the back when they are beaten: a **double-ended queue**.', es: 'Cuando un valor nuevo entra a la ventana, todo valor *menor* que ya estaba en ella se vuelve inútil: el recién llegado es más grande y permanecerá más tiempo en la ventana, así que esos nunca podrán volver a ser el máximo. Descártalos. Lo que queda es una lista de candidatos en orden decreciente: el primero es el máximo actual. Los valores salen por el frente cuando la ventana los deja atrás y por el final cuando son superados: una **cola de doble extremo**.' },
  approaches: [
    { id: 'brute', label: { en: 'Rescan every window', es: 'Recorrer de nuevo cada ventana' }, kind: 'brute', fn: maxSlidingWindowBrute, time: 'O(n · k)', space: 'O(1)', note: { en: 'Each of the n − k + 1 windows is scanned in full, even though consecutive windows share k − 1 elements.', es: 'Cada una de las n − k + 1 ventanas se recorre completa, aunque ventanas consecutivas comparten k − 1 elementos.' } },
    { id: 'deque', label: { en: 'Monotonic deque', es: 'Deque monótono' }, kind: 'optimal', fn: maxSlidingWindow, time: 'O(n)', space: 'O(k)', note: { en: 'The deque stores indices (so we can tell when one has left the window). In JavaScript a `front` index replaces the O(n) `shift()`; C# uses `LinkedList<int>` as a deque.', es: 'El deque guarda índices (así sabemos cuándo uno salió de la ventana). En JavaScript un índice `front` reemplaza al `shift()` O(n); C# usa `LinkedList<int>` como deque.' } },
  ],
  code,
  cases: [
    { name: { en: 'classic example', es: 'ejemplo clásico' }, args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
    { name: { en: 'empty array', es: 'arreglo vacío' }, args: [[], 3], expected: [] },
    { name: { en: 'window of one', es: 'ventana de uno' }, args: [[4, 2, 9], 1], expected: [4, 2, 9] },
    { name: { en: 'window = whole array', es: 'ventana = arreglo completo' }, args: [[4, 2, 9], 3], expected: [9] },
    { name: { en: 'single element', es: 'un solo elemento' }, args: [[1], 1], expected: [1] },
    { name: { en: 'strictly decreasing', es: 'estrictamente decreciente' }, args: [[9, 7, 5, 3], 2], expected: [9, 7, 5] },
    { name: { en: 'strictly increasing', es: 'estrictamente creciente' }, args: [[1, 2, 3, 4], 2], expected: [2, 3, 4] },
    { name: { en: 'all equal', es: 'todos iguales' }, args: [[2, 2, 2, 2], 3], expected: [2, 2] },
    { name: { en: 'negative numbers', es: 'números negativos' }, args: [[-7, -8, -1, -9], 2], expected: [-7, -1, -1] },
    { name: { en: 'maximum leaves the window', es: 'el máximo sale de la ventana' }, args: [[9, 1, 1, 1, 1], 3], expected: [9, 1, 1] },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'array length (window = n / 10)', es: 'longitud del arreglo (ventana = n / 10)' },
    gen: (n) => [randArray(n), Math.max(1, Math.floor(n / (n < 20 ? 2 : 10)))],
  },
  demo: {
    inputs: [
      { name: 'nums', value: '[1, 3, -1, -3, 5, 3, 6, 7]' },
      { name: 'k (window size)', value: '3' },
    ],
    validate: (nums, k) => first(numsErr(nums, 12, 'nums', 1), intErr(k, 'k', 1, (nums as number[]).length)),
    traces: { deque: trace },
  },
};
