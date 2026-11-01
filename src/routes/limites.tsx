import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { parseFn, fmt } from "@/lib/calc";
import { Plot } from "@/components/Plot";
import { PageHeader, Panel, Field, ErrorBox, Chip, Stat, num } from "@/components/Lab";

export const Route = createFileRoute("/limites")({
  head: () => ({
    meta: [
      { title: "Limites · CalculusLab" },
      { name: "description", content: "Aproximação numérica de limites laterais com tabela e gráfico." },
      { property: "og:title", content: "Limites · CalculusLab" },
      { property: "og:description", content: "Veja x se aproximar de c e o valor de f(x) convergir." },
    ],
  }),
  component: Limites,
});

type Dir = "esq" | "dir" | "ambos";
const hs = [0.1, 0.01, 0.001, 0.0001, 0.00001];

function estimate(vals: number[]): number {
  const last = vals[vals.length - 1], prev = vals[vals.length - 2];
  if (!Number.isFinite(last)) return NaN;
  if (Math.abs(last) > 1e6 && Math.abs(last) > Math.abs(prev) * 5) return last > 0 ? Infinity : -Infinity;
  return Math.abs(last - prev) < 1e-3 * Math.max(1, Math.abs(last)) ? last : NaN;
}

function Limites() {
  const [expr, setExpr] = useState("sin(x)/x");
  const [cS, setC] = useState("0");
  const [dir, setDir] = useState<Dir>("ambos");
  const { fn, error } = useMemo(() => parseFn(expr), [expr]);
  const c = num(cS);

  const data = useMemo(() => {
    if (!fn || c === null) return null;
    const left = hs.map((h) => ({ x: c - h, y: fn(c - h) }));
    const right = hs.map((h) => ({ x: c + h, y: fn(c + h) }));
    const L1 = estimate(left.map((p) => p.y)), L2 = estimate(right.map((p) => p.y));
    let L = NaN, note = "";
    if (dir === "esq") L = L1;
    else if (dir === "dir") L = L2;
    else if (Number.isFinite(L1) && Number.isFinite(L2) && Math.abs(L1 - L2) < 1e-3 * Math.max(1, Math.abs(L1))) L = (L1 + L2) / 2;
    else if (L1 === L2 && !Number.isFinite(L1) && !Number.isNaN(L1)) L = L1;
    else note = "Os limites laterais são diferentes ou não convergem: o limite bilateral não existe.";
    if (Number.isNaN(L) && !note) note = "Os valores não parecem convergir — o limite pode não existir.";
    return { left, right, L1, L2, L, note };
  }, [fn, c, dir]);

  const dirLabel = dir === "esq" ? "⁻" : dir === "dir" ? "⁺" : "";
  const span = 3;

  return (
    <>
      <PageHeader tag="Módulo 02" title="Limites" desc="Observe f(x) quando x se aproxima de c. Se os valores se estabilizam em L, então lim f(x) = L." />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Panel>
          <div className="space-y-3">
            <Field label="f(x) =" value={expr} onChange={setExpr} />
            <div className="flex flex-wrap gap-2">
              <Chip onClick={() => { setExpr("sin(x)/x"); setC("0"); }}>sin(x)/x</Chip>
              <Chip onClick={() => { setExpr("(x^2-1)/(x-1)"); setC("1"); }}>(x²−1)/(x−1)</Chip>
              <Chip onClick={() => { setExpr("abs(x)/x"); setC("0"); }}>|x|/x</Chip>
              <Chip onClick={() => { setExpr("1/x^2"); setC("0"); }}>1/x²</Chip>
            </div>
            <Field label="Ponto c" value={cS} onChange={setC} />
            <div>
              <span className="mb-1 block text-sm font-medium text-muted-foreground">Direção</span>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-secondary p-1">
                {([["esq", "Esquerda"], ["dir", "Direita"], ["ambos", "Ambos"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setDir(v)} className={`rounded-md py-1.5 text-sm font-medium transition ${dir === v ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>{l}</button>
                ))}
              </div>
            </div>
            {error && <ErrorBox msg={error} />}
            {c === null && <ErrorBox msg="Informe um número válido para c." />}
            {data && <Stat label={`lim x→${fmt(c!)}${dirLabel} f(x)`} value={fmt(data.L, 5)} />}
            {data?.note && <p className="text-sm text-muted-foreground">{data.note}</p>}
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Gráfico">
            {fn && c !== null && data ? (
              <Plot fn={fn} xMin={c - span} xMax={c + span} points={Number.isFinite(data.L) ? [{ x: c, y: data.L, label: `(${fmt(c)}, ${fmt(data.L, 3)})`, hollow: Number.isNaN(fn(c)) }] : []} />
            ) : <p className="text-muted-foreground">Corrija os campos para ver o gráfico.</p>}
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
