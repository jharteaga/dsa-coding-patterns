// #region brute
int[] MaxSlidingWindowBrute(int[] nums, int k)
{
    var result = new List<int>();
    for (int start = 0; start + k <= nums.Length; start++)
    {
        int max = nums[start];
        for (int i = start + 1; i < start + k; i++) max = Math.Max(max, nums[i]); // rescan the window
        result.Add(max);
    }
    return result.ToArray();
}
// #endregion

// #region deque
int[] MaxSlidingWindow(int[] nums, int k)
{
    var result = new List<int>();
    var deque = new LinkedList<int>(); // indices; their values decrease from front to back
    for (int i = 0; i < nums.Length; i++)
    {
        // 1. Drop the front if it has slid out of the window.
        if (deque.Count > 0 && deque.First!.Value <= i - k) deque.RemoveFirst(); // @expire
        // 2. Drop smaller values from the back: they can never be the max again.
        while (deque.Count > 0 && nums[deque.Last!.Value] <= nums[i]) deque.RemoveLast(); // @evict
        deque.AddLast(i); // @push
        // 3. The front is the maximum of the current window.
        if (i >= k - 1) result.Add(nums[deque.First!.Value]); // @record
    }
    return result.ToArray(); // @done
}
// #endregion
