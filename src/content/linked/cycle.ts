import code from './cycle.ts?code';
import { first, intErr, numsErr } from '../../lib/check';
import { buildList, ListNode, randArray, randInt } from '../../lib/ds';
import { Tracer, list } from '../../lib/trace';
import type { Problem } from '../../types';

// #region set
export function hasCycleSet(head: ListNode | null): boolean {
  const seen = new Set<ListNode>(); // remembers every node visited
  for (let node = head; node !== null; node = node.next) {
    if (seen.has(node)) return true; // been here before: we are going in circles
    seen.add(node);
  }
  return false; // reached the end
}
// #endregion

// #region floyd
export function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head; // @init
  while (fast !== null && fast.next !== null) {
    slow = (slow as ListNode).next; // 1 step // @move
    fast = fast.next.next; // 2 steps
    if (slow === fast) return true; // fast caught up from behind // @meet
  }
  return false; // fast fell off the end: no cycle // @end
}
// #endregion

const nodesOf = (head: ListNode | null) => {
  const order: ListNode[] = [];
  const seen = new Set<ListNode>();
  for (let n = head; n && !seen.has(n); n = n.next) (seen.add(n), order.push(n));
  return order;
};

function trace(vals: number[], pos: number) {
  const t = new Tracer();
  const head = buildList(vals, pos);
  const order = nodesOf(head);
  let slow = head;
  let fast = head;
  t.add(
    'init',
    {
      en: `Two pointers start at the head. **slow** will move 1 node per step, **fast** 2 nodes per step — like two runners on a track.`,
      es: `Dos punteros empiezan en la cabeza. **slow** avanzará 1 nodo por paso y **fast** 2 nodos por paso, como dos corredores en una pista.`,
    },
    list(order, { slow, fast }),
  );
  let steps = 0;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    steps++;
    if (slow === fast) {
      t.add(
        'meet',
        {
          en: `After ${steps} step(s) both pointers are on the same node (${slow!.val}). The only way the fast runner can meet the slow one again is by **lapping** it — so the list has a cycle.`,
          es: `Tras ${steps} paso(s) ambos punteros están en el mismo nodo (${slow!.val}). La única forma de que el corredor rápido vuelva a alcanzar al lento es **sacándole una vuelta**, así que la lista tiene un ciclo.`,
        },
        list(order, { slow, fast }, [[slow, 'good']]),
      );
      return t.frames;
    }
    t.add(
      'move',
      {
        en: `Step ${steps}: slow → ${slow!.val}, fast → ${fast ? fast.val : 'null'}.${fast ? '' : ' fast has run off the end.'}`,
        es: `Paso ${steps}: slow → ${slow!.val}, fast → ${fast ? fast.val : 'null'}.${fast ? '' : ' fast se salió del final.'}`,
      },
      list(order, { slow, fast }, [[slow, 'compare'], [fast, 'active']]),
    );
  }
  t.add(
    'end',
    {
      en: 'fast reached the end of the list (null). A list with an end cannot contain a cycle: **false**.',
      es: 'fast llegó al final de la lista (null). Una lista que tiene final no puede contener un ciclo: **false**.',
    },
    list(order, { slow, fast }),
  );
  return t.frames;
}

export const cycle: Problem = {
  id: 'cycle',
  title: { en: 'Detect a cycle in a linked list', es: 'Detectar un ciclo en una lista enlazada' },
  difficulty: 'Easy',
  statement: [
    {
      en: 'Return `true` if a singly linked list contains a **cycle** — that is, if following `next` pointers eventually leads back to a node already visited.',
      es: 'Devuelve `true` si una lista simplemente enlazada contiene un **ciclo**, es decir, si al seguir los punteros `next` terminas volviendo a un nodo ya visitado.',
    },
    {
      en: 'In the test cases a list is given as its values plus `pos`: the index the last node links back to (`-1` = no cycle).',
      es: 'En los casos de prueba, una lista se da como sus valores más `pos`: el índice al que apunta de vuelta el último nodo (`-1` = sin ciclo).',
    },
  ],
  examples: [
    {
      input: 'values = [3, 2, 0, -4], pos = 1',
      output: 'true',
      why: { en: 'The last node (−4) points back to the node at index 1.', es: 'El último nodo (−4) apunta de vuelta al nodo en el índice 1.' },
    },
    { input: 'values = [1, 2], pos = -1', output: 'false' },
  ],
  insight: {
    en: 'You cannot detect a loop by looking for the end — there isn’t one. Remembering every node works but costs O(n) memory. Instead, send two pointers at different speeds. If the list ends, the fast one finds the end. If it loops, both get trapped in the loop, and the fast one gains one node on the slow one every step — so it must land exactly on it within one lap. No memory needed.',
    es: 'No puedes detectar un bucle buscando el final: no lo hay. Recordar cada nodo funciona, pero cuesta O(n) de memoria. En su lugar, lanza dos punteros a velocidades distintas. Si la lista termina, el rápido encuentra el final. Si da vueltas, ambos quedan atrapados en el bucle y el rápido le gana un nodo al lento en cada paso, así que debe caer exactamente sobre él en menos de una vuelta. No hace falta memoria.',
  },
  approaches: [
    {
      id: 'set',
      label: { en: 'Remember every node', es: 'Recordar cada nodo' },
      kind: 'brute',
      fn: hasCycleSet,
      time: 'O(n)',
      space: 'O(n)',
      note: {
        en: 'Same time complexity, but stores a reference to every node. Here "brute force" means wasteful in **memory**, not time.',
        es: 'La misma complejidad de tiempo, pero guarda una referencia a cada nodo. Aquí "fuerza bruta" significa derrochar **memoria**, no tiempo.',
      },
    },
    {
      id: 'floyd',
      label: { en: 'Fast & slow pointers (Floyd)', es: 'Punteros rápido y lento (Floyd)' },
      kind: 'optimal',
      fn: hasCycle,
      time: 'O(n)',
      space: 'O(1)',
      note: {
        en: 'Compare nodes by identity (`===`), not by value — two different nodes can hold the same number.',
        es: 'Compara los nodos por identidad (`===`), no por valor: dos nodos distintos pueden guardar el mismo número.',
      },
    },
  ],
  code,
  adapt: { in: (args) => [buildList(args[0], args[1])] },
  cases: [
    { name: { en: 'tail links to the second node', es: 'la cola apunta al segundo nodo' }, args: [[3, 2, 0, -4], 1], expected: true },
    { name: { en: 'no cycle', es: 'sin ciclo' }, args: [[1, 2], -1], expected: false },
    { name: { en: 'empty list', es: 'lista vacía' }, args: [[], -1], expected: false },
    { name: { en: 'single node, no cycle', es: 'un solo nodo, sin ciclo' }, args: [[1], -1], expected: false },
    { name: { en: 'single node pointing to itself', es: 'un solo nodo que apunta a sí mismo' }, args: [[1], 0], expected: true },
    { name: { en: 'tail links to the head', es: 'la cola apunta a la cabeza' }, args: [[1, 2, 3, 4, 5], 0], expected: true },
    { name: { en: 'tail links to itself', es: 'la cola apunta a sí misma' }, args: [[1, 2, 3], 2], expected: true },
    { name: { en: 'duplicate values but no cycle', es: 'valores repetidos pero sin ciclo' }, args: [[1, 1, 1, 1], -1], expected: false },
    { name: { en: 'two nodes in a loop', es: 'dos nodos en un bucle' }, args: [[1, 2], 0], expected: true },
    { name: { en: 'long list, no cycle', es: 'lista larga, sin ciclo' }, args: [[1, 2, 3, 4, 5, 6, 7, 8], -1], expected: false },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'number of nodes', es: 'número de nodos' },
    gen: (n) => [randArray(n, 0, 9), n < 20 ? randInt(-1, n - 1) : -1],
  },
  demo: {
    inputs: [
      { name: 'values', value: '[3, 7, 1, 8, 4, 9, 2]' },
      { name: 'pos (index the tail links back to, -1 = none)', value: '2' },
    ],
    validate: (vals, pos) => first(numsErr(vals, 10, 'values', 1), intErr(pos, 'pos', -1, (vals as number[]).length - 1)),
    traces: { floyd: trace },
  },
};
