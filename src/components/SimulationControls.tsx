'use client';

import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface SimulationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speedMultiplier: number;
  onSpeedChange: (value: number) => void;
  simulationDate: Date;
}

export function SimulationControls({
  isPlaying,
  onTogglePlay,
  speedMultiplier,
  onSpeedChange,
  simulationDate,
}: SimulationControlsProps) {
  return (
    <Card className="absolute top-4 right-4 p-4 w-64 bg-black/80 backdrop-blur border-white/20 text-white z-10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Simulation Control</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-white/20 hover:bg-white/10 hover:text-white"
              onClick={onTogglePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <Label>Speed: {speedMultiplier.toFixed(1)}x</Label>
          </div>
          <Slider
            value={[speedMultiplier]}
            min={0}
            max={10}
            step={0.1}
            onValueChange={(vals) => onSpeedChange(vals[0])}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
            <span>0x</span>
            <span>1x</span>
            <span>5x</span>
            <span>10x</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-white/10">
           <p className="text-xs text-muted-foreground mb-1">Date (Approx)</p>
           <p className="text-sm font-mono text-blue-300">
             {simulationDate.toLocaleDateString()}
           </p>
        </div>
      </div>
    </Card>
  );
}
