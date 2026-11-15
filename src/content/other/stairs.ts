import code from './stairs.ts?code';
import { intErr } from '../../lib/check';
import { Tracer, arr, mark, span, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region recursion
export function climbRecursive(n: number): number {
  if (n <= 1) return 1; // one way to stand still or take a single step
  // The last move was either a 1-step (from n-1) or a 2-step (from n-2).
  return climbRecursive(n - 1) + climbRecursive(n - 2);
}
// #endregion

// #region memo
export function climbMemo(n: number, memo = new Map<number, number>()): number {
  if (n <= 1) return 1;
  const known = memo.get(n);
  if (known !== undefined) return known; // already solved: reuse it
  const ways = climbMemo(n - 1, memo) + climbMemo(n - 2, memo);
  memo.set(n, ways);
  return ways;
}
// #endregion

// #region table
export function climbTable(n: number): number {
  const ways = new Array<number>(n + 1).fill(0);
  ways[0] = 1;
  ways[1] = 1; // @base
  for (let step = 2; step <= n; step++) {
    ways[step] = ways[step - 1] + ways[step - 2]; // @fill
  }
  return ways[n]; // @done
}
// #endregion

// #region two
export function climb(n: number): number {
  let prev = 1; // ways to reach the step two below
  let cur = 1; // ways to reach the step one below
  for (let step = 2; step <= n; step++) {
    [prev, cur] = [cur, prev + cur]; // only the last two values are ever needed
  }
  return cur;
}
// #endregion

function traceRecursion(n: number) {
  const t = new Tracer();
  const calls = new Map<number, number>();
  const stack: number[] = [];
  let total = 0;
  const go = (k: number): number => {
    total++;
    calls.set(k, (calls.get(k) ?? 0) + 1);
    stack.push(k);
    if (total <= 60) t.add(undefined, {
          en: `Call climb(${k})${k <= 1 ? ' — a base case, returns 1.' : `: needs climb(${k - 1}) and climb(${k - 2}).`}${(calls.get(k) ?? 0) > 1 ? ` This is the **${calls.get(k)}th time** climb(${k}) is computed from scratch.` : ''}`,
          es: `Llamada a climb(${k})${k <= 1 ? ': un caso base, devuelve 1.' : `: necesita climb(${k - 1}) y climb(${k - 2}).`}${(calls.get(k) ?? 0) > 1 ? ` Es la **${calls.get(k)}.ª vez** que climb(${k}) se calcula desde cero.` : ''}`,
        }, arr(stack.map((x) => `climb(${x})`), { label: { en: 'call stack', es: 'pila de llamadas' }, layout: 'stack' }), vars(Object.fromEntries([...calls].sort((a, b) => b[0] - a[0]).map(([key, c]) => [`climb(${key})`, { en: `called ${c}×`, es: `llamada ${c}×` }])), { en: 'how often each subproblem has been solved', es: 'cuántas veces se ha resuelto cada subproblema' }), vars({ 'total calls': total }));
    const r = k <= 1 ? 1 : go(k - 1) + go(k - 2);
    stack.pop();
    return r;
  };
  const ans = go(n);
  t.add(undefined, { en: `Answer **${ans}** — after **${total} calls**. The same few subproblems were recomputed over and over.`, es: `Respuesta **${ans}**, después de **${total} llamadas**. Los mismos pocos subproblemas se recalcularon una y otra vez.` }, vars(Object.fromEntries([...calls].sort((a, b) => b[0] - a[0]).map(([key, c]) => [`climb(${key})`, { en: `called ${c}×`, es: `llamada ${c}×` }])), { en: 'how often each subproblem was solved', es: 'cuántas veces se resolvió cada subproblema' }), vars({ 'total calls': total }));
  return t.frames;
}

function traceTable(n: number) {
  const t = new Tracer();
  const ways = new Array<number | null>(n + 1).fill(null);
  ways[0] = 1;
  if (n >= 1) ways[1] = 1;
  t.add('base', { en: 'ways[i] = number of ways to reach step i. Step 0 (the floor) and step 1 can each be reached in exactly 1 way.', es: 'ways[i] = número de formas de llegar al escalón i. Al escalón 0 (el piso) y al escalón 1 se puede llegar cada uno de exactamente 1 forma.' }, arr(ways, { label: 'ways', hl: span('done', 0, Math.min(1, n)) }));
  for (let s = 2; s <= n; s++) {
    ways[s] = (ways[s - 1] as number) + (ways[s - 2] as number);
    t.add('fill', { en: `To land on step ${s}, the last move came from step ${s - 1} (a 1-step) or step ${s - 2} (a 2-step). So ways[${s}] = ways[${s - 1}] + ways[${s - 2}] = ${ways[s - 1]} + ${ways[s - 2]} = **${ways[s]}**. Both were already computed — just look them up.`, es: `Para caer en el escalón ${s}, el último movimiento vino del escalón ${s - 1} (un paso de 1) o del escalón ${s - 2} (un paso de 2). Así que ways[${s}] = ways[${s - 1}] + ways[${s - 2}] = ${ways[s - 1]} + ${ways[s - 2]} = **${ways[s]}**. Ambos ya estaban calculados: solo consúltalos.` }, arr(ways, { label: 'ways', pointers: { step: s }, hl: { ...span('done', 0, s - 3), ...mark('compare', s - 1, s - 2), ...mark('good', s) } }));
  }
  t.add('done', { en: `ways[${n}] = **${ways[n]}**, using ${Math.max(0, n - 1)} additions. Each subproblem was solved exactly once.`, es: `ways[${n}] = **${ways[n]}**, usando ${Math.max(0, n - 1)} sumas. Cada subproblema se resolvió exactamente una vez.` }, arr(ways, { label: 'ways', hl: { ...span('done', 0, n - 1), ...mark('good', n) } }));
  return t.frames;
}

export const stairs: Problem = {
  id: 'stairs',
  title: { en: 'Climbing stairs', es: 'Climbing Stairs (subir escaleras)' },
  difficulty: 'Easy',
  statement: [{ en: 'A staircase has `n` steps. Each move you climb 1 or 2 steps. In how many distinct ways can you reach the top?', es: 'Una escalera tiene `n` escalones. En cada movimiento subes 1 o 2 escalones. ¿De cuántas formas distintas puedes llegar arriba?' }],
  examples: [{ input: 'n = 3', output: '3', why: { en: '1+1+1, 1+2, 2+1.', es: '1+1+1, 1+2, 2+1.' } }],
  insight:
    { en: 'The recursion is correct but it solves the same subproblems again and again: `climb(5)` asks for `climb(3)` twice, `climb(2)` three times… the call tree doubles at every level. **Dynamic programming is just: solve each subproblem once and remember the answer.** You can remember top-down (memoization: cache inside the recursion) or bottom-up (tabulation: fill an array from the smallest case upward). Then notice each entry only needs the previous two — so even the array can go.', es: 'La recursión es correcta, pero resuelve los mismos subproblemas una y otra vez: `climb(5)` pide `climb(3)` dos veces, `climb(2)` tres veces… el árbol de llamadas se duplica en cada nivel. **La programación dinámica es simplemente: resuelve cada subproblema una vez y recuerda la respuesta.** Puedes recordar de arriba hacia abajo (memoización: caché dentro de la recursión) o de abajo hacia arriba (tabulación: llena un arreglo desde el caso más pequeño hacia arriba). Luego observa que cada entrada solo necesita las dos anteriores, así que hasta el arreglo sobra.' },
  approaches: [
    { id: 'recursion', label: { en: 'Plain recursion', es: 'Recursión simple' }, kind: 'brute', fn: climbRecursive, time: 'O(2ⁿ)', space: 'O(n)', benchMax: 30, note: { en: 'Each call makes two more. For n = 40 that is over 300 million calls.', es: 'Cada llamada hace dos más. Para n = 40 son más de 300 millones de llamadas.' } },
    { id: 'memo', label: { en: 'Recursion + memo (top-down DP)', es: 'Recursión + memo (DP de arriba hacia abajo)' }, kind: 'better', fn: climbMemo, time: 'O(n)', space: 'O(n)', note: { en: 'Same recursion, plus a cache. The first time a subproblem is solved its answer is stored; every later request is a lookup.', es: 'La misma recursión, más una caché. La primera vez que se resuelve un subproblema se guarda su respuesta; cada petición posterior es una consulta.' } },
    { id: 'table', label: { en: 'Table (bottom-up DP)', es: 'Tabla (DP de abajo hacia arriba)' }, kind: 'better', fn: climbTable, time: 'O(n)', space: 'O(n)', note: { en: 'No recursion: fill `ways[0…n]` left to right. Each cell is the sum of the two before it.', es: 'Sin recursión: llena `ways[0…n]` de izquierda a derecha. Cada celda es la suma de las dos anteriores.' } },
    { id: 'two', label: { en: 'Two variables', es: 'Dos variables' }, kind: 'optimal', fn: climb, time: 'O(n)', space: 'O(1)', note: { en: 'The table only ever reads its last two cells, so keep just those.', es: 'La tabla solo lee sus dos últimas celdas, así que guarda solo esas.' } },
  ],
  code,
  cases: [
    { name: { en: 'three steps', es: 'tres escalones' }, args: [3], expected: 3 },
    { name: { en: 'zero steps (already at the top)', es: 'cero escalones (ya estás arriba)' }, args: [0], expected: 1 },
    { name: { en: 'one step', es: 'un escalón' }, args: [1], expected: 1 },
    { name: { en: 'two steps', es: 'dos escalones' }, args: [2], expected: 2 },
    { name: { en: 'five steps', es: 'cinco escalones' }, args: [5], expected: 8 },
    { name: { en: 'ten steps', es: 'diez escalones' }, args: [10], expected: 89 },
    { name: { en: 'twenty steps', es: 'veinte escalones' }, args: [20], expected: 10946 },
    { name: { en: 'twenty-five steps', es: 'veinticinco escalones' }, args: [25], expected: 121393 },
  ],
  bench: { sizes: [5, 10, 20, 30, 50, 70], nLabel: { en: 'number of steps', es: 'número de escalones' }, gen: (n) => [n] },
  demo: {
    inputs: [{ name: 'n (steps)', value: '6' }],
    validate: (n) => intErr(n, 'n', 1, 8),
    traces: { recursion: traceRecursion, table: traceTable },
  },
};
