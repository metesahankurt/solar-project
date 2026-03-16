"use client"

/**
 * @fileoverview Simulation Controls Panel
 *
 * Interactive control panel for the black hole simulator.
 * Allows users to modify:
 * - Black hole mass
 * - Accretion rate
 * - Observer distance
 * - Simulation speed
 * - Particle count
 * - Visual layer toggles
 */

import { useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play, Pause, RotateCcw, Zap, Eye, Database } from "lucide-react"
import type {
  BlackHoleInput,
  SimulationState,
  BlackHoleSimulationResult,
  AccretionModel,
} from "@/types/blackHole"
import { hawkingTemperature, bekensteinHawkingEntropy, BOLTZMANN } from "@/lib/blackHolePhysics"

// ─────────────────────────────────────────────────────────────────────────────
// KNOWN BLACK HOLES — Observationally confirmed catalog
// Reference masses / methods / papers
// ─────────────────────────────────────────────────────────────────────────────

const KNOWN_BLACK_HOLES = [
  {
    name: "Cygnus X-1",
    mass: 21.2,
    label: "Cyg X-1",
    note: "21.2 M☉ · X-ray binary · Reid et al. 2011",
    accretionRate: 0.08,
    accretionModel: "thin_disk" as AccretionModel,
  },
  {
    name: "GRS 1915+105",
    mass: 12.4,
    label: "GRS 1915",
    note: "12.4 M☉ · microquasar · spin a*≈0.98 · McClintock+2006",
    accretionRate: 0.5,
    accretionModel: "thin_disk" as AccretionModel,
  },
  {
    name: "GW150914",
    mass: 62,
    label: "GW150914",
    note: "62 M☉ post-merger · LIGO 14 Sep 2015 · Abbott+2016",
    accretionRate: 0,
    accretionModel: "none" as AccretionModel,
  },
  {
    name: "Sgr A*",
    mass: 4.154e6,
    label: "Sgr A*",
    note: "4.154×10⁶ M☉ · Galactic center · GRAVITY Collab. 2022",
    accretionRate: 1e-5,  // Extremely sub-Eddington
    accretionModel: "thick_disk" as AccretionModel,
  },
  {
    name: "M87*",
    mass: 6.5e9,
    label: "M87*",
    note: "6.5×10⁹ M☉ · EHT image Apr 2019 · EHT Collab. 2019",
    accretionRate: 1e-4,
    accretionModel: "magnetically_arrested" as AccretionModel,
  },
  {
    name: "TON 618",
    mass: 6.6e10,
    label: "TON 618",
    note: "6.6×10¹⁰ M☉ · hyperluminous quasar · Shemmer+2004",
    accretionRate: 0.3,
    accretionModel: "thin_disk" as AccretionModel,
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICS METRICS DISPLAY
// ─────────────────────────────────────────────────────────────────────────────

interface MetricsDisplayProps {
  result: BlackHoleSimulationResult
}

function MetricsDisplay({ result }: MetricsDisplayProps) {
  const { geometry, observerOrbit, accretionDisk } = result
  const { schwarzschildRadiusKm, photonSphereRadiusM, iscoRadiusM, classification } = geometry

  const tHawking = hawkingTemperature(geometry.massKg)
  const entropy = bekensteinHawkingEntropy(geometry.massKg) / BOLTZMANN  // dimensionless

  const formatKm = (m: number) => {
    const km = m / 1000
    if (km < 0.001) return `${m.toFixed(1)} m`
    if (km < 1) return `${(m).toFixed(0)} m`
    if (km < 1e6) return `${km.toFixed(1)} km`
    if (km < 1e9) return `${(km / 1e6).toFixed(2)} × 10⁶ km`
    return `${(km / 1e9).toFixed(2)} × 10⁹ km`
  }
  const formatV = (v: number) => `${(v * 100).toFixed(2)}% c`

  const badgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    primordial: "secondary", stellar: "default", intermediate: "secondary",
    supermassive: "destructive", ultramassive: "destructive",
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={badgeVariant[classification] ?? "default"}>
          {classification.replace("_", "-")}
        </Badge>
        <span className="text-xs font-mono text-muted-foreground">
          {geometry.massSolar.toExponential(3)} M☉
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <MetricRow label="Event Horizon" value={formatKm(geometry.eventHorizonRadiusM)} color="#ff4444" />
        <MetricRow label="Photon Sphere" value={formatKm(photonSphereRadiusM)} color="#ffaa00" />
        <MetricRow label="ISCO (3Rs)" value={formatKm(iscoRadiusM)} color="#44ff88" />
        <MetricRow label="Orbital Velocity" value={formatV(observerOrbit.circularOrbitVelocityOverC)} color="#88ccff" />
        <MetricRow label="Escape Velocity" value={formatV(observerOrbit.escapeVelocityOverC)} color="#cc88ff" />
        <MetricRow
          label="Time Dilation"
          value={`${(observerOrbit.timeDilationFactor * 100).toFixed(2)}%`}
          color="#ffccaa"
        />
        <MetricRow
          label="Grav. Redshift"
          value={`z = ${observerOrbit.gravitationalRedshift.toFixed(4)}`}
          color="#ffaacc"
        />
        <MetricRow
          label="Hawking T"
          value={tHawking < 1e-6 ? `${tHawking.toExponential(2)} K` : `${tHawking.toFixed(4)} K`}
          color="#aaffcc"
        />
        <MetricRow
          label="B-H Entropy"
          value={`${entropy.toExponential(2)} k_B`}
          color="#cc88ff"
        />
        {accretionDisk && (
          <>
            <MetricRow
              label="Disk Peak T"
              value={`${accretionDisk.peakTemperatureK.toExponential(2)} K`}
              color={accretionDisk.peakEmissionColor}
            />
            <MetricRow
              label="Rad. Efficiency"
              value={`η = ${(accretionDisk.radiativeEfficiency * 100).toFixed(2)}%`}
              color="#ffdd88"
            />
          </>
        )}
      </div>
    </div>
  )
}

function MetricRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-muted/30 rounded p-2 border-l-2" style={{ borderLeftColor: color }}>
      <div className="text-muted-foreground text-[10px] uppercase tracking-wide">{label}</div>
      <div className="font-mono font-semibold text-xs mt-0.5">{value}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONTROLS PANEL
// ─────────────────────────────────────────────────────────────────────────────

interface SimulationControlsProps {
  simState: SimulationState
  result: BlackHoleSimulationResult
  onParamChange: (params: Partial<BlackHoleInput>) => void
  onToggleRunning: () => void
  onReset: () => void
  onLayerToggle: (layer: keyof SimulationState["layers"]) => void
  onToggle: (key: "showPhotonSphere" | "showISCO" | "showTrails" | "showEventHorizon") => void
}

export function SimulationControls({
  simState,
  result,
  onParamChange,
  onToggleRunning,
  onReset,
  onLayerToggle,
  onToggle,
}: SimulationControlsProps) {
  const { params, isRunning } = simState

  const handleMassChange = useCallback(
    (v: number[]) => onParamChange({ massInSolarMasses: v[0] }),
    [onParamChange]
  )
  const handleAccretionChange = useCallback(
    (v: number[]) => onParamChange({ accretionRate: v[0] }),
    [onParamChange]
  )
  const handleObserverDistChange = useCallback(
    (v: number[]) => onParamChange({ observerDistance: v[0] }),
    [onParamChange]
  )
  const handleSpeedChange = useCallback(
    (v: number[]) => onParamChange({ simulationSpeed: v[0] }),
    [onParamChange]
  )
  const handleParticleCountChange = useCallback(
    (v: number[]) => onParamChange({ particleCount: v[0] }),
    [onParamChange]
  )
  const handleAccretionModelChange = useCallback(
    (v: string) => onParamChange({ accretionModel: v as AccretionModel }),
    [onParamChange]
  )

  return (
    <div className="flex flex-col gap-3">

      {/* Playback Controls */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm">Simulation</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isRunning ? "secondary" : "default"}
              onClick={onToggleRunning}
              className="flex-1"
            >
              {isRunning ? <Pause className="size-3.5 mr-1.5" /> : <Play className="size-3.5 mr-1.5" />}
              {isRunning ? "Pause" : "Resume"}
            </Button>
            <Button size="sm" variant="outline" onClick={onReset}>
              <RotateCcw className="size-3.5" />
            </Button>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Speed: {params.simulationSpeed.toFixed(1)}×
            </Label>
            <Slider
              min={0.1}
              max={10}
              step={0.1}
              value={[params.simulationSpeed]}
              onValueChange={handleSpeedChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Black Hole Parameters */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm">Black Hole Parameters</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">

          {/* Mass */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Mass: {params.massInSolarMasses < 1e4
                ? `${params.massInSolarMasses.toFixed(0)} M☉`
                : `${params.massInSolarMasses.toExponential(2)} M☉`}
            </Label>
            <Slider
              min={1}
              max={100}
              step={1}
              value={[Math.min(params.massInSolarMasses, 100)]}
              onValueChange={handleMassChange}
            />
          </div>

          {/* Known black hole catalog */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Database className="size-3" /> Observed Black Holes
            </Label>
            <div className="grid grid-cols-2 gap-1">
              {KNOWN_BLACK_HOLES.map((bh) => (
                <button
                  key={bh.label}
                  className="text-left rounded border border-border/50 bg-muted/20 hover:bg-muted/50 px-2 py-1.5 transition-colors"
                  title={bh.note}
                  onClick={() => onParamChange({
                    massInSolarMasses: bh.mass,
                    accretionRate: bh.accretionRate,
                    accretionModel: bh.accretionModel,
                  })}
                >
                  <div className="text-[11px] font-semibold leading-tight">{bh.label}</div>
                  <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                    {bh.mass < 1e4 ? `${bh.mass} M☉` : `${bh.mass.toExponential(1)} M☉`}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground leading-snug pt-0.5">
              Hover for source reference. Masses from published observations.
            </p>
          </div>

          {/* Accretion model */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Accretion Model</Label>
            <Select
              value={params.accretionModel}
              onValueChange={handleAccretionModelChange}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Accretion</SelectItem>
                <SelectItem value="thin_disk">Thin Disk (Shakura-Sunyaev)</SelectItem>
                <SelectItem value="thick_disk">Thick Disk (ADAF)</SelectItem>
                <SelectItem value="magnetically_arrested">Magnetically Arrested (MAD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accretion rate */}
          {params.accretionModel !== "none" && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Accretion Rate: {(params.accretionRate * 100).toFixed(0)}% Eddington
              </Label>
              <Slider
                min={0.01}
                max={1}
                step={0.01}
                value={[params.accretionRate]}
                onValueChange={handleAccretionChange}
              />
            </div>
          )}

          {/* Observer distance */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Observer Distance: {params.observerDistance.toFixed(0)} Rs
            </Label>
            <Slider
              min={3}
              max={100}
              step={1}
              value={[params.observerDistance]}
              onValueChange={handleObserverDistChange}
            />
          </div>

          {/* Particle count */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Particles: {params.particleCount}
            </Label>
            <Slider
              min={5}
              max={200}
              step={5}
              value={[params.particleCount]}
              onValueChange={handleParticleCountChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Physics Metrics */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="size-3.5" /> Computed Values
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <MetricsDisplay result={result} />
        </CardContent>
      </Card>

      {/* Visual Layer Toggles */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="size-3.5" /> Visual Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          {(
            [
              { key: "accretionDisk", label: "Accretion Disk", color: "#ffcc44" },
              { key: "particles", label: "Orbital Particles", color: "#88ccff" },
              { key: "photonPaths", label: "Photon Paths", color: "#44aaff" },
              { key: "lensing", label: "Lensing Effect", color: "#aa44ff" },
              { key: "labels", label: "Labels", color: "#aaaaaa" },
            ] as const
          ).map(({ key, label, color }) => (
            <div key={key} className="flex items-center justify-between">
              <Label
                htmlFor={`layer-${key}`}
                className="text-xs cursor-pointer"
                style={{ borderLeft: `2px solid ${color}`, paddingLeft: "8px" }}
              >
                {label}
              </Label>
              <Switch
                id={`layer-${key}`}
                checked={simState.layers[key]}
                onCheckedChange={() => onLayerToggle(key)}
              />
            </div>
          ))}

          <div className="border-t border-border/40 pt-2 mt-1 space-y-2">
            {(
              [
                { key: "showPhotonSphere", label: "Photon Sphere Ring", color: "#ffaa00" },
                { key: "showISCO", label: "ISCO Ring", color: "#44ff88" },
                { key: "showTrails", label: "Particle Trails", color: "#ffffff" },
              ] as const
            ).map(({ key, label, color }) => (
              <div key={key} className="flex items-center justify-between">
                <Label
                  htmlFor={`toggle-${key}`}
                  className="text-xs cursor-pointer"
                  style={{ borderLeft: `2px solid ${color}`, paddingLeft: "8px" }}
                >
                  {label}
                </Label>
                <Switch
                  id={`toggle-${key}`}
                  checked={simState[key] as boolean}
                  onCheckedChange={() => onToggle(key)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
