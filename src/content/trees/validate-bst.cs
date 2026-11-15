// #region brute
bool IsValidBstBrute(TreeNode? root)
{
    long MaxOf(TreeNode? node) =>
        node == null ? long.MinValue : Math.Max(node.val, Math.Max(MaxOf(node.left), MaxOf(node.right)));
    long MinOf(TreeNode? node) =>
        node == null ? long.MaxValue : Math.Min(node.val, Math.Min(MinOf(node.left), MinOf(node.right)));

    if (root == null) return true;
    // Scan the whole left and right subtrees of this node...
    if (MaxOf(root.left) >= root.val || MinOf(root.right) <= root.val) return false;
    // ...then repeat the same scans for every node below.
    return IsValidBstBrute(root.left) && IsValidBstBrute(root.right);
}
// #endregion

// #region bounds
bool IsValidBst(TreeNode? root, long low = long.MinValue, long high = long.MaxValue)
{
    if (root == null) return true; // @null
    if (root.val <= low || root.val >= high) return false; // @check
    return
        IsValidBst(root.left, low, root.val) && // @left
        IsValidBst(root.right, root.val, high); // @right
}
// #endregion
