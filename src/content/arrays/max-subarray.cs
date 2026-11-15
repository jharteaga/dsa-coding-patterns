// #region brute
int MaxSubarrayBrute(int[] nums)
{
    int best = int.MinValue;
    for (int start = 0; start < nums.Length; start++)
    {
        int sum = 0;
        for (int end = start; end < nums.Length; end++)
        {
            sum += nums[end];
            best = Math.Max(best, sum);
        }
    }
    return best;
}
// #endregion

// #region kadane
int MaxSubarray(int[] nums)
{
    int current = nums[0]; // best sum of a subarray ending exactly here
    int best = nums[0]; // @init
    for (int i = 1; i < nums.Length; i++)
    {
        // Extend the previous run, or start fresh at nums[i]?
        current = Math.Max(nums[i], current + nums[i]); // @choose
        best = Math.Max(best, current); // @best
    }
    return best; // @done
}
// #endregion
