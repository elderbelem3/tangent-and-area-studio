import { describe, expect, it } from "vitest";
import { asciiToMathjs, templateToLatex } from "@/lib/math-blocks";
describe("math blocks translation", () => {
  it("power block becomes a placeholder exponent", () => expect(templateToLatex("^()")).toBe("^{#0}"));
  it("fraction block has two boxes", () => expect(templateToLatex("()/()")).toBe("\\frac{#0}{#?}"));
  it.each(["log", "ln", "log10", "sin", "cos", "tan", "sqrt", "cbrt", "exp", "abs"])("%s inserts ordinary parentheses without placeholder boxes or superscripts", (name) => {
    const latex = templateToLatex(`${name}()`);
    expect(latex).toContain("\\left(\\right)");
    expect(latex).not.toMatch(/#|\^|_/);
  });
  it("translates editor output to parser syntax", () => {
    expect(asciiToMathjs("s q r t (2)+l o g10 (100)+sin (x)")).toBe("sqrt(2)+log10(100)+sin(x)");
    expect(asciiToMathjs("log_(10)(x)+|x|")).toBe("log10(x)+abs(x)");
    expect(asciiToMathjs("ln(x)+oo")).toBe("log(x)+Infinity");
  });
});
