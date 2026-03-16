/**
 * @fileoverview WormholeControls — Interactive Parameter Control Panel
 *
 * Provides sliders, toggles and display widgets for adjusting the
 * wormhole simulation parameters in real time.
 */

"use client"

import React from "react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Eye,
  Star,
  Layers,
  Gauge,
  Activity,
  Orbit,
} from "lucide-react"

import type { WormholeSimulationState } from "@/types/wormhole"

// ─── Props ────────────────────────────────────────────────────────────────────

interface WormholeControlsProps {
  state: WormholeSimulationState
  onChange: (updates: Partial<WormholeSimulationState>) => void
}

// ─── Slider Row ───────────────────────────────────────────────────────────────

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  formatValue,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
  formatValue?: (v: number) => string
}) {
  const display = formatValue ? formatValue(value) : value.toFixed(2)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Badge variant="outline" className="text-xs font-mono">
          {display} {unit}
        </Badge>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  )
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  icon: React.FC<{ className?: string }>
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <Label className="text-xs">{label}</Label>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}

// ─── Main Controls ────────────────────────────────────────────────────────────

export function WormholeControls({ state, onChange }: WormholeControlsProps) {
  return (
    <div className="space-y-3 p-3 overflow-y-auto h-full">
      {/* ── Geometry ── */}
      <Card className="bg-background/80 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs flex items-center gap-1.5 text-cyan-400">
            <Orbit className="h-3.5 w-3.5" />
            Wormhole Geometry
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-4">
          <SliderRow
            label="Throat Radius"
            value={state.throatRadiusSolar}
            min={0.1}
            max={20}
            step={0.1}
            unit="R☉"
            onChange={(v) => onChange({ throatRadiusSolar: v })}
            formatValue={(v) => v.toFixed(1)}
          />
          <SliderRow
            label="Mouth Separation"
            value={state.mouthSeparationAU}
            min={0.1}
            max={10}
            step={0.1}
            unit="AU"
            onChange={(v) => onChange({ mouthSeparationAU: v })}
            formatValue={(v) => v.toFixed(1)}
          />
        </CardContent>
      </Card>

      {/* ── Light Rays ── */}
      <Card className="bg-background/80 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs flex items-center gap-1.5 text-yellow-400">
            <Zap className="h-3.5 w-3.5" />
            Light Rays
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-4">
          <SliderRow
            label="Ray Count"
            value={state.lightRayCount}
            min={4}
            max={40}
            step={2}
            unit="rays"
            onChange={(v) => onChange({ lightRayCount: v })}
            formatValue={(v) => v.toFixed(0)}
          />
        </CardContent>
      </Card>

      {/* ── Render ── */}
      <Card className="bg-background/80 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs flex items-center gap-1.5 text-purple-400">
            <Gauge className="h-3.5 w-3.5" />
            Render Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-4">
          <SliderRow
            label="Star Density"
            value={state.starDensity}
            min={0.1}
            max={1}
            step={0.05}
            unit=""
            onChange={(v) => onChange({ starDensity: v })}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <SliderRow
            label="Animation Speed"
            value={state.animationSpeed}
            min={0}
            max={2}
            step={0.1}
            unit="×"
            onChange={(v) => onChange({ animationSpeed: v })}
            formatValue={(v) => v.toFixed(1)}
          />
        </CardContent>
      </Card>

      {/* ── Visibility ── */}
      <Card className="bg-background/80 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs flex items-center gap-1.5 text-green-400">
            <Eye className="h-3.5 w-3.5" />
            Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-1">
          <ToggleRow
            label="Embedding Diagram"
            value={state.showEmbeddingDiagram}
            onChange={(v) => onChange({ showEmbeddingDiagram: v })}
            icon={Layers}
          />
          <ToggleRow
            label="Star Field"
            value={state.showStarField}
            onChange={(v) => onChange({ showStarField: v })}
            icon={Star}
          />
          <ToggleRow
            label="Light Rays"
            value={state.showLightRays}
            onChange={(v) => onChange({ showLightRays: v })}
            icon={Zap}
          />
          <ToggleRow
            label="Galaxies"
            value={state.showGalaxies}
            onChange={(v) => onChange({ showGalaxies: v })}
            icon={Orbit}
          />
          <ToggleRow
            label="Exotic Matter"
            value={state.showExoticMatter}
            onChange={(v) => onChange({ showExoticMatter: v })}
            icon={Activity}
          />
          <ToggleRow
            label="Lensing"
            value={state.showLensing}
            onChange={(v) => onChange({ showLensing: v })}
            icon={Eye}
          />
        </CardContent>
      </Card>
    </div>
  )
}
