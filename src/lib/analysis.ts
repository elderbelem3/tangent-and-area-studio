import { derivative as symDerivative, parse, simplify } from "mathjs";
import { constantValue, fmt, normalize, parseFn, type Fn } from "@/lib/calc";
import { findPlotAnnotations } from "@/lib/plot-annotations";
import { realDomain } from "@/lib/domain";

export type SignInterval = { from: number; to: number; sign: "+" | "−" | "0" };
export type FunctionAnalysis = {
  expression: string; d1: string | null; d2: string | null;
  roots: number[]; critical: { x: number; y: number; kind: string }[];
  signs: SignInterval[]; inflections: { x: number; y: number }[];
  domain: string; limitPos: string; limitNeg: string;
  constantValue: number | null;
};

function symbolic(expr: string): string | null {
  try { return simplify(symDerivative(parse(expr), "x")).toString(); } catch { return null; }
}
function zeros(g: Fn, a: number, b: number): number[] {
  const out: number[] = []; const n = 600, h = (b - a) / n;
  for (let i = 0; i < n; i++) {
    let l = a + i * h, r = l + h, fl = g(l); const fr = g(r);
    if (!Number.isFinite(fl) || !Number.isFinite(fr)) continue;
    if (fl === 0) { if (!out.some((p) => Math.abs(p - l) < h * 1.5)) out.push(l); continue; }
    if (fl * fr >= 0) continue;
    for (let j = 0; j < 50; j++) { const m = (l + r) / 2, fm = g(m); if (fl * fm <= 0) r = m; else { l = m; fl = fm; } }
    const x = (l + r) / 2;
    if (Math.abs(g(x)) < 1e-4 && !out.some((p) => Math.abs(p - x) < h * 1.5)) out.push(x);
  }
  return out;
}
function limitText(fn: Fn, sign: 1 | -1): string {
  const a = fn(sign * 1e4), b = fn(sign * 1e6);
  if (!Number.isFinite(b)) return Number.isFinite(a) ? fmt(a, 4) : "indefinido";
  if (Math.abs(b) > 1e8) return b > 0 ? "+∞" : "−∞";
  if (Math.abs(b - a) < 1e-3 * Math.max(1, Math.abs(b))) return fmt(b, 4);
  return "não existe (oscila)";
}
export function analyzeFunction(expression: string, xMin: number, xMax: number): FunctionAnalysis | null {
  const { fn } = parseFn(expression); if (!fn) return null;
  const value = constantValue(expression);
  if (value !== null) return {
    expression, constantValue: value, d1: "0", d2: "0",
    roots: [], critical: [], signs: [], inflections: [],
    domain: "ℝ", limitPos: fmt(value, 4), limitNeg: fmt(value, 4),
  };
  const norm = normalize(expression);
  const d1 = symbolic(norm), d2 = d1 ? symbolic(d1) : null;
  const f1 = (d1 && parseFn(d1).fn) || ((x: number) => (fn(x + 1e-5) - fn(x - 1e-5)) / 2e-5);
  const f2 = (d2 && parseFn(d2).fn) || ((x: number) => (f1(x + 1e-4) - f1(x - 1e-4)) / 2e-4);
  const ann = findPlotAnnotations(fn, xMin, xMax);
  const domain = realDomain(expression, xMin, xMax);
  const derivativeDomain = d1 ? realDomain(d1, xMin, xMax) : domain;
  const crit = zeros(f1, xMin, xMax).filter((x) => domain.contains(x) && derivativeDomain.contains(x)).sort((a, b) => a - b);
  const bounds = [...new Set([xMin, ...crit, ...domain.boundaries, ...derivativeDomain.boundaries, xMax])].sort((a, b) => a - b);
  const signs: SignInterval[] = [];
  for (let i = 0; i < bounds.length - 1; i++) { const a = bounds[i], b = bounds[i + 1]; if (a === undefined || b === undefined) continue; const mid = (a + b) / 2; if (!domain.contains(mid) || !derivativeDomain.contains(mid)) continue; const v = f1(mid); if (Number.isFinite(v)) signs.push({ from: a, to: b, sign: v > 0 ? "+" : v < 0 ? "−" : "0" }); }
  const critical = crit.map((x) => {
    const before = f1(x - 1e-3), after = f1(x + 1e-3);
    const kind = before > 0 && after < 0 ? "Máximo local" : before < 0 && after > 0 ? "Mínimo local" : "Ponto crítico (sem troca de sinal)";
    return { x, y: fn(x), kind };
  });
  const inflections = zeros(f2, xMin, xMax).filter((x) => domain.contains(x) && Number.isFinite(fn(x)) && Math.sign(f2(x - 1e-3)) !== Math.sign(f2(x + 1e-3))).map((x) => ({ x, y: fn(x) }));
  return {
    expression, constantValue: null, d1, d2,
    roots: ann.filter((a) => a.kind === "Raiz").map((a) => a.x).sort((a, b) => a - b),
    critical, signs, inflections,
    domain: domain.text, limitPos: limitText(fn, 1), limitNeg: limitText(fn, -1),
  };
}
