"use client"

import React from "react"
import abellData from "@/data/abellzcat.json"
import { useSimulation } from "./simulation-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type AbellCluster = {
  id: string
  raDeg: number
  decDeg: number
  z: number
  distanceMpc: number
  distanceLy: number
  richness: number | null
  distanceClass: number | null
  bmClass: number | null
  bmQuality: string | null
  m10: number | null
  qz: string | null
  ref: string | null
  abellRadiusArcMin: number | null
  logZmZe: number | null
}

function formatNumber(value: number | null, digits = 2) {
  if (value === null) return "—"
  return value.toFixed(digits)
}

export function AbellDetailsPanel() {
  const { selectedClusterId } = useSimulation()

  if (!selectedClusterId) return null

  const entry = (abellData as AbellCluster[]).find((item) => item.id === selectedClusterId)
  if (!entry) return null

  return (
    <div className="absolute right-4 bottom-4 z-20 w-80 max-w-[calc(100vw-2rem)]">
      <div className="rounded-xl border border-white/10 bg-black/50 text-white shadow-lg backdrop-blur">
        <Card className="border-0 bg-transparent text-white shadow-none">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{entry.id}</CardTitle>
                <CardDescription className="text-white/60">Abell Cluster</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white">
                Cluster
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Separator className="bg-white/10" />
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Redshift (z)</span>
                <span>{formatNumber(entry.z, 4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Distance</span>
                <span>{Math.round(entry.distanceLy).toLocaleString()} ly</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Richness</span>
                <span>{entry.richness ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Bautz-Morgan</span>
                <span>{entry.bmClass ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">m10</span>
                <span>{entry.m10 ?? "—"}</span>
              </div>
            </div>
            <div className="text-[11px] text-white/50">
              Abell cluster redshift catalog (B1950). Distances estimated via H0.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
