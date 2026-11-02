import { useEffect, useMemo, useState } from "react";
import { EV_3D, consumePending3D } from "@/lib/copilot-actions";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Box, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt, parseFn } from "@/lib/calc";
import { parseFn2, type SurfaceInfo } from "@/lib/smart3d";
import { useLabTheme } from "@/lib/use-lab-theme";

export type Scene3D =
  | { kind: "surface"; expression: string; range: number; info: SurfaceInfo | null }
  | { kind: "solid"; expression: string; a: number; b: number };

const UV = "#efd2ff";
const CHALK = "#f1f5ee";
type V3 = [number, number, number];

/** Math (x, y, z) → three.js (x, z-up, -y). */
const P = (x: number, y: number, z: number): V3 => [x, z, -y];

function surfaceData(expression: string, R: number) {
  const { fn } = parseFn2(expression);
  if (!fn) return null;
  const N = 48, zs: number[] = [];
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) zs.push(fn(-R + 2 * R * i / N, -R + 2 * R * j / N));
  const finite = zs.filter(Number.isFinite).sort((a, b) => a - b);
  if (!finite.length) return null;
  const lo = finite[Math.floor(finite.length * 0.02)]!, hi = finite[Math.floor(finite.length * 0.98)]!;
  const scale = hi - lo > 1e-9 ? (R * 1.2) / (hi - lo) : 1, mid = (hi + lo) / 2;
  const Z = (z: number) => Number.isFinite(z) ? (Math.max(lo, Math.min(hi, z)) - mid) * scale : 0;
  return { N, R, fn, Z, at: (i: number, j: number) => P(-R + 2 * R * i / N, -R + 2 * R * j / N, Z(zs[i * (N + 1) + j]!)), lo, hi };
}

function solidData(expression: string, a: number, b: number) {
  const { fn } = parseFn(expression);
  if (!fn) return null;
  const lo = Math.min(a, b), hi = Math.max(a, b), N = 60, M = 48;
  let rMax = 0;
  for (let i = 0; i <= N; i++) { const r = Math.abs(fn(lo + (hi - lo) * i / N)); if (Number.isFinite(r)) rMax = Math.max(rMax, r); }
  const span = hi - lo || 1, xs = 4.4 / span, scale = 1.9 / Math.max(rMax, 1e-6), cx = (lo + hi) / 2;
  const at = (x: number, t: number): V3 => { const r = Math.abs(fn(x)) * scale; const R = Number.isFinite(r) ? r : 0; return [(x - cx) * xs, R * Math.sin(t), R * Math.cos(t)]; };
  return { fn, lo, hi, N, M, at, scale, xs, cx };
}

function SurfaceMesh({ d, chalk }: { d: NonNullable<ReturnType<typeof surfaceData>>; chalk: boolean }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(), pos: number[] = [], col: number[] = [], idx: number[] = [];
    const c = new THREE.Color();
    for (let i = 0; i <= d.N; i++) for (let j = 0; j <= d.N; j++) {
      const p = d.at(i, j); pos.push(...p);
      c.setHSL(0.62 - 0.5 * ((p[1] / (d.R * 1.2)) + 0.5) * 0.6, 0.65, 0.55); col.push(c.r, c.g, c.b);
    }
    for (let i = 0; i < d.N; i++) for (let j = 0; j < d.N; j++) { const k = i * (d.N + 1) + j; idx.push(k, k + 1, k + d.N + 1, k + 1, k + d.N + 2, k + d.N + 1); }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals(); return g;
  }, [d]);
  const lines = useMemo(() => {
    const out: V3[][] = [];
    for (let i = 0; i <= d.N; i += 4) out.push(Array.from({ length: d.N + 1 }, (_, j) => d.at(i, j)));
    for (let j = 0; j <= d.N; j += 4) out.push(Array.from({ length: d.N + 1 }, (_, i) => d.at(i, j)));
    return out;
  }, [d]);
  if (chalk) return <>{lines.map((pts, k) => <Line key={k} points={pts} color={CHALK} lineWidth={1.4} transparent opacity={0.85} />)}</>;
  return <mesh geometry={geo} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={0.45} metalness={0.1} side={THREE.DoubleSide} /></mesh>;
}

function SolidMesh({ d, chalk }: { d: NonNullable<ReturnType<typeof solidData>>; chalk: boolean }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(), pos: number[] = [], idx: number[] = [];
    for (let i = 0; i <= d.N; i++) for (let j = 0; j <= d.M; j++) pos.push(...d.at(d.lo + (d.hi - d.lo) * i / d.N, (2 * Math.PI * j) / d.M));
    for (let i = 0; i < d.N; i++) for (let j = 0; j < d.M; j++) { const k = i * (d.M + 1) + j; idx.push(k, k + d.M + 1, k + 1, k + 1, k + d.M + 1, k + d.M + 2); }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }, [d]);
  const lines = useMemo(() => {
    const out: V3[][] = [];
    for (let j = 0; j < 12; j++) out.push(Array.from({ length: d.N + 1 }, (_, i) => d.at(d.lo + (d.hi - d.lo) * i / d.N, (2 * Math.PI * j) / 12)));
    for (let i = 0; i <= 8; i++) out.push(Array.from({ length: d.M + 1 }, (_, j) => d.at(d.lo + (d.hi - d.lo) * i / 8, (2 * Math.PI * j) / d.M)));
    return out;
  }, [d]);
  if (chalk) return <>{lines.map((pts, k) => <Line key={k} points={pts} color={CHALK} lineWidth={1.4} transparent opacity={0.85} />)}</>;
  return <mesh geometry={geo} castShadow><meshPhysicalMaterial color="#5b7cfa" roughness={0.3} metalness={0.15} clearcoat={0.6} side={THREE.DoubleSide} /></mesh>;
}

function makeLabel(text: string, color: string, bg: string | null) {
  const c = document.createElement("canvas"), ctx = c.getContext("2d")!, font = "600 44px 'Roboto Mono', ui-monospace, monospace";
  ctx.font = font; const w = Math.ceil(ctx.measureText(text).width) + 28; c.width = w; c.height = 64;
  ctx.font = font; if (bg) { ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(0, 0, w, 64, 10); ctx.fill(); }
  ctx.fillStyle = color; ctx.textBaseline = "middle"; ctx.fillText(text, 14, 34);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { t, aspect: w / 64 };
}
function TextSprite({ position, text, color = UV, bg = "rgba(30,16,44,0.75)", size = 0.32 }: { position: V3; text: string; color?: string; bg?: string | null; size?: number }) {
  const l = useMemo(() => makeLabel(text, color, bg), [text, color, bg]);
  return <sprite position={position} scale={[size * l.aspect, size, 1]} renderOrder={10}><spriteMaterial map={l.t} transparent depthTest={false} /></sprite>;
}
function Label({ position, children }: { position: V3; children: string }) {
  return <TextSprite position={position} text={children} />;
}

function SolidUv({ d }: { d: NonNullable<ReturnType<typeof solidData>> }) {
  const m = (d.lo + d.hi) / 2, ring = (x: number) => Array.from({ length: 65 }, (_, j) => d.at(x, (2 * Math.PI * j) / 64));
  const r = Math.abs(d.fn(m)) * d.scale, cx = (m - d.cx) * d.xs;
  return <group>
    <mesh position={[cx, 0, 0]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[Math.max(r, 0.001), 64]} /><meshBasicMaterial color={UV} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    <Line points={ring(m)} color={UV} lineWidth={3.5} />
    <Line points={[[cx, 0, 0], [cx, 0, r]]} color={UV} lineWidth={3} />
    <Line points={ring(d.lo)} color={UV} lineWidth={2.5} dashed dashSize={0.12} gapSize={0.08} />
    <Line points={ring(d.hi)} color={UV} lineWidth={2.5} dashed dashSize={0.12} gapSize={0.08} />
    <Label position={[cx, r + 0.45, 0]}>{`disco r = ${fmt(Math.abs(d.fn(m)), 3)}`}</Label>
    <Label position={[(d.lo - d.cx) * d.xs, -0.5, 0.6]}>{`x = ${fmt(d.lo, 3)}`}</Label>
    <Label position={[(d.hi - d.cx) * d.xs, -0.5, 0.6]}>{`x = ${fmt(d.hi, 3)}`}</Label>
  </group>;
}

function SurfaceUv({ d, info }: { d: NonNullable<ReturnType<typeof surfaceData>>; info: SurfaceInfo | null }) {
  const R = d.R, border = [P(-R, -R, d.Z(d.fn(-R, -R))), P(R, -R, d.Z(d.fn(R, -R))), P(R, R, d.Z(d.fn(R, R))), P(-R, R, d.Z(d.fn(-R, R)))];
  const c = info?.critical;
  const z11 = d.Z(d.fn(1, 1)), g = [(d.fn(1.001, 1) - d.fn(0.999, 1)) / 0.002, (d.fn(1, 1.001) - d.fn(1, 0.999)) / 0.002], gl = Math.hypot(g[0]!, g[1]!) || 1;
  const tip = P(1 + g[0]! / gl, 1 + g[1]! / gl, z11);
  return <group>
    <Line points={[...border, border[0]!]} color={UV} lineWidth={2.5} dashed dashSize={0.15} gapSize={0.1} />
    {c && <><mesh position={P(c.x, c.y, d.Z(c.z))}><sphereGeometry args={[0.12, 20, 20]} /><meshBasicMaterial color={UV} /></mesh>
      <Line points={[P(c.x, c.y, d.Z(c.z)), P(c.x, c.y, -R * 0.6)]} color={UV} lineWidth={2} dashed dashSize={0.1} gapSize={0.08} />
      <Label position={P(c.x, c.y, d.Z(c.z) + 0.5)}>{`${c.kind} (${fmt(c.x, 2)}, ${fmt(c.y, 2)}, ${fmt(c.z, 3)})`}</Label></>}
    {R >= 1 && <><Line points={[P(1, 1, z11), tip]} color={UV} lineWidth={3.5} /><mesh position={tip}><sphereGeometry args={[0.07, 12, 12]} /><meshBasicMaterial color={UV} /></mesh><Label position={[tip[0], tip[1] + 0.3, tip[2]]}>∇f(1, 1)</Label></>}
  </group>;
}

function Axes({ chalk, L }: { chalk: boolean; L: number }) {
  const color = chalk ? CHALK : "#64748b";
  return <group>
    <Line points={[[-L, 0, 0], [L, 0, 0]]} color={color} lineWidth={1.2} />
    <Line points={[[0, -L, 0], [0, L, 0]]} color={color} lineWidth={1.2} />
    <Line points={[[0, 0, L], [0, 0, -L]]} color={color} lineWidth={1.2} />
    <TextSprite position={[L + 0.25, 0, 0]} text="x" color={color} bg={null} size={0.4} />
    <TextSprite position={[0, L + 0.25, 0]} text="z" color={color} bg={null} size={0.4} />
    <TextSprite position={[0, 0, -L - 0.25]} text="y" color={color} bg={null} size={0.4} />
  </group>;
}

export default function Smart3DCanvas({ scene }: { scene: Scene3D }) {
  const { chalkboard, blacklight } = useLabTheme();
  const [interactive, setInteractive] = useState(() => consumePending3D());
  useEffect(() => { const on = () => { consumePending3D(); setInteractive(true); }; window.addEventListener(EV_3D, on); return () => window.removeEventListener(EV_3D, on); }, []);
  const surf = useMemo(() => scene.kind === "surface" ? surfaceData(scene.expression, scene.range) : null, [scene]);
  const solid = useMemo(() => scene.kind === "solid" ? solidData(scene.expression, scene.a, scene.b) : null, [scene]);
  const orbit = chalkboard || interactive;
  if (!surf && !solid) return <p className="text-muted-foreground">Não foi possível montar o gráfico 3D desta função.</p>;
  return <div className="relative">
    {!chalkboard && <Button type="button" size="sm" variant={interactive ? "default" : "outline"} aria-pressed={interactive} onClick={() => setInteractive((v) => !v)} className="absolute right-3 top-3 z-20 gap-1.5">
      {interactive ? <Hand /> : <Box />}3D
    </Button>}
    <div className={`smart-3d h-[380px] w-full overflow-hidden rounded-lg sm:h-[440px] ${chalkboard ? "" : "bg-gradient-to-b from-secondary to-card"}`} data-scene-ready="true">
      <Canvas camera={{ position: [6, 4.5, 6], fov: 42 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }} shadows>
        {!chalkboard && <>
          <ambientLight intensity={0.35} />
          <directionalLight position={[5, 8, 4]} intensity={1.6} castShadow />
          <Environment resolution={64}>
            <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
            <Lightformer intensity={1} color="#a5b8ff" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
          </Environment>
          <gridHelper args={[8, 16, "#cbd5e1", "#e2e8f0"]} position={[0, -2.6, 0]} />
        </>}
        <Axes chalk={chalkboard} L={3} />
        {surf && <SurfaceMesh d={surf} chalk={chalkboard} />}
        {solid && <SolidMesh d={solid} chalk={chalkboard} />}
        {chalkboard && blacklight && surf && scene.kind === "surface" && <SurfaceUv d={surf} info={scene.info} />}
        {chalkboard && blacklight && solid && <SolidUv d={solid} />}
        <OrbitControls enabled={orbit} enableZoom={orbit} enablePan={false} makeDefault />
      </Canvas>
    </div>
    <p className="mt-3 text-center text-xs text-muted-foreground">
      {chalkboard ? "Esboço 3D em giz · arraste para girar" : interactive ? "Rotação livre ativa · arraste para girar e role para aproximar" : "Clique em 3D para girar e explorar o modelo livremente"}
    </p>
  </div>;
}
