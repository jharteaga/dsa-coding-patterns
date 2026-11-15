// #region sort
int KthSmallestSort(TreeNode? root, int k)
{
    var values = new List<int>();
    void Collect(TreeNode? node)
    {
        if (node == null) return;
        values.Add(node.val);
        Collect(node.left);
        Collect(node.right);
    }
    Collect(root); // every node, in no useful order
    values.Sort();
    return values[k - 1];
}
// #endregion

// #region inorder
int KthSmallest(TreeNode? root, int k)
{
    var stack = new Stack<TreeNode>();
    TreeNode? node = root;
    while (node != null || stack.Count > 0)
    {
        while (node != null)
        {
            stack.Push(node); // @push
            node = node.left;
        }
        node = stack.Pop(); // @pop
        k--; // this is the next-smallest value
        if (k == 0) return node.val; // @found
        node = node.right; // @right
    }
    return -1; // k was larger than the tree
}
// #endregion
