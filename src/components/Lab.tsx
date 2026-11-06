import { forwardRef, useState, type ReactNode, type RefObject } from "react";
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

type MathKey = { label: string; insert: string; hint: string };
const fnKey = (label: string, name: string, hint: string): MathKey => ({ label, insert: `${name}()`, hint });

export const MATH_GROUPS: { id: string; label: string; keys: MathKey[] }[] = [
  { id: "basic", label: "Básicas", keys: [
    { label: "+", insert: "+", hint: "Soma" }, { label: "−", insert: "-", hint: "Subtração" },
    { label: "×", insert: "*", hint: "Multiplicação" }, { label: "÷", insert: "/", hint: "Divisão" },
    { label: "( )", insert: "()", hint: "Parênteses" }, { label: "a/b", insert: "()/()", hint: "Fração" },
    { label: "x", insert: "x", hint: "Variável x" }, { label: "y", insert: "y", hint: "Variável y (3D)" },
  ] },
  { id: "pow", label: "Potências", keys: [
    { label: "x²", insert: "^2", hint: "Ao quadrado" }, { label: "xʸ", insert: "^()", hint: "Potência: digite o expoente" },
    fnKey("√x", "sqrt", "Raiz quadrada"), fnKey("∛x", "cbrt", "Raiz cúbica"),
    fnKey("eˣ", "exp", "Exponencial"), fnKey("ln", "log", "Logaritmo natural"),
    fnKey("log₁₀", "log10", "Logaritmo base 10"), fnKey("|x|", "abs", "Módulo"),
  ] },
  { id: "trig", label: "Trigonometria", keys: [
    fnKey("sin", "sin", "Seno"), fnKey("cos", "cos", "Cosseno"), fnKey("tan", "tan", "Tangente"), fnKey("sec", "sec", "Secante"),
    fnKey("asin", "asin", "Arco seno"), fnKey("acos", "acos", "Arco cosseno"), fnKey("atan", "atan", "Arco tangente"), fnKey("csc", "csc", "Cossecante"),
  ] },
  { id: "const", label: "Constantes", keys: [
    { label: "π", insert: "pi", hint: "Pi" }, { label: "e", insert: "e", hint: "Número de Euler" },
    { label: "∞", insert: "infinity", hint: "Infinito" }, { label: "−∞", insert: "-infinity", hint: "Menos infinito" },
    { label: "≤", insert: "<=", hint: "Menor ou igual" }, { label: "≥", insert: ">=", hint: "Maior ou igual" },
    { label: "x⁻¹", insert: "^(-1)", hint: "Inverso" }, { label: "1/x", insert: "1/()", hint: "Recíproco" },
  ] },
];

/** Cursor position after inserting a template: inside the first empty "()". */
export function templateCursor(insert: string): number {
  const i = insert.indexOf("()");
  return i >= 0 ? i + 1 : insert.length;
}

/** Scientific-calculator keyboard: inserts full templates and places the cursor inside them. */
export function MathToolbar({ inputRef, value, onChange, onInsert, onClear }: { inputRef?: RefObject<HTMLInputElement | null>; value: string; onChange: (v: string) => void; onInsert?: (template: string) => void; onClear?: () => void }) {
  const [tab, setTab] = useState("basic");
  const group = MATH_GROUPS.find((g) => g.id === tab) ?? MATH_GROUPS[0]!;
  const insertAtCursor = (text: string) => {
    if (onInsert) { onInsert(text); return; }
    if (!inputRef) return;
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    let piece = text, pos = start + templateCursor(text);
    // Wrap a selection inside the template, e.g. select "x+1" → sqrt(x+1)
    if (selected && text.includes("()")) { const i = text.indexOf("()") + 1; piece = text.slice(0, i) + selected + text.slice(i); pos = start + piece.length; }
    onChange(value.slice(0, start) + piece + value.slice(end));
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(pos, pos); });
  };
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-2" aria-label="Teclado de símbolos matemáticos">
      <div className="mb-2 flex items-center gap-1" role="tablist">
        <div className="grid flex-1 grid-cols-4 gap-1 rounded-lg bg-background/70 p-0.5">
          {MATH_GROUPS.map((g) => (
            <button key={g.id} type="button" role="tab" aria-selected={g.id === tab} onClick={() => setTab(g.id)}
              className={`truncate rounded-md px-1 py-1.5 text-[11px] font-semibold transition ${g.id === tab ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {g.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="icon" type="button" title="Limpar função" aria-label="Limpar função" disabled={!value} onClick={() => { if (onClear) { onClear(); return; } onChange(""); inputRef?.current?.focus(); }} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"><Eraser /></Button>
      </div>
      <div className="grid grid-cols-4 gap-1.5" role="toolbar" aria-label={group.label}>
        {group.keys.map((k) => (
          <Button variant="outline" size="sm" type="button" key={k.label} title={`${k.hint} · ${k.insert}`} aria-label={k.label}
            onMouseDown={(e) => e.preventDefault()} onClick={() => insertAtCursor(k.insert)}
            className="h-10 min-w-0 border-border bg-card px-1 font-mono text-sm hover:border-primary/40 hover:text-primary active:scale-95">
            {k.label}
          </Button>
        ))}
      </div>
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
    <Button variant="outline" size="sm" onClick={onClick} className="h-8 rounded-md font-mono border-border bg-background px-2.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary">
      {children}<ArrowUpRight className="!size-3 opacity-50" />
    </Button>
  );
}

export function num(s: string): number | null {
  const v = Number(s.replace(",", "."));
  return s.trim() === "" || !Number.isFinite(v) ? null : v;
}
