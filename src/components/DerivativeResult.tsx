import { useMemo } from "react";
import { MathExpression } from "@/components/MathExpression";
import { Panel, Field, Stat, ErrorBox } from "@/components/Lab";
import { FUNCTION_SLOTS, FUNCTION_TEXT_COLORS, type ComparisonFunction } from "@/lib/comparison";
import { derivativeExpression, derivativeValues } from "@/lib/derivative-results";
import { fmt, parseFn } from "@/lib/calc";
import { tangentExpression } from "@/lib/math-format";

export function DerivativeResult({ item, point, onPointChange }: { item: ComparisonFunction; point: string; onPointChange: (value: string) => void }) {
  const name = FUNCTION_SLOTS[item.slot];
  const symbolic = useMemo(() => derivativeExpression(item.expression), [item.expression]);
  const parsed = useMemo(() => parseFn(item.expression), [item.expression]);
  const values = useMemo(() => derivativeValues(item.expression, point), [item.expression, point]);
  const valid = values && Number.isFinite(values.value) && Number.isFinite(values.slope);
  return <Panel title={`Derivação de ${name}(x)`}>
    <div className="space-y-4">
      <div className={FUNCTION_TEXT_COLORS[item.slot]}>
        <p className="text-xs font-medium text-muted-foreground">Função original</p>
        {parsed.fn && <MathExpression expression={item.expression} prefix={`${name}(x) = `} />}
        <p className="text-xs font-medium text-muted-foreground">Função derivada</p>
        {symbolic !== null ? <MathExpression expression={symbolic} prefix={`${name}'(x) = `} /> : <p className="text-sm text-muted-foreground">Não foi possível obter a derivada simbólica desta expressão pelo método disponível.</p>}
      </div>
      <Field label={`Ponto x₀ de ${name}(x)`} value={point} onChange={onPointChange} placeholder="Opcional" />
      {parsed.error && <ErrorBox msg={parsed.error} />}
      {point.trim() && !Number.isFinite(Number(point.replace(",", "."))) && <ErrorBox msg="Informe um número válido para x₀." />}
      {values && !valid && <ErrorBox msg="A função não é definida ou não é derivável neste ponto. Não existe reta tangente com inclinação finita." />}
      {valid && <>
        <div className="grid grid-cols-2 gap-3">
          <Stat label={`${name}(${fmt(values.x)})`} value={fmt(values.value, 5)} />
          <Stat label={`${name}'(${fmt(values.x)})`} value={fmt(values.slope, 5)} />
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground">Reta tangente</p>
          <MathExpression expression={tangentExpression(values.slope, values.value - values.slope * values.x)} prefix="y = " />
        </div>
      </>}
      {symbolic !== null && <p className="text-xs text-muted-foreground">A fórmula da derivada vale onde a função é definida e derivável.</p>}
    </div>
  </Panel>;
}