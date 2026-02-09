import React, { useMemo, useRef } from "react"
import { Planet as PlanetType } from "@/data/planets"
import { Line } from "@react-three/drei"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { useSimulation } from "./simulation-context"
import { AU_METERS, MS_PER_DAY, SCENE_AU } from "@/lib/astronomy"
import {
  AstroTime,
  BaryState,
  Body,
  CorrectLightTravel,
  Ecliptic,
  HelioVector,
  MakeTime,
  PlanetOrbitalPeriod,
  Vector,
} from "astronomy-engine"

interface PlanetProps {
  planet: PlanetType
}

export function Planet({ planet }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const {
    isPaused,
    selectedPlanet,
    setSelectedPlanet,
    setLiveMetrics,
    setHoveredPlanet,
    hoveredPlanet,
    simTimeMsRef,
    showOrbits,
    setLabelPosition,
    useLightTimeCorrection,
    useBarycenter,
  } = useSimulation()
  const { camera, size } = useThree()

  // Simplification for skeleton: 
  // semiMajorAxis is in meters. 
  // Let's bring it down to a 3D scene scale.
  // 1 AU = 149.6e9 m.
  // Let's map 1 AU to 50 scene units for visualization.
  const REAL_AU = AU_METERS;
  
  // Visual size sizing
  // Earth radius ~6371km. 
  // Sun radius ~696000km (~109x Earth).
  // If Sun is 5 units (from Sun.tsx), Earth should be ~0.04 units preserving relative scale? 
  // That's too small to see.
  // Let's use a logarithmic or arbitrary visual scale for now so planets are visible.
  const visualRadius = Math.max(0.8, Math.log10(planet.radius) * 0.34); 
  const lastMetricsUpdate = useRef(0)
  const labelUpdateRef = useRef(0)
  const orbitEpochRef = useRef(Date.now())

  useFrame((state, delta) => {
    if (isPaused || !meshRef.current || !groupRef.current) return

    const body = Body[planet.name as keyof typeof Body]
    if (!body) return

    const time = MakeTime(new Date(simTimeMsRef.current))
    const toVector = (t: AstroTime) => {
      if (useBarycenter) {
        const state = BaryState(body, t)
        return new Vector(state.x, state.y, state.z, t)
      }
      return HelioVector(body, t)
    }
    const vec = useLightTimeCorrection ? CorrectLightTravel(toVector, time) : toVector(time)
    const eclip = Ecliptic(vec)
    const xAu = eclip.vec.x
    const zAu = eclip.vec.y
    const yAu = eclip.vec.z

    const x = xAu * SCENE_AU
    const z = zAu * SCENE_AU
    const y = yAu * SCENE_AU * 0.2
    groupRef.current.position.set(x, y, z)

    if (planet.name === selectedPlanet.name || planet.name === hoveredPlanet?.name) {
      const now = state.clock.elapsedTime
      if (now - lastMetricsUpdate.current > 0.1) {
        const angle = Math.atan2(zAu, xAu)
        const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const orbitalProgress = normalizedAngle / (2 * Math.PI)
        const distanceAu = Math.sqrt(xAu * xAu + zAu * zAu)
        setLiveMetrics(planet.name, {
          angle: normalizedAngle,
          xAu,
          zAu,
          orbitalProgress,
          distanceAu,
        })
        lastMetricsUpdate.current = now
      }
    }

    const now = state.clock.elapsedTime
    if (now - labelUpdateRef.current > 0.25) {
      const pos = groupRef.current.position.clone().project(camera)
      const x = (pos.x * 0.5 + 0.5) * size.width
      const y = (-pos.y * 0.5 + 0.5) * size.height
      const camDist = camera.position.length()
      const priority =
        (planet.name === selectedPlanet.name ? 1000 : 0) + planet.semiMajorAxis / REAL_AU
      if (pos.z < 1) {
        setLabelPosition({
          name: planet.name,
          x,
          y,
          priority,
          distance: camDist,
        })
      }
      labelUpdateRef.current = now
    }
  })

  // Create orbit points for the line
  const orbitPoints = useMemo(() => {
    const body = Body[planet.name as keyof typeof Body]
    if (!body) return []
    const points: THREE.Vector3[] = []
    const periodDays = PlanetOrbitalPeriod(body)
    const segments = 240
    for (let i = 0; i <= segments; i += 1) {
      const fraction = i / segments
      const time = MakeTime(new Date(orbitEpochRef.current + fraction * periodDays * MS_PER_DAY))
      const vec = (() => {
        if (useBarycenter) {
          const state = BaryState(body, time)
          return new Vector(state.x, state.y, state.z, time)
        }
        return HelioVector(body, time)
      })()
      const eclip = Ecliptic(vec)
      const x = eclip.vec.x * SCENE_AU
      const z = eclip.vec.y * SCENE_AU
      const y = eclip.vec.z * SCENE_AU * 0.2
      points.push(new THREE.Vector3(x, y, z))
    }
    return points
  }, [planet.name, useBarycenter])

  const isSelected = selectedPlanet.name === planet.name
  const orbitOpacity = isSelected ? 0.85 : planet.semiMajorAxis / REAL_AU > 20 ? 0.25 : 0.4
  const orbitColor = isSelected ? "#e2e8f0" : "#9aa1a8"

  return (
    <group>
      {/* Orbit Line */}
      {showOrbits && (
        <Line points={orbitPoints} color={orbitColor} opacity={orbitOpacity} transparent lineWidth={1} />
      )}

      {/* Planet Mesh */}
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          onClick={() => setSelectedPlanet(planet)}
          onPointerMove={(event) => {
            setHoveredPlanet((prev) => {
              if (
                prev &&
                prev.name === planet.name &&
                Math.abs(prev.screenX - event.clientX) < 2 &&
                Math.abs(prev.screenY - event.clientY) < 2
              ) {
                return prev
              }
              return {
                name: planet.name,
                screenX: event.clientX,
                screenY: event.clientY,
              }
            })
          }}
          onPointerOver={(event) => {
            document.body.style.cursor = "pointer"
            setHoveredPlanet({
              name: planet.name,
              screenX: event.clientX,
              screenY: event.clientY,
            })
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default"
            setHoveredPlanet(null)
          }}
        >
          <sphereGeometry args={[visualRadius, 32, 32]} />
          <meshStandardMaterial
            color={planet.color}
            emissive={isSelected ? planet.color : "#000000"}
            emissiveIntensity={isSelected ? 0.5 : 0}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[visualRadius * 1.35, 24, 24]} />
          <meshBasicMaterial
            color={planet.color}
            opacity={0.2}
            transparent
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {planet.name === "Saturn" && (
          <mesh rotation={[Math.PI / 2.2, 0, 0]}>
            <ringGeometry args={[visualRadius * 1.4, visualRadius * 2.3, 64]} />
            <meshStandardMaterial
              color="#d6c59a"
              opacity={0.6}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

      </group>
    </group>
  )
}
