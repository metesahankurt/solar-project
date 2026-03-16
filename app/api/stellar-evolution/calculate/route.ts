/**
 * @fileoverview Stellar Evolution API Route
 * POST /api/stellar-evolution/calculate
 *
 * Giriş parametrelerini doğrular, fizik motorunu çalıştırır ve
 * yapılandırılmış simülasyon sonucunu döndürür.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { StellarEvolutionResult } from "@/types/stellarResult"
import type { StarInput } from "@/types/star"
import {
  calcStellarProperties,
  calcMainSequenceLifetime,
  calcMetallicityCorrection,
  calcRotationCorrection,
} from "@/lib/stellarPhysics"
import {
  determineFinalRemnant,
  analyzeSupernova,
  describeRemnant,
} from "@/lib/stellarClassification"
import {
  buildEvolutionTimeline,
  buildHRTrack,
} from "@/lib/stellarTimeline"

// ─────────────────────────────────────────────────────────────────────────────
// GİRİŞ DOĞRULAMA ŞEMASI
// ─────────────────────────────────────────────────────────────────────────────

const StarInputSchema = z.object({
  mass: z
    .number()
    .min(0.01, "Kütle en az 0.01 M☉ olmalı")
    .max(300, "Kütle en fazla 300 M☉ olabilir"),
  metallicity: z
    .number()
    .min(-5, "[Fe/H] en az -5 olabilir")
    .max(0.5, "[Fe/H] en fazla +0.5 olabilir")
    .default(0),
  metallicityPreset: z
    .enum(["pop_i", "pop_ii", "pop_iii", "custom"])
    .default("pop_i"),
  rotationRate: z
    .number()
    .min(0, "Dönüş hızı negatif olamaz")
    .max(1, "Dönüş hızı 1.0'dan büyük olamaz (kritik eşik)")
    .default(0),
  rotationClass: z
    .enum(["slow", "moderate", "fast", "critical"])
    .default("slow"),
})

// ─────────────────────────────────────────────────────────────────────────────
// MODEL SÜRÜMÜ
// ─────────────────────────────────────────────────────────────────────────────

const MODEL_VERSION = "1.0.0"

// ─────────────────────────────────────────────────────────────────────────────
// API HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // Giriş doğrulama
    const parseResult = StarInputSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Geçersiz giriş parametreleri",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const input = parseResult.data as StarInput

    // Düzeltme çarpanlarını hesapla
    const metallicityCorrection = calcMetallicityCorrection(input.metallicity)
    const rotationCorrection = calcRotationCorrection(input.rotationRate)

    // Ana Dizi ömrü
    const mainSequenceLifetimeGyr = calcMainSequenceLifetime(
      input.mass,
      metallicityCorrection,
      rotationCorrection
    )

    // ZAMS fiziksel özellikleri
    const zamsProperties = calcStellarProperties(input.mass)

    // Nihai kalıntı
    const finalRemnant = determineFinalRemnant(input.mass, input.metallicity)
    const remnantDescription = describeRemnant(finalRemnant, input.mass)

    // Supernova analizi
    const supernovaAnalysis = analyzeSupernova(input.mass, input.metallicity)

    // Evrim fazları
    const phases = buildEvolutionTimeline(input)

    // Toplam ömür
    const totalLifetimeGyr = phases.reduce((sum, p) => {
      return isFinite(p.durationGyr) ? sum + p.durationGyr : sum
    }, 0)

    // HR diyagramı yolu
    const hrDiagramTrack = buildHRTrack(phases)

    // Sonuç oluştur
    const result: StellarEvolutionResult = {
      inputMass: input.mass,
      inputMetallicity: input.metallicity,
      inputRotationRate: input.rotationRate,
      zamsProperties,
      mainSequenceLifetimeGyr: parseFloat(mainSequenceLifetimeGyr.toFixed(4)),
      totalLifetimeGyr: parseFloat(totalLifetimeGyr.toFixed(4)),
      phases,
      finalRemnant,
      finalRemnantDescription: remnantDescription,
      willExplodeAsSupernovaOrHypernova: supernovaAnalysis.willExplode,
      supernovaType: supernovaAnalysis.type,
      metallicityCorrection: parseFloat(metallicityCorrection.toFixed(4)),
      rotationCorrection: parseFloat(rotationCorrection.toFixed(4)),
      hrDiagramTrack,
      calculatedAt: new Date().toISOString(),
      modelVersion: MODEL_VERSION,
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("[stellar-evolution/calculate] Hata:", error)
    return NextResponse.json(
      { error: "Simülasyon hesaplamasında sunucu hatası oluştu." },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stellar-evolution/calculate
 * API bilgisi ve örnek kullanım döndürür.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: "Stellar Evolution Calculator API",
    version: MODEL_VERSION,
    endpoint: "POST /api/stellar-evolution/calculate",
    description: "Yıldız kütlesi ve astrophysical parametrelerine göre evrim simülasyonu yapar.",
    parameters: {
      mass: "number — Yıldız kütlesi [M☉], aralık: 0.01–300",
      metallicity: "number — [Fe/H] metalikliği, aralık: -5 ile +0.5",
      metallicityPreset: "string — pop_i | pop_ii | pop_iii | custom",
      rotationRate: "number — v/v_crit oranı, aralık: 0–1",
      rotationClass: "string — slow | moderate | fast | critical",
    },
    example: {
      mass: 15,
      metallicity: 0.0,
      metallicityPreset: "pop_i",
      rotationRate: 0.1,
      rotationClass: "slow",
    },
  })
}
