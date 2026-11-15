// Shared data structures used by the solutions, the tests and the animations.

export class TreeNode {
  val: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(val: number) {
    this.val = val;
  }
}

/** Build a binary tree from a LeetCode-style level-order array, e.g. [3,9,20,null,null,15,7]. */
export function buildTree(levels: (number | null)[]): TreeNode | null {
  if (!levels.length || levels[0] == null) return null;
  const root = new TreeNode(levels[0]);
  const queue: TreeNode[] = [root];
  let i = 1;
  let head = 0;
  while (head < queue.length && i < levels.length) {
    const node = queue[head++];
    const l = levels[i++];
    if (l != null) queue.push((node.left = new TreeNode(l)));
    if (i < levels.length) {
      const r = levels[i++];
      if (r != null) queue.push((node.right = new TreeNode(r)));
    }
  }
  return root;
}

export class ListNode {
  val: number;
  next: ListNode | null = null;
  constructor(val: number) {
    this.val = val;
  }
}

/** Build a singly linked list. `cyclePos >= 0` links the tail back to that index. */
export function buildList(vals: number[], cyclePos = -1): ListNode | null {
  const nodes = vals.map((v) => new ListNode(v));
  nodes.forEach((n, i) => (n.next = nodes[i + 1] ?? null));
  if (cyclePos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[cyclePos];
  return nodes[0] ?? null;
}

export function listToArray(head: ListNode | null): number[] {
  const out: number[] = [];
  for (let n = head; n && out.length < 1e6; n = n.next) out.push(n.val);
  return out;
}

// #region heap
/**
 * Binary heap. JavaScript has no built-in priority queue, so interview
 * solutions carry a small one like this. `higher(a, b)` returns true when
 * `a` must come out before `b`:
 *   new Heap<number>((a, b) => a < b)   // min-heap: smallest on top
 *   new Heap<number>((a, b) => a > b)   // max-heap: largest on top
 */
export class Heap<T> {
  items: T[] = [];
  higher: (a: T, b: T) => boolean;

  constructor(higher: (a: T, b: T) => boolean) {
    this.higher = higher;
  }

  get size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  // O(log n): add at the bottom, then swap upward while it beats its parent.
  push(value: T): void {
    const a = this.items;
    a.push(value);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.higher(a[i], a[parent])) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }

  // O(log n): move the last item to the top, then swap downward.
  pop(): T | undefined {
    const a = this.items;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop() as T;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = l + 1;
        let best = i;
        if (l < a.length && this.higher(a[l], a[best])) best = l;
        if (r < a.length && this.higher(a[r], a[best])) best = r;
        if (best === i) break;
        [a[i], a[best]] = [a[best], a[i]];
        i = best;
      }
    }
    return top;
  }
}
// #endregion

// ---- random input helpers for benchmarks -------------------------------------
export const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
export const randArray = (n: number, lo = -1000, hi = 1000) => Array.from({ length: n }, () => randInt(lo, hi));
export const sortedArray = (n: number, lo = -1000, hi = 1000) => randArray(n, lo, hi).sort((a, b) => a - b);
/** n distinct ascending integers */
export const distinctSorted = (n: number) => {
  let v = randInt(-50, 50);
  return Array.from({ length: n }, () => (v += randInt(1, 5)));
};
export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** level-order array of a random binary tree with n nodes (values lo..hi) */
export function randTreeLevels(n: number, lo = -100, hi = 100): (number | null)[] {
  if (n <= 0) return [];
  const root = new TreeNode(randInt(lo, hi));
  for (let i = 1; i < n; i++) {
    let cur = root;
    while (true) {
      const side = Math.random() < 0.5 ? 'left' : 'right';
      const next: TreeNode | null = cur[side];
      if (!next) {
        cur[side] = new TreeNode(randInt(lo, hi));
        break;
      }
      cur = next;
    }
  }
  return treeToLevels(root);
}
/** level-order array of a balanced BST holding the given ascending values */
export function bstLevels(sorted: number[]): (number | null)[] {
  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) return null;
    const mid = (lo + hi) >> 1;
    const n = new TreeNode(sorted[mid]);
    n.left = build(lo, mid - 1);
    n.right = build(mid + 1, hi);
    return n;
  };
  return treeToLevels(build(0, sorted.length - 1));
}
export function treeToLevels(root: TreeNode | null): (number | null)[] {
  const out: (number | null)[] = [];
  const q: (TreeNode | null)[] = [root];
  for (let h = 0; h < q.length; h++) {
    const n = q[h];
    out.push(n ? n.val : null);
    if (n) q.push(n.left, n.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

/** Run a list of method calls against an object (for "design a data structure" problems). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function drive(obj: any, ops: string[], vals: any[][]): unknown[] {
  return ops.map((op, i) => obj[op](...(vals[i] ?? [])) ?? null);
}
