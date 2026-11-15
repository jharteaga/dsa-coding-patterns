// #region linear
int SearchRotatedLinear(int[] nums, int target)
{
    for (int i = 0; i < nums.Length; i++)
    {
        if (nums[i] == target) return i;
    }
    return -1;
}
// #endregion

// #region binary
int SearchRotated(int[] nums, int target)
{
    int lo = 0;
    int hi = nums.Length - 1; // @init
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2; // @mid
        if (nums[mid] == target) return mid; // @found

        if (nums[lo] <= nums[mid])
        {
            // Left half [lo..mid] is sorted. // @left-sorted
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; // @go-left
            else lo = mid + 1; // @go-right
        }
        else
        {
            // Otherwise the right half [mid..hi] must be sorted. // @right-sorted
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; // @go-right2
            else hi = mid - 1; // @go-left2
        }
    }
    return -1; // @miss
}
// #endregion
