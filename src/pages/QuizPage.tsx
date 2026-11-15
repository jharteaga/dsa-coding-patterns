import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { byGroup, patterns } from '../content/registry';
import { inline } from '../components/Prose';
import { shuffle } from '../lib/ds';
import { useT } from '../state';
import type { Text } from '../types';

type Question = { q: Text; why: Text; answer: string; choices: string[] };

function buildQuiz(group: string): Question[] {
  const pool = patterns.filter((p) => group === 'All' || p.group === group);
  const questions = pool.flatMap((p) => p.quiz.map((item) => ({ ...item, answer: p.id })));
  return shuffle(questions).map((item) => {
    const others = shuffle(patterns.filter((p) => p.id !== item.answer)).slice(0, 3).map((p) => p.id);
    return { ...item, choices: shuffle([item.answer, ...others]) };
  });
}
const titleOf = (id: string) => patterns.find((p) => p.id === id)!.title;

export default function QuizPage() {
  const { t, tx } = useT();
  const title = (id: string) => tx(titleOf(id));
  const [group, setGroup] = useState('All');
  const [round, setRound] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => buildQuiz(group), [group, round]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const restart = (g = group) => {
    setGroup(g);
    setRound((r) => r + 1);
    setI(0);
    setPicked(null);
    setScore(0);
  };
  const q = questions[i];
  const finished = i >= questions.length;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">{t.quiz.h1}</h1>
      <p className="mt-2 leading-relaxed text-(--ink-2)">
        {inline(t.quiz.intro)}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {['All', ...byGroup.map(([g]) => g)].map((g) => (
          <button
            key={g}
            onClick={() => restart(g)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${g === group ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-(--line) bg-(--surface) text-(--ink-2) hover:border-indigo-500'}`}
          >
            {g === 'All' ? t.quiz.all : t.groups[g as keyof typeof t.groups]}
          </button>
        ))}
      </div>

      {finished ? (
        <div className="card mt-6 p-6 text-center">
          <div className="text-4xl font-extrabold">
            {score} / {questions.length}
          </div>
          <p className="mt-2 text-(--ink-2)">
            {score === questions.length ? t.quiz.perfect : score / questions.length >= 0.7 ? t.quiz.solid : t.quiz.keepGoing}
          </p>
          <button onClick={() => restart()} className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            {t.quiz.newRound}
          </button>
        </div>
      ) : (
        <div className="card mt-6 p-5">
          <div className="flex justify-between text-xs font-semibold text-(--ink-2)">
            <span>{t.quiz.question(i + 1, questions.length)}</span>
            <span>{t.quiz.score(score)}</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded bg-(--page)">
            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(i / questions.length) * 100}%` }} />
          </div>
          <p className="mt-4 text-lg leading-snug font-medium">{inline(tx(q.q))}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {q.choices.map((c) => {
              const state = picked === null ? 'idle' : c === q.answer ? 'right' : c === picked ? 'wrong' : 'dim';
              return (
                <button
                  key={c}
                  disabled={picked !== null}
                  onClick={() => {
                    setPicked(c);
                    if (c === q.answer) setScore((s) => s + 1);
                  }}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition ${
                    state === 'idle'
                      ? 'border-(--line) hover:border-indigo-500 hover:bg-(--page)'
                      : state === 'right'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15'
                        : state === 'wrong'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15'
                          : 'border-(--line) opacity-50'
                  }`}
                >
                  {state === 'right' && '✓ '}
                  {state === 'wrong' && '✗ '}
                  {title(c)}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="mt-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm dark:bg-amber-500/10">
              <div className="font-bold">{picked === q.answer ? t.quiz.correct : t.quiz.notQuite(title(q.answer))}</div>
              <p className="mt-1 leading-relaxed">{inline(tx(q.why))}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setI(i + 1);
                    setPicked(null);
                  }}
                  className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  {i + 1 === questions.length ? t.quiz.seeScore : t.quiz.next}
                </button>
                <Link to={`/pattern/${q.answer}`} className="text-sm font-semibold text-indigo-600 underline dark:text-indigo-400">
                  {t.quiz.study(title(q.answer))}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
