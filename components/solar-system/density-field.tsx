"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY, mapLyToScene } from "./space-scale"
import densityData from "@/data/2mrs_density.json"

type DensityData = {
  points: [number, number, number][]
  weights: number[]
}

export function DensityField() {
  const { viewDistanceAu, performanceMode } = useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY
  const fade = Math.min(1, Math.max(0, (viewLy - 700_000) / 600_000))

  const geometry = useMemo(() => {
    if (viewLy < 700_000) {
      return new THREE.BufferGeometry()
    }
    const points = (densityData as DensityData).points
    const weights = (densityData as DensityData).weights
    const count = points.length
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const [x, y, z] = points[i]
      const r = Math.sqrt(x * x + y * y + z * z)
      const scale = r === 0 ? 0 : mapLyToScene(r) / r
      positions[i * 3] = x * scale
      positions[i * 3 + 1] = y * scale
      positions[i * 3 + 2] = z * scale
      const w = weights[i]
      const brightness = 0.3 + w * 0.7
      colors[i * 3] = 0.55 + brightness * 0.3
      colors[i * 3 + 1] = 0.65 + brightness * 0.2
      colors[i * 3 + 2] = 0.9
    }
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return buffer
  }, [viewLy])

  if (viewLy < 700_000) return null

  return (
    <points geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={performanceMode ? 0.6 : 0.9}
        opacity={0.25 + fade * 0.35}
        transparent
        depthWrite={false}
      />
    </points>
  )
}
