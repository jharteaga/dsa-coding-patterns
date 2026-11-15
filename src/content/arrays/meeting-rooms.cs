// #region brute
bool CanAttendAllBrute(int[][] meetings)
{
    for (int i = 0; i < meetings.Length; i++)
    {
        for (int j = i + 1; j < meetings.Length; j++)
        {
            int[] a = meetings[i], b = meetings[j];
            // Two meetings clash if each one starts before the other ends.
            if (a[0] < b[1] && b[0] < a[1]) return false;
        }
    }
    return true;
}
// #endregion

// #region sort
bool CanAttendAll(int[][] meetings)
{
    var sorted = meetings.OrderBy(m => m[0]).ToArray();
    for (int i = 1; i < sorted.Length; i++)
    {
        // After sorting, a clash can only be with the meeting just before.
        if (sorted[i][0] < sorted[i - 1][1]) return false;
    }
    return true;
}
// #endregion
