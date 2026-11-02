<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## UI architecture
- Keep CalculusLab visual tokens in src/styles.css and reuse Lab primitives and the shared Button across modules, so all six pages stay consistent without changing calculation logic.
- Keep learning content as typed course units independent of the Aprenda view, and render its LaTeX through the shared KaTeX MathFormula with MathML output, so academic content stays maintainable and accessible.
- Share slot-based comparison state, the function editor and Recharts comparison plot between Functions and Derivatives so removal preserves curve identity and colors; keep the existing Plot for Limits and Integrals.
- Keep the calculus tutor's AI calls inside a TanStack server function using the Gateway SDK with validated structured output; store its explicitly session-only history in sessionStorage and use shared KaTeX rendering for formulas.
- Apply the optional chalkboard theme through root CSS tokens and a hydration-safe header toggle; keep decorative texture/tray theme-only and use shared SVG axis/annotation primitives without changing calculation results.
- Transfer tutor graph suggestions through a validated Functions search parameter; verify expressions with the shared mathjs parser and keep legacy session solutions readable when graph fields are absent.
- Blacklight is a chalkboard-only root class (html.blacklight) persisted beside the theme; chalk annotations, UV overlays, the white-chalk summary and the UV step-by-step panel (from lib/analysis) are always rendered and swapped via CSS so toggling never re-renders charts.
