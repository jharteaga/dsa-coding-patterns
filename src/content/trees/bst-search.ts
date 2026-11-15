import code from './bst-search.ts?code';
import { first, intErr, treeErr } from '../../lib/check';
import { bstLevels, buildTree, distinctSorted, randInt, TreeNode } from '../../lib/ds';
import { Tracer, tree, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { treeIn } from './_util';

// #region dfs
export function containsDfs(root: TreeNode | null, target: number): boolean {
  if (root === null) return false;
  if (root.val === target) return true; // @check
  // Ignores the ordering: looks in both subtrees.
  return containsDfs(root.left, target) || containsDfs(root.right, target); // @both
}
// #endregion

// #region bst
export function contains(root: TreeNode | null, target: number): boolean {
  let node = root; // @init
  while (node !== null) {
    if (target === node.val) return true; // @found
    node = target < node.val ? node.left : node.right; // @step
  }
  return false; // @miss
}
// #endregion

function traceDfs(lv: (number | null)[], target: number) {
  const t = new Tracer();
  const root = buildTree(lv);
  const seen = new Set<TreeNode>();
  let n = 0;
  const go = (node: TreeNode | null): boolean => {
    if (!node) return false;
    n++;
    const hit = node.val === target;
    t.add('check', hit
        ? { en: `${node.val} is the target. Found after checking ${n} node(s).`, es: `${node.val} es el objetivo. Encontrado tras revisar ${n} nodo(s).` }
        : { en: `Is ${node.val} the target ${target}? No. Search its left subtree, then its right subtree.`, es: `¿${node.val} es el objetivo ${target}? No. Busca en su subárbol izquierdo y luego en el derecho.` }, tree(root, [...[...seen].map((x): [TreeNode, Tone] => [x, 'muted']), [node, hit ? 'good' : 'active']]), vars({ 'nodes checked': n }));
    seen.add(node);
    return hit || go(node.left) || go(node.right);
  };
  if (!go(root)) t.add(undefined, { en: `Checked all ${n} nodes: ${target} is not in the tree.`, es: `Se revisaron los ${n} nodos: ${target} no está en el árbol.` }, tree(root, [...seen].map((x): [TreeNode, Tone] => [x, 'muted'])), vars({ 'nodes checked': n }));
  return t.frames;
}

function traceBst(lv: (number | null)[], target: number) {
  const t = new Tracer();
  const root = buildTree(lv);
  const path: TreeNode[] = [];
  let node = root;
  t.add('init', {
      en: `In a binary search tree, everything in a node's left subtree is smaller and everything in its right subtree is larger. Start at the root.`,
      es: `En un árbol binario de búsqueda, todo lo que hay en el subárbol izquierdo de un nodo es menor y todo lo del subárbol derecho es mayor. Empieza en la raíz.`,
    }, tree(root, [[root, 'active']]));
  while (node) {
    if (node.val === target) {
      t.add('found', { en: `${node.val} is the target. Found after checking only ${path.length + 1} node(s) — one per level.`, es: `${node.val} es el objetivo. Encontrado tras revisar solo ${path.length + 1} nodo(s): uno por nivel.` }, tree(root, [...path.map((x): [TreeNode, Tone] => [x, 'window']), [node, 'good']]), vars({ 'nodes checked': path.length + 1 }));
      return t.frames;
    }
    const left = target < node.val;
    t.add('step', {
        en: `${target} is ${left ? 'smaller' : 'larger'} than ${node.val}, so it can only be in the **${left ? 'left' : 'right'}** subtree. The whole ${left ? 'right' : 'left'} subtree is skipped without looking.`,
        es: `${target} es ${left ? 'menor' : 'mayor'} que ${node.val}, así que solo puede estar en el subárbol **${left ? 'izquierdo' : 'derecho'}**. Todo el subárbol ${left ? 'derecho' : 'izquierdo'} se descarta sin mirarlo.`,
      }, tree(root, [...path.map((x): [TreeNode, Tone] => [x, 'window']), [node, 'active'], [left ? node.right : node.left, 'muted']]), vars({ 'nodes checked': path.length + 1 }));
    path.push(node);
    node = left ? node.left : node.right;
  }
  t.add('miss', { en: `Fell off the tree: ${target} is not present. Checked ${path.length} node(s).`, es: `Nos salimos del árbol: ${target} no está. Se revisaron ${path.length} nodo(s).` }, tree(root, path.map((x): [TreeNode, Tone] => [x, 'window'])), vars({ 'nodes checked': path.length }));
  return t.frames;
}

const isBst = (root: TreeNode | null, lo = -Infinity, hi = Infinity): boolean => !root || (root.val > lo && root.val < hi && isBst(root.left, lo, root.val) && isBst(root.right, root.val, hi));

export const bstSearch: Problem = {
  id: 'bst-search',
  title: { en: 'Search in a binary search tree', es: 'Búsqueda en un árbol binario de búsqueda' },
  difficulty: 'Easy',
  statement: [
    { en: 'Given the root of a **binary search tree** (BST) and a `target`, return whether the target is in the tree.', es: 'Dada la raíz de un **árbol binario de búsqueda** (BST) y un `target`, devuelve si el objetivo está en el árbol.' },
    { en: 'A BST obeys one rule at every node: all values in the left subtree are smaller than the node, all values in the right subtree are larger.', es: 'Un BST cumple una regla en cada nodo: todos los valores del subárbol izquierdo son menores que el nodo y todos los del subárbol derecho son mayores.' },
  ],
  examples: [{ input: 'root = [8, 4, 12, 2, 6, 10, 14], target = 10', output: 'true', why: { en: '10 > 8 → go right to 12; 10 < 12 → go left to 10.', es: '10 > 8 → ve a la derecha, a 12; 10 < 12 → ve a la izquierda, a 10.' } }],
  insight:
    { en: 'The BST rule means one comparison at a node tells you which entire subtree **cannot** contain the target. So you never branch: you walk a single path from the root down. This is binary search, with the tree’s shape playing the role of the `mid` calculation.', es: 'La regla del BST significa que una comparación en un nodo te dice qué subárbol completo **no puede** contener el objetivo. Así que nunca te ramificas: recorres un único camino desde la raíz hacia abajo. Es búsqueda binaria, donde la forma del árbol hace el papel del cálculo de `mid`.' },
  approaches: [
    {
      id: 'dfs',
      label: { en: 'Plain DFS (ignores the ordering)', es: 'DFS simple (ignora el orden)' },
      kind: 'brute',
      fn: containsDfs,
      time: 'O(n)',
      space: 'O(h)',
      note: { en: 'Works on any binary tree — which is the giveaway that it wastes the BST property. It may visit every node.', es: 'Funciona en cualquier árbol binario, y eso delata que desperdicia la propiedad del BST. Puede visitar todos los nodos.' },
    },
    {
      id: 'bst',
      label: { en: 'Follow the ordering', es: 'Seguir el orden' },
      kind: 'optimal',
      fn: contains,
      time: 'O(h)',
      space: 'O(1)',
      note: { en: 'One node per level. h is about log₂(n) for a balanced tree (20 steps for a million nodes) — but n for a tree that degenerated into a chain, which is why balanced trees matter.', es: 'Un nodo por nivel. h es aproximadamente log₂(n) en un árbol balanceado (20 pasos para un millón de nodos), pero n en un árbol que degeneró en una cadena; por eso importan los árboles balanceados.' },
    },
  ],
  code,
  adapt: { in: treeIn },
  cases: [
    { name: { en: 'found deep in the tree', es: 'encontrado en lo profundo del árbol' }, args: [[8, 4, 12, 2, 6, 10, 14], 10], expected: true },
    { name: { en: 'missing (would be a leaf’s child)', es: 'ausente (sería hijo de una hoja)' }, args: [[8, 4, 12, 2, 6, 10, 14], 7], expected: false },
    { name: { en: 'empty tree', es: 'árbol vacío' }, args: [[], 1], expected: false },
    { name: { en: 'single node, found', es: 'un solo nodo, encontrado' }, args: [[5], 5], expected: true },
    { name: { en: 'single node, missing', es: 'un solo nodo, ausente' }, args: [[5], 6], expected: false },
    { name: { en: 'target is the root', es: 'el objetivo es la raíz' }, args: [[8, 4, 12], 8], expected: true },
    { name: { en: 'smallest value', es: 'valor más pequeño' }, args: [[8, 4, 12, 2, 6, 10, 14], 2], expected: true },
    { name: { en: 'largest value', es: 'valor más grande' }, args: [[8, 4, 12, 2, 6, 10, 14], 14], expected: true },
    { name: { en: 'degenerate chain', es: 'cadena degenerada' }, args: [[1, null, 2, null, 3, null, 4], 4], expected: true },
    { name: { en: 'negative values', es: 'valores negativos' }, args: [[0, -5, 5, -8, -2], -2], expected: true },
    { name: { en: 'smaller than everything', es: 'menor que todo' }, args: [[8, 4, 12], -100], expected: false },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'number of nodes (balanced BST)', es: 'número de nodos (BST balanceado)' },
    gen: (n) => {
      const vals = distinctSorted(n);
      return [bstLevels(vals), Math.random() < 0.5 ? vals[n - 1] + 7 : vals[randInt(0, n - 1)]];
    },
  },
  demo: {
    inputs: [
      { name: 'BST (level order)', value: '[20, 10, 30, 5, 15, 25, 35, 2, 7, 12, 18]' },
      { name: 'target', value: '18' },
    ],
    validate: (levels, target) => first(treeErr(levels, 15), intErr(target, 'target'), isBst(buildTree(levels)) ? null : { en: 'That tree is not a valid binary search tree (left < node < right must hold everywhere).', es: 'Ese árbol no es un árbol binario de búsqueda válido (izquierda < nodo < derecha debe cumplirse en todas partes).' }),
    traces: { dfs: traceDfs, bst: traceBst },
  },
};
