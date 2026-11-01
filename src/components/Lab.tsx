import { forwardRef, type ReactNode, type RefObject } from "react";
import { AlertTriangle } from "lucide-react";

export function PageHeader({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <header className="mb-6">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">{tag}</p>
      <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{desc}</p>
    </header>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 shadow-soft ${className}`}>
      {title && <h2 className="mb-3 font-display text-lg font-semibold">{title}</h2>}
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
          className={`w-full rounded-lg border border-input bg-background px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${mono ? "font-mono" : ""}`}
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
    <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-secondary/50 p-2" role="toolbar" aria-label="Teclado de símbolos matemáticos">
      {MATH_KEYS.map((k) => (
        <button
          key={k.label}
          type="button"
          onClick={() => insertAtCursor(k.insert)}
          className="min-w-9 rounded-md border border-border bg-background px-2 py-1 font-mono text-sm transition hover:border-primary hover:text-primary"
        >
          {k.label}
        </button>
      ))}
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
    <div className="rounded-xl bg-secondary p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-mono text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}

export function Chip({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="rounded-full border border-border bg-background px-3 py-1 text-sm transition hover:border-primary hover:text-primary">
      {children}
    </button>
  );
}

export function num(s: string): number | null {
  const v = Number(s.replace(",", "."));
  return s.trim() === "" || !Number.isFinite(v) ? null : v;
}
