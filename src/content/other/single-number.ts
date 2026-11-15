import code from './single-number.ts?code';
import { numsErr } from '../../lib/check';
import { shuffle } from '../../lib/ds';
import { Tracer, arr, mark, span, vars } from '../../lib/trace';
import type { Problem } from '../../types';

// #region brute
export function singleNumberBrute(nums: number[]): number {
  for (let i = 0; i < nums.length; i++) {
    let count = 0;
    for (let j = 0; j < nums.length; j++) {
      if (nums[j] === nums[i]) count++;
    }
    if (count === 1) return nums[i];
  }
  return -1;
}
// #endregion

// #region set
export function singleNumberSet(nums: number[]): number {
  const unpaired = new Set<number>();
  for (const x of nums) {
    if (unpaired.has(x)) unpaired.delete(x); // second sighting: its pair is complete
    else unpaired.add(x); // first sighting
  }
  return [...unpaired][0];
}
// #endregion

// #region xor
export function singleNumber(nums: number[]): number {
  let result = 0; // @init
  for (const x of nums) {
    result ^= x; // pairs cancel out: a ^ a = 0 // @xor
  }
  return result; // @done
}
// #endregion

function trace(nums: number[]) {
  const t = new Tracer();
  const bits = (x: number) => (x >>> 0).toString(2).padStart(6, '0').slice(-6);
  let result = 0;
  t.add('init', { en: 'XOR compares two numbers bit by bit: the result bit is 1 when the bits **differ**, 0 when they are the same. So any number XOR itself is 0, and any number XOR 0 is itself. Start with 0.', es: 'XOR compara dos números bit a bit: el bit del resultado es 1 cuando los bits **difieren** y 0 cuando son iguales. Así, cualquier número XOR sí mismo es 0, y cualquier número XOR 0 es él mismo. Empieza con 0.' }, arr(nums), vars({ result: 0, 'result in binary': bits(0) }));
  nums.forEach((x, i) => {
    const before = result;
    result ^= x;
    t.add('xor', {
        en: `${before} XOR ${x}: ${bits(before)} ⊕ ${bits(x)} = ${bits(result)} (= ${result}).${nums.indexOf(x) < i ? ` This is the second ${x} — it **cancels** the first one out of the result.` : ''}`,
        es: `${before} XOR ${x}: ${bits(before)} ⊕ ${bits(x)} = ${bits(result)} (es decir, ${result}).${nums.indexOf(x) < i ? ` Este es el segundo ${x}: **cancela** al primero en el resultado.` : ''}`,
      }, arr(nums, { pointers: { i }, hl: { ...span('muted', 0, i - 1), ...mark('active', i) } }), vars({ result, 'result in binary': bits(result) }));
  });
  t.add('done', { en: `Every pair cancelled itself. What remains is the number without a partner: **${result}**. One variable, one pass.`, es: `Cada pareja se canceló a sí misma. Lo que queda es el número sin pareja: **${result}**. Una variable, una pasada.` }, arr(nums, { hl: mark('good', nums.indexOf(result)) }), vars({ result }));
  return t.frames;
}

export const singleNumberProblem: Problem = {
  id: 'single-number',
  title: { en: 'Single number', es: 'Single Number (número único)' },
  difficulty: 'Easy',
  statement: [{ en: 'In a non-empty array every value appears **exactly twice**, except one value that appears once. Find it — in O(n) time and O(1) extra memory.', es: 'En un arreglo no vacío cada valor aparece **exactamente dos veces**, excepto un valor que aparece una sola vez. Encuéntralo en tiempo O(n) y con O(1) de memoria extra.' }],
  examples: [{ input: 'nums = [4, 1, 2, 1, 2]', output: '4' }],
  insight:
    { en: 'XOR (`^`) has three properties that make it a "cancelling" operation: `a ^ a = 0` (anything cancels itself), `a ^ 0 = a`, and the order of operations does not matter. So XOR all the numbers together: every pair annihilates no matter where its two members sit in the array, and the lone number is all that survives.', es: 'XOR (`^`) tiene tres propiedades que lo vuelven una operación que "cancela": `a ^ a = 0` (todo se cancela a sí mismo), `a ^ 0 = a`, y el orden de las operaciones no importa. Así que aplica XOR a todos los números juntos: cada pareja se anula sin importar dónde estén sus dos miembros en el arreglo, y el número solitario es lo único que sobrevive.' },
  approaches: [
    { id: 'brute', label: { en: 'Count each value', es: 'Contar cada valor' }, kind: 'brute', fn: singleNumberBrute, time: 'O(n²)', space: 'O(1)', note: { en: 'For each element, scan the whole array to count its copies.', es: 'Para cada elemento, recorre todo el arreglo para contar sus copias.' } },
    { id: 'set', label: { en: 'Hash set of unpaired values', es: 'Conjunto hash de valores sin pareja' }, kind: 'better', fn: singleNumberSet, time: 'O(n)', space: 'O(n)', note: { en: 'Add on first sight, remove on second. Linear time, but up to n/2 values in memory.', es: 'Agrega al verlo la primera vez, quita la segunda. Tiempo lineal, pero hasta n/2 valores en memoria.' } },
    { id: 'xor', label: { en: 'XOR everything', es: 'XOR de todo' }, kind: 'optimal', fn: singleNumber, time: 'O(n)', space: 'O(1)', note: { en: 'One integer of state. Works for negative numbers too.', es: 'Un solo entero de estado. Funciona también con números negativos.' } },
  ],
  code,
  cases: [
    { name: { en: 'classic example', es: 'ejemplo clásico' }, args: [[4, 1, 2, 1, 2]], expected: 4 },
    { name: { en: 'single element', es: 'un solo elemento' }, args: [[7]], expected: 7 },
    { name: { en: 'single is first', es: 'el único va primero' }, args: [[9, 3, 3]], expected: 9 },
    { name: { en: 'single is last', es: 'el único va al final' }, args: [[3, 3, 9]], expected: 9 },
    { name: { en: 'pairs not adjacent', es: 'parejas no adyacentes' }, args: [[1, 2, 3, 2, 1]], expected: 3 },
    { name: { en: 'negative numbers', es: 'números negativos' }, args: [[-1, -2, -1]], expected: -2 },
    { name: { en: 'the single number is zero', es: 'el número único es cero' }, args: [[5, 0, 5]], expected: 0 },
    { name: { en: 'large values', es: 'valores grandes' }, args: [[100000, 99999, 100000]], expected: 99999 },
    { name: { en: 'mixed signs', es: 'signos mezclados' }, args: [[-7, 7, -7, 8, 7]], expected: 8 },
  ],
  bench: {
    sizes: [101, 1001, 10_001, 30_001],
    nLabel: { en: 'array length', es: 'longitud del arreglo' },
    gen: (n) => {
      const pairs = Math.max(0, (n - 1) >> 1);
      return [shuffle([pairs + 1, ...Array.from({ length: pairs }, (_, i) => [i, i]).flat()])];
    },
  },
  demo: {
    inputs: [{ name: 'nums (all in pairs except one)', value: '[6, 3, 9, 3, 6, 12, 9]' }],
    validate: (nums) => {
      const e = numsErr(nums, 11, 'nums', 1);
      if (e) return e;
      const counts = new Map<number, number>();
      for (const x of nums as number[]) counts.set(x, (counts.get(x) ?? 0) + 1);
      const c = [...counts.values()];
      return (nums as number[]).some((x) => !Number.isInteger(x) || x < 0 || x > 63) ? { en: 'Use whole numbers from 0 to 63.', es: 'Usa números enteros de 0 a 63.' } : c.filter((k) => k === 1).length !== 1 || c.some((k) => k > 2) ? { en: 'Exactly one value must appear once; every other value must appear exactly twice.', es: 'Exactamente un valor debe aparecer una vez; todos los demás deben aparecer exactamente dos veces.' } : null;
    },
    traces: { xor: trace },
  },
};
