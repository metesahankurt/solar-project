"use client"

/**
 * @fileoverview Stellar Evolution 3D Scene — Realistic Multi-Layer Star Rendering
 *
 * Visual approach:
 *   - Core sphere: high-emissive MeshStandardMaterial (toneMapped=false)
 *   - Chromosphere (1.08×): BackSide additive — soft limb brightening
 *   - Inner corona (1.6×): BackSide additive — main glow envelope
 *   - Mid corona (3.0×): BackSide additive — extended atmosphere
 *   - Outer halo (5.5×): BackSide additive — diffuse halo
 *   - Far halo (10×): BackSide additive — only for super-luminous stars
 *
 * All layers are driven by a single ref-based lerp system (no React state
 * updates inside useFrame), guaranteeing 60 fps with zero re-renders.
 */

import React, { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Stars, OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import type { StellarPhase, StellarPhaseName } from "@/types/stellarResult"

// ─────────────────────────────────────────────────────────────────────────────
// VISUAL ENCODING
// ─────────────────────────────────────────────────────────────────────────────

interface StarVisual {
  coreRadius: number
  coreColor: THREE.Color
  emissiveIntensity: number
  // Corona layer opacities (relative to coreRadius scaling)
  chromosphereOpacity: number
  innerCoronaOpacity: number
  midCoronaOpacity: number
  outerHaloOpacity: number
  farHaloOpacity: number
  // Tint shift for corona (hot stars → bluer corona, red giants → redder)
  coronaTint: THREE.Color
  lightIntensity: number
  lightDistance: number
  isBlackHole: boolean
  hasNebula: boolean
  nebulaColor: THREE.Color
  nebulaRadius: number
}

function phaseToVisual(phase: StellarPhase): StarVisual {
  const R = Math.max(0.0001, phase.radiusSolar)
  const L = Math.max(0, phase.luminositySolar)
  const T = phase.temperatureK
  const isBlackHole = phase.name === "Black Hole"
  const hasNebula =
    phase.name === "Planetary Nebula" ||
    phase.name === "Asymptotic Giant Branch"

  // Log2 radius mapping keeps white dwarfs tiny and supergiants enormous
  const coreRadius = isBlackHole ? 2.0 : Math.max(0.35, Math.log2(R + 1) * 2.6)

  const coreColor = new THREE.Color(phase.color || "#ffffff")

  // Emissive: log scale, unclamped for super-luminous
  const emissiveIntensity = isBlackHole
    ? 0
    : Math.min(7.5, Math.log10(L + 1) * 2.1 + 0.4)

  // Corona opacities scale with luminosity
  const logL = Math.log10(L + 1)
  const chromosphereOpacity = isBlackHole ? 0 : Math.min(0.80, 0.55 + logL * 0.03)
  const innerCoronaOpacity  = isBlackHole ? 0 : Math.min(0.55, 0.20 + logL * 0.06)
  const midCoronaOpacity    = isBlackHole ? 0 : Math.min(0.28, 0.08 + logL * 0.04)
  const outerHaloOpacity    = isBlackHole ? 0 : Math.min(0.14, 0.02 + logL * 0.025)
  const farHaloOpacity      = isBlackHole ? 0 : Math.min(0.06, logL * 0.01)

  // Corona tint: hot stars get a blue-shifted corona, cool giants reddish
  let coronaTint: THREE.Color
  if (T >= 20000) {
    coronaTint = new THREE.Color("#AABFFF") // O/B: blue-white corona
  } else if (T >= 7000) {
    coronaTint = new THREE.Color("#FFFFFF") // A/F: white corona
  } else if (T >= 4500) {
    coronaTint = coreColor.clone().lerp(new THREE.Color("#FFFFFF"), 0.4)
  } else {
    coronaTint = coreColor.clone()          // M/K: red/orange corona
  }

  const lightIntensity = isBlackHole ? 0 : Math.min(2500, logL * 720)
  const lightDistance  = Math.max(150, coreRadius * 90)

  const nebulaColor  = new THREE.Color(phase.color || "#7FFF00").multiplyScalar(0.45)
  const nebulaRadius = coreRadius * 7

  return {
    coreRadius, coreColor, emissiveIntensity,
    chromosphereOpacity, innerCoronaOpacity, midCoronaOpacity,
    outerHaloOpacity, farHaloOpacity, coronaTint,
    lightIntensity, lightDistance,
    isBlackHole, hasNebula, nebulaColor, nebulaRadius,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERPOLATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}
function cloneVisual(v: StarVisual): StarVisual {
  return {
    ...v,
    coreColor:   v.coreColor.clone(),
    coronaTint:  v.coronaTint.clone(),
    nebulaColor: v.nebulaColor.clone(),
  }
}
function lerpVisual(a: StarVisual, b: StarVisual, t: number): StarVisual {
  const e = easeInOut(t)
  return {
    coreRadius:           lerp(a.coreRadius, b.coreRadius, e),
    coreColor:            a.coreColor.clone().lerp(b.coreColor, e),
    emissiveIntensity:    lerp(a.emissiveIntensity, b.emissiveIntensity, e),
    chromosphereOpacity:  lerp(a.chromosphereOpacity, b.chromosphereOpacity, e),
    innerCoronaOpacity:   lerp(a.innerCoronaOpacity, b.innerCoronaOpacity, e),
    midCoronaOpacity:     lerp(a.midCoronaOpacity, b.midCoronaOpacity, e),
    outerHaloOpacity:     lerp(a.outerHaloOpacity, b.outerHaloOpacity, e),
    farHaloOpacity:       lerp(a.farHaloOpacity, b.farHaloOpacity, e),
    coronaTint:           a.coronaTint.clone().lerp(b.coronaTint, e),
    lightIntensity:       lerp(a.lightIntensity, b.lightIntensity, e),
    lightDistance:        lerp(a.lightDistance, b.lightDistance, e),
    isBlackHole:          b.isBlackHole,
    hasNebula:            b.hasNebula,
    nebulaColor:          a.nebulaColor.clone().lerp(b.nebulaColor, e),
    nebulaRadius:         lerp(a.nebulaRadius, b.nebulaRadius, e),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPERNOVA PHASE NAMES
// ─────────────────────────────────────────────────────────────────────────────

const SUPERNOVA_NAMES: Set<StellarPhaseName> = new Set([
  "Core Collapse Supernova",
  "Pair Instability Supernova",
  "Hypernova",
])

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

export interface StellarSceneProps {
  phases: StellarPhase[]
  currentPhaseIndex: number
  transitionDuration?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCENE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function StellarScene({
  phases,
  currentPhaseIndex,
  transitionDuration = 1.8,
}: StellarSceneProps) {

  // ── Mesh refs ────────────────────────────────────────────────────────────
  const coreRef           = useRef<THREE.Mesh>(null)
  const coreMatRef        = useRef<THREE.MeshStandardMaterial>(null)

  // Corona layers (5 spheres, each BackSide+Additive)
  const chromoRef         = useRef<THREE.Mesh>(null)
  const chromoMatRef      = useRef<THREE.MeshBasicMaterial>(null)
  const innerRef          = useRef<THREE.Mesh>(null)
  const innerMatRef       = useRef<THREE.MeshBasicMaterial>(null)
  const midRef            = useRef<THREE.Mesh>(null)
  const midMatRef         = useRef<THREE.MeshBasicMaterial>(null)
  const outerRef          = useRef<THREE.Mesh>(null)
  const outerMatRef       = useRef<THREE.MeshBasicMaterial>(null)
  const farRef            = useRef<THREE.Mesh>(null)
  const farMatRef         = useRef<THREE.MeshBasicMaterial>(null)

  // Nebula shell
  const nebulaRef         = useRef<THREE.Mesh>(null)
  const nebulaMatRef      = useRef<THREE.MeshBasicMaterial>(null)

  // Supernova shells (2 expanding rings + central flash)
  const snovaFlashRef     = useRef<THREE.Mesh>(null)
  const snovaFlashMatRef  = useRef<THREE.MeshBasicMaterial>(null)
  const snovaShell1Ref    = useRef<THREE.Mesh>(null)
  const snovaShell1MatRef = useRef<THREE.MeshBasicMaterial>(null)
  const snovaShell2Ref    = useRef<THREE.Mesh>(null)
  const snovaShell2MatRef = useRef<THREE.MeshBasicMaterial>(null)

  // Black hole parts
  const bhDiskRef         = useRef<THREE.Mesh>(null)
  const bhDiskMatRef      = useRef<THREE.MeshBasicMaterial>(null)
  const bhInnerRef        = useRef<THREE.Mesh>(null)
  const bhInnerMatRef     = useRef<THREE.MeshBasicMaterial>(null)

  // Neutron star jets
  const jet1Ref           = useRef<THREE.Mesh>(null)
  const jet1MatRef        = useRef<THREE.MeshBasicMaterial>(null)
  const jet2Ref           = useRef<THREE.Mesh>(null)
  const jet2MatRef        = useRef<THREE.MeshBasicMaterial>(null)

  // Lighting
  const lightRef          = useRef<THREE.PointLight>(null)
  const light2Ref         = useRef<THREE.PointLight>(null) // fill light

  // ── Animation state refs ─────────────────────────────────────────────────
  const lerpTRef         = useRef(1.0)
  const fromVisualRef    = useRef<StarVisual>(phaseToVisual(phases[0]))
  const toVisualRef      = useRef<StarVisual>(phaseToVisual(phases[0]))
  const currentVisualRef = useRef<StarVisual>(phaseToVisual(phases[0]))
  const snovaProgress    = useRef(0.0)   // 0 = none, counts down from 1
  const bhRotation       = useRef(0.0)
  const nsRotation       = useRef(0.0)

  // ── React to phase change ─────────────────────────────────────────────────
  useEffect(() => {
    fromVisualRef.current = cloneVisual(currentVisualRef.current)
    toVisualRef.current   = phaseToVisual(phases[currentPhaseIndex])
    lerpTRef.current      = 0.0

    if (SUPERNOVA_NAMES.has(phases[currentPhaseIndex]?.name)) {
      snovaProgress.current = 1.0
    }
  }, [currentPhaseIndex, phases])

  const isNeutronStar = phases[currentPhaseIndex]?.name === "Neutron Star Cooling"

  // ── Animation loop ────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // Advance transition
    if (lerpTRef.current < 1) {
      lerpTRef.current = Math.min(1, lerpTRef.current + delta / transitionDuration)
    }

    const v = lerpVisual(fromVisualRef.current, toVisualRef.current, lerpTRef.current)
    currentVisualRef.current = v

    // Organic pulse: high-freq for compact objects, slow for giants
    const pulseHz  = v.coreRadius < 1 ? 4.0 : v.coreRadius > 10 ? 0.5 : 1.2
    const pulseAmp = v.coreRadius < 1 ? 0.05 : 0.012
    const pulse    = 1 + Math.sin(t * pulseHz) * pulseAmp

    const r = v.isBlackHole ? 2.0 : v.coreRadius * pulse

    // ── Core ──────────────────────────────────────────────────────────────
    if (coreRef.current) coreRef.current.scale.setScalar(r)
    if (coreMatRef.current) {
      if (v.isBlackHole) {
        coreMatRef.current.color.setHex(0x030305)
        coreMatRef.current.emissive.setHex(0x000000)
        coreMatRef.current.emissiveIntensity = 0
      } else {
        coreMatRef.current.color.copy(v.coreColor)
        coreMatRef.current.emissive.copy(v.coreColor)
        coreMatRef.current.emissiveIntensity = v.emissiveIntensity
      }
    }

    // ── Corona layers — all at coreRadius * factor * pulse ───────────────
    const setLayer = (
      meshRef: React.RefObject<THREE.Mesh | null>,
      matRef: React.RefObject<THREE.MeshBasicMaterial | null>,
      scale: number,
      opacity: number,
      colorSource: THREE.Color
    ) => {
      if (meshRef.current) meshRef.current.scale.setScalar(scale)
      if (matRef.current) {
        matRef.current.color.copy(colorSource)
        matRef.current.opacity = opacity
      }
    }

    const cr = v.isBlackHole ? 0.001 : r
    setLayer(chromoRef, chromoMatRef, cr * 1.08,  v.chromosphereOpacity, v.coreColor)
    setLayer(innerRef,  innerMatRef,  cr * 1.65,  v.innerCoronaOpacity,  v.coronaTint)
    setLayer(midRef,    midMatRef,    cr * 3.2,   v.midCoronaOpacity,    v.coronaTint)
    setLayer(outerRef,  outerMatRef,  cr * 6.0,   v.outerHaloOpacity,    v.coronaTint)
    setLayer(farRef,    farMatRef,    cr * 11.0,  v.farHaloOpacity,      v.coronaTint)

    // ── Point lights ──────────────────────────────────────────────────────
    if (lightRef.current) {
      lightRef.current.intensity = v.lightIntensity
      lightRef.current.distance  = v.lightDistance
      lightRef.current.color.copy(v.coreColor)
    }
    if (light2Ref.current) {
      // Fill light: complementary warm tint at lower intensity
      light2Ref.current.intensity = v.lightIntensity * 0.15
      light2Ref.current.distance  = v.lightDistance * 1.5
      light2Ref.current.color.copy(v.coronaTint)
    }

    // ── Nebula shell ──────────────────────────────────────────────────────
    if (nebulaRef.current) {
      nebulaRef.current.scale.setScalar(
        v.hasNebula ? v.nebulaRadius * (1 + Math.sin(t * 0.3) * 0.04) : 0.001
      )
    }
    if (nebulaMatRef.current) {
      nebulaMatRef.current.color.copy(v.nebulaColor)
      nebulaMatRef.current.opacity = v.hasNebula ? 0.22 : 0
    }

    // ── Supernova flash + dual expanding shells ───────────────────────────
    if (snovaProgress.current > 0) {
      snovaProgress.current = Math.max(0, snovaProgress.current - delta * 0.55)
      const sp = snovaProgress.current
      // Central flash: quickly fades
      if (snovaFlashRef.current)    snovaFlashRef.current.scale.setScalar(r * (1 + (1 - sp) * 8))
      if (snovaFlashMatRef.current) snovaFlashMatRef.current.opacity = sp * 0.95
      // Shell 1: faster, brighter orange
      if (snovaShell1Ref.current)    snovaShell1Ref.current.scale.setScalar(r * (1 + (1 - sp) * 25))
      if (snovaShell1MatRef.current) snovaShell1MatRef.current.opacity = sp * 0.55
      // Shell 2: slower, deep red
      if (snovaShell2Ref.current)    snovaShell2Ref.current.scale.setScalar(r * (1 + (1 - sp) * 45))
      if (snovaShell2MatRef.current) snovaShell2MatRef.current.opacity = sp * 0.25
    } else {
      if (snovaFlashRef.current)     snovaFlashRef.current.scale.setScalar(0.001)
      if (snovaFlashMatRef.current)  snovaFlashMatRef.current.opacity = 0
      if (snovaShell1Ref.current)    snovaShell1Ref.current.scale.setScalar(0.001)
      if (snovaShell1MatRef.current) snovaShell1MatRef.current.opacity = 0
      if (snovaShell2Ref.current)    snovaShell2Ref.current.scale.setScalar(0.001)
      if (snovaShell2MatRef.current) snovaShell2MatRef.current.opacity = 0
    }

    // ── Black hole accretion disk ─────────────────────────────────────────
    const showBH = v.isBlackHole
    bhRotation.current += delta * (showBH ? 0.45 : 0)
    if (bhDiskRef.current) {
      bhDiskRef.current.visible = showBH
      bhDiskRef.current.rotation.z = bhRotation.current
    }
    if (bhDiskMatRef.current && showBH) {
      bhDiskMatRef.current.opacity = 0.72 + Math.sin(t * 1.5) * 0.12
    }
    if (bhInnerRef.current) {
      bhInnerRef.current.visible = showBH
      bhInnerRef.current.rotation.z = -bhRotation.current * 1.4
    }
    if (bhInnerMatRef.current && showBH) {
      bhInnerMatRef.current.opacity = 0.50 + Math.sin(t * 2.3) * 0.10
    }

    // ── Neutron star spin + jets ──────────────────────────────────────────
    nsRotation.current += delta * (isNeutronStar ? 9.0 : 0)
    if (coreRef.current && isNeutronStar) {
      coreRef.current.rotation.y = nsRotation.current
    }
    const jetAlpha = isNeutronStar ? 0.45 + Math.sin(t * 18) * 0.45 : 0
    if (jet1Ref.current)    jet1Ref.current.visible = isNeutronStar
    if (jet2Ref.current)    jet2Ref.current.visible = isNeutronStar
    if (jet1MatRef.current) jet1MatRef.current.opacity = jetAlpha
    if (jet2MatRef.current) jet2MatRef.current.opacity = jetAlpha
  })

  return (
    <>
      <Stars radius={280} depth={60} count={7000} factor={4.5} saturation={0} fade speed={0.4} />
      <ambientLight intensity={0.03} />
      <OrbitControls makeDefault dampingFactor={0.08} minDistance={2} maxDistance={800} enablePan={false} />

      {/* ── Core sphere ────────────────────────────────────────────────── */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color="#FFF4EA"
          emissive="#FFF4EA"
          emissiveIntensity={2}
          roughness={0.65}
          metalness={0}
          toneMapped={false}
        />
      </mesh>

      {/* ── Chromosphere — limb brightening, same color as core ──────── */}
      <mesh ref={chromoRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          ref={chromoMatRef}
          color="#FFF4EA"
          transparent
          opacity={0.6}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Inner corona ─────────────────────────────────────────────── */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          ref={innerMatRef}
          color="#FFFFFF"
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Mid corona ───────────────────────────────────────────────── */}
      <mesh ref={midRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          ref={midMatRef}
          color="#FFFFFF"
          transparent
          opacity={0.10}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Outer halo ───────────────────────────────────────────────── */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          ref={outerMatRef}
          color="#FFFFFF"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Far halo — only visible for very luminous stars ──────────── */}
      <mesh ref={farRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          ref={farMatRef}
          color="#FFFFFF"
          transparent
          opacity={0}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Nebula / AGB shell ───────────────────────────────────────── */}
      <mesh ref={nebulaRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial
          ref={nebulaMatRef}
          color="#7FFF00"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Supernova: central white flash ───────────────────────────── */}
      <mesh ref={snovaFlashRef} scale={0.001}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          ref={snovaFlashMatRef}
          color="#FFFFFF"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* ── Supernova: shell 1 — orange ejecta ───────────────────────── */}
      <mesh ref={snovaShell1Ref} scale={0.001}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          ref={snovaShell1MatRef}
          color="#FF7F00"
          transparent
          opacity={0}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* ── Supernova: shell 2 — deep red remnant ────────────────────── */}
      <mesh ref={snovaShell2Ref} scale={0.001}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          ref={snovaShell2MatRef}
          color="#CC2200"
          transparent
          opacity={0}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Black hole accretion disk ─────────────────────────────────── */}
      {/* Outer disk — orange-red thermal glow */}
      <mesh ref={bhDiskRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[4.0, 1.1, 20, 100]} />
        <meshBasicMaterial
          ref={bhDiskMatRef}
          color="#FF5500"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Inner disk — hot blue-white near event horizon */}
      <mesh ref={bhInnerRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[2.5, 0.5, 20, 100]} />
        <meshBasicMaterial
          ref={bhInnerMatRef}
          color="#88CCFF"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Neutron star radio jets ───────────────────────────────────── */}
      <mesh ref={jet1Ref} position={[0, 5.5, 0]} visible={false}>
        <cylinderGeometry args={[0.06, 0.12, 10, 8]} />
        <meshBasicMaterial
          ref={jet1MatRef}
          color="#88CCFF"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={jet2Ref} position={[0, -5.5, 0]} visible={false}>
        <cylinderGeometry args={[0.12, 0.06, 10, 8]} />
        <meshBasicMaterial
          ref={jet2MatRef}
          color="#88CCFF"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Primary point light ───────────────────────────────────────── */}
      <pointLight ref={lightRef} intensity={800} distance={450} decay={2} />
      {/* ── Warm fill light ───────────────────────────────────────────── */}
      <pointLight ref={light2Ref} position={[8, 6, 8]} intensity={100} distance={600} decay={2} />
    </>
  )
}
