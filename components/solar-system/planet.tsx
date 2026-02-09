"use client"

import React, { useMemo } from "react"
import { Planet as PlanetType } from "@/data/planets"
import { Line } from "@react-three/drei"
import * as THREE from "three"

interface PlanetProps {
  planet: PlanetType
  orbitScale?: number // Scale factor for orbital distance
  radiusScale?: number // Scale factor for planet size
}

export function Planet({ planet }: PlanetProps) {
  // Simplification for skeleton: 
  // semiMajorAxis is in meters. 
  // Let's bring it down to a 3D scene scale.
  // 1 AU = 149.6e9 m.
  // Let's map 1 AU to 50 scene units for visualization.
  const SCENE_AU = 50;
  const REAL_AU = 149.6e9;
  
  const distance = (planet.semiMajorAxis / REAL_AU) * SCENE_AU;

  // Visual size sizing
  // Earth radius ~6371km. 
  // Sun radius ~696000km (~109x Earth).
  // If Sun is 5 units (from Sun.tsx), Earth should be ~0.04 units preserving relative scale? 
  // That's too small to see.
  // Let's use a logarithmic or arbitrary visual scale for now so planets are visible.
  const visualRadius = Math.max(0.5, Math.log10(planet.radius) * 0.2); 

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

  return (
    <group>
      {/* Orbit Line */}
      <Line points={orbitPoints} color="gray" opacity={0.3} transparent lineWidth={1} />

      {/* Planet Mesh */}
      <mesh position={[distance, 0, 0]}>
        <sphereGeometry args={[visualRadius, 32, 32]} />
        <meshStandardMaterial color={planet.color} />
      </mesh>
    </group>
  )
}
