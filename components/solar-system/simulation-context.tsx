"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface SimulationContextType {
  speed: number
  setSpeed: (speed: number) => void
  isPaused: boolean
  setIsPaused: (isPaused: boolean) => void
  daysPerSecond: number // How many simulation days pass in 1 real second
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [speed, setSpeed] = useState(1) // Speed multiplier: 1x, 10x, etc.
  const [isPaused, setIsPaused] = useState(false)
  
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
