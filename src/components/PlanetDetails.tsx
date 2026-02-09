'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Planet as PlanetType } from "@/data/planets";

interface PlanetDetailsProps {
  planet: PlanetType | null;
  onClose: () => void;
}

export function PlanetDetails({ planet, onClose }: PlanetDetailsProps) {
  if (!planet) return null;

  return (
    <Card className="absolute bottom-4 right-4 w-72 bg-black/80 backdrop-blur border-white/20 text-white z-20 animate-in slide-in-from-right fade-in duration-300">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
        <CardTitle className="text-xl font-bold" style={{ color: planet.color }}>
          {planet.name}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-muted-foreground">Mass</div>
          <div className="text-right font-mono">
            {planet.mass.toExponential(2)} kg
          </div>
          
          <div className="text-muted-foreground">Radius</div>
          <div className="text-right font-mono">
            {(planet.radius / 1000).toLocaleString()} km
          </div>
          
          <div className="text-muted-foreground">Distance</div>
          <div className="text-right font-mono">
            {(planet.semiMajorAxis / 149597870700).toFixed(2)} AU
          </div>
          
          <div className="text-muted-foreground">Orbital Period</div>
          <div className="text-right font-mono">
            {(planet.orbitalPeriod / (365.25 * 24 * 3600)).toFixed(2)} Years
          </div>

          <div className="text-muted-foreground">Excentricity</div>
          <div className="text-right font-mono">
            {planet.eccentricity}
          </div>
        </div>
        
        <div className="pt-2 border-t border-white/10">
          <p className="text-xs text-muted-foreground italic">
            Click anywhere in space to deselect.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
