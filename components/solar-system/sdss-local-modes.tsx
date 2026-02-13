"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY, mapLyToScene } from "./space-scale"
import sdssData from "@/data/sdss_localmodes.json"

type SDSSLocalMode = {
  raDeg: number
  decDeg: number
  distLy: number
  vector: [number, number, number]
  density: number
  densityNorm: number
}

export function SDSSLocalModes() {
  const { viewDistanceAu, performanceMode } = useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY
  const fade = Math.min(1, Math.max(0, (viewLy - 1_500_000) / 1_500_000))

  const geometry = useMemo(() => {
    if (viewLy < 1_500_000) {
      return new THREE.BufferGeometry()
    }
    const data = sdssData as SDSSLocalMode[]
    const count = data.length
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const item = data[i]
      const [vx, vy, vz] = item.vector
      const radius = mapLyToScene(item.distLy)
      positions[i * 3] = vx * radius
      positions[i * 3 + 1] = vy * radius
      positions[i * 3 + 2] = vz * radius
      const w = item.densityNorm ?? 0.5
      colors[i * 3] = 0.6 + w * 0.35
      colors[i * 3 + 1] = 0.7 + w * 0.25
      colors[i * 3 + 2] = 1.0
    }
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return buffer
  }, [viewLy])

  if (viewLy < 1_500_000) return null

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
