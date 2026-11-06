import { useModuleState } from "@/lib/module-state";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useMemo, useRef, useState } from "react";
import { parseFn, fmt } from "@/lib/calc";
import { Plot } from "@/components/Plot";
import { LimitUvOverlay } from "@/components/UvOverlays";
import { UvStepsPanel } from "@/components/UvStepsPanel";
import { limitSteps } from "@/lib/uv-steps";
import { evaluateLimit } from "@/lib/limits";
import { limitExamples } from "@/lib/study-examples";
import { PageHeader, Panel, Field, ErrorBox, Chip, MathToolbar, Stat, num } from "@/components/Lab";

export const Route = createFileRoute("/limites")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Limites · CalculusLab" },
      { name: "description", content: "Aproximação numérica de limites laterais com tabela e gráfico." },
      { property: "og:title", content: "Limites · CalculusLab" },
      { property: "og:description", content: "Veja x se aproximar de c e o valor de f(x) convergir." },
    ],
  }),
  component: Limites,
});

type Dir = "esq" | "dir" | "ambos";

function Limites() {
  const [expr, setExpr] = useModuleState("limites.expr", "sin(x)/x");
  const [cS, setC] = useModuleState("limites.cS", "0");
  const [dir, setDir] = useModuleState<Dir>("limites.dir", "ambos");
  const inputRef = useRef<HTMLInputElement>(null);
  const { fn, error } = useMemo(() => parseFn(expr), [expr]);
  const c = num(cS);

  const data = useMemo(() => {
    if (!fn || c === null) return null;
    const { left, right, L1, L2, oscillation } = evaluateLimit(expr, c);
    let L = NaN, note = "";
    if (dir === "esq") L = L1;
    else if (dir === "dir") L = L2;
    else if (Number.isFinite(L1) && Number.isFinite(L2) && Math.abs(L1 - L2) < 1e-3 * Math.max(1, Math.abs(L1))) L = (L1 + L2) / 2;
    else if (L1 === L2 && !Number.isFinite(L1) && !Number.isNaN(L1)) L = L1;
    else note = "Os limites laterais são diferentes ou não convergem: o limite bilateral não existe.";
    if (oscillation) note = oscillation;
    if (Number.isNaN(L) && !note) note = "Os valores não parecem convergir — a estimativa numérica é inconclusiva.";
    return { left, right, L1, L2, L, note };
  }, [fn, expr, c, dir]);

  const steps = useMemo(() => (data && c !== null ? limitSteps(expr, c, data.L, data.L1, data.L2) : null), [data, c, expr]);
  const dirLabel = dir === "esq" ? "⁻" : dir === "dir" ? "⁺" : "";
  const span = 3;

  return (
    <>
      <PageHeader tag="Módulo 02" title="Limites" desc="Observe f(x) quando x se aproxima de c. Se os valores se estabilizam em L, então lim f(x) = L." />
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Panel>
          <div className="space-y-5">
            <MathToolbar inputRef={inputRef} value={expr} onChange={setExpr} />
            <Field ref={inputRef} label="f(x) =" value={expr} onChange={setExpr} />
            <div className="flex flex-wrap gap-2">
              {limitExamples.map((e) => <Chip key={e.label} onClick={() => { setExpr(e.expression); setC(e.point); setDir("ambos"); }}>{e.label}</Chip>)}
            </div>
            <Field label="Ponto c" value={cS} onChange={setC} />
            <div>
              <span className="mb-1 block text-sm font-medium text-muted-foreground">Direção</span>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-secondary p-1">
                {([["esq", "Esquerda"], ["dir", "Direita"], ["ambos", "Ambos"]] as const).map(([v, l]) => (
                  <Button variant="ghost" size="sm" aria-pressed={dir === v} key={v} onClick={() => setDir(v)} className={`rounded-md py-1.5 text-sm font-medium transition ${dir === v ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>{l}</Button>
                ))}
              </div>
            </div>
            {error && <ErrorBox msg={error} />}
            {c === null && <ErrorBox msg="Informe um número válido para c." />}
            {data && c !== null && <Stat label={`lim x→${fmt(c)}${dirLabel} f(x)`} value={fmt(data.L, 5)} />}
            {data?.note && <p className="text-sm text-muted-foreground">{data.note}</p>}
          </div>
        </Panel>
        <div className="min-w-0 space-y-6">
          <Panel title="Gráfico">
            {fn && c !== null && data ? (
              <Plot fn={fn} xMin={c - span} xMax={c + span} points={Number.isFinite(data.L) ? [{ x: c, y: data.L, label: `(${fmt(c)}, ${fmt(data.L, 3)})`, hollow: Number.isNaN(fn(c)) }] : []} overlay={(h) => <LimitUvOverlay h={h} c={c} L={data.L} />} />
            ) : <p className="text-muted-foreground">Corrija os campos para ver o gráfico.</p>}
            {steps && <UvStepsPanel title="Resolução Algébrica do Limite" steps={steps} />}
          </Panel>
          {data && (
            <div className="grid gap-4 md:grid-cols-2">
              {(dir !== "dir") && <ApproxTable title="Pela esquerda (x → c⁻)" rows={data.left} />}
              {(dir !== "esq") && <ApproxTable title="Pela direita (x → c⁺)" rows={data.right} />}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ApproxTable({ title, rows }: { title: string; rows: { x: number; y: number }[] }) {
  return (
    <Panel title={title}>
      <table className="w-full font-mono text-sm">
        <thead className="text-left text-muted-foreground"><tr><th className="py-1">x</th><th>f(x)</th></tr></thead>
        <tbody>
          {rows.map((r) => <tr key={r.x} className="border-t border-border"><td className="py-1">{fmt(r.x, 6)}</td><td>{fmt(r.y, 6)}</td></tr>)}
        </tbody>
      </table>
    </Panel>
  );
}
