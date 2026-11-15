import code from './kth-smallest.ts?code';
import { first, intErr, treeErr } from '../../lib/check';
import { bstLevels, buildTree, distinctSorted, randInt, TreeNode } from '../../lib/ds';
import { Tracer, arr, tree, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { treeIn } from './_util';

// #region sort
export function kthSmallestSort(root: TreeNode | null, k: number): number {
  const values: number[] = [];
  const collect = (node: TreeNode | null): void => {
    if (node === null) return;
    values.push(node.val);
    collect(node.left);
    collect(node.right);
  };
  collect(root); // every node, in no useful order
  values.sort((a, b) => a - b);
  return values[k - 1];
}
// #endregion

// #region inorder
export function kthSmallest(root: TreeNode | null, k: number): number {
  const stack: TreeNode[] = [];
  let node = root;
  while (node !== null || stack.length > 0) {
    while (node !== null) {
      stack.push(node); // @push
      node = node.left;
    }
    node = stack.pop() as TreeNode; // @pop
    k--; // this is the next-smallest value
    if (k === 0) return node.val; // @found
    node = node.right; // @right
  }
  return -1; // k was larger than the tree
}
// #endregion

function trace(lv: (number | null)[], k: number) {
  const t = new Tracer();
  const root = buildTree(lv);
  const stack: TreeNode[] = [];
  const done = new Set<TreeNode>();
  const badge = new Map<TreeNode, string>();
  let rank = 0;
  const snap = (cur: TreeNode | null, tone: Tone = 'active') => [
    tree(root, [...[...done].map((n): [TreeNode, Tone] => [n, 'done']), ...stack.map((n): [TreeNode, Tone] => [n, 'window']), [cur, tone]], badge),
    arr(stack.map((n) => n.val), { label: { en: 'stack', es: 'pila' }, layout: 'stack' as const }),
    vars({ k, 'values counted': rank }),
  ];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      t.add('push', { en: `Go left from ${node.val}: smaller values live there. Remember ${node.val} on the stack.`, es: `Ve a la izquierda desde ${node.val}: ahí están los valores menores. Guarda ${node.val} en la pila.` }, ...snap(node));
      node = node.left;
    }
    node = stack.pop()!;
    rank++;
    badge.set(node, `#${rank}`);
    if (rank === k) {
      t.add('found', {
        en: `${node.val} is the **${k}${k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} smallest**. Stop here — the rest of the tree is never visited.`,
        es: `${node.val} es el **${k}.º más pequeño**. Detente aquí: el resto del árbol nunca se visita.`,
      }, ...snap(node, 'good'));
      return t.frames;
    }
    done.add(node);
    t.add('pop', { en: `Nothing smaller is left, so ${node.val} is value #${rank} in sorted order. Not the ${k}th yet.`, es: `No queda nada menor, así que ${node.val} es el valor #${rank} en orden. Todavía no es el ${k}.º.` }, ...snap(node));
    if (node.right) t.add('right', { en: `The next-smallest values are in the right subtree of ${node.val}.`, es: `Los siguientes valores más pequeños están en el subárbol derecho de ${node.val}.` }, ...snap(node.right));
    node = node.right;
  }
  t.add(undefined, { en: `The tree has fewer than ${k} nodes.`, es: `El árbol tiene menos de ${k} nodos.` }, ...snap(null));
  return t.frames;
}

export const kthSmallestProblem: Problem = {
  id: 'kth-smallest',
  title: { en: 'K-th smallest value in a BST', es: 'K-ésimo valor más pequeño en un BST' },
  difficulty: 'Medium',
  statement: [{ en: 'Given the root of a binary search tree and a number `k` (1-based), return the k-th smallest value in the tree.', es: 'Dada la raíz de un árbol binario de búsqueda y un número `k` (empezando en 1), devuelve el k-ésimo valor más pequeño del árbol.' }],
  examples: [{ input: 'root = [5, 3, 6, 2, 4, null, null, 1], k = 3', output: '3', why: { en: 'In sorted order the values are 1, 2, 3, 4, 5, 6.', es: 'En orden, los valores son 1, 2, 3, 4, 5, 6.' } }],
  insight:
    { en: 'An **in-order traversal of a BST visits values in ascending order** — the tree is already sorted, you just have to read it correctly. So there is nothing to sort: walk in-order, count nodes as you visit them, and stop at the k-th. Using an explicit stack makes "stop right now" trivial.', es: 'Un **recorrido in-order de un BST visita los valores en orden ascendente**: el árbol ya está ordenado, solo tienes que leerlo bien. Así que no hay nada que ordenar: recorre in-order, cuenta los nodos al visitarlos y detente en el k-ésimo. Usar una pila explícita hace trivial "detenerse ya mismo".' },
  approaches: [
    {
      id: 'sort',
      label: { en: 'Collect everything, then sort', es: 'Recolectar todo y luego ordenar' },
      kind: 'brute',
      fn: kthSmallestSort,
      time: 'O(n log n)',
      space: 'O(n)',
      note: { en: 'Treats the BST like a bag of numbers: copies all n values out and sorts them, re-creating an order the tree already had.', es: 'Trata el BST como una bolsa de números: copia los n valores y los ordena, recreando un orden que el árbol ya tenía.' },
    },
    {
      id: 'inorder',
      label: { en: 'In-order walk, stop at k', es: 'Recorrido in-order, detenerse en k' },
      kind: 'optimal',
      fn: kthSmallest,
      time: 'O(h + k)',
      space: 'O(h)',
      note: { en: 'Descends to the smallest value (h steps), then visits k nodes. For small k on a big balanced tree it touches only a tiny corner of the tree.', es: 'Baja hasta el valor más pequeño (h pasos) y luego visita k nodos. Para un k pequeño en un árbol grande y balanceado, solo toca un rincón diminuto del árbol.' },
    },
  ],
  code,
  adapt: { in: treeIn },
  cases: [
    { name: { en: 'k in the middle', es: 'k en el medio' }, args: [[5, 3, 6, 2, 4, null, null, 1], 3], expected: 3 },
    { name: { en: 'smallest (k = 1)', es: 'el más pequeño (k = 1)' }, args: [[3, 1, 4, null, 2], 1], expected: 1 },
    { name: { en: 'single node', es: 'un solo nodo' }, args: [[7], 1], expected: 7 },
    { name: { en: 'largest (k = n)', es: 'el más grande (k = n)' }, args: [[5, 3, 6, 2, 4, null, null, 1], 6], expected: 6 },
    { name: { en: 'k-th is the root', es: 'el k-ésimo es la raíz' }, args: [[5, 3, 6, 2, 4, null, null, 1], 5], expected: 5 },
    { name: { en: 'right chain', es: 'cadena a la derecha' }, args: [[1, null, 2, null, 3], 2], expected: 2 },
    { name: { en: 'left chain', es: 'cadena a la izquierda' }, args: [[3, 2, null, 1], 3], expected: 3 },
    { name: { en: 'negative values', es: 'valores negativos' }, args: [[0, -4, 9, -7, -1], 2], expected: -4 },
    { name: { en: 'answer in the right subtree', es: 'respuesta en el subárbol derecho' }, args: [[8, 4, 12, 2, 6, 10, 14], 6], expected: 12 },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'number of nodes (balanced BST, k ≤ 10)', es: 'número de nodos (BST balanceado, k ≤ 10)' },
    gen: (n) => [bstLevels(distinctSorted(n)), randInt(1, Math.min(n, 10))],
  },
  demo: {
    inputs: [
      { name: 'BST (level order)', value: '[20, 10, 30, 5, 15, 25, 35, 2, 7]' },
      { name: 'k', value: '4' },
    ],
    validate: (levels, k) => first(treeErr(levels, 12), intErr(k, 'k', 1, (levels as unknown[]).filter((x) => x !== null).length)),
    traces: { inorder: trace },
  },
};
