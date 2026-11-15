import type { Pattern } from '../../types';
import { dailyTemps } from './daily-temps';
import { histogram } from './histogram';

export const monotonicStack: Pattern = {
  id: 'monotonic-stack',
  group: 'Stacks',
  order: 2,
  title: { en: 'Monotonic Stack', es: 'Pila monótona' },
  tagline: { en: 'Find the next greater (or smaller) element for every position in a single pass.', es: 'Encuentra el siguiente elemento mayor (o menor) para cada posición en una sola pasada.' },
  cues: [
    {
      en: 'asks for the **next greater / next smaller / previous greater / previous smaller** element for each position',
      es: 'pide el elemento **siguiente mayor / siguiente menor / anterior mayor / anterior menor** para cada posición',
    },
    { en: 'asks "how many days until…", "how far can each one see", stock span', es: 'pregunta "cuántos días hasta…", "qué tan lejos puede ver cada uno", el span de una acción' },
    {
      en: 'involves bars, buildings or heights: largest rectangle, trapping rain water, visible skyline',
      es: 'involucra barras, edificios o alturas: el rectángulo más grande, el agua de lluvia atrapada, el horizonte visible',
    },
    {
      en: 'has an O(n²) brute force where each element scans sideways until it meets something bigger or smaller',
      es: 'tiene una fuerza bruta O(n²) donde cada elemento recorre hacia un lado hasta encontrar algo mayor o menor',
    },
  ],
  model: [
    {
      en: 'A monotonic stack is an ordinary stack with one house rule: its contents are always in sorted order (say, decreasing from bottom to top). Before pushing a new element you pop everything that would break the order.',
      es: 'Una pila monótona es una pila común con una regla de la casa: su contenido siempre está ordenado (digamos, decreciente de abajo hacia arriba). Antes de apilar un elemento nuevo, desapilas todo lo que rompería el orden.',
    },
    {
      en: 'Why is that useful? Picture a queue of people waiting to find someone taller than themselves, standing so that heights decrease toward the front. When a new person arrives, everyone at the front who is shorter than the newcomer has just found their answer — the newcomer. They leave. Then the newcomer joins the line.',
      es: '¿Por qué es útil? Imagina una fila de personas esperando encontrar a alguien más alto que ellas, paradas de modo que las alturas disminuyen hacia el frente. Cuando llega una persona nueva, todos los del frente que son más bajos que ella acaban de encontrar su respuesta — la recién llegada. Se van. Luego la recién llegada se une a la fila.',
    },
    {
      en: 'The magic is in the popping: the moment an element gets popped, you have discovered its **next greater element** (whoever is popping it). And what sits underneath it on the stack is its **previous greater element**. Both answers, for every element, in one pass.',
      es: 'La magia está en el desapilado: en el momento en que se desapila un elemento, descubriste su **siguiente elemento mayor** (quien lo está desapilando). Y lo que está debajo de él en la pila es su **elemento mayor anterior**. Ambas respuestas, para cada elemento, en una sola pasada.',
    },
    {
      en: 'It looks like a loop inside a loop, but every element is pushed exactly once and popped at most once. 2n operations in total: O(n).',
      es: 'Parece un bucle dentro de otro, pero cada elemento se apila exactamente una vez y se desapila como máximo una vez. 2n operaciones en total: O(n).',
    },
    {
      en: 'To choose the direction: looking for the next *greater* → keep the stack *decreasing*. Looking for the next *smaller* → keep it *increasing*.',
      es: 'Para elegir la dirección: si buscas el siguiente *mayor* → mantén la pila *decreciente*. Si buscas el siguiente *menor* → mantenla *creciente*.',
    },
  ],
  template: `stack = []                       # holds indices; values decrease bottom -> top
for i in 0..n-1:
    while stack not empty and a[stack.top] < a[i]:
        j = stack.pop()
        nextGreater[j] = i       # a[i] is the first bigger value to the right of j
    stack.push(i)
# whatever is left on the stack has no next greater element`,
  problems: [dailyTemps, histogram],
  quiz: [
    {
      q: {
        en: 'For each element in an array, find the first element to its right that is larger than it (or -1 if none).',
        es: 'Para cada elemento de un arreglo, encuentra el primer elemento a su derecha que sea mayor que él (o -1 si no hay).',
      },
      why: {
        en: '“Next greater element” for every position: the defining monotonic-stack problem.',
        es: '“Siguiente elemento mayor” para cada posición: el problema que define a la pila monótona.',
      },
    },
    {
      q: {
        en: 'Given the heights of bars in an elevation map, compute how much rain water is trapped between them.',
        es: 'Dadas las alturas de las barras de un mapa de elevación, calcula cuánta agua de lluvia queda atrapada entre ellas.',
      },
      why: {
        en: 'Water at each bar depends on taller bars on both sides — nearest-greater relationships, solvable with a monotonic stack (or two pointers).',
        es: 'El agua en cada barra depende de barras más altas a ambos lados — relaciones de mayor más cercano, resolubles con una pila monótona (o dos punteros).',
      },
    },
    {
      q: {
        en: 'For each day’s stock price, compute its span: the number of consecutive days up to today with a price less than or equal to today’s.',
        es: 'Para el precio de una acción de cada día, calcula su span: el número de días consecutivos hasta hoy con un precio menor o igual al de hoy.',
      },
      why: {
        en: 'Each day needs its previous greater element — keep a decreasing stack of prices.',
        es: 'Cada día necesita su elemento mayor anterior — mantén una pila decreciente de precios.',
      },
    },
  ],
};
