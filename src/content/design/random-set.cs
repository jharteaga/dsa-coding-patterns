// #region array
class RandomizedSetArray
{
    private readonly List<int> items = new();
    private readonly Random random = new();

    public bool Insert(int value)
    {
        if (items.Contains(value)) return false; // O(n) search
        items.Add(value);
        return true;
    }

    public bool Remove(int value) => items.Remove(value); // O(n): search, then shift to close the gap

    public int GetRandom() => items[random.Next(items.Count)];
}
// #endregion

// #region mapped
class RandomizedSet
{
    private readonly List<int> items = new(); // the values, packed with no gaps -> random access by index
    private readonly Dictionary<int, int> indexOf = new(); // value -> where it sits in `items`
    private readonly Random random = new();

    public bool Insert(int value)
    {
        if (indexOf.ContainsKey(value)) return false;
        indexOf[value] = items.Count;
        items.Add(value);
        return true;
    }

    public bool Remove(int value)
    {
        if (!indexOf.TryGetValue(value, out int i)) return false;
        // Overwrite the removed slot with the LAST item, then drop the last slot.
        // Nothing shifts, so this is O(1).
        int last = items[^1];
        items[i] = last;
        indexOf[last] = i;
        items.RemoveAt(items.Count - 1);
        indexOf.Remove(value);
        return true;
    }

    public int GetRandom() => items[random.Next(items.Count)];
}
// #endregion
