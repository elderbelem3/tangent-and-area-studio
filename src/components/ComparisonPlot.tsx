import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { derivative, fmt, parseFn } from "@/lib/calc";
import { FUNCTION_BG_COLORS, FUNCTION_SLOTS, type ComparisonFunction } from "@/lib/comparison";

export function ComparisonPlot({ functions, xMin, xMax, tangentAt }: {
  functions: ComparisonFunction[]; xMin: number; xMax: number; tangentAt?: number;
}) {
  const [hidden, setHidden] = useState<number[]>([]);
  const curves = useMemo(() => functions.map((item) => ({ ...item, ...parseFn(item.expression) })), [functions]);
  const visible = curves.filter((item) => item.fn && !hidden.includes(item.slot));
  const samples = Array.from({ length: 601 }, (_, i) => xMin + (xMax - xMin) * i / 600);
  const values = visible.flatMap((item) => samples.map((x) => item.fn?.(x) ?? NaN)).filter(Number.isFinite).sort((a, b) => a - b);
  let low = Math.min(0, values[Math.floor(values.length * 0.03)] ?? -1);
  let high = Math.max(0, values[Math.floor(values.length * 0.97)] ?? 1);
  for (const item of visible) {
    const y = tangentAt !== undefined ? item.fn?.(tangentAt) : NaN;
    if (y !== undefined && Number.isFinite(y)) { low = Math.min(low, y); high = Math.max(high, y); }
  }
  const pad = Math.max(high - low, 1) * 0.12;
  low -= pad; high += pad;
  const tangents = visible.map((item) => {
    const y = tangentAt !== undefined ? item.fn?.(tangentAt) ?? NaN : NaN;
    const slope = tangentAt !== undefined && item.fn ? derivative(item.fn, tangentAt) : NaN;
    return { ...item, y, slope };
  });
  const data = samples.map((x, index) => {
    const row: Record<string, number | null> = { x };
    for (const item of tangents) {
      const y = item.fn?.(x) ?? NaN;
      const previous = index > 0 ? item.fn?.(samples[index - 1] ?? x) ?? NaN : y;
      row[`curve${item.slot}`] = Number.isFinite(y) && Math.abs(y - previous) < (high - low) * 2 && y >= low - (high - low) * 3 && y <= high + (high - low) * 3 ? y : null;
      row[`tangent${item.slot}`] = tangentAt !== undefined && Number.isFinite(item.y) && Number.isFinite(item.slope) ? item.y + item.slope * (x - tangentAt) : null;
    }
    return row;
  });
  return <div className="min-w-0">
    <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Legenda interativa das funções">
      {curves.map((item) => <Button key={item.slot} variant="outline" size="sm" aria-pressed={!hidden.includes(item.slot)} title={`${hidden.includes(item.slot) ? "Mostrar" : "Ocultar"} ${FUNCTION_SLOTS[item.slot]}(x)`} onClick={() => setHidden((previous) => previous.includes(item.slot) ? previous.filter((slot) => slot !== item.slot) : [...previous, item.slot])} className={`h-auto min-h-9 min-w-0 max-w-full py-2 ${hidden.includes(item.slot) ? "opacity-50" : ""}`}>
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${FUNCTION_BG_COLORS[item.slot]}`} />
        <span className="break-all whitespace-normal text-left font-mono text-xs">{FUNCTION_SLOTS[item.slot]}(x) = {item.expression || "—"}</span>
      </Button>)}
    </div>
    <div className="h-[360px] w-full min-w-0 sm:h-[420px]" role="img" aria-label={tangentAt === undefined ? "Gráfico comparativo das funções" : "Gráfico comparativo das funções e retas tangentes"}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 12, left: 0 }}>
          <CartesianGrid stroke="var(--grid)" />
          <XAxis type="number" dataKey="x" domain={[xMin, xMax]} tickFormatter={(value: number) => fmt(value, 2)} stroke="var(--axis)" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <YAxis type="number" domain={[low, high]} allowDataOverflow tickFormatter={(value: number) => fmt(value, 2)} width={56} stroke="var(--axis)" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <ReferenceLine y={0} stroke="var(--axis)" />
          {xMin <= 0 && xMax >= 0 && <ReferenceLine x={0} stroke="var(--axis)" />}
          <Tooltip content={({ active, payload, label }) => active && payload?.length ? <div className="max-w-64 rounded-lg border border-border bg-card p-3 text-xs shadow-soft"><p className="mb-2 font-mono">x = {fmt(Number(label), 4)}</p>{payload.map((entry) => <p key={String(entry.dataKey)} className="font-mono">{entry.name}: {fmt(Number(entry.value), 5)}</p>)}</div> : null} />
          {tangents.map((item) => <Line key={`curve${item.slot}`} dataKey={`curve${item.slot}`} name={`${FUNCTION_SLOTS[item.slot]}(x)`} stroke={`var(--chart-${item.slot + 1})`} strokeWidth={2.5} dot={false} connectNulls={false} isAnimationActive={false} />)}
          {tangentAt !== undefined && tangents.filter((item) => Number.isFinite(item.y) && Number.isFinite(item.slope)).map((item) => <Line key={`tangent${item.slot}`} dataKey={`tangent${item.slot}`} name={`Tangente ${FUNCTION_SLOTS[item.slot]}`} stroke={`var(--chart-${item.slot + 1})`} strokeWidth={1.5} strokeDasharray="6 4" dot={false} isAnimationActive={false} />)}
          {tangentAt !== undefined && tangents.filter((item) => Number.isFinite(item.y)).map((item) => <ReferenceDot key={item.slot} x={tangentAt} y={item.y} r={4} fill={`var(--chart-${item.slot + 1})`} stroke="var(--card)" />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
    {visible.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Nenhuma função válida visível.</p>}
    {tangentAt !== undefined && <p className="mt-4 border-t border-border pt-4 text-center text-xs text-muted-foreground">Curvas: linhas contínuas · Retas tangentes: linhas tracejadas</p>}
  </div>;
}