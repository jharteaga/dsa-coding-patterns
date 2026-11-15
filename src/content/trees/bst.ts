import type { Pattern } from '../../types';
import { bstSearch } from './bst-search';
import { kthSmallestProblem } from './kth-smallest';
import { validateBst } from './validate-bst';

export const bst: Pattern = {
  id: 'bst',
  group: 'Trees',
  order: 3,
  title: { en: 'Binary Search Tree (BST)', es: 'Árbol binario de búsqueda (BST)' },
  tagline: { en: 'A tree that is sorted by construction: left is smaller, right is larger. Use the order, do not ignore it.', es: 'Un árbol ordenado por construcción: a la izquierda lo menor, a la derecha lo mayor. Usa ese orden, no lo ignores.' },
  cues: [
    { en: 'explicitly says **binary search tree** / BST', es: 'dice explícitamente **árbol binario de búsqueda** / BST' },
    { en: 'asks for the k-th smallest/largest, the closest value, a predecessor/successor, or values **in a range**', es: 'pide el k-ésimo menor/mayor, el valor más cercano, un predecesor/sucesor, o los valores **en un rango**' },
    { en: 'asks to search, insert or delete while keeping things sorted', es: 'pide buscar, insertar o eliminar manteniendo el orden' },
    { en: 'asks for the lowest common ancestor *in a BST* (the ordering tells you which way both targets lie)', es: 'pide el ancestro común más bajo *en un BST* (el orden te dice hacia qué lado están ambos objetivos)' },
  ],
  model: [
    { en: 'A binary search tree stores binary search in its shape. At every node: everything on the left is smaller, everything on the right is larger. Standing at a node, one comparison tells you which side to go to — and the other side is eliminated without being looked at.', es: 'Un árbol binario de búsqueda guarda la búsqueda binaria en su forma. En cada nodo: todo lo de la izquierda es menor y todo lo de la derecha es mayor. Parado en un nodo, una sola comparación te dice hacia qué lado ir, y el otro lado queda descartado sin mirarlo.' },
    { en: 'Two facts solve almost every BST problem. **Fact 1:** searching follows a single root-to-leaf path, so it costs O(h), the height. **Fact 2:** an in-order traversal (left, node, right) visits the values in ascending order.', es: 'Dos hechos resuelven casi cualquier problema de BST. **Hecho 1:** buscar sigue un único camino de la raíz a una hoja, así que cuesta O(h), la altura. **Hecho 2:** un recorrido in-order (izquierda, nodo, derecha) visita los valores en orden ascendente.' },
    { en: 'So when a problem says "BST", ask: can I throw away a subtree at each step (use Fact 1)? Or do I need sorted order (use Fact 2)? If your solution would work unchanged on any binary tree, you are probably leaving speed on the table.', es: 'Así que cuando un problema diga "BST", pregúntate: ¿puedo descartar un subárbol en cada paso (usa el Hecho 1)? ¿O necesito el orden (usa el Hecho 2)? Si tu solución funcionaría sin cambios en cualquier árbol binario, probablemente estás desperdiciando velocidad.' },
    { en: 'The catch is the height. A balanced tree with a million nodes is about 20 levels deep. But insert values in sorted order into a plain BST and you get a chain a million levels deep — every operation becomes O(n). That is why real libraries use self-balancing trees.', es: 'El problema es la altura. Un árbol balanceado con un millón de nodos tiene unos 20 niveles. Pero si insertas valores ya ordenados en un BST simple, obtienes una cadena de un millón de niveles: cada operación se vuelve O(n). Por eso las bibliotecas reales usan árboles autobalanceados.' },
  ],
  template: `# search / insert / closest value: follow one path
node = root
while node is not null:
    if target == node.val: return node
    node = node.left if target < node.val else node.right

# anything needing sorted order: in-order traversal
function inorder(node):
    if node is null: return
    inorder(node.left)
    visit(node)          # values arrive in ascending order
    inorder(node.right)`,
  problems: [bstSearch, validateBst, kthSmallestProblem],
  quiz: [
    { q: { en: 'Given a binary search tree, return the k-th smallest element.', es: 'Dado un árbol binario de búsqueda, devuelve el k-ésimo elemento más pequeño.' }, why: { en: 'In-order traversal of a BST yields sorted order; count to k and stop.', es: 'El recorrido in-order de un BST produce los valores ordenados; cuenta hasta k y detente.' } },
    { q: { en: 'Given a BST and two of its nodes, find their lowest common ancestor.', es: 'Dado un BST y dos de sus nodos, encuentra su ancestro común más bajo.' }, why: { en: 'In a BST the ordering says which way both nodes lie: walk down from the root until they split to different sides.', es: 'En un BST el orden dice hacia qué lado están ambos nodos: baja desde la raíz hasta que se separen hacia lados distintos.' } },
    { q: { en: 'Given a BST and a range [low, high], return the sum of all values within the range.', es: 'Dado un BST y un rango [low, high], devuelve la suma de todos los valores dentro del rango.' }, why: { en: 'The BST ordering lets you skip a whole subtree whenever the node is outside the range.', es: 'El orden del BST te permite saltarte un subárbol completo cada vez que el nodo está fuera del rango.' } },
  ],
};
