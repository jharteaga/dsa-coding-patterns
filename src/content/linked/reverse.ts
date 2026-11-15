import code from './reverse.ts?code';
import { numsErr } from '../../lib/check';
import { buildList, ListNode, listToArray, randArray } from '../../lib/ds';
import { Tracer, list } from '../../lib/trace';
import type { Problem } from '../../types';

// #region values
export function reverseListValues(head: ListNode | null): ListNode | null {
  // Copy all values out...
  const values: number[] = [];
  for (let node = head; node !== null; node = node.next) values.push(node.val);
  // ...then write them back in reverse order.
  for (let node = head; node !== null; node = node.next) node.val = values.pop() as number;
  return head;
}
// #endregion

// #region inplace
export function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let cur = head; // @init
  while (cur !== null) {
    const next = cur.next; // 1. remember the rest of the list // @save
    cur.next = prev; // 2. turn this node's arrow around // @flip
    prev = cur; // 3. step forward
    cur = next; // @step
  }
  return prev; // the old tail is the new head // @done
}
// #endregion

function trace(vals: number[]) {
  const t = new Tracer();
  const head = buildList(vals);
  const order: ListNode[] = [];
  for (let n = head; n; n = n.next) order.push(n);
  let prev: ListNode | null = null;
  let cur = head;
  t.add(
    'init',
    {
      en: '`prev` is the part already reversed (nothing yet). `cur` is the node we are about to turn around.',
      es: '`prev` es la parte ya invertida (nada todavía). `cur` es el nodo que estamos por voltear.',
    },
    list(order, { prev, cur }, [[cur, 'active']]),
  );
  while (cur) {
    const next: ListNode | null = cur.next;
    t.add(
      'save',
      {
        en: `Before changing ${cur.val}'s arrow, save where it points (${next ? next.val : 'null'}) in \`next\` — otherwise the rest of the list would be lost.`,
        es: `Antes de cambiar la flecha de ${cur.val}, guarda a dónde apunta (${next ? next.val : 'null'}) en \`next\`; si no, se perdería el resto de la lista.`,
      },
      list(order, { prev, cur, next }, [[cur, 'active'], [next, 'compare']]),
    );
    cur.next = prev;
    t.add(
      'flip',
      {
        en: `Turn ${cur.val}'s arrow around: it now points **back** to ${prev ? prev.val : 'null'}.`,
        es: `Voltea la flecha de ${cur.val}: ahora apunta **hacia atrás**, a ${prev ? prev.val : 'null'}.`,
      },
      list(order, { prev, cur, next }, [[cur, 'good'], [next, 'compare']]),
    );
    prev = cur;
    cur = next;
    t.add(
      'step',
      {
        en: `Move both pointers one node forward. Everything up to ${prev.val} is reversed.`,
        es: `Avanza ambos punteros un nodo. Todo hasta ${prev.val} ya está invertido.`,
      },
      list(order, { prev, cur }, [[cur, 'active'], [prev, 'done']]),
    );
  }
  t.add(
    'done',
    {
      en: `\`cur\` ran off the end. \`prev\` is the last node we handled — the **new head**${prev ? ` (${prev.val})` : ''}. No extra memory was used; only arrows changed.`,
      es: `\`cur\` se salió del final. \`prev\` es el último nodo que procesamos: la **nueva cabeza**${prev ? ` (${prev.val})` : ''}. No se usó memoria extra; solo cambiaron las flechas.`,
    },
    list(order, { 'new head': prev }, order.map((n): [ListNode, 'done'] => [n, 'done'])),
  );
  return t.frames;
}

export const reverse: Problem = {
  id: 'reverse',
  title: { en: 'Reverse a linked list', es: 'Invertir una lista enlazada' },
  difficulty: 'Easy',
  statement: [
    {
      en: 'Reverse a singly linked list and return its new head. Do it **in place**: with O(1) extra memory.',
      es: 'Invierte una lista simplemente enlazada y devuelve su nueva cabeza. Hazlo **en el lugar**: con O(1) de memoria extra.',
    },
  ],
  examples: [{ input: 'list = 1 → 2 → 3 → 4 → 5', output: '5 → 4 → 3 → 2 → 1' }],
  insight: {
    en: 'Do not move the values — **turn the arrows around**. Each node currently points forward; make it point at the node behind it instead. Walk the list once holding three references: the node behind (`prev`), the node you are on (`cur`), and the node ahead (`next`, saved *before* you overwrite `cur.next`, or the rest of the list is lost).',
    es: 'No muevas los valores: **voltea las flechas**. Cada nodo ahora apunta hacia adelante; haz que apunte al nodo que tiene detrás. Recorre la lista una vez con tres referencias: el nodo de atrás (`prev`), el nodo en el que estás (`cur`) y el nodo de adelante (`next`, guardado *antes* de sobrescribir `cur.next`, o se pierde el resto de la lista).',
  },
  approaches: [
    {
      id: 'values',
      label: { en: 'Copy values to an array', es: 'Copiar los valores a un arreglo' },
      kind: 'brute',
      fn: reverseListValues,
      time: 'O(n)',
      space: 'O(n)',
      note: {
        en: 'Two passes and an array as large as the list. It also only works when values are cheap to copy — it does not actually reverse the nodes.',
        es: 'Dos pasadas y un arreglo tan grande como la lista. Además, solo funciona cuando copiar los valores es barato: en realidad no invierte los nodos.',
      },
    },
    {
      id: 'inplace',
      label: { en: 'Reverse the pointers', es: 'Invertir los punteros' },
      kind: 'optimal',
      fn: reverseList,
      time: 'O(n)',
      space: 'O(1)',
      note: {
        en: 'One pass, three variables. Memorise the four lines in the loop: save next, flip, advance prev, advance cur.',
        es: 'Una pasada, tres variables. Memoriza las cuatro líneas del bucle: guardar next, voltear, avanzar prev, avanzar cur.',
      },
    },
  ],
  code,
  mutates: true,
  adapt: { in: (args) => [buildList(args[0])], out: (head: ListNode | null) => listToArray(head) },
  cases: [
    { name: { en: 'five nodes', es: 'cinco nodos' }, args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
    { name: { en: 'empty list', es: 'lista vacía' }, args: [[]], expected: [] },
    { name: { en: 'single node', es: 'un solo nodo' }, args: [[1]], expected: [1] },
    { name: { en: 'two nodes', es: 'dos nodos' }, args: [[1, 2]], expected: [2, 1] },
    { name: { en: 'duplicates', es: 'repetidos' }, args: [[7, 7, 3, 7]], expected: [7, 3, 7, 7] },
    { name: { en: 'palindrome stays the same', es: 'un palíndromo queda igual' }, args: [[1, 2, 1]], expected: [1, 2, 1] },
    { name: { en: 'negative values', es: 'valores negativos' }, args: [[-1, 0, 1]], expected: [1, 0, -1] },
    { name: { en: 'even length', es: 'longitud par' }, args: [[1, 2, 3, 4]], expected: [4, 3, 2, 1] },
  ],
  bench: { sizes: [100, 1000, 10_000, 100_000], nLabel: { en: 'number of nodes', es: 'número de nodos' }, gen: (n) => [randArray(n, 0, 99)] },
  demo: {
    inputs: [{ name: 'list values', value: '[1, 2, 3, 4, 5]' }],
    validate: (vals) => numsErr(vals, 9, { en: 'The list', es: 'La lista' }),
    traces: { inplace: trace },
  },
};
