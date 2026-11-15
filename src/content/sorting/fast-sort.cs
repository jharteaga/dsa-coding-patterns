// #region merge
int[] MergeSort(int[] nums)
{
    void Sort(int lo, int hi)
    {
        if (lo >= hi) return; // 0 or 1 element: already sorted
        int mid = lo + (hi - lo) / 2; // @split
        Sort(lo, mid);
        Sort(mid + 1, hi);

        // Merge the two sorted halves nums[lo..mid] and nums[mid+1..hi].
        int[] left = nums[lo..(mid + 1)];
        int[] right = nums[(mid + 1)..(hi + 1)]; // @halves
        int i = 0, j = 0, k = lo;
        while (i < left.Length && j < right.Length)
        {
            nums[k++] = left[i] <= right[j] ? left[i++] : right[j++]; // @take
        }
        while (i < left.Length) nums[k++] = left[i++]; // @rest
        while (j < right.Length) nums[k++] = right[j++];
    }
    Sort(0, nums.Length - 1);
    return nums; // @done
}
// #endregion

// #region quick
int[] QuickSort(int[] nums)
{
    void Sort(int lo, int hi)
    {
        if (lo >= hi) return;
        // Use the middle element as pivot; park it at the end.
        int mid = lo + (hi - lo) / 2;
        (nums[mid], nums[hi]) = (nums[hi], nums[mid]);
        int pivot = nums[hi]; // @pivot

        // Partition: everything smaller than the pivot goes to the left.
        int store = lo;
        for (int i = lo; i < hi; i++)
        {
            if (nums[i] < pivot) // @compare
            {
                (nums[i], nums[store]) = (nums[store], nums[i]); // @swap
                store++;
            }
        }
        (nums[store], nums[hi]) = (nums[hi], nums[store]); // pivot lands in its final place // @place

        Sort(lo, store - 1);
        Sort(store + 1, hi);
    }
    Sort(0, nums.Length - 1);
    return nums; // @done
}
// #endregion

// #region heap
int[] HeapSort(int[] nums)
{
    int n = nums.Length;
    // Push nums[i] down until both children are smaller (max-heap inside nums[0..size)).
    void SiftDown(int i, int size)
    {
        while (true)
        {
            int l = 2 * i + 1;
            int r = l + 1;
            int largest = i;
            if (l < size && nums[l] > nums[largest]) largest = l;
            if (r < size && nums[r] > nums[largest]) largest = r;
            if (largest == i) return;
            (nums[i], nums[largest]) = (nums[largest], nums[i]);
            i = largest;
        }
    }

    // 1. Turn the array into a max-heap: O(n).
    for (int i = n / 2 - 1; i >= 0; i--) SiftDown(i, n);
    // 2. Repeatedly move the maximum to the end and shrink the heap.
    for (int end = n - 1; end > 0; end--)
    {
        (nums[0], nums[end]) = (nums[end], nums[0]);
        SiftDown(0, end);
    }
    return nums;
}
// #endregion

// #region counting
int[] CountingSort(int[] nums)
{
    if (nums.Length == 0) return nums;
    int min = nums[0];
    int max = nums[0];
    foreach (int x in nums)
    {
        if (x < min) min = x;
        if (x > max) max = x;
    }
    // One counter per possible value. No comparisons between elements at all.
    var counts = new int[max - min + 1];
    foreach (int x in nums) counts[x - min]++;

    int k = 0;
    for (int v = 0; v < counts.Length; v++)
    {
        for (int c = counts[v]; c > 0; c--) nums[k++] = v + min;
    }
    return nums;
}
// #endregion
