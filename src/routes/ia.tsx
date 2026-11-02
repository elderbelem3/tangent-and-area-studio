import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { BrainCircuit, Sparkles, LoaderCircle, History, Send, CheckCheck, ChartSpline } from "lucide-react";
import { PageHeader, Panel, ErrorBox } from "@/components/Lab";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TutorSteps, TutorStepContent } from "@/components/TutorSteps";
import { askTutor } from "@/lib/tutor.functions";
import { tutorSolutionSchema, type TutorEntry } from "@/lib/tutor";
import { z } from "zod";
import { validateTutorPlot } from "@/lib/tutor-plot";

export const Route = createFileRoute("/ia")({
  head: () => ({ meta: [
    { title: "IA · Tutor de Cálculo · CalculusLab" },
    { name: "description", content: "Resolva exercícios de Cálculo 1 e 2 passo a passo e tire dúvidas sobre cada etapa com o tutor CalculusLab." },
    { property: "og:title", content: "IA · Tutor de Cálculo · CalculusLab" },
    { property: "og:description", content: "Resoluções didáticas com fórmulas e perguntas contextualizadas por etapa." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: TutorPage,
});

const sessionSchema = z.array(z.object({ id: z.string(), problem: z.string(), solution: tutorSolutionSchema, questions: z.record(z.string(), z.array(z.object({ question: z.string(), answer: tutorSolutionSchema }))) }));
const SESSION_KEY = "calculuslab-tutor-session";

function TutorPage() {
  const navigate = useNavigate();
  const tutor = useServerFn(askTutor);
  const [problem, setProblem] = useState("");
  const [entries, setEntries] = useState<TutorEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [questionBusy, setQuestionBusy] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  useEffect(() => {
    try { const restored = sessionSchema.parse(JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "[]")); setEntries(restored); setActiveId(restored[0]?.id ?? null); }
    catch { /* Corrupt or unavailable session storage does not prevent tutoring. */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(entries)); } catch { /* Keep in-memory session usable. */ } } }, [entries, ready]);
  const active = entries.find((entry) => entry.id === activeId);
  const plotResult = active?.solution.funcoes?.length ? validateTutorPlot(active.solution) : null;
  const selectedStep = active && stepIndex !== null ? [...active.solution.steps, active.solution.conclusion][stepIndex] : undefined;
  const questions = active && stepIndex !== null ? active.questions[String(stepIndex)] ?? [] : [];

  async function solve() {
    if (!problem.trim() || busy || questionBusy) return;
    setBusy(true); setError(null);
    const submitted = problem.trim();
    try {
      const result = await tutor({ data: { problem: submitted } });
      if (result.error || !result.solution) { setError(result.error ?? "Não foi possível resolver o problema."); return; }
      const entry: TutorEntry = { id: crypto.randomUUID(), problem: submitted, solution: result.solution, questions: {} };
      setEntries((previous) => [entry, ...previous]); setActiveId(entry.id);
    } catch { setError("Não foi possível conectar ao tutor. Seu problema foi preservado."); }
    finally { setBusy(false); }
  }
  async function askStep() {
    if (!active || stepIndex === null || !question.trim() || questionBusy) return;
    const entryId = active.id, index = stepIndex, submitted = question.trim();
    setQuestionBusy(true); setQuestionError(null);
    try {
      const result = await tutor({ data: { problem: active.problem, context: { solution: active.solution, stepIndex: index, question: submitted, previous: questions.slice(-20) } } });
      if (result.error || !result.solution) { setQuestionError(result.error ?? "Não foi possível responder."); return; }
      const answer = result.solution;
      setEntries((previous) => previous.map((entry) => entry.id === entryId ? { ...entry, questions: { ...entry.questions, [index]: [...(entry.questions[String(index)] ?? []), { question: submitted, answer }] } } : entry));
      setQuestion("");
    } catch { setQuestionError("Não foi possível enviar sua dúvida. O texto foi preservado."); }
    finally { setQuestionBusy(false); }
  }

  return <>
    <PageHeader tag="Tutor de Cálculo 1 e 2" title="IA" desc="Do enunciado à conclusão, uma etapa de cada vez." />
    <div className="grid min-w-0 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="min-w-0 space-y-6">
        <Panel title="Seu problema">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void solve(); }}>
            <label className="block text-sm font-medium" htmlFor="tutor-problem">Enunciado ou expressão</label>
            <Textarea id="tutor-problem" value={problem} onChange={(event) => setProblem(event.target.value)} maxLength={8000} placeholder="Calcule a derivada de f(x) = x^2 * sin(x)" className="min-h-44 resize-y bg-background font-mono leading-relaxed" />
            <Button type="submit" disabled={!problem.trim() || busy || questionBusy || !ready} className="w-full">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{busy ? "Resolvendo…" : "Resolver com IA"}</Button>
            {error && <ErrorBox msg={error} />}
          </form>
        </Panel>
        <section className="min-w-0">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold"><History className="h-4 w-4 text-primary" />Dúvidas recentes</h2>
          {entries.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma dúvida nesta sessão.</p> : <div className="space-y-2">{entries.map((entry) => <Button key={entry.id} variant={entry.id === activeId ? "secondary" : "ghost"} disabled={busy || questionBusy} onClick={() => { setActiveId(entry.id); setProblem(entry.problem); setError(null); }} className="h-auto w-full min-w-0 justify-start whitespace-normal py-3 text-left"><BrainCircuit className="h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 break-words text-sm">{entry.problem}</span></Button>)}</div>}
        </section>
      </div>
      <section className="min-w-0" aria-live="polite" aria-busy={busy}>
        {busy ? <div className="flex min-h-72 flex-col items-center justify-center gap-4 border-y border-border text-muted-foreground"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /><p className="text-sm">Analisando o problema e preparando a resolução…</p></div> : active ? <>
          <div className="mb-5 border-b border-border pb-5"><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-primary"><CheckCheck className="h-4 w-4" />Resolução</p><h2 className="break-words font-display text-xl font-semibold">{active.solution.title}</h2><p className="mt-3 break-words whitespace-pre-wrap text-sm text-muted-foreground">{active.problem}</p></div>
          <TutorSteps solution={active.solution} onQuestion={(index) => { setStepIndex(index); setQuestion(""); setQuestionError(null); }} />
          {plotResult && <div className="mt-5 space-y-3 border-t border-border pt-5">
            <Button disabled={!plotResult.plot} onClick={() => { if (plotResult.plot) void navigate({ to: "/", search: { grafico: JSON.stringify(plotResult.plot) } }); }}><ChartSpline className="h-4 w-4" />Plotar no Gráfico</Button>
            {plotResult.error && <ErrorBox msg={plotResult.error} />}
          </div>}
          <p className="mt-4 text-xs text-muted-foreground">Respostas de IA podem conter erros. Confira as hipóteses e os resultados.</p>
        </> : <div className="flex min-h-80 flex-col items-center justify-center gap-4 border-y border-border text-center"><BrainCircuit className="h-12 w-12 text-primary/60" /><h2 className="font-display text-xl font-semibold">Sua resolução</h2><p className="text-sm text-muted-foreground">Aguardando um problema de Cálculo.</p></div>}
      </section>
    </div>
    <Dialog open={stepIndex !== null} onOpenChange={(open) => { if (!open && !questionBusy) setStepIndex(null); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg">
        <DialogHeader><DialogTitle>{active && stepIndex === active.solution.steps.length ? "Dúvida sobre a conclusão" : `Dúvida sobre o passo ${(stepIndex ?? 0) + 1}`}</DialogTitle><DialogDescription className="break-words">{selectedStep?.title}</DialogDescription></DialogHeader>
        {selectedStep && <div className="min-w-0 border-b border-border pb-4"><TutorStepContent step={selectedStep} /></div>}
        <div className="min-w-0 space-y-5" aria-live="polite">{questions.map((item, index) => <div key={index} className="min-w-0 space-y-3"><p className="break-words border-l-2 border-primary pl-3 text-sm font-medium">{item.question}</p><TutorSteps solution={item.answer} /></div>)}</div>
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void askStep(); }}>
          <label htmlFor="step-question" className="block text-sm font-medium">Sua dúvida nesta etapa</label>
          <Textarea id="step-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={4000} placeholder="Por que aplicou a regra do produto aqui?" className="min-h-24" />
          <Button type="submit" disabled={!question.trim() || questionBusy} className="w-full">{questionBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{questionBusy ? "Preparando explicação…" : "Perguntar à IA"}</Button>
          {questionError && <ErrorBox msg={questionError} />}
        </form>
      </DialogContent>
    </Dialog>
  </>;
}