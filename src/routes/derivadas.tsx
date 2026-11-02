import { useModuleState } from "@/lib/module-state";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { parseFn, derivative, fmt } from "@/lib/calc";
import { ComparisonPlot } from "@/components/ComparisonPlot";
import { UvStepsPanel } from "@/components/UvStepsPanel";
import { derivativeSteps } from "@/lib/uv-steps";
import { FunctionEditor } from "@/components/FunctionEditor";
import { addComparisonFunction, removeComparisonFunction, FUNCTION_SLOTS, FUNCTION_TEXT_COLORS, type ComparisonFunction } from "@/lib/comparison";
import { PageHeader, Panel, Field, ErrorBox, Chip, Stat, num } from "@/components/Lab";

export const Route = createFileRoute("/derivadas")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Derivadas · CalculusLab" },
      { name: "description", content: "Calcule a derivada num ponto e veja a reta tangente no gráfico." },
      { property: "og:title", content: "Derivadas · CalculusLab" },
      { property: "og:description", content: "Reta tangente e taxa de variação instantânea." },
    ],
  }),
  component: Derivadas,
});

function Derivadas() {
  const [functions, setFunctions] = useModuleState<ComparisonFunction[]>("derivadas.functions", [{ slot: 0, expression: "x^2" }]);
  const expr = functions.find((item) => item.slot === 0)?.expression ?? "";
  const changeExpression = (slot: number, expression: string) => setFunctions((previous) => previous.map((item) => item.slot === slot ? { ...item, expression } : item));
  const setExpr = (expression: string) => changeExpression(0, expression);
  const [x0S, setX0] = useModuleState("derivadas.x0S", "1");
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
              <FunctionEditor functions={functions} onChange={changeExpression} onAdd={() => setFunctions(addComparisonFunction)} onRemove={(slot) => setFunctions((previous) => removeComparisonFunction(previous, slot))} mainExtras={<div className="flex flex-wrap gap-2">
                {["x^2", "sin(x)", "exp(x)", "x^3 - 3x", "log(x)"].map((f) => <Chip key={f} onClick={() => setExpr(f)}>{f}</Chip>)}
              </div>} />
              <Field label="Ponto x₀" value={x0S} onChange={setX0} />
              {x0 === null && <ErrorBox msg="Informe um número válido para x₀." />}
              {fn && x0 !== null && !ok && <ErrorBox msg="A função não é definida ou não é derivável neste ponto (ex.: divisão por zero)." />}
            </div>
          </Panel>
          {ok && (
            <div className="grid grid-cols-2 gap-3">
              <Stat label="f'(x₀)" value={fmt(m, 5)} />
              <Stat label="f(x₀)" value={fmt(y0, 5)} />
              <div className="col-span-2 rounded-xl bg-secondary p-4">
                <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Reta tangente</p>
                <p className="mt-1 font-mono text-lg">y = {fmt(m, 4)}x {b >= 0 ? "+" : "−"} {fmt(Math.abs(b), 4)}</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">Inclinação: {fmt(m, 4)} ({m > 1e-6 ? "crescente" : m < -1e-6 ? "decrescente" : "ponto crítico"})</p>
              </div>
            </div>
          )}
          {functions.length > 1 && x0 !== null && <Panel title="Derivadas das funções">
            <div className="space-y-3">{functions.filter((item) => item.slot !== 0).map((item) => {
              const parsed = parseFn(item.expression);
              const value = parsed.fn ? derivative(parsed.fn, x0) : NaN;
              return <div key={item.slot} className="flex items-center justify-between gap-3 border-b border-border pb-2 font-mono text-sm"><span className={FUNCTION_TEXT_COLORS[item.slot]}>{FUNCTION_SLOTS[item.slot]}'({fmt(x0)})</span><span>{fmt(value, 5)}</span></div>;
            })}</div>
          </Panel>}
        </div>
        <div className="min-w-0 space-y-6">
          <Panel title="Curvas e retas tangentes">
            {x0 !== null ? (
              <ComparisonPlot functions={functions} xMin={x0 - 4} xMax={x0 + 4} tangentAt={x0} analysis={false} />
            ) : <p className="text-muted-foreground">Corrija os campos para ver o gráfico.</p>}
            {ok && x0 !== null && <UvStepsPanel title="Regras de Derivação Passo a Passo" steps={(() => { const s = derivativeSteps(expr); return s && [...s, { title: "Aplicação no ponto", lines: [`f′(${fmt(x0)}) = ${fmt(m, 5)} · f(${fmt(x0)}) = ${fmt(y0, 5)}`, `Reta tangente: y = ${fmt(m, 4)}x ${b >= 0 ? "+" : "−"} ${fmt(Math.abs(b), 4)}`] }]; })()} />}
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
    </>
  );
}
