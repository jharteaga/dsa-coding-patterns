import { useEffect } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { byGroup } from './content/registry';
import { BigOPage, TreeBasicsPage } from './pages/Primers';
import Home from './pages/Home';
import PatternPage from './pages/PatternPage';
import QuizPage from './pages/QuizPage';
import { LOCALES } from './i18n/text';
import { useApp, useT } from './state';
import { LANGS } from './types';

function TopBar() {
  const { lang, setLang, locale, setLocale, dark, setDark } = useApp();
  const { t } = useT();
  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-2.5 py-1 text-sm font-medium whitespace-nowrap ${isActive ? 'bg-indigo-600 text-white' : 'text-(--ink-2) hover:bg-(--page)'}`;
  return (
    <header className="sticky top-0 z-20 border-b border-(--line) bg-(--surface)/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
        <NavLink to="/" className="mr-2 text-base font-extrabold tracking-tight">
          {locale === 'es' ? (
            <>
              Patrones <span className="text-indigo-600 dark:text-indigo-400">DSA</span>
            </>
          ) : (
            <>
              <span className="text-indigo-600 dark:text-indigo-400">DSA</span> Patterns
            </>
          )}
        </NavLink>
        <nav className="flex gap-1 overflow-x-auto">
          <NavLink to="/" end className={link}>
            {t.nav.patterns}
          </NavLink>
          <NavLink to="/big-o" className={link}>
            {t.nav.bigO}
          </NavLink>
          <NavLink to="/tree-basics" className={link}>
            {t.nav.trees}
          </NavLink>
          <NavLink to="/quiz" className={link}>
            {t.nav.quiz}
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-(--ink-2) sm:inline">{t.top.codeIn}</span>
          <div className="flex rounded-lg border border-(--line) p-0.5" role="group" aria-label={t.top.codeLang}>
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                aria-pressed={lang === l.id}
                className={`rounded-md px-2.5 py-1 text-xs font-bold ${lang === l.id ? 'bg-indigo-600 text-white' : 'text-(--ink-2) hover:bg-(--page)'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-(--line) p-0.5" role="group" aria-label={t.top.uiLang}>
            {LOCALES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLocale(l.id)}
                aria-pressed={locale === l.id}
                lang={l.id}
                className={`rounded-md px-2 py-1 text-xs font-bold ${locale === l.id ? 'bg-indigo-600 text-white' : 'text-(--ink-2) hover:bg-(--page)'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="rounded-md border border-(--line) px-2 py-1 text-sm hover:bg-(--page)"
            aria-label={t.top.toggleDark}
            title={t.top.toggleDark}
          >
            {dark ? '☀' : '☾'}
          </button>
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  const { t, tx } = useT();
  const link = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-2 py-1 text-[13px] ${isActive ? 'bg-indigo-600 font-semibold text-white' : 'text-(--ink) hover:bg-(--surface)'}`;
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto py-4 pr-2 lg:block">
      {byGroup.map(([group, list]) => (
        <div key={group} className="mb-4">
          <div className="flex items-center gap-1.5 px-1 pb-1.5 text-[11px] font-extrabold tracking-wider text-amber-700 uppercase dark:text-amber-400">
            <span className="h-2 w-2 rounded-sm bg-amber-500" />
            {t.groups[group as keyof typeof t.groups]}
          </div>
          <div className="ml-2 border-l-2 border-(--line) pl-1.5">
            {list.map((p) => (
              <NavLink key={p.id} to={`/pattern/${p.id}`} className={link}>
                {tx(p.title)}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const patternId = pathname.split('/')[2];
  const section = pathname.split('/')[1];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [patternId, section]);
  return (
    <>
      <TopBar />
      <div className="mx-auto flex max-w-[1500px] gap-6 px-4">
        <Sidebar />
        <main className="min-w-0 flex-1 py-6 pb-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pattern/:patternId/:problemId?" element={<PatternPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/big-o" element={<BigOPage />} />
            <Route path="/tree-basics" element={<TreeBasicsPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
