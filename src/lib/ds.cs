// #region heap
// C# ships with a binary heap: PriorityQueue<TElement, TPriority> (.NET 6+).
// The element with the SMALLEST priority comes out first (a min-heap).

var minHeap = new PriorityQueue<int, int>();
minHeap.Enqueue(5, 5);              // element, priority      O(log n)
int smallest = minHeap.Peek();      // look at the top        O(1)
smallest = minHeap.Dequeue();       // remove the top         O(log n)
int size = minHeap.Count;

// Max-heap: reverse the comparison.
var maxHeap = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
maxHeap.Enqueue(5, 5);
// #endregion
