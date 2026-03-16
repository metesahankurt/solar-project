/**
 * @fileoverview DataPanel — Live Physics Metrics Display
 *
 * Shows computed wormhole physics metrics in real time as the user
 * adjusts parameters. All values include physical units and brief
 * explanatory tooltips.
 */

"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Atom, Zap, Timer, Layers, AlertTriangle } from "lucide-react"

import type { WormholeSimulationState } from "@/types/wormhole"
import { CONSTANTS, computePhysicsMetrics } from "@/lib/wormholePhysics"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatScientific(val: number, precision = 3): string {
  if (!isFinite(val) || isNaN(val)) return "—"
  if (val === 0) return "0"
  const exp = Math.floor(Math.log10(Math.abs(val)))
  const mantissa = val / Math.pow(10, exp)
  return `${mantissa.toFixed(precision)} × 10^${exp}`
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)} s`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hr`
  return `${(seconds / CONSTANTS.YEAR).toFixed(3)} yr`
}

// ─── Metric Row ───────────────────────────────────────────────────────────────

function MetricRow({
  label,
  value,
  unit,
  tooltip,
  highlight,
}: {
  label: string
  value: string
  unit?: string
  tooltip?: string
  highlight?: "warn" | "info" | "good"
}) {
  const colorClass =
    highlight === "warn" ? "text-yellow-400" :
    highlight === "good" ? "text-green-400" :
    highlight === "info" ? "text-cyan-400" :
    "text-foreground"

  return (
    <div className="flex items-center justify-between py-1.5 group">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/40 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className={`text-xs font-mono ${colorClass}`}>{value}</span>
        {unit && <span className="text-xs text-muted-foreground/60">{unit}</span>}
      </div>
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface DataPanelProps {
  state: WormholeSimulationState
}

export function DataPanel({ state }: DataPanelProps) {
  const metrics = useMemo(() => {
    const b0 = state.throatRadiusSolar * CONSTANTS.SOLAR_RADIUS
    const throatLength = state.mouthSeparationAU * CONSTANTS.AU

    return computePhysicsMetrics({
      throatRadius: b0,
      throatLength,
      redshiftFunction: 0,
      shapeFunctionType: "constant",
      model: "morris_thorne",
    })
  }, [state.throatRadiusSolar, state.mouthSeparationAU])

  const b0Meters = state.throatRadiusSolar * CONSTANTS.SOLAR_RADIUS
  const b0Km = b0Meters / 1000
  const throatLengthAU = state.mouthSeparationAU

  return (
    <div className="space-y-3 p-3 overflow-y-auto h-full text-sm">

      {/* ── Identity ── */}
      <Card className="bg-background/80 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-cyan-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Wormhole Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 space-y-0">
          <MetricRow
            label="Model"
            value="Morris–Thorne"
            tooltip="Zero-tidal-force traversable wormhole (Φ=0, b(r)=b₀)"
          />
          <MetricRow
            label="Throat Radius b₀"
            value={b0Km < 1000
              ? `${b0Km.toFixed(1)}`
              : `${(b0Km / 1e6).toFixed(3)} ×10⁶`}
            unit="km"
            tooltip="Minimum radial coordinate. Photons must have b < b₀ to pass through."
            highlight="info"
          />
          <MetricRow
            label="Throat Length"
            value={throatLengthAU.toFixed(2)}
            unit="AU"
            tooltip="Coordinate length of the wormhole interior."
          />
          <MetricRow
            label="Critical Impact Param."
            value={`${(metrics.criticalImpactParameter / 1000).toFixed(1)}`}
            unit="km"
            tooltip="b_c = b₀. Photons with b = b_c orbit at the throat."
          />
        </CardContent>
      </Card>

      {/* ── Photon Sphere ── */}
      <Card className="bg-background/80 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-yellow-400 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Photon Dynamics
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 space-y-0">
          <MetricRow
            label="Photon Sphere"
            value="r = b₀"
            tooltip="The photon sphere is at the throat itself. Circular photon orbits are unstable."
          />
          <MetricRow
            label="Near-critical α"
            value={`${((metrics.nearCriticalDeflection * 180) / Math.PI).toFixed(1)}°`}
            tooltip="Deflection angle for b = 1.1·b₀ (just above critical). Large values indicate strong lensing."
            highlight={Math.abs(metrics.nearCriticalDeflection) > Math.PI / 2 ? "warn" : "info"}
          />
          <MetricRow
            label="Throat Crossing"
            value="b < b₀"
            tooltip="Photons with impact parameter below the throat radius pass through to the other universe."
            highlight="good"
          />
          <MetricRow
            label="Zero Tidal Force"
            value={metrics.tidalForce === 0 ? "Yes (Φ=0)" : "No"}
            tooltip="Φ(l)=0 means no tidal forces on a traversing traveler."
            highlight="good"
          />
        </CardContent>
      </Card>

      {/* ── Traversal ── */}
      <Card className="bg-background/80 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-green-400 flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5" />
            Traversal Physics
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 space-y-0">
          <MetricRow
            label="Proper Time (v=0.1c)"
            value={formatTime(metrics.traversalTime)}
            tooltip="Proper time experienced by a traveler moving at 10% the speed of light through the wormhole."
            highlight="good"
          />
          <MetricRow
            label="Throat ΔS"
            value={`${state.mouthSeparationAU.toFixed(2)} AU`}
            tooltip="Coordinate separation between the two mouths."
          />
          <MetricRow
            label="Flaring-Out"
            value={metrics.flaresOut ? "Satisfied ✓" : "Violated ✗"}
            tooltip="b'(r₀) < 1 — required for the throat to be open. Satisfied for the Ellis wormhole."
            highlight={metrics.flaresOut ? "good" : "warn"}
          />
          <MetricRow
            label="WEC Violation"
            value="Yes (required)"
            tooltip="The Weak Energy Condition must be violated: exotic matter with negative energy density is required."
            highlight="warn"
          />
        </CardContent>
      </Card>

      {/* ── Exotic Matter ── */}
      <Card className="bg-background/80 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Exotic Matter
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 space-y-0">
          <MetricRow
            label="ρ at throat"
            value={formatScientific(metrics.exoticMatterDensity)}
            unit="kg/m³"
            tooltip="Exotic matter energy density at the throat. Negative value required to maintain the wormhole."
            highlight="warn"
          />
          <MetricRow
            label="Total M_exotic"
            value={formatScientific(Math.abs(metrics.totalExoticMatter))}
            unit="kg"
            tooltip="Total exotic matter required (Visser 1995 estimate). Negative energy."
            highlight="warn"
          />
          <MetricRow
            label="Casimir analogy"
            value="Quantum vacuum"
            tooltip="The Casimir effect produces negative energy density between conducting plates, analogous to the required exotic matter."
          />
        </CardContent>
      </Card>

      {/* ── Data Source ── */}
      <Card className="bg-background/80 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-purple-400 flex items-center gap-1.5">
            <Atom className="h-3.5 w-3.5" />
            Catalog
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 space-y-0">
          <MetricRow label="Stars" value="Hipparcos / Yale BSC" tooltip="ESA Hipparcos Catalogue (1997) — 50 bright stars with real coordinates." />
          <MetricRow label="Galaxies" value="Messier / NGC-IC" tooltip="30 galaxies from Messier and NGC catalogues with NED distances." />
          <MetricRow label="Coordinates" value="J2000.0" tooltip="International Celestial Reference System, epoch J2000.0." />
        </CardContent>
      </Card>

    </div>
  )
}
