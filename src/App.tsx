import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { byGroup } from "./content/registry";
import { BigOPage, TreeBasicsPage } from "./pages/Primers";
import Home from "./pages/Home";
import PatternPage from "./pages/PatternPage";
import QuizPage from "./pages/QuizPage";
import { LOCALES } from "./i18n/text";
import { useApp, useT } from "./state";
import { LANGS } from "./types";

function TopBar() {
  const { lang, setLang, locale, setLocale, dark, setDark } = useApp();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-2.5 py-1 text-sm font-medium whitespace-nowrap ${isActive ? "bg-indigo-600 text-white" : "text-(--ink-2) hover:bg-(--page)"}`;
  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-3 text-base font-medium ${isActive ? "bg-indigo-600 text-white" : "text-(--ink) hover:bg-(--page)"}`;
  const seg = (active: boolean, pad: string) =>
    `rounded-md ${pad} font-bold ${active ? "bg-indigo-600 text-white" : "text-(--ink-2) hover:bg-(--page)"}`;
  const items = [
    { to: "/", label: t.nav.patterns, end: true },
    { to: "/big-o", label: t.nav.bigO },
    { to: "/tree-basics", label: t.nav.trees },
    { to: "/quiz", label: t.nav.quiz },
  ];

  const codeLang = (big: boolean) => (
    <div
      className={`flex rounded-lg border border-(--line) p-0.5 ${big ? "w-full" : ""}`}
      role="group"
      aria-label={t.top.codeLang}
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          className={`${seg(lang === l.id, big ? "min-h-11 flex-1 px-3 text-sm" : "px-2.5 py-1 text-xs")}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
  const uiLang = (big: boolean) => (
    <div
      className={`flex rounded-lg border border-(--line) p-0.5 ${big ? "w-full" : ""}`}
      role="group"
      aria-label={t.top.uiLang}
    >
      {LOCALES.map((l) => (
        <button
          key={l.id}
          onClick={() => setLocale(l.id)}
          aria-pressed={locale === l.id}
          lang={l.id}
          className={`${seg(locale === l.id, big ? "min-h-11 flex-1 px-3 text-sm" : "px-2 py-1 text-xs")}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
  const darkBtn = (big: boolean) => (
    <button
      onClick={() => setDark(!dark)}
      className={
        big
          ? "flex min-h-12 w-full items-center justify-between rounded-lg border border-(--line) px-4 text-base font-medium hover:bg-(--page)"
          : "rounded-md border border-(--line) px-2 py-1 text-sm hover:bg-(--page)"
      }
      aria-label={t.top.toggleDark}
      title={t.top.toggleDark}
    >
      {big && <span>{t.top.toggleDark}</span>}
      <span aria-hidden="true" className={big ? "text-xl" : ""}>
        {dark ? "☀" : "☾"}
      </span>
    </button>
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-10 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <header className="sticky top-0 z-20 border-b border-(--line) bg-(--surface)/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4">
          <NavLink
            to="/"
            className="mr-2 text-2xl font-extrabold md:text-xl tracking-tight whitespace-nowrap"
          >
            {locale === "es" ? (
              <>
                Patrones{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  DSA
                </span>
              </>
            ) : (
              <>
                <span className="text-indigo-600 dark:text-indigo-400">
                  DSA
                </span>{" "}
                Patterns
              </>
            )}
          </NavLink>
          <nav className="hidden gap-1 md:flex" aria-label="Main">
            {items.map((i) => (
              <NavLink key={i.to} to={i.to} end={i.end} className={link}>
                {i.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <span className="hidden text-xs text-(--ink-2) lg:inline">
              {t.top.codeIn}
            </span>
            {codeLang(false)}
            {uiLang(false)}
            {darkBtn(false)}
          </div>
          <button
            className="ml-auto inline-flex h-12 w-12 items-center justify-center rounded-lg border border-(--line) hover:bg-(--page) md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="M4 4l12 12M16 4L4 16" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" />
              )}
            </svg>
          </button>
        </div>
        {open && (
          <div
            id="mobile-menu"
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-(--line) bg-(--surface) px-4 pt-2 pb-4 md:hidden"
          >
            <nav className="flex flex-col gap-1" aria-label="Main">
              {items.map((i) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  end={i.end}
                  className={mobileLink}
                >
                  {i.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-4 border-t border-(--line) pt-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-(--ink-2)">
                  {t.top.codeIn}
                </span>
                {codeLang(true)}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-(--ink-2)">
                  {t.top.uiLang}
                </span>
                {uiLang(true)}
              </div>
              {darkBtn(true)}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function Sidebar() {
  const { t, tx } = useT();
  const link = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-2 py-1 text-[13px] ${isActive ? "bg-indigo-600 font-semibold text-white" : "text-(--ink) hover:bg-(--surface)"}`;
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto py-4 pr-2 lg:block">
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
  const patternId = pathname.split("/")[2];
  const section = pathname.split("/")[1];
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
            <Route
              path="/pattern/:patternId/:problemId?"
              element={<PatternPage />}
            />
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
