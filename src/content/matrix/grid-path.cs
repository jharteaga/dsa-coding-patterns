// #region dfs
int ShortestPathDfs(int[][] grid)
{
    int rows = grid.Length;
    int cols = rows > 0 ? grid[0].Length : 0;
    if (rows == 0 || grid[0][0] == 1) return -1;
    var onPath = new bool[rows, cols];
    int[] dr = { 1, 0, -1, 0 };
    int[] dc = { 0, 1, 0, -1 };
    int best = int.MaxValue;

    // Try every possible route and remember the shortest.
    void Walk(int r, int c, int steps)
    {
        if (r == rows - 1 && c == cols - 1)
        {
            best = Math.Min(best, steps);
            return;
        }
        onPath[r, c] = true;
        for (int d = 0; d < 4; d++)
        {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] == 1 || onPath[nr, nc]) continue;
            Walk(nr, nc, steps + 1);
        }
        onPath[r, c] = false; // un-mark, so other routes may pass through here
    }
    Walk(0, 0, 0);
    return best == int.MaxValue ? -1 : best;
}
// #endregion

// #region bfs
int ShortestPath(int[][] grid)
{
    int rows = grid.Length;
    int cols = rows > 0 ? grid[0].Length : 0;
    if (rows == 0 || grid[0][0] == 1) return -1;
    var seen = new bool[rows, cols];
    seen[0, 0] = true;
    int[] dr = { 1, 0, -1, 0 };
    int[] dc = { 0, 1, 0, -1 };
    var frontier = new List<(int r, int c)> { (0, 0) }; // all cells exactly `steps` moves from the start
    int steps = 0;
    while (frontier.Count > 0)
    {
        var next = new List<(int r, int c)>();
        foreach (var (r, c) in frontier)
        {
            if (r == rows - 1 && c == cols - 1) return steps; // first arrival = shortest
            for (int d = 0; d < 4; d++)
            {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr][nc] == 1 || seen[nr, nc]) continue;
                seen[nr, nc] = true; // marked for good: we already have the shortest way here
                next.Add((nr, nc));
            }
        }
        frontier = next;
        steps++;
    }
    return -1;
}
// #endregion
