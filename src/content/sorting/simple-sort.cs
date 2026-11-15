// #region bubble
int[] BubbleSort(int[] nums)
{
    int n = nums.Length;
    for (int pass = 0; pass < n - 1; pass++)
    {
        bool swapped = false;
        // After each pass the largest remaining value has "bubbled" to the end.
        for (int j = 0; j < n - 1 - pass; j++)
        {
            if (nums[j] > nums[j + 1]) // @compare
            {
                (nums[j], nums[j + 1]) = (nums[j + 1], nums[j]); // @swap
                swapped = true;
            }
        }
        if (!swapped) break; // no swaps = already sorted // @early
    }
    return nums; // @done
}
// #endregion

// #region selection
int[] SelectionSort(int[] nums)
{
    int n = nums.Length;
    for (int i = 0; i < n - 1; i++)
    {
        int min = i; // @start
        for (int j = i + 1; j < n; j++)
        {
            if (nums[j] < nums[min]) min = j; // @compare
        }
        if (min != i) (nums[i], nums[min]) = (nums[min], nums[i]); // @swap
    }
    return nums; // @done
}
// #endregion

// #region insertion
int[] InsertionSort(int[] nums)
{
    for (int i = 1; i < nums.Length; i++)
    {
        int value = nums[i]; // @pick
        int j = i - 1;
        // Shift larger values one slot right to open a gap.
        while (j >= 0 && nums[j] > value)
        {
            nums[j + 1] = nums[j]; // @shift
            j--;
        }
        nums[j + 1] = value; // @insert
    }
    return nums; // @done
}
// #endregion
