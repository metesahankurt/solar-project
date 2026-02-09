"use client"

import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { planets } from "@/data/planets"
import { Sun } from "./sun"
import { Planet } from "./planet"

import { SimulationProvider, useSimulation } from "./simulation-context"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

function SimulationControls() {
  const { speed, setSpeed, isPaused, setIsPaused } = useSimulation()

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-4 bg-black/50 p-4 rounded-lg backdrop-blur-sm text-white w-64">
      <div className="flex items-center justify-between">
        <span className="font-bold">Simulation Controls</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPaused(!isPaused)}
          className="text-white hover:bg-white/20"
        >
          {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>Speed</span>
          <span>{speed}x days/sec</span>
        </div>
        <Slider
          value={[speed]}
          min={0}
          max={100} // Let's allow up to 100 days/sec
          step={1}
          onValueChange={(val) => setSpeed(val[0])}
          className="cursor-pointer"
        />
      </div>
    </div>
  )
}

export function SolarSystemScene() {
  return (
    <SimulationProvider>
      <div className="w-full h-full bg-black relative">
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
        <div className="absolute top-4 left-16 text-white pointer-events-none">
          <h1 className="text-2xl font-bold">Solar System Simulation</h1>
          <p className="text-sm opacity-70">
            Use mouse to rotate, scroll to zoom.
          </p>
        </div>

        {/* Controls */}
        <SimulationControls />
      </div>
    </SimulationProvider>
  )
}
