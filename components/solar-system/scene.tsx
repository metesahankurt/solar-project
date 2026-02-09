"use client"

import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { planets } from "@/data/planets"
import { Sun } from "./sun"
import { Planet } from "./planet"

export function SolarSystemScene() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 50, 100], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Sun />

          {planets.map((planet) => (
            <Planet key={planet.name} planet={planet} />
          ))}

          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={10}
            maxDistance={500}
          />
        </Suspense>
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 text-white pointer-events-none">
        <h1 className="text-2xl font-bold">Solar System Simulation</h1>
        <p className="text-sm opacity-70">
          Use mouse to rotate, scroll to zoom.
        </p>
      </div>
    </div>
  )
}
