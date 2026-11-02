import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BrainCircuit, Loader2, Send, Sparkles, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askHelpdesk } from "@/lib/helpdesk.functions";
import { EV_FUNCTION, EV_THEME, TAB_ROUTES, onOff, request3D, type CopilotAction, type ThemeEventDetail } from "@/lib/copilot-actions";

type Msg = { role: "user" | "assistant"; content: string; redirect?: boolean; actions?: CopilotAction[] };
const GREETING: Msg = { role: "assistant", content: "Olá! Qual parte do CalculusLab você não entendeu bem? Posso mostrar ao vivo — experimente: \"Como vejo um gráfico 3D?\"" };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ACTION_LABEL: Record<CopilotAction["type"], (v: string) => string> = {
  setActiveTab: (v) => `Abrindo aba ${v}`,
  setFunctionInput: (v) => `Digitando ${v}`,
  toggleBlackboardMode: (v) => `Quadro Negro ${onOff(v) === false ? "desligado" : "ligado"}`,
  toggleBlacklight: (v) => `Luz Negra ${onOff(v) === false ? "desligada" : "ligada"}`,
  trigger3D: () => "Rotação 3D ativada",
};

export function HelpChat({ onClose }: { onClose: () => void }) {
  const ask = useServerFn(askHelpdesk);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pathRef = useRef(pathname); pathRef.current = pathname;
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, busy, running]);

  const theme = () => { const c = document.documentElement.classList; return { chalkboard: c.contains("chalkboard"), blacklight: c.contains("blacklight") }; };
  const setTheme = (d: ThemeEventDetail) => window.dispatchEvent(new CustomEvent(EV_THEME, { detail: d }));
  const goTo = async (path: string) => { if (pathRef.current !== path) { await navigate({ to: path }); await wait(450); } };

  async function run(actions: CopilotAction[]) {
    for (const a of actions) {
      setRunning(ACTION_LABEL[a.type](a.value));
      if (a.type === "setActiveTab") { const path = TAB_ROUTES[a.value.trim().toLowerCase()]; if (path) await goTo(path); }
      else if (a.type === "setFunctionInput") {
        await goTo("/");
        // Type it character by character so the user sees it happen live.
        const text = a.value.trim();
        for (let i = 1; i <= text.length; i++) { window.dispatchEvent(new CustomEvent(EV_FUNCTION, { detail: text.slice(0, i) })); await wait(55); }
      }
      else if (a.type === "toggleBlackboardMode") { const v = onOff(a.value) ?? !theme().chalkboard; setTheme(v ? { chalkboard: true } : { chalkboard: false, blacklight: false }); }
      else if (a.type === "toggleBlacklight") { const v = onOff(a.value) ?? !theme().blacklight; setTheme(v ? { chalkboard: true, blacklight: true } : { blacklight: false }); }
      else if (a.type === "trigger3D") { if (theme().chalkboard) setTheme({ chalkboard: false, blacklight: false }); await goTo("/"); request3D(); }
      await wait(650);
    }
    setRunning(null);
  }

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next); setDraft(""); setBusy(true); setError(null);
    const tab = Object.entries(TAB_ROUTES).find(([, p]) => p === pathRef.current)?.[0] ?? "funcoes";
    const res = await ask({ data: { messages: next.slice(1).map(({ role, content }) => ({ role, content })), state: { tab, ...theme() } } })
      .catch(() => ({ reply: null, redirect: false, actions: [], error: "Não foi possível falar com a IA agora." }));
    setBusy(false);
    if (!res.reply) { setError(res.error); setDraft(text); setMessages(messages); return; }
    setMessages([...next, { role: "assistant", content: res.reply, redirect: res.redirect, actions: res.actions }]);
    if (res.actions.length) await run(res.actions);
  }

  return <aside className="help-chat" role="dialog" aria-label="Ajuda com IA">
    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
      <div>
        <p className="flex items-center gap-2 font-display text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" />Copiloto de Ajuda</p>
        <p className="text-xs text-muted-foreground">Eu explico e mostro na sua tela</p>
      </div>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Fechar ajuda" onClick={onClose}><X className="h-4 w-4" /></Button>
    </div>
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
      {messages.map((m, i) => <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
        <div className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
          {m.content}
          {!!m.actions?.length && <ul className="mt-2 space-y-1 border-t border-border pt-2">{m.actions.map((a, j) => <li key={j} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground"><Wand2 className="h-3 w-3 text-primary" />{ACTION_LABEL[a.type](a.value)}</li>)}</ul>}
          {m.redirect && <Button asChild size="sm" className="mt-2 w-full gap-1.5"><Link to="/ia"><BrainCircuit className="h-4 w-4" />Abrir aba IA</Link></Button>}
        </div>
      </div>)}
      {busy && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Pensando…</p>}
      {running && <p className="flex items-center gap-2 text-xs font-medium text-primary"><Wand2 className="h-3.5 w-3.5 animate-pulse" />{running}…</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div ref={endRef} />
    </div>
    <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); void send(); }}>
      <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1500} placeholder="Ex: Como vejo um gráfico 3D?" aria-label="Sua dúvida" className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      <Button type="submit" size="icon" disabled={busy || !!running || !draft.trim()} aria-label="Enviar"><Send className="h-4 w-4" /></Button>
    </form>
  </aside>;
}
