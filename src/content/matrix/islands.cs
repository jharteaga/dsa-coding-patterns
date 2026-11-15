// #region relabel
int NumIslandsRelabel(int[][] grid)
{
    int rows = grid.Length;
    int cols = rows > 0 ? grid[0].Length : 0;
    // Give every land cell its own label...
    var label = new int[rows, cols];
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            label[r, c] = grid[r][c] == 1 ? r * cols + c : -1;

    // ...then let each cell copy the smallest label among its neighbours,
    // sweeping the whole grid again and again until nothing changes.
    int[] dr = { -1, 1, 0, 0 };
    int[] dc = { 0, 0, -1, 1 };
    bool changed = true;
    while (changed)
    {
        changed = false;
        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                if (label[r, c] == -1) continue;
                for (int d = 0; d < 4; d++)
                {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || label[nr, nc] == -1) continue;
                    if (label[nr, nc] < label[r, c])
                    {
                        label[r, c] = label[nr, nc];
                        changed = true;
                    }
                }
            }
        }
    }
    var distinct = new HashSet<int>();
    foreach (int x in label) if (x != -1) distinct.Add(x);
    return distinct.Count;
}
// #endregion

// #region flood
int NumIslands(int[][] grid)
{
    int rows = grid.Length;
    int cols = rows > 0 ? grid[0].Length : 0;
    var seen = new bool[rows, cols];
    int[] dr = { -1, 1, 0, 0 };
    int[] dc = { 0, 0, -1, 1 };
    int islands = 0;

    for (int r = 0; r < rows; r++)
    {
        for (int c = 0; c < cols; c++)
        {
            if (grid[r][c] != 1 || seen[r, c]) continue; // @scan
            islands++; // unvisited land = a brand-new island // @new
            // Flood fill: mark every cell reachable from here.
            var stack = new Stack<(int r, int c)>();
            stack.Push((r, c));
            seen[r, c] = true;
            while (stack.Count > 0)
            {
                var (cr, cc) = stack.Pop(); // @pop
                for (int d = 0; d < 4; d++)
                {
                    int nr = cr + dr[d], nc = cc + dc[d];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                    if (grid[nr][nc] != 1 || seen[nr, nc]) continue;
                    seen[nr, nc] = true; // @mark
                    stack.Push((nr, nc));
                }
            }
        }
    }
    return islands; // @done
}
// #endregion
