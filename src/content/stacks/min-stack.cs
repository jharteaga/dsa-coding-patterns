// #region scan
class MinStackScan
{
    private readonly List<int> items = new();

    public void Push(int x) => items.Add(x);
    public void Pop() => items.RemoveAt(items.Count - 1);
    public int Top() => items[^1];

    public int GetMin()
    {
        // Looks at every element, every time.
        int min = items[0];
        foreach (int x in items) if (x < min) min = x;
        return min;
    }
}
// #endregion

// #region mins
class MinStack
{
    private readonly Stack<int> items = new();
    private readonly Stack<int> mins = new(); // top = smallest value currently in `items`

    public void Push(int x)
    {
        items.Push(x);
        int currentMin = mins.Count == 0 ? x : Math.Min(x, mins.Peek());
        mins.Push(currentMin);
    }

    public void Pop()
    {
        items.Pop();
        mins.Pop(); // the minimum "rewinds" automatically
    }

    public int Top() => items.Peek();
    public int GetMin() => mins.Peek();
}
// #endregion
