"use client"

/**
 * @fileoverview Particle Orbit Renderer
 *
 * Renders test particles orbiting the black hole and their trajectory trails.
 * Particles follow Keplerian circular orbits scaled to Schwarzschild geometry,
 * with visual effects for time dilation and event horizon crossing.
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { SimulationParticle } from "@/types/blackHole"

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE PARTICLE
// ─────────────────────────────────────────────────────────────────────────────

interface ParticlePointProps {
  particle: SimulationParticle
}

function ParticlePoint({ particle }: ParticlePointProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const [x, y, z] = particle.position
    meshRef.current.position.set(x, y, z)

    if (glowRef.current) {
      glowRef.current.position.set(x, y, z)
    }

    // Update opacity
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = particle.opacity
  })

  const color = useMemo(() => new THREE.Color(particle.color), [particle.color])

  if (particle.isCaptured) return null

  return (
    <group>
      {/* Core particle dot */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={particle.opacity}
        />
      </mesh>

      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={particle.opacity * 0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE TRAIL
// ─────────────────────────────────────────────────────────────────────────────

interface ParticleTrailProps {
  particle: SimulationParticle
}

function ParticleTrail({ particle }: ParticleTrailProps) {
  const geometry = useMemo(() => {
    if (particle.trail.length < 2) return null

    const pts: number[] = []
    const cls: number[] = []
    const baseColor = new THREE.Color(particle.color)

    particle.trail.forEach(([x, y, z], i) => {
      pts.push(x, y, z)
      const alpha = i / particle.trail.length
      cls.push(baseColor.r * alpha, baseColor.g * alpha, baseColor.b * alpha)
    })

    if (pts.length < 6) return null

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3))
    geo.setAttribute("color", new THREE.Float32BufferAttribute(cls, 3))
    return geo
  }, [particle.trail, particle.color])

  if (!geometry) return null

  return (
    <primitive object={
      new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      )
    } />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ORBIT RING (stable circular orbit indicator)
// ─────────────────────────────────────────────────────────────────────────────

interface OrbitRingProps {
  radiusInRs: number
  color: string
  opacity?: number
}

export function OrbitRing({ radiusInRs, color, opacity = 0.15 }: OrbitRingProps) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radiusInRs - 0.01, radiusInRs + 0.01, 128, 1]} />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

interface ParticleOrbitProps {
  particles: SimulationParticle[]
  showTrails: boolean
}

export function ParticleOrbit({ particles, showTrails }: ParticleOrbitProps) {
  return (
    <group>
      {particles.map((p) => (
        <group key={p.id}>
          <ParticlePoint particle={p} />
          {showTrails && <ParticleTrail particle={p} />}
        </group>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTANCED PARTICLE RENDERER (performance variant for many particles)
// ─────────────────────────────────────────────────────────────────────────────

interface InstancedParticlesProps {
  particles: SimulationParticle[]
}

export function InstancedParticles({ particles }: InstancedParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    if (!meshRef.current) return

    particles.forEach((p, i) => {
      if (p.isCaptured) {
        dummy.position.set(0, -1000, 0)  // Hide captured particles
      } else {
        dummy.position.set(p.position[0], p.position[1], p.position[2])
        dummy.scale.setScalar(0.08 * p.opacity)
      }
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)

      // Update color
      const color = new THREE.Color(p.color)
      meshRef.current!.setColorAt(i, color)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  if (particles.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, particles.length]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  )
}
