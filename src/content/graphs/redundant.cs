// #region dfs
int[] FindRedundantDfs(int[][] edges)
{
    var neighbours = new Dictionary<int, List<int>>();
    // Is there already a path from `from` to `target` using the edges added so far?
    bool Connected(int from, int target)
    {
        var seen = new HashSet<int> { from };
        var stack = new Stack<int>();
        stack.Push(from);
        while (stack.Count > 0)
        {
            int node = stack.Pop();
            if (node == target) return true;
            if (!neighbours.TryGetValue(node, out var list)) continue;
            foreach (int next in list)
            {
                if (seen.Add(next)) stack.Push(next);
            }
        }
        return false;
    }

    foreach (int[] e in edges)
    {
        int a = e[0], b = e[1];
        if (Connected(a, b)) return new[] { a, b }; // a full graph search for every edge
        if (!neighbours.ContainsKey(a)) neighbours[a] = new List<int>();
        if (!neighbours.ContainsKey(b)) neighbours[b] = new List<int>();
        neighbours[a].Add(b);
        neighbours[b].Add(a);
    }
    return Array.Empty<int>();
}
// #endregion

// #region unionfind
int[] FindRedundant(int[][] edges)
{
    int n = edges.Length;
    int[] parent = Enumerable.Range(0, n + 1).ToArray(); // each node is its own group
    int[] size = Enumerable.Repeat(1, n + 1).ToArray();

    // Follow parent links to the group's representative ("root").
    int Find(int x)
    {
        while (parent[x] != x)
        {
            parent[x] = parent[parent[x]]; // path compression: skip a level on the way up
            x = parent[x];
        }
        return x; // @find
    }

    foreach (int[] e in edges)
    {
        int a = e[0], b = e[1];
        int rootA = Find(a);
        int rootB = Find(b);
        if (rootA == rootB) return new[] { a, b }; // already in the same group: this edge closes a cycle // @cycle
        // Union by size: hang the smaller group under the larger one.
        if (size[rootA] < size[rootB])
        {
            parent[rootA] = rootB; // @union
            size[rootB] += size[rootA];
        }
        else
        {
            parent[rootB] = rootA;
            size[rootA] += size[rootB];
        }
    }
    return Array.Empty<int>(); // @none
}
// #endregion
