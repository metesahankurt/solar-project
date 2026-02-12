"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY, mapLyToScene } from "./space-scale"
import abellData from "@/data/abellzcat.json"

type AbellCluster = {
  id: string
  raDeg: number
  decDeg: number
  vector: [number, number, number]
  z: number
  distanceMpc: number
  distanceLy: number
  richness: number | null
  distanceClass: number | null
  bmClass: number | null
  bmQuality: string | null
  m10: number | null
  qz: string | null
  ref: string | null
  abellRadiusArcMin: number | null
  logZmZe: number | null
}

function colorForCluster(cluster: AbellCluster) {
  if (cluster.richness !== null && cluster.richness >= 2) return new THREE.Color("#fef3c7")
  return new THREE.Color("#c7d2fe")
}

export function AbellLayer() {
  const { viewDistanceAu, selectedClusterId, setSelectedClusterId, performanceMode } = useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY
  const fade = Math.min(1, Math.max(0, (viewLy - 2_000_000) / 2_000_000))

  const geometry = useMemo(() => {
    if (viewLy < 2_000_000) {
      return new THREE.BufferGeometry()
    }
    const count = (abellData as AbellCluster[]).length
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const selected = selectedClusterId

    ;(abellData as AbellCluster[]).forEach((cluster, index) => {
      const [vx, vy, vz] = cluster.vector
      const radius = mapLyToScene(cluster.distanceLy)
      positions[index * 3] = vx * radius
      positions[index * 3 + 1] = vy * radius
      positions[index * 3 + 2] = vz * radius
      const tint = colorForCluster(cluster)
      colors[index * 3] = tint.r
      colors[index * 3 + 1] = tint.g
      colors[index * 3 + 2] = tint.b
      if (selected && cluster.id === selected) {
        colors[index * 3] = 1
        colors[index * 3 + 1] = 0.95
        colors[index * 3 + 2] = 0.7
      }
    })

    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return buffer
  }, [selectedClusterId, performanceMode, viewLy])

  if (viewLy < 2_000_000) return null

  return (
    <points
      geometry={geometry}
      onPointerDown={(event) => {
        event.stopPropagation()
        const index = event.index ?? null
        if (index === null) return
        const entry = (abellData as AbellCluster[])[index]
        if (entry) setSelectedClusterId(entry.id)
      }}
    >
      <pointsMaterial
        vertexColors
        size={performanceMode ? 0.9 : 1.2}
        opacity={0.5 + fade * 0.35}
        transparent
        depthWrite={false}
      />
    </points>
  )
}
