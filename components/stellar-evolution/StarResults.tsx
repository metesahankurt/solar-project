"use client"

/**
 * @fileoverview Simülasyon Sonuçları Paneli
 * ZAMS özellikleri, ömür özeti ve nihai kalıntı bilgilerini gösterir.
 */

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Zap, Star, Clock, Atom } from "lucide-react"
import type { StellarEvolutionResult } from "@/types/stellarResult"
import { formatLifetime } from "@/lib/stellarTimeline"

interface StarResultsProps {
  result: StellarEvolutionResult
}

export function StarResults({ result }: StarResultsProps) {
  const { zamsProperties, finalRemnant, willExplodeAsSupernovaOrHypernova } = result

  const remnantColor = getRemnantColor(finalRemnant)
  const spectralColor = getSpectralColor(zamsProperties.surfaceTemperatureK)

  return (
    <div className="space-y-4">
      {/* Supernova Uyarısı */}
      {willExplodeAsSupernovaOrHypernova && (
        <Alert variant="destructive" className="border-orange-500/50 bg-orange-500/10">
          <Zap className="size-4" />
          <AlertTitle>
            {result.supernovaType === "Pair Instability"
              ? "Çift Kararlılık Süpernovası"
              : result.supernovaType === "Hypernova"
              ? "Hipernova Patlaması"
              : `Süpernova — ${result.supernovaType}`}
          </AlertTitle>
          <AlertDescription>
            Bu yıldız yaşamının sonunda şiddetli bir patlama ile sona erecek.
            {result.supernovaType === "Pair Instability" &&
              " Yıldız tamamen parçalanır — geriye kalıntı kalmaz."}
          </AlertDescription>
        </Alert>
      )}

      {/* Temel Özellikler */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="size-4" />
            ZAMS Fiziksel Özellikleri
          </CardTitle>
          <CardDescription>
            Sıfır Yaş Ana Dizisi başlangıç koşulları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatBox
              label="Kütle"
              value={`${result.inputMass.toFixed(2)} M☉`}
            />
            <StatBox
              label="Parlaklık"
              value={formatLuminosity(zamsProperties.luminositySolar)}
            />
            <StatBox
              label="Yarıçap"
              value={`${zamsProperties.radiusSolar.toFixed(2)} R☉`}
            />
            <StatBox
              label="Yüzey Sıcaklığı"
              value={`${zamsProperties.surfaceTemperatureK.toLocaleString()} K`}
              valueStyle={{ color: spectralColor }}
            />
          </div>

          <Separator className="my-3" />

          <div className="flex flex-wrap gap-2 items-center">
            <Badge className="font-mono" style={{ backgroundColor: spectralColor + "33", color: spectralColor, border: `1px solid ${spectralColor}66` }}>
              {zamsProperties.morganKeenanClass}
            </Badge>
            <Badge variant="outline">B-V = {zamsProperties.colorIndexBV}</Badge>
            <Badge variant="outline">M_V = {zamsProperties.absoluteMagnitude}</Badge>
          </div>

          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            {zamsProperties.comparedToSun}
          </p>
        </CardContent>
      </Card>

      {/* Ömür Özeti */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4" />
            Ömür Özeti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Ana Dizi Ömrü</span>
              <span className="font-mono font-semibold text-sm">
                {formatLifetime(result.mainSequenceLifetimeGyr)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Toplam Yıldız Ömrü</span>
              <span className="font-mono font-semibold text-sm">
                {formatLifetime(result.totalLifetimeGyr)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Evrim Fazı Sayısı</span>
              <span className="font-mono font-semibold text-sm">
                {result.phases.length} faz
              </span>
            </div>
          </div>

          {/* Düzeltme faktörleri */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Uygulanan Düzeltmeler</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Metaliklik Düzeltmesi</span>
              <span className="font-mono">{result.metallicityCorrection.toFixed(4)}×</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Dönüş Düzeltmesi</span>
              <span className="font-mono">{result.rotationCorrection.toFixed(4)}×</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nihai Kalıntı */}
      <Card style={{ borderColor: remnantColor + "66" }}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Atom className="size-4" />
            Nihai Stellar Kalıntı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: remnantColor + "15" }}>
            <div
              className="size-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ backgroundColor: remnantColor + "30", border: `2px solid ${remnantColor}` }}
            >
              {getRemnantEmoji(finalRemnant)}
            </div>
            <div>
              <div className="font-bold" style={{ color: remnantColor }}>
                {getRemnantTurkishName(finalRemnant)}
              </div>
              <div className="text-xs text-muted-foreground">{finalRemnant}</div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.finalRemnantDescription}
          </p>

          <div className="text-xs text-muted-foreground/60 text-right">
            Model v{result.modelVersion} · {new Date(result.calculatedAt).toLocaleTimeString("tr-TR")}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// YARDIMCI BILEŞEN: İstatistik Kutusu
// ─────────────────────────────────────────────────────────────────────────────

function StatBox({
  label,
  value,
  valueStyle,
}: {
  label: string
  value: string
  valueStyle?: React.CSSProperties
}) {
  return (
    <div className="bg-muted/40 rounded-lg p-3 text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-bold font-mono" style={valueStyle}>{value}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────────────────────────────────────────

import type { StellarRemnantType } from "@/types/stellarResult"

function getRemnantColor(remnant: StellarRemnantType): string {
  switch (remnant) {
    case "Brown Dwarf":                return "#8B4513"
    case "Red Dwarf":                  return "#FF4500"
    case "White Dwarf":                return "#E0E0FF"
    case "Neutron Star":               return "#87CEEB"
    case "Stellar Black Hole":         return "#9400D3"
    case "Intermediate Mass Black Hole": return "#FF1493"
  }
}

function getRemnantTurkishName(remnant: StellarRemnantType): string {
  switch (remnant) {
    case "Brown Dwarf":                return "Kahverengi Cüce"
    case "Red Dwarf":                  return "Kırmızı Cüce (Uzun Ömürlü)"
    case "White Dwarf":                return "Beyaz Cüce"
    case "Neutron Star":               return "Nötron Yıldızı"
    case "Stellar Black Hole":         return "Yıldızsökel Kara Delik"
    case "Intermediate Mass Black Hole": return "Orta Kütleli Kara Delik"
  }
}

function getRemnantEmoji(remnant: StellarRemnantType): string {
  switch (remnant) {
    case "Brown Dwarf":                return "🟤"
    case "Red Dwarf":                  return "🔴"
    case "White Dwarf":                return "⬜"
    case "Neutron Star":               return "💠"
    case "Stellar Black Hole":         return "⚫"
    case "Intermediate Mass Black Hole": return "🌀"
  }
}

function getSpectralColor(tempK: number): string {
  if (tempK >= 30000) return "#9BB0FF"
  if (tempK >= 10000) return "#AABFFF"
  if (tempK >= 7500)  return "#CAD7FF"
  if (tempK >= 6000)  return "#FFF4EA"
  if (tempK >= 5200)  return "#FFD700"
  if (tempK >= 3700)  return "#FFA500"
  return "#FF6347"
}

function formatLuminosity(lSolar: number): string {
  if (lSolar >= 1e6)  return `${(lSolar / 1e6).toFixed(2)} × 10⁶ L☉`
  if (lSolar >= 1000) return `${(lSolar / 1000).toFixed(2)} × 10³ L☉`
  if (lSolar >= 1)    return `${lSolar.toFixed(2)} L☉`
  return `${(lSolar * 1000).toFixed(3)} mL☉`
}
