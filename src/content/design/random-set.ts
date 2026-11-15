import code from './random-set.ts?code';
import { randInt } from '../../lib/ds';
import type { Problem } from '../../types';

// #region array
export class RandomizedSetArray {
  items: number[] = [];

  insert(value: number): boolean {
    if (this.items.includes(value)) return false; // O(n) search
    this.items.push(value);
    return true;
  }
  remove(value: number): boolean {
    const i = this.items.indexOf(value); // O(n) search
    if (i === -1) return false;
    this.items.splice(i, 1); // O(n): closes the gap by shifting
    return true;
  }
  getRandom(): number {
    return this.items[Math.floor(Math.random() * this.items.length)];
  }
}
// #endregion

// #region mapped
export class RandomizedSet {
  items: number[] = []; // the values, packed with no gaps -> random access by index
  indexOf = new Map<number, number>(); // value -> where it sits in `items`

  insert(value: number): boolean {
    if (this.indexOf.has(value)) return false;
    this.indexOf.set(value, this.items.length);
    this.items.push(value);
    return true;
  }
  remove(value: number): boolean {
    const i = this.indexOf.get(value);
    if (i === undefined) return false;
    // Overwrite the removed slot with the LAST item, then drop the last slot.
    // Nothing shifts, so this is O(1).
    const last = this.items[this.items.length - 1];
    this.items[i] = last;
    this.indexOf.set(last, i);
    this.items.pop();
    this.indexOf.delete(value);
    return true;
  }
  getRandom(): number {
    return this.items[Math.floor(Math.random() * this.items.length)];
  }
}
// #endregion

type SetLike = { insert(v: number): boolean; remove(v: number): boolean; getRandom(): number };
/** getRandom is random, so tests check that it returns a value that is currently in the set. */
function run(set: SetLike, opNames: string[], vals: number[][]) {
  const mirror = new Set<number>();
  return opNames.map((op, i) => {
    if (op === 'getRandom') return mirror.has(set.getRandom());
    const result = op === 'insert' ? set.insert(vals[i][0]) : set.remove(vals[i][0]);
    if (op === 'insert') mirror.add(vals[i][0]);
    else mirror.delete(vals[i][0]);
    return result;
  });
}

type Op = [string, number?];
const ops = (list: Op[]) => [list.map((o) => o[0]), list.map((o) => o.slice(1))];

export const randomSet: Problem = {
  id: 'random-set',
  title: { en: 'Insert, delete and get random — all O(1)', es: 'Insertar, borrar y obtener uno al azar — todo O(1)' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'Design a set with `insert(value)` (false if already present), `remove(value)` (false if absent) and `getRandom()` (a uniformly random element). Every operation must be O(1) on average.',
      es: 'Diseña un conjunto con `insert(value)` (false si ya está), `remove(value)` (false si no está) y `getRandom()` (un elemento aleatorio uniforme). Cada operación debe ser O(1) en promedio.',
    },
    {
      en: 'In the tests, `getRandom` shows `true` when it returned a value that is currently in the set.',
      es: 'En las pruebas, `getRandom` muestra `true` cuando devolvió un valor que está actualmente en el conjunto.',
    },
  ],
  examples: [{ input: 'insert(1), remove(2), insert(2), getRandom(), remove(1), insert(2), getRandom()', output: 'true, false, true, (1 or 2), true, false, 2' }],
  insight: {
    en: 'Each structure is missing one ability. A hash set inserts and removes in O(1) but cannot pick a random element (there are no indices). An array picks randomly in O(1) but removing from the middle shifts everything. The fix for the array: **order does not matter in a set**, so fill the hole with the last element and pop the end. A hash map from value → index tells you where the hole is and keeps track of the element that moved.',
    es: 'A cada estructura le falta una capacidad. Un conjunto hash inserta y borra en O(1) pero no puede elegir un elemento al azar (no hay índices). Un arreglo elige al azar en O(1) pero quitar del medio desplaza todo. La solución para el arreglo: **el orden no importa en un conjunto**, así que rellena el hueco con el último elemento y quita el final. Un mapa hash de valor → índice te dice dónde está el hueco y lleva la cuenta del elemento que se movió.',
  },
  approaches: [
    { id: 'array', label: { en: 'Plain array', es: 'Arreglo simple' }, kind: 'brute', fn: (o: string[], v: number[][]) => run(new RandomizedSetArray(), o, v), time: 'insert/remove O(n)', space: 'O(n)', note: {
        en: 'Duplicate check and removal both scan the array; removal also shifts the tail.',
        es: 'Tanto la comprobación de duplicados como el borrado recorren el arreglo; el borrado además desplaza la cola.',
      },
    },
    { id: 'mapped', label: { en: 'Array + index map, swap-with-last removal', es: 'Arreglo + mapa de índices, borrado intercambiando con el último' }, kind: 'optimal', fn: (o: string[], v: number[][]) => run(new RandomizedSet(), o, v), time: 'all O(1)', space: 'O(n)', note: {
        en: 'The array provides random access, the map provides lookup, and "swap with last, then pop" keeps the array gap-free without shifting.',
        es: 'El arreglo aporta el acceso aleatorio, el mapa aporta la búsqueda, y "intercambiar con el último y luego quitar" mantiene el arreglo sin huecos y sin desplazamientos.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'classic sequence', es: 'secuencia clásica' }, args: ops([['insert', 1], ['remove', 2], ['insert', 2], ['getRandom'], ['remove', 1], ['insert', 2], ['getRandom']]), expected: [true, false, true, true, true, false, true] },
    { name: { en: 'no operations', es: 'sin operaciones' }, args: [[], []], expected: [] },
    { name: { en: 'insert a duplicate', es: 'insertar un duplicado' }, args: ops([['insert', 5], ['insert', 5]]), expected: [true, false] },
    { name: { en: 'remove something absent', es: 'borrar algo que no está' }, args: ops([['remove', 5]]), expected: [false] },
    { name: { en: 'remove the last element inserted', es: 'borrar el último elemento insertado' }, args: ops([['insert', 1], ['insert', 2], ['remove', 2], ['getRandom'], ['remove', 2]]), expected: [true, true, true, true, false] },
    { name: { en: 'remove from the middle, then re-insert', es: 'borrar del medio y luego reinsertar' }, args: ops([['insert', 1], ['insert', 2], ['insert', 3], ['remove', 2], ['insert', 2], ['remove', 3], ['remove', 1], ['getRandom']]), expected: [true, true, true, true, true, true, true, true] },
    { name: { en: 'remove the only element and reuse', es: 'borrar el único elemento y reutilizarlo' }, args: ops([['insert', 9], ['remove', 9], ['insert', 9], ['getRandom']]), expected: [true, true, true, true] },
    { name: { en: 'negative values and zero', es: 'valores negativos y cero' }, args: ops([['insert', 0], ['insert', -1], ['remove', 0], ['getRandom'], ['remove', -1]]), expected: [true, true, true, true, true] },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 30_000],
    nLabel: { en: 'inserts, followed by the same number of removes', es: 'inserciones, seguidas del mismo número de borrados' },
    gen: (n) => ops([...Array.from({ length: n }, (_, i): Op => ['insert', n < 20 ? randInt(0, 5) : i]), ...Array.from({ length: n }, (_, i): Op => ['remove', n < 20 ? randInt(0, 5) : i])]),
  },
};
