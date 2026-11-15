import { useT } from '../state';
import type { Cell, Text, Tone, View } from '../types';

const tc = (t?: Tone) => `tone-${t ?? 'none'}`;
const txt = (v: Cell) => (v === null ? '∅' : String(v));

function Label({ children }: { children?: Text }) {
  const { tx } = useT();
  return children ? <div className="mb-1 text-xs font-semibold tracking-wide text-(--ink-2) uppercase">{tx(children)}</div> : null;
}

// ---- array (row / bars / stack) ----------------------------------------------
function ArrayView({ v }: { v: Extract<View, { kind: 'array' }> }) {
  const { t, tm } = useT();
  const ptrAt: Record<number, string[]> = {};
  for (const [name, i] of Object.entries(v.pointers ?? {})) (ptrAt[i] ??= []).push(name);
  const extra = Object.keys(ptrAt).some((i) => +i >= v.values.length);
  const n = v.values.length + (extra ? 1 : 0);

  if (v.layout === 'stack') {
    return (
      <div>
        <Label>{v.label}</Label>
        <div className="inline-flex min-h-12 min-w-16 flex-col-reverse gap-1 rounded-b-lg border-x-2 border-b-2 border-(--line) px-2 pt-3 pb-2">
          {v.values.length === 0 && <div className="mono px-2 text-xs text-(--ink-2)">{t.views.empty}</div>}
          {v.values.map((x, i) => (
            <div key={i} className={`box mono rounded px-3 py-1 text-center text-sm font-semibold ${tc(v.hl?.[i])}`}>
              {txt(x)}
              {i === v.values.length - 1 && <span className="ml-2 text-[10px] font-normal opacity-70">{t.views.top}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const nums = v.values.filter((x): x is number => typeof x === 'number');
  const lo = Math.min(0, ...nums);
  const hi = Math.max(1, ...nums);
  const bars = v.layout === 'bars';
  return (
    <div>
      <Label>{v.label}</Label>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex items-end gap-1">
          {v.values.length === 0 && !extra && <div className="mono text-xs text-(--ink-2)">[ ] empty</div>}
          {Array.from({ length: n }, (_, i) => {
            const ghost = i >= v.values.length;
            const x = v.values[i];
            return (
              <div key={i} className="flex min-w-9 flex-col items-center">
                <div className="mono flex min-h-5 flex-col items-center text-[11px] leading-tight font-bold text-indigo-600 dark:text-indigo-300">
                  {(ptrAt[i] ?? []).map((p) => (
                    <span key={p}>{tm(p)}</span>
                  ))}
                  {ptrAt[i] && <span className="-mt-1">↓</span>}
                </div>
                {bars && !ghost && typeof x === 'number' ? (
                  <>
                    <div className={`box w-7 rounded-t ${tc(v.hl?.[i])}`} style={{ height: 10 + ((x - lo) / (hi - lo || 1)) * 110 }} />
                    <div className="mono mt-0.5 text-[11px]">{x}</div>
                  </>
                ) : (
                  <div
                    className={`box mono flex h-9 min-w-9 items-center justify-center rounded px-1.5 text-sm font-semibold ${ghost ? 'border-dashed! opacity-40' : ''} ${tc(v.hl?.[i])}`}
                  >
                    {ghost ? '' : txt(x)}
                  </div>
                )}
                <div className="mono text-[10px] text-(--ink-2)">{ghost ? 'end' : i}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- tree (binary or n-ary) --------------------------------------------------
function TreeView({ v }: { v: Extract<View, { kind: 'tree' }> }) {
  const { t, tx } = useT();
  const DX = 46;
  const DY = 58;
  const R = 17;
  const byId = new Map(v.nodes.map((n) => [n.id, n]));
  const pos = new Map<number, { x: number; y: number }>();
  let cursor = 0;
  let depthMax = 0;
  const place = (id: number, depth: number): number => {
    const node = byId.get(id)!;
    depthMax = Math.max(depthMax, depth);
    let x: number;
    if (node.kids.length === 0) x = cursor++;
    else {
      const xs = node.kids.map((k) => {
        if (k === null) {
          cursor += 0.5;
          return cursor - 0.75;
        }
        return place(k, depth + 1);
      });
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    pos.set(id, { x, y: depth });
    return x;
  };
  if (v.root !== null && byId.has(v.root)) place(v.root, 0);
  const W = Math.max(cursor, 1) * DX + 40;
  const H = (depthMax + 1) * DY + 6;
  const px = (id: number) => pos.get(id)!.x * DX + DX / 2 + 20;
  const py = (id: number) => pos.get(id)!.y * DY + R + 6;
  return (
    <div>
      <Label>{v.label}</Label>
      {v.root === null ? (
        <div className="mono text-xs text-(--ink-2)">{t.views.emptyTree}</div>
      ) : (
        <div className="overflow-x-auto">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 'none' }}>
            {v.nodes.flatMap((n) =>
              n.kids.filter((k): k is number => k !== null && pos.has(k)).map((k) => (
                <line key={`${n.id}-${k}`} className="svg-edge" x1={px(n.id)} y1={py(n.id)} x2={px(k)} y2={py(k)} />
              )),
            )}
            {v.nodes
              .filter((n) => pos.has(n.id))
              .map((n) => (
                <g key={n.id} className={tc(v.hl?.[n.id])}>
                  <circle className="svg-box" cx={px(n.id)} cy={py(n.id)} r={R} />
                  <text className="svg-txt" x={px(n.id)} y={py(n.id)}>
                    {txt(n.val)}
                  </text>
                  {v.badges?.[n.id] !== undefined && (
                    <text className="svg-ptr" x={px(n.id)} y={py(n.id) + R + 11}>
                      {tx(v.badges[n.id])}
                    </text>
                  )}
                </g>
              ))}
          </svg>
        </div>
      )}
    </div>
  );
}

// ---- grid --------------------------------------------------------------------
function GridView({ v }: { v: Extract<View, { kind: 'grid' }> }) {
  const { tm } = useT();
  return (
    <div>
      <Label>{v.label}</Label>
      <div className="overflow-x-auto">
        <table className="mono border-separate border-spacing-1 text-sm">
          <tbody>
            {v.colLabels && (
              <tr>
                {v.rowLabels && <td />}
                {v.colLabels.map((c, i) => (
                  <td key={i} className="text-center text-[10px] text-(--ink-2)">
                    {txt(c)}
                  </td>
                ))}
              </tr>
            )}
            {v.cells.map((row, r) => (
              <tr key={r}>
                {v.rowLabels && <td className="pr-1 text-right text-[10px] text-(--ink-2)">{tm(txt(v.rowLabels[r]))}</td>}
                {row.map((x, c) => (
                  <td key={c} className={`box h-9 min-w-9 rounded px-1 text-center font-semibold ${tc(v.hl?.[`${r},${c}`])}`}>
                    {x === null ? '' : String(x)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- linked list ---------------------------------------------------------------
function ListView({ v }: { v: Extract<View, { kind: 'list' }> }) {
  const { tm } = useT();
  const DX = 72;
  const BW = 40;
  const BH = 32;
  const top = 34;
  const idx = new Map(v.nodes.map((n, i) => [n.id, i]));
  const ptrAt: Record<number, string[]> = {};
  const nullPtrs: string[] = [];
  for (const [name, id] of Object.entries(v.pointers ?? {})) {
    if (id === null || !idx.has(id)) nullPtrs.push(name);
    else (ptrAt[id] ??= []).push(name);
  }
  const W = Math.max(v.nodes.length, 1) * DX + 30;
  const cx = (i: number) => i * DX + BW / 2 + 6;
  const cy = top + BH / 2;
  return (
    <div>
      <Label>{v.label}</Label>
      <div className="overflow-x-auto">
        <svg width={W} height={top + BH + 46} style={{ maxWidth: 'none' }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#71717a" />
            </marker>
          </defs>
          {v.nodes.map((n, i) => {
            const nx = v.next[n.id];
            if (nx === null || nx === undefined || !idx.has(nx)) {
              return (
                <text key={`e${n.id}`} className="svg-note" x={cx(i) + BW / 2 + 12} y={cy + 4}>
                  ∅
                </text>
              );
            }
            const j = idx.get(nx)!;
            if (j === i + 1) return <line key={`e${n.id}`} className="svg-edge" markerEnd="url(#arrow)" x1={cx(i) + BW / 2} y1={cy} x2={cx(j) - BW / 2 - 2} y2={cy} />;
            if (j === i - 1) return <line key={`e${n.id}`} className="svg-edge" markerEnd="url(#arrow)" x1={cx(i) - BW / 2} y1={cy} x2={cx(j) + BW / 2 + 2} y2={cy} />;
            const y0 = top + BH;
            return (
              <path
                key={`e${n.id}`}
                className="svg-edge"
                markerEnd="url(#arrow)"
                d={`M ${cx(i)} ${y0} C ${cx(i)} ${y0 + 40}, ${cx(j)} ${y0 + 40}, ${cx(j)} ${y0 + 3}`}
              />
            );
          })}
          {v.nodes.map((n, i) => (
            <g key={n.id} className={tc(v.hl?.[n.id])}>
              <rect className="svg-box" x={cx(i) - BW / 2} y={top} width={BW} height={BH} rx={6} />
              <text className="svg-txt" x={cx(i)} y={cy}>
                {txt(n.val)}
              </text>
              {(ptrAt[n.id] ?? []).map((p, k) => (
                <text key={p} className="svg-ptr" x={cx(i)} y={top - 8 - k * 12}>
                  {tm(p)}
                </text>
              ))}
            </g>
          ))}
        </svg>
      </div>
      {nullPtrs.length > 0 && <div className="mono text-xs text-(--ink-2)">{nullPtrs.map((p) => `${tm(p)} = null`).join('   ')}</div>}
    </div>
  );
}

// ---- graph -------------------------------------------------------------------
function GraphView({ v }: { v: Extract<View, { kind: 'graph' }> }) {
  const { t, tx } = useT();
  const n = v.nodes.length;
  const R = Math.max(60, n * 15);
  const C = R + 34;
  const p = (i: number) => {
    const a = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2;
    return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
  };
  const r = 16;
  return (
    <div>
      <Label>{v.label}</Label>
      <div className="overflow-x-auto">
        <svg width={2 * C} height={2 * C} style={{ maxWidth: 'none' }}>
          <defs>
            <marker id="garrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#71717a" />
            </marker>
          </defs>
          {v.edges.map(([a, b], k) => {
            const A = p(a);
            const B = p(b);
            const d = Math.hypot(B.x - A.x, B.y - A.y) || 1;
            const ux = (B.x - A.x) / d;
            const uy = (B.y - A.y) / d;
            const tone = v.edgeHl?.[`${a}-${b}`] ?? v.edgeHl?.[`${b}-${a}`];
            return (
              <line
                key={k}
                className={`svg-edge ${tc(tone)}`}
                style={tone ? { stroke: 'var(--td)', strokeWidth: 3 } : undefined}
                markerEnd={v.directed ? 'url(#garrow)' : undefined}
                x1={A.x + ux * r}
                y1={A.y + uy * r}
                x2={B.x - ux * (r + 2)}
                y2={B.y - uy * (r + 2)}
              />
            );
          })}
          {v.nodes.map((val, i) => (
            <g key={i} className={tc(v.hl?.[i])}>
              <circle className="svg-box" cx={p(i).x} cy={p(i).y} r={r} />
              <text className="svg-txt" x={p(i).x} y={p(i).y}>
                {txt(val)}
              </text>
              {v.badges?.[i] !== undefined && (
                <text className="svg-ptr" x={p(i).x} y={p(i).y + (p(i).y < C ? -r - 7 : r + 11)}>
                  {tx(v.badges[i])}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ---- ring buffer ---------------------------------------------------------------
function RingView({ v }: { v: Extract<View, { kind: 'ring' }> }) {
  const { t, tx } = useT();
  const n = v.slots.length;
  const R = Math.max(58, n * 11);
  const C = R + 46;
  const filled = new Set(Array.from({ length: v.count }, (_, k) => (v.head + k) % n));
  const p = (i: number, rad = R) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    return { x: C + rad * Math.cos(a), y: C + rad * Math.sin(a) };
  };
  return (
    <div>
      <Label>{v.label}</Label>
      <svg width={2 * C} height={2 * C}>
        <circle cx={C} cy={C} r={R} className="svg-edge" strokeDasharray="3 4" />
        {v.slots.map((val, i) => (
          <g key={i} className={tc(filled.has(i) ? (i === v.head ? 'good' : 'window') : 'muted')}>
            <rect className="svg-box" x={p(i).x - 17} y={p(i).y - 15} width={34} height={30} rx={6} />
            <text className="svg-txt" x={p(i).x} y={p(i).y}>
              {filled.has(i) ? txt(val) : ''}
            </text>
            <text className="svg-note" x={p(i, R - 30).x} y={p(i, R - 30).y + 4}>
              {i}
            </text>
            <text className="svg-ptr" x={p(i, R + 34).x} y={p(i, R + 34).y + 4}>
              {[i === v.head ? t.views.head : '', i === v.tail ? t.views.tail : ''].filter(Boolean).join('/')}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function VarsView({ v }: { v: Extract<View, { kind: 'vars' }> }) {
  const { tx, tm } = useT();
  return (
    <div>
      <Label>{v.label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {v.items.map(([k, val]) => (
          <span key={k} className="mono rounded-md border border-(--line) bg-(--page) px-2 py-0.5 text-xs">
            <span className="text-(--ink-2)">{tm(k)} = </span>
            <b>{tx(val)}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ViewRenderer({ view }: { view: View }) {
  switch (view.kind) {
    case 'array':
      return <ArrayView v={view} />;
    case 'tree':
      return <TreeView v={view} />;
    case 'grid':
      return <GridView v={view} />;
    case 'list':
      return <ListView v={view} />;
    case 'graph':
      return <GraphView v={view} />;
    case 'ring':
      return <RingView v={view} />;
    case 'vars':
      return <VarsView v={view} />;
  }
}

export const TONE_LEGEND = ['active', 'compare', 'window', 'good', 'bad', 'done'] as const satisfies Tone[];
