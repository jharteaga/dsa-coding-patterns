// #region brute
int MaxSumBrute(int[] nums, int k)
{
    int best = int.MinValue;
    for (int start = 0; start + k <= nums.Length; start++)
    {
        int sum = 0;
        for (int i = start; i < start + k; i++) sum += nums[i]; // re-add all k elements // @add
        best = Math.Max(best, sum); // @best
    }
    return best; // @done
}
// #endregion

// #region window
int MaxSum(int[] nums, int k)
{
    int sum = 0;
    for (int i = 0; i < k; i++) sum += nums[i]; // first window // @first
    int best = sum;
    for (int right = k; right < nums.Length; right++)
    {
        sum += nums[right]; // one element enters on the right... // @enter
        sum -= nums[right - k]; // ...one leaves on the left // @leave
        best = Math.Max(best, sum); // @best
    }
    return best; // @done
}
// #endregion
