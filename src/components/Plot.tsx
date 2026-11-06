import { useId, useMemo, type ReactNode } from "react";
import { usePlotViewport } from "@/lib/use-plot-viewport";
import { axisTicks, axisLabel } from "@/lib/plot-viewport";
import { PlotControls, PlotCrosshair } from "@/components/PlotNavigation";
import type { Fn } from "@/lib/calc";
import { findPlotAnnotations } from "@/lib/plot-annotations";
import { ChalkAnnotation } from "@/components/ChalkAnnotation";
import { plotSamples, sampleCurve } from "@/lib/plot-sampling";
import { useSettledPlotDomain } from "@/lib/use-settled-plot-domain";

type Props = {
  fn: Fn;
  xMin: number;
  xMax: number;
  points?: { x: number; y: number; label?: string; hollow?: boolean }[];
  lines?: Fn[];
  shade?: [number, number];
  overlay?: (h: PlotHelpers) => ReactNode;
};
export type PlotHelpers = { sx: (x: number) => number; sy: (y: number) => number; xMin: number; xMax: number; yMin: number; yMax: number; fn: Fn };

const W = 640, H = 400, P = 36;

export function Plot({ fn, xMin: initialXMin, xMax: initialXMax, points = [], lines = [], shade, overlay }: Props) {
  const clipId = useId();
  const pointRangeKey = JSON.stringify(points.map((p) => p.y));
  const initialRange = useMemo(() => {
  const N = 600;
  const initialXs = Array.from({ length: N + 1 }, (_, i) => initialXMin + ((initialXMax - initialXMin) * i) / N);
  const ys = initialXs.map(fn).filter((y) => Number.isFinite(y));
  let yMin = ys.length ? Math.min(...ys) : -1;
  let yMax = ys.length ? Math.max(...ys) : 1;
  // robust clipping for asymptotes
  const sorted = [...ys].sort((a, b) => a - b);
  if (sorted.length > 20) {
    yMin = sorted[Math.floor(sorted.length * 0.03)] ?? yMin;
    yMax = sorted[Math.floor(sorted.length * 0.97)] ?? yMax;
  }
  points.forEach((p) => { if (Number.isFinite(p.y)) { yMin = Math.min(yMin, p.y); yMax = Math.max(yMax, p.y); } });
  yMin = Math.min(yMin, 0); yMax = Math.max(yMax, 0);
  if (yMax - yMin < 1e-9) { yMax += 1; yMin -= 1; }
  const pad = (yMax - yMin) * 0.12; yMin -= pad; yMax += pad;

  return { yMin, yMax };
  }, [fn, initialXMin, initialXMax, pointRangeKey]);
  let { yMin, yMax } = initialRange;
  const navigation = usePlotViewport({ xMin: initialXMin, xMax: initialXMax, yMin, yMax }, String(fn));
  const { xMin, xMax } = navigation.domain;
  yMin = navigation.domain.yMin; yMax = navigation.domain.yMax;
  const xs = useMemo(() => plotSamples(xMin, xMax, initialXMax - initialXMin, lines.length + 1), [xMin, xMax, initialXMin, initialXMax, lines.length]);
  const settled = useSettledPlotDomain(xMin, xMax);
  const annotations = useMemo(() => findPlotAnnotations(fn, settled.xMin, settled.xMax), [fn, settled]);
  const sx = (x: number) => P + ((x - xMin) / (xMax - xMin)) * (W - 2 * P);
  const sy = (y: number) => H - P - ((y - yMin) / (yMax - yMin)) * (H - 2 * P);

  const path = (f: Fn) => {
    let d = "", pen = false;
    for (const { x, y, breakBefore } of sampleCurve(f, xs, yMin, yMax)) {
      if (y === null) { pen = false; continue; }
      if (breakBefore) pen = false;
      d += `${pen ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
      pen = true;
    }
    return d;
  };

  const curvePath = useMemo(() => path(fn), [fn, xs, xMin, xMax, yMin, yMax]);
  const linePaths = useMemo(() => lines.map(path), [lines, xs, xMin, xMax, yMin, yMax]);
  const shadePath = useMemo(() => {
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

  return shadePath;
  }, [shade, fn, xMin, xMax, yMin, yMax]);

  return (
    <div>
    <PlotControls navigation={navigation} />
    <div ref={navigation.ref} className="relative touch-none cursor-crosshair">
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg bg-card font-mono" role="img" aria-label="Gráfico da função">
      <defs>
        <clipPath id={clipId}><rect x={P} y={P} width={W - 2 * P} height={H - 2 * P} /></clipPath>
      </defs>
      <rect data-plot-area x={P} y={P} width={W - 2 * P} height={H - 2 * P} fill="none" />
      {axisTicks(xMin, xMax, 5).map((t) => (
        <g key={`x${t}`}>
          <line x1={sx(t)} x2={sx(t)} y1={P} y2={H - P} className="stroke-grid" />
          <text x={sx(t)} y={H - P + 16} textAnchor="middle" className="fill-muted-foreground text-[12px]">{axisLabel(t, xMax - xMin)}</text>
        </g>
      ))}
      {axisTicks(yMin, yMax).map((t) => (
        <g key={`y${t}`}>
          <line x1={P} x2={W - P} y1={sy(t)} y2={sy(t)} className="stroke-grid" />
          <text x={P - 6} y={sy(t) + 4} textAnchor="end" className="fill-muted-foreground text-[12px]">{axisLabel(t, yMax - yMin)}</text>
        </g>
      ))}
      {yMin <= 0 && yMax >= 0 && <line x1={P} x2={W - P} y1={sy(0)} y2={sy(0)} className="stroke-axis" strokeWidth={1.5} />}
      {xMin <= 0 && xMax >= 0 && <line x1={sx(0)} x2={sx(0)} y1={P} y2={H - P} className="stroke-axis" strokeWidth={1.5} />}
      <g clipPath={`url(#${clipId})`}>
        {shade && <path d={shadePath} className="fill-primary/25 stroke-primary/40" />}
        <path d={curvePath} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinejoin="round" />
        {linePaths.map((d, i) => (
          <path key={i} d={d} fill="none" className="stroke-accent-strong" strokeWidth={2} strokeDasharray="6 4" />
        ))}
        {points.filter((p) => Number.isFinite(p.y)).map((p, i) => (
          <g key={i}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={6} className={p.hollow ? "fill-card stroke-accent-strong" : "fill-accent-strong stroke-card"} strokeWidth={2.5} />
            {p.label && <text x={sx(p.x) + 10} y={sy(p.y) - 10} className="fill-foreground text-[12px] font-semibold">{p.label}</text>}
          </g>
        ))}
        {overlay?.({ sx, sy, xMin, xMax, yMin, yMax, fn })}
        {annotations.filter((point) => point.y >= yMin && point.y <= yMax).map((point, i) => <ChalkAnnotation key={`annotation-${i}`} cx={sx(point.x)} cy={sy(point.y)} point={point} />)}
      </g>
    </svg>
    <PlotCrosshair navigation={navigation} values={[{ name: "f(x)", value: fn(navigation.cursor?.x ?? 0) }, ...lines.map((line, i) => ({ name: `Reta ${i + 1}`, value: line(navigation.cursor?.x ?? 0) }))]} />
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-center gap-5 border-t border-border pt-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-primary" />f(x)</span>{lines.length > 0 && <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-accent-strong" />Reta tangente</span>}{shade && <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-primary/25" />Área integrada</span>}</div>
    </div>
  );
}
