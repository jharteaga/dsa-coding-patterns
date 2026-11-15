import type { Pattern } from '../../types';
import { cycle } from './cycle';
import { middleProblem } from './middle';

export const fastSlow: Pattern = {
  id: 'fast-slow-pointers',
  group: 'Linked lists',
  order: 1,
  title: { en: 'Fast & Slow Pointers', es: 'Punteros rápido y lento' },
  tagline: {
    en: 'Two pointers moving at different speeds reveal cycles and midpoints without extra memory.',
    es: 'Dos punteros que avanzan a velocidades distintas revelan ciclos y puntos medios sin memoria extra.',
  },
  cues: [
    {
      en: 'involves a **linked list** (or any "follow the next pointer" sequence) and asks about a **cycle**: does one exist, where does it start, how long is it',
      es: 'involucra una **lista enlazada** (o cualquier secuencia de "seguir el puntero next") y pregunta por un **ciclo**: si existe, dónde empieza, qué largo tiene',
    },
    {
      en: 'asks for the **middle** node, or the k-th node from the end, in one pass',
      es: 'pide el nodo del **medio**, o el k-ésimo nodo desde el final, en una sola pasada',
    },
    {
      en: 'asks whether a linked list is a palindrome (find the middle, reverse the second half)',
      es: 'pregunta si una lista enlazada es un palíndromo (encuentra el medio, invierte la segunda mitad)',
    },
    {
      en: 'describes a process that repeats: "happy number", finding a duplicate by treating values as pointers',
      es: 'describe un proceso que se repite: "número feliz", encontrar un duplicado tratando los valores como punteros',
    },
    {
      en: 'requires **O(1) extra space**, ruling out a hash set of visited nodes',
      es: 'exige **O(1) de espacio extra**, lo que descarta un conjunto hash de nodos visitados',
    },
  ],
  model: [
    {
      en: 'A singly linked list can only be walked forward, one node at a time, and it does not know its own length. That makes simple questions awkward: where is the middle? Is there a loop?',
      es: 'Una lista simplemente enlazada solo se puede recorrer hacia adelante, un nodo a la vez, y no conoce su propia longitud. Eso complica preguntas sencillas: ¿dónde está el medio? ¿Hay un bucle?',
    },
    {
      en: 'Use two pointers that start together but move at different speeds — the "tortoise and hare". Slow takes 1 step each turn; fast takes 2.',
      es: 'Usa dos punteros que empiezan juntos pero avanzan a velocidades distintas: la "tortuga y la liebre". El lento da 1 paso por turno; el rápido, 2.',
    },
    {
      en: '**Finding a cycle.** If the list has an end, fast reaches it. If the list loops, both pointers end up circling inside the loop. Each turn the gap between them shrinks by exactly one node, so fast cannot jump over slow — they must meet.',
      es: '**Encontrar un ciclo.** Si la lista tiene final, el rápido lo alcanza. Si la lista da vueltas, ambos punteros terminan girando dentro del bucle. En cada turno la distancia entre ellos se reduce exactamente en un nodo, así que el rápido no puede saltarse al lento: tienen que encontrarse.',
    },
    {
      en: '**Finding the middle.** Fast covers twice the distance of slow. When fast is at the end, slow is at the halfway mark.',
      es: '**Encontrar el medio.** El rápido recorre el doble de distancia que el lento. Cuando el rápido está al final, el lento está a la mitad.',
    },
    {
      en: 'Always guard the fast pointer: check `fast !== null && fast.next !== null` before taking two steps, or you will dereference null on lists of even or odd length.',
      es: 'Protege siempre el puntero rápido: comprueba `fast !== null && fast.next !== null` antes de dar dos pasos, o desreferenciarás null en listas de longitud par o impar.',
    },
  ],
  template: `slow = head; fast = head
while fast != null and fast.next != null:
    slow = slow.next            # 1 step
    fast = fast.next.next       # 2 steps
    if slow == fast: return "cycle"     # (only for cycle detection)
# no cycle; slow is now the middle node`,
  problems: [cycle, middleProblem],
  quiz: [
    {
      q: {
        en: 'Given the head of a linked list, find the node where a cycle begins, using O(1) memory.',
        es: 'Dada la cabeza de una lista enlazada, encuentra el nodo donde empieza un ciclo, usando O(1) de memoria.',
      },
      why: {
        en: 'Cycle in a linked list with constant memory: fast & slow pointers meet inside the cycle; resetting one to the head finds its start.',
        es: 'Ciclo en una lista enlazada con memoria constante: los punteros rápido y lento se encuentran dentro del ciclo; reiniciar uno en la cabeza encuentra su inicio.',
      },
    },
    {
      q: {
        en: 'A "happy number" reaches 1 when you repeatedly replace it by the sum of the squares of its digits; unhappy numbers loop forever. Decide which a number is, without storing the numbers seen.',
        es: 'Un "número feliz" llega a 1 cuando lo reemplazas repetidamente por la suma de los cuadrados de sus dígitos; los números infelices dan vueltas para siempre. Decide cuál es un número, sin guardar los números vistos.',
      },
      why: {
        en: 'A repeating process is a hidden linked list that may contain a cycle — detect it with fast & slow pointers.',
        es: 'Un proceso que se repite es una lista enlazada oculta que puede contener un ciclo: detéctalo con punteros rápido y lento.',
      },
    },
    {
      q: { en: 'Remove the n-th node from the end of a linked list in a single pass.', es: 'Elimina el n-ésimo nodo desde el final de una lista enlazada en una sola pasada.' },
      why: {
        en: 'Two pointers a fixed distance apart: when the leading one reaches the end, the trailing one is at the target.',
        es: 'Dos punteros separados por una distancia fija: cuando el de adelante llega al final, el de atrás está en el objetivo.',
      },
    },
  ],
};
