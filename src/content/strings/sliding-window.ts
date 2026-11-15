import type { Pattern } from '../../types';
import { longestUniqueProblem } from './longest-unique';
import { maxSumK } from './max-sum-k';

export const slidingWindow: Pattern = {
  id: 'sliding-window',
  group: 'Strings',
  order: 1,
  title: { en: 'Sliding Window', es: 'Ventana deslizante' },
  tagline: { en: 'Slide a frame over consecutive elements and update the answer as items enter and leave.', es: 'Desliza un marco sobre elementos consecutivos y actualiza la respuesta a medida que los elementos entran y salen.' },
  cues: [
    { en: 'asks about a **contiguous** subarray or **substring** (consecutive elements)', es: 'pregunta por un subarreglo **contiguo** o una **subcadena** (elementos consecutivos)' },
    { en: 'says "of size k", or asks for the **longest / shortest / maximum / minimum** stretch that satisfies a condition', es: 'dice "de tamaño k", o pide el tramo **más largo / más corto / máximo / mínimo** que cumple una condición' },
    { en: 'has a condition that is easy to maintain as one item is added or removed: a sum, a count of distinct characters, character frequencies', es: 'tiene una condición fácil de mantener al agregar o quitar un elemento: una suma, un conteo de caracteres distintos, frecuencias de caracteres' },
    { en: 'has only non-negative numbers when sums are involved (with negatives, use prefix sums + hash map instead)', es: 'solo tiene números no negativos cuando hay sumas de por medio (con negativos, usa suma de prefijos + mapa hash en su lugar)' },
    { en: 'has an O(n²) or O(n·k) brute force that recomputes each window from scratch', es: 'tiene una fuerza bruta O(n²) u O(n·k) que recalcula cada ventana desde cero' },
  ],
  model: [
    { en: 'Imagine a frame laid over part of the array. The brute force lifts the frame, puts it down one step to the right, and re-examines everything inside. But almost everything inside is the same as before — only one element entered and one left.', es: 'Imagina un marco colocado sobre parte del arreglo. La fuerza bruta levanta el marco, lo vuelve a poner un paso a la derecha y reexamina todo lo que hay dentro. Pero casi todo lo de dentro es igual que antes: solo entró un elemento y salió otro.' },
    { en: 'A sliding window keeps a small summary of the frame’s contents (a sum, a set, a frequency map) and **updates it incrementally**: add the entering element, remove the leaving one.', es: 'Una ventana deslizante guarda un pequeño resumen del contenido del marco (una suma, un conjunto, un mapa de frecuencias) y lo **actualiza de forma incremental**: agrega el elemento que entra y quita el que sale.' },
    { en: '**Fixed-size window** (the question gives k): slide both edges together. Every step is "add `a[right]`, remove `a[right − k]`".', es: '**Ventana de tamaño fijo** (el enunciado da k): desliza ambos bordes juntos. Cada paso es "agrega `a[right]`, quita `a[right − k]`".' },
    { en: '**Variable-size window** (longest/shortest with a condition): the right edge advances one step at a time to grow the window. Whenever the window breaks the rule, advance the left edge until it is valid again. Record the best window seen.', es: '**Ventana de tamaño variable** (la más larga/corta con una condición): el borde derecho avanza un paso a la vez para hacer crecer la ventana. Cada vez que la ventana rompe la regla, avanza el borde izquierdo hasta que vuelva a ser válida. Registra la mejor ventana vista.' },
    { en: 'Why is the variable version O(n) and not O(n²)? Each edge only ever moves forward, and each can move at most n times. The inner `while` that shrinks the window runs at most n times *in total*, not n times per step.', es: '¿Por qué la versión variable es O(n) y no O(n²)? Cada borde solo avanza, y cada uno puede moverse como máximo n veces. El `while` interno que encoge la ventana se ejecuta como máximo n veces *en total*, no n veces por paso.' },
  ],
  template: `# fixed size k
sum = sum of first k
for right in k..n-1:
    sum += a[right] - a[right - k]
    best = max(best, sum)

# variable size
left = 0
for right in 0..n-1:
    add a[right] to the window
    while window is invalid:
        remove a[left] from the window;  left += 1
    best = max(best, right - left + 1)`,
  problems: [maxSumK, longestUniqueProblem],
  quiz: [
    { q: { en: 'Given a string, find the length of the longest substring that contains at most two distinct characters.', es: 'Dada una cadena, encuentra la longitud de la subcadena más larga que contiene como máximo dos caracteres distintos.' }, why: { en: '“Longest substring” with a condition that is easy to maintain (count of distinct characters): a variable-size sliding window.', es: '“Subcadena más larga” con una condición fácil de mantener (conteo de caracteres distintos): una ventana deslizante de tamaño variable.' } },
    { q: { en: 'Given an array of positive integers and a target S, find the length of the shortest contiguous subarray whose sum is at least S.', es: 'Dado un arreglo de enteros positivos y un objetivo S, encuentra la longitud del subarreglo contiguo más corto cuya suma sea al menos S.' }, why: { en: 'Shortest contiguous run with positive numbers: grow the window on the right, shrink from the left while the sum is still ≥ S.', es: 'Tramo contiguo más corto con números positivos: haz crecer la ventana por la derecha y encógela por la izquierda mientras la suma siga siendo ≥ S.' } },
    { q: { en: 'Given a string and a pattern, find all starting indices where an anagram of the pattern appears in the string.', es: 'Dada una cadena y un patrón, encuentra todos los índices de inicio donde aparece un anagrama del patrón en la cadena.' }, why: { en: 'A fixed-size window (the pattern’s length) sliding across the string, comparing character counts.', es: 'Una ventana de tamaño fijo (la longitud del patrón) que se desliza por la cadena, comparando conteos de caracteres.' } },
  ],
};
