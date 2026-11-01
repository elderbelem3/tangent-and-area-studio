export type Topic = {
  id: string;
  title: string;
  theory: string[];
  formulas: string[];
  example: { problem: string; steps: string[]; answer: string };
  tip: { module: string; text: string };
};
export type LearnModule = { id: string; tag: string; title: string; subtitle: string; topics: Topic[] };

export const LEARN: LearnModule[] = [
  {
    id: "calc1",
    tag: "Módulo 1",
    title: "Cálculo 1",
    subtitle: "Funções, limites, continuidade e derivadas",
    topics: [
      {
        id: "funcoes",
        title: "Funções",
        theory: [
          "Uma função f associa a cada x do domínio um único valor f(x). O domínio é o conjunto de entradas permitidas; a imagem é o conjunto de saídas obtidas.",
          "Famílias importantes: polinomiais, racionais, exponenciais, logarítmicas e trigonométricas. Cada uma tem um formato de gráfico característico.",
        ],
        formulas: ["f(x) = ax² + bx + c", "Dom(1/x) = ℝ − {0}", "Dom(√x) = [0, +∞)"],
        example: {
          problem: "Encontre o domínio de f(x) = 1/(x − 2).",
          steps: ["O denominador não pode ser zero.", "x − 2 ≠ 0  ⇒  x ≠ 2."],
          answer: "Dom(f) = ℝ − {2}",
        },
        tip: { module: "Funções", text: "Digite 1/(x-2) e observe a assíntota vertical em x = 2 no gráfico e os valores indefinidos na tabela." },
      },
      {
        id: "limites",
        title: "Limites e Continuidade",
        theory: [
          "O limite lim x→a f(x) = L descreve o valor do qual f(x) se aproxima quando x chega perto de a, sem precisar que f(a) exista.",
          "O limite existe quando os limites laterais (pela esquerda e pela direita) são iguais. f é contínua em a se f(a) existe e lim x→a f(x) = f(a).",
        ],
        formulas: ["lim x→0 sin(x)/x = 1", "lim x→∞ (1 + 1/x)ˣ = e", "Contínua em a ⇔ lim x→a f(x) = f(a)"],
        example: {
          problem: "Calcule lim x→2 (x² − 4)/(x − 2).",
          steps: ["Substituir direto dá 0/0 (indeterminação).", "Fatore: x² − 4 = (x − 2)(x + 2).", "Simplifique: (x − 2)(x + 2)/(x − 2) = x + 2.", "Substitua x = 2: 2 + 2."],
          answer: "O limite vale 4",
        },
        tip: { module: "Limites", text: "Use f(x) = (x^2-4)/(x-2) e a = 2. Compare os limites pela esquerda e pela direita." },
      },
      {
        id: "regras",
        title: "Derivadas: regras de derivação",
        theory: [
          "A derivada f'(x) mede a taxa de variação instantânea de f. É definida pelo limite do quociente de Newton.",
          "Na prática usamos regras: potência, produto, quociente e cadeia.",
        ],
        formulas: [
          "f'(x) = lim h→0 [f(x+h) − f(x)] / h",
          "(xⁿ)' = n·xⁿ⁻¹",
          "(u·v)' = u'v + uv'",
          "(u/v)' = (u'v − uv') / v²",
          "[f(g(x))]' = f'(g(x))·g'(x)",
          "(sin x)' = cos x · (cos x)' = −sin x · (eˣ)' = eˣ · (ln x)' = 1/x",
        ],
        example: {
          problem: "Derive f(x) = x²·sin(x).",
          steps: ["Regra do produto com u = x², v = sin(x).", "u' = 2x e v' = cos(x).", "f'(x) = 2x·sin(x) + x²·cos(x)."],
          answer: "f'(x) = 2x·sin(x) + x²·cos(x)",
        },
        tip: { module: "Derivadas", text: "Digite x^2*sin(x) e confira o valor numérico de f'(x₀) com sua resposta calculada à mão." },
      },
      {
        id: "tangente",
        title: "Reta tangente e taxa de variação",
        theory: [
          "A derivada em x₀ é o coeficiente angular da reta tangente ao gráfico no ponto (x₀, f(x₀)).",
          "Em problemas aplicados, f'(t) representa velocidade, taxa de crescimento, custo marginal etc.",
        ],
        formulas: ["y − f(x₀) = f'(x₀)·(x − x₀)", "Taxa média = [f(b) − f(a)] / (b − a)"],
        example: {
          problem: "Reta tangente a f(x) = x² em x₀ = 3.",
          steps: ["f(3) = 9.", "f'(x) = 2x ⇒ f'(3) = 6.", "y − 9 = 6(x − 3) ⇒ y = 6x − 9."],
          answer: "y = 6x − 9",
        },
        tip: { module: "Derivadas", text: "Use f(x) = x^2 com x₀ = 3: o app desenha a reta tangente e mostra a inclinação 6." },
      },
      {
        id: "aplicacoes",
        title: "Aplicações de derivadas",
        theory: [
          "Pontos críticos (f'(x) = 0 ou inexistente) são candidatos a máximos e mínimos.",
          "Teste da 2ª derivada: f'' > 0 indica mínimo local (concavidade para cima); f'' < 0 indica máximo local. Otimização usa essas ideias.",
        ],
        formulas: ["f'(c) = 0 → ponto crítico", "f''(c) > 0 → mínimo · f''(c) < 0 → máximo"],
        example: {
          problem: "Extremos locais de f(x) = x³ − 3x.",
          steps: ["f'(x) = 3x² − 3 = 0 ⇒ x = ±1.", "f''(x) = 6x.", "f''(−1) = −6 < 0 ⇒ máximo: f(−1) = 2.", "f''(1) = 6 > 0 ⇒ mínimo: f(1) = −2."],
          answer: "Máx. local em (−1, 2); mín. local em (1, −2)",
        },
        tip: { module: "Funções", text: "Clique no atalho x^3 - 3x e veja o pico em x = −1 e o vale em x = 1." },
      },
    ],
  },
  {
    id: "integrais",
    tag: "Módulo 2",
    title: "Cálculo 1 e 2",
    subtitle: "Integrais indefinidas e métodos de integração",
    topics: [
      {
        id: "indefinida",
        title: "Integral indefinida",
        theory: [
          "A integral indefinida ∫ f(x) dx é a família de antiderivadas F(x) + C, onde F'(x) = f(x).",
          "A constante C aparece porque derivadas de constantes valem zero.",
        ],
        formulas: ["∫ xⁿ dx = xⁿ⁺¹/(n+1) + C  (n ≠ −1)", "∫ 1/x dx = ln|x| + C", "∫ eˣ dx = eˣ + C", "∫ sin x dx = −cos x + C · ∫ cos x dx = sin x + C"],
        example: {
          problem: "Calcule ∫ (3x² + 2x − 5) dx.",
          steps: ["Integre termo a termo.", "∫3x² dx = x³; ∫2x dx = x²; ∫−5 dx = −5x."],
          answer: "x³ + x² − 5x + C",
        },
        tip: { module: "Derivadas", text: "Derive sua resposta x^3 + x^2 - 5x no módulo de Derivadas: o resultado deve ser 3x² + 2x − 5." },
      },
      {
        id: "substituicao",
        title: "Método da substituição",
        theory: [
          "É a regra da cadeia ao contrário. Escolha u = g(x) cuja derivada g'(x) apareça no integrando.",
          "Troque dx por du/g'(x), integre em u e volte para x.",
        ],
        formulas: ["∫ f(g(x))·g'(x) dx = ∫ f(u) du,  u = g(x)"],
        example: {
          problem: "Calcule ∫ 2x·cos(x²) dx.",
          steps: ["Seja u = x² ⇒ du = 2x dx.", "A integral vira ∫ cos(u) du = sin(u) + C.", "Volte para x: sin(x²) + C."],
          answer: "sin(x²) + C",
        },
        tip: { module: "Integrais", text: "Confira com valores: ∫ de 0 a 1 de 2x*cos(x^2) deve dar sin(1) ≈ 0,8415." },
      },
      {
        id: "partes",
        title: "Integração por partes",
        theory: [
          "Vem da regra do produto. Útil quando o integrando é produto de funções de tipos diferentes.",
          "Regra LIATE para escolher u: Logarítmica, Inversa trig., Algébrica, Trigonométrica, Exponencial.",
        ],
        formulas: ["∫ u dv = u·v − ∫ v du"],
        example: {
          problem: "Calcule ∫ x·eˣ dx.",
          steps: ["u = x ⇒ du = dx; dv = eˣ dx ⇒ v = eˣ.", "∫ x·eˣ dx = x·eˣ − ∫ eˣ dx.", "= x·eˣ − eˣ + C."],
          answer: "eˣ(x − 1) + C",
        },
        tip: { module: "Integrais", text: "Digite x*exp(x) de 0 a 1: o resultado deve ser e⁰(0−1)… ou seja, F(1) − F(0) = 0 − (−1) = 1." },
      },
    ],
  },
  {
    id: "calc2",
    tag: "Módulo 3",
    title: "Cálculo 2",
    subtitle: "Integral definida, áreas e várias variáveis",
    topics: [
      {
        id: "definida",
        title: "Integral definida e o TFC",
        theory: [
          "A integral definida ∫ₐᵇ f(x) dx é o limite das somas de Riemann: a área com sinal entre a curva e o eixo x.",
          "O Teorema Fundamental do Cálculo liga derivadas e integrais: basta achar uma antiderivada F e avaliar F(b) − F(a).",
        ],
        formulas: ["∫ₐᵇ f(x) dx = lim n→∞ Σ f(xᵢ)·Δx", "∫ₐᵇ f(x) dx = F(b) − F(a)"],
        example: {
          problem: "Calcule ∫₀² x² dx.",
          steps: ["Antiderivada: F(x) = x³/3.", "F(2) − F(0) = 8/3 − 0."],
          answer: "8/3 ≈ 2,6667",
        },
        tip: { module: "Integrais", text: "Use f(x) = x^2, a = 0 e b = 2: a área sombreada vale 2,666667." },
      },
      {
        id: "areas",
        title: "Áreas entre curvas",
        theory: [
          "Se f(x) ≥ g(x) em [a, b], a área entre elas é a integral da diferença (de cima menos de baixo).",
          "Os limites a e b costumam ser os pontos de interseção, obtidos resolvendo f(x) = g(x).",
        ],
        formulas: ["A = ∫ₐᵇ [f(x) − g(x)] dx", "Área total = ∫ₐᵇ |f(x)| dx"],
        example: {
          problem: "Área entre y = x e y = x² .",
          steps: ["Interseções: x = x² ⇒ x = 0 ou x = 1.", "Em [0, 1], x ≥ x².", "A = ∫₀¹ (x − x²) dx = 1/2 − 1/3."],
          answer: "A = 1/6 ≈ 0,1667",
        },
        tip: { module: "Integrais", text: "Digite x - x^2 com a = 0 e b = 1 para ver exatamente essa área." },
      },
      {
        id: "varias",
        title: "Funções de várias variáveis",
        theory: [
          "Uma função z = f(x, y) associa um número a cada ponto do plano. Seu gráfico é uma superfície no espaço.",
          "Curvas de nível f(x, y) = k ajudam a visualizar a superfície no plano (como mapas topográficos).",
        ],
        formulas: ["z = f(x, y)", "Curva de nível: f(x, y) = k"],
        example: {
          problem: "Descreva as curvas de nível de f(x, y) = x² + y².",
          steps: ["x² + y² = k.", "Para k > 0: círculos de raio √k centrados na origem.", "Para k = 0: apenas o ponto (0, 0)."],
          answer: "Círculos concêntricos (paraboloide)",
        },
        tip: { module: "Funções", text: "Fixe y = 2 e plote x^2 + 4: é o corte da superfície no plano y = 2." },
      },
      {
        id: "parciais",
        title: "Derivadas parciais (introdução)",
        theory: [
          "A derivada parcial ∂f/∂x mede a variação de f quando só x varia, tratando y como constante (e vice-versa).",
          "O vetor gradiente ∇f = (∂f/∂x, ∂f/∂y) aponta na direção de maior crescimento.",
        ],
        formulas: ["∂f/∂x = lim h→0 [f(x+h, y) − f(x, y)] / h", "∇f = (∂f/∂x, ∂f/∂y)"],
        example: {
          problem: "Calcule as parciais de f(x, y) = x²y + 3y.",
          steps: ["∂f/∂x: y é constante ⇒ 2xy.", "∂f/∂y: x é constante ⇒ x² + 3."],
          answer: "∂f/∂x = 2xy · ∂f/∂y = x² + 3",
        },
        tip: { module: "Derivadas", text: "Fixe y = 5: f vira 5x^2 + 15. Derive em x₀ = 1 e compare com 2·1·5 = 10." },
      },
    ],
  },
];
