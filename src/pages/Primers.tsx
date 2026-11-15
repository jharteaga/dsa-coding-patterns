import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RegionCode } from '../components/Code';
import { inline } from '../components/Prose';
import { numLocale, type L, type Locale } from '../i18n/text';
import { buildTree, type TreeNode } from '../lib/ds';
import code from '../lib/snippets.ts?code';
import { tree } from '../lib/trace';
import { useT } from '../state';
import type { Tone } from '../types';
import { ViewRenderer } from '../viz/Views';

const H = ({ children }: { children: ReactNode }) => <h2 className="section-h mt-8 text-xl font-bold">{children}</h2>;
/** A paragraph of bilingual prose with the `code` / **bold** / *em* markup. */
function Para({ children }: { children: L }) {
  const { tx } = useT();
  return <p className="prose-p mt-3 leading-relaxed">{inline(tx(children))}</p>;
}
function Bullets({ items, className = 'mt-3 list-disc space-y-2 pl-5' }: { items: L[]; className?: string }) {
  const { tx } = useT();
  return (
    <ul className={`prose-p leading-relaxed ${className}`}>
      {items.map((x, i) => (
        <li key={i}>{inline(tx(x))}</li>
      ))}
    </ul>
  );
}

// ---- Big O ----------------------------------------------------------------------
const CLASSES: { name: string; label: L; f: (n: number) => number; example: L; to?: string }[] = [
  {
    name: 'O(1)',
    label: { en: 'constant', es: 'constante' },
    f: () => 1,
    example: { en: 'Read array[i], hash map lookup, push/pop on a stack', es: 'Leer array[i], buscar en un mapa hash, push/pop en una pila' },
    to: '/pattern/prefix-sum-hash-map',
  },
  {
    name: 'O(log n)',
    label: { en: 'logarithmic', es: 'logarítmica' },
    f: (n) => Math.log2(n),
    example: { en: 'Binary search, one operation on a balanced tree or a heap', es: 'Búsqueda binaria, una operación en un árbol balanceado o en un montículo' },
    to: '/pattern/binary-search',
  },
  {
    name: 'O(n)',
    label: { en: 'linear', es: 'lineal' },
    f: (n) => n,
    example: {
      en: 'One pass over the input: two pointers, sliding window, tree traversal',
      es: 'Una pasada por la entrada: dos punteros, ventana deslizante, recorrido de un árbol',
    },
    to: '/pattern/sliding-window',
  },
  {
    name: 'O(n log n)',
    label: { en: 'linearithmic', es: 'linearítmica' },
    f: (n) => n * Math.log2(n),
    example: { en: 'Sorting (merge sort, quick sort), n heap operations', es: 'Ordenar (merge sort, quick sort), n operaciones de montículo' },
    to: '/pattern/fast-sorts',
  },
  {
    name: 'O(n²)',
    label: { en: 'quadratic', es: 'cuadrática' },
    f: (n) => n * n,
    example: { en: 'Two nested loops: every pair — the typical brute force', es: 'Dos bucles anidados: todos los pares, la fuerza bruta típica' },
    to: '/pattern/simple-sorts',
  },
  {
    name: 'O(2ⁿ)',
    label: { en: 'exponential', es: 'exponencial' },
    f: (n) => 2 ** n,
    example: { en: 'Every subset, naive recursion with two branches per step', es: 'Todos los subconjuntos, recursión ingenua con dos ramas por paso' },
    to: '/pattern/dynamic-programming',
  },
];

// English short scale vs Spanish long scale (un billón = 10¹²).
const UNITS: Record<Locale, [number, string, string][]> = {
  en: [
    [1e24, 'septillion', 'septillion'],
    [1e21, 'sextillion', 'sextillion'],
    [1e18, 'quintillion', 'quintillion'],
    [1e15, 'quadrillion', 'quadrillion'],
    [1e12, 'trillion', 'trillion'],
    [1e9, 'billion', 'billion'],
    [1e6, 'million', 'million'],
    [1e3, 'thousand', 'thousand'],
  ],
  es: [
    [1e24, 'cuatrillón', 'cuatrillones'],
    [1e21, 'mil trillones', 'mil trillones'],
    [1e18, 'trillón', 'trillones'],
    [1e15, 'mil billones', 'mil billones'],
    [1e12, 'billón', 'billones'],
    [1e9, 'mil millones', 'mil millones'],
    [1e6, 'millón', 'millones'],
    [1e3, 'mil', 'mil'],
  ],
};
const human = (x: number, locale: Locale) => {
  if (!Number.isFinite(x) || x > 1e30) return locale === 'es' ? 'más que átomos en el universo' : 'more than atoms in the universe';
  if (x < 1000) return String(Math.max(1, Math.round(x)));
  for (const [v, one, many] of UNITS[locale])
    if (x >= v) {
      const q = x / v;
      const digits = q < 10 ? 1 : 0;
      const shown = q.toLocaleString(numLocale(locale), { minimumFractionDigits: digits, maximumFractionDigits: digits });
      return `${shown} ${Number(q.toFixed(digits)) === 1 ? one : many}`;
    }
  return String(x);
};
const duration = (ops: number, locale: Locale) => {
  const es = locale === 'es';
  const dec = (x: number) => x.toLocaleString(numLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const s = ops / 1e8; // roughly 100 million simple steps per second
  if (!Number.isFinite(s) || s > 3.15e7 * 1e11) return es ? 'más tiempo que la edad del universo' : 'longer than the age of the universe';
  if (s < 0.001) return es ? 'instantáneo' : 'instant';
  if (s < 1) return `${Math.round(s * 1000)} ms`;
  if (s < 120) return `${dec(s)} s`;
  if (s < 7200) return `${Math.round(s / 60)} min`;
  if (s < 172800) return `${Math.round(s / 3600)} ${es ? 'horas' : 'hours'}`;
  if (s < 3.15e7) return `${Math.round(s / 86400)} ${es ? 'días' : 'days'}`;
  return `${human(s / 3.15e7, locale)} ${es ? 'años' : 'years'}`;
};

const LIMITS: [string, string, L][] = [
  ['10 – 20', '10 – 20', { en: 'O(2ⁿ) or O(n!) — backtracking over all subsets / permutations', es: 'O(2ⁿ) u O(n!): backtracking sobre todos los subconjuntos / permutaciones' }],
  ['100 – 500', '100 – 500', { en: 'O(n³) — e.g. a DP with three nested loops', es: 'O(n³): p. ej. una programación dinámica con tres bucles anidados' }],
  ['1,000 – 5,000', '1000 – 5000', { en: 'O(n²) — nested loops are fine', es: 'O(n²): los bucles anidados están bien' }],
  [
    '100,000 – 1,000,000',
    '100 000 – 1 000 000',
    {
      en: 'O(n log n) or O(n) — sort, heap, hash map, two pointers, sliding window',
      es: 'O(n log n) u O(n): ordenar, montículo, mapa hash, dos punteros, ventana deslizante',
    },
  ],
  ['1,000,000,000 or more', '1 000 000 000 o más', { en: 'O(log n) or O(1) — binary search on the answer, or a formula', es: 'O(log n) u O(1): búsqueda binaria sobre la respuesta, o una fórmula' }],
];

export function BigOPage() {
  const { locale, tx, nf } = useT();
  const es = locale === 'es';
  const [exp, setExp] = useState(3);
  const n = 10 ** exp;
  return (
    <article className="max-w-4xl">
      <h1 className="text-3xl font-extrabold tracking-tight">{es ? 'Big O en cinco minutos' : 'Big O in five minutes'}</h1>
      <Para>
        {{
          en: 'Big O answers one question: **when the input gets bigger, how much more work does the algorithm do?** It is not a stopwatch — it does not tell you milliseconds. It tells you the *shape* of the growth, which is what decides whether a solution still works when the input is a thousand times larger.',
          es: 'Big O responde una sola pregunta: **cuando la entrada crece, ¿cuánto trabajo más hace el algoritmo?** No es un cronómetro: no te dice milisegundos. Te dice la *forma* del crecimiento, que es lo que decide si una solución sigue funcionando cuando la entrada es mil veces más grande.',
        }}
      </Para>
      <Para>
        {{
          en: 'We call the input size `n` (the length of the array, the number of nodes…) and count roughly how many basic steps the algorithm takes as a formula in n. Then we keep only the part that grows fastest and drop constants: `3n² + 10n + 7` becomes `O(n²)`, because for large n the n² term drowns out everything else.',
          es: 'Llamamos `n` al tamaño de la entrada (la longitud del arreglo, el número de nodos…) y contamos aproximadamente cuántos pasos básicos da el algoritmo, como una fórmula en n. Luego nos quedamos solo con la parte que crece más rápido y descartamos las constantes: `3n² + 10n + 7` se convierte en `O(n²)`, porque para n grande el término n² opaca todo lo demás.',
        }}
      </Para>

      <H>{es ? 'Siente la diferencia' : 'Feel the difference'}</H>
      <div className="card mt-3 p-4">
        <label className="flex flex-wrap items-center gap-3 text-sm font-medium">
          {es ? 'Tamaño de la entrada' : 'Input size'} n = <b className="mono text-base">{nf(n)}</b>
          <input type="range" min={1} max={6} value={exp} onChange={(e) => setExp(+e.target.value)} className="min-w-40 flex-1 accent-indigo-600" />
        </label>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-(--line) text-xs text-(--ink-2)">
                <th className="py-1.5 pr-3 font-medium">{es ? 'Complejidad' : 'Complexity'}</th>
                <th className="py-1.5 pr-3 font-medium">{es ? 'Pasos para esta n' : 'Steps for this n'}</th>
                <th className="py-1.5 pr-3 font-medium">{es ? 'Tiempo a ~100 millones de pasos/s' : 'Time at ~100 million steps/s'}</th>
                <th className="py-1.5 font-medium">{es ? 'Dónde aparece' : 'Where you meet it'}</th>
              </tr>
            </thead>
            <tbody>
              {CLASSES.map((c) => (
                <tr key={c.name} className="border-b border-(--line) align-top last:border-0">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <b className="mono">{c.name}</b> <span className="text-xs text-(--ink-2)">{tx(c.label)}</span>
                  </td>
                  <td className="mono py-2 pr-3">{human(c.f(n), locale)}</td>
                  <td className="py-2 pr-3">{duration(c.f(n), locale)}</td>
                  <td className="py-2 text-(--ink-2)">
                    {tx(c.example)}
                    {c.to && (
                      <Link to={c.to} className="ml-1 text-indigo-600 dark:text-indigo-400">
                        →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-(--ink-2)">
          {es
            ? `Arrastra el control de 10 hasta ${nf(1_000_000)} y observa qué filas se mantienen pequeñas y cuáles explotan.`
            : 'Drag the slider from 10 up to 1,000,000 and watch which rows stay small and which explode.'}
        </p>
      </div>

      <H>{es ? 'Cómo deducirla a partir del código' : 'How to work it out from code'}</H>
      <Bullets
        items={[
          {
            en: '**A single loop over the input** is O(n). Two loops *one after the other* are still O(n) (n + n = 2n, constants are dropped).',
            es: '**Un solo bucle sobre la entrada** es O(n). Dos bucles *uno detrás del otro* siguen siendo O(n) (n + n = 2n, y las constantes se descartan).',
          },
          {
            en: '**A loop inside a loop**, both over the input, is O(n²). This is the signature of most brute-force solutions: “for each element, look at every other element”.',
            es: '**Un bucle dentro de otro**, ambos sobre la entrada, es O(n²). Es la firma de la mayoría de las soluciones de fuerza bruta: “para cada elemento, mira todos los demás”.',
          },
          {
            en: '**Halving the problem each step** is O(log n). You can only halve a million about 20 times.',
            es: '**Partir el problema a la mitad en cada paso** es O(log n). Un millón solo se puede partir a la mitad unas 20 veces.',
          },
          {
            en: '**Two recursive calls per call**, each on a problem only slightly smaller, is O(2ⁿ). Each level of the call tree doubles.',
            es: '**Dos llamadas recursivas por llamada**, cada una sobre un problema apenas más pequeño, es O(2ⁿ). Cada nivel del árbol de llamadas se duplica.',
          },
          {
            en: '**Hidden loops count.** `array.includes(x)`, `indexOf`, `shift()`, `splice`, string concatenation in a loop, and C#’s `List.Contains` / `RemoveAt(0)` are all O(n) each. Put one inside a loop and you have O(n²) without seeing two loops.',
            es: '**Los bucles ocultos cuentan.** `array.includes(x)`, `indexOf`, `shift()`, `splice`, concatenar cadenas en un bucle, y `List.Contains` / `RemoveAt(0)` de C# son O(n) cada uno. Mete uno dentro de un bucle y tendrás O(n²) sin ver dos bucles.',
          },
        ]}
      />

      <H>{es ? 'Complejidad espacial' : 'Space complexity'}</H>
      <Para>
        {{
          en: 'The same idea applied to **extra memory**: how much additional storage does the algorithm need as n grows, not counting the input itself? A few variables is O(1). A hash map or copy of the input is O(n). Recursion uses memory too — one stack frame per nested call, so a recursion n levels deep costs O(n) space even if it allocates nothing.',
          es: 'La misma idea aplicada a la **memoria extra**: ¿cuánto almacenamiento adicional necesita el algoritmo a medida que crece n, sin contar la propia entrada? Unas pocas variables es O(1). Un mapa hash o una copia de la entrada es O(n). La recursión también usa memoria: un marco de pila por cada llamada anidada, así que una recursión de n niveles cuesta O(n) de espacio aunque no reserve nada.',
        }}
      </Para>
      <Para>
        {{
          en: 'Speeding an algorithm up very often means **spending memory to save time** (remember things in a hash map instead of searching again). Many problems on this site show both: a faster solution, and then one that is equally fast with less memory.',
          es: 'Acelerar un algoritmo muy a menudo significa **gastar memoria para ahorrar tiempo** (recordar cosas en un mapa hash en lugar de buscar otra vez). Muchos problemas de este sitio muestran ambas cosas: una solución más rápida y luego otra igual de rápida con menos memoria.',
        }}
      </Para>

      <H>{es ? 'Tres advertencias honestas' : 'Three honest caveats'}</H>
      <Bullets
        items={[
          {
            en: '**Big O hides constants.** An O(n log n) algorithm in native code can beat an O(n) one written in plain JavaScript for the sizes you actually have. That is why every problem here has a benchmark: Big O predicts the curve, the stopwatch tells you where the curves cross.',
            es: '**Big O oculta las constantes.** Un algoritmo O(n log n) en código nativo puede ganarle a uno O(n) escrito en JavaScript simple para los tamaños que realmente tienes. Por eso cada problema aquí tiene un benchmark: Big O predice la curva y el cronómetro te dice dónde se cruzan las curvas.',
          },
          {
            en: '**It is usually the worst case.** Quick sort is O(n²) in the worst case but O(n log n) on average; a hash map lookup is O(1) on average.',
            es: '**Suele ser el peor caso.** Quick sort es O(n²) en el peor caso pero O(n log n) en promedio; una búsqueda en un mapa hash es O(1) en promedio.',
          },
          {
            en: '**“Amortized” O(1)** means an operation is occasionally expensive but cheap on average over a long sequence — like pushing onto a dynamic array that sometimes has to grow.',
            es: '**O(1) “amortizado”** significa que una operación es cara de vez en cuando pero barata en promedio a lo largo de una secuencia larga, como agregar a un arreglo dinámico que a veces tiene que crecer.',
          },
        ]}
      />

      <H>{es ? 'Lo que te dicen los límites de una entrevista' : 'What interview limits tell you'}</H>
      <div className="card mt-3 overflow-x-auto p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-(--line) text-xs text-(--ink-2)">
              <th className="py-1.5 pr-3 font-medium">{es ? 'Si n llega hasta…' : 'If n is up to…'}</th>
              <th className="py-1.5 font-medium">{es ? '…la solución esperada probablemente es' : '…the intended solution is probably'}</th>
            </tr>
          </thead>
          <tbody>
            {LIMITS.map(([aEn, aEs, b]) => (
              <tr key={aEn} className="border-b border-(--line) last:border-0">
                <td className="mono py-1.5 pr-3 whitespace-nowrap">{es ? aEs : aEn}</td>
                <td className="py-1.5">{tx(b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8">
        <Link to="/pattern/binary-search" className="card inline-block px-4 py-2 font-semibold hover:border-indigo-500">
          {es ? 'Míralo en acción: búsqueda lineal vs binaria →' : 'See it in action: linear vs binary search →'}
        </Link>
      </div>
    </article>
  );
}

// ---- Tree basics ------------------------------------------------------------------
const walk = (root: TreeNode | null, order: 'pre' | 'in' | 'post'): TreeNode[] => {
  if (!root) return [];
  const l = walk(root.left, order);
  const r = walk(root.right, order);
  return order === 'pre' ? [root, ...l, ...r] : order === 'in' ? [...l, root, ...r] : [...l, ...r, root];
};
const levels = (root: TreeNode | null): TreeNode[] => {
  const out: TreeNode[] = [];
  for (let q = root ? [root] : []; q.length; q = q.flatMap((n) => [n.left, n.right].filter(Boolean) as TreeNode[])) out.push(...q);
  return out;
};

const demoTree = buildTree([8, 4, 12, 2, 6, 10, 14, null, 3]);
const balanced = buildTree([4, 2, 6, 1, 3, 5, 7]);
const skewed = buildTree([1, null, 2, null, 3, null, 4, null, 5]);
const ORDERS: { id: 'pre' | 'in' | 'post' | 'level'; name: L; rule: L; use: L }[] = [
  {
    id: 'pre',
    name: { en: 'Pre-order', es: 'Preorden' },
    rule: { en: 'node, left subtree, right subtree', es: 'nodo, subárbol izquierdo, subárbol derecho' },
    use: {
      en: 'Copying or serialising a tree; passing information from parent to children.',
      es: 'Copiar o serializar un árbol; pasar información del padre a los hijos.',
    },
  },
  {
    id: 'in',
    name: { en: 'In-order', es: 'Inorden' },
    rule: { en: 'left subtree, node, right subtree', es: 'subárbol izquierdo, nodo, subárbol derecho' },
    use: { en: 'On a binary search tree this visits values in sorted order.', es: 'En un árbol binario de búsqueda visita los valores en orden.' },
  },
  {
    id: 'post',
    name: { en: 'Post-order', es: 'Postorden' },
    rule: { en: 'left subtree, right subtree, node', es: 'subárbol izquierdo, subárbol derecho, nodo' },
    use: {
      en: 'When a node needs its children’s answers first: heights, sizes, deleting a tree.',
      es: 'Cuando un nodo necesita primero las respuestas de sus hijos: alturas, tamaños, borrar un árbol.',
    },
  },
  {
    id: 'level',
    name: { en: 'Level-order (BFS)', es: 'Por niveles (BFS)' },
    rule: { en: 'top to bottom, left to right', es: 'de arriba abajo, de izquierda a derecha' },
    use: { en: 'Anything per level, and “nearest to the root” questions.', es: 'Cualquier cosa por nivel, y preguntas del tipo “lo más cercano a la raíz”.' },
  },
];

export function TreeBasicsPage() {
  const { locale, tx } = useT();
  const es = locale === 'es';
  const [order, setOrder] = useState<(typeof ORDERS)[number]['id']>('in');
  const [k, setK] = useState(0);
  const seq = order === 'level' ? levels(demoTree) : walk(demoTree, order);
  const shown = Math.min(k, seq.length);
  const marks: [TreeNode, Tone][] = seq.slice(0, shown).map((n, i) => [n, i === shown - 1 ? 'active' : 'done']);
  const info = ORDERS.find((o) => o.id === order)!;
  const root: L = { en: 'root', es: 'raíz' };
  const leaf: L = { en: 'leaf', es: 'hoja' };
  return (
    <article className="max-w-4xl">
      <h1 className="text-3xl font-extrabold tracking-tight">{es ? 'Árboles básicos' : 'Tree basics'}</h1>
      <Para>
        {{
          en: 'A **tree** is a set of nodes connected by parent → child links, starting from a single node at the top called the **root**. Unlike a family tree drawn on paper, computer-science trees grow downward. In a **binary tree** every node has at most two children, called **left** and **right**.',
          es: 'Un **árbol** es un conjunto de nodos conectados por enlaces padre → hijo, que parte de un único nodo en la parte superior llamado **raíz**. A diferencia de un árbol genealógico dibujado en papel, los árboles de la informática crecen hacia abajo. En un **árbol binario** cada nodo tiene como máximo dos hijos, llamados **izquierdo** y **derecho**.',
        }}
      </Para>

      <H>{es ? 'El vocabulario' : 'The vocabulary'}</H>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <ViewRenderer
            view={tree(
              demoTree,
              [
                [demoTree, 'active'],
                [demoTree!.left, 'compare'],
                [demoTree!.right, 'compare'],
              ],
              [
                [demoTree, root],
                [demoTree!.left!.left!.right, leaf],
                [demoTree!.left!.right, leaf],
                [demoTree!.right!.left, leaf],
                [demoTree!.right!.right, leaf],
              ],
            )}
          />
        </div>
        <Bullets
          className="space-y-2 text-sm"
          items={[
            { en: '**Root** — the top node (8). It has no parent.', es: '**Raíz**: el nodo superior (8). No tiene padre.' },
            { en: '**Child / parent** — 4 and 12 are the children of 8; 8 is their parent.', es: '**Hijo / padre**: 4 y 12 son los hijos de 8; 8 es su padre.' },
            { en: '**Leaf** — a node with no children (3, 6, 10, 14).', es: '**Hoja**: un nodo sin hijos (3, 6, 10, 14).' },
            {
              en: '**Subtree** — any node together with everything below it. The node 4 with 2, 3 and 6 is a complete tree in its own right. This is why recursion fits trees so well.',
              es: '**Subárbol**: cualquier nodo junto con todo lo que tiene debajo. El nodo 4 con 2, 3 y 6 es un árbol completo por sí mismo. Por eso la recursión encaja tan bien con los árboles.',
            },
            {
              en: '**Depth** of a node — how many steps down from the root (the root has depth 0; node 3 has depth 3).',
              es: '**Profundidad** de un nodo: cuántos pasos hacia abajo desde la raíz (la raíz tiene profundidad 0; el nodo 3 tiene profundidad 3).',
            },
            {
              en: '**Height** of a tree — the number of nodes on the longest root-to-leaf path (here 4). Written `h` in complexities.',
              es: '**Altura** de un árbol: el número de nodos en el camino más largo de la raíz a una hoja (aquí 4). Se escribe `h` en las complejidades.',
            },
            {
              en: '**null** — where a child is missing. Every recursive tree function starts by handling `null`.',
              es: '**null**: donde falta un hijo. Toda función recursiva sobre árboles empieza manejando `null`.',
            },
          ]}
        />
      </div>

      <H>{es ? 'En código' : 'In code'}</H>
      <Para>
        {{
          en: 'A node is a tiny object: a value and two references. The whole tree is reached through its root.',
          es: 'Un nodo es un objeto diminuto: un valor y dos referencias. Todo el árbol se alcanza a través de su raíz.',
        }}
      </Para>
      <div className="mt-3">
        <RegionCode code={code} region="treenode" />
      </div>
      <Para>
        {{
          en: 'On this site, trees in examples and test cases are written **level by level**, with `null` for a missing child: `[8, 4, 12, 2, 6, 10, 14, null, 3]` is the tree drawn above.',
          es: 'En este sitio, los árboles de los ejemplos y casos de prueba se escriben **nivel por nivel**, con `null` para un hijo que falta: `[8, 4, 12, 2, 6, 10, 14, null, 3]` es el árbol dibujado arriba.',
        }}
      </Para>

      <H>{es ? 'Las cuatro formas de visitar cada nodo' : 'The four ways to visit every node'}</H>
      <div className="card mt-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {ORDERS.map((o) => (
            <button
              key={o.id}
              onClick={() => (setOrder(o.id), setK(0))}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${o.id === order ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-(--line) text-(--ink-2) hover:border-indigo-500'}`}
            >
              {tx(o.name)}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm">
          <b>{tx(info.name)}:</b> {tx(info.rule)}. <span className="text-(--ink-2)">{tx(info.use)}</span>
        </p>
        <div className="mt-3">
          <ViewRenderer view={tree(demoTree, marks, seq.slice(0, shown).map((n, i): [TreeNode, string] => [n, `#${i + 1}`]))} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button onClick={() => setK(Math.max(0, shown - 1))} disabled={shown === 0} className="rounded-md border border-(--line) px-3 py-1 text-sm disabled:opacity-40">
            {es ? '◀ Atrás' : '◀ Back'}
          </button>
          <button onClick={() => setK(shown >= seq.length ? 0 : shown + 1)} className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white">
            {shown >= seq.length ? (es ? '↻ Reiniciar' : '↻ Restart') : es ? 'Visitar siguiente ▶' : 'Visit next ▶'}
          </button>
          <span className="mono text-sm">
            {es ? 'visitados' : 'visited'}: [{seq.slice(0, shown).map((n) => n.val).join(', ')}]
          </span>
        </div>
      </div>
      <Para>
        {{
          en: 'The first three are depth-first and differ only in where one line of code sits:',
          es: 'Las tres primeras son en profundidad y solo se diferencian en dónde va una línea de código:',
        }}
      </Para>
      <div className="mt-3">
        <RegionCode code={code} region="traversals" />
      </div>

      <H>{es ? 'Balanceado vs sesgado: por qué importa la altura' : 'Balanced vs skewed — why height matters'}</H>
      <Para>
        {{
          en: 'Many tree operations cost O(h): they follow one path from the root downward. How big is h? It depends entirely on the tree’s shape.',
          es: 'Muchas operaciones sobre árboles cuestan O(h): siguen un camino desde la raíz hacia abajo. ¿Qué tan grande es h? Depende por completo de la forma del árbol.',
        }}
      </Para>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="text-sm font-bold">{es ? 'Balanceado: 7 nodos, altura 3' : 'Balanced: 7 nodes, height 3'}</div>
          <ViewRenderer view={tree(balanced)} />
          <p className="text-sm text-(--ink-2)">
            {es
              ? 'Cada nivel tiene el doble de nodos que el de arriba, así que h ≈ log₂(n). Un millón de nodos → unos 20 niveles.'
              : 'Each level holds twice as many nodes as the one above, so h ≈ log₂(n). A million nodes → about 20 levels.'}
          </p>
        </div>
        <div className="card p-4">
          <div className="text-sm font-bold">{es ? 'Sesgado: 5 nodos, altura 5' : 'Skewed: 5 nodes, height 5'}</div>
          <ViewRenderer view={tree(skewed)} />
          <p className="text-sm text-(--ink-2)">
            {es
              ? 'Cada nodo tiene un solo hijo: es una lista enlazada disfrazada, h = n. Un millón de nodos → un millón de niveles, y la recursión puede desbordar la pila de llamadas.'
              : 'Every node has one child: it is a linked list in disguise, h = n. A million nodes → a million levels, and recursion may overflow the call stack.'}
          </p>
        </div>
      </div>
      <Para>
        {{
          en: 'So when you see `O(h)`, read it as “O(log n) if the tree is balanced, O(n) in the worst case”. Always test your tree code on a skewed tree, an empty tree and a single node.',
          es: 'Así que cuando veas `O(h)`, léelo como “O(log n) si el árbol está balanceado, O(n) en el peor caso”. Prueba siempre tu código de árboles con un árbol sesgado, un árbol vacío y un solo nodo.',
        }}
      </Para>

      <H>{es ? 'Las listas enlazadas usan la misma idea' : 'Linked lists use the same idea'}</H>
      <Para>{{ en: 'A linked list node is a tree node with only one child.', es: 'Un nodo de lista enlazada es un nodo de árbol con un solo hijo.' }}</Para>
      <div className="mt-3">
        <RegionCode code={code} region="listnode" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/pattern/tree-dfs" className="card px-4 py-2 font-semibold hover:border-indigo-500">
          {es ? 'Siguiente: DFS en árboles binarios →' : 'Next: Binary Tree DFS →'}
        </Link>
        <Link to="/pattern/tree-bfs" className="card px-4 py-2 font-semibold hover:border-indigo-500">
          {es ? 'BFS en árboles binarios →' : 'Binary Tree BFS →'}
        </Link>
        <Link to="/pattern/bst" className="card px-4 py-2 font-semibold hover:border-indigo-500">
          {es ? 'Árboles binarios de búsqueda →' : 'Binary Search Trees →'}
        </Link>
      </div>
    </article>
  );
}
