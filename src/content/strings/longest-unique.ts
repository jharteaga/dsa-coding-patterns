import code from './longest-unique.ts?code';
import { randInt } from '../../lib/ds';
import { Tracer, arr, mark, span, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region brute
export function longestUniqueBrute(s: string): number {
  let best = 0;
  for (let start = 0; start < s.length; start++) {
    const seen = new Set<string>();
    // Extend from `start` until a character repeats.
    for (let end = start; end < s.length; end++) {
      if (seen.has(s[end])) break;
      seen.add(s[end]);
      best = Math.max(best, end - start + 1);
    }
  }
  return best;
}
// #endregion

// #region window
export function longestUnique(s: string): number {
  const lastSeen = new Map<string, number>(); // character -> its most recent index
  let left = 0; // window is s[left..right], always free of repeats
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    const prev = lastSeen.get(ch);
    if (prev !== undefined && prev >= left) {
      left = prev + 1; // jump past the earlier copy of ch // @shrink
    }
    lastSeen.set(ch, right); // @grow
    best = Math.max(best, right - left + 1); // @best
  }
  return best; // @done
}
// #endregion

function trace(s: string) {
  const t = new Tracer();
  const chars = [...s];
  const last = new Map<string, number>();
  let left = 0;
  let best = 0;
  let bestAt: [number, number] = [0, -1];
  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right];
    const prev = last.get(ch);
    if (prev !== undefined && prev >= left) {
      t.add('shrink', { en: `"${ch}" is already in the window (at index ${prev}). The window must lose that earlier copy, so move **left** to just after it: ${prev + 1}. No need to step one by one.`, es: `"${ch}" ya está en la ventana (en el índice ${prev}). La ventana debe perder esa copia anterior, así que mueve **left** justo después de ella: ${prev + 1}. No hace falta avanzar de uno en uno.` }, arr(chars, { pointers: { left, right }, hl: { ...span('window', left, right - 1), ...mark('bad', prev, right) } }), vars({ best }));
      left = prev + 1;
    }
    last.set(ch, right);
    const len = right - left + 1;
    if (len > best) {
      best = len;
      bestAt = [left, right];
    }
    t.add('grow', { en: `Window "${chars.slice(left, right + 1).join('')}" has no repeats. Length ${len}${len === best ? ' — the best so far' : ''}.`, es: `La ventana "${chars.slice(left, right + 1).join('')}" no tiene repetidos. Longitud ${len}${len === best ? ' — la mejor hasta ahora' : ''}.` }, arr(chars, { pointers: { left, right }, hl: span('window', left, right) }), vars({ 'window length': len, best }));
  }
  t.add('done', { en: `The right edge visited each character once and the left edge only ever moved forward. Longest: **${best}** ("${chars.slice(bestAt[0], bestAt[1] + 1).join('')}").`, es: `El borde derecho visitó cada carácter una vez y el borde izquierdo solo avanzó. La más larga: **${best}** ("${chars.slice(bestAt[0], bestAt[1] + 1).join('')}").` }, arr(chars, { hl: span('good', bestAt[0], bestAt[1]) }), vars({ best }));
  return t.frames;
}

export const longestUniqueProblem: Problem = {
  id: 'longest-unique',
  title: { en: 'Longest substring without repeating characters', es: 'Subcadena más larga sin caracteres repetidos (Longest Substring Without Repeating Characters)' },
  difficulty: 'Medium',
  statement: [{ en: 'Given a string, return the length of the longest **substring** (consecutive characters) that contains no character twice.', es: 'Dada una cadena, devuelve la longitud de la **subcadena** (caracteres consecutivos) más larga que no contenga ningún carácter dos veces.' }],
  examples: [
    { input: 's = "abcabcbb"', output: '3', why: { en: '"abc".', es: '"abc".' } },
    { input: 's = "pwwkew"', output: '3', why: { en: '"wke". Note "pwke" is not a substring — its letters are not consecutive.', es: '"wke". Observa que "pwke" no es una subcadena: sus letras no son consecutivas.' } },
  ],
  insight:
    { en: 'A window with no repeats stays valid as you grow it to the right — until the new character is already inside. Then you do not restart: you only need to push the **left edge** past the earlier copy of that character. Both edges move left-to-right only, so the total work is O(n). This is the *variable-size* sliding window: grow on the right, shrink on the left only when a rule is broken.', es: 'Una ventana sin repetidos sigue siendo válida mientras la amplías hacia la derecha, hasta que el nuevo carácter ya está dentro. Entonces no vuelves a empezar: solo tienes que empujar el **borde izquierdo** más allá de la copia anterior de ese carácter. Ambos bordes solo se mueven de izquierda a derecha, así que el trabajo total es O(n). Esta es la ventana deslizante de *tamaño variable*: crece por la derecha y se encoge por la izquierda solo cuando se rompe una regla.' },
  approaches: [
    { id: 'brute', label: { en: 'Restart from every position', es: 'Reiniciar desde cada posición' }, kind: 'brute', fn: longestUniqueBrute, time: 'O(n²)', space: 'O(k)', note: { en: 'From each start, extend until a repeat. All progress is discarded when moving to the next start. (k = size of the alphabet.)', es: 'Desde cada inicio, extiende hasta encontrar un repetido. Todo el progreso se descarta al pasar al siguiente inicio. (k = tamaño del alfabeto.)' } },
    { id: 'window', label: { en: 'Variable-size sliding window', es: 'Ventana deslizante de tamaño variable' }, kind: 'optimal', fn: longestUnique, time: 'O(n)', space: 'O(k)', note: { en: 'A map remembers where each character was last seen, so the left edge can jump directly. The check `prev >= left` ignores copies that are already outside the window.', es: 'Un mapa recuerda dónde se vio cada carácter por última vez, así que el borde izquierdo puede saltar directamente. La comprobación `prev >= left` ignora las copias que ya están fuera de la ventana.' } },
  ],
  code,
  cases: [
    { name: { en: 'repeating pattern', es: 'patrón que se repite' }, args: ['abcabcbb'], expected: 3 },
    { name: { en: 'empty string', es: 'cadena vacía' }, args: [''], expected: 0 },
    { name: { en: 'single character', es: 'un solo carácter' }, args: ['a'], expected: 1 },
    { name: { en: 'all the same', es: 'todos iguales' }, args: ['bbbbb'], expected: 1 },
    { name: { en: 'answer in the middle', es: 'respuesta en el medio' }, args: ['pwwkew'], expected: 3 },
    { name: { en: 'all different', es: 'todos distintos' }, args: ['abcdef'], expected: 6 },
    { name: { en: 'old copy outside the window must be ignored', es: 'la copia vieja fuera de la ventana debe ignorarse' }, args: ['abba'], expected: 2 },
    { name: { en: 'spaces and symbols count', es: 'los espacios y símbolos cuentan' }, args: ['a b!a'], expected: 4 },
    { name: { en: 'repeat right at the end', es: 'repetido justo al final' }, args: ['abcda'], expected: 4 },
    { name: { en: 'two characters alternating', es: 'dos caracteres alternados' }, args: ['ababab'], expected: 2 },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 100_000],
    nLabel: { en: 'string length (alphabet of 500 symbols)', es: 'longitud de la cadena (alfabeto de 500 símbolos)' },
    gen: (n) => [Array.from({ length: n }, () => String.fromCharCode(n < 20 ? randInt(97, 100) : randInt(200, 700))).join('')],
  },
  demo: {
    inputs: [{ name: 's (in quotes)', value: '"abcbdaeb"' }],
    validate: (s) => (typeof s !== 'string' || s.length > 14 ? { en: 'Use a quoted string of at most 14 characters, e.g. "abcabcbb".', es: 'Usa una cadena entre comillas de como máximo 14 caracteres, p. ej. "abcabcbb".' } : null),
    traces: { window: trace },
  },
};
