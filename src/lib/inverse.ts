import { parse, simplify, type MathNode } from "mathjs";
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
          if (xLeft) { right = other === "2" ? `sqrt(${right})` : `(${right})^(1/(${other}))`; text = other === "2" ? "Tire a raiz quadrada (ramo principal)" : `Tire a raiz de índice ${other}`; }
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

/** Find all real x in [a, b] with f(x) = y, by sign changes + bisection. */
export function solveForX(expression: string, y: number, a = -50, b = 50): number[] {
  const { fn } = parseFn(expression);
  if (!fn) return [];
  const g = (x: number) => fn(x) - y;
  const n = 4000, out: number[] = [];
  let px = a, pv = g(a);
  for (let i = 1; i <= n; i++) {
    const x = a + ((b - a) * i) / n, v = g(x);
    if (Number.isFinite(pv) && Number.isFinite(v)) {
      if (Math.abs(pv) < 1e-12) out.push(px);
      else if (pv * v < 0) {
        let lo = px, hi = x;
        for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; }
        const r = (lo + hi) / 2;
        if (Math.abs(g(r)) < 1e-6 * Math.max(1, Math.abs(y))) out.push(r);
      }
    }
    px = x; pv = v;
  }
  return out.filter((r, i) => i === 0 || Math.abs(r - out[i - 1]!) > 1e-6).map((r) => Number(r.toFixed(10)));
}
