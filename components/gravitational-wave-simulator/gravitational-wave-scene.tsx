"use client"

import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"

import type { EventRecord } from "@/lib/gravitationalWaveData"
import { cn } from "@/lib/utils"

const GRID_SEGMENTS = 160

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function WaveField({
  event,
  massScale,
  distanceScale,
}: {
  event: EventRecord
  massScale: number
  distanceScale: number
}) {
  const gridRef = useRef<THREE.Mesh>(null)
  const bodyARef = useRef<THREE.Mesh>(null)
  const bodyBRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const basePositions = useMemo(
    () => new Float32Array((GRID_SEGMENTS + 1) * (GRID_SEGMENTS + 1) * 3),
    []
  )

  const primaryWeight = event.primaryMass / (event.primaryMass + event.secondaryMass)
  const secondaryWeight = event.secondaryMass / (event.primaryMass + event.secondaryMass)
  const strainScale = clamp((event.peakStrain / 1e-21) * massScale / distanceScale, 0.35, 2.6)
  const orbitSpeed = clamp(0.2 + Math.log10(event.peakFrequencyHz + 10) * 0.22, 0.25, 1.15)
  const separation = clamp(3.2 - strainScale * 0.55, 1.8, 3.4)
  const primaryRadius = 0.25 + Math.pow(primaryWeight, 0.7) * 0.9
  const secondaryRadius = 0.23 + Math.pow(secondaryWeight, 0.7) * 0.85

  useEffect(() => {
    const geometry = gridRef.current?.geometry
    if (!geometry) return
    const position = geometry.getAttribute("position") as THREE.BufferAttribute
    basePositions.set(position.array as ArrayLike<number>)
  }, [basePositions])

  useFrame(({ clock }) => {
    const geometry = gridRef.current?.geometry
    if (!geometry) return

    const t = clock.getElapsedTime()
    const position = geometry.getAttribute("position") as THREE.BufferAttribute
    const phase = t * orbitSpeed

    const ax = Math.cos(phase) * separation * secondaryWeight
    const ay = Math.sin(phase) * separation * secondaryWeight
    const bx = -Math.cos(phase) * separation * primaryWeight
    const by = -Math.sin(phase) * separation * primaryWeight

    for (let i = 0; i < position.count; i += 1) {
      const x = basePositions[i * 3]
      const y = basePositions[i * 3 + 1]

      const r1 = Math.sqrt((x - ax) ** 2 + (y - ay) ** 2) + 0.2
      const r2 = Math.sqrt((x - bx) ** 2 + (y - by) ** 2) + 0.2
      const rc = Math.sqrt(x * x + y * y) + 0.3

      const localWell =
        (-0.55 * primaryWeight) / (r1 * 0.9 + 0.35) +
        (-0.55 * secondaryWeight) / (r2 * 0.9 + 0.35)

      const propagatingWave =
        Math.sin(r1 * 2.25 - t * (2.4 + strainScale)) / (1 + r1 * 0.55) +
        Math.sin(r2 * 2.25 - t * (2.4 + strainScale)) / (1 + r2 * 0.55)

      const ringdown =
        Math.sin(rc * 3.4 - t * (3 + orbitSpeed * 2)) *
        Math.exp(-rc * 0.18) *
        0.4

      const z = localWell * (1.6 + strainScale * 0.3) + (propagatingWave + ringdown) * 0.32 * strainScale

      position.setZ(i, z)
    }

    position.needsUpdate = true
    geometry.computeVertexNormals()

    if (bodyARef.current) {
      bodyARef.current.position.set(ax, ay, primaryRadius * 0.6)
    }

    if (bodyBRef.current) {
      bodyBRef.current.position.set(bx, by, secondaryRadius * 0.6)
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + strainScale * 0.08 + Math.sin(t * 1.8) * 0.06)
    }
  })

  return (
    <>
      <color attach="background" args={["#04070d"]} />
      <fog attach="fog" args={["#04070d", 16, 28]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 10]} intensity={1.4} color="#d9f99d" />
      <pointLight position={[0, 0, 6]} intensity={8} distance={18} color="#34d399" />

      <group rotation={[-Math.PI / 2.65, 0, 0]}>
        <mesh ref={gridRef}>
          <planeGeometry args={[22, 22, GRID_SEGMENTS, GRID_SEGMENTS]} />
          <meshStandardMaterial
            color="#18332c"
            emissive="#3ddc97"
            emissiveIntensity={0.72}
            wireframe
            transparent
            opacity={0.92}
          />
        </mesh>

        <mesh ref={glowRef} position={[0, 0, -0.2]}>
          <ringGeometry args={[2.8, 7.4, 196]} />
          <meshBasicMaterial
            color="#86efac"
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={bodyARef}>
          <sphereGeometry args={[primaryRadius, 32, 32]} />
          <meshStandardMaterial color="#dbeafe" emissive="#93c5fd" emissiveIntensity={0.85} metalness={0.15} roughness={0.2} />
        </mesh>

        <mesh ref={bodyBRef}>
          <sphereGeometry args={[secondaryRadius, 32, 32]} />
          <meshStandardMaterial color="#e2e8f0" emissive="#bfdbfe" emissiveIntensity={0.75} metalness={0.15} roughness={0.25} />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.28, 0]}>
        <circleGeometry args={[13, 128]} />
        <meshBasicMaterial color="#07111d" />
      </mesh>

      <Stars radius={120} depth={50} count={1800} factor={3} saturation={0.15} fade speed={0.3} />
    </>
  )
}

export function GravitationalWaveScene({
  event,
  massScale,
  distanceScale,
  className,
}: {
  event: EventRecord
  massScale: number
  distanceScale: number
  className?: string
}) {
  const totalMass = (event.primaryMass + event.secondaryMass) * massScale
  const scaledDistance = event.luminosityDistanceMpc * distanceScale

  return (
    <div className={cn("relative overflow-hidden rounded-[1.75rem] border border-emerald-500/20", className)}>
      <Canvas
        camera={{ position: [0, 5.6, 10.8], fov: 48, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        dpr={[1, 2]}
      >
        <WaveField event={event} massScale={massScale} distanceScale={distanceScale} />
        <OrbitControls enablePan={false} minDistance={6} maxDistance={18} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-linear-to-b from-black/70 to-transparent px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
        <span>{event.name}</span>
        <span>{event.peakFrequencyHz} Hz peak</span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 grid gap-2 bg-linear-to-t from-black/75 to-transparent px-4 py-4 text-[11px] text-white/80 sm:grid-cols-3">
        <div>
          <div className="text-white/45">Toplam kütle</div>
          <div className="font-mono">{totalMass.toFixed(2)} M☉</div>
        </div>
        <div>
          <div className="text-white/45">Uzaklık</div>
          <div className="font-mono">{scaledDistance.toFixed(0)} Mpc</div>
        </div>
        <div>
          <div className="text-white/45">Peak strain</div>
          <div className="font-mono">{event.peakStrain.toExponential(2)}</div>
        </div>
      </div>
    </div>
  )
}
