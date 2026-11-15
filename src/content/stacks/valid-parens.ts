import code from './valid-parens.ts?code';
import { randInt } from '../../lib/ds';
import { Tracer, arr, mark, span } from '../../lib/trace';
import type { Problem } from '../../types';

// #region brute
export function isValidBrute(s: string): boolean {
  // Keep deleting adjacent matching pairs until none are left.
  let prev = '';
  while (s !== prev) {
    prev = s;
    s = s.replace('()', '').replace('[]', '').replace('{}', ''); // each pass is O(n)
  }
  return s.length === 0;
}
// #endregion

// #region stack
export function isValid(s: string): boolean {
  const closes: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const stack: string[] = [];
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch); // @push
    } else {
      // A closer must match the most recent unclosed opener.
      if (stack.pop() !== closes[ch]) return false; // @pop
    }
  }
  return stack.length === 0; // @end
}
// #endregion

function trace(s: string) {
  const t = new Tracer();
  const closes: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const chars = [...s];
  const stack: string[] = [];
  const view = (i: number, tone: 'active' | 'good' | 'bad') => [
    arr(chars, { label: { en: 'input', es: 'entrada' }, pointers: { i }, hl: { ...span('muted', 0, i - 1), ...mark(tone, i) } }),
    arr(stack, { label: { en: 'stack of unclosed openers', es: 'pila de aperturas sin cerrar' }, layout: 'stack' as const }),
  ];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if ('([{'.includes(ch)) {
      stack.push(ch);
      t.add('push', { en: `"${ch}" opens a group. Push it: it is now the **most recent** unclosed opener.`, es: `"${ch}" abre un grupo. Apílalo: ahora es la apertura sin cerrar **más reciente**.` }, ...view(i, 'active'));
    } else {
      const top = stack[stack.length - 1];
      if (top !== closes[ch]) {
        t.add('pop', top
            ? { en: `"${ch}" closes a group, but the most recent opener is "${top}" — wrong type. **Invalid.**`, es: `"${ch}" cierra un grupo, pero la apertura más reciente es "${top}" — tipo equivocado. **Inválido.**` }
            : { en: `"${ch}" closes a group, but nothing is open. **Invalid.**`, es: `"${ch}" cierra un grupo, pero no hay nada abierto. **Inválido.**` }, ...view(i, 'bad'));
        return t.frames;
      }
      stack.pop();
      t.add('pop', { en: `"${ch}" closes a group. It must match the most recent opener — the top of the stack is "${top}". ✓ Pop it.`, es: `"${ch}" cierra un grupo. Debe coincidir con la apertura más reciente — la cima de la pila es "${top}". ✓ Desapílalo.` }, ...view(i, 'good'));
    }
  }
  t.add(
    'end',
    stack.length
      ? { en: `End of input, but ${stack.length} opener(s) were never closed. **Invalid.**`, es: `Fin de la entrada, pero ${stack.length} apertura(s) nunca se cerraron. **Inválido.**` }
      : { en: 'End of input and the stack is empty: every opener was closed in the right order. **Valid.**', es: 'Fin de la entrada y la pila está vacía: cada apertura se cerró en el orden correcto. **Válido.**' },
    arr(chars, { label: { en: 'input', es: 'entrada' }, hl: span(stack.length ? 'bad' : 'good', 0, chars.length - 1) }),
    arr(stack, { label: { en: 'stack of unclosed openers', es: 'pila de aperturas sin cerrar' }, layout: 'stack' }),
  );
  return t.frames;
}

export const validParens: Problem = {
  id: 'valid-parens',
  title: { en: 'Valid parentheses', es: 'Valid Parentheses (paréntesis válidos)' },
  difficulty: 'Easy',
  statement: [
    {
      en: 'Given a string containing only `( ) [ ] { }`, return `true` if every opening bracket is closed by the same type of bracket, in the correct order.',
      es: 'Dada una cadena que contiene solo `( ) [ ] { }`, devuelve `true` si cada paréntesis de apertura se cierra con uno del mismo tipo, en el orden correcto.',
    },
  ],
  examples: [
    { input: 's = "{[()]}"', output: 'true' },
    { input: 's = "([)]"', output: 'false', why: { en: 'The ")" arrives while "[" is still the most recent opener.', es: 'El ")" llega mientras "[" sigue siendo la apertura más reciente.' } },
  ],
  insight: {
    en: 'A closing bracket must always match the **most recently opened** bracket that is still open. "Most recent first" is exactly what a stack gives you (last in, first out). Push openers; on a closer, pop and compare. One pass, no re-scanning.',
    es: 'Un paréntesis de cierre siempre debe coincidir con el **abierto más recientemente** que siga abierto. "Lo más reciente primero" es justo lo que te da una pila (último en entrar, primero en salir). Apila las aperturas; ante un cierre, desapila y compara. Una pasada, sin volver a recorrer.',
  },
  approaches: [
    { id: 'brute', label: { en: 'Delete matching pairs repeatedly', es: 'Borrar pares coincidentes repetidamente' }, kind: 'brute', fn: isValidBrute, time: 'O(n²)', space: 'O(n)', note: {
        en: 'Remove an adjacent "()", "[]" or "{}" and rescan, until nothing changes. Each pass is O(n) and a string like "((((…))))" needs n/2 passes.',
        es: 'Quita un "()", "[]" o "{}" adyacente y vuelve a recorrer, hasta que nada cambie. Cada pasada es O(n) y una cadena como "((((…))))" necesita n/2 pasadas.',
      },
    },
    { id: 'stack', label: { en: 'Stack of open brackets', es: 'Pila de paréntesis abiertos' }, kind: 'optimal', fn: isValid, time: 'O(n)', space: 'O(n)', note: {
        en: 'Three ways to fail: a closer with the wrong opener on top, a closer with an empty stack (`pop()` returns undefined), or openers left over at the end.',
        es: 'Tres formas de fallar: un cierre con la apertura equivocada en la cima, un cierre con la pila vacía (`pop()` devuelve undefined), o aperturas sobrantes al final.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'nested, three types', es: 'anidados, tres tipos' }, args: ['{[()]}'], expected: true },
    { name: { en: 'side by side', es: 'uno al lado del otro' }, args: ['()[]{}'], expected: true },
    { name: { en: 'empty string', es: 'cadena vacía' }, args: [''], expected: true },
    { name: { en: 'interleaved types', es: 'tipos intercalados' }, args: ['([)]'], expected: false },
    { name: { en: 'wrong closer', es: 'cierre equivocado' }, args: ['(]'], expected: false },
    { name: { en: 'single opener', es: 'una sola apertura' }, args: ['('], expected: false },
    { name: { en: 'single closer', es: 'un solo cierre' }, args: [')'], expected: false },
    { name: { en: 'closer first', es: 'cierre primero' }, args: [')('], expected: false },
    { name: { en: 'unclosed at the end', es: 'sin cerrar al final' }, args: ['(()'], expected: false },
    { name: { en: 'extra closer at the end', es: 'cierre extra al final' }, args: ['())'], expected: false },
    { name: { en: 'deeply nested', es: 'anidamiento profundo' }, args: ['(((((())))))'], expected: true },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 50_000],
    nLabel: { en: 'string length (deeply nested: worst case)', es: 'longitud de la cadena (anidamiento profundo: peor caso)' },
    gen: (n) => (n < 20 ? [Array.from({ length: n * 2 }, () => '()[]'[randInt(0, 3)]).join('')] : ['('.repeat(n >> 1) + ')'.repeat(n >> 1)]),
  },
  demo: {
    inputs: [{ name: 's (in quotes)', value: '"{[()()]}(]"' }],
    validate: (s) => (typeof s !== 'string' || !/^[()[\]{}]{0,16}$/.test(s) 
        ? { en: 'Use a quoted string of up to 16 brackets, e.g. "([]{})".', es: 'Usa una cadena entre comillas de hasta 16 paréntesis, p. ej. "([]{})".' }
        : null),
    traces: { stack: trace },
  },
};
