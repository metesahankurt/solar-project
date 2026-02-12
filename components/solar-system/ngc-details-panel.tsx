"use client"

import React from "react"
import ngcData from "@/data/ngc2000_distances.json"
import { useSimulation } from "./simulation-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type NGCObject = {
  id: string
  type: string | null
  raHours: number
  raDeg: number
  decDeg: number
  source: string | null
  constellation: string | null
  sizeLimit: string | null
  sizeArcMin: number | null
  mag: number | null
  magType: string | null
  desc: string | null
  distanceMpc: number | null
  distanceLy: number | null
}

function formatNumber(value: number | null, digits = 2) {
  if (value === null) return "—"
  return value.toFixed(digits)
}

export function NGCDetailsPanel() {
  const { selectedDeepObjectId } = useSimulation()

  if (!selectedDeepObjectId) return null

  const entry = (ngcData as NGCObject[]).find((item) => item.id === selectedDeepObjectId)
  if (!entry) return null

  return (
    <div className="absolute left-4 bottom-4 z-20 w-80 max-w-[calc(100vw-2rem)]">
      <div className="rounded-xl border border-white/10 bg-black/50 text-white shadow-lg backdrop-blur">
        <Card className="border-0 bg-transparent text-white shadow-none">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{entry.id}</CardTitle>
                <CardDescription className="text-white/60">
                  {entry.type ?? "Unknown type"}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white">
                NGC/IC
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {entry.desc && <p className="text-white/80">{entry.desc}</p>}
            <Separator className="bg-white/10" />
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60">RA</span>
                <span>{formatNumber(entry.raHours, 3)}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Dec</span>
                <span>{formatNumber(entry.decDeg, 2)}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Magnitude</span>
                <span>{formatNumber(entry.mag, 1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Size</span>
                <span>
                  {entry.sizeArcMin ? `${entry.sizeArcMin}′` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Constellation</span>
                <span>{entry.constellation ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Distance</span>
                <span>
                  {entry.distanceLy ? `${Math.round(entry.distanceLy).toLocaleString()} ly` : "—"}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-white/50">
              NGC 2000.0 catalog (B2000). Positions are shown on a sky sphere.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
