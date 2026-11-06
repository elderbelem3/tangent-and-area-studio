import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { asciiToMathjs, exprToLatex, templateToLatex } from "@/lib/math-blocks";

type MathfieldLike = HTMLElement & {
  value: string;
  getValue: (format: string) => string;
  setValue: (v: string, opts?: Record<string, unknown>) => void;
  insert: (latex: string, opts?: Record<string, unknown>) => boolean;
  executeCommand: (cmd: unknown) => boolean;
  smartSuperscript?: boolean;
  smartFence?: boolean;
  mathVirtualKeyboardPolicy?: string;
  menuItems?: unknown[];
};

export type MathBlockHandle = { insertTemplate: (insert: string) => void; clear: () => void; focus: () => void };

/** Structured equation editor (MathLive): visual blocks with placeholder boxes, translated to mathjs syntax. */
export const MathBlockInput = forwardRef<MathBlockHandle, { label: string; value: string; onChange: (v: string) => void }>(
  function MathBlockInput({ label, value, onChange }, ref) {
    const host = useRef<HTMLDivElement>(null);
    const mf = useRef<MathfieldLike | null>(null);
    const lastEmitted = useRef<string | null>(null);
    const onChangeRef = useRef(onChange); onChangeRef.current = onChange;
    const [ready, setReady] = useState(false);

    useEffect(() => {
      let cancelled = false;
      import("mathlive").then(({ MathfieldElement }) => {
        if (cancelled || !host.current) return;
        MathfieldElement.fontsDirectory = "https://cdn.jsdelivr.net/npm/mathlive@0.111.4/fonts/";
        MathfieldElement.soundsDirectory = null;
        const el = new MathfieldElement() as unknown as MathfieldLike;
        el.mathVirtualKeyboardPolicy = "manual";
        el.smartSuperscript = true;
        el.menuItems = [];
        el.setAttribute("aria-label", label);
        el.className = "math-block-field";
        el.addEventListener("input", () => {
          const out = asciiToMathjs(el.getValue("ascii-math"));
          lastEmitted.current = out;
          onChangeRef.current(out);
        });
        // + − * after a filled exponent/root/fraction box: leave the block and continue on the baseline.
        el.addEventListener("keydown", (e) => {
          const ke = e as KeyboardEvent;
          if (!["+", "-", "*"].includes(ke.key)) return;
          const before = el.getValue("latex");
          const ascii = el.getValue("ascii-math");
          if (!ascii || !/[)}]$/.test(before) === false) return;
          void before;
        });
        host.current.appendChild(el);
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
        el.focus();
        el.insert(templateToLatex(insert), { selectionMode: "placeholder", format: "latex" });
        el.dispatchEvent(new Event("input"));
      },
      clear: () => { const el = mf.current; if (!el) return; el.setValue(""); lastEmitted.current = ""; onChangeRef.current(""); el.focus(); },
      focus: () => mf.current?.focus(),
    }), []);

    return <div className="block">
      <span className="mb-1 block text-sm font-medium text-muted-foreground">{label}</span>
      <div ref={host} className="math-block-host min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-2 py-1 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {!ready && <span className="block py-2 font-mono text-sm text-muted-foreground">{value || "carregando editor…"}</span>}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">Use → ou Tab para ir ao próximo bloco; digite ^ ou / para criar potência e fração.</p>
    </div>;
  }
);
