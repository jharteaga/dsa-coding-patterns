// Input validation for the "run on my input" animations. Messages are bilingual.
import { tx, type L, type Text } from '../i18n/text';

export const isNums = (a: unknown): a is number[] => Array.isArray(a) && a.every((x) => typeof x === 'number' && Number.isFinite(x));

const both = (name: Text, en: (n: string) => string, es: (n: string) => string): L => ({ en: en(tx(name, 'en')), es: es(tx(name, 'es')) });

export function numsErr(a: unknown, max = 16, name: Text = { en: 'The array', es: 'El arreglo' }, min = 0): L | null {
  if (!isNums(a)) return both(name, (n) => `${n} must be a list of numbers, e.g. [3, 1, 2].`, (n) => `${n} debe ser una lista de números, p. ej. [3, 1, 2].`);
  if (a.length > max)
    return both(name, (n) => `${n} is too long to animate — use at most ${max} items.`, (n) => `${n} es demasiado largo para animarlo: usa como máximo ${max} elementos.`);
  if (a.length < min) return both(name, (n) => `${n} needs at least ${min} item(s).`, (n) => `${n} necesita al menos ${min} elemento(s).`);
  return null;
}
export const intErr = (x: unknown, name: Text, lo = -1e9, hi = 1e9): L | null =>
  typeof x !== 'number' || !Number.isInteger(x) || x < lo || x > hi
    ? both(name, (n) => `${n} must be a whole number between ${lo} and ${hi}.`, (n) => `${n} debe ser un número entero entre ${lo} y ${hi}.`)
    : null;

/** LeetCode-style level-order tree: numbers and nulls */
export function treeErr(a: unknown, max = 15): L | null {
  if (!Array.isArray(a) || !a.every((x) => x === null || (typeof x === 'number' && Number.isFinite(x))))
    return {
      en: 'The tree must be a level-order list of numbers and nulls, e.g. [3, 9, 20, null, null, 15, 7].',
      es: 'El árbol debe ser una lista por niveles de números y nulls, p. ej. [3, 9, 20, null, null, 15, 7].',
    };
  if (a.filter((x) => x !== null).length > max)
    return { en: `The tree is too big to animate — use at most ${max} nodes.`, es: `El árbol es demasiado grande para animarlo: usa como máximo ${max} nodos.` };
  if (a.length && a[0] === null)
    return {
      en: 'The first item is the root, so it cannot be null (use [] for an empty tree).',
      es: 'El primer elemento es la raíz, así que no puede ser null (usa [] para un árbol vacío).',
    };
  return null;
}
export const first = (...errs: (L | null)[]) => errs.find((e) => e) ?? null;
