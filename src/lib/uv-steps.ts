import { derivative as symD, parse, rationalize, simplify, type MathNode } from "mathjs";
import { constantValue, fmt, integrate, normalize, parseFn } from "@/lib/calc";
import { realDomain } from "@/lib/domain";
import { evaluateLimit, oscillationAt } from "@/lib/limits";
import { expressionLatex } from "@/lib/math-format";

export type UvStep = { title: string; lines: string[]; formulas?: string[] };

const show = (s: string) => s.replace(/\blog\(/g, "ln(").replace(/ \* /g, "·").replace(/ \^ /g, "^");
const str = (n: MathNode) => show(n.toString());
const hasX = (n: MathNode) => n.filter((k) => (k as { isSymbolNode?: boolean }).isSymbolNode === true && (k as unknown as { name: string }).name === "x").length > 0;
const d = (n: MathNode) => simplify(symD(n, "x"));
const strip = (n: MathNode): MathNode => (n.type === "ParenthesisNode" ? strip((n as unknown as { content: MathNode }).content) : n);
type Op = { op: string; fn: string; args: MathNode[]; name?: string };
const asOp = (n: MathNode) => n as unknown as Op;
const evalAt = (n: MathNode, x: number) => { try { return Number(n.compile().evaluate({ x })); } catch { return NaN; } };

/* ---------------- Derivadas ---------------- */
function ruleOf(n0: MathNode): { rule: string; lines: string[] } {
  const n = strip(n0);
  if (!hasX(n)) return { rule: "Constante", lines: [`d/dx [${str(n)}] = 0`] };
  if (n.type === "SymbolNode") return { rule: "Identidade", lines: ["d/dx [x] = 1"] };
  if (n.type === "OperatorNode") {
    const o = asOp(n), [u, v] = o.args;
    if ((o.op === "+" || o.op === "-") && o.args.length === 2) return { rule: "Regra da soma/diferença", lines: [`d/dx [${str(u!)} ${o.op} ${str(v!)}] = d/dx[${str(u!)}] ${o.op} d/dx[${str(v!)}]`, `= (${str(d(u!))}) ${o.op} (${str(d(v!))})`] };
    if (o.op === "-" && o.args.length === 1) return { rule: "Multiplicação por −1", lines: [`d/dx [−${str(u!)}] = −(${str(d(u!))})`] };
    if (o.op === "*") {
      if (u && v && (!hasX(u) || !hasX(v))) { const [k, g] = hasX(u) ? [v, u] : [u, v]; return { rule: "Regra do múltiplo constante", lines: [`d/dx [${str(k)}·g] = ${str(k)}·g′, com g = ${str(g)}`, `g′ = ${str(d(g))}`] }; }
      return { rule: "Regra do Produto", lines: [`u = ${str(u!)}  ⇒  u′ = ${str(d(u!))}`, `v = ${str(v!)}  ⇒  v′ = ${str(d(v!))}`, "(u·v)′ = u′·v + u·v′", `= (${str(d(u!))})·(${str(v!)}) + (${str(u!)})·(${str(d(v!))})`] };
    }
    if (o.op === "/") {
      if (u && v && !hasX(v)) return { rule: "Regra do múltiplo constante", lines: [`d/dx [g/${str(v)}] = g′/${str(v)}, g′ = ${str(d(u))}`] };
      return { rule: "Regra do Quociente", lines: [`u = ${str(u!)}  ⇒  u′ = ${str(d(u!))}`, `v = ${str(v!)}  ⇒  v′ = ${str(d(v!))}`, "(u/v)′ = (u′·v − u·v′) / v²", `= [(${str(d(u!))})·(${str(v!)}) − (${str(u!)})·(${str(d(v!))})] / (${str(v!)})²`] };
    }
    if (o.op === "^") {
      if (!hasX(v!)) {
        if (strip(u!).type === "SymbolNode") return { rule: "Regra da Potência", lines: [`d/dx [xⁿ] = n·xⁿ⁻¹ com n = ${str(v!)}`, `= ${str(v!)}·x^(${str(simplify(parse(`${v!.toString()} - 1`)))})`] };
        return { rule: "Regra da Cadeia (potência)", lines: [`g(x) = ${str(u!)}  ⇒  g′(x) = ${str(d(u!))}`, `d/dx [g(x)^${str(v!)}] = ${str(v!)}·g(x)^(${str(v!)}−1)·g′(x)`] };
      }
      return { rule: "Exponencial geral", lines: ["d/dx [u^v] = u^v·(v′·ln u + v·u′/u)"] };
    }
  }
  if (n.type === "FunctionNode") {
    const o = asOp(n), name = (n as unknown as { fn: { name: string } }).fn.name, g = o.args[0]!;
    const outer: Record<string, string> = { sin: "cos(u)", cos: "−sin(u)", tan: "sec²(u)", exp: "exp(u)", log: "1/u", sqrt: "1/(2√u)", abs: "u/|u|" };
    const base = `d/du [${name === "log" ? "ln" : name}(u)] = ${outer[name] ?? "f′(u)"}${name === "abs" ? ", para u ≠ 0; em u = 0, comparar as derivadas laterais" : ""}`;
    if (strip(g).type === "SymbolNode") return { rule: "Derivada elementar", lines: [base.replace(/u/g, "x")] };
    return { rule: "Regra da Cadeia", lines: [`u = g(x) = ${str(g)}  ⇒  g′(x) = ${str(d(g))}`, base, `d/dx [f(g(x))] = f′(g(x))·g′(x)`] };
  }
  return { rule: "Derivação direta", lines: [] };
}

export function derivativeSteps(expression: string): UvStep[] | null {
  try {
    const value = constantValue(expression);
    if (value !== null) return [
      { title: "Passo 1 — Função constante", lines: [`f(x) = ${show(expression)} = ${fmt(value)}. O valor não depende de x.`] },
      { title: "Passo 2 — Derivada da constante", lines: ["f′(x) = 0 e f″(x) = 0 em todo o domínio ℝ."] },
      { title: "Conclusão", lines: ["A função é constante: não há pontos críticos isolados nem pontos de inflexão.", value === 0 ? "A função nula tem todos os números reais como raízes; não há uma raiz isolada a determinar." : "A função constante não nula não possui raízes reais: nenhum x faz f(x) = 0."] },
    ];
    const node = parse(normalize(expression)), top = ruleOf(node);
    const steps: UvStep[] = [{ title: "Passo 1 — Identificar a estrutura", lines: [`f(x) = ${str(node)}`, `Regra principal: ${top.rule}`] }];
    steps.push({ title: `Passo 2 — Aplicar: ${top.rule}`, lines: top.lines });
    const sub = strip(node);
    if (sub.type === "OperatorNode" && ["+", "-"].includes(asOp(sub).op)) {
      steps.push({ title: "Passo 3 — Derivar cada termo", lines: asOp(sub).args.map((a) => { const r = ruleOf(a); return `${str(a)} → ${r.rule}: ${str(d(a))}`; }) });
    }
    steps.push({ title: `Passo ${steps.length + 1} — Simplificar`, lines: [], formulas: [`f'(x) = ${expressionLatex(d(node).toString())}`] });
    const originalDomain = realDomain(expression, -10, 10), derivativeDomain = realDomain(d(node).toString(), -10, 10);
    steps.push({ title: "Validade e domínio", lines: [`Domínio de f: ${originalDomain.text}.`, `A fórmula de f′ vale onde está definida: ${derivativeDomain.text}.`, ...(expression.includes("abs") ? ["Nos zeros do argumento de abs, compare as derivadas laterais. Para abs(x), f′(0) não existe: a inclinação à esquerda é −1 e à direita é 1."] : [])] });
    return steps;
  } catch { return null; }
}

/* ---------------- Limites ---------------- */
function polyCoeffs(n: MathNode): number[] | null {
  try { const r = rationalize(n, {}, true) as unknown as { coefficients: number[]; denominator: MathNode | null }; return r.denominator === null && r.coefficients?.length ? r.coefficients : null; } catch { return null; }
}
const synth = (co: number[], c: number) => { const hi = [...co].reverse(); const out: number[] = []; let acc = 0; for (const k of hi) { acc = acc * c + k; out.push(acc); } out.pop(); return out.reverse(); };
const polyStr = (co: number[]) => co.map((k, i) => ({ k, i })).filter((t) => Math.abs(t.k) > 1e-12).reverse().map((t, j) => `${j && t.k >= 0 ? "+ " : t.k < 0 ? "− " : ""}${fmt(Math.abs(t.k), 4)}${t.i ? (t.i === 1 ? "x" : `x^${t.i}`) : ""}`).join(" ") || "0";
const polyEval = (co: number[], x: number) => co.reduce((s, k, i) => s + k * x ** i, 0);
const small = (v: number) => Math.abs(v) < 1e-9;

export function limitSteps(expression: string, c: number, L: number, L1: number, L2: number): UvStep[] | null {
  const { fn } = parseFn(expression); if (!fn) return null;
  const node = strip(parse(normalize(expression)));
  const steps: UvStep[] = [];
  const direct = fn(c);
  const substituted = node.transform((n) => n.type === "SymbolNode" && n.toString() === "x" ? parse(String(c)) : n);
  steps.push({ title: "Passo 1 — Substituição direta", lines: [Number.isFinite(direct) ? `f(${fmt(c)}) = ${fmt(direct, 6)}` : "→ expressão indefinida neste ponto"], formulas: [`f(${fmt(c)}) = ${expressionLatex(substituted.toString())}`] });
  const oscillation = oscillationAt(expression, c);
  if (oscillation) return [...steps, { title: "Análise de oscilação", lines: [oscillation] }, { title: "Conclusão", lines: ["Nenhum dos limites laterais existe; o limite bilateral não existe."] }];
  if (Number.isFinite(direct) && Math.abs(direct - L) < 1e-3 * Math.max(1, Math.abs(direct))) {
    steps.push({ title: "Passo 2 — Continuidade", lines: [`f é contínua em x = ${fmt(c)}, logo lim f(x) = f(${fmt(c)}) = ${fmt(direct, 6)}`] });
    return steps;
  }
  if (node.type === "OperatorNode" && asOp(node).op === "/") {
    let [u, v] = asOp(node).args as [MathNode, MathNode];
    const nu = evalAt(u, c), nv = evalAt(v, c);
    steps.push({ title: "Passo 2 — Classificar a forma", lines: [`Numerador → ${fmt(nu, 5)} · Denominador → ${fmt(nv, 5)}`, small(nu) && small(nv) ? "Forma indeterminada 0/0" : small(nv) ? `Forma k/0 (k = ${fmt(nu, 4)}) ⇒ tendência a ±∞ (assíntota vertical x = ${fmt(c)})` : "Forma determinada"] });
    if (small(nu) && small(nv)) {
      const pu = polyCoeffs(u), pv = polyCoeffs(v);
      if (pu && pv) {
        let qu = pu, qv = pv, k = 0;
        while (k < 4 && small(polyEval(qu, c)) && small(polyEval(qv, c))) { qu = synth(qu, c); qv = synth(qv, c); k++; }
        steps.push({ title: "Passo 3 — Fatoração de polinômios", lines: [`x = ${fmt(c)} é raiz de ambos ⇒ fator (x − ${fmt(c)})${k > 1 ? `^${k}` : ""}`, `Numerador = (x − ${fmt(c)})${k > 1 ? `^${k}` : ""}·(${polyStr(qu)})`, `Denominador = (x − ${fmt(c)})${k > 1 ? `^${k}` : ""}·(${polyStr(qv)})`, `Cancelando: f(x) = (${polyStr(qu)}) / (${polyStr(qv)}) para x ≠ ${fmt(c)}`] });
        const r = polyEval(qu, c) / polyEval(qv, c);
        steps.push({ title: "Passo 4 — Substituir novamente", lines: [`lim = ${fmt(polyEval(qu, c), 5)} / ${fmt(polyEval(qv, c), 5)} = ${fmt(r, 6)}`] });
        return conclude(steps, L, L1, L2, c);
      }
      if (expression.includes("sqrt")) steps.push({ title: "Passo 3 — Racionalização", lines: ["Multiplique numerador e denominador pelo conjugado do termo com raiz: (√a − b)(√a + b) = a − b²", "Isso elimina a raiz que gera o 0/0; equivalentemente podemos aplicar L'Hôpital:"] });
      for (let i = 0; i < 3; i++) {
        const du = d(u), dv = d(v), a = evalAt(du, c), b = evalAt(dv, c);
        const quotient = evaluateLimit(`(${du.toString()})/(${dv.toString()})`, c);
        if (expression.includes("abs") || (!small(a) || !small(b)) && (!Number.isFinite(a) || !Number.isFinite(b) || small(b) || !Number.isFinite(quotient.L) || Math.abs(quotient.L - a / b) > 1e-3)) {
          steps.push({ title: "Análise lateral (sem aplicar L'Hôpital)", lines: ["Não foram estabelecidas as condições da regra nem um limite comum para u′/v′. Analisamos cada lado separadamente.", `À esquerda: ${fmt(L1, 5)}. À direita: ${fmt(L2, 5)}.`] });
          return conclude(steps, L, L1, L2, c);
        }
        steps.push({ title: `Passo ${steps.length + 1} — Regra de L'Hôpital${i ? ` (${i + 1}ª aplicação)` : ""}`, lines: [`lim u/v = lim u′/v′`, `u′ = ${str(du)} → ${fmt(a, 5)}`, `v′ = ${str(dv)} → ${fmt(b, 5)}`, small(a) && small(b) ? "Ainda 0/0 — aplicar novamente" : `lim = ${fmt(a, 5)} / ${fmt(b, 5)} = ${small(b) ? "±∞" : fmt(a / b, 6)}`] });
        if (!(small(a) && small(b))) break;
        u = du; v = dv;
      }
      return conclude(steps, L, L1, L2, c);
    }
  }
  const sideText = (v: number) => Number.isNaN(v) ? "não foi observada convergência (estimativa inconclusiva)" : `${Number.isFinite(v) ? "≈ " : ""}${fmt(v, 5)}`;
  steps.push({ title: `Passo ${steps.length + 1} — Análise dos limites laterais`, lines: [`lim x→${fmt(c)}⁻ f(x): ${sideText(L1)}`, `lim x→${fmt(c)}⁺ f(x): ${sideText(L2)}`] });
  return conclude(steps, L, L1, L2, c);
}
function conclude(steps: UvStep[], L: number, L1: number, L2: number, c: number) {
  steps.push({ title: "Conclusão", lines: [Number.isNaN(L) ? `Laterais: ${fmt(L1, 5)} (esq.) e ${fmt(L2, 5)} (dir.) ⇒ o limite bilateral não existe` : `lim x→${fmt(c)} f(x) = ${fmt(L, 6)}`] });
  return steps;
}

/* ---------------- Integrais ---------------- */
type Anti = { F: MathNode; method: string; lines: string[] };
const P = (s: string) => parse(s);
function linear(g: MathNode): number | null { const dg = d(g); return hasX(g) && !hasX(dg) ? evalAt(dg, 0) : null; }
function anti(n0: MathNode): Anti | null {
  const n = strip(n0), s = n.toString();
  if (!hasX(n)) return { F: P(`(${s})*x`), method: "Constante", lines: [`∫ ${str(n)} dx = ${str(n)}·x`] };
  if (n.type === "SymbolNode") return { F: P("x^2/2"), method: "Potência", lines: ["∫ x dx = x²/2"] };
  if (n.type === "OperatorNode") {
    const o = asOp(n), [u, v] = o.args;
    if ((o.op === "+" || o.op === "-") && o.args.length === 2) { const A = anti(u!), B = anti(v!); if (!A || !B) return null; return { F: P(`(${A.F}) ${o.op} (${B.F})`), method: "Linearidade", lines: [`∫ (${str(u!)} ${o.op} ${str(v!)}) dx = ∫ ${str(u!)} dx ${o.op} ∫ ${str(v!)} dx`, ...A.lines, ...B.lines] }; }
    if (o.op === "-" && o.args.length === 1) { const A = anti(u!); return A && { F: P(`-(${A.F})`), method: A.method, lines: A.lines }; }
    if (o.op === "*") {
      if (!hasX(u!) || !hasX(v!)) { const [k, g] = hasX(u!) ? [v!, u!] : [u!, v!]; const A = anti(g); return A && { F: P(`(${k})*(${A.F})`), method: A.method, lines: [`Constante sai da integral: ${str(k)}·∫ ${str(g)} dx`, ...A.lines] }; }
      const [p, q] = strip(u!).type === "SymbolNode" ? [u!, v!] : strip(v!).type === "SymbolNode" ? [v!, u!] : [null, null];
      if (p && q) { const Q = anti(q); if (Q) { const QQ = anti(simplify(Q.F)); if (QQ) return { F: P(`x*(${Q.F}) - (${QQ.F})`), method: "Integração por partes", lines: ["∫ u dv = u·v − ∫ v du", `u = x ⇒ du = dx · dv = ${str(q)} dx ⇒ v = ${str(simplify(Q.F))}`, `∫ = x·(${str(simplify(Q.F))}) − ∫ ${str(simplify(Q.F))} dx`] }; } }
      return null;
    }
    if (o.op === "/" && !hasX(v!)) { const A = anti(u!); return A && { F: P(`(${A.F})/(${v})`), method: A.method, lines: A.lines }; }
    if (o.op === "/" && !hasX(u!) && strip(v!).type === "SymbolNode") return { F: P(`(${u})*log(abs(x))`), method: "Logaritmo", lines: [`∫ ${str(u!)}/x dx = ${str(u!)}·ln|x|`] };
    if (o.op === "^" && !hasX(v!)) {
      const nExp = evalAt(v!, 0), a = linear(u!);
      if (a === null) return null;
      const sub = strip(u!).type !== "SymbolNode";
      const F = Math.abs(nExp + 1) < 1e-12 ? P(`log(abs(${u}))/${a}`) : P(`(${u})^(${nExp + 1})/(${(nExp + 1) * a})`);
      return { F, method: sub ? "Substituição simples" : "Potência", lines: sub ? [`u = ${str(u!)} ⇒ du = ${fmt(a)} dx`, `∫ u^${fmt(nExp)} du/${fmt(a)} = u^${fmt(nExp + 1)}/(${fmt(nExp + 1)}·${fmt(a)})`] : [`∫ xⁿ dx = xⁿ⁺¹/(n+1), n = ${fmt(nExp)}`] };
    }
  }
  if (n.type === "FunctionNode") {
    const name = (n as unknown as { fn: { name: string } }).fn.name, g = asOp(n).args[0]!, a = linear(g), gs = g.toString();
    const table: Record<string, string> = { sin: `-cos(${gs})`, cos: `sin(${gs})`, exp: `exp(${gs})`, sqrt: `(2/3)*(${gs})^(3/2)` };
    if (name === "log" && strip(g).type === "SymbolNode") return { F: P("x*log(x) - x"), method: "Integração por partes", lines: ["u = ln x ⇒ du = dx/x · dv = dx ⇒ v = x", "∫ ln x dx = x·ln x − ∫ x·(1/x) dx = x·ln x − x"] };
    if (a !== null && table[name]) {
      const sub = strip(g).type !== "SymbolNode";
      return { F: P(`(${table[name]})/${a}`), method: sub ? "Substituição simples" : "Integral imediata", lines: sub ? [`u = ${str(g)} ⇒ du = ${fmt(a)} dx ⇒ dx = du/${fmt(a)}`, `∫ ${name}(u) du/${fmt(a)} = ${show(table[name].replace(gs, "u"))}/${fmt(a)}`] : [`∫ ${name}(x) dx = ${show(table[name])}`] };
    }
  }
  return null;
}

export function integralSteps(expression: string, a: number, b: number): UvStep[] | null {
  return definiteIntegral(expression, a, b).steps;
}

/** Expose only primitives whose derivative is structurally verified, without needing bounds. */
export function indefiniteIntegral(expression: string): string | null {
  try {
    if (!parseFn(expression).fn) return null;
    const node = parse(normalize(expression));
    const A = anti(node);
    if (!A) return null;
    const F = simplify(A.F);
    const difference = simplify(`(${d(F).toString()}) - (${node.toString()})`);
    if (difference.toString() !== "0") return null;
    return F.toString();
  } catch { return null; }
}

export function definiteIntegral(expression: string, a: number, b: number): { value: number; method: "primitiva" | "Simpson" | null; error: string | null; steps: UvStep[] | null } {
  const invalid = (error: string) => ({ value: NaN, method: null, error, steps: null });
  const { fn } = parseFn(expression); if (!fn || !Number.isFinite(a) || !Number.isFinite(b)) return invalid("Informe uma função e limites válidos.");
  if (a === b) return { value: 0, method: "Simpson", error: null, steps: [{ title: "Intervalo nulo", lines: ["Os limites coincidem; a integral no intervalo nulo é 0."] }] };
  const domain = realDomain(expression, a, b);
  if (domain.poles.length) return invalid(`Integral imprópria não avaliada: ${expression} não está definida em x = ${domain.poles.map((x) => fmt(x, 6)).join(", ")}, dentro do intervalo. Não aplicamos Simpson nem F(b) − F(a) através de singularidades; o valor principal de Cauchy não é a integral comum.${/^(?:1\s*\/\s*x|1\s*\/\s*\(x\))$/.test(expression.trim()) ? " Para 1/x, a integral imprópria é divergente neste intervalo." : " A convergência deve ser analisada por limites laterais."}`);
  if (domain.invalidInterior) return invalid(`A função não é real em todo o intervalo. Domínio: ${domain.text}.`);
  if (domain.unresolved) return invalid(`Existem restrições de domínio cuja regularidade no intervalo não foi estabelecida: ${domain.text}. A integral não foi calculada.`);
  const numeric = integrate(fn, a, b);
  if (!Number.isFinite(numeric)) return invalid("Não foi possível calcular uma integral finita; verifique o domínio e a convergência nos extremos.");
  let A: Anti | null = null;
  try { A = anti(parse(normalize(expression))); } catch { A = null; }
  const steps: UvStep[] = [];
  if (A) {
    const F = simplify(A.F), Fb = evalAt(F, b), Fa = evalAt(F, a);
    if (Number.isFinite(Fb - Fa) && Math.abs(Fb - Fa - numeric) < 1e-4 * Math.max(1, Math.abs(numeric))) {
      steps.push({ title: `Passo 1 — Método: ${A.method}`, lines: A.lines });
      steps.push({ title: "Passo 2 — Antiderivada", lines: [], formulas: [`F(x) = ${expressionLatex(F.toString())} + C`, `F'(x) = ${expressionLatex(d(F).toString())}`] });
      steps.push({ title: "Passo 3 — Teorema Fundamental do Cálculo", lines: [`∫ de ${fmt(a)} a ${fmt(b)} f(x) dx = F(${fmt(b)}) − F(${fmt(a)})`, `= ${fmt(Fb, 6)} − (${fmt(Fa, 6)})`, `= ${fmt(Fb - Fa, 6)}`] });
      return { value: Fb - Fa, method: "primitiva", error: null, steps };
    }
  }
  steps.push({ title: "Passo 1 — Antiderivada", lines: ["Não foi encontrada uma antiderivada elementar pelos métodos de substituição simples ou por partes."] });
  steps.push({ title: "Passo 2 — Aproximação numérica (Simpson)", lines: [`∫ de ${fmt(a)} a ${fmt(b)} f(x) dx ≈ ${fmt(numeric, 6)}`] });
  return { value: numeric, method: "Simpson", error: null, steps };
}
