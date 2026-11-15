// #region brute
int[] TwoSumBrute(int[] nums, int target)
{
    for (int i = 0; i < nums.Length; i++)
    {
        for (int j = i + 1; j < nums.Length; j++)
        {
            if (nums[i] + nums[j] == target) return new[] { i, j };
        }
    }
    return new[] { -1, -1 };
}
// #endregion

// #region map
int[] TwoSum(int[] nums, int target)
{
    var seen = new Dictionary<int, int>(); // value -> index where we saw it
    for (int j = 0; j < nums.Length; j++)
    {
        int need = target - nums[j]; // @need
        if (seen.TryGetValue(need, out int i)) return new[] { i, j }; // @found
        seen[nums[j]] = j; // @store
    }
    return new[] { -1, -1 }; // @miss
}
// #endregion
