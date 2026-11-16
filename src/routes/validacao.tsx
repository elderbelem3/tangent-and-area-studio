import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Activity, CheckCircle2, Clock3, FlaskConical, LoaderCircle, Play, XCircle } from "lucide-react";
import { PageHeader } from "@/components/Lab";
import { MathExpression } from "@/components/MathExpression";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModuleState } from "@/lib/module-state";
import { STRESS_CASES, STRESS_PILLARS, runStressBattery, type StressResult } from "@/lib/stress-test";

export const Route = createFileRoute("/validacao")({
  head: () => ({ meta: [
    { title: "Validação Algorítmica (Stress Test) · CalculusLab" },
    { name: "description", content: "Validação em lote dos quatro pilares do CalculusLab com gabaritos analíticos, tolerância numérica e relatório de divergências." },
    { property: "og:title", content: "Validação Algorítmica · CalculusLab" },
    { property: "og:description", content: "Compare resultados reais de funções, limites, derivadas e integrais com 64 gabaritos analíticos independentes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ValidationPage,
});

function valueText(value: StressResult["actual"]) {
  if (typeof value !== "number") return value;
  if (!Number.isFinite(value)) return value > 0 ? "+∞" : "−∞";
  return new Intl.NumberFormat("pt-BR", { maximumSignificantDigits: 12 }).format(Object.is(value, -0) ? 0 : value);
}

function ValidationPage() {
  const [results, setResults] = useModuleState<StressResult[]>("stress.results", []);
  const [pillar, setPillar] = useModuleState("stress.pillar", "Funções");
  const [filter, setFilter] = useModuleState("stress.filter", "todos");
  const [running, setRunning] = useState(false);
  const busy = useRef(false);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const elapsed = results.reduce((sum, r) => sum + r.elapsed, 0);
  const completed = results.length === STRESS_CASES.length;
  const run = async () => {
    if (busy.current) return;
    busy.current = true;
    const current = ++generation.current;
    setRunning(true);
    setResults([]);
    try { await runStressBattery(setResults, () => current !== generation.current); }
    finally { busy.current = false; if (current === generation.current) setRunning(false); }
  };

  return <>
    <PageHeader tag="Stress Test / Validação UV" title="Validação Algorítmica (Stress Test)" desc="Gabaritos analíticos independentes para os quatro pilares do CalculusLab." />
    <section aria-label="Execução da bateria" className="mb-7 flex flex-wrap items-center justify-between gap-5 border-b border-border pb-6">
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-semibold"><FlaskConical className="h-5 w-5 shrink-0 text-primary" />64 casos · 16 por pilar</p>
        <p className="mt-2 text-sm text-muted-foreground">Tolerância absoluta ≤ 10⁻⁴ · Cálculo local · Gabaritos fixos</p>
        <p className="mt-1 text-xs text-muted-foreground">Inclui domínio, descontinuidades, infinito, pontos não deriváveis e rejeição de integrais impróprias.</p>
      </div>
      <Button onClick={() => { void run(); }} disabled={running} className="min-h-11 h-auto max-w-full whitespace-normal py-3">
        {running ? <LoaderCircle className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" /> : <Play className="h-4 w-4 shrink-0" />}
        {running ? "Executando bateria…" : "Executar Bateria de Testes"}
      </Button>
    </section>
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Indicadores de validação">
      {[
        { label: "Casos executados", value: `${results.length} / ${STRESS_CASES.length}`, icon: Activity, color: "text-primary" },
        { label: "Aprovados", value: String(passed), icon: CheckCircle2, color: "text-accent-strong" },
        { label: "Divergências", value: String(failed), icon: XCircle, color: "text-destructive" },
        { label: "Tempo de cálculo", value: `${elapsed.toFixed(1)} ms`, icon: Clock3, color: "text-foreground" },
      ].map((stat) => <div key={stat.label} className="min-w-0 rounded-xl border border-border bg-card p-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><stat.icon className={`h-4 w-4 shrink-0 ${stat.color}`} />{stat.label}</p><p className={`mt-3 break-words font-mono text-xl font-semibold ${stat.color}`}>{stat.value}</p></div>)}
    </div>
    <section className="mb-7" aria-label="Progresso da bateria">
      <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm"><span role="status" aria-live="polite">{running ? `Executando: ${results.length} de 64` : completed ? `Bateria concluída · ${passed} aprovados e ${failed} divergências` : results.length ? "Execução interrompida; execute novamente para concluir." : "Bateria pronta para execução"}</span><span className="font-mono text-muted-foreground">{Math.round(results.length / STRESS_CASES.length * 100)}%</span></div>
      <Progress value={results.length / STRESS_CASES.length * 100} aria-label="Casos executados" />
    </section>
    <Tabs value={pillar} onValueChange={setPillar}>
      <TabsList aria-label="Pilares da validação" className="mb-5 grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
        {STRESS_PILLARS.map((name) => <TabsTrigger key={name} value={name} className="min-h-11">{name}</TabsTrigger>)}
      </TabsList>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Matriz de comparação</h2>
        <Tabs value={filter} onValueChange={setFilter}><TabsList aria-label="Filtrar resultados" className="h-auto"><TabsTrigger value="todos" className="min-h-10">Todos</TabsTrigger><TabsTrigger value="divergencias" className="min-h-10">Divergências ({failed})</TabsTrigger></TabsList></Tabs>
      </div>
      {STRESS_PILLARS.map((name) => {
        const group = results.filter((r) => r.test.pillar === name);
        const approved = group.filter((r) => r.passed).length;
        const visible = STRESS_CASES.filter((t) => t.pillar === name).filter((t) => filter === "todos" || group.some((r) => r.test.id === t.id && !r.passed));
        return <TabsContent key={name} value={name}>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm"><span>{approved} aprovados · {group.length - approved} divergências · {16 - group.length} pendentes</span><span className="font-mono text-accent-strong">{group.length ? (approved / group.length * 100).toFixed(1) : "0"}% de aprovação</span><Progress className="w-32" value={group.length ? approved / group.length * 100 : 0} aria-label={`Aprovação em ${name}`} /></div>
          <div className="max-w-full overflow-x-auto rounded-xl border border-border" tabIndex={0} role="region" aria-label={`Resultados de ${name}`}>
            <table className="w-full min-w-[800px] text-left text-sm">
              <caption className="sr-only">{name}: expressão, resultado esperado e obtido, erro absoluto, tempo e status</caption>
              <thead className="border-b border-border bg-muted"><tr>{["Expressão / parâmetros", "Esperado", "Obtido", "Erro absoluto", "Tempo", "Status"].map((title) => <th key={title} scope="col" className="px-4 py-3 text-xs font-semibold">{title}</th>)}</tr></thead>
              <tbody>{visible.map((test) => {
                const result = group.find((r) => r.test.id === test.id);
                return <tr key={test.id} className={`border-b border-border last:border-0 ${result && !result.passed ? "bg-destructive/5" : "bg-card"}`}>
                  <td className="max-w-72 px-4 py-3"><div className="max-w-64 overflow-x-auto"><MathExpression expression={test.expression} /></div><p className="mt-1 font-mono text-xs text-primary">{test.parameters}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{test.basis}</p></td>
                  <td className="px-4 py-3 font-mono text-xs">{valueText(test.expected)}</td>
                  <td className="max-w-64 px-4 py-3"><span className="font-mono text-xs">{result ? valueText(result.actual) : "—"}</span>{result?.detail && <p className="mt-1 max-w-52 text-xs leading-relaxed text-muted-foreground">{result.detail}</p>}</td>
                  <td className="px-4 py-3 font-mono text-xs">{result?.error != null ? result.error.toExponential(2) : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{result ? `${result.elapsed.toFixed(2)} ms` : "—"}</td>
                  <td className="px-4 py-3">{result ? <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold ${result.passed ? "border-accent-strong/30 bg-accent-strong/10 text-accent-strong" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>{result.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{result.passed ? "Aprovado" : "Divergência"}</span> : <span className="text-xs text-muted-foreground">Pendente</span>}</td>
                </tr>;
              })}</tbody>
            </table>
            {visible.length === 0 && <p className="p-6 text-sm text-muted-foreground">Nenhuma divergência registrada neste pilar.</p>}
          </div>
        </TabsContent>;
      })}
    </Tabs>
    <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Valores exibidos podem ser arredondados; a comparação usa precisão completa. “Indefinido” valida ausência de valor ou limite; “integral rejeitada” valida a recusa de um cálculo não regular. Esta bateria é finita e não comprova correção para todas as expressões.</p>
  </>;
}