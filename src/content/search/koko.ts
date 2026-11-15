import code from './koko.ts?code';
import { first, intErr, numsErr } from '../../lib/check';
import { randArray, randInt } from '../../lib/ds';
import { Tracer, arr, mark, span, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region linear
export function minSpeedLinear(piles: number[], h: number): number {
  const hoursAt = (speed: number): number => {
    let hours = 0;
    for (const pile of piles) hours += Math.ceil(pile / speed);
    return hours;
  };

  // Try every speed, slowest first. The first one that is fast enough wins.
  let speed = 1;
  while (hoursAt(speed) > h) speed++;
  return speed;
}
// #endregion

// #region binary
export function minSpeed(piles: number[], h: number): number {
  const hoursAt = (speed: number): number => {
    let hours = 0;
    for (const pile of piles) hours += Math.ceil(pile / speed);
    return hours;
  };

  let lo = 1; // slowest speed worth trying
  let hi = Math.max(...piles); // always fast enough: one pile per hour // @init
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // @mid
    if (hoursAt(mid) <= h) hi = mid; // @ok
    else lo = mid + 1; // @slow
  }
  return lo; // @done
}
// #endregion

function trace(piles: number[], h: number) {
  const t = new Tracer();
  const hoursAt = (s: number) => piles.reduce((sum, p) => sum + Math.ceil(p / s), 0);
  let lo = 1;
  let hi = Math.max(...piles);
  const speeds = Array.from({ length: hi }, (_, i) => i + 1);
  const view = (mid?: number, verdicts: Record<number, 'good' | 'bad'> = {}) =>
    arr(speeds, {
      label: { en: 'candidate speeds (the answer space)', es: 'velocidades candidatas (el espacio de respuestas)' },
      pointers: mid ? { lo: lo - 1, mid: mid - 1, hi: hi - 1 } : { lo: lo - 1, hi: hi - 1 },
      hl: { ...span('muted', 0, speeds.length - 1), ...span('window', lo - 1, hi - 1), ...verdicts },
    });
  const known: Record<number, 'good' | 'bad'> = {};
  t.add(
    'init',
    {
      en: `We are not searching the piles — we are searching the **answers**. Any speed from 1 to ${hi} could be the answer. Slow speeds fail, fast speeds work, and we want the first one that works.`,
      es: `No estamos buscando en las pilas: estamos buscando en las **respuestas**. Cualquier velocidad de 1 a ${hi} podría ser la respuesta. Las velocidades lentas fallan, las rápidas funcionan, y queremos la primera que funcione.`,
    },
    arr(piles, { label: 'piles' }),
    view(),
    vars({ h }),
  );
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const hrs = hoursAt(mid);
    const sum = piles.map((p) => Math.ceil(p / mid)).join(' + ');
    t.add(
      'mid',
      {
        en: `Try the middle speed ${mid}: eating takes ${sum} = **${hrs} hours**. Allowed: ${h}.`,
        es: `Prueba la velocidad del medio, ${mid}: comer toma ${sum} = **${hrs} horas**. Permitidas: ${h}.`,
      },
      arr(piles, { label: 'piles' }),
      view(mid, { ...known, [mid - 1]: 'active' as never }),
      vars({ h, speed: mid, hours: hrs }),
    );
    if (hrs <= h) {
      known[mid - 1] = 'good';
      hi = mid;
      t.add(
        'ok',
        {
          en: `${hrs} ≤ ${h}: speed ${mid} works — and so does every faster speed. The answer is ${mid} or something slower, so drop everything above it.`,
          es: `${hrs} ≤ ${h}: la velocidad ${mid} funciona, y también cualquier velocidad más rápida. La respuesta es ${mid} o algo más lento, así que descarta todo lo que está por encima.`,
        },
        arr(piles, { label: 'piles' }),
        view(undefined, known),
        vars({ h }),
      );
    } else {
      known[mid - 1] = 'bad';
      lo = mid + 1;
      t.add(
        'slow',
        {
          en: `${hrs} > ${h}: speed ${mid} is too slow — and so is every slower speed. Drop ${mid} and everything below it.`,
          es: `${hrs} > ${h}: la velocidad ${mid} es demasiado lenta, y también cualquier velocidad más lenta. Descarta ${mid} y todo lo que está por debajo.`,
        },
        arr(piles, { label: 'piles' }),
        view(undefined, known),
        vars({ h }),
      );
    }
  }
  t.add(
    'done',
    {
      en: `Only one candidate is left. The minimum speed is **${lo}**. We tested a handful of speeds instead of all ${speeds.length}.`,
      es: `Solo queda un candidato. La velocidad mínima es **${lo}**. Probamos unas pocas velocidades en lugar de las ${speeds.length}.`,
    },
    arr(piles, { label: 'piles' }),
    arr(speeds, { label: { en: 'candidate speeds', es: 'velocidades candidatas' }, hl: { ...span('muted', 0, speeds.length - 1), ...mark('good', lo - 1) } }),
  );
  return t.frames;
}

export const koko: Problem = {
  id: 'koko',
  title: { en: 'Minimum eating speed (binary search on the answer)', es: 'Velocidad mínima para comer (búsqueda binaria sobre la respuesta)' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'There are `piles` of bananas and `h` hours. Each hour you pick one pile and eat up to `k` bananas from it (if the pile has fewer, you finish it and wait). Return the **smallest** whole speed `k` that finishes every pile within `h` hours. It is guaranteed that `h ≥ piles.length`.',
      es: 'Hay pilas de plátanos (`piles`) y `h` horas. Cada hora eliges una pila y comes hasta `k` plátanos de ella (si la pila tiene menos, la terminas y esperas). Devuelve la velocidad entera **más pequeña** `k` que termine todas las pilas en `h` horas. Se garantiza que `h ≥ piles.length`.',
    },
  ],
  examples: [
    {
      input: 'piles = [3, 6, 7, 11], h = 8',
      output: '4',
      why: {
        en: 'At speed 4 the piles take 1 + 2 + 2 + 3 = 8 hours. At speed 3 they take 10.',
        es: 'A velocidad 4 las pilas toman 1 + 2 + 2 + 3 = 8 horas. A velocidad 3 toman 10.',
      },
    },
  ],
  insight: {
    en: 'There is no sorted array here — but the **answers** are ordered. If speed k is fast enough, every speed above k is too; if k is too slow, so is everything below. So "is speed k fast enough?" is false, false, …, false, true, true, …, true across 1..max. That is exactly the shape binary search needs: find where it flips.',
    es: 'Aquí no hay un arreglo ordenado, pero las **respuestas** sí están ordenadas. Si la velocidad k es suficientemente rápida, toda velocidad mayor que k también lo es; si k es demasiado lenta, también lo es todo lo que está por debajo. Así que "¿la velocidad k es suficientemente rápida?" es falso, falso, …, falso, verdadero, verdadero, …, verdadero a lo largo de 1..max. Esa es exactamente la forma que necesita la búsqueda binaria: encontrar dónde cambia.',
  },
  approaches: [
    {
      id: 'linear',
      label: { en: 'Try every speed', es: 'Probar cada velocidad' },
      kind: 'brute',
      fn: minSpeedLinear,
      time: 'O(n · m)',
      space: 'O(1)',
      note: {
        en: 'Test speed 1, 2, 3… until one finishes in time. Each test walks all n piles, and there can be up to m = max(piles) speeds to try.',
        es: 'Prueba la velocidad 1, 2, 3… hasta que una termine a tiempo. Cada prueba recorre las n pilas, y puede haber hasta m = max(piles) velocidades por probar.',
      },
    },
    {
      id: 'binary',
      label: { en: 'Binary search the speed', es: 'Búsqueda binaria sobre la velocidad' },
      kind: 'optimal',
      fn: minSpeed,
      time: 'O(n · log m)',
      space: 'O(1)',
      note: {
        en: 'Same test function, but binary search picks which speeds to test. With piles up to 1,000,000,000 that is about 30 tests instead of a billion.',
        es: 'La misma función de prueba, pero la búsqueda binaria elige qué velocidades probar. Con pilas de hasta 1,000,000,000 son unas 30 pruebas en lugar de mil millones.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'classic example', es: 'ejemplo clásico' }, args: [[3, 6, 7, 11], 8], expected: 4 },
    {
      name: { en: 'one hour per pile → must eat the largest pile in an hour', es: 'una hora por pila → hay que comer la pila más grande en una hora' },
      args: [[30, 11, 23, 4, 20], 5],
      expected: 30,
    },
    { name: { en: 'one spare hour', es: 'una hora de sobra' }, args: [[30, 11, 23, 4, 20], 6], expected: 23 },
    { name: { en: 'single pile, plenty of time', es: 'una sola pila, mucho tiempo' }, args: [[10], 10], expected: 1 },
    { name: { en: 'single pile, one hour', es: 'una sola pila, una hora' }, args: [[10], 1], expected: 10 },
    { name: { en: 'single pile, does not divide evenly', es: 'una sola pila, no se divide exactamente' }, args: [[10], 3], expected: 4 },
    { name: { en: 'all piles of size one', es: 'todas las pilas de tamaño uno' }, args: [[1, 1, 1, 1], 4], expected: 1 },
    { name: { en: 'lots of time → speed 1', es: 'mucho tiempo → velocidad 1' }, args: [[2, 3], 100], expected: 1 },
    { name: { en: 'equal piles', es: 'pilas iguales' }, args: [[8, 8, 8], 6], expected: 4 },
    { name: { en: 'large values', es: 'valores grandes' }, args: [[1000000, 999999], 4], expected: 500000 },
  ],
  bench: {
    sizes: [10, 100, 1000, 10_000],
    nLabel: { en: 'number of piles (sizes up to 100,000)', es: 'número de pilas (tamaños de hasta 100,000)' },
    gen: (n) => [randArray(n, 1, 100_000), n + randInt(0, n)],
  },
  demo: {
    inputs: [
      { name: 'piles', value: '[3, 6, 7, 11]' },
      { name: 'h (hours)', value: '8' },
    ],
    validate: (piles, h) =>
      first(
        numsErr(piles, 8, 'piles', 1),
        (piles as number[]).some((p) => !Number.isInteger(p) || p < 1 || p > 20)
          ? { en: 'Each pile must be a whole number from 1 to 20.', es: 'Cada pila debe ser un número entero de 1 a 20.' }
          : null,
        intErr(h, 'h', (piles as number[]).length, 1000),
      ),
    traces: { binary: trace },
  },
};
