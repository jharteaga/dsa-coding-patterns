// #region brute
IList<int> FindDisappearedBrute(int[] nums)
{
    var missing = new List<int>();
    for (int value = 1; value <= nums.Length; value++)
    {
        if (!nums.Contains(value)) missing.Add(value);
    }
    return missing;
}
// #endregion

// #region set
IList<int> FindDisappearedSet(int[] nums)
{
    var present = new HashSet<int>(nums);
    var missing = new List<int>();
    for (int value = 1; value <= nums.Length; value++)
    {
        if (!present.Contains(value)) missing.Add(value);
    }
    return missing;
}
// #endregion

// #region cyclic
IList<int> FindDisappeared(int[] nums)
{
    int i = 0;
    while (i < nums.Length)
    {
        int home = nums[i] - 1; // value v belongs at index v - 1
        if (nums[home] != nums[i])
        {
            (nums[i], nums[home]) = (nums[home], nums[i]);
        }
        else
        {
            i++; // in place, or a duplicate of what is already home
        }
    }
    var missing = new List<int>();
    for (int j = 0; j < nums.Length; j++)
    {
        if (nums[j] != j + 1) missing.Add(j + 1);
    }
    return missing;
}
// #endregion
