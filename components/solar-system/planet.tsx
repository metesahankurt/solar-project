import React, { useMemo, useRef } from "react"
import { Planet as PlanetType } from "@/data/planets"
import { Html, Line } from "@react-three/drei"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { useSimulation } from "./simulation-context"
import { AU_METERS } from "@/lib/astronomy"
import { Body, Ecliptic, HelioVector } from "astronomy-engine"

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
    showLabels,
    showOrbits,
  } = useSimulation()

  // Simplification for skeleton: 
  // semiMajorAxis is in meters. 
  // Let's bring it down to a 3D scene scale.
  // 1 AU = 149.6e9 m.
  // Let's map 1 AU to 50 scene units for visualization.
  const SCENE_AU = 25;
  const REAL_AU = AU_METERS;
  
  const distance = (planet.semiMajorAxis / REAL_AU) * SCENE_AU;

  // Visual size sizing
  // Earth radius ~6371km. 
  // Sun radius ~696000km (~109x Earth).
  // If Sun is 5 units (from Sun.tsx), Earth should be ~0.04 units preserving relative scale? 
  // That's too small to see.
  // Let's use a logarithmic or arbitrary visual scale for now so planets are visible.
  const visualRadius = Math.max(0.8, Math.log10(planet.radius) * 0.34); 
  const lastMetricsUpdate = useRef(0)

  useFrame((state, delta) => {
    if (isPaused || !meshRef.current || !groupRef.current) return

    const body = Body[planet.name as keyof typeof Body]
    if (!body) return

    const time = new Date(simTimeMsRef.current)
    const helio = HelioVector(body, time)
    const eclip = Ecliptic(helio)
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
  })

  // Create orbit points for the line
  const orbitPoints = useMemo(() => {
    const points = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      points.push(new THREE.Vector3(Math.cos(theta) * distance, 0, Math.sin(theta) * distance));
    }
    return points;
  }, [distance]);

  const isSelected = selectedPlanet.name === planet.name

  return (
    <group>
      {/* Orbit Line */}
      {showOrbits && (
        <Line points={orbitPoints} color="#9aa1a8" opacity={0.45} transparent lineWidth={1} />
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

        {showLabels && (
          <Html position={[0, visualRadius * 1.8, 0]} center>
            <div className="rounded bg-background/70 px-2 py-0.5 text-[10px] text-foreground shadow-sm backdrop-blur">
              {planet.name}
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}
