# DSA Patterns

An interactive site for learning the coding patterns behind data-structure and algorithm problems:
how to recognise each pattern, the brute-force solution, the insight, and the optimal solution —
with step-by-step animations, test cases and in-browser timings. Code is shown in JavaScript,
TypeScript and C#.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the app |
| `npm test` | Run every solution against its test cases, compare approaches on random inputs, check the animations |
| `npm run check:csharp` | Compile every C# snippet (needs the .NET SDK) |
| `npm run build` | Type-check and build for production into `dist/` |

## How the content is organised

Each problem is two files in `src/content/<group>/`:

- `name.ts` — the real, executed TypeScript solutions (inside `// #region <approach>` blocks), the test
  cases, the benchmark input generator, the animation trace and the explanations.
- `name.cs` — the same approaches in C#, in regions with the same names.

JavaScript is generated from the TypeScript by erasing the types (see the plugin in `vite.config.ts`),
so the two cannot drift. C# cannot run in a browser: it is display-only, and all timings come from the
JavaScript engine.

A trailing `// @step-name` comment marks the line the animation highlights for that step; it is stripped
before the code is displayed and must exist in all three languages (the test suite checks this).

A pattern is a file exporting a `Pattern` object that lists its problems; it is picked up automatically.
