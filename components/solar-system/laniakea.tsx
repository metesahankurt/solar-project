"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY, mapLyToScene } from "./space-scale"

function buildFilament(count: number, radiusLy: number) {
  const positions = new Float32Array(count * 3)
  const logMin = Math.log10(radiusLy * 0.2)
  const logMax = Math.log10(radiusLy)
  for (let i = 0; i < count; i += 1) {
    const radiusLySample = Math.pow(10, logMin + Math.random() * (logMax - logMin))
    const radius = mapLyToScene(radiusLySample)
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const sinPhi = Math.sin(phi)
    positions[i * 3] = radius * sinPhi * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi)
    positions[i * 3 + 2] = radius * sinPhi * Math.sin(theta)
  }
  const buffer = new THREE.BufferGeometry()
  buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  return buffer
}

export function Laniakea() {
  const { viewDistanceAu, performanceMode } = useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY

  if (viewLy < 80_000_000) return null

  const geometry = useMemo(() => {
    const count = performanceMode ? 1200 : 3000
    return buildFilament(count, 520_000_000)
  }, [performanceMode])

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.8} color="#94a3b8" opacity={0.18} transparent depthWrite={false} />
    </points>
  )
}
