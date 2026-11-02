import { describe, expect, it } from "vitest";
import { tutorRequestSchema } from "@/lib/tutor";

describe("Contextual tutor requests", () => {
  const step = { title: "Regra do produto", explanation: "Derivar os fatores", formula: "(uv)'=u'v+uv'" };
  const solution = { title: "Derivada", steps: [step], conclusion: step };
  it("preserves problem, selected step and previous questions", () => {
    const request = { problem: "Derive x^2 sin(x)", context: { solution, stepIndex: 0, question: "Por que usar produto?", previous: [] } };
    expect(tutorRequestSchema.parse(request)).toEqual(request);
  });
  it("rejects a step outside the solution", () => {
    expect(tutorRequestSchema.safeParse({ problem: "Derive x^2", context: { solution, stepIndex: 2, question: "Explique", previous: [] } }).success).toBe(false);
  });
});