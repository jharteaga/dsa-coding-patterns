// #region scan
class LFUCacheScan
{
    private class Entry { public int Key, Value, Uses, LastUsed; }

    private readonly int capacity;
    private int clock;
    private readonly List<Entry> entries = new();

    public LFUCacheScan(int capacity) => this.capacity = capacity;

    public int Get(int key)
    {
        Entry? entry = entries.Find(e => e.Key == key); // O(n)
        if (entry == null) return -1;
        entry.Uses++;
        entry.LastUsed = ++clock;
        return entry.Value;
    }

    public void Put(int key, int value)
    {
        if (capacity == 0) return;
        Entry? entry = entries.Find(e => e.Key == key);
        if (entry != null)
        {
            entry.Value = value;
            entry.Uses++;
            entry.LastUsed = ++clock;
            return;
        }
        if (entries.Count == capacity)
        {
            // Scan for the fewest uses; break ties by the oldest use.
            int victim = 0;
            for (int i = 1; i < entries.Count; i++)
            {
                Entry a = entries[i], b = entries[victim];
                if (a.Uses < b.Uses || (a.Uses == b.Uses && a.LastUsed < b.LastUsed)) victim = i;
            }
            entries.RemoveAt(victim);
        }
        entries.Add(new Entry { Key = key, Value = value, Uses = 1, LastUsed = ++clock });
    }
}
// #endregion

// #region buckets
class LFUCache
{
    private readonly int capacity;
    private readonly Dictionary<int, int> values = new(); // key -> value
    private readonly Dictionary<int, int> uses = new(); // key -> how many times it was used
    // use count -> keys with exactly that count, oldest first
    private readonly Dictionary<int, LinkedList<int>> buckets = new();
    private readonly Dictionary<int, LinkedListNode<int>> nodes = new(); // key -> its node in a bucket
    private int minUses; // the smallest use count present

    public LFUCache(int capacity) => this.capacity = capacity;

    private void AddToBucket(int key, int count)
    {
        if (!buckets.TryGetValue(count, out var bucket)) buckets[count] = bucket = new LinkedList<int>();
        nodes[key] = bucket.AddLast(key);
    }

    // Move a key from its bucket to the next one up.
    private void Touch(int key)
    {
        int count = uses[key];
        var bucket = buckets[count];
        bucket.Remove(nodes[key]);
        if (bucket.Count == 0)
        {
            buckets.Remove(count);
            if (minUses == count) minUses++; // the lowest bucket just emptied
        }
        uses[key] = count + 1;
        AddToBucket(key, count + 1);
    }

    public int Get(int key)
    {
        if (!values.ContainsKey(key)) return -1;
        Touch(key);
        return values[key];
    }

    public void Put(int key, int value)
    {
        if (capacity == 0) return;
        if (values.ContainsKey(key))
        {
            values[key] = value;
            Touch(key);
            return;
        }
        if (values.Count == capacity)
        {
            // Evict the oldest key of the least-used bucket.
            var bucket = buckets[minUses];
            int victim = bucket.First!.Value;
            bucket.RemoveFirst();
            if (bucket.Count == 0) buckets.Remove(minUses);
            values.Remove(victim);
            uses.Remove(victim);
            nodes.Remove(victim);
        }
        values[key] = value;
        uses[key] = 1;
        AddToBucket(key, 1);
        minUses = 1; // a brand-new key always has the fewest uses
    }
}
// #endregion
