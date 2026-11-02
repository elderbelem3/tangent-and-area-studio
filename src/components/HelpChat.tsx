import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BrainCircuit, Loader2, MessageCircleQuestion, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askHelpdesk } from "@/lib/helpdesk.functions";

type Msg = { role: "user" | "assistant"; content: string; redirect?: boolean };
const GREETING: Msg = { role: "assistant", content: "Olá! Qual parte do CalculusLab você não entendeu bem?" };

export function HelpChat({ onClose }: { onClose: () => void }) {
  const ask = useServerFn(askHelpdesk);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, busy]);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next); setDraft(""); setBusy(true); setError(null);
    // Send the full history (minus the canned greeting) so the model keeps context.
    const res = await ask({ data: { messages: next.slice(1).map(({ role, content }) => ({ role, content })) } }).catch(() => ({ reply: null, redirect: false, error: "Não foi possível falar com a IA agora." }));
    setBusy(false);
    if (res.reply) setMessages([...next, { role: "assistant", content: res.reply, redirect: res.redirect }]);
    else { setError(res.error); setDraft(text); setMessages(messages); }
  }

  return <div className="help-chat" role="dialog" aria-label="Ajuda com IA">
    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
      <p className="flex items-center gap-2 font-display text-sm font-semibold"><MessageCircleQuestion className="h-4 w-4 text-primary" />Ajuda do CalculusLab</p>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Fechar ajuda" onClick={onClose}><X className="h-4 w-4" /></Button>
    </div>
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
      {messages.map((m, i) => <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
          {m.content}
          {m.redirect && <Button asChild size="sm" className="mt-2 w-full gap-1.5"><Link to="/ia" onClick={onClose}><BrainCircuit className="h-4 w-4" />Abrir aba IA</Link></Button>}
        </div>
      </div>)}
      {busy && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Pensando…</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div ref={endRef} />
    </div>
    <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); void send(); }}>
      <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1500} placeholder="Ex: Como ligo a Luz Negra?" aria-label="Sua dúvida" className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      <Button type="submit" size="icon" disabled={busy || !draft.trim()} aria-label="Enviar"><Send className="h-4 w-4" /></Button>
    </form>
  </div>;
}
