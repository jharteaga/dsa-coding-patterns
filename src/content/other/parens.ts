import code from './parens.ts?code';
import type { Problem } from '../../types';

// #region brute
export function generateParensBrute(n: number): string[] {
  const isValid = (s: string): boolean => {
    let open = 0;
    for (const ch of s) {
      open += ch === '(' ? 1 : -1;
      if (open < 0) return false; // closed something that was never opened
    }
    return open === 0;
  };

  const result: string[] = [];
  // Build EVERY string of length 2n over "(" and ")" — 2^(2n) of them — then filter.
  const build = (s: string): void => {
    if (s.length === 2 * n) {
      if (isValid(s)) result.push(s);
      return;
    }
    build(s + '(');
    build(s + ')');
  };
  build('');
  return result;
}
// #endregion

// #region backtrack
export function generateParens(n: number): string[] {
  const result: string[] = [];
  // `open` and `close` = how many of each bracket are already in s.
  const build = (s: string, open: number, close: number): void => {
    if (s.length === 2 * n) {
      result.push(s); // only valid strings can ever get here
      return;
    }
    if (open < n) build(s + '(', open + 1, close); // may open while some remain
    if (close < open) build(s + ')', open, close + 1); // may close only what is open
  };
  build('', 0, 0);
  return result;
}
// #endregion

export const parens: Problem = {
  id: 'parens',
  title: { en: 'Generate valid parentheses', es: 'Generar paréntesis válidos (Generate Parentheses)' },
  difficulty: 'Medium',
  statement: [{ en: 'Given `n` pairs of parentheses, return every string of length `2n` that is a well-formed combination.', es: 'Dados `n` pares de paréntesis, devuelve todas las cadenas de longitud `2n` que sean una combinación bien formada.' }],
  examples: [{ input: 'n = 3', output: '["((()))", "(()())", "(())()", "()(())", "()()()"]' }],
  insight:
    { en: 'The brute force builds every possible string and throws most of them away at the end. **Pruning** means refusing to take a step that cannot possibly lead to a valid answer. Here two rules are enough: only add "(" if fewer than n have been used; only add ")" if it has an unmatched "(" to close. A branch that breaks a rule is never entered, so the search only ever walks through valid prefixes — and every string that reaches full length is valid without checking.', es: 'La fuerza bruta construye todas las cadenas posibles y desecha la mayoría al final. **Podar** significa negarse a dar un paso que no puede llevar a una respuesta válida. Aquí bastan dos reglas: solo agrega "(" si se han usado menos de n; solo agrega ")" si hay un "(" sin cerrar. Nunca se entra a una rama que rompe una regla, así que la búsqueda solo recorre prefijos válidos, y toda cadena que llega a la longitud completa es válida sin necesidad de verificarla.' },
  approaches: [
    { id: 'brute', label: { en: 'Generate everything, then filter', es: 'Generar todo y luego filtrar' }, kind: 'brute', fn: generateParensBrute, time: 'O(2²ⁿ · n)', space: 'O(n)', benchMax: 10, note: { en: 'For n = 10 that is over a million strings to build and validate, of which only 16,796 are kept.', es: 'Para n = 10 son más de un millón de cadenas que construir y validar, de las cuales solo se conservan 16,796.' } },
    { id: 'backtrack', label: { en: 'Backtracking with pruning', es: 'Backtracking con poda' }, kind: 'optimal', fn: generateParens, time: 'O(4ⁿ / √n)', space: 'O(n)', note: { en: 'Still exponential — the output itself is that large (the Catalan numbers) — but it does no wasted work: time is proportional to the number of answers.', es: 'Sigue siendo exponencial, porque la salida misma es así de grande (los números de Catalan), pero no desperdicia trabajo: el tiempo es proporcional al número de respuestas.' } },
  ],
  code,
  adapt: { out: (r: string[]) => [...r].sort() },
  cases: [
    { name: { en: 'n = 3', es: 'n = 3' }, args: [3], expected: ['((()))', '(()())', '(())()', '()(())', '()()()'] },
    { name: { en: 'n = 0 → just the empty string', es: 'n = 0 → solo la cadena vacía' }, args: [0], expected: [''] },
    { name: { en: 'n = 1', es: 'n = 1' }, args: [1], expected: ['()'] },
    { name: { en: 'n = 2', es: 'n = 2' }, args: [2], expected: ['(())', '()()'] },
    { name: { en: 'n = 4 → 14 strings', es: 'n = 4 → 14 cadenas' }, args: [4], expected: ['(((())))', '((()()))', '((())())', '((()))()', '(()(()))', '(()()())', '(()())()', '(())(())', '(())()()', '()((()))', '()(()())', '()(())()', '()()(())', '()()()()'] },
  ],
  bench: { sizes: [2, 4, 6, 8, 10, 12], nLabel: { en: 'number of pairs', es: 'número de pares' }, gen: (n) => [Math.min(n, 12)] },
};
