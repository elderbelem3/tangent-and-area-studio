import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Users, Sigma } from "lucide-react";
import logoAsset from "@/assets/unicatolica-logo.png.asset.json";

export const Route = createFileRoute("/creditos")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Créditos · CalculusLab" },
      { property: "og:image", content: logoAsset.url },
      { name: "twitter:image", content: logoAsset.url },
      {
        name: "description",
        content:
          "AP2 de Cálculo Diferencial e Integral — UniCatólica do RN, professora e alunos integrantes do grupo.",
      },
      { property: "og:title", content: "Créditos · CalculusLab" },
      {
        property: "og:description",
        content:
          "AP2 de Cálculo Diferencial e Integral — UniCatólica do RN, professora e alunos integrantes do grupo.",
      },
    ],
  }),
  component: Creditos,
});

const alunos = [
  "Elder Belem da Silva Terceiro",
  "Nathan Emanuel Silva de Paiva",
  "Erick Emanoel Oliveria Araujo",
];

function Creditos() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-border bg-card p-6 shadow-soft md:p-12">
        {/* Instituição */}
        <div className="flex flex-col items-center text-center">
          <img
            src={logoAsset.url}
            alt="UniCatólica do Rio Grande do Norte"
            className="h-28 w-auto md:h-32"
          />
          <p className="mt-5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Instituição de ensino
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold leading-tight md:text-3xl">
            UniCatólica do RN
          </h2>
        </div>

        {/* Título do trabalho */}
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
            <GraduationCap className="h-7 w-7" />
          </div>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-primary">
            Trabalho acadêmico
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold leading-tight md:text-3xl">
            AP2 de Cálculo Diferencial e Integral
          </h1>
        </div>

        <div className="my-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <Sigma className="h-4 w-4 text-muted-foreground" />
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="border-t border-border py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Professora
              </p>
              <p className="font-display text-lg font-semibold">Flaviana Moreira de Souza Amorim</p>
            </div>
          </div>
        </div>

        <div className="mt-2 border-t border-border py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background text-primary">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Alunos integrantes do grupo
            </p>
          </div>
          <ol className="mt-4 space-y-5">
            {alunos.map((nome, i) => (
              <li key={nome} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="font-display text-base font-semibold md:text-lg">{nome}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Colaboradores especiais: só aparecem sob a Luz Negra */}
        <div className="uv-secret" aria-label="Colaboradores especiais">
          <span className="uv-secret-label">Colaboradores Especiais · revelado pela Luz Negra</span>
          <span className="uv-secret-name">Ramiro Jose Peixoto Bisneto</span>
          <span className="uv-secret-note">Agradecimento acadêmico secreto do grupo.</span>
        </div>

        <p className="mt-8 flex justify-center text-center text-xs text-muted-foreground">
          <span className="uv-secret-hint">
            <Sparkles className="h-3.5 w-3.5" />
            Existem segredos acadêmicos ocultos sob a luz UV…
          </span>
        </p>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          UniCatólica do RN · CalculusLab · Cálculo 1 e 2
        </p>
      </div>
    </div>
  );
}
