import code from './stock.ts?code';
import { randArray } from '../../lib/ds';
import type { Problem } from '../../types';

// #region brute
export function maxProfitBrute(prices: number[]): number {
  let best = 0;
  for (let buy = 0; buy < prices.length; buy++) {
    for (let sell = buy + 1; sell < prices.length; sell++) {
      best = Math.max(best, prices[sell] - prices[buy]);
    }
  }
  return best;
}
// #endregion

// #region onepass
export function maxProfit(prices: number[]): number {
  let cheapest = Infinity; // lowest price seen so far = best day to have bought
  let best = 0;
  for (const price of prices) {
    cheapest = Math.min(cheapest, price);
    best = Math.max(best, price - cheapest); // sell today
  }
  return best;
}
// #endregion

export const stock: Problem = {
  id: 'stock',
  title: { en: 'Best time to buy and sell a stock', es: 'Best Time to Buy and Sell Stock (mejor momento para comprar y vender una acción)' },
  difficulty: 'Easy',
  statement: [
    { en: '`prices[i]` is the price of a stock on day `i`. Buy on one day and sell on a **later** day to maximise profit. Return the best profit, or `0` if no profit is possible.', es: '`prices[i]` es el precio de una acción el día `i`. Compra un día y vende un día **posterior** para maximizar la ganancia. Devuelve la mejor ganancia, o `0` si no es posible ganar nada.' },
  ],
  examples: [
    { input: 'prices = [7, 1, 5, 3, 6, 4]', output: '5', why: { en: 'Buy at 1 (day 1), sell at 6 (day 4).', es: 'Compra a 1 (día 1), vende a 6 (día 4).' } },
    { input: 'prices = [7, 6, 4, 3, 1]', output: '0', why: { en: 'Prices only fall.', es: 'Los precios solo bajan.' } },
  ],
  insight:
    { en: 'Same shape as Kadane: for each day ask "what is the best profit if I **sell today**?" That only depends on the cheapest price seen so far — one number you can carry along. So the inner loop that looks back for the best buying day is replaced by a running minimum.', es: 'La misma forma que Kadane: para cada día pregunta "¿cuál es la mejor ganancia si **vendo hoy**?". Eso solo depende del precio más barato visto hasta ahora, un número que puedes llevar contigo. Así, el bucle interno que mira hacia atrás buscando el mejor día de compra se reemplaza por un mínimo acumulado.' },
  approaches: [
    { id: 'brute', label: { en: 'Every buy day × every sell day', es: 'Cada día de compra × cada día de venta' }, kind: 'brute', fn: maxProfitBrute, time: 'O(n²)', space: 'O(1)', note: { en: 'Try all pairs of days with buy before sell.', es: 'Prueba todos los pares de días con la compra antes de la venta.' } },
    { id: 'onepass', label: { en: 'Track the cheapest price so far', es: 'Seguir el precio más barato hasta ahora' }, kind: 'optimal', fn: maxProfit, time: 'O(n)', space: 'O(1)', note: { en: 'One pass, two variables.', es: 'Una pasada, dos variables.' } },
  ],
  code,
  cases: [
    { name: { en: 'classic example', es: 'ejemplo clásico' }, args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
    { name: { en: 'prices only fall', es: 'los precios solo bajan' }, args: [[7, 6, 4, 3, 1]], expected: 0 },
    { name: { en: 'empty', es: 'vacío' }, args: [[]], expected: 0 },
    { name: { en: 'single day', es: 'un solo día' }, args: [[5]], expected: 0 },
    { name: { en: 'prices only rise', es: 'los precios solo suben' }, args: [[1, 2, 3, 4, 5]], expected: 4 },
    { name: { en: 'all equal', es: 'todos iguales' }, args: [[3, 3, 3]], expected: 0 },
    { name: { en: 'lowest price comes after the highest', es: 'el precio más bajo llega después del más alto' }, args: [[9, 8, 1, 2]], expected: 1 },
    { name: { en: 'two days, profit', es: 'dos días, con ganancia' }, args: [[1, 10]], expected: 9 },
    { name: { en: 'best buy is not the global minimum', es: 'la mejor compra no es el mínimo global' }, args: [[3, 10, 1, 5]], expected: 7 },
  ],
  bench: { sizes: [100, 1000, 10_000, 30_000], nLabel: { en: 'number of days', es: 'número de días' }, gen: (n) => [randArray(n, 1, 10_000)] },
};
