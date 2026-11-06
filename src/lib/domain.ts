import { parse, rationalize, type MathNode } from "mathjs";
import { fmt, normalize, parseFn } from "@/lib/calc";

type Restriction = { expression: string; relation: "≠" | ">" | "≥"; poles: boolean };
const ungroup = (n: MathNode): MathNode => n.type === "ParenthesisNode" ? ungroup((n as unknown as { content: MathNode }).content) : n;
const op = (n: MathNode) => n as unknown as { op: string; args: MathNode[]; fn: { name: string } };

/** Real polynomial roots, including repeated roots; independent of the plot's sample grid. */
export function polynomialRoots(expression: string): number[] | null {
  try {
    const r = rationalize(parse(normalize(expression)), {}, true) as unknown as { coefficients: number[]; denominator: MathNode | null; variables: string[] };
    if (r.denominator !== null || r.variables.some((v) => v !== "x") || !r.coefficients?.length) return null;
    const solve = (coefficients: number[]): number[] => {
      const c = [...coefficients];
      while (c.length > 1 && Math.abs(c[c.length - 1] ?? 0) < 1e-14) c.pop();
      if (c.length < 2) return [];
      if (c.length === 2) return [-(c[0] ?? 0) / (c[1] ?? 1)];
      const lead = c[c.length - 1] ?? 1;
      const bound = 1 + Math.max(...c.slice(0, -1).map((k) => Math.abs(k / lead)));
      const evaluate = (x: number) => c.reduceRight((s, k) => s * x + k, 0);
      const critical = solve(c.slice(1).map((k, i) => k * (i + 1))).filter((x) => x > -bound && x < bound);
      const knots = [-bound, ...critical, bound];
      const roots = critical.filter((x) => Math.abs(evaluate(x)) < 1e-9);
      for (let i = 1; i < knots.length; i++) {
        let a = knots[i - 1] ?? 0, b = knots[i] ?? 0, fa = evaluate(a);
        if (fa * evaluate(b) >= 0) continue;
        for (let j = 0; j < 65; j++) { const m = (a + b) / 2, fm = evaluate(m); if (fa * fm <= 0) b = m; else { a = m; fa = fm; } }
        roots.push((a + b) / 2);
      }
      return roots.sort((a, b) => a - b).filter((x, i, all) => i === 0 || Math.abs(x - (all[i - 1] ?? 0)) > 1e-8);
    };
    return r.coefficients.length <= 10 ? solve(r.coefficients) : null;
  } catch { return null; }
}

export function realDomain(expression: string, min: number, max: number) {
  const restrictions: Restriction[] = [];
  try {
    parse(normalize(expression)).traverse((raw) => {
      const n = ungroup(raw), o = op(n), [u, v] = o.args ?? [];
      const add = (node: MathNode, relation: Restriction["relation"], poles = false) => {
        const value = node.toString();
        if (!restrictions.some((r) => r.expression === value && r.relation === relation)) restrictions.push({ expression: value, relation, poles });
      };
      if (n.type === "OperatorNode" && o.op === "/" && v) add(v, "≠", true);
      if (n.type === "OperatorNode" && o.op === "^" && u && v) {
        const exponent = Number(v.toString());
        if (Number.isFinite(exponent)) {
          if (exponent < 0) add(u, "≠", true);
          if (!Number.isInteger(exponent)) add(u, exponent < 0 ? ">" : "≥");
        }
      }
      if (n.type === "FunctionNode" && u) {
        const name = o.fn.name;
        if (["log", "log2", "log10"].includes(name)) { add(u, ">"); if (name === "log" && v) { add(v, ">"); add(parse(`(${v.toString()})-1`), "≠"); } }
        if (name === "sqrt") add(u, "≥");
        if (["asin", "acos"].includes(name)) { add(parse(`1-(${u.toString()})`), "≥"); add(parse(`1+(${u.toString()})`), "≥"); }
        if (["tan", "sec"].includes(name)) add(parse(`cos(${u.toString()})`), "≠", true);
        if (["csc", "cot"].includes(name)) add(parse(`sin(${u.toString()})`), "≠", true);
      }
    });
  } catch { /* Invalid expressions are handled by parseFn. */ }
  const lo = Math.min(min, max), hi = Math.max(min, max);
  const exclusions: number[] = [], boundaries: number[] = [], poles: number[] = [];
  const unresolved: Restriction[] = [];
  const conditions: string[] = [];
  for (const r of restrictions) {
    let roots = polynomialRoots(r.expression);
    // Affine trigonometric arguments have an exact periodic family of poles.
    const match = /^(cos|sin)\((.*)\)$/.exec(r.expression.replace(/\s+/g, ""));
    if (match) {
      try {
        const poly = rationalize(parse(match[2] ?? ""), {}, true) as unknown as { coefficients: number[]; denominator: MathNode | null };
        const [b = 0, a = 0] = poly.coefficients;
        if (poly.denominator === null && poly.coefficients.length <= 2 && a !== 0) {
          const shift = match[1] === "cos" ? Math.PI / 2 : 0;
          const lowK = Math.ceil((Math.min(a * lo + b, a * hi + b) - shift) / Math.PI);
          const highK = Math.floor((Math.max(a * lo + b, a * hi + b) - shift) / Math.PI);
          roots = Array.from({ length: Math.min(5000, Math.max(0, highK - lowK + 1)) }, (_, i) => (shift + (lowK + i) * Math.PI - b) / a);
          conditions.push(`${match[2]} ≠ ${match[1] === "cos" ? "π/2 + kπ" : "kπ"}, k ∈ ℤ`);
        }
      } catch { /* Keep the exact implicit restriction. */ }
    }
    if (roots === null) unresolved.push(r);
    else {
      for (const root of roots) {
        if (r.relation !== "≥") exclusions.push(root);
        if (root >= lo && root <= hi) { boundaries.push(root); if (r.poles) poles.push(root); }
      }
    }
    if (r.relation !== "≠" || roots === null) conditions.push(`${r.expression} ${r.relation} 0`);
  }
  const unique = (xs: number[]) => xs.sort((a, b) => a - b).filter((x, i, all) => i === 0 || Math.abs(x - (all[i - 1] ?? 0)) > 1e-8);
  const excluded = unique(exclusions), cuts = unique(boundaries);
  const evaluatedRestrictions = restrictions.map((r) => ({ ...r, fn: parseFn(r.expression).fn }));
  const satisfies = (x: number) => evaluatedRestrictions.every((r) => {
    const value = r.fn?.(x) ?? NaN;
    return Number.isFinite(value) && (r.relation === "≠" ? Math.abs(value) > 1e-12 : r.relation === ">" ? value > 0 : value >= 0);
  });
  const intervals = [lo, ...cuts.filter((x) => x > lo && x < hi), hi];
  const invalidInterior = intervals.some((a, i) => { const b = intervals[i + 1]; return b !== undefined && !satisfies((a + b) / 2); });
  const text = conditions.length ? `{x ∈ ℝ | ${[...new Set(conditions)].join("; ")}${excluded.length && !matchPeriodic(conditions) ? `; x ∉ {${excluded.map((x) => fmt(x, 6)).join(", ")}}` : ""}}` : excluded.length ? `ℝ ∖ {${excluded.map((x) => fmt(x, 6)).join(", ")}}` : "ℝ";
  return { text, boundaries: cuts, poles: unique(poles), exclusions: excluded, unresolved: unresolved.length > 0, invalidInterior, contains: satisfies };
}
const matchPeriodic = (conditions: string[]) => conditions.some((c) => c.includes("k ∈ ℤ"));