import type { Pattern } from '../../types';
import { fastSort } from './fast-sort';
import { simpleSort } from './simple-sort';

export const simpleSorts: Pattern = {
  id: 'simple-sorts',
  group: 'Sorting',
  order: 1,
  title: { en: 'Simple Sorts: Bubble, Selection, Insertion', es: 'Ordenamientos simples: burbuja, selección, inserción' },
  tagline: {
    en: 'The O(n²) sorts everyone invents first — and why they stop scaling.',
    es: 'Los ordenamientos O(n²) que todos inventan primero, y por qué dejan de escalar.',
  },
  cues: [
    {
      en: 'asks you to **implement** a sort by hand, or to explain how one works',
      es: 'te pide **implementar** un ordenamiento a mano, o explicar cómo funciona uno',
    },
    {
      en: 'has a **tiny** or **nearly sorted** input, where insertion sort is genuinely the right tool',
      es: 'tiene una entrada **diminuta** o **casi ordenada**, donde el ordenamiento por inserción es de verdad la herramienta correcta',
    },
    {
      en: 'needs the minimum number of writes/swaps (selection sort)',
      es: 'necesita el mínimo número de escrituras/intercambios (ordenamiento por selección)',
    },
    {
      en: 'in every other case: you would call the built-in sort — but must know its cost is O(n log n)',
      es: 'en cualquier otro caso: llamarías al ordenamiento integrado, pero debes saber que cuesta O(n log n)',
    },
  ],
  model: [
    {
      en: 'All three algorithms grow a sorted region one element at a time. They differ only in how they pick and place the next element.',
      es: 'Los tres algoritmos hacen crecer una región ordenada de un elemento a la vez. Solo difieren en cómo eligen y colocan el siguiente elemento.',
    },
    {
      en: '**Bubble sort** compares neighbours and swaps them if they are out of order, sweeping left to right. After one sweep the largest value has reached the end; after two, the two largest; and so on. (There is no "bubble search" — bubble is a way of sorting.)',
      es: 'El **ordenamiento de burbuja** compara vecinos y los intercambia si están desordenados, barriendo de izquierda a derecha. Tras un barrido, el valor más grande llegó al final; tras dos, los dos más grandes; y así sucesivamente. (No existe la "búsqueda de burbuja": burbuja es una forma de ordenar).',
    },
    {
      en: '**Selection sort** scans the whole unsorted part to find its minimum, then swaps that minimum into place. Few swaps, but it always scans everything, even if the input was sorted to begin with.',
      es: 'El **ordenamiento por selección** recorre toda la parte sin ordenar para encontrar su mínimo y luego lo intercambia a su lugar. Pocos intercambios, pero siempre recorre todo, incluso si la entrada ya estaba ordenada desde el principio.',
    },
    {
      en: '**Insertion sort** takes the next element and slides it leftwards past every larger element — how you would sort playing cards in your hand. If the input is almost sorted, each element slides only a step or two, so it runs in nearly O(n).',
      es: 'El **ordenamiento por inserción** toma el siguiente elemento y lo desliza hacia la izquierda más allá de cada elemento mayor, como ordenarías las cartas en tu mano. Si la entrada está casi ordenada, cada elemento se desliza solo uno o dos pasos, así que corre en casi O(n).',
    },
    {
      en: 'Why O(n²)? Each of the n elements may need up to n steps to reach its place. Double the input and the work quadruples: 1,000 elements ≈ a million steps (instant), 1,000,000 elements ≈ a trillion steps (hours).',
      es: '¿Por qué O(n²)? Cada uno de los n elementos puede necesitar hasta n pasos para llegar a su lugar. Duplica la entrada y el trabajo se cuadruplica: 1,000 elementos ≈ un millón de pasos (instantáneo), 1,000,000 de elementos ≈ un billón de pasos (horas).',
    },
  ],
  template: `bubble:     repeat: sweep, swapping adjacent out-of-order pairs; stop when a sweep makes no swap
selection:  for i in 0..n-1: find the min of a[i..n), swap it into a[i]
insertion:  for i in 1..n-1: slide a[i] left past every larger element

                 best      average   worst     extra space   stable?
bubble           O(n)      O(n²)     O(n²)     O(1)          yes
selection        O(n²)     O(n²)     O(n²)     O(1)          no
insertion        O(n)      O(n²)     O(n²)     O(1)          yes`,
  problems: [simpleSort],
  quiz: [
    {
      q: {
        en: 'An array of 50 numbers is already sorted except for two elements that are slightly out of place. Which simple algorithm sorts it in nearly linear time?',
        es: 'Un arreglo de 50 números ya está ordenado, excepto dos elementos que están ligeramente fuera de lugar. ¿Qué algoritmo simple lo ordena en tiempo casi lineal?',
      },
      why: {
        en: 'Nearly sorted + small: insertion sort moves each element only a step or two, so it runs in about O(n).',
        es: 'Casi ordenado + pequeño: el ordenamiento por inserción mueve cada elemento solo uno o dos pasos, así que corre en aproximadamente O(n).',
      },
    },
    {
      q: {
        en: 'You must sort data on a device where every write to memory is very expensive but reads are cheap. Which elementary sort minimises writes?',
        es: 'Debes ordenar datos en un dispositivo donde cada escritura en memoria es muy costosa, pero las lecturas son baratas. ¿Qué ordenamiento elemental minimiza las escrituras?',
      },
      why: {
        en: 'Selection sort does at most n − 1 swaps — the fewest writes of the simple sorts.',
        es: 'El ordenamiento por selección hace como máximo n − 1 intercambios: la menor cantidad de escrituras entre los ordenamientos simples.',
      },
    },
  ],
};

export const fastSorts: Pattern = {
  id: 'fast-sorts',
  group: 'Sorting',
  order: 2,
  title: { en: 'Fast Sorts: Merge, Quick, Heap, Counting', es: 'Ordenamientos rápidos: merge, quick, heap, conteo' },
  tagline: {
    en: 'Divide and conquer turns n² into n log n. Sorting is also the first step of many other patterns.',
    es: 'Divide y vencerás convierte n² en n log n. Ordenar también es el primer paso de muchos otros patrones.',
  },
  cues: [
    {
      en: 'needs a sort and n is large (10⁵ or more) — anything O(n²) will time out',
      es: 'necesita un ordenamiento y n es grande (10⁵ o más): cualquier cosa O(n²) excederá el tiempo límite',
    },
    {
      en: 'becomes easy **once the input is sorted**: finding duplicates, closest pairs, overlapping intervals, the k-th value, two-pointer problems',
      es: 'se vuelve fácil **una vez que la entrada está ordenada**: encontrar duplicados, pares más cercanos, intervalos superpuestos, el k-ésimo valor, problemas de dos punteros',
    },
    {
      en: 'mentions **stability** (keep equal elements in their original order) → merge sort',
      es: 'menciona **estabilidad** (mantener los elementos iguales en su orden original) → merge sort',
    },
    {
      en: 'has values in a **small known range** (ages, grades, characters) → counting sort, O(n)',
      es: 'tiene valores en un **rango pequeño y conocido** (edades, calificaciones, caracteres) → ordenamiento por conteo, O(n)',
    },
    {
      en: 'asks to count inversions or sort a linked list → merge sort',
      es: 'pide contar inversiones u ordenar una lista enlazada → merge sort',
    },
  ],
  model: [
    {
      en: '**Divide and conquer:** break the problem into smaller copies of itself, solve those, and combine. For sorting there are two classic ways to do it.',
      es: '**Divide y vencerás:** parte el problema en copias más pequeñas de sí mismo, resuélvelas y combínalas. Para ordenar hay dos formas clásicas de hacerlo.',
    },
    {
      en: '**Merge sort** does the easy part first and the clever part last. Split the array in half (trivial), sort each half recursively, then *merge*: two sorted lists can be combined in one pass by repeatedly taking the smaller of the two front elements.',
      es: '**Merge sort** hace primero la parte fácil y al final la parte ingeniosa. Parte el arreglo a la mitad (trivial), ordena cada mitad recursivamente y luego *mezcla*: dos listas ordenadas se pueden combinar en una pasada tomando repetidamente el menor de los dos elementos del frente.',
    },
    {
      en: '**Quick sort** does the clever part first. Pick a pivot and *partition* the array so that everything smaller is on its left and everything larger on its right. The pivot is now in its final position, and the two sides can be sorted independently.',
      es: '**Quick sort** hace primero la parte ingeniosa. Elige un pivote y *particiona* el arreglo para que todo lo menor quede a su izquierda y todo lo mayor a su derecha. El pivote queda en su posición final, y los dos lados se pueden ordenar de forma independiente.',
    },
    {
      en: 'Why n log n? Halving n repeatedly reaches size 1 after log₂(n) levels. At every level, the merging (or partitioning) touches each element once: n work per level × log n levels.',
      es: '¿Por qué n log n? Partir n a la mitad repetidamente llega a tamaño 1 tras log₂(n) niveles. En cada nivel, la mezcla (o la partición) toca cada elemento una vez: n de trabajo por nivel × log n niveles.',
    },
    {
      en: 'No comparison-based sort can beat O(n log n) in the worst case. **Counting sort** sidesteps this by not comparing at all — it tallies how often each value occurs — which only works when the range of values is small.',
      es: 'Ningún ordenamiento basado en comparaciones puede superar O(n log n) en el peor caso. El **ordenamiento por conteo** esquiva esto sin comparar nada: cuenta cuántas veces aparece cada valor, lo que solo funciona cuando el rango de valores es pequeño.',
    },
    {
      en: 'In interviews you almost always call the built-in sort. What you must know: it costs O(n log n), and "sort first, then do one linear pass" is one of the most common ways to turn an O(n²) brute force into O(n log n).',
      es: 'En entrevistas casi siempre llamas al ordenamiento integrado. Lo que debes saber: cuesta O(n log n), y "ordenar primero y luego hacer una pasada lineal" es una de las formas más comunes de convertir una fuerza bruta O(n²) en O(n log n).',
    },
  ],
  template: `mergeSort(a):
    if length <= 1: return
    sort left half; sort right half
    merge the two sorted halves            # O(n)

quickSort(a, lo, hi):
    if lo >= hi: return
    p = partition(a, lo, hi)               # O(n): pivot ends at index p
    quickSort(a, lo, p - 1); quickSort(a, p + 1, hi)

                 best        average     worst       extra space   stable?
merge sort       O(n log n)  O(n log n)  O(n log n)  O(n)          yes
quick sort       O(n log n)  O(n log n)  O(n²)       O(log n)      no
heap sort        O(n log n)  O(n log n)  O(n log n)  O(1)          no
counting sort    O(n + k)    O(n + k)    O(n + k)    O(k)          yes*`,
  problems: [fastSort],
  quiz: [
    {
      q: {
        en: 'Sort one million records by date so that records with the same date keep their original relative order.',
        es: 'Ordena un millón de registros por fecha de modo que los registros con la misma fecha mantengan su orden relativo original.',
      },
      why: {
        en: 'Large n needs O(n log n); “keep original order of equal items” is stability — merge sort.',
        es: 'Un n grande necesita O(n log n); “mantener el orden original de los elementos iguales” es estabilidad: merge sort.',
      },
    },
    {
      q: {
        en: 'Sort an array of 10 million exam scores, each a whole number from 0 to 100.',
        es: 'Ordena un arreglo de 10 millones de calificaciones de examen, cada una un número entero de 0 a 100.',
      },
      why: {
        en: 'Tiny value range: count how many of each score there are (counting sort), O(n + k) with k = 101.',
        es: 'Rango de valores diminuto: cuenta cuántas hay de cada calificación (ordenamiento por conteo), O(n + k) con k = 101.',
      },
    },
    {
      q: {
        en: 'Count how many pairs (i, j) with i < j have nums[i] > nums[j], faster than checking every pair.',
        es: 'Cuenta cuántos pares (i, j) con i < j cumplen nums[i] > nums[j], más rápido que revisar cada par.',
      },
      why: {
        en: 'Counting inversions is done during the merge step of merge sort: O(n log n).',
        es: 'Las inversiones se cuentan durante el paso de mezcla de merge sort: O(n log n).',
      },
    },
  ],
};
