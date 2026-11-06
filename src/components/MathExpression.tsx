import { MathFormula } from "@/components/MathFormula";
import { expressionLatex } from "@/lib/math-format";

export function MathExpression({ expression, prefix = "" }: { expression: string; prefix?: string }) {
  try { return <MathFormula formula={`${prefix}${expressionLatex(expression)}`} />; }
  catch { return <p className="break-words font-mono">{expression}</p>; }
}