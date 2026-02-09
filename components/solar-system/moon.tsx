"use client"

import React, { useRef } from "react"
import * as THREE from "three"
import { Line } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Body, Ecliptic, GeoMoon, HelioVector } from "astronomy-engine"
import { moonData } from "@/data/planets"
import { useSimulation } from "./simulation-context"
import { SCENE_AU } from "@/lib/astronomy"

export function Moon() {
  const groupRef = useRef<THREE.Group>(null)
  const { simTimeMsRef, showOrbits, setLabelPosition } = useSimulation()
  const orbitEpochRef = useRef(Date.now())
  const lastOrbitUpdate = useRef(0)
  const [orbitEpoch, setOrbitEpoch] = React.useState(() => simTimeMsRef.current)
  const [orbitPoints, setOrbitPoints] = React.useState<THREE.Vector3[]>([])

  const visualRadius = Math.max(0.35, Math.log10(moonData.radius) * 0.22)

  useFrame((state, delta) => {
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

    const now = state.clock.elapsedTime
    if (now - lastOrbitUpdate.current > 10) {
      orbitEpochRef.current = simTimeMsRef.current
      setOrbitEpoch(simTimeMsRef.current)
      lastOrbitUpdate.current = now
    }

    const pos = groupRef.current.position.clone().project(state.camera)
    const screenX = (pos.x * 0.5 + 0.5) * state.size.width
    const screenY = (-pos.y * 0.5 + 0.5) * state.size.height
    if (pos.z < 1) {
      setLabelPosition({
        name: moonData.name,
        x: screenX,
        y: screenY,
        priority: 500,
        distance: state.camera.position.length(),
      })
    }
  })

  React.useEffect(() => {
    const points: THREE.Vector3[] = []
    const segments = 120
    const periodDays = moonData.orbitalPeriod / (24 * 60 * 60)
    for (let i = 0; i <= segments; i += 1) {
      const fraction = i / segments
      const time = new Date(orbitEpochRef.current + fraction * periodDays * 86_400_000)
      const earthHelio = Ecliptic(HelioVector(Body.Earth, time))
      const moonGeo = Ecliptic(GeoMoon(time))
      const xAu = earthHelio.vec.x + moonGeo.vec.x
      const zAu = earthHelio.vec.y + moonGeo.vec.y
      const yAu = earthHelio.vec.z + moonGeo.vec.z
      points.push(new THREE.Vector3(xAu * SCENE_AU, yAu * SCENE_AU * 0.2, zAu * SCENE_AU))
    }
    setOrbitPoints(points)
  }, [orbitEpoch])

  return (
    <group ref={groupRef}>
      {showOrbits && orbitPoints.length > 0 && (
        <Line points={orbitPoints} color="#9aa1a8" opacity={0.35} transparent lineWidth={1} />
      )}
      <mesh>
        <sphereGeometry args={[visualRadius, 24, 24]} />
        <meshStandardMaterial color={moonData.color} />
      </mesh>
    </group>
  )
}
