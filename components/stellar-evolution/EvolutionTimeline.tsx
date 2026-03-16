"use client"

/**
 * @fileoverview Evrim Zaman Çizelgesi Bileşeni
 * Yıldızın her evrim fazını görsel olarak gösterir.
 */

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, Timer } from "lucide-react"
import type { StellarPhase } from "@/types/stellarResult"
import { formatLifetime, tempToColor } from "@/lib/stellarTimeline"

interface EvolutionTimelineProps {
  phases: StellarPhase[]
  totalLifetimeGyr: number
}

export function EvolutionTimeline({ phases, totalLifetimeGyr }: EvolutionTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  // Sonsuz fazları filtrele (görsel çubuk için)
  const finitePhases = phases.filter(p => isFinite(p.durationGyr) && p.durationGyr > 0)
  const totalFinite = finitePhases.reduce((s, p) => s + p.durationGyr, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Timer className="size-4" />
          Evrim Zaman Çizelgesi
        </CardTitle>
        <CardDescription>
          {phases.length} faz · Toplam izlenen ömür:{" "}
          <span className="font-semibold text-foreground">{formatLifetime(totalLifetimeGyr)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Yatay ilerleme çubuğu */}
        {finitePhases.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Süre Dağılımı (logaritmik)</p>
            <div className="flex h-4 rounded-full overflow-hidden gap-px">
              {finitePhases.map((phase, i) => {
                const pct = Math.max(
                  1,
                  (Math.log10(Math.max(1e-8, phase.durationGyr) + 1) /
                    Math.log10(totalFinite + 1)) *
                    100
                )
                return (
                  <div
                    key={i}
                    style={{ width: `${pct}%`, backgroundColor: phase.color }}
                    className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    title={phase.name}
                    onClick={() => setExpandedIndex(i === expandedIndex ? null : i)}
                  />
                )
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* Faz listesi */}
        <div className="space-y-2">
          {phases.map((phase, index) => (
            <PhaseRow
              key={index}
              phase={phase}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FAZ SATIRI BİLEŞENİ
// ─────────────────────────────────────────────────────────────────────────────

interface PhaseRowProps {
  phase: StellarPhase
  index: number
  isExpanded: boolean
  onToggle: () => void
}

function PhaseRow({ phase, index, isExpanded, onToggle }: PhaseRowProps) {
  const isInstantaneous = phase.durationGyr < 1e-5
  const isEternal = !isFinite(phase.durationGyr)

  return (
    <div
      className="rounded-lg border border-border/50 overflow-hidden transition-all"
      style={{ borderLeftColor: phase.color, borderLeftWidth: "3px" }}
    >
      {/* Başlık satırı */}
      <button
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
        onClick={onToggle}
      >
        {/* Renkli daire */}
        <div
          className="size-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-background"
          style={{ backgroundColor: phase.color }}
        >
          {index + 1}
        </div>

        {/* Faz bilgisi */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold truncate">{phase.name}</span>
            {isInstantaneous && (
              <Badge variant="destructive" className="text-xs">Anlık</Badge>
            )}
            {isEternal && (
              <Badge variant="secondary" className="text-xs">Sonsuz</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {!isInstantaneous && !isEternal && (
              <span>Süre: {formatLifetime(phase.durationGyr)}</span>
            )}
            {!isEternal && (
              <span className="ml-2">
                · Başlangıç: {formatLifetime(phase.startGyr)}
              </span>
            )}
          </div>
        </div>

        {/* Sıcaklık — yalnızca sm+ ekranlarda göster */}
        <div className="text-right flex-shrink-0 hidden sm:block">
          {phase.temperatureK > 0 && (
            <span
              className="text-xs font-mono font-semibold"
              style={{ color: tempToColor(phase.temperatureK) }}
            >
              {formatTemperature(phase.temperatureK)}
            </span>
          )}
        </div>

        {isExpanded ? (
          <ChevronUp className="size-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Genişletilmiş detay */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 bg-muted/10">
          <Separator />

          {/* Fiziksel özellikler */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat
              label="Sıcaklık"
              value={phase.temperatureK > 0 ? `${phase.temperatureK.toLocaleString()} K` : "—"}
            />
            <MiniStat
              label="Parlaklık"
              value={phase.luminositySolar > 0 ? formatLum(phase.luminositySolar) : "—"}
            />
            <MiniStat
              label="Yarıçap"
              value={phase.radiusSolar > 0 ? `${phase.radiusSolar.toFixed(2)} R☉` : "—"}
            />
          </div>

          {/* Füzyon süreci */}
          <div className="bg-muted/40 rounded p-2">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Enerji Üretimi</p>
            <p className="text-xs font-mono">{phase.fusionProcess}</p>
          </div>

          {/* Açıklama */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {phase.description}
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MİNİ İSTATİSTİK BİLEŞENİ
// ─────────────────────────────────────────────────────────────────────────────

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xs font-semibold font-mono mt-0.5">{value}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT YARDIMCILARI
// ─────────────────────────────────────────────────────────────────────────────

function formatTemperature(k: number): string {
  if (k >= 1e9) return `${(k / 1e9).toFixed(1)} GK`
  if (k >= 1e6) return `${(k / 1e6).toFixed(1)} MK`
  if (k >= 1e4) return `${(k / 1000).toFixed(0)}k K`
  return `${k.toLocaleString()} K`
}

function formatLum(l: number): string {
  if (l >= 1e10) return `${(l / 1e10).toFixed(1)}×10¹⁰ L☉`
  if (l >= 1e6)  return `${(l / 1e6).toFixed(1)}×10⁶ L☉`
  if (l >= 1000) return `${(l / 1000).toFixed(1)}k L☉`
  if (l >= 1)    return `${l.toFixed(2)} L☉`
  return `${(l * 1000).toFixed(3)} mL☉`
}
