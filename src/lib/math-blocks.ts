import { parse } from "mathjs";
import { normalize } from "@/lib/calc";

/** Keyboard template (plain syntax) → structured LaTeX block with placeholders (#0 = selection/first box, #? = next box). */
export function templateToLatex(insert: string): string {
  const fn = insert.match(/^([a-z0-9]+)\(\)$/);
  if (fn) {
    const name = fn[1]!;
    if (name === "sqrt") return "\\sqrt{#0}";
    if (name === "cbrt") return "\\sqrt[3]{#0}";
    if (name === "exp") return "e^{#0}";
    if (name === "abs") return "\\left|#0\\right|";
    if (name === "log") return "\\ln\\left(#0\\right)";
    if (name === "log10") return "\\log_{10}\\left(#0\\right)";
    if (["sin", "cos", "tan", "sec", "csc"].includes(name)) return `\\${name}\\left(#0\\right)`;
    if (["asin", "acos", "atan"].includes(name)) return `\\arc${name.slice(1)}\\left(#0\\right)`;
    return `\\operatorname{${name}}\\left(#0\\right)`;
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
  let s = ascii
    .replace(/⋅|·|\bxx\b/g, "*")
    .replace(/\boo\b|∞/g, "Infinity")
    .replace(/π/g, "pi")
    .replace(/log_\(?10\)?/g, "log10")
    .replace(/\bln\b/g, "log")
    .replace(/\barc(sin|cos|tan)\b/g, "a$1")
    .replace(/<=|≤/g, "<=").replace(/>=|≥/g, ">=")
    .replace(/root\(3\)\(/g, "cbrt(");
  // |a| → abs(a) for simple, non-nested pairs
  for (let i = 0; i < 5 && /\|[^|]+\|/.test(s); i++) s = s.replace(/\|([^|]+)\|/, "abs($1)");
  return s.replace(/\s+/g, " ").trim();
}

/** Plain expression → LaTeX for loading external values (examples, copilot, tutor) into the block editor. */
export function exprToLatex(expr: string): string {
  if (!expr.trim()) return "";
  try { return parse(normalize(expr)).toTex({ parenthesis: "auto", implicit: "hide" }); }
  catch { return expr; }
}
