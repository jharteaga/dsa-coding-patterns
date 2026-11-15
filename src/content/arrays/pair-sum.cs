// #region brute
int[] PairSumBrute(int[] nums, int target)
{
    for (int i = 0; i < nums.Length; i++)
    {
        for (int j = i + 1; j < nums.Length; j++)
        {
            if (nums[i] + nums[j] == target) return new[] { i, j }; // @check
        }
    }
    return new[] { -1, -1 }; // @miss
}
// #endregion

// #region two
int[] PairSum(int[] nums, int target)
{
    int left = 0;
    int right = nums.Length - 1; // @init
    while (left < right)
    {
        int sum = nums[left] + nums[right]; // @sum
        if (sum == target) return new[] { left, right }; // @found
        if (sum < target) left++; // need a bigger sum // @left
        else right--; // need a smaller sum // @right
    }
    return new[] { -1, -1 }; // @miss
}
// #endregion
