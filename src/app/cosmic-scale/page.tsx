'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { AU, C } from '@/utils/constants'; // C is in m/s

// Constants
const KM_PER_AU = 149597870.7;
const SPEED_OF_LIGHT_KM_S = 299792.458;
const SPEED_VOYAGER_1_KM_S = 17.0;       // Approx
const SPEED_JET_KM_H = 900.0;            // Approx 900 km/h
const SPEED_CAR_KM_H = 100.0;            // Approx 100 km/h

// Predefined Distances (in AU)
const DISTANCES = [
  { id: 'earth-moon', name: 'Earth to Moon', value: 0.00257 }, // ~384,400 km
  { id: 'earth-mars', name: 'Earth to Mars (Closest)', value: 0.37 },
  { id: 'earth-sun', name: 'Earth to Sun', value: 1.0 },
  { id: 'earth-jupiter', name: 'Earth to Jupiter (Closest)', value: 4.2 },
  { id: 'earth-pluto', name: 'Earth to Pluto (Avg)', value: 39.5 },
  { id: 'sun-proxima', name: 'Sun to Proxima Centauri', value: 268770 }, // ~4.24 Light Years
];

// Helper to format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
  if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)} days`;
  
  const years = seconds / 31536000;
  if (years > 1000000) return `${(years / 1000000).toFixed(1)} million years`;
  if (years > 1000) return `${Math.round(years).toLocaleString()} years`;
  return `${years.toFixed(1)} years`;
}

export default function CosmicScalePage() {
  const [selectedDistanceId, setSelectedDistanceId] = useState<string>('earth-sun');
  
  const selectedDistance = DISTANCES.find(d => d.id === selectedDistanceId) || DISTANCES[2];
  const distanceKm = selectedDistance.value * KM_PER_AU;

  // Calculate times (seconds)
  const timeLight = distanceKm / SPEED_OF_LIGHT_KM_S;
  const timeVoyager = distanceKm / SPEED_VOYAGER_1_KM_S;
  const timeJet = distanceKm / (SPEED_JET_KM_H / 3600);
  const timeCar = distanceKm / (SPEED_CAR_KM_H / 3600);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-orange-500">
          Cosmic Scale
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Space is big. Really big. This tool helps visualize travel times across vast cosmic distances.
        </p>
      </div>

      <Card className="bg-background/50 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle>Select a Journey</CardTitle>
          <CardDescription>Choose a destination to see how long it takes to get there.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select value={selectedDistanceId} onValueChange={setSelectedDistanceId}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select distance" />
            </SelectTrigger>
            <SelectContent>
              {DISTANCES.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {/* Speed of Light */}
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-yellow-500">Speed of Light</CardTitle>
                <CardDescription className="text-xs">299,792 km/s</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-white">{formatDuration(timeLight)}</p>
              </CardContent>
            </Card>

            {/* Voyager 1 */}
            <Card className="bg-blue-500/10 border-blue-500/20">
               <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-blue-500">Voyager 1</CardTitle>
                <CardDescription className="text-xs">~17 km/s (Fastest probe)</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-white">{formatDuration(timeVoyager)}</p>
              </CardContent>
            </Card>

            {/* Jet Liner */}
            <Card className="bg-purple-500/10 border-purple-500/20">
               <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-purple-500">Jet Airliner</CardTitle>
                <CardDescription className="text-xs">900 km/h</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-white">{formatDuration(timeJet)}</p>
              </CardContent>
            </Card>

            {/* Car */}
            <Card className="bg-green-500/10 border-green-500/20">
               <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-green-500">Car</CardTitle>
                <CardDescription className="text-xs">100 km/h</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-white">{formatDuration(timeCar)}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 p-4 bg-secondary/50 rounded-lg text-center">
             <p className="text-sm text-muted-foreground">
               Distance: <span className="font-mono text-white">{distanceKm.toLocaleString()} km</span> ({selectedDistance.value.toLocaleString()} AU)
             </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
