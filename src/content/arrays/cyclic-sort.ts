import type { Pattern } from '../../types';
import { disappeared } from './disappeared';
import { missingNumberProblem } from './missing-number';

export const cyclicSort: Pattern = {
  id: 'cyclic-sort',
  group: 'Arrays',
  order: 4,
  title: { en: 'Cyclic Sort', es: 'Cyclic Sort (ordenamiento cíclico)' },
  tagline: { en: 'When the values are the numbers 1…n, every value already knows which index it belongs at.', es: 'Cuando los valores son los números 1…n, cada valor ya sabe en qué índice le toca estar.' },
  cues: [
    { en: 'says the array contains numbers **in the range 1 to n** (or 0 to n) where n is the array length', es: 'dice que el arreglo contiene números **en el rango de 1 a n** (o de 0 a n), donde n es la longitud del arreglo' },
    { en: 'asks for the **missing** number(s), the **duplicate** number(s), or the "first missing positive"', es: 'pide el o los números **faltantes**, el o los números **duplicados**, o el "primer positivo faltante"' },
    { en: 'demands **O(n) time and O(1) extra space** — ruling out both sorting and a hash set', es: 'exige **tiempo O(n) y espacio extra O(1)**, lo que descarta tanto ordenar como usar un conjunto hash' },
  ],
  model: [
    { en: 'Normally sorting needs comparisons, which costs O(n log n). But if you are told the values are exactly the numbers 1…n, you do not need to compare anything: the number 5 belongs at index 4, full stop.', es: 'Normalmente ordenar requiere comparaciones, lo que cuesta O(n log n). Pero si te dicen que los valores son exactamente los números 1…n, no necesitas comparar nada: el número 5 va en el índice 4, punto.' },
    { en: 'So walk the array. If the number at index `i` is not in its home slot, swap it into its home. Do **not** advance `i` — the swap brought a new number to index `i` that may also need sending home. Only move on when index `i` holds the right number (or a duplicate / out-of-range value that cannot be placed).', es: 'Así que recorre el arreglo. Si el número en el índice `i` no está en su casilla, intercámbialo para mandarlo a su casilla. **No** avances `i`: el intercambio trajo un número nuevo al índice `i` que quizá también haya que mandar a su lugar. Avanza solo cuando el índice `i` tenga el número correcto (o un duplicado / un valor fuera de rango que no se puede colocar).' },
    { en: 'It looks like it could loop for a long time, but every swap puts one number into its final position, and a number that is home never moves again. So there are at most n swaps in total: O(n).', es: 'Parece que podría quedarse dando vueltas mucho tiempo, pero cada intercambio deja un número en su posición final, y un número que ya está en su casilla no vuelve a moverse. Así que hay como máximo n intercambios en total: O(n).' },
    { en: 'After this pass the array is a "who showed up" chart. Any index holding the wrong number points at a missing value (the index) and a duplicate or stray value (what is sitting there).', es: 'Después de esta pasada el arreglo es una "lista de asistencia". Cualquier índice con el número equivocado señala un valor faltante (el índice) y un valor duplicado o fuera de lugar (lo que está ahí).' },
  ],
  template: `i = 0
while i < n:
    home = a[i] - 1                  # (or a[i] if the range starts at 0)
    if a[i] is in range and a[i] != a[home]:
        swap(a[i], a[home])          # do NOT advance i
    else:
        i += 1
# now: a[j] != j + 1  means  j + 1 is missing (and a[j] is a duplicate/stray)`,
  problems: [missingNumberProblem, disappeared],
  quiz: [
    { q: { en: 'An array of n + 1 integers contains only values from 1 to n. Find the one duplicated number using constant extra space.', es: 'Un arreglo de n + 1 enteros contiene solo valores de 1 a n. Encuentra el único número duplicado usando espacio extra constante.' }, why: { en: 'Values in the range 1…n + “constant space” — place each value at its own index; the one that finds its slot occupied is the duplicate.', es: 'Valores en el rango 1…n + “espacio constante”: coloca cada valor en su propio índice; el que encuentra su casilla ocupada es el duplicado.' } },
    { q: { en: 'Given an unsorted array, find the smallest positive integer that is missing, in O(n) time and O(1) space.', es: 'Dado un arreglo sin ordenar, encuentra el menor entero positivo que falta, en tiempo O(n) y espacio O(1).' }, why: { en: 'The answer must be in 1…n+1, so send each value in that range to its home index and scan for the first mismatch.', es: 'La respuesta tiene que estar en 1…n+1, así que manda cada valor de ese rango a su índice y busca la primera discordancia.' } },
  ],
};
