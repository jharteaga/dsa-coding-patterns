import type { Pattern } from '../../types';
import { components } from './components';
import { courses } from './courses';
import { redundant } from './redundant';

export const graphSearch: Pattern = {
  id: 'graph-bfs-dfs',
  group: 'Graphs',
  order: 1,
  title: { en: 'Graph BFS / DFS', es: 'BFS / DFS en grafos' },
  tagline: {
    en: 'Turn the edge list into an adjacency list, then explore with a visited set.',
    es: 'Convierte la lista de aristas en una lista de adyacencia y luego explora con un conjunto de visitados.',
  },
  cues: [
    {
      en: 'describes things and **connections between them**: friends, cities and roads, computers in a network, accounts with shared emails',
      es: 'describe cosas y las **conexiones entre ellas**: amigos, ciudades y carreteras, computadoras en una red, cuentas con correos compartidos',
    },
    { en: 'gives `n` nodes and a list of `edges` (or a matrix `isConnected[i][j]`)', es: 'da `n` nodos y una lista de aristas `edges` (o una matriz `isConnected[i][j]`)' },
    {
      en: 'asks whether two things are **connected**, how many **groups** there are, or for a path between them',
      es: 'pregunta si dos cosas están **conectadas**, cuántos **grupos** hay o un camino entre ellas',
    },
    { en: 'asks for the **fewest hops** between two nodes (→ BFS)', es: 'pide el **menor número de saltos** entre dos nodos (→ BFS)' },
    {
      en: 'asks to clone / copy a graph, or to check if it can be split into two teams (bipartite)',
      es: 'pide clonar / copiar un grafo, o comprobar si se puede dividir en dos equipos (bipartito)',
    },
  ],
  model: [
    {
      en: 'A graph is a set of **nodes** (also called vertices) joined by **edges**. A tree is a graph with no cycles; a grid is a graph where each cell touches its neighbours. Graph algorithms are tree algorithms plus one extra precaution.',
      es: 'Un grafo es un conjunto de **nodos** (también llamados vértices) unidos por **aristas**. Un árbol es un grafo sin ciclos; una cuadrícula es un grafo donde cada celda toca a sus vecinas. Los algoritmos de grafos son algoritmos de árboles más una precaución extra.',
    },
    {
      en: 'That precaution is the **visited set**. In a tree you can never come back to where you were. In a graph you can — via a cycle — and without marking nodes as visited you would loop forever.',
      es: 'Esa precaución es el **conjunto de visitados**. En un árbol nunca puedes volver a donde estabas. En un grafo sí puedes — a través de un ciclo — y sin marcar los nodos como visitados darías vueltas para siempre.',
    },
    {
      en: 'Edges usually arrive as a flat list of pairs, which is terrible for the one question you keep asking: "who are this node’s neighbours?" So step one is nearly always to build an **adjacency list**: an array (or map) from each node to the list of its neighbours. It costs O(V + E) once.',
      es: 'Las aristas suelen llegar como una lista plana de pares, lo cual es pésimo para la única pregunta que haces una y otra vez: "¿quiénes son los vecinos de este nodo?". Así que el primer paso casi siempre es construir una **lista de adyacencia**: un arreglo (o mapa) de cada nodo a la lista de sus vecinos. Cuesta O(V + E) una sola vez.',
    },
    {
      en: 'Then explore: take a node from a stack (DFS) or queue (BFS), and add each unvisited neighbour, marking it immediately. Every node is processed once and every edge looked at once per direction: **O(V + E)**.',
      es: 'Luego explora: toma un nodo de una pila (DFS) o una cola (BFS) y agrega cada vecino no visitado, marcándolo de inmediato. Cada nodo se procesa una vez y cada arista se revisa una vez por dirección: **O(V + E)**.',
    },
    {
      en: 'A graph may be in several disconnected pieces, so wrap the search in a loop over all nodes, starting a new search from each node that has not been visited yet.',
      es: 'Un grafo puede estar en varias piezas desconectadas, así que envuelve la búsqueda en un bucle sobre todos los nodos e inicia una nueva búsqueda desde cada nodo que aún no se haya visitado.',
    },
  ],
  template: `neighbours = adjacency list built from edges
seen = {}
for start in all nodes:
    if start in seen: continue
    # a new connected component begins here
    frontier = [start]; seen.add(start)
    while frontier not empty:
        node = frontier.pop()              # stack = DFS, queue = BFS
        for next in neighbours[node]:
            if next not in seen:
                seen.add(next)
                frontier.push(next)`,
  problems: [components],
  quiz: [
    {
      q: { en: 'Given a list of friendships between people, determine how many separate friend circles exist.', es: 'Dada una lista de amistades entre personas, determina cuántos círculos de amigos separados existen.' },
      why: {
        en: 'People and connections form a graph; separate circles are connected components — count searches started from unvisited nodes.',
        es: 'Las personas y sus conexiones forman un grafo; los círculos separados son componentes conexas — cuenta las búsquedas iniciadas desde nodos no visitados.',
      },
    },
    {
      q: { en: 'Given a reference to a node in a connected undirected graph, return a deep copy of the whole graph.', es: 'Dada una referencia a un nodo de un grafo no dirigido conexo, devuelve una copia profunda de todo el grafo.' },
      why: { en: 'Traverse the graph (DFS or BFS) with a visited map from each original node to its clone.', es: 'Recorre el grafo (DFS o BFS) con un mapa de visitados de cada nodo original a su clon.' },
    },
    {
      q: {
        en: 'Given a network of cities and direct flights, find the minimum number of flights needed to get from city A to city B.',
        es: 'Dada una red de ciudades y vuelos directos, encuentra el número mínimo de vuelos para ir de la ciudad A a la ciudad B.',
      },
      why: { en: 'Fewest hops in an unweighted graph: BFS from A, level by level.', es: 'Menos saltos en un grafo sin pesos: BFS desde A, nivel por nivel.' },
    },
  ],
};

export const topoSort: Pattern = {
  id: 'topological-sort',
  group: 'Graphs',
  order: 2,
  title: { en: 'Topological Sort', es: 'Ordenamiento topológico' },
  tagline: {
    en: 'Put tasks in an order that respects every "this before that" rule — or prove there is none.',
    es: 'Pon las tareas en un orden que respete cada regla "esto antes que aquello" — o demuestra que no existe.',
  },
  cues: [
    {
      en: 'has **dependencies / prerequisites**: courses, build steps, tasks, package installs, recipe steps',
      es: 'tiene **dependencias / prerrequisitos**: cursos, pasos de compilación, tareas, instalación de paquetes, pasos de una receta',
    },
    { en: 'says "A must come **before** B" and asks for a valid order, or whether one exists', es: 'dice "A debe ir **antes** que B" y pide un orden válido, o si existe uno' },
    { en: 'asks to detect a **cycle in a directed graph**', es: 'pide detectar un **ciclo en un grafo dirigido**' },
    { en: 'derives an ordering from pairwise hints (e.g. the letter order of an alien alphabet)', es: 'deduce un orden a partir de pistas por pares (p. ej., el orden de las letras de un alfabeto alienígena)' },
  ],
  model: [
    {
      en: 'Draw each task as a node and each rule "A before B" as an arrow A → B. A **topological order** lists the nodes so that every arrow points forward. Getting dressed is the classic example: socks before shoes, shirt before jacket.',
      es: 'Dibuja cada tarea como un nodo y cada regla "A antes que B" como una flecha A → B. Un **orden topológico** lista los nodos de modo que cada flecha apunte hacia adelante. Vestirse es el ejemplo clásico: calcetines antes que zapatos, camisa antes que chaqueta.',
    },
    {
      en: 'A valid order exists exactly when the arrows contain **no cycle**. If A needs B and B needs A, nothing can go first.',
      es: 'Existe un orden válido exactamente cuando las flechas **no forman ningún ciclo**. Si A necesita a B y B necesita a A, nada puede ir primero.',
    },
    {
      en: '**Kahn’s algorithm** is the direct simulation. A task can be done once nothing is blocking it. So count each node’s incoming arrows (its *in-degree*). Put every node with in-degree 0 in a queue. Repeatedly take one, add it to the order, and remove its outgoing arrows by decrementing its neighbours’ in-degrees; any neighbour that hits 0 joins the queue.',
      es: 'El **algoritmo de Kahn** es la simulación directa. Una tarea se puede hacer cuando nada la bloquea. Así que cuenta las flechas entrantes de cada nodo (su *grado de entrada*). Pon en una cola cada nodo con grado de entrada 0. Repetidamente toma uno, agrégalo al orden y elimina sus flechas salientes decrementando el grado de entrada de sus vecinos; cualquier vecino que llegue a 0 se une a la cola.',
    },
    {
      en: 'If the queue runs dry before every node has been output, the remaining nodes all have something blocking them — they sit on or behind a cycle.',
      es: 'Si la cola se vacía antes de haber sacado todos los nodos, a los nodos restantes algo los bloquea — están en un ciclo o detrás de uno.',
    },
    { en: 'Each node enters the queue once and each arrow is removed once: O(V + E).', es: 'Cada nodo entra a la cola una vez y cada flecha se elimina una vez: O(V + E).' },
  ],
  template: `indegree[v] = number of arrows pointing into v
ready = all v with indegree[v] == 0
order = []
while ready not empty:
    v = ready.pop()
    order.add(v)
    for w in arrows out of v:
        indegree[w] -= 1
        if indegree[w] == 0: ready.push(w)
if len(order) < number of nodes: there is a cycle`,
  problems: [courses],
  quiz: [
    {
      q: {
        en: 'Given a list of software packages and, for each, the packages it depends on, produce an installation order.',
        es: 'Dada una lista de paquetes de software y, para cada uno, los paquetes de los que depende, produce un orden de instalación.',
      },
      why: { en: 'Dependencies = “this before that” arrows: a topological sort gives a valid order.', es: 'Dependencias = flechas “esto antes que aquello”: un ordenamiento topológico da un orden válido.' },
    },
    {
      q: {
        en: 'Given tasks and pairs (a, b) meaning a must finish before b starts, decide whether all tasks can be completed.',
        es: 'Dadas tareas y pares (a, b) que significan que a debe terminar antes de que empiece b, decide si se pueden completar todas las tareas.',
      },
      why: {
        en: 'Possible exactly when the dependency graph has no cycle — run a topological sort and see if every task gets scheduled.',
        es: 'Es posible exactamente cuando el grafo de dependencias no tiene ciclos — ejecuta un ordenamiento topológico y mira si todas las tareas quedan programadas.',
      },
    },
  ],
};

export const unionFind: Pattern = {
  id: 'union-find',
  group: 'Graphs',
  order: 3,
  title: { en: 'Union-Find (Disjoint Sets)', es: 'Union-Find (conjuntos disjuntos)' },
  tagline: {
    en: 'Track which items belong to the same group while groups keep merging — in near-constant time.',
    es: 'Lleva la cuenta de qué elementos pertenecen al mismo grupo mientras los grupos se siguen fusionando — en tiempo casi constante.',
  },
  cues: [
    {
      en: 'has connections that are **added over time**, with "are X and Y connected yet?" asked in between',
      es: 'tiene conexiones que se **agregan con el tiempo**, preguntando entre medio "¿ya están conectados X e Y?"',
    },
    {
      en: 'asks for the number of groups after a series of **merges**: accounts merge, islands appear, friend circles',
      es: 'pide el número de grupos tras una serie de **fusiones**: cuentas que se fusionan, islas que aparecen, círculos de amigos',
    },
    { en: 'asks for the edge that creates a **cycle** in an undirected graph', es: 'pide la arista que crea un **ciclo** en un grafo no dirigido' },
    { en: 'is building a minimum spanning tree (Kruskal’s algorithm)', es: 'construye un árbol de expansión mínima (algoritmo de Kruskal)' },
    { en: 'only needs *whether* things are connected, never the actual path', es: 'solo necesita saber *si* las cosas están conectadas, nunca el camino en sí' },
  ],
  model: [
    {
      en: 'Union-Find answers one question — "are these two items in the same group?" — and supports one change — "merge these two groups". Nothing else. In exchange, both are almost O(1).',
      es: 'Union-Find responde una pregunta — "¿están estos dos elementos en el mismo grupo?" — y admite un cambio — "fusiona estos dos grupos". Nada más. A cambio, ambas operaciones son casi O(1).',
    },
    {
      en: 'Every group elects a **representative** (the root). Each item stores a `parent` pointer; follow parents until you reach an item that is its own parent: that is the root. `find(x)` returns the root of x. Two items are in the same group exactly when `find` gives the same root.',
      es: 'Cada grupo elige un **representante** (la raíz). Cada elemento guarda un puntero `parent`; sigue los padres hasta llegar a un elemento que sea su propio padre: esa es la raíz. `find(x)` devuelve la raíz de x. Dos elementos están en el mismo grupo exactamente cuando `find` da la misma raíz.',
    },
    {
      en: '`union(a, b)` finds both roots and, if they differ, makes one root the parent of the other. Two whole groups are merged by changing a single pointer.',
      es: '`union(a, b)` encuentra ambas raíces y, si son distintas, hace que una raíz sea el padre de la otra. Dos grupos enteros se fusionan cambiando un solo puntero.',
    },
    {
      en: 'Naively the parent chains can get long. Two tricks keep them tiny. **Union by size**: always attach the smaller group under the larger. **Path compression**: while walking up in `find`, re-point nodes closer to the root so the next walk is shorter.',
      es: 'De forma ingenua, las cadenas de padres pueden alargarse. Dos trucos las mantienen diminutas. **Unión por tamaño**: siempre cuelga el grupo más pequeño bajo el más grande. **Compresión de caminos**: mientras subes en `find`, reapunta los nodos más cerca de la raíz para que el siguiente recorrido sea más corto.',
    },
    {
      en: 'When to prefer it over DFS/BFS: when edges arrive one at a time and you need answers along the way. DFS would have to start over after every new edge; Union-Find just updates incrementally.',
      es: 'Cuándo preferirlo sobre DFS/BFS: cuando las aristas llegan de una en una y necesitas respuestas por el camino. DFS tendría que empezar de nuevo tras cada arista nueva; Union-Find simplemente se actualiza de forma incremental.',
    },
  ],
  template: `parent[i] = i for all i;  size[i] = 1

find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]     # path compression
        x = parent[x]
    return x

union(a, b):
    ra = find(a); rb = find(b)
    if ra == rb: return false             # already connected
    if size[ra] < size[rb]: swap(ra, rb)
    parent[rb] = ra;  size[ra] += size[rb]
    return true`,
  problems: [redundant],
  quiz: [
    {
      q: {
        en: 'Land cells are added to an empty ocean grid one at a time. After each addition, report the current number of islands.',
        es: 'Se agregan celdas de tierra a una cuadrícula de océano vacía, de una en una. Tras cada adición, informa el número actual de islas.',
      },
      why: {
        en: 'Groups merging as connections arrive over time, with a count asked after each step: Union-Find.',
        es: 'Grupos que se fusionan a medida que llegan conexiones, con un conteo pedido tras cada paso: Union-Find.',
      },
    },
    {
      q: {
        en: 'Given a list of accounts where each account has a name and emails, merge accounts that share at least one email.',
        es: 'Dada una lista de cuentas donde cada cuenta tiene un nombre y correos, fusiona las cuentas que comparten al menos un correo.',
      },
      why: {
        en: 'Sharing an email links two accounts into one group — repeated merging of groups is Union-Find.',
        es: 'Compartir un correo une dos cuentas en un grupo — fusionar grupos repetidamente es Union-Find.',
      },
    },
  ],
};
