// #region sort
double[] MediansSort(int[] values)
{
    var seen = new List<int>();
    var result = new double[values.Length];
    for (int i = 0; i < values.Length; i++)
    {
        seen.Add(values[i]);
        var sorted = seen.OrderBy(x => x).ToList(); // re-sort everything, every time
        int mid = sorted.Count / 2;
        result[i] = sorted.Count % 2 == 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2.0;
    }
    return result;
}
// #endregion

// #region heaps
double[] Medians(int[] values)
{
    // max-heap: the smaller half, largest on top
    var low = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
    // min-heap: the larger half, smallest on top
    var high = new PriorityQueue<int, int>();
    var result = new double[values.Length];
    for (int i = 0; i < values.Length; i++)
    {
        int value = values[i];
        // 1. Put the value in the correct half.
        if (low.Count == 0 || value <= low.Peek()) low.Enqueue(value, value); // @low
        else high.Enqueue(value, value); // @high
        // 2. Rebalance so that low has the same number of items as high, or one more.
        if (low.Count > high.Count + 1) { int m = low.Dequeue(); high.Enqueue(m, m); } // @balance
        else if (high.Count > low.Count) { int m = high.Dequeue(); low.Enqueue(m, m); }
        // 3. The median sits on top of the heaps.
        result[i] = low.Count > high.Count ? low.Peek() : (low.Peek() + high.Peek()) / 2.0; // @median
    }
    return result;
}
// #endregion
