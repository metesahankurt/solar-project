"use client"

import React, { Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
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
import { EyeOff, LocateFixed, Play, Pause } from "lucide-react"
import { PlanetDetailsPanel } from "./planet-details-panel"
import { PlanetTooltip } from "./planet-tooltip"
import { PlanetLabelLayer } from "./label-layer"
import { StarField } from "./star-field"
import { useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AU_METERS, SCENE_AU } from "@/lib/astronomy"

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
    showStars,
    setShowStars,
    showControlsPanel,
    setShowControlsPanel,
    useLightTimeCorrection,
    setUseLightTimeCorrection,
    useBarycenter,
    setUseBarycenter,
    starDensity,
    setStarDensity,
    starBrightness,
    setStarBrightness,
    starSize,
    setStarSize,
    starPreset,
    setStarPreset,
  } = useSimulation()

  if (!showControlsPanel) {
    return (
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowControlsPanel(true)}
        >
          Show Controls
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.dispatchEvent(new CustomEvent("solar:reset-view"))}
        >
          Reset View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.dispatchEvent(new CustomEvent("solar:fit-orbits"))}
        >
          Fit Orbits
        </Button>
      </div>
    )
  }

  return (
    <Card className="absolute bottom-4 left-4 w-72 max-w-[calc(100vw-2rem)] bg-background/90 text-foreground shadow-sm backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2">
        <CardTitle className="text-sm">Simulation Controls</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
            className="h-8 w-8"
          >
            {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.dispatchEvent(new CustomEvent("solar:reset-view"))}
          >
            <LocateFixed className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.dispatchEvent(new CustomEvent("solar:fit-orbits"))}
          >
            Fit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowControlsPanel(false)}
          >
            <EyeOff className="size-4" />
          </Button>
        </div>
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
            <Label className="text-xs">Light-time correction</Label>
            <Switch checked={useLightTimeCorrection} onCheckedChange={setUseLightTimeCorrection} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Barycenter frame</Label>
            <Switch checked={useBarycenter} onCheckedChange={setUseBarycenter} />
          </div>
        </div>
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Stars</Label>
            <Switch checked={showStars} onCheckedChange={setShowStars} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Star preset</Label>
            <Select value={starPreset} onValueChange={(val) => setStarPreset(val as any)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="deep">Deep</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <Label className="text-xs">Star density</Label>
              <span>{Math.round(starDensity)}</span>
            </div>
            <Slider
              value={[starDensity]}
              min={4000}
              max={24000}
              step={500}
              onValueChange={(val) => setStarDensity(val[0])}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <Label className="text-xs">Star brightness</Label>
              <span>{starBrightness.toFixed(2)}</span>
            </div>
            <Slider
              value={[starBrightness]}
              min={0.2}
              max={1}
              step={0.05}
              onValueChange={(val) => setStarBrightness(val[0])}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <Label className="text-xs">Star size</Label>
              <span>{starSize.toFixed(2)}</span>
            </div>
            <Slider
              value={[starSize]}
              min={0.4}
              max={1.6}
              step={0.05}
              onValueChange={(val) => setStarSize(val[0])}
            />
          </div>
        </div>
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
      <StarField />
    </>
  )
}

function SceneController({ controlsRef }: { controlsRef: React.MutableRefObject<any> }) {
  const { showPluto } = useSimulation()

  React.useEffect(() => {
    const handler = () => {
      const controls = controlsRef.current
      if (!controls) return
      controls.target.set(0, 0, 0)
      controls.object.position.set(0, 200, 900)
      controls.update()
    }
    const fitHandler = () => {
      const controls = controlsRef.current
      if (!controls) return
      const maxMeters = Math.max(
        ...planets.map((planet) => planet.semiMajorAxis),
        showPluto && dwarfPlanets[0] ? dwarfPlanets[0].semiMajorAxis : 0
      )
      const maxAu = maxMeters / AU_METERS
      const distance = Math.max(900, maxAu * SCENE_AU * 3.2)
      controls.target.set(0, 0, 0)
      controls.object.position.set(0, distance * 0.35, distance)
      controls.update()
    }
    window.addEventListener("solar:reset-view", handler)
    window.addEventListener("solar:fit-orbits", fitHandler)
    return () => {
      window.removeEventListener("solar:reset-view", handler)
      window.removeEventListener("solar:fit-orbits", fitHandler)
    }
  }, [controlsRef, showPluto])

  return null
}

export function SolarSystemScene() {
  const controlsRef = useRef<any>(null)

  return (
    <SimulationProvider>
      <div className="w-full h-full bg-black relative">
        <Canvas
          camera={{ position: [0, 200, 900], fov: 50, near: 0.1, far: 10000 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <SimulationClock />
          <SceneController controlsRef={controlsRef} />
          <Suspense fallback={null}>
            <color attach="background" args={["#05070c"]} />
            <fog attach="fog" args={["#05070c", 5000, 30000]} />
            <ambientLight intensity={0.2} />
            <mesh>
              <sphereGeometry args={[6000, 32, 32]} />
              <meshBasicMaterial color="#05070c" side={THREE.BackSide} />
            </mesh>

            <SceneBodies />

            <OrbitControls 
              ref={controlsRef}
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              enableDamping={true}
              dampingFactor={0.08}
              minDistance={40}
              maxDistance={9000}
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
        <PlanetLabelLayer />
      </div>
    </SimulationProvider>
  )
}
