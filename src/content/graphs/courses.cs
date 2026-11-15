// #region rescan
bool CanFinishRescan(int n, int[][] prerequisites)
{
    var done = new bool[n];
    int finished = 0;
    bool progress = true;
    // Keep looking for any course whose prerequisites are all done.
    while (progress)
    {
        progress = false;
        for (int course = 0; course < n; course++)
        {
            if (done[course]) continue;
            // Scans the WHOLE prerequisite list for this one course.
            bool ready = prerequisites.All(p => p[0] != course || done[p[1]]);
            if (ready)
            {
                done[course] = true;
                finished++;
                progress = true;
            }
        }
    }
    return finished == n;
}
// #endregion

// #region kahn
bool CanFinish(int n, int[][] prerequisites)
{
    var unlocks = new List<int>[n]; // pre -> courses it unlocks
    for (int i = 0; i < n; i++) unlocks[i] = new List<int>();
    var missing = new int[n]; // course -> prerequisites not yet done
    foreach (int[] p in prerequisites)
    {
        unlocks[p[1]].Add(p[0]);
        missing[p[0]]++; // @build
    }

    var ready = new Stack<int>(); // courses that can be taken right now
    for (int c = 0; c < n; c++) if (missing[c] == 0) ready.Push(c); // @ready

    int taken = 0;
    while (ready.Count > 0)
    {
        int course = ready.Pop(); // @take
        taken++;
        foreach (int next in unlocks[course])
        {
            missing[next]--; // one prerequisite fewer // @unlock
            if (missing[next] == 0) ready.Push(next);
        }
    }
    return taken == n; // courses stuck in a cycle never become ready // @done
}
// #endregion
