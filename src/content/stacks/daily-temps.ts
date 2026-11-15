import code from './daily-temps.ts?code';
import { numsErr } from '../../lib/check';
import { randArray } from '../../lib/ds';
import { Tracer, arr, mark, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';

// #region brute
export function dailyTemperaturesBrute(temps: number[]): number[] {
  const wait = new Array<number>(temps.length).fill(0);
  for (let i = 0; i < temps.length; i++) {
    for (let j = i + 1; j < temps.length; j++) {
      if (temps[j] > temps[i]) {
        wait[i] = j - i;
        break;
      }
    }
  }
  return wait;
}
// #endregion

// #region stack
export function dailyTemperatures(temps: number[]): number[] {
  const wait = new Array<number>(temps.length).fill(0);
  const stack: number[] = []; // indices of days still waiting for a warmer day
  for (let i = 0; i < temps.length; i++) {
    // Today answers every waiting day that is colder than today.
    while (stack.length > 0 && temps[stack[stack.length - 1]] < temps[i]) {
      const day = stack.pop() as number; // @resolve
      wait[day] = i - day;
    }
    stack.push(i); // today now waits for its own warmer day // @push
  }
  return wait; // @done
}
// #endregion

function trace(temps: number[]) {
  const t = new Tracer();
  const wait = new Array<number>(temps.length).fill(0);
  const stack: number[] = [];
  const views = (i: number, hl: Record<number, Tone> = {}) => [
    arr(temps, { label: { en: 'temperatures', es: 'temperaturas' }, layout: 'bars', pointers: { i }, hl: { ...Object.fromEntries(stack.map((d) => [d, 'window' as const])), ...mark('active', i), ...hl } }),
    arr(stack.map((d) => `${temps[d]}°`), {
      label: { en: 'stack: days still waiting (always getting colder toward the top)', es: 'pila: días que aún esperan (cada vez más fríos hacia la cima)' },
      layout: 'stack',
    }),
    arr(wait, { label: { en: 'answer: days to wait', es: 'respuesta: días de espera' } }),
  ];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const day = stack.pop()!;
      wait[day] = i - day;
      t.add(
        'resolve',
        {
          en: `Today (${temps[i]}°) is warmer than the day on top of the stack (day ${day}, ${temps[day]}°). So day ${day} has found its answer: it waited **${i - day}** day(s). Pop it.`,
          es: `Hoy (${temps[i]}°) hace más calor que el día en la cima de la pila (día ${day}, ${temps[day]}°). Así que el día ${day} encontró su respuesta: esperó **${i - day}** día(s). Desapílalo.`,
        },
        ...views(i, mark('good', day)));
    }
    stack.push(i);
    t.add('push', stack.length > 1
        ? {
            en: `${temps[i]}° is not warmer than what is left on the stack, so it cannot answer those days. Push today — it now waits too.`,
            es: `${temps[i]}° no es más cálido que lo que queda en la pila, así que no puede responder a esos días. Apila hoy — ahora también espera.`,
          }
        : { en: `Nothing is waiting. Push today (${temps[i]}°): it waits for a warmer day.`, es: `Nada está esperando. Apila hoy (${temps[i]}°): espera un día más cálido.` }, ...views(i));
  }
  t.add(
    'done',
    {
      en: `End of data. Days still on the stack never see a warmer day: their answer stays 0. Every day was pushed once and popped at most once.`,
      es: `Fin de los datos. Los días que siguen en la pila nunca ven un día más cálido: su respuesta queda en 0. Cada día se apiló una vez y se desapiló como máximo una vez.`,
    },
    arr(temps, { label: { en: 'temperatures', es: 'temperaturas' }, layout: 'bars', hl: Object.fromEntries(stack.map((d) => [d, 'muted' as const])) }),
    arr(wait, { label: { en: 'answer: days to wait', es: 'respuesta: días de espera' } }),
    vars({ 'still waiting': stack.map((d) => `${temps[d]}°`) }));
  return t.frames;
}

export const dailyTemps: Problem = {
  id: 'daily-temps',
  title: { en: 'Daily temperatures (next warmer day)', es: 'Daily Temperatures (siguiente día más cálido)' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'Given daily temperatures, return an array where `answer[i]` is the number of days you have to wait after day `i` for a **warmer** temperature. Use `0` if no warmer day comes.',
      es: 'Dadas las temperaturas diarias, devuelve un arreglo donde `answer[i]` es el número de días que debes esperar después del día `i` para una temperatura **más cálida**. Usa `0` si no llega ningún día más cálido.',
    },
  ],
  examples: [{ input: 'temps = [73, 74, 75, 71, 69, 72, 76, 73]', output: '[1, 1, 4, 2, 1, 1, 0, 0]' }],
  insight: {
    en: 'Flip the question. Instead of each day *looking forward* for its answer, let each new day *look back* and settle every earlier day it is warmer than. Keep the unanswered days on a stack. Their temperatures are always decreasing toward the top (a warmer day would have popped the colder ones beneath it), so today only ever needs to compare with the top. Each day is pushed once and popped once: O(n) total.',
    es: 'Invierte la pregunta. En lugar de que cada día *mire hacia adelante* buscando su respuesta, deja que cada día nuevo *mire hacia atrás* y resuelva cada día anterior que sea más frío que él. Guarda los días sin respuesta en una pila. Sus temperaturas siempre disminuyen hacia la cima (un día más cálido habría desapilado los más fríos debajo de él), así que hoy solo necesita compararse con la cima. Cada día se apila una vez y se desapila una vez: O(n) en total.',
  },
  approaches: [
    { id: 'brute', label: { en: 'Scan forward from each day', es: 'Recorrer hacia adelante desde cada día' }, kind: 'brute', fn: dailyTemperaturesBrute, time: 'O(n²)', space: 'O(1)', note: {
        en: 'For each day, walk right until a warmer one appears. With steadily falling temperatures every scan runs to the end.',
        es: 'Para cada día, avanza a la derecha hasta que aparezca uno más cálido. Con temperaturas que bajan sin parar, cada recorrido llega hasta el final.',
      },
    },
    { id: 'stack', label: { en: 'Monotonic stack of waiting days', es: 'Pila monótona de días en espera' }, kind: 'optimal', fn: dailyTemperatures, time: 'O(n)', space: 'O(n)', note: {
        en: 'The nested `while` looks quadratic but is not: across the whole run it pops at most n times in total.',
        es: 'El `while` anidado parece cuadrático pero no lo es: en toda la ejecución desapila como máximo n veces en total.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'classic example', es: 'ejemplo clásico' }, args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
    { name: { en: 'empty', es: 'vacío' }, args: [[]], expected: [] },
    { name: { en: 'single day', es: 'un solo día' }, args: [[70]], expected: [0] },
    { name: { en: 'strictly rising', es: 'estrictamente creciente' }, args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
    { name: { en: 'strictly falling', es: 'estrictamente decreciente' }, args: [[60, 50, 40, 30]], expected: [0, 0, 0, 0] },
    { name: { en: 'all equal (equal is not warmer)', es: 'todos iguales (igual no es más cálido)' }, args: [[50, 50, 50]], expected: [0, 0, 0] },
    { name: { en: 'one warm day at the very end', es: 'un día cálido justo al final' }, args: [[5, 4, 3, 2, 9]], expected: [4, 3, 2, 1, 0] },
    { name: { en: 'plateau then rise', es: 'meseta y luego subida' }, args: [[30, 30, 31]], expected: [2, 1, 0] },
    { name: { en: 'zigzag', es: 'zigzag' }, args: [[3, 1, 4, 1, 5]], expected: [2, 1, 2, 1, 0] },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 30_000],
    nLabel: { en: 'number of days (falling temperatures: worst case)', es: 'número de días (temperaturas descendentes: peor caso)' },
    gen: (n) => [n < 20 ? randArray(n, 0, 9) : Array.from({ length: n }, (_, i) => n - i)],
  },
  demo: {
    inputs: [{ name: 'temperatures', value: '[73, 74, 75, 71, 69, 72, 76, 73]' }],
    validate: (a) => numsErr(a, 12, { en: 'The list of temperatures', es: 'La lista de temperaturas' }),
    traces: { stack: trace },
  },
};
