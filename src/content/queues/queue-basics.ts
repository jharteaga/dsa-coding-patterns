import type { Pattern } from '../../types';
import { queueStacks } from './queue-stacks';
import { recentCalls } from './recent-calls';

export const queueBasics: Pattern = {
  id: 'queue-basics',
  group: 'Queues',
  order: 1,
  title: { en: 'Queue Fundamentals (FIFO)', es: 'Fundamentos de colas (FIFO)' },
  tagline: {
    en: 'First in, first out. Use it when things must be handled in the order they arrived.',
    es: 'Primero en entrar, primero en salir. Úsala cuando las cosas deban atenderse en el orden en que llegaron.',
  },
  cues: [
    {
      en: 'processes things **in arrival order**: tasks, requests, print jobs, messages',
      es: 'procesa cosas **en orden de llegada**: tareas, solicitudes, trabajos de impresión, mensajes',
    },
    {
      en: 'keeps "the last N seconds / the last N items" where **old entries expire first**',
      es: 'guarda "los últimos N segundos / los últimos N elementos", donde **las entradas viejas caducan primero**',
    },
    {
      en: 'explores level by level or ring by ring (BFS is a queue)',
      es: 'explora nivel por nivel o anillo por anillo (BFS es una cola)',
    },
    {
      en: 'simulates a line: people buying tickets, round-robin scheduling, a hot-potato game',
      es: 'simula una fila: gente comprando boletos, planificación round-robin, el juego de la papa caliente',
    },
  ],
  model: [
    {
      en: 'A queue is a line at a shop: people join at the back and are served from the front. Whoever came first leaves first — **F**irst **I**n, **F**irst **O**ut.',
      es: 'Una cola es la fila de una tienda: la gente se forma atrás y se le atiende por el frente. Quien llegó primero sale primero: **F**irst **I**n, **F**irst **O**ut (primero en entrar, primero en salir).',
    },
    {
      en: 'Two operations, both meant to be O(1): `enqueue` (add at the back) and `dequeue` (remove from the front). C# has `Queue<T>`.',
      es: 'Dos operaciones, ambas pensadas para ser O(1): `enqueue` (agregar al final) y `dequeue` (quitar del frente). C# tiene `Queue<T>`.',
    },
    {
      en: '**JavaScript trap:** arrays have `push` (back, O(1)) and `shift` (front) — but `shift` has to slide every remaining element one slot left, so it is O(n). Using `shift` inside a loop can quietly turn an O(n) algorithm into O(n²). The usual fixes: keep a `head` index and just advance it, or use the "next level" list trick from BFS, or a ring buffer (next pattern).',
      es: '**Trampa de JavaScript:** los arreglos tienen `push` (al final, O(1)) y `shift` (al frente), pero `shift` tiene que correr cada elemento restante una casilla a la izquierda, así que es O(n). Usar `shift` dentro de un ciclo puede convertir silenciosamente un algoritmo O(n) en O(n²). Las soluciones habituales: guarda un índice `head` y simplemente avánzalo, usa el truco de la lista del "siguiente nivel" de BFS, o un búfer circular (siguiente patrón).',
    },
    {
      en: 'Stack vs queue is the single difference between DFS and BFS: take the newest item next and you go deep; take the oldest and you go wide.',
      es: 'Pila vs. cola es la única diferencia entre DFS y BFS: toma el elemento más reciente y vas en profundidad; toma el más antiguo y vas a lo ancho.',
    },
  ],
  template: `queue = []; head = 0                 # head index = O(1) dequeue in JS
enqueue(x):  queue.push(x)
dequeue():   x = queue[head]; head += 1; return x
size():      queue.length - head

# sliding time window
on event at time t:
    enqueue(t)
    while front of queue is older than t - WINDOW: dequeue()
    answer = size()`,
  problems: [queueStacks, recentCalls],
  quiz: [
    {
      q: {
        en: 'Design a rate limiter that allows a user at most 100 requests in any rolling 60-second period.',
        es: 'Diseña un limitador de tasa que permita a un usuario como máximo 100 solicitudes en cualquier periodo móvil de 60 segundos.',
      },
      why: {
        en: 'Requests expire in the order they arrived — a queue of timestamps, dropping from the front.',
        es: 'Las solicitudes caducan en el orden en que llegaron: una cola de marcas de tiempo, descartando por el frente.',
      },
    },
    {
      q: {
        en: 'People stand in a line to buy tickets; each can buy one per turn and re-joins the back if they need more. How long until person k is done?',
        es: 'Hay gente formada para comprar boletos; cada uno puede comprar uno por turno y vuelve al final de la fila si necesita más. ¿Cuánto tarda la persona k en terminar?',
      },
      why: {
        en: 'A literal line served front to back with re-joining at the back — simulate with a queue.',
        es: 'Una fila literal atendida de frente a final, con reingreso por atrás: simúlala con una cola.',
      },
    },
  ],
};
