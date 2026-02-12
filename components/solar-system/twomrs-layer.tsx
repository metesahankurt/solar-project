"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY, mapLyToScene } from "./space-scale"
import twomrsData from "@/data/2mrs.json"

type TwoMRS = {
  id: string
  raDeg: number
  decDeg: number
  cz: number
  vector: [number, number, number]
}

const C_KM_S = 299_792.458
const H0 = 70

export function TwoMRSLayer() {
  const { viewDistanceAu, selected2mrsId, setSelected2mrsId, performanceMode } = useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY
  const fade = Math.min(1, Math.max(0, (viewLy - 500_000) / 400_000))

  const geometry = useMemo(() => {
    if (viewLy < 500_000) {
      return new THREE.BufferGeometry()
    }
    const count = (twomrsData as TwoMRS[]).length
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const selected = selected2mrsId

    ;(twomrsData as TwoMRS[]).forEach((galaxy, index) => {
      const [vx, vy, vz] = galaxy.vector
      const z = galaxy.cz / C_KM_S
      const distMpc = (C_KM_S / H0) * z
      const distLy = distMpc * 3_261_560
      const radius = mapLyToScene(distLy)
      positions[index * 3] = vx * radius
      positions[index * 3 + 1] = vy * radius
      positions[index * 3 + 2] = vz * radius
      if (selected && galaxy.id === selected) {
        colors[index * 3] = 1
        colors[index * 3 + 1] = 0.92
        colors[index * 3 + 2] = 0.7
      } else {
        colors[index * 3] = 0.72
        colors[index * 3 + 1] = 0.8
        colors[index * 3 + 2] = 1
      }
    })

    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return buffer
  }, [selected2mrsId, viewLy])

  if (viewLy < 500_000) return null

  return (
    <points
      geometry={geometry}
      onPointerDown={(event) => {
        event.stopPropagation()
        const index = event.index ?? null
        if (index === null) return
        const entry = (twomrsData as TwoMRS[])[index]
        if (entry) setSelected2mrsId(entry.id)
      }}
    >
      <pointsMaterial
        vertexColors
        size={performanceMode ? 0.65 : 0.9}
        opacity={0.45 + fade * 0.35}
        transparent
        depthWrite={false}
      />
    </points>
  )
}
