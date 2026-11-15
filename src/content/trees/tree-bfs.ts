import type { Pattern } from '../../types';
import { levelOrderProblem } from './level-order';
import { minDepthProblem } from './min-depth';

export const treeBfs: Pattern = {
  id: 'tree-bfs',
  group: 'Trees',
  order: 2,
  title: { en: 'Binary Tree BFS (level by level)', es: 'BFS en árbol binario (nivel por nivel)' },
  tagline: { en: 'Visit a tree one level at a time using a queue. The first thing you find is the nearest.', es: 'Visita un árbol un nivel a la vez usando una cola. Lo primero que encuentras es lo más cercano.' },
  cues: [
    { en: 'says **level by level**, "level order", zigzag, or asks for something *per level* (average, largest value, rightmost node)', es: 'dice **nivel por nivel**, "level order", zigzag, o pide algo *por nivel* (promedio, valor máximo, nodo más a la derecha)' },
    { en: 'asks for the **nearest / shallowest / minimum depth** node with some property', es: 'pide el nodo **más cercano / menos profundo / de profundidad mínima** con alguna propiedad' },
    { en: 'asks for the "right side view" or "left side view" of a tree', es: 'pide la "vista desde la derecha" o la "vista desde la izquierda" de un árbol' },
    { en: 'connects each node to its neighbour on the same level', es: 'conecta cada nodo con su vecino del mismo nivel' },
  ],
  model: [
    { en: 'Depth-first search follows one branch to the bottom. Breadth-first search (BFS) does the opposite: it finishes everything at distance 1 from the root, then everything at distance 2, and so on — like ripples spreading from a stone dropped in water.', es: 'La búsqueda en profundidad sigue una rama hasta el fondo. La búsqueda en anchura (BFS) hace lo contrario: termina todo lo que está a distancia 1 de la raíz, luego todo lo que está a distancia 2, y así sucesivamente, como las ondas que se expanden al tirar una piedra al agua.' },
    { en: 'The tool is a **queue** (first in, first out). Take a node from the front, do your work, and add its children to the back. Because children always join behind everything already waiting, a whole level is finished before the next begins.', es: 'La herramienta es una **cola** (el primero en entrar es el primero en salir). Toma un nodo del frente, haz tu trabajo y agrega sus hijos al final. Como los hijos siempre se forman detrás de todo lo que ya espera, un nivel completo termina antes de que empiece el siguiente.' },
    { en: 'To know where one level ends, either record the queue’s length before processing a level (that many nodes belong to it), or — as in the code here — read from the current level’s list while filling a separate list for the next.', es: 'Para saber dónde termina un nivel, guarda el tamaño de la cola antes de procesar el nivel (esa cantidad de nodos le pertenece), o, como en este código, lee de la lista del nivel actual mientras llenas otra lista para el siguiente.' },
    { en: 'Two reasons to choose BFS over DFS: the answer is organised by level, or you want the *closest* match. BFS reaches nodes in order of distance, so it can stop at the first hit.', es: 'Dos razones para elegir BFS en lugar de DFS: la respuesta se organiza por niveles, o quieres la coincidencia *más cercana*. BFS llega a los nodos en orden de distancia, así que puede detenerse en el primer acierto.' },
    { en: 'The price is memory: the queue can hold an entire level, which for a full tree is about half of all nodes — O(n), versus O(h) for DFS.', es: 'El precio es la memoria: la cola puede contener un nivel entero, que en un árbol completo es casi la mitad de los nodos: O(n), frente a O(h) de DFS.' },
  ],
  template: `if root is null: return
queue = [root]
while queue is not empty:
    next = []
    for node in queue:              # exactly one level
        process(node)
        if node.left:  next.add(node.left)
        if node.right: next.add(node.right)
    queue = next                    # move down one level`,
  problems: [levelOrderProblem, minDepthProblem],
  quiz: [
    { q: { en: 'Given a binary tree, return the average of the node values on each level.', es: 'Dado un árbol binario, devuelve el promedio de los valores de los nodos en cada nivel.' }, why: { en: '“On each level” means you need whole levels grouped together — BFS with a queue.', es: '“En cada nivel” significa que necesitas los niveles completos agrupados: BFS con una cola.' } },
    { q: { en: 'Imagine standing on the right side of a binary tree. Return the values of the nodes you can see, from top to bottom.', es: 'Imagina que estás parado del lado derecho de un árbol binario. Devuelve los valores de los nodos que puedes ver, de arriba hacia abajo.' }, why: { en: 'You see the last node of every level: do a level-order BFS and keep the final node of each level.', es: 'Ves el último nodo de cada nivel: haz un BFS por niveles y quédate con el último nodo de cada uno.' } },
    { q: { en: 'Find the depth of the leaf node that is closest to the root of a binary tree.', es: 'Encuentra la profundidad de la hoja más cercana a la raíz de un árbol binario.' }, why: { en: '“Closest” is the BFS signal: it reaches nodes in order of distance and can stop at the first leaf.', es: '“Más cercana” es la señal de BFS: llega a los nodos en orden de distancia y puede detenerse en la primera hoja.' } },
  ],
};
