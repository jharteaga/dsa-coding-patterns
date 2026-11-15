import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { messages } from './i18n/messages';
import { term } from './i18n/terms';
import { numLocale, tx, type Locale, type Text } from './i18n/text';
import type { Lang } from './types';

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* private mode */
  }
};

type State = {
  /** programming language of the code samples */
  lang: Lang;
  setLang: (l: Lang) => void;
  /** human language of the interface and content */
  locale: Locale;
  setLocale: (l: Locale) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
};
const Ctx = createContext<State>(null!);

export function AppState({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (['js', 'ts', 'cs'].includes(read('lang') ?? '') ? (read('lang') as Lang) : 'js'));
  // English unless the user picked Spanish; the browser language is deliberately ignored.
  const [locale, setLocaleState] = useState<Locale>(() => (read('locale') === 'es' ? 'es' : 'en'));
  const [dark, setDarkState] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = messages[locale].appTitle;
  }, [locale]);
  return (
    <Ctx.Provider
      value={{
        lang,
        setLang: (l) => (write('lang', l), setLangState(l)),
        locale,
        setLocale: (l) => (write('locale', l), setLocaleState(l)),
        dark,
        setDark: (d) => (write('theme', d ? 'dark' : 'light'), setDarkState(d)),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export const useApp = () => useContext(Ctx);

/** Interface strings (`t`), content text (`tx`), short labels (`tm`) and number formatting (`nf`) for the current locale. */
export function useT() {
  const { locale } = useApp();
  return {
    locale,
    t: messages[locale],
    tx: (x: Text | null | undefined) => tx(x, locale),
    /** short plain-string labels (variable/pointer/input names), see i18n/terms.ts */
    tm: (s: string) => term(s, locale),
    nf: (n: number) => n.toLocaleString(numLocale(locale)),
  };
}
