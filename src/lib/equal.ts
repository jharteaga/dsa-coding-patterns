export const show = (v: unknown, max = 70): string => {
  let s: string;
  try {
    s = JSON.stringify(v) ?? String(v);
  } catch {
    s = String(v);
  }
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
};
export const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
