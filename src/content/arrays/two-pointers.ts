import type { Pattern } from '../../types';
import { pairSumProblem } from './pair-sum';
import { sortedSquaresProblem } from './sorted-squares';

export const twoPointers: Pattern = {
  id: 'two-pointers',
  group: 'Arrays',
  order: 1,
  title: { en: 'Two Pointers', es: 'Dos punteros' },
  tagline: { en: 'Two indices walking through a sorted array replace a pair of nested loops.', es: 'Dos índices que recorren un arreglo ordenado reemplazan un par de bucles anidados.' },
  cues: [
    { en: 'gives a **sorted** array (or one you are allowed to sort) and asks about **pairs or triplets** — sum equals / closest to / less than a target', es: 'da un arreglo **ordenado** (o uno que puedes ordenar) y pregunta por **pares o tripletas**: suma igual a / más cercana a / menor que un objetivo' },
    { en: 'asks to modify an array **in place**: remove duplicates, move zeros, partition by a value', es: 'pide modificar un arreglo **en el lugar**: quitar duplicados, mover ceros, particionar según un valor' },
    { en: 'compares elements from both ends: palindromes, reversing, "container with most water"', es: 'compara elementos desde ambos extremos: palíndromos, invertir, "contenedor con más agua"' },
    { en: 'has an obvious O(n²) "try every pair" solution and wants O(n)', es: 'tiene una solución obvia O(n²) de "probar cada par" y quiere O(n)' },
  ],
  model: [
    { en: 'The brute force for any "find a pair" problem is two nested loops: for each element, try every other element. That is n² pairs.', es: 'La fuerza bruta para cualquier problema de "encontrar un par" son dos bucles anidados: para cada elemento, prueba con cada uno de los demás. Eso son n² pares.' },
    { en: 'Two pointers works when you can look at one pair and learn something about **many other pairs at once**. In a sorted array, if `a[left] + a[right]` is too small, then `a[left]` plus anything smaller than `a[right]` is also too small — a whole row of pairs is ruled out by one comparison.', es: 'Dos punteros funciona cuando puedes mirar un par y aprender algo sobre **muchos otros pares a la vez**. En un arreglo ordenado, si `a[left] + a[right]` es demasiado pequeño, entonces `a[left]` más cualquier cosa menor que `a[right]` también es demasiado pequeño: una fila entera de pares queda descartada con una sola comparación.' },
    { en: 'So each step moves one pointer and permanently discards one element. Two pointers that only move toward each other can make at most n moves in total: O(n).', es: 'Así que cada paso mueve un puntero y descarta un elemento para siempre. Dos punteros que solo se mueven uno hacia el otro pueden hacer como máximo n movimientos en total: O(n).' },
    { en: 'There are two flavours. **Opposite ends** (this page): start at both ends and move inward — pair sums, palindromes. **Same direction**: a "read" pointer scans ahead while a "write" pointer marks where the next kept element goes — removing duplicates in place.', es: 'Hay dos variantes. **Extremos opuestos** (esta página): empieza en ambos extremos y avanza hacia el centro: sumas de pares, palíndromos. **Misma dirección**: un puntero de "lectura" va adelante mientras un puntero de "escritura" marca dónde va el siguiente elemento que se conserva: quitar duplicados en el lugar.' },
    { en: 'If the input is not sorted, sorting it first costs O(n log n), which is still far better than O(n²).', es: 'Si la entrada no está ordenada, ordenarla primero cuesta O(n log n), que sigue siendo mucho mejor que O(n²).' },
  ],
  template: `left = 0, right = n - 1
while left < right:
    value = combine(a[left], a[right])
    if value == target:   return answer
    if value <  target:   left += 1     # need more: drop the small end
    else:                 right -= 1    # need less: drop the large end`,
  problems: [pairSumProblem, sortedSquaresProblem],
  quiz: [
    { q: { en: 'Given a sorted array, find three numbers whose sum is closest to a target value.', es: 'Dado un arreglo ordenado, encuentra tres números cuya suma sea la más cercana a un valor objetivo.' }, why: { en: 'Sorted input + sums of elements: fix one number and sweep the rest with two pointers from both ends.', es: 'Entrada ordenada + sumas de elementos: fija un número y recorre el resto con dos punteros desde ambos extremos.' } },
    { q: { en: 'Given a sorted array, remove the duplicates in place and return the new length, using O(1) extra memory.', es: 'Dado un arreglo ordenado, quita los duplicados en el lugar y devuelve la nueva longitud, usando O(1) de memoria extra.' }, why: { en: 'In-place modification of a sorted array: one pointer reads, one pointer writes.', es: 'Modificación en el lugar de un arreglo ordenado: un puntero lee y otro escribe.' } },
    { q: { en: 'Check whether a string reads the same forwards and backwards, ignoring punctuation.', es: 'Comprueba si una cadena se lee igual al derecho y al revés, ignorando la puntuación.' }, why: { en: 'Comparing from both ends inward is the opposite-ends two-pointer movement.', es: 'Comparar desde ambos extremos hacia el centro es el movimiento de dos punteros en extremos opuestos.' } },
  ],
};
