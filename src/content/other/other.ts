import type { Pattern } from '../../types';
import { knapsackProblem } from './knapsack';
import { parens } from './parens';
import { singleNumberProblem } from './single-number';
import { stairs } from './stairs';
import { subsetsProblem } from './subsets';

export const backtracking: Pattern = {
  id: 'backtracking',
  group: 'Other',
  order: 1,
  title: { en: 'Subsets & Backtracking', es: 'Subconjuntos y backtracking' },
  tagline: { en: 'Build answers one choice at a time; undo a choice to try the next; abandon dead ends early.', es: 'Construye respuestas una elección a la vez; deshaz una elección para probar la siguiente; abandona los callejones sin salida pronto.' },
  cues: [
    { en: 'asks for **all** subsets, permutations, combinations, partitions or arrangements', es: 'pide **todos** los subconjuntos, permutaciones, combinaciones, particiones o arreglos posibles' },
    { en: 'asks to "generate every valid…" or "find all ways to…"', es: 'pide "generar todos los … válidos" o "encontrar todas las formas de…"' },
    { en: 'is a constraint puzzle: N-Queens, Sudoku, word search in a grid, placing things without conflicts', es: 'es un rompecabezas con restricciones: N reinas, Sudoku, buscar palabras en una cuadrícula, colocar cosas sin conflictos' },
    { en: 'has small input limits (n ≤ 15–20) — a hint that an exponential search is expected', es: 'tiene límites de entrada pequeños (n ≤ 15–20): una pista de que se espera una búsqueda exponencial' },
  ],
  model: [
    { en: 'Some problems have no clever shortcut: the answer is a list of *all* configurations, and there are exponentially many. The goal is then to enumerate them systematically, without missing or repeating any, and without wasting time on hopeless ones.', es: 'Algunos problemas no tienen un atajo ingenioso: la respuesta es una lista de *todas* las configuraciones, y hay una cantidad exponencial. El objetivo entonces es enumerarlas sistemáticamente, sin omitir ni repetir ninguna, y sin perder tiempo en las que no tienen futuro.' },
    { en: 'Picture a **decision tree**. At each level you make one choice (include this element or not; which number goes in this cell). A path from the root to a leaf is one complete candidate.', es: 'Imagina un **árbol de decisiones**. En cada nivel tomas una elección (incluir este elemento o no; qué número va en esta celda). Un camino de la raíz a una hoja es un candidato completo.' },
    { en: 'Backtracking is a depth-first walk of that tree using **one** partial solution that you mutate as you go: **choose** (add something), **explore** (recurse), **un-choose** (remove it again). The un-choose step — the "backtrack" — restores the state so the next option starts clean.', es: 'El backtracking es un recorrido en profundidad de ese árbol usando **una sola** solución parcial que vas modificando: **elegir** (agregar algo), **explorar** (recursión), **deshacer** (quitarlo de nuevo). El paso de deshacer, el "backtrack", restaura el estado para que la siguiente opción empiece limpia.' },
    { en: '**Pruning** is what separates backtracking from brute force. Before taking a step, check whether the partial solution can still lead anywhere valid. If not, skip the whole subtree. Brute force generates everything and filters at the end; backtracking refuses to go down dead ends at all.', es: 'La **poda** es lo que separa el backtracking de la fuerza bruta. Antes de dar un paso, verifica si la solución parcial todavía puede llevar a algo válido. Si no, sáltate todo el subárbol. La fuerza bruta genera todo y filtra al final; el backtracking se niega a entrar en callejones sin salida.' },
    { en: 'When you copy a result into the output, copy it (`[...current]`) — otherwise every entry is the same array, which later gets emptied by the undo steps.', es: 'Cuando guardes un resultado en la salida, cópialo (`[...current]`); si no, todas las entradas son el mismo arreglo, que después vacían los pasos de deshacer.' },
  ],
  template: `function search(partial, position):
    if partial is complete:
        record a COPY of partial
        return
    for each choice available at position:
        if choice cannot lead to a valid answer: continue     # prune
        add choice to partial                                 # choose
        search(partial, position + 1)                         # explore
        remove choice from partial                            # un-choose`,
  problems: [subsetsProblem, parens],
  quiz: [
    { q: { en: 'Given a collection of distinct numbers, return all possible orderings of them.', es: 'Dada una colección de números distintos, devuelve todos sus ordenamientos posibles.' }, why: { en: '“All possible orderings” = enumerate every permutation: choose an unused number, recurse, un-choose.', es: '“Todos los ordenamientos posibles” = enumerar cada permutación: elige un número no usado, haz recursión, deshaz.' } },
    { q: { en: 'Place N queens on an N × N chessboard so that no two attack each other; return all solutions.', es: 'Coloca N reinas en un tablero de N × N de modo que ninguna ataque a otra; devuelve todas las soluciones.' }, why: { en: 'A constraint puzzle solved row by row: place a queen, recurse, remove it — pruning squares that are attacked.', es: 'Un rompecabezas con restricciones que se resuelve fila por fila: coloca una reina, haz recursión, quítala, podando las casillas atacadas.' } },
    { q: { en: 'Given a set of candidate numbers and a target, find all unique combinations of candidates that sum to the target.', es: 'Dado un conjunto de números candidatos y un objetivo, encuentra todas las combinaciones únicas de candidatos que sumen el objetivo.' }, why: { en: '“Find all combinations” with a constraint to prune on (the remaining target going negative): backtracking.', es: '“Encontrar todas las combinaciones” con una restricción para podar (el objetivo restante se vuelve negativo): backtracking.' } },
  ],
};

export const dp: Pattern = {
  id: 'dynamic-programming',
  group: 'Other',
  order: 2,
  title: { en: 'Dynamic Programming', es: 'Programación dinámica' },
  tagline: { en: 'When a recursion keeps solving the same subproblems, solve each one once and remember the answer.', es: 'Cuando una recursión resuelve una y otra vez los mismos subproblemas, resuelve cada uno una sola vez y recuerda la respuesta.' },
  cues: [
    { en: 'asks for the **number of ways**, or the **minimum / maximum** cost, value or length — a single number, not the list of all solutions', es: 'pide el **número de formas**, o el costo, valor o longitud **mínimo / máximo**: un solo número, no la lista de todas las soluciones' },
    { en: 'makes a **sequence of choices** where each choice changes what is left (capacity, position, remaining amount)', es: 'hace una **secuencia de elecciones** donde cada elección cambia lo que queda (capacidad, posición, cantidad restante)' },
    { en: 'has a natural recursion that branches (take/skip, step 1/step 2) and **overlaps** — different paths reach the same state', es: 'tiene una recursión natural que se ramifica (tomar/saltar, paso de 1/paso de 2) y se **traslapa**: caminos distintos llegan al mismo estado' },
    { en: 'uses phrases like "longest increasing…", "fewest coins", "can you reach…", "edit distance", "how many paths"', es: 'usa frases como "la … creciente más larga", "la menor cantidad de monedas", "¿puedes llegar a…?", "distancia de edición", "cuántos caminos"' },
    { en: 'has inputs too large for 2ⁿ but where n × (some other limit) is small', es: 'tiene entradas demasiado grandes para 2ⁿ, pero donde n × (algún otro límite) es pequeño' },
  ],
  model: [
    { en: 'Dynamic programming (DP) sounds mysterious but is one idea: **do not solve the same subproblem twice**. Everything else is bookkeeping.', es: 'La programación dinámica (DP) suena misteriosa, pero es una sola idea: **no resuelvas el mismo subproblema dos veces**. Todo lo demás es contabilidad.' },
    { en: '**Step 1 — write the brute-force recursion.** Define a function by what it returns in plain words ("the number of ways to reach step n") and express it using smaller inputs. This recurrence *is* the solution; DP only makes it fast.', es: '**Paso 1: escribe la recursión de fuerza bruta.** Define una función por lo que devuelve en palabras simples ("el número de formas de llegar al escalón n") y exprésala usando entradas más pequeñas. Esta recurrencia *es* la solución; la DP solo la hace rápida.' },
    { en: '**Step 2 — notice the repeats.** Draw the call tree for a small input. If the same arguments show up in several places, the recursion is doing exponential work to compute a small number of distinct answers. The distinct argument combinations are called **states**.', es: '**Paso 2: detecta las repeticiones.** Dibuja el árbol de llamadas para una entrada pequeña. Si los mismos argumentos aparecen en varios lugares, la recursión hace trabajo exponencial para calcular un número pequeño de respuestas distintas. Las combinaciones distintas de argumentos se llaman **estados**.' },
    { en: '**Step 3 — remember.** *Top-down (memoization):* keep the recursion, but store each result in a map keyed by the arguments and return the stored value if asked again. *Bottom-up (tabulation):* create an array indexed by state and fill it in an order where every cell’s dependencies are already filled.', es: '**Paso 3: recuerda.** *De arriba hacia abajo (memoización):* conserva la recursión, pero guarda cada resultado en un mapa con los argumentos como clave y devuelve el valor guardado si te lo vuelven a pedir. *De abajo hacia arriba (tabulación):* crea un arreglo indexado por estado y llénalo en un orden en el que las dependencias de cada celda ya estén llenas.' },
    { en: 'The running time becomes **(number of states) × (work per state)**. Climbing stairs: n states × O(1). Knapsack: n × capacity states × O(1).', es: 'El tiempo de ejecución pasa a ser **(número de estados) × (trabajo por estado)**. Subir escaleras: n estados × O(1). Mochila: n × capacity estados × O(1).' },
    { en: '**Step 4 — optionally shrink the memory.** If each cell only reads from the previous row (or the previous two cells), you do not need to keep the whole table.', es: '**Paso 4: opcionalmente reduce la memoria.** Si cada celda solo lee de la fila anterior (o de las dos celdas anteriores), no necesitas guardar toda la tabla.' },
    { en: 'DP versus backtracking: backtracking *lists* all solutions (exponential output, unavoidable). DP *counts* or *optimises* over them without ever listing them.', es: 'DP versus backtracking: el backtracking *lista* todas las soluciones (salida exponencial, inevitable). La DP las *cuenta* u *optimiza* sobre ellas sin listarlas nunca.' },
  ],
  template: `# top-down
memo = {}
function solve(state):
    if state is a base case: return its answer
    if state in memo: return memo[state]
    memo[state] = combine(solve(smaller state 1), solve(smaller state 2), ...)
    return memo[state]

# bottom-up
table[base cases] = known answers
for state in order from smallest to largest:
    table[state] = combine(table[smaller states])
return table[final state]`,
  problems: [stairs, knapsackProblem],
  quiz: [
    { q: { en: 'Given coin denominations and an amount, find the fewest coins needed to make that amount.', es: 'Dadas las denominaciones de monedas y una cantidad, encuentra la menor cantidad de monedas necesaria para formar esa cantidad.' }, why: { en: '“Fewest” over a sequence of choices with overlapping subproblems (the remaining amount): DP over amounts.', es: '“La menor cantidad” sobre una secuencia de elecciones con subproblemas traslapados (la cantidad restante): DP sobre cantidades.' } },
    { q: { en: 'A robot in the top-left of an m × n grid can only move right or down. How many distinct paths lead to the bottom-right?', es: 'Un robot en la esquina superior izquierda de una cuadrícula de m × n solo puede moverse a la derecha o hacia abajo. ¿Cuántos caminos distintos llevan a la esquina inferior derecha?' }, why: { en: '“How many ways” — each cell’s count is the sum of the cell above and the cell to the left: a DP table.', es: '“Cuántas formas”: el conteo de cada celda es la suma de la celda de arriba y la de la izquierda: una tabla de DP.' } },
    { q: { en: 'Given two strings, find the length of their longest common subsequence.', es: 'Dadas dos cadenas, encuentra la longitud de su subsecuencia común más larga.' }, why: { en: 'An optimum over choices with overlapping subproblems indexed by (position in A, position in B): 2D DP.', es: 'Un óptimo sobre elecciones con subproblemas traslapados indexados por (posición en A, posición en B): DP en 2D.' } },
  ],
};

export const xor: Pattern = {
  id: 'bitwise-xor',
  group: 'Other',
  order: 3,
  title: { en: 'Bitwise XOR', es: 'XOR a nivel de bits' },
  tagline: { en: 'XOR makes equal values cancel out — finding the odd one out with a single variable.', es: 'XOR hace que los valores iguales se cancelen: encuentra el que sobra con una sola variable.' },
  cues: [
    { en: 'says every element appears **twice** (or an even number of times) **except one**', es: 'dice que cada elemento aparece **dos veces** (o un número par de veces) **excepto uno**' },
    { en: 'asks for a missing or duplicated number and demands **O(1) extra space**', es: 'pide un número faltante o duplicado y exige **O(1) de espacio extra**' },
    { en: 'asks to swap, toggle, or compare numbers at the level of bits', es: 'pide intercambiar, alternar o comparar números a nivel de bits' },
    { en: 'talks about bits directly: flipping an image, complement of a number, Hamming distance', es: 'habla de bits directamente: voltear una imagen, el complemento de un número, la distancia de Hamming' },
  ],
  model: [
    { en: 'Computers store numbers in binary. **XOR** ("exclusive or", written `^`) combines two numbers bit by bit: the result has a 1 wherever the two inputs **differ**, and a 0 wherever they are the same.', es: 'Las computadoras guardan los números en binario. **XOR** ("o exclusivo", escrito `^`) combina dos números bit a bit: el resultado tiene un 1 donde las dos entradas **difieren** y un 0 donde son iguales.' },
    { en: 'Three facts follow, and they are all you need. `x ^ x = 0`: a number differs from itself nowhere. `x ^ 0 = x`: differing from zero leaves the number unchanged. And XOR can be done in any order: `a ^ b ^ a` is the same as `a ^ a ^ b`.', es: 'De ahí salen tres hechos, y son todo lo que necesitas. `x ^ x = 0`: un número no difiere de sí mismo en ningún bit. `x ^ 0 = x`: diferir de cero deja el número igual. Y XOR se puede hacer en cualquier orden: `a ^ b ^ a` es lo mismo que `a ^ a ^ b`.' },
    { en: 'Put together: XOR a whole list of numbers and **every value that occurs an even number of times vanishes**. Whatever occurs an odd number of times is left standing.', es: 'Juntándolos: aplica XOR a toda una lista de números y **todo valor que aparece un número par de veces desaparece**. Lo que aparece un número impar de veces queda en pie.' },
    { en: 'It is like a row of light switches: flipping the same switch twice puts it back where it was. After flipping one switch per number, the switches left on spell out the unpaired number in binary.', es: 'Es como una fila de interruptores de luz: accionar el mismo interruptor dos veces lo deja como estaba. Tras accionar un interruptor por cada número, los que quedan encendidos forman el número sin pareja en binario.' },
    { en: 'This is a narrow tool — it only fits problems with exactly this "pairs cancel" structure — but when it fits, nothing beats it: one pass, one variable.', es: 'Es una herramienta específica: solo sirve para problemas con exactamente esta estructura de "las parejas se cancelan", pero cuando encaja, nada la supera: una pasada, una variable.' },
  ],
  template: `result = 0
for x in nums:
    result = result XOR x
return result            # everything that appeared twice has cancelled out`,
  problems: [singleNumberProblem],
  quiz: [
    { q: { en: 'In an array, every number appears exactly twice except for one. Find that number without using extra memory.', es: 'En un arreglo, cada número aparece exactamente dos veces excepto uno. Encuentra ese número sin usar memoria extra.' }, why: { en: 'Pairs + one odd one out + O(1) space: XOR everything; the pairs cancel.', es: 'Parejas + uno que sobra + espacio O(1): aplica XOR a todo; las parejas se cancelan.' } },
    { q: { en: 'An array contains n distinct numbers taken from 0…n. Find the missing one in O(n) time and O(1) space, without risking integer overflow from summing.', es: 'Un arreglo contiene n números distintos tomados de 0…n. Encuentra el faltante en tiempo O(n) y espacio O(1), sin arriesgarte a un desbordamiento de enteros por sumar.' }, why: { en: 'XOR all indices 0…n with all values: every present number cancels with its index, leaving the missing one.', es: 'Aplica XOR a todos los índices 0…n con todos los valores: cada número presente se cancela con su índice y queda el faltante.' } },
  ],
};
