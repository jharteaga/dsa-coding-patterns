// #region scan
class LRUCacheScan
{
    private readonly int capacity;
    private readonly List<(int key, int value)> entries = new(); // least recently used first

    public LRUCacheScan(int capacity) => this.capacity = capacity;

    public int Get(int key)
    {
        int i = entries.FindIndex(e => e.key == key); // O(n) search
        if (i == -1) return -1;
        var entry = entries[i];
        entries.RemoveAt(i); // O(n) removal
        entries.Add(entry); // most recently used goes to the end
        return entry.value;
    }

    public void Put(int key, int value)
    {
        int i = entries.FindIndex(e => e.key == key);
        if (i != -1) entries.RemoveAt(i);
        else if (entries.Count == capacity) entries.RemoveAt(0); // evict the oldest: O(n)
        entries.Add((key, value));
    }
}
// #endregion

// #region dll
class LRUCache
{
    private readonly int capacity;
    // key -> its node in the list: O(1) lookup
    private readonly Dictionary<int, LinkedListNode<(int key, int value)>> map = new();
    // LinkedList<T> is .NET's doubly linked list. First = most recently used, Last = least.
    private readonly LinkedList<(int key, int value)> list = new();

    public LRUCache(int capacity) => this.capacity = capacity;

    public int Get(int key)
    {
        if (!map.TryGetValue(key, out var node)) return -1; // @miss
        list.Remove(node); // using it makes it the most recent (O(1): we hold the node) // @touch
        list.AddFirst(node);
        return node.Value.value;
    }

    public void Put(int key, int value)
    {
        if (map.TryGetValue(key, out var existing))
        {
            existing.Value = (key, value); // @update
            list.Remove(existing);
            list.AddFirst(existing);
            return;
        }
        if (map.Count == capacity)
        {
            var oldest = list.Last!; // least recently used // @evict
            list.RemoveLast();
            map.Remove(oldest.Value.key);
        }
        var node = new LinkedListNode<(int key, int value)>((key, value)); // @insert
        map[key] = node;
        list.AddFirst(node);
    }
}
// #endregion
