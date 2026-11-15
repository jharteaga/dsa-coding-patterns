import code from './find-range.ts?code';
import { first, intErr, numsErr } from '../../lib/check';
import { randInt, sortedArray } from '../../lib/ds';
import { Tracer, arr, mark, span, vars } from '../../lib/trace';
import type { L } from '../../i18n/text';
import type { Problem } from '../../types';

// #region linear
export function findRangeLinear(nums: number[], target: number): number[] {
  let first = -1;
  let last = -1;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) {
      if (first === -1) first = i; // @first
      last = i; // @last
    }
  }
  return [first, last]; // @done
}
// #endregion

// #region binary
export function findRange(nums: number[], target: number): number[] {
  // Index of the first element >= x (nums.length if there is none).
  const lowerBound = (x: number): number => {
    let lo = 0;
    let hi = nums.length; // @init
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2); // @mid
      if (nums[mid] < x) lo = mid + 1; // @right
      else hi = mid; // @left
    }
    return lo; // @bound
  };

  const first = lowerBound(target);
  if (first === nums.length || nums[first] !== target) return [-1, -1]; // @miss
  const last = lowerBound(target + 1) - 1; // @last
  return [first, last]; // @done
}
// #endregion

function traceLinear(nums: number[], target: number) {
  const t = new Tracer();
  let f = -1;
  let l = -1;
  for (let i = 0; i < nums.length; i++) {
    const hit = nums[i] === target;
    if (hit) {
      if (f === -1) f = i;
      l = i;
    }
    t.add(
      hit ? 'last' : undefined,
      hit
        ? {
            en: `nums[${i}] is ${target}: remember it as the last position seen so far${f === i ? ' (and the first)' : ''}.`,
            es: `nums[${i}] es ${target}: guárdalo como la última posición vista hasta ahora${f === i ? ' (y la primera)' : ''}.`,
          }
        : {
            en: `nums[${i}] = ${nums[i]} is not ${target}. Keep going — we cannot stop early without using the sort order.`,
            es: `nums[${i}] = ${nums[i]} no es ${target}. Sigue avanzando: no podemos parar antes sin aprovechar el orden.`,
          },
      arr(nums, { pointers: { i }, hl: { ...(f >= 0 ? span('good', f, l) : {}), ...(hit ? {} : mark('active', i)) } }),
      vars({ first: f, last: l }),
    );
  }
  t.add(
    'done',
    { en: `Scanned all ${nums.length} elements. Answer: **[${f}, ${l}]**.`, es: `Recorrimos los ${nums.length} elementos. Respuesta: **[${f}, ${l}]**.` },
    arr(nums, { hl: f >= 0 ? span('good', f, l) : {} }),
    vars({ first: f, last: l }),
  );
  return t.frames;
}

function traceBinary(nums: number[], target: number) {
  const t = new Tracer();
  const bound = (x: number, what: L) => {
    let lo = 0;
    let hi = nums.length;
    t.add(
      'init',
      {
        en: `Find the first index whose value is **≥ ${x}** (${what.en}). It lies somewhere in [${lo}, ${hi}].`,
        es: `Encuentra el primer índice cuyo valor sea **≥ ${x}** (${what.es}). Está en algún lugar de [${lo}, ${hi}].`,
      },
      arr(nums, { pointers: { lo, hi }, hl: span('window', lo, hi - 1) }),
    );
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      const goRight = nums[mid] < x;
      t.add(
        'mid',
        { en: `mid = ${mid}, nums[mid] = ${nums[mid]}. Is it ≥ ${x}? ${goRight ? 'No' : 'Yes'}.`, es: `mid = ${mid}, nums[mid] = ${nums[mid]}. ¿Es ≥ ${x}? ${goRight ? 'No' : 'Sí'}.` },
        arr(nums, { pointers: { lo, mid, hi }, hl: { ...span('window', lo, hi - 1), ...mark('active', mid) } }),
      );
      if (goRight) {
        lo = mid + 1;
        t.add(
          'right',
          { en: `Too small, so the boundary is to the right of mid: lo = ${lo}.`, es: `Demasiado pequeño, así que la frontera está a la derecha de mid: lo = ${lo}.` },
          arr(nums, { pointers: { lo, hi }, hl: span('window', lo, hi - 1) }),
        );
      } else {
        hi = mid;
        t.add(
          'left',
          {
            en: `nums[mid] is ≥ ${x}, so mid *could* be the boundary — keep it and drop everything after it: hi = ${hi}.`,
            es: `nums[mid] es ≥ ${x}, así que mid *podría* ser la frontera: consérvalo y descarta todo lo que está después: hi = ${hi}.`,
          },
          arr(nums, { pointers: { lo, hi }, hl: span('window', lo, hi - 1) }),
        );
      }
    }
    t.add(
      'bound',
      { en: `lo met hi at index ${lo}: that is the first index with a value ≥ ${x}.`, es: `lo alcanzó a hi en el índice ${lo}: ese es el primer índice con un valor ≥ ${x}.` },
      arr(nums, { pointers: { lo }, hl: mark('compare', lo) }),
    );
    return lo;
  };
  const f = bound(target, { en: 'the first position of the target', es: 'la primera posición del objetivo' });
  if (f === nums.length || nums[f] !== target) {
    t.add(
      'miss',
      {
        en: `The value there is not ${target}, so the target is not in the array. Answer: **[-1, -1]**.`,
        es: `El valor ahí no es ${target}, así que el objetivo no está en el arreglo. Respuesta: **[-1, -1]**.`,
      },
      arr(nums, {}),
    );
    return t.frames;
  }
  const l = bound(target + 1, { en: 'one past the last position of the target', es: 'una después de la última posición del objetivo' }) - 1;
  t.add(
    'last',
    { en: `The last ${target} sits just before that boundary: index ${l}.`, es: `El último ${target} está justo antes de esa frontera: índice ${l}.` },
    arr(nums, { hl: span('good', f, l) }),
    vars({ first: f, last: l }),
  );
  t.add(
    'done',
    {
      en: `Answer: **[${f}, ${l}]** — found with two binary searches instead of a full scan.`,
      es: `Respuesta: **[${f}, ${l}]**, encontrada con dos búsquedas binarias en lugar de un recorrido completo.`,
    },
    arr(nums, { hl: span('good', f, l) }),
  );
  return t.frames;
}

export const findRangeProblem: Problem = {
  id: 'find-range',
  title: { en: 'First and last position of a value', es: 'Primera y última posición de un valor' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'Given an array `nums` sorted in ascending order (duplicates allowed) and a `target`, return `[first, last]`: the first and last index where `target` appears. Return `[-1, -1]` if it does not appear.',
      es: 'Dado un arreglo `nums` ordenado de forma ascendente (se permiten duplicados) y un `target`, devuelve `[first, last]`: el primer y el último índice donde aparece `target`. Devuelve `[-1, -1]` si no aparece.',
    },
  ],
  examples: [
    { input: 'nums = [5, 7, 7, 8, 8, 8, 10], target = 8', output: '[3, 5]' },
    { input: 'nums = [5, 7, 7, 8, 8, 10], target = 6', output: '[-1, -1]' },
  ],
  insight: {
    en: 'Binary search does not have to stop at an exact match. Ask a yes/no question that is **false for a prefix and true for the rest** of the array — here “is `nums[i] ≥ target`?” — and binary search finds the exact index where the answer flips. That boundary is the first occurrence. The last occurrence is one step before the boundary for `target + 1`.',
    es: 'La búsqueda binaria no tiene que detenerse en una coincidencia exacta. Haz una pregunta de sí/no que sea **falsa para un prefijo y verdadera para el resto** del arreglo (aquí, “¿es `nums[i] ≥ target`?”) y la búsqueda binaria encuentra el índice exacto donde cambia la respuesta. Esa frontera es la primera aparición. La última aparición está un paso antes de la frontera para `target + 1`.',
  },
  approaches: [
    {
      id: 'linear',
      label: { en: 'Scan everything', es: 'Recorrer todo' },
      kind: 'brute',
      fn: findRangeLinear,
      time: 'O(n)',
      space: 'O(1)',
      note: {
        en: 'Walk the whole array, remembering the first and the latest index where the target was seen.',
        es: 'Recorre todo el arreglo, recordando el primer y el último índice donde se vio el objetivo.',
      },
    },
    {
      id: 'binary',
      label: { en: 'Two boundary searches', es: 'Dos búsquedas de frontera' },
      kind: 'optimal',
      fn: findRange,
      time: 'O(log n)',
      space: 'O(1)',
      note: {
        en: '`lowerBound(x)` returns the first index whose value is ≥ x. Note the differences from the classic template: `hi` starts at `n` (the boundary may be past the end), the loop is `lo < hi`, and on a "yes" we keep mid with `hi = mid` instead of discarding it.',
        es: '`lowerBound(x)` devuelve el primer índice cuyo valor es ≥ x. Fíjate en las diferencias con la plantilla clásica: `hi` empieza en `n` (la frontera puede estar después del final), el ciclo es `lo < hi` y, ante un "sí", conservamos mid con `hi = mid` en lugar de descartarlo.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'several copies in the middle', es: 'varias copias en el medio' }, args: [[5, 7, 7, 8, 8, 8, 10], 8], expected: [3, 5] },
    { name: { en: 'target missing', es: 'objetivo ausente' }, args: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
    { name: { en: 'empty array', es: 'arreglo vacío' }, args: [[], 0], expected: [-1, -1] },
    { name: { en: 'single element, found', es: 'un solo elemento, encontrado' }, args: [[1], 1], expected: [0, 0] },
    { name: { en: 'single element, missing', es: 'un solo elemento, ausente' }, args: [[1], 2], expected: [-1, -1] },
    { name: { en: 'every element is the target', es: 'todos los elementos son el objetivo' }, args: [[2, 2, 2, 2], 2], expected: [0, 3] },
    { name: { en: 'target only at the start', es: 'objetivo solo al inicio' }, args: [[1, 1, 2, 3], 1], expected: [0, 1] },
    { name: { en: 'target only at the end', es: 'objetivo solo al final' }, args: [[1, 2, 3, 3], 3], expected: [2, 3] },
    { name: { en: 'larger than everything', es: 'mayor que todos' }, args: [[1, 2, 3], 9], expected: [-1, -1] },
    { name: { en: 'smaller than everything', es: 'menor que todos' }, args: [[1, 2, 3], -9], expected: [-1, -1] },
    { name: { en: 'exactly one copy', es: 'exactamente una copia' }, args: [[-3, -1, 0, 4], 0], expected: [2, 2] },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000, 1_000_000],
    nLabel: { en: 'array length', es: 'longitud del arreglo' },
    gen: (n) => {
      const nums = sortedArray(n, 0, Math.max(1, n >> 3));
      return [nums, nums[randInt(0, n - 1)]];
    },
  },
  demo: {
    inputs: [
      { name: 'nums (sorted, duplicates allowed)', value: '[1, 2, 4, 4, 4, 4, 6, 7, 9, 9, 12]' },
      { name: 'target', value: '4' },
    ],
    validate: (nums, target) =>
      first(
        numsErr(nums, 16),
        intErr(target, 'target'),
        (nums as number[]).some((x, i) => i > 0 && nums[i - 1] > x)
          ? { en: 'nums must be sorted in ascending order.', es: 'nums debe estar ordenado de forma ascendente.' }
          : null,
      ),
    traces: { linear: traceLinear, binary: traceBinary },
  },
};
