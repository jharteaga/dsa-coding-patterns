import type { Pattern } from '../../types';
import { reverse } from './reverse';
import { reverseBetweenProblem } from './reverse-between';

export const reversal: Pattern = {
  id: 'linked-list-reversal',
  group: 'Linked lists',
  order: 2,
  title: { en: 'In-place Linked List Reversal', es: 'Inversión de listas enlazadas en el lugar' },
  tagline: {
    en: 'Reverse a list — or any part of it — by flipping arrows, using three pointers and no extra memory.',
    es: 'Invierte una lista (o cualquier parte de ella) volteando flechas, con tres punteros y sin memoria extra.',
  },
  cues: [
    {
      en: 'asks to **reverse** a linked list, a **sub-list** between two positions, or **every k nodes**',
      es: 'pide **invertir** una lista enlazada, una **sublista** entre dos posiciones, o **cada k nodos**',
    },
    {
      en: 'asks to rotate a list, swap nodes in pairs, or reorder it (first, last, second, second-to-last…)',
      es: 'pide rotar una lista, intercambiar nodos por pares o reordenarla (primero, último, segundo, penúltimo…)',
    },
    {
      en: 'asks whether a linked list is a palindrome (reverse the second half and compare)',
      es: 'pregunta si una lista enlazada es un palíndromo (invierte la segunda mitad y compara)',
    },
    { en: 'requires O(1) extra space — so no copying into an array', es: 'exige O(1) de espacio extra, así que no se puede copiar a un arreglo' },
  ],
  model: [
    {
      en: 'A linked list node holds a value and one arrow to the next node. Reversing the list does not move any node; it turns every arrow to point the other way.',
      es: 'Un nodo de una lista enlazada guarda un valor y una flecha al siguiente nodo. Invertir la lista no mueve ningún nodo; voltea cada flecha para que apunte al otro lado.',
    },
    {
      en: 'The difficulty is that turning an arrow around **destroys your only route forward**. So the loop always has the same four moves, in this order: (1) save the next node, (2) point the current node backward, (3) advance `prev`, (4) advance `cur`.',
      es: 'La dificultad es que voltear una flecha **destruye tu único camino hacia adelante**. Por eso el bucle siempre tiene los mismos cuatro movimientos, en este orden: (1) guarda el siguiente nodo, (2) apunta el nodo actual hacia atrás, (3) avanza `prev`, (4) avanza `cur`.',
    },
    {
      en: 'When the loop ends, `cur` is null and `prev` is the last node you touched — the new head.',
      es: 'Cuando el bucle termina, `cur` es null y `prev` es el último nodo que tocaste: la nueva cabeza.',
    },
    {
      en: 'Reversing only part of a list uses the identical loop, plus bookkeeping at the two seams: hold on to the node before the segment and the node after it, and reconnect them once the middle is flipped.',
      es: 'Invertir solo una parte de la lista usa el mismo bucle, más algo de contabilidad en las dos uniones: guarda el nodo antes del segmento y el nodo después de él, y reconéctalos una vez que el medio esté volteado.',
    },
    {
      en: 'A **dummy head** (a throwaway node placed before the real head) removes special cases whenever the head itself might change.',
      es: 'Una **cabeza ficticia** (un nodo desechable colocado antes de la cabeza real) elimina casos especiales siempre que la propia cabeza pueda cambiar.',
    },
  ],
  template: `prev = null; cur = head
while cur != null:
    next = cur.next       # 1. save the way forward
    cur.next = prev       # 2. flip the arrow
    prev = cur            # 3. advance prev
    cur = next            # 4. advance cur
return prev               # new head`,
  related: ['data-structure-design', 'fast-slow-pointers'],
  problems: [reverse, reverseBetweenProblem],
  quiz: [
    {
      q: {
        en: 'Given a linked list, reverse the nodes k at a time and return the modified list; leftover nodes at the end stay as they are.',
        es: 'Dada una lista enlazada, invierte los nodos de k en k y devuelve la lista modificada; los nodos sobrantes al final quedan como están.',
      },
      why: {
        en: 'Reversing chunks of a linked list in place: the prev/cur/next loop applied to each group, then stitched together.',
        es: 'Invertir tramos de una lista enlazada en el lugar: el bucle prev/cur/next aplicado a cada grupo y luego unido.',
      },
    },
    {
      q: { en: 'Check whether a singly linked list is a palindrome using O(1) extra space.', es: 'Comprueba si una lista simplemente enlazada es un palíndromo usando O(1) de espacio extra.' },
      why: {
        en: 'Find the middle (fast & slow), reverse the second half in place, then compare the two halves.',
        es: 'Encuentra el medio (rápido y lento), invierte la segunda mitad en el lugar y luego compara las dos mitades.',
      },
    },
  ],
};
