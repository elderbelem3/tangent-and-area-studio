export type CodeGuideSection = {
  id: string;
  title: string;
  summary: string;
  flow: string[];
  files: { path: string; role: string }[];
  topics: { title: string; text: string }[];
  code: { path: string; source: string; explanation: string };
};

/** Educational excerpts of the implementation, not executable examples. */
export const CODE_GUIDE: CodeGuideSection[] = [
  {
    id: "arquitetura", title: "Visão geral do código",
    summary: "Uma interface em React, páginas organizadas pelo TanStack Router e um motor matemático compartilhado: cada parte tem uma responsabilidade.",
    flow: ["Ação na tela", "Estado React", "Motor matemático", "Resultado e gráfico"],
    files: [
      { path: "src/routes/__root.tsx", role: "Estrutura comum: cabeçalho, menu Como Usar, abas, temas e rodapé. Outlet é o espaço onde a página escolhida aparece." },
      { path: "src/routes/", role: "Uma página por arquivo: index é Funções; limites, derivadas, integrais, aprenda, ia e creditos são as outras abas." },
      { path: "src/components/", role: "Peças reutilizáveis da interface: entradas, teclados, gráficos, tabelas e painéis." },
      { path: "src/lib/", role: "Regras de cálculo, conversões, conteúdo de estudo, análise e armazenamento temporário." },
    ],
    topics: [
      { title: "React e TypeScript", text: "React atualiza a tela quando um valor muda. TypeScript descreve os tipos dos dados e ajuda a detectar ligações incorretas antes da execução. Um componente é uma função que descreve uma parte da tela." },
      { title: "Navegação entre páginas", text: "TanStack Start organiza a aplicação; TanStack Router associa cada URL a uma página. Link e useNavigate mudam de aba sem exigir uma recarga completa. O pré-carregamento das abas reduz o tempo de espera, sem manter gráficos invisíveis montados." },
      { title: "Bibliotecas com papéis distintos", text: "mathjs interpreta expressões e oferece operações simbólicas; KaTeX apresenta fórmulas; MathLive oferece edição visual; Recharts desenha curvas comparadas; d3-zoom coordena gestos; React Three Fiber e Three.js desenham cenas 3D. Os controles usam os componentes compartilhados da interface." },
    ],
    code: { path: "src/routes/__root.tsx · trecho", source: '<main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:py-10">\n  <div className="module-enter"><Outlet /></div>\n</main>', explanation: "O cabeçalho permanece compartilhado. Outlet recebe a página correspondente à aba escolhida; module-enter aplica a transição visual." },
  },
  {
    id: "entrada", title: "Entradas e teclado científico",
    summary: "A notação visual é traduzida para uma expressão simples, que o interpretador consegue calcular.",
    flow: ["Digitação ou atalho", "MathLive / campo comum", "Expressão normalizada", "mathjs"],
    files: [
      { path: "src/components/FunctionEditor.tsx", role: "Lista os campos de Funções e Derivadas, incluindo adição e exclusão." },
      { path: "src/components/MathBlockInput.tsx", role: "Editor visual MathLive, cursor, seleção, digitação e exclusão." },
      { path: "src/components/Lab.tsx", role: "Teclado por categorias, inserção na posição do cursor e campos comuns usados em Limites e Integrais." },
      { path: "src/lib/math-blocks.ts · src/lib/math-suggestions.ts", role: "Conversão de blocos, potências, raízes, frações e sugestões contextuais compartilhadas." },
    ],
    topics: [
      { title: "Notação visual e sintaxe interna", text: "Uma potência ou fração pode aparecer como estrutura matemática, mas a expressão em texto continua sendo a fonte de verdade para os cálculos. Os atalhos ^, _ e / criam estruturas; os botões científicos inserem funções, constantes e campos editáveis conforme o template." },
      { title: "Autocompletar e logaritmos", text: "As sugestões substituem apenas o token próximo ao cursor. Clique, Tab ou Enter aceitam uma sugestão; Esc ou clique fora fecham a lista. A normalização reconhece ln, log10 e logaritmos com base em subscrito, preservando nomes de funções e multiplicação implícita como 3x." },
      { title: "Computador e celular", text: "Os campos comuns recebem texto diretamente. O editor MathLive integra foco, entrada nativa e Backspace com seu modelo matemático. O botão de apagar atualiza a expressão imediatamente. Os gestos de zoom e pan ficam restritos ao gráfico para não bloquear a digitação ou a rolagem da página." },
    ],
    code: { path: "src/lib/calc.ts · trecho", source: 'const code = compile(normalize(expr));\nconst v = code.evaluate({ x, e: Math.E, pi: Math.PI });', explanation: "normalize prepara a sintaxe; compile cria uma expressão avaliável. evaluate substitui x pelo valor solicitado e fornece as constantes e e pi. A função completa trata erros e resultados não reais ou não finitos." },
  },
  {
    id: "funcoes", title: "Aba Funções",
    summary: "Conecta expressão, intervalo, comparação de curvas, tabela de valores e detecção de superfícies 3D.",
    flow: ["FunctionEditor", "Estado por função", "Detecção 2D/3D", "Gráfico e tabela"],
    files: [
      { path: "src/routes/index.tsx", role: "Coordena as funções, o intervalo e a escolha entre o gráfico 2D e a cena 3D." },
      { path: "src/lib/comparison.ts", role: "Gerencia até cinco posições f, g, h, p e q; cada posição mantém sua identidade e cor." },
      { path: "src/components/ComparisonPlot.tsx · src/lib/analysis.ts", role: "Curvas comparadas, legenda interativa e análise de domínio, raízes, extremos e derivadas." },
      { path: "src/lib/study-examples.ts", role: "Modelos oficiais de estudo usados pelos quatro módulos." },
    ],
    topics: [
      { title: "Adicionar, remover e comparar", text: "Cada função tem uma posição estável (slot). Excluir g não renomeia h nem troca sua cor. A legenda permite controlar a visibilidade das curvas. Os exemplos preenchem a expressão; os campos x mín e x máx definem o intervalo inicial de visualização." },
      { title: "Como a aba decide o gráfico", text: "A página verifica todas as expressões, não apenas f. Se alguma precisa de duas variáveis, usa o Smart Canvas; caso contrário, usa ComparisonPlot. Na cena 3D, funções de x e y são superfícies e funções só de x aparecem como curvas no plano y = 0." },
      { title: "Análise e casos especiais", text: "A análise procura informações no intervalo estudado e considera restrições de domínio. Constantes reais são detectadas estruturalmente: não se apresenta uma lista de infinitos pontos críticos. A função identicamente zero recebe uma explicação específica, sem enumerar todas as suas raízes." },
    ],
    code: { path: "src/routes/index.tsx · trecho", source: 'const is3D = functions.some((f) => needs3D(f.expression));', explanation: "some verifica cada função cadastrada. Uma função 3D adicional também muda a visualização para uma cena que recebe todas as camadas." },
  },
  {
    id: "tabelas", title: "Tabela de Valores e encontrar x",
    summary: "Consulta valores nos dois sentidos, mantendo dados independentes para cada função e modalidade.",
    flow: ["Função e modalidade", "Linhas preenchidas", "Avaliação / busca numérica", "Valores ou aviso"],
    files: [
      { path: "src/components/ValueTables.tsx", role: "Seleção de função, duas modalidades, resultados e limpeza com confirmação geral." },
      { path: "src/lib/value-tables.ts", role: "Estado separado por expressão e posição; até cinco linhas por modalidade." },
      { path: "src/lib/inverse.ts", role: "solveForX busca soluções reais numericamente no intervalo utilizado pela tabela." },
    ],
    topics: [
      { title: "De x para f(x)", text: "Na primeira modalidade, a tabela avalia a função no x informado. Um ponto fora do domínio real aparece como indefinido. Ela é uma consulta de funções de uma variável, não uma tabela de superfícies com duas variáveis." },
      { title: "De f(x) para x", text: "Na segunda modalidade, o valor informado é o resultado desejado da função. solveForX procura valores de x em [−50, 50] e pode mostrar várias soluções. Essa busca numérica limitada não equivale a encontrar uma inversa simbólica global nem garante enumerar todas as soluções possíveis." },
      { title: "Dados e limpeza", text: "Trocar de função ou modalidade preserva as linhas correspondentes. Alterar uma expressão invalida os dados anteriores daquela função. Há limpeza individual e limpeza geral com confirmação. O antigo painel separado de função inversa não é a ferramenta atual: a consulta de x está integrada à tabela." },
    ],
    code: { path: "src/components/ValueTables.tsx · trecho", source: 'const rows = active\n  ? tableRows(tables[active.slot], expression, mode)\n  : emptyRows();', explanation: "A tabela recupera as linhas da posição, da expressão atual e da modalidade. Isso evita misturar entradas de funções diferentes ou usar dados antigos após uma edição." },
  },
  {
    id: "limites", title: "Aba Limites",
    summary: "Combina aproximações laterais, uma estimativa numérica, tabelas e uma explicação matemática complementar.",
    flow: ["f(x), ponto c e direção", "evaluateLimit", "Comparação dos lados", "Tabelas, gráfico e etapas"],
    files: [
      { path: "src/routes/limites.tsx", role: "Recebe expressão, ponto c e escolha esquerda, direita ou ambos." },
      { path: "src/lib/limits.ts", role: "Avalia aproximações laterais e verifica padrões de oscilação." },
      { path: "src/lib/uv-steps.ts · src/components/UvOverlays.tsx", role: "Explicações disponíveis e guias visuais de aproximação no modo UV." },
    ],
    topics: [
      { title: "As tabelas não avaliam apenas c", text: "O motor usa distâncias progressivamente menores de c pelos dois lados. Isso permite estudar uma expressão que não está definida exatamente em c, mas cujos valores próximos se aproximam de um limite." },
      { title: "Resultado bilateral e cautela", text: "A página compara as estimativas da esquerda e da direita. Lados diferentes, oscilações ou ausência de convergência geram avisos. Uma estimativa por amostragem não deve ser confundida com prova geral; as etapas algébricas usam os métodos disponíveis para a expressão." },
      { title: "Exemplos e UV", text: "Os exemplos de fatoração, racionalização e limite trigonométrico preenchem expressão e ponto de estudo. O gráfico SVG compartilha navegação com os outros gráficos 2D; a Luz Negra acrescenta guias e o painel de resolução, sem fazer uma chamada de IA." },
    ],
    code: { path: "src/routes/limites.tsx · trecho", source: 'const { left, right, L1, L2, oscillation } =\n  evaluateLimit(expr, c);', explanation: "Uma chamada fornece as linhas das duas tabelas, as estimativas laterais e uma observação sobre oscilação. A direção escolhida determina como esses dados são apresentados." },
  },
  {
    id: "derivadas", title: "Aba Derivadas",
    summary: "Separa a fórmula da derivada de sua avaliação em um ponto, com x₀ independente por função.",
    flow: ["Expressões e pontos x₀", "Derivada simbólica / numérica", "Valores verificados", "Fórmulas e tangentes"],
    files: [
      { path: "src/routes/derivadas.tsx", role: "Coordena funções comparadas, pontos por posição e retas tangentes." },
      { path: "src/components/DerivativeResult.tsx · src/lib/derivative-results.ts", role: "Mostra a expressão derivada e avalia cada função no seu próprio ponto." },
      { path: "src/lib/calc.ts · src/lib/uv-steps.ts", role: "Inclinação numérica com verificações laterais e explicações de regras de derivação." },
    ],
    topics: [
      { title: "Fórmula e valor são coisas diferentes", text: "mathjs deriva e simplifica a expressão simbólica quando há suporte. O valor da função e a inclinação no ponto dependem do x₀ daquela função. Deixar o ponto vazio não impede exibir uma derivada simbólica disponível." },
      { title: "Tangente e derivabilidade", text: "A inclinação numérica compara diferenças laterais em duas escalas. Valores fora do domínio ou indícios de um canto, como abs(x) em zero, não devem gerar uma tangente de inclinação finita. Cada curva recebe seu ponto de tangência por slot." },
      { title: "Regras e apresentação", text: "As etapas explicam as regras reconhecidas, como cadeia, produto e quociente. MathExpression apresenta as fórmulas com frações, expoentes e símbolos tradicionais. Constantes têm derivada zero, com explicação específica." },
    ],
    code: { path: "src/lib/derivative-results.ts · trecho", source: 'if (constantValue(expression) !== null) return "0";\nreturn simplify(\n  symbolicDerivative(normalize(expression), "x")\n).toString();', explanation: "O caso constante é resolvido primeiro. Nas demais expressões suportadas, o motor deriva em relação a x e simplifica antes de encaminhar o resultado à apresentação matemática." },
  },
  {
    id: "integrais", title: "Aba Integrais",
    summary: "Oferece primitivas verificadas, integral definida com método informado e sólidos de revolução.",
    flow: ["f(x), a, b e interpretação", "Primitiva / integral definida", "Verificação de domínio", "Fórmula, área ou sólido"],
    files: [
      { path: "src/routes/integrais.tsx", role: "Coordena limites de integração, resultado, área e escolha do sólido." },
      { path: "src/lib/uv-steps.ts", role: "indefiniteIntegral e definiteIntegral reúnem cálculo, método, avisos e etapas." },
      { path: "src/lib/domain.ts · src/lib/smart3d.ts", role: "Restrições do intervalo e análise do volume de revolução." },
    ],
    topics: [
      { title: "Integral indefinida", text: "A primitiva simbólica é exibida com + C e independe dos limites a e b. O método cobre um conjunto de expressões e verifica as primitivas obtidas. Quando não consegue obter uma primitiva verificada, informa a limitação em vez de inventar uma fórmula." },
      { title: "Integral definida e singularidades", text: "Quando aplicável, o resultado usa uma primitiva e F(b) − F(a); alternativamente, há aproximação por Simpson. Valor, método e explicação vêm do mesmo resultado. Singularidades ou integrais impróprias sem convergência verificada não são tratadas como uma área finita comum." },
      { title: "Área e volume", text: "Área usa o gráfico 2D com região sombreada e sinal da integral. Sólido de revolução usa a cena 3D e o método dos discos em torno do eixo x, integrando π·f(x)² nos casos válidos. Os exemplos incluem seus limites de estudo; UV mostra explicações e destaques adicionais." },
    ],
    code: { path: "src/routes/integrais.tsx · trecho", source: 'const primitive = useMemo(\n  () => indefiniteIntegral(expr), [expr]\n);', explanation: "A primitiva depende somente da expressão. Por isso, mudar a ou b não muda a fórmula indefinida; os limites pertencem ao cálculo definido, feito separadamente." },
  },
  {
    id: "graficos", title: "Gráficos 2D e Smart Canvas 3D",
    summary: "Os gráficos recebem dados calculados; navegação e amostragem cuidam de precisão visual e desempenho.",
    flow: ["Expressão e janela visível", "Amostragem limitada", "Cortes de descontinuidade", "Curvas / cena 3D"],
    files: [
      { path: "src/components/ComparisonPlot.tsx · src/components/Plot.tsx", role: "Recharts em Funções/Derivadas e SVG em Limites/Integrais." },
      { path: "src/lib/use-plot-viewport.ts · src/lib/plot-viewport.ts", role: "Zoom, pan, pinça, limites da janela e coordenadas sincronizadas via d3-zoom." },
      { path: "src/lib/plot-sampling.ts · src/lib/use-settled-plot-domain.ts", role: "Orçamento de amostras, detecção de saltos e adiamento de análises caras após gestos." },
      { path: "src/components/Smart3DView.tsx · src/components/Smart3DCanvas.tsx", role: "Carregamento da cena 3D apenas no navegador; superfícies e sólidos." },
    ],
    topics: [
      { title: "Zoom, pan e coordenadas", text: "Roda do mouse, pinça, arraste e controles ajustam a janela em coordenadas matemáticas. Os ticks, o cursor e as anotações acompanham a mesma transformação. Os gráficos são reamostrados ao mudar o intervalo, em vez de simplesmente ampliar uma imagem." },
      { title: "Por que uma assíntota não vira um risco vertical", text: "A amostragem quebra o traçado ao detectar valores inválidos, polos ou saltos excessivos — incluindo saltos acima de três vezes a altura visível de Y. SVG usa subcaminhos independentes; Recharts usa separadores específicos por curva. O orçamento considera o número de funções, e gestos são agrupados por quadro para reduzir trabalho." },
      { title: "Cores e modos 3D", text: "Eixos X e Y têm destaques próprios e diferentes da curva principal, adaptados aos temas. A cena 3D sobrepõe camadas com cores por função, permite inspecionar a câmera e acompanha Claro/Escuro. No Quadro Negro, utiliza wireframe de giz; UV acrescenta informações analíticas. As etiquetas 3D usam texturas de texto." },
    ],
    code: { path: "src/routes/index.tsx · trecho", source: 'functions.map((f) => ({\n  expression: f.expression,\n  slot: f.slot\n})).filter((l) => l.expression.trim())', explanation: "A página envia as expressões não vazias como camadas identificadas por posição. A cena mantém a correspondência entre função, cor e representação 2D ou 3D." },
  },
  {
    id: "temas", title: "Temas, Luz Negra e fórmulas",
    summary: "A aparência muda por tokens e classes; a análise UV não altera os resultados dos cálculos.",
    flow: ["Seletor de tema / UV", "Preferência local", "Classes e tokens", "Apresentação e overlays"],
    files: [
      { path: "src/components/ThemeToggle.tsx · src/lib/theme.ts", role: "Temas Claro, Escuro e Quadro Negro; estado UV e preferências salvas." },
      { path: "src/styles.css · src/lib/use-lab-theme.ts", role: "Tokens de cor, tipografia, lousa e leitura do tema pelos gráficos." },
      { path: "src/components/AnalysisPanels.tsx · src/components/UvStepsPanel.tsx · src/components/UvOverlays.tsx", role: "Resumo, resolução passo a passo e destaques analíticos." },
      { path: "src/components/MathExpression.tsx · src/components/MathFormula.tsx · src/lib/math-format.ts", role: "Expressões mathjs convertidas e renderizadas com KaTeX e MathML." },
    ],
    topics: [
      { title: "Três ambientes de estudo", text: "Claro e Escuro usam tipografia limpa e gráficos sem wireframe de giz. Quadro Negro aplica textura, moldura e tipografia temática sem inflar os controles; dados matemáticos usam fonte monoespaçada. Os valores de cores ficam no CSS compartilhado, não espalhados por cada página." },
      { title: "Visão Analítica UV", text: "Disponível no Quadro Negro, a Luz Negra controla contraste analítico, guias e painéis complementares. Nos gráficos 2D, resumo e camadas analíticas já estão renderizados e sua visibilidade muda por CSS, evitando remontar o gráfico ao alternar. Ela não reativa a IA em manutenção." },
      { title: "Fórmulas não são código na tela de cálculo", text: "O motor produz expressões em texto; expressionLatex converte a notação e MathFormula renderiza a fórmula tradicional. LaTeX é um formato intermediário, não o resultado cru mostrado ao estudante. Esta página exibe trechos de código intencionalmente para explicar a implementação." },
    ],
    code: { path: "src/components/MathExpression.tsx · trecho", source: 'return <MathFormula\n  formula={`${prefix}${expressionLatex(expression)}${suffix}`}\n/>;', explanation: "Prefixo, expressão convertida e sufixo (como + C) formam uma fórmula renderizada. O estudante vê a fração e o expoente, não os comandos de formatação." },
  },
  {
    id: "aprenda", title: "Aba Aprenda e ligação com os módulos",
    summary: "O conteúdo didático é separado da tela; exemplos podem preencher uma aba de cálculo sem copiar a equação.",
    flow: ["Unidade e tópico", "Conteúdo tipado", "Testar no Gráfico", "Expressão no módulo escolhido"],
    files: [
      { path: "src/routes/aprenda.tsx", role: "Índice por curso, seleção de unidade, acordeões, exemplos e navegação." },
      { path: "src/lib/learn-content.ts · src/lib/learn-advanced.ts", role: "Teoria, teoremas, fórmulas, exemplos resolvidos e avisos, separados da apresentação." },
      { path: "src/lib/learn-tests.ts", role: "Associa exemplos aos módulos e escreve os dados de estudo antes de navegar." },
    ],
    topics: [
      { title: "Conteúdo organizado", text: "As unidades reúnem fundamentos de Cálculo 1 e 2 e conteúdos avançados, como otimização, séries, curvas paramétricas, polares e cálculo vetorial básico. A página percorre esses dados e usa acordeões para organizar teoria, fórmulas, teoremas, exemplos, resultados e conexões com as abas." },
      { title: "Expandir e localizar tópicos", text: "O índice escolhe a unidade; os tópicos podem ser abertos individualmente ou em conjunto. A unidade e os tópicos abertos usam o armazenamento de estado dos módulos, preservando a leitura ao navegar entre abas." },
      { title: "Testar no Gráfico", text: "O botão consulta o exemplo associado, preenche a expressão e os campos de estudo previstos e navega para o módulo correspondente. Alguns tópicos avançados usam uma representação equivalente compatível com os módulos disponíveis; não criam um motor separado de séries ou curvas paramétricas." },
    ],
    code: { path: "src/routes/aprenda.tsx · trecho", source: 'onClick={() => void navigate({\n  to: applyGraphTest(test)\n})}', explanation: "applyGraphTest escreve o exemplo no estado do módulo de destino e devolve sua rota. navigate abre essa página com a expressão preparada." },
  },
  {
    id: "ia", title: "Aba IA, anexos, ENADE e Copiloto",
    summary: "Esses recursos estão implementados, mas temporariamente bloqueados por manutenção; os módulos matemáticos locais continuam funcionando.",
    flow: ["Pedido do usuário", "Verificação de disponibilidade", "Serviço e validação, se ativo", "Resposta estruturada"],
    files: [
      { path: "src/routes/ia.tsx · src/lib/tutor.functions.ts · src/lib/tutor.ts", role: "Tutor, perguntas por etapa, validação de dados e histórico da sessão." },
      { path: "src/components/EnadePanel.tsx · src/lib/enade.functions.ts · src/lib/enade.ts", role: "Questões contextualizadas A–E, resposta do estudante e resolução." },
      { path: "src/components/HelpChat.tsx · src/lib/helpdesk.functions.ts · src/lib/copilot-actions.ts", role: "Ajuda do Copiloto e ações na aplicação por eventos." },
      { path: "src/lib/ai-maintenance.ts · src/components/AiMaintenance.tsx · src/lib/tutor-plot.ts", role: "Bloqueio compartilhado e validação das sugestões de gráfico." },
    ],
    topics: [
      { title: "Tutor e perguntas por etapa — quando disponível", text: "O problema é enviado a uma função de servidor, que usa o serviço de IA e valida uma resposta estruturada. A interface organiza etapas, fórmulas e conclusão; perguntas adicionais levam o contexto da etapa escolhida. O histórico é guardado em sessionStorage na sessão da aba do navegador, não como histórico permanente de conta." },
      { title: "Anexos, ENADE e transferência de gráficos — quando disponíveis", text: "O Tutor aceita PDF, PNG e JPEG, com prévia, remoção e limite de 8 MB. A interface mostra o estado de análise ao enviar. ENADE oferece questões geradas para treino, alternativas A–E, avaliação e resolução — não um banco oficial de provas. Sugestões de gráfico passam por validação de estrutura e expressões antes de abrir Funções por um parâmetro de URL." },
      { title: "Copiloto e manutenção atual", text: "O Copiloto orienta sobre ferramentas e pode enviar eventos para mudar a aba, preencher a função, alternar tema/UV ou abrir 3D quando estiver disponível. No estado atual, Tutor, ENADE e Copiloto mostram manutenção, e os próprios handlers bloqueiam solicitações ao provedor. UV não contorna esse bloqueio." },
    ],
    code: { path: "src/routes/ia.tsx · trecho", source: 'if (AI_MAINTENANCE) return <>\n  <PageHeader tag="Tutor de Cálculo 1 e 2"\n    title="IA" desc="IA em manutenção" />\n  <p role="alert" className="border-y border-border py-6 text-muted-foreground">\n    {AI_MAINTENANCE_MESSAGE}\n  </p>\n</>;\nreturn <TutorPage />;', explanation: "A página de manutenção é apresentada antes de montar o Tutor. A proteção também existe nas funções do servidor: esconder o botão não é a única barreira." },
  },
  {
    id: "ajuda-estado", title: "Como Usar, Créditos e preservação de dados",
    summary: "As ferramentas de apoio compartilham a estrutura do site; cada tipo de informação tem uma duração diferente.",
    flow: ["Menu ou mudança de aba", "Navegação / estado compartilhado", "Página escolhida", "Dados preservados durante a navegação"],
    files: [
      { path: "src/components/GuidedTour.tsx", role: "Menu Como Usar, atalhos, etapas do tour, spotlight e encaminhamento à ajuda." },
      { path: "src/routes/creditos.tsx", role: "Identificação do trabalho, instituição, professora e alunos, com logotipo do projeto." },
      { path: "src/lib/module-state.ts", role: "Armazenamento em memória para recuperar os campos quando uma página é remontada." },
      { path: "src/test/", role: "Testes de cálculos, domínio, teclado, gráficos, estado, limites e outras regras." },
    ],
    topics: [
      { title: "Tour e esta página", text: "Cada etapa do tour define um alvo da interface e pode declarar a aba que precisa abrir. O tour navega, mede o elemento e posiciona spotlight e balão; há Anterior, Próximo e Pular. O menu também oferece os atalhos de digitação, a ajuda de IA (em manutenção) e esta explicação do código." },
      { title: "Créditos", text: "A aba identifica a AP2 de Cálculo Diferencial e Integral, a UniCatólica do RN, a professora e os alunos integrantes. O logotipo é uma imagem referenciada como recurso do projeto. A apresentação acompanha os temas compartilhados sem participar dos cálculos." },
      { title: "O que fica salvo e por quanto tempo", text: "Os campos dos módulos ficam em um Map em memória: sobrevivem à troca de aba, mas não a uma recarga completa. Tema e preferência UV usam localStorage e podem sobreviver à recarga. O histórico do Tutor usa sessionStorage quando o serviço está disponível. Não há salvamento permanente automático dos exercícios em uma conta." },
      { title: "Validação, testes e limites do sistema", text: "Entradas inválidas recebem avisos; resultados numéricos e simbólicos têm limitações próprias. Os testes verificam regras concretas, como domínio, constantes, independência de funções e cortes de assíntotas. A separação entre lógica, apresentação e navegação permite corrigir uma regra compartilhada sem duplicá-la em cada aba." },
    ],
    code: { path: "src/lib/module-state.ts · trecho", source: 'const store = new Map<string, unknown>();\n\nuseEffect(() => {\n  store.set(key, value);\n}, [key, value]);', explanation: "A chave identifica um campo, como funcoes.a ou integrais.expr. O efeito atualiza o valor em memória; useModuleState o recupera quando o módulo volta a aparecer. Esse Map não é um armazenamento permanente." },
  },
];