"use client"

import React from "react"
import { sun } from "@/data/planets"

export function Sun() {
  return (
    <mesh>
      {/* 
        Visual scale: The sun is huge. 
        We'll scale it down for visual purposes in this skeleton phase.
        Real radius is ~696,340 km. Let's say 1 unit = 1000 km -> 696 units.
        Too big. Let's pick a visual size, e.g., 20 units.
      */}
      <sphereGeometry args={[5, 32, 32]} />
      <meshStandardMaterial 
        emissive={sun.color} 
        emissiveIntensity={2} 
        color={sun.color} 
      />
      <pointLight intensity={1000} distance={2000} decay={2} />
    </mesh>
  )
}
