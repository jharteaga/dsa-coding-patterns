import type { Pattern } from '../../types';
import { koko } from './koko';
import { rotatedSearch } from './rotated-search';

export const modifiedBinarySearch: Pattern = {
  id: 'modified-binary-search',
  group: 'Search',
  order: 2,
  title: { en: 'Modified Binary Search', es: 'Búsqueda binaria modificada' },
  tagline: {
    en: 'Binary search works on anything you can cut in half and confidently throw one half away.',
    es: 'La búsqueda binaria funciona con cualquier cosa que puedas partir a la mitad y descartar una mitad con seguridad.',
  },
  cues: [
    {
      en: 'has an array that is "almost" sorted: **rotated**, or going up then down (a peak / mountain)',
      es: 'tiene un arreglo "casi" ordenado: **rotado**, o que sube y luego baja (un pico / montaña)',
    },
    {
      en: 'asks for the **minimum** (or maximum) value that satisfies a condition — "smallest speed", "least capacity", "fewest days"',
      es: 'pide el valor **mínimo** (o máximo) que cumple una condición: "menor velocidad", "menor capacidad", "menos días"',
    },
    {
      en: 'lets you easily *check* a candidate answer, and bigger candidates are always at least as good as smaller ones (or vice versa)',
      es: 'te permite *comprobar* fácilmente una respuesta candidata, y los candidatos más grandes siempre son al menos tan buenos como los más pequeños (o viceversa)',
    },
    {
      en: 'has an answer range far too large to try one by one (up to 10⁹)',
      es: 'tiene un rango de respuestas demasiado grande para probarlas una por una (hasta 10⁹)',
    },
  ],
  model: [
    {
      en: 'Binary search needs just one thing: a question whose answer lets you discard half of the remaining candidates. A fully sorted array is only the simplest case.',
      es: 'La búsqueda binaria solo necesita una cosa: una pregunta cuya respuesta te permita descartar la mitad de los candidatos restantes. Un arreglo totalmente ordenado es solo el caso más simple.',
    },
    {
      en: '**Almost-sorted arrays.** In a rotated array, one of the two halves around `mid` is always still sorted. A sorted half has a known range of values, so you can tell whether the target is inside it. If yes, search there; if not, search the other half.',
      es: '**Arreglos casi ordenados.** En un arreglo rotado, una de las dos mitades alrededor de `mid` siempre sigue ordenada. Una mitad ordenada tiene un rango de valores conocido, así que puedes saber si el objetivo está dentro. Si sí, busca ahí; si no, busca en la otra mitad.',
    },
    {
      en: '**Searching the answer instead of the input.** Many "find the minimum X such that…" problems hide a sorted sequence: the candidate answers. If X = 10 works, then 11, 12, 13… work too. So across all candidates the check reads "no, no, no, yes, yes, yes". Binary search finds the first "yes".',
      es: '**Buscar en la respuesta en lugar de en la entrada.** Muchos problemas de "encuentra el mínimo X tal que…" esconden una secuencia ordenada: las respuestas candidatas. Si X = 10 funciona, entonces 11, 12, 13… también funcionan. Así que, a lo largo de todos los candidatos, la comprobación dice "no, no, no, sí, sí, sí". La búsqueda binaria encuentra el primer "sí".',
    },
    {
      en: 'The recipe for that second kind: (1) decide the smallest and largest possible answer, (2) write `works(x)` that checks one candidate, (3) binary search for the boundary. The total cost is (cost of one check) × log(range).',
      es: 'La receta para ese segundo tipo: (1) decide la respuesta más pequeña y la más grande posibles, (2) escribe `works(x)` que compruebe un candidato, (3) haz búsqueda binaria de la frontera. El costo total es (costo de una comprobación) × log(rango).',
    },
  ],
  template: `# Find the smallest x in [lo, hi] for which works(x) is true.
# Requires: works is false, false, ..., true, true (it flips only once).
while lo < hi:
    mid = lo + (hi - lo) / 2
    if works(mid): hi = mid        # mid might be the answer: keep it
    else:          lo = mid + 1    # mid is too small: discard it
return lo`,
  problems: [rotatedSearch, koko],
  quiz: [
    {
      q: {
        en: 'A sorted array was rotated at an unknown point. Find a target value in O(log n).',
        es: 'Un arreglo ordenado se rotó en un punto desconocido. Encuentra un valor objetivo en O(log n).',
      },
      why: {
        en: 'Rotated-sorted input + O(log n): one half around mid is always sorted, so you can still discard half each step.',
        es: 'Entrada ordenada y rotada + O(log n): una mitad alrededor de mid siempre está ordenada, así que todavía puedes descartar la mitad en cada paso.',
      },
    },
    {
      q: {
        en: 'A conveyor belt must ship all packages within D days. Find the least weight capacity of the ship that makes this possible.',
        es: 'Una banda transportadora debe enviar todos los paquetes en D días. Encuentra la menor capacidad de peso del barco que lo haga posible.',
      },
      why: {
        en: '“Least capacity such that…” — checking one capacity is easy and larger capacities always work, so binary search the answer.',
        es: '“Menor capacidad tal que…”: comprobar una capacidad es fácil y las capacidades mayores siempre funcionan, así que haz búsqueda binaria sobre la respuesta.',
      },
    },
    {
      q: {
        en: 'An array increases and then decreases. Find the index of the peak element in O(log n).',
        es: 'Un arreglo crece y luego decrece. Encuentra el índice del elemento pico en O(log n).',
      },
      why: {
        en: 'Compare mid with its neighbour: if rising, the peak is to the right, otherwise to the left. Half is discarded each step.',
        es: 'Compara mid con su vecino: si va subiendo, el pico está a la derecha; si no, a la izquierda. Se descarta la mitad en cada paso.',
      },
    },
  ],
};
