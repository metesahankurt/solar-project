"use client"

/**
 * @fileoverview Stellar Evolution 3D Visualization Page
 *
 * Provides a full interactive 3D stop-motion visualization of a star's
 * life cycle. The user can:
 *   - Select the star mass via slider or preset
 *   - Watch the 3D star morph through each evolution phase
 *   - Step manually (← →) or auto-play at adjustable speed
 *
 * Phases are calculated entirely client-side from the physics library.
 */

import React, { useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Star, Telescope } from "lucide-react"
import type { StarInput } from "@/types/star"
import type { StellarEvolutionResult } from "@/types/stellarResult"
import {
  calcStellarProperties,
  calcMainSequenceLifetime,
  calcMetallicityCorrection,
  calcRotationCorrection,
} from "@/lib/stellarPhysics"
import {
  determineFinalRemnant,
  analyzeSupernova,
  describeRemnant,
} from "@/lib/stellarClassification"
import {
  buildEvolutionTimeline,
  buildHRTrack,
} from "@/lib/stellarTimeline"

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic import — avoids R3F SSR issues
// ─────────────────────────────────────────────────────────────────────────────

const StellarEvolution3DViewer = dynamic(
  () =>
    import(
      "@/components/stellar-evolution/StellarEvolution3DViewer"
    ).then(m => m.StellarEvolution3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] bg-[#05070c] rounded-xl">
        <div className="text-white/30 text-sm animate-pulse">Initializing 3D scene…</div>
      </div>
    ),
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// PRESET STARS
// ─────────────────────────────────────────────────────────────────────────────

const PRESETS: Array<{
  label: string
  mass: number
  badge: string
  color: string
}> = [
  { label: "Proxima",   mass: 0.12, badge: "M5V",   color: "#FF4500" },
  { label: "Sun",       mass: 1.0,  badge: "G2V",   color: "#FFF4EA" },
  { label: "Sirius A",  mass: 2.0,  badge: "A1V",   color: "#CAD7FF" },
  { label: "Spica",     mass: 10.0, badge: "B1V",   color: "#AABFFF" },
  { label: "Rigel",     mass: 21.0, badge: "B8Ia",  color: "#9BB0FF" },
  { label: "R136a1",    mass: 215,  badge: "WN5h",  color: "#9400D3" },
]

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT-SIDE SIMULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function runSimulation(mass: number): StellarEvolutionResult {
  const input: StarInput = {
    mass,
    metallicity: 0.0,
    metallicityPreset: "pop_i",
    rotationRate: 0.0,
    rotationClass: "slow",
  }

  const metalCorr   = calcMetallicityCorrection(input.metallicity)
  const rotCorr     = calcRotationCorrection(input.rotationRate)
  const msLifetime  = calcMainSequenceLifetime(mass, metalCorr, rotCorr)
  const zams        = calcStellarProperties(mass)
  const finalRemnant  = determineFinalRemnant(mass, input.metallicity)
  const remnantDesc   = describeRemnant(finalRemnant, mass)
  const snovaAnalysis = analyzeSupernova(mass, input.metallicity)
  const phases        = buildEvolutionTimeline(input)
  const totalLifetime = phases.reduce((s, p) => isFinite(p.durationGyr) ? s + p.durationGyr : s, 0)
  const hrTrack       = buildHRTrack(phases)

  return {
    inputMass:                           mass,
    inputMetallicity:                    input.metallicity,
    inputRotationRate:                   input.rotationRate,
    zamsProperties:                      zams,
    mainSequenceLifetimeGyr:             msLifetime,
    totalLifetimeGyr:                    totalLifetime,
    phases,
    finalRemnant,
    finalRemnantDescription:             remnantDesc,
    willExplodeAsSupernovaOrHypernova:   snovaAnalysis.willExplode,
    supernovaType:                       snovaAnalysis.type,
    metallicityCorrection:               metalCorr,
    rotationCorrection:                  rotCorr,
    hrDiagramTrack:                      hrTrack,
    calculatedAt:                        new Date().toISOString(),
    modelVersion:                        "1.0.0",
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function VisualizationPage() {
  const [mass, setMass] = useState(1.0)

  const result = useMemo(() => runSimulation(mass), [mass])

  const massCategory =
    mass < 0.08  ? "Brown Dwarf" :
    mass < 0.45  ? "Red Dwarf" :
    mass < 2.0   ? "Low-mass" :
    mass < 8.0   ? "Intermediate-mass" :
    mass < 20    ? "High-mass" :
    mass < 40    ? "Very High-mass" :
    "Extreme-mass"

  const massColor =
    mass < 0.45  ? "#FF4500" :
    mass < 2     ? "#FFD700" :
    mass < 8     ? "#CAD7FF" :
    mass < 20    ? "#AABFFF" :
    "#9400D3"

  return (
    <div className="container mx-auto px-4 py-6 space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2.5">
            <Telescope className="size-6 text-primary shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              3D Stellar Evolution Visualization
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Watch a star morph through every phase of its life — from birth to final remnant.
            Use ← → or the timeline to step through phases.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="self-start">
          <Link href="/stellar-evolution/simulator">
            <ArrowLeft className="size-3.5 mr-1.5" />
            Back to Simulator
          </Link>
        </Button>
      </div>

      {/* ── Mass Selector ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="size-4" />
            Select Star Mass
          </CardTitle>
          <CardDescription>
            Choose a preset or drag the slider — the 3D visualization updates instantly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => setMass(p.mass)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  Math.abs(mass - p.mass) < 0.01
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted/60"
                }`}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                {p.label}
                <Badge variant="outline" className="text-[10px] px-1.5 leading-tight">
                  {p.badge}
                </Badge>
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Initial Mass</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{massCategory}</Badge>
                <span
                  className="font-mono font-bold text-base"
                  style={{ color: massColor }}
                >
                  {mass.toFixed(2)} M☉
                </span>
              </div>
            </div>
            <Slider
              value={[mass]}
              min={0.08}
              max={150}
              step={0.02}
              onValueChange={([v]) => setMass(v)}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>0.08 M☉</span>
              <span>150 M☉</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <QuickStat label="Spectral Class" value={result.zamsProperties.morganKeenanClass} />
            <QuickStat
              label="MS Lifetime"
              value={
                isFinite(result.mainSequenceLifetimeGyr)
                  ? result.mainSequenceLifetimeGyr >= 1
                    ? `${result.mainSequenceLifetimeGyr.toFixed(2)} Gyr`
                    : result.mainSequenceLifetimeGyr >= 0.001
                    ? `${(result.mainSequenceLifetimeGyr * 1000).toFixed(2)} Myr`
                    : `${(result.mainSequenceLifetimeGyr * 1e6).toFixed(0)} kyr`
                  : "∞"
              }
            />
            <QuickStat label="Final Remnant" value={result.finalRemnant} />
            <QuickStat
              label="Phase Count"
              value={`${result.phases.filter(p => isFinite(p.durationGyr)).length} phases`}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 3D Viewer ──────────────────────────────────────────────────── */}
      <StellarEvolution3DViewer result={result} />

      {/* ── Phase Summary Table ────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Phase Summary</CardTitle>
          <CardDescription>
            All evolution phases for a {mass.toFixed(2)} M☉ star in chronological order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Phase</th>
                  <th className="text-right py-2 pr-4 text-muted-foreground font-medium">Duration</th>
                  <th className="text-right py-2 pr-4 text-muted-foreground font-medium hidden sm:table-cell">Temperature</th>
                  <th className="text-right py-2 text-muted-foreground font-medium hidden md:table-cell">Luminosity</th>
                </tr>
              </thead>
              <tbody>
                {result.phases.map((phase, i) => (
                  <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="py-1.5 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-1.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: phase.color }}
                        />
                        <span className="font-medium">{phase.name}</span>
                      </div>
                    </td>
                    <td className="py-1.5 pr-4 text-right font-mono text-muted-foreground">
                      {isFinite(phase.durationGyr)
                        ? phase.durationGyr < 1e-4
                          ? "< 1 kyr"
                          : phase.durationGyr >= 1
                          ? `${phase.durationGyr.toFixed(3)} Gyr`
                          : `${(phase.durationGyr * 1000).toFixed(1)} Myr`
                        : "∞"}
                    </td>
                    <td className="py-1.5 pr-4 text-right font-mono hidden sm:table-cell"
                      style={{ color: phase.temperatureK > 0 ? undefined : "transparent" }}>
                      {phase.temperatureK > 0 ? formatTempShort(phase.temperatureK) : "—"}
                    </td>
                    <td className="py-1.5 text-right font-mono text-muted-foreground hidden md:table-cell">
                      {phase.luminositySolar > 0 ? formatLumShort(phase.luminositySolar) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-lg px-3 py-2">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-xs font-semibold font-mono mt-0.5 truncate">{value}</div>
    </div>
  )
}

function formatTempShort(k: number): string {
  if (k >= 1e9) return `${(k / 1e9).toFixed(0)} GK`
  if (k >= 1e6) return `${(k / 1e6).toFixed(0)} MK`
  if (k >= 1e4) return `${(k / 1000).toFixed(0)}k K`
  return `${k.toLocaleString()} K`
}

function formatLumShort(l: number): string {
  if (l >= 1e9)  return `${(l / 1e9).toFixed(1)}G L☉`
  if (l >= 1e6)  return `${(l / 1e6).toFixed(1)}M L☉`
  if (l >= 1000) return `${(l / 1000).toFixed(0)}k L☉`
  return `${l.toFixed(1)} L☉`
}
