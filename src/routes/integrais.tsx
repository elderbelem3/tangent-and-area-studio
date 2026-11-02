import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { parseFn, integrate, fmt } from "@/lib/calc";
import { Plot } from "@/components/Plot";
import { IntegralUvOverlay } from "@/components/UvOverlays";
import { UvStepsPanel } from "@/components/UvStepsPanel";
import { integralSteps } from "@/lib/uv-steps";
import { Smart3DView } from "@/components/Smart3DView";
import { solidSteps } from "@/lib/smart3d";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Field, ErrorBox, Chip, MathToolbar, Stat, num } from "@/components/Lab";

export const Route = createFileRoute("/integrais")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Integrais · CalculusLab" },
      { name: "description", content: "Calcule integrais definidas e visualize a área sob a curva." },
      { property: "og:title", content: "Integrais · CalculusLab" },
      { property: "og:description", content: "Integral definida como área acumulada." },
    ],
  }),
  component: Integrais,
});

function Integrais() {
  const [expr, setExpr] = useState("x^2");
  const [aS, setA] = useState("0");
  const [bS, setB] = useState("2");
  const [mode, setMode] = useState<"area" | "solido">("area");
  const inputRef = useRef<HTMLInputElement>(null);
  const { fn, error } = useMemo(() => parseFn(expr), [expr]);
  const a = num(aS), b = num(bS);
  const valid = fn && a !== null && b !== null;
  const value = valid ? integrate(fn, a, b) : NaN;
  const bad = valid && !Number.isFinite(value);
  const lo = valid ? Math.min(a, b) : 0, hi = valid ? Math.max(a, b) : 1;
  const solid = valid && mode === "solido" ? solidSteps(expr, a, b) : null;
  const pad = Math.max(1, (hi - lo) * 0.4);

  return (
    <>
      <PageHeader tag="Módulo 04" title="Integrais" desc="A integral definida de a até b acumula a área (com sinal) entre a curva e o eixo x." />
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Panel>
            <div className="space-y-5">
              <MathToolbar inputRef={inputRef} value={expr} onChange={setExpr} />
              <Field ref={inputRef} label="f(x) =" value={expr} onChange={setExpr} />
              <div className="flex flex-wrap gap-2">
                {["x^2", "sin(x)", "exp(x)", "x^3 - 3x", "1/x"].map((f) => <Chip key={f} onClick={() => setExpr(f)}>{f}</Chip>)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Limite inferior a" value={aS} onChange={setA} />
                <Field label="Limite superior b" value={bS} onChange={setB} />
              </div>
              <div>
                <span className="mb-1 block text-sm font-medium text-muted-foreground">Interpretação</span>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
                  {([["area", "Área"], ["solido", "Sólido de revolução"]] as const).map(([v, l]) => <Button key={v} variant="ghost" size="sm" aria-pressed={mode === v} onClick={() => setMode(v)} className={`rounded-md text-sm ${mode === v ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>{l}</Button>)}
                </div>
              </div>
              {error && <ErrorBox msg={error} />}
              {(a === null || b === null) && <ErrorBox msg="Informe números válidos para a e b." />}
              {bad && <ErrorBox msg="A função não é definida em todo o intervalo (ex.: divisão por zero). A integral não converge numericamente." />}
            </div>
          </Panel>
          {valid && !bad && (mode === "solido" && solid ? <Stat label={`V = π ∫ de ${fmt(a)} a ${fmt(b)} f(x)² dx`} value={fmt(solid.volume, 6)} /> : <Stat label={`∫ de ${fmt(a)} a ${fmt(b)} f(x) dx`} value={fmt(value, 6)} />)}
        </div>
        <div className="min-w-0 space-y-6">
          <Panel title={mode === "solido" ? "Sólido de revolução (3D)" : "Área sob a curva"}>
            {valid && mode === "solido" && !bad ? <><Smart3DView scene={{ kind: "solid", expression: expr, a: a!, b: b! }} /><UvStepsPanel title="Volume pelo Método dos Discos" steps={solid?.steps ?? null} /></> : valid ? <Plot fn={fn} xMin={lo - pad} xMax={hi + pad} shade={[a, b]} overlay={(h) => <IntegralUvOverlay h={h} a={a} b={b} value={value} />} /> : <p className="text-muted-foreground">Corrija os campos para ver o gráfico.</p>}
            {valid && !bad && <UvStepsPanel title="Antiderivada e Teorema Fundamental" steps={integralSteps(expr, a, b)} />}
          </Panel>
          <Panel title="Integral como área acumulada">
            <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>Divida [a, b] em n retângulos de largura Δx. A soma de Riemann <span className="font-mono text-foreground">Σ f(xᵢ)·Δx</span> aproxima a área sob a curva.</p>
              <p>Quando n → ∞ (Δx → 0), a soma converge para a <strong className="text-foreground">integral definida</strong>:</p>
              <p className="rounded-lg bg-secondary p-3 text-center font-mono text-foreground">∫ₐᵇ f(x) dx = lim n→∞ Σ f(xᵢ)·Δx</p>
              <p>Regiões abaixo do eixo x contribuem com área <strong className="text-foreground">negativa</strong>. Pelo Teorema Fundamental do Cálculo, se F' = f, então a integral vale F(b) − F(a). Aqui, o valor é calculado pela regra de Simpson.</p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
