// #region brute
int[] SortedSquaresBrute(int[] nums)
{
    // Squaring breaks the order (negatives become large), so sort again.
    int[] squares = nums.Select(x => x * x).ToArray();
    Array.Sort(squares);
    return squares;
}
// #endregion

// #region two
int[] SortedSquares(int[] nums)
{
    var result = new int[nums.Length];
    int left = 0;
    int right = nums.Length - 1;
    // The largest square is always at one of the two ends. Fill `result` from the back.
    for (int k = nums.Length - 1; k >= 0; k--)
    {
        if (Math.Abs(nums[left]) > Math.Abs(nums[right]))
        {
            result[k] = nums[left] * nums[left];
            left++;
        }
        else
        {
            result[k] = nums[right] * nums[right];
            right--;
        }
    }
    return result;
}
// #endregion
