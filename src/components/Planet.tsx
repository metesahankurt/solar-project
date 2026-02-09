'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';
import { Planet as PlanetType } from '@/data/planets';

interface PlanetProps {
  planet: PlanetType;
  scaleFactor: number; // Scale applied to distance for visualization
  speedMultiplier: number;
  isPaused: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  texture?: string; // Placeholder for texture path
}

export function Planet({ planet, scaleFactor = 1, speedMultiplier = 1, isPaused = false, isSelected = false, onClick }: PlanetProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Initial angle (randomized once)
  const [angle] = useState(() => Math.random() * Math.PI * 2);
  const angleRef = useRef(angle);

  useFrame((state, delta) => {
    if (meshRef.current && !isPaused) {
      // Update orbital angle based on Kepler's period (simplified circular motion)
      // angular velocity omega = 2 * PI / Period
      // speedMultiplier accelerates time
      const omega = (2 * Math.PI) / planet.orbitalPeriod;
      angleRef.current += omega * delta * speedMultiplier * 100000; // Large multiplier to make movement visible in seconds

      // Calculate position
      // We scale down the semiMajorAxis for visualization
      // 1 AU is roughly 150 million km. We need it to fit in scene.
      // Let's assume input scaleFactor handles the conversion from meters to scene units.
      const r = planet.semiMajorAxis * scaleFactor;
      
      meshRef.current.position.x = Math.cos(angleRef.current) * r;
      meshRef.current.position.z = Math.sin(angleRef.current) * r;

      // Rotate planet on its axis
      meshRef.current.rotation.y += delta; 
    }
  });

  // Scale radius for visibility (not to scale with distance)
  // Earth radius ~6371km. Sun radius ~696000km.
  // In scene: Sun = 2.5 units. Earth should be much smaller but visible.
  // Let's simplify: log scale or fixed visual scale relative to Earth = 0.5 units
  const visualRadius = (planet.radius / 6.371e6) * 0.3; 
  // Clamp for visibility: very large planets shouldn't eclipse sun, small ones shouldn't disappear
  const clampedRadius = Math.max(0.2, Math.min(visualRadius, 1.5));

  return (
    <mesh 
      ref={meshRef} 
      onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent clicking through to scene
        onClick?.();
      }}
    >
      <sphereGeometry args={[clampedRadius, 32, 32]} />
      <meshStandardMaterial 
        color={planet.color} 
        emissive={planet.color}
        emissiveIntensity={isSelected || hovered ? 0.5 : 0}
      />
      {(hovered || isSelected) && (
        <Html distanceFactor={15}>
          <div className="bg-black/80 text-white text-xs p-1 rounded border border-white/20 whitespace-nowrap pointer-events-none select-none">
            {planet.name}
          </div>
        </Html>
      )}
    </mesh>
  );
}
