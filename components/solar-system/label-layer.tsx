"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { useSimulation } from "./simulation-context"

function estimateWidthPx(name: string) {
  return Math.max(42, name.length * 7.5 + 16)
}

export function PlanetLabelLayer() {
  const { labelPositions, showLabels } = useSimulation()

  if (!showLabels) return null

  const labels = Object.values(labelPositions)
    .filter((label) => Number.isFinite(label.x) && Number.isFinite(label.y))
    .sort((a, b) => b.priority - a.priority)

  const placed: Array<{ x: number; y: number; w: number; h: number }> = []
  const rendered = labels.filter((label) => {
    const w = estimateWidthPx(label.name)
    const h = 20
    const x = label.x - w / 2
    const y = label.y - h / 2
    const overlaps = placed.some((rect) => {
      return x < rect.x + rect.w && x + w > rect.x && y < rect.y + rect.h && y + h > rect.y
    })
    if (overlaps) return false
    placed.push({ x, y, w, h })
    return true
  })

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {rendered.map((label) => (
        <div
          key={label.name}
          className="absolute"
          style={{ left: label.x, top: label.y }}
        >
          <Badge variant="secondary" className="bg-background/80 text-foreground shadow-sm backdrop-blur">
            {label.name}
          </Badge>
        </div>
      ))}
    </div>
  )
}
