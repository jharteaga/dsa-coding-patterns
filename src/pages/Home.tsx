import { useState } from 'react';
import { Link } from 'react-router-dom';
import { inline } from '../components/Prose';
import { byGroup, patterns } from '../content/registry';
import { useT } from '../state';

export default function Home() {
  const { t, tx } = useT();
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  // search matches both languages, so English terms still work in Spanish
  const match = (text: Parameters<typeof tx>[0]) =>
    typeof text === 'string' || !text ? (text ?? '').toLowerCase().includes(needle) : [text.en, text.es].some((s) => s.toLowerCase().includes(needle));
  const problems = patterns.reduce((n, p) => n + p.problems.length, 0);
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">{t.home.h1}</h1>
      <p className="mt-2 max-w-3xl leading-relaxed text-(--ink-2)">
        {inline(t.home.intro(patterns.length, problems))}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link to="/big-o" className="rounded-lg border border-(--line) bg-(--surface) px-3 py-1.5 font-medium hover:border-indigo-500">
          {t.home.bigO}
        </Link>
        <Link to="/quiz" className="rounded-lg border border-(--line) bg-(--surface) px-3 py-1.5 font-medium hover:border-indigo-500">
          {t.home.quiz}
        </Link>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.home.search}
        className="mt-5 w-full max-w-xl rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm"
      />
      {byGroup.map(([group, list]) => {
        const shown = list.filter(
          (p) => !needle || match(p.title) || match(p.tagline) || match(group) || match(t.groups[group as keyof typeof t.groups]) || p.cues.some(match) || p.problems.some((x) => match(x.title)),
        );
        if (!shown.length) return null;
        return (
          <section key={group} className="mt-7">
            <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-wider text-amber-700 uppercase dark:text-amber-400">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
              {t.groups[group as keyof typeof t.groups]}
              <span className="font-medium tracking-normal text-(--ink-2) normal-case">· {t.home.count(shown.length)}</span>
            </h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((p) => (
                <Link key={p.id} to={`/pattern/${p.id}`} className="card block p-4 transition hover:border-indigo-500 hover:shadow-sm">
                  <div className="font-bold">{tx(p.title)}</div>
                  <div className="mt-1 text-sm leading-snug text-(--ink-2)">{inline(tx(p.tagline))}</div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.problems.map((x) => (
                      <span key={x.id} className="rounded-full bg-(--page) px-2 py-0.5 text-[11px] text-(--ink-2)">
                        {tx(x.title)}
                        {x.demo ? ' ▶' : ''}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
