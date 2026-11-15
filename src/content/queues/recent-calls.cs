// #region scan
int[] RecentCountsScan(int[] times)
{
    var all = new List<int>();
    var result = new int[times.Length];
    for (int i = 0; i < times.Length; i++)
    {
        int t = times[i];
        all.Add(t);
        // Re-count every request ever received.
        int count = 0;
        foreach (int earlier in all) if (earlier >= t - 3000) count++;
        result[i] = count;
    }
    return result;
}
// #endregion

// #region queue
int[] RecentCounts(int[] times)
{
    var queue = new Queue<int>(); // requests still inside the 3000 ms window
    var result = new int[times.Length];
    for (int i = 0; i < times.Length; i++)
    {
        int t = times[i];
        queue.Enqueue(t); // newest joins at the back
        while (queue.Peek() < t - 3000) queue.Dequeue(); // expired ones leave from the front
        result[i] = queue.Count;
    }
    return result;
}
// #endregion
