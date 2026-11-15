import type { L, Text } from './i18n/text';
export type { L, Text } from './i18n/text';

export type Lang = 'js' | 'ts' | 'cs';
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'js', label: 'JavaScript' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'cs', label: 'C#' },
];

export type CodeBlock = { code: string; steps: Record<string, number[]> };
export type CodeBundle = Record<Lang, Record<string, CodeBlock>>;

// ---- Animation frames -------------------------------------------------------
export type Tone = 'active' | 'compare' | 'good' | 'bad' | 'done' | 'muted' | 'window' | 'alt';

export type Cell = number | string | null;

export type View =
  | {
      kind: 'array';
      label?: Text;
      values: Cell[];
      /** pointer name -> index (index === values.length is allowed: "one past the end") */
      pointers?: Record<string, number>;
      hl?: Record<number, Tone>;
      layout?: 'row' | 'bars' | 'stack';
    }
  | {
      kind: 'tree';
      label?: Text;
      nodes: { id: number; val: Cell; kids: (number | null)[] }[];
      root: number | null;
      hl?: Record<number, Tone>;
      badges?: Record<number, Text>;
    }
  | { kind: 'grid'; label?: Text; cells: Cell[][]; hl?: Record<string, Tone>; rowLabels?: Cell[]; colLabels?: Cell[] }
  | {
      kind: 'list';
      label?: Text;
      nodes: { id: number; val: Cell }[];
      next: Record<number, number | null>;
      pointers?: Record<string, number | null>;
      hl?: Record<number, Tone>;
    }
  | {
      kind: 'graph';
      label?: Text;
      nodes: Cell[];
      edges: [number, number][];
      directed?: boolean;
      hl?: Record<number, Tone>;
      edgeHl?: Record<string, Tone>;
      badges?: Record<number, Text>;
    }
  | { kind: 'ring'; label?: Text; slots: Cell[]; head: number; tail: number; count: number }
  | { kind: 'vars'; label?: Text; items: [string, Text][] };

export interface Frame {
  /** name of the `// @step` marker in the source that this frame corresponds to */
  step?: string;
  caption: L;
  views: View[];
}

// ---- Content ----------------------------------------------------------------
export interface Approach {
  /** also the name of the `#region` holding its source */
  id: string;
  label: L;
  kind: 'brute' | 'better' | 'optimal';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => any;
  time: string;
  space: string;
  /** plain-language explanation of how it works and why it costs what it costs */
  note: L;
  /** largest benchmark size this approach is allowed to run at (for exponential brute forces) */
  benchMax?: number;
}

export interface Case {
  name: L;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expected: any;
}

export interface Problem {
  id: string;
  title: L;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: L[];
  examples?: { input: string; output: string; why?: L }[];
  /** the one observation that removes the wasted work */
  insight: L;
  approaches: Approach[];
  code: CodeBundle;
  cases: Case[];
  /** convert plain JSON args into what the functions take (e.g. array -> tree) and results back */
  adapt?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    in?: (args: any[]) => any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    out?: (result: any, args: any[]) => any;
  };
  /** true when the functions modify their input (benchmark then uses a fresh copy per call) */
  mutates?: boolean;
  bench?: {
    sizes: number[];
    /** what "n" means, e.g. "array length" */
    nLabel: L;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gen: (n: number) => any[];
  };
  demo?: {
    inputs: { name: string; value: string }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    traces: Record<string, (...args: any[]) => Frame[]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate?: (...args: any[]) => L | null;
  };
}

export interface Pattern {
  id: string;
  group: string;
  /** position inside its group */
  order?: number;
  title: L;
  tagline: L;
  /** phrases in a problem statement that point to this pattern */
  cues: L[];
  /** the mental model, one idea per paragraph */
  model: L[];
  /** language-neutral skeleton */
  template?: string;
  /** optional helper source shown under the template (e.g. a heap class) */
  helper?: { title: L; code: CodeBundle; region: string };
  problems: Problem[];
  quiz: { q: L; why: L }[];
  related?: string[];
}

export const GROUPS = [
  'Trees',
  'Search',
  'Sorting',
  'Arrays',
  'Matrix',
  'Strings',
  'Stacks',
  'Queues',
  'Linked lists',
  'Heaps',
  'Graphs',
  'Data structure design',
  'Other',
] as const;
