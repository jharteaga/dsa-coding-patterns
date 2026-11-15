// #region linear
int[] FindRangeLinear(int[] nums, int target)
{
    int first = -1;
    int last = -1;
    for (int i = 0; i < nums.Length; i++)
    {
        if (nums[i] == target)
        {
            if (first == -1) first = i; // @first
            last = i; // @last
        }
    }
    return new[] { first, last }; // @done
}
// #endregion

// #region binary
int[] FindRange(int[] nums, int target)
{
    // Index of the first element >= x (nums.Length if there is none).
    int LowerBound(long x)
    {
        int lo = 0;
        int hi = nums.Length; // @init
        while (lo < hi)
        {
            int mid = lo + (hi - lo) / 2; // @mid
            if (nums[mid] < x) lo = mid + 1; // @right
            else hi = mid; // @left
        }
        return lo; // @bound
    }

    int first = LowerBound(target);
    if (first == nums.Length || nums[first] != target) return new[] { -1, -1 }; // @miss
    int last = LowerBound((long)target + 1) - 1; // @last
    return new[] { first, last }; // @done
}
// #endregion
