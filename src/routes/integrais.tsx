import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { parseFn, integrate, fmt } from "@/lib/calc";
import { Plot } from "@/components/Plot";
import { PageHeader, Panel, Field, ErrorBox, Chip, Stat, num } from "@/components/Lab";

export const Route = createFileRoute("/integrais")({
  head: () => ({
    meta: [
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
  const { fn, error } = useMemo(() => parseFn(expr), [expr]);
  const a = num(aS), b = num(bS);
  const valid = fn && a !== null && b !== null;
  const value = valid ? integrate(fn, a, b) : NaN;
  const bad = valid && !Number.isFinite(value);
  const lo = valid ? Math.min(a, b) : 0, hi = valid ? Math.max(a, b) : 1;
  const pad = Math.max(1, (hi - lo) * 0.4);

  return (
    <>
      <PageHeader tag="Módulo 04" title="Integrais" desc="A integral definida de a até b acumula a área (com sinal) entre a curva e o eixo x." />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Panel>
            <div className="space-y-3">
              <Field label="f(x) =" value={expr} onChange={setExpr} />
              <div className="flex flex-wrap gap-2">
                {["x^2", "sin(x)", "exp(x)", "x^3 - 3x", "1/x"].map((f) => <Chip key={f} onClick={() => setExpr(f)}>{f}</Chip>)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Limite inferior a" value={aS} onChange={setA} />
                <Field label="Limite superior b" value={bS} onChange={setB} />
              </div>
              {error && <ErrorBox msg={error} />}
              {(a === null || b === null) && <ErrorBox msg="Informe números válidos para a e b." />}
              {bad && <ErrorBox msg="A função não é definida em todo o intervalo (ex.: divisão por zero). A integral não converge numericamente." />}
            </div>
          </Panel>
          {valid && !bad && <Stat label={`∫ de ${fmt(a)} a ${fmt(b)} f(x) dx`} value={fmt(value, 6)} />}
        </div>
        <div className="space-y-6">
          <Panel title="Área sob a curva">
            {valid ? <Plot fn={fn} xMin={lo - pad} xMax={hi + pad} shade={[a, b]} /> : <p className="text-muted-foreground">Corrija os campos para ver o gráfico.</p>}
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
