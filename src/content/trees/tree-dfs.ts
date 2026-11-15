import type { Pattern } from '../../types';
import { diameterProblem } from './diameter';
import { inorder } from './inorder';
import { pathSum } from './path-sum';

export const treeDfs: Pattern = {
  id: 'tree-dfs',
  group: 'Trees',
  order: 1,
  title: { en: 'Binary Tree DFS (depth-first)', es: 'DFS en árbol binario (en profundidad)' },
  tagline: { en: 'Go all the way down one branch before trying the next. Recursion does the bookkeeping for you.', es: 'Baja hasta el fondo de una rama antes de probar la siguiente. La recursión lleva la cuenta por ti.' },
  cues: [
    { en: 'mentions **root-to-leaf paths**, path sums, or "any path" in a tree', es: 'menciona **caminos de la raíz a una hoja**, sumas de caminos, o "cualquier camino" en un árbol' },
    { en: 'asks for **height, depth or diameter**, or whether a tree is balanced / symmetric / the same as another', es: 'pide **altura, profundidad o diámetro**, o si un árbol está balanceado / es simétrico / es igual a otro' },
    { en: 'needs information from the **children before** the parent can be answered (post-order), or passes information **from parent to children** (pre-order)', es: 'necesita información de los **hijos antes** de poder responder por el padre (post-order), o pasa información **del padre a los hijos** (pre-order)' },
    { en: 'asks for pre-order, in-order or post-order output', es: 'pide la salida en pre-order, in-order o post-order' },
    { en: 'would be satisfied by O(h) memory — DFS only remembers the current path', es: 'se conforma con memoria O(h): DFS solo recuerda el camino actual' },
  ],
  model: [
    { en: 'A binary tree is a recursive shape: every node is the root of a smaller tree. So almost every tree question can be answered by a function that says: "assume my left and right subtrees can already answer this question — how do I combine their answers with my own value?"', es: 'Un árbol binario es una forma recursiva: cada nodo es la raíz de un árbol más pequeño. Así que casi cualquier pregunta sobre árboles se responde con una función que dice: "supón que mis subárboles izquierdo y derecho ya saben responder esta pregunta; ¿cómo combino sus respuestas con mi propio valor?"' },
    { en: 'That function has three slots where work can happen. **Before** visiting the children (pre-order) — good for pushing information down, like the remaining sum. **Between** them (in-order) — on a search tree this gives sorted order. **After** them (post-order) — good for pulling information up, like heights.', es: 'Esa función tiene tres lugares donde puede ocurrir trabajo. **Antes** de visitar a los hijos (pre-order): sirve para bajar información, como la suma restante. **Entre** ellos (in-order): en un árbol de búsqueda esto da el orden. **Después** de ellos (post-order): sirve para subir información, como las alturas.' },
    { en: 'Always start with the base case: what is the answer for an empty tree (`null`)? Get that right and the leaves take care of themselves.', es: 'Empieza siempre por el caso base: ¿cuál es la respuesta para un árbol vacío (`null`)? Si eso está bien, las hojas se resuelven solas.' },
    { en: 'Watch for the classic waste: calling a helper that walks a whole subtree (like `height`) from inside another function that also visits every node. That is O(n²). The fix is nearly always the same — make the recursive function **return what the parent needs** and update the final answer on the side, so the tree is walked once.', es: 'Cuidado con el desperdicio clásico: llamar a una función auxiliar que recorre todo un subárbol (como `height`) desde otra función que también visita cada nodo. Eso es O(n²). La solución casi siempre es la misma: haz que la función recursiva **devuelva lo que necesita el padre** y actualiza la respuesta final aparte, para recorrer el árbol una sola vez.' },
    { en: 'Memory is O(h), the height: the call stack holds one frame for each node on the current root-to-node path. h is about log n for a balanced tree and n for a chain.', es: 'La memoria es O(h), la altura: la pila de llamadas guarda un marco por cada nodo del camino actual desde la raíz. h es aproximadamente log n en un árbol balanceado y n en una cadena.' },
  ],
  template: `function dfs(node, stateFromParent):
    if node is null: return baseAnswer

    # pre-order work: use / update state going down
    left  = dfs(node.left,  newState)
    # in-order work
    right = dfs(node.right, newState)
    # post-order work: combine children's answers coming up

    return answerForThisSubtree`,
  problems: [inorder, pathSum, diameterProblem],
  quiz: [
    { q: { en: 'Given a binary tree and a number S, find whether any root-to-leaf path has values that add up to S.', es: 'Dado un árbol binario y un número S, determina si algún camino de la raíz a una hoja tiene valores que suman S.' }, why: { en: '“Root-to-leaf path” means following one branch to the bottom before trying another — depth-first search, carrying the remaining sum down.', es: '“Camino de la raíz a una hoja” significa seguir una rama hasta el fondo antes de probar otra: búsqueda en profundidad, bajando la suma restante.' } },
    { q: { en: 'Determine whether a binary tree is height-balanced (for every node, the two subtrees differ in height by at most 1).', es: 'Determina si un árbol binario está balanceado en altura (en cada nodo, los dos subárboles difieren en altura como máximo en 1).' }, why: { en: 'Each node needs its children’s heights first: a post-order DFS that returns height upward.', es: 'Cada nodo necesita primero las alturas de sus hijos: un DFS post-order que devuelve la altura hacia arriba.' } },
    { q: { en: 'Given two binary trees, check whether they are mirror images of each other.', es: 'Dados dos árboles binarios, comprueba si son imágenes espejo uno del otro.' }, why: { en: 'Compare the trees node by node recursively — a DFS over both trees in step.', es: 'Compara los árboles nodo por nodo de forma recursiva: un DFS sobre ambos árboles a la par.' } },
  ],
};
