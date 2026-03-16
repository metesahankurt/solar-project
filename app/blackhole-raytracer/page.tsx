"use client"

import { useState, useLayoutEffect, useRef, useEffect } from "react"
import { RaytracerScene } from "@/components/blackhole-raytracer/RaytracerScene"
import { RaytracerControls, RaytracerParams } from "@/components/blackhole-raytracer/RaytracerControls"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SlidersHorizontal, X } from "lucide-react"

const DEFAULT_PARAMS: RaytracerParams = {
  mass: 1.0,
  diskTemp: 1.5,
  diskDensity: 1.2,
  lensingStrength: 1.0,
  quality: 0.5,
}

export default function BlackHoleRaytracerPage() {
  const [params, setParams] = useState<RaytracerParams>(DEFAULT_PARAMS)
  const [showControls, setShowControls] = useState(true)
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
    setParams(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="relative h-svh max-h-svh overflow-hidden w-full bg-black text-white">
      {/* 3D WebGL Raytracer Scene */}
      <RaytracerScene params={params} />

      {/* Top-left Info Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <Badge variant="outline" className="bg-black/60 text-white border-white/20 font-mono text-xs">
          Black Hole Raytracer
        </Badge>
        <Badge variant="outline" className="bg-black/60 text-white border-white/20 font-mono text-xs">
          WebGL Raymarching
        </Badge>
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
        <div className="absolute top-3 right-3 w-[340px] max-h-[calc(100svh-1.5rem)] flex flex-col rounded-xl border border-white/10 bg-background/90 md:bg-background/80 backdrop-blur shadow-2xl overflow-hidden text-foreground">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/30">
            <span className="text-sm font-semibold tracking-tight">Raytracer Parameters</span>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setShowControls(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <RaytracerControls params={params} onChange={handleParamChange} />
          </div>
        </div>
      )}
    </div>
  )
}
