import code from './inorder.ts?code';
import { treeErr } from '../../lib/check';
import { buildTree, randTreeLevels, TreeNode } from '../../lib/ds';
import { Tracer, arr, tree } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { treeIn } from './_util';

// #region recursive
export function inorderRecursive(root: TreeNode | null): number[] {
  const out: number[] = [];
  const visit = (node: TreeNode | null): void => {
    if (node === null) return; // @base
    visit(node.left); // @left
    out.push(node.val); // @visit
    visit(node.right); // @right
  };
  visit(root);
  return out; // @done
}
// #endregion

// #region iterative
export function inorderIterative(root: TreeNode | null): number[] {
  const out: number[] = [];
  const stack: TreeNode[] = [];
  let node = root;
  while (node !== null || stack.length > 0) {
    while (node !== null) {
      stack.push(node); // @push
      node = node.left;
    }
    node = stack.pop() as TreeNode; // @pop
    out.push(node.val); // @visit
    node = node.right; // @right
  }
  return out; // @done
}
// #endregion

function traceRecursive(levels: (number | null)[]) {
  const t = new Tracer();
  const root = buildTree(levels);
  const out: number[] = [];
  const done = new Set<TreeNode>();
  const path: TreeNode[] = [];
  const snap = (cur: TreeNode | null, tone: Tone = 'active') => [
    tree(root, [...[...done].map((n): [TreeNode, Tone] => [n, 'done']), ...path.map((n): [TreeNode, Tone] => [n, 'window']), [cur, tone]]),
    arr(path.map((n) => n.val), { label: { en: 'call stack (functions waiting to finish)', es: 'pila de llamadas (funciones esperando terminar)' }, layout: 'stack' as const }),
    arr(out, { label: { en: 'output', es: 'salida' } }),
  ];
  const visit = (node: TreeNode | null) => {
    if (!node) return;
    path.push(node);
    t.add('left', {
        en: `Enter node ${node.val}. In-order means **left subtree first**, so before doing anything with ${node.val} we go left${node.left ? '' : ' (nothing there)'}.`,
        es: `Entramos al nodo ${node.val}. In-order significa **primero el subárbol izquierdo**, así que antes de hacer algo con ${node.val} vamos a la izquierda${node.left ? '' : ' (no hay nada)'}.`,
      }, ...snap(node));
    visit(node.left);
    out.push(node.val);
    done.add(node);
    t.add('visit', {
        en: `Everything to the left of ${node.val} is finished, so now we **visit ${node.val}**: add it to the output.`,
        es: `Todo lo que está a la izquierda de ${node.val} ya terminó, así que ahora **visitamos ${node.val}**: lo agregamos a la salida.`,
      }, ...snap(node, 'good'));
    if (node.right) t.add('right', { en: `Then handle everything to the right of ${node.val}.`, es: `Luego procesamos todo lo que está a la derecha de ${node.val}.` }, ...snap(node, 'good'));
    visit(node.right);
    path.pop();
  };
  visit(root);
  t.add('done', root
      ? { en: `All nodes visited. In-order result: **[${out.join(', ')}]**.`, es: `Todos los nodos visitados. Resultado in-order: **[${out.join(', ')}]**.` }
      : { en: 'The tree is empty, so the result is **[]**.', es: 'El árbol está vacío, así que el resultado es **[]**.' }, ...snap(null));
  return t.frames;
}

function traceIterative(levels: (number | null)[]) {
  const t = new Tracer();
  const root = buildTree(levels);
  const out: number[] = [];
  const done = new Set<TreeNode>();
  const stack: TreeNode[] = [];
  const snap = (cur: TreeNode | null, tone: Tone = 'active') => [
    tree(root, [...[...done].map((n): [TreeNode, Tone] => [n, 'done']), ...stack.map((n): [TreeNode, Tone] => [n, 'window']), [cur, tone]]),
    arr(stack.map((n) => n.val), { label: { en: 'our own stack', es: 'nuestra propia pila' }, layout: 'stack' as const }),
    arr(out, { label: { en: 'output', es: 'salida' } }),
  ];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      t.add('push', { en: `Push ${node.val} — we will come back to it — and keep walking left.`, es: `Apila ${node.val} (volveremos a él) y sigue caminando a la izquierda.` }, ...snap(node));
      node = node.left;
    }
    node = stack.pop()!;
    t.add('pop', { en: `Cannot go further left. Pop the most recent node: ${node.val}.`, es: `No se puede ir más a la izquierda. Desapila el nodo más reciente: ${node.val}.` }, ...snap(node));
    out.push(node.val);
    done.add(node);
    t.add('visit', { en: `Its left side is finished, so **visit ${node.val}**.`, es: `Su lado izquierdo ya terminó, así que **visita ${node.val}**.` }, ...snap(node, 'good'));
    if (node.right) t.add('right', { en: `Now move into the right subtree of ${node.val} and repeat.`, es: `Ahora entra al subárbol derecho de ${node.val} y repite.` }, ...snap(node.right));
    node = node.right;
  }
  t.add('done', { en: `Stack is empty and there is no current node: finished. Result: **[${out.join(', ')}]**.`, es: `La pila está vacía y no hay nodo actual: terminamos. Resultado: **[${out.join(', ')}]**.` }, ...snap(null));
  return t.frames;
}

export const inorder: Problem = {
  id: 'inorder',
  title: { en: 'In-order traversal (recursive vs iterative)', es: 'Recorrido in-order (recursivo vs. iterativo)' },
  difficulty: 'Easy',
  statement: [
    { en: 'Return the values of a binary tree in **in-order**: for every node, first its whole left subtree, then the node itself, then its whole right subtree.', es: 'Devuelve los valores de un árbol binario en **in-order**: para cada nodo, primero todo su subárbol izquierdo, luego el nodo mismo y luego todo su subárbol derecho.' },
    { en: 'Trees are written level by level, with `null` for a missing child: `[1, null, 2, 3]` is a root 1 whose right child 2 has a left child 3.', es: 'Los árboles se escriben nivel por nivel, con `null` para un hijo que falta: `[1, null, 2, 3]` es una raíz 1 cuyo hijo derecho 2 tiene un hijo izquierdo 3.' },
  ],
  examples: [{ input: 'root = [4, 2, 6, 1, 3, 5, 7]', output: '[1, 2, 3, 4, 5, 6, 7]', why: { en: 'On a binary search tree, in-order visits the values in sorted order.', es: 'En un árbol binario de búsqueda, in-order visita los valores en orden.' } }],
  insight:
    { en: 'There is no faster-than-O(n) traversal — every node must be visited once. The real lesson is that **recursion is a stack**. The recursive version uses the language’s call stack to remember "which nodes am I in the middle of?". The iterative version stores exactly the same information in an explicit stack that you control, which avoids stack-overflow errors on very deep trees.', es: 'No existe un recorrido más rápido que O(n): hay que visitar cada nodo una vez. La verdadera lección es que **la recursión es una pila**. La versión recursiva usa la pila de llamadas del lenguaje para recordar "¿en medio de qué nodos estoy?". La versión iterativa guarda exactamente la misma información en una pila explícita que tú controlas, lo que evita errores de desbordamiento de pila en árboles muy profundos.' },
  approaches: [
    {
      id: 'recursive',
      label: { en: 'Recursive DFS', es: 'DFS recursivo' },
      kind: 'optimal',
      fn: inorderRecursive,
      time: 'O(n)',
      space: 'O(h)',
      note: { en: 'Three lines: go left, visit, go right. Move the `out.push` line before or after both calls and you get pre-order or post-order. h is the height of the tree: the deepest chain of calls waiting at once.', es: 'Tres líneas: ve a la izquierda, visita, ve a la derecha. Mueve la línea `out.push` antes o después de ambas llamadas y obtienes pre-order o post-order. h es la altura del árbol: la cadena más profunda de llamadas esperando a la vez.' },
    },
    {
      id: 'iterative',
      label: { en: 'Iterative with a stack', es: 'Iterativo con una pila' },
      kind: 'optimal',
      fn: inorderIterative,
      time: 'O(n)',
      space: 'O(h)',
      note: { en: 'Walk left as far as possible, pushing every node. Pop one, visit it, then step into its right child and repeat.', es: 'Camina a la izquierda lo más que puedas, apilando cada nodo. Desapila uno, visítalo, luego entra a su hijo derecho y repite.' },
    },
  ],
  code,
  adapt: { in: treeIn },
  cases: [
    { name: { en: 'balanced search tree', es: 'árbol de búsqueda balanceado' }, args: [[4, 2, 6, 1, 3, 5, 7]], expected: [1, 2, 3, 4, 5, 6, 7] },
    { name: { en: 'empty tree', es: 'árbol vacío' }, args: [[]], expected: [] },
    { name: { en: 'single node', es: 'un solo nodo' }, args: [[1]], expected: [1] },
    { name: { en: 'right child with a left child', es: 'hijo derecho con un hijo izquierdo' }, args: [[1, null, 2, 3]], expected: [1, 3, 2] },
    { name: { en: 'left-skewed (a chain)', es: 'sesgado a la izquierda (una cadena)' }, args: [[3, 2, null, 1]], expected: [1, 2, 3] },
    { name: { en: 'right-skewed (a chain)', es: 'sesgado a la derecha (una cadena)' }, args: [[1, null, 2, null, 3]], expected: [1, 2, 3] },
    { name: { en: 'duplicates and negatives', es: 'duplicados y negativos' }, args: [[0, -1, 0, null, -1]], expected: [-1, -1, 0, 0] },
    { name: { en: 'only a left child', es: 'solo un hijo izquierdo' }, args: [[2, 1]], expected: [1, 2] },
    { name: { en: 'unbalanced', es: 'desbalanceado' }, args: [[5, 3, 8, 1, 4, null, 9, null, 2]], expected: [1, 2, 3, 4, 5, 8, 9] },
  ],
  bench: { sizes: [100, 1000, 10_000, 100_000], nLabel: { en: 'number of nodes', es: 'número de nodos' }, gen: (n) => [randTreeLevels(n)] },
  demo: {
    inputs: [{ name: 'tree (level order, null = no child)', value: '[4, 2, 6, 1, 3, 5, 7]' }],
    validate: (levels) => treeErr(levels, 12),
    traces: { recursive: traceRecursive, iterative: traceIterative },
  },
};
