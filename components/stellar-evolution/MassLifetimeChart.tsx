"use client"

/**
 * @fileoverview Kütle-Ömür ve HR Diyagramı Grafikleri
 * Recharts tabanlı interaktif bilimsel grafikler.
 *
 * NOT: Recharts'ta shape prop'una <Element /> (JSX elementi) geçmek,
 * tüm data alanlarını DOM'a iletir ve React uyarısına yol açar.
 * Bunun yerine her zaman fonksiyon referansı kullanılmalıdır: shape={Fn}
 */

import React, { useMemo } from "react"
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { StellarEvolutionResult, StellarPhase } from "@/types/stellarResult"
import { buildMassLifetimeCurve } from "@/lib/stellarTimeline"

interface MassLifetimeChartProps {
  result: StellarEvolutionResult
}

// ─────────────────────────────────────────────────────────────────────────────
// ÖZEL SCATTER ŞEKİLLERİ
// Fonksiyon olarak tanımlanmalı — JSX elementi olarak DEĞİL.
// Recharts shape={Fn} şeklinde geçildiğinde sadece cx/cy/payload alır,
// shape={<Fn />} şeklinde geçildiğinde ise tüm data alanları DOM'a iletilir.
// ─────────────────────────────────────────────────────────────────────────────

/** Recharts ScatterCustomizedShape parametre tipi */
type RawShapeProps = {
  cx?: number
  cy?: number
  payload?: Record<string, unknown>
  [key: string]: unknown
}

/** Recharts'ın beklediği shape imzası: (props: unknown) => Element */
type ShapeFn = (props: unknown) => React.ReactElement

/** Recharts'tan gelen unknown props'u güvenle cast eder */
function asShapeProps(p: unknown): RawShapeProps {
  return (p ?? {}) as RawShapeProps
}

/** Referans yıldız noktası — düz daire */
const ReferenceDot: ShapeFn = (p) => {
  const { cx = 0, cy = 0 } = asShapeProps(p)
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="hsl(var(--primary))"
      fillOpacity={0.7}
      stroke="none"
    />
  )
}

/** Kullanıcı yıldızı — yıldız çokgeni */
const StarDot: ShapeFn = (p) => {
  const { cx = 0, cy = 0 } = asShapeProps(p)
  const pts = [
    `${cx},${cy - 9}`,
    `${cx + 3},${cy - 3}`,
    `${cx + 9},${cy - 3}`,
    `${cx + 4},${cy + 2}`,
    `${cx + 6},${cy + 9}`,
    `${cx},${cy + 5}`,
    `${cx - 6},${cy + 9}`,
    `${cx - 4},${cy + 2}`,
    `${cx - 9},${cy - 3}`,
    `${cx - 3},${cy - 3}`,
  ].join(" ")
  return (
    <polygon
      points={pts}
      fill="hsl(var(--destructive))"
      stroke="white"
      strokeWidth={0.5}
    />
  )
}

/** HR diyagramı evrim noktası — fazın rengini kullanır */
const HRDot: ShapeFn = (p) => {
  const { cx = 0, cy = 0, payload } = asShapeProps(p)
  const color = (payload?.color as string) ?? "hsl(var(--primary))"
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="rgba(255,255,255,0.3)"
      strokeWidth={1}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA BİLEŞEN
// ─────────────────────────────────────────────────────────────────────────────

export function MassLifetimeChart({ result }: MassLifetimeChartProps) {
  const curve = useMemo(() => buildMassLifetimeCurve(), [])

  const userPoint = useMemo(
    () => ({
      massSolar: result.inputMass,
      mainSequenceLifetimeGyr: result.mainSequenceLifetimeGyr,
      name: "Hesaplanan Yıldız",
    }),
    [result.inputMass, result.mainSequenceLifetimeGyr]
  )

  const hrTrack = useMemo(
    () =>
      result.hrDiagramTrack.map(p => ({
        x: p.logTemperature,
        y: p.logLuminosity,
        phase: p.phase,
        color: p.color,
      })),
    [result.hrDiagramTrack]
  )

  return (
    <Tabs defaultValue="mass-lifetime">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="mass-lifetime" className="text-xs sm:text-sm">
          Kütle — Ömür
        </TabsTrigger>
        <TabsTrigger value="hr-diagram" className="text-xs sm:text-sm">
          HR Diyagramı
        </TabsTrigger>
      </TabsList>

      {/* KÜTLE — ÖMÜR */}
      <TabsContent value="mass-lifetime">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">
              Kütle — Ana Dizi Ömrü İlişkisi
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              t_MS ≈ (M/L) × t_☉ · Kırmızı yıldız: hesaplanan yıldızınız
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    type="number"
                    dataKey="massSolar"
                    name="Kütle"
                    scale="log"
                    domain={[0.08, 150]}
                    label={{
                      value: "Kütle (M☉) — log ölçek",
                      position: "insideBottom",
                      offset: -15,
                      fontSize: 10,
                    }}
                    tick={{ fontSize: 10 }}
                    tickFormatter={v =>
                      v >= 10 ? `${v.toFixed(0)}` : `${v.toFixed(1)}`
                    }
                  />
                  <YAxis
                    type="number"
                    dataKey="mainSequenceLifetimeGyr"
                    name="Ömür"
                    scale="log"
                    domain={[0.001, 20000]}
                    label={{
                      value: "Ömür (Gyr)",
                      angle: -90,
                      position: "insideLeft",
                      offset: 15,
                      fontSize: 10,
                    }}
                    tick={{ fontSize: 10 }}
                    tickFormatter={v =>
                      v >= 1000
                        ? `${(v / 1000).toFixed(0)}T`
                        : v >= 1
                        ? `${v.toFixed(0)}G`
                        : `${(v * 1000).toFixed(0)}M`
                    }
                    width={40}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload
                        return (
                          <div className="bg-background border rounded p-2 shadow-lg text-xs space-y-1 max-w-[180px]">
                            <p className="font-bold">
                              {d.name ?? `${d.massSolar} M☉`}
                            </p>
                            <p>Kütle: {d.massSolar} M☉</p>
                            <p>
                              Ana Dizi:{" "}
                              {d.mainSequenceLifetimeGyr >= 1000
                                ? `${(d.mainSequenceLifetimeGyr / 1000).toFixed(2)} Tyr`
                                : d.mainSequenceLifetimeGyr >= 1
                                ? `${d.mainSequenceLifetimeGyr.toFixed(2)} Gyr`
                                : `${(d.mainSequenceLifetimeGyr * 1000).toFixed(0)} Myr`}
                            </p>
                            {d.remnantType && <p>Kalıntı: {d.remnantType}</p>}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    iconSize={10}
                  />

                  <ReferenceLine
                    x={1}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                    label={{ value: "M☉", position: "top", fontSize: 9 }}
                  />
                  <ReferenceLine
                    y={10}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                    label={{ value: "t☉", position: "right", fontSize: 9 }}
                  />

                  {/* Referans eğrisi — fonksiyon referansı ile geçilmeli */}
                  <Scatter
                    name="Referans Yıldızları"
                    data={curve}
                    shape={ReferenceDot}
                  />

                  {/* Kullanıcı yıldızı */}
                  <Scatter
                    name="Hesaplanan Yıldız"
                    data={[userPoint]}
                    shape={StarDot}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 p-3 bg-muted/30 rounded text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-semibold">Model:</span>{" "}
                t_MS = t_☉ × (M/L) · L ∝ M³·⁵ → t_MS ∝ M⁻²·⁵
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* HR DİYAGRAMI */}
      <TabsContent value="hr-diagram">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">
              Hertzsprung-Russell Diyagramı
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Evrim yolu · Sıcak (sol) → Soğuk (sağ)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="log T"
                    domain={[3.4, 5.2]}
                    reversed
                    tick={{ fontSize: 10 }}
                    label={{
                      value: "Log₁₀(T [K])  sıcak ← → soğuk",
                      position: "insideBottom",
                      offset: -15,
                      fontSize: 10,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="log L"
                    domain={[-4, 8]}
                    tick={{ fontSize: 10 }}
                    label={{
                      value: "Log₁₀(L/L☉)",
                      angle: -90,
                      position: "insideLeft",
                      offset: 15,
                      fontSize: 10,
                    }}
                    width={40}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload
                        return (
                          <div className="bg-background border rounded p-2 shadow-lg text-xs space-y-1 max-w-[180px]">
                            <p className="font-bold">{d.phase}</p>
                            <p>T ≈ {Math.round(Math.pow(10, d.x)).toLocaleString()} K</p>
                            <p>L ≈ {Math.pow(10, d.y).toFixed(2)} L☉</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />

                  <ReferenceLine
                    x={Math.log10(5778)}
                    stroke="gold"
                    strokeDasharray="3 3"
                    label={{ value: "T☉", position: "top", fontSize: 9, fill: "gold" }}
                  />
                  <ReferenceLine
                    y={0}
                    stroke="gold"
                    strokeDasharray="3 3"
                    label={{ value: "L☉", position: "right", fontSize: 9, fill: "gold" }}
                  />

                  <Scatter
                    name="Evrim Yolu"
                    data={hrTrack}
                    shape={HRDot}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <HRLegend phases={result.phases} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HR AÇIKLAMA SATIRI
// ─────────────────────────────────────────────────────────────────────────────

function HRLegend({ phases }: { phases: StellarPhase[] }) {
  const visible = phases.filter(p => p.temperatureK > 0)
  return (
    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
      {visible.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className="size-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-xs text-muted-foreground">{p.name}</span>
        </div>
      ))}
    </div>
  )
}
