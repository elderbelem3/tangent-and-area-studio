import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { Scene3D } from "@/components/Smart3DCanvas";

const Smart3DCanvas = lazy(() => import("@/components/Smart3DCanvas"));
const fallback = <div className="flex h-[380px] items-center justify-center rounded-lg bg-secondary/50 text-sm text-muted-foreground sm:h-[440px]">Carregando gráfico 3D…</div>;

/** Client-only wrapper: three.js never loads during SSR. */
export function Smart3DView({ scene }: { scene: Scene3D }) {
  return <ClientOnly fallback={fallback}><Suspense fallback={fallback}><Smart3DCanvas scene={scene} /></Suspense></ClientOnly>;
}
export type { Scene3D };
