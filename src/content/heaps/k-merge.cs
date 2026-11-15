// #region concat
int[] MergeKSort(int[][] lists)
{
    // Glue everything together and sort from scratch,
    // ignoring that every list was already sorted.
    int[] all = lists.SelectMany(list => list).ToArray();
    Array.Sort(all);
    return all;
}
// #endregion

// #region heap
int[] MergeK(int[][] lists)
{
    // Heap entries: (which list, index inside that list), ordered by the value there.
    var heap = new PriorityQueue<(int list, int index), int>();
    for (int li = 0; li < lists.Length; li++)
    {
        if (lists[li].Length > 0) heap.Enqueue((li, 0), lists[li][0]); // the head of every list // @seed
    }

    var result = new List<int>();
    while (heap.Count > 0)
    {
        var (li, i) = heap.Dequeue(); // smallest of all the heads // @pop
        result.Add(lists[li][i]);
        if (i + 1 < lists[li].Length) heap.Enqueue((li, i + 1), lists[li][i + 1]); // its successor steps up // @push
    }
    return result.ToArray(); // @done
}
// #endregion
