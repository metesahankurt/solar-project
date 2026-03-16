"use client"

import { type ReactNode, useState } from "react"
import Link from "next/link"
import { ArrowRight, Binary, Gauge, Radar, Waves } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GravitationalWaveControls } from "@/components/gravitational-wave-simulator/gravitational-wave-controls"
import { GravitationalWaveDataPanel } from "@/components/gravitational-wave-simulator/gravitational-wave-data-panel"
import { GW_EVENTS } from "@/lib/gravitationalWaveData"

function StatCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function GravitationalWaveLab() {
  const [selectedEventId, setSelectedEventId] = useState(GW_EVENTS[0].id)
  const [massScale, setMassScale] = useState([1])
  const [distanceScale, setDistanceScale] = useState([1])
  const selectedEvent = GW_EVENTS.find((event) => event.id === selectedEventId) ?? GW_EVENTS[0]

  return (
    <div className="container mx-auto px-4 md:px-8 space-y-10 py-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(250,204,21,0.16),_transparent_34%),linear-gradient(180deg,_rgba(3,7,18,0.94),_rgba(5,10,20,0.98))] px-6 py-10 text-white shadow-2xl shadow-emerald-950/20 sm:px-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.08)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-emerald-400/30 bg-emerald-400/10 text-emerald-100">
                LIGO / Virgo / GWOSC resmi parametreleri
              </Badge>
              <Badge variant="outline" className="border-white/15 bg-white/5 text-white/85">
                Chirp wave + spacetime grid
              </Badge>
            </div>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Gravitational Wave Simülasyonu
              </h1>
              <p className="max-w-3xl text-base leading-7 text-white/75 sm:text-lg">
                Einstein alan denklemlerinden çıkan gerinim sinyalini, gerçek tespit olaylarının
                kütle ve uzaklık parametreleriyle görselleştiren deneysel bir laboratuvar.
                Olay verileri resmi GWOSC yayınlarından, dalga formu ise bu verilerden türetilmiş
                eğitim amaçlı bir modelden üretilir.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-emerald-500 text-black hover:bg-emerald-400">
                <Link href="/gravitational-wave/simulation">
                  3D Simülasyonu Aç
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href={selectedEvent.sourceUrl} target="_blank" rel="noreferrer">
                  Kaynağı Gör
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="text-white/60">Öne çıkan olay</CardDescription>
              <CardTitle className="text-2xl">{selectedEvent.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <HeroMetricBox label="Birincil kütle" value={`${selectedEvent.primaryMass} M☉`} />
                <HeroMetricBox label="İkincil kütle" value={`${selectedEvent.secondaryMass} M☉`} />
                <HeroMetricBox label="Uzaklık" value={`${selectedEvent.luminosityDistanceMpc} Mpc`} />
                <HeroMetricBox label="Peak strain" value={selectedEvent.peakStrain.toExponential(2)} />
              </div>
              <p className="text-white/65">{selectedEvent.sourceType}. Sağdaki slider ve event seçimiyle senaryoyu değiştir.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Waves className="size-5" />}
          title="Strain h(t)"
          description="Detektör kol uzunluğundaki bağıl değişimi zaman alanında chirp sinyali olarak izlersin."
        />
        <StatCard
          icon={<Binary className="size-5" />}
          title="İkili Birleşme"
          description="İnspiral, merger ve ringdown fazları tek bir çizgide okunabilir hale gelir."
        />
        <StatCard
          icon={<Gauge className="size-5" />}
          title="SNR ve Uzaklık"
          description="Aynı olayın dedektörde neden daha güçlü ya da daha zayıf göründüğünü mesafe üzerinden test edersin."
        />
        <StatCard
          icon={<Radar className="size-5" />}
          title="Spacetime Grid"
          description="Kütleçekim dalgasının uzay-zamanda oluşturduğu periyodik sıkışma ve gerilme alanı görselleştirilir."
        />
      </section>

      <section id="gw-lab" className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
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
      </section>

      <section>
        <Card className="overflow-hidden border-emerald-500/20 bg-[linear-gradient(135deg,_rgba(16,185,129,0.08),_rgba(15,23,42,0.9))]">
          <CardHeader>
            <CardTitle>3D Simülasyon Ayrı Sayfada</CardTitle>
            <CardDescription>
              `wormhole/simulation` düzenine benzer biçimde tam ekran Canvas ve sağ kontrol paneli hazırlandı.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/gravitational-wave/simulation">
                Fullscreen GW Simulation
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function HeroMetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  )
}
