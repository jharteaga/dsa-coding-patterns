import type { ReactNode } from 'react';
import { useT } from '../state';
import type { Text } from '../types';

/** Tiny inline formatter: `code` and **bold**. */
export function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((part, i) =>
    part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith('*') && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em> : part,
  );
}

export function P({ children, className = '' }: { children: Text; className?: string }) {
  const { tx } = useT();
  return <p className={`prose-p leading-relaxed ${className}`}>{inline(tx(children))}</p>;
}

export function Paras({ items, className = '' }: { items: Text[]; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((t, i) => (
        <P key={i}>{t}</P>
      ))}
    </div>
  );
}

export const KIND_STYLE = {
  brute: { cls: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200' },
  better: { cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200' },
  optimal: { cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200' },
} as const;

export function KindBadge({ kind }: { kind: keyof typeof KIND_STYLE }) {
  const { t } = useT();
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${KIND_STYLE[kind].cls}`}>{t.kind[kind]}</span>;
}

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="section-h text-lg font-bold">{title}</h3>
      {hint && <p className="mt-0.5 text-sm text-(--ink-2)">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}
