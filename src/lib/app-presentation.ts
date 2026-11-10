export type AppSlide = {
  title: string;
  subtitle: string;
  stages: [string, string, string];
  points: { title: string; text: string }[];
  code: string;
  source: string;
};

/** Educational content only: opening the deck does not run calculation engines. */
export const APP_SLIDES: AppSlide[] = [
  {
    title: "Da digitação à expressão",
    subtitle: "Captura do input matemático e usabilidade mobile",
    stages: ["Toque ou digitação", "Editor matemático", "Expressão em texto"],
    points: [
      { title: "Uma fonte de verdade", text: "MathLive apresenta potências, raízes e frações; a conversão produz o texto que os módulos usam no cálculo. Limites e Integrais também usam campos comuns." },
      { title: "Cursor e teclado", text: "Atalhos inserem estruturas na posição do cursor. Foco por toque, teclado nativo e Backspace preservam a edição contínua no celular." },
      { title: "Estado preservado", text: "useModuleState mantém as entradas durante a troca de abas. Gestos do gráfico ficam no gráfico, sem bloquear a rolagem da página." },
    ],
    code: "Entrada visual: x² + 3x\nExpressão interna: x^2 + 3x",
    source: "MathBlockInput · math-blocks · Lab · module-state",
  },
  {
    title: "Uma expressão que o motor entende",
    subtitle: "Parsing de expoentes, parênteses e logaritmos",
    stages: ["Normalização", "Parsing / compilação", "Avaliação em x"],
    points: [
      { title: "Sintaxe preparada", text: "normalize reconhece multiplicação implícita, como 3x, sem dividir nomes como log10. Potências usam ^ e parênteses agrupam operações." },
      { title: "Bases explícitas", text: "ln(x) vira log(x); log_10(x) vira log10(x). Bases arbitrárias são traduzidas para log(argumento, base)." },
      { title: "Erros amigáveis", text: "mathjs compila a expressão; parseFn trata falhas de sintaxe e avaliação. Valores não reais ou não finitos não são desenhados como pontos válidos." },
    ],
    code: "compile(normalize(expr))\ncode.evaluate({ x, e: Math.E, pi: Math.PI })",
    source: "calc · normalizeLogarithms · parseFn · mathjs",
  },
  {
    title: "Análise antes da conclusão",
    subtitle: "O algoritmo de resolução analítica e a Luz Negra",
    stages: ["Domínio e casos especiais", "Método disponível", "Etapas e sobreposições UV"],
    points: [
      { title: "Verificar as hipóteses", text: "Restrições de domínio, constantes e singularidades são tratadas antes das conclusões. Um canto como |x| em zero não recebe uma tangente finita." },
      { title: "Explicar o método real", text: "Derivadas usam regras reconhecidas; limites comparam aproximações laterais; primitivas são verificadas e integrais informam o método usado. Resultados numéricos não equivalem a provas gerais." },
      { title: "Revelação, não outro motor", text: "A Luz Negra revela etapas e anotações locais por CSS no Quadro Negro, sem recalcular o gráfico ao alternar. Casos não verificados recebem ressalvas." },
    ],
    code: "f(x) = x²  →  f′(x) = 2x\nf(x) = 5   →  f′(x) = 0",
    source: "domain · analysis · derivative-results · uv-steps · UvStepsPanel",
  },
  {
    title: "Pontos sem ligações falsas",
    subtitle: "Amostragem de coordenadas e clipping de assíntotas",
    stages: ["Malha de valores x", "Avaliação e cortes", "Segmentos independentes"],
    points: [
      { title: "Resolução adaptativa", text: "A malha cresce ao afastar o zoom, até um orçamento limitado pela quantidade de curvas. O intervalo visível determina os valores de x amostrados." },
      { title: "Interromper o traçado", text: "Saltos maiores que três vezes a altura visível de Y, valores não finitos e indícios de polos quebram a ligação. Uma mudança de sinal isolada não basta: raízes contínuas permanecem ligadas." },
      { title: "Recortar e reiniciar", text: "Pontos muito afastados são omitidos. SVG usa subcaminhos independentes; Recharts usa separadores nulos por curva e reinicia no próximo ponto válido." },
    ],
    code: "Math.abs(y2 - y1) > 3 * (yMax - yMin)\n→ cortar a ligação, preservar o próximo ponto válido",
    source: "plot-sampling · sampleCurve · curveSegments · curveChartRows",
  },
  {
    title: "Do dado ao plano cartesiano",
    subtitle: "Renderização gráfica e créditos institucionais",
    stages: ["Coordenadas calculadas", "Escalas e eixos", "Curvas e anotações"],
    points: [
      { title: "Dois renderizadores 2D", text: "ComparisonPlot / Recharts compara curvas em Funções e Derivadas; Plot / SVG atende Limites e Integrais. Ambos compartilham amostragem e navegação." },
      { title: "Escalas sincronizadas", text: "Zoom e pan atualizam o domínio, os ticks e o cursor em coordenadas matemáticas. Funções de duas variáveis usam o Smart Canvas 3D, carregado apenas no navegador." },
      { title: "UniCatólica do RN", text: "AP2 de Cálculo Diferencial e Integral. Professora: Flaviana Moreira de Souza Amorim. Alunos: Elder Belem da Silva Terceiro, Nathan Emanuel Silva de Paiva e Erick Emanoel Oliveria Araujo." },
    ],
    code: "expressão → coordenadas → escala → gráfico\nCalculusLab · Cálculo 1 e 2 · UniCatólica do RN",
    source: "ComparisonPlot · Plot · usePlotViewport · Smart3DCanvas · Créditos",
  },
];

export function presentationSlide(value: unknown): number | undefined {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= APP_SLIDES.length ? number : undefined;
}

export function movePresentationSlide(current: number, delta: number): number {
  return Math.max(1, Math.min(APP_SLIDES.length, current + delta));
}