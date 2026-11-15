import type { Pattern } from '../../types';
import { rotateProblem } from './rotate';
import { spiralProblem } from './spiral';

export const matrixTraversal: Pattern = {
  id: 'matrix-traversal',
  group: 'Matrix',
  order: 1,
  title: { en: 'Matrix Traversal', es: 'Recorrido de matrices' },
  tagline: {
    en: 'Walk a 2D grid in a special order, or transform it in place, by tracking boundaries instead of copies.',
    es: 'Recorre una cuadrícula 2D en un orden especial, o transfórmala en el lugar, llevando la cuenta de los límites en vez de hacer copias.',
  },
  cues: [
    {
      en: 'gives a **2D matrix** and asks for its elements in a special order: spiral, diagonal, zigzag, layer by layer',
      es: 'da una **matriz 2D** y pide sus elementos en un orden especial: espiral, diagonal, zigzag, capa por capa',
    },
    { en: 'asks to **rotate, transpose, flip or reflect** a matrix, often *in place*', es: 'pide **rotar, transponer, voltear o reflejar** una matriz, a menudo *en el lugar*' },
    { en: 'asks to set whole rows/columns based on cell values without extra memory', es: 'pide modificar filas/columnas completas según los valores de las celdas sin memoria extra' },
    { en: 'is about bookkeeping (indices and bounds), not about finding something clever', es: 'se trata de llevar la cuenta (índices y límites), no de encontrar algo ingenioso' },
  ],
  model: [
    {
      en: 'A matrix is an array of rows: `matrix[r][c]` is row r, column c. Almost every bug in matrix problems is an index bug, so name things by what they mean (`top`, `bottom`, `left`, `right`, `r`, `c`) rather than `i`, `j`, `k`.',
      es: 'Una matriz es un arreglo de filas: `matrix[r][c]` es la fila r, columna c. Casi todos los errores en problemas de matrices son errores de índice, así que nombra las cosas por lo que significan (`top`, `bottom`, `left`, `right`, `r`, `c`) en lugar de `i`, `j`, `k`.',
    },
    {
      en: 'Since every cell usually has to be read, the time is O(rows × cols) no matter what. What separates a brute-force answer from a good one is **extra memory**: a visited matrix or a full copy is O(m·n); a handful of boundary variables is O(1).',
      es: 'Como normalmente hay que leer cada celda, el tiempo es O(filas × columnas) pase lo que pase. Lo que separa una respuesta de fuerza bruta de una buena es la **memoria extra**: una matriz de visitados o una copia completa es O(m·n); un puñado de variables de límite es O(1).',
    },
    {
      en: '**Layer thinking.** A matrix is like an onion: an outer ring, then a smaller ring inside it. Spiral order peels rings; rotation moves each ring around itself. Four boundary variables describe the current ring.',
      es: '**Pensar en capas.** Una matriz es como una cebolla: un anillo exterior y luego un anillo más pequeño dentro. El orden en espiral pela anillos; la rotación mueve cada anillo alrededor de sí mismo. Cuatro variables de límite describen el anillo actual.',
    },
    {
      en: '**Decompose transformations.** Rotations and reflections are combinations of two primitives that are trivial to do in place: transpose (swap across the diagonal) and reverse (rows or columns). 90° clockwise = transpose, then reverse each row.',
      es: '**Descompón las transformaciones.** Las rotaciones y reflexiones son combinaciones de dos primitivas triviales de hacer en el lugar: transponer (intercambiar a través de la diagonal) e invertir (filas o columnas). 90° en sentido horario = transponer y luego invertir cada fila.',
    },
    {
      en: 'Always test a single row, a single column, and a non-square matrix — those are where the off-by-one errors live.',
      es: 'Prueba siempre una sola fila, una sola columna y una matriz no cuadrada: ahí es donde viven los errores por uno.',
    },
  ],
  template: `top = 0, bottom = rows - 1, left = 0, right = cols - 1
while top <= bottom and left <= right:
    walk top row     left -> right;   top += 1
    walk right col   top -> bottom;   right -= 1
    if top <= bottom:  walk bottom row  right -> left;  bottom -= 1
    if left <= right:  walk left col    bottom -> top;  left += 1`,
  problems: [spiralProblem, rotateProblem],
  quiz: [
    { q: { en: 'Given an n × n matrix representing an image, rotate it 180 degrees without allocating another matrix.', es: 'Dada una matriz n × n que representa una imagen, rótala 180 grados sin reservar otra matriz.' }, why: { en: 'In-place matrix transformation: combine simple in-place primitives (reverse rows, reverse columns).', es: 'Transformación de matriz en el lugar: combina primitivas simples en el lugar (invertir filas, invertir columnas).' } },
    { q: { en: 'Print the elements of an m × n matrix diagonal by diagonal, alternating direction on each diagonal.', es: 'Imprime los elementos de una matriz m × n diagonal por diagonal, alternando la dirección en cada diagonal.' }, why: { en: 'A special visiting order over a grid — pure index/boundary bookkeeping.', es: 'Un orden de visita especial sobre una cuadrícula: pura contabilidad de índices y límites.' } },
  ],
};
