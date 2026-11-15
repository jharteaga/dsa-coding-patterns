import type { Pattern } from '../../types';
import { lfu } from './lfu';
import { lru } from './lru';
import { randomSet } from './random-set';

export const design: Pattern = {
  id: 'data-structure-design',
  group: 'Data structure design',
  order: 1,
  title: { en: 'Combining Structures (LRU cache & friends)', es: 'Combinar estructuras (caché LRU y compañía)' },
  tagline: {
    en: 'When no single structure makes every operation O(1), wire two together so each covers the other’s weakness.',
    es: 'Cuando ninguna estructura por sí sola hace O(1) todas las operaciones, conecta dos para que cada una cubra la debilidad de la otra.',
  },
  cues: [
    { en: 'says **"design a class / data structure"** with several operations', es: 'dice **"diseña una clase / estructura de datos"** con varias operaciones' },
    { en: 'demands that **every operation is O(1)** (or O(log n))', es: 'exige que **cada operación sea O(1)** (u O(log n))' },
    {
      en: 'is a **cache** with an eviction rule: least recently used (LRU), least frequently used (LFU), time-based expiry',
      es: 'es una **caché** con una regla de desalojo: el usado menos recientemente (LRU), el usado con menos frecuencia (LFU), expiración por tiempo',
    },
    {
      en: 'needs two abilities no single structure has: fast lookup **and** an order; fast lookup **and** random choice; fast lookup **and** the minimum',
      es: 'necesita dos capacidades que ninguna estructura tiene por sí sola: búsqueda rápida **y** un orden; búsqueda rápida **y** elección aleatoria; búsqueda rápida **y** el mínimo',
    },
  ],
  model: [
    {
      en: 'Start by writing down what each basic structure is good and bad at. **Hash map**: find, insert, delete by key in O(1) — but no order, no "oldest", no random pick. **Array**: index access and append in O(1) — but slow search and slow removal from the middle. **Doubly linked list**: insert/remove anywhere in O(1) *if you are holding the node* — but finding a node is O(n). **Heap**: min or max in O(1) — but nothing else.',
      es: 'Empieza anotando en qué es buena y en qué es mala cada estructura básica. **Mapa hash**: buscar, insertar y borrar por clave en O(1) — pero sin orden, sin "el más antiguo", sin elección aleatoria. **Arreglo**: acceso por índice y agregar al final en O(1) — pero búsqueda lenta y borrado lento en el medio. **Lista doblemente enlazada**: insertar/quitar en cualquier lugar en O(1) *si tienes el nodo en la mano* — pero encontrar un nodo es O(n). **Montículo (heap)**: mínimo o máximo en O(1) — pero nada más.',
    },
    {
      en: 'Design problems give you a list of operations that no single row in that table satisfies. The move is to **pick two structures whose strengths are complementary and make one index into the other**.',
      es: 'Los problemas de diseño te dan una lista de operaciones que ninguna fila de esa tabla satisface por sí sola. La jugada es **elegir dos estructuras con fortalezas complementarias y hacer que una sirva de índice a la otra**.',
    },
    {
      en: '**LRU cache** = hash map + doubly linked list. The list keeps keys in order of last use; the map stores, for each key, a direct pointer to its list node. That pointer is the trick: it removes the list’s one weakness (finding a node).',
      es: '**Caché LRU** = mapa hash + lista doblemente enlazada. La lista mantiene las claves en orden de último uso; el mapa guarda, para cada clave, un puntero directo a su nodo de la lista. Ese puntero es el truco: elimina la única debilidad de la lista (encontrar un nodo).',
    },
    {
      en: '**Where it fits with the other patterns:** an LRU cache is not a "linked list problem" or a "hash map problem" — it is both at once, which is why it has its own group here. See Hash Map & Prefix Sum and the Linked lists group for the two halves.',
      es: '**Dónde encaja con los otros patrones:** una caché LRU no es un "problema de lista enlazada" ni un "problema de mapa hash" — es ambos a la vez, por eso tiene su propio grupo aquí. Consulta Mapa hash y suma de prefijos y el grupo de Listas enlazadas para las dos mitades.',
    },
    {
      en: 'The discipline in these problems: every operation must update **both** structures. Most bugs are a map entry that still points at a node that was removed, or the reverse.',
      es: 'La disciplina en estos problemas: cada operación debe actualizar **ambas** estructuras. La mayoría de los errores son una entrada del mapa que sigue apuntando a un nodo que se eliminó, o al revés.',
    },
  ],
  template: `LRU cache
  map:  key -> node
  list: doubly linked, most recent at the front (dummy head and tail)

  get(key):
      if key not in map: return -1
      move map[key] to the front
      return its value

  put(key, value):
      if key in map: update value, move to front; return
      if map is full: remove the node before the tail (least recent) and its map entry
      create node, add at front, map[key] = node`,
  related: ['prefix-sum-hash-map', 'linked-list-reversal'],
  problems: [lru, lfu, randomSet],
  quiz: [
    {
      q: {
        en: 'Design a cache that holds at most N items and, when full, discards the item that has gone the longest without being read or written.',
        es: 'Diseña una caché que guarde como máximo N elementos y, cuando esté llena, descarte el elemento que lleva más tiempo sin leerse ni escribirse.',
      },
      why: {
        en: '“Discard what was used longest ago” is LRU: a hash map for lookup wired to a doubly linked list for recency order.',
        es: '“Descartar lo que se usó hace más tiempo” es LRU: un mapa hash para buscar conectado a una lista doblemente enlazada para el orden de uso reciente.',
      },
    },
    {
      q: { en: 'Design a structure supporting insert, delete and "return a random element", all in constant time.', es: 'Diseña una estructura que admita insertar, borrar y "devolver un elemento aleatorio", todo en tiempo constante.' },
      why: {
        en: 'No single structure does all three: combine an array (random access) with a hash map from value to index.',
        es: 'Ninguna estructura hace las tres por sí sola: combina un arreglo (acceso aleatorio) con un mapa hash de valor a índice.',
      },
    },
    {
      q: { en: 'Design a browser history that supports visit(url), back(steps) and forward(steps) efficiently.', es: 'Diseña un historial de navegador que admita visit(url), back(steps) y forward(steps) de forma eficiente.' },
      why: {
        en: 'A design problem: choose structures (two stacks, or an array with a cursor) so each operation is cheap.',
        es: 'Un problema de diseño: elige estructuras (dos pilas, o un arreglo con un cursor) para que cada operación sea barata.',
      },
    },
  ],
};
