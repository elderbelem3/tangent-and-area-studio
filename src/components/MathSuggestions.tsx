import { Button } from "@/components/ui/button";
import type { MathSuggestion } from "@/lib/math-suggestions";

export function MathSuggestions({ id, items, active, onSelect }: { id: string; items: MathSuggestion[]; active: number; onSelect: (item: MathSuggestion) => void }) {
  return <div id={id} role="listbox" aria-label="Sugestões matemáticas" className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg">
    {items.map((item, index) => <Button key={item.label} id={`${id}-${index}`} role="option" aria-selected={active === index} type="button" variant="ghost" onPointerDown={(event) => { if (event.pointerType !== "mouse") { event.preventDefault(); onSelect(item); } }} onMouseDown={(event) => event.preventDefault()} onClick={() => onSelect(item)} className={`h-11 w-full justify-start font-mono text-sm sm:h-10 ${active === index ? "bg-accent text-accent-foreground" : "text-popover-foreground"}`}>{item.label}</Button>)}
  </div>;
}