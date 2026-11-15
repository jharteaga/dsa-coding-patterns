import code from './path-sum.ts?code';
import { first, intErr, treeErr } from '../../lib/check';
import { buildTree, randInt, randTreeLevels, TreeNode } from '../../lib/ds';
import { Tracer, tree, vars } from '../../lib/trace';
import type { Text } from '../../i18n/text';
import type { Problem, Tone } from '../../types';
import { treeIn } from './_util';

// #region brute
export function hasPathSumBrute(root: TreeNode | null, target: number): boolean {
  // 1. Collect every root-to-leaf path as its own array.
  const paths: number[][] = [];
  const collect = (node: TreeNode | null, path: number[]): void => {
    if (node === null) return;
    const next = [...path, node.val]; // copies the whole path: O(h)
    if (node.left === null && node.right === null) paths.push(next);
    collect(node.left, next);
    collect(node.right, next);
  };
  collect(root, []);

  // 2. Add up each path and compare.
  for (const path of paths) {
    let sum = 0;
    for (const v of path) sum += v;
    if (sum === target) return true;
  }
  return false;
}
// #endregion

// #region dfs
export function hasPathSum(root: TreeNode | null, target: number): boolean {
  if (root === null) return false; // @null
  const remaining = target - root.val; // @enter
  if (root.left === null && root.right === null) return remaining === 0; // @leaf
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining); // @recurse
}
// #endregion

function trace(levels: (number | null)[], target: number) {
  const t = new Tracer();
  const root = buildTree(levels);
  const path: TreeNode[] = [];
  const dead = new Set<TreeNode>();
  const need = new Map<TreeNode, Text>();
  const snap = (cur: TreeNode | null, tone: Tone = 'active') =>
    tree(root, [...[...dead].map((n): [TreeNode, Tone] => [n, 'muted']), ...path.map((n): [TreeNode, Tone] => [n, 'window']), [cur, tone]], need);
  const go = (node: TreeNode | null, want: number): boolean => {
    if (!node) return false;
    const remaining = want - node.val;
    path.push(node);
    need.set(node, { en: `need ${remaining}`, es: `faltan ${remaining}` });
    t.add('enter', { en: `At node ${node.val} we still needed ${want}. Subtract this node: ${want} − ${node.val} = **${remaining}** still needed below it.`, es: `En el nodo ${node.val} todavía faltaban ${want}. Resta este nodo: ${want} − ${node.val} = **${remaining}** que aún faltan debajo de él.` }, snap(node), vars({ remaining }));
    if (!node.left && !node.right) {
      const ok = remaining === 0;
      t.add('leaf', ok
          ? {
              en: `${node.val} is a leaf and nothing more is needed: this root-to-leaf path adds up to ${target}. Return **true** — no need to look at the rest of the tree.`,
              es: `${node.val} es una hoja y no falta nada más: este camino de la raíz a la hoja suma ${target}. Devuelve **true**: no hace falta mirar el resto del árbol.`,
            }
          : { en: `${node.val} is a leaf but ${remaining} is still missing. This path fails; back up and try another branch.`, es: `${node.val} es una hoja pero todavía faltan ${remaining}. Este camino falla; retrocede y prueba otra rama.` }, snap(node, ok ? 'good' : 'bad'), vars({ remaining }));
      if (!ok) {
        dead.add(node);
        path.pop();
      }
      return ok;
    }
    t.add('recurse', { en: `${node.val} is not a leaf: ask its children whether any path below them adds up to ${remaining}.`, es: `${node.val} no es una hoja: pregunta a sus hijos si algún camino debajo de ellos suma ${remaining}.` }, snap(node), vars({ remaining }));
    const found = go(node.left, remaining) || go(node.right, remaining);
    if (!found) {
      dead.add(node);
      path.pop();
    }
    return found;
  };
  const found = go(root, target);
  if (!root) t.add('null', { en: 'The tree is empty: there is no path at all. Return **false**.', es: 'El árbol está vacío: no hay ningún camino. Devuelve **false**.' }, snap(null));
  else if (!found) t.add(undefined, { en: `Every root-to-leaf path was tried and none adds up to ${target}. Return **false**.`, es: `Se probaron todos los caminos de la raíz a una hoja y ninguno suma ${target}. Devuelve **false**.` }, snap(null));
  else t.add(undefined, { en: `The highlighted path adds up to ${target}. Answer: **true**.`, es: `El camino resaltado suma ${target}. Respuesta: **true**.` }, tree(root, path.map((n): [TreeNode, Tone] => [n, 'good'])));
  return t.frames;
}

export const pathSum: Problem = {
  id: 'path-sum',
  title: { en: 'Path sum (root to leaf)', es: 'Suma de camino (de la raíz a una hoja)' },
  difficulty: 'Easy',
  statement: [
    { en: 'Given a binary tree and a `target`, return `true` if there is a path from the **root down to a leaf** whose values add up to `target`. A leaf is a node with no children.', es: 'Dado un árbol binario y un `target`, devuelve `true` si existe un camino desde la **raíz hasta una hoja** cuyos valores sumen `target`. Una hoja es un nodo sin hijos.' },
  ],
  examples: [
    { input: 'root = [5, 4, 8, 11, null, 13, 4, 7, 2], target = 22', output: 'true', why: { en: '5 → 4 → 11 → 2 adds up to 22.', es: '5 → 4 → 11 → 2 suma 22.' } },
    { input: 'root = [1, 2, 3], target = 5', output: 'false', why: { en: 'The two paths add up to 3 and 4.', es: 'Los dos caminos suman 3 y 4.' } },
  ],
  insight:
    { en: 'You do not need to store paths at all. Carry **one number** down the tree: how much is still needed. Each node subtracts its own value and passes the remainder to its children. At a leaf, the path works exactly when the remainder is 0. This "pass state down as an argument" trick is the heart of most tree DFS problems.', es: 'No necesitas guardar caminos. Lleva **un solo número** hacia abajo en el árbol: cuánto falta todavía. Cada nodo resta su propio valor y pasa el resto a sus hijos. En una hoja, el camino funciona exactamente cuando el resto es 0. Este truco de "pasar el estado hacia abajo como argumento" es el corazón de la mayoría de los problemas de DFS en árboles.' },
  approaches: [
    {
      id: 'brute',
      label: { en: 'Collect every path, then add', es: 'Recolectar cada camino y luego sumar' },
      kind: 'brute',
      fn: hasPathSumBrute,
      time: 'O(n · h)',
      space: 'O(n · h)',
      note: { en: 'Builds a separate array for every root-to-leaf path (copying it at every node), then sums each one. On a tree with n nodes and height h that is up to n/2 paths of length h, and it never stops early.', es: 'Construye un arreglo separado para cada camino de la raíz a una hoja (copiándolo en cada nodo) y luego suma cada uno. En un árbol con n nodos y altura h son hasta n/2 caminos de longitud h, y nunca se detiene antes.' },
    },
    {
      id: 'dfs',
      label: { en: 'DFS carrying the remainder', es: 'DFS llevando el resto' },
      kind: 'optimal',
      fn: hasPathSum,
      time: 'O(n)',
      space: 'O(h)',
      note: { en: 'Each node does constant work. The only memory is the recursion stack, one frame per level. The `||` stops the search as soon as one path works.', es: 'Cada nodo hace trabajo constante. La única memoria es la pila de recursión, un marco por nivel. El `||` detiene la búsqueda en cuanto un camino funciona.' },
    },
  ],
  code,
  adapt: { in: treeIn },
  cases: [
    { name: { en: 'path exists', es: 'el camino existe' }, args: [[5, 4, 8, 11, null, 13, 4, 7, 2], 22], expected: true },
    { name: { en: 'no path adds up', es: 'ningún camino suma' }, args: [[1, 2, 3], 5], expected: false },
    { name: { en: 'empty tree, target 0', es: 'árbol vacío, target 0' }, args: [[], 0], expected: false },
    { name: { en: 'single node equals target', es: 'un solo nodo igual al target' }, args: [[7], 7], expected: true },
    { name: { en: 'single node differs', es: 'un solo nodo distinto' }, args: [[7], 1], expected: false },
    { name: { en: 'sum reached at a non-leaf only', es: 'la suma solo se alcanza en un nodo que no es hoja' }, args: [[1, 2], 1], expected: false },
    { name: { en: 'negative values', es: 'valores negativos' }, args: [[-2, null, -3], -5], expected: true },
    { name: { en: 'target zero with cancelling values', es: 'target cero con valores que se cancelan' }, args: [[1, -1, 5], 0], expected: true },
    { name: { en: 'chain', es: 'cadena' }, args: [[1, 2, null, 3, null, 4], 10], expected: true },
    { name: { en: 'right branch only', es: 'solo la rama derecha' }, args: [[5, 4, 8, 11, null, 13, 4, 7, 2], 26], expected: true },
    { name: { en: 'almost: off by one', es: 'casi: falla por uno' }, args: [[5, 4, 8, 11, null, 13, 4, 7, 2], 23], expected: false },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'number of nodes', es: 'número de nodos' },
    // target that no path reaches, so both approaches must examine the whole tree
    gen: (n) => [randTreeLevels(n, 1, 9), n < 20 ? randInt(1, 30) : 10_000_000],
  },
  demo: {
    inputs: [
      { name: 'tree (level order)', value: '[5, 4, 8, 11, null, 13, 4, 7, 2]' },
      { name: 'target', value: '22' },
    ],
    validate: (levels, target) => first(treeErr(levels, 12), intErr(target, 'target')),
    traces: { dfs: trace },
  },
};
