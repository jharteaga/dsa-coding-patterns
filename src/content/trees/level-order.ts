import code from './level-order.ts?code';
import { treeErr } from '../../lib/check';
import { buildTree, randTreeLevels, TreeNode } from '../../lib/ds';
import { Tracer, arr, tree, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { chainLevels, treeIn } from './_util';

// #region brute
export function levelOrderBrute(root: TreeNode | null): number[][] {
  const height = (node: TreeNode | null): number =>
    node === null ? 0 : 1 + Math.max(height(node.left), height(node.right));

  // Walk down from the root and collect only the nodes at `depth`.
  const collect = (node: TreeNode | null, depth: number, out: number[]): void => {
    if (node === null) return;
    if (depth === 0) out.push(node.val); // @collect
    else {
      collect(node.left, depth - 1, out); // @descend
      collect(node.right, depth - 1, out);
    }
  };

  const levels: number[][] = [];
  const h = height(root);
  for (let depth = 0; depth < h; depth++) {
    const level: number[] = [];
    collect(root, depth, level); // one full walk from the root per level // @level
    levels.push(level);
  }
  return levels; // @done
}
// #endregion

// #region bfs
export function levelOrder(root: TreeNode | null): number[][] {
  const levels: number[][] = [];
  if (root === null) return levels;
  let queue: TreeNode[] = [root]; // @init
  while (queue.length > 0) {
    const level: number[] = [];
    const next: TreeNode[] = []; // @level
    for (const node of queue) {
      level.push(node.val); // @visit
      if (node.left !== null) next.push(node.left); // @children
      if (node.right !== null) next.push(node.right);
    }
    levels.push(level); // @push
    queue = next;
  }
  return levels; // @done
}
// #endregion

function traceBfs(lv: (number | null)[]) {
  const t = new Tracer();
  const root = buildTree(lv);
  const levels: number[][] = [];
  const done = new Set<TreeNode>();
  const snap = (queue: TreeNode[], next: TreeNode[], cur: TreeNode | null, level: number[]) => [
    tree(root, [...[...done].map((n): [TreeNode, Tone] => [n, 'done']), ...queue.map((n): [TreeNode, Tone] => [n, 'window']), ...next.map((n): [TreeNode, Tone] => [n, 'compare']), [cur, 'active']]),
    arr(queue.map((n) => n.val), { label: { en: 'queue: this level', es: 'cola: este nivel' } }),
    arr(next.map((n) => n.val), { label: { en: 'next: the level below', es: 'next: el nivel de abajo' } }),
    vars({ level, levels }),
  ];
  if (!root) {
    t.add('done', { en: 'Empty tree: there are no levels. Return **[]**.', es: 'Árbol vacío: no hay niveles. Devuelve **[]**.' }, tree(root));
    return t.frames;
  }
  let queue: TreeNode[] = [root];
  t.add('init', { en: 'Start with a queue holding just the root. The queue always holds **one complete level**.', es: 'Empieza con una cola que contiene solo la raíz. La cola siempre contiene **un nivel completo**.' }, ...snap(queue, [], null, []));
  while (queue.length) {
    const level: number[] = [];
    const next: TreeNode[] = [];
    for (const node of queue) {
      level.push(node.val);
      t.add('visit', { en: `Take ${node.val} from the current level and record it.`, es: `Toma ${node.val} del nivel actual y anótalo.` }, ...snap(queue, next, node, level));
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
      done.add(node);
      t.add('children', node.left || node.right
          ? {
              en: `Put its children (${[node.left, node.right].filter(Boolean).map((c) => c!.val).join(', ')}) in line for the next level.`,
              es: `Forma a sus hijos (${[node.left, node.right].filter(Boolean).map((c) => c!.val).join(', ')}) en la fila para el siguiente nivel.`,
            }
          : { en: `${node.val} has no children, so nothing joins the next level.`, es: `${node.val} no tiene hijos, así que nada se suma al siguiente nivel.` }, ...snap(queue, next, node, level));
    }
    levels.push(level);
    t.add('push', { en: `Level ${levels.length - 1} is complete: [${level.join(', ')}]. The "next" list becomes the queue.`, es: `El nivel ${levels.length - 1} está completo: [${level.join(', ')}]. La lista "next" se convierte en la cola.` }, ...snap(next, [], null, []));
    queue = next;
  }
  t.add('done', { en: `The queue is empty — no more levels. Each node was touched **once**. Result: **${JSON.stringify(levels)}**.`, es: `La cola está vacía: no hay más niveles. Cada nodo se tocó **una vez**. Resultado: **${JSON.stringify(levels)}**.` }, tree(root, [...done].map((n): [TreeNode, Tone] => [n, 'done'])), vars({ levels }));
  return t.frames;
}

function traceBrute(lv: (number | null)[]) {
  const t = new Tracer();
  const root = buildTree(lv);
  const height = (n: TreeNode | null): number => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);
  const levels: number[][] = [];
  const h = height(root);
  let touches = 0;
  for (let depth = 0; depth < h; depth++) {
    const level: number[] = [];
    const path: TreeNode[] = [];
    t.add('level', { en: `Collect level ${depth}: start **again from the root** and walk down ${depth} step(s).`, es: `Recolecta el nivel ${depth}: empieza **otra vez desde la raíz** y baja ${depth} paso(s).` }, tree(root), vars({ depth, level, levels, 'nodes touched so far': touches }));
    const collect = (node: TreeNode | null, d: number) => {
      if (!node) return;
      touches++;
      path.push(node);
      if (d === 0) {
        level.push(node.val);
        t.add('collect', { en: `${node.val} is at depth ${depth}: add it to this level.`, es: `${node.val} está a profundidad ${depth}: agrégalo a este nivel.` }, tree(root, [...path.map((n): [TreeNode, Tone] => [n, 'window']), [node, 'good']]), vars({ depth, level, levels, 'nodes touched so far': touches }));
      } else {
        t.add('descend', { en: `${node.val} is above level ${depth}; pass through it (again) on the way down.`, es: `${node.val} está por encima del nivel ${depth}; pasa por él (otra vez) al bajar.` }, tree(root, [...path.map((n): [TreeNode, Tone] => [n, 'window']), [node, 'active']]), vars({ depth, level, levels, 'nodes touched so far': touches }));
        collect(node.left, d - 1);
        collect(node.right, d - 1);
      }
      path.pop();
    };
    collect(root, depth);
    levels.push(level);
  }
  t.add('done', { en: `Done, but the upper nodes were walked through once for every level below them: **${touches} node visits** for a tree of ${lv.filter((x) => x !== null).length} nodes. Result: ${JSON.stringify(levels)}.`, es: `Listo, pero los nodos de arriba se recorrieron una vez por cada nivel debajo de ellos: **${touches} visitas a nodos** para un árbol de ${lv.filter((x) => x !== null).length} nodos. Resultado: ${JSON.stringify(levels)}.` }, tree(root), vars({ levels }));
  return t.frames;
}

export const levelOrderProblem: Problem = {
  id: 'level-order',
  title: { en: 'Level-order traversal', es: 'Recorrido por niveles (level order)' },
  difficulty: 'Medium',
  statement: [{ en: 'Return the values of a binary tree **level by level**, top to bottom, each level from left to right, as a list of lists.', es: 'Devuelve los valores de un árbol binario **nivel por nivel**, de arriba hacia abajo, cada nivel de izquierda a derecha, como una lista de listas.' }],
  examples: [{ input: 'root = [3, 9, 20, null, null, 15, 7]', output: '[[3], [9, 20], [15, 7]]' }],
  insight:
    { en: 'If you are holding all the nodes of one level, then their children — taken in order — are exactly the next level. So you never need to return to the root: keep a **queue** of the current level, and while reading it, build the next one. Every node enters and leaves the queue once.', es: 'Si tienes todos los nodos de un nivel, sus hijos (tomados en orden) son exactamente el siguiente nivel. Así que nunca necesitas volver a la raíz: mantén una **cola** con el nivel actual y, mientras la lees, construye el siguiente. Cada nodo entra y sale de la cola una vez.' },
  approaches: [
    {
      id: 'brute',
      label: { en: 'One DFS per level', es: 'Un DFS por nivel' },
      kind: 'brute',
      fn: levelOrderBrute,
      time: 'O(n · h)',
      space: 'O(h)',
      note: { en: 'For each depth, walk down from the root and collect the nodes exactly that deep. Nodes near the top get walked through again for every level below them. On a chain (h = n) that is O(n²).', es: 'Para cada profundidad, baja desde la raíz y recolecta los nodos que están exactamente a esa profundidad. Los nodos cercanos a la cima se recorren de nuevo por cada nivel debajo de ellos. En una cadena (h = n) eso es O(n²).' },
    },
    {
      id: 'bfs',
      label: { en: 'BFS with a queue', es: 'BFS con una cola' },
      kind: 'optimal',
      fn: levelOrder,
      time: 'O(n)',
      space: 'O(w)',
      note: { en: 'w is the widest level (up to n/2 in a full tree). Swapping in a fresh `next` list per level makes the level boundaries obvious; a single queue plus "process `queue.length` nodes" works just as well.', es: 'w es el nivel más ancho (hasta n/2 en un árbol completo). Usar una lista `next` nueva por nivel hace obvios los límites entre niveles; una sola cola más "procesa `queue.length` nodos" funciona igual de bien.' },
    },
  ],
  code,
  adapt: { in: treeIn },
  cases: [
    { name: { en: 'three levels', es: 'tres niveles' }, args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
    { name: { en: 'empty tree', es: 'árbol vacío' }, args: [[]], expected: [] },
    { name: { en: 'single node', es: 'un solo nodo' }, args: [[1]], expected: [[1]] },
    { name: { en: 'left chain', es: 'cadena a la izquierda' }, args: [[1, 2, null, 3]], expected: [[1], [2], [3]] },
    { name: { en: 'right chain', es: 'cadena a la derecha' }, args: [[1, null, 2, null, 3]], expected: [[1], [2], [3]] },
    { name: { en: 'perfect tree', es: 'árbol perfecto' }, args: [[1, 2, 3, 4, 5, 6, 7]], expected: [[1], [2, 3], [4, 5, 6, 7]] },
    { name: { en: 'gaps inside a level', es: 'huecos dentro de un nivel' }, args: [[1, 2, 3, null, 4, null, 5]], expected: [[1], [2, 3], [4, 5]] },
    { name: { en: 'negative and duplicate values', es: 'valores negativos y duplicados' }, args: [[0, -1, -1, 2]], expected: [[0], [-1, -1], [2]] },
    { name: { en: 'deep on one side only', es: 'profundo solo de un lado' }, args: [[1, 2, 3, 4, null, null, null, 5]], expected: [[1], [2, 3], [4], [5]] },
  ],
  bench: {
    sizes: [100, 1000, 5000],
    nLabel: { en: 'number of nodes (worst case: a chain)', es: 'número de nodos (peor caso: una cadena)' },
    gen: (n) => [n < 20 ? randTreeLevels(n) : chainLevels(Array.from({ length: n }, (_, i) => i), 'left')],
  },
  demo: {
    inputs: [{ name: 'tree (level order)', value: '[3, 9, 20, 4, null, 15, 7]' }],
    validate: (levels) => treeErr(levels, 10),
    traces: { brute: traceBrute, bfs: traceBfs },
  },
};
