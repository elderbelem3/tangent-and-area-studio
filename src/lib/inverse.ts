import { parse, rationalize, simplify, type MathNode } from "mathjs";
import { normalize, parseFn } from "@/lib/calc";

export type InverseStep = { text: string; equation: string };
export type InverseResult = { inverse: string | null; steps: InverseStep[]; error: string | null };

const hasX = (n: MathNode): boolean => n.filter((c) => c.type === "SymbolNode" && (c as unknown as { name: string }).name === "x").length > 0;
const countX = (n: MathNode) => n.filter((c) => c.type === "SymbolNode" && (c as unknown as { name: string }).name === "x").length;
const str = (n: MathNode) => n.toString({ parenthesis: "auto", implicit: "show" });
const clean = (s: string) => { try { return simplify(s).toString({ parenthesis: "auto", implicit: "show" }); } catch { return s; } };

const INVERSE_FN: Record<string, [string, string]> = {
  sin: ["asin", "Aplique o arco-seno"], cos: ["acos", "Aplique o arco-cosseno"], tan: ["atan", "Aplique o arco-tangente"],
  asin: ["sin", "Aplique o seno"], acos: ["cos", "Aplique o cosseno"], atan: ["tan", "Aplique a tangente"],
  exp: ["log", "Aplique o logaritmo natural"], log: ["exp", "Aplique a exponencial"],
  log10: ["10^", "Eleve 10 aos dois lados"], log2: ["2^", "Eleve 2 aos dois lados"],
  sqrt: ["^2", "Eleve ao quadrado os dois lados"], cbrt: ["^3", "Eleve ao cubo os dois lados"],
};

/** Isolate x in left = right (right is an expression in "y"). Works when x appears exactly once. */
export function invertFunction(expression: string): InverseResult {
  let node: MathNode;
  try { node = parse(normalize(expression)); } catch { return { inverse: null, steps: [], error: "Expressão inválida." }; }
  if (!hasX(node)) return { inverse: null, steps: [], error: "A função precisa depender de x." };
  if (countX(node) > 1) return { inverse: null, steps: [], error: "x aparece mais de uma vez: não há isolamento algébrico direto. Use o campo y para encontrar x numericamente." };
  let right = "y";
  const steps: InverseStep[] = [{ text: "Escreva y = f(x)", equation: `y = ${str(node)}` }];
  for (let guard = 0; guard < 40; guard++) {
    while (node.type === "ParenthesisNode") node = (node as unknown as { content: MathNode }).content;
    if (node.type === "SymbolNode") break;
    if (node.type === "OperatorNode") {
      const op = node as unknown as { op: string; fn: string; args: MathNode[] };
      if (op.args.length === 1 && op.fn === "unaryMinus") { right = `-(${right})`; node = op.args[0]!; steps.push({ text: "Multiplique por −1", equation: `${str(node)} = ${clean(right)}` }); continue; }
      if (op.args.length === 1 && op.fn === "unaryPlus") { node = op.args[0]!; continue; }
      const [a, b] = op.args as [MathNode, MathNode];
      const xLeft = hasX(a), other = str(xLeft ? b : a);
      let text = "";
      switch (op.op) {
        case "+": right = `(${right}) - (${other})`; text = `Subtraia ${other}`; break;
        case "-": right = xLeft ? `(${right}) + (${other})` : `(${other}) - (${right})`; text = xLeft ? `Some ${other}` : `Isole o termo com x`; break;
        case "*": right = `(${right}) / (${other})`; text = `Divida por ${other}`; break;
        case "/": right = xLeft ? `(${right}) * (${other})` : `(${other}) / (${right})`; text = xLeft ? `Multiplique por ${other}` : `Inverta a fração`; break;
        case "^":
          if (xLeft) { right = other === "2" ? `sqrt(${right})` : other === "3" ? `cbrt(${right})` : /^\d+$/.test(other) ? `nthRoot(${right}, ${other})` : `(${right})^(1/(${other}))`; text = other === "2" ? "Tire a raiz quadrada (ramo principal)" : `Tire a raiz de índice ${other}`; }
          else { right = other === "e" ? `log(${right})` : `log(${right}, ${other})`; text = "Aplique o logaritmo"; }
          break;
        default: return { inverse: null, steps, error: `Operação "${op.op}" não suportada.` };
      }
      node = xLeft ? a : b;
      steps.push({ text, equation: `${str(node)} = ${clean(right)}` });
      continue;
    }
    if (node.type === "FunctionNode") {
      const f = node as unknown as { fn: { name: string }; args: MathNode[] };
      const name = f.fn.name;
      if (name === "log" && f.args.length === 2) { right = `(${str(f.args[1]!)})^(${right})`; node = f.args[0]!; steps.push({ text: "Aplique a exponencial na base", equation: `${str(node)} = ${clean(right)}` }); continue; }
      const inv = INVERSE_FN[name];
      if (!inv || f.args.length !== 1) return { inverse: null, steps, error: `Função "${name}" não possui inversa simples.` };
      right = inv[0].startsWith("^") ? `(${right})${inv[0]}` : inv[0].endsWith("^") ? `${inv[0]}(${right})` : `${inv[0]}(${right})`;
      node = f.args[0]!;
      steps.push({ text: inv[1], equation: `${str(node)} = ${clean(right)}` });
      continue;
    }
    return { inverse: null, steps, error: "Estrutura não suportada para inversão." };
  }
  const inverse = clean(right.replace(/\by\b/g, "x"));
  steps.push({ text: "Troque y por x para obter f⁻¹(x)", equation: `f⁻¹(x) = ${inverse}` });
  return { inverse, steps, error: null };
}

// ---- Raízes polinomiais com multiplicidade (Durand-Kerner) ----

type Cx = { re: number; im: number };
const cx = (re: number, im = 0): Cx => ({ re, im });
const cadd = (a: Cx, b: Cx): Cx => cx(a.re + b.re, a.im + b.im);
const csub = (a: Cx, b: Cx): Cx => cx(a.re - b.re, a.im - b.im);
const cmul = (a: Cx, b: Cx): Cx => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cdiv = (a: Cx, b: Cx): Cx => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const cabs = (a: Cx) => Math.hypot(a.re, a.im);

const trimPoly = (p: number[]): number[] => {
  while (p.length > 1 && Math.abs(p[p.length - 1]!) < 1e-12) p.pop();
  return p;
};
const polyMul = (A: number[], B: number[]): number[] => {
  const r = new Array<number>(A.length + B.length - 1).fill(0);
  A.forEach((a, i) => B.forEach((b, j) => (r[i + j]! += a * b)));
  return r;
};

/** Coeficientes (do termo constante ao de maior grau) se o nó for um polinômio em x com coeficientes numéricos; senão null. */
function polyCoeffs(node: MathNode): number[] | null {
  if (node.type === "ConstantNode") {
    const v = Number((node as unknown as { value: unknown }).value);
    return Number.isFinite(v) ? [v] : null;
  }
  if (node.type === "SymbolNode") return (node as unknown as { name: string }).name === "x" ? [0, 1] : null;
  if (node.type === "ParenthesisNode") return polyCoeffs((node as unknown as { content: MathNode }).content);
  if (node.type !== "OperatorNode") return null;
  const op = node as unknown as { op: string; fn: string; args: MathNode[] };
  if (op.fn === "unaryMinus") { const p = polyCoeffs(op.args[0]!); return p ? p.map((c) => -c) : null; }
  if (op.fn === "unaryPlus") return polyCoeffs(op.args[0]!);
  if (op.args.length !== 2) return null;
  const A = polyCoeffs(op.args[0]!), B = polyCoeffs(op.args[1]!);
  if (op.op === "+" && A && B) {
    const r = new Array<number>(Math.max(A.length, B.length)).fill(0);
    A.forEach((c, i) => (r[i]! += c)); B.forEach((c, i) => (r[i]! += c));
    return trimPoly(r);
  }
  if (op.op === "-" && A && B) {
    const r = new Array<number>(Math.max(A.length, B.length)).fill(0);
    A.forEach((c, i) => (r[i]! += c)); B.forEach((c, i) => (r[i]! -= c));
    return trimPoly(r);
  }
  if (op.op === "*" && A && B) return trimPoly(polyMul(A, B));
  if (op.op === "^" && A) {
    const e = op.args[1]!;
    if (e.type === "ConstantNode") {
      const n = Number((e as unknown as { value: unknown }).value);
      if (Number.isInteger(n) && n >= 0 && n <= 64) {
        let r = [1];
        for (let i = 0; i < n; i++) r = polyMul(r, A);
        return trimPoly(r);
      }
    }
  }
  return null;
}

/** Método de Durand-Kerner: todas as raízes complexas do polinômio, incluindo repetições. */
function durandKerner(coeffs: number[]): Cx[] {
  const n = coeffs.length - 1;
  const lead = coeffs[n]!;
  const a = coeffs.map((c) => c / lead);
  const radius = 1 + Math.max(0, ...a.slice(0, n).map((c) => Math.abs(c)));
  let roots = Array.from({ length: n }, (_, k) => {
    const t = (2 * Math.PI * k) / n + 0.4;
    return cx(radius * Math.cos(t), radius * Math.sin(t));
  });
  const evalP = (z: Cx): Cx => {
    let acc = cx(a[n]!);
    for (let i = n - 1; i >= 0; i--) acc = cadd(cmul(acc, z), cx(a[i]!));
    return acc;
  };
  for (let iter = 0; iter < 2000; iter++) {
    let maxStep = 0;
    roots = roots.map((r, k) => {
      let denom = cx(1);
      for (let j = 0; j < n; j++) if (j !== k) denom = cmul(denom, csub(r, roots[j]!));
      const step = cdiv(evalP(r), denom);
      maxStep = Math.max(maxStep, cabs(step));
      return csub(r, step);
    });
    if (maxStep < 1e-13) break;
  }
  return roots;
}

/**
 * Se f(x) − y for um polinômio em x (grau 1 a 20), devolve TODAS as raízes reais,
 * repetidas conforme a multiplicidade (ex.: (x−1)²(x−2)³ → [1, 1, 2, 2, 2]).
 * Retorna null quando a expressão não é polinomial, para o chamador usar a busca numérica.
 */
function polynomialRealRoots(expression: string, y: number): number[] | null {
  if (!Number.isFinite(y)) return null;
  try {
    const node = rationalize(`(${normalize(expression)}) - (${y})`) as MathNode;
    const coeffs = polyCoeffs(node);
    if (!coeffs) return null;
    trimPoly(coeffs);
    const n = coeffs.length - 1;
    if (n < 1 || n > 20 || coeffs.some((c) => !Number.isFinite(c))) return null;
    const scaleAt = (r: number) => coeffs.reduce((s, c, i) => s + Math.abs(c) * Math.abs(r) ** i, 0);
    const real: number[] = [];
    for (const z of durandKerner(coeffs)) {
      if (Math.abs(z.im) > 1e-6 * Math.max(1, Math.abs(z.re))) continue;
      const r = Number(z.re.toFixed(10));
      const residual = Math.abs(coeffs.reduce((s, c, i) => s + c * r ** i, 0));
      if (residual <= 1e-6 * Math.max(1, scaleAt(r))) real.push(r);
    }
    return real.sort((p, q) => p - q);
  } catch {
    return null;
  }
}

/**
 * Find all real x in [a, b] with f(x) = y.
 * Polinômios: raízes exatas com multiplicidade (repetidas aparecem repetidas).
 * Demais funções: mudanças de sinal + bisseção, e raízes de tangência
 * (mínimos locais de |f(x) − y| que tocam zero sem trocar de sinal).
 */
export function solveForX(expression: string, y: number, a = -50, b = 50): number[] {
  const poly = polynomialRealRoots(expression, y);
  if (poly) return poly;
  const { fn } = parseFn(expression);
  if (!fn) return [];
  const g = (x: number) => fn(x) - y;
  const n = 4000, out: number[] = [];
  const xs = new Array<number>(n + 1), vs = new Array<number>(n + 1);
  for (let i = 0; i <= n; i++) { xs[i] = a + ((b - a) * i) / n; vs[i] = g(xs[i]!); }
  const tol = 1e-6 * Math.max(1, Math.abs(y));
  for (let i = 1; i <= n; i++) {
    const pv = vs[i - 1]!, v = vs[i]!;
    if (Number.isFinite(pv) && Number.isFinite(v)) {
      if (Math.abs(pv) < 1e-12) out.push(xs[i - 1]!);
      else if (pv * v < 0) {
        let lo = xs[i - 1]!, hi = xs[i]!;
        for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; }
        const r = (lo + hi) / 2;
        if (Math.abs(g(r)) < tol) out.push(r);
      }
    }
  }
  // Raízes de tangência: mínimos locais de |g| que chegam a zero sem mudança de sinal.
  const goldenMin = (lo: number, hi: number): number => {
    const gr = (Math.sqrt(5) - 1) / 2;
    let c = hi - gr * (hi - lo), d = lo + gr * (hi - lo);
    for (let k = 0; k < 100; k++) {
      if (Math.abs(g(c)) < Math.abs(g(d))) hi = d; else lo = c;
      c = hi - gr * (hi - lo); d = lo + gr * (hi - lo);
    }
    return (lo + hi) / 2;
  };
  for (let i = 1; i < n; i++) {
    const av = Math.abs(vs[i]!);
    if (!Number.isFinite(av) || av > Math.abs(vs[i - 1]!) || av > Math.abs(vs[i + 1]!)) continue;
    const m = goldenMin(xs[i - 1]!, xs[i + 1]!);
    if (Math.abs(g(m)) < tol && !out.some((r) => Math.abs(r - m) <= 1e-6)) out.push(m);
  }
  return out
    .sort((p, q) => p - q)
    .filter((r, i, arr) => i === 0 || Math.abs(r - arr[i - 1]!) > 1e-6)
    .map((r) => Number(r.toFixed(10)));
}
