// #region brute
int LargestRectangleBrute(int[] heights)
{
    int best = 0;
    for (int left = 0; left < heights.Length; left++)
    {
        int lowest = int.MaxValue;
        for (int right = left; right < heights.Length; right++)
        {
            lowest = Math.Min(lowest, heights[right]); // shortest bar in [left..right]
            best = Math.Max(best, lowest * (right - left + 1));
        }
    }
    return best;
}
// #endregion

// #region stack
int LargestRectangle(int[] heights)
{
    int best = 0;
    var stack = new Stack<int>(); // indices of bars with increasing heights
    for (int i = 0; i <= heights.Length; i++)
    {
        int h = i == heights.Length ? 0 : heights[i]; // a final 0 flushes the stack
        // A shorter bar ends every taller bar's rectangle.
        while (stack.Count > 0 && heights[stack.Peek()] > h)
        {
            int height = heights[stack.Pop()];
            // The rectangle spans from just after the previous shorter bar up to i - 1.
            int leftEdge = stack.Count == 0 ? 0 : stack.Peek() + 1;
            best = Math.Max(best, height * (i - leftEdge));
        }
        stack.Push(i);
    }
    return best;
}
// #endregion
