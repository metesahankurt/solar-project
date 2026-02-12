"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY, mapLyToScene } from "./space-scale"
import ngcData from "@/data/ngc2000_distances.json"

type NGCObject = {
  id: string
  type: string | null
  raHours: number
  raDeg: number
  decDeg: number
  vector: [number, number, number]
  source: string | null
  constellation: string | null
  sizeLimit: string | null
  sizeArcMin: number | null
  mag: number | null
  magType: string | null
  desc: string | null
  distanceMpc: number | null
  distanceLy: number | null
}

const CATALOG_RADIUS_LY = 2_000_000

function colorForType(type: string | null) {
  if (!type) return new THREE.Color("#94a3b8")
  if (type === "Gx") return new THREE.Color("#fef3c7")
  if (type === "OC") return new THREE.Color("#bae6fd")
  if (type === "Gb") return new THREE.Color("#fda4af")
  if (type === "Nb") return new THREE.Color("#c4b5fd")
  if (type === "Pl") return new THREE.Color("#fca5a5")
  if (type === "C+N") return new THREE.Color("#fdba74")
  return new THREE.Color("#a5b4fc")
}

export function NGCLayer() {
  const { viewDistanceAu, selectedDeepObjectId, setSelectedDeepObjectId, performanceMode } =
    useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY
  const fade = Math.min(1, Math.max(0, (viewLy - 50_000) / 80_000))

  const { geometry } = useMemo(() => {
    if (viewLy < 50_000) {
      return { geometry: new THREE.BufferGeometry() }
    }
    const count = (ngcData as NGCObject[]).length
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const selected = selectedDeepObjectId

    ;(ngcData as NGCObject[]).forEach((item, index) => {
      const [vx, vy, vz] = item.vector
      const distLy = item.distanceLy ?? CATALOG_RADIUS_LY
      const radius = mapLyToScene(distLy)
      positions[index * 3] = vx * radius
      positions[index * 3 + 1] = vy * radius
      positions[index * 3 + 2] = vz * radius
      const tint = colorForType(item.type)
      colors[index * 3] = tint.r
      colors[index * 3 + 1] = tint.g
      colors[index * 3 + 2] = tint.b
      if (selected && item.id === selected) {
        colors[index * 3] = 1
        colors[index * 3 + 1] = 0.95
        colors[index * 3 + 2] = 0.7
      }
    })

    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return { geometry: buffer }
  }, [selectedDeepObjectId, viewLy])

  if (viewLy < 50_000) return null

  const size = performanceMode ? 0.7 : 1

  return (
    <points
      geometry={geometry}
      onPointerDown={(event) => {
        event.stopPropagation()
        const index = event.index ?? null
        if (index === null) return
        const entry = (ngcData as NGCObject[])[index]
        if (entry) setSelectedDeepObjectId(entry.id)
      }}
    >
      <pointsMaterial
        vertexColors
        size={size}
        opacity={0.55 + fade * 0.35}
        transparent
        depthWrite={false}
      />
    </points>
  )
}
