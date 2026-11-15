/// <reference lib="webworker" />
import { problemsById } from '../content/registry';
import { same, show } from '../lib/equal';
import { runOnce, timeIt } from './run';

export type Req = { kind: 'tests' | 'bench'; problemId: string };
export type TestCell = { pass: boolean; ms: number; got: string; error?: string };
export type Msg =
  | { kind: 'test'; index: number; cells: Record<string, TestCell> }
  | { kind: 'bench'; n: number; ms: Record<string, number | null> }
  | { kind: 'done' }
  | { kind: 'error'; message: string };

const post = (m: Msg) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(m);

self.onmessage = (e: MessageEvent<Req>) => {
  const p = problemsById[e.data.problemId];
  try {
    if (e.data.kind === 'tests') {
      p.cases.forEach((c, index) => {
        const cells: Record<string, TestCell> = {};
        for (const ap of p.approaches) {
          try {
            const got = runOnce(p, ap, c.args);
            cells[ap.id] = { pass: same(got, c.expected), got: show(got), ms: timeIt(p, ap, c.args, 4, 3) };
          } catch (err) {
            cells[ap.id] = { pass: false, got: '', ms: 0, error: String(err) };
          }
        }
        post({ kind: 'test', index, cells });
      });
    } else if (p.bench) {
      const tooSlow = new Set<string>();
      for (const n of p.bench.sizes) {
        const args = p.bench.gen(n);
        const ms: Record<string, number | null> = {};
        for (const ap of p.approaches) {
          if (tooSlow.has(ap.id) || (ap.benchMax !== undefined && n > ap.benchMax)) {
            ms[ap.id] = null;
            continue;
          }
          ms[ap.id] = timeIt(p, ap, args);
          // The next size is usually 10x larger; don't start a run that would take many seconds.
          if (ms[ap.id]! > 400) tooSlow.add(ap.id);
        }
        post({ kind: 'bench', n, ms });
      }
    }
    post({ kind: 'done' });
  } catch (err) {
    post({ kind: 'error', message: String(err) });
  }
};
