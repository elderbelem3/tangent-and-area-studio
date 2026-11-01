import { compile } from "mathjs";

export type Fn = (x: number) => number;

/** Normalize student syntax: "3x" -> "3*x", "ln" -> "log". */
export function normalize(expr: string): string {
  return expr
    .replace(/\bln\(/g, "log(")
    .replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2")
    .replace(/\)\s*([a-zA-Z0-9(])/g, ")*$1");
}

export function parseFn(expr: string): { fn: Fn | null; error: string | null } {
  if (!expr.trim()) return { fn: null, error: "Digite uma função f(x)." };
  try {
    const code = compile(normalize(expr));
    const fn: Fn = (x) => {
      try {
        const v = code.evaluate({ x, e: Math.E, pi: Math.PI });
        return typeof v === "number" && Number.isFinite(v) ? v : NaN;
      } catch {
        return NaN;
      }
    };
    // Validate: must evaluate somewhere to a number
    const probes = [0.5, 1, 2, -1, 0.1, 3];
    try {
      code.evaluate({ x: 1.2345 });
    } catch (e) {
      return { fn: null, error: `Função inválida: ${(e as Error).message}` };
    }
    if (probes.every((p) => Number.isNaN(fn(p))))
      return { fn: null, error: "A função não produz valores reais. Verifique a expressão." };
    return { fn, error: null };
  } catch (e) {
    return { fn: null, error: `Sintaxe inválida: ${(e as Error).message}` };
  }
}

export function derivative(f: Fn, x: number, h = 1e-5): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** Composite Simpson's rule */
export function integrate(f: Fn, a: number, b: number, n = 2000): number {
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

export function fmt(v: number, d = 6): string {
  if (Number.isNaN(v)) return "indefinido";
  if (!Number.isFinite(v)) return v > 0 ? "∞" : "-∞";
  const r = Number(v.toFixed(d));
  return Object.is(r, -0) ? "0" : String(r);
}
