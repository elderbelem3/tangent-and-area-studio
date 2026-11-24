import { parse, type MathNode } from "mathjs";
import { normalize } from "@/lib/calc";
import { solveForX } from "@/lib/inverse";

export type TableRootResult = {
  roots: number[];
  status: "complete" | "bounded" | "unverified" | "continuum";
  degree: number | null;
};

// Exact rational arithmetic preserves multiplicity before numerical isolation.
type Q = { n: bigint; d: bigint };
type Polynomial = Q[];
const gcdInt = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a; b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
};
const q = (n: bigint, d = 1n): Q => {
  if (!d) throw new Error("Zero denominator");
  const g = gcdInt(n, d);
  return { n: (d < 0n ? -n : n) / g, d: (d < 0n ? -d : d) / g };
};
const zero = q(0n), one = q(1n);
const add = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
const neg = (a: Q) => q(-a.n, a.d);
const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
const div = (a: Q, b: Q) => q(a.n * b.d, a.d * b.n);
const trim = (p: Polynomial): Polynomial => {
  while (p.length > 1 && p.at(-1)?.n === 0n) p.pop();
  return p;
};
const at = (p: Polynomial, i: number) => p[i] ?? zero;
const monic = (p: Polynomial) => {
  const lead = p.at(-1);
  if (!lead || !lead.n) return [zero];
  return p.map((c) => div(c, lead));
};
const derivative = (p: Polynomial) => p.length > 1 ? p.slice(1).map((c, i) => mul(c, q(BigInt(i + 1)))) : [zero];

function multiply(a: Polynomial, b: Polynomial): Polynomial {
  const r = Array.from({ length: a.length + b.length - 1 }, () => zero);
  a.forEach((v, i) => b.forEach((w, j) => { r[i + j] = add(at(r, i + j), mul(v, w)); }));
  return trim(r);
}

function quotient(a: Polynomial, b: Polynomial): { quotient: Polynomial; remainder: Polynomial } {
  const lead = b.at(-1);
  if (!lead?.n) throw new Error("Zero polynomial");
  const r = [...a], out = Array.from({ length: Math.max(1, a.length - b.length + 1) }, () => zero);
  while (r.length >= b.length && r.at(-1)?.n) {
    const offset = r.length - b.length;
    const c = div(at(r, r.length - 1), lead);
    out[offset] = c;
    b.forEach((v, i) => { r[offset + i] = add(at(r, offset + i), neg(mul(c, v))); });
    trim(r);
  }
  return { quotient: trim(out), remainder: trim(r) };
}

function gcd(a: Polynomial, b: Polynomial): Polynomial {
  while (b.length > 1 || b[0]?.n) {
    const remainder = quotient(a, b).remainder;
    a = b; b = remainder;
  }
  return monic(a);
}

function decimal(value: string): Q {
  const [mantissa = "0", exponent = "0"] = value.toLowerCase().split("e");
  const digits = mantissa.replace(".", "");
  const power = Number(exponent) - (mantissa.split(".")[1]?.length ?? 0);
  if (Math.abs(power) > 300) throw new Error("Coefficient budget");
  return power >= 0 ? q(BigInt(digits) * 10n ** BigInt(power)) : q(BigInt(digits), 10n ** BigInt(-power));
}

// Resource guard, not a root-count limit: exceeding it yields an explicit warning.
const COEFFICIENT_BUDGET = 129;
function coefficients(node: MathNode): Polynomial | null {
  if (node.type === "ConstantNode") return [decimal(String((node as unknown as { value: unknown }).value))];
  if (node.type === "SymbolNode") return (node as unknown as { name: string }).name === "x" ? [zero, one] : null;
  if (node.type === "ParenthesisNode") return coefficients((node as unknown as { content: MathNode }).content);
  if (node.type !== "OperatorNode") return null;
  const { op, fn, args } = node as unknown as { op: string; fn: string; args: MathNode[] };
  const first = args[0];
  if (!first) return null;
  const a = coefficients(first);
  if (!a) return null;
  if (fn === "unaryMinus") return a.map(neg);
  if (fn === "unaryPlus") return a;
  const second = args[1];
  if (!second) return null;
  const b = coefficients(second);
  if (!b) return null;
  let r: Polynomial;
  if (op === "+" || op === "-") r = trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => add(at(a, i), op === "-" ? neg(at(b, i)) : at(b, i))));
  else if (op === "*") r = multiply(a, b);
  else if (op === "/" && b.length === 1 && b[0]?.n) r = a.map((v) => div(v, at(b, 0)));
  else if (op === "^" && b.length === 1 && b[0]?.d === 1n && b[0].n >= 0n) {
    const exponent = Number(b[0].n);
    if (!Number.isSafeInteger(exponent) || (a.length - 1) * exponent >= COEFFICIENT_BUDGET || exponent > 1000) throw new Error("Degree budget");
    r = [one];
    for (let i = 0; i < exponent; i++) r = multiply(r, a);
  } else return null;
  if (r.length > COEFFICIENT_BUDGET) throw new Error("Degree budget");
  return r;
}

/** Exact Sturm count at ±infinity certifies the number of distinct real roots. */
function realRootCount(p: Polynomial): number {
  if (p.length < 2) return 0;
  const sequence = [p, derivative(p)];
  let previous = p, current = derivative(p);
  while (current.length > 1) {
    const next = quotient(previous, current).remainder.map(neg);
    if (next.length === 1 && next[0]?.n === 0n) break;
    sequence.push(next);
    previous = current; current = next;
  }
  const variations = (negativeInfinity: boolean) => {
    let last = 0, changes = 0;
    for (const item of sequence) {
      const lead = item.at(-1);
      if (!lead?.n) continue;
      let sign = lead.n < 0n ? -1 : 1;
      if (negativeInfinity && (item.length - 1) % 2) sign *= -1;
      if (last && last !== sign) changes++;
      last = sign;
    }
    return changes;
  };
  return variations(true) - variations(false);
}

/** Isolate every real root of a square-free polynomial between its derivative roots. */
function isolate(p: Polynomial): number[] {
  if (p.length > 1 && p[0]?.n === 0n) {
    return [...isolate(p.slice(1)), 0].sort((u, v) => u - v);
  }
  const a = monic(p).map((v) => Number(v.n) / Number(v.d));
  if (a.some((v) => !Number.isFinite(v))) throw new Error("Numeric range");
  if (a.length === 2) return [-atNumber(a, 0)];
  if (a.length < 2) return [];
  const evalAt = (x: number) => a.reduceRight((s, c) => s * x + c, 0);
  const n = a.length - 1;
  const cauchy = 1 + Math.max(...a.slice(0, -1).map(Math.abs));
  const fujiwara = 2 * Math.max(...a.slice(0, -1).map((c, i) => Math.abs(c) ** (1 / (n - i)))) * 1.05 + 1e-6;
  const bound = Math.min(cauchy, fujiwara);
  if (!Number.isFinite(bound)) throw new Error("Root bound");
  const d = derivative(p), distinctDerivative = quotient(d, gcd(d, derivative(d))).quotient;
  const critical = isolate(distinctDerivative);
  const points = [-bound, ...critical.filter((r) => r > -bound && r < bound), bound];
  const roots: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const lower = points[i - 1], upper = points[i];
    if (lower === undefined || upper === undefined) throw new Error("Missing interval");
    let lo: number = lower, hi: number = upper;
    let lv = evalAt(lo), hv = evalAt(hi);
    if (!Number.isFinite(lv) || !Number.isFinite(hv) || lv === 0 || hv === 0) throw new Error("Uncertain separation");
    if (Math.sign(lv) === Math.sign(hv)) continue;
    for (let k = 0; k < 200; k++) {
      const mid: number = lo + (hi - lo) / 2, mv = evalAt(mid);
      if (!Number.isFinite(mv)) throw new Error("Numeric overflow");
      if (mv === 0) { lo = mid; hi = mid; break; }
      if (Math.sign(lv) === Math.sign(mv)) { lo = mid; lv = mv; } else { hi = mid; hv = mv; }
      if (hi - lo <= 1e-13 * Math.max(1, Math.abs(mid))) break;
    }
    const root = lo + (hi - lo) / 2;
    const scale = a.reduceRight((s, c) => s * Math.abs(root) + Math.abs(c), 0);
    if (Math.abs(evalAt(root)) > 1e-10 * Math.max(1, scale)) throw new Error("Residual");
    roots.push(root);
  }
  if (roots.length !== realRootCount(p)) throw new Error("Incomplete real-root isolation");
  return roots;
}
const atNumber = (a: number[], i: number) => a[i] ?? 0;

/**
 * Determine the true polynomial degree of an expression after algebraic simplification
 * across all terms (independent of term order, ignoring cancelled/zero coefficients).
 * Returns null for non-polynomials, the identically-zero polynomial, or unsupported degree.
 */
export function polynomialDegree(expression: string): number | null {
  try {
    const p = coefficients(parse(normalize(expression)));
    if (!p || (p.length === 1 && p[0]?.n === 0n)) return null;
    return p.length - 1;
  } catch {
    return null;
  }
}

export function findTableRoots(expression: string): TableRootResult {
  try {
    const p = coefficients(parse(normalize(expression)));
    if (!p) return { roots: solveForX(expression, 0), status: "bounded", degree: null };
    if (p.length === 1) return { roots: [], status: p[0]?.n === 0n ? "continuum" : "complete", degree: p[0]?.n === 0n ? null : 0 };
    const degree = p.length - 1;
    // Square-free decomposition determines exact multiplicities, without clustering.
    let repeated = gcd(p, derivative(p));
    let remaining = quotient(p, repeated).quotient;
    let multiplicity = 1;
    const roots: number[] = [];
    while (remaining.length > 1) {
      const shared = gcd(remaining, repeated);
      const factor = quotient(remaining, shared).quotient;
      for (const root of isolate(factor)) {
        for (let i = 0; i < multiplicity; i++) roots.push(root);
      }
      remaining = shared;
      repeated = quotient(repeated, shared).quotient;
      multiplicity++;
    }
    return { roots: roots.sort((a, b) => a - b), status: "complete", degree };
  } catch {
    // Never silently substitute a partial numeric search for a failed global solve.
    return { roots: [], status: "unverified", degree: null };
  }
}