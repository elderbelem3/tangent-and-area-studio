export const functionExamples = [
  { label: "Quadrática", expression: "x^2 - 4x - 5" },
  { label: "Trigonométrica", expression: "sin(x)" },
  { label: "Exponencial", expression: "2^x" },
  { label: "Cúbica", expression: "x^3 - 3x" },
  { label: "Racional", expression: "(2x + 3) / (x^2 - 1)" },
  { label: "Parabolóide 3D", expression: "x^2 + y^2" },
] as const;

export const limitExamples = [
  { label: "Limite com fatoração", expression: "(x^2 - 4) / (x - 2)", point: "2" },
  { label: "Limite com raiz (racionalização)", expression: "(sqrt(x+1) - 1) / x", point: "0" },
  { label: "Limite fundamental trigonométrico", expression: "sin(x) / x", point: "0" },
] as const;

export const derivativeExamples = [
  { label: "Polinomial / Potência", expression: "x^3 - 4x" },
  { label: "Trigonométrica", expression: "sin(x)" },
  { label: "Regra da cadeia (Composta)", expression: "sin(3x)" },
] as const;

export const integralExamples = [
  { label: "Integral imediata por substituição", expression: "2x * cos(x^2)", a: "0", b: "1" },
  // Avoid the pole at x = 1 when loading this definite-integral example.
  { label: "Fração racional (frações parciais)", expression: "(2x + 3) / (x^3 - 1)", a: "0", b: "0.5" },
  { label: "Exponencial", expression: "e^x", a: "0", b: "1" },
] as const;