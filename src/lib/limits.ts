import { parse, type MathNode } from "mathjs";
import { normalize, parseFn } from "@/lib/calc";
import { polynomialRoots, realDomain } from "@/lib/domain";

export const LIMIT_DISTANCES = [0.1, 0.01, 0.001, 0.0001, 0.00001];
export function estimateLimit(values: number[]): number {
  const last = values[values.length - 1] ?? NaN, prev = values[values.length - 2] ?? NaN;
  if (!Number.isFinite(last)) return NaN;
  if (Math.abs(last) > 1e4 && Math.abs(last) > Math.abs(prev) * 5) return last > 0 ? Infinity : -Infinity;
  return Math.abs(last - prev) < 1e-3 * Math.max(1, Math.abs(last)) ? last : NaN;
}

/** Recognize the bare sin/cos of a reciprocal pole; do not misclassify damped oscillations. */
export function oscillationAt(expression: string, c: number): string | null {
  try {
    let node = parse(normalize(expression));
    while (node.type === "ParenthesisNode") node = (node as unknown as { content: MathNode }).content;
    const f = node as unknown as { fn: { name: string }; args: MathNode[] };
    if (node.type !== "FunctionNode" || !["sin", "cos"].includes(f.fn.name)) return null;
    const arg = f.args[0];
    if (!arg) return null;
    const domain = realDomain(arg.toString(), c - 1, c + 1);
    if (!domain.poles.some((x) => Math.abs(x - c) < 1e-9)) return null;
    const operator = arg as unknown as { op: string; args: MathNode[] };
    if (operator.op !== "/") return null;
    const numerator = operator.args[0], denominator = operator.args[1];
    if (!numerator || !denominator || (polynomialRoots(denominator.toString()) === null) || !Number.isFinite(parseFn(numerator.toString()).fn?.(c))) return null;
    if (Math.abs(parseFn(numerator.toString()).fn?.(c) ?? 0) < 1e-12) return null;
    return "Oscila entre −1 e 1, sem limite: o argumento cresce sem limite em módulo e percorre infinitos períodos.";
  } catch { return null; }
}

export function evaluateLimit(expression: string, c: number) {
  const { fn } = parseFn(expression);
  const left = LIMIT_DISTANCES.map((h) => ({ x: c - h, y: fn?.(c - h) ?? NaN }));
  const right = LIMIT_DISTANCES.map((h) => ({ x: c + h, y: fn?.(c + h) ?? NaN }));
  const oscillation = oscillationAt(expression, c);
  const L1 = oscillation ? NaN : estimateLimit(left.map((p) => p.y));
  const L2 = oscillation ? NaN : estimateLimit(right.map((p) => p.y));
  const L = Number.isFinite(L1) && Number.isFinite(L2) && Math.abs(L1 - L2) < 1e-3 * Math.max(1, Math.abs(L1)) ? (L1 + L2) / 2 : L1 === L2 && !Number.isNaN(L1) ? L1 : NaN;
  return { left, right, L1, L2, L, oscillation };
}