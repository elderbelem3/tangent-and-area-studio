import { MathFormula } from "@/components/MathFormula";
import { expressionLatex } from "@/lib/math-format";

export function MathExpression({ expression, prefix = "", suffix = "" }: { expression: string; prefix?: string; suffix?: string }) {
  try { return <MathFormula formula={`${prefix}${expressionLatex(expression)}${suffix}`} />; }
  catch { return <p className="text-sm text-muted-foreground">Não foi possível formatar esta expressão matemática.</p>; }
}