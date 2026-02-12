"use client"

import React from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { mapAuToScene } from "./space-scale"

export function Heliosphere() {
  const { viewDistanceAu } = useSimulation()

  if (viewDistanceAu < 150) return null

  const heliopause = mapAuToScene(122)
  const terminationShock = mapAuToScene(90)

  return (
    <group>
      <mesh>
        <sphereGeometry args={[terminationShock, 48, 48]} />
        <meshBasicMaterial
          color="#7dd3fc"
          opacity={0.035}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[heliopause, 64, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          opacity={0.06}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
