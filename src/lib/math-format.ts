import { parse, simplify } from "mathjs";
import { fmt, normalize } from "@/lib/calc";

export function expressionLatex(expression: string): string {
  return parse(normalize(expression)).toTex({ parenthesis: "auto", implicit: "hide" });
}
export function tangentExpression(slope: number, intercept: number): string {
  return simplify(`${fmt(slope, 4)}*x + (${fmt(intercept, 4)})`).toString();
}