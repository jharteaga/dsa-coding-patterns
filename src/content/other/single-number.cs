// #region brute
int SingleNumberBrute(int[] nums)
{
    for (int i = 0; i < nums.Length; i++)
    {
        int count = 0;
        for (int j = 0; j < nums.Length; j++)
        {
            if (nums[j] == nums[i]) count++;
        }
        if (count == 1) return nums[i];
    }
    return -1;
}
// #endregion

// #region set
int SingleNumberSet(int[] nums)
{
    var unpaired = new HashSet<int>();
    foreach (int x in nums)
    {
        if (!unpaired.Add(x)) unpaired.Remove(x); // second sighting: its pair is complete
    }
    return unpaired.First();
}
// #endregion

// #region xor
int SingleNumber(int[] nums)
{
    int result = 0; // @init
    foreach (int x in nums)
    {
        result ^= x; // pairs cancel out: a ^ a = 0 // @xor
    }
    return result; // @done
}
// #endregion
