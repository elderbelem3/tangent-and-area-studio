import { createContext, useContext, useDeferredValue, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Code2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inspectParsing, type RenderTrace } from "@/lib/code-inspection";
import { derivativeSteps } from "@/lib/uv-steps";
import { MathFormula } from "@/components/MathFormula";

const CodeContext = createContext({ enabled: false, toggle: () => {} });
let traces: RenderTrace[] = [];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const EMPTY: RenderTrace[] = [];

export function CodeModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const value = useMemo(() => ({ enabled, toggle: () => setEnabled((previous) => !previous) }), [enabled]);
  return <CodeContext.Provider value={value}>{children}</CodeContext.Provider>;
}

export function CodeModeToggle() {
  const { enabled, toggle } = useContext(CodeContext);
  return <Button variant={enabled ? "default" : "outline"} size="sm" className="my-2 shrink-0" aria-pressed={enabled} onClick={toggle} title="Inspecionar a execução atual"><Code2 className="h-4 w-4" />Modo Código</Button>;
}

export function useRenderTrace(factory: () => RenderTrace[], dependencies: React.DependencyList) {
  const { enabled } = useContext(CodeContext);
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => {
      traces = factory();
      listeners.forEach((listener) => listener());
    }, 100);
    return () => { window.clearTimeout(timer); traces = EMPTY; listeners.forEach((listener) => listener()); };
    // Renderer dependencies determine when a new committed input is available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...dependencies]);
}

export function CodeInspector({ expressions, renderer, blocked = false }: { expressions: string[]; renderer: string; blocked?: boolean }) {
  const { enabled } = useContext(CodeContext);
  return enabled ? <InspectionPanel expressions={expressions} renderer={renderer} blocked={blocked} /> : null;
}

function InspectionPanel({ expressions, renderer, blocked }: { expressions: string[]; renderer: string; blocked: boolean }) {
  const currentTraces = useSyncExternalStore(subscribe, () => traces, () => EMPTY);
  const key = JSON.stringify(expressions);
  const deferred = useDeferredValue(key);
  const analyses = useMemo(() => (JSON.parse(deferred) as string[]).map((expression) => ({ expression, parsing: inspectParsing(expression), steps: derivativeSteps(expression) })), [deferred]);
  return <section className="code-inspector mt-6 min-w-0 overflow-hidden rounded-lg border" aria-label="Inspeção de código">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><Terminal className="h-4 w-4" />Modo Código</h2>
      <span className="code-muted text-xs">{key !== deferred ? "Atualizando…" : renderer} · somente leitura</span>
    </div>
    <div className="max-h-[640px] space-y-5 overflow-y-auto p-4 text-xs leading-relaxed">
      {analyses.map(({ expression, parsing, steps }, index) => {
        const trace = key === deferred && !blocked ? currentTraces.find((item) => item.expression === expression && item.renderer === renderer) : undefined;
        return <article key={index} className="min-w-0 space-y-3 border-b pb-5 last:border-0 last:pb-0">
          <h3 className="code-accent font-semibold">{`// expressão ${index + 1}`}</h3>
          <Output label="entrada.original" value={expression} />
          <Output label="parser.normalizada" value={parsing.normalized} />
          <details open><summary className="cursor-pointer py-2 code-accent">parser.nós · árvore de tokens ({parsing.nodes.length})</summary><Output value={parsing.error ? { error: parsing.error } : parsing.nodes} /></details>
          <Output label="renderizador.estado" value={{ renderer, status: blocked ? "Bloqueado: parâmetros inválidos" : parsing.error ? "Aguardando expressão válida" : trace?.status ?? "Sem dados enviados pelo gráfico atual", amostras: trace?.count ?? 0 }} />
          <details><summary className="cursor-pointer py-2 code-accent">amostras.reais · {trace ? `prévia de ${trace.points.length} / ${trace.count}` : "indisponíveis"}</summary><Output value={trace?.points ?? []} /></details>
          <details><summary className="cursor-pointer py-2 code-accent">derivada.passos · d/dx</summary>
            {steps ? steps.map((step, i) => <div key={i} className="space-y-2 py-2"><h4 className="font-semibold">{step.title}</h4>{step.lines.map((line, j) => <p className="break-words" key={j}>{line}</p>)}{step.formulas?.map((formula, j) => <MathFormula key={j} latex={formula} />)}</div>) : <p className="code-muted py-2">Derivação simbólica indisponível para esta expressão no método atual.</p>}
          </details>
        </article>;
      })}
    </div>
  </section>;
}

function Output({ label, value }: { label?: string; value: unknown }) {
  return <div className="min-w-0">{label && <p className="code-accent mb-1">{label}</p>}<pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all">{JSON.stringify(value, null, 2)}</pre></div>;
}