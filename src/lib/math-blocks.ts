import { parse } from "mathjs";
import { normalize, normalizeLogarithms } from "@/lib/calc";

const PL = "\\placeholder{}";

/**
 * Potências-tab buttons insert visual structures with empty editable fields (□).
 * Returns null when the button keeps the ordinary-parentheses behavior.
 * `hasBase` tells whether an atom already sits before the cursor (then x²/xʸ only add the exponent).
 */
export function blockTemplateLatex(insert: string, hasBase: boolean): string | null {
  switch (insert) {
    case "^2": return hasBase ? "^{2}" : `${PL}^{2}`;
    case "^()": return hasBase ? `^{${PL}}` : `${PL}^{${PL}}`;
    case "sqrt()": return `\\sqrt{${PL}}`;
    case "nthroot": return `\\sqrt[${PL}]{${PL}}`;
    case "log()": return `\\ln\\left(${PL}\\right)`;
    case "log10()": return `\\log_{10}\\left(${PL}\\right)`;
    case "logb()": return `\\log_{${PL}}\\left(${PL}\\right)`;
    case "abs()": return `\\left|${PL}\\right|`;
    default: return null;
  }
}

/** Functions use ordinary empty parentheses; powers and fractions retain structured placeholders. */
export function templateToLatex(insert: string): string {
  const fn = insert.match(/^([a-z0-9]+)\(\)$/);
  if (fn) {
    const name = fn[1];
    if (name === "log" || name === "ln") return "\\ln\\left(\\right)";
    if (name && ["sin", "cos", "tan", "sec", "csc"].includes(name)) return `\\${name}\\left(\\right)`;
    if (name && ["asin", "acos", "atan"].includes(name)) return `\\arc${name.slice(1)}\\left(\\right)`;
    return `\\operatorname{${name}}\\left(\\right)`;
  }
  const map: Record<string, string> = {
    "^()": "^{#0}", "^2": "^2", "^(-1)": "^{-1}", "()": "\\left(#0\\right)", "()/()": "\\frac{#0}{#?}",
    "1/()": "\\frac{1}{#0}", "*": "\\cdot ", "/": "\\frac{#@}{#?}", pi: "\\pi", infinity: "\\infty",
    "-infinity": "-\\infty", "<=": "\\le ", ">=": "\\ge ",
  };
  return map[insert] ?? insert;
}

/** MathLive ascii-math output → mathjs syntax understood by the parser/plotter. */
export function asciiToMathjs(ascii: string): string {
  // MathLive serializes typed operator names as space-separated letters.
  let s = ascii.replace(/\b(?:l\s+o\s+g10|l\s+o\s+g|s\s+i\s+n|c\s+o\s+s|t\s+a\s+n|s\s+q\s+r\s+t|c\s+b\s+r\s+t|e\s+x\s+p|a\s+b\s+s)(?=\s*[_\(])/g, (name) => name.replace(/\s+/g, ""))
    .replace(/⋅|·|\bxx\b/g, "*")
    .replace(/\boo\b|∞/g, "Infinity")
    .replace(/π/g, "pi")
    .replace(/log_\(?10\)?/g, "log10")
    .replace(/\bln\b/g, "log")
    .replace(/\barc(sin|cos|tan)\b/g, "a$1")
    .replace(/<=|≤/g, "<=").replace(/>=|≥/g, ">=");
  s = convertRoots(s);
  // |a| → abs(a) for simple, non-nested pairs
  for (let i = 0; i < 5 && /\|[^|]+\|/.test(s); i++) s = s.replace(/\|([^|]+)\|/, "abs($1)");
  return normalizeLogarithms(s).replace(/\b(log10|log|sin|cos|tan|sec|csc|asin|acos|atan|sqrt|cbrt|exp|abs)\s+\(/g, "$1(").replace(/\s+/g, " ").trim();
}

/** Plain expression → LaTeX for loading external values (examples, copilot, tutor) into the block editor. */
export function exprToLatex(expr: string): string {
  if (!expr.trim()) return "";
  try { return parse(normalize(expr)).toTex({ parenthesis: "auto", implicit: "hide" }); }
  catch { return expr; }
}
