import { useId } from "react";
import { fmt } from "@/lib/calc";
import type { PlotHelpers } from "@/components/Plot";

const big = (v: number) => !Number.isFinite(v) || Math.abs(v) > 1e4;

/** Limits: neon lateral-approach arrows and dashed asymptotes. */
export function LimitUvOverlay({ h, c, L }: { h: PlotHelpers; c: number; L: number }) {
  const id = useId().replace(/:/g, "");
  const { sx, sy, fn, xMin, xMax, yMin, yMax } = h;
  const clampY = (y: number) => Math.max(yMin, Math.min(yMax, y));
  const arrow = (from: number, to: number) => {
    let d = ""; const n = 30;
    for (let i = 0; i <= n; i++) { const x = from + (to - from) * i / n, y = fn(x); if (!Number.isFinite(y)) continue; d += `${d ? "L" : "M"}${sx(x).toFixed(1)},${sy(clampY(y)).toFixed(1)}`; }
    return d;
  };
  const span = (xMax - xMin) / 2;
  const verticals: number[] = [];
  if (big(fn(c - 1e-6)) || big(fn(c + 1e-6))) verticals.push(c);
  const n = 400;
  for (let i = 0; i < n; i++) {
    const x1 = xMin + (xMax - xMin) * i / n, x2 = x1 + (xMax - xMin) / n, a = fn(x1), b = fn(x2);
    if (Number.isFinite(a) && Number.isFinite(b) && Math.sign(a) !== Math.sign(b) && Math.abs(a - b) > (yMax - yMin) * 2 && !verticals.some((v) => Math.abs(v - x1) < (xMax - xMin) / 50)) verticals.push((x1 + x2) / 2);
  }
  const far = fn(1e6), farN = fn(-1e6);
  const horizontals = [far, farN].filter((v, i, arr) => Number.isFinite(v) && Math.abs(v) < 1e6 && v >= yMin && v <= yMax && arr.indexOf(v) === i && Math.abs(fn(1e5) - v) < 1e-3 * Math.max(1, Math.abs(v)));
  return <g className="uv-layer">
    <defs><marker id={`uva${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--uv)" /></marker></defs>
    <path d={arrow(c - span * 0.8, c - span * 0.08)} fill="none" stroke="var(--uv)" strokeWidth={3} strokeDasharray="1 0" markerEnd={`url(#uva${id})`} transform="translate(0,-10)" />
    <path d={arrow(c + span * 0.8, c + span * 0.08)} fill="none" stroke="var(--uv)" strokeWidth={3} markerEnd={`url(#uva${id})`} transform="translate(0,-10)" />
    <text x={sx(c - span * 0.5)} y={sy(clampY(fn(c - span * 0.5))) - 20} textAnchor="middle" className="uv-label">x → {fmt(c)}⁻</text>
    <text x={sx(c + span * 0.5)} y={sy(clampY(fn(c + span * 0.5))) - 20} textAnchor="middle" className="uv-label">x → {fmt(c)}⁺</text>
    {verticals.map((v) => <g key={`v${v}`}><line x1={sx(v)} x2={sx(v)} y1={sy(yMax)} y2={sy(yMin)} stroke="var(--uv)" strokeWidth={2} strokeDasharray="7 6" /><text x={sx(v) + 6} y={sy(yMax) + 16} className="uv-label">assíntota x = {fmt(v, 3)}</text></g>)}
    {horizontals.map((v) => <g key={`h${v}`}><line x1={sx(xMin)} x2={sx(xMax)} y1={sy(v)} y2={sy(v)} stroke="var(--uv)" strokeWidth={2} strokeDasharray="7 6" /><text x={sx(xMax) - 6} y={sy(v) - 6} textAnchor="end" className="uv-label">assíntota y = {fmt(v, 3)}</text></g>)}
    {Number.isFinite(L) && L >= yMin && L <= yMax && <g><circle cx={sx(c)} cy={sy(L)} r={7} fill="none" stroke="var(--uv)" strokeWidth={2} /><text x={sx(c) + 10} y={sy(L) + 18} className="uv-label">L = {fmt(L, 4)}</text></g>}
  </g>;
}

/** Integrals: neon gradient fill over [a,b] and highlighted bounds on the x-axis. */
export function IntegralUvOverlay({ h, a: a0, b: b0, value }: { h: PlotHelpers; a: number; b: number; value: number }) {
  const id = useId().replace(/:/g, "");
  const { sx, sy, fn, yMin, yMax } = h;
  const [a, b] = a0 <= b0 ? [a0, b0] : [b0, a0];
  let d = `M${sx(a)},${sy(0)}`;
  for (let i = 0; i <= 200; i++) { const x = a + (b - a) * i / 200, y = fn(x); d += `L${sx(x)},${sy(Number.isFinite(y) ? Math.max(yMin, Math.min(yMax, y)) : 0)}`; }
  d += `L${sx(b)},${sy(0)}Z`;
  return <g className="uv-layer">
    <defs><linearGradient id={`uvg${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--uv)" stopOpacity={0.55} /><stop offset="100%" stopColor="var(--uv-strong)" stopOpacity={0.08} /></linearGradient></defs>
    <path d={d} fill={`url(#uvg${id})`} stroke="var(--uv)" strokeWidth={1.5} />
    {[a, b].map((x, i) => <g key={i}><line x1={sx(x)} x2={sx(x)} y1={sy(yMin)} y2={sy(yMax)} stroke="var(--uv)" strokeWidth={2} strokeDasharray="5 5" /><circle cx={sx(x)} cy={sy(0)} r={5} fill="var(--uv)" /><text x={sx(x)} y={sy(0) + 20} textAnchor="middle" className="uv-label">{i ? "b" : "a"} = {fmt(x, 3)}</text></g>)}
    <text x={(sx(a) + sx(b)) / 2} y={sy(yMax) + 18} textAnchor="middle" className="uv-label">∫ = {fmt(value, 5)}</text>
  </g>;
}
