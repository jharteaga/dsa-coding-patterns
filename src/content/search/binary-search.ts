import type { Pattern } from '../../types';
import { classicSearch } from './classic-search';
import { findRangeProblem } from './find-range';

export const binarySearch: Pattern = {
  id: 'binary-search',
  group: 'Search',
  order: 1,
  title: { en: 'Linear vs Binary Search', es: 'Búsqueda lineal vs. búsqueda binaria' },
  tagline: {
    en: 'If the data is sorted, never look at every element — halve the search space instead.',
    es: 'Si los datos están ordenados, nunca revises cada elemento: mejor parte el espacio de búsqueda a la mitad.',
  },
  cues: [
    {
      en: 'gives you a **sorted** array (or says "ascending", "non-decreasing")',
      es: 'te da un arreglo **ordenado** (o dice "ascendente", "no decreciente")',
    },
    {
      en: 'asks you to **find** a value, or the first / last position where something is true',
      es: 'te pide **encontrar** un valor, o la primera / última posición donde algo se cumple',
    },
    { en: 'asks for better than O(n), or explicitly for **O(log n)**', es: 'pide algo mejor que O(n), o explícitamente **O(log n)**' },
    {
      en: 'has huge input sizes (10⁵ – 10⁹) where even one pass feels too slow',
      es: 'tiene entradas enormes (10⁵ – 10⁹) donde incluso una sola pasada parece demasiado lenta',
    },
  ],
  model: [
    {
      en: 'Think of looking up a word in a paper dictionary. You do not read page 1, then page 2… You open it in the middle, see whether your word comes before or after, and throw away half the book. Then you repeat on the half that is left.',
      es: 'Piensa en buscar una palabra en un diccionario de papel. No lees la página 1, luego la 2… Lo abres por la mitad, ves si tu palabra va antes o después y descartas la mitad del libro. Luego repites con la mitad que queda.',
    },
    {
      en: 'That works only because the dictionary is **sorted**: one look at the middle tells you something about *every* page on one side. Linear search cannot do this — each comparison rules out just one element.',
      es: 'Eso solo funciona porque el diccionario está **ordenado**: un vistazo al medio te dice algo sobre *todas* las páginas de un lado. La búsqueda lineal no puede hacer esto: cada comparación descarta un solo elemento.',
    },
    {
      en: 'In code you keep two indices, `lo` and `hi`, that fence in the part of the array where the answer can still be. Each step you look at `mid`, then move `lo` or `hi` past it. When `lo` passes `hi` the fence is empty and the target is not there.',
      es: 'En código mantienes dos índices, `lo` y `hi`, que encierran la parte del arreglo donde todavía puede estar la respuesta. En cada paso miras `mid` y luego mueves `lo` o `hi` más allá de él. Cuando `lo` rebasa a `hi`, el rango queda vacío y el objetivo no está.',
    },
    {
      en: 'Halving n elements until one is left takes log₂(n) steps: 1,000 → 10 steps, 1,000,000 → 20 steps, 1,000,000,000 → 30 steps.',
      es: 'Partir n elementos a la mitad hasta que quede uno toma log₂(n) pasos: 1,000 → 10 pasos, 1,000,000 → 20 pasos, 1,000,000,000 → 30 pasos.',
    },
  ],
  template: `lo = 0, hi = n - 1
while lo <= hi:
    mid = lo + (hi - lo) / 2        # avoids overflow of (lo + hi) in typed languages
    if a[mid] == target: return mid
    if a[mid] <  target: lo = mid + 1   # answer is to the right
    else:                hi = mid - 1   # answer is to the left
return -1                             # search space is empty`,
  problems: [classicSearch, findRangeProblem],
  quiz: [
    {
      q: {
        en: 'Given a sorted array of 10 million user IDs, check whether a given ID exists.',
        es: 'Dado un arreglo ordenado de 10 millones de IDs de usuario, verifica si existe un ID dado.',
      },
      why: {
        en: '“Sorted” + “find a value” is the classic binary-search signal: O(log n) instead of scanning all 10 million.',
        es: '“Ordenado” + “encontrar un valor” es la señal clásica de búsqueda binaria: O(log n) en vez de recorrer los 10 millones.',
      },
    },
    {
      q: {
        en: 'Given a sorted array with duplicates, return the first and last index of a target value in O(log n).',
        es: 'Dado un arreglo ordenado con duplicados, devuelve el primer y el último índice de un valor objetivo en O(log n).',
      },
      why: {
        en: 'Sorted input and an explicit O(log n) requirement: two binary searches, one for each boundary.',
        es: 'Entrada ordenada y un requisito explícito de O(log n): dos búsquedas binarias, una para cada frontera.',
      },
    },
  ],
};
