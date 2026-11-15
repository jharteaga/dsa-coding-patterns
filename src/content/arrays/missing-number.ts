import code from './missing-number.ts?code';
import { numsErr } from '../../lib/check';
import { randInt, shuffle } from '../../lib/ds';
import { Tracer, arr, mark, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region brute
export function missingNumberBrute(nums: number[]): number {
  for (let value = 0; value <= nums.length; value++) {
    if (!nums.includes(value)) return value; // includes() scans the whole array
  }
  return -1;
}
// #endregion

// #region cyclic
export function missingNumber(nums: number[]): number {
  const n = nums.length;
  let i = 0;
  while (i < n) {
    const home = nums[i]; // value v belongs at index v // @look
    if (home < n && nums[home] !== nums[i]) {
      [nums[i], nums[home]] = [nums[home], nums[i]]; // send it home // @swap
    } else {
      i++; // already home (or it is n, which has no slot) // @next
    }
  }
  for (let j = 0; j < n; j++) {
    if (nums[j] !== j) return j; // @scan
  }
  return n; // @all
}
// #endregion

function trace(a: number[]) {
  const t = new Tracer();
  const n = a.length;
  let i = 0;
  let swaps = 0;
  const home = () => Object.fromEntries(a.map((v, k) => [k, v === k ? 'done' : undefined]).filter(([, v]) => v)) as Record<number, 'done'>;
  t.add(undefined, { en: `The values are 0…${n} with one missing, and there are ${n} slots (indices 0…${n - 1}). So **each value has an obvious home: value v belongs at index v**.`, es: `Los valores son 0…${n} con uno faltante, y hay ${n} casillas (índices 0…${n - 1}). Así que **cada valor tiene una casilla obvia: el valor v va en el índice v**.` }, arr(a, { hl: home() }));
  while (i < n) {
    const h = a[i];
    if (h < n && a[h] !== a[i]) {
      t.add('look', { en: `Index ${i} holds ${h}, which belongs at index ${h}.`, es: `El índice ${i} tiene ${h}, que va en el índice ${h}.` }, arr(a, { pointers: { i }, hl: { ...home(), ...mark('active', i), ...mark('compare', h) } }), vars({ swaps }));
      [a[i], a[h]] = [a[h], a[i]];
      swaps++;
      t.add('swap', { en: `Swap it there. ${h} is now home for good. Stay on index ${i} — it just received a new value to deal with.`, es: `Intercámbialo allí. ${h} ya está en su casilla para siempre. Quédate en el índice ${i}: acaba de recibir un valor nuevo que atender.` }, arr(a, { pointers: { i }, hl: { ...home(), ...mark('good', h) } }), vars({ swaps }));
    } else {
      t.add('next', h >= n ? { en: `Index ${i} holds ${h}, which has no slot (the array ends at index ${n - 1}). Leave it and move on.`, es: `El índice ${i} tiene ${h}, que no tiene casilla (el arreglo termina en el índice ${n - 1}). Déjalo y sigue.` } : { en: `Index ${i} already holds ${h}. Move on.`, es: `El índice ${i} ya tiene ${h}. Sigue.` }, arr(a, { pointers: { i }, hl: home() }), vars({ swaps }));
      i++;
    }
  }
  const miss = a.findIndex((v, k) => v !== k);
  t.add(miss === -1 ? 'all' : 'scan', miss === -1 ? { en: `Every index holds its own value, so the missing number is the one without a slot: **${n}**.`, es: `Cada índice tiene su propio valor, así que el número faltante es el que no tiene casilla: **${n}**.` } : { en: `Every value that has a home is in it. Index ${miss} holds the wrong value, so **${miss}** is the missing number. Total swaps: ${swaps} — at most one per value.`, es: `Cada valor que tiene casilla está en ella. El índice ${miss} tiene el valor equivocado, así que **${miss}** es el número faltante. Intercambios en total: ${swaps}, como máximo uno por valor.` }, arr(a, { hl: { ...home(), ...(miss >= 0 ? mark('bad', miss) : {}) } }), vars({ swaps }));
  return t.frames;
}

const genMissing = (n: number) => {
  const all = shuffle(Array.from({ length: n + 1 }, (_, i) => i));
  all.splice(randInt(0, n), 1);
  return [all];
};

export const missingNumberProblem: Problem = {
  id: 'missing-number',
  title: { en: 'Find the missing number', es: 'Missing Number (encontrar el número faltante)' },
  difficulty: 'Easy',
  statement: [
    { en: 'An array of length `n` contains distinct numbers from the range `0…n` — so exactly one number in that range is missing. Return it. Try to use O(1) extra memory.', es: 'Un arreglo de longitud `n` contiene números distintos del rango `0…n`, así que falta exactamente un número de ese rango. Devuélvelo. Intenta usar O(1) de memoria extra.' },
  ],
  examples: [{ input: 'nums = [3, 0, 1]', output: '2', why: { en: 'n = 3, so the range is 0…3. The number 2 is absent.', es: 'n = 3, así que el rango es 0…3. Falta el número 2.' } }],
  insight:
    { en: 'When the values are known to be the numbers 0…n, **the value itself tells you which index it belongs at**. Swap each number directly into its home slot. Every swap puts at least one number home permanently, so there are at most n swaps in total — even though the code looks like a loop that can stall. Afterwards, the first index that does not hold its own value is the answer.', es: 'Cuando se sabe que los valores son los números 0…n, **el propio valor te dice en qué índice le toca estar**. Intercambia cada número directamente a su casilla. Cada intercambio deja al menos un número en su lugar para siempre, así que hay como máximo n intercambios en total, aunque el código parezca un bucle que puede atascarse. Después, el primer índice que no contiene su propio valor es la respuesta.' },
  approaches: [
    { id: 'brute', label: { en: 'Search for each value', es: 'Buscar cada valor' }, kind: 'brute', fn: missingNumberBrute, time: 'O(n²)', space: 'O(1)', note: { en: 'For every candidate value 0…n, scan the array to see whether it is there.', es: 'Para cada valor candidato 0…n, recorre el arreglo para ver si está.' } },
    { id: 'cyclic', label: { en: 'Cyclic sort', es: 'Ordenamiento cíclico' }, kind: 'optimal', fn: missingNumber, time: 'O(n)', space: 'O(1)', note: { en: 'Sorts in place in linear time — possible only because the values are a known, dense range. (This problem also has a one-line maths solution: expected sum minus actual sum. Cyclic sort generalises to "find all missing", "find the duplicate", "first missing positive".)', es: 'Ordena en el lugar en tiempo lineal, algo posible solo porque los valores forman un rango conocido y denso. (Este problema también tiene una solución matemática de una línea: suma esperada menos suma real. El ordenamiento cíclico se generaliza a "encontrar todos los faltantes", "encontrar el duplicado", "primer positivo faltante".)' } },
  ],
  code,
  mutates: true,
  cases: [
    { name: { en: 'missing in the middle', es: 'falta uno del medio' }, args: [[3, 0, 1]], expected: 2 },
    { name: { en: 'missing n (everything in place)', es: 'falta n (todo en su lugar)' }, args: [[0, 1]], expected: 2 },
    { name: { en: 'missing zero', es: 'falta el cero' }, args: [[1, 2, 3]], expected: 0 },
    { name: { en: 'empty array → 0 is missing', es: 'arreglo vacío → falta el 0' }, args: [[]], expected: 0 },
    { name: { en: 'single element 0', es: 'un solo elemento 0' }, args: [[0]], expected: 1 },
    { name: { en: 'single element 1', es: 'un solo elemento 1' }, args: [[1]], expected: 0 },
    { name: { en: 'longer, shuffled', es: 'más largo, desordenado' }, args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
    { name: { en: 'reverse order', es: 'orden inverso' }, args: [[5, 4, 3, 2, 1]], expected: 0 },
    { name: { en: 'already sorted, missing last', es: 'ya ordenado, falta el último' }, args: [[0, 1, 2, 3, 4]], expected: 5 },
  ],
  bench: { sizes: [100, 1000, 10_000, 50_000], nLabel: { en: 'array length', es: 'longitud del arreglo' }, gen: genMissing },
  demo: {
    inputs: [{ name: 'nums (distinct values from 0…n)', value: '[4, 0, 3, 6, 1, 5]' }],
    validate: (nums) => numsErr(nums, 12) ?? (new Set(nums).size !== nums.length || (nums as number[]).some((x) => !Number.isInteger(x) || x < 0 || x > nums.length) ? { en: `Use distinct whole numbers from 0 to ${(nums as number[]).length} (the array length).`, es: `Usa números enteros distintos de 0 a ${(nums as number[]).length} (la longitud del arreglo).` } : null),
    traces: { cyclic: trace },
  },
};
