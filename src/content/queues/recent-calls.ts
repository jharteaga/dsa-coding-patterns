import code from './recent-calls.ts?code';
import { randInt } from '../../lib/ds';
import type { Problem } from '../../types';

// #region scan
export function recentCountsScan(times: number[]): number[] {
  const all: number[] = [];
  return times.map((t) => {
    all.push(t);
    // Re-count every request ever received.
    let count = 0;
    for (const earlier of all) if (earlier >= t - 3000) count++;
    return count;
  });
}
// #endregion

// #region queue
export function recentCounts(times: number[]): number[] {
  const queue: number[] = []; // requests still inside the 3000 ms window
  let head = 0; // index of the oldest one (advancing it = dequeue in O(1))
  return times.map((t) => {
    queue.push(t); // newest joins at the back
    while (queue[head] < t - 3000) head++; // expired ones leave from the front
    return queue.length - head;
  });
}
// #endregion

export const recentCalls: Problem = {
  id: 'recent-calls',
  title: { en: 'Count recent requests (rate limiter)', es: 'Contar solicitudes recientes (limitador de tasa)' },
  difficulty: 'Easy',
  statement: [
    { en: 'Requests arrive at strictly increasing times (in milliseconds). For each request at time `t`, return how many requests — including this one — happened in the window `[t − 3000, t]`.', es: 'Las solicitudes llegan en tiempos estrictamente crecientes (en milisegundos). Para cada solicitud en el tiempo `t`, devuelve cuántas solicitudes, incluida esta, ocurrieron en la ventana `[t − 3000, t]`.' },
  ],
  examples: [{ input: 'times = [1, 100, 3001, 3002]', output: '[1, 2, 3, 3]', why: { en: 'At t = 3002 the window is [2, 3002], so the request at t = 1 no longer counts.', es: 'En t = 3002 la ventana es [2, 3002], así que la solicitud en t = 1 ya no cuenta.' } }],
  insight:
    { en: 'Time only moves forward, so once a request falls out of the window it is gone **for good**. And requests expire in the same order they arrived: oldest first. That is a queue — new requests join at the back, expired ones leave from the front, and the answer is just the queue’s length. Each request is added once and removed once.', es: 'El tiempo solo avanza, así que en cuanto una solicitud sale de la ventana se va **para siempre**. Y las solicitudes caducan en el mismo orden en que llegaron: la más antigua primero. Eso es una cola: las solicitudes nuevas entran por atrás, las caducadas salen por el frente, y la respuesta es simplemente la longitud de la cola. Cada solicitud se agrega una vez y se quita una vez.' },
  approaches: [
    { id: 'scan', label: { en: 'Re-count all requests each time', es: 'Volver a contar todas las solicitudes cada vez' }, kind: 'brute', fn: recentCountsScan, time: 'O(n²)', space: 'O(n)', note: { en: 'Keeps everything forever and scans the full history on every request.', es: 'Guarda todo para siempre y recorre el historial completo en cada solicitud.' } },
    { id: 'queue', label: { en: 'Queue of requests in the window', es: 'Cola de solicitudes dentro de la ventana' }, kind: 'optimal', fn: recentCounts, time: 'O(n)', space: 'O(n)', note: { en: 'A moving `head` index stands in for dequeue, since JavaScript arrays have no O(1) remove-from-front. In C#, `Queue<int>` does it directly.', es: 'Un índice `head` que avanza sustituye al dequeue, ya que los arreglos de JavaScript no tienen un quitar-del-frente O(1). En C#, `Queue<int>` lo hace directamente.' } },
  ],
  code,
  cases: [
    { name: { en: 'oldest request expires', es: 'la solicitud más antigua caduca' }, args: [[1, 100, 3001, 3002]], expected: [1, 2, 3, 3] },
    { name: { en: 'no requests', es: 'sin solicitudes' }, args: [[]], expected: [] },
    { name: { en: 'single request', es: 'una sola solicitud' }, args: [[5]], expected: [1] },
    { name: { en: 'exactly 3000 ms apart still counts', es: 'exactamente 3000 ms de diferencia todavía cuenta' }, args: [[0, 3000]], expected: [1, 2] },
    { name: { en: '3001 ms apart does not', es: '3001 ms de diferencia ya no' }, args: [[0, 3001]], expected: [1, 1] },
    { name: { en: 'burst inside one window', es: 'ráfaga dentro de una ventana' }, args: [[10, 20, 30, 40]], expected: [1, 2, 3, 4] },
    { name: { en: 'widely spaced', es: 'muy espaciadas' }, args: [[0, 5000, 10000]], expected: [1, 1, 1] },
    { name: { en: 'several expire at once', es: 'varias caducan a la vez' }, args: [[1, 2, 3, 9000]], expected: [1, 2, 3, 1] },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 30_000],
    nLabel: { en: 'number of requests', es: 'número de solicitudes' },
    gen: (n) => { let t = 0; return [Array.from({ length: n }, () => (t += randInt(1, 400)))]; },
  },
};
