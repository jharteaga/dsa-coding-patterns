import code from './validate-bst.ts?code';
import { treeErr } from '../../lib/check';
import { bstLevels, buildTree, distinctSorted, randInt, TreeNode } from '../../lib/ds';
import { Tracer, tree } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { chainLevels, treeIn } from './_util';

// #region brute
export function isValidBstBrute(root: TreeNode | null): boolean {
  const maxOf = (node: TreeNode | null): number =>
    node === null ? -Infinity : Math.max(node.val, maxOf(node.left), maxOf(node.right));
  const minOf = (node: TreeNode | null): number =>
    node === null ? Infinity : Math.min(node.val, minOf(node.left), minOf(node.right));

  if (root === null) return true;
  // Scan the whole left and right subtrees of this node...
  if (maxOf(root.left) >= root.val || minOf(root.right) <= root.val) return false;
  // ...then repeat the same scans for every node below.
  return isValidBstBrute(root.left) && isValidBstBrute(root.right);
}
// #endregion

// #region bounds
export function isValidBst(root: TreeNode | null, low = -Infinity, high = Infinity): boolean {
  if (root === null) return true; // @null
  if (root.val <= low || root.val >= high) return false; // @check
  return (
    isValidBst(root.left, low, root.val) && // @left
    isValidBst(root.right, root.val, high) // @right
  );
}
// #endregion

function trace(lv: (number | null)[]) {
  const t = new Tracer();
  const root = buildTree(lv);
  const badge = new Map<TreeNode, string>();
  const ok = new Set<TreeNode>();
  const f = (x: number) => (x === Infinity ? '∞' : x === -Infinity ? '-∞' : String(x));
  const snap = (cur: TreeNode | null, tone: Tone) => tree(root, [...[...ok].map((n): [TreeNode, Tone] => [n, 'done']), [cur, tone]], badge);
  const go = (node: TreeNode | null, lo: number, hi: number): boolean => {
    if (!node) return true;
    badge.set(node, `(${f(lo)}, ${f(hi)})`);
    if (node.val <= lo || node.val >= hi) {
      t.add('check', { en: `${node.val} must lie strictly between ${f(lo)} and ${f(hi)} — it does not. An ancestor's rule is broken, so the tree is **not** a valid BST.`, es: `${node.val} debe estar estrictamente entre ${f(lo)} y ${f(hi)}, y no lo está. Se rompe la regla de un ancestro, así que el árbol **no** es un BST válido.` }, snap(node, 'bad'));
      return false;
    }
    t.add('check', {
        en: `${node.val} must lie strictly between ${f(lo)} and ${f(hi)}. ✓ Its left child inherits the range (${f(lo)}, ${node.val}); its right child inherits (${node.val}, ${f(hi)}).`,
        es: `${node.val} debe estar estrictamente entre ${f(lo)} y ${f(hi)}. ✓ Su hijo izquierdo hereda el rango (${f(lo)}, ${node.val}); su hijo derecho hereda (${node.val}, ${f(hi)}).`,
      }, snap(node, 'active'));
    const res = go(node.left, lo, node.val) && go(node.right, node.val, hi);
    if (res) ok.add(node);
    return res;
  };
  const valid = go(root, -Infinity, Infinity);
  if (valid) t.add(undefined, { en: 'Every node fits inside the range passed down by its ancestors. The tree **is** a valid BST.', es: 'Cada nodo cabe dentro del rango que le pasaron sus ancestros. El árbol **sí** es un BST válido.' }, snap(null, 'active'));
  return t.frames;
}

export const validateBst: Problem = {
  id: 'validate-bst',
  title: { en: 'Validate a binary search tree', es: 'Validar un árbol binario de búsqueda' },
  difficulty: 'Medium',
  statement: [
    { en: 'Return `true` if a binary tree is a valid binary search tree: for **every** node, all values in its left subtree are strictly smaller and all values in its right subtree are strictly larger.', es: 'Devuelve `true` si un árbol binario es un árbol binario de búsqueda válido: para **cada** nodo, todos los valores de su subárbol izquierdo son estrictamente menores y todos los de su subárbol derecho son estrictamente mayores.' },
  ],
  examples: [
    { input: 'root = [2, 1, 3]', output: 'true' },
    { input: 'root = [5, 1, 7, null, null, 4, 8]', output: 'false', why: { en: '4 is in the right subtree of 5 but is smaller than 5 — even though 4 < 7 looks fine locally.', es: '4 está en el subárbol derecho de 5 pero es menor que 5, aunque 4 < 7 parezca correcto localmente.' } },
  ],
  insight:
    { en: 'The tempting shortcut — compare each node only with its two children — is **wrong** (see the second example). The rule involves whole subtrees. Instead of scanning subtrees upward, push the constraint downward: every node must lie in an open range `(low, high)` set by its ancestors. Going left tightens `high` to the parent’s value; going right tightens `low`. One constant-time check per node.', es: 'El atajo tentador (comparar cada nodo solo con sus dos hijos) es **incorrecto** (mira el segundo ejemplo). La regla abarca subárboles completos. En lugar de revisar subárboles hacia arriba, empuja la restricción hacia abajo: cada nodo debe estar en un rango abierto `(low, high)` definido por sus ancestros. Ir a la izquierda ajusta `high` al valor del padre; ir a la derecha ajusta `low`. Una comprobación de tiempo constante por nodo.' },
  approaches: [
    {
      id: 'brute',
      label: { en: 'Scan both subtrees at every node', es: 'Revisar ambos subárboles en cada nodo' },
      kind: 'brute',
      fn: isValidBstBrute,
      time: 'O(n²)',
      space: 'O(h)',
      note: { en: 'Literally implements the definition: for each node find the max of its left subtree and the min of its right subtree. Each scan is O(size of subtree), and it is repeated for every node.', es: 'Implementa literalmente la definición: para cada nodo busca el máximo de su subárbol izquierdo y el mínimo de su subárbol derecho. Cada revisión es O(tamaño del subárbol) y se repite para cada nodo.' },
    },
    {
      id: 'bounds',
      label: { en: 'Pass a valid range down', es: 'Pasar un rango válido hacia abajo' },
      kind: 'optimal',
      fn: isValidBst,
      time: 'O(n)',
      space: 'O(h)',
      note: { en: 'Each node is visited once and compared with two numbers. (Another O(n) way: an in-order traversal of a valid BST must be strictly increasing.)', es: 'Cada nodo se visita una vez y se compara con dos números. (Otra forma O(n): el recorrido in-order de un BST válido debe ser estrictamente creciente.)' },
    },
  ],
  code,
  adapt: { in: treeIn },
  cases: [
    { name: { en: 'valid small tree', es: 'árbol pequeño válido' }, args: [[2, 1, 3]], expected: true },
    { name: { en: 'violation hidden two levels down', es: 'violación oculta dos niveles abajo' }, args: [[5, 1, 7, null, null, 4, 8]], expected: false },
    { name: { en: 'empty tree', es: 'árbol vacío' }, args: [[]], expected: true },
    { name: { en: 'single node', es: 'un solo nodo' }, args: [[1]], expected: true },
    { name: { en: 'duplicate on the left', es: 'duplicado a la izquierda' }, args: [[1, 1]], expected: false },
    { name: { en: 'duplicate on the right', es: 'duplicado a la derecha' }, args: [[1, null, 1]], expected: false },
    { name: { en: 'grandchild breaks the root’s rule (left side)', es: 'un nieto rompe la regla de la raíz (lado izquierdo)' }, args: [[10, 5, 15, null, 12]], expected: false },
    { name: { en: 'valid chain', es: 'cadena válida' }, args: [[1, null, 2, null, 3]], expected: true },
    { name: { en: 'negative values', es: 'valores negativos' }, args: [[0, -3, 2, -5, -1]], expected: true },
    { name: { en: 'children swapped', es: 'hijos intercambiados' }, args: [[2, 3, 1]], expected: false },
    { name: { en: 'valid three levels', es: 'tres niveles válidos' }, args: [[8, 4, 12, 2, 6, 10, 14]], expected: true },
  ],
  bench: {
    sizes: [100, 1000, 5000],
    nLabel: { en: 'number of nodes (worst case: a valid chain)', es: 'número de nodos (peor caso: una cadena válida)' },
    gen: (n) => {
      const vals = distinctSorted(n);
      if (n >= 20) return [chainLevels(vals, 'right')];
      const lv = bstLevels(vals);
      if (Math.random() < 0.5) lv[randInt(0, lv.length - 1)] = randInt(-60, 60); // maybe break it
      return [lv[0] === null ? [1] : lv];
    },
  },
  demo: {
    inputs: [{ name: 'tree (level order)', value: '[10, 5, 15, 2, 7, 6, 20]' }],
    validate: (levels) => treeErr(levels, 12),
    traces: { bounds: trace },
  },
};
