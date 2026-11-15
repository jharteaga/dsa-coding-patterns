// #region brute
int DiameterBrute(TreeNode? root)
{
    int Height(TreeNode? node) =>
        node == null ? 0 : 1 + Math.Max(Height(node.left), Height(node.right));

    if (root == null) return 0;
    // Longest path that bends at this node...
    int through = Height(root.left) + Height(root.right);
    // ...or the longest path somewhere below it. Height() is recomputed
    // from scratch for every single node.
    return Math.Max(through, Math.Max(DiameterBrute(root.left), DiameterBrute(root.right)));
}
// #endregion

// #region onepass
int Diameter(TreeNode? root)
{
    int best = 0;
    // Returns the height of `node`, and updates `best` on the way back up.
    int Height(TreeNode? node)
    {
        if (node == null) return 0; // @null
        int left = Height(node.left); // @left
        int right = Height(node.right); // @right
        best = Math.Max(best, left + right); // @update
        return 1 + Math.Max(left, right); // @return
    }
    Height(root);
    return best; // @done
}
// #endregion
