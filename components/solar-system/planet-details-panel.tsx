"use client"

import React from "react"
import { ChevronDown, ChevronUp, Info, Radio } from "lucide-react"
import { useSimulation } from "./simulation-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AU_METERS } from "@/lib/astronomy"

function formatNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString(undefined, { maximumFractionDigits })
}

function formatScientific(value: number) {
  return value.toExponential(3)
}

export function PlanetDetailsPanel() {
  const { selectedPlanet, liveMetrics } = useSimulation()
  const isMobile = useIsMobile()
  const distanceKm = selectedPlanet.semiMajorAxis / 1000
  const distanceAu = selectedPlanet.semiMajorAxis / AU_METERS
  const orbitalDays = selectedPlanet.orbitalPeriod / (24 * 60 * 60)
  const orbitalYears = orbitalDays / 365.25
  const [isOpen, setIsOpen] = React.useState(true)
  const metrics = liveMetrics[selectedPlanet.name]
  const angleDeg = metrics ? (metrics.angle * 180) / Math.PI : null
  const progress = metrics ? metrics.orbitalProgress * 100 : null

  const content = (
    <Card className="border-0 bg-transparent shadow-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Planet Details</CardTitle>
              <CardDescription>Snapshot of physical and orbital parameters.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Selected</Badge>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  {isOpen ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 text-sm">
            <div>
              <div className="text-lg font-semibold">{selectedPlanet.name}</div>
              <p className="text-muted-foreground">{selectedPlanet.description}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Radio className="size-3 text-emerald-500" />
                Real-time metrics
              </div>
              {metrics ? (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Orbital angle</span>
                    <span>{angleDeg?.toFixed(1)}°</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Orbit progress</span>
                    <span>{progress?.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Position (AU)</span>
                    <span>
                      x {formatNumber(metrics.xAu, 3)}, z {formatNumber(metrics.zAu, 3)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Waiting for live data...</div>
              )}
            </div>
            <Separator />
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mass</span>
                <span>{formatScientific(selectedPlanet.mass)} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Radius</span>
                <span>{formatNumber(selectedPlanet.radius)} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Semi-major axis</span>
                <span>{formatNumber(distanceKm)} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Distance (AU)</span>
                <span>{formatNumber(distanceAu, 3)} AU</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Orbital period</span>
                <span>{formatNumber(orbitalDays, 1)} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Orbital period</span>
                <span>{formatNumber(orbitalYears, 2)} years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Eccentricity</span>
                <span>{selectedPlanet.eccentricity}</span>
              </div>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              Sources: NASA Planetary Fact Sheet, IAU constants.
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="absolute bottom-4 right-4 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-2">
              <Info className="size-4" />
              Details
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Planet Details</SheetTitle>
              <SheetDescription>Selected planet parameters.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-full">
              <div className="p-4">{content}</div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="absolute right-4 top-20 z-20 w-80 max-w-[calc(100vw-2rem)]">
      <div className="rounded-xl border bg-background/90 shadow-sm backdrop-blur">
        {content}
      </div>
    </div>
  )
}
