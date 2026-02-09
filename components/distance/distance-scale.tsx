"use client"

import React from "react"
import { Lightbulb, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DistancePoint {
  name: string
  distance: string
  lightTime: string
  category: "solar-system" | "stellar" | "galactic"
}

const DISTANCE_SCALE: DistancePoint[] = [
  { name: "Moon", distance: "384,400 km", lightTime: "1.3 seconds", category: "solar-system" },
  { name: "Sun", distance: "1 AU (150M km)", lightTime: "8.3 minutes", category: "solar-system" },
  { name: "Mars (closest)", distance: "0.5 AU", lightTime: "4.2 minutes", category: "solar-system" },
  { name: "Jupiter", distance: "5.2 AU", lightTime: "43 minutes", category: "solar-system" },
  { name: "Neptune", distance: "30 AU", lightTime: "4.2 hours", category: "solar-system" },
  { name: "Voyager 1", distance: "~160 AU", lightTime: "22 hours", category: "solar-system" },
  { name: "Proxima Centauri", distance: "4.24 light years", lightTime: "4.24 years", category: "stellar" },
  { name: "Sirius", distance: "8.6 light years", lightTime: "8.6 years", category: "stellar" },
  { name: "Vega", distance: "25 light years", lightTime: "25 years", category: "stellar" },
  { name: "Center of Milky Way", distance: "~27,000 light years", lightTime: "27,000 years", category: "galactic" },
  { name: "Andromeda Galaxy", distance: "2.5M light years", lightTime: "2.5 million years", category: "galactic" },
]

const categoryColors = {
  "solar-system": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "stellar": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "galactic": "bg-amber-500/10 text-amber-500 border-amber-500/20",
}

const categoryLabels = {
  "solar-system": "Solar System",
  "stellar": "Nearby Stars",
  "galactic": "Beyond",
}

export function DistanceScale() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Cosmic Distance Scale</CardTitle>
        <CardDescription>
          How long does light take to reach these destinations?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {DISTANCE_SCALE.map((point, index) => (
            <div 
              key={point.name}
              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{point.name}</div>
                <div className="text-xs text-muted-foreground">{point.distance}</div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <Badge variant="outline" className={categoryColors[point.category]}>
                  {categoryLabels[point.category]}
                </Badge>
                <div className="text-right min-w-[100px]">
                  <div className="text-sm font-medium">{point.lightTime}</div>
                  <div className="text-xs text-muted-foreground">light travel</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
          <p className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <span><strong>Fun Fact:</strong> When you look at the Sun, you&apos;re seeing it as it was 8 minutes ago!</span>
          </p>
          <p className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <span>Light from Andromeda Galaxy started its journey before humans even existed.</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
