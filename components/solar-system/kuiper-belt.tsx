"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { mapAuToScene } from "./space-scale"

function buildBelt(count: number, innerAu: number, outerAu: number, thickness: number) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const radiusAu = innerAu + Math.random() * (outerAu - innerAu)
    const radius = mapAuToScene(radiusAu)
    const angle = Math.random() * Math.PI * 2
    const height = (Math.random() - 0.5) * thickness
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = height
    positions[i * 3 + 2] = Math.sin(angle) * radius
  }
  const buffer = new THREE.BufferGeometry()
  buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  return buffer
}

function buildScattered(count: number, innerAu: number, outerAu: number, thickness: number) {
  const positions = new Float32Array(count * 3)
  const logMin = Math.log10(innerAu)
  const logMax = Math.log10(outerAu)
  for (let i = 0; i < count; i += 1) {
    const radiusAu = Math.pow(10, logMin + Math.random() * (logMax - logMin))
    const radius = mapAuToScene(radiusAu)
    const angle = Math.random() * Math.PI * 2
    const height = (Math.random() - 0.5) * thickness
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = height
    positions[i * 3 + 2] = Math.sin(angle) * radius
  }
  const buffer = new THREE.BufferGeometry()
  buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  return buffer
}

export function KuiperBelt() {
  const { viewDistanceAu, performanceMode } = useSimulation()

  const { belt, scattered } = useMemo(() => {
    if (viewDistanceAu < 20) {
      return {
        belt: new THREE.BufferGeometry(),
        scattered: new THREE.BufferGeometry(),
      }
    }
    const beltCount = performanceMode ? 420 : 1400
    const scatterCount = performanceMode ? 240 : 800
    return {
      belt: buildBelt(beltCount, 30, 50, 6),
      scattered: buildScattered(scatterCount, 50, 1000, 20),
    }
  }, [performanceMode, viewDistanceAu])

  if (viewDistanceAu < 20) return null

  return (
    <group>
      <points geometry={belt}>
        <pointsMaterial size={0.55} color="#d8dee9" opacity={0.55} transparent />
      </points>
      <points geometry={scattered}>
        <pointsMaterial size={0.5} color="#a7b0bf" opacity={0.35} transparent />
      </points>
    </group>
  )
}
