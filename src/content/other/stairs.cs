// #region recursion
long ClimbRecursive(int n)
{
    if (n <= 1) return 1; // one way to stand still or take a single step
    // The last move was either a 1-step (from n-1) or a 2-step (from n-2).
    return ClimbRecursive(n - 1) + ClimbRecursive(n - 2);
}
// #endregion

// #region memo
long ClimbMemo(int n, Dictionary<int, long>? memo = null)
{
    memo ??= new Dictionary<int, long>();
    if (n <= 1) return 1;
    if (memo.TryGetValue(n, out long known)) return known; // already solved: reuse it
    long ways = ClimbMemo(n - 1, memo) + ClimbMemo(n - 2, memo);
    memo[n] = ways;
    return ways;
}
// #endregion

// #region table
long ClimbTable(int n)
{
    var ways = new long[Math.Max(n + 1, 2)];
    ways[0] = 1;
    ways[1] = 1; // @base
    for (int step = 2; step <= n; step++)
    {
        ways[step] = ways[step - 1] + ways[step - 2]; // @fill
    }
    return ways[n]; // @done
}
// #endregion

// #region two
long Climb(int n)
{
    long prev = 1; // ways to reach the step two below
    long cur = 1; // ways to reach the step one below
    for (int step = 2; step <= n; step++)
    {
        (prev, cur) = (cur, prev + cur); // only the last two values are ever needed
    }
    return cur;
}
// #endregion
