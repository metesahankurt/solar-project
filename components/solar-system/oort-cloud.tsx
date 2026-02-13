"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { mapAuToScene } from "./space-scale"

function buildCloud(count: number, innerAu: number, outerAu: number) {
  const positions = new Float32Array(count * 3)
  const logMin = Math.log10(innerAu)
  const logMax = Math.log10(outerAu)
  for (let i = 0; i < count; i += 1) {
    const radiusAu = Math.pow(10, logMin + Math.random() * (logMax - logMin))
    const radius = mapAuToScene(radiusAu)
    const u = Math.random()
    const v = Math.random()
    const theta = 2 * Math.PI * u
    const phi = Math.acos(2 * v - 1)
    const sinPhi = Math.sin(phi)
    positions[i * 3] = radius * sinPhi * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi)
    positions[i * 3 + 2] = radius * sinPhi * Math.sin(theta)
  }
  const buffer = new THREE.BufferGeometry()
  buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  return buffer
}

export function OortCloud() {
  const { viewDistanceAu, performanceMode } = useSimulation()

  const { inner, outer } = useMemo(() => {
    if (viewDistanceAu < 1000) {
      return {
        inner: new THREE.BufferGeometry(),
        outer: new THREE.BufferGeometry(),
      }
    }
    const innerCount = performanceMode ? 800 : 1800
    const outerCount = performanceMode ? 500 : 1400
    return {
      inner: buildCloud(innerCount, 2000, 20000),
      outer: buildCloud(outerCount, 20000, 100000),
    }
  }, [performanceMode, viewDistanceAu])

  if (viewDistanceAu < 1000) return null

  const fade = Math.min(1, Math.max(0, (viewDistanceAu - 1000) / 3000))

  return (
    <group>
      <points geometry={inner}>
        <pointsMaterial size={0.6} color="#94a3b8" opacity={0.25 + fade * 0.2} transparent />
      </points>
      <points geometry={outer}>
        <pointsMaterial size={0.55} color="#7f8ea3" opacity={0.18 + fade * 0.12} transparent />
      </points>
    </group>
  )
}
