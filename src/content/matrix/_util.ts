import { randInt } from '../../lib/ds';
import type { L } from '../../i18n/text';

export const matrixErr = (m: unknown, maxSide = 6, check: (x: unknown) => boolean = (x) => typeof x === 'number'): L | null => {
  if (!Array.isArray(m) || !m.length || !m.every((r) => Array.isArray(r) && r.length === m[0].length && r.length > 0 && r.every(check)))
    return { en: 'Use a rectangular matrix, e.g. [[1, 2, 3], [4, 5, 6]].', es: 'Usa una matriz rectangular, p. ej. [[1, 2, 3], [4, 5, 6]].' };
  if (m.length > maxSide || m[0].length > maxSide)
    return { en: `Use at most ${maxSide} rows and ${maxSide} columns.`, es: `Usa como máximo ${maxSide} filas y ${maxSide} columnas.` };
  return null;
};
export const randMatrix = (rows: number, cols: number, lo = 0, hi = 99) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => randInt(lo, hi)));
