/**
 * @fileoverview Wormhole 3D Interactive Simulation Page
 *
 * Full-screen interactive visualization of the Morris–Thorne traversable
 * wormhole with real-time parameter adjustments.
 */

"use client"

import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Loader2, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"

import type {
  WormholeSimulationState,
  StarData,
  GalaxyData,
} from "@/types/wormhole"
import { WormholeControls } from "@/components/wormhole/WormholeControls"
import { DataPanel } from "@/components/wormhole/DataPanel"
import { loadStarCatalog, loadGalaxyCatalog } from "@/lib/nasaDataLoader"

// ─── Dynamic Import (SSR-safe) ────────────────────────────────────────────────

const WormholeScene = dynamic(
  () =>
    import("@/components/wormhole/WormholeScene").then((m) => ({
      default: m.WormholeScene,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin mr-3 text-cyan-400" />
        <span className="text-sm text-muted-foreground">Loading WebGL scene…</span>
      </div>
    ),
  }
)

// ─── Default State ────────────────────────────────────────────────────────────

const DEFAULT_STATE: WormholeSimulationState = {
  throatRadiusSolar: 3,
  mouthSeparationAU: 1,
  cameraDistance: 22,
  cameraAzimuth: 0,
  cameraElevation: 20,
  showEmbeddingDiagram: true,
  showStarField: true,
  showLightRays: true,
  showGalaxies: true,
  showExoticMatter: true,
  showLensing: true,
  starDensity: 0.6,
  lightRayCount: 16,
  animationSpeed: 1,
  activeRegion: "both",
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WormholeSimulationPage() {
  const [state, setState] = useState<WormholeSimulationState>(DEFAULT_STATE)
  const [stars, setStars] = useState<StarData[]>([])
  const [galaxies, setGalaxies] = useState<GalaxyData[]>([])
  const [loading, setLoading] = useState(true)
  const [activePanel, setActivePanel] = useState<"controls" | "data">("controls")
  const [showControls, setShowControls] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      try {
        const [starCatalog, galaxyCatalog] = await Promise.all([
          loadStarCatalog(),
          loadGalaxyCatalog(),
        ])
        if (!cancelled) {
          setStars(starCatalog.stars)
          setGalaxies(galaxyCatalog.galaxies)
        }
      } catch (e) {
        console.warn("Catalog load failed:", e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [])

  const handleChange = useCallback(
    (updates: Partial<WormholeSimulationState>) => {
      setState((prev) => ({ ...prev, ...updates }))
    },
    []
  )

  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    const scrollEl = document.querySelector("[data-main-scroll]") as HTMLElement | null

    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    const prevScroll = scrollEl?.style.overflow ?? ""

    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    if (scrollEl) scrollEl.style.overflow = "hidden"

    return () => {
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
      if (scrollEl) scrollEl.style.overflow = prevScroll
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = (e: WheelEvent) => e.stopPropagation()
    el.addEventListener("wheel", handler, { capture: true, passive: true })
    return () => el.removeEventListener("wheel", handler, { capture: true })
  }, [showControls])

  return (
    <div className="relative h-svh max-h-svh overflow-hidden w-full bg-black text-white">

      {/* 3D Canvas */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      )}
      <WormholeScene
        state={state}
        stars={stars}
        galaxies={galaxies}
        className="w-full h-full"
      />

      {/* HUD overlay */}
      <div className="absolute top-3 left-14 text-xs text-white/40 pointer-events-none select-none sm:left-3">
        <div className="font-mono">Morris–Thorne Wormhole · Ellis Model</div>
        <div className="font-mono">b₀ = {state.throatRadiusSolar.toFixed(1)} R☉ · L = {state.mouthSeparationAU.toFixed(1)} AU</div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 pointer-events-none">
        {[
          { color: "#00ffcc", label: "Passed through wormhole" },
          { color: "#4488ff", label: "Deflected by gravity" },
          { color: "#ff8800", label: "Orbiting at throat" },
          { color: "#00ccff", label: "Mouth A (region A)" },
          { color: "#cc88ff", label: "Mouth B (region B)" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-0.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-white/50">{label}</span>
          </div>
        ))}
      </div>

      {/* Toggle button */}
      {!showControls && (
        <Button
          size="sm"
          variant="outline"
          className="absolute top-3 right-3 bg-black/60 border-white/20 text-white hover:bg-black/80 hover:text-white"
          onClick={() => setShowControls(true)}
        >
          <SlidersHorizontal className="size-3.5 mr-1.5" />
          Controls
        </Button>
      )}

      {/* Floating control panel */}
      {showControls && (
        <div className="dark absolute bottom-0 left-0 right-0 top-[50svh] flex flex-col overflow-hidden rounded-t-[28px] border-t border-white/10 bg-neutral-950/82 text-white shadow-2xl backdrop-blur-xl sm:bottom-3 sm:left-auto sm:right-3 sm:top-3 sm:max-h-[calc(100svh-1.5rem)] sm:w-[360px] sm:rounded-[28px] sm:border">
          {/* Drag handle (mobile only) */}
          <div className="mx-auto mt-2.5 mb-0.5 h-1 w-10 shrink-0 rounded-full bg-white/20 sm:hidden" />
          {/* Header */}
          <div className="relative shrink-0 border-b border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent px-5 py-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Control Deck</div>
              <span className="mt-1 block text-sm font-semibold tracking-tight">Wormhole Parameters</span>
              <p className="mt-1 text-xs text-white/55">
                Morris–Thorne model · b₀ = {state.throatRadiusSolar.toFixed(1)} R☉
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-4 top-4 size-8 rounded-full text-white/55 hover:bg-white/10 hover:text-white"
              onClick={() => setShowControls(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Tab bar */}
          <div className="flex shrink-0 border-b border-white/10">
            {(["controls", "data"] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                  activePanel === panel
                    ? "border-b border-cyan-400 text-cyan-400"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {panel === "controls" ? "Controls" : "Physics"}
              </button>
            ))}
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex-1 overflow-hidden">
            {activePanel === "controls" ? (
              <WormholeControls state={state} onChange={handleChange} />
            ) : (
              <DataPanel state={state} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
