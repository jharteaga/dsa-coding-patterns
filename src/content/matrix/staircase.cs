// #region scan
bool SearchMatrixScan(int[][] matrix, int target)
{
    foreach (int[] row in matrix)
    {
        foreach (int value in row)
        {
            if (value == target) return true;
        }
    }
    return false;
}
// #endregion

// #region rows
bool SearchMatrixRows(int[][] matrix, int target)
{
    // Each row is sorted, so binary search every row.
    foreach (int[] row in matrix)
    {
        int lo = 0;
        int hi = row.Length - 1;
        while (lo <= hi)
        {
            int mid = lo + (hi - lo) / 2;
            if (row[mid] == target) return true;
            if (row[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return false;
}
// #endregion

// #region stairs
bool SearchMatrix(int[][] matrix, int target)
{
    if (matrix.Length == 0) return false;
    int r = 0;
    int c = matrix[0].Length - 1; // start at the top-right corner // @init
    while (r < matrix.Length && c >= 0)
    {
        int value = matrix[r][c]; // @look
        if (value == target) return true; // @found
        if (value > target) c--; // everything below in this column is even bigger // @left
        else r++; // everything to the left in this row is even smaller // @down
    }
    return false; // @miss
}
// #endregion
