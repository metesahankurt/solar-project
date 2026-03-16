"use client"

import { useState, useLayoutEffect, useRef, useEffect } from "react"
import { RaytracerScene } from "@/components/blackhole-raytracer/RaytracerScene"
import { RaytracerControls, RaytracerParams } from "@/components/blackhole-raytracer/RaytracerControls"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SlidersHorizontal, Telescope, X } from "lucide-react"

const DEFAULT_PARAMS: RaytracerParams = {
  mass: 1.0,
  spin: 0.68,
  diskTemp: 0.74,
  diskDensity: 0.34,
  lensingStrength: 1.0,
  quality: 4,
}

const PRESETS: Array<{ id: string; label: string; params: RaytracerParams }> = [
  {
    id: "cinematic",
    label: "Cinematic",
    params: {
      mass: 1.12,
      spin: 0.84,
      diskTemp: 0.88,
      diskDensity: 0.46,
      lensingStrength: 1.08,
      quality: 4,
    },
  },
  {
    id: "scientific",
    label: "Scientific",
    params: {
      mass: 1.0,
      spin: 0.68,
      diskTemp: 0.74,
      diskDensity: 0.34,
      lensingStrength: 1.0,
      quality: 4,
    },
  },
  {
    id: "extreme",
    label: "Extreme",
    params: {
      mass: 1.35,
      spin: 0.95,
      diskTemp: 1.05,
      diskDensity: 0.6,
      lensingStrength: 1.18,
      quality: 4,
    },
  },
]

export default function BlackHoleRaytracerPage() {
  const [params, setParams] = useState<RaytracerParams>(DEFAULT_PARAMS)
  const [showControls, setShowControls] = useState(true)
  const [activePreset, setActivePreset] = useState("scientific")
  const [viewState, setViewState] = useState({ distance: 9.8, visibility: 1 })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Lock ALL scroll on this full-screen 3D page
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

  // Native wheel listener for the controls panel to prevent canvas scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = (e: WheelEvent) => e.stopPropagation()
    el.addEventListener("wheel", handler, { capture: true, passive: true })
    return () => el.removeEventListener("wheel", handler, { capture: true })
  }, [showControls])

  const handleParamChange = (updates: Partial<RaytracerParams>) => {
    setActivePreset("custom")
    setParams(prev => ({ ...prev, ...updates }))
  }

  const handlePresetSelect = (preset: { id: string; params: RaytracerParams }) => {
    setActivePreset(preset.id)
    setParams(preset.params)
  }

  return (
    <div className="relative h-svh max-h-svh overflow-hidden w-full bg-black text-white">
      {/* 3D WebGL Raytracer Scene */}
      <RaytracerScene params={params} onViewChange={setViewState} />

      {/* Top-left Info Badges */}
      <div className="absolute top-3 left-3 right-16 flex flex-wrap items-center gap-2 pointer-events-none sm:right-auto">
        <Badge variant="outline" className="bg-black/60 text-white border-white/20 font-mono text-xs">
          Black Hole Raytracer
        </Badge>
        <Badge variant="outline" className="bg-black/60 text-white border-white/20 font-mono text-xs">
          WebGL Raymarching
        </Badge>
        <Badge variant="outline" className="bg-black/60 text-white border-white/20 font-mono text-xs">
          Visibility {Math.round(viewState.visibility * 100)}%
        </Badge>
      </div>

      <div className="pointer-events-none absolute hidden rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md sm:block sm:bottom-4 sm:left-16 sm:max-w-sm">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/65">
          <Telescope className="size-3.5" />
          Observer Guidance
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-white/85 sm:mt-2 sm:text-sm">
          Scroll ile uzaklaşınca merceklenme yavaşça çözülür. Yaklaştıkça photon ring ve event horizon daha belirgin hale gelir.
        </p>
      </div>

      {/* Toggle Controls Button */}
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

      {/* Controls Panel */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 top-[50svh] flex flex-col overflow-hidden rounded-t-[28px] border-t border-white/10 bg-neutral-950/82 text-white shadow-2xl backdrop-blur-xl sm:bottom-3 sm:left-auto sm:right-3 sm:top-3 sm:max-h-[calc(100svh-1.5rem)] sm:w-[360px] sm:rounded-[28px] sm:border">
          {/* Drag handle (mobile only) */}
          <div className="mx-auto mt-2.5 mb-0.5 h-1 w-10 shrink-0 rounded-full bg-white/20 sm:hidden" />
          {/* Header */}
          <div className="shrink-0 border-b border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Control Deck</div>
                <span className="mt-1 block text-sm font-semibold tracking-tight">Black Hole Parameters</span>
                <p className="mt-1 text-xs text-white/55">
                  Zoom kara deliğin görünürlüğünü etkiler; aşağıdaki ayarlar fiziksel yapısını değiştirir.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Badge variant="outline" className="border-white/10 bg-black/20 text-[10px] text-white/80">
                  {activePreset === "custom" ? "Custom" : activePreset}
                </Badge>
                <Badge variant="outline" className="border-white/10 bg-black/20 text-[10px] text-white/80">
                  {viewState.distance.toFixed(1)} AU
                </Badge>
              </div>
            </div>
          </div>
          <div className="absolute right-4 top-4">
            <Button
              size="icon"
              variant="ghost"
              className="size-8 rounded-full text-white/55 hover:bg-white/10 hover:text-white"
              onClick={() => setShowControls(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mb-5 space-y-3">
              <div className="block h-1.5 w-14 rounded-full bg-white/15 sm:hidden" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                  Presets
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    variant={activePreset === preset.id ? "default" : "outline"}
                    className="h-9 rounded-xl border-white/10 px-2 text-[11px] text-white hover:bg-white/10 hover:text-white sm:text-xs"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <RaytracerControls
              params={params}
              onChange={handleParamChange}
              observerDistance={viewState.distance}
              blackHoleVisibility={viewState.visibility}
            />
          </div>
        </div>
      )}
    </div>
  )
}
