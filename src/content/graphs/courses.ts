import code from './courses.ts?code';
import { randInt } from '../../lib/ds';
import { Tracer, vars } from '../../lib/trace';
import type { Problem, Tone } from '../../types';
import { edgesErr, graph } from './_util';

// #region rescan
export function canFinishRescan(n: number, prerequisites: number[][]): boolean {
  const done = new Array<boolean>(n).fill(false);
  let finished = 0;
  let progress = true;
  // Keep looking for any course whose prerequisites are all done.
  while (progress) {
    progress = false;
    for (let course = 0; course < n; course++) {
      if (done[course]) continue;
      // Scans the WHOLE prerequisite list for this one course.
      const ready = prerequisites.every(([c, pre]) => c !== course || done[pre]);
      if (ready) {
        done[course] = true;
        finished++;
        progress = true;
      }
    }
  }
  return finished === n;
}
// #endregion

// #region kahn
export function canFinish(n: number, prerequisites: number[][]): boolean {
  const unlocks: number[][] = Array.from({ length: n }, () => []); // pre -> courses it unlocks
  const missing = new Array<number>(n).fill(0); // course -> prerequisites not yet done
  for (const [course, pre] of prerequisites) {
    unlocks[pre].push(course);
    missing[course]++; // @build
  }

  const ready: number[] = []; // courses that can be taken right now
  for (let c = 0; c < n; c++) if (missing[c] === 0) ready.push(c); // @ready

  let taken = 0;
  while (ready.length > 0) {
    const course = ready.pop() as number; // @take
    taken++;
    for (const next of unlocks[course]) {
      missing[next]--; // one prerequisite fewer // @unlock
      if (missing[next] === 0) ready.push(next);
    }
  }
  return taken === n; // courses stuck in a cycle never become ready // @done
}
// #endregion

function trace(n: number, pre: number[][]) {
  const t = new Tracer();
  const edges = pre.map(([c, p]) => [p, c]);
  const unlocks: number[][] = Array.from({ length: n }, () => []);
  const missing = new Array<number>(n).fill(0);
  for (const [c, p] of pre) (unlocks[p].push(c), missing[c]++);
  const hl: Record<number, Tone> = {};
  const order: number[] = [];
  const view = () =>
    graph(n, edges, {
      directed: true,
      hl,
      badges: Object.fromEntries(missing.map((m, i) => [i, hl[i] === 'done' ? '✓' : { en: `needs ${m}`, es: `faltan ${m}` }])),
      label: { en: 'arrow a → b means "a must be taken before b"', es: 'la flecha a → b significa "a debe tomarse antes que b"' },
    });
  t.add(
    'build',
    {
      en: 'For every course, count how many prerequisites it is still **missing** (the number of arrows pointing at it).',
      es: 'Para cada curso, cuenta cuántos prerrequisitos le **faltan** todavía (el número de flechas que apuntan hacia él).',
    },
    view(), vars({ 'ready to take': [] }));
  const ready: number[] = [];
  for (let c = 0; c < n; c++) if (missing[c] === 0) (ready.push(c), (hl[c] = 'compare'));
  t.add('ready', ready.length
      ? { en: `Courses missing nothing (${ready.join(', ')}) can be taken immediately.`, es: `Los cursos a los que no les falta nada (${ready.join(', ')}) se pueden tomar de inmediato.` }
      : { en: 'No course is free of prerequisites — nothing can ever start.', es: 'Ningún curso está libre de prerrequisitos — nada puede empezar nunca.' }, view(), vars({ 'ready to take': ready }));
  while (ready.length) {
    const c = ready.pop()!;
    order.push(c);
    hl[c] = 'done';
    const freed: number[] = [];
    for (const nx of unlocks[c]) {
      missing[nx]--;
      if (missing[nx] === 0) (ready.push(nx), (hl[nx] = 'compare'), freed.push(nx));
    }
    t.add(
      unlocks[c].length ? 'unlock' : 'take',
      {
        en: `Take course ${c}. ${unlocks[c].length ? `Each course that depended on it (${unlocks[c].join(', ')}) needs one prerequisite fewer.${freed.length ? ` Now ready: ${freed.join(', ')}.` : ''}` : 'Nothing depends on it.'}`,
        es: `Toma el curso ${c}. ${unlocks[c].length ? `A cada curso que dependía de él (${unlocks[c].join(', ')}) le falta un prerrequisito menos.${freed.length ? ` Ya están listos: ${freed.join(', ')}.` : ''}` : 'Nada depende de él.'}`,
      },
      view(), vars({ 'ready to take': ready, 'order taken': order }));
  }
  const stuck = missing.map((m, i) => (hl[i] === 'done' ? -1 : i)).filter((i) => i >= 0);
  for (const s of stuck) hl[s] = 'bad';
  t.add('done', stuck.length
      ? {
          en: `Nothing is ready, but courses ${stuck.join(', ')} were never taken: each is waiting on another one of them — a **cycle**. Answer: **false**.`,
          es: `Nada está listo, pero los cursos ${stuck.join(', ')} nunca se tomaron: cada uno espera a otro de ellos — un **ciclo**. Respuesta: **false**.`,
        }
      : {
          en: `All ${n} courses were taken, in the order [${order.join(', ')}] — a valid **topological order**. Answer: **true**.`,
          es: `Se tomaron los ${n} cursos, en el orden [${order.join(', ')}] — un **orden topológico** válido. Respuesta: **true**.`,
        }, view(), vars({ 'order taken': order }));
  return t.frames;
}

export const courses: Problem = {
  id: 'courses',
  title: { en: 'Course schedule (can all courses be finished?)', es: 'Course Schedule (¿se pueden terminar todos los cursos?)' },
  difficulty: 'Medium',
  statement: [
    {
      en: 'There are `n` courses numbered `0…n−1`. `prerequisites[i] = [course, pre]` means you must take `pre` **before** `course`. Return `true` if it is possible to finish every course.',
      es: 'Hay `n` cursos numerados `0…n−1`. `prerequisites[i] = [course, pre]` significa que debes tomar `pre` **antes** que `course`. Devuelve `true` si es posible terminar todos los cursos.',
    },
  ],
  examples: [
    { input: 'n = 2, prerequisites = [[1, 0]]', output: 'true', why: { en: 'Take 0, then 1.', es: 'Toma 0 y luego 1.' } },
    { input: 'n = 2, prerequisites = [[1, 0], [0, 1]]', output: 'false', why: { en: 'Each course requires the other.', es: 'Cada curso requiere al otro.' } },
  ],
  insight: {
    en: 'Something can go first only if nothing has to come before it. So: count, for every course, how many prerequisites it is missing. Take any course whose count is zero, then **decrement the count of the courses it unlocks** — some of those drop to zero and become takeable. If you run out of zero-count courses before taking everything, the leftovers are waiting on each other in a cycle. Following arrows from a taken course (rather than rescanning the whole list) is what makes it linear.',
    es: 'Algo puede ir primero solo si nada tiene que ir antes. Así que: cuenta, para cada curso, cuántos prerrequisitos le faltan. Toma cualquier curso cuyo conteo sea cero y luego **decrementa el conteo de los cursos que desbloquea** — algunos bajan a cero y se pueden tomar. Si te quedas sin cursos con conteo cero antes de tomarlos todos, los que quedan se esperan entre sí en un ciclo. Seguir las flechas desde un curso tomado (en lugar de volver a recorrer toda la lista) es lo que lo hace lineal.',
  },
  approaches: [
    { id: 'rescan', label: { en: 'Repeatedly rescan for a ready course', es: 'Volver a buscar una y otra vez un curso listo' }, kind: 'brute', fn: canFinishRescan, time: 'O(V² · E)', space: 'O(V)', note: {
        en: 'Same idea, without the bookkeeping: every round re-checks every course against the entire prerequisite list.',
        es: 'La misma idea, sin la contabilidad: cada ronda vuelve a comprobar cada curso contra toda la lista de prerrequisitos.',
      },
    },
    { id: 'kahn', label: { en: 'Topological sort (Kahn’s algorithm)', es: 'Ordenamiento topológico (algoritmo de Kahn)' }, kind: 'optimal', fn: canFinish, time: 'O(V + E)', space: 'O(V + E)', note: {
        en: 'Each course enters the ready list once; each prerequisite pair is processed once. The order in which courses are taken is a topological order.',
        es: 'Cada curso entra a la lista de listos una vez; cada par de prerrequisitos se procesa una vez. El orden en que se toman los cursos es un orden topológico.',
      },
    },
  ],
  code,
  cases: [
    { name: { en: 'simple chain', es: 'cadena simple' }, args: [2, [[1, 0]]], expected: true },
    { name: { en: 'two-course cycle', es: 'ciclo de dos cursos' }, args: [2, [[1, 0], [0, 1]]], expected: false },
    { name: { en: 'no prerequisites', es: 'sin prerrequisitos' }, args: [3, []], expected: true },
    { name: { en: 'single course', es: 'un solo curso' }, args: [1, []], expected: true },
    { name: { en: 'zero courses', es: 'cero cursos' }, args: [0, []], expected: true },
    { name: { en: 'diamond', es: 'diamante' }, args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true },
    { name: { en: 'cycle of three', es: 'ciclo de tres' }, args: [3, [[0, 1], [1, 2], [2, 0]]], expected: false },
    { name: { en: 'cycle plus independent courses', es: 'ciclo más cursos independientes' }, args: [5, [[1, 0], [2, 1], [1, 2], [4, 3]]], expected: false },
    { name: { en: 'long chain listed backwards', es: 'cadena larga listada al revés' }, args: [4, [[3, 2], [2, 1], [1, 0]]], expected: true },
    { name: { en: 'duplicate prerequisite pairs', es: 'pares de prerrequisitos duplicados' }, args: [2, [[1, 0], [1, 0]]], expected: true },
  ],
  bench: {
    sizes: [50, 200, 500, 2000],
    nLabel: { en: 'number of courses (one long chain)', es: 'número de cursos (una cadena larga)' },
    gen: (n) => (n < 20 ? [n, Array.from({ length: randInt(0, n) }, () => [randInt(0, n - 1), randInt(0, n - 1)]).filter(([a, b]) => a !== b)] : [n, Array.from({ length: n - 1 }, (_, i) => [i, i + 1])]),
  },
  demo: {
    inputs: [
      { name: 'n (courses 0…n−1)', value: '6' },
      { name: 'prerequisites [course, pre]', value: '[[1, 0], [2, 0], [3, 1], [3, 2], [4, 3], [5, 3]]' },
    ],
    validate: (n, edges) => edgesErr(n, edges),
    traces: { kahn: trace },
  },
};
