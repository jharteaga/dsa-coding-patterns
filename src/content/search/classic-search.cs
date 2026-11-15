// #region linear
int LinearSearch(int[] nums, int target)
{
    for (int i = 0; i < nums.Length; i++)
    {
        if (nums[i] == target) return i; // @check
    }
    return -1; // @miss
}
// #endregion

// #region binary
int BinarySearch(int[] nums, int target)
{
    int lo = 0;
    int hi = nums.Length - 1; // @init
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2; // @mid
        if (nums[mid] == target) return mid; // @found
        if (nums[mid] < target) lo = mid + 1; // @right
        else hi = mid - 1; // @left
    }
    return -1; // @miss
}
// #endregion
