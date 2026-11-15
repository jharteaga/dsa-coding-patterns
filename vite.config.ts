import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs/promises';
import tsBlankSpace from 'ts-blank-space';
import * as prettier from 'prettier';

// ---------------------------------------------------------------------------
// `import code from './problem.ts?code'`
// Reads the `// #region <name>` blocks of problem.ts (and of problem.cs next to
// it) and returns display-ready source for TypeScript, JavaScript and C#.
// JavaScript is generated from the TypeScript by erasing the types, so the two
// can never drift apart. Trailing `// @step` comments are removed and turned
// into a step -> line-numbers map used by the animation player.
// ---------------------------------------------------------------------------
type Block = { code: string; steps: Record<string, number[]> };

function regions(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /^[ \t]*\/\/ ?#region (\S+)[^\n]*\n([\s\S]*?)^[ \t]*\/\/ ?#endregion/gm;
  for (const m of src.matchAll(re)) out[m[1]] = m[2].replace(/^export /gm, '').trimEnd();
  return out;
}

function extractSteps(code: string): Block {
  const steps: Record<string, number[]> = {};
  const lines = code.split('\n').map((line, i) => {
    const m = line.match(/\s*\/\/ @([\w-]+)\s*$/);
    if (!m) return line;
    (steps[m[1]] ??= []).push(i);
    return line.slice(0, m.index);
  });
  return { code: lines.join('\n'), steps };
}

const fmt = { singleQuote: true, printWidth: 100 } as const;

function codePlugin(): Plugin {
  return {
    name: 'dsa-code',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith('?code')) return;
      const file = id.slice(0, -'?code'.length);
      const csFile = file.replace(/\.ts$/, '.cs');
      this.addWatchFile(file);
      this.addWatchFile(csFile);
      const tsSrc = regions(await fs.readFile(file, 'utf8'));
      const csSrc = regions(await fs.readFile(csFile, 'utf8').catch(() => ''));
      const out: Record<'ts' | 'js' | 'cs', Record<string, Block>> = { ts: {}, js: {}, cs: {} };
      for (const [name, code] of Object.entries(tsSrc)) {
        const ts = await prettier.format(code, { ...fmt, parser: 'typescript' });
        const js = await prettier.format(tsBlankSpace(code), { ...fmt, parser: 'babel' });
        out.ts[name] = extractSteps(ts.trimEnd());
        out.js[name] = extractSteps(js.trimEnd());
      }
      for (const [name, code] of Object.entries(csSrc)) out.cs[name] = extractSteps(code);
      return `export default ${JSON.stringify(out)}`;
    },
  };
}

export default defineConfig({
  // Relative base so the site works from a GitHub Pages sub-path (the app uses HashRouter).
  base: './',
  plugins: [codePlugin(), react(), tailwindcss()],
  // Cross-origin isolation gives performance.now() ~5µs resolution instead of ~100µs.
  server: {
    headers: { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' },
  },
  preview: {
    headers: { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' },
  },
  worker: { format: 'es', plugins: () => [codePlugin()] },
  test: { include: ['src/**/*.test.ts'] },
});
