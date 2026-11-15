// #region values
ListNode? ReverseBetweenValues(ListNode? head, int left, int right)
{
    var nodes = new List<ListNode>();
    for (ListNode? node = head; node != null; node = node.next) nodes.Add(node); // O(n) list
    // Swap values from both ends of the segment toward the middle.
    for (int i = left - 1, j = right - 1; i < j; i++, j--)
    {
        (nodes[i].val, nodes[j].val) = (nodes[j].val, nodes[i].val);
    }
    return head;
}
// #endregion

// #region inplace
ListNode? ReverseBetween(ListNode? head, int left, int right)
{
    var dummy = new ListNode(0); // a fake node before the head removes the "left = 1" special case
    dummy.next = head;

    // 1. Walk to the node just before the segment.
    ListNode before = dummy;
    for (int i = 1; i < left; i++) before = before.next!;

    // 2. Reverse the segment with the standard prev / cur / next loop.
    ListNode? segmentTail = before.next; // first node of the segment becomes its tail
    ListNode? prev = null;
    ListNode? cur = before.next;
    for (int i = left; i <= right; i++)
    {
        ListNode? next = cur!.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }

    // 3. Stitch it back in: before -> (reversed segment) -> rest.
    before.next = prev;
    if (segmentTail != null) segmentTail.next = cur;
    return dummy.next;
}
// #endregion
