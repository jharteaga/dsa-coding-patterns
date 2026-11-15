import code from './prefix-count.ts?code';
import { randInt } from '../../lib/ds';
import { Tracer, vars } from '../../lib/trace';
import type { Problem, Tone, View } from '../../types';

// #region scan
export function prefixCountsScan(words: string[], prefixes: string[]): number[] {
  return prefixes.map((prefix) => {
    let count = 0;
    for (const word of words) {
      if (word.startsWith(prefix)) count++; // compares up to prefix.length characters
    }
    return count;
  });
}
// #endregion

// #region trie
class TrieNode {
  children = new Map<string, TrieNode>();
  count = 0; // how many words pass through this node
}

export function prefixCounts(words: string[], prefixes: string[]): number[] {
  const root = new TrieNode();

  // Build: one node per character, shared by all words with the same prefix.
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      let next = node.children.get(ch);
      if (next === undefined) {
        next = new TrieNode(); // @create
        node.children.set(ch, next);
      }
      node = next;
      node.count++; // @count
    }
  }

  // Query: walk down one character at a time.
  return prefixes.map((prefix) => {
    let node = root;
    for (const ch of prefix) {
      const next = node.children.get(ch); // @walk
      if (next === undefined) return 0; // @dead
      node = next;
    }
    return node.count; // @answer
  });
}
// #endregion

type N = { id: number; ch: string; count: number; kids: Map<string, N> };

function trace(words: string[], prefixes: string[]) {
  const t = new Tracer();
  let ids = 0;
  const root: N = { id: ids++, ch: '•', count: 0, kids: new Map() };
  const view = (hl: [N, Tone][] = []): View => {
    const nodes: { id: number; val: string; kids: number[] }[] = [];
    const badges: Record<number, string> = {};
    const walk = (n: N) => {
      nodes.push({ id: n.id, val: n.ch, kids: [...n.kids.values()].map((k) => k.id) });
      if (n !== root) badges[n.id] = `×${n.count}`;
      n.kids.forEach(walk);
    };
    walk(root);
    return { kind: 'tree', label: { en: 'trie (×n = how many words pass through)', es: 'trie (×n = cuántas palabras pasan por aquí)' }, nodes, root: root.id, hl: Object.fromEntries(hl.map(([n, tone]) => [n.id, tone])), badges };
  };
  for (const word of words) {
    let node = root;
    const path: N[] = [];
    for (const ch of word) {
      let next = node.kids.get(ch);
      const created = !next;
      if (!next) node.kids.set(ch, (next = { id: ids++, ch, count: 0, kids: new Map() }));
      node = next;
      node.count++;
      path.push(node);
      t.add(created ? 'create' : 'count', created
          ? { en: `Insert "${word}": no "${ch}" branch here yet, so create a node for it.`, es: `Insertar "${word}": aquí todavía no hay rama "${ch}", así que crea un nodo para ella.` }
          : {
              en: `Insert "${word}": a "${ch}" branch already exists (shared with an earlier word) — reuse it and bump its counter to ${node.count}.`,
              es: `Insertar "${word}": ya existe una rama "${ch}" (compartida con una palabra anterior); reutilízala y sube su contador a ${node.count}.`,
            }, view(path.map((n, i): [N, Tone] => [n, i === path.length - 1 ? (created ? 'good' : 'active') : 'window'])), vars({ word }));
    }
  }
  const answers: number[] = [];
  for (const prefix of prefixes) {
    let node: N | undefined = root;
    const path: N[] = [];
    for (const ch of prefix) {
      const next: N | undefined = node.kids.get(ch);
      if (!next) {
        t.add('dead', { en: `Query "${prefix}": there is no "${ch}" branch from here, so **no word** starts with "${prefix}". Answer 0.`, es: `Consulta "${prefix}": no hay rama "${ch}" desde aquí, así que **ninguna palabra** empieza con "${prefix}". Respuesta 0.` }, view(path.map((n): [N, Tone] => [n, 'bad'])), vars({ prefix, answers }));
        node = undefined;
        break;
      }
      node = next;
      path.push(node);
      t.add('walk', { en: `Query "${prefix}": follow the "${ch}" branch.`, es: `Consulta "${prefix}": sigue la rama "${ch}".` }, view(path.map((n): [N, Tone] => [n, 'active'])), vars({ prefix, answers }));
    }
    answers.push(node ? node.count : 0);
    if (node) t.add('answer', { en: `Reached the end of "${prefix}". The counter on this node says **${node.count}** word(s) pass through it — that is the answer, without looking at any word.`, es: `Llegamos al final de "${prefix}". El contador de este nodo dice que **${node.count}** palabra(s) pasan por él: esa es la respuesta, sin mirar ninguna palabra.` }, view(path.map((n, i): [N, Tone] => [n, i === path.length - 1 ? 'good' : 'window'])), vars({ prefix, answers }));
  }
  t.add(undefined, { en: `All queries answered: **[${answers.join(', ')}]**. Each query cost only as many steps as the prefix has letters.`, es: `Todas las consultas respondidas: **[${answers.join(', ')}]**. Cada consulta costó solo tantos pasos como letras tiene el prefijo.` }, view(), vars({ answers }));
  return t.frames;
}

const randWord = (len: number) => Array.from({ length: len }, () => 'abcd'[randInt(0, 3)]).join('');

export const prefixCount: Problem = {
  id: 'prefix-count',
  title: { en: 'Count words with a given prefix (autocomplete)', es: 'Contar palabras con un prefijo dado (autocompletar)' },
  difficulty: 'Medium',
  statement: [
    { en: 'You are given a dictionary `words` and a list of `prefixes`. For each prefix, return how many words start with it. This is the core of autocomplete.', es: 'Recibes un diccionario `words` y una lista de `prefixes`. Para cada prefijo, devuelve cuántas palabras empiezan con él. Esto es el núcleo del autocompletado.' },
  ],
  examples: [{ input: 'words = ["car", "card", "care", "cat", "dog"], prefixes = ["car", "ca", "do", "x"]', output: '[3, 4, 1, 0]' }],
  insight:
    { en: 'Words that share a prefix share the **same first letters** — so store those letters once. A trie is a tree where each edge is a letter and every path from the root spells a prefix. All words starting with "car" pass through the same c → a → r node. If each node counts how many words pass through it, a prefix query is just a walk of `prefix.length` steps — independent of how many words are in the dictionary.', es: 'Las palabras que comparten un prefijo comparten las **mismas primeras letras**, así que guarda esas letras una sola vez. Un trie es un árbol donde cada arista es una letra y cada camino desde la raíz forma un prefijo. Todas las palabras que empiezan con "car" pasan por el mismo nodo c → a → r. Si cada nodo cuenta cuántas palabras pasan por él, una consulta de prefijo es solo un recorrido de `prefix.length` pasos, sin importar cuántas palabras tenga el diccionario.' },
  approaches: [
    {
      id: 'scan',
      label: { en: 'Check every word for every prefix', es: 'Revisar cada palabra para cada prefijo' },
      kind: 'brute',
      fn: prefixCountsScan,
      time: 'O(Q · N · L)',
      space: 'O(1)',
      note: { en: 'N words, Q queries, prefixes of length L. Each query re-reads the whole dictionary.', es: 'N palabras, Q consultas, prefijos de longitud L. Cada consulta vuelve a leer todo el diccionario.' },
    },
    {
      id: 'trie',
      label: { en: 'Trie with pass-through counters', es: 'Trie con contadores de paso' },
      kind: 'optimal',
      fn: prefixCounts,
      time: 'O(total letters)',
      space: 'O(total letters)',
      note: { en: 'Building costs one step per letter of every word. Each query then costs one step per letter of the prefix — O(L), no matter how large the dictionary is. The trade: extra memory for the nodes.', es: 'Construirlo cuesta un paso por cada letra de cada palabra. Luego cada consulta cuesta un paso por cada letra del prefijo: O(L), sin importar el tamaño del diccionario. A cambio: memoria extra para los nodos.' },
    },
  ],
  code,
  cases: [
    { name: { en: 'shared prefixes', es: 'prefijos compartidos' }, args: [['car', 'card', 'care', 'cat', 'dog'], ['car', 'ca', 'do', 'x']], expected: [3, 4, 1, 0] },
    { name: { en: 'no words', es: 'sin palabras' }, args: [[], ['a']], expected: [0] },
    { name: { en: 'no queries', es: 'sin consultas' }, args: [['a'], []], expected: [] },
    { name: { en: 'prefix equals a whole word', es: 'el prefijo es una palabra completa' }, args: [['apple'], ['apple']], expected: [1] },
    { name: { en: 'prefix longer than every word', es: 'prefijo más largo que todas las palabras' }, args: [['app'], ['apple']], expected: [0] },
    { name: { en: 'duplicate words count twice', es: 'las palabras duplicadas cuentan dos veces' }, args: [['hi', 'hi', 'him'], ['hi', 'h']], expected: [3, 3] },
    { name: { en: 'several single-letter prefixes', es: 'varios prefijos de una letra' }, args: [['a', 'b'], ['a', 'b', 'c']], expected: [1, 1, 0] },
    { name: { en: 'case sensitive', es: 'distingue mayúsculas' }, args: [['Apple', 'apple'], ['a', 'A']], expected: [1, 1] },
    { name: { en: 'single letters', es: 'letras sueltas' }, args: [['a', 'a', 'b'], ['a', 'b', 'ab']], expected: [2, 1, 0] },
    { name: { en: 'diverges on the last letter', es: 'se separa en la última letra' }, args: [['test', 'tent', 'team'], ['te', 'tes', 'ten', 'tea', 'tex']], expected: [3, 1, 1, 1, 0] },
  ],
  bench: {
    sizes: [100, 1000, 10_000],
    nLabel: { en: 'number of words (and of queries)', es: 'número de palabras (y de consultas)' },
    gen: (n) => [Array.from({ length: n }, () => randWord(randInt(3, 10))), Array.from({ length: n }, () => randWord(randInt(1, 6)))],
  },
  demo: {
    inputs: [
      { name: 'words', value: '["car", "card", "care", "cat", "dog"]' },
      { name: 'prefixes', value: '["car", "ca", "do", "cu"]' },
    ],
    validate: (words, prefixes) => {
      const ok = (a: unknown) => Array.isArray(a) && a.every((w) => typeof w === 'string' && /^[a-zA-Z]{1,6}$/.test(w));
      if (!ok(words) || !ok(prefixes)) return { en: 'Use lists of short words (letters only, up to 6 letters), e.g. ["car", "cat"].', es: 'Usa listas de palabras cortas (solo letras, hasta 6 letras), p. ej. ["car", "cat"].' };
      if ((words as string[]).length > 6 || (prefixes as string[]).length > 5) return { en: 'Use at most 6 words and 5 prefixes.', es: 'Usa como máximo 6 palabras y 5 prefijos.' };
      return null;
    },
    traces: { trie: trace },
  },
};
