import { useState } from 'react';
import { show } from '../lib/equal';
import { fmtMs } from '../runner/run';
import { useRunner } from '../runner/useRunner';
import type { TestCell } from '../runner/worker';
import { useT } from '../state';
import type { Problem } from '../types';
import { KindBadge } from './Prose';

const runBtn = 'rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500';
const stopBtn = 'rounded-md border border-(--line) px-3 py-1.5 text-sm font-semibold hover:bg-(--page)';

// ---------------------------------------------------------------------------
export function TestPanel({ problem: p }: { problem: Problem }) {
  const { t, tx } = useT();
  const [rows, setRows] = useState<Record<number, Record<string, TestCell>>>({});
  const [error, setError] = useState('');
  const { start, stop, running } = useRunner((m) => {
    if (m.kind === 'test') setRows((r) => ({ ...r, [m.index]: m.cells }));
    if (m.kind === 'error') setError(m.message);
  });
  const done = Object.keys(rows).length;
  const failed = Object.values(rows).flatMap((r) => Object.values(r)).filter((c) => !c.pass).length;
  return (
    <div className="card p-3">
      <div className="flex flex-wrap items-center gap-3">
        <button className={runBtn} onClick={() => (setRows({}), setError(''), start({ kind: 'tests', problemId: p.id }))} disabled={running}>
          {running ? t.tests.running(done, p.cases.length) : t.tests.run(p.cases.length)}
        </button>
        {running && (
          <button className={stopBtn} onClick={stop}>
            {t.tests.stop}
          </button>
        )}
        {!running && done > 0 && (
          <span className={`text-sm font-semibold ${failed ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {failed ? t.tests.failed(failed) : t.tests.passed(done)}
          </span>
        )}
        {error && <span className="text-sm text-rose-600">{error}</span>}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-(--line) text-xs text-(--ink-2)">
              <th className="py-1.5 pr-3 font-medium">{t.tests.case}</th>
              <th className="py-1.5 pr-3 font-medium">{t.tests.input}</th>
              <th className="py-1.5 pr-3 font-medium">{t.tests.expected}</th>
              {p.approaches.map((a) => (
                <th key={a.id} className="py-1.5 pr-3 text-right font-medium whitespace-nowrap">
                  {tx(a.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.cases.map((c, i) => (
              <tr key={i} className="border-b border-(--line) last:border-0">
                <td className="py-1.5 pr-3">{tx(c.name)}</td>
                <td className="mono max-w-64 truncate py-1.5 pr-3 text-xs text-(--ink-2)" title={show(c.args, 2000)}>
                  {show(c.args, 44).slice(1, -1) || '—'}
                </td>
                <td className="mono max-w-40 truncate py-1.5 pr-3 text-xs" title={show(c.expected, 2000)}>
                  {show(c.expected, 30)}
                </td>
                {p.approaches.map((a) => {
                  const cell = rows[i]?.[a.id];
                  return (
                    <td key={a.id} className="mono py-1.5 pr-3 text-right text-xs whitespace-nowrap" title={cell ? cell.error || t.tests.returned(cell.got) : ''}>
                      {!cell ? (
                        <span className="text-(--ink-2)">·</span>
                      ) : cell.pass ? (
                        <>
                          <span className="text-emerald-600 dark:text-emerald-400">✓</span> {fmtMs(cell.ms)} ms
                        </>
                      ) : (
                        <span className="text-rose-600">✗ {cell.error ? t.tests.threw : t.tests.got(cell.got)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
type BenchRow = { n: number; ms: Record<string, number | null> };

function BenchChart({ p, rows }: { p: Problem; rows: BenchRow[] }) {
  const { t, tx, nf: fmtN } = useT();
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 280;
  const m = { l: 56, r: 120, t: 14, b: 36 };
  const all = rows.flatMap((r) => Object.values(r.ms).filter((v): v is number => v !== null && v > 0));
  if (rows.length < 2 || !all.length) return null;
  const y0 = Math.floor(Math.log10(Math.min(...all)));
  const y1 = Math.max(y0 + 1, Math.ceil(Math.log10(Math.max(...all))));
  const sizes = p.bench!.sizes;
  const lx0 = Math.log10(sizes[0]);
  const lx1 = Math.log10(sizes[sizes.length - 1]);
  const X = (n: number) => m.l + ((Math.log10(n) - lx0) / (lx1 - lx0 || 1)) * (W - m.l - m.r);
  const Y = (ms: number) => m.t + (1 - (Math.log10(ms) - y0) / (y1 - y0)) * (H - m.t - m.b);
  const series = p.approaches.map((a, k) => ({
    a,
    color: `var(--s${k + 1})`,
    pts: rows.filter((r) => r.ms[a.id] != null && r.ms[a.id]! > 0).map((r) => ({ n: r.n, ms: r.ms[a.id]! })),
  }));
  // end-of-line labels, nudged apart so they never overlap
  const ends = series
    .filter((s) => s.pts.length)
    .map((s) => ({ s, x: X(s.pts[s.pts.length - 1].n), y: Y(s.pts[s.pts.length - 1].ms) }))
    .sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) ends[k].y = Math.max(ends[k].y, ends[k - 1].y + 13);
  const hr = hover !== null ? rows[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-3xl" role="img" aria-label={t.bench.chartLabel}>
        {Array.from({ length: y1 - y0 + 1 }, (_, k) => y0 + k).map((e) => (
          <g key={e}>
            <line x1={m.l} x2={W - m.r} y1={Y(10 ** e)} y2={Y(10 ** e)} stroke="var(--line)" />
            <text x={m.l - 6} y={Y(10 ** e) + 4} textAnchor="end" fontSize="11" fill="var(--ink-2)">
              {10 ** e >= 1 ? fmtN(10 ** e) : (10 ** e).toFixed(-e)} ms
            </text>
          </g>
        ))}
        {sizes.map((n) => (
          <text key={n} x={X(n)} y={H - m.b + 16} textAnchor="middle" fontSize="11" fill="var(--ink-2)">
            {fmtN(n)}
          </text>
        ))}
        <text x={(m.l + W - m.r) / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="var(--ink-2)">
          {t.bench.axis(tx(p.bench!.nLabel))}
        </text>
        {hr && <line x1={X(hr.n)} x2={X(hr.n)} y1={m.t} y2={H - m.b} stroke="var(--ink-2)" strokeDasharray="3 3" />}
        {series.map(({ a, color, pts }) => (
          <g key={a.id}>
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={pts.map((q) => `${X(q.n)},${Y(q.ms)}`).join(' ')} />
            {pts.map((q) => (
              <circle key={q.n} cx={X(q.n)} cy={Y(q.ms)} r="4" fill={color} stroke="var(--surface)" strokeWidth="2" />
            ))}
          </g>
        ))}
        {ends.map(({ s, x, y }) => (
          <text key={s.a.id} x={x + 9} y={y + 4} fontSize="11" fill="var(--ink)">
            {tx(s.a.label).length > 19 ? tx(s.a.label).slice(0, 18) + '…' : tx(s.a.label)}
          </text>
        ))}
        {rows.map((r, k) => (
          <rect
            key={r.n}
            x={X(r.n) - 24}
            y={m.t}
            width={48}
            height={H - m.t - m.b}
            fill="transparent"
            onMouseEnter={() => setHover(k)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hr && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-md border border-(--line) bg-(--surface) px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: `${Math.min(62, (X(hr.n) / W) * 100 + 2)}%` }}
        >
          <div className="mb-1 font-semibold">n = {fmtN(hr.n)}</div>
          {series.map(({ a, color }) => (
            <div key={a.id} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
              {tx(a.label)}: <b className="mono">{hr.ms[a.id] == null ? t.bench.skipped : `${fmtMs(hr.ms[a.id]!)} ms`}</b>
            </div>
          ))}
        </div>
      )}
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {series.map(({ a, color }) => (
          <span key={a.id} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {tx(a.label)} <span className="mono text-(--ink-2)">{a.time}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function BenchPanel({ problem: p }: { problem: Problem }) {
  const { t, tx, nf: fmtN } = useT();
  const [rows, setRows] = useState<BenchRow[]>([]);
  const [error, setError] = useState('');
  const { start, stop, running } = useRunner((m) => {
    if (m.kind === 'bench') setRows((r) => [...r, { n: m.n, ms: m.ms }]);
    if (m.kind === 'error') setError(m.message);
  });
  if (!p.bench) return null;
  const fastest = (r: BenchRow) => Math.min(...Object.values(r.ms).filter((v): v is number => v != null));
  return (
    <div className="card p-3">
      <div className="flex flex-wrap items-center gap-3">
        <button className={runBtn} onClick={() => (setRows([]), setError(''), start({ kind: 'bench', problemId: p.id }))} disabled={running}>
          {running ? t.bench.measuring(rows.length, p.bench.sizes.length) : t.bench.run}
        </button>
        {running && (
          <button className={stopBtn} onClick={stop}>
            {t.tests.stop}
          </button>
        )}
        <span className="text-xs text-(--ink-2)">
          {t.bench.about}
        </span>
        {error && <span className="text-sm text-rose-600">{error}</span>}
      </div>
      {rows.length > 0 && (
        <div className={`mt-3 grid items-start gap-4 ${p.approaches.length <= 3 ? 'lg:grid-cols-2' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-(--line) text-xs text-(--ink-2)">
                  <th className="py-1.5 pr-3 font-medium">n</th>
                  {p.approaches.map((a) => (
                    <th key={a.id} className="py-1.5 pr-3 text-right font-medium">
                      <div className="whitespace-nowrap">{tx(a.label)}</div>
                      <div className="mono font-normal">{a.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.n} className="border-b border-(--line) last:border-0">
                    <td className="mono py-1.5 pr-3">{fmtN(r.n)}</td>
                    {p.approaches.map((a) => {
                      const v = r.ms[a.id];
                      return (
                        <td key={a.id} className="mono py-1.5 pr-3 text-right whitespace-nowrap">
                          {v == null ? (
                            <span className="text-(--ink-2)" title={t.bench.skippedTitle}>
                              {t.bench.tooSlow}
                            </span>
                          ) : (
                            <>
                              {fmtMs(v)} ms
                              <span className="ml-1.5 inline-block w-12 text-left text-[11px] text-(--ink-2)">
                                {v / fastest(r) >= 1.5 ? `${(v / fastest(r)).toFixed(v / fastest(r) >= 100 ? 0 : 1)}×` : ''}
                              </span>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-(--ink-2)">
              {t.bench.note(tx(p.bench.nLabel))}
            </p>
          </div>
          <BenchChart p={p} rows={rows} />
        </div>
      )}
    </div>
  );
}

export function ComplexityTable({ problem: p }: { problem: Problem }) {
  const { t, tx } = useT();
  return (
    <div className="card overflow-x-auto p-3">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-(--line) text-xs text-(--ink-2)">
            <th className="py-1.5 pr-3 font-medium">{t.complexity.approach}</th>
            <th className="py-1.5 pr-3 font-medium">{t.complexity.time}</th>
            <th className="py-1.5 pr-3 font-medium">{t.complexity.space}</th>
          </tr>
        </thead>
        <tbody>
          {p.approaches.map((a) => (
            <tr key={a.id} className="border-b border-(--line) last:border-0">
              <td className="py-1.5 pr-3">
                <KindBadge kind={a.kind} /> <span className="ml-1">{tx(a.label)}</span>
              </td>
              <td className="mono py-1.5 pr-3 font-semibold">{a.time}</td>
              <td className="mono py-1.5 pr-3 font-semibold">{a.space}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
