import code from './rotated-search.ts?code';
import { first, intErr, numsErr } from '../../lib/check';
import { distinctSorted, randInt } from '../../lib/ds';
import { Tracer, arr, mark, span } from '../../lib/trace';
import type { Problem } from '../../types';

// #region linear
export function searchRotatedLinear(nums: number[], target: number): number {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}
// #endregion

// #region binary
export function searchRotated(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1; // @init
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // @mid
    if (nums[mid] === target) return mid; // @found

    if (nums[lo] <= nums[mid]) {
      // Left half [lo..mid] is sorted. // @left-sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; // @go-left
      else lo = mid + 1; // @go-right
    } else {
      // Otherwise the right half [mid..hi] must be sorted. // @right-sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; // @go-right2
      else hi = mid - 1; // @go-left2
    }
  }
  return -1; // @miss
}
// #endregion

function trace(nums: number[], target: number) {
  const t = new Tracer();
  let lo = 0;
  let hi = nums.length - 1;
  const base = () => ({ ...span('muted', 0, lo - 1), ...span('muted', hi + 1, nums.length - 1) });
  t.add(
    'init',
    {
      en: `The array was sorted, then rotated. We look for ${target} in [${lo}, ${hi}].`,
      es: `El arreglo estaba ordenado y luego se rotó. Buscamos ${target} en [${lo}, ${hi}].`,
    },
    arr(nums, { pointers: { lo, hi }, hl: span('window', lo, hi) }),
  );
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    t.add(
      'mid',
      { en: `mid = ${mid}, nums[mid] = ${nums[mid]}.`, es: `mid = ${mid}, nums[mid] = ${nums[mid]}.` },
      arr(nums, { pointers: { lo, mid, hi }, hl: { ...base(), ...span('window', lo, hi), ...mark('active', mid) } }),
    );
    if (nums[mid] === target) {
      t.add(
        'found',
        { en: `That is the target. Found at index **${mid}**.`, es: `Ese es el objetivo. Lo encontramos en el índice **${mid}**.` },
        arr(nums, { pointers: { mid }, hl: { ...base(), ...mark('good', mid) } }),
      );
      return t.frames;
    }
    if (nums[lo] <= nums[mid]) {
      const inside = nums[lo] <= target && target < nums[mid];
      t.add(
        'left-sorted',
        {
          en: `nums[lo] = ${nums[lo]} ≤ nums[mid] = ${nums[mid]}, so the **left half is properly sorted** (no rotation point inside it). A sorted half is easy to reason about: it holds exactly the values from ${nums[lo]} to ${nums[mid]}.`,
          es: `nums[lo] = ${nums[lo]} ≤ nums[mid] = ${nums[mid]}, así que la **mitad izquierda está bien ordenada** (no contiene el punto de rotación). Es fácil razonar sobre una mitad ordenada: contiene exactamente los valores de ${nums[lo]} a ${nums[mid]}.`,
        },
        arr(nums, { pointers: { lo, mid, hi }, hl: { ...base(), ...span('compare', lo, mid) } }),
      );
      if (inside) {
        hi = mid - 1;
        t.add(
          'go-left',
          {
            en: `${target} is inside that range, so it must be in the left half. Drop the right half.`,
            es: `${target} está dentro de ese rango, así que debe estar en la mitad izquierda. Descarta la mitad derecha.`,
          },
          arr(nums, { pointers: { lo, hi }, hl: { ...base(), ...span('window', lo, hi) } }),
        );
      } else {
        lo = mid + 1;
        t.add(
          'go-right',
          {
            en: `${target} is not inside that range, so it can only be in the right half. Drop the left half.`,
            es: `${target} no está dentro de ese rango, así que solo puede estar en la mitad derecha. Descarta la mitad izquierda.`,
          },
          arr(nums, { pointers: { lo, hi }, hl: { ...base(), ...span('window', lo, hi) } }),
        );
      }
    } else {
      const inside = nums[mid] < target && target <= nums[hi];
      t.add(
        'right-sorted',
        {
          en: `nums[lo] = ${nums[lo]} > nums[mid] = ${nums[mid]}: the rotation point is in the left half, so the **right half is properly sorted** and holds exactly the values from ${nums[mid]} to ${nums[hi]}.`,
          es: `nums[lo] = ${nums[lo]} > nums[mid] = ${nums[mid]}: el punto de rotación está en la mitad izquierda, así que la **mitad derecha está bien ordenada** y contiene exactamente los valores de ${nums[mid]} a ${nums[hi]}.`,
        },
        arr(nums, { pointers: { lo, mid, hi }, hl: { ...base(), ...span('compare', mid, hi) } }),
      );
      if (inside) {
        lo = mid + 1;
        t.add(
          'go-right2',
          {
            en: `${target} is inside that range, so it must be in the right half. Drop the left half.`,
            es: `${target} está dentro de ese rango, así que debe estar en la mitad derecha. Descarta la mitad izquierda.`,
          },
          arr(nums, { pointers: { lo, hi }, hl: { ...base(), ...span('window', lo, hi) } }),
        );
      } else {
        hi = mid - 1;
        t.add(
          'go-left2',
          {
            en: `${target} is not inside that range, so it can only be in the left half. Drop the right half.`,
            es: `${target} no está dentro de ese rango, así que solo puede estar en la mitad izquierda. Descarta la mitad derecha.`,
          },
          arr(nums, { pointers: { lo, hi }, hl: { ...base(), ...span('window', lo, hi) } }),
        );
      }
    }
  }
  t.add(
    'miss',
    {
      en: `The search space is empty: ${target} is not in the array. Return **-1**.`,
      es: `El espacio de búsqueda está vacío: ${target} no está en el arreglo. Devuelve **-1**.`,
    },
    arr(nums, { hl: span('muted', 0, nums.length - 1) }),
  );
  return t.frames;
}

const rotate = (a: number[], k: number) => [...a.slice(k), ...a.slice(0, k)];

export const rotatedSearch: Problem = {
  id: 'rotated-search',
  title: { en: 'Search in a rotated sorted array', es: 'Búsqueda en un arreglo ordenado y rotado' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'A sorted array of **distinct** integers was rotated at an unknown pivot: `[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`. Given the rotated array and a `target`, return its index or `-1`. Aim for O(log n).',
      es: 'Un arreglo ordenado de enteros **distintos** se rotó en un pivote desconocido: `[0,1,2,4,5,6,7]` podría convertirse en `[4,5,6,7,0,1,2]`. Dado el arreglo rotado y un `target`, devuelve su índice o `-1`. Apunta a O(log n).',
    },
  ],
  examples: [
    { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0', output: '4' },
    { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 3', output: '-1' },
  ],
  insight: {
    en: 'The whole array is no longer sorted, but cut it at `mid` and **at least one of the two halves always is**. You can tell which by comparing `nums[lo]` with `nums[mid]`. For the sorted half you know its exact value range, so one check tells you whether the target is inside it — and if not, it must be in the other half. Either way you still discard half each step.',
    es: 'El arreglo completo ya no está ordenado, pero si lo cortas en `mid`, **al menos una de las dos mitades siempre lo está**. Puedes saber cuál comparando `nums[lo]` con `nums[mid]`. De la mitad ordenada conoces su rango exacto de valores, así que una sola comprobación te dice si el objetivo está dentro; si no, debe estar en la otra mitad. En cualquier caso, sigues descartando la mitad en cada paso.',
  },
  approaches: [
    {
      id: 'linear',
      label: { en: 'Linear search', es: 'Búsqueda lineal' },
      kind: 'brute',
      fn: searchRotatedLinear,
      time: 'O(n)',
      space: 'O(1)',
      note: { en: 'Ignore the structure completely and check every element.', es: 'Ignora por completo la estructura y revisa cada elemento.' },
    },
    {
      id: 'binary',
      label: { en: 'Binary search on the sorted half', es: 'Búsqueda binaria en la mitad ordenada' },
      kind: 'optimal',
      fn: searchRotated,
      time: 'O(log n)',
      space: 'O(1)',
      note: {
        en: 'At every step: find the sorted half, check whether the target falls inside its range, and keep only the half that can contain it.',
        es: 'En cada paso: encuentra la mitad ordenada, comprueba si el objetivo cae dentro de su rango y conserva solo la mitad que puede contenerlo.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'target in the rotated part', es: 'objetivo en la parte rotada' }, args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
    { name: { en: 'target missing', es: 'objetivo ausente' }, args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
    { name: { en: 'empty array', es: 'arreglo vacío' }, args: [[], 5], expected: -1 },
    { name: { en: 'single element, missing', es: 'un solo elemento, ausente' }, args: [[1], 0], expected: -1 },
    { name: { en: 'single element, found', es: 'un solo elemento, encontrado' }, args: [[1], 1], expected: 0 },
    { name: { en: 'not rotated at all', es: 'sin ninguna rotación' }, args: [[1, 2, 3, 4, 5], 4], expected: 3 },
    { name: { en: 'two elements, rotated', es: 'dos elementos, rotado' }, args: [[3, 1], 1], expected: 1 },
    { name: { en: 'rotated by one', es: 'rotado una posición' }, args: [[5, 1, 2, 3, 4], 5], expected: 0 },
    { name: { en: 'target is the last element', es: 'el objetivo es el último elemento' }, args: [[6, 7, 1, 2, 3, 4, 5], 5], expected: 6 },
    { name: { en: 'target is the smallest (the pivot)', es: 'el objetivo es el menor (el pivote)' }, args: [[6, 7, 8, 1, 2], 1], expected: 3 },
    { name: { en: 'negative numbers', es: 'números negativos' }, args: [[-2, -1, -9, -7, -4], -9], expected: 2 },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000, 1_000_000],
    nLabel: { en: 'array length', es: 'longitud del arreglo' },
    gen: (n) => {
      const nums = rotate(distinctSorted(n), randInt(0, n - 1));
      return [nums, Math.random() < 0.5 ? 1e9 : nums[randInt(0, n - 1)]];
    },
  },
  demo: {
    inputs: [
      { name: 'nums (sorted, then rotated)', value: '[12, 15, 18, 21, 25, 1, 3, 4, 6, 8, 9]' },
      { name: 'target', value: '4' },
    ],
    validate: (nums, target) =>
      first(
        numsErr(nums, 16),
        intErr(target, 'target'),
        new Set(nums).size !== nums.length ? { en: 'Values must be distinct.', es: 'Los valores deben ser distintos.' } : null,
        (nums as number[]).filter((x, i) => x > nums[(i + 1) % nums.length]).length > 1
          ? { en: 'nums must be a sorted array that was rotated (at most one “drop”).', es: 'nums debe ser un arreglo ordenado que se rotó (como máximo una “caída”).' }
          : null,
      ),
    traces: { binary: trace },
  },
};
