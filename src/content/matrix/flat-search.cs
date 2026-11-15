// #region scan
bool SearchFlatScan(int[][] matrix, int target)
{
    foreach (int[] row in matrix)
    {
        if (row.Contains(target)) return true;
    }
    return false;
}
// #endregion

// #region binary
bool SearchFlat(int[][] matrix, int target)
{
    if (matrix.Length == 0) return false;
    int cols = matrix[0].Length;
    // Pretend the matrix is one long sorted array of rows * cols elements.
    int lo = 0;
    int hi = matrix.Length * cols - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        int value = matrix[mid / cols][mid % cols]; // index -> (row, col)
        if (value == target) return true;
        if (value < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}
// #endregion
