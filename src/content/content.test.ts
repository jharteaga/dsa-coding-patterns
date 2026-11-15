import { describe, expect, it } from 'vitest';
import { same } from '../lib/equal';
import { runOnce } from '../runner/run';
import { hasTerm } from '../i18n/terms';
import { isL, tx, type Text } from '../i18n/text';
import type { Frame, Pattern, Problem, View } from '../types';
import { patterns } from './registry';

const en = (x: Text) => tx(x, 'en');

for (const pattern of patterns) {
  describe(en(pattern.title), () => {
    for (const p of pattern.problems) {
      describe(en(p.title), () => {
        for (const ap of p.approaches) {
          it(`${en(ap.label)}: passes all ${p.cases.length} cases`, () => {
            for (const c of p.cases) expect({ case: en(c.name), got: runOnce(p, ap, c.args) }).toEqual({ case: en(c.name), got: c.expected });
          });
          it(`${en(ap.label)}: has source in all three languages`, () => {
            for (const lang of ['ts', 'js', 'cs'] as const) expect(p.code[lang][ap.id]?.code.length ?? 0, `${lang} ${ap.id}`).toBeGreaterThan(10);
          });
        }
        if (p.bench) {
          it('all approaches agree on random inputs', () => {
            const small = Math.min(p.bench!.sizes[0], 14);
            for (let round = 0; round < 25; round++) {
              const args = p.bench!.gen(round < 3 ? round + 1 : small);
              const results = p.approaches.map((ap) => runOnce(p, ap, args));
              for (const r of results) if (!same(r, results[0])) expect({ args, got: r }).toEqual({ args, got: results[0] });
            }
          });
        }
        if (p.demo) {
          it('animation traces run and reference real code steps', () => {
            const args = p.demo!.inputs.map((i) => JSON.parse(i.value));
            expect(p.demo!.validate?.(...args) ?? null).toBeNull();
            for (const [id, trace] of Object.entries(p.demo!.traces)) {
              const frames = trace(...structuredClone(args));
              expect(frames.length).toBeGreaterThan(1);
              for (const lang of ['ts', 'js', 'cs'] as const)
                for (const f of frames) if (f.step) expect(Object.keys(p.code[lang][id].steps), `${lang} ${id}`).toContain(f.step);
            }
          });
        }
      });
    }
  });
}

it('problem ids are unique', () => {
  const ids = patterns.flatMap((p) => p.problems.map((x) => x.id));
  expect(new Set(ids).size).toBe(ids.length);
});

// ---- Spanish completeness -----------------------------------------------------
// Every human-language string must be bilingual ({ en, es }). Plain strings are only
// allowed in animation views for identifiers / values such as "nums" or "i = 3".
const looksLikeProse = (s: string) => /[A-Za-z]{2,}[\s,]+[A-Za-z]{2,}/.test(s);

function checkText(x: Text | undefined, where: string, errs: string[], strict = true) {
  if (x === undefined) return;
  if (isL(x)) {
    if (!x.en.trim() || !x.es.trim()) errs.push(`${where}: empty translation`);
    else if (x.en.length > 40 && x.en === x.es) errs.push(`${where}: Spanish identical to English: ${x.en.slice(0, 60)}`);
  } else if (strict || looksLikeProse(x)) errs.push(`${where}: not translated: ${String(x).slice(0, 60)}`);
}

/** plain-string identifiers (var/pointer/input names, grid labels) need an entry in i18n/terms.ts when they read as prose */
function checkTerm(s: unknown, where: string, errs: string[]) {
  if (typeof s === 'string' && /[A-Za-z]{2,}/.test(s) && /\s/.test(s) && !hasTerm(s)) errs.push(`${where}: add to i18n/terms.ts: ${s}`);
}

function checkView(v: View, where: string, errs: string[]) {
  checkText(v.label, `${where} label`, errs, false);
  if (v.kind === 'vars') for (const [k] of v.items) checkTerm(k, `${where} var name`, errs);
  if (v.kind === 'array' || v.kind === 'list') for (const k of Object.keys(v.pointers ?? {})) checkTerm(k, `${where} pointer`, errs);
  if (v.kind === 'grid') for (const k of [...(v.rowLabels ?? []), ...(v.colLabels ?? [])]) checkTerm(k, `${where} grid label`, errs);
  if (v.kind === 'vars') for (const [k, val] of v.items) checkText(val, `${where} var ${k}`, errs, false);
  if ((v.kind === 'tree' || v.kind === 'graph') && v.badges) for (const b of Object.values(v.badges)) checkText(b, `${where} badge`, errs, false);
}

function checkProblem(p: Problem, errs: string[]) {
  const w = `problem ${p.id}`;
  checkText(p.title, `${w} title`, errs);
  p.statement.forEach((s, i) => checkText(s, `${w} statement[${i}]`, errs));
  p.examples?.forEach((e, i) => checkText(e.why, `${w} example[${i}].why`, errs));
  checkText(p.insight, `${w} insight`, errs);
  for (const a of p.approaches) {
    checkText(a.label, `${w} approach ${a.id} label`, errs);
    checkText(a.note, `${w} approach ${a.id} note`, errs);
  }
  p.cases.forEach((c, i) => checkText(c.name, `${w} case[${i}]`, errs));
  checkText(p.bench?.nLabel, `${w} bench.nLabel`, errs);
  if (p.demo) {
    for (const inp of p.demo.inputs) checkTerm(inp.name, `${w} demo input`, errs);
    const args = p.demo.inputs.map((i) => JSON.parse(i.value));
    for (const [id, trace] of Object.entries(p.demo.traces)) {
      const frames: Frame[] = trace(...structuredClone(args));
      frames.forEach((f, k) => {
        checkText(f.caption, `${w} trace ${id} frame ${k} caption`, errs);
        f.views.forEach((v) => checkView(v, `${w} trace ${id} frame ${k}`, errs));
      });
    }
    // a validation error for nonsense input must be bilingual too
    let bad: Text | null = null;
    try {
      bad = p.demo.validate?.(...p.demo.inputs.map(() => null)) ?? null;
    } catch {
      /* validator assumed well-formed input */
    }
    if (bad !== null) checkText(bad, `${w} validate(null…)`, errs);
  }
}

function checkPattern(pt: Pattern, errs: string[]) {
  const w = `pattern ${pt.id}`;
  checkText(pt.title, `${w} title`, errs);
  checkText(pt.tagline, `${w} tagline`, errs);
  pt.cues.forEach((c, i) => checkText(c, `${w} cue[${i}]`, errs));
  pt.model.forEach((c, i) => checkText(c, `${w} model[${i}]`, errs));
  checkText(pt.helper?.title, `${w} helper.title`, errs);
  pt.quiz.forEach((q, i) => (checkText(q.q, `${w} quiz[${i}].q`, errs), checkText(q.why, `${w} quiz[${i}].why`, errs)));
  for (const p of pt.problems) checkProblem(p, errs);
}

describe('Spanish translations', () => {
  for (const pt of patterns)
    it(`${pt.id} is fully translated`, () => {
      const errs: string[] = [];
      checkPattern(pt, errs);
      expect(errs).toEqual([]);
    });
});
