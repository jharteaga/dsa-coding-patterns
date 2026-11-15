// Bilingual text for content files. Resolved at render time with `tx`, so switching
// language never re-runs a trace or reloads content.
export type Locale = 'en' | 'es';
export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'es', label: 'ES' },
];

export type L = { en: string; es: string };
/** Text in animation views: plain strings for identifiers/values, `L` for prose. Content fields require `L`. */
export type Text = string | L;

export const isL = (x: unknown): x is L =>
  typeof x === 'object' && x !== null && typeof (x as L).en === 'string' && typeof (x as L).es === 'string';

export const tx = (x: Text | null | undefined, locale: Locale): string => (x == null ? '' : typeof x === 'string' ? x : x[locale]);

/** Number formatting per locale. */
export const numLocale = (locale: Locale) => (locale === 'es' ? 'es-ES' : 'en-US');
