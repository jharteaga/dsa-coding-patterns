import { useCallback, useEffect, useRef, useState } from 'react';
import type { Msg, Req } from './worker';

/** Runs tests / benchmarks in a Web Worker so the page never freezes. */
export function useRunner(onMsg: (m: Msg) => void) {
  const worker = useRef<Worker | null>(null);
  const [running, setRunning] = useState(false);
  const cb = useRef(onMsg);
  cb.current = onMsg;

  const stop = useCallback(() => {
    worker.current?.terminate();
    worker.current = null;
    setRunning(false);
  }, []);

  const start = useCallback(
    (req: Req) => {
      stop();
      const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      worker.current = w;
      setRunning(true);
      w.onmessage = (e: MessageEvent<Msg>) => {
        cb.current(e.data);
        if (e.data.kind === 'done' || e.data.kind === 'error') stop();
      };
      w.onerror = (e) => {
        cb.current({ kind: 'error', message: e.message });
        stop();
      };
      w.postMessage(req);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);
  return { start, stop, running };
}
