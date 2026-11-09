import { useEffect, useMemo } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { derivative, fmt, parseFn } from "@/lib/calc";
import { FUNCTION_BG_COLORS, FUNCTION_SLOTS, type ComparisonFunction } from "@/lib/comparison";
import { findPlotAnnotations } from "@/lib/plot-annotations";
import { ChalkAnnotation } from "@/components/ChalkAnnotation";
import { AnalysisPanels } from "@/components/AnalysisPanels";
import { usePlotViewport } from "@/lib/use-plot-viewport";
import { axisTicks, axisLabel } from "@/lib/plot-viewport";
import { PlotControls, PlotCrosshair } from "@/components/PlotNavigation";
import { ChalkAxis } from "@/components/ChalkAxis";
import { useModuleState } from "@/lib/module-state";
import { curveChartRows, plotSamples, sampleCurve } from "@/lib/plot-sampling";
import { useSettledPlotDomain } from "@/lib/use-settled-plot-domain";
import { tangentExpression } from "@/lib/math-format";

export function ComparisonPlot({ functions, xMin: initialXMin, xMax: initialXMax, tangentAt, analysis = true }: {
  functions: ComparisonFunction[]; xMin: number; xMax: number; tangentAt?: number; analysis?: boolean;
}) {
  const [hidden, setHidden] = useModuleState<number[]>(tangentAt === undefined ? "funcoes.hiddenCurves" : "derivadas.hiddenCurves", []);
  useEffect(() => {
    setHidden((previous) => previous.filter((slot) => functions.some((item) => item.slot === slot)));
  }, [functions]);
  const curves = useMemo(() => functions.map((item) => ({ ...item, ...parseFn(item.expression) })), [functions]);
  const visible = useMemo(() => curves.filter((item) => item.fn && !hidden.includes(item.slot)), [curves, hidden]);
  const initialRange = useMemo(() => {
    const initialSamples = Array.from({ length: 601 }, (_, i) => initialXMin + (initialXMax - initialXMin) * i / 600);
    const values = visible.flatMap((item) => initialSamples.map((x) => item.fn?.(x) ?? NaN)).filter(Number.isFinite).sort((a, b) => a - b);
    let low = Math.min(0, values[Math.floor(values.length * 0.03)] ?? -1);
    let high = Math.max(0, values[Math.floor(values.length * 0.97)] ?? 1);
    for (const item of visible) {
      const y = tangentAt !== undefined ? item.fn?.(tangentAt) : NaN;
      if (y !== undefined && Number.isFinite(y)) { low = Math.min(low, y); high = Math.max(high, y); }
    }
    const pad = Math.max(high - low, 1) * 0.12;
    return { low: low - pad, high: high + pad };
  }, [visible, initialXMin, initialXMax, tangentAt]);
  let { low, high } = initialRange;
  const navigation = usePlotViewport({ xMin: initialXMin, xMax: initialXMax, yMin: low, yMax: high }, functions.map((f) => `${f.slot}:${f.expression}`).join("|") + hidden.join(","));
  const { xMin, xMax, yMin: viewLow, yMax: viewHigh } = navigation.domain;
  low = viewLow; high = viewHigh;
  const settled = useSettledPlotDomain(xMin, xMax);
  const samples = useMemo(() => plotSamples(xMin, xMax, initialXMax - initialXMin, visible.length), [xMin, xMax, initialXMin, initialXMax, visible.length]);
  const annotations = useMemo(() => curves.flatMap((item) => item.fn ? findPlotAnnotations(item.fn, settled.xMin, settled.xMax).map((point) => ({ ...point, slot: item.slot })) : []), [curves, settled]);
  const yIntercepts = useMemo(() => xMin <= 0 && xMax >= 0 ? curves.map((item) => ({ slot: item.slot, y: item.fn?.(0) ?? NaN })).filter((p) => Number.isFinite(p.y)) : [], [curves, xMin, xMax]);

  const tangents = useMemo(() => visible.map((item) => {
    const y = tangentAt !== undefined ? item.fn?.(tangentAt) ?? NaN : NaN;
    const slope = tangentAt !== undefined && item.fn ? derivative(item.fn, tangentAt) : NaN;
    return { ...item, y, slope };
  }), [visible, tangentAt]);
  const data = useMemo(() => {
    const sampled = tangents.map((item) => ({ key: `curve${item.slot}`, points: item.fn ? sampleCurve(item.fn, samples, low, high) : [] }));
    return curveChartRows(samples, sampled).map((row) => {
    const x = row["x"] ?? 0;
    for (const item of tangents) {
      row[`tangent${item.slot}`] = tangentAt !== undefined && Number.isFinite(item.y) && Number.isFinite(item.slope) ? item.y + item.slope * (x - tangentAt) : null;
    }
    return row;
    });
  }, [samples, tangents, low, high, tangentAt]);
  const analysisFunctions = useMemo(() => functions.filter((f) => !hidden.includes(f.slot)), [functions, hidden]);
  const analysisPanel = useMemo(() => analysis ? <AnalysisPanels functions={analysisFunctions} xMin={settled.xMin} xMax={settled.xMax} /> : null, [analysis, analysisFunctions, settled]);
  const chart = useMemo(() => (
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 12, left: 0 }}>
          <CartesianGrid stroke="var(--grid)" />
          <XAxis type="number" dataKey="x" domain={[xMin, xMax]} allowDataOverflow ticks={axisTicks(xMin, xMax, 5)} tickFormatter={(value: number) => axisLabel(value, xMax - xMin)} stroke="var(--axis-x)" tick={{ fill: "var(--axis-x)", fontSize: 12, fontWeight: 600 }} />
          <YAxis type="number" domain={[low, high]} allowDataOverflow ticks={axisTicks(low, high)} tickFormatter={(value: number) => axisLabel(value, high - low)} width={56} stroke="var(--axis-y)" tick={{ fill: "var(--axis-y)", fontSize: 12, fontWeight: 600 }} />
          {low <= 0 && high >= 0 && <ReferenceLine y={0} stroke="var(--axis-x)" strokeWidth={2} shape={(props: { x1?: number; y1?: number; x2?: number; y2?: number }) => <ChalkAxis {...props} color="var(--axis-x)" />} />}
          {xMin <= 0 && xMax >= 0 && <ReferenceLine x={0} stroke="var(--axis-y)" strokeWidth={2} shape={(props: { x1?: number; y1?: number; x2?: number; y2?: number }) => <ChalkAxis {...props} color="var(--axis-y)" />} />}
          {tangents.map((item) => <Line key={`curve${item.slot}`} type="linear" dataKey={`curve${item.slot}`} name={`${FUNCTION_SLOTS[item.slot]}(x)`} stroke={`var(--chart-${item.slot + 1})`} strokeWidth={2.5} dot={false} connectNulls={false} isAnimationActive={false} />)}
          {tangentAt !== undefined && tangents.filter((item) => Number.isFinite(item.y) && Number.isFinite(item.slope)).map((item) => <Line key={`tangent${item.slot}`} dataKey={`tangent${item.slot}`} name={`Tangente ${FUNCTION_SLOTS[item.slot]}`} stroke={`var(--chart-${item.slot + 1})`} strokeWidth={1.5} strokeDasharray="6 4" dot={false} isAnimationActive={false} />)}
          {tangentAt !== undefined && tangents.filter((item) => Number.isFinite(item.y)).map((item) => <ReferenceDot key={item.slot} x={tangentAt} y={item.y} r={4} fill={`var(--chart-${item.slot + 1})`} stroke="var(--card)" />)}
          {annotations.filter((point) => !hidden.includes(point.slot) && point.y >= low && point.y <= high).map((point, index) => <ReferenceDot key={`annotation-${point.slot}-${index}`} x={point.x} y={point.y} ifOverflow="hidden" shape={(props: { cx?: number; cy?: number }) => <ChalkAnnotation {...props} point={point} color={`var(--chart-${point.slot + 1})`} />} />)}
          {annotations.filter((point) => point.kind !== "Raiz" && !hidden.includes(point.slot) && point.y >= low && point.y <= high).map((point, index) => <ReferenceLine key={`guide-${point.slot}-${index}`} segment={[{ x: point.x, y: 0 }, { x: point.x, y: point.y }]} stroke="var(--chart-2)" strokeDasharray="4 5" className="chalk-guide" />)}
          {annotations.filter((point) => !hidden.includes(point.slot) && point.y >= low && point.y <= high).flatMap((point, index) => [
            <ReferenceLine key={`uvx-${point.slot}-${index}`} segment={[{ x: point.x, y: 0 }, { x: point.x, y: point.y }]} stroke="var(--uv)" strokeDasharray="2 4" className="uv-layer" />,
            <ReferenceLine key={`uvy-${point.slot}-${index}`} segment={[{ x: Math.min(Math.max(0, xMin), xMax), y: point.y }, { x: point.x, y: point.y }]} stroke="var(--uv)" strokeDasharray="2 4" className="uv-layer" />,
            <ReferenceDot key={`uvd-${point.slot}-${index}`} x={point.x} y={point.y} ifOverflow="hidden" shape={(props: { cx?: number; cy?: number }) => props.cx === undefined || props.cy === undefined ? <g /> : <g className="uv-layer"><circle cx={props.cx} cy={props.cy} r={5} fill="var(--uv)" /><text x={props.cx + 8} y={props.cy + 16} className="uv-label">{`(${fmt(point.x, 3)}, ${fmt(point.y, 3)})`}</text></g>} />,
          ])}
          {tangentAt !== undefined && tangents.filter((item) => item.slot === 0 && Number.isFinite(item.y) && Number.isFinite(item.slope)).flatMap((item) => { const dx = (xMax - xMin) / 8, x1 = tangentAt + dx, y1 = item.y + item.slope * dx, bb = item.y - item.slope * tangentAt; return [
            <ReferenceLine key="tri-run" segment={[{ x: tangentAt, y: item.y }, { x: x1, y: item.y }]} stroke="var(--uv)" strokeWidth={2.5} className="uv-layer" ifOverflow="hidden" />,
            <ReferenceLine key="tri-rise" segment={[{ x: x1, y: item.y }, { x: x1, y: y1 }]} stroke="var(--uv)" strokeWidth={2.5} className="uv-layer" ifOverflow="hidden" />,
            <ReferenceLine key="tri-hyp" segment={[{ x: tangentAt, y: item.y }, { x: x1, y: y1 }]} stroke="var(--uv)" strokeWidth={3} className="uv-layer" ifOverflow="hidden" />,
            <ReferenceDot key="tri-dx" x={tangentAt + dx / 2} y={item.y} ifOverflow="hidden" shape={(p: { cx?: number; cy?: number }) => p.cx === undefined || p.cy === undefined ? <g /> : <text x={p.cx} y={p.cy + (item.slope >= 0 ? 16 : -8)} textAnchor="middle" className="uv-layer uv-label">{`dx = ${fmt(dx, 3)}`}</text>} />,
            <ReferenceDot key="tri-dy" x={x1} y={(item.y + y1) / 2} ifOverflow="hidden" shape={(p: { cx?: number; cy?: number }) => p.cx === undefined || p.cy === undefined ? <g /> : <text x={p.cx + 6} y={p.cy} className="uv-layer uv-label">{`dy = ${fmt(y1 - item.y, 3)}`}</text>} />,
            <ReferenceDot key="tri-eq" x={tangentAt} y={item.y} ifOverflow="hidden" shape={(p: { cx?: number; cy?: number }) => p.cx === undefined || p.cy === undefined ? <g /> : <g className="uv-layer"><circle cx={p.cx} cy={p.cy} r={6} fill="none" stroke="var(--uv)" strokeWidth={2} /><text x={p.cx - 10} y={p.cy - 14} textAnchor="end" className="uv-label">{`y = ${tangentExpression(item.slope, bb)} · dy/dx = ${fmt(item.slope, 4)}`}</text></g>} />,
          ]; })}
          {yIntercepts.filter((p) => !hidden.includes(p.slot) && p.y >= low && p.y <= high).map((p) => <ReferenceDot key={`uvi-${p.slot}`} x={0} y={p.y} ifOverflow="hidden" shape={(props: { cx?: number; cy?: number }) => props.cx === undefined || props.cy === undefined ? <g /> : <g className="uv-layer"><rect x={props.cx - 4} y={props.cy - 4} width={8} height={8} fill="var(--uv)" transform={`rotate(45 ${props.cx} ${props.cy})`} /><text x={props.cx + 8} y={props.cy - 8} className="uv-label">{`y₀ = ${fmt(p.y, 3)}`}</text></g>} />)}
        </LineChart>
      </ResponsiveContainer>
  ), [data, xMin, xMax, low, high, tangents, tangentAt, annotations, hidden, yIntercepts]);
  return <div className="min-w-0">
    <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Legenda interativa das funções">
      {curves.map((item) => <Button key={item.slot} variant="outline" size="sm" aria-pressed={!hidden.includes(item.slot)} title={`${hidden.includes(item.slot) ? "Mostrar" : "Ocultar"} ${FUNCTION_SLOTS[item.slot]}(x)`} onClick={() => setHidden((previous) => previous.includes(item.slot) ? previous.filter((slot) => slot !== item.slot) : [...previous, item.slot])} className={`h-auto min-h-9 min-w-0 max-w-full py-2 ${hidden.includes(item.slot) ? "opacity-50" : ""}`}>
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${FUNCTION_BG_COLORS[item.slot]}`} />
        <span className="break-all whitespace-normal text-left font-mono text-xs">{FUNCTION_SLOTS[item.slot]}(x) = {item.expression || "—"}</span>
      </Button>)}
    </div>
    <PlotControls navigation={navigation} />
    <div ref={navigation.ref} className="relative touch-none cursor-crosshair h-[360px] w-full min-w-0 sm:h-[420px]" role="img" aria-label={tangentAt === undefined ? "Gráfico comparativo das funções" : "Gráfico comparativo das funções e retas tangentes"}>
      {chart}
      <PlotCrosshair navigation={navigation} values={tangents.map((item) => ({ name: `${FUNCTION_SLOTS[item.slot]}(x)`, value: item.fn?.(navigation.cursor?.x ?? 0) ?? NaN }))} />
    </div>
    {analysisPanel}
    {visible.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Nenhuma função válida visível.</p>}
    {tangentAt !== undefined && <p className="mt-4 border-t border-border pt-4 text-center text-xs text-muted-foreground">Curvas: linhas contínuas · Retas tangentes: linhas tracejadas</p>}
  </div>;
}