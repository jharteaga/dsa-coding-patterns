import type { Pattern } from '../../types';
import { subarraySumProblem } from './subarray-sum';
import { twoSumProblem } from './two-sum';

export const prefixHash: Pattern = {
  id: 'prefix-sum-hash-map',
  group: 'Arrays',
  order: 2,
  title: { en: 'Hash Map & Prefix Sum', es: 'Mapa hash y suma de prefijos' },
  tagline: { en: 'Remember what you have already seen, so you never have to look back with a loop.', es: 'Recuerda lo que ya viste, para no tener que mirar atrás con un bucle.' },
  cues: [
    { en: 'is on an **unsorted** array and asks "is there a pair / have we seen / how many times" — existence, duplicates, frequencies', es: 'trabaja sobre un arreglo **sin ordenar** y pregunta "¿hay un par? / ¿ya lo vimos? / ¿cuántas veces?": existencia, duplicados, frecuencias' },
    { en: 'asks about the **sum of a contiguous subarray**: equals k, divisible by k, longest with sum k', es: 'pregunta por la **suma de un subarreglo contiguo**: igual a k, divisible entre k, el más largo con suma k' },
    { en: 'asks **many range-sum queries** on the same array', es: 'pide **muchas consultas de suma de rango** sobre el mismo arreglo' },
    { en: 'contains negative numbers (which rule out a sliding window)', es: 'contiene números negativos (que descartan una ventana deslizante)' },
    { en: 'has a brute force whose inner loop is just *searching* for a value', es: 'tiene una fuerza bruta cuyo bucle interno solo está *buscando* un valor' },
  ],
  model: [
    { en: 'A hash map (JavaScript `Map`, C# `Dictionary`) stores key → value pairs and finds a key in O(1) on average. Whenever your inner loop only exists to answer "did I already see X?", replace that loop with a map lookup.', es: 'Un mapa hash (`Map` en JavaScript, `Dictionary` en C#) guarda pares clave → valor y encuentra una clave en O(1) en promedio. Siempre que tu bucle interno exista solo para responder "¿ya vi X?", reemplaza ese bucle por una búsqueda en el mapa.' },
    { en: 'The standard move: walk the array once. At each element, first **ask** the map the question that would complete an answer ("is my partner in there?"), then **add** the current element to the map for those who come later.', es: 'La jugada estándar: recorre el arreglo una vez. En cada elemento, primero **pregúntale** al mapa lo que completaría una respuesta ("¿está ahí mi pareja?"), y luego **agrega** el elemento actual al mapa para los que vienen después.' },
    { en: '**Prefix sums** turn subarray questions into pair questions. Write down the running total after each element. The sum of any stretch from i to j is then `running[j] − running[i−1]`: one subtraction instead of a loop.', es: 'Las **sumas de prefijos** convierten preguntas sobre subarreglos en preguntas sobre pares. Anota el total acumulado después de cada elemento. La suma de cualquier tramo de i a j es entonces `running[j] − running[i−1]`: una resta en lugar de un bucle.' },
    { en: 'Combine the two ideas and you get the big one: "find a subarray with sum k" becomes "find two running totals that differ by k" — which is Two Sum on the prefix array, solved with a hash map in one pass.', es: 'Combina las dos ideas y obtienes la gran idea: "encontrar un subarreglo con suma k" se convierte en "encontrar dos totales acumulados que difieren en k", que es Two Sum sobre el arreglo de prefijos, resuelto con un mapa hash en una pasada.' },
    { en: 'The cost is O(n) extra memory. That trade — memory for time — is the most common optimisation in interviews.', es: 'El costo es O(n) de memoria extra. Ese intercambio (memoria por tiempo) es la optimización más común en las entrevistas.' },
  ],
  template: `seen = empty map
for each element x (with running state s):
    if (what would complete an answer with s) in seen:
        record / return the answer
    seen[s] = ...            # only AFTER checking

# prefix sums
prefix = 0;  seen = {0: 1}
for x in a:
    prefix += x
    count += seen[prefix - k]     # earlier prefixes that leave exactly k
    seen[prefix] += 1`,
  related: ['data-structure-design'],
  problems: [twoSumProblem, subarraySumProblem],
  quiz: [
    { q: { en: 'Given an unsorted array, determine whether any value appears at least twice.', es: 'Dado un arreglo sin ordenar, determina si algún valor aparece al menos dos veces.' }, why: { en: '“Have I seen this before?” on unsorted data is a hash set lookup — O(n) instead of comparing all pairs.', es: '“¿Ya vi esto antes?” sobre datos sin ordenar es una búsqueda en un conjunto hash: O(n) en lugar de comparar todos los pares.' } },
    { q: { en: 'Given an array that may contain negative numbers, find the length of the longest contiguous subarray whose sum equals k.', es: 'Dado un arreglo que puede contener números negativos, encuentra la longitud del subarreglo contiguo más largo cuya suma es k.' }, why: { en: 'Subarray sum with negatives: store the first index of each prefix sum in a hash map and look for prefix − k.', es: 'Suma de subarreglo con negativos: guarda el primer índice de cada suma de prefijos en un mapa hash y busca prefix − k.' } },
    { q: { en: 'Given two strings, decide whether one is an anagram of the other.', es: 'Dadas dos cadenas, decide si una es anagrama de la otra.' }, why: { en: 'Compare character frequencies — count with a hash map.', es: 'Compara las frecuencias de los caracteres: cuéntalas con un mapa hash.' } },
  ],
};
