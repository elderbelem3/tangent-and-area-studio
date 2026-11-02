import { z } from "zod";

export const tutorStepSchema = z.object({ title: z.string(), explanation: z.string(), formula: z.string(), dica: z.string().optional(), intermediario: z.string().optional() });
export const tutorSolutionSchema = z.object({ title: z.string(), steps: z.array(tutorStepSchema).min(1), conclusion: tutorStepSchema, funcoes: z.array(z.string()).max(5).optional(), intervalo: z.tuple([z.number().finite(), z.number().finite()]).optional() });
export type TutorSolution = z.infer<typeof tutorSolutionSchema>;
export type TutorStep = z.infer<typeof tutorStepSchema>;
export type TutorQuestion = { question: string; answer: TutorSolution };
export type TutorEntry = { id: string; problem: string; solution: TutorSolution; questions: Record<string, TutorQuestion[]> };

export const ATTACHMENT_TYPES = ["application/pdf", "image/png", "image/jpeg"] as const;
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
export const tutorAttachmentSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(ATTACHMENT_TYPES),
  // data: URL with base64 payload; length cap ≈ 8 MB of binary.
  dataUrl: z.string().regex(/^data:(application\/pdf|image\/png|image\/jpeg);base64,[A-Za-z0-9+/=]+$/).max(Math.ceil(MAX_ATTACHMENT_BYTES * 4 / 3) + 64),
});
export type TutorAttachment = z.infer<typeof tutorAttachmentSchema>;

export const tutorRequestSchema = z.object({
  problem: z.string().trim().min(1).max(8000),
  attachment: tutorAttachmentSchema.optional(),
  context: z.object({ solution: tutorSolutionSchema, stepIndex: z.number().int().min(0), question: z.string().trim().min(1).max(4000), previous: z.array(z.object({ question: z.string(), answer: tutorSolutionSchema })).max(20) }).optional(),
}).superRefine((value, ctx) => {
  if (value.context && value.context.stepIndex > value.context.solution.steps.length) ctx.addIssue({ code: "custom", message: "Etapa inválida", path: ["context", "stepIndex"] });
});

export const TUTOR_OUTPUT_SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    title: { type: "string" },
    steps: { type: "array", items: { type: "object", additionalProperties: false, properties: { title: { type: "string" }, explanation: { type: "string" }, formula: { type: "string" }, dica: { type: "string" }, intermediario: { type: "string" } }, required: ["title", "explanation", "formula", "dica", "intermediario"] } },
    conclusion: { type: "object", additionalProperties: false, properties: { title: { type: "string" }, explanation: { type: "string" }, formula: { type: "string" }, dica: { type: "string" }, intermediario: { type: "string" } }, required: ["title", "explanation", "formula", "dica", "intermediario"] },
    funcoes: { type: "array", maxItems: 5, items: { type: "string" } },
    intervalo: { type: "array", minItems: 2, maxItems: 2, items: { type: "number" } },
  }, required: ["title", "steps", "conclusion", "funcoes", "intervalo"],
};