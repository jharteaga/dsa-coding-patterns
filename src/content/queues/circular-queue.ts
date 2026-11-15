import code from './circular-queue.ts?code';
import { drive, randInt } from '../../lib/ds';
import { Tracer, vars } from '../../lib/trace';
import type { Problem, View } from '../../types';

// #region shift
export class ShiftQueue {
  items: number[];
  count = 0;

  constructor(capacity: number) {
    this.items = new Array<number>(capacity).fill(0);
  }
  enqueue(x: number): boolean {
    if (this.count === this.items.length) return false; // full
    this.items[this.count++] = x;
    return true;
  }
  dequeue(): boolean {
    if (this.count === 0) return false; // empty
    // The front is always index 0, so everyone else shuffles forward.
    // (This is what array.shift() / List.RemoveAt(0) do internally.)
    for (let i = 1; i < this.count; i++) this.items[i - 1] = this.items[i];
    this.count--;
    return true;
  }
  front(): number {
    return this.count === 0 ? -1 : this.items[0];
  }
  rear(): number {
    return this.count === 0 ? -1 : this.items[this.count - 1];
  }
}
// #endregion

// #region ring
export class RingBuffer {
  slots: number[];
  head = 0; // index of the oldest item
  count = 0; // how many items are stored

  constructor(capacity: number) {
    this.slots = new Array<number>(capacity).fill(0);
  }
  enqueue(x: number): boolean {
    if (this.count === this.slots.length) return false; // full // @full
    const tail = (this.head + this.count) % this.slots.length; // wraps around
    this.slots[tail] = x; // @enqueue
    this.count++;
    return true;
  }
  dequeue(): boolean {
    if (this.count === 0) return false; // empty // @empty
    this.head = (this.head + 1) % this.slots.length; // nothing moves: only the index // @dequeue
    this.count--;
    return true;
  }
  front(): number {
    return this.count === 0 ? -1 : this.slots[this.head];
  }
  rear(): number {
    return this.count === 0 ? -1 : this.slots[(this.head + this.count - 1) % this.slots.length];
  }
}
// #endregion

type Op = [string, number?];

function trace(capacity: number, opsList: Op[]) {
  const t = new Tracer();
  const slots = new Array<number>(capacity).fill(0);
  let head = 0;
  let count = 0;
  const ring = (): View => ({ kind: 'ring', label: { en: `ring buffer, capacity ${capacity}`, es: `búfer circular, capacidad ${capacity}` }, slots: [...slots], head, tail: (head + count) % capacity, count });
  const state = () => vars({ head, count, 'tail = (head + count) % capacity': (head + count) % capacity });
  t.add(
    undefined,
    {
      en: `A fixed array of ${capacity} slots, drawn as a circle. **head** marks the oldest item; **tail** marks where the next item will go. Nothing ever moves — only these two positions do.`,
      es: `Un arreglo fijo de ${capacity} casillas, dibujado como un círculo. **head** marca el elemento más antiguo; **tail** marca dónde irá el siguiente. Nada se mueve nunca: solo se mueven estas dos posiciones.`,
    },
    ring(), state());
  for (const [op, x] of opsList) {
    if (op === 'enqueue') {
      if (count === capacity) {
        t.add('full', { en: `enqueue(${x}): all ${capacity} slots are in use. Rejected (returns false).`, es: `enqueue(${x}): las ${capacity} casillas están ocupadas. Rechazado (devuelve false).` }, ring(), state());
        continue;
      }
      const tail = (head + count) % capacity;
      slots[tail] = x!;
      count++;
      t.add('enqueue', {
          en: `enqueue(${x}): write it at the tail, slot ${tail}.${tail < head ? ' The tail has **wrapped around** past the end of the array and is reusing slots freed by earlier dequeues.' : ''}`,
          es: `enqueue(${x}): escríbelo en el tail, casilla ${tail}.${tail < head ? ' El tail **dio la vuelta** al pasar el final del arreglo y está reutilizando casillas liberadas por dequeues anteriores.' : ''}`,
        }, ring(), state());
    } else {
      if (count === 0) {
        t.add('empty', { en: 'dequeue(): the buffer is empty. Nothing to remove (returns false).', es: 'dequeue(): el búfer está vacío. No hay nada que quitar (devuelve false).' }, ring(), state());
        continue;
      }
      const old = slots[head];
      head = (head + 1) % capacity;
      count--;
      t.add('dequeue', {
          en: `dequeue(): remove ${old} by simply advancing head to slot ${head}${head === 0 ? ' (wrapping back to 0)' : ''}. No element is shifted — O(1).`,
          es: `dequeue(): quita ${old} simplemente avanzando head a la casilla ${head}${head === 0 ? ' (volviendo a 0)' : ''}. Ningún elemento se desplaza: O(1).`,
        }, ring(), state());
    }
  }
  t.add(undefined, { en: 'All operations done. Every enqueue and dequeue was a constant amount of work, however full the buffer was.', es: 'Todas las operaciones terminaron. Cada enqueue y dequeue costó una cantidad constante de trabajo, sin importar qué tan lleno estuviera el búfer.' }, ring(), state());
  return t.frames;
}

const ops = (capacity: number, list: Op[]) => [capacity, list.map((o) => o[0]), list.map((o) => o.slice(1))];

export const circularQueue: Problem = {
  id: 'circular-queue',
  title: { en: 'Design a circular queue (ring buffer)', es: 'Diseña una cola circular (búfer circular)' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'Design a queue with a **fixed capacity** `k`. `enqueue(x)` returns `false` if the queue is full; `dequeue()` returns `false` if it is empty; `front()` and `rear()` return the oldest / newest item, or `-1` if empty. Every operation must be O(1) and no memory may be allocated after construction.',
      es: 'Diseña una cola con **capacidad fija** `k`. `enqueue(x)` devuelve `false` si la cola está llena; `dequeue()` devuelve `false` si está vacía; `front()` y `rear()` devuelven el elemento más antiguo / más reciente, o `-1` si está vacía. Cada operación debe ser O(1) y no se puede reservar memoria después de la construcción.',
    },
  ],
  examples: [{ input: 'capacity 3: enqueue(1), enqueue(2), enqueue(3), enqueue(4), rear(), dequeue(), enqueue(4), rear()', output: 'true, true, true, false, 3, true, true, 4', why: {
        en: 'The fourth enqueue fails (full). After one dequeue there is room, and 4 is stored in the slot that 1 used to occupy.',
        es: 'El cuarto enqueue falla (llena). Tras un dequeue hay espacio, y 4 se guarda en la casilla que antes ocupaba 1.',
      },
    }],
  insight:
  {
    en: 'Removing from the front of an array is slow only if you insist that the front lives at index 0. Let the front **float**: keep a `head` index and advance it on dequeue. When an index runs off the end of the array, wrap it back to 0 with `% capacity` — the array becomes a ring, and slots freed at the start get reused. No element is ever moved.',
    es: 'Quitar del frente de un arreglo solo es lento si insistes en que el frente viva en el índice 0. Deja que el frente **flote**: guarda un índice `head` y avánzalo en cada dequeue. Cuando un índice se sale del final del arreglo, regrésalo a 0 con `% capacity`: el arreglo se vuelve un anillo y las casillas liberadas al inicio se reutilizan. Ningún elemento se mueve jamás.',
  },
  approaches: [
    { id: 'shift', label: { en: 'Array, shift everything on dequeue', es: 'Arreglo, desplazar todo en cada dequeue' }, kind: 'brute', fn: (k: number, o: string[], v: number[][]) => drive(new ShiftQueue(k), o, v), time: 'dequeue O(n)', space: 'O(k)', note: { en: 'Keeps the front pinned at index 0, so each dequeue slides every remaining item one slot left.', es: 'Mantiene el frente fijo en el índice 0, así que cada dequeue corre todos los elementos restantes una casilla a la izquierda.' } },
    { id: 'ring', label: { en: 'Ring buffer (head + count, modulo)', es: 'Búfer circular (head + count, módulo)' }, kind: 'optimal', fn: (k: number, o: string[], v: number[][]) => drive(new RingBuffer(k), o, v), time: 'all O(1)', space: 'O(k)', note: {
        en: 'Storing `count` (rather than a separate tail index) makes "full" and "empty" trivial to tell apart: `count === capacity` vs `count === 0`.',
        es: 'Guardar `count` (en lugar de un índice tail aparte) hace trivial distinguir "llena" de "vacía": `count === capacity` vs `count === 0`.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'fill, overflow, wrap around', es: 'llenar, desbordar, dar la vuelta' }, args: ops(3, [['enqueue', 1], ['enqueue', 2], ['enqueue', 3], ['enqueue', 4], ['rear'], ['dequeue'], ['enqueue', 4], ['rear'], ['front']]), expected: [true, true, true, false, 3, true, true, 4, 2] },
    { name: { en: 'empty queue', es: 'cola vacía' }, args: ops(2, [['front'], ['rear'], ['dequeue']]), expected: [-1, -1, false] },
    { name: { en: 'capacity 1', es: 'capacidad 1' }, args: ops(1, [['enqueue', 9], ['enqueue', 8], ['front'], ['dequeue'], ['dequeue'], ['enqueue', 8], ['rear']]), expected: [true, false, 9, true, false, true, 8] },
    { name: { en: 'no operations', es: 'sin operaciones' }, args: [4, [], []], expected: [] },
    { name: { en: 'wraps around several times', es: 'da la vuelta varias veces' }, args: ops(2, [['enqueue', 1], ['dequeue'], ['enqueue', 2], ['dequeue'], ['enqueue', 3], ['enqueue', 4], ['front'], ['rear'], ['dequeue'], ['front']]), expected: [true, true, true, true, true, true, 3, 4, true, 4] },
    { name: { en: 'drain completely, then reuse', es: 'vaciar por completo y reutilizar' }, args: ops(3, [['enqueue', 1], ['enqueue', 2], ['dequeue'], ['dequeue'], ['dequeue'], ['enqueue', 5], ['front'], ['rear']]), expected: [true, true, true, true, false, true, 5, 5] },
    { name: { en: 'front and rear coincide with one item', es: 'front y rear coinciden con un elemento' }, args: ops(5, [['enqueue', 7], ['front'], ['rear']]), expected: [true, 7, 7] },
    { name: { en: 'full stays full until a dequeue', es: 'llena sigue llena hasta un dequeue' }, args: ops(2, [['enqueue', 1], ['enqueue', 2], ['enqueue', 3], ['enqueue', 4], ['dequeue'], ['enqueue', 5], ['front'], ['rear']]), expected: [true, true, false, false, true, true, 2, 5] },
  ],
  bench: {
    sizes: [100, 1000, 5000, 20_000],
    nLabel: { en: 'capacity (fill completely, then drain completely)', es: 'capacidad (llenar por completo y luego vaciar por completo)' },
    gen: (n) => ops(n, [...Array.from({ length: n }, (): Op => ['enqueue', randInt(0, 99)]), ...Array.from({ length: n }, (): Op => ['dequeue']), ['front']]),
  },
  demo: {
    inputs: [
      { name: 'capacity', value: '5' },
      { name: 'operations', value: '[["enqueue", 1], ["enqueue", 2], ["enqueue", 3], ["dequeue"], ["dequeue"], ["enqueue", 4], ["enqueue", 5], ["enqueue", 6], ["enqueue", 7], ["enqueue", 8], ["dequeue"]]' },
    ],
    validate: (k, list) =>
      !Number.isInteger(k) || k < 1 || k > 8
        ? { en: 'Capacity must be a whole number from 1 to 8.', es: 'La capacidad debe ser un número entero de 1 a 8.' }
        : !Array.isArray(list) || list.length > 16 || !list.every((o) => Array.isArray(o) && ((o[0] === 'enqueue' && typeof o[1] === 'number') || o[0] === 'dequeue'))
          ? { en: 'Use up to 16 operations, each ["enqueue", number] or ["dequeue"].', es: 'Usa hasta 16 operaciones, cada una ["enqueue", número] o ["dequeue"].' }
          : null,
    traces: { ring: trace },
  },
};
