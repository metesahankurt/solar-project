'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { OrbitLine } from './OrbitLine';
import { SimulationControls } from './SimulationControls';
import { planets, Planet as PlanetDetailsType } from '@/data/planets';
import { AU } from '@/utils/constants';
import { PlanetDetails } from './PlanetDetails';

// Adjustable scales for visualization
const SCENE_SCALE = 50 / AU; // 1 AU = 50 units in the scene

export default function Scene() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [simulationDate, setSimulationDate] = useState(new Date());
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetDetailsType | null>(null);

  // Simple effect to update date based on speed
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimulationDate((prev) => {
          const next = new Date(prev);
          // 1 real second = speedMultiplier * 100000 simulation seconds approximately in the visual
          // Let's just increment day by speedMultiplier for visual effect
          // This is distinct from physics but gives user feedback
          next.setDate(next.getDate() + (speedMultiplier * 0.1)); 
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  return (
    <div className="w-full h-[80vh] bg-black rounded-xl overflow-hidden border border-white/10 relative group">
      <SimulationControls 
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        speedMultiplier={speedMultiplier}
        onSpeedChange={setSpeedMultiplier}
        simulationDate={simulationDate}
      />
      
      <PlanetDetails 
        planet={selectedPlanet} 
        onClose={() => setSelectedPlanet(null)} 
      />
      
      <Canvas 
        camera={{ position: [0, 40, 60], fov: 45 }}
        onPointerMissed={() => setSelectedPlanet(null)} // Deselect when clicking background
      >
        <ambientLight intensity={0.1} />
        {/* Sun is the main light source */}
        
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        <Sun />

        {planets.map((planet) => {
          // Calculate orbit radius in scene units
          const orbitRadius = planet.semiMajorAxis * SCENE_SCALE;
          
          return (
            <group key={planet.id}>
              <OrbitLine radius={orbitRadius} color={planet.color} />
              <Planet 
                planet={planet} 
                scaleFactor={SCENE_SCALE} 
                speedMultiplier={speedMultiplier}
                isPaused={!isPlaying}
                isSelected={selectedPlanet?.id === planet.id}
                onClick={() => setSelectedPlanet(planet)}
              />
            </group>
          );
        })}
      </Canvas>
      
      <div className="absolute bottom-4 left-4 text-xs text-white/50 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 duration-500">
        <p>Drag to rotate • Scroll to zoom • Right-click to pan</p>
      </div>
    </div>
  );
}
