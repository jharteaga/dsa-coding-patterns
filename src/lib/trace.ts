import { isL } from '../i18n/text';
import type { Cell, Frame, L, Text, Tone, View } from '../types';
import type { ListNode, TreeNode } from './ds';

/** Collects animation frames. Traces are plain functions: input -> Frame[]. */
export class Tracer {
  frames: Frame[] = [];
  add(step: string | undefined, caption: L, ...views: (View | null | undefined | false)[]) {
    if (this.frames.length >= 4000) return;
    this.frames.push({ step, caption, views: views.filter(Boolean) as View[] });
  }
}

type ArrOpts = { label?: Text; pointers?: Record<string, number>; hl?: Record<number, Tone>; layout?: 'row' | 'bars' | 'stack' };
export const arr = (values: Cell[], opts: ArrOpts = {}): View => ({ kind: 'array', values: [...values], ...opts });

/** tone a list of indices / an inclusive index range */
export const mark = (tone: Tone, ...idx: number[]): Record<number, Tone> => Object.fromEntries(idx.map((i) => [i, tone]));
export const span = (tone: Tone, lo: number, hi: number): Record<number, Tone> => {
  const o: Record<number, Tone> = {};
  for (let i = lo; i <= hi; i++) o[i] = tone;
  return o;
};

export const vars = (items: Record<string, unknown>, label?: Text): View => ({
  kind: 'vars',
  label,
  items: Object.entries(items).map(([k, v]): [string, Text] => [k, typeof v === 'string' || isL(v) ? v : JSON.stringify(v)]),
});

export const grid = (
  cells: Cell[][],
  hl: Record<string, Tone> = {},
  opts: { label?: Text; rowLabels?: Cell[]; colLabels?: Cell[] } = {},
): View => ({ kind: 'grid', cells: cells.map((r) => [...r]), hl: { ...hl }, ...opts });

// ---- trees ------------------------------------------------------------------
const treeIds = new WeakMap<object, number>();
let nextTreeId = 1;
export const nodeId = (n: object) => {
  let id = treeIds.get(n);
  if (!id) treeIds.set(n, (id = nextTreeId++));
  return id;
};

export function tree(
  root: TreeNode | null,
  hl: Map<TreeNode, Tone> | [TreeNode | null, Tone][] = [],
  badges: Map<TreeNode, Text> | [TreeNode | null, Text][] = [],
  label?: Text,
): View {
  const nodes: { id: number; val: Cell; kids: (number | null)[] }[] = [];
  const walk = (n: TreeNode | null) => {
    if (!n) return;
    nodes.push({
      id: nodeId(n),
      val: n.val,
      kids: n.left || n.right ? [n.left ? nodeId(n.left) : null, n.right ? nodeId(n.right) : null] : [],
    });
    walk(n.left);
    walk(n.right);
  };
  walk(root);
  const toRec = <V,>(m: Map<TreeNode, V> | [TreeNode | null, V][]) => {
    const o: Record<number, V> = {};
    for (const [k, v] of m) if (k) o[nodeId(k)] = v;
    return o;
  };
  return { kind: 'tree', label, nodes, root: root ? nodeId(root) : null, hl: toRec(hl), badges: toRec(badges) };
}

// ---- linked lists -----------------------------------------------------------
/** Snapshot a linked list. `order` is the fixed left-to-right drawing order of the nodes. */
export function list(
  order: ListNode[],
  pointers: Record<string, ListNode | null> = {},
  hl: [ListNode | null, Tone][] = [],
  label?: Text,
): View {
  const next: Record<number, number | null> = {};
  for (const n of order) next[nodeId(n)] = n.next ? nodeId(n.next) : null;
  return {
    kind: 'list',
    label,
    nodes: order.map((n) => ({ id: nodeId(n), val: n.val })),
    next,
    pointers: Object.fromEntries(Object.entries(pointers).map(([k, n]) => [k, n ? nodeId(n) : null])),
    hl: Object.fromEntries(hl.filter(([n]) => n).map(([n, t]) => [nodeId(n!), t])),
  };
}

/** Combine the source bundles of several problem files (when one problem shows code from another). */
import type { CodeBundle } from '../types';
export const mergeCode = (...bundles: CodeBundle[]): CodeBundle => ({
  ts: Object.assign({}, ...bundles.map((b) => b.ts)),
  js: Object.assign({}, ...bundles.map((b) => b.js)),
  cs: Object.assign({}, ...bundles.map((b) => b.cs)),
});

/** Draw a binary heap (stored as an array) as the tree it represents. */
export function heapTree(items: Cell[], label: Text, hl: Record<number, Tone> = {}): View {
  return {
    kind: 'tree',
    label,
    root: items.length ? 0 : null,
    nodes: items.map((val, i) => ({ id: i, val, kids: [2 * i + 1, 2 * i + 2].filter((k) => k < items.length) })),
    hl,
  };
}
