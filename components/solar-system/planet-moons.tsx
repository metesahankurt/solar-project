"use client"

import React, { useMemo, useRef } from "react"
import * as THREE from "three"
import { Line } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useSimulation } from "./simulation-context"
import { moons, type Moon } from "@/data/moons"
import jplElements from "@/data/jpl_sat_elements.json"
import { AU_KM } from "@/lib/astronomy"
import { mapAuToScene } from "./space-scale"

type JplElement = {
  planet: string
  a_km: number
  e: number
  w_deg: number
  M_deg: number
  i_deg: number
  node_deg: number
  period_days: number
}

function kmToScene(km: number) {
  return mapAuToScene(km / AU_KM)
}

function solveKepler(M: number, e: number) {
  let E = e < 0.8 ? M : Math.PI
  for (let i = 0; i < 20; i += 1) {
    const f = E - e * Math.sin(E) - M
    const fp = 1 - e * Math.cos(E)
    const d = -f / fp
    E += d
    if (Math.abs(d) < 1e-8) break
  }
  return E
}

function orbitPosition(aKm: number, e: number, iDeg: number, nodeDeg: number, wDeg: number, Mdeg: number) {
  const M = (Mdeg * Math.PI) / 180
  const E = solveKepler(M, e)
  const x_p = aKm * (Math.cos(E) - e)
  const y_p = aKm * Math.sqrt(1 - e * e) * Math.sin(E)
  const i = (iDeg * Math.PI) / 180
  const node = (nodeDeg * Math.PI) / 180
  const w = (wDeg * Math.PI) / 180
  const cosO = Math.cos(node)
  const sinO = Math.sin(node)
  const cosw = Math.cos(w)
  const sinw = Math.sin(w)
  const cosi = Math.cos(i)
  const sini = Math.sin(i)
  const x = (cosO * cosw - sinO * sinw * cosi) * x_p + (-cosO * sinw - sinO * cosw * cosi) * y_p
  const y = (sinO * cosw + cosO * sinw * cosi) * x_p + (-sinO * sinw + cosO * cosw * cosi) * y_p
  const z = (sinw * sini) * x_p + (cosw * sini) * y_p
  return new THREE.Vector3(x, z, y)
}

function MoonOrbiter({ moon, element }: { moon: Moon; element: JplElement }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera, size } = useThree()
  const { simTimeMsRef, setSelectedPlanet, setHoveredPlanet, setLabelPosition, showOrbits } =
    useSimulation()

  const orbitPoints = useMemo(() => {
    if (!showOrbits) return []
    const pts: THREE.Vector3[] = []
    const segments = 120
    for (let i = 0; i <= segments; i += 1) {
      const frac = i / segments
      const M = (element.M_deg + frac * 360) % 360
      const p = orbitPosition(element.a_km, element.e, element.i_deg, element.node_deg, element.w_deg, M)
      pts.push(new THREE.Vector3(kmToScene(p.x), kmToScene(p.y), kmToScene(p.z)))
    }
    return pts
  }, [element, showOrbits])

  useFrame(() => {
    if (!meshRef.current) return
    const dt = (simTimeMsRef.current - Date.UTC(2000, 0, 1, 12, 0, 0)) / 1000
    const period = element.period_days * 86_400
    const meanMotion = (2 * Math.PI) / period
    const M = (element.M_deg * Math.PI) / 180 + meanMotion * dt
    const Mdeg = (M * 180) / Math.PI
    const pos = orbitPosition(element.a_km, element.e, element.i_deg, element.node_deg, element.w_deg, Mdeg)
    meshRef.current.position.set(kmToScene(pos.x), kmToScene(pos.y), kmToScene(pos.z))

    const worldPos = meshRef.current.getWorldPosition(new THREE.Vector3())
    const screen = worldPos.clone().project(camera)
    const screenX = (screen.x * 0.5 + 0.5) * size.width
    const screenY = (-screen.y * 0.5 + 0.5) * size.height
    if (screen.z < 1) {
      setLabelPosition({
        name: moon.name,
        x: screenX,
        y: screenY,
        priority: 200,
        distance: camera.position.length(),
      })
    }
  })

  const visualRadius = Math.max(0.35, Math.log10(moon.radius) * 0.25)

  return (
    <group>
      {showOrbits && orbitPoints.length > 0 && (
        <Line points={orbitPoints} color="#7f8ea3" opacity={0.3} transparent lineWidth={1} />
      )}
      <mesh
        ref={meshRef}
        onClick={() => setSelectedPlanet(moon)}
        onPointerOver={(event) => {
          document.body.style.cursor = "pointer"
          setHoveredPlanet({
            name: moon.name,
            screenX: event.clientX,
            screenY: event.clientY,
          })
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default"
          setHoveredPlanet(null)
        }}
        onPointerMove={(event) => {
          setHoveredPlanet({
            name: moon.name,
            screenX: event.clientX,
            screenY: event.clientY,
          })
        }}
      >
        <sphereGeometry args={[visualRadius, 16, 16]} />
        <meshStandardMaterial color={moon.color} emissive={moon.color} emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

export function PlanetMoons({ planet }: { planet: { name: string } }) {
  const { showMoon } = useSimulation()
  if (!showMoon) return null

  const satellites = moons.filter((moon) => moon.parent === planet.name)
  const elements = jplElements as Record<string, JplElement>

  return (
    <>
      {satellites.map((moon) => {
        const el = elements[moon.name]
        if (!el) return null
        return <MoonOrbiter key={moon.name} moon={moon} element={el} />
      })}
    </>
  )
}
