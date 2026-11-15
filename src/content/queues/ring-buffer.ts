import type { Pattern } from '../../types';
import { circularQueue } from './circular-queue';
import { movingAverage } from './moving-average';

export const ringBuffer: Pattern = {
  id: 'ring-buffer',
  group: 'Queues',
  order: 2,
  title: { en: 'Ring Buffer (circular queue)', es: 'Búfer circular (cola circular)' },
  tagline: {
    en: 'A fixed-size array whose ends are joined into a circle: O(1) at both ends, zero allocations.',
    es: 'Un arreglo de tamaño fijo cuyos extremos se unen en un círculo: O(1) en ambos extremos, cero reservas de memoria.',
  },
  cues: [
    {
      en: 'asks to **design a circular queue / circular deque / bounded buffer** with a fixed capacity',
      es: 'pide **diseñar una cola circular / deque circular / búfer acotado** con capacidad fija',
    },
    {
      en: 'keeps only **the last N** things: log lines, sensor readings, recent prices, undo history with a limit',
      es: 'guarda solo **los últimos N** elementos: líneas de log, lecturas de sensores, precios recientes, un historial de deshacer con límite',
    },
    {
      en: 'needs a **moving average / sum over the last N** values of a stream',
      es: 'necesita un **promedio móvil / suma de los últimos N** valores de un flujo',
    },
    {
      en: 'sits between a producer and a consumer (network packets, audio samples, keyboard input)',
      es: 'está entre un productor y un consumidor (paquetes de red, muestras de audio, entrada del teclado)',
    },
    {
      en: 'forbids growing memory or shifting elements — "all operations O(1)"',
      es: 'prohíbe que crezca la memoria o desplazar elementos: "todas las operaciones O(1)"',
    },
  ],
  model: [
    {
      en: 'Take an ordinary array and imagine bending it so that the last slot is followed by the first. Now there is no "front" that elements must be shuffled toward: the queue is simply a stretch of the circle, and it can be anywhere.',
      es: 'Toma un arreglo común e imagina doblarlo para que a la última casilla le siga la primera. Ahora no hay un "frente" hacia el cual haya que recorrer los elementos: la cola es simplemente un tramo del círculo, y puede estar en cualquier lugar.',
    },
    {
      en: 'You track that stretch with two numbers: `head` (the index of the oldest item) and `count` (how many items there are). The next free slot — the `tail` — is `(head + count) % capacity`.',
      es: 'Ese tramo se sigue con dos números: `head` (el índice del elemento más antiguo) y `count` (cuántos elementos hay). La siguiente casilla libre, el `tail`, es `(head + count) % capacity`.',
    },
    {
      en: 'The `%` (modulo, remainder after division) is what closes the circle: with capacity 5, stepping forward from index 4 gives `(4 + 1) % 5 = 0`. Every time you move an index forward, wrap it with `% capacity`.',
      es: 'El `%` (módulo, el residuo de la división) es lo que cierra el círculo: con capacidad 5, avanzar desde el índice 4 da `(4 + 1) % 5 = 0`. Cada vez que avances un índice, envuélvelo con `% capacity`.',
    },
    {
      en: '**Enqueue**: write at the tail, `count++`. **Dequeue**: advance `head` by one, `count--`. The removed value is not erased; it is just outside the stretch now and will be overwritten later. Nothing else moves, so both are O(1).',
      es: '**Enqueue**: escribe en el tail, `count++`. **Dequeue**: avanza `head` en uno, `count--`. El valor quitado no se borra; simplemente queda fuera del tramo y se sobrescribirá después. Nada más se mueve, así que ambas son O(1).',
    },
    {
      en: 'Two policies when the buffer is full: **reject** new items (a bounded queue) or **overwrite the oldest** (a "last N" history) — for the second, write at the tail and advance `head` too.',
      es: 'Dos políticas cuando el búfer está lleno: **rechazar** los elementos nuevos (una cola acotada) o **sobrescribir el más antiguo** (un historial de "los últimos N"); para la segunda, escribe en el tail y avanza también `head`.',
    },
    {
      en: 'Why not just use a dynamic array? Removing from the front shifts everything (O(n)); a linked list avoids that but allocates a node per item and scatters memory. A ring buffer is a single block of memory allocated once — which is why operating systems, audio drivers and network stacks use it everywhere.',
      es: '¿Por qué no usar simplemente un arreglo dinámico? Quitar del frente desplaza todo (O(n)); una lista enlazada lo evita, pero reserva un nodo por elemento y dispersa la memoria. Un búfer circular es un solo bloque de memoria reservado una vez; por eso los sistemas operativos, los controladores de audio y las pilas de red lo usan en todas partes.',
    },
  ],
  template: `slots = array of size capacity;  head = 0;  count = 0

enqueue(x):
    if count == capacity: return false          # or: overwrite + advance head
    slots[(head + count) % capacity] = x
    count += 1

dequeue():
    if count == 0: return false
    x = slots[head]
    head = (head + 1) % capacity
    count -= 1

front = slots[head]
rear  = slots[(head + count - 1) % capacity]`,
  related: ['queue-basics', 'sliding-window'],
  problems: [circularQueue, movingAverage],
  quiz: [
    {
      q: {
        en: 'Design a logger that keeps only the 1,000 most recent messages, using a fixed amount of memory, with O(1) insertion.',
        es: 'Diseña un registro (logger) que guarde solo los 1,000 mensajes más recientes, usando una cantidad fija de memoria, con inserción O(1).',
      },
      why: {
        en: '“Only the most recent N” with fixed memory: a ring buffer that overwrites the oldest slot.',
        es: '“Solo los N más recientes” con memoria fija: un búfer circular que sobrescribe la casilla más antigua.',
      },
    },
    {
      q: {
        en: 'Design a double-ended queue with a fixed capacity k where insertFront, insertLast, deleteFront and deleteLast are all O(1).',
        es: 'Diseña una cola de doble extremo con capacidad fija k donde insertFront, insertLast, deleteFront y deleteLast sean todas O(1).',
      },
      why: {
        en: 'Fixed capacity + O(1) at both ends: a ring buffer whose head can also move backwards with modulo arithmetic.',
        es: 'Capacidad fija + O(1) en ambos extremos: un búfer circular cuyo head también puede retroceder con aritmética modular.',
      },
    },
  ],
};
