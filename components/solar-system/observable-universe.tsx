"use client"

import React from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY, mapLyToScene } from "./space-scale"

export function ObservableUniverse() {
  const { viewDistanceAu } = useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY

  if (viewLy < 5_000_000_000) return null

  const radius = mapLyToScene(46_500_000_000)

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshBasicMaterial
        color="#e2e8f0"
        opacity={0.035}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
