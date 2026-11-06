import { useMemo } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Panel, Field, ErrorBox, num } from "@/components/Lab";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/calc";
import { invertFunction, solveForX } from "@/lib/inverse";
import { useModuleState } from "@/lib/module-state";

export function InversePanel({ expression, xMin, xMax, onPlot }: { expression: string; xMin: number; xMax: number; onPlot: (inverse: string) => void }) {
  const [y, setY] = useModuleState("funcoes.inverseY", "");
  const result = useMemo(() => expression.trim() ? invertFunction(expression) : null, [expression]);
  const yValue = y.trim() ? num(y) : null;
  const roots = useMemo(() => yValue === null ? null : solveForX(expression, yValue, Math.min(xMin, -50), Math.max(xMax, 50)), [expression, yValue, xMin, xMax]);
  return <Panel title="Função inversa · descobrir x">
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Isolamos x em y = f(x) para obter f⁻¹(x). Informe um y para descobrir os valores de x.</p>
      {result?.steps.length ? <ol className="space-y-2">
        {result.steps.map((s, i) => <li key={i} className="rounded-lg border border-border bg-background/60 px-3 py-2">
          <span className="block text-xs text-muted-foreground">Passo {i + 1} · {s.text}</span>
          <span className="block break-all font-mono text-sm">{s.equation}</span>
        </li>)}
      </ol> : null}
      {result?.error && <ErrorBox msg={result.error} />}
      {result?.inverse && <Button type="button" className="w-full" onClick={() => onPlot(result.inverse!)}><ArrowLeftRight className="h-4 w-4" />Plotar f⁻¹(x) e a reta y = x</Button>}
      <Field label="Valor de y (resolver f(x) = y)" value={y} onChange={setY} />
      {y.trim() && yValue === null && <ErrorBox msg="Informe um número válido para y." />}
      {roots && <p className="font-mono text-sm">{roots.length ? roots.map((r) => `x = ${fmt(r, 6)}`).join("   ·   ") : "Nenhum x real encontrado em [−50, 50]."}</p>}
    </div>
  </Panel>;
}
