// #region shift
class ShiftQueue
{
    private readonly int[] items;
    private int count;

    public ShiftQueue(int capacity) => items = new int[capacity];

    public bool Enqueue(int x)
    {
        if (count == items.Length) return false; // full
        items[count++] = x;
        return true;
    }

    public bool Dequeue()
    {
        if (count == 0) return false; // empty
        // The front is always index 0, so everyone else shuffles forward.
        // (This is what List.RemoveAt(0) does internally.)
        for (int i = 1; i < count; i++) items[i - 1] = items[i];
        count--;
        return true;
    }

    public int Front() => count == 0 ? -1 : items[0];
    public int Rear() => count == 0 ? -1 : items[count - 1];
}
// #endregion

// #region ring
class RingBuffer
{
    private readonly int[] slots;
    private int head; // index of the oldest item
    private int count; // how many items are stored

    public RingBuffer(int capacity) => slots = new int[capacity];

    public bool Enqueue(int x)
    {
        if (count == slots.Length) return false; // full // @full
        int tail = (head + count) % slots.Length; // wraps around
        slots[tail] = x; // @enqueue
        count++;
        return true;
    }

    public bool Dequeue()
    {
        if (count == 0) return false; // empty // @empty
        head = (head + 1) % slots.Length; // nothing moves: only the index // @dequeue
        count--;
        return true;
    }

    public int Front() => count == 0 ? -1 : slots[head];
    public int Rear() => count == 0 ? -1 : slots[(head + count - 1) % slots.Length];
}
// #endregion
