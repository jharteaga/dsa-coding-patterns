// #region visited
IList<int> SpiralVisited(int[][] matrix)
{
    var result = new List<int>();
    if (matrix.Length == 0) return result;
    int rows = matrix.Length, cols = matrix[0].Length;
    var seen = new bool[rows, cols]; // a whole second matrix
    int[] dr = { 0, 1, 0, -1 }; // right, down, left, up
    int[] dc = { 1, 0, -1, 0 };
    int r = 0, c = 0, dir = 0;
    for (int k = 0; k < rows * cols; k++)
    {
        result.Add(matrix[r][c]);
        seen[r, c] = true;
        int nr = r + dr[dir];
        int nc = c + dc[dir];
        // Turn right when the next cell is outside the matrix or already visited.
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr, nc]) dir = (dir + 1) % 4;
        r += dr[dir];
        c += dc[dir];
    }
    return result;
}
// #endregion

// #region layers
IList<int> Spiral(int[][] matrix)
{
    var result = new List<int>();
    if (matrix.Length == 0) return result;
    int top = 0;
    int bottom = matrix.Length - 1;
    int left = 0;
    int right = matrix[0].Length - 1; // @init
    while (top <= bottom && left <= right)
    {
        for (int c = left; c <= right; c++) result.Add(matrix[top][c]); // @right
        top++;
        for (int r = top; r <= bottom; r++) result.Add(matrix[r][right]); // @down
        right--;
        if (top <= bottom)
        {
            for (int c = right; c >= left; c--) result.Add(matrix[bottom][c]); // @left
            bottom--;
        }
        if (left <= right)
        {
            for (int r = bottom; r >= top; r--) result.Add(matrix[r][left]); // @up
            left++;
        }
    }
    return result; // @done
}
// #endregion
