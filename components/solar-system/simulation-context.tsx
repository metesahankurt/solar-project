"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { planets, type Planet } from "@/data/planets"

type LiveMetrics = {
  angle: number
  xAu: number
  zAu: number
  orbitalProgress: number
  distanceAu: number
}

type HoveredPlanet = {
  name: string
  screenX: number
  screenY: number
}

type LabelInfo = {
  name: string
  x: number
  y: number
  priority: number
  distance: number
}

type StarPreset = "calm" | "balanced" | "deep"
type LabelMode = "all" | "focus" | "minimal"

const DEFAULT_SETTINGS = {
  showAsteroids: false,
  showPluto: true,
  showMoon: true,
  showStars: true,
  useLightTimeCorrection: false,
  useBarycenter: false,
  starDensity: 14000,
  starBrightness: 0.7,
  starSize: 0.9,
  starPreset: "balanced" as StarPreset,
  labelMode: "minimal" as LabelMode,
  showOnlySelectedOrbit: false,
  performanceStars: false,
  performanceMode: false,
  showLabels: false,
  showOrbits: true,
}

interface SimulationContextType {
  speed: number
  setSpeed: (speed: number) => void
  isPaused: boolean
  setIsPaused: (isPaused: boolean) => void
  daysPerSecond: number // How many simulation days pass in 1 real second
  selectedPlanet: Planet
  setSelectedPlanet: (planet: Planet) => void
  liveMetrics: Record<string, LiveMetrics>
  setLiveMetrics: (name: string, metrics: LiveMetrics) => void
  hoveredPlanet: HoveredPlanet | null
  setHoveredPlanet: React.Dispatch<React.SetStateAction<HoveredPlanet | null>>
  useRealTime: boolean
  setUseRealTime: (useRealTime: boolean) => void
  simTimeMsRef: React.MutableRefObject<number>
  showLabels: boolean
  setShowLabels: (showLabels: boolean) => void
  showOrbits: boolean
  setShowOrbits: (showOrbits: boolean) => void
  showAsteroids: boolean
  setShowAsteroids: (showAsteroids: boolean) => void
  showPluto: boolean
  setShowPluto: (showPluto: boolean) => void
  showMoon: boolean
  setShowMoon: (showMoon: boolean) => void
  showStars: boolean
  setShowStars: (showStars: boolean) => void
  showControlsPanel: boolean
  setShowControlsPanel: (showControlsPanel: boolean) => void
  useLightTimeCorrection: boolean
  setUseLightTimeCorrection: (useLightTimeCorrection: boolean) => void
  useBarycenter: boolean
  setUseBarycenter: (useBarycenter: boolean) => void
  starDensity: number
  setStarDensity: (starDensity: number) => void
  starBrightness: number
  setStarBrightness: (starBrightness: number) => void
  starSize: number
  setStarSize: (starSize: number) => void
  starPreset: StarPreset
  setStarPreset: (preset: StarPreset) => void
  labelMode: LabelMode
  setLabelMode: (mode: LabelMode) => void
  showOnlySelectedOrbit: boolean
  setShowOnlySelectedOrbit: (showOnlySelectedOrbit: boolean) => void
  performanceStars: boolean
  setPerformanceStars: (performanceStars: boolean) => void
  performanceMode: boolean
  setPerformanceMode: (performanceMode: boolean) => void
  isInteracting: boolean
  setIsInteracting: (isInteracting: boolean) => void
  resetDefaults: () => void
  labelPositions: Record<string, LabelInfo>
  setLabelPosition: (info: LabelInfo) => void
  viewDistanceAu: number
  setViewDistanceAu: (viewDistanceAu: number) => void
  selectedDeepObjectId: string | null
  setSelectedDeepObjectId: (id: string | null) => void
  selectedClusterId: string | null
  setSelectedClusterId: (id: string | null) => void
  selected2mrsId: string | null
  setSelected2mrsId: (id: string | null) => void
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [speed, setSpeed] = useState(1) // Speed multiplier: 1x, 10x, etc.
  const [isPaused, setIsPaused] = useState(false)
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(
    planets.find((planet) => planet.name === "Earth") ?? planets[0]
  )
  const [liveMetrics, setLiveMetricsState] = useState<Record<string, LiveMetrics>>({})
  const [hoveredPlanet, setHoveredPlanet] = useState<HoveredPlanet | null>(null)
  const [useRealTime, setUseRealTime] = useState(true)
  const simTimeMsRef = React.useRef(Date.now())
  const [showLabels, setShowLabels] = useState(false)
  const [showOrbits, setShowOrbits] = useState(false)
  const [showAsteroids, setShowAsteroids] = useState(DEFAULT_SETTINGS.showAsteroids)
  const [showPluto, setShowPluto] = useState(DEFAULT_SETTINGS.showPluto)
  const [showMoon, setShowMoon] = useState(DEFAULT_SETTINGS.showMoon)
  const [showStars, setShowStars] = useState(DEFAULT_SETTINGS.showStars)
  const [showControlsPanel, setShowControlsPanel] = useState(true)
  const [useLightTimeCorrection, setUseLightTimeCorrection] = useState(DEFAULT_SETTINGS.useLightTimeCorrection)
  const [useBarycenter, setUseBarycenter] = useState(DEFAULT_SETTINGS.useBarycenter)
  const [starDensity, setStarDensity] = useState(DEFAULT_SETTINGS.starDensity)
  const [starBrightness, setStarBrightness] = useState(DEFAULT_SETTINGS.starBrightness)
  const [starSize, setStarSize] = useState(DEFAULT_SETTINGS.starSize)
  const [starPreset, setStarPresetState] = useState<StarPreset>(DEFAULT_SETTINGS.starPreset)
  const [labelMode, setLabelMode] = useState<LabelMode>(DEFAULT_SETTINGS.labelMode)
  const [showOnlySelectedOrbit, setShowOnlySelectedOrbit] = useState(DEFAULT_SETTINGS.showOnlySelectedOrbit)
  const [performanceStars, setPerformanceStars] = useState(DEFAULT_SETTINGS.performanceStars)
  const [performanceMode, setPerformanceMode] = useState(DEFAULT_SETTINGS.performanceMode)
  const [isInteracting, setIsInteracting] = useState(false)
  const [viewDistanceAu, setViewDistanceAu] = useState(1)
  const [selectedDeepObjectId, setSelectedDeepObjectId] = useState<string | null>(null)
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null)
  const [selected2mrsId, setSelected2mrsId] = useState<string | null>(null)
  const resetDefaults = () => {
    setShowAsteroids(DEFAULT_SETTINGS.showAsteroids)
    setShowPluto(DEFAULT_SETTINGS.showPluto)
    setShowMoon(DEFAULT_SETTINGS.showMoon)
    setShowStars(DEFAULT_SETTINGS.showStars)
    setUseLightTimeCorrection(DEFAULT_SETTINGS.useLightTimeCorrection)
    setUseBarycenter(DEFAULT_SETTINGS.useBarycenter)
    setStarDensity(DEFAULT_SETTINGS.starDensity)
    setStarBrightness(DEFAULT_SETTINGS.starBrightness)
    setStarSize(DEFAULT_SETTINGS.starSize)
    setStarPresetState(DEFAULT_SETTINGS.starPreset)
    setLabelMode(DEFAULT_SETTINGS.labelMode)
    setShowOnlySelectedOrbit(DEFAULT_SETTINGS.showOnlySelectedOrbit)
    setPerformanceStars(DEFAULT_SETTINGS.performanceStars)
    setPerformanceMode(DEFAULT_SETTINGS.performanceMode)
    setShowLabels(DEFAULT_SETTINGS.showLabels)
    setShowOrbits(DEFAULT_SETTINGS.showOrbits)
  }
  const labelPositionsRef = React.useRef<Record<string, LabelInfo>>({})
  const [labelPositions, setLabelPositions] = useState<Record<string, LabelInfo>>({})
  
  // Base rate: 1 real second = 1 simulation day at 1x speed
  // This makes Earth orbit in ~365 seconds at 1x.
  const daysPerSecond = 1 

  return (
    <SimulationContext.Provider
      value={{
        speed,
        setSpeed,
        isPaused,
        setIsPaused,
        daysPerSecond,
        selectedPlanet,
        setSelectedPlanet,
        liveMetrics,
        setLiveMetrics: (name, metrics) =>
          setLiveMetricsState((prev) => ({ ...prev, [name]: metrics })),
        hoveredPlanet,
        setHoveredPlanet,
        useRealTime,
        setUseRealTime,
        simTimeMsRef,
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
        setStarPreset: (preset) => {
          setStarPresetState(preset)
          if (preset === "calm") {
            setStarDensity(8000)
            setStarBrightness(0.45)
            setStarSize(0.7)
          } else if (preset === "deep") {
            setStarDensity(22000)
            setStarBrightness(0.9)
            setStarSize(1.1)
          } else {
            setStarDensity(14000)
            setStarBrightness(0.7)
            setStarSize(0.9)
          }
        },
        labelMode,
        setLabelMode,
        showOnlySelectedOrbit,
        setShowOnlySelectedOrbit,
        performanceStars,
        setPerformanceStars,
        performanceMode,
        setPerformanceMode: (enabled) => {
          setPerformanceMode(enabled)
          if (enabled) {
            setShowStars(false)
            setShowAsteroids(false)
            setShowOrbits(false)
            setShowLabels(false)
            setStarPresetState("calm")
            setStarDensity(8000)
            setStarBrightness(0.45)
            setStarSize(0.7)
            setPerformanceStars(true)
            setLabelMode("minimal")
          } else {
            setShowStars(true)
            setShowAsteroids(false)
            setShowOrbits(true)
            setShowLabels(false)
            setStarPresetState("balanced")
            setStarDensity(14000)
            setStarBrightness(0.7)
            setStarSize(0.9)
            setPerformanceStars(false)
            setLabelMode("minimal")
          }
        },
        isInteracting,
        setIsInteracting,
        resetDefaults,
        labelPositions,
        setLabelPosition: (info) => {
          labelPositionsRef.current = { ...labelPositionsRef.current, [info.name]: info }
          setLabelPositions(labelPositionsRef.current)
        },
        viewDistanceAu,
        setViewDistanceAu,
        selectedDeepObjectId,
        setSelectedDeepObjectId,
        selectedClusterId,
        setSelectedClusterId,
        selected2mrsId,
        setSelected2mrsId,
      }}
    >
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation() {
  const context = useContext(SimulationContext)
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider")
  }
  return context
}
