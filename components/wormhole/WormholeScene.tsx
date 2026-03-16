/**
 * @fileoverview WormholeScene — Main Three.js / React Three Fiber 3D Scene
 *
 * Renders the full wormhole visualization with:
 *   • Embedding diagram (parametric funnel surface)
 *   • Wormhole throat portals with glow effects
 *   • Gravitationally lensed star field
 *   • Animated light ray trajectories
 *   • Orbit controls for interactive exploration
 *
 * The scene uses physically motivated parameters throughout, with render
 * units mapped to solar radii for the throat.
 */

"use client"

import React, { useMemo, useRef, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"

import type { WormholeSimulationState, StarData, GalaxyData, LightRayTrajectory } from "@/types/wormhole"
import {
  generateEmbeddingSurface,
  embeddingZ,
  radialCoordinate,
} from "@/lib/wormholePhysics"
import { generateLightRayTrajectories } from "@/lib/lightRayIntegrator"

// ─── Embedding Diagram ────────────────────────────────────────────────────────

/**
 * Renders the wormhole embedding diagram as a wireframe surface.
 * The characteristic "flared tube" shape is generated from the exact
 * Ellis wormhole embedding function z(r) = b₀·arccosh(r/b₀).
 */
function WormholeEmbedding({ b0, rMax = 5, visible }: {
  b0: number
  rMax?: number
  visible: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    const NR = 32  // Radial segments
    const NPhi = 64 // Azimuthal segments

    const positions: number[] = []
    const indices: number[] = []

    // Generate vertices for both sides (side=-1 = region A, side=+1 = region B)
    const sides = [-1, 1]
    let vertexOffset = 0

    for (const side of sides) {
      for (let ir = 0; ir < NR; ir++) {
        const t = ir / (NR - 1)
        // Quadratic spacing: more resolution near throat
        const r = b0 + (rMax * b0 - b0) * t * t
        const z = side * embeddingZ(r, b0)

        for (let iphi = 0; iphi <= NPhi; iphi++) {
          const phi = (2 * Math.PI * iphi) / NPhi
          positions.push(r * Math.cos(phi), z, r * Math.sin(phi))
        }
      }

      // Build quad index strips
      for (let ir = 0; ir < NR - 1; ir++) {
        for (let iphi = 0; iphi < NPhi; iphi++) {
          const a = vertexOffset + ir * (NPhi + 1) + iphi
          const b = a + 1
          const c = a + (NPhi + 1)
          const d = c + 1
          indices.push(a, b, c, b, d, c)
        }
      }

      vertexOffset += NR * (NPhi + 1)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [b0, rMax])

  return (
    <mesh ref={meshRef} geometry={geometry} visible={visible}>
      <meshStandardMaterial
        color="#2266ff"
        wireframe
        opacity={0.65}
        transparent
        side={THREE.DoubleSide}
        emissive="#1144cc"
        emissiveIntensity={0.4}
      />
    </mesh>
  )
}

// ─── Wormhole Throat Portal ────────────────────────────────────────────────────

/**
 * Renders the glowing wormhole throat portal disc.
 * Two portals are shown — one for each mouth of the wormhole.
 * The interior shader creates the "looking into another universe" effect.
 */
function WormholePortal({ b0, position, color }: {
  b0: number
  position: [number, number, number]
  color: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (glowRef.current) {
      const t = state.clock.getElapsedTime()
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.45 + 0.15 * Math.sin(t * 1.2)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Portal disc — inner surface */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[b0, 64]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} opacity={0.95} transparent />
      </mesh>

      {/* Glow ring — inner */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[b0, b0 * 1.6, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>

      {/* Bright rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[b0 * 0.93, b0 * 1.07, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={1.0} />
      </mesh>

      {/* Mid glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[b0 * 1.0, b0 * 2.0, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer glow halo */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[b0 * 1.8, b0 * 4.0, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.10} side={THREE.DoubleSide} />
      </mesh>

      {/* Point light at portal */}
      <pointLight color={color} intensity={12} distance={b0 * 50} decay={1.5} />
    </group>
  )
}

// ─── Wormhole Throat Geometry ─────────────────────────────────────────────────

/**
 * The tube connecting the two portals through the "interior" of the wormhole.
 * Rendered as a transparent tube with glow material.
 */
function WormholeThroat({ b0, length }: { b0: number; length: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime()
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.2 + 0.4 * Math.sin(t * 0.8)
    }
  })

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[b0, b0, length, 64, 1, true]} />
      <meshStandardMaterial
        color="#0a2060"
        emissive="#0055ff"
        emissiveIntensity={1.2}
        transparent
        opacity={0.55}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// ─── Light Rays ───────────────────────────────────────────────────────────────

/**
 * Renders the integrated null geodesic trajectories as colored line segments.
 * Rays are colour-coded by outcome:
 *   cyan-green = passed through wormhole
 *   blue       = deflected back
 *   orange     = orbiting near throat
 */
function LightRays({ trajectories, visible }: {
  trajectories: LightRayTrajectory[]
  visible: boolean
}) {
  const lineObjects = useMemo(() => {
    return trajectories.map((traj) => {
      if (traj.points.length < 2) return null

      const pts: THREE.Vector3[] = traj.points
        .filter((_, i) => i % 3 === 0)
        .map((p) => new THREE.Vector3(p.x, p.z ?? 0, p.y))

      const geometry = new THREE.BufferGeometry().setFromPoints(pts)
      const material = new THREE.LineBasicMaterial({
        color: traj.color,
        transparent: true,
        opacity: Math.min(1, traj.brightness * 1.4),
      })
      return new THREE.Line(geometry, material) as THREE.Object3D
    }).filter((l): l is THREE.Object3D => l !== null)
  }, [trajectories])

  if (!visible) return null

  return (
    <group>
      {lineObjects.map((lineObj, i) => (
        <primitive key={i} object={lineObj} />
      ))}
    </group>
  )
}

// ─── Star Field ───────────────────────────────────────────────────────────────

/**
 * Renders the catalog star field as individual points with spectral coloring.
 * Stars near the wormhole appear displaced due to gravitational lensing.
 */
function CatalogStarField({ stars, visible, b0 }: {
  stars: StarData[]
  visible: boolean
  b0: number
}) {
  const geometry = useMemo(() => {
    if (stars.length === 0) return null

    const positions = new Float32Array(stars.length * 3)
    const colors = new Float32Array(stars.length * 3)
    const sizes = new Float32Array(stars.length)

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i]
      // Convert RA/Dec to 3D position on a sphere of radius ~800 units
      const ra = (star.ra * Math.PI) / 180
      const dec = (star.dec * Math.PI) / 180
      const dist = 800

      positions[i * 3 + 0] = dist * Math.cos(dec) * Math.cos(ra)
      positions[i * 3 + 1] = dist * Math.sin(dec)
      positions[i * 3 + 2] = dist * Math.cos(dec) * Math.sin(ra)

      // Parse hex color
      const hex = star.color.replace("#", "")
      const r = parseInt(hex.slice(0, 2), 16) / 255
      const g = parseInt(hex.slice(2, 4), 16) / 255
      const b = parseInt(hex.slice(4, 6), 16) / 255
      colors[i * 3 + 0] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b

      // Size from magnitude (brighter = larger point)
      const flux = Math.pow(10, -0.4 * star.magnitude)
      sizes[i] = Math.max(2, Math.min(12, flux * 500 + 2))
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
    geo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1))
    return geo
  }, [stars])

  if (!visible || !geometry) return null

  return (
    <points geometry={geometry}>
      <pointsMaterial
        vertexColors
        sizeAttenuation={false}
        size={3}
        transparent
        opacity={0.95}
      />
    </points>
  )
}

// ─── Particle Accretion Halos ─────────────────────────────────────────────────

/**
 * Animated particles orbiting the wormhole mouths, representing
 * the exotic matter configuration needed to hold the wormhole open.
 */
function ExoticMatterHalo({ b0, visible }: { b0: number; visible: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)
  const N = 500

  const geometry = useMemo(() => {
    const positions = new Float32Array(N * 3)
    const speeds = new Float32Array(N)

    for (let i = 0; i < N; i++) {
      const r = b0 * (1 + Math.random() * 2.5)
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * 0.4

      positions[i * 3 + 0] = r * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi)
      positions[i * 3 + 2] = r * Math.sin(theta)
      speeds[i] = 0.2 + Math.random() * 0.8
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    ;(geo as THREE.BufferGeometry & { userData: { speeds: Float32Array } }).userData = {
      speeds,
    }
    return geo
  }, [b0, N])

  useFrame((state) => {
    if (!pointsRef.current || !visible) return
    const t = state.clock.getElapsedTime()
    const pos = pointsRef.current.geometry.attributes.position
    const { speeds } = (pointsRef.current.geometry as THREE.BufferGeometry & {
      userData: { speeds: Float32Array }
    }).userData

    for (let i = 0; i < N; i++) {
      const angle = t * speeds[i] * 0.3 + i * 0.012
      const r = b0 * (1 + (i % 10) * 0.25)
      const phi = (((i * 7) % 20) / 20 - 0.5) * 0.5

      pos.setXYZ(
        i,
        r * Math.cos(angle),
        r * Math.sin(phi) * 0.3,
        r * Math.sin(angle)
      )
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry} visible={visible}>
      <pointsMaterial
        color="#00eeff"
        size={0.14}
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  )
}

// ─── Galaxy Field ─────────────────────────────────────────────────────────────

function GalaxyField({ galaxies, visible }: { galaxies: GalaxyData[]; visible: boolean }) {
  const geometry = useMemo(() => {
    if (galaxies.length === 0) return null

    const positions = new Float32Array(galaxies.length * 3)
    const colors = new Float32Array(galaxies.length * 3)

    for (let i = 0; i < galaxies.length; i++) {
      const gal = galaxies[i]
      const ra = (gal.ra * Math.PI) / 180
      const dec = (gal.dec * Math.PI) / 180
      const dist = 600 + (gal.distanceMpc / 100) * 200

      positions[i * 3 + 0] = dist * Math.cos(dec) * Math.cos(ra)
      positions[i * 3 + 1] = dist * Math.sin(dec)
      positions[i * 3 + 2] = dist * Math.cos(dec) * Math.sin(ra)

      const hex = gal.color.replace("#", "")
      colors[i * 3 + 0] = parseInt(hex.slice(0, 2), 16) / 255
      colors[i * 3 + 1] = parseInt(hex.slice(2, 4), 16) / 255
      colors[i * 3 + 2] = parseInt(hex.slice(4, 6), 16) / 255
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
    return geo
  }, [galaxies])

  if (!visible || !geometry) return null

  return (
    <points geometry={geometry}>
      <pointsMaterial
        vertexColors
        sizeAttenuation={false}
        size={4}
        transparent
        opacity={0.7}
      />
    </points>
  )
}

// ─── Scene Content ────────────────────────────────────────────────────────────

function SceneContent({
  state,
  stars,
  galaxies,
}: {
  state: WormholeSimulationState
  stars: StarData[]
  galaxies: GalaxyData[]
}) {
  // Convert display units to render units
  const b0 = state.throatRadiusSolar * 0.4   // 1 solar radius → 0.4 render units
  const halfLen = state.mouthSeparationAU * 0.2  // 1 AU → 0.2 units

  // Generate light ray trajectories
  const trajectories = useMemo(() => {
    if (!state.showLightRays) return []
    return generateLightRayTrajectories(b0, state.lightRayCount, 1)
  }, [b0, state.lightRayCount, state.showLightRays])

  return (
    <>
      {/* Ambient space lighting */}
      <ambientLight intensity={0.12} />
      <directionalLight position={[100, 50, 100]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-80, -30, -60]} intensity={0.4} color="#4488ff" />

      {/* Wormhole embedding diagram */}
      <WormholeEmbedding b0={b0} rMax={5} visible={state.showEmbeddingDiagram} />

      {/* Wormhole throat tube */}
      <WormholeThroat b0={b0} length={halfLen * 2} />

      {/* Portal mouths */}
      <WormholePortal b0={b0} position={[0, -halfLen, 0]} color="#00ccff" />
      <WormholePortal b0={b0} position={[0,  halfLen, 0]} color="#cc88ff" />

      {/* Exotic matter halo */}
      <ExoticMatterHalo b0={b0} visible={state.showExoticMatter} />

      {/* Light ray trajectories */}
      <LightRays trajectories={trajectories} visible={state.showLightRays} />

      {/* Catalog star field */}
      <CatalogStarField stars={stars} visible={state.showStarField} b0={b0} />

      {/* Background procedural stars from @react-three/drei */}
      {state.showStarField && (
        <Stars
          radius={1200}
          depth={200}
          count={Math.round(state.starDensity * 8000)}
          factor={4}
          saturation={0.4}
          fade
        />
      )}

      {/* Galaxy field */}
      <GalaxyField galaxies={galaxies} visible={state.showGalaxies} />
    </>
  )
}

// ─── Main Canvas Export ───────────────────────────────────────────────────────

interface WormholeSceneProps {
  state: WormholeSimulationState
  stars: StarData[]
  galaxies: GalaxyData[]
  className?: string
}

export function WormholeScene({ state, stars, galaxies, className }: WormholeSceneProps) {
  return (
    <div className={className ?? "w-full h-full"}>
      <Canvas
        camera={{ position: [0, 8, 22], fov: 60, near: 0.01, far: 5000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#000005" }}
      >
        <SceneContent state={state} stars={stars} galaxies={galaxies} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={1}
          maxDistance={400}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
