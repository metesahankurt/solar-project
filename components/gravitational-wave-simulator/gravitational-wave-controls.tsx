"use client"

import { AudioWaveform, Gauge, Orbit, Radar } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { GW_EVENTS } from "@/lib/gravitationalWaveData"

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number[]) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Badge variant="outline" className="font-mono text-xs">
          {value.toFixed(2)}{unit}
        </Badge>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={onChange} />
    </div>
  )
}

export function GravitationalWaveControls({
  selectedEventId,
  onEventChange,
  massScale,
  onMassScaleChange,
  distanceScale,
  onDistanceScaleChange,
}: {
  selectedEventId: string
  onEventChange: (value: string) => void
  massScale: number[]
  onMassScaleChange: (value: number[]) => void
  distanceScale: number[]
  onDistanceScaleChange: (value: number[]) => void
}) {
  const selectedEvent = GW_EVENTS.find((event) => event.id === selectedEventId) ?? GW_EVENTS[0]

  return (
    <div className="h-full space-y-3 overflow-y-auto p-3">
      <Card className="border-border/50 bg-background/80">
        <CardHeader className="px-3 py-2">
          <CardTitle className="flex items-center gap-1.5 text-xs text-emerald-400">
            <AudioWaveform className="h-3.5 w-3.5" />
            Event Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Observed event</Label>
            <Select value={selectedEventId} onValueChange={onEventChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {GW_EVENTS.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-xs">
            <div className="font-medium">{selectedEvent.sourceType}</div>
            <div className="mt-1 text-muted-foreground">{selectedEvent.detectors}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-background/80">
        <CardHeader className="px-3 py-2">
          <CardTitle className="flex items-center gap-1.5 text-xs text-yellow-400">
            <Orbit className="h-3.5 w-3.5" />
            Binary Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-3 pb-3">
          <SliderRow
            label="Mass scale"
            value={massScale[0]}
            min={0.6}
            max={1.5}
            step={0.01}
            unit="x"
            onChange={onMassScaleChange}
          />
          <SliderRow
            label="Distance scale"
            value={distanceScale[0]}
            min={0.5}
            max={2.2}
            step={0.01}
            unit="x"
            onChange={onDistanceScaleChange}
          />
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-background/80">
        <CardHeader className="px-3 py-2">
          <CardTitle className="flex items-center gap-1.5 text-xs text-cyan-400">
            <Gauge className="h-3.5 w-3.5" />
            Official Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 px-3 pb-3 text-xs">
          <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
            <div className="text-muted-foreground">Chirp Mass</div>
            <div className="font-mono">{selectedEvent.chirpMass} M☉</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
            <div className="text-muted-foreground">Peak Strain</div>
            <div className="font-mono">{selectedEvent.peakStrain.toExponential(2)}</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
            <div className="text-muted-foreground">Peak Frequency</div>
            <div className="font-mono">{selectedEvent.peakFrequencyHz} Hz</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
            <div className="text-muted-foreground">Network SNR</div>
            <div className="font-mono">{selectedEvent.networkSnr}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-background/80">
        <CardHeader className="px-3 py-2">
          <CardTitle className="flex items-center gap-1.5 text-xs text-purple-400">
            <Radar className="h-3.5 w-3.5" />
            Model Note
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 text-xs leading-6 text-muted-foreground">
          3D sahne, GWOSC olay parametrelerinden türetilen görsel bir spacetime modelidir.
          Ham strain time-series verisinin birebir geometri rekonstrüksiyonu değildir.
        </CardContent>
      </Card>
    </div>
  )
}
