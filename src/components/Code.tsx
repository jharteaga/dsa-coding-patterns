import { useEffect, useState } from 'react';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { useApp, useT } from '../state';
import { LANGS, type CodeBlock, type CodeBundle, type Lang } from '../types';

let highlighter: Promise<HighlighterCore> | null = null;
const getHighlighter = () =>
  (highlighter ??= createHighlighterCore({
    themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
    langs: [import('shiki/langs/javascript.mjs'), import('shiki/langs/typescript.mjs'), import('shiki/langs/csharp.mjs')],
    engine: createJavaScriptRegexEngine(),
  }));

const GRAMMAR: Record<Lang, string> = { js: 'javascript', ts: 'typescript', cs: 'csharp' };
type Tok = { content: string; l?: string; d?: string };

function useTokens(code: string, lang: Lang): Tok[][] {
  const plain = code.split('\n').map((line) => [{ content: line }]);
  const [state, setState] = useState<{ key: string; lines: Tok[][] } | null>(null);
  const key = lang + '\0' + code;
  useEffect(() => {
    let live = true;
    getHighlighter()
      .then((h) => {
        const lines = h
          .codeToTokensWithThemes(code, { lang: GRAMMAR[lang], themes: { light: 'github-light', dark: 'github-dark' } })
          .map((line) => line.map((t) => ({ content: t.content, l: t.variants.light?.color, d: t.variants.dark?.color })));
        if (live) setState({ key, lines });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [key, code, lang]);
  return state?.key === key ? state.lines : plain;
}

export function CodeView({ block, lang, hlLines = [] }: { block: CodeBlock; lang: Lang; hlLines?: number[] }) {
  const lines = useTokens(block.code, lang);
  return (
    <pre className="overflow-x-auto py-2 text-[12.5px] leading-[1.55]">
      <code className="block min-w-max">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`flex px-3 ${hlLines.includes(i) ? 'bg-amber-200/70 shadow-[inset_3px_0_0_#d97706] dark:bg-amber-500/25' : ''}`}
          >
            <span className="mr-3 w-5 shrink-0 text-right text-(--ink-2) opacity-50 select-none">{i + 1}</span>
            <span className="whitespace-pre">
              {line.map((t, j) => (
                <span key={j} className="tok" style={{ '--l': t.l, '--d': t.d } as React.CSSProperties}>
                  {t.content}
                </span>
              ))}
              {line.length === 0 && ' '}
            </span>
          </div>
        ))}
      </code>
    </pre>
  );
}

/** One named region of a problem's source, shown in the globally selected language (with tabs to peek at the others). */
export function RegionCode({ code, region, step, title }: { code: CodeBundle; region: string; step?: string; title?: string }) {
  const { lang: global } = useApp();
  const { t } = useT();
  const [peek, setPeek] = useState<Lang | null>(null);
  useEffect(() => {
    setPeek(null);
  }, [global]);
  const lang = peek ?? global;
  const block = code[lang][region];
  return (
    <div className="overflow-hidden rounded-lg border border-(--line) bg-(--surface)">
      <div className="flex items-center justify-between border-b border-(--line) px-3 py-1">
        <span className="text-xs font-medium text-(--ink-2)">{title}</span>
        <div className="flex gap-1">
          {LANGS.map((l) => (
            <button
              key={l.id}
              onClick={() => setPeek(l.id)}
              className={`rounded px-2 py-0.5 text-[11px] font-semibold ${l.id === lang ? 'bg-indigo-600 text-white' : 'text-(--ink-2) hover:bg-(--page)'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      {block ? (
        <CodeView block={block} lang={lang} hlLines={step ? (block.steps[step] ?? []) : []} />
      ) : (
        <div className="p-3 text-sm text-(--ink-2)">{t.code.missing(LANGS.find((l) => l.id === lang)!.label)}</div>
      )}
    </div>
  );
}
