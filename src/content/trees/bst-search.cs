// #region dfs
bool ContainsDfs(TreeNode? root, int target)
{
    if (root == null) return false;
    if (root.val == target) return true; // @check
    // Ignores the ordering: looks in both subtrees.
    return ContainsDfs(root.left, target) || ContainsDfs(root.right, target); // @both
}
// #endregion

// #region bst
bool Contains(TreeNode? root, int target)
{
    TreeNode? node = root; // @init
    while (node != null)
    {
        if (target == node.val) return true; // @found
        node = target < node.val ? node.left : node.right; // @step
    }
    return false; // @miss
}
// #endregion
