import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { parseFn, derivative, fmt } from "@/lib/calc";
import { Plot } from "@/components/Plot";
import { PageHeader, Panel, Field, ErrorBox, Chip, MathToolbar, Stat, num } from "@/components/Lab";

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
  const [expr, setExpr] = useState("x^2");
  const [x0S, setX0] = useState("1");
  const inputRef = useRef<HTMLInputElement>(null);
  const { fn, error } = useMemo(() => parseFn(expr), [expr]);
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
              <MathToolbar inputRef={inputRef} value={expr} onChange={setExpr} />
              <Field ref={inputRef} label="f(x) =" value={expr} onChange={setExpr} />
              <div className="flex flex-wrap gap-2">
                {["x^2", "sin(x)", "exp(x)", "x^3 - 3x", "log(x)"].map((f) => <Chip key={f} onClick={() => setExpr(f)}>{f}</Chip>)}
              </div>
              <Field label="Ponto x₀" value={x0S} onChange={setX0} />
              {error && <ErrorBox msg={error} />}
              {x0 === null && <ErrorBox msg="Informe um número válido para x₀." />}
              {fn && x0 !== null && !ok && <ErrorBox msg="A função não é definida ou não é derivável neste ponto (ex.: divisão por zero)." />}
            </div>
          </Panel>
          {ok && (
            <div className="grid grid-cols-2 gap-3">
              <Stat label="f'(x₀)" value={fmt(m, 5)} />
              <Stat label="f(x₀)" value={fmt(y0, 5)} />
              <div className="col-span-2 rounded-xl bg-secondary p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Reta tangente</p>
                <p className="mt-1 font-mono text-lg">y = {fmt(m, 4)}x {b >= 0 ? "+" : "−"} {fmt(Math.abs(b), 4)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Inclinação: {fmt(m, 4)} ({m > 1e-6 ? "crescente" : m < -1e-6 ? "decrescente" : "ponto crítico"})</p>
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-6">
          <Panel title="Curva e reta tangente">
            {fn && x0 !== null ? (
              <Plot fn={fn} xMin={x0 - 4} xMax={x0 + 4} lines={ok ? [(x) => m * (x - x0) + y0] : []} points={ok ? [{ x: x0, y: y0, label: `(${fmt(x0)}, ${fmt(y0, 3)})` }] : []} />
            ) : <p className="text-muted-foreground">Corrija os campos para ver o gráfico.</p>}
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
