import katex from "katex";
import { memo } from "react";

// Bounded cache also avoids regenerating identical accessible markup on revisit.
const formulaCache = new Map<string, string>();

export const MathFormula = memo(function MathFormula({ formula }: { formula: string }) {
  let html = formulaCache.get(formula);
  if (html === undefined) {
    html = katex.renderToString(formula, {
    displayMode: true,
    throwOnError: true,
    strict: "ignore",
    trust: false,
    output: "htmlAndMathml",
    });
    if (formulaCache.size >= 300) {
      const oldest = formulaCache.keys().next().value;
      if (oldest !== undefined) formulaCache.delete(oldest);
    }
    formulaCache.set(formula, html);
  }
  return <div className="math-formula min-w-0 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
});