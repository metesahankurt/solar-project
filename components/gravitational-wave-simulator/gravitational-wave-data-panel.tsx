"use client"

import { useMemo } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts"
import { AudioWaveform, Orbit } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { MathDisplay } from "@/components/ui/math-display"
import { Separator } from "@/components/ui/separator"
import { GW_EVENTS, type EventRecord } from "@/lib/gravitationalWaveData"

const waveformChartConfig = {
  strain: {
    label: "Gerinim h(t)",
    color: "oklch(0.72 0.18 145)",
  },
  envelope: {
    label: "Zarf",
    color: "oklch(0.82 0.17 92)",
  },
}

const comparisonChartConfig = {
  distance: {
    label: "Uzaklık (Mpc)",
    color: "oklch(0.69 0.18 40)",
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function buildWaveform(event: EventRecord, massScale: number, distanceScale: number) {
  const samples = 240
  const duration = event.modeledDurationSeconds
  const modeledPeak = event.peakStrain * massScale / distanceScale
  const totalMass = (event.primaryMass + event.secondaryMass) * massScale
  const massFactor = clamp(totalMass / (event.primaryMass + event.secondaryMass), 0.6, 1.6)
  let phase = 0

  return Array.from({ length: samples }, (_, index) => {
    const progress = index / (samples - 1)
    const t = progress * duration
    const chirpShape = progress < 0.86
      ? Math.pow(progress / 0.86, 2.2)
      : Math.exp(-(progress - 0.86) * 18)
    const envelope = modeledPeak * chirpShape
    const frequency = 20 + (event.peakFrequencyHz * massFactor - 20) * Math.pow(progress, 1.9)

    phase += (2 * Math.PI * frequency * duration) / samples

    return {
      time: Number(t.toFixed(duration < 1 ? 3 : 2)),
      strain: envelope * Math.sin(phase),
      envelope,
      frequency: Number(frequency.toFixed(1)),
    }
  })
}

function buildPhaseMarkers(waveform: ReturnType<typeof buildWaveform>) {
  const points = [
    { label: "İnspiral", progress: 0.28, phase: "Inspiral" },
    { label: "Birleşme", progress: 0.84, phase: "Merger" },
    { label: "Ringdown", progress: 0.94, phase: "Ringdown" },
  ]

  return points.map((point) => {
    const index = Math.min(waveform.length - 1, Math.round(point.progress * (waveform.length - 1)))
    return {
      x: waveform[index].time,
      y: waveform[index].strain,
      label: point.label,
      phase: point.phase,
    }
  })
}

function buildComparisonData() {
  return GW_EVENTS.map((event) => ({
    event: event.name,
    distance: event.luminosityDistanceMpc,
    chirpMass: Number(event.chirpMass.toFixed(2)),
  }))
}

export function GravitationalWaveDataPanel({
  selectedEvent,
  massScale,
  distanceScale,
  compact = false,
}: {
  selectedEvent: EventRecord
  massScale: number
  distanceScale: number
  compact?: boolean
}) {
  const waveform = useMemo(
    () => buildWaveform(selectedEvent, massScale, distanceScale),
    [selectedEvent, massScale, distanceScale]
  )
  const phaseMarkers = useMemo(() => buildPhaseMarkers(waveform), [waveform])
  const comparisonData = useMemo(() => buildComparisonData(), [])
  const latestPoint = waveform[waveform.length - 1]
  const peakEnvelope = Math.max(...waveform.map((point) => point.envelope))

  if (compact) {
    return (
      <div className="h-full space-y-3 overflow-y-auto p-3 text-sm">
        <Card className="border-border/50 bg-background/80">
          <CardHeader className="px-3 py-2">
            <CardTitle className="flex items-center gap-1.5 text-xs text-emerald-400">
              <AudioWaveform className="h-3.5 w-3.5" />
              Live Physics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3 text-xs">
            <MetricRow label="Peak modeled strain" value={peakEnvelope.toExponential(2)} />
            <MetricRow label="Latest frequency" value={`${latestPoint.frequency.toFixed(1)} Hz`} />
            <MetricRow label="Scaled distance" value={`${(selectedEvent.luminosityDistanceMpc * distanceScale).toFixed(0)} Mpc`} />
            <MetricRow label="Scaled total mass" value={`${((selectedEvent.primaryMass + selectedEvent.secondaryMass) * massScale).toFixed(2)} M☉`} />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/80">
          <CardHeader className="px-3 py-2">
            <CardTitle className="flex items-center gap-1.5 text-xs text-cyan-400">
              <Orbit className="h-3.5 w-3.5" />
              Phase Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            {phaseMarkers.map((marker) => (
              <div key={marker.phase} className="rounded-lg border border-border/50 bg-muted/20 p-2 text-xs">
                <div className="mb-1 flex items-center justify-between">
                  <Badge variant="outline">{marker.label}</Badge>
                  <span className="font-mono text-muted-foreground">{marker.x}s</span>
                </div>
                <div className="text-muted-foreground">
                  {marker.phase === "Inspiral" && "Frekans ve genlik birlikte artar."}
                  {marker.phase === "Merger" && "Maksimum strain bölgesi."}
                  {marker.phase === "Ringdown" && "Yeni kalıntı kararlı moda söner."}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/80">
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-xs text-purple-400">Core Relation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-3 pb-3 text-xs text-muted-foreground">
            <div className="rounded-lg bg-muted/30 p-3">
              <MathDisplay formula="h \propto \frac{\mathcal{M}^{5/3} f^{2/3}}{D_L}" block />
            </div>
            <p>Strain genliği chirp kütlesi ve frekansla artar, uzaklıkla azalır.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dalga Formu</CardTitle>
          <CardDescription>Seçili olaya göre türetilmiş chirp sinyali</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <MetricBox label="Seçili olay" value={selectedEvent.name} hint={selectedEvent.sourceType} />
            <MetricBox label="Peak modeled strain" value={peakEnvelope.toExponential(2)} hint="Ölçek uygulanmış" />
            <MetricBox label="Son frekans örneği" value={`${latestPoint.frequency.toFixed(1)} Hz`} hint="Chirp modeli" />
          </div>

          <ChartContainer config={waveformChartConfig} className="h-[360px] w-full">
            <LineChart data={waveform} margin={{ left: 8, right: 8, top: 12, bottom: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} label={{ value: "Zaman (s)", position: "insideBottom", offset: -4 }} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => Number(value).toExponential(1)} width={68} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={() => "Örnek"} />} />
              <Line type="monotone" dataKey="strain" stroke="var(--color-strain)" strokeWidth={2.25} dot={false} name="Strain" />
              <Line type="monotone" dataKey="envelope" stroke="var(--color-envelope)" strokeWidth={1.4} dot={false} strokeDasharray="4 4" name="Envelope" />
              <Scatter data={phaseMarkers} fill="oklch(0.88 0.13 90)" name="Faz işaretleri" />
            </LineChart>
          </ChartContainer>

          <div className="grid gap-4 md:grid-cols-3">
            {phaseMarkers.map((marker) => (
              <div key={marker.phase} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{marker.label}</Badge>
                  <span className="text-xs text-muted-foreground">{marker.x}s</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {marker.phase === "Inspiral" && "Frekans ve genlik birlikte yükselirken kaynak enerji kaybederek içeri sarmalanır."}
                  {marker.phase === "Merger" && "Maksimum strain bölgesi; iki kompakt cisim tek bir remnant oluşturur."}
                  {marker.phase === "Ringdown" && "Yeni oluşan kalıntı kararlı geometriye sönümlenerek yaklaşır."}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Olay Kataloğu</CardTitle>
            <CardDescription>Resmi GWOSC parametrelerinden özet tablo</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Olay</th>
                  <th className="px-4 py-3 font-medium">M1 / M2</th>
                  <th className="px-4 py-3 font-medium">Uzaklık</th>
                  <th className="px-4 py-3 font-medium">SNR</th>
                </tr>
              </thead>
              <tbody>
                {GW_EVENTS.map((event) => (
                  <tr key={event.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <div className="font-medium">{event.name}</div>
                      <div className="text-xs text-muted-foreground">{event.sourceType}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{event.primaryMass} / {event.secondaryMass} M☉</td>
                    <td className="px-4 py-3">{event.luminosityDistanceMpc} Mpc</td>
                    <td className="px-4 py-3">{event.networkSnr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Olay dağılımı</CardTitle>
            <CardDescription>Uzaklık ve chirp kütlesi birlikte okunur</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={comparisonChartConfig} className="h-[260px] w-full">
              <ScatterChart margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="distance" name="Uzaklık" type="number" tickFormatter={(value) => `${value}`} />
                <YAxis dataKey="chirpMass" name="Chirp kütlesi" type="number" tickFormatter={(value) => `${value}`} width={54} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={() => "Resmi olay"} />} cursor={false} />
                <Scatter data={comparisonData} fill="var(--color-distance)" />
              </ScatterChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bilimsel çerçeve</CardTitle>
          <CardDescription>Sayfadaki modelin dayandığı fizik</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-xl bg-muted/35 p-4">
            <MathDisplay formula="g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}, \quad |h_{\mu\nu}| \ll 1" block />
          </div>
          <p>Zayıf alan limitinde kütleçekim dalgaları, düz uzay-zaman metrik tensörüne eklenen küçük pertürbasyonlar olarak modellenir.</p>
          <Separator />
          <div className="rounded-xl bg-muted/35 p-4">
            <MathDisplay formula="f(t)\uparrow \Rightarrow h(t)\uparrow \Rightarrow \text{chirp}" block />
          </div>
          <p>Birleşmeye yaklaşan kompakt ikili sistemler enerji kaybettikçe yörünge yarıçapı küçülür, bu yüzden hem frekans hem genlik yükselir.</p>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricBox({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-2 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}
