import code from './lru.ts?code';
import { drive, randInt } from '../../lib/ds';
import { Tracer, arr, mark, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';

// #region scan
export class LRUCacheScan {
  capacity: number;
  entries: number[][] = []; // [key, value] pairs, least recently used first

  constructor(capacity: number) {
    this.capacity = capacity;
  }
  get(key: number): number {
    const i = this.entries.findIndex((e) => e[0] === key); // O(n) search
    if (i === -1) return -1;
    const [entry] = this.entries.splice(i, 1); // O(n) removal
    this.entries.push(entry); // most recently used goes to the end
    return entry[1];
  }
  put(key: number, value: number): void {
    const i = this.entries.findIndex((e) => e[0] === key);
    if (i !== -1) this.entries.splice(i, 1);
    else if (this.entries.length === this.capacity) this.entries.shift(); // evict the oldest: O(n)
    this.entries.push([key, value]);
  }
}
// #endregion

// #region dll
class Node {
  key: number;
  value: number;
  prev: Node | null = null;
  next: Node | null = null;
  constructor(key: number, value: number) {
    this.key = key;
    this.value = value;
  }
}

export class LRUCache {
  capacity: number;
  map = new Map<number, Node>(); // key -> its node in the list: O(1) lookup
  // Doubly linked list in order of use. Two dummy ends mean no null checks.
  head = new Node(0, 0); // head.next = most recently used
  tail = new Node(0, 0); // tail.prev = least recently used

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // Unhook a node from wherever it is: O(1) because it knows both neighbours.
  unlink(node: Node): void {
    (node.prev as Node).next = node.next;
    (node.next as Node).prev = node.prev;
  }
  // Insert a node right after the head (the "most recent" position): O(1).
  addToFront(node: Node): void {
    node.next = this.head.next;
    node.prev = this.head;
    (this.head.next as Node).prev = node;
    this.head.next = node;
  }

  get(key: number): number {
    const node = this.map.get(key);
    if (node === undefined) return -1; // @miss
    this.unlink(node); // using it makes it the most recent // @touch
    this.addToFront(node);
    return node.value;
  }

  put(key: number, value: number): void {
    const existing = this.map.get(key);
    if (existing !== undefined) {
      existing.value = value; // @update
      this.unlink(existing);
      this.addToFront(existing);
      return;
    }
    if (this.map.size === this.capacity) {
      const oldest = this.tail.prev as Node; // least recently used // @evict
      this.unlink(oldest);
      this.map.delete(oldest.key);
    }
    const node = new Node(key, value); // @insert
    this.map.set(key, node);
    this.addToFront(node);
  }
}
// #endregion

type Op = [string, number, number?];

function trace(capacity: number, opsList: Op[]) {
  const t = new Tracer();
  let order: number[][] = []; // most recent first
  const out: unknown[] = [];
  const views = (hl: Record<number, Tone> = {}) => [
    arr(
      order.map(([k, v]) => `${k}:${v}`),
      {
        label: { en: `linked list, most recently used first (capacity ${capacity})`, es: `lista enlazada, la usada más recientemente primero (capacidad ${capacity})` },
        hl, pointers: order.length ? { MRU: 0, ...(order.length > 1 ? { LRU: order.length - 1 } : {}) } : {},
      },
    ),
    vars(
      Object.fromEntries(order.map(([k]) => [`key ${k}`, { en: '→ its node', es: '→ su nodo' }])),
      { en: 'hash map (key → node in the list)', es: 'mapa hash (clave → nodo en la lista)' },
    ),
    vars({ results: out }),
  ];
  t.add(
    undefined,
    {
      en: 'Two structures working together: a **hash map** finds a key’s node instantly; a **doubly linked list** keeps the nodes in order of use, so the least recently used is always at the end.',
      es: 'Dos estructuras trabajando juntas: un **mapa hash** encuentra al instante el nodo de una clave; una **lista doblemente enlazada** mantiene los nodos en orden de uso, así que el usado menos recientemente siempre está al final.',
    },
    ...views(),
  );
  for (const [op, key, value] of opsList) {
    const i = order.findIndex((e) => e[0] === key);
    if (op === 'get') {
      if (i === -1) {
        out.push(-1);
        t.add('miss', { en: `get(${key}): the map has no key ${key}. Return **-1**.`, es: `get(${key}): el mapa no tiene la clave ${key}. Devuelve **-1**.` }, ...views());
      } else {
        const [e] = order.splice(i, 1);
        order.unshift(e);
        out.push(e[1]);
        t.add(
          'touch',
          {
            en: `get(${key}): the map points straight at its node. Unhook the node and move it to the front — it is now the **most recently used**. Return **${e[1]}**.`,
            es: `get(${key}): el mapa apunta directo a su nodo. Desengancha el nodo y muévelo al frente — ahora es el **usado más recientemente**. Devuelve **${e[1]}**.`,
          },
          ...views(mark('good', 0)));
      }
    } else if (i !== -1) {
      order.splice(i, 1);
      order.unshift([key, value!]);
      t.add('update', { en: `put(${key}, ${value}): the key exists. Update its value and move it to the front.`, es: `put(${key}, ${value}): la clave existe. Actualiza su valor y muévela al frente.` }, ...views(mark('good', 0)));
    } else {
      if (order.length === capacity) {
        const victim = order[order.length - 1];
        t.add(
          'evict',
          {
            en: `put(${key}, ${value}): the cache is full. The node at the **end of the list** (key ${victim[0]}) is the least recently used — evict it, and delete it from the map too.`,
            es: `put(${key}, ${value}): la caché está llena. El nodo al **final de la lista** (clave ${victim[0]}) es el usado menos recientemente — desalójalo y bórralo también del mapa.`,
          },
          ...views(mark('bad', order.length - 1)));
        order = order.slice(0, -1);
      }
      order.unshift([key, value!]);
      t.add('insert', { en: `put(${key}, ${value}): create a node, add it at the front of the list, and record it in the map.`, es: `put(${key}, ${value}): crea un nodo, agrégalo al frente de la lista y regístralo en el mapa.` }, ...views(mark('good', 0)));
    }
  }
  t.add(
    undefined,
    { en: 'Done. Every operation was a map lookup plus a few pointer changes — O(1), no matter how large the cache.', es: 'Listo. Cada operación fue una consulta al mapa más unos pocos cambios de punteros — O(1), sin importar qué tan grande sea la caché.' },
    ...views(),
  );
  return t.frames;
}

const ops = (capacity: number, list: Op[]) => [capacity, list.map((o) => o[0]), list.map((o) => o.slice(1))];

export const lru: Problem = {
  id: 'lru',
  title: { en: 'LRU cache', es: 'Caché LRU' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'Design a cache with a fixed `capacity`. `get(key)` returns the value or `-1`. `put(key, value)` inserts or updates. When inserting into a full cache, first evict the **least recently used** key — the one that has gone longest without a `get` or `put`. Both operations must run in **O(1)**.',
      es: 'Diseña una caché con una capacidad fija `capacity`. `get(key)` devuelve el valor o `-1`. `put(key, value)` inserta o actualiza. Al insertar en una caché llena, primero desaloja la clave **usada menos recientemente** — la que lleva más tiempo sin un `get` ni un `put`. Ambas operaciones deben ejecutarse en **O(1)**.',
    },
  ],
  examples: [
    {
      input: 'capacity 2: put(1, 1), put(2, 2), get(1), put(3, 3), get(2)',
      output: 'get(1) → 1, get(2) → -1',
      why: { en: 'get(1) made key 1 recent, so put(3, 3) evicted key 2.', es: 'get(1) hizo reciente la clave 1, así que put(3, 3) desalojó la clave 2.' },
    },
  ],
  insight: {
    en: 'You need two things at once: **find any key instantly** (a hash map does that, but has no order) and **keep everything ordered by last use, with cheap reordering** (a linked list does that, but cannot find things). So use both, wired together: the map stores, for each key, a pointer to its node in the list. A *doubly* linked list is needed so a node can be unhooked from the middle in O(1) — it must know its previous neighbour.',
    es: 'Necesitas dos cosas a la vez: **encontrar cualquier clave al instante** (un mapa hash lo hace, pero no tiene orden) y **mantener todo ordenado por último uso, con reordenamiento barato** (una lista enlazada lo hace, pero no puede encontrar cosas). Así que usa ambas, conectadas: el mapa guarda, para cada clave, un puntero a su nodo en la lista. Se necesita una lista *doblemente* enlazada para poder desenganchar un nodo del medio en O(1) — debe conocer a su vecino anterior.',
  },
  approaches: [
    { id: 'scan', label: { en: 'Array ordered by recency', es: 'Arreglo ordenado por uso reciente' }, kind: 'brute', fn: (c: number, o: string[], v: number[][]) => drive(new LRUCacheScan(c), o, v), time: 'O(n) per operation', space: 'O(n)', note: {
        en: 'Finding a key scans the array, and removing from the middle or the front shifts everything after it.',
        es: 'Encontrar una clave recorre el arreglo, y quitar del medio o del frente desplaza todo lo que viene después.',
      },
    },
    { id: 'dll', label: { en: 'Hash map + doubly linked list', es: 'Mapa hash + lista doblemente enlazada' }, kind: 'optimal', fn: (c: number, o: string[], v: number[][]) => drive(new LRUCache(c), o, v), time: 'O(1) per operation', space: 'O(n)', note: {
        en: 'Dummy head and tail nodes remove every "is this the first/last node?" special case. (In real JavaScript code you can lean on `Map` keeping insertion order; interviewers usually want to see the linked list.)',
        es: 'Los nodos ficticios de cabeza y cola eliminan todo caso especial de "¿es este el primer/último nodo?". (En código JavaScript real puedes apoyarte en que `Map` conserva el orden de inserción; los entrevistadores suelen querer ver la lista enlazada.)',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'classic sequence', es: 'secuencia clásica' }, args: ops(2, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]]), expected: [null, null, 1, null, -1, null, -1, 3, 4] },
    { name: { en: 'get on an empty cache', es: 'get en una caché vacía' }, args: ops(2, [['get', 5]]), expected: [-1] },
    { name: { en: 'capacity 1', es: 'capacidad 1' }, args: ops(1, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['get', 2]]), expected: [null, null, -1, 2] },
    { name: { en: 'updating a key refreshes it', es: 'actualizar una clave la refresca' }, args: ops(2, [['put', 1, 1], ['put', 2, 2], ['put', 1, 10], ['put', 3, 3], ['get', 1], ['get', 2]]), expected: [null, null, null, null, 10, -1] },
    { name: { en: 'a get refreshes a key', es: 'un get refresca una clave' }, args: ops(2, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 1], ['get', 2]]), expected: [null, null, 1, null, 1, -1] },
    { name: { en: 'no operations', es: 'sin operaciones' }, args: [3, [], []], expected: [] },
    { name: { en: 'never full', es: 'nunca se llena' }, args: ops(5, [['put', 1, 1], ['put', 2, 2], ['get', 2], ['get', 1], ['get', 3]]), expected: [null, null, 2, 1, -1] },
    { name: { en: 'same key put repeatedly', es: 'la misma clave con put repetido' }, args: ops(2, [['put', 7, 1], ['put', 7, 2], ['put', 7, 3], ['get', 7]]), expected: [null, null, null, 3] },
    { name: { en: 'eviction order follows use, not insertion', es: 'el orden de desalojo sigue el uso, no la inserción' }, args: ops(3, [['put', 1, 1], ['put', 2, 2], ['put', 3, 3], ['get', 1], ['get', 2], ['put', 4, 4], ['get', 3], ['get', 1]]), expected: [null, null, null, 1, 2, null, -1, 1] },
  ],
  bench: {
    sizes: [100, 1000, 5000, 20_000],
    nLabel: { en: 'capacity (4 × that many random gets and puts)', es: 'capacidad (4 × esa cantidad de gets y puts aleatorios)' },
    gen: (n) => ops(n, Array.from({ length: 4 * n }, (): Op => (Math.random() < 0.5 ? ['get', randInt(0, 2 * n)] : ['put', randInt(0, 2 * n), randInt(0, 99)]))),
  },
  demo: {
    inputs: [
      { name: 'capacity', value: '3' },
      { name: 'operations', value: '[["put", 1, 10], ["put", 2, 20], ["put", 3, 30], ["get", 1], ["put", 4, 40], ["get", 2], ["put", 3, 33], ["put", 5, 50], ["get", 1]]' },
    ],
    validate: (c, list) =>
      !Number.isInteger(c) || c < 1 || c > 5
        ? { en: 'Capacity must be a whole number from 1 to 5.', es: 'La capacidad debe ser un entero de 1 a 5.' }
        : !Array.isArray(list) || list.length > 14 || !list.every((o) => Array.isArray(o) && ((o[0] === 'get' && Number.isInteger(o[1])) || (o[0] === 'put' && Number.isInteger(o[1]) && Number.isInteger(o[2]))))
          ? { en: 'Use up to 14 operations, each ["get", key] or ["put", key, value].', es: 'Usa hasta 14 operaciones, cada una ["get", key] o ["put", key, value].' }
          : null,
    traces: { dll: trace },
  },
};
