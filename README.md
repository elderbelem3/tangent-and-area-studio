# Tangent And Area Studio

Crie uma aplicação web educacional e interativa chamada "CalculusLab", voltada para estudantes de Cálculo 1 e 2. A aplicação deve ter um visual moderno e limpo, com menu de navegação ou abas divididas em 4 módulos principais:

1. Módulo de Funções:

- Campo de entrada para a função f(x) (suportando sintaxes como x^2, sin(x), cos(x), x^3 - 3x, exp(x)).

- Gráfico interativo plotando a função f(x).

- Tabela de valores calculados para x e f(x).

- Botões de atalho com exemplos rápidos de funções comuns (Quadrática, Trigonométrica, Exponencial).

2. Módulo de Limites:

- Campos para inserir a função f(x), o ponto de aproximação 'c' e a direção (esquerda, direita ou ambos).

- Tabela de aproximação numérica mostrando valores de x se aproximando de 'c' (ex: c-0.1, c-0.01, c-0.001) e seus respectivos valores de f(x) para demonstrar a ideia de limite.

- Gráfico destacando o ponto do limite (c, L) na curva.

3. Módulo de Derivadas:

- Campos para a função f(x) e um ponto específico x0.

- Gráfico exibindo a curva da função juntamente com a reta tangente no ponto x0.

- Cálculo do valor da derivada no ponto x0 (taxa de variação instantânea) e exibição da inclinação da reta.

- Painel explicativo sobre a interpretação geométrica da derivada.

4. Módulo de Integrais:

- Campos para a função f(x), limite inferior 'a' e limite superior 'b'.

- Cálculo numérico da integral definida no intervalo [a, b].

- Gráfico destacando a área sombreada sob a curva entre os pontos 'a' e 'b'.

- Explicação da integral definida como área acumulada.

Requisitos de Design e Funcionalidades:

- Layout responsivo (funciona bem em celular e computador), com visual profissional e limpo.

- Tratamento de erros amigável caso o usuário digite uma função inválida ou tente divisão por zero.

- Gráficos claros e fáceis de ler.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tangent-and-area-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2e684f3a-a8e7-4559-911d-485a06024dfd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
