import code from './knapsack.ts?code';
import { first, intErr, numsErr } from '../../lib/check';
import { randArray } from '../../lib/ds';
import { Tracer, grid, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';

// #region recursion
export function knapsackRecursive(weights: number[], values: number[], capacity: number): number {
  // Best value using items i, i+1, ... with `room` capacity left.
  const best = (i: number, room: number): number => {
    if (i === weights.length) return 0;
    const skip = best(i + 1, room);
    if (weights[i] > room) return skip; // does not fit
    const take = values[i] + best(i + 1, room - weights[i]);
    return Math.max(skip, take);
  };
  return best(0, capacity);
}
// #endregion

// #region table
export function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  // dp[i][c] = best value using only the first i items with capacity c.
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(capacity + 1).fill(0)); // @init
  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let c = 0; c <= capacity; c++) {
      dp[i][c] = dp[i - 1][c]; // option 1: skip item i // @skip
      if (w <= c) {
        dp[i][c] = Math.max(dp[i][c], v + dp[i - 1][c - w]); // option 2: take it // @take
      }
    }
  }
  return dp[n][capacity]; // @done
}
// #endregion

function trace(weights: number[], values: number[], capacity: number) {
  const t = new Tracer();
  const n = weights.length;
  const dp: (number | null)[][] = Array.from({ length: n + 1 }, (_, i) => new Array<number | null>(capacity + 1).fill(i === 0 ? 0 : null));
  const view = (hl: Record<string, Tone> = {}) => grid(dp, hl, { label: { en: 'dp[items considered][capacity] = best value', es: 'dp[objetos considerados][capacidad] = mejor valor' }, rowLabels: ['no items', ...weights.map((w, i) => `+ item ${i + 1} (w${w}, v${values[i]})`)], colLabels: Array.from({ length: capacity + 1 }, (_, c) => `c=${c}`) });
  t.add('init', { en: 'Each cell answers a small question: "with only the first *i* items and a bag of capacity *c*, what is the best value?" With no items the answer is 0 for every capacity.', es: 'Cada celda responde una pregunta pequeña: "con solo los primeros *i* objetos y una mochila de capacidad *c*, ¿cuál es el mejor valor?" Sin objetos la respuesta es 0 para cualquier capacidad.' }, view());
  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let c = 0; c <= capacity; c++) {
      const skip = dp[i - 1][c] as number;
      const fits = w <= c;
      const take = fits ? v + (dp[i - 1][c - w] as number) : -1;
      dp[i][c] = Math.max(skip, take);
      const hl: Record<string, Tone> = { [`${i},${c}`]: 'good', [`${i - 1},${c}`]: 'compare' };
      if (fits) hl[`${i - 1},${c - w}`] = 'alt';
      t.add(fits && take > skip ? 'take' : 'skip', fits
          ? {
              en: `Item ${i} (weight ${w}, value ${v}), capacity ${c}. **Skip it:** the answer is the cell above = ${skip}. **Take it:** ${v} + best value with the remaining capacity ${c - w} using earlier items (purple cell) = ${take}. Keep the larger: **${dp[i][c]}**.`,
              es: `Objeto ${i} (peso ${w}, valor ${v}), capacidad ${c}. **Saltarlo:** la respuesta es la celda de arriba = ${skip}. **Tomarlo:** ${v} + el mejor valor con la capacidad restante ${c - w} usando objetos anteriores (celda morada) = ${take}. Quédate con el mayor: **${dp[i][c]}**.`,
            }
          : {
              en: `Item ${i} weighs ${w}, more than capacity ${c}: it cannot be taken. Copy the cell above: **${skip}**.`,
              es: `El objeto ${i} pesa ${w}, más que la capacidad ${c}: no se puede tomar. Copia la celda de arriba: **${skip}**.`,
            }, view(hl), vars({ skip, take: fits ? take : { en: 'does not fit', es: 'no cabe' } }));
    }
  }
  t.add('done', { en: `The bottom-right cell uses all items and the full capacity: the best value is **${dp[n][capacity]}**. The table has ${(n + 1) * (capacity + 1)} cells, each filled with one comparison.`, es: `La celda inferior derecha usa todos los objetos y toda la capacidad: el mejor valor es **${dp[n][capacity]}**. La tabla tiene ${(n + 1) * (capacity + 1)} celdas, cada una llenada con una comparación.` }, view({ [`${n},${capacity}`]: 'good' }));
  return t.frames;
}

export const knapsackProblem: Problem = {
  id: 'knapsack',
  title: { en: '0/1 knapsack', es: 'Mochila 0/1 (0/1 knapsack)' },
  difficulty: 'Medium',
  statement: [
    { en: 'You have items, each with a `weight` and a `value`, and a bag that can carry at most `capacity`. Each item can be taken **once or not at all** (hence 0/1). Return the maximum total value that fits.', es: 'Tienes objetos, cada uno con un `weight` (peso) y un `value` (valor), y una mochila que puede cargar como máximo `capacity`. Cada objeto se puede tomar **una vez o ninguna** (de ahí el 0/1). Devuelve el valor total máximo que cabe.' },
  ],
  examples: [{ input: 'weights = [1, 3, 4, 5], values = [1, 4, 5, 7], capacity = 7', output: '9', why: { en: 'Take the items of weight 3 and 4 (values 4 + 5).', es: 'Toma los objetos de peso 3 y 4 (valores 4 + 5).' } }],
  insight:
    { en: 'For each item there are two choices — take or skip — so brute force explores 2ⁿ combinations. But many of those branches arrive at the **same situation**: "I am deciding item i and have c capacity left". The best you can do from there does not depend on how you got there. There are only n × capacity such situations, so compute each once and store it in a table.', es: 'Para cada objeto hay dos opciones, tomarlo o saltarlo, así que la fuerza bruta explora 2ⁿ combinaciones. Pero muchas de esas ramas llegan a la **misma situación**: "estoy decidiendo el objeto i y me quedan c de capacidad". Lo mejor que puedes hacer desde ahí no depende de cómo llegaste. Solo hay n × capacity situaciones así, así que calcula cada una una vez y guárdala en una tabla.' },
  approaches: [
    { id: 'recursion', label: { en: 'Try take / skip for every item', es: 'Probar tomar / saltar cada objeto' }, kind: 'brute', fn: knapsackRecursive, time: 'O(2ⁿ)', space: 'O(n)', benchMax: 24, note: { en: 'A binary decision tree n levels deep. 30 items is already a billion paths.', es: 'Un árbol de decisiones binario de n niveles. Con 30 objetos ya son mil millones de caminos.' } },
    { id: 'table', label: { en: 'DP table', es: 'Tabla de DP' }, kind: 'optimal', fn: knapsack, time: 'O(n · capacity)', space: 'O(n · capacity)', note: { en: 'Each cell looks at two cells in the row above. (Since only the previous row is needed, the table can be squeezed to a single row filled right-to-left: O(capacity) space.)', es: 'Cada celda mira dos celdas de la fila de arriba. (Como solo se necesita la fila anterior, la tabla puede reducirse a una sola fila llenada de derecha a izquierda: espacio O(capacity).)' } },
  ],
  code,
  cases: [
    { name: { en: 'classic example', es: 'ejemplo clásico' }, args: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
    { name: { en: 'no items', es: 'sin objetos' }, args: [[], [], 10], expected: 0 },
    { name: { en: 'zero capacity', es: 'capacidad cero' }, args: [[1, 2], [5, 6], 0], expected: 0 },
    { name: { en: 'single item that fits', es: 'un solo objeto que cabe' }, args: [[3], [10], 3], expected: 10 },
    { name: { en: 'single item too heavy', es: 'un solo objeto demasiado pesado' }, args: [[4], [10], 3], expected: 0 },
    { name: { en: 'everything fits', es: 'todo cabe' }, args: [[1, 2, 3], [6, 10, 12], 6], expected: 28 },
    { name: { en: 'greedy by value/weight ratio fails here', es: 'el voraz por razón valor/peso falla aquí' }, args: [[1, 2, 3], [6, 10, 12], 5], expected: 22 },
    { name: { en: 'one heavy valuable item vs many light ones', es: 'un objeto pesado y valioso vs. muchos ligeros' }, args: [[5, 1, 1, 1], [10, 3, 3, 3], 5], expected: 10 },
    { name: { en: 'equal weights, pick the most valuable', es: 'pesos iguales, elige los más valiosos' }, args: [[2, 2, 2], [1, 9, 5], 4], expected: 14 },
    { name: { en: 'exact fit required', es: 'se requiere encaje exacto' }, args: [[4, 5, 6], [1, 2, 30], 6], expected: 30 },
  ],
  bench: {
    sizes: [8, 16, 20, 24, 100, 400],
    nLabel: { en: 'number of items (capacity 500)', es: 'número de objetos (capacidad 500)' },
    gen: (n) => [randArray(n, 1, 40), randArray(n, 1, 100), n < 8 ? 20 : 500],
  },
  demo: {
    inputs: [
      { name: 'weights', value: '[1, 3, 4, 5]' },
      { name: 'values', value: '[1, 4, 5, 7]' },
      { name: 'capacity', value: '7' },
    ],
    validate: (w, v, c) =>
      first(numsErr(w, 4, 'weights', 1), numsErr(v, 4, 'values', 1), (w as number[]).length !== (v as number[]).length ? { en: 'weights and values must have the same length.', es: 'weights y values deben tener la misma longitud.' } : null, (w as number[]).some((x) => !Number.isInteger(x) || x < 1) ? { en: 'Weights must be whole numbers ≥ 1.', es: 'Los pesos deben ser números enteros ≥ 1.' } : null, intErr(c, 'capacity', 1, 8)),
    traces: { table: trace },
  },
};
