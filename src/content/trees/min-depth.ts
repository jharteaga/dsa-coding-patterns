import code from './min-depth.ts?code';
import { treeErr } from '../../lib/check';
import { buildTree, randTreeLevels, TreeNode, treeToLevels } from '../../lib/ds';
import { Tracer, tree, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { treeIn } from './_util';

// #region dfs
export function minDepthDfs(root: TreeNode | null): number {
  if (root === null) return 0;
  if (root.left === null && root.right === null) return 1; // @leaf
  // A missing child is not a leaf, so it must not count as depth 0.
  const left = root.left ? minDepthDfs(root.left) : Infinity; // @left
  const right = root.right ? minDepthDfs(root.right) : Infinity; // @right
  return 1 + Math.min(left, right); // @combine
}
// #endregion

// #region bfs
export function minDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  let queue: TreeNode[] = [root];
  let depth = 1; // @init
  while (queue.length > 0) {
    const next: TreeNode[] = [];
    for (const node of queue) {
      if (node.left === null && node.right === null) return depth; // @leaf
      if (node.left !== null) next.push(node.left); // @children
      if (node.right !== null) next.push(node.right);
    }
    queue = next;
    depth++; // @deeper
  }
  return depth;
}
// #endregion

function traceDfs(lv: (number | null)[]) {
  const t = new Tracer();
  const root = buildTree(lv);
  const badge = new Map<TreeNode, string>();
  const done = new Set<TreeNode>();
  let visited = 0;
  const snap = (cur: TreeNode | null, tone: Tone = 'active') => tree(root, [...[...done].map((n): [TreeNode, Tone] => [n, 'done']), [cur, tone]], badge);
  const go = (node: TreeNode): number => {
    visited++;
    if (!node.left && !node.right) {
      badge.set(node, 'd=1');
      done.add(node);
      t.add('leaf', { en: `${node.val} is a leaf: its own min depth is 1. But DFS cannot know yet whether a shallower leaf exists elsewhere, so it keeps exploring.`, es: `${node.val} es una hoja: su propia profundidad mínima es 1. Pero DFS todavía no puede saber si existe una hoja menos profunda en otro lado, así que sigue explorando.` }, snap(node, 'good'), vars({ 'nodes visited': visited }));
      return 1;
    }
    t.add('left', { en: `At ${node.val}: must fully explore **both** subtrees before it can answer.`, es: `En ${node.val}: debe explorar por completo **ambos** subárboles antes de poder responder.` }, snap(node), vars({ 'nodes visited': visited }));
    const l = node.left ? go(node.left) : Infinity;
    const r = node.right ? go(node.right) : Infinity;
    const d = 1 + Math.min(l, r);
    badge.set(node, `d=${d}`);
    done.add(node);
    t.add('combine', { en: `Back at ${node.val}: 1 + min(${l === Infinity ? '∞' : l}, ${r === Infinity ? '∞' : r}) = ${d}.`, es: `De vuelta en ${node.val}: 1 + min(${l === Infinity ? '∞' : l}, ${r === Infinity ? '∞' : r}) = ${d}.` }, snap(node), vars({ 'nodes visited': visited }));
    return d;
  };
  const ans = root ? go(root) : 0;
  t.add(undefined, { en: `Minimum depth = **${ans}**, after visiting all ${visited} nodes.`, es: `Profundidad mínima = **${ans}**, tras visitar los ${visited} nodos.` }, snap(null), vars({ 'nodes visited': visited }));
  return t.frames;
}

function traceBfs(lv: (number | null)[]) {
  const t = new Tracer();
  const root = buildTree(lv);
  if (!root) {
    t.add(undefined, { en: 'Empty tree: depth **0**.', es: 'Árbol vacío: profundidad **0**.' }, tree(root));
    return t.frames;
  }
  const done = new Set<TreeNode>();
  let visited = 0;
  let queue: TreeNode[] = [root];
  let depth = 1;
  const snap = (cur: TreeNode | null, tone: Tone = 'active') => tree(root, [...[...done].map((n): [TreeNode, Tone] => [n, 'done']), ...queue.map((n): [TreeNode, Tone] => [n, 'window']), [cur, tone]]);
  t.add('init', { en: 'BFS explores level by level, nearest first. So the **first leaf it meets is automatically the shallowest**.', es: 'BFS explora nivel por nivel, primero lo más cercano. Así que **la primera hoja que encuentra es automáticamente la menos profunda**.' }, snap(null), vars({ depth, 'nodes visited': visited }));
  for (;;) {
    const next: TreeNode[] = [];
    for (const node of queue) {
      visited++;
      if (!node.left && !node.right) {
        t.add('leaf', { en: `${node.val} is a leaf at depth ${depth}. Nothing shallower can exist, because every shallower level was already checked. Return **${depth}** — the rest of the tree is never touched (${visited} nodes visited).`, es: `${node.val} es una hoja a profundidad ${depth}. No puede existir nada menos profundo, porque todos los niveles anteriores ya se revisaron. Devuelve **${depth}**: el resto del árbol nunca se toca (${visited} nodos visitados).` }, snap(node, 'good'), vars({ depth, 'nodes visited': visited }));
        return t.frames;
      }
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
      t.add('children', { en: `${node.val} is not a leaf. Queue its children for the next level.`, es: `${node.val} no es una hoja. Encola sus hijos para el siguiente nivel.` }, snap(node), vars({ depth, 'nodes visited': visited }));
      done.add(node);
    }
    queue = next;
    depth++;
    t.add('deeper', { en: `No leaf on that level. Go one level deeper: depth = ${depth}.`, es: `No hay hojas en ese nivel. Baja un nivel más: profundidad = ${depth}.` }, snap(null), vars({ depth, 'nodes visited': visited }));
  }
}

export const minDepthProblem: Problem = {
  id: 'min-depth',
  title: { en: 'Minimum depth (nearest leaf)', es: 'Profundidad mínima (hoja más cercana)' },
  difficulty: 'Easy',
  statement: [
    { en: 'Return the **minimum depth** of a binary tree: the number of nodes on the shortest path from the root down to the nearest leaf.', es: 'Devuelve la **profundidad mínima** de un árbol binario: el número de nodos en el camino más corto desde la raíz hasta la hoja más cercana.' },
  ],
  examples: [
    { input: 'root = [3, 9, 20, null, null, 15, 7]', output: '2', why: { en: 'The leaf 9 is two nodes from the root.', es: 'La hoja 9 está a dos nodos de la raíz.' } },
    { input: 'root = [1, null, 2]', output: '2', why: { en: 'The root has one child, so the root is not a leaf. The only leaf is 2.', es: 'La raíz tiene un hijo, así que no es una hoja. La única hoja es 2.' } },
  ],
  insight:
    { en: '"Nearest", "shortest", "minimum number of steps" are BFS words. BFS visits nodes in order of distance from the root, so the **first** leaf it reaches is guaranteed to be the closest one and it can stop immediately. DFS dives to the bottom of one branch first, so it has to finish the entire tree before it can be sure.', es: '"Más cercano", "más corto", "mínimo número de pasos" son palabras de BFS. BFS visita los nodos en orden de distancia desde la raíz, así que la **primera** hoja que alcanza es seguro la más cercana y puede detenerse de inmediato. DFS se sumerge primero hasta el fondo de una rama, así que tiene que terminar todo el árbol antes de estar seguro.' },
  approaches: [
    {
      id: 'dfs',
      label: { en: 'DFS (visits every node)', es: 'DFS (visita todos los nodos)' },
      kind: 'brute',
      fn: minDepthDfs,
      time: 'O(n)',
      space: 'O(h)',
      note: { en: 'Correct, and O(n) in the worst case just like BFS — but it *always* visits all n nodes, even when a leaf is sitting right under the root.', es: 'Correcto, y O(n) en el peor caso igual que BFS, pero *siempre* visita los n nodos, incluso cuando hay una hoja justo debajo de la raíz.' },
    },
    {
      id: 'bfs',
      label: { en: 'BFS (stops at the first leaf)', es: 'BFS (se detiene en la primera hoja)' },
      kind: 'optimal',
      fn: minDepth,
      time: 'O(n)',
      space: 'O(w)',
      note: { en: 'Worst case still O(n), but it only visits the levels above the nearest leaf. If the answer is depth d, it touches at most the nodes in the first d levels.', es: 'El peor caso sigue siendo O(n), pero solo visita los niveles por encima de la hoja más cercana. Si la respuesta es profundidad d, toca como máximo los nodos de los primeros d niveles.' },
    },
  ],
  code,
  adapt: { in: treeIn },
  cases: [
    { name: { en: 'leaf on the second level', es: 'hoja en el segundo nivel' }, args: [[3, 9, 20, null, null, 15, 7]], expected: 2 },
    { name: { en: 'empty tree', es: 'árbol vacío' }, args: [[]], expected: 0 },
    { name: { en: 'single node', es: 'un solo nodo' }, args: [[1]], expected: 1 },
    { name: { en: 'root with one child is not a leaf', es: 'una raíz con un hijo no es hoja' }, args: [[1, null, 2]], expected: 2 },
    { name: { en: 'right chain', es: 'cadena a la derecha' }, args: [[2, null, 3, null, 4, null, 5]], expected: 4 },
    { name: { en: 'left chain', es: 'cadena a la izquierda' }, args: [[1, 2, null, 3]], expected: 3 },
    { name: { en: 'perfect tree', es: 'árbol perfecto' }, args: [[1, 2, 3, 4, 5, 6, 7]], expected: 3 },
    { name: { en: 'shallow leaf on the right, deep left', es: 'hoja poco profunda a la derecha, izquierda profunda' }, args: [[1, 2, 3, 4, null, null, null, 5]], expected: 2 },
    { name: { en: 'both sides equally deep', es: 'ambos lados igual de profundos' }, args: [[1, 2, 3, 4, null, null, 5]], expected: 3 },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'number of nodes (a leaf sits right under the root)', es: 'número de nodos (hay una hoja justo debajo de la raíz)' },
    gen: (n) => {
      if (n < 20) return [randTreeLevels(n)];
      const root = new TreeNode(0);
      root.left = buildTree(randTreeLevels(n - 2));
      root.right = new TreeNode(1);
      return [treeToLevels(root)];
    },
  },
  demo: {
    inputs: [{ name: 'tree (level order)', value: '[1, 2, 3, 4, 5, null, null, 6, 7, 8]' }],
    validate: (levels) => treeErr(levels, 12),
    traces: { dfs: traceDfs, bfs: traceBfs },
  },
};
