"use client"

import React, { useState, useCallback } from "react"
import { StarInputForm } from "@/components/stellar-evolution/StarInputForm"
import { StarResults } from "@/components/stellar-evolution/StarResults"
import { EvolutionTimeline } from "@/components/stellar-evolution/EvolutionTimeline"
import { MassLifetimeChart } from "@/components/stellar-evolution/MassLifetimeChart"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, FlaskConical } from "lucide-react"
import type { StarInput } from "@/types/star"
import type { StellarEvolutionResult } from "@/types/stellarResult"

export default function SimulatorPage() {
  const [result, setResult] = useState<StellarEvolutionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSimulate = useCallback(async (input: StarInput) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/stellar-evolution/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error ?? `HTTP ${response.status}`)
      }
      setResult(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-6 space-y-5">
      {/* Başlık */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <FlaskConical className="size-6 sm:size-7 text-primary shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            Yıldız Evrimi Simülatörü
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Parametreleri ayarlayıp simülasyonu başlatın — ömür, fazlar ve nihai
          kalıntı hesaplanacak.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/*
        Mobil: tek kolon (form üstte, sonuçlar altta)
        lg+: yan yana — form sabit 360px, sonuçlar esnek
      */}
      <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
        {/* Sol: Form */}
        <div className="min-w-0">
          <StarInputForm onSimulate={handleSimulate} isLoading={isLoading} />
        </div>

        {/* Sağ: Sonuçlar */}
        <div className="min-w-0 space-y-5">
          {isLoading && <LoadingSkeleton />}

          {!isLoading && result && (
            <>
              <StarResults result={result} />
              <MassLifetimeChart result={result} />
              <EvolutionTimeline
                phases={result.phases}
                totalLifetimeGyr={result.totalLifetimeGyr}
              />
            </>
          )}

          {!isLoading && !result && <EmptyState />}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center space-y-3 text-muted-foreground border border-dashed border-border/50 rounded-xl">
      <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
        <FlaskConical className="size-8 opacity-40" />
      </div>
      <div className="space-y-1 px-4">
        <p className="font-medium">Simülasyon bekleniyor</p>
        <p className="text-sm max-w-xs mx-auto">
          Sol panelden bir yıldız seçin ve{" "}
          <span className="font-semibold text-foreground">Simülasyonu Başlat</span>'a tıklayın.
        </p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 w-full rounded-lg" />
      <Skeleton className="h-28 w-full rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  )
}
