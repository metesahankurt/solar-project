"use client"

import React from "react"
import { useSimulation } from "./simulation-context"
import { Card } from "@/components/ui/card"
import { planets } from "@/data/planets"

export function PlanetTooltip() {
  const { hoveredPlanet, liveMetrics } = useSimulation()

  if (!hoveredPlanet) return null

  const planet = planets.find((item) => item.name === hoveredPlanet.name)
  if (!planet) return null

  const metrics = liveMetrics[hoveredPlanet.name]
  const angleDeg = metrics ? (metrics.angle * 180) / Math.PI : null
  const progress = metrics ? metrics.orbitalProgress * 100 : null

  const style = {
    left: hoveredPlanet.screenX + 12,
    top: hoveredPlanet.screenY + 12,
  } as React.CSSProperties

  return (
    <div className="pointer-events-none fixed z-30" style={style}>
      <Card className="border-border/60 bg-background/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
        <div className="font-semibold">{planet.name}</div>
        <div className="text-muted-foreground">{planet.description}</div>
        {metrics && (
          <div className="mt-2 space-y-1 text-muted-foreground">
            <div>Angle: {angleDeg?.toFixed(1)}°</div>
            <div>Orbit: {progress?.toFixed(1)}%</div>
          </div>
        )}
      </Card>
    </div>
  )
}
