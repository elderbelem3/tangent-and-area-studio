import { useMemo } from "react";
import { fmt } from "@/lib/calc";
import { analyzeFunction } from "@/lib/analysis";
import { FUNCTION_SLOTS, type ComparisonFunction } from "@/lib/comparison";
import { MathExpression } from "@/components/MathExpression";

const list = (xs: number[]) => xs.length ? xs.map((x) => fmt(x, 4)).join(", ") : "nenhuma no intervalo";
// Analysis is pure: returning to an unchanged graph reuses the exact result.
const analysisCache = new Map<string, ReturnType<typeof analyzeFunction>>();
function cachedAnalysis(expression: string, xMin: number, xMax: number) {
  const key = JSON.stringify([expression, xMin, xMax]);
  if (analysisCache.has(key)) return analysisCache.get(key) ?? null;
  const result = analyzeFunction(expression, xMin, xMax);
  if (analysisCache.size >= 50) {
    const oldest = analysisCache.keys().next().value;
    if (oldest !== undefined) analysisCache.delete(oldest);
  }
  analysisCache.set(key, result);
  return result;
}

export function AnalysisPanels({ functions, xMin, xMax }: { functions: ComparisonFunction[]; xMin: number; xMax: number }) {
  const items = useMemo(() => functions.flatMap((f) => { const a = cachedAnalysis(f.expression, xMin, xMax); return a ? [{ slot: f.slot, a }] : []; }), [functions, xMin, xMax]);
  if (!items.length) return null;
  return <>
    <section className="chalk-summary" aria-label="Resumo Matemático"><div><div className="chalk-summary-box">
      <h3 className="mb-3 text-lg">Resumo Matemático</h3>
      <ul className="grid gap-4 sm:grid-cols-2">{items.map(({ slot, a }) => { const n = FUNCTION_SLOTS[slot]; return <li key={slot} className="space-y-1 font-mono text-sm">
        <MathExpression expression={a.expression} prefix={`${n}(x) = `} />
        {a.d1 ? <MathExpression expression={a.d1} prefix={`${n}'(x) = `} /> : <p>Derivada numérica</p>}
        <p className="font-mono">Raízes: {a.constantValue === 0 ? "todos os números reais (função nula)" : list(a.roots)}</p>
        <p className="font-mono">Pontos críticos{a.constantValue !== null ? " isolados" : ""}: {a.critical.length ? a.critical.map((c) => `(${fmt(c.x, 4)}, ${fmt(c.y, 4)})`).join(", ") : "nenhum"}</p>
      </li>; })}</ul>
    </div></div></section>
    <section className="uv-panel" aria-label="Resolução Passo a Passo Completa"><div><div className="uv-box">
      <h3 className="mb-4 text-lg">Resolução Passo a Passo Completa · Luz Negra</h3>
      <div className="space-y-6">{items.map(({ slot, a }) => { const n = FUNCTION_SLOTS[slot]; const r = a; return <article key={slot} className="space-y-3 text-sm">
        <MathExpression expression={r.expression} prefix={`${n}(x) = `} />
        {r.constantValue !== null ? <ol className="space-y-2">
          <li><span>Passo 1 — Função constante:</span><p>{n}(x) = {fmt(r.constantValue)} não depende de x e mantém o mesmo valor em todo o domínio ℝ.</p></li>
          <li><span>Passo 2 — Derivadas:</span><p className="font-mono">{n}′(x) = 0 · {n}″(x) = 0</p><p>A derivada é zero em todo o domínio. Não há pontos críticos isolados nem pontos de inflexão; não é necessário enumerar valores de x.</p></li>
          <li><span>Conclusão — Raízes:</span><p>{r.constantValue === 0 ? "A função nula tem todos os números reais como raízes; não há uma raiz isolada a determinar." : "Uma constante não nula não possui raízes reais: não existe x que torne o valor da função igual a zero."}</p></li>
        </ol> : <ol className="space-y-2">
          <li><span>Passo 1 — Derivada:</span>{r.d1 ? <MathExpression expression={r.d1} prefix={`${n}'(x) = `} /> : <p>Calculada numericamente</p>}</li>
          <li><span>Passo 2 — Igualar a zero:</span><p className="font-mono">{n}′(x) = 0 ⇒ x = {list(r.critical.map((c) => c.x))}</p></li>
          <li><span>Passo 3 — Pontos críticos:</span>{r.critical.length ? r.critical.map((c, i) => <p key={i} className="font-mono">{n}({fmt(c.x, 4)}) = {fmt(c.y, 5)} → ({fmt(c.x, 4)}, {fmt(c.y, 5)})</p>) : <p className="font-mono">Nenhum ponto crítico no intervalo.</p>}</li>
          <li><span>Passo 4 — Teste de sinal de {n}′:</span><p>Intervalos separados por zeros da derivada e restrições de domínio.</p>{r.signs.map((s, i) => <p key={i} className="font-mono">({fmt(s.from, 3)}, {fmt(s.to, 3)}): {n}′ {s.sign === "+" ? "> 0 → crescente" : s.sign === "−" ? "< 0 → decrescente" : "= 0 → constante"}</p>)}{r.critical.map((c, i) => <p key={`k${i}`} className="font-mono">x = {fmt(c.x, 4)}: {c.kind}</p>)}</li>
          <li><span>Raízes ({n}(x) = 0):</span><p className="font-mono">x = {list(r.roots)}</p></li>
        </ol>}
        <div className="uv-extra space-y-1">
          <span>Informações adicionais (UV)</span>
          <p className="font-mono">Domínio: {r.domain}</p>
          <p className="font-mono">lim x→+∞ {n}(x) = {r.limitPos} · lim x→−∞ {n}(x) = {r.limitNeg}</p>
          {r.d2 ? <MathExpression expression={r.d2} prefix={`${n}''(x) = `} /> : <p>Segunda derivada numérica</p>}
          <p className="font-mono">Inflexão ({n}″ = 0 com troca de sinal): {r.inflections.length ? r.inflections.map((p) => `(${fmt(p.x, 4)}, ${fmt(p.y, 4)})`).join(", ") : "nenhuma no intervalo"}</p>
        </div>
      </article>; })}</div>
    </div></div></section>
  </>;
}
