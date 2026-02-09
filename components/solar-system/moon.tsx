"use client"

import React, { useRef } from "react"
import * as THREE from "three"
import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Body, Ecliptic, GeoMoon, HelioVector } from "astronomy-engine"
import { moonData } from "@/data/planets"
import { useSimulation } from "./simulation-context"

const SCENE_AU = 25

export function Moon() {
  const groupRef = useRef<THREE.Group>(null)
  const { simTimeMsRef, showLabels } = useSimulation()

  const visualRadius = Math.max(0.35, Math.log10(moonData.radius) * 0.22)

  useFrame(() => {
    if (!groupRef.current) return

    const time = new Date(simTimeMsRef.current)
    const earthHelio = Ecliptic(HelioVector(Body.Earth, time))
    const moonGeo = Ecliptic(GeoMoon(time))

    const xAu = earthHelio.vec.x + moonGeo.vec.x
    const zAu = earthHelio.vec.y + moonGeo.vec.y
    const yAu = earthHelio.vec.z + moonGeo.vec.z

    const x = xAu * SCENE_AU
    const z = zAu * SCENE_AU
    const y = yAu * SCENE_AU * 0.2
    groupRef.current.position.set(x, y, z)
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[visualRadius, 24, 24]} />
        <meshStandardMaterial color={moonData.color} />
      </mesh>
      {showLabels && (
        <Html position={[0, visualRadius * 1.8, 0]} center>
          <div className="rounded bg-background/70 px-2 py-0.5 text-[10px] text-foreground shadow-sm backdrop-blur">
            Moon
          </div>
        </Html>
      )}
    </group>
  )
}
