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
- Keep Code Mode read-only and opt-in: renderers publish bounded previews of their actual sampled inputs through useRenderTrace; deferred inspection never resamples curves or writes module state, preserving calculation and typing performance.
- Keep the app free of AI handlers and tools; retain a redirect-only legacy /ia route and isolate tour theme events from calculation modules so local tools remain independent.
- Keep the code walkthrough as typed educational content separate from its route and reachable through the shared help menu; this documents each module without importing calculation engines into the guide.
- Share structural domain restrictions in lib/domain across analysis, limits and integration; split monotonicity at domain boundaries and reject unverified improper integrals so off-grid poles cannot produce ordinary integral values.
- Use the shared mathjs-to-KaTeX expression formatter for analytic formulas, and keep definite integral values and their displayed method in one result so explanations match the calculation.
- Detect real constants structurally through the shared calculus helper before analytic root searches; represent no isolated roots or stationary points and explain the identically-zero case separately to avoid enumerating continua.
- Share mathematical completion candidates between plain and MathLive fields; replace only the cursor-adjacent token and keep inserted expressions parser-compatible.
- Share curve-count-aware bounded sampling and discontinuity checks across both 2D renderers; render independent SVG paths or curve-specific Recharts null separators preserving restart points, coalesce gestures per frame, and settle expensive analysis after gestures to avoid false pole connections and lag without changing calculus results.
- Optimize tab navigation with TanStack route preloading and bounded pure-render caches rather than frozen router contexts; keep inactive charts unmounted to preserve routing, sizing and graph-transfer behavior.
- Keep official study presets in a shared typed module consumed by all four calculus routes; colocate each preset's necessary study parameters so selecting it produces a meaningful calculation.
- Share domain-space navigation through usePlotViewport and d3-zoom across both 2D renderers; resample curves and transform overlays in data coordinates so gestures, ticks and crosshairs remain synchronized.
- Keep CalculusLab visual tokens in src/styles.css and reuse Lab primitives and the shared Button across modules, so all six pages stay consistent without changing calculation logic.
- Keep learning content as typed course units independent of the Aprenda view, and render its LaTeX through the shared KaTeX MathFormula with MathML output, so academic content stays maintainable and accessible.
- Share slot-based comparison state, the function editor and Recharts comparison plot between Functions and Derivatives so removal preserves curve identity and colors; keep the existing Plot for Limits and Integrals.
- Apply the optional chalkboard theme through root CSS tokens and a hydration-safe header toggle; keep decorative texture/tray theme-only and use shared SVG axis/annotation primitives without changing calculation results.
- Blacklight is a chalkboard-only root class (html.blacklight) persisted beside the theme; chalk annotations, UV overlays, the white-chalk summary and the UV step-by-step panel (lib/analysis for Funções, lib/uv-steps + UvStepsPanel/UvOverlays for Limites, Derivadas, Integrais) are always rendered and swapped via CSS so toggling never re-renders charts.
- 3D Smart Canvas (f(x,y) surfaces in Funções, solids of revolution in Integrais) is a client-only lazy R3F component that reads the theme via useLabTheme; chalkboard renders wireframe lines only, blacklight adds UV overlays, labels are canvas-texture sprites (drei Html caused unmount errors).
- Module inputs persist across tab navigation via useModuleState (in-memory store, empty on load so SSR/hydration match); new module inputs should use it instead of useState. The guided tour requests theme changes through lib/theme-events.
- Funções/Derivadas function inputs use the client-only MathLive editor (MathBlockInput); lib/math-blocks translates function templates to ordinary parentheses and structural templates to placeholders, and editor ascii-math back to mathjs syntax, so the plain expression string stays the single source of truth.
- Keep MathLive's scientific keyboard manual while enabling its native keyboard sink with inputmode=text; restore touch focus within the user gesture and confine gesture interception to plot areas so phones can type and scroll without duplicate keyboards.
- Keep derivative evaluation points keyed by comparison slot and pass them to the shared plot; expose verified symbolic primitives independently of bounds and render all result expressions through MathExpression to preserve calculation and presentation consistency.
