"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"

const SCENE_AU = 25

export function AsteroidBelt() {
  const { showAsteroids } = useSimulation()

  const geometry = useMemo(() => {
    const inner = 2.1 * SCENE_AU
    const outer = 3.3 * SCENE_AU
    const count = 1500
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const radius = inner + Math.random() * (outer - inner)
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 0.8
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return buffer
  }, [])

  if (!showAsteroids) return null

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.3} color="#8b949e" opacity={0.6} transparent />
    </points>
  )
}
