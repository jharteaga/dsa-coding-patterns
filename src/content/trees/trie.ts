import type { Pattern } from '../../types';
import { prefixCount } from './prefix-count';

export const trie: Pattern = {
  id: 'trie',
  group: 'Trees',
  order: 4,
  title: { en: 'Trie (prefix tree)', es: 'Trie (árbol de prefijos)' },
  tagline: { en: 'A tree of letters: words that start the same way share the same path.', es: 'Un árbol de letras: las palabras que empiezan igual comparten el mismo camino.' },
  cues: [
    { en: 'talks about **prefixes**: "starts with", autocomplete, type-ahead, search suggestions', es: 'habla de **prefijos**: "empieza con", autocompletar, sugerencias mientras escribes, sugerencias de búsqueda' },
    { en: 'has a **dictionary of words** that is queried many times', es: 'tiene un **diccionario de palabras** que se consulta muchas veces' },
    { en: 'asks for word search with wildcards, longest common prefix, or replacing words by their shortest root', es: 'pide buscar palabras con comodines, el prefijo común más largo, o reemplazar palabras por su raíz más corta' },
    { en: 'searches a letter grid for many words at once', es: 'busca muchas palabras a la vez en una cuadrícula de letras' },
  ],
  model: [
    { en: 'A trie (pronounced "try") is a tree where each node stands for one character and each path from the root spells a string. Insert "car", "card" and "cat" and you get c → a, which then splits into r (→ d) and t. The shared beginning "ca" is stored once.', es: 'Un trie (se pronuncia "trai") es un árbol donde cada nodo representa un carácter y cada camino desde la raíz forma una cadena. Inserta "car", "card" y "cat" y obtienes c → a, que luego se divide en r (→ d) y t. El comienzo compartido "ca" se guarda una sola vez.' },
    { en: 'Each node holds a small map from character to child node, plus whatever the problem needs: a flag "a word ends here", or a counter "this many words pass through here".', es: 'Cada nodo guarda un pequeño mapa de carácter a nodo hijo, más lo que necesite el problema: una bandera "aquí termina una palabra" o un contador "tantas palabras pasan por aquí".' },
    { en: 'The payoff: looking up a word or prefix of length L takes L steps, **regardless of how many words are stored**. A hash set can tell you whether a whole word exists, but it cannot answer "which words start with…" without scanning everything. A trie can.', es: 'La ventaja: buscar una palabra o prefijo de longitud L toma L pasos, **sin importar cuántas palabras haya guardadas**. Un conjunto hash puede decirte si existe una palabra completa, pero no puede responder "qué palabras empiezan con…" sin revisarlo todo. Un trie sí.' },
    { en: 'The cost is memory — one node per distinct prefix — and the build time, one step per letter of every word. It pays off when there are many queries against the same dictionary.', es: 'El costo es la memoria (un nodo por cada prefijo distinto) y el tiempo de construcción, un paso por cada letra de cada palabra. Vale la pena cuando hay muchas consultas sobre el mismo diccionario.' },
  ],
  template: `class Node: children = {}   # char -> Node
            isWord = false   # or a counter

insert(word):
    node = root
    for ch in word:
        if ch not in node.children: node.children[ch] = new Node
        node = node.children[ch]
    node.isWord = true

find(prefix):                # returns the node for that prefix, or null
    node = root
    for ch in prefix:
        if ch not in node.children: return null
        node = node.children[ch]
    return node`,
  problems: [prefixCount],
  quiz: [
    { q: { en: 'Design a search box that, as the user types, suggests up to three products whose names start with what has been typed so far.', es: 'Diseña un cuadro de búsqueda que, mientras el usuario escribe, sugiera hasta tres productos cuyos nombres empiecen con lo escrito hasta ese momento.' }, why: { en: '“Starts with what has been typed” = repeated prefix queries against a fixed dictionary: a trie.', es: '“Empieza con lo escrito” = consultas de prefijo repetidas sobre un diccionario fijo: un trie.' } },
    { q: { en: 'Design a data structure that supports addWord(word) and search(pattern), where the pattern may contain "." matching any letter.', es: 'Diseña una estructura de datos que soporte addWord(word) y search(pattern), donde el patrón puede contener "." que coincide con cualquier letra.' }, why: { en: 'A word dictionary searched character by character, with branching on wildcards — a trie walked with DFS.', es: 'Un diccionario de palabras recorrido carácter por carácter, ramificando en los comodines: un trie recorrido con DFS.' } },
  ],
};
