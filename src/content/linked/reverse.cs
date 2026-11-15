// #region values
ListNode? ReverseListValues(ListNode? head)
{
    // Copy all values out...
    var values = new Stack<int>();
    for (ListNode? node = head; node != null; node = node.next) values.Push(node.val);
    // ...then write them back in reverse order.
    for (ListNode? node = head; node != null; node = node.next) node.val = values.Pop();
    return head;
}
// #endregion

// #region inplace
ListNode? ReverseList(ListNode? head)
{
    ListNode? prev = null;
    ListNode? cur = head; // @init
    while (cur != null)
    {
        ListNode? next = cur.next; // 1. remember the rest of the list // @save
        cur.next = prev; // 2. turn this node's arrow around // @flip
        prev = cur; // 3. step forward
        cur = next; // @step
    }
    return prev; // the old tail is the new head // @done
}
// #endregion
