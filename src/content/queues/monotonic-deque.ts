import type { Pattern } from '../../types';
import { windowMax } from './window-max';

export const monotonicDeque: Pattern = {
  id: 'monotonic-deque',
  group: 'Queues',
  order: 3,
  title: { en: 'Monotonic Queue / Deque', es: 'Cola / Deque monótona' },
  tagline: {
    en: 'Keep the maximum (or minimum) of a moving window available at all times in O(1).',
    es: 'Mantén el máximo (o mínimo) de una ventana móvil disponible en todo momento en O(1).',
  },
  cues: [
    { en: 'asks for the **maximum or minimum of every window** of size k', es: 'pide el **máximo o mínimo de cada ventana** de tamaño k' },
    {
      en: 'combines a **sliding window** with "largest/smallest inside it" — e.g. longest subarray where max − min ≤ limit',
      es: 'combina una **ventana deslizante** con "el mayor/menor dentro de ella"; p. ej., el subarreglo más largo donde max − min ≤ límite',
    },
    {
      en: 'optimises a DP where each state looks back at the best of the previous k states',
      es: 'optimiza una programación dinámica donde cada estado mira el mejor de los k estados anteriores',
    },
    { en: 'has an O(n·k) brute force that rescans each window', es: 'tiene una fuerza bruta O(n·k) que vuelve a recorrer cada ventana' },
  ],
  model: [
    {
      en: 'A **deque** (double-ended queue, pronounced "deck") lets you add and remove at both ends in O(1). A monotonic deque is a deque kept in sorted order, used to answer "what is the biggest thing in my window right now?"',
      es: 'Un **deque** (cola de doble extremo, se pronuncia "dek") te permite agregar y quitar en ambos extremos en O(1). Un deque monótono es un deque que se mantiene ordenado, y sirve para responder "¿qué es lo más grande en mi ventana ahora mismo?"',
    },
    {
      en: 'Think of a sports team’s depth chart. When a new player arrives who is better than some existing players *and* younger, those players will never start again — cut them. The remaining list is ordered: best (and oldest) first.',
      es: 'Piensa en la plantilla de un equipo deportivo. Cuando llega un jugador nuevo que es mejor que algunos de los actuales *y* más joven, esos jugadores nunca volverán a ser titulares: descártalos. La lista que queda está ordenada: el mejor (y más antiguo) primero.',
    },
    {
      en: 'So for a window maximum: when a value enters, remove from the **back** every value that is smaller — they are dominated. Then append it. When the window slides past the element at the **front**, remove it there. The front is always the maximum.',
      es: 'Entonces, para el máximo de una ventana: cuando entra un valor, quita del **final** todos los valores más pequeños, porque quedan dominados. Luego agrégalo. Cuando la ventana deja atrás el elemento del **frente**, quítalo de ahí. El frente siempre es el máximo.',
    },
    {
      en: 'It is the sliding-window relative of the monotonic stack. A stack is enough when elements never expire; once old elements must also leave from the other end, you need a deque.',
      es: 'Es el pariente de ventana deslizante de la pila monótona. Una pila basta cuando los elementos nunca caducan; en cuanto los elementos viejos también deben salir por el otro extremo, necesitas un deque.',
    },
    {
      en: 'Each element is added once and removed once, so the total work is O(n) regardless of k.',
      es: 'Cada elemento se agrega una vez y se quita una vez, así que el trabajo total es O(n) sin importar k.',
    },
  ],
  template: `deque = []                          # indices; values decreasing front -> back
for i in 0..n-1:
    if deque.front <= i - k: deque.popFront()            # left the window
    while deque not empty and a[deque.back] <= a[i]:
        deque.popBack()                                   # dominated
    deque.pushBack(i)
    if i >= k - 1: output a[deque.front]                  # max of window ending at i`,
  problems: [windowMax],
  quiz: [
    {
      q: {
        en: 'Given an array and a window size k, output the largest value in each window as it slides across the array, in O(n).',
        es: 'Dado un arreglo y un tamaño de ventana k, devuelve el valor más grande de cada ventana mientras se desliza por el arreglo, en O(n).',
      },
      why: {
        en: 'Maximum of every sliding window: keep a decreasing deque of candidates; the front is always the max.',
        es: 'Máximo de cada ventana deslizante: mantén un deque decreciente de candidatos; el frente siempre es el máximo.',
      },
    },
    {
      q: {
        en: 'Find the longest contiguous subarray in which the difference between the largest and smallest element is at most a given limit.',
        es: 'Encuentra el subarreglo contiguo más largo en el que la diferencia entre el elemento mayor y el menor sea como máximo un límite dado.',
      },
      why: {
        en: 'A sliding window that needs its current max and min at every step — two monotonic deques.',
        es: 'Una ventana deslizante que necesita su máximo y mínimo actuales en cada paso: dos deques monótonos.',
      },
    },
  ],
};
