import code from './meeting-rooms.ts?code';
import { randInt } from '../../lib/ds';
import type { Problem } from '../../types';

// #region brute
export function canAttendAllBrute(meetings: number[][]): boolean {
  for (let i = 0; i < meetings.length; i++) {
    for (let j = i + 1; j < meetings.length; j++) {
      const [a, b] = [meetings[i], meetings[j]];
      // Two meetings clash if each one starts before the other ends.
      if (a[0] < b[1] && b[0] < a[1]) return false;
    }
  }
  return true;
}
// #endregion

// #region sort
export function canAttendAll(meetings: number[][]): boolean {
  const sorted = [...meetings].sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < sorted.length; i++) {
    // After sorting, a clash can only be with the meeting just before.
    if (sorted[i][0] < sorted[i - 1][1]) return false;
  }
  return true;
}
// #endregion

export const meetingRooms: Problem = {
  id: 'meeting-rooms',
  title: { en: 'Can one person attend every meeting?', es: 'Meeting Rooms (¿puede una persona asistir a todas las reuniones?)' },
  difficulty: 'Easy',
  statement: [
    { en: 'Given meeting times `[start, end]`, return `true` if no two meetings overlap. A meeting ending at 10 and another starting at 10 do **not** clash.', es: 'Dados los horarios de reuniones `[start, end]`, devuelve `true` si no hay dos reuniones que se solapen. Una reunión que termina a las 10 y otra que empieza a las 10 **no** chocan.' },
  ],
  examples: [
    { input: 'meetings = [[0, 30], [5, 10], [15, 20]]', output: 'false', why: { en: '[0, 30] overlaps both others.', es: '[0, 30] se solapa con las otras dos.' } },
    { input: 'meetings = [[7, 10], [2, 4]]', output: 'true' },
  ],
  insight:
    { en: 'Same idea as merging: once the meetings are sorted by start time, each meeting only needs to be compared with the one **directly before it**. If it starts before the previous one ends, there is a clash.', es: 'La misma idea que al fusionar: una vez ordenadas las reuniones por hora de inicio, cada reunión solo necesita compararse con la que está **justo antes**. Si empieza antes de que termine la anterior, hay un choque.' },
  approaches: [
    { id: 'brute', label: { en: 'Compare every pair', es: 'Comparar cada par' }, kind: 'brute', fn: canAttendAllBrute, time: 'O(n²)', space: 'O(1)', note: { en: 'Check all pairs of meetings for an overlap.', es: 'Revisa todos los pares de reuniones en busca de un solapamiento.' } },
    { id: 'sort', label: { en: 'Sort, compare neighbours', es: 'Ordenar y comparar vecinos' }, kind: 'optimal', fn: canAttendAll, time: 'O(n log n)', space: 'O(n)', note: { en: 'Sorting costs O(n log n); the check afterwards is a single O(n) pass.', es: 'Ordenar cuesta O(n log n); la revisión posterior es una sola pasada O(n).' } },
  ],
  code,
  cases: [
    { name: { en: 'one long meeting overlaps others', es: 'una reunión larga se solapa con otras' }, args: [[[0, 30], [5, 10], [15, 20]]], expected: false },
    { name: { en: 'no overlap, unsorted', es: 'sin solapamiento, sin ordenar' }, args: [[[7, 10], [2, 4]]], expected: true },
    { name: { en: 'no meetings', es: 'sin reuniones' }, args: [[]], expected: true },
    { name: { en: 'single meeting', es: 'una sola reunión' }, args: [[[1, 2]]], expected: true },
    { name: { en: 'back-to-back is fine', es: 'una tras otra está bien' }, args: [[[1, 5], [5, 8], [8, 9]]], expected: true },
    { name: { en: 'identical meetings', es: 'reuniones idénticas' }, args: [[[3, 4], [3, 4]]], expected: false },
    { name: { en: 'one inside another', es: 'una dentro de otra' }, args: [[[1, 10], [4, 5]]], expected: false },
    { name: { en: 'overlap by one unit', es: 'solapamiento de una unidad' }, args: [[[1, 5], [4, 8]]], expected: false },
    { name: { en: 'many, last pair clashes', es: 'muchas, el último par choca' }, args: [[[1, 2], [3, 4], [5, 6], [7, 9], [8, 10]]], expected: false },
  ],
  bench: {
    sizes: [100, 1000, 10_000, 30_000],
    nLabel: { en: 'number of meetings (no clashes: worst case)', es: 'número de reuniones (sin choques: peor caso)' },
    gen: (n) => {
      const ms = Array.from({ length: n }, (_, i) => [i * 10, i * 10 + randInt(1, n < 20 ? 14 : 10)]);
      return [ms.sort(() => Math.random() - 0.5)];
    },
  },
};
