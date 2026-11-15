// #region dfs
int MinDepthDfs(TreeNode? root)
{
    if (root == null) return 0;
    if (root.left == null && root.right == null) return 1; // @leaf
    // A missing child is not a leaf, so it must not count as depth 0.
    int left = root.left != null ? MinDepthDfs(root.left) : int.MaxValue; // @left
    int right = root.right != null ? MinDepthDfs(root.right) : int.MaxValue; // @right
    return 1 + Math.Min(left, right); // @combine
}
// #endregion

// #region bfs
int MinDepth(TreeNode? root)
{
    if (root == null) return 0;
    var queue = new List<TreeNode> { root };
    int depth = 1; // @init
    while (queue.Count > 0)
    {
        var next = new List<TreeNode>();
        foreach (var node in queue)
        {
            if (node.left == null && node.right == null) return depth; // @leaf
            if (node.left != null) next.Add(node.left); // @children
            if (node.right != null) next.Add(node.right);
        }
        queue = next;
        depth++; // @deeper
    }
    return depth;
}
// #endregion
