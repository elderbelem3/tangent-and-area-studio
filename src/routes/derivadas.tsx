import { useModuleState } from "@/lib/module-state";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { parseFn, derivative, fmt } from "@/lib/calc";
import { ComparisonPlot } from "@/components/ComparisonPlot";
import { UvStepsPanel } from "@/components/UvStepsPanel";
import { derivativeSteps } from "@/lib/uv-steps";
import { tangentExpression } from "@/lib/math-format";
import { DerivativeResult } from "@/components/DerivativeResult";
import { derivativeExamples } from "@/lib/study-examples";
import { FunctionEditor } from "@/components/FunctionEditor";
import { addComparisonFunction, removeComparisonFunction, type ComparisonFunction } from "@/lib/comparison";
import { PageHeader, Panel, Chip, num } from "@/components/Lab";
import { CodeInspector } from "@/components/CodeMode";

export const Route = createFileRoute("/derivadas")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Derivadas · CalculusLab" },
      { name: "description", content: "Veja derivadas simbólicas, avalie cada função no seu próprio ponto e compare retas tangentes." },
      { property: "og:title", content: "Derivadas · CalculusLab" },
      { property: "og:description", content: "Derivadas simbólicas e numéricas com pontos independentes por função." },
    ],
  }),
  component: Derivadas,
});

function Derivadas() {
  const [functions, setFunctions] = useModuleState<ComparisonFunction[]>("derivadas.functions", [{ slot: 0, expression: "x^2" }]);
  const expr = functions.find((item) => item.slot === 0)?.expression ?? "";
  const changeExpression = (slot: number, expression: string) => setFunctions((previous) => previous.map((item) => item.slot === slot ? { ...item, expression } : item));
  const setExpr = (expression: string) => changeExpression(0, expression);
  const [points, setPoints] = useModuleState<Record<number, string>>("derivadas.points", { 0: "1" });
  const x0S = points[0] ?? "";
  const tangentPoints = useMemo(() => Object.fromEntries(functions.flatMap((item) => {
    const point = num(points[item.slot] ?? "");
    return point === null ? [] : [[item.slot, point]];
  })), [functions, points]);
  const { fn } = useMemo(() => parseFn(expr), [expr]);
  const x0 = num(x0S);
  const y0 = fn && x0 !== null ? fn(x0) : NaN;
  const m = fn && x0 !== null ? derivative(fn, x0) : NaN;
  const ok = Number.isFinite(y0) && Number.isFinite(m);
  const b = y0 - m * (x0 ?? 0);

  return (
    <>
      <PageHeader tag="Módulo 03" title="Derivadas" desc="A derivada em x₀ é a inclinação da reta tangente à curva nesse ponto." />
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Panel>
            <div className="space-y-5">
              <FunctionEditor functions={functions} onChange={changeExpression} onAdd={() => setFunctions(addComparisonFunction)} onRemove={(slot) => { setFunctions((previous) => removeComparisonFunction(previous, slot)); setPoints((previous) => { const next = { ...previous }; delete next[slot]; return next; }); }} mainExtras={<div className="flex flex-wrap gap-2">
                {derivativeExamples.map((e) => <Chip key={e.label} onClick={() => setExpr(e.expression)}>{e.label}</Chip>)}
              </div>} />
            </div>
          </Panel>
          {functions.map((item) => <DerivativeResult key={item.slot} item={item} point={points[item.slot] ?? ""} onPointChange={(value) => setPoints((previous) => ({ ...previous, [item.slot]: value }))} />)}
        </div>
        <div className="min-w-0 space-y-6">
          <Panel title="Curvas e retas tangentes">
            <ComparisonPlot functions={functions} xMin={(x0 ?? 0) - 4} xMax={(x0 ?? 0) + 4} tangentAt={x0 ?? 0} tangentPoints={tangentPoints} analysis={false} />
            {x0 !== null && fn && <UvStepsPanel title="Regras de Derivação Passo a Passo" steps={(() => { const s = derivativeSteps(expr); return s && [...s, { title: "Aplicação no ponto", lines: ok ? [`f′(${fmt(x0)}) = ${fmt(m, 5)} · f(${fmt(x0)}) = ${fmt(y0, 5)}`, `Reta tangente: y = ${tangentExpression(m, b)}`] : [`A função não é definida ou não é derivável em x = ${fmt(x0)}. Não existe reta tangente com inclinação finita neste ponto.`] }]; })()} />}
          </Panel>
          <Panel title="Interpretação geométrica">
            <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>Considere a reta secante que passa por (x₀, f(x₀)) e (x₀+h, f(x₀+h)). Sua inclinação é <span className="font-mono text-foreground">[f(x₀+h) − f(x₀)] / h</span>.</p>
              <p>Quando h → 0, a secante "gira" até coincidir com a <strong className="text-foreground">reta tangente</strong>. A inclinação limite é a derivada:</p>
              <p className="rounded-lg bg-secondary p-3 text-center font-mono text-foreground">f'(x₀) = lim h→0 [f(x₀+h) − f(x₀)] / h</p>
              <p>Ela mede a <strong className="text-foreground">taxa de variação instantânea</strong>: f'(x₀) &gt; 0 indica função crescente, &lt; 0 decrescente e = 0 um possível máximo ou mínimo.</p>
            </div>
          </Panel>
        </div>
      </div>
      <CodeInspector expressions={functions.map((item) => item.expression)} renderer="Recharts 2D" />
    </>
  );
}
