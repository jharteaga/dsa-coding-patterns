// #region recursive
IList<int> InorderRecursive(TreeNode? root)
{
    var result = new List<int>();
    void Visit(TreeNode? node)
    {
        if (node == null) return; // @base
        Visit(node.left); // @left
        result.Add(node.val); // @visit
        Visit(node.right); // @right
    }
    Visit(root);
    return result; // @done
}
// #endregion

// #region iterative
IList<int> InorderIterative(TreeNode? root)
{
    var result = new List<int>();
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
        result.Add(node.val); // @visit
        node = node.right; // @right
    }
    return result; // @done
}
// #endregion
