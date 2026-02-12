"use client"

import React from "react"
import twomrsData from "@/data/2mrs.json"
import { useSimulation } from "./simulation-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type TwoMRS = {
  id: string
  raDeg: number
  decDeg: number
  cz: number
  vector: [number, number, number]
}

const C_KM_S = 299_792.458
const H0 = 70

export function TwoMRSDetailsPanel() {
  const { selected2mrsId } = useSimulation()

  if (!selected2mrsId) return null

  const entry = (twomrsData as TwoMRS[]).find((item) => item.id === selected2mrsId)
  if (!entry) return null

  const z = entry.cz / C_KM_S
  const distMpc = (C_KM_S / H0) * z
  const distLy = distMpc * 3_261_560

  return (
    <div className="absolute right-4 bottom-4 z-20 w-80 max-w-[calc(100vw-2rem)]">
      <div className="rounded-xl border border-white/10 bg-black/50 text-white shadow-lg backdrop-blur">
        <Card className="border-0 bg-transparent text-white shadow-none">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{entry.id}</CardTitle>
                <CardDescription className="text-white/60">2MRS Galaxy</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white">
                2MRS
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Separator className="bg-white/10" />
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60">RA</span>
                <span>{entry.raDeg.toFixed(3)}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Dec</span>
                <span>{entry.decDeg.toFixed(3)}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">cz</span>
                <span>{entry.cz.toFixed(0)} km/s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Distance</span>
                <span>{Math.round(distLy).toLocaleString()} ly</span>
              </div>
            </div>
            <div className="text-[11px] text-white/50">
              2MRS (Huchra et al. 2012), distances estimated via H0.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
