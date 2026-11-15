import { buildTree, TreeNode } from '../../lib/ds';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const treeIn = (args: any[]) => [buildTree(args[0]), ...args.slice(1)];

/** level-order array of a chain: every node has only a left (or only a right) child */
export const chainLevels = (vals: number[], side: 'left' | 'right') => {
  const out: (number | null)[] = [];
  vals.forEach((v, i) => {
    if (i === 0) out.push(v);
    else if (side === 'left') out.push(v, null);
    else out.push(null, v);
  });
  if (side === 'left' && out.length > 1) out.pop();
  return out;
};

export const allNodes = (root: TreeNode | null): TreeNode[] => (root ? [root, ...allNodes(root.left), ...allNodes(root.right)] : []);
