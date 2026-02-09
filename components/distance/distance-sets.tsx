"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AU_KM, LIGHT_YEAR_KM, SPEED_OF_LIGHT_KM_S } from "@/lib/astronomy"

const PLANE_SPEED_KM_H = 900
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR
const SECONDS_PER_YEAR = 365.25 * SECONDS_PER_DAY

const DISTANCE_SETS = [
  {
    id: "earth-moon",
    label: "Earth-Moon",
    distanceKm: 384_400,
    distanceDisplay: "384,400 km",
    note: "Mean distance",
  },
  {
    id: "earth-sun",
    label: "Earth-Sun",
    distanceKm: AU_KM,
    distanceDisplay: "1 AU (149,597,870.7 km)",
    note: "Mean distance",
  },
  {
    id: "earth-mars",
    label: "Earth-Mars",
    distanceKm: 225_000_000,
    distanceDisplay: "225,000,000 km",
    note: "Average distance",
  },
  {
    id: "earth-jupiter",
    label: "Earth-Jupiter",
    distanceKm: 588_000_000,
    distanceDisplay: "588,000,000 km",
    note: "Average distance",
  },
  {
    id: "sun-neptune",
    label: "Sun-Neptune",
    distanceKm: 4_495_000_000,
    distanceDisplay: "4.495 billion km",
    note: "Average distance",
  },
  {
    id: "sun-proxima",
    label: "Sun-Proxima Centauri",
    distanceKm: 4.2465 * LIGHT_YEAR_KM,
    distanceDisplay: "4.2465 light years",
    note: "Closest star system",
  },
  {
    id: "sun-andromeda",
    label: "Sun-Andromeda Galaxy",
    distanceKm: 2.537e6 * LIGHT_YEAR_KM,
    distanceDisplay: "2.537 million light years",
    note: "Mean distance",
  },
] as const

function formatNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString(undefined, { maximumFractionDigits })
}

function formatDurationSeconds(seconds: number) {
  if (seconds < 90) {
    return `${formatNumber(seconds, 1)} s`
  }
  if (seconds < 90 * SECONDS_PER_MINUTE) {
    return `${formatNumber(seconds / SECONDS_PER_MINUTE, 1)} min`
  }
  if (seconds < 36 * SECONDS_PER_HOUR) {
    return `${formatNumber(seconds / SECONDS_PER_HOUR, 1)} h`
  }
  if (seconds < 2 * SECONDS_PER_YEAR) {
    return `${formatNumber(seconds / SECONDS_PER_DAY, 1)} days`
  }
  return `${formatNumber(seconds / SECONDS_PER_YEAR, 2)} years`
}

export function DistanceSets() {
  const logDistances = DISTANCE_SETS.map((item) => Math.log10(item.distanceKm))
  const minLog = Math.min(...logDistances)
  const maxLog = Math.max(...logDistances)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distance Sets</CardTitle>
        <CardDescription>
          Real-world distances with light-travel time and commercial flight equivalents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {DISTANCE_SETS.map((item) => {
            const lightSeconds = item.distanceKm / SPEED_OF_LIGHT_KM_S
            const planeSeconds = (item.distanceKm / PLANE_SPEED_KM_H) * SECONDS_PER_HOUR
            return (
              <div
                key={item.id}
                className="grid gap-2 rounded-lg border border-border/60 p-4 md:grid-cols-[1.2fr_1fr_1fr]"
              >
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.distanceDisplay}</div>
                  <div className="text-xs text-muted-foreground">{item.note}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground">Light time</div>
                  <div>{formatDurationSeconds(lightSeconds)}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground">Plane time</div>
                  <div>{formatDurationSeconds(planeSeconds)}</div>
                  <div className="text-[11px]">Assumes 900 km/h</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold">Distance Timeline (log scale)</div>
          <div className="space-y-3">
            {DISTANCE_SETS.map((item) => {
              const logValue = Math.log10(item.distanceKm)
              const percent = (logValue - minLog) / (maxLog - minLog)
              const width = Math.max(6, percent * 100)
              return (
                <div key={`${item.id}-timeline`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.label}</span>
                    <span>{item.distanceDisplay}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary/60"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            Scale is logarithmic to compare local and intergalactic distances on one line.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
