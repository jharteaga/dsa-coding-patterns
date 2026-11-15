import type { Pattern } from '../../types';
import { maxSubarrayProblem } from './max-subarray';
import { stock } from './stock';

export const kadane: Pattern = {
  id: 'kadane',
  group: 'Arrays',
  order: 5,
  title: { en: 'Kadane (running best)', es: 'Kadane (mejor acumulado)' },
  tagline: { en: 'Carry the best answer "ending here" as you walk — one pass instead of checking every subarray.', es: 'Lleva contigo la mejor respuesta "que termina aquí" mientras avanzas: una sola pasada en lugar de revisar cada subarreglo.' },
  cues: [
    { en: 'asks for the **maximum / minimum sum (or product) of a contiguous subarray**', es: 'pide la **suma (o producto) máxima / mínima de un subarreglo contiguo**' },
    { en: 'asks for the best **difference between a later and an earlier element** (buy low, sell high)', es: 'pide la mejor **diferencia entre un elemento posterior y uno anterior** (comprar barato, vender caro)' },
    { en: 'has an O(n²) brute force over all (start, end) pairs, and the answer at position i depends only on position i − 1', es: 'tiene una fuerza bruta O(n²) sobre todos los pares (inicio, fin), y la respuesta en la posición i depende solo de la posición i − 1' },
  ],
  model: [
    { en: 'There are about n²/2 subarrays, so checking each one is O(n²). Kadane’s algorithm avoids this by answering a narrower question at every index: *what is the best subarray that ends right here?*', es: 'Hay unos n²/2 subarreglos, así que revisar cada uno es O(n²). El algoritmo de Kadane lo evita respondiendo una pregunta más acotada en cada índice: *¿cuál es el mejor subarreglo que termina justo aquí?*' },
    { en: 'That question is easy, because a subarray ending at index i is either the element alone, or the element glued onto a subarray ending at i − 1. Naturally you would glue it onto the *best* one ending at i − 1 — and only if that best one is positive. A negative running total is baggage: drop it and start again.', es: 'Esa pregunta es fácil, porque un subarreglo que termina en el índice i es o bien el elemento solo, o bien el elemento pegado a un subarreglo que termina en i − 1. Naturalmente lo pegarías al *mejor* que termina en i − 1, y solo si ese mejor es positivo. Un total acumulado negativo es un lastre: suéltalo y empieza de nuevo.' },
    { en: 'So you carry one number, `current`, and update it with `current = max(x, current + x)`. The final answer is the largest `current` ever seen.', es: 'Así que llevas un solo número, `current`, y lo actualizas con `current = max(x, current + x)`. La respuesta final es el mayor `current` que hayas visto.' },
    { en: 'Many "single pass with a running best" problems have this exact skeleton: keep the best state up to now, combine it with the new element, update the global answer.', es: 'Muchos problemas de "una sola pasada con un mejor acumulado" tienen exactamente este esqueleto: guarda el mejor estado hasta ahora, combínalo con el nuevo elemento y actualiza la respuesta global.' },
  ],
  template: `current = a[0]; best = a[0]
for x in a[1:]:
    current = max(x, current + x)   # extend the run, or restart at x
    best    = max(best, current)
return best`,
  problems: [maxSubarrayProblem, stock],
  quiz: [
    { q: { en: 'Given an array of daily temperature changes (positive and negative), find the stretch of consecutive days with the largest total rise.', es: 'Dado un arreglo de cambios diarios de temperatura (positivos y negativos), encuentra el tramo de días consecutivos con la mayor subida total.' }, why: { en: 'Largest sum of a contiguous run with negatives present — Kadane: extend the run or restart at each element.', es: 'Mayor suma de un tramo contiguo con negativos presentes: Kadane, extiende el tramo o reinicia en cada elemento.' } },
    { q: { en: 'Given a circular array of integers, find the maximum possible sum of a non-empty contiguous subarray.', es: 'Dado un arreglo circular de enteros, encuentra la mayor suma posible de un subarreglo contiguo no vacío.' }, why: { en: 'Maximum subarray sum: run Kadane for the max and for the min (the wrap-around case is total − min subarray).', es: 'Suma máxima de subarreglo: ejecuta Kadane para el máximo y para el mínimo (el caso que da la vuelta es total − subarreglo mínimo).' } },
  ],
};
