import { forwardRef, type ReactNode, type RefObject } from "react";
import { AlertTriangle, ChartSpline, Table2, BookOpen, SlidersHorizontal, ArrowUpRight, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <header className="mb-8 flex items-start gap-4 border-b border-border pb-7">
      <span className="mt-1 hidden h-14 w-14 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/5 text-primary sm:grid"><ChartSpline className="h-6 w-6" /></span>
      <div>
      <p className="text-xs font-semibold uppercase text-primary">{tag}</p>
      <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </header>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`lab-panel min-w-0 self-start rounded-xl border border-border bg-card p-5 shadow-sm md:p-6 ${className}`}>
      {title && <h2 className="mb-5 flex items-start gap-2.5 font-display text-base font-semibold"><span className="mt-0.5 shrink-0 text-primary">{title.includes("Tabela") || title.includes("Pela") ? <Table2 className="h-4 w-4" /> : title.includes("Gráfico") || title.includes("curva") || title.includes("Curva") ? <ChartSpline className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}</span>{title}</h2>}
      {!title && <h2 className="mb-5 flex items-center gap-2.5 text-sm font-semibold"><SlidersHorizontal className="h-4 w-4 text-primary" />Parâmetros</h2>}
      {children}
    </section>
  );
}

export const Field = forwardRef<HTMLInputElement, { label: string; value: string; onChange: (v: string) => void; mono?: boolean; placeholder?: string }>(
  function Field({ label, value, onChange, mono = true, placeholder }, ref) {
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">{label}</span>
        <input
          ref={ref}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${mono ? "font-mono" : ""}`}
        />
      </label>
    );
  }
);

const MATH_KEYS: { label: string; insert: string }[] = [
  { label: "x^y", insert: "^" },
  { label: "√", insert: "sqrt()" },
  { label: "eˣ", insert: "exp()" },
  { label: "|x|", insert: "abs()" },
  { label: "sin", insert: "sin()" },
  { label: "cos", insert: "cos()" },
  { label: "tan", insert: "tan()" },
  { label: "π", insert: "pi" },
  { label: "e", insert: "e" },
  { label: "x", insert: "x" },
  { label: "≤", insert: "<=" },
  { label: "≥", insert: ">=" },
  { label: "∞", insert: "infinity" },
];

/** Virtual math keyboard: inserts symbols at the cursor of the given input. */
export function MathToolbar({ inputRef, value, onChange }: { inputRef: RefObject<HTMLInputElement | null>; value: string; onChange: (v: string) => void }) {
  const insertAtCursor = (text: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    // Place the cursor inside the parentheses for functions, else after the text
    const inner = text.endsWith("()");
    const pos = start + text.length - (inner ? 1 : 0);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  };
  return (
    <div className="grid grid-cols-7 gap-1 rounded-lg border border-border bg-muted/60 p-1.5" role="toolbar" aria-label="Teclado de símbolos matemáticos">
      {MATH_KEYS.map((k) => (
        <Button
          variant="ghost"
          size="sm"
          title={k.insert}
          aria-label={k.label}
          key={k.label}
          type="button"
          onClick={() => insertAtCursor(k.insert)}
          className="h-9 min-w-0 px-1 font-mono text-xs hover:bg-card hover:text-primary"
        >
          {k.label}
        </Button>
      ))}
      <Button variant="ghost" size="sm" title="Limpar função" aria-label="Limpar função" disabled={!value} onClick={() => { onChange(""); inputRef.current?.focus(); }} className="h-9 min-w-0 px-1 text-muted-foreground"><Eraser /></Button>
    </div>
  );
}

export function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-primary/15 bg-primary/5 p-5">
      <p className="font-mono text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 break-all font-mono text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}

export function Chip({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="h-8 rounded-md border-border bg-background px-2.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary">
      {children}<ArrowUpRight className="!size-3 opacity-50" />
    </Button>
  );
}

export function num(s: string): number | null {
  const v = Number(s.replace(",", "."));
  return s.trim() === "" || !Number.isFinite(v) ? null : v;
}
