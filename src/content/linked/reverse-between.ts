import code from './reverse-between.ts?code';
import { buildList, ListNode, listToArray, randArray, randInt } from '../../lib/ds';
import type { Problem } from '../../types';

// #region values
export function reverseBetweenValues(head: ListNode | null, left: number, right: number): ListNode | null {
  const nodes: ListNode[] = [];
  for (let node = head; node !== null; node = node.next) nodes.push(node); // O(n) array
  // Swap values from both ends of the segment toward the middle.
  for (let i = left - 1, j = right - 1; i < j; i++, j--) {
    [nodes[i].val, nodes[j].val] = [nodes[j].val, nodes[i].val];
  }
  return head;
}
// #endregion

// #region inplace
export function reverseBetween(head: ListNode | null, left: number, right: number): ListNode | null {
  const dummy = new ListNode(0); // a fake node before the head removes the "left = 1" special case
  dummy.next = head;

  // 1. Walk to the node just before the segment.
  let before = dummy;
  for (let i = 1; i < left; i++) before = before.next as ListNode;

  // 2. Reverse the segment with the standard prev / cur / next loop.
  const segmentTail = before.next; // first node of the segment becomes its tail
  let prev: ListNode | null = null;
  let cur = before.next;
  for (let i = left; i <= right; i++) {
    const next: ListNode | null = (cur as ListNode).next;
    (cur as ListNode).next = prev;
    prev = cur;
    cur = next;
  }

  // 3. Stitch it back in: before -> (reversed segment) -> rest.
  before.next = prev;
  if (segmentTail !== null) segmentTail.next = cur;
  return dummy.next;
}
// #endregion

export const reverseBetweenProblem: Problem = {
  id: 'reverse-between',
  title: { en: 'Reverse part of a linked list', es: 'Invertir parte de una lista enlazada' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'Given a linked list and positions `left ≤ right` (1-based), reverse only the nodes from position `left` to `right`, in one pass and in place.',
      es: 'Dada una lista enlazada y las posiciones `left ≤ right` (contando desde 1), invierte solo los nodos desde la posición `left` hasta `right`, en una pasada y en el lugar.',
    },
  ],
  examples: [{ input: 'list = 1 → 2 → 3 → 4 → 5, left = 2, right = 4', output: '1 → 4 → 3 → 2 → 5' }],
  insight: {
    en: 'It is the same pointer-flipping loop, wrapped in two extra steps: first remember the node **just before** the segment, then after reversing, **reconnect both ends** — the node before now points to the segment’s new head, and the segment’s old first node (now its tail) points to whatever came after. A dummy node in front of the head means "the node before the segment" always exists, even when left = 1.',
    es: 'Es el mismo bucle que voltea punteros, envuelto en dos pasos extra: primero recuerda el nodo **justo antes** del segmento y, después de invertir, **reconecta ambos extremos**: el nodo anterior ahora apunta a la nueva cabeza del segmento, y el antiguo primer nodo del segmento (ahora su cola) apunta a lo que venía después. Un nodo ficticio delante de la cabeza garantiza que "el nodo antes del segmento" siempre exista, incluso cuando left = 1.',
  },
  approaches: [
    {
      id: 'values',
      label: { en: 'Array of nodes, swap values', es: 'Arreglo de nodos, intercambiar valores' },
      kind: 'brute',
      fn: reverseBetweenValues,
      time: 'O(n)',
      space: 'O(n)',
      note: {
        en: 'Stores every node in an array to get index access, then swaps values.',
        es: 'Guarda cada nodo en un arreglo para tener acceso por índice y luego intercambia valores.',
      },
    },
    {
      id: 'inplace',
      label: { en: 'Reverse the sublist in place', es: 'Invertir la sublista en el lugar' },
      kind: 'optimal',
      fn: reverseBetween,
      time: 'O(n)',
      space: 'O(1)',
      note: { en: 'One pass and a handful of pointers.', es: 'Una pasada y un puñado de punteros.' },
    },
  ],
  code,
  mutates: true,
  adapt: { in: (args) => [buildList(args[0]), args[1], args[2]], out: (head: ListNode | null) => listToArray(head) },
  cases: [
    { name: { en: 'middle segment', es: 'segmento central' }, args: [[1, 2, 3, 4, 5], 2, 4], expected: [1, 4, 3, 2, 5] },
    { name: { en: 'single node', es: 'un solo nodo' }, args: [[5], 1, 1], expected: [5] },
    { name: { en: 'left = right (nothing changes)', es: 'left = right (nada cambia)' }, args: [[1, 2, 3], 2, 2], expected: [1, 2, 3] },
    { name: { en: 'whole list', es: 'lista completa' }, args: [[1, 2, 3, 4], 1, 4], expected: [4, 3, 2, 1] },
    { name: { en: 'segment starts at the head', es: 'el segmento empieza en la cabeza' }, args: [[1, 2, 3, 4, 5], 1, 3], expected: [3, 2, 1, 4, 5] },
    { name: { en: 'segment ends at the tail', es: 'el segmento termina en la cola' }, args: [[1, 2, 3, 4, 5], 3, 5], expected: [1, 2, 5, 4, 3] },
    { name: { en: 'two nodes', es: 'dos nodos' }, args: [[1, 2], 1, 2], expected: [2, 1] },
    { name: { en: 'adjacent pair in the middle', es: 'par adyacente en el medio' }, args: [[1, 2, 3, 4], 2, 3], expected: [1, 3, 2, 4] },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'number of nodes', es: 'número de nodos' },
    gen: (n) => { const l = randInt(1, n); return [randArray(n, 0, 99), l, randInt(l, n)]; },
  },
};
