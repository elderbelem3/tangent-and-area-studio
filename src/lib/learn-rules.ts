export type CalculusRule = {
  id: string;
  title: string;
  explanation: string;
  formulas: string[];
  condition: string;
  example: { text: string; formula: string };
};

export type RulePillar = {
  id: string;
  title: string;
  subtitle: string;
  rules: CalculusRule[];
};

// Educational reference only: formulas are rendered by MathFormula, not evaluated.
export const RULE_PILLARS: RulePillar[] = [
  {
    id: "funcoes", title: "Funções", subtitle: "Domínio, simetrias, correspondências e transformações",
    rules: [
      {
        id: "dominio-imagem", title: "Domínio, contradomínio e imagem",
        explanation: "O domínio reúne as entradas permitidas; o contradomínio é o conjunto de chegada declarado. A imagem contém somente os valores efetivamente atingidos pela função.",
        formulas: [String.raw`f:A\to B,\qquad \operatorname{Im}(f)=\{f(x):x\in A\}\subseteq B`, String.raw`\frac{1}{g(x)}:\ g(x)\ne0;\quad \sqrt{g(x)}:\ g(x)\ge0`, String.raw`\log_b(g(x)):\ g(x)>0,\quad b>0,\ b\ne1`],
        condition: "Interseccione todas as restrições da expressão. Raízes pares exigem radicando não negativo; o domínio também deve excluir os polos trigonométricos.",
        example: { text: "A raiz quadrada de x − 1 aceita entradas a partir de 1 e produz apenas valores não negativos.", formula: String.raw`f(x)=\sqrt{x-1},\quad D_f=[1,\infty),\quad \operatorname{Im}(f)=[0,\infty)` },
      },
      {
        id: "par-impar", title: "Funções pares e ímpares",
        explanation: "Uma função par tem simetria em relação ao eixo vertical. Uma função ímpar tem simetria em relação à origem. Uma função pode não ter nenhuma dessas simetrias; a função zero tem ambas.",
        formulas: [String.raw`\text{Par: }f(-x)=f(x)`, String.raw`\text{Ímpar: }f(-x)=-f(x)`],
        condition: "O domínio precisa ser simétrico: se x pertence ao domínio, −x também deve pertencer. A identidade deve valer para todas as entradas, não apenas em pontos amostrados.",
        example: { text: "O quadrado é par e o cubo é ímpar.", formula: String.raw`(-x)^2=x^2,\qquad (-x)^3=-x^3` },
      },
      {
        id: "injetiva", title: "Função injetiva",
        explanation: "Entradas distintas produzem saídas distintas. No gráfico de uma função real, uma reta horizontal encontra no máximo um ponto quando a função é injetiva.",
        formulas: [String.raw`f(x_1)=f(x_2)\ \Longrightarrow\ x_1=x_2`],
        condition: "A propriedade depende do domínio escolhido. A função quadrática não é injetiva em ℝ, mas torna-se injetiva quando restrita a [0, ∞).",
        example: { text: "Uma função afim com coeficiente angular não nulo é injetiva.", formula: String.raw`2x_1+3=2x_2+3\ \Longrightarrow\ x_1=x_2` },
      },
      {
        id: "sobrejetiva-bijetiva", title: "Funções sobrejetivas e bijetivas",
        explanation: "Uma função é sobrejetiva quando atinge todo o contradomínio. É bijetiva quando é simultaneamente injetiva e sobrejetiva, estabelecendo uma correspondência um a um.",
        formulas: [String.raw`\text{Sobrejetiva: }\operatorname{Im}(f)=B`, String.raw`\text{Bijetiva: injetiva e sobrejetiva}`],
        condition: "Declare o domínio e o contradomínio antes de classificar a função. Alterar o contradomínio pode mudar a sobrejetividade.",
        example: { text: "O quadrado não é sobrejetivo de ℝ em ℝ; com domínio e contradomínio não negativos, é uma bijeção.", formula: String.raw`f:[0,\infty)\to[0,\infty),\qquad f(x)=x^2` },
      },
      {
        id: "translacoes", title: "Translações, reflexões e escalas",
        explanation: "Somar uma constante fora da função desloca o gráfico verticalmente. Subtrair uma constante da entrada desloca-o horizontalmente. Multiplicadores alteram escalas e podem refletir o gráfico.",
        formulas: [String.raw`g(x)=f(x-h)+k`, String.raw`g(x)=a\,f(bx),\qquad a\ne0,\ b\ne0`],
        condition: "h > 0 desloca para a direita e k > 0 para cima. O fator vertical é |a| e o horizontal é 1/|b|. Se a < 0, há reflexão no eixo X; se b < 0, no eixo Y. Transforme também o domínio.",
        example: { text: "A parábola básica desloca-se 2 unidades para a direita e 3 para baixo.", formula: String.raw`f(x)=x^2\quad\Longrightarrow\quad g(x)=(x-2)^2-3` },
      },
      {
        id: "inversa", title: "Inversa e composição",
        explanation: "A inversa desfaz a correspondência de uma bijeção. Para encontrá-la, escreva y = f(x), isole x e troque o nome da entrada. Seus gráficos são reflexos em relação à reta y = x.",
        formulas: [String.raw`f^{-1}(f(x))=x,\qquad f(f^{-1}(y))=y`, String.raw`D_{f^{-1}}=\operatorname{Im}(f),\qquad \operatorname{Im}(f^{-1})=D_f`],
        condition: "f⁻¹ não é o recíproco 1/f. Sem bijetividade, pode ser necessário restringir o domínio e ajustar o contradomínio antes de obter uma inversa.",
        example: { text: "Isolando a entrada de uma função afim, obtemos a função inversa.", formula: String.raw`f(x)=2x+3\quad\Longrightarrow\quad f^{-1}(x)=\frac{x-3}{2}` },
      },
    ],
  },
  {
    id: "limites", title: "Limites", subtitle: "Leis algébricas, aproximação lateral e indeterminações",
    rules: [
      {
        id: "soma-linearidade", title: "Constante, soma e diferença",
        explanation: "Se os limites de duas funções existem e são finitos, o limite de sua combinação linear é a mesma combinação de seus limites.",
        formulas: [String.raw`\lim_{x\to a}c=c`, String.raw`\lim_{x\to a}[\alpha f(x)+\beta g(x)]=\alpha L+\beta M`],
        condition: "Aqui L = lim f(x) e M = lim g(x), quando x → a, são números reais; α e β são constantes. Não separe expressões que produzam ∞ − ∞ como se fossem números.",
        example: { text: "Para polinômios, a continuidade permite substituir diretamente a entrada.", formula: String.raw`\lim_{x\to2}(3x+1)=3\cdot2+1=7` },
      },
      {
        id: "produto-quociente", title: "Produto e quociente",
        explanation: "O limite de um produto é o produto dos limites. O limite de um quociente é o quociente dos limites quando o limite do denominador não é zero.",
        formulas: [String.raw`\lim_{x\to a}f(x)g(x)=LM`, String.raw`\lim_{x\to a}\frac{f(x)}{g(x)}=\frac{L}{M},\qquad M\ne0`],
        condition: "L e M devem existir e ser finitos. Se M = 0, a lei do quociente não se aplica; examine sinais e limites laterais ou transforme a expressão.",
        example: { text: "O denominador tende a 3, portanto o quociente pode ser calculado diretamente.", formula: String.raw`\lim_{x\to2}\frac{x^2+1}{x+1}=\frac{5}{3}` },
      },
      {
        id: "potencias-raizes", title: "Potências e raízes",
        explanation: "Potências inteiras positivas preservam limites finitos. Raízes também preservam o limite onde a função raiz é contínua no domínio real.",
        formulas: [String.raw`\lim_{x\to a}[f(x)]^n=L^n,\qquad n\in\mathbb{N},\ n\ge1`, String.raw`\lim_{x\to a}\sqrt[n]{f(x)}=\sqrt[n]{L}`],
        condition: "Para raízes pares, f(x) deve ser não negativa nas entradas consideradas e L ≥ 0. Expoentes negativos exigem L ≠ 0; outras potências reais exigem conferir seu domínio.",
        example: { text: "A raiz é contínua nas entradas deste exemplo.", formula: String.raw`\lim_{x\to3}\sqrt{x+1}=\sqrt4=2` },
      },
      {
        id: "laterais", title: "Limites laterais e continuidade",
        explanation: "O limite bilateral existe quando os limites pela esquerda e pela direita existem e coincidem. Continuidade no ponto exige também que o valor da função seja definido e igual ao limite.",
        formulas: [String.raw`\lim_{x\to a}f(x)=L\ \Longleftrightarrow\ \lim_{x\to a^-}f(x)=\lim_{x\to a^+}f(x)=L`, String.raw`\text{Continuidade em }a:\quad \lim_{x\to a}f(x)=f(a)`],
        condition: "A equivalência bilateral pressupõe aproximação possível por ambos os lados. Em extremidades do domínio, a continuidade é examinada pelo lado permitido.",
        example: { text: "Os sinais opostos junto ao polo impedem um limite bilateral para 1/x em zero.", formula: String.raw`\lim_{x\to0^-}\frac1x=-\infty,\qquad \lim_{x\to0^+}\frac1x=+\infty` },
      },
      {
        id: "indeterminacoes", title: "Indeterminações e transformações",
        explanation: "Uma forma indeterminada não fornece o resultado do limite. Fatoração, racionalização, identidades e comparação de crescimento podem revelar o comportamento verdadeiro.",
        formulas: [String.raw`\frac00,\quad\frac{\infty}{\infty},\quad0\cdot\infty,\quad\infty-\infty`, String.raw`1^\infty,\quad0^0,\quad\infty^0`],
        condition: "Esses símbolos descrevem formas de limite, não operações numéricas válidas. A regra de L'Hôpital requer suas hipóteses de derivabilidade e a existência do limite apropriado do quociente das derivadas.",
        example: { text: "O fator pode ser cancelado para x ≠ 2; isso preserva o limite, mas não define a expressão original em 2.", formula: String.raw`\lim_{x\to2}\frac{x^2-4}{x-2}=\lim_{x\to2}(x+2)=4` },
      },
      {
        id: "notaveis-confronto", title: "Limites notáveis e confronto",
        explanation: "Limites notáveis simplificam aproximações trigonométricas, exponenciais e logarítmicas. Pelo teorema do confronto, uma função entre duas outras com o mesmo limite também tende a esse valor.",
        formulas: [String.raw`\lim_{x\to0}\frac{\sin x}{x}=1,\qquad \lim_{x\to0}\frac{e^x-1}{x}=1`, String.raw`\lim_{x\to0}\frac{\ln(1+x)}{x}=1`],
        condition: "Use radianos no limite trigonométrico. No confronto, as desigualdades devem valer em uma vizinhança perfurada do ponto dentro do domínio.",
        example: { text: "O fator oscilatório fica entre −1 e 1, enquanto x² tende a zero.", formula: String.raw`-x^2\le x^2\sin(1/x)\le x^2\quad\Longrightarrow\quad\lim_{x\to0}x^2\sin(1/x)=0` },
      },
    ],
  },
  {
    id: "derivadas", title: "Derivadas", subtitle: "Taxas de variação e regras de diferenciação",
    rules: [
      {
        id: "constante-potencia", title: "Constante e potência",
        explanation: "Uma constante não varia, portanto sua derivada é zero. Para uma potência, multiplique pelo expoente e reduza o expoente em uma unidade.",
        formulas: [String.raw`\frac{d}{dx}c=0`, String.raw`\frac{d}{dx}x^n=nx^{n-1}`],
        condition: "A regra vale nos pontos onde a potência real é definida e diferenciável. Para um expoente real geral, x > 0 é uma condição suficiente. A potência x⁰ = 1 tem derivada zero.",
        example: { text: "O termo constante desaparece ao derivar.", formula: String.raw`\frac{d}{dx}(x^3+5)=3x^2` },
      },
      {
        id: "linearidade", title: "Soma e multiplicação por constante",
        explanation: "Derive cada parcela separadamente e preserve seus fatores constantes.",
        formulas: [String.raw`(\alpha f+\beta g)'=\alpha f'+\beta g'`],
        condition: "f e g devem ser diferenciáveis no ponto considerado; α e β são constantes em relação a x.",
        example: { text: "A derivação se distribui pela soma, mas não por um produto de funções.", formula: String.raw`\frac{d}{dx}(3x^2-4x+7)=6x-4` },
      },
      {
        id: "produto", title: "Regra do produto",
        explanation: "Derive o primeiro fator e mantenha o segundo; depois mantenha o primeiro e derive o segundo. Some as duas parcelas.",
        formulas: [String.raw`(fg)'=f'g+fg'`],
        condition: "Ambos os fatores devem ser diferenciáveis. A derivada do produto não é, em geral, o produto das derivadas.",
        example: { text: "O polinômio e o seno contribuem separadamente para a derivada.", formula: String.raw`\frac{d}{dx}(x^2\sin x)=2x\sin x+x^2\cos x` },
      },
      {
        id: "quociente", title: "Regra do quociente",
        explanation: "No numerador, subtraia o produto do numerador pela derivada do denominador do produto da derivada do numerador pelo denominador. Divida pelo quadrado do denominador.",
        formulas: [String.raw`\left(\frac{f}{g}\right)'=\frac{f'g-fg'}{g^2}`],
        condition: "f e g devem ser diferenciáveis e g(x) ≠ 0. Os pontos excluídos do domínio original não são recuperados por simplificações.",
        example: { text: "A expressão e sua derivada permanecem indefinidas em x = −1.", formula: String.raw`\frac{d}{dx}\left(\frac{x}{x+1}\right)=\frac{1}{(x+1)^2},\qquad x\ne-1` },
      },
      {
        id: "cadeia", title: "Regra da cadeia",
        explanation: "Derive a função externa na entrada interna e multiplique pela derivada da função interna. Essa regra se aplica a composições, inclusive potências, raízes e logaritmos.",
        formulas: [String.raw`\frac{d}{dx}f(g(x))=f'(g(x))\,g'(x)`],
        condition: "g deve ser diferenciável em x e f em g(x). Verifique o domínio da composição antes de derivar.",
        example: { text: "A derivada da entrada 3x fornece o fator 3.", formula: String.raw`\frac{d}{dx}\sin(3x)=3\cos(3x)` },
      },
      {
        id: "trigonometricas", title: "Derivadas trigonométricas",
        explanation: "As derivadas de seno e cosseno alternam entre essas funções, com mudança de sinal no cosseno. As demais seguem de identidades e da regra do quociente.",
        formulas: [String.raw`(\sin x)'=\cos x,\qquad (\cos x)'=-\sin x`, String.raw`(\tan x)'=\sec^2x,\qquad (\cot x)'=-\csc^2x`, String.raw`(\sec x)'=\sec x\tan x,\qquad (\csc x)'=-\csc x\cot x`],
        condition: "Os ângulos são medidos em radianos. Tangente e secante exigem cos x ≠ 0; cotangente e cossecante exigem sin x ≠ 0. Com outra entrada, aplique a cadeia.",
        example: { text: "A entrada quadrática também precisa ser derivada.", formula: String.raw`\frac{d}{dx}\cos(x^2)=-2x\sin(x^2)` },
      },
      {
        id: "exponenciais-logaritmos", title: "Exponenciais e logaritmos",
        explanation: "A exponencial de base e é sua própria derivada. Outras bases trazem um fator logarítmico. O logaritmo natural tem derivada recíproca da entrada.",
        formulas: [String.raw`(e^x)'=e^x,\qquad (b^x)'=b^x\ln b`, String.raw`(\ln x)'=\frac1x,\qquad (\log_b x)'=\frac{1}{x\ln b}`, String.raw`\frac{d}{dx}\ln|u(x)|=\frac{u'(x)}{u(x)}`],
        condition: "b > 0 e b ≠ 1 para logaritmos. ln x e log_b x exigem x > 0. Para ln|u|, u deve ser diferenciável e não nula.",
        example: { text: "O logaritmo composto só é real quando a entrada é positiva.", formula: String.raw`\frac{d}{dx}\ln(3x+1)=\frac{3}{3x+1},\qquad x>-\frac13` },
      },
    ],
  },
  {
    id: "integrais", title: "Integrais", subtitle: "Primitivas, linearidade e acumulação definida",
    rules: [
      {
        id: "indefinida", title: "Integral indefinida e constante C",
        explanation: "A integral indefinida representa uma família de primitivas: funções cuja derivada é o integrando. A constante C aparece porque funções que diferem por uma constante têm a mesma derivada.",
        formulas: [String.raw`\int f(x)\,dx=F(x)+C,\qquad F'(x)=f(x)`],
        condition: "A igualdade vale em um intervalo onde F é diferenciável. Em domínios desconexos, a constante pode ser diferente em cada intervalo.",
        example: { text: "Derivar a resposta recupera o integrando.", formula: String.raw`\int 2x\,dx=x^2+C` },
      },
      {
        id: "potencia", title: "Potência e caso logarítmico",
        explanation: "Para integrar uma potência, aumente o expoente em uma unidade e divida pelo novo expoente. O expoente −1 é uma exceção e produz um logaritmo.",
        formulas: [String.raw`\int x^n\,dx=\frac{x^{n+1}}{n+1}+C,\qquad n\ne-1`, String.raw`\int\frac1x\,dx=\ln|x|+C`],
        condition: "Trabalhe em um intervalo onde a potência real e sua primitiva são válidas; para um expoente real geral, x > 0 é suficiente. A fórmula de 1/x exige x ≠ 0 e não autoriza integrar através de zero.",
        example: { text: "A integral de x² apresenta expoente 3 e denominador 3.", formula: String.raw`\int x^2\,dx=\frac{x^3}{3}+C` },
      },
      {
        id: "linearidade", title: "Linearidade da integração",
        explanation: "A integral de uma soma é a soma das integrais, e fatores constantes podem sair do sinal de integração. A propriedade vale tanto para primitivas quanto para integrais definidas existentes.",
        formulas: [String.raw`\int[\alpha f(x)+\beta g(x)]\,dx=\alpha F(x)+\beta G(x)+C`],
        condition: "α e β são constantes e F, G são primitivas no intervalo. Não existe uma regra geral que transforme a integral de um produto no produto de integrais.",
        example: { text: "Cada termo tem uma primitiva imediata.", formula: String.raw`\int(3x^2-4)\,dx=x^3-4x+C` },
      },
      {
        id: "exponenciais-logaritmos", title: "Integrais de exponenciais e logaritmos",
        explanation: "A exponencial de base e permanece igual ao integrar. Para outra base, divida pelo logaritmo da base. Integrar o próprio logaritmo requer integração por partes.",
        formulas: [String.raw`\int e^x\,dx=e^x+C,\qquad \int b^x\,dx=\frac{b^x}{\ln b}+C`, String.raw`\int\ln x\,dx=x\ln x-x+C`, String.raw`\int\log_b x\,dx=\frac{x\ln x-x}{\ln b}+C`],
        condition: "b > 0 e b ≠ 1 nas fórmulas com ln b no denominador; para b = 1, a integral é x + C. As fórmulas de logaritmos exigem x > 0.",
        example: { text: "A composição linear traz um divisor igual à derivada da entrada.", formula: String.raw`\int e^{2x}\,dx=\frac{e^{2x}}{2}+C` },
      },
      {
        id: "trigonometricas", title: "Integrais trigonométricas imediatas",
        explanation: "As primitivas trigonométricas seguem das respectivas derivadas. Confira o sinal na integral do seno e da cossecante ao quadrado.",
        formulas: [String.raw`\int\sin x\,dx=-\cos x+C,\qquad \int\cos x\,dx=\sin x+C`, String.raw`\int\sec^2x\,dx=\tan x+C,\qquad \int\csc^2x\,dx=-\cot x+C`, String.raw`\int\tan x\,dx=-\ln|\cos x|+C`],
        condition: "Use radianos e intervalos sem polos do integrando. Com uma entrada composta, a primitiva imediata só se aplica quando o fator da derivada interna está presente ou é devidamente compensado.",
        example: { text: "O fator 3 cancela a derivada da entrada do cosseno.", formula: String.raw`\int3\cos(3x)\,dx=\sin(3x)+C` },
      },
      {
        id: "definida-tfc", title: "Integral definida e Teorema Fundamental",
        explanation: "A integral definida mede acumulação com sinal em um intervalo e resulta em um número. O Teorema Fundamental relaciona esse valor a uma primitiva, avaliada nos extremos.",
        formulas: [String.raw`\int_a^b f(x)\,dx=F(b)-F(a),\qquad F'=f`, String.raw`\frac{d}{dx}\int_a^x f(t)\,dt=f(x)`],
        condition: "A continuidade de f no intervalo fechado é uma condição suficiente para essas fórmulas. Singularidades exigem limites de integrais impróprias e análise de convergência; não basta substituir os extremos.",
        example: { text: "A constante da primitiva cancela na diferença dos extremos.", formula: String.raw`\int_0^2 x^2\,dx=\left[\frac{x^3}{3}\right]_0^2=\frac83` },
      },
      {
        id: "intervalos-area", title: "Orientação, aditividade e área",
        explanation: "Trocar os limites muda o sinal. Dividir o intervalo preserva a soma das acumulações. Áreas geométricas são não negativas, enquanto a integral da função pode ter cancelamento entre regiões positivas e negativas.",
        formulas: [String.raw`\int_a^a f(x)\,dx=0,\qquad \int_b^a f(x)\,dx=-\int_a^b f(x)\,dx`, String.raw`\int_a^b f(x)\,dx=\int_a^c f(x)\,dx+\int_c^b f(x)\,dx`, String.raw`\text{Área entre curva e eixo X}=\int_a^b|f(x)|\,dx\quad(a<b)`],
        condition: "As integrais envolvidas devem existir. A identidade de intervalo nulo pressupõe uma função integrável; não resolve singularidades. Para área, separe os intervalos onde a função muda de sinal.",
        example: { text: "No intervalo simétrico, as acumulações de x se cancelam, mas a área total é 1.", formula: String.raw`\int_{-1}^1x\,dx=0,\qquad \int_{-1}^1|x|\,dx=1` },
      },
    ],
  },
];