import { useMemo, useState } from 'react';
import { Player, type Panel } from '../player/Player';
import { useT } from '../state';
import type { Problem } from '../types';
import { RegionCode } from './Code';
import { BenchPanel, ComplexityTable, TestPanel } from './Panels';
import { KindBadge, P, Paras, Section } from './Prose';

const difficultyStyles: Record<Problem['difficulty'], string> = {
  Easy: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Medium: 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Hard: 'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300',
};

export function DifficultyPill({ difficulty, small }: { difficulty: Problem['difficulty']; small?: boolean }) {
  const { t } = useT();
  return (
    <span
      className={`rounded-full border font-semibold ${small ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-xs'} ${difficultyStyles[difficulty]}`}
    >
      {t.difficulty[difficulty]}
    </span>
  );
}

function Demo({ problem: p }: { problem: Problem }) {
  const { t, tx, tm } = useT();
  const demo = p.demo!;
  const traced = p.approaches.filter((a) => demo.traces[a.id]);
  const [draft, setDraft] = useState(() => demo.inputs.map((i) => i.value));
  const [applied, setApplied] = useState(draft);
  const [left, setLeft] = useState(traced[0].id);
  const [right, setRight] = useState(traced[traced.length - 1].id);

  const result = useMemo((): { panels: Panel[]; error?: string } => {
    try {
      if (applied.join('').length > 600) throw new Error(t.demo.tooLong);
      const args = applied.map((text, k) => {
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(t.demo.invalid(tm(demo.inputs[k].name), demo.inputs[k].value));
        }
      });
      const problem = demo.validate?.(...args);
      if (problem) throw new Error(tx(problem));
      const ids = [...new Set(traced.length > 1 ? [left, right] : [left])];
      return { panels: ids.map((id) => ({ approach: p.approaches.find((a) => a.id === id)!, frames: demo.traces[id](...structuredClone(args)) })) };
    } catch (e) {
      return { panels: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [applied, left, right, demo, p, traced.length, t]);

  const dirty = draft.some((d, k) => d !== applied[k]);
  const sel = 'rounded-md border border-(--line) bg-(--surface) px-2 py-1 text-sm';
  return (
    <div>
      <form
        className="mb-3 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(draft);
        }}
      >
        {demo.inputs.map((inp, k) => (
          <label key={inp.name} className="flex min-w-24 flex-1 flex-col text-xs font-medium text-(--ink-2)">
            {tm(inp.name)}
            <input
              className="mono mt-0.5 rounded-md border border-(--line) bg-(--surface) px-2 py-1 text-sm text-(--ink)"
              value={draft[k]}
              onChange={(e) => setDraft(draft.map((d, j) => (j === k ? e.target.value : d)))}
              spellCheck={false}
            />
          </label>
        ))}
        <button className={`rounded-md px-3 py-1.5 text-sm font-semibold ${dirty ? 'bg-indigo-600 text-white' : 'border border-(--line)'}`}>
          {t.demo.run}
        </button>
        <button
          type="button"
          className="rounded-md border border-(--line) px-3 py-1.5 text-sm"
          onClick={() => {
            const d = demo.inputs.map((i) => i.value);
            setDraft(d);
            setApplied(d);
          }}
        >
          {t.demo.reset}
        </button>
        {traced.length > 2 && (
          <span className="flex items-center gap-1 text-xs text-(--ink-2)">
            {t.demo.compare}
            <select className={sel} value={left} onChange={(e) => setLeft(e.target.value)}>
              {traced.map((a) => (
                <option key={a.id} value={a.id}>
                  {tx(a.label)}
                </option>
              ))}
            </select>
            {t.demo.vs}
            <select className={sel} value={right} onChange={(e) => setRight(e.target.value)}>
              {traced.map((a) => (
                <option key={a.id} value={a.id}>
                  {tx(a.label)}
                </option>
              ))}
            </select>
          </span>
        )}
      </form>
      {result.error ? (
        <div className="card border-rose-300! p-3 text-sm text-rose-700 dark:text-rose-300">{result.error}</div>
      ) : (
        <Player key={applied.join('|') + left + right} panels={result.panels} code={p.code} />
      )}
    </div>
  );
}

export function ProblemView({ problem: p }: { problem: Problem }) {
  const { t, tx } = useT();
  const firstFast = p.approaches.findIndex((a) => a.kind !== 'brute');
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold">{tx(p.title)}</h2>
        <DifficultyPill difficulty={p.difficulty} />
      </div>
      <Paras items={p.statement} className="mt-2" />
      {p.examples && (
        <div className="mt-3 space-y-2">
          {p.examples.map((ex, i) => (
            <div key={i} className="mono rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-[13px]">
              <div>
                <span className="text-(--ink-2)">{t.problem.input}</span>
                {ex.input}
              </div>
              <div>
                <span className="text-(--ink-2)">{t.problem.output}</span>
                <b>{ex.output}</b>
              </div>
              {ex.why && <div className="mt-1 font-sans text-(--ink-2)">{tx(ex.why)}</div>}
            </div>
          ))}
        </div>
      )}

      {p.demo && (
        <Section title={t.problem.watch} hint={t.problem.watchHint}>
          <Demo key={p.id} problem={p} />
        </Section>
      )}

      <Section title={t.problem.approaches}>
        <div className="space-y-4">
          {p.approaches.map((a, k) => (
            <div key={a.id}>
              {k === firstFast && (
                <div className="mb-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 dark:bg-amber-500/10">
                  <div className="text-xs font-bold tracking-wide text-amber-700 uppercase dark:text-amber-300">{t.problem.insight}</div>
                  <P className="mt-1">{p.insight}</P>
                </div>
              )}
              <div className="card p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <KindBadge kind={a.kind} />
                  <span className="font-semibold">{tx(a.label)}</span>
                  <span className="mono ml-auto text-xs">
                    {t.problem.time} <b>{a.time}</b> · {t.problem.space} <b>{a.space}</b>
                  </span>
                </div>
                <P className="mt-2 mb-3 text-sm">{a.note}</P>
                <RegionCode code={p.code} region={a.id} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t.problem.complexity}>
        <ComplexityTable problem={p} />
      </Section>

      <Section title={t.problem.tests} hint={t.problem.testsHint}>
        <TestPanel key={p.id} problem={p} />
      </Section>

      {p.bench && (
        <Section title={t.problem.bench} hint={t.problem.benchHint}>
          <BenchPanel key={p.id} problem={p} />
        </Section>
      )}
    </div>
  );
}
