import code from './min-stack.ts?code';
import { drive, randInt } from '../../lib/ds';
import type { Problem } from '../../types';

// #region scan
export class MinStackScan {
  items: number[] = [];

  push(x: number): void {
    this.items.push(x);
  }
  pop(): void {
    this.items.pop();
  }
  top(): number {
    return this.items[this.items.length - 1];
  }
  getMin(): number {
    // Looks at every element, every time.
    let min = this.items[0];
    for (const x of this.items) if (x < min) min = x;
    return min;
  }
}
// #endregion

// #region mins
export class MinStack {
  items: number[] = [];
  mins: number[] = []; // mins[i] = smallest value among items[0..i]

  push(x: number): void {
    this.items.push(x);
    const currentMin = this.mins.length === 0 ? x : Math.min(x, this.mins[this.mins.length - 1]);
    this.mins.push(currentMin);
  }
  pop(): void {
    this.items.pop();
    this.mins.pop(); // the minimum "rewinds" automatically
  }
  top(): number {
    return this.items[this.items.length - 1];
  }
  getMin(): number {
    return this.mins[this.mins.length - 1];
  }
}
// #endregion

const ops = (list: [string, ...number[]][]) => [list.map((o) => o[0]), list.map((o) => o.slice(1))];

export const minStack: Problem = {
  id: 'min-stack',
  title: { en: 'Min stack', es: 'Min Stack (pila con mínimo)' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'Design a stack that supports `push(x)`, `pop()`, `top()` and `getMin()` — where `getMin()` returns the smallest value currently in the stack — with **every operation in O(1)**.',
      es: 'Diseña una pila que admita `push(x)`, `pop()`, `top()` y `getMin()` — donde `getMin()` devuelve el valor más pequeño que hay actualmente en la pila — con **cada operación en O(1)**.',
    },
    {
      en: 'Test cases list the operations in order; the expected output lists what each one returns (`null` for operations that return nothing).',
      es: 'Los casos de prueba listan las operaciones en orden; la salida esperada lista lo que devuelve cada una (`null` para las operaciones que no devuelven nada).',
    },
  ],
  examples: [
    {
      input: 'push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()',
      output: '-3, then 0, then -2',
      why: { en: 'After popping −3, the minimum goes back to −2.', es: 'Tras desapilar −3, el mínimo vuelve a −2.' },
    },
  ],
  insight: {
    en: 'The minimum can only change when you push or pop — and a stack un-does things in exactly the reverse order it did them. So store, alongside each element, **the minimum of everything at or below it**. Pushing computes the new minimum in O(1) from the previous one; popping throws the top entry away and the previous minimum is right there underneath.',
    es: 'El mínimo solo puede cambiar cuando apilas o desapilas — y una pila deshace las cosas exactamente en el orden inverso en que las hizo. Así que guarda, junto a cada elemento, **el mínimo de todo lo que está en él o debajo**. Apilar calcula el nuevo mínimo en O(1) a partir del anterior; desapilar descarta la entrada de la cima y el mínimo anterior queda justo debajo.',
  },
  approaches: [
    { id: 'scan', label: { en: 'Scan for the minimum', es: 'Recorrer buscando el mínimo' }, kind: 'brute', fn: (o: string[], v: number[][]) => drive(new MinStackScan(), o, v), time: 'getMin O(n)', space: 'O(1)', note: {
        en: 'A plain stack; `getMin` walks through all n elements on every call.',
        es: 'Una pila simple; `getMin` recorre los n elementos en cada llamada.',
      },
    },
    { id: 'mins', label: { en: 'Second stack of running minimums', es: 'Segunda pila de mínimos acumulados' }, kind: 'optimal', fn: (o: string[], v: number[][]) => drive(new MinStack(), o, v), time: 'all O(1)', space: 'O(n)', note: {
        en: 'Pays O(n) extra memory to make `getMin` a single array read.',
        es: 'Paga O(n) de memoria extra para que `getMin` sea una sola lectura del arreglo.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'minimum rewinds after pop', es: 'el mínimo retrocede tras un pop' }, args: ops([['push', -2], ['push', 0], ['push', -3], ['getMin'], ['pop'], ['top'], ['getMin']]), expected: [null, null, null, -3, null, 0, -2] },
    { name: { en: 'single element', es: 'un solo elemento' }, args: ops([['push', 5], ['getMin'], ['top']]), expected: [null, 5, 5] },
    { name: { en: 'duplicate minimums', es: 'mínimos duplicados' }, args: ops([['push', 1], ['push', 1], ['pop'], ['getMin']]), expected: [null, null, null, 1] },
    { name: { en: 'increasing pushes', es: 'pushes crecientes' }, args: ops([['push', 1], ['push', 2], ['push', 3], ['getMin'], ['pop'], ['getMin']]), expected: [null, null, null, 1, null, 1] },
    { name: { en: 'decreasing pushes', es: 'pushes decrecientes' }, args: ops([['push', 3], ['push', 2], ['push', 1], ['getMin'], ['pop'], ['getMin'], ['pop'], ['getMin']]), expected: [null, null, null, 1, null, 2, null, 3] },
    { name: { en: 'empty then refill', es: 'vaciar y volver a llenar' }, args: ops([['push', 4], ['pop'], ['push', 9], ['getMin']]), expected: [null, null, null, 9] },
    { name: { en: 'no operations', es: 'sin operaciones' }, args: [[], []], expected: [] },
    { name: { en: 'negative values', es: 'valores negativos' }, args: ops([['push', -1], ['push', -5], ['push', -3], ['getMin'], ['top']]), expected: [null, null, null, -5, -3] },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 30_000],
    nLabel: { en: 'pushes, each followed by a getMin', es: 'pushes, cada uno seguido de un getMin' },
    gen: (n) => ops(Array.from({ length: n }, (): [string, ...number[]][] => [['push', randInt(-1000, 1000)], ['getMin']]).flat()),
  },
};
