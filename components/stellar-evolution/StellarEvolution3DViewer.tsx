"use client"

/**
 * @fileoverview Stellar Evolution 3D Viewer
 *
 * Full-screen R3F Canvas with a stop-motion style phase controller.
 * Supports auto-play (with configurable speed) and manual step-through.
 * Each phase is displayed with:
 *   - Animated 3D star that morphs color, size, and glow
 *   - Overlay with current phase details
 *   - Bottom timeline strip for navigation
 */

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { StellarScene } from "./EvolvingStar3D"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  Thermometer,
  Sparkles,
} from "lucide-react"
import type { StellarEvolutionResult, StellarPhase } from "@/types/stellarResult"
import { formatLifetime, tempToColor } from "@/lib/stellarTimeline"

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface StellarEvolution3DViewerProps {
  result: StellarEvolutionResult
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYBACK SPEED OPTIONS (seconds per phase)
// ─────────────────────────────────────────────────────────────────────────────

const SPEED_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "0.5×", value: 6.0 },
  { label: "1×",   value: 3.5 },
  { label: "2×",   value: 2.0 },
  { label: "4×",   value: 1.0 },
]

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function StellarEvolution3DViewer({ result }: StellarEvolution3DViewerProps) {
  const { phases, inputMass, zamsProperties } = result

  // Show all phases with finite duration (temperature=0 phases like BH are handled in display)
  const visiblePhases = phases.filter(p => isFinite(p.durationGyr))

  const [currentIndex, setCurrentIndex]   = useState(0)
  const [isPlaying, setIsPlaying]         = useState(false)
  const [speedIdx, setSpeedIdx]           = useState(1)            // index into SPEED_OPTIONS
  const [transitionDuration, setTransitionDuration] = useState(1.8)

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPhase    = visiblePhases[currentIndex]
  const phaseCount      = visiblePhases.length
  const speedSeconds    = SPEED_OPTIONS[speedIdx].value

  // ── auto-play ticker ─────────────────────────────────────────────────────
  const advance = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1
      if (next >= phaseCount) {
        setIsPlaying(false)
        return prev
      }
      return next
    })
  }, [phaseCount])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setTimeout(advance, speedSeconds * 1000)
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [isPlaying, currentIndex, speedSeconds, advance])

  // ── keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCurrentIndex(i => Math.min(i + 1, phaseCount - 1))
      if (e.key === "ArrowLeft")  setCurrentIndex(i => Math.max(i - 1, 0))
      if (e.key === " ") { e.preventDefault(); setIsPlaying(p => !p) }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [phaseCount])

  // ── find index of current visible phase in the full phases array ──────────
  const fullPhaseIndex = phases.findIndex(p => p.name === currentPhase?.name)

  if (!currentPhase) return null

  const isFirst = currentIndex === 0
  const isLast  = currentIndex === phaseCount - 1

  return (
    <div className="bg-[#05070c] rounded-xl overflow-hidden border border-white/5 flex flex-col">

      {/* ── 3D Canvas ────────────────────────────────────────────────────── */}
      <div className="relative h-[360px] sm:h-[460px] md:h-[520px]">
        <Canvas
          camera={{ position: [0, 0, 28], fov: 50, near: 0.1, far: 5000 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 1.5]}
          style={{ background: "#05070c" }}
        >
          <StellarScene
            phases={phases}
            currentPhaseIndex={fullPhaseIndex >= 0 ? fullPhaseIndex : 0}
            transitionDuration={transitionDuration}
          />
        </Canvas>

        {/* ── Top-left: Star identification ─────────────────────────────── */}
        <div className="absolute top-3 left-3 space-y-1 pointer-events-none select-none">
          <div className="text-white/90 text-sm font-bold drop-shadow-lg">
            {inputMass.toFixed(2)} M☉ — {zamsProperties.morganKeenanClass}
          </div>
          <div className="text-white/50 text-xs">
            {zamsProperties.comparedToSun.split("·")[0].trim()}
          </div>
        </div>

        {/* ── Top-right: Phase name + badge ────────────────────────────── */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 pointer-events-none">
          <div
            className="text-sm font-bold drop-shadow-lg"
            style={{ color: currentPhase.color }}
          >
            {currentPhase.name}
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {currentPhase.temperatureK > 0 && (
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10"
                style={{ color: tempToColor(currentPhase.temperatureK) }}
              >
                {formatTemperature(currentPhase.temperatureK)}
              </span>
            )}
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/60">
              {formatLuminosity(currentPhase.luminositySolar)}
            </span>
          </div>
        </div>

        {/* ── Center bottom: Phase step counter ────────────────────────── */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/30 text-[11px] pointer-events-none">
          {currentIndex + 1} / {phaseCount}
          <span className="ml-2 text-white/20">← → or Space</span>
        </div>
      </div>

      {/* ── Phase info card ───────────────────────────────────────────────── */}
      <div
        className="px-4 pt-3 pb-2 border-t border-white/5"
        style={{ borderTopColor: currentPhase.color + "33" }}
      >
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <StatPill
            icon={<Clock className="size-3" />}
            label="Duration"
            value={isFinite(currentPhase.durationGyr) ? formatLifetime(currentPhase.durationGyr) : "∞"}
            color={currentPhase.color}
          />
          <StatPill
            icon={<Thermometer className="size-3" />}
            label="Temperature"
            value={currentPhase.temperatureK > 0 ? formatTemperature(currentPhase.temperatureK) : "—"}
            color={currentPhase.color}
          />
          <StatPill
            icon={<Sparkles className="size-3" />}
            label="Luminosity"
            value={formatLuminosity(currentPhase.luminositySolar)}
            color={currentPhase.color}
          />
          <StatPill
            icon={<Zap className="size-3" />}
            label="Fusion"
            value={currentPhase.fusionProcess.split("(")[0].trim()}
            color={currentPhase.color}
          />
        </div>

        {/* Description */}
        <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
          {currentPhase.description}
        </p>
      </div>

      {/* ── Timeline strip ────────────────────────────────────────────────── */}
      <div className="px-3 py-2 border-t border-white/5 space-y-2">
        {/* Phase dots */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {visiblePhases.map((phase, i) => (
            <button
              key={i}
              onClick={() => { setIsPlaying(false); setCurrentIndex(i) }}
              className="flex-shrink-0 group relative"
              title={phase.name}
            >
              <div
                className={`rounded-full transition-all duration-200 ${
                  i === currentIndex
                    ? "w-3 h-3 ring-2 ring-offset-1 ring-offset-[#05070c]"
                    : i < currentIndex
                    ? "w-2 h-2 opacity-70"
                    : "w-2 h-2 opacity-30 group-hover:opacity-60"
                }`}
                style={{
                  backgroundColor: phase.color,
                  ...(i === currentIndex ? { outline: `2px solid ${phase.color}`, outlineOffset: "2px" } : {}),
                }}
              />
            </button>
          ))}

          {/* Progress line between dots */}
          <div className="flex-1 h-px bg-white/10 mx-1" />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2">
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => { setIsPlaying(false); setCurrentIndex(0) }}
              disabled={isFirst}
            >
              <SkipBack className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => { setIsPlaying(false); setCurrentIndex(i => Math.max(0, i - 1)) }}
              disabled={isFirst}
            >
              <ChevronLeft className="size-3.5" />
            </Button>

            {/* Play / Pause */}
            <Button
              size="icon"
              variant="ghost"
              className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setIsPlaying(p => !p)}
              disabled={isLast && !isPlaying}
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => { setIsPlaying(false); setCurrentIndex(i => Math.min(phaseCount - 1, i + 1)) }}
              disabled={isLast}
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => { setIsPlaying(false); setCurrentIndex(phaseCount - 1) }}
              disabled={isLast}
            >
              <SkipForward className="size-3.5" />
            </Button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/30">Speed</span>
            <div className="flex gap-1">
              {SPEED_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSpeedIdx(i)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                    i === speedIdx
                      ? "bg-white/20 text-white"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transition slider */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] text-white/30 whitespace-nowrap">Transition</span>
            <div className="w-20">
              <Slider
                value={[transitionDuration]}
                min={0.3}
                max={4.0}
                step={0.1}
                onValueChange={([v]) => setTransitionDuration(v)}
                className="[&>span]:bg-white/20 [&>span>span]:bg-white/60"
              />
            </div>
            <span className="text-[11px] text-white/30 w-8">{transitionDuration.toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT PILL — compact stat display for the info card
// ─────────────────────────────────────────────────────────────────────────────

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div
      className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg"
      style={{ backgroundColor: color + "15" }}
    >
      <span style={{ color }} className="mt-0.5 shrink-0 opacity-80">
        {icon}
      </span>
      <div className="min-w-0 overflow-hidden">
        <div className="text-[10px] text-white/30 uppercase tracking-wide leading-none mb-0.5">
          {label}
        </div>
        <div className="text-[11px] font-mono text-white/80 truncate">{value}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatTemperature(k: number): string {
  if (k >= 1e9) return `${(k / 1e9).toFixed(1)} GK`
  if (k >= 1e6) return `${(k / 1e6).toFixed(1)} MK`
  if (k >= 1e4) return `${(k / 1000).toFixed(0)}k K`
  return `${k.toLocaleString()} K`
}

function formatLuminosity(l: number): string {
  if (l >= 1e10) return `${(l / 1e10).toFixed(1)}×10¹⁰ L☉`
  if (l >= 1e6)  return `${(l / 1e6).toFixed(1)}×10⁶ L☉`
  if (l >= 1000) return `${(l / 1000).toFixed(1)}k L☉`
  if (l >= 1)    return `${l.toFixed(1)} L☉`
  return `${(l * 1000).toFixed(2)} mL☉`
}
