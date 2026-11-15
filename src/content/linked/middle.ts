import code from './middle.ts?code';
import { buildList, ListNode, randArray } from '../../lib/ds';
import type { Problem } from '../../types';

// #region count
export function middleCount(head: ListNode | null): ListNode | null {
  // Pass 1: how long is the list?
  let length = 0;
  for (let node = head; node !== null; node = node.next) length++;
  // Pass 2: walk to the middle.
  let node = head;
  for (let i = 0; i < Math.floor(length / 2); i++) node = (node as ListNode).next;
  return node;
}
// #endregion

// #region fastslow
export function middle(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  // When fast has covered the whole list, slow has covered half of it.
  while (fast !== null && fast.next !== null) {
    slow = (slow as ListNode).next;
    fast = fast.next.next;
  }
  return slow;
}
// #endregion

export const middleProblem: Problem = {
  id: 'middle',
  title: { en: 'Middle of a linked list', es: 'Mitad de una lista enlazada' },
  difficulty: 'Easy',
  statement: [
    {
      en: 'Return the middle node of a singly linked list. If there are two middle nodes (even length), return the second one. Tests show the middle node’s value (`null` for an empty list).',
      es: 'Devuelve el nodo central de una lista simplemente enlazada. Si hay dos nodos centrales (longitud par), devuelve el segundo. Las pruebas muestran el valor del nodo central (`null` para una lista vacía).',
    },
  ],
  examples: [
    { input: 'list = 1 → 2 → 3 → 4 → 5', output: '3' },
    { input: 'list = 1 → 2 → 3 → 4 → 5 → 6', output: '4', why: { en: 'Two middles (3 and 4): return the second.', es: 'Dos centros (3 y 4): devuelve el segundo.' } },
  ],
  insight: {
    en: 'A linked list does not know its own length, so the obvious solution measures it first. But if one pointer moves **twice as fast** as another, then at the moment the fast one reaches the end, the slow one is exactly halfway. One pass, and you never need the length. The same trick finds "the k-th node from the end" (start one pointer k nodes ahead).',
    es: 'Una lista enlazada no conoce su propia longitud, así que la solución obvia primero la mide. Pero si un puntero avanza **el doble de rápido** que otro, en el momento en que el rápido llega al final, el lento está justo a la mitad. Una sola pasada, y nunca necesitas la longitud. El mismo truco encuentra "el k-ésimo nodo desde el final" (empieza un puntero k nodos por delante).',
  },
  approaches: [
    {
      id: 'count',
      label: { en: 'Count, then walk half', es: 'Contar y luego recorrer la mitad' },
      kind: 'brute',
      fn: middleCount,
      time: 'O(n)',
      space: 'O(1)',
      note: {
        en: 'Two passes: 1.5 n node visits. Fine in practice, but impossible if the data can only be read once (a stream).',
        es: 'Dos pasadas: 1.5 n visitas a nodos. Está bien en la práctica, pero es imposible si los datos solo se pueden leer una vez (un flujo).',
      },
    },
    {
      id: 'fastslow',
      label: { en: 'Fast & slow pointers', es: 'Punteros rápido y lento' },
      kind: 'optimal',
      fn: middle,
      time: 'O(n)',
      space: 'O(1)',
      note: {
        en: 'A single pass. Same Big O — the gain is one traversal instead of two, and the technique it teaches.',
        es: 'Una sola pasada. El mismo Big O: la ganancia es un recorrido en lugar de dos, y la técnica que enseña.',
      },
    },
  ],
  code,
  adapt: { in: (args) => [buildList(args[0])], out: (node: ListNode | null) => (node ? node.val : null) },
  cases: [
    { name: { en: 'odd length', es: 'longitud impar' }, args: [[1, 2, 3, 4, 5]], expected: 3 },
    { name: { en: 'even length → second middle', es: 'longitud par → segundo centro' }, args: [[1, 2, 3, 4, 5, 6]], expected: 4 },
    { name: { en: 'empty list', es: 'lista vacía' }, args: [[]], expected: null },
    { name: { en: 'single node', es: 'un solo nodo' }, args: [[7]], expected: 7 },
    { name: { en: 'two nodes', es: 'dos nodos' }, args: [[1, 2]], expected: 2 },
    { name: { en: 'three nodes', es: 'tres nodos' }, args: [[1, 2, 3]], expected: 2 },
    { name: { en: 'duplicates', es: 'repetidos' }, args: [[5, 5, 5, 5]], expected: 5 },
    { name: { en: 'negative values', es: 'valores negativos' }, args: [[-1, -2, -3]], expected: -2 },
  ],
  bench: { sizes: [100, 1000, 10_000, 100_000, 1_000_000], nLabel: { en: 'number of nodes', es: 'número de nodos' }, gen: (n) => [randArray(n, 0, 99)] },
};
