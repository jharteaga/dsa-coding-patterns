// #region sort
int KthLargestSort(int[] nums, int k)
{
    int[] sorted = nums.OrderByDescending(x => x).ToArray(); // largest first: orders ALL n values
    return sorted[k - 1];
}
// #endregion

// #region heap
int KthLargest(int[] nums, int k)
{
    // Min-heap holding the k largest values seen so far.
    // Its top is the smallest of them = the k-th largest overall.
    var heap = new PriorityQueue<int, int>();
    foreach (int x in nums)
    {
        if (heap.Count < k)
        {
            heap.Enqueue(x, x); // still filling up // @fill
        }
        else if (x > heap.Peek())
        {
            heap.Dequeue(); // x beats the weakest of the top k: swap them // @replace
            heap.Enqueue(x, x);
        } // otherwise x is too small to matter // @skip
    }
    return heap.Peek(); // @done
}
// #endregion
