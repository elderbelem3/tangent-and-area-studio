import { describe, expect, it } from "vitest";
import { asciiToMathjs, blockTemplateLatex, templateToLatex } from "@/lib/math-blocks";
import { normalizeLogarithms, parseFn } from "@/lib/calc";

describe("math blocks translation", () => {
  it("power block becomes a placeholder exponent", () => expect(templateToLatex("^()")).toBe("^{#0}"));
  it("fraction block has two boxes", () => expect(templateToLatex("()/()")).toBe("\\frac{#0}{#?}"));
  it.each(["sin", "cos", "tan", "sec", "csc", "asin", "acos", "atan", "exp"])("%s inserts ordinary parentheses without placeholder boxes or superscripts", (name) => {
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

describe("Potências tab block templates", () => {
  it("x² without a base inserts an empty base field with superscript 2", () => {
    expect(blockTemplateLatex("^2", false)).toBe("\\placeholder{}^{2}");
  });
  it("x² after a typed base only adds the exponent", () => {
    expect(blockTemplateLatex("^2", true)).toBe("^{2}");
  });
  it("xʸ without a base inserts base and exponent fields", () => {
    expect(blockTemplateLatex("^()", false)).toBe("\\placeholder{}^{\\placeholder{}}");
  });
  it("xʸ after a typed base only adds the exponent field", () => {
    expect(blockTemplateLatex("^()", true)).toBe("^{\\placeholder{}}");
  });
  it("√x inserts a radical with an editable field inside", () => {
    expect(blockTemplateLatex("sqrt()", false)).toBe("\\sqrt{\\placeholder{}}");
  });
  it("ⁿ√x inserts index and radicand fields", () => {
    expect(blockTemplateLatex("nthroot", false)).toBe("\\sqrt[\\placeholder{}]{\\placeholder{}}");
  });
  it("ln inserts an editable field inside parentheses", () => {
    expect(blockTemplateLatex("log()", false)).toBe("\\ln\\left(\\placeholder{}\\right)");
  });
  it("log₁₀ keeps the base 10 subscript with an editable argument", () => {
    expect(blockTemplateLatex("log10()", false)).toBe("\\log_{10}\\left(\\placeholder{}\\right)");
  });
  it("logₓ inserts base and argument fields", () => {
    expect(blockTemplateLatex("logb()", false)).toBe("\\log_{\\placeholder{}}\\left(\\placeholder{}\\right)");
  });
  it("|x| inserts vertical bars with an editable field between them", () => {
    expect(blockTemplateLatex("abs()", false)).toBe("\\left|\\placeholder{}\\right|");
  });
  it("buttons outside the Potências tab keep the ordinary behavior", () => {
    expect(blockTemplateLatex("sin()", false)).toBeNull();
    expect(blockTemplateLatex("exp()", false)).toBeNull();
  });
});

describe("variable-index roots and arbitrary log bases", () => {
  it("converts root(n)(x) to nthRoot, keeping cbrt for index 3", () => {
    expect(asciiToMathjs("root(4)(16)")).toBe("nthRoot(16, 4)");
    expect(asciiToMathjs("root(3)(x)")).toBe("cbrt(x)");
    expect(asciiToMathjs("root(5)(x+2)")).toBe("nthRoot(x+2, 5)");
  });
  it("evaluates variable-index roots", () => {
    expect(parseFn(asciiToMathjs("root(4)(x)")).fn?.(16)).toBeCloseTo(2, 12);
    expect(parseFn(asciiToMathjs("root(3)(x)")).fn?.(27)).toBeCloseTo(3, 12);
  });
  it("normalizes arbitrary log bases to log(arg, base)", () => {
    expect(normalizeLogarithms("log_3(81)")).toBe("log(81, 3)");
    expect(normalizeLogarithms("log_x(25)")).toBe("log(25, x)");
    expect(normalizeLogarithms("log_2(x)")).toBe("log2(x)");
    expect(normalizeLogarithms("log_10(x)")).toBe("log10(x)");
  });
  it("evaluates arbitrary-base logarithms", () => {
    expect(parseFn(normalizeLogarithms("log_3(x)")).fn?.(81)).toBeCloseTo(4, 12);
    expect(parseFn(normalizeLogarithms("log_x(25)")).fn?.(5)).toBeCloseTo(2, 12);
  });
});
