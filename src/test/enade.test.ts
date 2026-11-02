import { describe, it, expect } from "vitest";
import { isEnadeRequest } from "@/lib/enade";
describe("ENADE command", () => {
  it("recognizes typed requests", () => { expect(isEnadeRequest("Quero uma questão do Enade")).toBe(true); expect(isEnadeRequest("gerar questão ENADE de integrais")).toBe(true); });
  it("ignores ordinary problems", () => { expect(isEnadeRequest("Calcule a derivada de x^2")).toBe(false); });
});
