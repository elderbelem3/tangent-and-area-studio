import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { axisLabel } from "@/lib/plot-viewport";
import type { usePlotViewport } from "@/lib/use-plot-viewport";

type Navigation = ReturnType<typeof usePlotViewport>;
export function PlotControls({ navigation }: { navigation: Navigation }) {
  return <TooltipProvider delayDuration={200}><div className="mb-2 flex justify-end gap-1" role="group" aria-label="Escala do gráfico">
    {[{ label: "Aproximar", icon: ZoomIn, action: () => navigation.changeScale(1.5) }, { label: "Afastar", icon: ZoomOut, action: () => navigation.changeScale(1 / 1.5) }, { label: "Restaurar escala", icon: RotateCcw, action: navigation.reset }].map(({ label, icon: Icon, action }) => <Tooltip key={label}><TooltipTrigger asChild><Button variant="outline" size="icon" className="h-11 w-11" aria-label={label} onClick={action}><Icon /></Button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>) }
  </div></TooltipProvider>;
}
export function PlotCrosshair({ navigation, values }: { navigation: Navigation; values: { name: string; value: number }[] }) {
  const { cursor, domain } = navigation;
  if (!cursor) return null;
  const { px, py, x, y, rect } = cursor;
  const format = (v: number) => Number.isFinite(v) ? axisLabel(v, Math.min(domain.xMax - domain.xMin, domain.yMax - domain.yMin) / 100) : "indefinido";
  const left = Math.max(rect.left, Math.min(px + 14, rect.left + rect.width - 180));
  const top = Math.max(rect.top, Math.min(py + 14, rect.top + rect.height - 110));
  return <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    <svg className="h-full w-full"><line x1={px} x2={px} y1={rect.top} y2={rect.top + rect.height} className="stroke-axis" strokeDasharray="4 4" /><line x1={rect.left} x2={rect.left + rect.width} y1={py} y2={py} className="stroke-axis" strokeDasharray="4 4" /></svg>
    <div className="absolute max-w-44 rounded-lg border border-border bg-card p-2 font-mono text-xs text-foreground shadow-soft" style={{ left, top }} data-testid="plot-coordinates"><p>x = {format(x)}</p><p>y = {format(y)}</p>{values.map((v) => <p key={v.name}>{v.name} = {format(v.value)}</p>)}</div>
  </div>;
}