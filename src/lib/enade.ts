import { z } from "zod";

export const enadeQuestionSchema = z.object({
  tema: z.string(),
  contexto: z.string(),
  enunciado: z.string(),
  formula: z.string(),
  alternativas: z.array(z.object({ letra: z.enum(["A", "B", "C", "D", "E"]), texto: z.string() })).length(5),
  correta: z.enum(["A", "B", "C", "D", "E"]),
});
export type EnadeQuestion = z.infer<typeof enadeQuestionSchema>;
export const enadeFeedbackSchema = z.object({ acertou: z.boolean(), feedback: z.string(), formula: z.string() });
export type EnadeFeedback = z.infer<typeof enadeFeedbackSchema>;

/** Recognizes typed requests like "Quero uma questão do Enade". */
export function isEnadeRequest(text: string) {
  const t = text.toLowerCase();
  return /\benade\b/.test(t) && t.length < 120 && /(quest|gera|quero|simul|prova|me d)/.test(t);
}
/** Text form of the question, used to ask the tutor for the full resolution. */
export function enadeAsProblem(q: EnadeQuestion) {
  return `Questão ENADE (${q.tema}). ${q.contexto} ${q.enunciado} ${q.formula ? `Fórmula: ${q.formula}.` : ""} Alternativas: ${q.alternativas.map((a) => `(${a.letra}) ${a.texto}`).join(" ")} Resolva passo a passo e indique a alternativa correta.`;
}

export const ENADE_QUESTION_SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    tema: { type: "string" }, contexto: { type: "string" }, enunciado: { type: "string" }, formula: { type: "string" },
    alternativas: { type: "array", minItems: 5, maxItems: 5, items: { type: "object", additionalProperties: false, properties: { letra: { type: "string", enum: ["A", "B", "C", "D", "E"] }, texto: { type: "string" } }, required: ["letra", "texto"] } },
    correta: { type: "string", enum: ["A", "B", "C", "D", "E"] },
  }, required: ["tema", "contexto", "enunciado", "formula", "alternativas", "correta"],
};
export const ENADE_FEEDBACK_SCHEMA = {
  type: "object", additionalProperties: false,
  properties: { acertou: { type: "boolean" }, feedback: { type: "string" }, formula: { type: "string" } },
  required: ["acertou", "feedback", "formula"],
};
