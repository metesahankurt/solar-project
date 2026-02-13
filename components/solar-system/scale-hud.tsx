"use client"

import React from "react"
import { useSimulation } from "./simulation-context"
import { AU_PER_LY } from "./space-scale"
import { Badge } from "@/components/ui/badge"

function formatScale(viewDistanceAu: number) {
  const ly = viewDistanceAu / AU_PER_LY
  if (ly < 0.01) return `${viewDistanceAu.toFixed(2)} AU`
  if (ly < 1) return `${ly.toFixed(3)} ly`
  if (ly < 1_000) return `${ly.toFixed(1)} ly`
  if (ly < 1_000_000) return `${(ly / 1_000).toFixed(2)} kly`
  if (ly < 1_000_000_000) return `${(ly / 1_000_000).toFixed(2)} Mly`
  return `${(ly / 1_000_000_000).toFixed(2)} Gly`
}

export function ScaleHud() {
  const { viewDistanceAu } = useSimulation()
  const viewLy = viewDistanceAu / AU_PER_LY

  const layers = [
    { name: "Kuiper Belt", active: viewDistanceAu >= 20 },
    { name: "Heliosphere", active: viewDistanceAu >= 150 },
    { name: "Oort Cloud", active: viewDistanceAu >= 1000 },
    { name: "Milky Way", active: viewLy >= 100_000 },
    { name: "NGC/IC Catalog", active: viewLy >= 50_000 },
    { name: "2MRS Galaxies", active: viewLy >= 500_000 },
    { name: "Density Field", active: viewLy >= 700_000 },
    { name: "Cosmic Web", active: viewLy >= 1_000_000 },
    { name: "SDSS Local Modes", active: viewLy >= 1_500_000 },
    { name: "Abell Clusters", active: viewLy >= 2_000_000 },
    { name: "Observable Universe", active: viewLy >= 5_000_000_000 },
  ]

  return (
    <div className="pointer-events-none absolute top-28 left-4 z-20 w-64 rounded-xl border border-white/10 bg-black/40 p-3 text-white shadow-lg backdrop-blur">
      <div className="text-xs uppercase tracking-[0.2em] text-white/60">Scale</div>
      <div className="text-lg font-semibold">{formatScale(viewDistanceAu)}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {layers
          .filter((layer) => layer.active)
          .map((layer) => (
            <Badge key={layer.name} variant="secondary" className="bg-white/10 text-white">
              {layer.name}
            </Badge>
          ))}
      </div>
    </div>
  )
}
