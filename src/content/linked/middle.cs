// #region count
ListNode? MiddleCount(ListNode? head)
{
    // Pass 1: how long is the list?
    int length = 0;
    for (ListNode? n = head; n != null; n = n.next) length++;
    // Pass 2: walk to the middle.
    ListNode? node = head;
    for (int i = 0; i < length / 2; i++) node = node!.next;
    return node;
}
// #endregion

// #region fastslow
ListNode? Middle(ListNode? head)
{
    ListNode? slow = head;
    ListNode? fast = head;
    // When fast has covered the whole list, slow has covered half of it.
    while (fast != null && fast.next != null)
    {
        slow = slow!.next;
        fast = fast.next.next;
    }
    return slow;
}
// #endregion
