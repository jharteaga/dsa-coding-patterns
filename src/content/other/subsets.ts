import code from './subsets.ts?code';
import { numsErr } from '../../lib/check';
import { Tracer, arr, mark, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region cascade
export function subsetsCascade(nums: number[]): number[][] {
  let result: number[][] = [[]]; // start with just the empty subset
  for (const x of nums) {
    // Every existing subset spawns a copy that also contains x.
    result = [...result, ...result.map((subset) => [...subset, x])];
  }
  return result;
}
// #endregion

// #region backtrack
export function subsets(nums: number[]): number[][] {
  const result: number[][] = [];
  const current: number[] = [];

  // Decide, for nums[i], nums[i+1], ...: is it in the subset or not?
  const decide = (i: number): void => {
    if (i === nums.length) {
      result.push([...current]); // every decision made: record a copy // @record
      return;
    }
    current.push(nums[i]); // choice 1: include nums[i] // @include
    decide(i + 1);
    current.pop(); // undo the choice (backtrack)... // @undo
    decide(i + 1); // ...choice 2: exclude nums[i] // @exclude
  };

  decide(0);
  return result; // @done
}
// #endregion

function trace(nums: number[]) {
  const t = new Tracer();
  const result: number[][] = [];
  const current: number[] = [];
  const choice: ('in' | 'out' | undefined)[] = nums.map(() => undefined);
  const views = (i: number) => [
    arr(nums, { label: { en: 'nums — green = included, red = excluded, white = not decided yet', es: 'nums: verde = incluido, rojo = excluido, blanco = aún sin decidir' }, pointers: i < nums.length ? { i } : {}, hl: Object.fromEntries(choice.map((c, k) => [k, c === 'in' ? 'good' : c === 'out' ? 'bad' : 'none'])) as never }),
    arr(current, { label: { en: 'current subset being built', es: 'subconjunto actual en construcción' }, hl: mark('window', ...current.map((_, k) => k)) }),
    vars({ 'subsets found': result.length, latest: result.slice(-4).map((s) => `[${s.join(',')}]`).join(' ') || '—' }),
  ];
  const decide = (i: number) => {
    if (i === nums.length) {
      result.push([...current]);
      t.add('record', { en: `A decision has been made for every element. Record **[${current.join(', ')}]**.`, es: `Ya se tomó una decisión para cada elemento. Registra **[${current.join(', ')}]**.` }, ...views(i));
      return;
    }
    choice[i] = 'in';
    current.push(nums[i]);
    t.add('include', { en: `Element ${nums[i]}: first try **including** it.`, es: `Elemento ${nums[i]}: primero intenta **incluirlo**.` }, ...views(i));
    decide(i + 1);
    current.pop();
    choice[i] = 'out';
    t.add('undo', { en: `Back at ${nums[i]}: every subset that includes it (with the earlier choices fixed) is done. **Undo** the choice and try **excluding** it.`, es: `De vuelta en ${nums[i]}: ya están todos los subconjuntos que lo incluyen (con las elecciones anteriores fijas). **Deshaz** la elección e intenta **excluirlo**.` }, ...views(i));
    decide(i + 1);
    choice[i] = undefined;
  };
  decide(0);
  t.add('done', { en: `Each element had 2 options, so there are 2 × 2 × … = 2^${nums.length} = **${result.length} subsets**.`, es: `Cada elemento tenía 2 opciones, así que hay 2 × 2 × … = 2^${nums.length} = **${result.length} subconjuntos**.` }, arr(nums, { label: 'nums' }), vars({ 'all subsets': result.map((s) => `[${s.join(',')}]`).join(' ') }));
  return t.frames;
}

const canonical = (sets: number[][]) => sets.map((s) => [...s].sort((a, b) => a - b)).sort((a, b) => a.length - b.length || a.join(',').localeCompare(b.join(',')));

export const subsetsProblem: Problem = {
  id: 'subsets',
  title: { en: 'All subsets (the power set)', es: 'Todos los subconjuntos (el conjunto potencia)' },
  difficulty: 'Medium',
  statement: [
    { en: 'Given an array of **distinct** integers, return all possible subsets, including the empty one. Order does not matter (the tests sort the result before comparing).', es: 'Dado un arreglo de enteros **distintos**, devuelve todos los subconjuntos posibles, incluido el vacío. El orden no importa (las pruebas ordenan el resultado antes de comparar).' },
  ],
  examples: [{ input: 'nums = [1, 2, 3]', output: '[[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]' }],
  insight:
    { en: 'There is no shortcut here: n elements have 2ⁿ subsets and you must output all of them, so both approaches are optimal. What matters is the **way of thinking**. Building a subset is a sequence of yes/no decisions, one per element. Backtracking walks that decision tree depth-first with a single shared `current` list: choose, recurse, **undo**, choose the other option. That choose → explore → undo skeleton solves permutations, combinations, N-Queens, Sudoku and word search with minor changes.', es: 'Aquí no hay atajo: n elementos tienen 2ⁿ subconjuntos y debes devolverlos todos, así que ambos enfoques son óptimos. Lo que importa es la **forma de pensar**. Construir un subconjunto es una secuencia de decisiones sí/no, una por elemento. El backtracking recorre ese árbol de decisiones en profundidad con una sola lista `current` compartida: elige, haz recursión, **deshaz**, elige la otra opción. Ese esqueleto elegir → explorar → deshacer resuelve permutaciones, combinaciones, N reinas, Sudoku y búsqueda de palabras con cambios menores.' },
  approaches: [
    { id: 'cascade', label: { en: 'Iterative doubling', es: 'Duplicación iterativa' }, kind: 'optimal', fn: subsetsCascade, time: 'O(n · 2ⁿ)', space: 'O(n · 2ⁿ)', note: { en: 'Start with [[]]. For each new element, copy every subset found so far and add the element to the copies. The list doubles n times.', es: 'Empieza con [[]]. Por cada elemento nuevo, copia cada subconjunto encontrado hasta ahora y agrega el elemento a las copias. La lista se duplica n veces.' } },
    { id: 'backtrack', label: { en: 'Backtracking (include / exclude)', es: 'Backtracking (incluir / excluir)' }, kind: 'optimal', fn: subsets, time: 'O(n · 2ⁿ)', space: 'O(n) + output', note: { en: 'One `current` array is reused for the whole search; only finished subsets are copied. Apart from the output it needs just O(n) memory for the recursion.', es: 'Un solo arreglo `current` se reutiliza en toda la búsqueda; solo se copian los subconjuntos terminados. Aparte de la salida, solo necesita O(n) de memoria para la recursión.' } },
  ],
  code,
  adapt: { out: canonical },
  cases: [
    { name: { en: 'three elements', es: 'tres elementos' }, args: [[1, 2, 3]], expected: canonical([[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]) },
    { name: { en: 'empty input → only the empty subset', es: 'entrada vacía → solo el subconjunto vacío' }, args: [[]], expected: [[]] },
    { name: { en: 'single element', es: 'un solo elemento' }, args: [[5]], expected: [[], [5]] },
    { name: { en: 'two elements', es: 'dos elementos' }, args: [[1, 2]], expected: canonical([[], [1], [2], [1, 2]]) },
    { name: { en: 'negative numbers', es: 'números negativos' }, args: [[-1, 0]], expected: canonical([[], [-1], [0], [-1, 0]]) },
    { name: { en: 'unsorted input', es: 'entrada sin ordenar' }, args: [[3, 1]], expected: canonical([[], [1], [3], [1, 3]]) },
    { name: { en: 'four elements → 16 subsets', es: 'cuatro elementos → 16 subconjuntos' }, args: [[1, 2, 3, 4]], expected: canonical([[], [1], [2], [3], [4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4], [1, 2, 3], [1, 2, 4], [1, 3, 4], [2, 3, 4], [1, 2, 3, 4]]) },
    { name: { en: 'large values', es: 'valores grandes' }, args: [[100, 200]], expected: canonical([[], [100], [200], [100, 200]]) },
  ],
  bench: { sizes: [4, 8, 12, 16, 18], nLabel: { en: 'number of elements (output doubles with each one)', es: 'número de elementos (la salida se duplica con cada uno)' }, gen: (n) => [Array.from({ length: Math.min(n, 18) }, (_, i) => i)] },
  demo: {
    inputs: [{ name: 'nums (distinct)', value: '[1, 2, 3]' }],
    validate: (nums) => numsErr(nums, 4, 'nums', 1) ?? (new Set(nums).size !== nums.length ? { en: 'Values must be distinct.', es: 'Los valores deben ser distintos.' } : null),
    traces: { backtrack: trace },
  },
};
