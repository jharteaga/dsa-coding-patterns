// #region brute
bool HasPathSumBrute(TreeNode? root, int target)
{
    // 1. Collect every root-to-leaf path as its own list.
    var paths = new List<List<int>>();
    void Collect(TreeNode? node, List<int> path)
    {
        if (node == null) return;
        var next = new List<int>(path) { node.val }; // copies the whole path: O(h)
        if (node.left == null && node.right == null) paths.Add(next);
        Collect(node.left, next);
        Collect(node.right, next);
    }
    Collect(root, new List<int>());

    // 2. Add up each path and compare.
    foreach (var path in paths)
    {
        int sum = 0;
        foreach (int v in path) sum += v;
        if (sum == target) return true;
    }
    return false;
}
// #endregion

// #region dfs
bool HasPathSum(TreeNode? root, int target)
{
    if (root == null) return false; // @null
    int remaining = target - root.val; // @enter
    if (root.left == null && root.right == null) return remaining == 0; // @leaf
    return HasPathSum(root.left, remaining) || HasPathSum(root.right, remaining); // @recurse
}
// #endregion
