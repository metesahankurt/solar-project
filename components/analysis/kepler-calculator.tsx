"use client"

import React, { useState, useMemo } from "react"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
} from "recharts"
import { planets } from "@/data/planets"

// Constants
const AU_TO_KM = 149597870.7

export function KeplerCalculator() {
  const [distance, setDistance] = useState<number>(1) // AU
  const [mass, setMass] = useState<number>(1) // Solar Masses

  // Kepler's Third Law: T^2 = r^3 / M (approximated for Solar System)
  // T in years, r in AU, M in Solar Masses
  const period = useMemo(() => {
    if (mass <= 0) return 0
    return Math.sqrt(Math.pow(distance, 3) / mass)
  }, [distance, mass])

  // Velocity approximation (circular orbit): v = sqrt(GM / r)
  // v = 2 * pi * r / T
  const velocity = useMemo(() => {
    if (period <= 0) return 0
    const circumference = 2 * Math.PI * distance * AU_TO_KM
    const hours = period * 365.25 * 24
    return circumference / (hours * 3600) // km/s
  }, [distance, period])

  // Prepare chart data
  // Real planets data
  const chartData = useMemo(() => {
    const realPlanets = planets.map(p => ({
      name: p.name,
      au: p.semiMajorAxis / 149.6e9, // Convert m to AU approx
      period: p.orbitalPeriod / (365.25 * 24 * 3600), // Convert s to Years approx
      type: "Real Planet",
      fill: "hsl(var(--primary))"
    })).sort((a, b) => a.au - b.au)

    // User calculated point
    const userPoint = {
      name: "Your Planet",
      au: distance,
      period: period,
      type: "Calculated",
      fill: "hsl(var(--destructive))"
    }

    return [...realPlanets, userPoint].sort((a, b) => a.au - b.au)
  }, [distance, period])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Input Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Orbital Parameters</CardTitle>
            <CardDescription>
              Adjust distance and central mass to see how they affect the orbital period.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Distance from Star (AU)</Label>
                <span className="text-muted-foreground text-sm">{distance.toFixed(2)} AU</span>
              </div>
              <Slider
                value={[distance]}
                min={0.1}
                max={40}
                step={0.1}
                onValueChange={(val) => setDistance(val[0])}
              />
              <p className="text-xs text-muted-foreground">
                1 AU = Distance from Earth to Sun (~150M km)
              </p>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between">
                <Label>Star Mass (Solar Masses)</Label>
                <span className="text-muted-foreground text-sm">{mass.toFixed(2)} M☉</span>
              </div>
              <Slider
                value={[mass]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={(val) => setMass(val[0])}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calculated Results</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">
                {period.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Orbital Period (Years)</div>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">
                {velocity.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Velocity (km/s)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualization Section */}
      <Card className="h-full min-h-[400px]">
        <CardHeader>
          <CardTitle>Kepler&apos;s Relation: Distance vs Period</CardTitle>
          <CardDescription>
            Comparison with real Solar System planets.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                type="number" 
                dataKey="au" 
                name="Distance (AU)" 
                label={{ value: 'Distance (AU)', position: 'insideBottom', offset: -10 }} 
                domain={[0, 'auto']}
              />
              <YAxis 
                type="number" 
                dataKey="period" 
                name="Period (Years)" 
                label={{ value: 'Period (Years)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded p-2 shadow-lg text-sm">
                        <p className="font-bold">{data.name}</p>
                        <p>Distance: {data.au.toFixed(2)} AU</p>
                        <p>Period: {data.period.toFixed(2)} Years</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* Trend line approximation */}
              <Line 
                dataKey="period" 
                stroke="var(--foreground)" 
                dot={false} 
                strokeWidth={1} 
                type="monotone"
                opacity={0.2}
              />

              <Scatter name="Planets" dataKey="period" fill="var(--primary)" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
