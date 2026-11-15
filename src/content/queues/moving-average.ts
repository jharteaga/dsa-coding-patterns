import code from './moving-average.ts?code';
import { randArray } from '../../lib/ds';
import type { Problem } from '../../types';

// #region resum
export function movingAveragesResum(size: number, values: number[]): number[] {
  const all: number[] = [];
  return values.map((value) => {
    all.push(value); // history grows forever
    const from = Math.max(0, all.length - size);
    let sum = 0;
    for (let i = from; i < all.length; i++) sum += all[i]; // re-add the whole window
    return sum / (all.length - from);
  });
}
// #endregion

// #region ring
export function movingAverages(size: number, values: number[]): number[] {
  const ring = new Array<number>(size).fill(0); // only the last `size` values
  let next = 0; // slot to overwrite next = slot holding the oldest value
  let count = 0;
  let sum = 0;
  return values.map((value) => {
    sum -= ring[next]; // the oldest value leaves the window (0 while filling up)
    sum += value; // the new value enters
    ring[next] = value; // overwrite the oldest slot
    next = (next + 1) % size;
    if (count < size) count++;
    return sum / count;
  });
}
// #endregion

export const movingAverage: Problem = {
  id: 'moving-average',
  title: { en: 'Moving average of a stream', es: 'Promedio móvil de un flujo' },
  difficulty: 'Easy',
  statement: [
    { en: 'Values arrive one at a time. After each value, report the average of the **last `size` values** (or of all values so far, if fewer than `size` have arrived).', es: 'Los valores llegan uno a la vez. Después de cada valor, reporta el promedio de los **últimos `size` valores** (o de todos los valores hasta ahora, si han llegado menos de `size`).' },
    { en: 'This is the "overwrite the oldest" use of a ring buffer — the same structure behind "keep the last N log lines" or an audio delay line.', es: 'Este es el uso de "sobrescribir el más antiguo" de un búfer circular: la misma estructura detrás de "guardar las últimas N líneas de log" o de una línea de retardo de audio.' },
  ],
  examples: [{ input: 'size = 3, values = [1, 10, 3, 5]', output: '[1, 5.5, 4.666…, 6]', why: { en: '1/1, (1+10)/2, (1+10+3)/3, (10+3+5)/3.', es: '1/1, (1+10)/2, (1+10+3)/3, (10+3+5)/3.' } }],
  insight:
    { en: 'A window of "the last N" only ever changes at its two ends: one new value comes in, the oldest goes out. A ring buffer of exactly N slots stores it with no shifting — the slot holding the oldest value is precisely the slot to overwrite next. Keep a **running sum** alongside (subtract what leaves, add what enters) and each update is O(1), with memory that never grows.', es: 'Una ventana de "los últimos N" solo cambia en sus dos extremos: entra un valor nuevo y sale el más antiguo. Un búfer circular de exactamente N casillas la guarda sin desplazar nada: la casilla con el valor más antiguo es justo la que se sobrescribe a continuación. Lleva una **suma acumulada** al lado (resta lo que sale, suma lo que entra) y cada actualización es O(1), con memoria que nunca crece.' },
  approaches: [
    { id: 'resum', label: { en: 'Keep everything, re-add the window', es: 'Guardar todo, volver a sumar la ventana' }, kind: 'brute', fn: movingAveragesResum, time: 'O(size) per value', space: 'O(n)', note: { en: 'Stores the entire history and loops over the last `size` values for every new one.', es: 'Guarda todo el historial y recorre los últimos `size` valores por cada valor nuevo.' } },
    { id: 'ring', label: { en: 'Ring buffer + running sum', es: 'Búfer circular + suma acumulada' }, kind: 'optimal', fn: movingAverages, time: 'O(1) per value', space: 'O(size)', note: { en: 'Constant work and constant memory per value — it could run forever on an endless stream.', es: 'Trabajo y memoria constantes por valor: podría correr para siempre sobre un flujo infinito.' } },
  ],
  code,
  cases: [
    { name: { en: 'window fills, then slides', es: 'la ventana se llena y luego se desliza' }, args: [3, [1, 10, 3, 5]], expected: [1, 5.5, 14 / 3, 6] },
    { name: { en: 'no values', es: 'sin valores' }, args: [3, []], expected: [] },
    { name: { en: 'window of one = the value itself', es: 'ventana de uno = el propio valor' }, args: [1, [4, 7, 9]], expected: [4, 7, 9] },
    { name: { en: 'window larger than the stream', es: 'ventana más grande que el flujo' }, args: [10, [2, 4]], expected: [2, 3] },
    { name: { en: 'negative values', es: 'valores negativos' }, args: [2, [-4, 4, -8]], expected: [-4, 0, -2] },
    { name: { en: 'all equal', es: 'todos iguales' }, args: [2, [5, 5, 5, 5]], expected: [5, 5, 5, 5] },
    { name: { en: 'zeros', es: 'ceros' }, args: [3, [0, 0, 0]], expected: [0, 0, 0] },
    { name: { en: 'wraps around the ring several times', es: 'da la vuelta al anillo varias veces' }, args: [2, [1, 2, 3, 4, 5, 6]], expected: [1, 1.5, 2.5, 3.5, 4.5, 5.5] },
  ],
  bench: {
    sizes: [10, 100, 1000, 10_000],
    nLabel: { en: 'window size (stream of 20,000 values)', es: 'tamaño de ventana (flujo de 20,000 valores)' },
    gen: (n) => [n, randArray(n < 20 ? 12 : 20_000, -1000, 1000)],
  },
};
