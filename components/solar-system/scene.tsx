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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Play, Pause } from "lucide-react"
import { PlanetDetailsPanel } from "./planet-details-panel"
import { PlanetTooltip } from "./planet-tooltip"

function SimulationControls() {
  const { speed, setSpeed, isPaused, setIsPaused, useRealTime, setUseRealTime } = useSimulation()

  return (
    <Card className="absolute bottom-4 left-4 w-72 max-w-[calc(100vw-2rem)] bg-background/90 text-foreground shadow-sm backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">Simulation Controls</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPaused(!isPaused)}
          className="h-8 w-8"
        >
          {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Real-time mode</Label>
          <Switch checked={useRealTime} onCheckedChange={setUseRealTime} />
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Speed</span>
          <span>{speed}x days/sec</span>
        </div>
        <Slider
          value={[speed]}
          min={0}
          max={100}
          step={1}
          onValueChange={(val) => setSpeed(val[0])}
          disabled={useRealTime}
          className="cursor-pointer"
        />
        {useRealTime && (
          <div className="text-[11px] text-muted-foreground">
            Real-time mode locks the simulation to the system clock.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SolarSystemScene() {
  return (
    <SimulationProvider>
      <div className="w-full h-full bg-black relative">
        <Canvas
          camera={{ position: [0, 50, 100], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
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
        <div className="absolute top-16 left-4 text-white pointer-events-none">
          <h1 className="text-2xl font-bold">Solar System Simulation</h1>
          <p className="text-sm opacity-70">
            Use mouse to rotate, scroll to zoom.
          </p>
        </div>

        {/* Controls */}
        <SimulationControls />
        <PlanetDetailsPanel />
        <PlanetTooltip />
      </div>
    </SimulationProvider>
  )
}
