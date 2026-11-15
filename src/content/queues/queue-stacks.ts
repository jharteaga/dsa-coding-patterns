import code from './queue-stacks.ts?code';
import { drive, randInt } from '../../lib/ds';
import { Tracer, arr, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region naive
export class QueueNaive {
  main: number[] = []; // a stack: only push / pop at the end
  temp: number[] = [];

  enqueue(x: number): void {
    this.main.push(x);
  }
  dequeue(): number {
    // The oldest item is at the bottom. Dig it out, then put everything back.
    while (this.main.length > 1) this.temp.push(this.main.pop() as number);
    const front = this.main.pop() as number;
    while (this.temp.length > 0) this.main.push(this.temp.pop() as number);
    return front;
  }
  size(): number {
    return this.main.length;
  }
}
// #endregion

// #region lazy
export class QueueTwoStacks {
  inbox: number[] = []; // new items are pushed here
  outbox: number[] = []; // items leave from here, oldest on top

  enqueue(x: number): void {
    this.inbox.push(x); // @enqueue
  }
  dequeue(): number {
    if (this.outbox.length === 0) {
      // Pour the inbox into the outbox. Pouring reverses the order,
      // so the oldest item ends up on top.
      while (this.inbox.length > 0) this.outbox.push(this.inbox.pop() as number); // @pour
    }
    return this.outbox.pop() as number; // @dequeue
  }
  size(): number {
    return this.inbox.length + this.outbox.length;
  }
}
// #endregion

type Op = [string, number?];

function trace(opsList: Op[]) {
  const t = new Tracer();
  const inbox: number[] = [];
  const outbox: number[] = [];
  const out: number[] = [];
  let moves = 0;
  const views = () => [arr(inbox, { label: { en: 'inbox (push new items here)', es: 'inbox (aquí entran los elementos nuevos)' }, layout: 'stack' as const }), arr(outbox, { label: { en: 'outbox (pop old items here)', es: 'outbox (de aquí salen los elementos viejos)' }, layout: 'stack' as const }), vars({ dequeued: out, 'items moved between stacks': moves })];
  t.add(undefined, { en: 'Two stacks. New items go into the inbox. Items leave from the outbox.', es: 'Dos pilas. Los elementos nuevos entran al inbox. Los elementos salen del outbox.' }, ...views());
  for (const [op, x] of opsList) {
    if (op === 'enqueue') {
      inbox.push(x!);
      t.add('enqueue', { en: `enqueue(${x}): just push it onto the inbox. O(1).`, es: `enqueue(${x}): simplemente apílalo en el inbox. O(1).` }, ...views());
    } else {
      if (!outbox.length && !inbox.length) {
        t.add(undefined, { en: 'dequeue(): the queue is empty — skipping.', es: 'dequeue(): la cola está vacía; se omite.' }, ...views());
        continue;
      }
      if (!outbox.length) {
        moves += inbox.length;
        while (inbox.length) outbox.push(inbox.pop()!);
        t.add('pour', { en: `dequeue(): the outbox is empty, so pour the whole inbox into it. Popping from one stack and pushing onto another **reverses the order** — the oldest item is now on top.`, es: `dequeue(): el outbox está vacío, así que vierte todo el inbox en él. Sacar de una pila y meter en otra **invierte el orden**: el elemento más antiguo queda ahora arriba.` }, ...views());
      }
      out.push(outbox.pop()!);
      t.add('dequeue', {
          en: `Pop the top of the outbox: **${out[out.length - 1]}**, the oldest item. ${outbox.length ? 'The outbox still has items, so the next dequeue needs no pouring.' : ''}`,
          es: `Saca el tope del outbox: **${out[out.length - 1]}**, el elemento más antiguo. ${outbox.length ? 'El outbox todavía tiene elementos, así que el siguiente dequeue no necesita verter.' : ''}`,
        }, ...views());
    }
  }
  t.add(undefined, { en: `Done. Items came out in the order they went in: [${out.join(', ')}]. Each item was moved between stacks at most **once** (${moves} moves in total), so the average cost per operation is O(1).`, es: `Listo. Los elementos salieron en el orden en que entraron: [${out.join(', ')}]. Cada elemento se movió entre pilas como máximo **una vez** (${moves} movimientos en total), así que el costo promedio por operación es O(1).` }, ...views());
  return t.frames;
}

const ops = (list: Op[]) => [list.map((o) => o[0]), list.map((o) => o.slice(1))];

export const queueStacks: Problem = {
  id: 'queue-stacks',
  title: { en: 'Build a queue from two stacks', es: 'Construye una cola con dos pilas' },
  difficulty: 'Easy',
  statement: [
    { en: 'Implement a first-in-first-out queue with `enqueue(x)`, `dequeue()` and `size()`, using **only stacks** — you may only push to and pop from the end of an array.', es: 'Implementa una cola FIFO (primero en entrar, primero en salir) con `enqueue(x)`, `dequeue()` y `size()`, usando **solo pilas**: solo puedes meter y sacar por el final de un arreglo.' },
  ],
  examples: [{ input: 'enqueue(1), enqueue(2), dequeue(), enqueue(3), dequeue(), dequeue()', output: 'dequeues return 1, 2, 3' }],
  insight:
    { en: 'Moving items from one stack to another **reverses** them — which turns "newest on top" into "oldest on top", exactly what a queue needs. The brute force reverses and then un-reverses on every dequeue. The fix: do not put them back. Keep the reversed items in a second stack and serve from it until it runs dry; only then pour again. Each item is moved once in its lifetime, so n operations cost O(n) in total — **amortized O(1)** each.', es: 'Mover elementos de una pila a otra los **invierte**, lo que convierte "el más nuevo arriba" en "el más antiguo arriba", justo lo que necesita una cola. La fuerza bruta invierte y luego deshace la inversión en cada dequeue. La solución: no los regreses. Deja los elementos invertidos en una segunda pila y atiende desde ahí hasta que se vacíe; solo entonces vuelve a verter. Cada elemento se mueve una sola vez en su vida, así que n operaciones cuestan O(n) en total: **O(1) amortizado** cada una.' },
  approaches: [
    { id: 'naive', label: { en: 'Dig out the bottom, put everything back', es: 'Sacar el fondo y regresar todo' }, kind: 'brute', fn: (o: string[], v: number[][]) => drive(new QueueNaive(), o, v), time: 'dequeue O(n)', space: 'O(n)', note: { en: 'Every dequeue moves all n items to a temporary stack and back again.', es: 'Cada dequeue mueve los n elementos a una pila temporal y de vuelta.' } },
    { id: 'lazy', label: { en: 'Inbox + outbox (lazy transfer)', es: 'Inbox + outbox (transferencia perezosa)' }, kind: 'optimal', fn: (o: string[], v: number[][]) => drive(new QueueTwoStacks(), o, v), time: 'amortized O(1)', space: 'O(n)', note: { en: 'A single dequeue can still be O(n) when it triggers a pour, but that pour pays for the next n dequeues.', es: 'Un dequeue individual todavía puede ser O(n) cuando provoca un vertido, pero ese vertido paga los siguientes n dequeues.' } },
  ],
  code,
  cases: [
    { name: { en: 'interleaved', es: 'intercaladas' }, args: ops([['enqueue', 1], ['enqueue', 2], ['dequeue'], ['enqueue', 3], ['dequeue'], ['dequeue']]), expected: [null, null, 1, null, 2, 3] },
    { name: { en: 'no operations', es: 'sin operaciones' }, args: [[], []], expected: [] },
    { name: { en: 'single item in and out', es: 'un solo elemento entra y sale' }, args: ops([['enqueue', 7], ['dequeue'], ['size']]), expected: [null, 7, 0] },
    { name: { en: 'fill, then drain: FIFO order', es: 'llenar y luego vaciar: orden FIFO' }, args: ops([['enqueue', 1], ['enqueue', 2], ['enqueue', 3], ['dequeue'], ['dequeue'], ['dequeue']]), expected: [null, null, null, 1, 2, 3] },
    { name: { en: 'size counts both stacks', es: 'size cuenta ambas pilas' }, args: ops([['enqueue', 1], ['enqueue', 2], ['dequeue'], ['enqueue', 3], ['size']]), expected: [null, null, 1, null, 2] },
    { name: { en: 'enqueue after a partial drain keeps order', es: 'enqueue tras un vaciado parcial conserva el orden' }, args: ops([['enqueue', 1], ['enqueue', 2], ['dequeue'], ['enqueue', 3], ['enqueue', 4], ['dequeue'], ['dequeue'], ['dequeue']]), expected: [null, null, 1, null, null, 2, 3, 4] },
    { name: { en: 'duplicates', es: 'duplicados' }, args: ops([['enqueue', 5], ['enqueue', 5], ['dequeue'], ['dequeue']]), expected: [null, null, 5, 5] },
    { name: { en: 'empty, refill, empty', es: 'vaciar, rellenar, vaciar' }, args: ops([['enqueue', 1], ['dequeue'], ['enqueue', 2], ['dequeue'], ['size']]), expected: [null, 1, null, 2, 0] },
  ],
  bench: {
    sizes: [100, 1000, 5000, 20_000],
    nLabel: { en: 'items enqueued, then all dequeued', es: 'elementos encolados y luego todos desencolados' },
    gen: (n) => ops([...Array.from({ length: n }, (): Op => ['enqueue', randInt(0, 99)]), ...Array.from({ length: n }, (): Op => ['dequeue'])]),
  },
  demo: {
    inputs: [{ name: 'operations', value: '[["enqueue", 1], ["enqueue", 2], ["enqueue", 3], ["dequeue"], ["enqueue", 4], ["dequeue"], ["dequeue"], ["dequeue"]]' }],
    validate: (list) =>
      !Array.isArray(list) || list.length > 14 || !list.every((o) => Array.isArray(o) && ((o[0] === 'enqueue' && typeof o[1] === 'number') || o[0] === 'dequeue'))
        ? { en: 'Use up to 14 operations, each ["enqueue", number] or ["dequeue"].', es: 'Usa hasta 14 operaciones, cada una ["enqueue", número] o ["dequeue"].' }
        : null,
    traces: { lazy: trace },
  },
};
