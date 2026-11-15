// Spanish for short labels that content files write as plain strings because they are
// object keys or identifiers: variable names in animation panels (`vars({ 'pairs tried': n })`),
// pointer names, grid row labels and demo input names. Applied at render time.
// Pure identifiers ("nums", "i", "left") are not listed and are shown as written.
// The content test fails if a prose-looking label is missing here.
import type { Locale } from './text';

const EXACT: Record<string, string> = {
  // variable names
  'additions so far': 'sumas hasta ahora',
  'additions/subtractions so far': 'sumas/restas hasta ahora',
  'nodes touched so far': 'nodos tocados hasta ahora',
  'nodes visited': 'nodos visitados',
  'window length': 'longitud de la ventana',
  'all subsets': 'todos los subconjuntos',
  'cells looked at': 'celdas miradas',
  comparing: 'comparando',
  'extend (current + x)': 'extender (actual + x)',
  'items moved between stacks': 'elementos movidos entre pilas',
  'left + right': 'izquierda + derecha',
  'left remaining': 'quedan a la izquierda',
  medians: 'medianas',
  'nodes checked': 'nodos revisados',
  'order taken': 'orden tomado',
  output: 'salida',
  'pairs tried': 'pares probados',
  'ready to take': 'listos para tomar',
  'result in binary': 'resultado en binario',
  'right remaining': 'quedan a la derecha',
  'start fresh (x)': 'empezar de nuevo (x)',
  'still waiting': 'aún esperando',
  'subsets found': 'subconjuntos encontrados',
  'tail = (head + count) % capacity': 'tail = (head + count) % capacity',
  'total calls': 'llamadas totales',
  'values counted': 'valores contados',
  latest: 'últimos',
  // pointer names
  'new head': 'nueva cabeza',
  // grid labels
  'no items': 'sin objetos',
  // demo input names
  'BST (level order)': 'BST (por niveles)',
  'edges (nodes numbered from 1)': 'edges (nodos numerados desde 1)',
  'grid (1 = land, 0 = water)': 'grid (1 = tierra, 0 = agua)',
  'h (hours)': 'h (horas)',
  'k (window size)': 'k (tamaño de la ventana)',
  'list values': 'valores de la lista',
  'lists (each sorted)': 'lists (cada una ordenada)',
  'matrix (rows and columns sorted)': 'matrix (filas y columnas ordenadas)',
  'n (courses 0…n−1)': 'n (cursos 0…n−1)',
  'n (nodes 0…n−1)': 'n (nodos 0…n−1)',
  'n (steps)': 'n (escalones)',
  'nums (all in pairs except one)': 'nums (todos en pares excepto uno)',
  'nums (distinct values from 0…n)': 'nums (valores distintos de 0…n)',
  'nums (distinct)': 'nums (distintos)',
  'nums (sorted)': 'nums (ordenado)',
  'nums (sorted, duplicates allowed)': 'nums (ordenado, se permiten duplicados)',
  'nums (sorted, then rotated)': 'nums (ordenado y luego rotado)',
  'pos (index the tail links back to, -1 = none)': 'pos (índice al que apunta la cola, -1 = ninguno)',
  'prerequisites [course, pre]': 'prerequisites [curso, prerrequisito]',
  's (in quotes)': 's (entre comillas)',
  'tree (level order)': 'tree (por niveles)',
  'tree (level order, null = no child)': 'tree (por niveles, null = sin hijo)',
};

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^key (.+)$/, (m) => `clave ${m[1]}`],
  [/^list (\d+)$/, (m) => `lista ${m[1]}`],
  [/^\+ item (\d+) \((.*)\)$/, (m) => `+ objeto ${m[1]} (${m[2]})`],
];

function es(s: string): string | undefined {
  if (s in EXACT) return EXACT[s];
  for (const [re, f] of PATTERNS) {
    const m = s.match(re);
    if (m) return f(m);
  }
  return undefined;
}

export const term = (s: string, locale: Locale): string => (locale === 'es' ? (es(s) ?? s) : s);
export const hasTerm = (s: string) => es(s) !== undefined;
