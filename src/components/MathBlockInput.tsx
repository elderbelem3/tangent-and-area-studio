import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useId } from "react";
import { asciiToMathjs, exprToLatex, templateToLatex } from "@/lib/math-blocks";
import { mathSuggestions, type MathSuggestion } from "@/lib/math-suggestions";
import { MathSuggestions } from "@/components/MathSuggestions";

type MathfieldLike = HTMLElement & {
  value: string;
  getValue: { (format: string): string; (start: number, end: number, format: string): string };
  position: number;
  selection: { ranges: [number, number][] };
  setValue: (v: string, opts?: Record<string, unknown>) => void;
  insert: (latex: string, opts?: Record<string, unknown>) => boolean;
  executeCommand: (cmd: unknown) => boolean;
  smartSuperscript?: boolean;
  smartFence?: boolean;
  mathVirtualKeyboardPolicy?: string;
  menuItems?: unknown[];
  inlineShortcuts?: Record<string, string>;
};

/** Focus MathLive's internal keyboard sink (host.focus() alone doesn't always reach it). */
function focusField(el: MathfieldLike | null) {
  if (!el) return;
  el.focus();
  (el.shadowRoot?.querySelector("[part=keyboard-sink]") as HTMLElement | null)?.focus();
}

export type MathBlockHandle = { insertTemplate: (insert: string) => void; clear: () => void; focus: () => void };

/** Structured equation editor (MathLive): visual blocks with placeholder boxes, translated to mathjs syntax. */
export const MathBlockInput = forwardRef<MathBlockHandle, { label: string; value: string; onChange: (v: string) => void }>(
  function MathBlockInput({ label, value, onChange }, ref) {
    const host = useRef<HTMLDivElement>(null);
    const mf = useRef<MathfieldLike | null>(null);
    const lastEmitted = useRef<string | null>(null);
    const onChangeRef = useRef(onChange); onChangeRef.current = onChange;
    const [ready, setReady] = useState(false);
    const id = useId();
    const [suggestions, setSuggestions] = useState<MathSuggestion[]>([]);
    const [active, setActive] = useState(0);
    const suggestionRef = useRef<{ items: MathSuggestion[]; start: number; end: number; active: number } | null>(null);
    const dismiss = () => { suggestionRef.current = null; setSuggestions([]); };
    const acceptRef = useRef<(item: MathSuggestion) => void>(() => {});
    acceptRef.current = (item) => {
      const el = mf.current, context = suggestionRef.current;
      if (!el || !context) return;
      el.selection = { ranges: [[context.start, context.end]] };
      el.insert(item.latex, { selectionMode: "after", format: "latex" });
      if (item.argument) { el.executeCommand("moveToPreviousChar"); el.executeCommand("extendToPreviousChar"); }
      dismiss();
      const out = asciiToMathjs(el.getValue("ascii-math"));
      lastEmitted.current = out; onChangeRef.current(out); focusField(el);
    };

    useEffect(() => {
      let cancelled = false;
      import("mathlive").then(({ MathfieldElement }) => {
        if (cancelled || !host.current) return;
        MathfieldElement.fontsDirectory = "https://cdn.jsdelivr.net/npm/mathlive@0.111.4/fonts/";
        MathfieldElement.soundsDirectory = null;
        const el = new MathfieldElement() as unknown as MathfieldLike;
        el.setAttribute("math-virtual-keyboard-policy", "manual");
        el.setAttribute("smart-superscript", "true");
        el.setAttribute("aria-label", label);
        el.className = "math-block-field";
        el.addEventListener("input", () => {
          const out = asciiToMathjs(el.getValue("ascii-math"));
          lastEmitted.current = out;
          onChangeRef.current(out);
          const end = el.position;
          const prefix = asciiToMathjs(el.getValue(0, end, "ascii-math"));
          const context = mathSuggestions(prefix);
          if (!context) { dismiss(); return; }
          let start = end;
          for (let offset = end - 1; offset >= 0; offset--) {
            const text = asciiToMathjs(el.getValue(offset, end, "ascii-math")).replace(/\s+/g, "");
            if (text === context.token.replace(/\s+/g, "")) { start = offset; break; }
          }
          if (start === end) { dismiss(); return; }
          suggestionRef.current = { items: context.suggestions, start, end, active: 0 };
          setSuggestions(context.suggestions); setActive(0);
        });
        el.addEventListener("keydown", (event) => {
          const context = suggestionRef.current;
          if (!context || event.isComposing) return;
          if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); dismiss(); }
          else if (["ArrowDown", "ArrowUp", "Tab", "Enter"].includes(event.key)) {
            event.preventDefault(); event.stopImmediatePropagation();
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              context.active = (context.active + (event.key === "ArrowDown" ? 1 : -1) + context.items.length) % context.items.length;
              setActive(context.active);
            } else { const item = context.items[context.active]; if (item) acceptRef.current(item); }
          }
        }, { capture: true });
        el.addEventListener("blur", dismiss);
        host.current.appendChild(el);
        // Configure once connected: the default log shortcut adds a subscript
        // box, which would nest a second subscript when the user types _.
        el.inlineShortcuts = { ...el.inlineShortcuts, log: "\\operatorname{log}" };
        try { el.menuItems = []; } catch { /* older versions */ }
        mf.current = el;
        setReady(true);
      });
      return () => { cancelled = true; mf.current?.remove(); mf.current = null; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // External updates (examples, copilot, tutor) → reload the blocks.
    useEffect(() => {
      const el = mf.current; if (!el || value === lastEmitted.current) return;
      lastEmitted.current = value;
      el.setValue(exprToLatex(value), { silenceNotifications: true });
    }, [value, ready]);

    useImperativeHandle(ref, () => ({
      insertTemplate: (insert) => {
        const el = mf.current; if (!el) return;
        focusField(el);
        const isFunction = /^[a-z0-9]+\(\)$/.test(insert);
        el.insert(templateToLatex(insert), { selectionMode: isFunction ? "after" : "placeholder", format: "latex" });
        if (isFunction) el.executeCommand("moveToPreviousChar");
        el.dispatchEvent(new Event("input"));
      },
      clear: () => { const el = mf.current; if (!el) return; el.setValue(""); lastEmitted.current = ""; onChangeRef.current(""); focusField(el); },
      focus: () => focusField(mf.current),
    }), []);

    return <div className="block">
      <span className="mb-1 block text-sm font-medium text-muted-foreground">{label}</span>
      <div className="relative">
      <div ref={host} onClick={() => focusField(mf.current)} className="math-block-host min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-2 py-1 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {!ready && <span className="block py-2 font-mono text-sm text-muted-foreground">{value || "carregando editor…"}</span>}
      </div>
      {suggestions.length > 0 && <MathSuggestions id={id} items={suggestions} active={active} onSelect={(item) => acceptRef.current(item)} />}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">Use → ou Tab para ir ao próximo bloco; digite ^ ou / para criar potência e fração.</p>
    </div>;
  }
);
