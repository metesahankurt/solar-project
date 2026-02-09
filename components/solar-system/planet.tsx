import React, { useMemo, useRef } from "react"
import { Planet as PlanetType } from "@/data/planets"
import { Line } from "@react-three/drei"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { useSimulation } from "./simulation-context"
import { AU_METERS, J2000_MS, MS_PER_DAY } from "@/lib/astronomy"

interface PlanetProps {
  planet: PlanetType
}

export function Planet({ planet }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const {
    speed,
    isPaused,
    daysPerSecond,
    selectedPlanet,
    setSelectedPlanet,
    setLiveMetrics,
    setHoveredPlanet,
    hoveredPlanet,
    useRealTime,
  } = useSimulation()
  
  const meanMotionRadPerDay = (2 * Math.PI) / (planet.orbitalPeriod / (24 * 60 * 60))

  const getAngleForDate = (timestampMs: number) => {
    const daysSinceJ2000 = (timestampMs - J2000_MS) / MS_PER_DAY
    const base = (planet.meanLongitudeDeg * Math.PI) / 180
    const angle = base + meanMotionRadPerDay * daysSinceJ2000
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  }

  const [initialAngle] = React.useState(() => getAngleForDate(Date.now()))
  const angleRef = useRef(initialAngle)

  // Simplification for skeleton: 
  // semiMajorAxis is in meters. 
  // Let's bring it down to a 3D scene scale.
  // 1 AU = 149.6e9 m.
  // Let's map 1 AU to 50 scene units for visualization.
  const SCENE_AU = 50;
  const REAL_AU = AU_METERS;
  
  const distance = (planet.semiMajorAxis / REAL_AU) * SCENE_AU;
  const distanceAu = planet.semiMajorAxis / REAL_AU

  // Visual size sizing
  // Earth radius ~6371km. 
  // Sun radius ~696000km (~109x Earth).
  // If Sun is 5 units (from Sun.tsx), Earth should be ~0.04 units preserving relative scale? 
  // That's too small to see.
  // Let's use a logarithmic or arbitrary visual scale for now so planets are visible.
  const visualRadius = Math.max(0.5, Math.log10(planet.radius) * 0.2); 
  const lastMetricsUpdate = useRef(0)

  useFrame((state, delta) => {
    if (isPaused || !meshRef.current) return

    if (useRealTime) {
      angleRef.current = getAngleForDate(Date.now())
    } else {
      const simSecondsPassed = delta * speed * daysPerSecond * 24 * 60 * 60
      const angleChange = (2 * Math.PI / planet.orbitalPeriod) * simSecondsPassed
      angleRef.current += angleChange
    }

    const x = Math.cos(angleRef.current) * distance
    const z = Math.sin(angleRef.current) * distance
    meshRef.current.position.x = x
    meshRef.current.position.z = z

    if (planet.name === selectedPlanet.name || planet.name === hoveredPlanet?.name) {
      const now = state.clock.elapsedTime
      if (now - lastMetricsUpdate.current > 0.1) {
        const normalizedAngle = ((angleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const orbitalProgress = normalizedAngle / (2 * Math.PI)
        setLiveMetrics(planet.name, {
          angle: normalizedAngle,
          xAu: Math.cos(normalizedAngle) * distanceAu,
          zAu: Math.sin(normalizedAngle) * distanceAu,
          orbitalProgress,
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
      <Line points={orbitPoints} color="gray" opacity={0.3} transparent lineWidth={1} />

      {/* Planet Mesh */}
      <mesh
        ref={meshRef}
        position={[distance, 0, 0]}
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
    </group>
  )
}
