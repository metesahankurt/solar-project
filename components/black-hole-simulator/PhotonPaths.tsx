"use client"

/**
 * @fileoverview Photon Path Renderer
 *
 * Visualizes photon trajectories (null geodesics) around the black hole.
 * Uses pre-computed trajectory data from lensingPhysics.ts and renders
 * them as 3D line strips.
 *
 * Displays:
 * - Captured photons (red) spiraling into the event horizon
 * - Near-miss photons (orange) with large deflection
 * - Deflected photons (blue) showing Einstein ring effect
 * - Weak-field rays (light blue) nearly straight
 */

import { useMemo } from "react"
import * as THREE from "three"
import type { PhotonTrajectory } from "@/types/blackHole"
import { trajectoryToCartesian3D } from "@/lib/lensingPhysics"

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE PHOTON PATH
// ─────────────────────────────────────────────────────────────────────────────

interface PhotonPathLineProps {
  trajectory: PhotonTrajectory
  verticalOffset: number
  opacity: number
}

function PhotonPathLine({ trajectory, verticalOffset, opacity }: PhotonPathLineProps) {
  const geometry = useMemo(() => {
    const points3D = trajectoryToCartesian3D(trajectory, verticalOffset)
    if (points3D.length < 2) return null

    const positions: number[] = []
    points3D.forEach(([x, y, z]) => {
      // Filter out extreme values (near singularity artifacts)
      if (Math.abs(x) < 200 && Math.abs(z) < 200) {
        positions.push(x, y, z)
      }
    })

    if (positions.length < 6) return null

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [trajectory, verticalOffset])

  if (!geometry) return null

  const color = new THREE.Color(trajectory.color)

  return (
    <primitive
      object={
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            linewidth: 1,
          })
        )
      }
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTON PATHS CONTAINER
// ─────────────────────────────────────────────────────────────────────────────

interface PhotonPathsProps {
  trajectories: PhotonTrajectory[]
  visible: boolean
}

export function PhotonPaths({ trajectories, visible }: PhotonPathsProps) {
  if (!visible || trajectories.length === 0) return null

  return (
    <group>
      {trajectories.map((traj, i) => {
        // Spread rays in the XZ plane at different heights for 3D display
        const vOffset = 0  // All in same plane for physical accuracy
        const opacity = traj.isCaptured ? 0.35 : 0.28
        return (
          <PhotonPathLine
            key={traj.id}
            trajectory={traj}
            verticalOffset={vOffset}
            opacity={opacity}
          />
        )
      })}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTON SPHERE RING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the photon sphere at 1.5 Rs — the radius at which photons
 * orbit in an unstable circular path.
 */
interface PhotonSphereRingProps {
  radiusInRs: number  // = 1.5
  visible: boolean
}

export function PhotonSphereRing({ radiusInRs, visible }: PhotonSphereRingProps) {
  if (!visible) return null

  return (
    <group>
      {/* Equatorial ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radiusInRs - 0.02, radiusInRs + 0.02, 128, 1]} />
        <meshBasicMaterial
          color="#ffaa00"
          side={THREE.DoubleSide}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Glow sphere wireframe */}
      <mesh>
        <sphereGeometry args={[radiusInRs, 32, 16]} />
        <meshBasicMaterial
          color="#ffaa00"
          wireframe
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ISCO RING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the Innermost Stable Circular Orbit at 3Rs.
 * Inside this radius, all orbits plunge into the black hole.
 */
interface ISCORingProps {
  radiusInRs: number  // = 3.0
  visible: boolean
}

export function ISCORing({ radiusInRs, visible }: ISCORingProps) {
  if (!visible) return null

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radiusInRs - 0.03, radiusInRs + 0.03, 128, 1]} />
      <meshBasicMaterial
        color="#44ff88"
        side={THREE.DoubleSide}
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}
