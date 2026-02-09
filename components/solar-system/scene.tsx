"use client"

import React, { Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { dwarfPlanets, planets } from "@/data/planets"
import { Sun } from "./sun"
import { Planet } from "./planet"
import { AsteroidBelt } from "./asteroid-belt"
import { Moon } from "./moon"
import * as THREE from "three"

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
  const {
    speed,
    setSpeed,
    isPaused,
    setIsPaused,
    useRealTime,
    setUseRealTime,
    showLabels,
    setShowLabels,
    showOrbits,
    setShowOrbits,
    showAsteroids,
    setShowAsteroids,
    showPluto,
    setShowPluto,
    showMoon,
    setShowMoon,
  } = useSimulation()

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
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show labels</Label>
            <Switch checked={showLabels} onCheckedChange={setShowLabels} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show orbits</Label>
            <Switch checked={showOrbits} onCheckedChange={setShowOrbits} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Asteroid belt</Label>
            <Switch checked={showAsteroids} onCheckedChange={setShowAsteroids} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Pluto</Label>
            <Switch checked={showPluto} onCheckedChange={setShowPluto} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Moon</Label>
            <Switch checked={showMoon} onCheckedChange={setShowMoon} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SimulationClock() {
  const { isPaused, useRealTime, simTimeMsRef, speed, daysPerSecond } = useSimulation()

  useFrame((_, delta) => {
    if (isPaused) return
    if (useRealTime) {
      simTimeMsRef.current = Date.now()
      return
    }
    const simSecondsPassed = delta * speed * daysPerSecond * 24 * 60 * 60
    simTimeMsRef.current += simSecondsPassed * 1000
  })

  return null
}

function SceneBodies() {
  const { showPluto, showMoon } = useSimulation()
  const pluto = dwarfPlanets[0]

  return (
    <>
      <Sun />
      {planets.map((planet) => (
        <Planet key={planet.name} planet={planet} />
      ))}
      {showPluto && pluto && <Planet key={pluto.name} planet={pluto} />}
      {showMoon && <Moon />}
      <AsteroidBelt />
    </>
  )
}

export function SolarSystemScene() {
  return (
    <SimulationProvider>
      <div className="w-full h-full bg-black relative">
        <Canvas
          camera={{ position: [0, 200, 900], fov: 50, near: 0.1, far: 10000 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <SimulationClock />
          <Suspense fallback={null}>
            <color attach="background" args={["#05070c"]} />
            <fog attach="fog" args={["#05070c", 800, 7000]} />
            <ambientLight intensity={0.2} />
            <Stars radius={4000} depth={400} count={10000} factor={4} saturation={0} fade speed={1} />
            <mesh>
              <sphereGeometry args={[6000, 32, 32]} />
              <meshBasicMaterial color="#05070c" side={THREE.BackSide} />
            </mesh>

            <SceneBodies />

            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              enableDamping={true}
              dampingFactor={0.08}
              minDistance={40}
              maxDistance={6000}
              target={[0, 0, 0]}
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
