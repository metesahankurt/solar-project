"use client"

/**
 * @fileoverview Accretion Disk Renderer
 *
 * Renders a physically-inspired accretion disk using Three.js geometry.
 * Temperature-graded rings with Keplerian rotation and additive blending.
 *
 * Physical basis:
 * - Inner edge at ISCO (3Rs)
 * - Outer edge at ~100Rs
 * - Temperature decreases radially: T ∝ r^(-3/4) (Shakura-Sunyaev profile)
 * - Doppler brightening on approaching side (bottom arc)
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { AccretionDiskProperties } from "@/types/blackHole"
import { diskTemperatureColor } from "@/lib/blackHolePhysics"

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DISK_SEGMENTS = 32
const ANGULAR_SEGMENTS = 128

// ─────────────────────────────────────────────────────────────────────────────
// COLOR HELPER
// ─────────────────────────────────────────────────────────────────────────────

function diskRadiusToColor(t: number, peakTemp: number): THREE.Color {
  const tempAtRadius = peakTemp * Math.pow(1 + t * 4, -0.75)
  const hex = diskTemperatureColor(tempAtRadius)
  return new THREE.Color(hex)
}

// ─────────────────────────────────────────────────────────────────────────────
// DISK RING
// ─────────────────────────────────────────────────────────────────────────────

interface DiskRingProps {
  innerRadiusInRs: number
  outerRadiusInRs: number
  tNormalized: number
  peakTemperature: number
  opacity: number
  rotationSpeed: number
}

function DiskRing({
  innerRadiusInRs,
  outerRadiusInRs,
  tNormalized,
  peakTemperature,
  opacity,
  rotationSpeed,
}: DiskRingProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const color = useMemo(
    () => diskRadiusToColor(tNormalized, peakTemperature),
    [tNormalized, peakTemperature]
  )

  useFrame((_, delta) => {
    if (meshRef.current) {
      const omega = rotationSpeed * Math.pow(innerRadiusInRs, -1.5)
      meshRef.current.rotation.y += omega * delta
    }
  })

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerRadiusInRs, outerRadiusInRs, ANGULAR_SEGMENTS, 1]} />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DOPPLER BRIGHTENING — approaching side glows warmer and brighter
// ─────────────────────────────────────────────────────────────────────────────

function DopplerArc({ innerR, outerR, rotationSpeed }: {
  innerR: number
  outerR: number
  rotationSpeed: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      const omega = rotationSpeed * Math.pow(innerR, -1.5) * 0.8
      meshRef.current.rotation.z += omega * delta
    }
  })

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      {/* Bottom semicircle = approaching (blueshifted, brighter) side */}
      <ringGeometry args={[innerR, outerR * 0.8, 100, 1, Math.PI * 0.85, Math.PI * 1.3]} />
      <meshBasicMaterial
        color="#ffcc44"
        side={THREE.DoubleSide}
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTER GLOW HALO
// ─────────────────────────────────────────────────────────────────────────────

function DiskGlow({ innerRadius, outerRadius, color }: {
  innerRadius: number
  outerRadius: number
  color: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const time = useRef(0)

  useFrame((_, delta) => {
    time.current += delta
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001
      const mat = meshRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.06 + 0.015 * Math.sin(time.current * 1.5)
    }
  })

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerRadius * 0.9, outerRadius * 1.4, 128, 1]} />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent
        opacity={0.06}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface AccretionDiskProps {
  disk: AccretionDiskProperties
  schwarzschildRadiusM: number
  simulationSpeed: number
}

export function AccretionDisk({ disk, schwarzschildRadiusM, simulationSpeed }: AccretionDiskProps) {
  const { innerEdgeRadiusM, outerEdgeRadiusM, peakTemperatureK, peakEmissionColor } = disk
  const rsM = schwarzschildRadiusM

  const innerRs = innerEdgeRadiusM / rsM   // = 3 (ISCO)
  const outerRs = Math.min(outerEdgeRadiusM / rsM, 30)

  const rings = useMemo(() => {
    const layers: DiskRingProps[] = []

    for (let i = 0; i < DISK_SEGMENTS; i++) {
      const t0 = i / DISK_SEGMENTS
      const t1 = (i + 1) / DISK_SEGMENTS

      const rInner = innerRs * Math.pow(outerRs / innerRs, t0)
      const rOuter = innerRs * Math.pow(outerRs / innerRs, t1)

      const opacity = 0.75 * Math.exp(-t0 * 2.5) + 0.06

      layers.push({
        innerRadiusInRs: rInner,
        outerRadiusInRs: rOuter,
        tNormalized: t0,
        peakTemperature: peakTemperatureK,
        opacity,
        rotationSpeed: simulationSpeed * 0.5,
      })
    }

    return layers
  }, [innerRs, outerRs, peakTemperatureK, simulationSpeed])

  return (
    <group>
      {/* Main disk rings */}
      {rings.map((ring, i) => (
        <DiskRing key={i} {...ring} />
      ))}

      {/* Doppler brightening arc */}
      <DopplerArc innerR={innerRs} outerR={innerRs * 3.5} rotationSpeed={simulationSpeed * 0.5} />

      {/* Outer diffuse glow */}
      <DiskGlow innerRadius={innerRs} outerRadius={outerRs} color={peakEmissionColor} />

      {/* ISCO inner edge — bright hot ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[innerRs * 0.94, innerRs * 1.12, 200, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Secondary warm glow just outside ISCO */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[innerRs * 0.85, innerRs * 1.4, 128, 1]} />
        <meshBasicMaterial
          color={peakEmissionColor}
          side={THREE.DoubleSide}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
