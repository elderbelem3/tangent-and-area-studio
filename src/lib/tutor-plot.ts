import { z } from "zod";
import { parseFn } from "@/lib/calc";
import { MAX_FUNCTIONS, type ComparisonFunction } from "@/lib/comparison";

export const tutorPlotSchema = z.object({
  funcoes: z.array(z.string().trim().min(1).max(1000)).min(1).max(MAX_FUNCTIONS),
  intervalo: z.tuple([z.number().finite(), z.number().finite()]),
}).superRefine(({ intervalo }, ctx) => {
  if (intervalo[0] >= intervalo[1] || !Number.isFinite(intervalo[1] - intervalo[0])) ctx.addIssue({ code: "custom", message: "Intervalo inválido", path: ["intervalo"] });
});
export type TutorPlot = z.infer<typeof tutorPlotSchema>;

export function validateTutorPlot(value: unknown): { plot: TutorPlot | null; error: string | null } {
  const result = tutorPlotSchema.safeParse(value);
  if (!result.success) return { plot: null, error: "O tutor não forneceu funções e um intervalo válidos para o gráfico." };
  const [min, max] = result.data.intervalo;
  for (const expression of result.data.funcoes) {
    const { fn } = parseFn(expression);
    if (!fn || !Array.from({ length: 601 }, (_, i) => min + (max - min) * i / 600).some((x) => Number.isFinite(fn(x)))) return { plot: null, error: `Não foi possível representar ${expression} no intervalo indicado. Peça ao tutor uma função real de x.` };
  }
  return { plot: result.data, error: null };
}

export function decodeTutorPlot(value: unknown) {
  if (typeof value !== "string" || value.length > 12000) return validateTutorPlot(null);
  try { return validateTutorPlot(JSON.parse(value)); } catch { return validateTutorPlot(null); }
}

export function tutorPlotFunctions(plot: TutorPlot): ComparisonFunction[] {
  return plot.funcoes.map((expression, slot) => ({ slot, expression }));
}