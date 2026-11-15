import type { L, Text } from '../../i18n/text';
import type { Tone, View } from '../../types';

export const graph = (
  n: number,
  edges: number[][],
  opts: { hl?: Record<number, Tone>; edgeHl?: Record<string, Tone>; badges?: Record<number, Text>; directed?: boolean; label?: Text; base?: number } = {},
): View => ({
  kind: 'graph',
  label: opts.label,
  nodes: Array.from({ length: n }, (_, i) => i + (opts.base ?? 0)),
  edges: edges.map(([a, b]) => [a - (opts.base ?? 0), b - (opts.base ?? 0)] as [number, number]),
  directed: opts.directed,
  hl: opts.hl,
  edgeHl: opts.edgeHl,
  badges: opts.badges,
});

export const edgesErr = (n: unknown, edges: unknown, maxN = 9, maxE = 12, base = 0): L | null => {
  if (!Number.isInteger(n) || (n as number) < 1 || (n as number) > maxN) return { en: `The number of nodes must be a whole number from 1 to ${maxN}.`, es: `El número de nodos debe ser un entero de 1 a ${maxN}.` };
  const hi = (n as number) - 1 + base;
  if (!Array.isArray(edges) || edges.length > maxE || !edges.every((e) => Array.isArray(e) && e.length === 2 && e.every((x: unknown) => Number.isInteger(x) && (x as number) >= base && (x as number) <= hi) && e[0] !== e[1]))
    return {
      en: `Use up to ${maxE} edges [a, b] between two different nodes numbered ${base} to ${hi}.`,
      es: `Usa hasta ${maxE} aristas [a, b] entre dos nodos distintos numerados de ${base} a ${hi}.`,
    };
  return null;
};
