"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY, mapLyToScene } from "./space-scale"

function buildDisk(count: number, radiusLy: number, thickness: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const palette = [
    new THREE.Color("#cbd5f5"),
    new THREE.Color("#e2e8f0"),
    new THREE.Color("#fef3c7"),
    new THREE.Color("#bcd4ff"),
  ]
  for (let i = 0; i < count; i += 1) {
    const r = Math.sqrt(Math.random()) * radiusLy
    const angle = Math.random() * Math.PI * 2
    const spiral = r * 0.00008
    const arm = Math.random() > 0.5 ? 0 : Math.PI
    const theta = angle + spiral + arm
    const radius = mapLyToScene(r)
    positions[i * 3] = Math.cos(theta) * radius
    positions[i * 3 + 1] = (Math.random() - 0.5) * thickness
    positions[i * 3 + 2] = Math.sin(theta) * radius

    const tint = palette[Math.floor(Math.random() * palette.length)]
    colors[i * 3] = tint.r
    colors[i * 3 + 1] = tint.g
    colors[i * 3 + 2] = tint.b
  }
  const buffer = new THREE.BufferGeometry()
  buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  return buffer
}

export function GalacticDisk() {
  const { viewDistanceAu, performanceMode } = useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY
  const showThresholdLy = 80_000

  const { disk, haloRadius } = useMemo(() => {
    if (viewLy < showThresholdLy) {
      return {
        disk: new THREE.BufferGeometry(),
        haloRadius: mapLyToScene(1),
      }
    }
    const count = performanceMode ? 900 : 2600
    const radiusLy = 50_000
    return {
      disk: buildDisk(count, radiusLy, 260),
      haloRadius: mapLyToScene(radiusLy * 1.1),
    }
  }, [performanceMode, viewLy])

  if (viewLy < showThresholdLy) return null

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <points geometry={disk}>
        <pointsMaterial
          vertexColors
          size={0.8}
          opacity={0.28}
          transparent
          depthWrite={false}
        />
      </points>
      <mesh>
        <ringGeometry args={[haloRadius * 0.2, haloRadius, 120]} />
        <meshBasicMaterial color="#60a5fa" opacity={0.05} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
