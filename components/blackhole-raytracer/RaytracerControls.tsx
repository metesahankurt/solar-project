"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export interface RaytracerParams {
  mass: number
  diskTemp: number
  diskDensity: number
  lensingStrength: number
  quality: number
}

interface ControlsProps {
  params: RaytracerParams
  onChange: (updates: Partial<RaytracerParams>) => void
}

export function RaytracerControls({ params, onChange }: ControlsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Black Hole Mass (Rs)</Label>
          <Badge variant="outline">{params.mass.toFixed(2)}</Badge>
        </div>
        <Slider
          min={0.5}
          max={3.0}
          step={0.1}
          value={[params.mass]}
          onValueChange={([val]) => onChange({ mass: val })}
        />
        <p className="text-xs text-muted-foreground">
          Modifies the Schwarzschild radius (event horizon size)
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Disk Temperature</Label>
          <Badge variant="outline">{params.diskTemp.toFixed(1)}</Badge>
        </div>
        <Slider
          min={0.5}
          max={4.0}
          step={0.1}
          value={[params.diskTemp]}
          onValueChange={([val]) => onChange({ diskTemp: val })}
        />
        <p className="text-xs text-muted-foreground">
          Changes accretion disk thermal emission (glow color/energy)
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Disk Density</Label>
          <Badge variant="outline">{params.diskDensity.toFixed(1)}</Badge>
        </div>
        <Slider
          min={0.0}
          max={5.0}
          step={0.1}
          value={[params.diskDensity]}
          onValueChange={([val]) => onChange({ diskDensity: val })}
        />
        <p className="text-xs text-muted-foreground">
          Controls the optical thickness of the plasma disk
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Lensing Strength</Label>
          <Badge variant="outline">{params.lensingStrength.toFixed(2)}</Badge>
        </div>
        <Slider
          min={0.0}
          max={2.0}
          step={0.05}
          value={[params.lensingStrength]}
          onValueChange={([val]) => onChange({ lensingStrength: val })}
        />
        <p className="text-xs text-muted-foreground">
          Strength of spacetime curvature (photon deflection)
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <Label>Render Quality</Label>
          <Badge variant={params.quality < 3 ? "secondary" : "default"}>
            {params.quality === 1 ? "Low" : params.quality === 2 ? "Medium" : params.quality === 3 ? "High" : "Ultra"}
          </Badge>
        </div>
        <Slider
          min={1}
          max={4}
          step={1}
          value={[params.quality]}
          onValueChange={([val]) => onChange({ quality: val })}
        />
        <p className="text-xs text-muted-foreground">
          Number of raymarching steps (Lower = better frame rate)
        </p>
      </div>
    </div>
  )
}
