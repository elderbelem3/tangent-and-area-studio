import type { LearnModule, Topic } from "@/lib/learn-content";

export const CALC1_EXTRA: Topic[] = [
  {
    id: "aprox-linear",
    title: "Aproximação linear e diferenciais",
    theory: [
      "Perto de um ponto a onde f é diferenciável, o gráfico se confunde com sua reta tangente. A linearização L(x) = f(a) + f′(a)(x − a) aproxima f(x) para x próximo de a; o erro tende a zero mais rápido que |x − a|.",
      "A diferencial dy = f′(x) dx estima a variação Δy = f(x + dx) − f(x) causada por um pequeno acréscimo dx. Ela é útil para propagar erros de medida: o erro relativo dy/y indica a precisão do resultado.",
    ],
    formulas: ["L(x)=f(a)+f'(a)(x-a)", "dy=f'(x)\\,dx,\\qquad \\Delta y\\approx dy"],
    theorem: { title: "Qualidade da aproximação", text: "Se f″ existe perto de a, então |f(x) − L(x)| ≤ (M/2)(x − a)², em que M limita |f″| no intervalo. Quanto menor a curvatura, melhor a aproximação." },
    example: {
      problem: "Use a linearização de f(x) = √x em a = 4 para estimar √4,1.",
      steps: ["f(4) = 2 e f′(x) = 1/(2√x), logo f′(4) = 1/4.", "L(x) = 2 + (x − 4)/4.", "L(4,1) = 2 + 0,1/4 = 2,025.", "O valor real é √4,1 ≈ 2,024846; o erro é cerca de 0,00015."],
      answer: "\\sqrt{4{,}1}\\approx L(4{,}1)=2{,}025",
    },
    warning: "A aproximação piora longe de a; não use a reta tangente para extrapolar valores distantes.",
    tip: { module: "Derivadas", text: "Use sqrt(x) em x₀ = 4: a reta tangente y = 0,25x + 1 é a linearização L(x)." },
  },
  {
    id: "otimizacao-aplicada",
    title: "Otimização aplicada: modelagem de máximos e mínimos",
    theory: [
      "Problemas reais de otimização seguem um roteiro: identificar a grandeza a otimizar, nomear variáveis, escrever a restrição, reduzir a função objetivo a uma variável e determinar o domínio físico admissível.",
      "Em um intervalo fechado, compare os valores nos pontos críticos e nas extremidades (Teorema de Weierstrass). Em intervalos abertos, use o teste da primeira ou da segunda derivada e justifique que o extremo local é global.",
    ],
    formulas: ["V(x)=x\\,(L-2x)^2,\\quad 0<x<\\tfrac L2", "V'(x)=0\\ \\Rightarrow\\ x=\\tfrac L6"],
    example: {
      problem: "Uma folha quadrada de lado 12 tem quadrados de lado x recortados nos cantos para formar uma caixa sem tampa. Qual x maximiza o volume?",
      steps: ["A base mede 12 − 2x e a altura x: V(x) = x(12 − 2x)², com 0 < x < 6.", "V′(x) = (12 − 2x)² − 4x(12 − 2x) = (12 − 2x)(12 − 6x).", "Os zeros são x = 6 (fora do domínio aberto) e x = 2.", "V′ > 0 em (0, 2) e V′ < 0 em (2, 6): x = 2 é máximo global.", "V(2) = 2 · 8² = 128."],
      answer: "x=2,\\qquad V_{\\max}=128",
    },
    tip: { module: "Funções", text: "Plote x*(12-2*x)^2 de 0 a 6 e localize o máximo em (2, 128)." },
  },
];

export const CALC2_EXTRA: LearnModule = {
  id: "avancado",
  course: "Cálculo 2",
  tag: "Unidade 08",
  title: "Tópicos avançados",
  subtitle: "Impróprias, Taylor, polares e cálculo vetorial",
  topics: [
    {
      id: "improprias",
      title: "Integrais impróprias: convergência e divergência",
      theory: [
        "Uma integral é imprópria quando o intervalo é infinito (tipo 1) ou o integrando tem descontinuidade infinita no intervalo (tipo 2). Ela é definida como um limite de integrais próprias.",
        "Se o limite existe e é finito, a integral converge; caso contrário diverge. Para descontinuidades internas, divide-se a integral no ponto problemático e exige-se a convergência de cada parte.",
      ],
      formulas: ["\\int_a^{\\infty}f(x)\\,dx=\\lim_{t\\to\\infty}\\int_a^{t}f(x)\\,dx", "\\int_1^{\\infty}\\frac{dx}{x^p}\\ \\text{converge}\\iff p>1", "\\int_0^{1}\\frac{dx}{x^p}\\ \\text{converge}\\iff p<1"],
      theorem: { title: "Teste da comparação", text: "Se 0 ≤ f(x) ≤ g(x) para x ≥ a e ∫g converge, então ∫f converge; se ∫f diverge, ∫g também diverge." },
      example: {
        problem: "Decida se ∫₁^∞ 1/x² dx converge e calcule seu valor.",
        steps: ["Escreva como limite: o limite, quando t → ∞, de ∫₁ᵗ x⁻² dx.", "A antiderivada é −1/x, logo ∫₁ᵗ x⁻² dx = 1 − 1/t.", "Quando t → ∞, 1/t → 0.", "O limite é finito: a integral converge."],
        answer: "\\int_1^{\\infty}\\frac{dx}{x^2}=1",
      },
      warning: "∫₋₁¹ 1/x² dx não vale −2: o integrando explode em x = 0 e a integral diverge.",
      tip: { module: "Integrais", text: "Integre 1/x^2 de 1 a 100: o valor 0,99 se aproxima de 1 conforme b cresce." },
    },
    {
      id: "taylor",
      title: "Séries de Taylor e Maclaurin",
      theory: [
        "Se f tem derivadas de todas as ordens em a, sua série de Taylor é Σ f⁽ⁿ⁾(a)(x − a)ⁿ/n!. Com a = 0, chama-se série de Maclaurin. O polinômio de grau n truncado é Tₙ(x).",
        "A série representa f no seu intervalo de convergência quando o resto Rₙ(x) = f(x) − Tₙ(x) tende a zero. Para eˣ, sin x e cos x isso vale para todo x real.",
      ],
      formulas: ["f(x)=\\sum_{n=0}^{\\infty}\\frac{f^{(n)}(a)}{n!}(x-a)^n", "e^x=\\sum_{n=0}^{\\infty}\\frac{x^n}{n!}=1+x+\\frac{x^2}{2!}+\\cdots", "\\sin x=x-\\frac{x^3}{3!}+\\frac{x^5}{5!}-\\cdots", "|R_n(x)|\\le\\frac{M\\,|x-a|^{n+1}}{(n+1)!}"],
      example: {
        problem: "Encontre a série de Maclaurin de sin x e use T₃ para estimar sin(0,1).",
        steps: ["As derivadas em 0 ciclam: sin 0 = 0, cos 0 = 1, −sin 0 = 0, −cos 0 = −1.", "Só as potências ímpares sobrevivem, com sinais alternados.", "sin x = x − x³/6 + x⁵/120 − ⋯", "T₃(0,1) = 0,1 − 0,001/6 ≈ 0,0998333.", "Pelo resto, o erro é no máximo 0,1⁵/120 ≈ 8 · 10⁻⁸."],
        answer: "\\sin x=\\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n+1}}{(2n+1)!},\\quad \\sin(0{,}1)\\approx0{,}0998333",
      },
      tip: { module: "Funções", text: "Plote sin(x) e adicione g(x) = x - x^3/6 + x^5/120: as curvas coincidem perto de 0 e se separam longe." },
    },
    {
      id: "polares",
      title: "Curvas paramétricas e coordenadas polares",
      theory: [
        "Uma curva paramétrica é dada por x = x(t), y = y(t). Sua inclinação é dy/dx = (dy/dt)/(dx/dt) e o comprimento de arco é ∫√(x′² + y′²) dt.",
        "Em coordenadas polares um ponto é (r, θ), com x = r cos θ e y = r sin θ; inversamente r² = x² + y² e tan θ = y/x. Curvas clássicas: cardioide r = a(1 + cos θ) e rosácea r = cos(nθ), com n pétalas se n é ímpar e 2n se n é par.",
        "A área de uma região polar usa setores circulares infinitesimais: A = ½∫r² dθ. O comprimento de arco é ∫√(r² + (dr/dθ)²) dθ.",
      ],
      formulas: ["x=r\\cos\\theta,\\quad y=r\\sin\\theta,\\quad r^2=x^2+y^2", "A=\\frac12\\int_{\\alpha}^{\\beta}r(\\theta)^2\\,d\\theta", "L=\\int_{\\alpha}^{\\beta}\\sqrt{r^2+\\left(\\frac{dr}{d\\theta}\\right)^2}\\,d\\theta"],
      example: {
        problem: "Calcule a área delimitada pela cardioide r = 1 + cos θ.",
        steps: ["A curva se fecha para θ ∈ [0, 2π].", "A = ½∫₀^{2π} (1 + cos θ)² dθ = ½∫₀^{2π} (1 + 2cos θ + cos²θ) dθ.", "∫₀^{2π} cos θ dθ = 0 e ∫₀^{2π} cos²θ dθ = π.", "A = ½(2π + 0 + π) = 3π/2."],
        answer: "A=\\frac{3\\pi}{2}\\approx4{,}712389",
      },
      tip: { module: "Integrais", text: "Use 0.5*(1+cos(x))^2 de 0 a 2π (x faz o papel de θ) e confira 4,712389." },
    },
    {
      id: "vetorial",
      title: "Cálculo vetorial: gradiente, derivada direcional e curvas de nível",
      theory: [
        "O gradiente ∇f = (f_x, f_y) reúne as derivadas parciais. A derivada direcional na direção do vetor unitário u é D_u f = ∇f · u: a taxa de variação de f ao se mover nessa direção.",
        "Como ∇f · u = |∇f| cos φ, a maior taxa de crescimento ocorre na direção do gradiente e vale |∇f|; na direção oposta f decresce mais rápido; perpendicularmente a variação é nula.",
        "Por isso o gradiente é perpendicular às curvas de nível f(x, y) = k: ao longo delas f não varia.",
      ],
      formulas: ["\\nabla f=\\left(\\frac{\\partial f}{\\partial x},\\frac{\\partial f}{\\partial y}\\right)", "D_{\\mathbf u}f=\\nabla f\\cdot\\mathbf u,\\quad |\\mathbf u|=1", "\\max_{\\mathbf u}D_{\\mathbf u}f=|\\nabla f|"],
      example: {
        problem: "Para f(x, y) = x² + y², calcule ∇f(1, 2) e a derivada direcional na direção de v = (3, 4).",
        steps: ["f_x = 2x e f_y = 2y, logo ∇f(1, 2) = (2, 4).", "Normalize v: u = (3/5, 4/5).", "D_u f = 2 · 3/5 + 4 · 4/5 = 22/5 = 4,4.", "A taxa máxima é |∇f| = √20 ≈ 4,472, na direção radial.", "As curvas de nível são círculos x² + y² = k; o gradiente aponta para fora, perpendicular a eles."],
        answer: "\\nabla f(1,2)=(2,4),\\qquad D_{\\mathbf u}f=\\frac{22}{5}",
      },
      tip: { module: "Funções", text: "Digite x^2+y^2 para ver o paraboloide; com Luz Negra, a seta do gradiente aparece na superfície." },
    },
  ],
};
