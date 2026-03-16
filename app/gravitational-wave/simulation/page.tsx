"use client"

import { useLayoutEffect, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"

import { GravitationalWaveControls } from "@/components/gravitational-wave-simulator/gravitational-wave-controls"
import { GravitationalWaveDataPanel } from "@/components/gravitational-wave-simulator/gravitational-wave-data-panel"
import { GW_EVENTS } from "@/lib/gravitationalWaveData"

const GravitationalWaveScene = dynamic(
  () =>
    import("@/components/gravitational-wave-simulator/gravitational-wave-scene").then((m) => ({
      default: m.GravitationalWaveScene,
    })),
  { ssr: false }
)

export default function GravitationalWaveSimulationPage() {
  const [selectedEventId, setSelectedEventId] = useState(GW_EVENTS[0].id)
  const [massScale, setMassScale] = useState([1])
  const [distanceScale, setDistanceScale] = useState([1])
  const [activePanel, setActivePanel] = useState<"controls" | "physics">("controls")
  const [showControls, setShowControls] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const selectedEvent = GW_EVENTS.find((event) => event.id === selectedEventId) ?? GW_EVENTS[0]

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
      <GravitationalWaveScene
        event={selectedEvent}
        massScale={massScale[0]}
        distanceScale={distanceScale[0]}
        className="absolute inset-0 w-full h-full rounded-none border-0"
      />

      {/* HUD overlay */}
      <div className="pointer-events-none absolute top-3 left-14 text-xs text-white/45 select-none sm:left-3">
        <div className="font-mono">Gravitational Wave Simulation</div>
        <div className="font-mono">{selectedEvent.name} · {selectedEvent.detectors}</div>
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
              <span className="mt-1 block text-sm font-semibold tracking-tight">Gravitational Waves</span>
              <p className="mt-1 text-xs text-white/55">
                {selectedEvent.name} · {selectedEvent.sourceType}
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
            {(["controls", "physics"] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                  activePanel === panel
                    ? "border-b border-emerald-400 text-emerald-400"
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
              <GravitationalWaveControls
                selectedEventId={selectedEventId}
                onEventChange={setSelectedEventId}
                massScale={massScale}
                onMassScaleChange={setMassScale}
                distanceScale={distanceScale}
                onDistanceScaleChange={setDistanceScale}
              />
            ) : (
              <GravitationalWaveDataPanel
                selectedEvent={selectedEvent}
                massScale={massScale[0]}
                distanceScale={distanceScale[0]}
                compact
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
