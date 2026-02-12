"use client"

import React, { Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
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
import { EyeOff, LocateFixed, Play, Pause, RotateCcw } from "lucide-react"
import { PlanetDetailsPanel } from "./planet-details-panel"
import { PlanetTooltip } from "./planet-tooltip"
import { PlanetLabelLayer } from "./label-layer"
import { StarField } from "./star-field"
import { ScaleHud } from "./scale-hud"
import { NGCLayer } from "./ngc-layer"
import { NGCDetailsPanel } from "./ngc-details-panel"
import { useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings2 } from "lucide-react"
import { AU_METERS, SCENE_AU } from "@/lib/astronomy"
import { CAMERA_DISTANCE_RANGE, mapCameraDistanceToAu } from "./space-scale"
import { KuiperBelt } from "./kuiper-belt"
import { Heliosphere } from "./heliosphere"
import { OortCloud } from "./oort-cloud"
import { GalacticDisk } from "./galactic-disk"
import { ObservableUniverse } from "./observable-universe"
import { AbellLayer } from "./abell-layer"
import { AbellDetailsPanel } from "./abell-details-panel"
import { TwoMRSLayer } from "./twomrs-layer"
import { TwoMRSDetailsPanel } from "./twomrs-details-panel"
import { CosmicWeb } from "./cosmic-web"
import { DensityField } from "./density-field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function ControlsContent({ requestPerformance }: { requestPerformance: (action: () => void) => void }) {
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
    labelMode,
    setLabelMode,
    showOnlySelectedOrbit,
    setShowOnlySelectedOrbit,
    performanceStars,
    setPerformanceStars,
    performanceMode,
    setPerformanceMode,
    resetDefaults,
  } = useSimulation()
  const isMobile = useIsMobile()

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between gap-1 flex-wrap">
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
          onClick={resetDefaults}
          aria-label="Reset settings"
        >
          <RotateCcw className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => window.dispatchEvent(new CustomEvent("solar:fit-orbits"))}
        >
          Fit
        </Button>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowControlsPanel(false)}
          >
            <EyeOff className="size-4" />
          </Button>
        )}
      </div>
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
      <div className="rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
        Reminder: keep labels off for a smoother experience.
      </div>
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Light-time correction</Label>
          <Switch checked={useLightTimeCorrection} onCheckedChange={setUseLightTimeCorrection} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Barycenter frame</Label>
          <Switch checked={useBarycenter} onCheckedChange={setUseBarycenter} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Only selected orbit</Label>
          <Switch
            checked={showOnlySelectedOrbit}
            onCheckedChange={(checked) =>
              checked ? requestPerformance(() => setShowOnlySelectedOrbit(true)) : setShowOnlySelectedOrbit(false)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Performance mode</Label>
          <Switch
            checked={performanceMode}
            onCheckedChange={(checked) =>
              checked ? setPerformanceMode(true) : requestPerformance(() => setPerformanceMode(false))
            }
          />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Stars</Label>
          <Switch
            checked={showStars}
            onCheckedChange={(checked) =>
              checked ? requestPerformance(() => setShowStars(true)) : setShowStars(false)
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Star preset</Label>
          <Select
            value={starPreset}
            onValueChange={(val) =>
              val === "calm"
                ? setStarPreset(val as any)
                : requestPerformance(() => setStarPreset(val as any))
            }
          >
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
        <div className="flex items-center justify-between">
          <Label className="text-xs">Star performance</Label>
          <Switch checked={performanceStars} onCheckedChange={setPerformanceStars} />
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
            onValueChange={(val) => requestPerformance(() => setStarDensity(val[0]))}
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
            onValueChange={(val) => requestPerformance(() => setStarBrightness(val[0]))}
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
            onValueChange={(val) => requestPerformance(() => setStarSize(val[0]))}
          />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show labels</Label>
          <Switch
            checked={showLabels}
            onCheckedChange={(checked) =>
              checked ? requestPerformance(() => setShowLabels(true)) : setShowLabels(false)
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Label mode</Label>
          <Select value={labelMode} onValueChange={(val) => setLabelMode(val as any)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="focus">Focus</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show orbits</Label>
          <Switch
            checked={showOrbits}
            onCheckedChange={(checked) =>
              checked ? requestPerformance(() => setShowOrbits(true)) : setShowOrbits(false)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Asteroid belt</Label>
          <Switch
            checked={showAsteroids}
            onCheckedChange={(checked) =>
              checked ? requestPerformance(() => setShowAsteroids(true)) : setShowAsteroids(false)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Pluto</Label>
          <Switch
            checked={showPluto}
            onCheckedChange={(checked) =>
              checked ? requestPerformance(() => setShowPluto(true)) : setShowPluto(false)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Moon</Label>
          <Switch
            checked={showMoon}
            onCheckedChange={(checked) =>
              checked ? requestPerformance(() => setShowMoon(true)) : setShowMoon(false)
            }
          />
        </div>
      </div>
    </div>
  )
}

function SimulationControls() {
  const {
    isPaused,
    setIsPaused,
    showControlsPanel,
    setShowControlsPanel,
    resetDefaults,
    performanceMode,
    setPerformanceMode,
  } = useSimulation()
  const isMobile = useIsMobile()

  const [warnOpen, setWarnOpen] = React.useState(false)
  const pendingRef = React.useRef<null | (() => void)>(null)

  const requestPerformance = (action: () => void) => {
    if (!performanceMode) {
      action()
      return
    }
    pendingRef.current = action
    setWarnOpen(true)
  }

  const alertDialog = (
    <AlertDialog
      open={warnOpen}
      onOpenChange={(open) => {
        setWarnOpen(open)
        if (!open) {
          pendingRef.current = null
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Performance Warning</AlertDialogTitle>
          <AlertDialogDescription>
            Increasing visual fidelity may cause slowdowns depending on your device and may increase CPU/GPU load.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setWarnOpen(false)
              setPerformanceMode(false)
              pendingRef.current?.()
              pendingRef.current = null
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  // Mobile: use a bottom Sheet
  if (isMobile) {
    return (
      <>
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2">
                <Settings2 className="size-4" />
                Controls
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Simulation Controls</SheetTitle>
                <SheetDescription>Control the solar system simulation.</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-full max-h-[calc(80vh-2rem)]">
                <div className="p-4">
                  <ControlsContent requestPerformance={requestPerformance} />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </Button>
        </div>
        {alertDialog}
      </>
    )
  }

  // Desktop: collapsed button bar
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
          size="icon"
          onClick={resetDefaults}
          aria-label="Reset settings"
        >
          <RotateCcw className="size-4" />
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

  // Desktop: expanded card
  return (
    <>
      <Card className="absolute bottom-4 left-4 w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto bg-background/90 text-foreground shadow-sm backdrop-blur z-20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2">
          <CardTitle className="text-sm">Simulation Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <ControlsContent requestPerformance={requestPerformance} />
        </CardContent>
      </Card>
      {alertDialog}
    </>
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

function CameraDistanceTracker() {
  const { camera } = useThree()
  const { setViewDistanceAu } = useSimulation()
  const lastReported = React.useRef(0)

  useFrame(() => {
    const distance = camera.position.length()
    const viewAu = mapCameraDistanceToAu(distance)
    if (Math.abs(viewAu - lastReported.current) > viewAu * 0.03) {
      lastReported.current = viewAu
      setViewDistanceAu(viewAu)
    }
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
      <KuiperBelt />
      <Heliosphere />
      <OortCloud />
      <GalacticDisk />
      <NGCLayer />
      <TwoMRSLayer />
      <DensityField />
      <CosmicWeb />
      <AbellLayer />
      <ObservableUniverse />
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

function SceneOrbitControls({ controlsRef }: { controlsRef: React.MutableRefObject<any> }) {
  const { showControlsPanel, setIsInteracting } = useSimulation()

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!showControlsPanel}
      enablePan={!showControlsPanel}
      enableZoom={!showControlsPanel}
      enableRotate={!showControlsPanel}
      enableDamping={true}
      dampingFactor={0.08}
      minDistance={CAMERA_DISTANCE_RANGE.min}
      maxDistance={CAMERA_DISTANCE_RANGE.max}
      target={[0, 0, 0]}
      onStart={() => setIsInteracting(true)}
      onEnd={() => setIsInteracting(false)}
    />
  )
}

function SolarSystemSceneInner() {
  const controlsRef = useRef<any>(null)
  const { setSelectedDeepObjectId, setSelectedClusterId, setSelected2mrsId } = useSimulation()

  return (
    <div className="w-full h-full bg-black relative">
      <Canvas
        camera={{ position: [0, 200, 900], fov: 50, near: 0.1, far: 120000 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onPointerMissed={() => {
          setSelectedDeepObjectId(null)
          setSelectedClusterId(null)
          setSelected2mrsId(null)
        }}
      >
        <SimulationClock />
        <CameraDistanceTracker />
        <SceneController controlsRef={controlsRef} />
        <Suspense fallback={null}>
          <color attach="background" args={["#05070c"]} />
          <fog attach="fog" args={["#05070c", 12000, 90000]} />
          <ambientLight intensity={0.2} />
          <mesh>
            <sphereGeometry args={[70000, 32, 32]} />
            <meshBasicMaterial color="#05070c" side={THREE.BackSide} />
          </mesh>

          <SceneBodies />
          <SceneOrbitControls controlsRef={controlsRef} />
        </Suspense>
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute top-16 left-4 text-white pointer-events-none">
        <h1 className="text-xl md:text-2xl font-bold">Solar System Simulation</h1>
        <p className="text-sm opacity-70 hidden md:block">
          Use mouse to rotate, scroll to zoom.
        </p>
      </div>

      {/* Controls */}
      <SimulationControls />
      <PlanetDetailsPanel />
      <NGCDetailsPanel />
      <AbellDetailsPanel />
      <TwoMRSDetailsPanel />
      <PlanetTooltip />
      <PlanetLabelLayer />
      <ScaleHud />
    </div>
  )
}

export function SolarSystemScene() {
  return (
    <SimulationProvider>
      <SolarSystemSceneInner />
    </SimulationProvider>
  )
}
