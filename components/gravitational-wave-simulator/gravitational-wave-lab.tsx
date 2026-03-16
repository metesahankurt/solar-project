"use client"

import { useState } from "react"
import { GravitationalWaveControls } from "@/components/gravitational-wave-simulator/gravitational-wave-controls"
import { GravitationalWaveDataPanel } from "@/components/gravitational-wave-simulator/gravitational-wave-data-panel"
import { GW_EVENTS } from "@/lib/gravitationalWaveData"

export function GravitationalWaveLab() {
  const [selectedEventId, setSelectedEventId] = useState(GW_EVENTS[0].id)
  const [massScale, setMassScale] = useState([1])
  const [distanceScale, setDistanceScale] = useState([1])
  const selectedEvent = GW_EVENTS.find((event) => event.id === selectedEventId) ?? GW_EVENTS[0]

  return (
    <div className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
      <GravitationalWaveControls
        selectedEventId={selectedEventId}
        onEventChange={setSelectedEventId}
        massScale={massScale}
        onMassScaleChange={setMassScale}
        distanceScale={distanceScale}
        onDistanceScaleChange={setDistanceScale}
      />
      <GravitationalWaveDataPanel
        selectedEvent={selectedEvent}
        massScale={massScale[0]}
        distanceScale={distanceScale[0]}
      />
    </div>
  )
}
