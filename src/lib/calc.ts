import { compile, parse } from "mathjs";

export type Fn = (x: number) => number;

/** Detect real constants structurally, never by a few coincidentally equal samples. */
export function constantValue(expression: string): number | null {
  try {
    const node = parse(normalize(expression));
    if (node.filter((n) => n.type === "SymbolNode" && n.toString() === "x").length) return null;
    const value = parseFn(expression).fn?.(0);
    return value !== undefined && Number.isFinite(value) ? value : null;
  } catch { return null; }
}

/** Normalize base subscripts without splitting digits that belong to function names. */
export function normalizeLogarithms(expr: string): string {
  let s = expr.replace(/\blog\s*_\s*(?:\{\s*2\s*\}|\(\s*2\s*\)|2)\s*(?=\()/g, "log2")
    .replace(/\blog\s*_\s*(?:\{\s*10\s*\}|\(\s*10\s*\)|10)\s*(?=\()/g, "log10")
    .replace(/\bln\s*(?=\()/g, "log");
  // Arbitrary bases: log_3(81) → log(81, 3); log_x(25) → log(25, x).
  const basePattern = /\blog\s*_\s*(\d+(?:\.\d+)?|[a-zA-Z]\w*)\s*\(/;
  for (let guard = 0; guard < 10; guard++) {
    const m = basePattern.exec(s);
    if (!m) break;
    const argStart = m.index + m[0].length;
    let depth = 1, j = argStart;
    while (j < s.length && depth > 0) { if (s[j] === "(") depth++; else if (s[j] === ")") depth--; j++; }
    if (depth !== 0) break;
    s = s.slice(0, m.index) + `log(${s.slice(argStart, j - 1)}, ${m[1]})` + s.slice(j);
  }
  return s;
}

/** Normalize student syntax: "3x" -> "3*x", preserving names such as log10. */
const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁺": "+", "⁻": "-",
};

export function normalize(expr: string): string {
  return normalizeLogarithms(
    expr
      .replace(/−/g, "-")
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, (run) => `^(${Array.from(run, (ch) => SUPERSCRIPTS[ch] ?? ch).join("")})`)
      .replace(/\^\{\s*([^{}]+?)\s*\}/g, "^($1)"),
  )
    .replace(/(\d)\s*([a-zA-Z(])/g, (match: string, digit: string, next: string, offset: number, source: string) => {
      // An identifier such as log10 is not an implicit multiplication coefficient.
      return /[a-zA-Z_][a-zA-Z_0-9]*$/.test(source.slice(0, offset + 1)) ? match : `${digit}*${next}`;
    })
    .replace(/\)\s*([a-zA-Z0-9(])/g, ")*$1")
    .replace(/∞|\binfinity\b/gi, "Infinity");
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
  const y = f(x);
  if (!Number.isFinite(y)) return NaN;
  const left = (y - f(x - h)) / h, right = (f(x + h) - y) / h;
  const halfLeft = (y - f(x - h / 2)) / (h / 2), halfRight = (f(x + h / 2) - y) / (h / 2);
  const gap = Math.abs(left - right), halfGap = Math.abs(halfLeft - halfRight);
  // Smooth one-sided slopes converge together; a corner (|x|) keeps a nonzero gap.
  if (![left, right, halfLeft, halfRight].every(Number.isFinite) || (halfGap > 1e-4 * Math.max(1, Math.abs(halfLeft), Math.abs(halfRight)) && halfGap > gap * 0.8)) return NaN;
  return (halfLeft + halfRight) / 2;
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
