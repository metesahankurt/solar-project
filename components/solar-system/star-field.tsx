"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"

function seededRandom(seed: number) {
  let value = seed % 2147483647
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

export function StarField() {
  const { showStars, starDensity, starBrightness, starSize, performanceStars, viewDistanceAu } = useSimulation()

  const geometry = useMemo(() => {
    const radius = 5000
    const depth = 2000
    const dpr =
      typeof window !== "undefined" && window.devicePixelRatio
        ? window.devicePixelRatio
        : 1
    const distanceBoost =
      viewDistanceAu > 100_000 ? 1.8 : viewDistanceAu > 10_000 ? 1.4 : 1
    const effectiveDensity = performanceStars
      ? Math.min(starDensity, 6000)
      : Math.round(starDensity * distanceBoost)
    const count = Math.max(1000, Math.round(effectiveDensity / Math.max(1, dpr)))
    const rand = seededRandom(1337)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const palette = [
      new THREE.Color("#f8fafc"),
      new THREE.Color("#e2e8f0"),
      new THREE.Color("#fef3c7"),
      new THREE.Color("#dbeafe"),
    ]
    for (let i = 0; i < count; i += 1) {
      const r = radius + rand() * depth
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      const tint = palette[Math.floor(rand() * palette.length)]
      colors[i * 3] = tint.r
      colors[i * 3 + 1] = tint.g
      colors[i * 3 + 2] = tint.b
    }
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return buffer
  }, [starDensity, performanceStars, viewDistanceAu])

  if (!showStars) return null

  return (
    <points geometry={geometry}>
      <pointsMaterial
        vertexColors={!performanceStars}
        size={starSize}
        opacity={starBrightness}
        transparent
        depthWrite={false}
        depthTest={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  )
}
