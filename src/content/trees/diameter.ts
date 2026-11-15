import code from './diameter.ts?code';
import { treeErr } from '../../lib/check';
import { buildTree, randTreeLevels, TreeNode } from '../../lib/ds';
import { Tracer, tree, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { chainLevels, treeIn } from './_util';

// #region brute
export function diameterBrute(root: TreeNode | null): number {
  const height = (node: TreeNode | null): number =>
    node === null ? 0 : 1 + Math.max(height(node.left), height(node.right));

  if (root === null) return 0;
  // Longest path that bends at this node...
  const through = height(root.left) + height(root.right);
  // ...or the longest path somewhere below it. height() is recomputed
  // from scratch for every single node.
  return Math.max(through, diameterBrute(root.left), diameterBrute(root.right));
}
// #endregion

// #region onepass
export function diameter(root: TreeNode | null): number {
  let best = 0;
  // Returns the height of `node`, and updates `best` on the way back up.
  const height = (node: TreeNode | null): number => {
    if (node === null) return 0; // @null
    const left = height(node.left); // @left
    const right = height(node.right); // @right
    best = Math.max(best, left + right); // @update
    return 1 + Math.max(left, right); // @return
  };
  height(root);
  return best; // @done
}
// #endregion

function trace(levels: (number | null)[]) {
  const t = new Tracer();
  const root = buildTree(levels);
  let best = 0;
  let bestAt: TreeNode | null = null;
  const h = new Map<TreeNode, string>();
  const done = new Set<TreeNode>();
  const snap = (cur: TreeNode | null, tone: Tone = 'active') => tree(root, [...[...done].map((n): [TreeNode, Tone] => [n, 'done']), [bestAt, 'compare'], [cur, tone]], h);
  const height = (node: TreeNode | null): number => {
    if (!node) return 0;
    t.add('left', {
        en: `Enter ${node.val}. We cannot say anything about it until both children have reported their heights, so go down first.`,
        es: `Entramos a ${node.val}. No podemos decir nada de él hasta que ambos hijos reporten sus alturas, así que primero bajamos.`,
      }, snap(node), vars({ best }));
    const l = height(node.left);
    const r = height(node.right);
    const through = l + r;
    const improved = through > best;
    if (improved) {
      best = through;
      bestAt = node;
    }
    t.add('update', {
        en: `Back at ${node.val}: left height ${l}, right height ${r}. The longest path that bends here uses both sides: ${l} + ${r} = **${through}** edges.${improved ? ' That is a new best.' : ` Not better than ${best}.`}`,
        es: `De vuelta en ${node.val}: altura izquierda ${l}, altura derecha ${r}. El camino más largo que se dobla aquí usa ambos lados: ${l} + ${r} = **${through}** aristas.${improved ? ' Es un nuevo mejor valor.' : ` No supera a ${best}.`}`,
      }, snap(node), vars({ left: l, right: r, 'left + right': through, best }));
    const mine = 1 + Math.max(l, r);
    h.set(node, `h=${mine}`);
    done.add(node);
    t.add('return', {
        en: `Report upward: the height of ${node.val} is 1 + max(${l}, ${r}) = **${mine}**. The parent only needs this one number.`,
        es: `Reporta hacia arriba: la altura de ${node.val} es 1 + max(${l}, ${r}) = **${mine}**. El padre solo necesita este número.`,
      }, snap(node, 'good'), vars({ best }));
    return mine;
  };
  height(root);
  t.add('done', {
      en: `Every node was visited exactly once. The diameter is **${best}** edges${bestAt ? ` (the longest path bends at node ${(bestAt as TreeNode).val})` : ''}.`,
      es: `Cada nodo se visitó exactamente una vez. El diámetro es de **${best}** aristas${bestAt ? ` (el camino más largo se dobla en el nodo ${(bestAt as TreeNode).val})` : ''}.`,
    }, snap(null), vars({ best }));
  return t.frames;
}

export const diameterProblem: Problem = {
  id: 'diameter',
  title: { en: 'Diameter of a binary tree', es: 'Diámetro de un árbol binario' },
  difficulty: 'Easy',
  statement: [
    { en: 'The **diameter** of a binary tree is the number of edges on the longest path between any two nodes. The path does not have to pass through the root. Return the diameter.', es: 'El **diámetro** de un árbol binario es el número de aristas del camino más largo entre dos nodos cualesquiera. El camino no tiene que pasar por la raíz. Devuelve el diámetro.' },
  ],
  examples: [{ input: 'root = [1, 2, 3, 4, 5]', output: '3', why: { en: 'The longest path is 4 → 2 → 1 → 3 (or 5 → 2 → 1 → 3): three edges.', es: 'El camino más largo es 4 → 2 → 1 → 3 (o 5 → 2 → 1 → 3): tres aristas.' } }],
  insight:
    { en: 'The longest path that "bends" at a node is `height(left) + height(right)`. The brute force asks for those heights at every node and recomputes them from scratch each time. But a function that computes height already visits every node — so let it **do both jobs**: on the way back up, each call returns its height to its parent *and* checks whether left + right beats the best path seen so far. One pass, no repeated work.', es: 'El camino más largo que "se dobla" en un nodo es `height(left) + height(right)`. La fuerza bruta pide esas alturas en cada nodo y las recalcula desde cero cada vez. Pero una función que calcula la altura ya visita cada nodo, así que deja que **haga ambos trabajos**: de regreso hacia arriba, cada llamada devuelve su altura al padre *y* comprueba si izquierda + derecha supera el mejor camino visto hasta ahora. Una pasada, sin trabajo repetido.' },
  approaches: [
    {
      id: 'brute',
      label: { en: 'Recompute height at every node', es: 'Recalcular la altura en cada nodo' },
      kind: 'brute',
      fn: diameterBrute,
      time: 'O(n²)',
      space: 'O(h)',
      note: { en: 'For each of the n nodes, `height()` walks that node’s entire subtree again. On a balanced tree this is O(n log n); on a tree that degenerated into a chain it is O(n²).', es: 'Para cada uno de los n nodos, `height()` recorre otra vez todo el subárbol de ese nodo. En un árbol balanceado esto es O(n log n); en un árbol que degeneró en una cadena es O(n²).' },
    },
    {
      id: 'onepass',
      label: { en: 'One post-order pass', es: 'Una pasada post-order' },
      kind: 'optimal',
      fn: diameter,
      time: 'O(n)',
      space: 'O(h)',
      note: { en: 'Post-order (children first, then the node) is the natural order whenever a node’s answer depends on its children’s answers. Each node does constant work.', es: 'Post-order (primero los hijos, luego el nodo) es el orden natural cuando la respuesta de un nodo depende de las respuestas de sus hijos. Cada nodo hace trabajo constante.' },
    },
  ],
  code,
  adapt: { in: treeIn },
  cases: [
    { name: { en: 'path through the root', es: 'camino por la raíz' }, args: [[1, 2, 3, 4, 5]], expected: 3 },
    { name: { en: 'empty tree', es: 'árbol vacío' }, args: [[]], expected: 0 },
    { name: { en: 'single node', es: 'un solo nodo' }, args: [[1]], expected: 0 },
    { name: { en: 'two nodes', es: 'dos nodos' }, args: [[1, 2]], expected: 1 },
    { name: { en: 'longest path does NOT pass through the root', es: 'el camino más largo NO pasa por la raíz' }, args: [[1, 2, null, 3, 4, 5, null, null, 6]], expected: 4 },
    { name: { en: 'left chain', es: 'cadena a la izquierda' }, args: [[1, 2, null, 3, null, 4]], expected: 3 },
    { name: { en: 'right chain', es: 'cadena a la derecha' }, args: [[1, null, 2, null, 3]], expected: 2 },
    { name: { en: 'perfect tree of 7', es: 'árbol perfecto de 7' }, args: [[1, 2, 3, 4, 5, 6, 7]], expected: 4 },
    { name: { en: 'lopsided', es: 'desbalanceado' }, args: [[1, 2, 3, null, null, 4, null, 5]], expected: 4 },
  ],
  bench: {
    sizes: [100, 1000, 5000],
    nLabel: { en: 'number of nodes (worst case: a chain)', es: 'número de nodos (peor caso: una cadena)' },
    gen: (n) => [n < 20 ? randTreeLevels(n) : chainLevels(Array.from({ length: n }, (_, i) => i), 'left')],
  },
  demo: {
    inputs: [{ name: 'tree (level order)', value: '[1, 2, 3, 4, 5, null, null, 6, null, null, 7]' }],
    validate: (levels) => treeErr(levels, 12),
    traces: { onepass: trace },
  },
};
