import code from './lfu.ts?code';
import { drive, randInt } from '../../lib/ds';
import type { Problem } from '../../types';

// #region scan
export class LFUCacheScan {
  capacity: number;
  clock = 0;
  entries: { key: number; value: number; uses: number; lastUsed: number }[] = [];

  constructor(capacity: number) {
    this.capacity = capacity;
  }
  get(key: number): number {
    const entry = this.entries.find((e) => e.key === key); // O(n)
    if (entry === undefined) return -1;
    entry.uses++;
    entry.lastUsed = ++this.clock;
    return entry.value;
  }
  put(key: number, value: number): void {
    if (this.capacity === 0) return;
    const entry = this.entries.find((e) => e.key === key);
    if (entry !== undefined) {
      entry.value = value;
      entry.uses++;
      entry.lastUsed = ++this.clock;
      return;
    }
    if (this.entries.length === this.capacity) {
      // Scan for the fewest uses; break ties by the oldest use.
      let victim = 0;
      for (let i = 1; i < this.entries.length; i++) {
        const [a, b] = [this.entries[i], this.entries[victim]];
        if (a.uses < b.uses || (a.uses === b.uses && a.lastUsed < b.lastUsed)) victim = i;
      }
      this.entries.splice(victim, 1);
    }
    this.entries.push({ key, value, uses: 1, lastUsed: ++this.clock });
  }
}
// #endregion

// #region buckets
export class LFUCache {
  capacity: number;
  values = new Map<number, number>(); // key -> value
  uses = new Map<number, number>(); // key -> how many times it was used
  // use count -> keys with exactly that count, oldest first
  // (a JavaScript Set remembers insertion order)
  buckets = new Map<number, Set<number>>();
  minUses = 0; // the smallest use count present

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  // Move a key from its bucket to the next one up.
  touch(key: number): void {
    const count = this.uses.get(key) as number;
    const bucket = this.buckets.get(count) as Set<number>;
    bucket.delete(key);
    if (bucket.size === 0) {
      this.buckets.delete(count);
      if (this.minUses === count) this.minUses++; // the lowest bucket just emptied
    }
    this.uses.set(key, count + 1);
    if (!this.buckets.has(count + 1)) this.buckets.set(count + 1, new Set());
    (this.buckets.get(count + 1) as Set<number>).add(key);
  }

  get(key: number): number {
    if (!this.values.has(key)) return -1;
    this.touch(key);
    return this.values.get(key) as number;
  }

  put(key: number, value: number): void {
    if (this.capacity === 0) return;
    if (this.values.has(key)) {
      this.values.set(key, value);
      this.touch(key);
      return;
    }
    if (this.values.size === this.capacity) {
      // Evict the oldest key of the least-used bucket.
      const bucket = this.buckets.get(this.minUses) as Set<number>;
      const victim = bucket.values().next().value as number;
      bucket.delete(victim);
      if (bucket.size === 0) this.buckets.delete(this.minUses);
      this.values.delete(victim);
      this.uses.delete(victim);
    }
    this.values.set(key, value);
    this.uses.set(key, 1);
    if (!this.buckets.has(1)) this.buckets.set(1, new Set());
    (this.buckets.get(1) as Set<number>).add(key);
    this.minUses = 1; // a brand-new key always has the fewest uses
  }
}
// #endregion

type Op = [string, number, number?];
const ops = (capacity: number, list: Op[]) => [capacity, list.map((o) => o[0]), list.map((o) => o.slice(1))];

export const lfu: Problem = {
  id: 'lfu',
  title: { en: 'LFU cache', es: 'Caché LFU' },
  difficulty: 'Hard',
  statement: [
    {
      en: 'Same interface as the LRU cache, different eviction rule: when full, evict the **least frequently used** key (fewest `get`/`put` calls). If several keys are tied for fewest uses, evict the least recently used among them. Both operations must be O(1).',
      es: 'La misma interfaz que la caché LRU, otra regla de desalojo: cuando esté llena, desaloja la clave **usada con menos frecuencia** (menos llamadas a `get`/`put`). Si varias claves empatan en menos usos, desaloja la usada menos recientemente entre ellas. Ambas operaciones deben ser O(1).',
    },
  ],
  examples: [
    {
      input: 'capacity 2: put(1, 1), put(2, 2), get(1), put(3, 3), get(2), get(3)',
      output: 'get(2) → -1, get(3) → 3',
      why: { en: 'Key 1 was used twice, key 2 once — so key 2 is evicted for key 3.', es: 'La clave 1 se usó dos veces y la clave 2 una — así que se desaloja la clave 2 para dar lugar a la 3.' },
    },
  ],
  insight: {
    en: 'A use count only ever goes up **by exactly one**. So group keys into buckets by use count: using a key moves it from bucket f to bucket f + 1 — a constant-time move. Inside a bucket keep keys in order of use, so the tie-break victim is at the front. The last piece is knowing which bucket is the lowest: track `minUses`. It rises by one when the lowest bucket empties, and resets to 1 whenever a new key is inserted.',
    es: 'Un conteo de usos solo sube **exactamente de uno en uno**. Así que agrupa las claves en cubetas por conteo de usos: usar una clave la mueve de la cubeta f a la cubeta f + 1 — un movimiento en tiempo constante. Dentro de una cubeta mantén las claves en orden de uso, para que la víctima del desempate quede al frente. La última pieza es saber cuál es la cubeta más baja: lleva `minUses`. Sube en uno cuando la cubeta más baja se vacía y vuelve a 1 cada vez que se inserta una clave nueva.',
  },
  approaches: [
    { id: 'scan', label: { en: 'Array, scan for the victim', es: 'Arreglo, recorrerlo buscando la víctima' }, kind: 'brute', fn: (c: number, o: string[], v: number[][]) => drive(new LFUCacheScan(c), o, v), time: 'O(n) per operation', space: 'O(n)', note: { en: 'Every lookup searches the array; every eviction compares all entries.', es: 'Cada búsqueda recorre el arreglo; cada desalojo compara todas las entradas.' },
    },
    { id: 'buckets', label: { en: 'Hash maps + frequency buckets', es: 'Mapas hash + cubetas de frecuencia' }, kind: 'optimal', fn: (c: number, o: string[], v: number[][]) => drive(new LFUCache(c), o, v), time: 'O(1) per operation', space: 'O(n)', note: {
        en: 'Three maps: key → value, key → use count, use count → ordered keys. It is the LRU idea applied once per frequency level.',
        es: 'Tres mapas: clave → valor, clave → conteo de usos, conteo de usos → claves ordenadas. Es la idea de LRU aplicada una vez por cada nivel de frecuencia.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'classic sequence', es: 'secuencia clásica' }, args: ops(2, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['get', 3], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]]), expected: [null, null, 1, null, -1, 3, null, -1, 3, 4] },
    { name: { en: 'capacity zero stores nothing', es: 'capacidad cero no guarda nada' }, args: ops(0, [['put', 1, 1], ['get', 1]]), expected: [null, -1] },
    { name: { en: 'get on an empty cache', es: 'get en una caché vacía' }, args: ops(2, [['get', 1]]), expected: [-1] },
    { name: { en: 'tie broken by least recent use', es: 'empate resuelto por el uso menos reciente' }, args: ops(2, [['put', 1, 1], ['put', 2, 2], ['put', 3, 3], ['get', 1], ['get', 2], ['get', 3]]), expected: [null, null, null, -1, 2, 3] },
    { name: { en: 'put on an existing key counts as a use', es: 'put sobre una clave existente cuenta como uso' }, args: ops(2, [['put', 1, 1], ['put', 2, 2], ['put', 1, 9], ['put', 3, 3], ['get', 1], ['get', 2]]), expected: [null, null, null, null, 9, -1] },
    { name: { en: 'capacity 1', es: 'capacidad 1' }, args: ops(1, [['put', 1, 1], ['get', 1], ['get', 1], ['put', 2, 2], ['get', 1], ['get', 2]]), expected: [null, 1, 1, null, -1, 2] },
    { name: { en: 'a heavily used key survives many inserts', es: 'una clave muy usada sobrevive a muchas inserciones' }, args: ops(2, [['put', 1, 1], ['get', 1], ['get', 1], ['put', 2, 2], ['put', 3, 3], ['put', 4, 4], ['get', 1], ['get', 4]]), expected: [null, 1, 1, null, null, null, 1, 4] },
    { name: { en: 'no operations', es: 'sin operaciones' }, args: [2, [], []], expected: [] },
  ],
  bench: {
    sizes: [100, 1000, 5000, 20_000],
    nLabel: { en: 'capacity (4 × that many random gets and puts)', es: 'capacidad (4 × esa cantidad de gets y puts aleatorios)' },
    gen: (n) => ops(n, Array.from({ length: 4 * n }, (): Op => (Math.random() < 0.5 ? ['get', randInt(0, 2 * n)] : ['put', randInt(0, 2 * n), randInt(0, 99)]))),
  },
};
