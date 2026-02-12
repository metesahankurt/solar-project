"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY, mapLyToScene } from "./space-scale"
import webData from "@/data/2mrs_filaments.json"

type WebData = {
  positions: number[]
}

export function CosmicWeb() {
  const { viewDistanceAu } = useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY
  const fade = Math.min(1, Math.max(0, (viewLy - 1_000_000) / 1_500_000))

  const geometry = useMemo(() => {
    if (viewLy < 1_000_000) {
      return new THREE.BufferGeometry()
    }
    const raw = (webData as WebData).positions
    const count = raw.length / 3
    const positions = new Float32Array(raw.length)
    for (let i = 0; i < count; i += 1) {
      const x = raw[i * 3]
      const y = raw[i * 3 + 1]
      const z = raw[i * 3 + 2]
      const r = Math.sqrt(x * x + y * y + z * z)
      if (r === 0) {
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 0
        continue
      }
      const scale = mapLyToScene(r) / r
      positions[i * 3] = x * scale
      positions[i * 3 + 1] = y * scale
      positions[i * 3 + 2] = z * scale
    }
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return buffer
  }, [viewLy])

  if (viewLy < 1_000_000) return null

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#94a3b8" opacity={0.25 + fade * 0.25} transparent />
    </lineSegments>
  )
}
