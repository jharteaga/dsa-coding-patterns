// #region recursion
int KnapsackRecursive(int[] weights, int[] values, int capacity)
{
    // Best value using items i, i+1, ... with `room` capacity left.
    int Best(int i, int room)
    {
        if (i == weights.Length) return 0;
        int skip = Best(i + 1, room);
        if (weights[i] > room) return skip; // does not fit
        int take = values[i] + Best(i + 1, room - weights[i]);
        return Math.Max(skip, take);
    }
    return Best(0, capacity);
}
// #endregion

// #region table
int Knapsack(int[] weights, int[] values, int capacity)
{
    int n = weights.Length;
    // dp[i, c] = best value using only the first i items with capacity c.
    var dp = new int[n + 1, capacity + 1]; // @init
    for (int i = 1; i <= n; i++)
    {
        int w = weights[i - 1];
        int v = values[i - 1];
        for (int c = 0; c <= capacity; c++)
        {
            dp[i, c] = dp[i - 1, c]; // option 1: skip item i // @skip
            if (w <= c)
            {
                dp[i, c] = Math.Max(dp[i, c], v + dp[i - 1, c - w]); // option 2: take it // @take
            }
        }
    }
    return dp[n, capacity]; // @done
}
// #endregion
