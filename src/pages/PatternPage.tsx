import { Link, useParams } from 'react-router-dom';
import { RegionCode } from '../components/Code';
import { DifficultyPill, ProblemView } from '../components/ProblemView';
import { inline, Paras } from '../components/Prose';
import { patterns, patternsById } from '../content/registry';
import { useT } from '../state';

export default function PatternPage() {
  const { t, tx } = useT();
  const { patternId = '', problemId } = useParams();
  const pattern = patternsById[patternId];
  if (!pattern) return <p>{t.pattern.notFound}</p>;
  const problem = pattern.problems.find((p) => p.id === problemId) ?? pattern.problems[0];
  const idx = patterns.indexOf(pattern);
  const prev = patterns[idx - 1];
  const next = patterns[idx + 1];
  return (
    <article className="max-w-[1150px]">
      <div className="text-xs font-extrabold tracking-wider text-amber-700 uppercase dark:text-amber-400">{t.groups[pattern.group as keyof typeof t.groups]}</div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{tx(pattern.title)}</h1>
      <p className="mt-1 text-lg text-(--ink-2)">{inline(tx(pattern.tagline))}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <div className="card p-4 lg:col-span-2">
          <h2 className="minor-h text-sm font-bold tracking-wide uppercase">{t.pattern.spot}</h2>
          <p className="mt-1 text-xs text-(--ink-2)">{t.pattern.spotHint}</p>
          <ul className="prose-p mt-2 space-y-1.5 text-sm">
            {pattern.cues.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-indigo-500">▸</span>
                <span>{inline(tx(c))}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4 lg:col-span-3">
          <h2 className="minor-h text-sm font-bold tracking-wide uppercase">{t.pattern.model}</h2>
          <Paras items={pattern.model} className="mt-2 text-[15px]" />
        </div>
      </div>

      {pattern.template && (
        <div className="mt-4">
          <h2 className="minor-h text-sm font-bold tracking-wide uppercase">{t.pattern.template}</h2>
          <pre className="card mono mt-2 overflow-x-auto p-3 text-[12.5px] leading-relaxed">{pattern.template}</pre>
        </div>
      )}
      {pattern.helper && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-indigo-600 dark:text-indigo-400">{tx(pattern.helper.title)}</summary>
          <div className="mt-2">
            <RegionCode code={pattern.helper.code} region={pattern.helper.region} />
          </div>
        </details>
      )}

      {pattern.related && (
        <p className="mt-3 text-sm text-(--ink-2)">
          {t.pattern.related}{' '}
          {pattern.related.filter((id) => patternsById[id]).map((id, k) => (
            <span key={id}>
              {k > 0 && ' · '}
              <Link to={`/pattern/${id}`} className="font-semibold text-indigo-600 underline dark:text-indigo-400">
                {tx(patternsById[id].title)}
              </Link>
            </span>
          ))}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2 border-b border-(--line)">
        {pattern.problems.map((p, k) => (
          <Link
            key={p.id}
            to={`/pattern/${pattern.id}/${p.id}`}
            replace
            className={`-mb-px inline-flex items-center gap-2 rounded-t-lg border border-b-0 px-3 py-2 text-sm font-semibold ${
              p === problem ? 'border-(--line) bg-(--surface) text-indigo-600 dark:text-indigo-400' : 'border-transparent text-(--ink-2) hover:text-(--ink)'
            }`}
          >
            {k + 1}. {tx(p.title)}
            <DifficultyPill difficulty={p.difficulty} small />
          </Link>
        ))}
      </div>
      <div className="pt-5">
        <ProblemView key={problem.id} problem={problem} />
      </div>

      <div className="mt-12 flex justify-between gap-3 text-sm">
        {prev ? (
          <Link to={`/pattern/${prev.id}`} className="card px-3 py-2 hover:border-indigo-500">
            ← {tx(prev.title)}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/pattern/${next.id}`} className="card px-3 py-2 hover:border-indigo-500">
            {tx(next.title)} →
          </Link>
        )}
      </div>
    </article>
  );
}
