"use client"

import React from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY, mapLyToScene } from "./space-scale"

function glowMaterial(color: string, opacity: number) {
  return new THREE.PointsMaterial({
    color,
    size: 3.2,
    opacity,
    transparent: true,
    depthWrite: false,
  })
}

export function LocalGroup() {
  const { viewDistanceAu } = useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY

  if (viewLy < 1_000_000) return null

  const milkyWay = new THREE.Vector3(0, 0, 0)
  const andromeda = new THREE.Vector3(mapLyToScene(2_500_000), 0, 0)
  const triangulum = new THREE.Vector3(mapLyToScene(2_730_000), mapLyToScene(350_000), 0)

  const points = new THREE.BufferGeometry().setFromPoints([milkyWay, andromeda, triangulum])

  return (
    <group>
      <points geometry={points} material={glowMaterial("#e2e8f0", 0.6)} />
    </group>
  )
}
