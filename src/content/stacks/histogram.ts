import code from './histogram.ts?code';
import { randArray } from '../../lib/ds';
import type { Problem } from '../../types';

// #region brute
export function largestRectangleBrute(heights: number[]): number {
  let best = 0;
  for (let left = 0; left < heights.length; left++) {
    let lowest = Infinity;
    for (let right = left; right < heights.length; right++) {
      lowest = Math.min(lowest, heights[right]); // shortest bar in [left..right]
      best = Math.max(best, lowest * (right - left + 1));
    }
  }
  return best;
}
// #endregion

// #region stack
export function largestRectangle(heights: number[]): number {
  let best = 0;
  const stack: number[] = []; // indices of bars with increasing heights
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i]; // a final 0 flushes the stack
    // A shorter bar ends every taller bar's rectangle.
    while (stack.length > 0 && heights[stack[stack.length - 1]] > h) {
      const height = heights[stack.pop() as number];
      // The rectangle spans from just after the previous shorter bar up to i - 1.
      const leftEdge = stack.length === 0 ? 0 : stack[stack.length - 1] + 1;
      best = Math.max(best, height * (i - leftEdge));
    }
    stack.push(i);
  }
  return best;
}
// #endregion

export const histogram: Problem = {
  id: 'histogram',
  title: { en: 'Largest rectangle in a histogram', es: 'Largest Rectangle in Histogram (rectángulo más grande en un histograma)' },
  difficulty: 'Hard',
  statement: [
    {
      en: 'Each bar of a histogram has width 1 and height `heights[i]`. Return the area of the largest rectangle that fits entirely inside the bars.',
      es: 'Cada barra de un histograma tiene ancho 1 y altura `heights[i]`. Devuelve el área del rectángulo más grande que cabe completamente dentro de las barras.',
    },
  ],
  examples: [
    {
      input: 'heights = [2, 1, 5, 6, 2, 3]',
      output: '10',
      why: { en: 'The bars of height 5 and 6 hold a 2-wide rectangle of height 5.', es: 'Las barras de altura 5 y 6 contienen un rectángulo de ancho 2 y altura 5.' },
    },
  ],
  insight: {
    en: 'For every bar, imagine the widest rectangle that uses that bar’s **full height**. It stretches left and right until it hits a *shorter* bar. So the real question is "where is the nearest shorter bar on each side?" — a monotonic stack answers that for all bars in one pass: when a shorter bar arrives, it is the right boundary for every taller bar on the stack, and the bar beneath each of those is its left boundary.',
    es: 'Para cada barra, imagina el rectángulo más ancho que usa la **altura completa** de esa barra. Se extiende a izquierda y derecha hasta chocar con una barra *más baja*. Así que la pregunta real es "¿dónde está la barra más baja más cercana a cada lado?" — una pila monótona responde eso para todas las barras en una sola pasada: cuando llega una barra más baja, es el límite derecho de cada barra más alta de la pila, y la barra debajo de cada una de ellas es su límite izquierdo.',
  },
  approaches: [
    { id: 'brute', label: { en: 'Every left × every right', es: 'Cada izquierda × cada derecha' }, kind: 'brute', fn: largestRectangleBrute, time: 'O(n²)', space: 'O(1)', note: {
        en: 'For each starting bar, extend right while tracking the shortest bar so far.',
        es: 'Para cada barra inicial, extiende hacia la derecha llevando la cuenta de la barra más baja hasta el momento.',
      },
    },
    { id: 'stack', label: { en: 'Monotonic increasing stack', es: 'Pila monótona creciente' }, kind: 'optimal', fn: largestRectangle, time: 'O(n)', space: 'O(n)', note: {
        en: 'Each bar is pushed and popped once. The extra loop step with height 0 forces every remaining bar to be evaluated.',
        es: 'Cada barra se apila y se desapila una vez. El paso extra del bucle con altura 0 obliga a evaluar todas las barras restantes.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'classic example', es: 'ejemplo clásico' }, args: [[2, 1, 5, 6, 2, 3]], expected: 10 },
    { name: { en: 'empty', es: 'vacío' }, args: [[]], expected: 0 },
    { name: { en: 'single bar', es: 'una sola barra' }, args: [[4]], expected: 4 },
    { name: { en: 'all equal', es: 'todas iguales' }, args: [[3, 3, 3]], expected: 9 },
    { name: { en: 'increasing', es: 'creciente' }, args: [[1, 2, 3, 4]], expected: 6 },
    { name: { en: 'decreasing', es: 'decreciente' }, args: [[4, 3, 2, 1]], expected: 6 },
    { name: { en: 'contains zeros', es: 'contiene ceros' }, args: [[2, 0, 2]], expected: 2 },
    { name: { en: 'wide and low wins', es: 'gana el ancho y bajo' }, args: [[1, 1, 1, 1, 1, 1]], expected: 6 },
    { name: { en: 'one tall spike wins', es: 'gana un pico alto' }, args: [[1, 9, 1]], expected: 9 },
    { name: { en: 'valley', es: 'valle' }, args: [[5, 1, 5]], expected: 5 },
  ],
  bench: { sizes: [100, 1000, 10_000, 30_000], nLabel: { en: 'number of bars', es: 'número de barras' }, gen: (n) => [randArray(n, 0, 1000)] },
};
