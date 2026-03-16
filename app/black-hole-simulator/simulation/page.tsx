"use client"

/**
 * @fileoverview Black Hole Simulator — Interactive 3D Simulation Page
 *
 * The main simulation interface. Manages simulation state, computes
 * physics every time parameters change, and renders the 3D scene with
 * the controls panel.
 */

import { useState, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { BlackHoleScene } from "@/components/black-hole-simulator/BlackHoleScene"
import { SimulationControls } from "@/components/black-hole-simulator/SimulationControls"
import { runBlackHolePhysics } from "@/lib/blackHolePhysics"
import { spawnAccretionParticles } from "@/lib/orbitalMechanics"
import { generatePhotonTrajectories } from "@/lib/lensingPhysics"
import {
  DEFAULT_BLACK_HOLE_INPUT,
  DEFAULT_SIMULATION_STATE,
} from "@/types/blackHole"
import type {
  BlackHoleInput,
  SimulationState,
  SimulationParticle,
  PhotonTrajectory,
  BlackHoleSimulationResult,
} from "@/types/blackHole"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function BlackHoleSimulationPage() {

  // ── Lock ALL scroll on this full-screen 3D page ──────────────────────────
  // useLayoutEffect is synchronous — fires before browser paint, preventing
  // any visible scrollbar flash.
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

  // ── Physics result (recomputed on param change) ──────────────────────────
  const [params, setParams] = useState<BlackHoleInput>(DEFAULT_BLACK_HOLE_INPUT)
  const result = useMemo<BlackHoleSimulationResult>(
    () => runBlackHolePhysics(params),
    [params]
  )

  // ── Simulation state ──────────────────────────────────────────────────────
  const [isRunning, setIsRunning] = useState(true)
  const [showPhotonSphere, setShowPhotonSphere] = useState(true)
  const [showISCO, setShowISCO] = useState(true)
  const [showEventHorizon, setShowEventHorizon] = useState(true)
  const [showTrails, setShowTrails] = useState(true)
  const [layers, setLayers] = useState(DEFAULT_SIMULATION_STATE.layers)

  // ── Particles ─────────────────────────────────────────────────────────────
  const [particles, setParticles] = useState<SimulationParticle[]>([])

  // ── Photon paths ──────────────────────────────────────────────────────────
  const [photonPaths, setPhotonPaths] = useState<PhotonTrajectory[]>([])

  // ── Initialize particles & photon paths when result changes ──────────────
  useEffect(() => {
    const { geometry } = result
    const { schwarzschildRadiusM, iscoRadiusM, massKg } = geometry

    // Spawn accretion particles
    const newParticles = spawnAccretionParticles(
      params,
      schwarzschildRadiusM,
      iscoRadiusM,
      massKg
    )
    setParticles(newParticles)

    // Generate photon trajectories
    if (params.showPhotonPaths) {
      const paths = generatePhotonTrajectories(12, schwarzschildRadiusM)
      setPhotonPaths(paths)
    } else {
      setPhotonPaths([])
    }
  }, [result, params])

  // ── Build simulation state object ─────────────────────────────────────────
  const simState = useMemo<SimulationState>(
    () => ({
      isRunning,
      simulationTime: 0,
      params,
      result,
      particles,
      photonPaths,
      showEventHorizon,
      showPhotonSphere,
      showISCO,
      showTrails,
      layers,
      cameraTarget: "black_hole",
    }),
    [isRunning, params, result, particles, photonPaths,
     showEventHorizon, showPhotonSphere, showISCO, showTrails, layers]
  )

  // ── Callbacks ─────────────────────────────────────────────────────────────

  const handleParamChange = useCallback((updates: Partial<BlackHoleInput>) => {
    setParams((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleToggleRunning = useCallback(() => {
    setIsRunning((prev) => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setParams(DEFAULT_BLACK_HOLE_INPUT)
    setIsRunning(true)
  }, [])

  const handleLayerToggle = useCallback(
    (layer: keyof SimulationState["layers"]) => {
      setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
    },
    []
  )

  const handleToggle = useCallback(
    (key: "showPhotonSphere" | "showISCO" | "showTrails" | "showEventHorizon") => {
      switch (key) {
        case "showPhotonSphere": setShowPhotonSphere((p) => !p); break
        case "showISCO": setShowISCO((p) => !p); break
        case "showTrails": setShowTrails((p) => !p); break
        case "showEventHorizon": setShowEventHorizon((p) => !p); break
      }
    },
    []
  )

  const handleParticlesUpdate = useCallback((updated: SimulationParticle[]) => {
    setParticles(updated)
  }, [])

  const [showControls, setShowControls] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Native (non-passive) wheel listener so Three.js canvas can't swallow our scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = (e: WheelEvent) => e.stopPropagation()
    el.addEventListener("wheel", handler, { capture: true, passive: true })
    return () => el.removeEventListener("wheel", handler, { capture: true })
  }, [showControls])

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative h-svh max-h-svh overflow-hidden w-full">

      {/* 3D Scene — full screen */}
      <BlackHoleScene
        simState={simState}
        result={result}
        particles={particles}
        photonPaths={photonPaths}
        onParticlesUpdate={handleParticlesUpdate}
      />

      {/* Top-left info badges */}
      <div className="absolute top-3 left-14 flex flex-wrap items-center gap-2 pointer-events-none sm:left-3">
        <Badge variant="outline" className="bg-black/60 text-white border-white/20 font-mono text-[11px]">
          {params.massInSolarMasses < 1e4
            ? `${params.massInSolarMasses.toFixed(0)} M☉`
            : `${params.massInSolarMasses.toExponential(1)} M☉`}
        </Badge>
        <Badge variant="outline" className="bg-black/60 text-white border-white/20 font-mono text-[11px]">
          Rs = {result.geometry.schwarzschildRadiusKm.toFixed(1)} km
        </Badge>
        <Badge variant="outline" className="bg-black/60 text-white border-white/20 font-mono text-[11px]">
          {result.geometry.classification}
        </Badge>
        {!isRunning && (
          <Badge variant="secondary" className="bg-yellow-900/80 text-yellow-200 text-[11px]">
            PAUSED
          </Badge>
        )}
      </div>

      {/* Toggle button (visible when panel is hidden) */}
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

      {/* Floating controls panel */}
      {showControls && (
        <div className="dark absolute bottom-0 left-0 right-0 top-[50svh] flex flex-col overflow-hidden rounded-t-[28px] border-t border-white/10 bg-neutral-950/82 text-white shadow-2xl backdrop-blur-xl sm:bottom-3 sm:left-auto sm:right-3 sm:top-3 sm:max-h-[calc(100svh-1.5rem)] sm:w-[360px] sm:rounded-[28px] sm:border">
          {/* Drag handle (mobile only) */}
          <div className="mx-auto mt-2.5 mb-0.5 h-1 w-10 shrink-0 rounded-full bg-white/20 sm:hidden" />
          {/* Header */}
          <div className="relative shrink-0 border-b border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent px-5 py-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Control Deck</div>
              <span className="mt-1 block text-sm font-semibold tracking-tight">Black Hole Simulation</span>
              <p className="mt-1 text-xs text-white/55">
                {params.massInSolarMasses < 1e4
                  ? `${params.massInSolarMasses.toFixed(0)} M☉`
                  : `${params.massInSolarMasses.toExponential(1)} M☉`}
                {" · "}{result.geometry.classification}
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

          {/* Scrollable content */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <SimulationControls
              simState={simState}
              result={result}
              onParamChange={handleParamChange}
              onToggleRunning={handleToggleRunning}
              onReset={handleReset}
              onLayerToggle={handleLayerToggle}
              onToggle={handleToggle}
            />
          </div>
        </div>
      )}
    </div>
  )
}
