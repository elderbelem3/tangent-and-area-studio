import { useMemo, useRef, type ReactNode } from "react";
import katex from "katex";
import { parse } from "mathjs";
import { normalize } from "@/lib/calc";
import { Plus, Trash2 } from "lucide-react";
import { MathBlockInput, type MathBlockHandle } from "@/components/MathBlockInput";
import { MathToolbar, ErrorBox } from "@/components/Lab";
import { Button } from "@/components/ui/button";
import { FUNCTION_SLOTS, FUNCTION_TEXT_COLORS, MAX_FUNCTIONS, type ComparisonFunction } from "@/lib/comparison";
import { parseFn } from "@/lib/calc";
import { needs3D, parseFn2 } from "@/lib/smart3d";

/** If the cursor is inside an open "^( … )" block, return the index just after its ")". */
export function exponentExit(value: string, pos: number): number | null {
  let depth = 0;
  for (let i = pos - 1; i >= 0; i--) {
    if (value[i] === ")") depth++;
    else if (value[i] === "(") {
      if (depth > 0) { depth--; continue; }
      if (value[i - 1] !== "^") return null;
      let d = 0;
      for (let j = pos; j < value.length; j++) {
        if (value[j] === "(") d++;
        else if (value[j] === ")") { if (d === 0) return j + 1; d--; }
      }
      return null;
    }
  }
  return null;
}

function ExpressionPreview({ name, expression }: { name: string; expression: string }) {
  const html = useMemo(() => {
    if (!expression.trim()) return null;
    try {
      const tex = parse(normalize(expression)).toTex({ parenthesis: "auto", implicit: "hide" });
      return katex.renderToString(`${name.replace(/(\w)\((.*)\)/, "$1($2)")} = ${tex}`, { throwOnError: true, output: "htmlAndMathml" });
    } catch { return null; }
  }, [name, expression]);
  if (!html) return null;
  return <div aria-live="polite" className="min-w-0 overflow-x-auto rounded-lg border border-dashed border-border bg-background/60 px-3 py-2 text-center" dangerouslySetInnerHTML={{ __html: html }} />;
}

function FunctionBlock({ item, onChange, onRemove, children }: {
  item: ComparisonFunction; onChange: (value: string) => void; onRemove: () => void; children?: ReactNode;
}) {
  const ref = useRef<MathBlockHandle>(null);
  const is3D = needs3D(item.expression);
  const error = item.expression.trim() ? (is3D ? parseFn2(item.expression).error : parseFn(item.expression).error) : null;
  const name = `${FUNCTION_SLOTS[item.slot]}(${is3D ? "x, y" : "x"})`;
  return <div className="space-y-3">
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between">
      <span className={`min-w-0 font-mono text-sm font-semibold ${FUNCTION_TEXT_COLORS[item.slot]}`}>{name}</span>
      {item.slot !== 0 && <Button type="button" variant="ghost" size="icon" title={`Excluir ${name}`} aria-label={`Excluir ${name}`} onClick={onRemove} className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive sm:h-8 sm:w-8"><Trash2 className="h-4 w-4" /></Button>}
    </div>
    <MathToolbar value={item.expression} onChange={onChange} onInsert={(t) => ref.current?.insertTemplate(t)} onClear={() => ref.current?.clear()} onDelete={() => ref.current?.deleteBackward()} />
    <MathBlockInput ref={ref} label={`${name} =`} value={item.expression} onChange={onChange} />
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