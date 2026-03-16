"use client"

import { useLayoutEffect, useState } from "react"
import dynamic from "next/dynamic"

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

  return (
    <div className="flex h-svh max-h-svh w-full overflow-hidden bg-black text-white">
      <div className="relative flex-1">
        <GravitationalWaveScene
          event={selectedEvent}
          massScale={massScale[0]}
          distanceScale={distanceScale[0]}
          className="h-full w-full rounded-none border-0"
        />

        <div className="pointer-events-none absolute top-3 left-3 text-xs text-white/45">
          <div className="font-mono">Gravitational Wave Simulation</div>
          <div className="font-mono">{selectedEvent.name} · {selectedEvent.detectors}</div>
        </div>
      </div>

      <div className="flex h-full w-80 shrink-0 flex-col border-l border-white/10 bg-black/90">
        <div className="flex border-b border-white/10">
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

        <div className="flex-1 overflow-hidden">
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
    </div>
  )
}
