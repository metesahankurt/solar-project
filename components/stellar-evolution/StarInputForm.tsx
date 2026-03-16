"use client"

/**
 * @fileoverview Yıldız Parametreleri Giriş Formu
 * Kütle, metaliklik ve dönüş hızı girişlerini alır.
 */

import React, { useState, useCallback } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, RotateCcw } from "lucide-react"
import type { StarInput, MetallicityPreset, RotationClass } from "@/types/star"
import { DEFAULT_STAR_INPUT, metallicityFromPreset } from "@/types/star"
import { UNIVERSE_AGE_GYR } from "@/lib/stellarPhysics"

// ─────────────────────────────────────────────────────────────────────────────
// PRESET YILDIZLAR
// ─────────────────────────────────────────────────────────────────────────────

const STAR_PRESETS: Array<{
  label: string
  description: string
  input: Partial<StarInput>
  badge: string
  badgeVariant: "default" | "secondary" | "destructive" | "outline"
}> = [
  {
    label: "Proxima Cen.",
    description: "0.12 M☉ — Kırmızı Cüce",
    input: { mass: 0.12, metallicity: 0.0, rotationRate: 0.05 },
    badge: "M sınıfı",
    badgeVariant: "secondary",
  },
  {
    label: "Güneş",
    description: "1.0 M☉ — G-sınıfı yıldız",
    input: { mass: 1.0, metallicity: 0.0, rotationRate: 0.0 },
    badge: "G2V",
    badgeVariant: "default",
  },
  {
    label: "Sirius A",
    description: "2.0 M☉ — A-sınıfı yıldız",
    input: { mass: 2.0, metallicity: 0.05, rotationRate: 0.1 },
    badge: "A1V",
    badgeVariant: "default",
  },
  {
    label: "Spica",
    description: "10 M☉ — B-sınıfı dev",
    input: { mass: 10.0, metallicity: -0.1, rotationRate: 0.2 },
    badge: "B1V",
    badgeVariant: "outline",
  },
  {
    label: "Rigel",
    description: "21 M☉ — Mavi Süpergiant",
    input: { mass: 21.0, metallicity: -0.1, rotationRate: 0.15 },
    badge: "B8Ia",
    badgeVariant: "destructive",
  },
  {
    label: "R136a1",
    description: "~215 M☉ — Aşırı Kütleli",
    input: { mass: 215, metallicity: -0.3, rotationRate: 0.3 },
    badge: "WN5h",
    badgeVariant: "destructive",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// METALIKLIK PRESET ETIKETLERI
// ─────────────────────────────────────────────────────────────────────────────

const METALLICITY_PRESETS: Array<{ value: MetallicityPreset; label: string; feH: string }> = [
  { value: "pop_i",   label: "Popülasyon I  (Disk yıldızları)",     feH: "[Fe/H] ≈ 0.0" },
  { value: "pop_ii",  label: "Popülasyon II  (Küre küme yıldızları)", feH: "[Fe/H] ≈ -1.5" },
  { value: "pop_iii", label: "Popülasyon III  (İlk kuşak yıldızlar)", feH: "[Fe/H] ≈ -4.0" },
  { value: "custom",  label: "Özel — Kaydırıcıdan ayarla",           feH: "—" },
]

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface StarInputFormProps {
  onSimulate: (input: StarInput) => void
  isLoading: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function StarInputForm({ onSimulate, isLoading }: StarInputFormProps) {
  const [input, setInput] = useState<StarInput>(DEFAULT_STAR_INPUT)

  const updateField = useCallback(<K extends keyof StarInput>(key: K, value: StarInput[K]) => {
    setInput(prev => ({ ...prev, [key]: value }))
  }, [])

  const handlePreset = useCallback((partial: Partial<StarInput>) => {
    setInput(prev => ({ ...prev, ...partial }))
  }, [])

  const handleMetallicityPreset = useCallback((preset: MetallicityPreset) => {
    const feH = metallicityFromPreset(preset)
    setInput(prev => ({
      ...prev,
      metallicityPreset: preset,
      metallicity: preset !== "custom" ? feH : prev.metallicity,
    }))
  }, [])

  const handleReset = useCallback(() => {
    setInput(DEFAULT_STAR_INPUT)
  }, [])

  // Dönüş sınıfı etiketini güncelle
  const rotationClassFromRate = (rate: number): RotationClass => {
    if (rate < 0.1) return "slow"
    if (rate < 0.3) return "moderate"
    if (rate < 0.7) return "fast"
    return "critical"
  }

  // Tahmini ana dizi ömrü (ön izleme)
  const estimatedLifetime = input.mass > 0
    ? (UNIVERSE_AGE_GYR * Math.pow(input.mass, -2.5) * (1 / Math.pow(input.mass, 1.5))).toFixed(2)
    : "—"

  // Kütle rengi
  const massColor =
    input.mass < 0.45  ? "text-red-400" :
    input.mass < 2     ? "text-yellow-400" :
    input.mass < 8     ? "text-blue-300" :
    input.mass < 20    ? "text-blue-500" :
    "text-purple-400"

  return (
    <div className="space-y-4">
      {/* Preset Yıldızlar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Hızlı Seçim — Gerçek Yıldızlar</CardTitle>
          <CardDescription>Bilinen yıldızlardan birini seçerek başlayın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {STAR_PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset.input)}
                className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-border hover:bg-muted/60 transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-1 w-full">
                  <span className="text-xs font-semibold leading-tight">{preset.label}</span>
                  <Badge variant={preset.badgeVariant} className="text-[10px] px-1.5 shrink-0 leading-tight">{preset.badge}</Badge>
                </div>
                <span className="text-[11px] text-muted-foreground leading-tight">{preset.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kütle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Yıldız Kütlesi</CardTitle>
          <CardDescription>
            Ana simülasyon parametresi — yıldızın tüm evrimini belirler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Başlangıç Kütlesi</Label>
              <span className={`font-mono font-bold text-lg ${massColor}`}>
                {input.mass.toFixed(2)} M☉
              </span>
            </div>
            <Slider
              value={[input.mass]}
              min={0.08}
              max={150}
              step={0.01}
              onValueChange={([v]) => updateField("mass", v)}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>0.08 M☉</span>
              <span>150 M☉</span>
            </div>
          </div>

          <Separator />

          {/* Kategori ve tahmini ömür */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Kategori</div>
              <div className="text-sm font-semibold">
                {getMassCategory(input.mass)}
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Yaklaşık Ömür</div>
              <div className="text-sm font-semibold">
                {formatQuickLifetime(input.mass)} Gyr
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metaliklik */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Metaliklik</CardTitle>
          <CardDescription>
            Ağır element bolluğu — yıldızın yaşını ve popülasyonunu gösterir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={input.metallicityPreset}
            onValueChange={(v) => handleMetallicityPreset(v as MetallicityPreset)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Metaliklik ön ayarı seçin" />
            </SelectTrigger>
            <SelectContent>
              {METALLICITY_PRESETS.map(p => (
                <SelectItem key={p.value} value={p.value}>
                  <div className="flex flex-col">
                    <span>{p.label}</span>
                    <span className="text-xs text-muted-foreground">{p.feH}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {input.metallicityPreset === "custom" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>[Fe/H] Değeri</Label>
                <span className="font-mono text-sm">
                  {input.metallicity >= 0 ? "+" : ""}{input.metallicity.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[input.metallicity]}
                min={-4}
                max={0.5}
                step={0.05}
                onValueChange={([v]) => updateField("metallicity", v)}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>-4.0</span>
                <span>0.0 (Güneş)</span>
                <span>+0.5</span>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
            <strong>Seçili:</strong> [Fe/H] ={" "}
            {input.metallicity >= 0 ? "+" : ""}{input.metallicity.toFixed(2)} →{" "}
            Düzeltme çarpanı ≈{" "}
            {(1.0 + 0.15 * (-input.metallicity / 2.0)).toFixed(3)}×
          </div>
        </CardContent>
      </Card>

      {/* Dönüş Hızı */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dönüş Hızı</CardTitle>
          <CardDescription>
            Kritik dönüş hızının oranı — karışımı ve ömrü etkiler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>v / v_crit</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {rotationClassLabel(input.rotationRate)}
                </Badge>
                <span className="font-mono text-sm">
                  {(input.rotationRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <Slider
              value={[input.rotationRate]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={([v]) => {
                updateField("rotationRate", v)
                updateField("rotationClass", rotationClassFromRate(v))
              }}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100% (Kritik)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simülasyon Butonu */}
      <div className="flex gap-2">
        <Button
          onClick={() => onSimulate(input)}
          disabled={isLoading}
          className="flex-1"
          size="lg"
        >
          <Play className="size-4 mr-2" />
          {isLoading ? "Hesaplanıyor..." : "Simülasyonu Başlat"}
        </Button>
        <Button variant="outline" size="lg" onClick={handleReset}>
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────────────────────────────────────────

function getMassCategory(mass: number): string {
  if (mass < 0.08) return "Kahverengi Cüce"
  if (mass < 0.45) return "Kırmızı Cüce"
  if (mass < 2.0)  return "Düşük Kütleli"
  if (mass < 8.0)  return "Orta Kütleli"
  if (mass < 20)   return "Yüksek Kütleli"
  if (mass < 40)   return "Çok Yüksek Kütleli"
  return "Aşırı Kütleli"
}

function formatQuickLifetime(mass: number): string {
  if (mass < 0.08) return "∞"
  const t = 10 * Math.pow(mass, -2.5)
  if (t > 9999) return ">10,000"
  if (t >= 1)   return t.toFixed(2)
  return `${(t * 1000).toFixed(0)} Myr`
}

function rotationClassLabel(rate: number): string {
  if (rate < 0.1) return "Yavaş"
  if (rate < 0.3) return "Orta"
  if (rate < 0.7) return "Hızlı"
  return "Kritik Eşik"
}
