import katex from "katex";

export function MathFormula({ formula }: { formula: string }) {
  const html = katex.renderToString(formula, {
    displayMode: true,
    throwOnError: true,
    strict: "ignore",
    trust: false,
    output: "htmlAndMathml",
  });
  return <div className="math-formula min-w-0 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
}