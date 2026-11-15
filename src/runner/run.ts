import type { Approach, Problem } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Args = any[];

/** Fresh copy of the JSON args, converted to what the functions really take. */
export function prepare(p: Problem, args: Args): Args {
  const copy = structuredClone(args);
  return p.adapt?.in ? p.adapt.in(copy) : copy;
}

export function runOnce(p: Problem, ap: Approach, args: Args) {
  const real = prepare(p, args);
  const result = ap.fn(...real);
  return p.adapt?.out ? p.adapt.out(result, real) : result;
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[s.length >> 1];
};

/**
 * Milliseconds for one call of `ap.fn` on `args`.
 * Browsers round performance.now(), so a single fast call reads as 0 ms.
 * We therefore time a batch of calls that lasts ~`budget` ms, divide by the
 * batch size, repeat, and report the median.
 */
export function timeIt(p: Problem, ap: Approach, args: Args, budget = 30, reps = 5): number {
  let real = prepare(p, args);
  let t0 = performance.now();
  ap.fn(...real);
  const first = performance.now() - t0;
  if (first > 250) return first;

  const k = Math.max(1, Math.min(p.mutates ? 300 : 1_000_000, Math.ceil(budget / Math.max(first, 0.0005))));
  const samples: number[] = [];
  for (let r = 0; r < reps; r++) {
    if (p.mutates) {
      const copies = Array.from({ length: k }, () => prepare(p, args));
      t0 = performance.now();
      for (let i = 0; i < k; i++) ap.fn(...copies[i]);
    } else {
      real = prepare(p, args);
      t0 = performance.now();
      for (let i = 0; i < k; i++) ap.fn(...real);
    }
    samples.push((performance.now() - t0) / k);
  }
  return median(samples);
}

export const fmtMs = (ms: number) =>
  ms >= 100 ? ms.toFixed(0) : ms >= 1 ? ms.toFixed(2) : ms >= 0.01 ? ms.toFixed(3) : ms.toFixed(5);
