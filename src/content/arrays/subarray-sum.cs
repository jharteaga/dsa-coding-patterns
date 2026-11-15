// #region brute
int SubarraySumBrute(int[] nums, int k)
{
    int count = 0;
    for (int start = 0; start < nums.Length; start++)
    {
        int sum = 0;
        for (int end = start; end < nums.Length; end++)
        {
            sum += nums[end]; // sum of nums[start..end]
            if (sum == k) count++;
        }
    }
    return count;
}
// #endregion

// #region prefix
int SubarraySum(int[] nums, int k)
{
    // seen[s] = how many prefixes so far have sum s
    var seen = new Dictionary<int, int> { [0] = 1 }; // the empty prefix
    int prefix = 0;
    int count = 0;
    foreach (int x in nums)
    {
        prefix += x;
        // A subarray ending here sums to k exactly when an earlier
        // prefix equals (prefix - k).
        count += seen.GetValueOrDefault(prefix - k);
        seen[prefix] = seen.GetValueOrDefault(prefix) + 1;
    }
    return count;
}
// #endregion
