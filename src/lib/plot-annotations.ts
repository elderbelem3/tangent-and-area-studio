import type { Fn } from "@/lib/calc";
export type PlotAnnotation = { x: number; y: number; kind: "Raiz" | "Máx. local" | "Mín. local" };
/** Approximate visual hints, independent of calculus results. */
export function findPlotAnnotations(fn: Fn, xMin: number, xMax: number): PlotAnnotation[] {
  if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || xMax <= xMin) return [];
  const step = (xMax - xMin) / 600;
  const samples = Array.from({ length: 601 }, (_, i) => ({ x: xMin + i * step, y: fn(xMin + i * step) }));
  const result: PlotAnnotation[] = [];
  const add = (point: PlotAnnotation) => {
    if (Number.isFinite(point.y) && !result.some((p) => p.kind === point.kind && Math.abs(p.x - point.x) < step * 2)) result.push(point);
  };
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1], b = samples[i], c = samples[i + 1];
    if (!a || !b || !Number.isFinite(a.y) || !Number.isFinite(b.y)) continue;
    if (Math.abs(a.y) < 1e-9 && Math.abs(b.y) > 1e-9) add({ ...a, y: 0, kind: "Raiz" });
    if (Math.abs(b.y) < 1e-9 && Math.abs(a.y) > 1e-9) add({ ...b, y: 0, kind: "Raiz" });
    if (a.y * b.y < 0) {
      let left = a.x, right = b.x, leftY = a.y;
      for (let j = 0; j < 40; j++) {
        const mid = (left + right) / 2, y = fn(mid);
        if (!Number.isFinite(y)) break;
        if (leftY * y <= 0) right = mid; else { left = mid; leftY = y; }
      }
      const x = (left + right) / 2;
      if (Math.abs(fn(x)) < 1e-7) add({ x, y: 0, kind: "Raiz" });
    }
    if (!c || !Number.isFinite(c.y)) continue;
    const minimum = b.y <= a.y && b.y <= c.y && (b.y < a.y || b.y < c.y);
    const maximum = b.y >= a.y && b.y >= c.y && (b.y > a.y || b.y > c.y);
    if (!minimum && !maximum) continue;
    let left = a.x, right = c.x;
    for (let j = 0; j < 35; j++) {
      const u = left + (right - left) / 3, v = right - (right - left) / 3;
      if ((fn(u) < fn(v)) === minimum) right = v; else left = u;
    }
    const x = (left + right) / 2, y = fn(x), delta = step / 20;
    const before = fn(x - delta), after = fn(x + delta);
    const continuous = [before, after, y].every(Number.isFinite) && Math.max(Math.abs(before - y), Math.abs(after - y)) < Math.max(1, Math.abs(y)) * 0.05;
    if (continuous) add({ x, y, kind: minimum ? "Mín. local" : "Máx. local" });
  }
  return result.sort((a, b) => Math.abs(a.x) - Math.abs(b.x)).slice(0, 6);
}