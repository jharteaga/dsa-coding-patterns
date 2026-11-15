import { useEffect, useState } from 'react';
import { RegionCode } from '../components/Code';
import { inline, KindBadge } from '../components/Prose';
import { useT } from '../state';
import type { Approach, CodeBundle, Frame } from '../types';
import { TONE_LEGEND, ViewRenderer } from '../viz/Views';

export type Panel = { approach: Approach; frames: Frame[] };

const SPEEDS = [
  { label: '0.5×', ms: 1400 },
  { label: '1×', ms: 800 },
  { label: '2×', ms: 400 },
  { label: '4×', ms: 180 },
];

/** Plays one or two traces in lock-step: same controls, one step counter. */
export function Player({ panels, code }: { panels: Panel[]; code: CodeBundle }) {
  const { t, tx } = useT();
  const total = Math.max(1, ...panels.map((p) => p.frames.length));
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const at = Math.min(i, total - 1);

  useEffect(() => {
    if (!playing) return;
    if (at >= total - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI(at + 1), SPEEDS[speed].ms);
    return () => clearTimeout(t);
  }, [playing, at, total, speed]);

  const go = (n: number) => {
    setPlaying(false);
    setI(Math.max(0, Math.min(total - 1, n)));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(at + 1);
    else if (e.key === 'ArrowLeft') go(at - 1);
    else if (e.key === ' ') setPlaying((p) => (at >= total - 1 ? (setI(0), true) : !p));
    else return;
    e.preventDefault();
  };
  const btn = 'rounded-md border border-(--line) bg-(--surface) px-2.5 py-1 text-sm font-medium hover:bg-(--page) disabled:opacity-40';

  return (
    <div className="card p-3 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" tabIndex={0} onKeyDown={onKey}>
      <div className="flex flex-wrap items-center gap-2">
        <button className={btn} onClick={() => go(0)} disabled={at === 0} title={t.player.restart}>
          ⏮
        </button>
        <button className={btn} onClick={() => go(at - 1)} disabled={at === 0} title={t.player.backTitle}>
          {t.player.back}
        </button>
        <button
          className="rounded-md bg-indigo-600 px-4 py-1 text-sm font-semibold text-white hover:bg-indigo-500"
          onClick={() => (at >= total - 1 ? (setI(0), setPlaying(true)) : setPlaying(!playing))}
          title={t.player.playTitle}
        >
          {playing ? t.player.pause : at >= total - 1 ? t.player.replay : t.player.play}
        </button>
        <button className={btn} onClick={() => go(at + 1)} disabled={at >= total - 1} title={t.player.stepTitle}>
          {t.player.step}
        </button>
        <input
          type="range"
          min={0}
          max={total - 1}
          value={at}
          onChange={(e) => go(+e.target.value)}
          className="min-w-24 flex-1 accent-indigo-600"
          aria-label={t.player.stepLabel}
        />
        <span className="mono text-xs text-(--ink-2)">
          {t.player.counter(at + 1, total)}
        </span>
        <select value={speed} onChange={(e) => setSpeed(+e.target.value)} className={btn} aria-label={t.player.speed}>
          {SPEEDS.map((s, k) => (
            <option key={k} value={k}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className={`mt-3 grid gap-3 ${panels.length > 1 ? 'xl:grid-cols-2' : ''}`}>
        {panels.map(({ approach, frames }) => {
          const done = at >= frames.length - 1;
          const f = frames[Math.min(at, frames.length - 1)];
          return (
            <div key={approach.id} className="min-w-0 rounded-lg border border-(--line) p-3">
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={approach.kind} />
                <span className="text-sm font-semibold">{tx(approach.label)}</span>
                <span className="mono ml-auto text-xs text-(--ink-2)">
                  {done ? t.player.finished(frames.length) : t.player.frames(frames.length)}
                </span>
              </div>
              {f && (
                <>
                  <div className="mt-3 space-y-3">
                    {f.views.map((v, k) => (
                      <ViewRenderer key={k} view={v} />
                    ))}
                  </div>
                  <p className="prose-p mt-3 min-h-12 rounded-md bg-indigo-50 px-3 py-2 text-sm leading-snug dark:bg-indigo-500/15">{inline(tx(f.caption))}</p>
                  <div className="mt-3">
                    <RegionCode code={code} region={approach.id} step={f.step} title={t.player.codeTitle} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-(--ink-2)">
        {TONE_LEGEND.map((tone) => (
          <span key={tone} className="flex items-center gap-1">
            <span className={`box inline-block h-3 w-3 rounded-sm tone-${tone}`} /> {t.legend[tone]}
          </span>
        ))}
        <span className="ml-auto">{t.player.keys}</span>
      </div>
    </div>
  );
}
