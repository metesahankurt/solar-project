"use client"

import React from "react"
import * as THREE from "three"
import { ringSystems } from "@/data/rings"
import { AU_KM } from "@/lib/astronomy"
import { mapAuToScene } from "./space-scale"

export function PlanetRings({ planetName, visualRadiusKm }: { planetName: string; visualRadiusKm: number }) {
  const system = ringSystems.find((item) => item.planet === planetName)
  if (!system) return null

  const scale = visualRadiusKm > 0 ? mapAuToScene(visualRadiusKm / AU_KM) / visualRadiusKm : 1

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {system.rings.map((ring) => {
        const inner = ring.innerKm * scale
        const outer = ring.outerKm * scale
        return (
          <mesh key={ring.name}>
            <ringGeometry args={[inner, outer, 128]} />
            <meshBasicMaterial
              color={ring.color}
              opacity={ring.opacity}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}
