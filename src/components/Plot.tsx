import type { Fn } from "@/lib/calc";

type Props = {
  fn: Fn;
  xMin: number;
  xMax: number;
  points?: { x: number; y: number; label?: string; hollow?: boolean }[];
  lines?: Fn[];
  shade?: [number, number];
};

const W = 640, H = 400, P = 36;

export function Plot({ fn, xMin, xMax, points = [], lines = [], shade }: Props) {
  const N = 600;
  const xs = Array.from({ length: N + 1 }, (_, i) => xMin + ((xMax - xMin) * i) / N);
  const ys = xs.map(fn).filter((y) => Number.isFinite(y));
  let yMin = ys.length ? Math.min(...ys) : -1;
  let yMax = ys.length ? Math.max(...ys) : 1;
  // robust clipping for asymptotes
  const sorted = [...ys].sort((a, b) => a - b);
  if (sorted.length > 20) {
    yMin = Math.min(yMin, sorted[Math.floor(sorted.length * 0.03)]);
    yMin = sorted[Math.floor(sorted.length * 0.03)];
    yMax = sorted[Math.floor(sorted.length * 0.97)];
  }
  points.forEach((p) => { if (Number.isFinite(p.y)) { yMin = Math.min(yMin, p.y); yMax = Math.max(yMax, p.y); } });
  yMin = Math.min(yMin, 0); yMax = Math.max(yMax, 0);
  if (yMax - yMin < 1e-9) { yMax += 1; yMin -= 1; }
  const pad = (yMax - yMin) * 0.12; yMin -= pad; yMax += pad;

  const sx = (x: number) => P + ((x - xMin) / (xMax - xMin)) * (W - 2 * P);
  const sy = (y: number) => H - P - ((y - yMin) / (yMax - yMin)) * (H - 2 * P);

  const path = (f: Fn) => {
    let d = "", pen = false, prev = NaN;
    for (const x of xs) {
      const y = f(x);
      const jump = Number.isFinite(prev) && Math.abs(y - prev) > (yMax - yMin) * 2;
      if (!Number.isFinite(y) || y < yMin - (yMax - yMin) * 3 || y > yMax + (yMax - yMin) * 3 || jump) { pen = false; prev = y; continue; }
      d += `${pen ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
      pen = true; prev = y;
    }
    return d;
  };

  const ticks = (a: number, b: number) => {
    const step = Math.pow(10, Math.floor(Math.log10((b - a) / 5)));
    const s = [1, 2, 5, 10].map((m) => m * step).find((v) => (b - a) / v <= 8) ?? step * 10;
    const out: number[] = [];
    for (let v = Math.ceil(a / s) * s; v <= b; v += s) out.push(Number(v.toFixed(10)));
    return out;
  };

  let shadePath = "";
  if (shade) {
    const [a, b] = shade[0] <= shade[1] ? shade : [shade[1], shade[0]];
    const n = 200;
    shadePath = `M${sx(a)},${sy(0)}`;
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n;
      const y = Math.max(yMin, Math.min(yMax, fn(x)));
      shadePath += `L${sx(x)},${sy(Number.isFinite(y) ? y : 0)}`;
    }
    shadePath += `L${sx(b)},${sy(0)}Z`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-xl border border-border bg-card" role="img" aria-label="Gráfico da função">
      <defs>
        <clipPath id="plotclip"><rect x={P} y={P} width={W - 2 * P} height={H - 2 * P} /></clipPath>
      </defs>
      {ticks(xMin, xMax).map((t) => (
        <g key={`x${t}`}>
          <line x1={sx(t)} x2={sx(t)} y1={P} y2={H - P} className="stroke-grid" />
          <text x={sx(t)} y={H - P + 16} textAnchor="middle" className="fill-muted-foreground text-[11px]">{t}</text>
        </g>
      ))}
      {ticks(yMin, yMax).map((t) => (
        <g key={`y${t}`}>
          <line x1={P} x2={W - P} y1={sy(t)} y2={sy(t)} className="stroke-grid" />
          <text x={P - 6} y={sy(t) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">{t}</text>
        </g>
      ))}
      <line x1={P} x2={W - P} y1={sy(0)} y2={sy(0)} className="stroke-axis" strokeWidth={1.5} />
      {xMin <= 0 && xMax >= 0 && <line x1={sx(0)} x2={sx(0)} y1={P} y2={H - P} className="stroke-axis" strokeWidth={1.5} />}
      <g clipPath="url(#plotclip)">
        {shade && <path d={shadePath} className="fill-primary/25 stroke-primary/40" />}
        <path d={path(fn)} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinejoin="round" />
        {lines.map((l, i) => (
          <path key={i} d={path(l)} fill="none" className="stroke-accent-strong" strokeWidth={2} strokeDasharray="6 4" />
        ))}
        {points.filter((p) => Number.isFinite(p.y)).map((p, i) => (
          <g key={i}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={6} className={p.hollow ? "fill-card stroke-accent-strong" : "fill-accent-strong stroke-card"} strokeWidth={2.5} />
            {p.label && <text x={sx(p.x) + 10} y={sy(p.y) - 10} className="fill-foreground text-[12px] font-semibold">{p.label}</text>}
          </g>
        ))}
      </g>
    </svg>
  );
}
