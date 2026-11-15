// #region brute
IList<IList<int>> LevelOrderBrute(TreeNode? root)
{
    int Height(TreeNode? node) =>
        node == null ? 0 : 1 + Math.Max(Height(node.left), Height(node.right));

    // Walk down from the root and collect only the nodes at `depth`.
    void Collect(TreeNode? node, int depth, List<int> result)
    {
        if (node == null) return;
        if (depth == 0) result.Add(node.val); // @collect
        else
        {
            Collect(node.left, depth - 1, result); // @descend
            Collect(node.right, depth - 1, result);
        }
    }

    var levels = new List<IList<int>>();
    int h = Height(root);
    for (int depth = 0; depth < h; depth++)
    {
        var level = new List<int>();
        Collect(root, depth, level); // one full walk from the root per level // @level
        levels.Add(level);
    }
    return levels; // @done
}
// #endregion

// #region bfs
IList<IList<int>> LevelOrder(TreeNode? root)
{
    var levels = new List<IList<int>>();
    if (root == null) return levels;
    var queue = new List<TreeNode> { root }; // @init
    while (queue.Count > 0)
    {
        var level = new List<int>();
        var next = new List<TreeNode>(); // @level
        foreach (var node in queue)
        {
            level.Add(node.val); // @visit
            if (node.left != null) next.Add(node.left); // @children
            if (node.right != null) next.Add(node.right);
        }
        levels.Add(level); // @push
        queue = next;
    }
    return levels; // @done
}
// #endregion
