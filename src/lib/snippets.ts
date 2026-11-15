// Small snippets shown on the primer pages (not executed).

// #region treenode
export class TreeNode {
  val: number;
  left: TreeNode | null = null; // root of the left subtree, or null
  right: TreeNode | null = null; // root of the right subtree, or null

  constructor(val: number) {
    this.val = val;
  }
}

// Building   2
//           / \
//          1   3
const root = new TreeNode(2);
root.left = new TreeNode(1);
root.right = new TreeNode(3);
// #endregion

// #region traversals
export function preorder(node: TreeNode | null, out: number[]): void {
  if (node === null) return;
  out.push(node.val); // node first
  preorder(node.left, out);
  preorder(node.right, out);
}

export function inorder(node: TreeNode | null, out: number[]): void {
  if (node === null) return;
  inorder(node.left, out);
  out.push(node.val); // node in the middle
  inorder(node.right, out);
}

export function postorder(node: TreeNode | null, out: number[]): void {
  if (node === null) return;
  postorder(node.left, out);
  postorder(node.right, out);
  out.push(node.val); // node last
}
// #endregion

// #region listnode
export class ListNode {
  val: number;
  next: ListNode | null = null; // the following node, or null at the end

  constructor(val: number) {
    this.val = val;
  }
}
// #endregion
export const demoRoot = root;
