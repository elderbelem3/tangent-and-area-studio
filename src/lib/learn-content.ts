export type Topic = {
  id: string;
  title: string;
  theory: string[];
  formulas: string[];
  theorem?: { title: string; text: string };
  warning?: string;
  example: { problem: string; steps: string[]; answer: string };
  tip: { module: "Funções" | "Limites" | "Derivadas" | "Integrais"; text: string };
};
export type LearnModule = { id: string; course: "Cálculo 1" | "Cálculo 2"; tag: string; title: string; subtitle: string; topics: Topic[] };

// Formulas and answers use LaTeX; explanations stay plain text for accessible reading.
export const LEARN: LearnModule[] = [
  {
    "id": "fundamentos",
    "course": "Cálculo 1",
    "tag": "Unidade 01",
    "title": "Fundamentos e funções",
    "subtitle": "Domínio, correspondências e famílias fundamentais",
    "topics": [
      {
        "id": "definicao",
        "title": "Definição formal, domínio e imagem",
        "theory": [
          "Uma função f: A → B é uma relação que associa a cada elemento x de A exatamente um elemento f(x) de B. A é o domínio, B é o contradomínio e f(A) = {f(x): x ∈ A} é a imagem. Imagem e contradomínio não são necessariamente iguais.",
          "Em funções reais dadas por expressões, o domínio natural reúne os valores para os quais a expressão está definida: denominadores devem ser não nulos, radicandos de raízes pares não negativos e argumentos de logaritmos positivos. O gráfico é o conjunto dos pares (x, f(x))."
        ],
        "formulas": [
          "f:A\\to B,\\quad x\\mapsto f(x)",
          "\\operatorname{Im}(f)=\\{f(x):x\\in A\\}"
        ],
        "example": {
          "problem": "Determine domínio e imagem de f(x) = √(x − 1).",
          "steps": [
            "A raiz quadrada real exige x − 1 ≥ 0.",
            "Logo, as entradas permitidas satisfazem x ≥ 1.",
            "A raiz é sempre não negativa; dado y ≥ 0, x = y² + 1 produz f(x) = y.",
            "Portanto todos os valores não negativos, e somente eles, pertencem à imagem."
          ],
          "answer": "D_f=[1,\\infty),\\quad\\operatorname{Im}(f)=[0,\\infty)"
        },
        "tip": {
          "module": "Funções",
          "text": "Use sqrt(x-1) e compare os valores definidos para x ≥ 1 com as entradas fora do domínio."
        }
      },
      {
        "id": "inversa",
        "title": "Injetora, sobrejetora, bijetora e inversa",
        "theory": [
          "f é injetora quando entradas distintas têm saídas distintas; equivalentemente, f(x₁) = f(x₂) implica x₁ = x₂. É sobrejetora quando todo elemento do contradomínio é atingido. Uma bijeção satisfaz ambas as propriedades.",
          "Uma função possui inversa f⁻¹: B → A se e somente se é bijetora. A inversa desfaz a função; não significa 1/f. É possível tornar uma função invertível restringindo seu domínio e ajustando o contradomínio."
        ],
        "formulas": [
          "f^{-1}\\circ f=\\operatorname{id}_A,\\qquad f\\circ f^{-1}=\\operatorname{id}_B",
          "f(x)=x^2\\ (x\\geq0)\\ \\Longrightarrow\\ f^{-1}(x)=\\sqrt{x}"
        ],
        "example": {
          "problem": "Encontre a inversa de f: ℝ → ℝ, f(x) = 2x + 3.",
          "steps": [
            "Se 2x₁ + 3 = 2x₂ + 3, então x₁ = x₂: f é injetora.",
            "Para qualquer y real, x = (y − 3)/2 satisfaz f(x) = y: f é sobrejetora.",
            "Resolva y = 2x + 3 para x: x = (y − 3)/2.",
            "Troque o nome da entrada para obter f⁻¹(x) e confira ambas as composições."
          ],
          "answer": "f^{-1}(x)=\\frac{x-3}{2}"
        },
        "tip": {
          "module": "Funções",
          "text": "Compare 2*x+3 e (x-3)/2 em gráficos separados; seus gráficos são reflexos em relação à reta y = x."
        }
      },
      {
        "id": "composta",
        "title": "Função composta",
        "theory": [
          "A composição (f ∘ g)(x) aplica primeiro g e depois f. Seu domínio exige x ∈ Dom(g) e g(x) ∈ Dom(f); ignorar essa segunda condição pode incluir entradas inválidas.",
          "Em geral f ∘ g não é igual a g ∘ f. Identificar as funções interna e externa prepara o uso da regra da cadeia na derivação."
        ],
        "formulas": [
          "(f\\circ g)(x)=f(g(x))",
          "D_{f\\circ g}=\\{x\\in D_g:g(x)\\in D_f\\}"
        ],
        "example": {
          "problem": "Se f(u) = √u e g(x) = x² − 4, encontre f ∘ g e seu domínio.",
          "steps": [
            "A função interna produz u = x² − 4.",
            "Substituindo em f, obtemos √(x² − 4).",
            "A raiz exige x² − 4 ≥ 0, ou seja, |x| ≥ 2.",
            "Nos intervalos (−∞, −2] e [2, ∞), a composição é real."
          ],
          "answer": "(f\\circ g)(x)=\\sqrt{x^2-4},\\quad D=(-\\infty,-2]\\cup[2,\\infty)"
        },
        "tip": {
          "module": "Funções",
          "text": "Digite sqrt(x^2-4); a ausência de valores reais entre −2 e 2 decorre do domínio."
        }
      },
      {
        "id": "familias",
        "title": "Trinômios, trigonométricas, exponenciais e logaritmos",
        "theory": [
          "O trinômio ax² + bx + c, a ≠ 0, tem gráfico parabólico. O sinal de a determina sua concavidade; o discriminante Δ = b² − 4ac determina quantas raízes reais existem. O vértice ocorre em x = −b/(2a).",
          "Seno e cosseno têm domínio ℝ e período 2π. A tangente tem período π e não existe em π/2 + kπ. Ângulos devem ser medidos em radianos nas fórmulas de cálculo.",
          "Para b > 0 e b ≠ 1, bˣ é positiva e invertível de ℝ em (0, ∞); sua inversa é log_b(x). ln(x) é o logaritmo na base e, definido apenas para x > 0."
        ],
        "formulas": [
          "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a},\\qquad x_v=-\\frac b{2a}",
          "\\sin^2x+\\cos^2x=1,\\quad\\tan x=\\frac{\\sin x}{\\cos x}",
          "\\log_b x=\\frac{\\ln x}{\\ln b},\\qquad e^{\\ln x}=x\\ (x>0)"
        ],
        "example": {
          "problem": "Analise f(x) = x² − 4x + 3 e resolva eˣ = 2.",
          "steps": [
            "O discriminante do trinômio é 16 − 12 = 4.",
            "As raízes são (4 ± 2)/2: 1 e 3.",
            "O vértice é (2, −1), pois f(2) = −1; a parábola abre para cima.",
            "Aplicando ln aos dois lados de eˣ = 2, obtemos x = ln(2)."
          ],
          "answer": "x_1=1,\\ x_2=3,\\ V=(2,-1);\\quad e^x=2\\Rightarrow x=\\ln2"
        },
        "tip": {
          "module": "Funções",
          "text": "Explore x^2-4*x+3, sin(x), tan(x), exp(x) e ln(x) separadamente; use pi para π."
        }
      }
    ]
  },
  {
    "id": "limites",
    "course": "Cálculo 1",
    "tag": "Unidade 02",
    "title": "Limites e continuidade",
    "subtitle": "Definições, comportamento assintótico e teoremas",
    "topics": [
      {
        "id": "epsilon",
        "title": "Definição ε–δ e limites laterais",
        "theory": [
          "Se a é ponto de acumulação do domínio, lim x→a f(x) = L significa: para todo ε > 0 existe δ > 0 tal que, para todo x do domínio, 0 < |x − a| < δ implica |f(x) − L| < ε. A exclusão de x = a permite estudar o limite mesmo se f(a) não existir.",
          "No limite pela esquerda restringimos x < a; pela direita, x > a. Quando ambos os lados do domínio se acumulam em a, o limite bilateral finito existe exatamente quando os limites laterais existem e coincidem. Uma tabela numérica sugere um limite, mas não é prova."
        ],
        "formulas": [
          "\\forall\\varepsilon>0\\ \\exists\\delta>0:\\quad0<|x-a|<\\delta\\Rightarrow|f(x)-L|<\\varepsilon",
          "\\lim_{x\\to a}f(x)=L\\iff\\lim_{x\\to a^-}f(x)=\\lim_{x\\to a^+}f(x)=L"
        ],
        "example": {
          "problem": "Prove pela definição que lim x→2 (3x + 1) = 7.",
          "steps": [
            "Dado ε > 0, queremos |(3x + 1) − 7| < ε.",
            "Simplifique a diferença: |3x − 6| = 3|x − 2|.",
            "Escolha δ = ε/3, que é positivo.",
            "Se 0 < |x − 2| < δ, então |f(x) − 7| < 3δ = ε. Isso prova o limite para todo ε."
          ],
          "answer": "\\delta=\\varepsilon/3\\quad\\Longrightarrow\\quad\\lim_{x\\to2}(3x+1)=7"
        },
        "tip": {
          "module": "Limites",
          "text": "Use 3*x+1 no ponto c = 2 e compare as aproximações laterais; para lados diferentes, experimente abs(x)/x em c = 0."
        }
      },
      {
        "id": "assintotas",
        "title": "Limites no infinito e assíntotas",
        "theory": [
          "lim x→+∞ f(x) = L significa que, para todo ε > 0, existe M tal que x > M implica |f(x) − L| < ε. Para −∞, usamos x < −M. O limite infinito em a significa que os valores excedem qualquer patamar positivo em magnitude com o sinal indicado.",
          "A reta y = L é assíntota horizontal se um dos limites no infinito vale L. A reta x = a é assíntota vertical se pelo menos um limite lateral em a é +∞ ou −∞. Para razões de polinômios, comparar os graus ou dividir pela maior potência ajuda a calcular limites."
        ],
        "formulas": [
          "\\lim_{x\\to\\infty}\\frac{a_nx^n+\\cdots}{b_nx^n+\\cdots}=\\frac{a_n}{b_n}\\quad(b_n\\ne0)",
          "\\lim_{x\\to2^-}\\frac1{x-2}=-\\infty,\\qquad\\lim_{x\\to2^+}\\frac1{x-2}=+\\infty"
        ],
        "example": {
          "problem": "Encontre as assíntotas de f(x) = (2x + 1)/(x − 2).",
          "steps": [
            "Divida: f(x) = 2 + 5/(x − 2).",
            "Quando x tende a ±∞, o segundo termo tende a zero: y = 2 é horizontal.",
            "Quando x tende a 2 pela direita, 5/(x − 2) tende a +∞.",
            "Pela esquerda, o termo tende a −∞: x = 2 é vertical."
          ],
          "answer": "\\text{Assíntotas: }x=2\\quad\\text{e}\\quad y=2"
        },
        "tip": {
          "module": "Funções",
          "text": "Digite (2*x+1)/(x-2). No módulo Limites, use c = 2 para investigar cada lado; limites no infinito são estudados aqui teoricamente."
        },
        "warning": "∞ não é um número real para substituição direta. Ausência de valor no gráfico não prova, por si só, a existência de assíntota."
      },
      {
        "id": "confronto",
        "title": "Teorema do Confronto (Sanduíche)",
        "theory": [
          "Quando uma função difícil está entre duas funções com o mesmo limite, esse valor também é seu limite. As desigualdades devem valer em uma vizinhança perfurada do ponto, não necessariamente no próprio ponto.",
          "O teorema é útil com oscilações limitadas: |sin t| ≤ 1 e |cos t| ≤ 1 permitem controlar produtos por fatores que tendem a zero."
        ],
        "formulas": [
          "g(x)\\leq f(x)\\leq h(x),\\quad\\lim_{x\\to a}g(x)=\\lim_{x\\to a}h(x)=L\\Rightarrow\\lim_{x\\to a}f(x)=L"
        ],
        "example": {
          "problem": "Calcule lim x→0 x² sin(1/x).",
          "steps": [
            "Para x ≠ 0, −1 ≤ sin(1/x) ≤ 1.",
            "Multiplique por x² ≥ 0: −x² ≤ x² sin(1/x) ≤ x².",
            "Os extremos −x² e x² tendem a zero.",
            "Pelo Teorema do Confronto, a função central também tende a zero apesar das oscilações."
          ],
          "answer": "\\lim_{x\\to0}x^2\\sin(1/x)=0"
        },
        "tip": {
          "module": "Limites",
          "text": "Use x^2*sin(1/x) em c = 0; a expressão não existe em zero, mas seu limite existe."
        },
        "theorem": {
          "title": "Teorema do Confronto",
          "text": "Se g ≤ f ≤ h perto de a (exceto possivelmente em a) e g e h têm o mesmo limite finito L, então f também tem limite L."
        }
      },
      {
        "id": "continuidade",
        "title": "Continuidade e Teorema do Valor Intermediário",
        "theory": [
          "f é contínua em a quando f(a) está definida e o limite de f(x) em a é f(a). Em extremidades do domínio usa-se o limite relativo ao domínio, em particular unilateral em um intervalo fechado.",
          "Uma descontinuidade removível pode ser corrigida redefinindo o valor no ponto se o limite finito existe. Em um salto os limites laterais finitos são distintos. O TVI garante que uma função contínua em [a, b] assume todos os valores entre f(a) e f(b)."
        ],
        "formulas": [
          "f\\text{ contínua em }a\\iff\\lim_{x\\to a}f(x)=f(a)",
          "f(a)<k<f(b)\\Rightarrow\\exists c\\in(a,b):f(c)=k"
        ],
        "example": {
          "problem": "Prove que x³ + x − 1 = 0 tem uma raiz em (0, 1).",
          "steps": [
            "Defina f(x) = x³ + x − 1; polinômios são contínuos em [0, 1].",
            "Calcule f(0) = −1 e f(1) = 1.",
            "O número zero está estritamente entre −1 e 1.",
            "Pelo TVI existe c ∈ (0, 1) com f(c) = 0. Como f′(x) = 3x² + 1 > 0, a raiz é única."
          ],
          "answer": "\\exists!\\ c\\in(0,1):c^3+c-1=0"
        },
        "tip": {
          "module": "Funções",
          "text": "Plote x^3+x-1 e examine a mudança de sinal entre 0 e 1; a continuidade fundamenta a existência da raiz."
        },
        "theorem": {
          "title": "TVI",
          "text": "Se f é contínua em [a, b], todo valor entre f(a) e f(b) é atingido. O teorema garante existência, não unicidade."
        }
      }
    ]
  },
  {
    "id": "derivadas",
    "course": "Cálculo 1",
    "tag": "Unidade 03",
    "title": "Derivadas e aplicações",
    "subtitle": "Taxas de variação, teoremas e análise de gráficos",
    "topics": [
      {
        "id": "def-derivada",
        "title": "Derivada, reta tangente e diferenciabilidade",
        "theory": [
          "A derivada em a é o limite finito das taxas médias [f(a + h) − f(a)]/h quando h tende a zero. Se existe, f é diferenciável em a e é contínua em a. A recíproca é falsa: |x| é contínua mas não derivável em zero.",
          "Geometricamente, a derivada é a inclinação da reta tangente; em movimento, a derivada da posição é a velocidade instantânea. Uma tangente vertical não corresponde a uma derivada real finita."
        ],
        "formulas": [
          "f\\prime(a)=\\lim_{h\\to0}\\frac{f(a+h)-f(a)}h",
          "y-f(a)=f\\prime(a)(x-a)"
        ],
        "example": {
          "problem": "Use a definição para derivar f(x) = x² e obter a tangente em a = 3.",
          "steps": [
            "Expanda (a + h)² − a² = 2ah + h².",
            "Para h ≠ 0, o quociente é 2a + h.",
            "Passando ao limite, f′(a) = 2a.",
            "Em a = 3, f(3) = 9 e f′(3) = 6; y − 9 = 6(x − 3)."
          ],
          "answer": "f\\prime(x)=2x,\\qquad y=6x-9"
        },
        "tip": {
          "module": "Derivadas",
          "text": "Use x^2 em x₀ = 3. O valor numérico deve se aproximar de 6; o módulo usa aproximação numérica, não demonstração simbólica."
        }
      },
      {
        "id": "regras",
        "title": "Regras: potência, produto, quociente e cadeia",
        "theory": [
          "A linearidade permite derivar somas termo a termo. Para potências reais, a regra vale nos intervalos em que a potência está definida e diferenciável. No quociente o denominador precisa ser não nulo.",
          "A regra da cadeia deriva a função externa avaliada na interna e multiplica pela derivada da interna. Para bases exponenciais b > 0, a derivada de bˣ é bˣ ln b. As fórmulas trigonométricas usam radianos."
        ],
        "formulas": [
          "(x^n)\\prime=nx^{n-1},\\quad(uv)\\prime=u\\prime v+uv\\prime",
          "\\left(\\frac uv\\right)\\prime=\\frac{u\\prime v-uv\\prime}{v^2},\\quad(f\\circ g)\\prime=(f\\prime\\circ g)g\\prime",
          "(\\sin x)\\prime=\\cos x,\\quad(\\cos x)\\prime=-\\sin x,\\quad(\\tan x)\\prime=\\sec^2x",
          "(e^x)\\prime=e^x,\\quad(\\ln x)\\prime=1/x\\ (x>0)"
        ],
        "example": {
          "problem": "Derive f(x) = x² sin(3x).",
          "steps": [
            "Escolha u = x² e v = sin(3x).",
            "A potência fornece u′ = 2x.",
            "Pela cadeia, v′ = cos(3x) · 3.",
            "Aplique o produto: f′ = u′v + uv′.",
            "Reúna os termos sem confundir derivada do produto com produto das derivadas."
          ],
          "answer": "f\\prime(x)=2x\\sin(3x)+3x^2\\cos(3x)"
        },
        "tip": {
          "module": "Derivadas",
          "text": "Digite x^2*sin(3*x), escolha x₀ = 1 e compare a aproximação com 2*sin(3)+3*cos(3)."
        }
      },
      {
        "id": "implicita",
        "title": "Derivação implícita",
        "theory": [
          "Em uma equação F(x, y) = 0, y pode depender de x sem estar isolado. Diferencie ambos os lados em relação a x, aplicando a cadeia a todos os termos que contêm y.",
          "Se F tem derivadas parciais contínuas e F_y ≠ 0 perto do ponto, a equação define localmente y como função diferenciável de x, com y′ = −F_x/F_y. Se F_y = 0, não use essa divisão sem análise adicional."
        ],
        "formulas": [
          "F_x+F_y\\,y\\prime=0\\quad\\Rightarrow\\quad y\\prime=-\\frac{F_x}{F_y}\\ (F_y\\ne0)"
        ],
        "example": {
          "problem": "Encontre a tangente ao círculo x² + y² = 25 no ponto (3, 4).",
          "steps": [
            "Derive: 2x + 2y y′ = 0.",
            "Como y = 4 ≠ 0 no ponto, isole y′ = −x/y.",
            "A inclinação no ponto é −3/4.",
            "Use a forma ponto-inclinação com (3, 4)."
          ],
          "answer": "y-4=-\\frac34(x-3)"
        },
        "tip": {
          "module": "Derivadas",
          "text": "No ramo superior, digite sqrt(25-x^2) em x₀ = 3 para comparar com −0,75; o módulo aceita apenas funções explícitas de x."
        }
      },
      {
        "id": "taxas",
        "title": "Taxas relacionadas",
        "theory": [
          "Grandezas que variam com o tempo podem estar ligadas por uma equação geométrica. Derive essa relação em relação ao tempo antes de substituir os valores instantâneos.",
          "Identifique unidades, dados e taxa desejada. Por exemplo, derivar um volume em relação ao tempo produz unidade cúbica por unidade de tempo; sinais negativos indicam redução."
        ],
        "formulas": [
          "V=\\frac43\\pi r^3\\quad\\Rightarrow\\quad\\frac{dV}{dt}=4\\pi r^2\\frac{dr}{dt}"
        ],
        "example": {
          "problem": "Um balão esférico recebe 12π cm³/s. Qual é dr/dt quando r = 3 cm?",
          "steps": [
            "Modele o volume por V = (4/3)πr³.",
            "Derive com relação ao tempo: dV/dt = 4πr² dr/dt.",
            "Substitua dV/dt = 12π e r = 3: 12π = 36π dr/dt.",
            "Divida por 36π e mantenha a unidade linear por segundo."
          ],
          "answer": "\\frac{dr}{dt}=\\frac13\\ \\mathrm{cm/s}"
        },
        "tip": {
          "module": "Derivadas",
          "text": "Digite (4/3)*pi*x^3 em x₀ = 3. A inclinação 36π é dV/dr, não dV/dt; multiplique por dr/dt."
        }
      },
      {
        "id": "lhopital",
        "title": "Regra de L’Hôpital e indeterminações",
        "theory": [
          "A regra trata quocientes com formas 0/0 ou ∞/∞, sob hipóteses de diferenciabilidade em uma vizinhança perfurada e denominador derivado não nulo. Quando o limite de f′/g′ existe (finito ou infinito), ele determina o limite do quociente original.",
          "Formas 0·∞ e ∞ − ∞ devem primeiro ser transformadas em quocientes apropriados. Para 0⁰, 1^∞ e ∞⁰, quando a base é positiva, tomar logaritmo transforma a potência em produto. Não aplique L’Hôpital a uma fração que já tenha limite determinado por substituição."
        ],
        "formulas": [
          "\\lim_{x\\to a}\\frac{f(x)}{g(x)}=\\lim_{x\\to a}\\frac{f\\prime(x)}{g\\prime(x)}\\quad\\text{(sob as hipóteses)}"
        ],
        "example": {
          "problem": "Calcule lim x→0 (eˣ − 1 − x)/x².",
          "steps": [
            "Numerador e denominador tendem a zero: forma 0/0.",
            "As funções são diferenciáveis; para x ≠ 0, a derivada do denominador 2x é não nula.",
            "A primeira aplicação produz (eˣ − 1)/(2x), ainda de forma 0/0.",
            "Uma segunda aplicação produz eˣ/2, cujo limite é 1/2.",
            "As hipóteses valem em cada aplicação, justificando o resultado."
          ],
          "answer": "\\lim_{x\\to0}\\frac{e^x-1-x}{x^2}=\\frac12"
        },
        "tip": {
          "module": "Limites",
          "text": "Use (exp(x)-1-x)/x^2 em c = 0; perto demais de zero, cancelamento numérico pode reduzir a precisão."
        },
        "theorem": {
          "title": "L’Hôpital",
          "text": "Para formas 0/0 ou ∞/∞, exija f e g diferenciáveis perto do ponto (exceto nele), g′ ≠ 0 e existência do limite de f′/g′. O mesmo princípio vale para limites laterais e no infinito."
        },
        "warning": "A não existência do limite de f′/g′ não prova a não existência do limite de f/g."
      },
      {
        "id": "rolle-tvm",
        "title": "Teorema de Rolle e Teorema do Valor Médio",
        "theory": [
          "Rolle: se f é contínua em [a, b], diferenciável em (a, b), a < b, e f(a) = f(b), existe c interior com f′(c) = 0.",
          "O TVM mantém continuidade e diferenciabilidade, sem exigir valores iguais nas extremidades: existe uma tangente paralela à secante. Consequências incluem monotonicidade quando o sinal de f′ é constante e constância quando f′ = 0 em um intervalo."
        ],
        "formulas": [
          "f(a)=f(b)\\Rightarrow\\exists c\\in(a,b):f\\prime(c)=0",
          "\\exists c\\in(a,b):f\\prime(c)=\\frac{f(b)-f(a)}{b-a}"
        ],
        "example": {
          "problem": "Encontre o ponto garantido pelo TVM para f(x) = x² em [1, 3].",
          "steps": [
            "O polinômio é contínuo no intervalo fechado e diferenciável no aberto.",
            "A inclinação da secante é (9 − 1)/(3 − 1) = 4.",
            "Como f′(x) = 2x, resolvemos 2c = 4.",
            "c = 2 está em (1, 3), satisfazendo a conclusão do TVM."
          ],
          "answer": "c=2,\\qquad f\\prime(2)=4"
        },
        "tip": {
          "module": "Derivadas",
          "text": "Use x^2 em x₀ = 2 e compare a inclinação 4 com a taxa média entre 1 e 3."
        },
        "theorem": {
          "title": "Hipóteses essenciais",
          "text": "Continuidade no intervalo fechado e diferenciabilidade no aberto são obrigatórias. Em |x| sobre [−1, 1], Rolle não se aplica porque não há derivada em zero."
        }
      },
      {
        "id": "analise",
        "title": "Crescimento, concavidade, inflexão e extremos",
        "theory": [
          "Pontos críticos são pontos do domínio em que f′ é zero ou não existe. Onde f′ > 0, f cresce; onde f′ < 0, decresce. A mudança de + para − caracteriza máximo local; de − para + caracteriza mínimo local.",
          "Em intervalos com segunda derivada, f″ > 0 indica concavidade para cima e f″ < 0 para baixo. Um ponto de inflexão requer continuidade e mudança de concavidade; f″ = 0 sozinho não basta.",
          "Se f′(c) = 0 e f″(c) existe, f″(c) > 0 garante mínimo local, f″(c) < 0 garante máximo; f″(c) = 0 é inconclusivo. Para extremos absolutos de uma função contínua em [a, b], compare pontos críticos interiores e extremidades."
        ],
        "formulas": [
          "f\\prime>0\\Rightarrow\\text{crescimento},\\quad f\\prime<0\\Rightarrow\\text{decrescimento}",
          "f\\prime(c)=0,\\ f\\prime\\prime(c)>0\\Rightarrow\\text{mínimo local}"
        ],
        "example": {
          "problem": "Analise os extremos e a inflexão de f(x) = x³ − 3x.",
          "steps": [
            "Derive: f′ = 3x² − 3; os críticos são −1 e 1.",
            "f′ é positiva para x < −1 e x > 1; negativa entre −1 e 1.",
            "Assim (−1, 2) é máximo local e (1, −2) é mínimo local.",
            "f″ = 6x é negativa à esquerda de zero e positiva à direita.",
            "A função é contínua em zero; (0, 0) é ponto de inflexão. Não há extremos absolutos em ℝ."
          ],
          "answer": "\\text{Máx. local }(-1,2);\\quad\\text{mín. local }(1,-2);\\quad\\text{inflexão }(0,0)"
        },
        "tip": {
          "module": "Funções",
          "text": "Digite x^3-3*x para visualizar os extremos; no módulo Derivadas, compare inclinações em −2, 0 e 2."
        }
      }
    ]
  },
  {
    "id": "antiderivadas",
    "course": "Cálculo 1",
    "tag": "Unidade 04",
    "title": "Integrais indefinidas",
    "subtitle": "Antiderivadas e quatro métodos de integração",
    "topics": [
      {
        "id": "imediatas",
        "title": "Antiderivadas e integrais imediatas",
        "theory": [
          "Uma antiderivada de f em um intervalo I é uma função F tal que F′ = f em I. Todas as antiderivadas diferem por uma constante nesse intervalo: ∫ f(x) dx = F(x) + C.",
          "A integral indefinida é uma família de funções, não uma área nem um número. Em domínios desconexos, cada intervalo componente pode ter sua própria constante. Sempre verifique uma antiderivada diferenciando-a."
        ],
        "formulas": [
          "\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+C\\ (n\\ne-1),\\quad\\int\\frac{dx}{x}=\\ln|x|+C",
          "\\int e^x dx=e^x+C,\\quad\\int\\cos x\\,dx=\\sin x+C,\\quad\\int\\sin x\\,dx=-\\cos x+C",
          "\\int\\frac{dx}{1+x^2}=\\arctan x+C"
        ],
        "example": {
          "problem": "Calcule ∫ (3x² + 2x − 5) dx.",
          "steps": [
            "Use a linearidade para integrar os três termos separadamente.",
            "A regra da potência dá ∫3x² dx = x³ e ∫2x dx = x².",
            "O termo constante produz −5x.",
            "Acrescente C e derive a resposta para recuperar 3x² + 2x − 5."
          ],
          "answer": "x^3+x^2-5x+C"
        },
        "tip": {
          "module": "Derivadas",
          "text": "Digite x^3+x^2-5*x e compare a derivada numérica com 3*x^2+2*x-5 em um mesmo ponto."
        },
        "warning": "O módulo Integrais calcula integrais definidas numericamente; ele não retorna antiderivadas simbólicas."
      },
      {
        "id": "substituicao",
        "title": "Substituição simples",
        "theory": [
          "A substituição reverte a regra da cadeia: quando o integrando contém f(g(x))g′(x), escolha u = g(x) e du = g′(x) dx. Toda a expressão precisa ser convertida para a nova variável.",
          "Em uma integral indefinida, retorne à variável original no final. Em uma integral definida, troque também os limites para g(a) e g(b), ou retorne a x antes de avaliar."
        ],
        "formulas": [
          "\\int f(g(x))g\\prime(x)\\,dx=F(g(x))+C\\quad(F\\prime=f)"
        ],
        "example": {
          "problem": "Calcule ∫ 2x cos(x²) dx e a integral correspondente de 0 a 1.",
          "steps": [
            "Escolha u = x²; então du = 2x dx.",
            "A integral indefinida vira ∫cos u du = sin u + C.",
            "Retorne: sin(x²) + C.",
            "Nos limites 0 e 1, u varia de 0 a 1; sin(1) − sin(0) = sin(1)."
          ],
          "answer": "F(x)=\\sin(x^2)+C;\\quad\\int_0^1 2x\\cos(x^2)dx=\\sin1"
        },
        "tip": {
          "module": "Integrais",
          "text": "Use 2*x*cos(x^2), a = 0 e b = 1; espere aproximadamente 0,841471."
        }
      },
      {
        "id": "por-partes",
        "title": "Integração por partes",
        "theory": [
          "A fórmula decorre da integração da regra do produto. Escolha u para que du simplifique a expressão e dv para que v seja integrável. A heurística LIATE pode ajudar, mas não é um teorema nem garantia de sucesso.",
          "Em intervalos fechados, a versão definida inclui o termo de fronteira [uv]ₐᵇ. Algumas integrais exigem repetir o método ou resolver uma equação com a integral original."
        ],
        "formulas": [
          "\\int u\\,dv=uv-\\int v\\,du",
          "\\int_a^b u v\\prime dx=[uv]_a^b-\\int_a^b u\\prime v\\,dx"
        ],
        "example": {
          "problem": "Calcule ∫ x eˣ dx.",
          "steps": [
            "Escolha u = x e dv = eˣ dx.",
            "Então du = dx e v = eˣ.",
            "Substitua: ∫x eˣ dx = x eˣ − ∫eˣ dx.",
            "Integre o termo restante e fatorize eˣ.",
            "A derivada de eˣ(x − 1) é eˣ(x − 1) + eˣ = x eˣ."
          ],
          "answer": "\\int xe^x dx=e^x(x-1)+C"
        },
        "tip": {
          "module": "Integrais",
          "text": "Digite x*exp(x), de 0 a 1. A avaliação [eˣ(x−1)]₀¹ fornece 1."
        }
      },
      {
        "id": "trig-sub",
        "title": "Substituição trigonométrica",
        "theory": [
          "Radicais quadráticos podem simplificar por identidades trigonométricas. Para a > 0, use x = a sin θ em √(a² − x²), x = a tan θ em √(a² + x²) e x = a sec θ em √(x² − a²), escolhendo um intervalo para θ que controle os sinais.",
          "Calcule dx, simplifique o radical com cuidado (√u² = |u|) e, ao finalizar, expresse θ e as razões trigonométricas em termos de x."
        ],
        "formulas": [
          "x=a\\sin\\theta,\\quad dx=a\\cos\\theta\\,d\\theta",
          "1-\\sin^2\\theta=\\cos^2\\theta,\\quad1+\\tan^2\\theta=\\sec^2\\theta"
        ],
        "example": {
          "problem": "Calcule ∫ √(4 − x²) dx para −2 < x < 2.",
          "steps": [
            "Escolha x = 2 sin θ, com −π/2 < θ < π/2; cos θ > 0.",
            "Assim dx = 2 cos θ dθ e √(4 − x²) = 2 cos θ.",
            "A integral vira 4∫cos² θ dθ = 2∫(1 + cos 2θ) dθ.",
            "Integre: 2θ + sin 2θ + C.",
            "Use θ = arcsin(x/2) e sin 2θ = x√(4 − x²)/2."
          ],
          "answer": "\\frac{x}{2}\\sqrt{4-x^2}+2\\arcsin(x/2)+C"
        },
        "tip": {
          "module": "Integrais",
          "text": "Use sqrt(4-x^2) de 0 a 2: a área do quarto de disco de raio 2 é π."
        },
        "warning": "A escolha do intervalo de θ evita descartar indevidamente valores absolutos nos radicais."
      },
      {
        "id": "fracoes",
        "title": "Frações parciais",
        "theory": [
          "Para integrar uma função racional P/Q, primeiro faça divisão polinomial se grau(P) ≥ grau(Q). Fatore Q sobre os reais e decomponha a fração própria em termos simples.",
          "Para cada fator linear repetido (x − a)^m, inclua A₁/(x − a) até A_m/(x − a)^m. Para cada fator quadrático irredutível repetido, use numeradores lineares em cada potência. Determine os coeficientes pela identidade polinomial."
        ],
        "formulas": [
          "\\frac1{x^2-1}=\\frac{A}{x-1}+\\frac{B}{x+1}",
          "\\frac1{x^2-1}=\\frac12\\left(\\frac1{x-1}-\\frac1{x+1}\\right)"
        ],
        "example": {
          "problem": "Calcule ∫ 1/(x² − 1) dx.",
          "steps": [
            "Fatore x² − 1 = (x − 1)(x + 1).",
            "Multiplique a decomposição pelo denominador: 1 = A(x + 1) + B(x − 1).",
            "Com x = 1 obtenha A = 1/2; com x = −1, B = −1/2.",
            "Integre cada termo usando ∫1/(x − a) dx = ln|x − a|.",
            "A resposta vale em cada intervalo que não cruza −1 ou 1."
          ],
          "answer": "\\frac12\\ln\\left|\\frac{x-1}{x+1}\\right|+C"
        },
        "tip": {
          "module": "Integrais",
          "text": "Use 1/(x^2-1) entre 2 e 3. Não atravesse os polos ±1; esses casos exigem integrais impróprias."
        }
      }
    ]
  },
  {
    "id": "definidas",
    "course": "Cálculo 2",
    "tag": "Unidade 05",
    "title": "Integral definida e aplicações",
    "subtitle": "Riemann, TFC, áreas, volumes e arco",
    "topics": [
      {
        "id": "riemann",
        "title": "Somas de Riemann e integral definida",
        "theory": [
          "Uma partição a = x₀ < x₁ < … < xₙ = b divide o intervalo em larguras Δxᵢ. Escolha pontos ξᵢ ∈ [xᵢ₋₁, xᵢ]. A soma Σ f(ξᵢ)Δxᵢ aproxima a acumulação com sinal.",
          "Uma função limitada é Riemann-integrável quando essas somas convergem ao mesmo número para qualquer escolha de pontos e partições cuja maior largura tende a zero. Toda função contínua em um intervalo fechado é integrável."
        ],
        "formulas": [
          "\\int_a^b f(x)dx=\\lim_{\\|P\\|\\to0}\\sum_{i=1}^n f(\\xi_i)\\Delta x_i",
          "\\Delta x=\\frac{b-a}{n},\\quad\\xi_i=a+i\\Delta x\\quad\\text{(extremos direitos)}"
        ],
        "example": {
          "problem": "Calcule ∫₀¹ x² dx por somas de Riemann à direita.",
          "steps": [
            "Use n intervalos iguais: Δx = 1/n e ξᵢ = i/n.",
            "A soma é (1/n³)Σᵢ₌₁ⁿ i².",
            "A identidade Σ i² = n(n + 1)(2n + 1)/6 fornece (n + 1)(2n + 1)/(6n²).",
            "Divida por n² e passe ao limite: (1 + 1/n)(2 + 1/n)/6 → 1/3."
          ],
          "answer": "\\int_0^1 x^2dx=\\frac13"
        },
        "tip": {
          "module": "Integrais",
          "text": "Digite x^2 de 0 a 1. O valor aproximado é 0,333333; o módulo usa a regra de Simpson, não a soma de Riemann da demonstração."
        }
      },
      {
        "id": "tfc",
        "title": "Teorema Fundamental do Cálculo — partes 1 e 2",
        "theory": [
          "Parte 1: se f é contínua em [a, b], a função acumulação G(x) = ∫ₐˣ f(t) dt é diferenciável no interior e G′(x) = f(x). Com extremidade variável g(x), a cadeia fornece f(g(x))g′(x).",
          "Parte 2: se f é contínua em [a, b] e F é uma antiderivada de f, então ∫ₐᵇ f(x) dx = F(b) − F(a). A constante desaparece na diferença. A integral com limites invertidos troca o sinal."
        ],
        "formulas": [
          "\\frac d{dx}\\int_a^x f(t)dt=f(x)",
          "\\frac d{dx}\\int_a^{g(x)}f(t)dt=f(g(x))g\\prime(x)",
          "\\int_a^b f(x)dx=F(b)-F(a)"
        ],
        "example": {
          "problem": "Derive G(x) = ∫₀ˣ² cos(t) dt e calcule ∫₀² x² dx.",
          "steps": [
            "Pela parte 1 e pela cadeia, G′(x) = cos(x²) · 2x.",
            "Para a segunda integral, uma antiderivada é F(x) = x³/3.",
            "Pela parte 2, F(2) − F(0) = 8/3.",
            "Note que derivar acumulação e avaliar uma integral são conclusões diferentes do mesmo teorema."
          ],
          "answer": "G\\prime(x)=2x\\cos(x^2),\\qquad\\int_0^2x^2dx=\\frac83"
        },
        "tip": {
          "module": "Integrais",
          "text": "Use x^2, a = 0, b = 2; compare com 8/3. Para conferir G′, use sin(x^2) no módulo Derivadas."
        },
        "theorem": {
          "title": "TFC",
          "text": "A continuidade de f garante as duas partes na formulação apresentada. Na parte 2, F′ = f em todo o intervalo interior."
        }
      },
      {
        "id": "areas",
        "title": "Áreas entre curvas",
        "theory": [
          "A integral definida mede área com sinal em relação ao eixo horizontal. A área geométrica entre f e g é ∫|f − g|; quando uma curva é sempre superior, integre superior menos inferior.",
          "Encontre interseções e verifique a ordem das curvas em cada subintervalo. Se a ordem muda, divida a integral ou use valor absoluto. Em integração por y, use curva à direita menos curva à esquerda."
        ],
        "formulas": [
          "A=\\int_a^b|f(x)-g(x)|dx",
          "f\\geq g\\Rightarrow A=\\int_a^b(f-g)dx"
        ],
        "example": {
          "problem": "Encontre a área entre y = x e y = x².",
          "steps": [
            "Resolva x = x²: as interseções são 0 e 1.",
            "Em [0, 1], x ≥ x², então a diferença é x − x².",
            "Integre: [x²/2 − x³/3]₀¹.",
            "A área é 1/2 − 1/3 = 1/6, em unidades quadradas."
          ],
          "answer": "A=\\frac16"
        },
        "tip": {
          "module": "Integrais",
          "text": "Digite x-x^2, a = 0, b = 1. O gráfico mostrado é o da diferença, não as duas curvas simultaneamente."
        }
      },
      {
        "id": "volumes",
        "title": "Sólidos de revolução: discos, anéis e cascas",
        "theory": [
          "O método dos discos ou anéis usa cortes perpendiculares ao eixo de rotação: volume é a integral da área transversal π(R² − r²). Os raios são distâncias ao eixo, não apenas coordenadas sem sinal.",
          "O método das cascas usa cortes paralelos ao eixo: cada casca contribui aproximadamente 2π · raio · altura · espessura. Escolher x ou y depende da geometria e do eixo."
        ],
        "formulas": [
          "V=\\pi\\int_a^b(R(x)^2-r(x)^2)dx",
          "V=2\\pi\\int_a^b\\rho(x)h(x)dx"
        ],
        "example": {
          "problem": "Gire a região sob y = x², de 0 a 1, em torno do eixo x (discos) e do eixo y (cascas).",
          "steps": [
            "Em torno do eixo x, o disco tem raio x²; sua área é πx⁴.",
            "Integre de 0 a 1: Vₓ = π[x⁵/5]₀¹ = π/5.",
            "Em torno do eixo y, a casca tem raio x e altura x².",
            "Integre 2πx³ de 0 a 1: Vᵧ = 2π[x⁴/4]₀¹ = π/2.",
            "Os volumes diferem porque os eixos de rotação são diferentes."
          ],
          "answer": "V_x=\\frac\\pi5,\\qquad V_y=\\frac\\pi2"
        },
        "tip": {
          "module": "Integrais",
          "text": "Use pi*x^4 e depois 2*pi*x^3, sempre de 0 a 1; esses integrandos representam volume, apesar de o gráfico ser plano."
        }
      },
      {
        "id": "arco",
        "title": "Comprimento de arco",
        "theory": [
          "Para um gráfico y = f(x) com derivada contínua em [a, b], o comprimento de arco é a integral de √(1 + (f′)²). A fórmula vem da aproximação por segmentos e do teorema de Pitágoras.",
          "Para curvas parametrizadas regulares, integre a norma da velocidade √((x′)² + (y′)²). O comprimento é não negativo e não é a área sob a curva."
        ],
        "formulas": [
          "L=\\int_a^b\\sqrt{1+(f\\prime(x))^2}dx",
          "L=\\int_\\alpha^\\beta\\sqrt{(x\\prime(t))^2+(y\\prime(t))^2}dt"
        ],
        "example": {
          "problem": "Encontre o comprimento do gráfico y = (2/3)x^(3/2) entre 0 e 1.",
          "steps": [
            "Derive: f′(x) = √x, inclusive por extensão contínua em zero.",
            "O integrando do arco é √(1 + x).",
            "Uma antiderivada é (2/3)(1 + x)^(3/2).",
            "Avalie entre 0 e 1: (2/3)(2√2 − 1)."
          ],
          "answer": "L=\\frac23(2\\sqrt2-1)"
        },
        "tip": {
          "module": "Integrais",
          "text": "Digite sqrt(1+x), de 0 a 1, para obter aproximadamente 1,218951."
        }
      }
    ]
  },
  {
    "id": "series",
    "course": "Cálculo 2",
    "tag": "Unidade 06",
    "title": "Sequências e séries numéricas",
    "subtitle": "Convergência e critérios de decisão",
    "topics": [
      {
        "id": "sequencias",
        "title": "Sequências e convergência",
        "theory": [
          "Uma sequência é uma função a: ℕ → ℝ, escrita (aₙ). Ela converge a L se, para todo ε > 0, existe N tal que n ≥ N implica |aₙ − L| < ε. Sequências que não convergem a um real são divergentes.",
          "Toda sequência monótona e limitada converge. Ser limitada, isoladamente, não basta: (−1)ⁿ oscila entre dois valores. Pode-se usar limites de funções como apoio quando aₙ = f(n) e o limite de f no infinito existe."
        ],
        "formulas": [
          "a_n\\to L\\iff\\forall\\varepsilon>0\\ \\exists N\\ \\forall n\\geq N:\\ |a_n-L|<\\varepsilon"
        ],
        "example": {
          "problem": "Demonstre que aₙ = n/(n + 1) converge a 1.",
          "steps": [
            "Escreva aₙ = 1 − 1/(n + 1).",
            "Então |aₙ − 1| = 1/(n + 1).",
            "Dado ε > 0, escolha um inteiro N > 1/ε.",
            "Para n ≥ N, 1/(n + 1) < ε. Além disso a sequência cresce e fica abaixo de 1."
          ],
          "answer": "\\lim_{n\\to\\infty}\\frac n{n+1}=1"
        },
        "tip": {
          "module": "Funções",
          "text": "Use x/(x+1) e consulte valores em entradas inteiras. O módulo desenha a extensão contínua, não uma sequência discreta."
        }
      },
      {
        "id": "serie",
        "title": "Séries infinitas e séries geométricas",
        "theory": [
          "Uma série Σ aₙ converge se a sequência das somas parciais S_N = Σₙ₌₁ᴺ aₙ converge a um número finito. Somar infinitos termos significa tomar esse limite.",
          "Convergência exige aₙ → 0, mas essa condição não é suficiente: a série harmônica Σ1/n diverge. Uma série converge absolutamente se Σ|aₙ| converge; convergência absoluta implica convergência."
        ],
        "formulas": [
          "S_N=\\sum_{n=1}^N a_n,\\qquad\\sum_{n=1}^{\\infty}a_n=\\lim_{N\\to\\infty}S_N",
          "\\sum_{n=0}^{\\infty}ar^n=\\frac a{1-r}\\quad(|r|<1)"
        ],
        "example": {
          "problem": "Calcule Σₙ₌₀∞ (1/2)ⁿ.",
          "steps": [
            "Identifique uma série geométrica com primeiro termo a = 1 e razão r = 1/2.",
            "Como |r| < 1, as somas parciais convergem.",
            "S_N = (1 − (1/2)^(N + 1))/(1 − 1/2).",
            "O termo (1/2)^(N + 1) tende a zero; o limite é 2."
          ],
          "answer": "\\sum_{n=0}^{\\infty}\\left(\\frac12\\right)^n=2"
        },
        "tip": {
          "module": "Funções",
          "text": "Explore 2*(1-(1/2)^(x+1)) em entradas inteiras não negativas: são as somas parciais S_N."
        },
        "warning": "Os módulos não calculam séries automaticamente. A inspeção numérica de alguns termos não decide convergência."
      },
      {
        "id": "razao",
        "title": "Teste da razão",
        "theory": [
          "Para termos não nulos a partir de algum índice, examine L = lim |aₙ₊₁/aₙ|. Se L < 1, há convergência absoluta; se L > 1 (inclusive +∞), a série diverge. Se L = 1, o teste é inconclusivo.",
          "O teste é particularmente útil com fatoriais e exponenciais. Simplifique a razão antes de calcular o limite; não confunda razão de termos com razão de somas parciais."
        ],
        "formulas": [
          "L=\\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|,\\quad L<1\\Rightarrow\\text{convergência absoluta}"
        ],
        "example": {
          "problem": "Analise Σₙ₌₁∞ 2ⁿ/n!.",
          "steps": [
            "Seja aₙ = 2ⁿ/n!, sempre positivo.",
            "A razão é (2^(n + 1)/(n + 1)!)/(2ⁿ/n!) = 2/(n + 1).",
            "O limite dessa razão é zero.",
            "Como 0 < 1, a série converge absolutamente; o teste não fornece sua soma."
          ],
          "answer": "L=0<1\\quad\\Rightarrow\\quad\\sum_{n=1}^{\\infty}\\frac{2^n}{n!}\\text{ converge}"
        },
        "tip": {
          "module": "Funções",
          "text": "Plote 2/(x+1), a razão simplificada. A decisão vem de seu limite no infinito, não de um cálculo de série no aplicativo."
        }
      },
      {
        "id": "raiz",
        "title": "Teste da raiz",
        "theory": [
          "Calcule L = lim ⁿ√|aₙ|, quando o limite existe. Se L < 1, a série converge absolutamente; se L > 1, diverge; se L = 1, nada se conclui.",
          "A versão geral usa limsup ⁿ√|aₙ| e conserva os critérios. Potências elevadas a n frequentemente tornam a raiz mais simples do que a razão."
        ],
        "formulas": [
          "L=\\lim_{n\\to\\infty}\\sqrt[n]{|a_n|},\\quad L<1\\Rightarrow\\text{convergência absoluta}"
        ],
        "example": {
          "problem": "Analise Σₙ₌₁∞ (n/(3n + 1))ⁿ.",
          "steps": [
            "Defina aₙ = (n/(3n + 1))ⁿ.",
            "Como a base é positiva, ⁿ√|aₙ| = n/(3n + 1).",
            "Divida numerador e denominador por n: 1/(3 + 1/n) → 1/3.",
            "O limite é menor que 1; a série converge absolutamente."
          ],
          "answer": "L=\\frac13<1\\quad\\Rightarrow\\quad\\text{convergência absoluta}"
        },
        "tip": {
          "module": "Funções",
          "text": "Digite x/(3*x+1) para explorar a expressão obtida após extrair a raiz n-ésima."
        }
      },
      {
        "id": "integral-comparacao",
        "title": "Teste da integral e testes de comparação",
        "theory": [
          "Teste da integral: se f é positiva, contínua e decrescente em [N, ∞) e aₙ = f(n), a série Σ aₙ e a integral imprópria ∫_N^∞ f(x) dx convergem ou divergem juntas. Seus valores não são em geral iguais.",
          "Comparação direta: para 0 ≤ aₙ ≤ bₙ a partir de algum índice, convergência de Σbₙ implica convergência de Σaₙ; divergência de Σaₙ implica divergência de Σbₙ.",
          "Comparação no limite: para sequências positivas com aₙ/bₙ → c, 0 < c < ∞, as séries têm o mesmo comportamento. A série p, Σ1/nᵖ, converge exatamente quando p > 1."
        ],
        "formulas": [
          "\\int_1^{\\infty}\\frac{dx}{x^p}<\\infty\\iff p>1",
          "0<\\lim_{n\\to\\infty}\\frac{a_n}{b_n}<\\infty\\Rightarrow\\sum a_n,\\sum b_n\\text{ têm o mesmo caráter}"
        ],
        "example": {
          "problem": "Determine se Σₙ₌₁∞ 1/(n² + 1) converge.",
          "steps": [
            "Compare com bₙ = 1/n².",
            "Para n ≥ 1, 0 < 1/(n² + 1) ≤ 1/n².",
            "A função 1/x² é positiva, contínua e decrescente em [1, ∞).",
            "Sua integral imprópria é lim R→∞ [−1/x]₁ᴿ = 1; logo Σ1/n² converge.",
            "Por comparação direta, a série original converge. Pela comparação no limite, a razão n²/(n² + 1) → 1 confirma a conclusão."
          ],
          "answer": "\\sum_{n=1}^{\\infty}\\frac1{n^2+1}\\text{ converge}"
        },
        "tip": {
          "module": "Integrais",
          "text": "Integre 1/x^2 de 1 a um limite finito crescente. A definição imprópria exige um limite; o módulo não aceita ∞ como extremidade."
        },
        "theorem": {
          "title": "Cuidado com hipóteses",
          "text": "Comparações requerem termos não negativos (positivos na comparação no limite). O teste da integral requer positividade, continuidade e monotonicidade eventual."
        }
      }
    ]
  },
  {
    "id": "multivariavel",
    "course": "Cálculo 2",
    "tag": "Unidade 07",
    "title": "Funções de várias variáveis",
    "subtitle": "Parciais, aproximação linear e otimização",
    "topics": [
      {
        "id": "superficies",
        "title": "Domínios, superfícies e curvas de nível",
        "theory": [
          "Uma função f: D ⊆ ℝ² → ℝ associa um valor a cada par (x, y). O gráfico é a superfície z = f(x, y). O domínio pode ter fronteira curva e não precisa ser retangular.",
          "As curvas de nível f(x, y) = k mostram pontos de mesma altura. Limites em duas variáveis devem ser independentes de todos os caminhos de aproximação; verificar alguns caminhos não prova existência, mas dois resultados diferentes provam inexistência."
        ],
        "formulas": [
          "\\operatorname{graf}(f)=\\{(x,y,f(x,y)):(x,y)\\in D\\}",
          "f(x,y)=k\\quad\\text{(curva de nível)}"
        ],
        "example": {
          "problem": "Descreva o domínio e os níveis de f(x, y) = √(9 − x² − y²).",
          "steps": [
            "A raiz exige 9 − x² − y² ≥ 0: domínio é o disco fechado de raio 3.",
            "Os valores de f vão de 0 a 3.",
            "Para nível k ∈ [0, 3], elevar ao quadrado fornece x² + y² = 9 − k².",
            "Para 0 ≤ k < 3 os níveis são círculos; para k = 3 o nível reduz-se à origem."
          ],
          "answer": "D=\\{(x,y):x^2+y^2\\leq9\\},\\quad x^2+y^2=9-k^2"
        },
        "tip": {
          "module": "Funções",
          "text": "Fixe y = 1 e use sqrt(8-x^2) para visualizar um corte. O aplicativo não desenha superfícies 3D."
        }
      },
      {
        "id": "parciais-plano",
        "title": "Derivadas parciais, gradiente e plano tangente",
        "theory": [
          "A derivada parcial em x mantém y constante; a parcial em y mantém x constante. A existência de parciais isoladamente não garante diferenciabilidade. Parciais contínuas em uma vizinhança do ponto garantem diferenciabilidade ali.",
          "O gradiente ∇f = (f_x, f_y) organiza as taxas de variação. Para uma função diferenciável, a derivada na direção de um vetor unitário u é ∇f · u; o gradiente não nulo aponta para o crescimento mais rápido. O plano tangente é a aproximação linear da superfície."
        ],
        "formulas": [
          "f_x(a,b)=\\lim_{h\\to0}\\frac{f(a+h,b)-f(a,b)}h",
          "\\nabla f=(f_x,f_y),\\quad D_{\\mathbf u}f=\\nabla f\\cdot\\mathbf u\\quad(\\|\\mathbf u\\|=1)",
          "z=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)"
        ],
        "example": {
          "problem": "Encontre o plano tangente a f(x, y) = x² + xy + y² em (1, 2).",
          "steps": [
            "Calcule f_x = 2x + y e f_y = x + 2y.",
            "No ponto, f(1, 2) = 7, f_x = 4 e f_y = 5.",
            "O polinômio tem parciais contínuas; portanto é diferenciável.",
            "Substitua na aproximação linear: z = 7 + 4(x − 1) + 5(y − 2).",
            "Simplifique para z = 4x + 5y − 7."
          ],
          "answer": "\\nabla f(1,2)=(4,5),\\qquad z=4x+5y-7"
        },
        "tip": {
          "module": "Derivadas",
          "text": "Fixe y = 2 e use x^2+2*x+4 em x₀ = 1: a inclinação 4 confirma f_x. Para f_y, use 1+x+x^2 em x₀ = 2."
        }
      },
      {
        "id": "otimizacao",
        "title": "Otimização multivariável e teste da Hessiana",
        "theory": [
          "Para uma função diferenciável num ponto interior de máximo ou mínimo local, o gradiente é zero. Esses pontos críticos são candidatos; alguns são selas. Pontos de fronteira e pontos onde não há diferenciabilidade exigem análise separada.",
          "Para f com segundas parciais contínuas perto de um ponto crítico, defina D = f_xx f_yy − f_xy². Se D > 0 e f_xx > 0, há mínimo local; se D > 0 e f_xx < 0, máximo; D < 0 indica sela e D = 0 é inconclusivo.",
          "Em uma região compacta, uma função contínua atinge extremos absolutos. Compare candidatos interiores e valores da fronteira; o teste local sozinho não resolve o problema global."
        ],
        "formulas": [
          "\\nabla f(a,b)=0,\\qquad D=f_{xx}f_{yy}-(f_{xy})^2",
          "D>0,\\ f_{xx}>0\\Rightarrow\\text{mínimo};\\quad D<0\\Rightarrow\\text{sela}"
        ],
        "example": {
          "problem": "Classifique o ponto crítico de f(x, y) = x² + y² − 2x − 4y.",
          "steps": [
            "Resolva f_x = 2x − 2 = 0 e f_y = 2y − 4 = 0: (1, 2).",
            "As segundas parciais são f_xx = 2, f_yy = 2, f_xy = 0.",
            "D = 4 > 0 e f_xx > 0: mínimo local.",
            "Completando quadrados, f = (x − 1)² + (y − 2)² − 5.",
            "Essa expressão é sempre ≥ −5, com igualdade somente em (1, 2); o mínimo também é global."
          ],
          "answer": "\\min_{\\mathbb R^2}f=f(1,2)=-5"
        },
        "tip": {
          "module": "Funções",
          "text": "Fixe y = 2 e plote x^2-2*x-4. Esse corte mostra um mínimo em x = 1, mas a conclusão global depende da análise em duas variáveis."
        }
      }
    ]
  }
];
