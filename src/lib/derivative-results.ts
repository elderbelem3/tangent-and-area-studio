import { derivative as symbolicDerivative, simplify } from "mathjs";
import { constantValue, derivative, normalize, parseFn } from "@/lib/calc";

export function derivativeExpression(expression: string): string | null {
  try {
    if (!parseFn(expression).fn) return null;
    if (constantValue(expression) !== null) return "0";
    return simplify(symbolicDerivative(normalize(expression), "x")).toString();
  } catch { return null; }
}

export function derivativeValues(expression: string, point: string) {
  const x = point.trim() ? Number(point.replace(",", ".")) : NaN;
  const { fn } = parseFn(expression);
  if (!Number.isFinite(x) || !fn) return null;
  return { x, value: fn(x), slope: derivative(fn, x) };
}