// #region brute
int[][] MergeBrute(int[][] intervals)
{
    var list = intervals.Select(iv => (int[])iv.Clone()).ToList();
    bool merged = true;
    // Keep scanning all pairs until a full scan finds nothing to merge.
    while (merged)
    {
        merged = false;
        for (int i = 0; i < list.Count && !merged; i++)
        {
            for (int j = i + 1; j < list.Count && !merged; j++)
            {
                int[] a = list[i], b = list[j];
                if (a[0] <= b[1] && b[0] <= a[1])
                {
                    list[i] = new[] { Math.Min(a[0], b[0]), Math.Max(a[1], b[1]) };
                    list.RemoveAt(j);
                    merged = true; // the list changed: start over
                }
            }
        }
    }
    return list.OrderBy(iv => iv[0]).ToArray();
}
// #endregion

// #region sort
int[][] Merge(int[][] intervals)
{
    var sorted = intervals.Select(iv => (int[])iv.Clone()).OrderBy(iv => iv[0]).ToArray(); // @sort
    var result = new List<int[]>();
    foreach (int[] cur in sorted)
    {
        int[]? last = result.Count > 0 ? result[^1] : null;
        if (last != null && cur[0] <= last[1])
        {
            last[1] = Math.Max(last[1], cur[1]); // overlaps: extend // @extend
        }
        else
        {
            result.Add(cur); // gap: start a new interval // @new
        }
    }
    return result.ToArray(); // @done
}
// #endregion
