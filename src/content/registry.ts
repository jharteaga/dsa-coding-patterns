import { GROUPS, type Pattern, type Problem } from '../types';

// Every file in content/<group>/ that exports a Pattern is picked up automatically.
const modules = import.meta.glob<Record<string, unknown>>('./*/*.ts', { eager: true });
const isPattern = (x: unknown): x is Pattern =>
  typeof x === 'object' && x !== null && Array.isArray((x as Pattern).problems) && Array.isArray((x as Pattern).cues);

export const patterns: Pattern[] = Object.values(modules)
  .flatMap((m) => Object.values(m).filter(isPattern))
  .sort((a, b) => GROUPS.indexOf(a.group as never) - GROUPS.indexOf(b.group as never) || (a.order ?? 99) - (b.order ?? 99));

export const patternsById: Record<string, Pattern> = Object.fromEntries(patterns.map((p) => [p.id, p]));
export const problemsById: Record<string, Problem> = Object.fromEntries(patterns.flatMap((p) => p.problems.map((x) => [x.id, x])));
export const byGroup: [string, Pattern[]][] = GROUPS.map((g): [string, Pattern[]] => [g, patterns.filter((p) => p.group === g)]).filter(
  ([, list]) => list.length > 0,
);
