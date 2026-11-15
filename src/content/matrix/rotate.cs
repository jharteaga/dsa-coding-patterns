// #region copy
void RotateCopy(int[][] matrix)
{
    int n = matrix.Length;
    int[][] copy = matrix.Select(row => (int[])row.Clone()).ToArray(); // O(n²) extra memory
    for (int r = 0; r < n; r++)
    {
        for (int c = 0; c < n; c++)
        {
            // Row r becomes column n-1-r.
            matrix[c][n - 1 - r] = copy[r][c];
        }
    }
}
// #endregion

// #region inplace
void Rotate(int[][] matrix)
{
    int n = matrix.Length;
    // 1. Transpose: flip over the main diagonal (rows become columns).
    for (int r = 0; r < n; r++)
    {
        for (int c = r + 1; c < n; c++)
        {
            (matrix[r][c], matrix[c][r]) = (matrix[c][r], matrix[r][c]);
        }
    }
    // 2. Reverse every row.
    foreach (int[] row in matrix) Array.Reverse(row);
}
// #endregion
