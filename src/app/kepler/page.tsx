'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { G, SOLAR_MASS, AU, YEAR_SECONDS } from '@/utils/constants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';

export default function KeplerPage() {
  const [massRatio, setMassRatio] = useState<number>(1.0); // Ratio to Solar Mass
  const [radiusAU, setRadiusAU] = useState<number>(1.0);   // Radius in AU

  // Calculate Period based on inputs
  const result = useMemo(() => {
    const M = massRatio * SOLAR_MASS;
    const r = radiusAU * AU;
    
    // T = 2 * PI * sqrt(r^3 / (G * M))
    const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / (G * M));
    
    const periodYears = periodSeconds / YEAR_SECONDS;
    const periodDays = periodSeconds / (24 * 3600);
    
    return { periodYears, periodDays };
  }, [massRatio, radiusAU]);

  // Generate data points for chart
  const chartData = useMemo(() => {
    const data = [];
    const maxR = Math.max(5, radiusAU * 1.5); // Dynamic range
    const steps = 50;
    
    for (let i = 1; i <= steps; i++) {
      const r_au = (i / steps) * maxR;
      const r = r_au * AU;
      const M = massRatio * SOLAR_MASS;
      
      const p_seconds = 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / (G * M));
      const p_years = p_seconds / YEAR_SECONDS;
      
      data.push({
        radius: parseFloat(r_au.toFixed(2)),
        period: parseFloat(p_years.toFixed(2)),
      });
    }
    return data;
  }, [massRatio, radiusAU]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Kepler Analysis
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Calculate and visualize orbital periods based on Kepler&apos;s Third Law: <br />
          <span className="font-mono text-yellow-400 bg-white/5 px-2 py-1 rounded mt-2 inline-block">T² ∝ r³</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Input Panel */}
        <Card className="md:col-span-1 bg-background/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
            <CardDescription>Adjust mass and distance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mass">Center Mass (Solar Masses)</Label>
              <Input 
                id="mass" 
                type="number" 
                step="0.1" 
                min="0.1"
                value={massRatio}
                onChange={(e) => setMassRatio(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                1.0 = Mass of our Sun
              </p>
            </div>
            
            <div className="space-y-2">
               <Label htmlFor="radius">Semi-Major Axis (AU)</Label>
               <Input 
                 id="radius" 
                 type="number" 
                 step="0.1" 
                 min="0.01"
                 value={radiusAU}
                 onChange={(e) => setRadiusAU(parseFloat(e.target.value) || 0)}
               />
               <p className="text-xs text-muted-foreground">
                 1.0 = Distance from Earth to Sun
               </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h3 className="font-semibold text-sm mb-2 text-primary">Calculated Period</h3>
              <div className="space-y-1 font-mono text-lg">
                <p>{result.periodYears.toFixed(2)} <span className="text-sm text-muted-foreground">Years</span></p>
                <p className="text-sm text-muted-foreground">
                  ({result.periodDays.toFixed(1)} Days)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Graph Panel */}
        <Card className="md:col-span-2 bg-background/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle>Orbital Period vs. Distance</CardTitle>
            <CardDescription>Relationship graph (T vs r). Dot marks current selection.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="radius" 
                    label={{ value: 'Radius (AU)', position: 'insideBottom', offset: -10, fill: '#888' }} 
                    stroke="#888"
                  />
                  <YAxis 
                    label={{ value: 'Period (Years)', angle: -90, position: 'insideLeft', fill: '#888' }} 
                    stroke="#888"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="period" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceDot 
                    x={radiusAU} 
                    y={result.periodYears} 
                    r={6} 
                    fill="#FDB813" 
                    stroke="none"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-sm text-muted-foreground italic">
              According to Kepler&apos;s Third Law, the square of the orbital period of a planet is directly proportional to the cube of the semi-major axis of its orbit.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
