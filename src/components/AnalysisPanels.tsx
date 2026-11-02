import { useMemo } from "react";
import { fmt } from "@/lib/calc";
import { analyzeFunction } from "@/lib/analysis";
import { FUNCTION_SLOTS, type ComparisonFunction } from "@/lib/comparison";

const list = (xs: number[]) => xs.length ? xs.map((x) => fmt(x, 4)).join(", ") : "nenhuma no intervalo";

export function AnalysisPanels({ functions, xMin, xMax }: { functions: ComparisonFunction[]; xMin: number; xMax: number }) {
  const items = useMemo(() => functions.map((f) => ({ slot: f.slot, a: analyzeFunction(f.expression, xMin, xMax) })).filter((i) => i.a), [functions, xMin, xMax]);
  if (!items.length) return null;
  return <>
    <section className="chalk-summary" aria-label="Resumo Matemático"><div><div className="chalk-summary-box">
      <h3 className="mb-3 text-lg">Resumo Matemático</h3>
      <ul className="grid gap-4 sm:grid-cols-2">{items.map(({ slot, a }) => { const n = FUNCTION_SLOTS[slot]; return <li key={slot} className="space-y-1 font-mono text-sm">
        <p className="font-mono">{n}(x) = {a!.expression}</p>
        <p className="font-mono">{n}′(x) = {a!.d1 ?? "(numérica)"}</p>
        <p className="font-mono">Raízes: {list(a!.roots)}</p>
        <p className="font-mono">Pontos críticos: {a!.critical.length ? a!.critical.map((c) => `(${fmt(c.x, 4)}, ${fmt(c.y, 4)})`).join(", ") : "nenhum"}</p>
      </li>; })}</ul>
    </div></div></section>
    <section className="uv-panel" aria-label="Resolução Passo a Passo Completa"><div><div className="uv-box">
      <h3 className="mb-4 text-lg">Resolução Passo a Passo Completa · Luz Negra</h3>
      <div className="space-y-6">{items.map(({ slot, a }) => { const n = FUNCTION_SLOTS[slot]; const r = a!; return <article key={slot} className="space-y-3 text-sm">
        <p className="font-mono text-base">{n}(x) = {r.expression}</p>
        <ol className="space-y-2">
          <li><span>Passo 1 — Derivada:</span><p className="font-mono">{n}′(x) = d/dx [{r.expression}] = {r.d1 ?? "calculada numericamente"}</p></li>
          <li><span>Passo 2 — Igualar a zero:</span><p className="font-mono">{r.d1 ?? `${n}′(x)`} = 0 ⇒ x = {list(r.critical.map((c) => c.x))}</p></li>
          <li><span>Passo 3 — Pontos críticos:</span>{r.critical.length ? r.critical.map((c, i) => <p key={i} className="font-mono">{n}({fmt(c.x, 4)}) = {fmt(c.y, 5)} → ({fmt(c.x, 4)}, {fmt(c.y, 5)})</p>) : <p className="font-mono">Nenhum ponto crítico no intervalo.</p>}</li>
          <li><span>Passo 4 — Teste de sinal de {n}′:</span>{r.signs.map((s, i) => <p key={i} className="font-mono">({fmt(s.from, 3)}, {fmt(s.to, 3)}): {n}′ {s.sign === "+" ? "> 0 → crescente" : "< 0 → decrescente"}</p>)}{r.critical.map((c, i) => <p key={`k${i}`} className="font-mono">x = {fmt(c.x, 4)}: {c.kind}</p>)}</li>
          <li><span>Raízes ({n}(x) = 0):</span><p className="font-mono">x = {list(r.roots)}</p></li>
        </ol>
        <div className="uv-extra space-y-1">
          <span>Informações adicionais (UV)</span>
          <p className="font-mono">Domínio: {r.domain}</p>
          <p className="font-mono">lim x→+∞ {n}(x) = {r.limitPos} · lim x→−∞ {n}(x) = {r.limitNeg}</p>
          <p className="font-mono">{n}″(x) = {r.d2 ?? "(numérica)"}</p>
          <p className="font-mono">Inflexão ({n}″ = 0 com troca de sinal): {r.inflections.length ? r.inflections.map((p) => `(${fmt(p.x, 4)}, ${fmt(p.y, 4)})`).join(", ") : "nenhuma no intervalo"}</p>
        </div>
      </article>; })}</div>
    </div></div></section>
  </>;
}
