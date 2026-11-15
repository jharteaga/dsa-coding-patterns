import type { Pattern } from '../../types';
import { flatSearch } from './flat-search';
import { staircase } from './staircase';

export const matrixSearch: Pattern = {
  id: 'matrix-search',
  group: 'Matrix',
  order: 2,
  title: { en: 'Matrix Search', es: 'Búsqueda en matrices' },
  tagline: { en: 'A sorted matrix lets you discard a whole row or column — or half the matrix — per comparison.', es: 'Una matriz ordenada te permite descartar una fila o columna entera (o la mitad de la matriz) en cada comparación.' },
  cues: [
    { en: 'gives a matrix whose **rows are sorted**, and possibly its columns too', es: 'da una matriz cuyas **filas están ordenadas**, y posiblemente también sus columnas' },
    { en: 'asks whether a value exists, or for the k-th smallest element, or to count values below a threshold', es: 'pregunta si un valor existe, o pide el k-ésimo elemento más pequeño, o contar los valores por debajo de un umbral' },
    { en: 'asks for better than O(m·n)', es: 'pide algo mejor que O(m·n)' },
    { en: 'check carefully *which* sorted guarantee you have: "each row starts after the previous row ends" (fully sorted) vs "rows and columns sorted independently"', es: 'revisa con cuidado *qué* garantía de orden tienes: "cada fila empieza después de donde termina la anterior" (totalmente ordenada) frente a "filas y columnas ordenadas de forma independiente"' },
  ],
  model: [
    { en: 'There are two different kinds of "sorted matrix", and they call for different tools.', es: 'Hay dos tipos distintos de "matriz ordenada", y cada uno requiere herramientas diferentes.' },
    { en: '**Fully sorted** (each row continues where the last one stopped): the matrix is a single sorted list that has been wrapped onto several lines. Unwrap it in your head — index `i` lives at row `i / cols`, column `i % cols` — and run a normal binary search. O(log(m·n)).', es: '**Totalmente ordenada** (cada fila continúa donde se detuvo la anterior): la matriz es una sola lista ordenada repartida en varias líneas. Desenróllala mentalmente (el índice `i` vive en la fila `i / cols`, columna `i % cols`) y haz una búsqueda binaria normal. O(log(m·n)).' },
    { en: '**Sorted by row and by column** (but rows may overlap in range): you cannot unwrap it. Instead stand on the top-right corner. Left is smaller, down is bigger. Every comparison tells you to move one way and kills an entire row or column. O(m + n).', es: '**Ordenada por filas y por columnas** (pero los rangos de las filas pueden solaparse): no puedes desenrollarla. En su lugar, párate en la esquina superior derecha. A la izquierda es menor, hacia abajo es mayor. Cada comparación te dice hacia dónde moverte y elimina una fila o columna entera. O(m + n).' },
    { en: 'The corner trick is the 2D cousin of two pointers: one "pointer" walks down the rows, the other walks left across the columns, and neither ever turns back.', es: 'El truco de la esquina es el primo 2D de dos punteros: un "puntero" baja por las filas, el otro avanza a la izquierda por las columnas, y ninguno retrocede jamás.' },
  ],
  template: `# fully sorted: binary search over a virtual 1D index
lo = 0, hi = rows * cols - 1
value(i) = matrix[i / cols][i % cols]

# rows and columns sorted: staircase from the top-right
r = 0, c = cols - 1
while r < rows and c >= 0:
    if matrix[r][c] == target: return true
    if matrix[r][c] >  target: c -= 1     # column is too big
    else:                      r += 1     # row is too small
return false`,
  problems: [staircase, flatSearch],
  quiz: [
    { q: { en: 'In a matrix where each row and each column is sorted in ascending order, count how many entries are negative.', es: 'En una matriz donde cada fila y cada columna está ordenada de forma ascendente, cuenta cuántas entradas son negativas.' }, why: { en: 'Rows and columns both sorted: walk a staircase from a corner, discarding a row or column per step — O(m + n).', es: 'Filas y columnas ordenadas: recorre una escalera desde una esquina, descartando una fila o columna en cada paso: O(m + n).' } },
    { q: { en: 'A matrix has sorted rows, and each row’s first value is larger than the previous row’s last value. Find a target in O(log(m·n)).', es: 'Una matriz tiene filas ordenadas, y el primer valor de cada fila es mayor que el último valor de la fila anterior. Encuentra un objetivo en O(log(m·n)).' }, why: { en: 'Fully sorted matrix = one sorted array folded into rows: binary search with index → (row, col) conversion.', es: 'Matriz totalmente ordenada = un arreglo ordenado doblado en filas: búsqueda binaria con conversión de índice → (fila, columna).' } },
  ],
};
