import type { Pattern } from '../../types';
import { minStack } from './min-stack';
import { validParens } from './valid-parens';

export const stackBasics: Pattern = {
  id: 'stack-basics',
  group: 'Stacks',
  order: 1,
  title: { en: 'Stack Fundamentals (LIFO)', es: 'Fundamentos de pilas (LIFO)' },
  tagline: { en: 'Last in, first out. Use it whenever the most recent thing must be handled first.', es: 'Último en entrar, primero en salir. Úsala siempre que lo más reciente deba atenderse primero.' },
  cues: [
    { en: 'involves **matching pairs or nesting**: brackets, HTML tags, nested function calls', es: 'involucra **pares que se emparejan o anidamiento**: paréntesis, etiquetas HTML, llamadas a funciones anidadas' },
    {
      en: 'needs to **undo** or backtrack to the previous state: undo/redo, browser back button, path simplification',
      es: 'necesita **deshacer** o volver al estado anterior: deshacer/rehacer, el botón atrás del navegador, simplificación de rutas',
    },
    {
      en: 'evaluates expressions (reverse Polish notation, calculators) or decodes nested strings like `3[a2[c]]`',
      es: 'evalúa expresiones (notación polaca inversa, calculadoras) o decodifica cadenas anidadas como `3[a2[c]]`',
    },
    { en: 'converts recursion into a loop — every recursive algorithm is secretly using a stack', es: 'convierte recursión en un bucle — todo algoritmo recursivo usa una pila en secreto' },
  ],
  model: [
    {
      en: 'A stack is a pile of plates: you add to the top and take from the top. The last thing you put down is the first thing you pick up — **L**ast **I**n, **F**irst **O**ut.',
      es: 'Una pila es un montón de platos: agregas arriba y tomas de arriba. Lo último que dejas es lo primero que levantas — **L**ast **I**n, **F**irst **O**ut (último en entrar, primero en salir).',
    },
    {
      en: 'It has three operations, all O(1): `push` (put on top), `pop` (take off the top), `peek`/`top` (look at the top without removing). In JavaScript an array is a stack if you only use `push` and `pop`. C# has `Stack<T>`.',
      es: 'Tiene tres operaciones, todas O(1): `push` (poner arriba), `pop` (quitar de arriba), `peek`/`top` (mirar la cima sin quitarla). En JavaScript un arreglo es una pila si solo usas `push` y `pop`. C# tiene `Stack<T>`.',
    },
    {
      en: 'Reach for a stack when the element you need next is always the **most recent unfinished one**. In `{[()]}` the `)` must close the `(` — the latest opener — not the `{` that came first.',
      es: 'Recurre a una pila cuando el elemento que necesitas a continuación es siempre el **más reciente sin terminar**. En `{[()]}` el `)` debe cerrar el `(` — el último que abrió — no el `{` que llegó primero.',
    },
    {
      en: 'Stacks also remember "where was I?" When you go deeper (open a bracket, enter a function, descend into a tree) you push; when you come back out you pop, and the previous context is waiting on top. That is literally how function calls work — hence the name *call stack*.',
      es: 'Las pilas también recuerdan "¿dónde estaba?". Cuando profundizas (abres un paréntesis, entras a una función, bajas por un árbol) apilas; cuando vuelves a salir desapilas, y el contexto anterior te espera en la cima. Así funcionan literalmente las llamadas a funciones — de ahí el nombre *pila de llamadas* (call stack).',
    },
  ],
  template: `stack = []
for item in input:
    if item opens / starts something:
        stack.push(item)
    else:                              # item closes / finishes something
        if stack is empty: fail
        top = stack.pop()
        check that top matches item
return stack is empty                  # nothing left unfinished`,
  problems: [validParens, minStack],
  quiz: [
    {
      q: {
        en: 'Given a string of HTML-like tags such as <a><b></b></a>, check that every opening tag is closed in the correct order.',
        es: 'Dada una cadena de etiquetas tipo HTML como <a><b></b></a>, comprueba que cada etiqueta de apertura se cierre en el orden correcto.',
      },
      why: {
        en: 'Nested matching pairs: a closing tag must match the most recently opened one — a stack.',
        es: 'Pares anidados que se emparejan: una etiqueta de cierre debe coincidir con la abierta más recientemente — una pila.',
      },
    },
    {
      q: {
        en: 'Evaluate an arithmetic expression written in reverse Polish notation, e.g. ["2", "1", "+", "3", "*"].',
        es: 'Evalúa una expresión aritmética escrita en notación polaca inversa, p. ej. ["2", "1", "+", "3", "*"].',
      },
      why: {
        en: 'Each operator applies to the two most recent values: push numbers, pop two on an operator, push the result.',
        es: 'Cada operador se aplica a los dos valores más recientes: apila los números, desapila dos ante un operador y apila el resultado.',
      },
    },
    {
      q: {
        en: 'Simplify a Unix file path such as "/a/./b/../../c/" to its canonical form.',
        es: 'Simplifica una ruta de archivo Unix como "/a/./b/../../c/" a su forma canónica.',
      },
      why: {
        en: '".." means undo the most recent directory — push directory names, pop on "..".',
        es: '".." significa deshacer el directorio más reciente — apila los nombres de directorio y desapila ante "..".',
      },
    },
  ],
};
