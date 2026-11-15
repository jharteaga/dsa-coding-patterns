import heapCode from '../../lib/ds.ts?code';
import type { Pattern } from '../../types';
import { kMerge } from './k-merge';
import { kthLargestProblem } from './kth-largest';
import { medianStream } from './median-stream';

const helper = { title: {
    en: 'Show the Heap helper used by the JavaScript / TypeScript solutions (C#: built-in PriorityQueue)',
    es: 'Mostrar el helper Heap que usan las soluciones de JavaScript / TypeScript (C#: PriorityQueue integrada)',
  }, code: heapCode, region: 'heap' };

export const topK: Pattern = {
  id: 'top-k',
  group: 'Heaps',
  order: 1,
  title: { en: 'Top K Elements', es: 'Los K mejores elementos (Top K)' },
  tagline: { en: 'Keep only the k best items in a small heap instead of sorting everything.', es: 'Conserva solo los k mejores elementos en un montículo (heap) pequeño en lugar de ordenarlo todo.' },
  cues: [
    { en: 'asks for the **k largest / smallest / most frequent / closest** items', es: 'pide los k elementos **más grandes / más pequeños / más frecuentes / más cercanos**' },
    { en: 'asks for the **k-th** largest or smallest element', es: 'pide el **k-ésimo** elemento más grande o más pequeño' },
    { en: 'processes a **stream** where you can never hold or sort all the data', es: 'procesa un **flujo** en el que nunca puedes guardar ni ordenar todos los datos' },
    { en: 'has k much smaller than n, and an obvious "sort then take k" brute force', es: 'tiene k mucho menor que n, y una fuerza bruta obvia de "ordenar y tomar k"' },
  ],
  model: [
    {
      en: 'A **heap** (priority queue) is a container with one talent: it always knows its smallest item (a min-heap) or its largest (a max-heap). Reading that item is O(1); adding an item or removing the top is O(log n). It does *not* keep everything sorted — just enough order to find the top.',
      es: 'Un **montículo (heap)** (cola de prioridad) es un contenedor con un solo talento: siempre conoce su elemento más pequeño (un min-heap) o el más grande (un max-heap). Leer ese elemento es O(1); agregar un elemento o quitar la cima es O(log n). *No* mantiene todo ordenado: solo el orden justo para encontrar la cima.',
    },
    {
      en: 'Internally it is a binary tree stored in an array, where every parent is smaller than its children (for a min-heap). Insert at the bottom and swap upward; remove the top, move the last item up, and swap downward. Each travels at most the height of the tree: log n.',
      es: 'Internamente es un árbol binario guardado en un arreglo, donde cada padre es menor que sus hijos (en un min-heap). Inserta abajo e intercambia hacia arriba; quita la cima, sube el último elemento e intercambia hacia abajo. Cada uno recorre como máximo la altura del árbol: log n.',
    },
    {
      en: 'For "top k" problems, the counter-intuitive trick is to use a **min-heap to find the largest** items. Keep the k largest seen so far in the heap. Its top is the *smallest of those* — the one to beat. A new value either beats it (pop, push) or is discarded immediately.',
      es: 'En los problemas de "top k", el truco contraintuitivo es usar un **min-heap para encontrar los más grandes**. Guarda en el montículo los k más grandes vistos hasta ahora. Su cima es el *más pequeño de ellos*: el que hay que superar. Un valor nuevo o lo supera (pop, push) o se descarta de inmediato.',
    },
    { en: 'For the k smallest, mirror it: a max-heap of size k.', es: 'Para los k más pequeños, haz lo inverso: un max-heap de tamaño k.' },
    { en: 'Cost: O(n log k) time, O(k) memory — versus O(n log n) and O(n) for sorting.', es: 'Costo: O(n log k) de tiempo, O(k) de memoria, frente a O(n log n) y O(n) al ordenar.' },
  ],
  template: `heap = min-heap                    # for the k LARGEST
for x in items:
    if heap.size < k:      heap.push(x)
    else if x > heap.top:  heap.pop(); heap.push(x)
# heap now holds the k largest; heap.top is the k-th largest`,
  helper,
  problems: [kthLargestProblem],
  quiz: [
    {
      q: { en: 'Given a list of points on a plane, return the k points closest to the origin.', es: 'Dada una lista de puntos en un plano, devuelve los k puntos más cercanos al origen.' },
      why: {
        en: '“The k closest” — keep a max-heap of size k keyed by distance; anything farther than its top is discarded.',
        es: '“Los k más cercanos”: mantén un max-heap de tamaño k ordenado por distancia; todo lo que esté más lejos que su cima se descarta.',
      },
    },
    {
      q: {
        en: 'Given a huge log of search queries that does not fit in memory, report the 10 most frequent queries.',
        es: 'Dado un registro enorme de búsquedas que no cabe en memoria, informa las 10 búsquedas más frecuentes.',
      },
      why: {
        en: 'Top k by frequency over a stream: count occurrences, then keep a min-heap of size 10.',
        es: 'Top k por frecuencia sobre un flujo: cuenta las apariciones y luego mantén un min-heap de tamaño 10.',
      },
    },
  ],
};

export const twoHeaps: Pattern = {
  id: 'two-heaps',
  group: 'Heaps',
  order: 2,
  title: { en: 'Two Heaps', es: 'Dos montículos (heaps)' },
  tagline: {
    en: 'Split the data into a smaller half and a larger half; the answer lives where they meet.',
    es: 'Divide los datos en una mitad menor y una mitad mayor; la respuesta está donde se encuentran.',
  },
  cues: [
    { en: 'asks for the **median** of a stream or of a sliding window', es: 'pide la **mediana** de un flujo o de una ventana deslizante' },
    { en: 'needs fast access to the **middle** of a changing collection', es: 'necesita acceso rápido al **medio** de una colección que cambia' },
    {
      en: 'divides items into two groups and needs the largest of one and the smallest of the other (e.g. maximise capital by picking projects)',
      es: 'divide los elementos en dos grupos y necesita el mayor de uno y el menor del otro (p. ej. maximizar el capital eligiendo proyectos)',
    },
  ],
  model: [
    {
      en: 'A single heap only knows one extreme. The median is not an extreme — it is in the middle. But the middle is the *largest of the smaller half* and the *smallest of the larger half*: two extremes, of two groups.',
      es: 'Un solo montículo solo conoce un extremo. La mediana no es un extremo: está en el medio. Pero el medio es el *mayor de la mitad menor* y el *menor de la mitad mayor*: dos extremos, de dos grupos.',
    },
    {
      en: 'So keep two heaps. A **max-heap** holds the smaller half of the numbers, so its top is the largest of them. A **min-heap** holds the larger half, so its top is the smallest of them. The two tops face each other across the middle.',
      es: 'Así que mantén dos montículos. Un **max-heap** guarda la mitad menor de los números, así que su cima es el mayor de ellos. Un **min-heap** guarda la mitad mayor, así que su cima es el menor de ellos. Las dos cimas quedan frente a frente a ambos lados del medio.',
    },
    {
      en: 'Two rules keep it honest. *Order:* every number in the lower heap is ≤ every number in the upper heap — guaranteed by choosing the right heap when inserting. *Balance:* the sizes differ by at most one — fixed by moving one top across when needed.',
      es: 'Dos reglas lo mantienen correcto. *Orden:* cada número del montículo inferior es ≤ que cada número del superior; se garantiza eligiendo el montículo correcto al insertar. *Equilibrio:* los tamaños difieren como máximo en uno; se corrige pasando una cima al otro lado cuando hace falta.',
    },
    {
      en: 'Then the median is the top of the bigger heap, or the average of both tops when they are the same size. Inserting costs O(log n); reading the median costs O(1).',
      es: 'Entonces la mediana es la cima del montículo más grande, o el promedio de ambas cimas cuando tienen el mismo tamaño. Insertar cuesta O(log n); leer la mediana cuesta O(1).',
    },
  ],
  template: `low  = max-heap      # smaller half
high = min-heap      # larger half

add(x):
    if low is empty or x <= low.top: low.push(x) else high.push(x)
    if low.size > high.size + 1: high.push(low.pop())
    if high.size > low.size:     low.push(high.pop())

median():
    return low.top if low.size > high.size else (low.top + high.top) / 2`,
  helper,
  problems: [medianStream],
  quiz: [
    {
      q: {
        en: 'Design a class that receives numbers one at a time and can report the median of all numbers received so far at any moment.',
        es: 'Diseña una clase que recibe números de uno en uno y puede informar en cualquier momento la mediana de todos los números recibidos hasta ahora.',
      },
      why: {
        en: 'Running median: a max-heap for the lower half and a min-heap for the upper half; the median is at their tops.',
        es: 'Mediana acumulada: un max-heap para la mitad inferior y un min-heap para la superior; la mediana está en sus cimas.',
      },
    },
    {
      q: { en: 'Given an array and a window size k, report the median of each sliding window.', es: 'Dado un arreglo y un tamaño de ventana k, informa la mediana de cada ventana deslizante.' },
      why: {
        en: 'The median of a changing collection — two heaps (with removal of elements leaving the window).',
        es: 'La mediana de una colección que cambia: dos montículos (quitando los elementos que salen de la ventana).',
      },
    },
  ],
};

export const kWayMerge: Pattern = {
  id: 'k-way-merge',
  group: 'Heaps',
  order: 3,
  title: { en: 'K-way Merge', es: 'Mezcla de k vías (K-way Merge)' },
  tagline: {
    en: 'Merge many sorted lists by always taking the smallest of their current heads from a heap.',
    es: 'Mezcla muchas listas ordenadas tomando siempre de un montículo la menor de sus cabezas actuales.',
  },
  cues: [
    { en: 'gives **k sorted** arrays / linked lists / rows of a sorted matrix', es: 'da **k** arreglos / listas enlazadas / filas de una matriz **ordenados**' },
    {
      en: 'asks to **merge** them, or for the k-th smallest across all of them, or the smallest range covering one element from each',
      es: 'pide **mezclarlos**, o el k-ésimo menor entre todos ellos, o el rango más pequeño que cubra un elemento de cada uno',
    },
    {
      en: 'deals with data too large for memory, stored as several sorted chunks (external sorting)',
      es: 'trata con datos demasiado grandes para la memoria, guardados como varios bloques ordenados (ordenamiento externo)',
    },
  ],
  model: [
    {
      en: 'Merging two sorted lists is easy: compare the two front elements, take the smaller, advance that list. With k lists, the next output is still one of the k fronts — but comparing all k each time costs O(k) per element.',
      es: 'Mezclar dos listas ordenadas es fácil: compara los dos elementos del frente, toma el menor y avanza esa lista. Con k listas, la siguiente salida sigue siendo uno de los k frentes, pero comparar los k cada vez cuesta O(k) por elemento.',
    },
    {
      en: 'Put the k fronts in a **min-heap** instead. Popping gives the smallest front in O(log k). Then push the next element from the same list that the popped one came from, so that list is represented again.',
      es: 'En su lugar, pon los k frentes en un **min-heap**. Hacer pop da el menor frente en O(log k). Luego inserta el siguiente elemento de la misma lista de la que salió el extraído, para que esa lista vuelva a estar representada.',
    },
    {
      en: 'Each heap entry must remember where it came from (which list, which index), so you know whose successor to push.',
      es: 'Cada entrada del montículo debe recordar de dónde vino (qué lista, qué índice), para saber de quién es el sucesor que hay que insertar.',
    },
    {
      en: 'The heap never holds more than k entries, regardless of how long the lists are. That is what makes this the standard way to merge sorted files that are too big to load: only k values are in memory at a time.',
      es: 'El montículo nunca guarda más de k entradas, sin importar lo largas que sean las listas. Por eso es la forma estándar de mezclar archivos ordenados demasiado grandes para cargarlos: solo hay k valores en memoria a la vez.',
    },
  ],
  template: `heap = min-heap of (value, listIndex, elementIndex)
push the first element of every non-empty list
while heap not empty:
    (value, li, i) = heap.pop()
    output value
    if list[li] has an element at i + 1:
        heap.push((list[li][i + 1], li, i + 1))`,
  helper,
  problems: [kMerge],
  quiz: [
    {
      q: { en: 'Given k sorted linked lists, merge them into one sorted linked list.', es: 'Dadas k listas enlazadas ordenadas, mézclalas en una sola lista enlazada ordenada.' },
      why: {
        en: 'k sorted inputs → repeatedly take the smallest head using a min-heap of size k.',
        es: 'k entradas ordenadas → toma repetidamente la menor cabeza usando un min-heap de tamaño k.',
      },
    },
    {
      q: {
        en: 'Given an n × n matrix where each row is sorted, find the k-th smallest element overall.',
        es: 'Dada una matriz de n × n en la que cada fila está ordenada, encuentra el k-ésimo menor elemento de toda la matriz.',
      },
      why: {
        en: 'Each row is a sorted list: do a k-way merge with a min-heap and stop at the k-th pop.',
        es: 'Cada fila es una lista ordenada: haz una mezcla de k vías con un min-heap y detente en el k-ésimo pop.',
      },
    },
  ],
};
