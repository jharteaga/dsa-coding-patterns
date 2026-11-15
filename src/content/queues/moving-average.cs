// #region resum
double[] MovingAveragesResum(int size, int[] values)
{
    var all = new List<int>();
    var result = new double[values.Length];
    for (int k = 0; k < values.Length; k++)
    {
        all.Add(values[k]); // history grows forever
        int from = Math.Max(0, all.Count - size);
        long sum = 0;
        for (int i = from; i < all.Count; i++) sum += all[i]; // re-add the whole window
        result[k] = (double)sum / (all.Count - from);
    }
    return result;
}
// #endregion

// #region ring
double[] MovingAverages(int size, int[] values)
{
    var ring = new int[size]; // only the last `size` values
    int next = 0; // slot to overwrite next = slot holding the oldest value
    int count = 0;
    long sum = 0;
    var result = new double[values.Length];
    for (int k = 0; k < values.Length; k++)
    {
        sum -= ring[next]; // the oldest value leaves the window (0 while filling up)
        sum += values[k]; // the new value enters
        ring[next] = values[k]; // overwrite the oldest slot
        next = (next + 1) % size;
        if (count < size) count++;
        result[k] = (double)sum / count;
    }
    return result;
}
// #endregion
