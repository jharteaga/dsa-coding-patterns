// #region treenode
public class TreeNode
{
    public int val;
    public TreeNode? left;  // root of the left subtree, or null
    public TreeNode? right; // root of the right subtree, or null

    public TreeNode(int val) { this.val = val; }
}

// Building   2
//           / \
//          1   3
// var root = new TreeNode(2);
// root.left = new TreeNode(1);
// root.right = new TreeNode(3);
// #endregion

// #region traversals
void Preorder(TreeNode? node, List<int> result)
{
    if (node == null) return;
    result.Add(node.val); // node first
    Preorder(node.left, result);
    Preorder(node.right, result);
}

void Inorder(TreeNode? node, List<int> result)
{
    if (node == null) return;
    Inorder(node.left, result);
    result.Add(node.val); // node in the middle
    Inorder(node.right, result);
}

void Postorder(TreeNode? node, List<int> result)
{
    if (node == null) return;
    Postorder(node.left, result);
    Postorder(node.right, result);
    result.Add(node.val); // node last
}
// #endregion

// #region listnode
public class ListNode
{
    public int val;
    public ListNode? next; // the following node, or null at the end

    public ListNode(int val) { this.val = val; }
}
// #endregion
