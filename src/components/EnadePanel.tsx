import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, LoaderCircle, ListChecks, Send, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBox } from "@/components/Lab";
import { MathFormula } from "@/components/MathFormula";
import { TutorSteps } from "@/components/TutorSteps";
import { askTutor } from "@/lib/tutor.functions";
import { evaluateEnade, generateEnade } from "@/lib/enade.functions";
import { enadeAsProblem, type EnadeFeedback, type EnadeQuestion } from "@/lib/enade";
import type { TutorSolution } from "@/lib/tutor";

/** ENADE simulator: generates a question, grades the student's answer and shows the full resolution. */
export function EnadePanel({ startToken, onClose }: { startToken: number; onClose: () => void }) {
  const gen = useServerFn(generateEnade), evalFn = useServerFn(evaluateEnade), tutor = useServerFn(askTutor);
  const [q, setQ] = useState<EnadeQuestion | null>(null);
  const [busy, setBusy] = useState<"gen" | "eval" | "sol" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<EnadeFeedback | null>(null);
  const [solution, setSolution] = useState<TutorSolution | null>(null);
  const [token, setToken] = useState(-1);

  async function newQuestion() {
    setBusy("gen"); setError(null); setQ(null); setChoice(null); setAnswer(""); setFeedback(null); setSolution(null);
    try { const r = await gen({ data: {} }); if (r.error || !r.question) setError(r.error ?? "Não foi possível gerar a questão."); else setQ(r.question); }
    catch { setError("Não foi possível conectar à IA."); } finally { setBusy(null); }
  }
  if (token !== startToken) { setToken(startToken); void newQuestion(); }

  async function submit() {
    if (!q) return; const text = answer.trim() || (choice ? `Alternativa ${choice}` : "");
    if (!text) return;
    setBusy("eval"); setError(null);
    try { const r = await evalFn({ data: { question: q, answer: text } }); if (r.error || !r.result) setError(r.error ?? "Correção indisponível."); else setFeedback(r.result); }
    catch { setError("Não foi possível enviar sua resposta. Ela foi preservada."); } finally { setBusy(null); }
  }
  async function showSolution() {
    if (!q) return; setBusy("sol"); setError(null);
    try { const r = await tutor({ data: { problem: enadeAsProblem(q) } }); if (r.error || !r.solution) setError(r.error ?? "Resolução indisponível."); else setSolution(r.solution); }
    catch { setError("Não foi possível carregar a resolução."); } finally { setBusy(null); }
  }

  return <div className="space-y-5" data-testid="enade-panel">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-primary"><GraduationCap className="h-4 w-4" />Simulado ENADE · Cálculo</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void newQuestion()} disabled={!!busy}><RefreshCw className="h-4 w-4" />Nova questão</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
      </div>
    </div>
    {busy === "gen" && <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-muted-foreground"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /><p className="text-sm">A banca está elaborando a questão…</p></div>}
    {error && <ErrorBox msg={error} />}
    {q && <article className="space-y-4">
      <p className="font-mono text-xs uppercase text-muted-foreground">Tema: {q.tema}</p>
      <p className="leading-relaxed">{q.contexto}</p>
      {q.formula && <div className="rounded-lg bg-secondary px-4 py-2"><MathFormula formula={q.formula} /></div>}
      <p className="font-medium leading-relaxed">{q.enunciado}</p>
      <div className="space-y-2" role="radiogroup" aria-label="Alternativas">
        {q.alternativas.map((a) => {
          const right = feedback && a.letra === q.correta, wrong = feedback && choice === a.letra && a.letra !== q.correta;
          return <button key={a.letra} type="button" role="radio" aria-checked={choice === a.letra} disabled={!!feedback} onClick={() => setChoice(a.letra)}
            className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${right ? "border-accent-strong bg-accent-strong/10" : wrong ? "border-destructive bg-destructive/10" : choice === a.letra ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">{a.letra}</span><span className="pt-0.5">{a.texto}</span>
          </button>;
        })}
      </div>
      {!feedback && <div className="space-y-2">
        <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={4000} placeholder="Opcional: escreva seu raciocínio ou resposta discursiva…" className="min-h-20" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void submit()} disabled={!!busy || (!choice && !answer.trim())}>{busy === "eval" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Enviar resposta</Button>
          <Button type="button" variant="outline" onClick={() => void showSolution()} disabled={!!busy || !!solution}>{busy === "sol" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}Ver Resolução Passo a Passo</Button>
        </div>
      </div>}
      {feedback && <div className={`rounded-lg border p-4 ${feedback.acertou ? "border-accent-strong bg-accent-strong/5" : "border-destructive bg-destructive/5"}`} data-testid="enade-feedback">
        <p className="mb-2 flex items-center gap-2 font-semibold">{feedback.acertou ? <CheckCircle2 className="h-5 w-5 text-accent-strong" /> : <XCircle className="h-5 w-5 text-destructive" />}{feedback.acertou ? "Você acertou!" : `Resposta incorreta · correta: ${q.correta}`}</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{feedback.feedback}</p>
        {feedback.formula && <MathFormula formula={feedback.formula} />}
        {!solution && <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void showSolution()} disabled={!!busy}>{busy === "sol" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}Ver Resolução Passo a Passo</Button>}
      </div>}
      {busy === "sol" && <p className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />Preparando a resolução…</p>}
      {solution && <div className="border-t border-border pt-4"><TutorSteps solution={solution} onQuestion={() => {}} /></div>}
    </article>}
  </div>;
}
