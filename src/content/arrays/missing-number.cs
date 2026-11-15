// #region brute
int MissingNumberBrute(int[] nums)
{
    for (int value = 0; value <= nums.Length; value++)
    {
        if (!nums.Contains(value)) return value; // Contains() scans the whole array
    }
    return -1;
}
// #endregion

// #region cyclic
int MissingNumber(int[] nums)
{
    int n = nums.Length;
    int i = 0;
    while (i < n)
    {
        int home = nums[i]; // value v belongs at index v // @look
        if (home < n && nums[home] != nums[i])
        {
            (nums[i], nums[home]) = (nums[home], nums[i]); // send it home // @swap
        }
        else
        {
            i++; // already home (or it is n, which has no slot) // @next
        }
    }
    for (int j = 0; j < n; j++)
    {
        if (nums[j] != j) return j; // @scan
    }
    return n; // @all
}
// #endregion
