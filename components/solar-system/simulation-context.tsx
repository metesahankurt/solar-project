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
  setHoveredPlanet: (hovered: HoveredPlanet | null) => void
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
  const [showLabels, setShowLabels] = useState(true)
  const [showOrbits, setShowOrbits] = useState(true)
  const [showAsteroids, setShowAsteroids] = useState(true)
  const [showPluto, setShowPluto] = useState(true)
  const [showMoon, setShowMoon] = useState(true)
  
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
