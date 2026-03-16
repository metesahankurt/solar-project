"use client"

import type { ReactNode } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface RaytracerParams {
  mass: number
  spin: number
  diskTemp: number
  diskDensity: number
  lensingStrength: number
  quality: number
}

interface ControlsProps {
  params: RaytracerParams
  onChange: (updates: Partial<RaytracerParams>) => void
  observerDistance?: number
  blackHoleVisibility?: number
}

function ControlSection({
  title,
  value,
  children,
  description,
}: {
  title: string
  value: string
  children: ReactNode
  description: string
}) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{title}</Label>
        <Badge variant="outline" className="border-white/10 bg-black/20 text-[11px] tabular-nums">
          {value}
        </Badge>
      </div>
      {children}
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
    </section>
  )
}

export function RaytracerControls({
  params,
  onChange,
  observerDistance,
  blackHoleVisibility,
}: ControlsProps) {
  const visibilityPercent = Math.round((blackHoleVisibility ?? 1) * 100)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-300/10 bg-gradient-to-br from-amber-400/10 via-white/[0.04] to-transparent px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Observer</div>
          <div className="mt-2 text-lg font-semibold tabular-nums">{observerDistance?.toFixed(1) ?? "9.8"} AU</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Scroll ile yaklaştıkça kara delik daha görünür olur.</div>
        </div>
        <div className="rounded-2xl border border-sky-300/10 bg-gradient-to-br from-sky-400/10 via-white/[0.04] to-transparent px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Visibility</div>
          <div className="mt-2 text-lg font-semibold tabular-nums">{visibilityPercent}%</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {visibilityPercent > 72 ? "Event horizon fully resolved" : visibilityPercent > 35 ? "Lensing emerging" : "Mostly blended into background"}
          </div>
        </div>
      </div>

      <ControlSection
        title="Geometry"
        value={`${params.mass.toFixed(2)} Rs`}
        description="Kara deliğin gölge boyutu ile akresyon diskinin iç kararlılık yarıçapını etkiler."
      >
        <Slider
          min={0.5}
          max={3.0}
          step={0.1}
          value={[params.mass]}
          onValueChange={([val]) => onChange({ mass: val })}
        />
      </ControlSection>

      <ControlSection
        title="Spin"
        value={params.spin.toFixed(2)}
        description="Kerr spin arttıkça frame dragging artar, prograde ISCO içeri kayar ve asimetri güçlenir."
      >
        <Slider
          min={0.0}
          max={0.99}
          step={0.01}
          value={[params.spin]}
          onValueChange={([val]) => onChange({ spin: val })}
        />
      </ControlSection>

      <div className="grid gap-4 md:grid-cols-1">
        <ControlSection
          title="Disk Temperature"
          value={params.diskTemp.toFixed(2)}
          description="İç disk spektrumunu beyaz-sarı ekseninde taşır; yüksek değerler daha sıcak termal parlaklık üretir."
        >
          <Slider
            min={0.5}
            max={2.5}
            step={0.1}
            value={[params.diskTemp]}
            onValueChange={([val]) => onChange({ diskTemp: val })}
          />
        </ControlSection>

        <ControlSection
          title="Disk Density"
          value={params.diskDensity.toFixed(2)}
          description="Plazma yoğunluğunu ve çizgisel disk görünürlüğünü ayarlar; çok yükseltmek fiziksel görünümü çamurlaştırır."
        >
          <Slider
            min={0.0}
            max={2.5}
            step={0.1}
            value={[params.diskDensity]}
            onValueChange={([val]) => onChange({ diskDensity: val })}
          />
        </ControlSection>
      </div>

      <ControlSection
        title="Curvature"
        value={params.lensingStrength.toFixed(2)}
        description="Işık sapmasını güçlendirir. Fazla yüksek değerler fiziksel görünüm yerine görsel abartı üretir."
      >
        <Slider
          min={0.6}
          max={1.8}
          step={0.05}
          value={[params.lensingStrength]}
          onValueChange={([val]) => onChange({ lensingStrength: val })}
        />
      </ControlSection>

      <section className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Render Quality</Label>
          <Badge
            variant={params.quality < 3 ? "secondary" : "default"}
            className={cn("border-white/10 bg-black/20 text-[11px]", params.quality >= 4 && "bg-white text-black")}
          >
            {params.quality <= 1 ? "Low" : params.quality <= 2 ? "Medium" : params.quality <= 3 ? "High" : "Ultra"}
          </Badge>
        </div>
        <Slider
          min={1}
          max={4}
          step={1}
          value={[params.quality]}
          onValueChange={([val]) => onChange({ quality: val })}
        />
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Raymarch adım sayısını artırır. Bilimsel preset için `Ultra` önerilir.
        </p>
      </section>
    </div>
  )
}
