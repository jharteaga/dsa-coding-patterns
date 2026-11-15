// #region naive
class QueueNaive
{
    private readonly Stack<int> main = new();
    private readonly Stack<int> temp = new();

    public void Enqueue(int x) => main.Push(x);

    public int Dequeue()
    {
        // The oldest item is at the bottom. Dig it out, then put everything back.
        while (main.Count > 1) temp.Push(main.Pop());
        int front = main.Pop();
        while (temp.Count > 0) main.Push(temp.Pop());
        return front;
    }

    public int Size() => main.Count;
}
// #endregion

// #region lazy
class QueueTwoStacks
{
    private readonly Stack<int> inbox = new(); // new items are pushed here
    private readonly Stack<int> outbox = new(); // items leave from here, oldest on top

    public void Enqueue(int x)
    {
        inbox.Push(x); // @enqueue
    }

    public int Dequeue()
    {
        if (outbox.Count == 0)
        {
            // Pour the inbox into the outbox. Pouring reverses the order,
            // so the oldest item ends up on top.
            while (inbox.Count > 0) outbox.Push(inbox.Pop()); // @pour
        }
        return outbox.Pop(); // @dequeue
    }

    public int Size() => inbox.Count + outbox.Count;
}
// #endregion
