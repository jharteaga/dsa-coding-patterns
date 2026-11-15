// #region relabel
int CountComponentsRelabel(int n, int[][] edges)
{
    int[] label = Enumerable.Range(0, n).ToArray(); // every node starts in its own group
    bool changed = true;
    // Sweep over all edges, copying the smaller label across, until nothing changes.
    while (changed)
    {
        changed = false;
        foreach (int[] e in edges)
        {
            if (label[e[0]] != label[e[1]])
            {
                int low = Math.Min(label[e[0]], label[e[1]]);
                label[e[0]] = low;
                label[e[1]] = low;
                changed = true;
            }
        }
    }
    return label.Distinct().Count();
}
// #endregion

// #region dfs
int CountComponents(int n, int[][] edges)
{
    // 1. Adjacency list: for every node, the list of its neighbours.
    var neighbours = new List<int>[n];
    for (int i = 0; i < n; i++) neighbours[i] = new List<int>();
    foreach (int[] e in edges)
    {
        neighbours[e[0]].Add(e[1]);
        neighbours[e[1]].Add(e[0]); // undirected: record both directions
    }

    // 2. Start a search from every node not reached by an earlier search.
    var seen = new bool[n];
    int components = 0;
    for (int start = 0; start < n; start++)
    {
        if (seen[start]) continue; // @skip
        components++; // @new
        var stack = new Stack<int>();
        stack.Push(start);
        seen[start] = true;
        while (stack.Count > 0)
        {
            int node = stack.Pop(); // @visit
            foreach (int next in neighbours[node])
            {
                if (!seen[next])
                {
                    seen[next] = true; // @mark
                    stack.Push(next);
                }
            }
        }
    }
    return components; // @done
}
// #endregion
