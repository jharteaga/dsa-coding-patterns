import code from './merge-intervals-p.ts?code';
import { randInt } from '../../lib/ds';
import { Tracer, grid, vars } from '../../lib/trace';
import type { Problem, Text, Tone } from '../../types';

// #region brute
export function mergeBrute(intervals: number[][]): number[][] {
  const list = intervals.map((iv) => [...iv]);
  let merged = true;
  // Keep scanning all pairs until a full scan finds nothing to merge.
  while (merged) {
    merged = false;
    for (let i = 0; i < list.length && !merged; i++) {
      for (let j = i + 1; j < list.length && !merged; j++) {
        const [a, b] = [list[i], list[j]];
        if (a[0] <= b[1] && b[0] <= a[1]) {
          list[i] = [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
          list.splice(j, 1);
          merged = true; // the list changed: start over
        }
      }
    }
  }
  return list.sort((x, y) => x[0] - y[0]);
}
// #endregion

// #region sort
export function merge(intervals: number[][]): number[][] {
  const sorted = intervals.map((iv) => [...iv]).sort((a, b) => a[0] - b[0]); // @sort
  const out: number[][] = [];
  for (const cur of sorted) {
    const last = out[out.length - 1];
    if (last !== undefined && cur[0] <= last[1]) {
      last[1] = Math.max(last[1], cur[1]); // overlaps: extend // @extend
    } else {
      out.push(cur); // gap: start a new interval // @new
    }
  }
  return out; // @done
}
// #endregion

function trace(intervals: number[][]) {
  const t = new Tracer();
  const hi = Math.max(1, ...intervals.map((iv) => iv[1]));
  const lane = (list: number[][], label: Text, tones: Tone[] = []) => {
    const hl: Record<string, Tone> = {};
    const cells = list.map((iv, r) => Array.from({ length: hi + 1 }, (_, c) => (c >= iv[0] && c <= iv[1] ? ((hl[`${r},${c}`] = tones[r] ?? 'window'), c === iv[0] ? iv[0] : c === iv[1] ? iv[1] : '') : null)));
    return grid(cells.length ? cells : [[null]], hl, { label, rowLabels: list.map((iv) => `[${iv[0]},${iv[1]}]`) });
  };
  const sorted = intervals.map((iv) => [...iv]).sort((a, b) => a[0] - b[0]);
  t.add('sort', { en: 'Sort the intervals by **start**. Now any interval that overlaps another must be right next to it in this order.', es: 'Ordena los intervalos por **inicio**. Ahora cualquier intervalo que se solape con otro tiene que estar justo a su lado en este orden.' }, lane(sorted, { en: 'intervals, sorted by start', es: 'intervalos, ordenados por inicio' }));
  const out: number[][] = [];
  sorted.forEach((cur, k) => {
    const tones = sorted.map((_, r): Tone => (r < k ? 'muted' : r === k ? 'active' : 'window'));
    const last = out[out.length - 1];
    if (last && cur[0] <= last[1]) {
      const before = `[${last[0]},${last[1]}]`;
      last[1] = Math.max(last[1], cur[1]);
      t.add('extend', { en: `[${cur[0]},${cur[1]}] starts at ${cur[0]}, which is not after the end of the last merged interval ${before}. They overlap: extend the end to ${last[1]}.`, es: `[${cur[0]},${cur[1]}] empieza en ${cur[0]}, que no es posterior al final del último intervalo fusionado ${before}. Se solapan: extiende el final hasta ${last[1]}.` }, lane(sorted, { en: 'intervals, sorted by start', es: 'intervalos, ordenados por inicio' }, tones), lane(out, { en: 'merged so far', es: 'fusionados hasta ahora' }, out.map((_, r) => (r === out.length - 1 ? 'good' : 'done'))), vars({ comparing: { en: `start ${cur[0]} ≤ end ${before}`, es: `inicio ${cur[0]} ≤ fin ${before}` } }));
    } else {
      out.push([...cur]);
      t.add('new', last ? { en: `[${cur[0]},${cur[1]}] starts at ${cur[0]}, **after** the last merged interval ends (${last[1]}). There is a gap — and since everything later starts even later, nothing else can touch the old one. Start a new interval.`, es: `[${cur[0]},${cur[1]}] empieza en ${cur[0]}, **después** de que termina el último intervalo fusionado (${last[1]}). Hay un hueco y, como todo lo posterior empieza todavía más tarde, nada más puede tocar al anterior. Empieza un intervalo nuevo.` } : { en: `Nothing merged yet: [${cur[0]},${cur[1]}] starts the output.`, es: `Aún no hay nada fusionado: [${cur[0]},${cur[1]}] inicia la salida.` }, lane(sorted, { en: 'intervals, sorted by start', es: 'intervalos, ordenados por inicio' }, tones), lane(out, { en: 'merged so far', es: 'fusionados hasta ahora' }, out.map((_, r) => (r === out.length - 1 ? 'good' : 'done'))));
    }
  });
  t.add('done', { en: `One pass after sorting. Result: **${JSON.stringify(out)}**.`, es: `Una pasada después de ordenar. Resultado: **${JSON.stringify(out)}**.` }, lane(out, { en: 'merged', es: 'fusionados' }, out.map(() => 'good')));
  return t.frames;
}

export const mergeIntervalsProblem: Problem = {
  id: 'merge-intervals-p',
  title: { en: 'Merge overlapping intervals', es: 'Merge Intervals (fusionar intervalos solapados)' },
  difficulty: 'Medium',
  statement: [
    { en: 'Given a list of intervals `[start, end]`, merge all intervals that overlap (touching counts: `[1,4]` and `[4,5]` overlap) and return the result sorted by start.', es: 'Dada una lista de intervalos `[start, end]`, fusiona todos los intervalos que se solapan (tocarse cuenta: `[1,4]` y `[4,5]` se solapan) y devuelve el resultado ordenado por inicio.' },
  ],
  examples: [{ input: 'intervals = [[1,3], [2,6], [8,10], [15,18]]', output: '[[1,6], [8,10], [15,18]]', why: { en: '[1,3] and [2,6] overlap and become [1,6].', es: '[1,3] y [2,6] se solapan y se convierten en [1,6].' } }],
  insight:
    { en: 'Unsorted, any interval might overlap any other, so you must compare all pairs. **Sort by start time** and the problem collapses: an interval can only overlap the one being built right before it. If it starts before that one ends, extend it; otherwise there is a gap and — because all later intervals start even later — the previous one is finished for good.', es: 'Sin ordenar, cualquier intervalo podría solaparse con cualquier otro, así que tienes que comparar todos los pares. **Ordena por inicio** y el problema se simplifica: un intervalo solo puede solaparse con el que se está construyendo justo antes. Si empieza antes de que ese termine, extiéndelo; si no, hay un hueco y, como todos los intervalos posteriores empiezan todavía más tarde, el anterior queda terminado para siempre.' },
  approaches: [
    { id: 'brute', label: { en: 'Merge any overlapping pair, repeat', es: 'Fusionar cualquier par solapado, repetir' }, kind: 'brute', fn: mergeBrute, time: 'O(n³)', space: 'O(n)', note: { en: 'Scan all pairs for an overlap, merge it, and start over, until a full scan finds none. Each scan is O(n²) and there can be up to n merges.', es: 'Recorre todos los pares buscando un solapamiento, fusiónalo y vuelve a empezar, hasta que un recorrido completo no encuentre ninguno. Cada recorrido es O(n²) y puede haber hasta n fusiones.' } },
    { id: 'sort', label: { en: 'Sort by start, then one pass', es: 'Ordenar por inicio y luego una pasada' }, kind: 'optimal', fn: merge, time: 'O(n log n)', space: 'O(n)', note: { en: 'The sort dominates. The merging pass itself is O(n): each interval is compared only with the last interval in the output.', es: 'El ordenamiento domina. La pasada de fusión en sí es O(n): cada intervalo se compara solo con el último intervalo de la salida.' } },
  ],
  code,
  cases: [
    { name: { en: 'one overlap', es: 'un solapamiento' }, args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
    { name: { en: 'touching endpoints merge', es: 'los extremos que se tocan se fusionan' }, args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
    { name: { en: 'empty list', es: 'lista vacía' }, args: [[]], expected: [] },
    { name: { en: 'single interval', es: 'un solo intervalo' }, args: [[[5, 7]]], expected: [[5, 7]] },
    { name: { en: 'no overlaps, unsorted input', es: 'sin solapamientos, entrada sin ordenar' }, args: [[[8, 9], [1, 2], [4, 5]]], expected: [[1, 2], [4, 5], [8, 9]] },
    { name: { en: 'one interval contains another', es: 'un intervalo contiene a otro' }, args: [[[1, 10], [3, 4]]], expected: [[1, 10]] },
    { name: { en: 'chain: everything merges into one', es: 'cadena: todo se fusiona en uno' }, args: [[[1, 3], [2, 5], [4, 8], [7, 9]]], expected: [[1, 9]] },
    { name: { en: 'identical intervals', es: 'intervalos idénticos' }, args: [[[2, 3], [2, 3], [2, 3]]], expected: [[2, 3]] },
    { name: { en: 'unsorted with overlaps', es: 'sin ordenar con solapamientos' }, args: [[[6, 8], [1, 9], [2, 4], [4, 7]]], expected: [[1, 9]] },
    { name: { en: 'zero-length intervals', es: 'intervalos de longitud cero' }, args: [[[1, 1], [1, 1], [2, 2]]], expected: [[1, 1], [2, 2]] },
  ],
  bench: {
    sizes: [100, 500, 2000, 10_000],
    nLabel: { en: 'number of intervals', es: 'número de intervalos' },
    gen: (n) => [Array.from({ length: n }, () => { const s = randInt(0, n * 3); return [s, s + randInt(0, 3)]; })],
  },
  demo: {
    inputs: [{ name: 'intervals', value: '[[6, 8], [1, 4], [9, 12], [3, 5], [7, 10]]' }],
    validate: (ivs) =>
      !Array.isArray(ivs) || ivs.length > 7 || !ivs.every((iv) => Array.isArray(iv) && iv.length === 2 && iv.every((x: unknown) => Number.isInteger(x) && (x as number) >= 0 && (x as number) <= 20) && iv[0] <= iv[1])
        ? { en: 'Use up to 7 intervals [start, end] with whole numbers from 0 to 20 and start ≤ end.', es: 'Usa hasta 7 intervalos [start, end] con números enteros de 0 a 20 y start ≤ end.' }
        : null,
    traces: { sort: trace },
  },
};
