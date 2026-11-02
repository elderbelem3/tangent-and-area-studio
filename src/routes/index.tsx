import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { parseFn, fmt } from "@/lib/calc";
import { ComparisonPlot } from "@/components/ComparisonPlot";
import { FunctionEditor } from "@/components/FunctionEditor";
import { addComparisonFunction, removeComparisonFunction, type ComparisonFunction } from "@/lib/comparison";
import { PageHeader, Panel, Field, ErrorBox, Chip, num } from "@/components/Lab";
import { decodeTutorPlot, tutorPlotFunctions } from "@/lib/tutor-plot";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { grafico?: string } => typeof search["grafico"] === "string" ? { grafico: search["grafico"] } : {},
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Funções · CalculusLab" },
      { name: "description", content: "Digite uma função f(x) e veja seu gráfico e tabela de valores." },
      { property: "og:title", content: "Funções · CalculusLab" },
      { property: "og:description", content: "Plote funções e explore tabelas de valores." },
    ],
  }),
  component: Funcoes,
});

const examples = [
  { label: "Quadrática", f: "x^2 - 2x - 3" },
  { label: "Trigonométrica", f: "sin(x)" },
  { label: "Exponencial", f: "exp(x)" },
  { label: "Cúbica", f: "x^3 - 3x" },
  { label: "Racional", f: "1/x" },
];

function Funcoes() {
  const { grafico } = Route.useSearch();
  const imported = useMemo(() => grafico === undefined ? null : decodeTutorPlot(grafico), [grafico]);
  const [functions, setFunctions] = useState<ComparisonFunction[]>(() => imported?.plot ? tutorPlotFunctions(imported.plot) : [{ slot: 0, expression: "x^3 - 3x" }]);
  const expr = functions.find((item) => item.slot === 0)?.expression ?? "";
  const changeExpression = (slot: number, expression: string) => setFunctions((previous) => previous.map((item) => item.slot === slot ? { ...item, expression } : item));
  const setExpr = (expression: string) => changeExpression(0, expression);
  const [a, setA] = useState(() => String(imported?.plot?.intervalo[0] ?? -3));
  const [b, setB] = useState(() => String(imported?.plot?.intervalo[1] ?? 3));
  const [step, setStep] = useState("0.5");
  useEffect(() => {
    if (!imported?.plot) return;
    setFunctions(tutorPlotFunctions(imported.plot));
    setA(String(imported.plot.intervalo[0])); setB(String(imported.plot.intervalo[1]));
  }, [imported]);
  const { fn } = useMemo(() => parseFn(expr), [expr]);
  const xMin = num(a), xMax = num(b), st = num(step);
  const rangeErr = xMin === null || xMax === null ? "Informe números válidos para o intervalo." : xMin >= xMax ? "O início do intervalo deve ser menor que o fim." : null;
  const stepErr = st === null || st <= 0 ? "O passo deve ser um número positivo." : null;

  const rows = useMemo(() => {
    if (!fn || rangeErr || stepErr || xMin === null || xMax === null || st === null) return [];
    const out: { x: number; y: number }[] = [];
    for (let x = xMin; x <= xMax + 1e-9 && out.length < 200; x += st) out.push({ x: Number(x.toFixed(8)), y: fn(Number(x.toFixed(8))) });
    return out;
  }, [fn, xMin, xMax, st, rangeErr, stepErr]);

  return (
    <>
      <PageHeader tag="Módulo 01" title="Funções" desc="Digite uma função de x e explore seu comportamento pelo gráfico e pela tabela de valores." />
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Panel>
            <div className="space-y-5">
              <FunctionEditor functions={functions} onChange={changeExpression} onAdd={() => setFunctions(addComparisonFunction)} onRemove={(slot) => setFunctions((previous) => removeComparisonFunction(previous, slot))} mainExtras={<div className="flex flex-wrap gap-2">
                {examples.map((e) => <Chip key={e.label} onClick={() => setExpr(e.f)}>{e.label}</Chip>)}
              </div>} />
              <div className="grid grid-cols-3 gap-2">
                <Field label="x mín" value={a} onChange={setA} />
                <Field label="x máx" value={b} onChange={setB} />
                <Field label="passo" value={step} onChange={setStep} />
              </div>
              {rangeErr && <ErrorBox msg={rangeErr} />}
              {imported?.error && <ErrorBox msg={imported.error} />}
              {stepErr && <ErrorBox msg={stepErr} />}
              <p className="text-xs text-muted-foreground">Suporta: + − * / ^, sin, cos, tan, exp, log (ln), sqrt, abs, pi, e.</p>
            </div>
          </Panel>
          <Panel title="Tabela de valores">
            <div className="max-h-80 overflow-auto">
              <table className="w-full font-mono text-sm">
                <thead className="sticky top-0 bg-card text-left text-muted-foreground"><tr><th className="py-1">x</th><th>f(x)</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.x} className="border-t border-border"><td className="py-1">{fmt(r.x, 4)}</td><td className={Number.isNaN(r.y) ? "text-destructive" : ""}>{fmt(r.y, 4)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
        <Panel title="Gráfico das funções">
          {!rangeErr && xMin !== null && xMax !== null ? <ComparisonPlot functions={functions} xMin={xMin} xMax={xMax} /> : <p className="text-muted-foreground">Corrija os campos para ver o gráfico.</p>}
        </Panel>
      </div>
    </>
  );
}
