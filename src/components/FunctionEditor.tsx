import { useRef, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field, MathToolbar, ErrorBox } from "@/components/Lab";
import { Button } from "@/components/ui/button";
import { FUNCTION_SLOTS, FUNCTION_TEXT_COLORS, MAX_FUNCTIONS, type ComparisonFunction } from "@/lib/comparison";
import { parseFn } from "@/lib/calc";
import { needs3D, parseFn2 } from "@/lib/smart3d";

function FunctionBlock({ item, onChange, onRemove, children }: {
  item: ComparisonFunction; onChange: (value: string) => void; onRemove: () => void; children?: ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const is3D = item.slot === 0 && needs3D(item.expression);
  const error = item.expression.trim() ? (is3D ? parseFn2(item.expression).error : parseFn(item.expression).error) : null;
  const name = `${FUNCTION_SLOTS[item.slot]}(${is3D ? "x, y" : "x"})`;
  return <div className="space-y-3">
    <div className="flex items-center justify-between gap-2">
      <span className={`font-mono text-sm font-semibold ${FUNCTION_TEXT_COLORS[item.slot]}`}>{name}</span>
      {item.slot !== 0 && <Button type="button" variant="ghost" size="icon" title={`Excluir ${name}`} aria-label={`Excluir ${name}`} onClick={onRemove} className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}
    </div>
    <MathToolbar inputRef={ref} value={item.expression} onChange={onChange} />
    <Field ref={ref} label={`${name} =`} value={item.expression} onChange={onChange} placeholder="ex: x^2, sin(x), exp(x)" />
    {error && <ErrorBox msg={error} />}
    {children}
  </div>;
}

export function FunctionEditor({ functions, onChange, onAdd, onRemove, mainExtras }: {
  functions: ComparisonFunction[]; onChange: (slot: number, value: string) => void;
  onAdd: () => void; onRemove: (slot: number) => void; mainExtras?: ReactNode;
}) {
  return <div className="space-y-4">
    {functions.map((item) => <div key={item.slot} className={item.slot !== 0 ? "border-t border-border pt-4" : ""}>
      <FunctionBlock item={item} onChange={(value) => onChange(item.slot, value)} onRemove={() => onRemove(item.slot)}>{item.slot === 0 ? mainExtras : null}</FunctionBlock>
    </div>)}
    {functions.length < MAX_FUNCTIONS && <Button type="button" variant="outline" onClick={onAdd} className="w-full"><Plus className="h-4 w-4" />Adicionar função</Button>}
  </div>;
}