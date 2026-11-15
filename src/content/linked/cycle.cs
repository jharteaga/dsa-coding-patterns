// #region set
bool HasCycleSet(ListNode? head)
{
    var seen = new HashSet<ListNode>(); // remembers every node visited
    for (ListNode? node = head; node != null; node = node.next)
    {
        if (!seen.Add(node)) return true; // been here before: we are going in circles
    }
    return false; // reached the end
}
// #endregion

// #region floyd
bool HasCycle(ListNode? head)
{
    ListNode? slow = head;
    ListNode? fast = head; // @init
    while (fast != null && fast.next != null)
    {
        slow = slow!.next; // 1 step // @move
        fast = fast.next.next; // 2 steps
        if (slow == fast) return true; // fast caught up from behind // @meet
    }
    return false; // fast fell off the end: no cycle // @end
}
// #endregion
